import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { err, ok, type Result } from "neverthrow";

import { createGenericError, type GenericError } from "../errors/genericError.js";

export type KeycloakTokenPayload = JWTPayload & {
  email?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
};

export enum KeycloakJwtErrorType {
  InvalidToken = "InvalidKeycloakToken",
  KeyFetch = "KeycloakKeyFetchError",
  Verification = "KeycloakVerificationError",
  ExpiredToken = "ExpiredKeycloakToken",
}

export enum KeycloakJwtErrorMessage {
  InvalidToken = "Invalid Keycloak JWT token",
  KeyFetch = "Failed to fetch Keycloak public key",
  Verification = "Failed to verify Keycloak JWT token",
  ExpiredToken = "Keycloak JWT token has expired",
}

export type KeycloakJwtError = GenericError<KeycloakJwtErrorType, KeycloakJwtErrorMessage>;

export type KeycloakTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token?: string;
  "not-before-policy": number;
  session_state?: string;
  scope: string;
};

export type KeycloakClientCredentialsOptions = {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
};

export type KeycloakPasswordOptions = {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
  username: string;
  password: string;
  scope?: string;
};

export type KeycloakRefreshOptions = {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
  refreshToken: string;
};

const isKeycloakTokenPayload = (payload: unknown): payload is KeycloakTokenPayload => {
  return (
    payload !== null &&
    typeof payload === "object" &&
    "sub" in payload &&
    "iss" in payload &&
    "aud" in payload &&
    "exp" in payload &&
    "iat" in payload &&
    typeof (payload as any).sub === "string" &&
    typeof (payload as any).iss === "string" &&
    typeof (payload as any).exp === "number" &&
    typeof (payload as any).iat === "number"
  );
};

type KeycloakJwtVerifierOptions = {
  keycloakUrl: string;
  realm: string;
  audience?: string;
};

const createJWKS = (keycloakUrl: string, realm: string) => {
  const jwksUri = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`;
  return createRemoteJWKSet(new URL(jwksUri));
};

export const verifyKeycloakToken = async (
  token: string,
  options: KeycloakJwtVerifierOptions,
): Promise<Result<KeycloakTokenPayload, KeycloakJwtError>> => {
  try {
    const JWKS = createJWKS(options.keycloakUrl, options.realm);
    const expectedIssuer = `${options.keycloakUrl}/realms/${options.realm}`;

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: expectedIssuer,
      audience: options.audience,
    });

    if (!isKeycloakTokenPayload(payload)) {
      return err(
        createGenericError({
          type: KeycloakJwtErrorType.InvalidToken,
          message: KeycloakJwtErrorMessage.InvalidToken,
          error: new Error("Invalid token payload structure"),
        }),
      );
    }

    return ok(payload);
  } catch (error: any) {
    // Handle specific jose errors
    if (error?.code === "ERR_JWT_EXPIRED") {
      return err(
        createGenericError({
          type: KeycloakJwtErrorType.ExpiredToken,
          message: KeycloakJwtErrorMessage.ExpiredToken,
          error,
        }),
      );
    }

    if (error?.code?.startsWith("ERR_JWK") || error?.code?.startsWith("ERR_JWKS")) {
      return err(
        createGenericError({
          type: KeycloakJwtErrorType.KeyFetch,
          message: KeycloakJwtErrorMessage.KeyFetch,
          error,
        }),
      );
    }

    return err(
      createGenericError({
        type: KeycloakJwtErrorType.Verification,
        message: KeycloakJwtErrorMessage.Verification,
        error,
      }),
    );
  }
};

// Helper function to extract token from Authorization header
export const extractBearerToken = (authHeader?: string): Result<string, KeycloakJwtError> => {
  if (!authHeader) {
    return err(
      createGenericError({
        type: KeycloakJwtErrorType.InvalidToken,
        message: KeycloakJwtErrorMessage.InvalidToken,
        error: new Error("Authorization header missing"),
      }),
    );
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return err(
      createGenericError({
        type: KeycloakJwtErrorType.InvalidToken,
        message: KeycloakJwtErrorMessage.InvalidToken,
        error: new Error("Invalid Authorization header format"),
      }),
    );
  }

  return ok(parts[1]);
};

import { err, ok, type Result } from "neverthrow";

import { type KeycloakClientCredentialsOptions, type KeycloakTokenResponse } from "./jwt.js";

export enum ServiceAuthErrorType {
  TokenFetch = "ServiceTokenFetchError",
  InvalidCredentials = "InvalidServiceCredentials",
}

export enum ServiceAuthErrorMessage {
  TokenFetch = "Failed to fetch service token",
  InvalidCredentials = "Invalid service credentials",
}

export type ServiceAuthError = {
  type: ServiceAuthErrorType;
  message: ServiceAuthErrorMessage;
  error?: Error;
};

export const getServiceToken = async (
  options: KeycloakClientCredentialsOptions,
): Promise<Result<KeycloakTokenResponse, ServiceAuthError>> => {
  try {
    const tokenEndpoint = `${options.keycloakUrl}/realms/${options.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: options.clientId,
      client_secret: options.clientSecret,
    });

    if (options.scope) {
      params.append("scope", options.scope);
    }

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return err({
          type: ServiceAuthErrorType.InvalidCredentials,
          message: ServiceAuthErrorMessage.InvalidCredentials,
          error: new Error(`Invalid service credentials: ${await response.text()}`),
        });
      }

      return err({
        type: ServiceAuthErrorType.TokenFetch,
        message: ServiceAuthErrorMessage.TokenFetch,
        error: new Error(`Failed to fetch token: ${await response.text()}`),
      });
    }

    const tokenData = (await response.json()) as KeycloakTokenResponse;
    return ok(tokenData);
  } catch (error) {
    return err({
      type: ServiceAuthErrorType.TokenFetch,
      message: ServiceAuthErrorMessage.TokenFetch,
      error: error instanceof Error ? error : new Error("Unknown error occurred"),
    });
  }
};

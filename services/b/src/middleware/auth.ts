import {
  KeycloakJwtErrorType,
  extractBearerToken,
  verifyKeycloakToken,
  type KeycloakTokenPayload,
} from "@workspace/common";

import { type FastifyReply, type FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";

import { config } from "../common/config.js";
import { logger } from "../common/logger.js";

const log = logger.child({
  module: "auth.middleware",
});

// Extend FastifyRequest to include user payload
declare module "fastify" {
  interface FastifyRequest {
    user?: KeycloakTokenPayload;
  }
}

// Functional approach to JWT verification middleware
export const verifyJwtToken = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    log.debug("Verifying JWT token");

    // Extract token from Authorization header
    const tokenResult = extractBearerToken(request.headers.authorization);

    if (tokenResult.isErr()) {
      log.warn("Missing or invalid Authorization header");
      return reply.status(StatusCodes.UNAUTHORIZED).send({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header",
      });
    }

    const token = tokenResult.value;

    // Verify token with Keycloak
    const verificationResult = await verifyKeycloakToken(token, {
      keycloakUrl: config.keycloakUrl,
      realm: config.keycloakRealm,
    });

    if (verificationResult.isErr()) {
      const error = verificationResult.error;
      log.warn({ error: error.message }, "JWT token verification failed");

      switch (error.type) {
        case KeycloakJwtErrorType.InvalidToken:
        case KeycloakJwtErrorType.Verification:
        case KeycloakJwtErrorType.ExpiredToken:
          return reply.status(StatusCodes.UNAUTHORIZED).send({
            error: error.type,
            message: error.message,
          });
        case KeycloakJwtErrorType.KeyFetch:
          return reply.status(StatusCodes.SERVICE_UNAVAILABLE).send({
            error: error.type,
            message: error.message,
          });
      }
    }

    const payload = verificationResult.value;

    // Attach user payload to request
    request.user = payload;

    log.debug({ userId: payload.sub }, "JWT token verified successfully");
  } catch (error) {
    log.error({ error }, "Unexpected error during JWT verification");
    return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "Internal Server Error",
      message: "An unexpected error occurred during authentication",
    });
  }
};

// Helper function to check if user has required role
export const requireRole = (role: string, clientId?: string) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      log.warn("User not authenticated for role check");
      return reply.status(StatusCodes.UNAUTHORIZED).send({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const hasRequiredRole = checkUserRole(request.user, role, clientId);

    if (!hasRequiredRole) {
      log.warn({ userId: request.user.sub, role, clientId }, "User lacks required role");
      return reply.status(StatusCodes.FORBIDDEN).send({
        error: "Forbidden",
        message: `Required role '${role}' not found`,
      });
    }

    log.debug({ userId: request.user.sub, role }, "Role check passed");
  };
};

// Helper function to check if user has any of the required roles
export const requireAnyRole = (roles: string[], clientId?: string) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      log.warn("User not authenticated for role check");
      return reply.status(StatusCodes.UNAUTHORIZED).send({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const hasAnyRequiredRole = roles.some(role => checkUserRole(request.user!, role, clientId));

    if (!hasAnyRequiredRole) {
      log.warn({ userId: request.user.sub, roles, clientId }, "User lacks any required role");
      return reply.status(StatusCodes.FORBIDDEN).send({
        error: "Forbidden",
        message: `One of the following roles required: ${roles.join(", ")}`,
      });
    }

    log.debug({ userId: request.user.sub, roles }, "Role check passed");
  };
};

// Pure function to check user roles
const checkUserRole = (payload: KeycloakTokenPayload, role: string, clientId?: string): boolean => {
  // Check realm roles
  if (payload.realm_access?.roles.includes(role)) {
    return true;
  }

  // Check client-specific roles if clientId is provided
  if (clientId && payload.resource_access?.[clientId]?.roles.includes(role)) {
    return true;
  }

  return false;
};

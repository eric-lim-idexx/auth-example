import { isLogLevel, type LogLevel } from "@workspace/common";

const {
  NODE_ENV = "development",
  LOG_LEVEL = "debug",
  PORT = "8002",
  KEYCLOAK_URL = "http://localhost:8080",
  KEYCLOAK_REALM = "auth_example",
} = process.env;

type Config = {
  nodeEnv: string;
  logLevel: LogLevel;
  port: number;
  keycloakUrl: string;
  keycloakRealm: string;
};

const loadConfig = (): Config => {
  if (!isLogLevel(LOG_LEVEL)) {
    throw new Error("Unknown log level");
  }

  return {
    nodeEnv: NODE_ENV,
    logLevel: LOG_LEVEL,
    port: parseInt(PORT, 10),
    keycloakUrl: KEYCLOAK_URL,
    keycloakRealm: KEYCLOAK_REALM,
  };
};

export const config = loadConfig();

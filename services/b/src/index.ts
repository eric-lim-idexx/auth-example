import cors from "@fastify/cors";
import fastify, { type FastifyInstance } from "fastify";

import { config } from "./common/config.js";
import { logger } from "./common/logger.js";
import { dataRoutes } from "./routes/data.route.js";

const { port } = config;

const startServer = async (): Promise<void> => {
  const server: FastifyInstance = fastify({ logger: false });

  await server.register(cors, {
    origin: true,
  });

  server.get("/health", async () => {
    logger.debug("Health check route");
    return { ok: true };
  });

  server.register(
    async v1 => {
      v1.register(dataRoutes, { prefix: "/data" });
    },
    { prefix: "/v1" },
  );

  try {
    await server.listen({ port, host: "0.0.0.0" });
    logger.info(`Service B is running on port ${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

const runServer = async (): Promise<void> => {
  try {
    await startServer();
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
};

runServer();

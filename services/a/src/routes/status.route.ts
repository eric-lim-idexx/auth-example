import { type FastifyPluginCallback } from "fastify";

import {
  getAggregatedData,
  type GetAggregatedDataRequest,
} from "../controllers/status.controller.js";
import { verifyJwtToken } from "../middleware/auth.js";

export const statusRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.get<GetAggregatedDataRequest>(
    "/aggregated",
    { preHandler: verifyJwtToken },
    getAggregatedData,
  );
  done();
};

import { type FastifyPluginCallback } from "fastify";

import { getData, type GetDataRequest } from "../controllers/data.controller.js";
import { verifyJwtToken } from "../middleware/auth.js";

export const dataRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.get<GetDataRequest>("/", { preHandler: verifyJwtToken }, getData);
  done();
};

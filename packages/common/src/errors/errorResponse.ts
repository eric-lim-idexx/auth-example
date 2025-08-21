import { type FastifyReply } from "fastify";
import { getReasonPhrase, type StatusCodes } from "http-status-codes";

export const sendErrorResponse = (
  reply: FastifyReply,
  statusCode: StatusCodes,
  message: string,
): FastifyReply =>
  reply.status(statusCode).send({
    statusCode,
    error: getReasonPhrase(statusCode),
    message,
  });

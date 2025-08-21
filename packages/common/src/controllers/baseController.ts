import { type MultipartFile } from "@fastify/multipart";
import { type FastifyReply, type FastifyRequest, type RequestGenericInterface } from "fastify";

type Request<TParams = unknown, TQuery = unknown, TBody = unknown> = FastifyRequest<{
  Params: TParams;
  Querystring: TQuery;
  Body: TBody;
}>;

type FileRequest<TParams = unknown, TQuery = unknown> = FastifyRequest<{
  Params: TParams;
  Querystring: TQuery;
}> & {
  file: () => Promise<MultipartFile | undefined>;
};

export type NoParams = Record<string, never>;
export type NoBody = Record<string, never>;
export type NoQuery = Record<string, never>;

export type CreateRequest<TBody, TParams = NoParams, TQuery = NoQuery> = Request<
  TParams,
  TQuery,
  TBody
>;
export type GetRequest<TParams = NoParams, TQuery = NoQuery> = Request<TParams, TQuery, NoBody>;
export type UpdateRequest<TBody = NoBody, TParams = NoParams> = Request<TParams, NoQuery, TBody>;
export type DeleteRequest<TParams = NoParams> = Request<TParams, NoQuery, NoBody>;

export type UploadRequest<TParams = NoParams, TQuery = NoQuery> = FileRequest<TParams, TQuery>;

export type Controller<TRequest extends RequestGenericInterface, TResponse> = (
  request: FastifyRequest<TRequest>,
  reply: FastifyReply,
) => Promise<TResponse>;

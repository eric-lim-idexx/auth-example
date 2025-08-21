import { type TSchema } from "@sinclair/typebox";
import { type RouteShorthandOptions } from "fastify";

export type CreateSchemaOptions = {
  body?: TSchema;
  params?: TSchema;
  querystring?: TSchema;
  response?: TSchema;
};

export const createSchema = ({
  body,
  params,
  querystring,
  response,
}: CreateSchemaOptions): RouteShorthandOptions["schema"] => ({
  ...(body && { body }),
  ...(params && { params }),
  ...(querystring && { querystring }),
  ...(response && { response }),
});

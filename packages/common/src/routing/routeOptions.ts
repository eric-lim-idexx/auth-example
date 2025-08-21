import { type RouteShorthandOptions } from "fastify";

export type Route = string;
export type RouteOptions = Record<Route, RouteShorthandOptions>;

export const buildRouteOptions = (opts: RouteOptions): RouteOptions => opts;

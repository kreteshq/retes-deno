// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import * as http from "https://deno.land/std/http/server.ts";

export interface Params {
  [name: string]: string | number;
}

export interface Request<U = unknown> {
  params: Params;
  headers?: {
    [name: string]: string;
  };
  files?: {
    [name: string]: {
      name: string;
      length: number;
      data: unknown;
      encoding: string;
      mimetype: string;
    };
  };
  cookies?: Record<string, string>;
  user?: U;
  url: string;
  method: string;
  format: string;
  body: Uint8Array;
}

export type ResponseBody = string | Record<string, unknown>;
export type Resource = ResponseBody | undefined;

export interface Response {
  body: ResponseBody;
  statusCode: number;
  headers?: Record<string, string>;
  type?: string;
  encoding?: string;
}

export type Handler = (request: Request) => Response | Promise<Response>;
export type Pipeline = [...Middleware[], Handler];

export interface Meta {
  summary?: string;
  description?: string;
  parameters?: Array<unknown>;
  responses?: unknown;
}

export type Middleware = (handler: Handler) => Handler;

// export interface RoutePath {
//   [name: HTTPMethod]: any
// }

export interface RoutePaths {
  [name: string]: unknown;
}

export interface RouteOptions {
  middleware?: Middleware[];
  meta?: Meta;
}

interface RouteParams {
  GET?: Handler;
  POST?: Handler;
  PUT?: Handler;
  PATCH?: Handler;
  DELETE?: Handler;
  middleware?: Middleware[];
  meta?: Meta;
}

export type Route = [string, RouteParams, Route?];

export type Routes = Route[];

export interface Context {
  request: http.ServerRequest;
  response: http.Response;
  params: Params;
  headers?: Params;
  cookies?: unknown;
  format?: string;
  files?: unknown;
}

export interface HandlerParams {
  handler: Handler;
  names: string[];
}

export interface HandlerParamsMap {
  [method: string]: HandlerParams;
}

export interface KeyValue {
  name: string;
  value: string;
}

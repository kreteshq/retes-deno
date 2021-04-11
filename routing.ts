// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

// import Busboy from 'busboy';

// import {
//   isObject,
//   parseCookies,
//   parseAcceptHeader,
//   toBuffer,
// } from './util';

import { Router } from "./router.ts";
import {
  Handler,
  KeyValue,
  Meta,
  Middleware,
  Params,
  Pipeline,
  Request,
  Route,
  RouteOptions,
} from "./types.ts";

export const HTTPMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATH: "PATCH",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  DELETE: "DELETE",
} as const;
export type HTTPMethod = (typeof HTTPMethod)[keyof typeof HTTPMethod];

function isPipeline(handler: Handler | Pipeline): handler is Pipeline {
  return Array.isArray(handler);
}

function makeRoute(
  name: HTTPMethod,
  path: string,
  handler: Handler | Pipeline,
  middleware: Middleware[],
  meta: Meta,
): Route {
  if (isPipeline(handler)) {
    const h = handler.pop() as Handler;
    return [path, {
      [name]: h,
      middleware: [...middleware, ...handler as Middleware[]],
      meta,
    }];
  } else {
    return [path, { [name]: handler, middleware, meta }];
  }
}

export function GET(
  path: string,
  handler: Handler | Pipeline,
  { middleware = [], meta = {} }: RouteOptions = {},
): Route {
  return makeRoute("GET", path, handler, middleware, meta);
}
export function POST(
  path: string,
  handler: Handler | Pipeline,
  { middleware = [], meta = {} }: RouteOptions = {},
): Route {
  return makeRoute("POST", path, handler, middleware, meta);
}
export function PATCH(
  path: string,
  handler: Handler | Pipeline,
  { middleware = [], meta = {} }: RouteOptions = {},
): Route {
  return makeRoute("PATCH", path, handler, middleware, meta);
}
export function PUT(
  path: string,
  handler: Handler | Pipeline,
  { middleware = [], meta = {} }: RouteOptions = {},
): Route {
  return makeRoute("PUT", path, handler, middleware, meta);
}
export function DELETE(
  path: string,
  handler: Handler | Pipeline,
  { middleware = [], meta = {} }: RouteOptions = {},
): Route {
  return makeRoute("DELETE", path, handler, middleware, meta);
}

export const Routing = (router: Router): Middleware => {
  return (next: Handler) =>
    (request: Request) => {
      const method = request.method;
      const { pathname, search } = new URL(request.url ?? ""); // TODO Test perf vs RegEx
      const query: Record<string, string> = {};
      for (const [key, value] of new URLSearchParams(search)) {
        query[key] = value;
      }

      const [handler, dynamicRoutes]: [
        Handler | undefined,
        (string | KeyValue)[],
      ] = router.find(method, pathname);

      const params = {} as Params;

      for (const r of dynamicRoutes as KeyValue[]) {
        params[r.name] = r.value;
      }

      if (handler !== undefined) {
        request.params = { ...query, ...params };
        handleRequest(request);
        request.params = { ...request.params };
        return handler(request);
      } else {
        return next(request);
      }
    };
};

export function isObject(_: unknown) {
  return !!_ && typeof _ === "object";
}
const handleRequest = (request: Request) => {
  const { headers = {}, params, body } = request;

  // context.headers = headers;
  // context.cookies = parseCookies(headers.cookie);
  // context.format = format ? format : parseAcceptHeader(headers);

  if (body.length > 0) {
    const contentType = headers["content-type"]?.split(";")[0];

    switch (contentType) {
      case "application/x-www-form-urlencoded": {
        const decodedBody = new TextDecoder().decode(body);
        const query: Record<string, string> = {};
        for (const [key, value] of new URLSearchParams(decodedBody)) {
          query[key] = value;
        }
        Object.assign(params, query);
        break;
      }
      case "application/json": {
        const decodedBody = new TextDecoder().decode(body);
        const result = JSON.parse(decodedBody);
        if (isObject(result)) {
          Object.assign(params, result);
        }
        break;
      }
      // case 'multipart/form-data': {
      //   context.files = {};

      //   const busboy = new Busboy({ headers });

      //   busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      //     file.on('data', data => {
      //       context.files = {
      //         ...context.files,
      //         [fieldname]: {
      //           name: filename,
      //           length: data.length,
      //           data,
      //           encoding,
      //           mimetype,
      //         }
      //       };
      //     });
      //     file.on('end', () => {});
      //   });
      //   busboy.on('field', (fieldname, val) => {
      //     context.params = { ...context.params, [fieldname]: val };
      //   });
      //   busboy.end(buffer);

      //   await new Promise(resolve => busboy.on('finish', resolve));

      //   break;
      // }
      default:
    }
  }
};

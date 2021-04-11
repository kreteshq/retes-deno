// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
import { listenAndServe, readAll, Server } from "./deps.ts";
import type { Response as ServerResponse, ServerRequest } from "./deps.ts";

import { Router } from "./router.ts";
import { NotFound } from "./response.ts";
import { HTTPMethod, Routing } from "./routing.ts";

import {
  Handler,
  Meta,
  Middleware,
  Pipeline,
  Request,
  Response,
  Routes,
} from "./types.ts";

const compose = <T extends CallableFunction, U>(...functions: T[]) =>
  (args: U) => functions.reduceRight((arg, fn) => fn(arg), args);

const DefaultHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handle = (response: Response) => {
  if (null === response || undefined === response) {
    throw new Error("No return statement in the handler");
  }

  // FIXME add Stream support
  if (typeof response === "string") {
    return {
      body: response,
      status: 200,
      headers: new Headers({
        "Content-Type": "text/plain",
      }),
    } as ServerResponse;
  } else {
    let { body, statusCode: status, headers = {}, type, encoding } = response;

    headers = { ...headers, ...DefaultHeaders };

    if (body instanceof Function) {
      throw new Error("You need to return a value not a function.");
    }

    if (typeof body === "object" || typeof body === "number") {
      body = JSON.stringify(body);
      headers = { ...headers, "Content-Type": "application/json" };
    } else {
      headers = { ...headers, "Content-Type": type || "text/plain" };
    }

    if (encoding) {
      headers = { ...headers, "Content-Encoding": encoding };
    }

    return { body, status, headers: new Headers(headers) } as ServerResponse;
  }
};

export class ServerApp {
  server: Server | undefined;
  router: Router;
  middlewares: Array<Middleware>;
  routes: Routes;
  routePaths: Record<string, Record<string, Meta>>;
  stop: () => Promise<void>;
  // handleError: (context: Context) => (error: Error) => void;
  // append: (context: Context) => () => void;

  constructor(
    routes: Routes,
    // handleError = ({ response }) => error => {
    //   response.statusCode = 500;
    // },
    // append = context => () => {}
  ) {
    this.middlewares = [];
    this.router = new Router();
    this.routes = routes;
    this.routePaths = {};
    this.stop = () => Promise.reject(`You should start the server first`);
    // this.handleError = handleError;
    // this.append = append;

    // TODO move it to `start` once it's abstracted
    for (const [path, params] of this.routes) {
      const { middleware = [], meta = {} } = params;
      const { summary = path } = meta;

      for (const [method, handler] of Object.entries(params)) {
        if (method in HTTPMethod) {
          this.routePaths[path] = {};
          this.routePaths[path][method.toLowerCase()] = {
            ...meta,
            summary,
          };

          const flow: Pipeline = [...middleware, handler as Handler];
          this.add(method as HTTPMethod, path, ...flow);
        }
        // else: a key name undefined in the spec -> discarding
      }
    }
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  add(method: HTTPMethod, path: string, ...fns: [...Middleware[], Handler]) {
    const action = fns.pop() as Handler;

    // pipeline is a handler composed over middlewares,
    // `action` function must be explicitly extracted from the pipeline
    // as it has different signature, thus cannot be composed
    const pipeline = fns.length === 0
      ? action
      : compose<Middleware, Handler>(...fns as Middleware[])(action);

    this.router.add(method.toUpperCase(), path, pipeline);

    return this;
  }

  setup() {
    this.use(Routing(this.router));
  }

  async start(port = 0) {
    await this.setup();

    // FIXME return the actual port
    // it requires a change in the Deno API
    await listenAndServe({ port }, async (req: ServerRequest) => {
      const { url, method } = req;

      const pipeline = compose<Middleware, Handler>(...this.middlewares)((_) =>
        NotFound()
      );

      const headers: Record<string, string> = {};
      for (const [key, value] of req.headers.entries()) {
        headers[key] = value;
      }

      const body: Uint8Array = await readAll(req.body);
      const context = {
        params: {},
        headers,
        url: `http://127.0.0.1${url}`,
        method,
        body,
      } as Request;
      const result = await pipeline(context);

      req.respond(handle(result));
    });
  }
}

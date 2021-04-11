# Retes

<h3>Declarative, Data-Driven Routing for Deno</h3>

Retes is a minimalistic routing library for Deno inspired by Clojure's
[Ring](https://github.com/ring-clojure/ring),
[Compojure](https://github.com/weavejester/compojure) and
[Retit](https://github.com/metosin/reitit). It is built directly on top of
Deno's `http` module. You can use it as an alternative to Express or Koa.

## Features

- **Data-Driven:** In Retes you define routes using the existing data
  structures, i.e. less abstractions and easier to transform and combine routes.
  Routing becomes declarative.
- **Simple Abstractions**: Routing handlers are functions that take a request as
  input and return a response as output, i.e.
  `type Handler = Request => Response`. Middleware functions take a handler as
  input and return a handler as output, i.e.
  `type Middleware = Handler => Handler`. And that's it! No `Context`, no `Next` et al.
- **Battery-Included (wip):** Most common middlewares will be included out of
  the box

* HTTP responses are just objects containing at least `statusCode` and `body`
  keys
* middlewares can be combined on per-route basis
* built-in parsing of query params, body and route's dynamic segments
* fast route matching (see [Benchmarks](#benchmarks))
* built-in file uploading handling mechansim (wip)

## Why Retes?

- declarative route descriptions make them easily composable
- functional handlers are more natural fit for the HTTP flow
- common request/response transformations are already built-in
- typed routes make it easier to discover and control the shape of data flowing
  in and out

## Usage

### A `Hello, World` App

```ts
import { ServerApp } from "https://deno.land/x/retes/mod.ts";
import { GET } from "https://deno.land/x/retes/routing.ts";
import { Plain } from "https://deno.land/x/retes/response.ts";

// routes are just an array, thus the order matters
const routes = [
  GET("/", (_) => Plain("Hello, World")),
];

const app = new ServerApp(routes);
await app.start(5544);
```

### A More Complex App

```ts
import { ServerApp } from "https://deno.land/x/retes/mod.ts";
import { GET } from "https://deno.land/x/retes/routing.ts";
import { Plain } from "https://deno.land/x/retes/response.ts";

const routes = [
  GET("/", (_) => Plain("Hello, World")),
];

const app = new ServerApp(routes);

app.use((handler) => {
  // you can do some middleware initialization here
  return async (request) => {
    const response = await handler(request);
    const dTime = response.headers["X-Response-Time"];

    console.log(`${request.method} ${request.url} - ${dTime}`);

    return response;
  };
});

app.use((handler) =>
  async (request) => {
    const start = Date.now();
    const response = await handler(request);
    const ms = Date.now() - start;

    response.headers["X-Response-Time"] = `${ms}ms`;

    return response;
  }
);

await app.start(5544);
```

This example is adapted from Oak so it's easier to compare and contrast.

## Features

### Params

Retes combines requests' query params, body params and segment params into
`params`.

```ts
import { ServerApp } from "https://deno.land/x/retes/mod.ts";
import { GET, POST } from "https://deno.land/x/retes/routing.ts";
import { OK } from "https://deno.land/x/retes/response.ts";

const routes = [
  GET("/query-params", ({ params }) => OK(params)),
  POST("/body-form", ({ params }) => OK(params)),
  POST("/body-json", () => OK(params)),
  GET("/segment/:a/:b", ({ params }) => OK(params)),
];

const app = new ServerApp(routes);
await app.start(3000);
```

This `GET` query

```
http :3000/query-params?a=1&b=2
```

returns

```http
HTTP/1.1 200 OK

{
    "a": "1",
    "b": "2"
}
```

This `POST` query with `Content-Type` set to
`application/x-www-form-urlencoded; charset=utf-8`

```
http --form :3000/body-form a:=1 b:=2
```

returns

```http
HTTP/1.1 200 OK

{
    "a": "1",
    "b": "2"
}
```

This `POST` query with `Content-Type` set to `application/json`

```
http :3000/body-json a:=1 b:=2
```

returns

```http
HTTP/1.1 200 OK

{
    "a": 1,
    "b": 2
}
```

This `GET` request

```
http :3000/segment/1/2
```

returns

```http
HTTP/1.1 200 OK
{
    "a": "1",
    "b": "2"
}
```

### Convenience Wrappers for HTTP Responses

```ts
import { ServerApp } from "https://deno.land/x/retes/mod.ts";
import { GET } from "https://deno.land/x/retes/routing.ts";
import {
  Accepted,
  Created,
  InternalServerError,
  OK,
} from "https://deno.land/x/retes/response.ts";

const routes = [
  GET("/created", () => Created("payload")), // returns HTTP 201 Created
  GET("/ok", () => OK("payload")), // returns HTTP 200 OK
  GET("/accepted", () => Accepted("payload")), // returns HTTP 202 Accepted
  GET("/internal-error", () => InternalServerError()), // returns HTTP 500 Internal Server Error
];

const app = new ServerApp(routes);
await app.start(3000);
```

### Middleware Composition on Per-Route Basis

```ts
import { ServerApp } from "https://deno.land/x/retes/mod.ts";
import { GET } from "https://deno.land/x/retes/routing.ts";
import { Plain } from "https://deno.land/x/retes/response.ts";

const prepend = (handler) =>
  (request) => {
    const response = handler();

    return Plain(`prepend - ${response.body}`);
  };
const append = (handler) =>
  (request) => {
    const response = handler();
    return `${response.body} - append`;
  };

const routes = [
  GET("/middleware", () => Plain("Hello, Middlewares"), {
    middleware: [prepend, append],
  }), // equivalent to: prepend(append(handler))
];

const app = new ServerApp(routes);
await app.start(3000);
```

## Benchmarks

WIP

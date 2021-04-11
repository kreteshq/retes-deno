// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { ServerApp } from "./mod.ts";
import { Created, HTMLString, OK, Plain } from "./response.ts";
import { DELETE, GET, POST, PUT } from "./routing.ts";

import type { Handler, Request } from "./mod.ts";

const ExplicitResponse = {
  statusCode: 200,
  headers: {},
  body: { hello: "Kretes" },
};

const identity = (_: Handler) => _;
const prepend = (handler: Handler) =>
  async (request: Request) => {
    const response = await handler(request);
    return Plain(`Prefix -> ${response.body}`);
  };

//
// R O U T E S
//

const GETs = [
  GET("/", (_) => Plain("Hello, GET!")),
  GET("/json-explicit-response", (_) => ExplicitResponse),
  GET("/json-helper-response", (_) => OK({ hello: "Kretes" })),
  GET("/json-created-response", (_) => Created({ status: "Created!" })),
  GET("/route-params/:name", ({ params }) => OK({ hello: params.name })),
  GET("/query-params", ({ params: { search } }) => OK({ search })),
  GET(
    "/html-content",
    (_) =>
      HTMLString(
        "<h1>Retes - Typed, Declarative, Data-Driven Routing for Node.js</h1>",
      ),
  ),
  GET("/accept-header-1", ({ format }) => OK(format)),
  GET("/explicit-format", ({ format }) => OK(format)),
];

const POSTs = [
  POST("/post-json", ({ params: { name } }) => Plain(`Received -> ${name}`)),
  POST("/post-form", ({ params: { name } }) => Plain(`Received -> ${name}`)),
  POST("/upload", ({ files }) => {
    return Plain(`Uploaded -> ${files!.upload.name}`);
  }),
  POST("/", (_) => Plain("Hello, POST!")),
];

const PUTs = [
  PUT("/", (_) => Plain("Hello, PUT!")),
];

const DELETEs = [
  DELETE("/", (_) => Plain("Hello, DELETE!")),
];

const Compositions = [
  GET("/simple-compose", (_) => Plain("Simple Compose"), {
    middleware: [identity],
  }),
  GET("/prepend-compose", (_) => Plain("Prepend Compose"), {
    middleware: [prepend],
  }),
];

const routes = [...GETs, ...POSTs, ...PUTs, ...DELETEs, ...Compositions];

const server = new ServerApp(routes);
await server.start(5544);

// FIXME? This is not reached, so the worker hungs the test process
self.close();

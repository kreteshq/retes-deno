import { ServerApp } from "../mod.ts";
import { GET } from "../routing.ts";
import { Accepted, Created, InternalServerError, OK } from "../response.ts";

const routes = [
  GET("/created", () => Created("payload")), // returns HTTP 201 Created
  GET("/ok", () => OK("payload")), // returns HTTP 200 OK
  GET("/accepted", () => Accepted("payload")), // returns HTTP 202 Accepted
  GET("/internal-error", () => InternalServerError()), // returns HTTP 500 Internal Server Error
];

const app = new ServerApp(routes);
await app.start(5544);

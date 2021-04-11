import { ServerApp } from "../mod.ts";
import { GET, POST } from "../routing.ts";
import { OK } from "../response.ts";

const routes = [
  GET("/query-params", ({ params }) => OK(params)),
  POST("/body-form", ({ params }) => OK(params)),
  POST("/body-json", ({ params }) => OK(params)),
  GET("/segment/:a/:b", ({ params }) => OK(params)),
];

const app = new ServerApp(routes);
await app.start(3000);

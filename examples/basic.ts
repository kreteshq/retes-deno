import { GET, ServerApp } from "../mod.ts";
import { Plain } from "../response.ts";

const routes = [
  GET("/", (_) => Plain("Hello, World")),
];

const server = new ServerApp(routes);
server.start(5544);

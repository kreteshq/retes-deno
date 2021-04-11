import { Middleware, ServerApp } from "../mod.ts";
import { GET } from "../routing.ts";
import { Plain } from "../response.ts";

const prepend: Middleware = (handler) =>
  async (request) => {
    const response = await handler(request);

    return Plain(`prepend - ${response.body}`);
  };
const append: Middleware = (handler) =>
  async (request) => {
    const response = await handler(request);
    return Plain(`${response.body} - append`);
  };

const routes = [
  GET("/middleware", () => Plain("Hello, Middlewares"), {
    middleware: [prepend, append],
  }), // equivalent to: prepend(append(handler))
];

const app = new ServerApp(routes);
await app.start(5544);

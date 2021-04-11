import { ServerApp } from "../mod.ts";
import { Plain } from "../response.ts";
import { GET } from "../routing.ts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const routes = [
  GET("/", async (_) => {
    await sleep(101);

    return Plain("Hello, World");
  }),
];

const app = new ServerApp(routes);

app.use((handler) =>
  async (request) => {
    const response = await handler(request);
    const dTime = response.headers ? response.headers["X-Response-Time"] : "";

    console.log(`${request.method} ${request.url} - ${dTime}`);

    return response;
  }
);

app.use((handler) =>
  async (request) => {
    const start = Date.now();
    const response = await handler(request);
    const ms = Date.now() - start;

    return {
      ...response,
      headers: {
        ...response.headers,
        "X-Response-Time": `${ms}ms`,
      },
    };
  }
);

await app.start(5544);

import { assertEquals } from "https://deno.land/std@0.92.0/testing/asserts.ts";
import { soxa as http } from "https://deno.land/x/soxa/mod.ts";

const serverPath = new URL("./_test_server.ts", import.meta.url).href;
const _worker = new Worker(serverPath, { type: "module", deno: true });
await new Promise((resolve) => setTimeout(resolve, 1000));

http.defaults.baseURL = "http://localhost:5544";

const { test } = Deno;

//
// T E S T S
//

test("the most simple routes", async () => {
  const { data: d1 } = await http.get("/");
  assertEquals(d1, "Hello, GET!");

  const { data: d2 } = await http.post("/", {});
  assertEquals(d2, "Hello, POST!");

  const { data: d3 } = await http.put("/", {});
  assertEquals(d3, "Hello, PUT!");

  const { data: d4 } = await http.delete("/");
  assertEquals(d4, "Hello, DELETE!");
});

test("returns string with implicit return", async () => {
  const { status, data } = await http.get("/");
  assertEquals(status, 200);
  assertEquals(data, "Hello, GET!");
});

test("returns json for explicit response", async () => {
  const { status, data } = await http.get("/json-explicit-response");
  assertEquals(status, 200);
  assertEquals(data, { hello: "Kretes" });
});

test("returns json for `OK` helper response", async () => {
  const { status, data } = await http.get("/json-helper-response");
  assertEquals(status, 200);
  assertEquals(data, { hello: "Kretes" });
});

test("returns json for `created` helper response", async () => {
  const { status, data, headers } = await http.get("/json-created-response");
  assertEquals(status, 201);
  assertEquals(headers["content-type"], "application/json");
  assertEquals(data, { status: "Created!" });
});

test("returns route params", async () => {
  const { data, status } = await http.get("/route-params/Kretes");
  assertEquals(status, 200);
  assertEquals(data, { hello: "Kretes" });
});

test("returns query params", async () => {
  const { status, data } = await http.get("/query-params?search=Kretes");
  assertEquals(status, 200);
  assertEquals(data, { search: "Kretes" });
});

test("returns HTML content", async () => {
  const { data, status, headers } = await http.get("/html-content");
  assertEquals(status, 200);
  assertEquals(headers["content-type"], "text/html");
  assertEquals(
    data,
    "<h1>Retes - Typed, Declarative, Data-Driven Routing for Node.js</h1>",
  );
});

// test('respects `Accept` header', async () => {
//   const { data, status } = await http.get('/accept-header-1', {
//     headers: {
//       Accept: 'text/plain',
//     }
//   });
//   assertEquals(status, 200);
//   assertEquals(data, 'plain');
// });

// FIXME
// test('respects explicit format query param', async () => {
//   const { data, status } = await http.get('/explicit-format?format=csv');
//   assertEquals(status, 200);
//   assertEquals(data, 'csv');
// });

test("accepts POST params as JSON", async () => {
  const { status, data } = await http.post("/post-json", {
    name: "Retes via JSON",
  });
  assertEquals(status, 200);
  assertEquals(data, "Received -> Retes via JSON");
});

test("accepts POST params as Form", async () => {
  const { status, data } = await http.post(
    "/post-form",
    new URLSearchParams({ name: "Retes via Form" }),
  );
  assertEquals(status, 200);
  assertEquals(data, "Received -> Retes via Form");
});

// Compositions

test("compose functions & return string", async () => {
  const { status, data } = await http.get("/simple-compose");
  assertEquals(status, 200);
  assertEquals(data, "Simple Compose");
});

test("compose functions & append string", async () => {
  const { status, data } = await http.get("/prepend-compose");
  assertEquals(status, 200);
  assertEquals(data, "Prefix -> Prepend Compose");
});

// Errors

test("render an error page for a non-existing route", async () => {
  try {
    await http.get("/route-doesnt-exist-404");
  } catch (error) {
    const { response: { status, statusText } } = error;
    assertEquals(status, 404);
    assertEquals(statusText, "Not Found");
  }
});

/*
test('receives file upload', async () => {
  const fd = new FormData();

  fd.append('upload', 'This is my upload', 'foo.csv');

  const options = {
    headers: {
      'content-type': 'multipart/form-data'
    }
  };

  const { status, data } = await http.post('/upload', fd, options);
  assertEquals(status, 200);
  assertEquals(data, 'Uploaded -> foo.csv');
});

/*

test('sets security headers by default', async () => {
  const { headers } = await http.get('/');
  assertEquals(headers['x-download-options'], 'noopen');
  assertEquals(headers['x-content-type-options'], 'nosniff');
  assertEquals(headers['x-xss-protection'], '1; mode=block');
  assertEquals(true, true);
});

// Varia





test('built-in validation with invalid request', async assert => {
  try {
    await get('/request-validation');
  } catch ({ response: { status, data } }) {
    assertEquals(status, 422);
    assert.deepEqual(data, ['name is required.']);
  }
});

test('built-in validation with valid request', async assert => {
  const { status, data } = await get('/request-validation?name=Zaiste');
  assertEquals(status, 200);
  assertEquals(data, 'Admin param (undefined) should be absent from this request payload');
});

test('built-in validation strips undefined params', async assert => {
  const { status, data } = await get('/request-validation?name=Zaiste&admin=true');
  assertEquals(status, 200);
  assertEquals(data, 'Admin param (undefined) should be absent from this request payload');
});


*/

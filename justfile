ex-basic:
  deno run --unstable --allow-net ./examples/basic.ts
ex-middleware:
  deno run --unstable --allow-net ./examples/middleware.ts
ex-params:
  deno run --unstable --allow-net ./examples/params.ts
ex-composition:
  deno run --unstable --allow-net ./examples/composition.ts
ex-wrappers:
  deno run --unstable --allow-net ./examples/wrappers.ts

test:
  deno test -A --unstable
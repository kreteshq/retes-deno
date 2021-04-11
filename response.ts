// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import type { Resource, Response, ResponseBody } from "./types.ts";

//
// 2xx
//
export const OK = (body: ResponseBody, headers = {}) => {
  return { headers, body, statusCode: 200 } as Response;
};

export function Created(resource: Resource = "", headers = {}): Response {
  return {
    statusCode: 201,
    headers,
    body: resource,
  };
}

export function Plain(content: string): Response {
  return {
    statusCode: 200,
    type: "text/plain",
    body: content,
  };
}

export function Accepted(resource: Resource = "", headers = {}): Response {
  return {
    statusCode: 202,
    headers,
    body: resource,
  };
}

export function NoContent(headers = {}): Response {
  return {
    statusCode: 204,
    headers,
    body: "",
  };
}

export function Redirect(
  url: string,
  body = "Redirecting...",
  statusCode = 302,
): Response {
  return {
    statusCode,
    headers: { Location: url },
    type: "text/plain",
    body,
  };
}

export function NotModified(headers = {}): Response {
  return {
    statusCode: 304,
    headers,
    body: "",
  };
}

export function JSONPayload(content = {}, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(content),
    type: "application/json",
  };
}

export function HTMLString(content: string): Response {
  return {
    statusCode: 200,
    type: "text/html",
    body: content,
  };
}

// HTMLStream(content: string): Response {
//   const Readable = require('stream').Readable;

//   const s = new Readable();
//   s.push(content);
//   s.push(null);

//   return s;
// },

export function JavaScriptString(content: string): Response {
  return {
    statusCode: 200,
    type: "application/javascript",
    body: content,
  };
}

export function StyleSheetString(content: string): Response {
  return {
    statusCode: 200,
    type: "text/css",
    body: content,
  };
}

//
// 4xx
//
export function BadRequest(): Response {
  return {
    statusCode: 400,
    headers: {},
    body: "",
  };
}

export function Unauthorized(): Response {
  return {
    statusCode: 401,
    headers: {},
    body: "",
  };
}

export function Forbidden(content = ""): Response {
  return {
    statusCode: 403,
    body: content,
  };
}

export function NotFound(headers = {}): Response {
  return {
    statusCode: 404,
    type: "text/html",
    headers,
    body: "Not Found",
  };
}

export function MethodNotAllowed(): Response {
  return {
    statusCode: 405,
    headers: {},
    body: "",
  };
}

export function NotAcceptable(): Response {
  return {
    statusCode: 406,
    headers: {},
    body: "",
  };
}

export function Conflict(content = ""): Response {
  return {
    statusCode: 409,
    body: content,
  };
}

//
// 5xx
//

export function InternalServerError(content = ""): Response {
  return {
    statusCode: 500,
    body: content,
  };
}

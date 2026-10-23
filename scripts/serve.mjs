import http from "node:http";
import { createReadStream } from "node:fs";
import { stat, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid port");
export const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; manifest-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=utf-8",
};
const pageRoute =
  /^\/(?:$|(?:collections|products|pages|journal)\/[a-z0-9-]+\/?$|(?:search|wishlist|cart|checkout|account|journal)\/?$)/;
const server = http.createServer(async (req, res) => {
  for (const [key, value] of Object.entries(securityHeaders))
    res.setHeader(key, value);
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url || "/", "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }
    if (
      pathname.includes("\0") ||
      pathname.includes("\\") ||
      pathname.split("/").some((part) => part.startsWith("."))
    ) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    let candidate = path.resolve(root, "." + pathname);
    if (candidate !== root && !candidate.startsWith(root + path.sep)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    let code = 200;
    try {
      const info = await stat(candidate);
      if (!info.isFile()) throw new Error("not a file");
    } catch {
      if (pathname.startsWith("/api/")) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "API_NOT_CONFIGURED" }));
        return;
      }
      if (path.extname(pathname)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      candidate = path.join(root, "index.html");
      code = pageRoute.test(pathname) ? 200 : 404;
    }
    const resolved = await realpath(candidate);
    if (!resolved.startsWith(root + path.sep)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const info = await stat(resolved);
    const ext = path.extname(resolved);
    const tag =
      'W/"' +
      info.size.toString(16) +
      "-" +
      Math.trunc(info.mtimeMs).toString(16) +
      '"';
    res.setHeader("Content-Type", types[ext] || "application/octet-stream");
    res.setHeader(
      "Cache-Control",
      ext === ".html"
        ? "no-cache"
        : resolved.includes(path.sep + "assets" + path.sep)
          ? "public, max-age=31536000, immutable"
          : "public, max-age=86400",
    );
    res.setHeader("ETag", tag);
    if (req.headers["if-none-match"] === tag) {
      res.writeHead(304);
      res.end();
      return;
    }
    res.setHeader("Content-Length", info.size);
    res.writeHead(code);
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(resolved)
      .on("error", () => res.destroy())
      .pipe(res);
  } catch {
    if (!res.headersSent) res.writeHead(500);
    res.end("Unable to serve the page");
  }
});
server.headersTimeout = 10000;
server.requestTimeout = 15000;
server.keepAliveTimeout = 5000;
server.listen(port, "127.0.0.1", () =>
  console.log(`Sunday Nest: http://127.0.0.1:${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));

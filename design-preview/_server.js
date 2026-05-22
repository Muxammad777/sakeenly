// Minimal static server for design-preview. Run: node _server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 4242;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

http
  .createServer((req, res) => {
    let url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/" || url === "") url = "/preview-index.html";
    const fp = path.join(ROOT, url);
    if (!fp.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end("403");
    }
    const tryRead = (target, onMiss) => {
      fs.readFile(target, (err, data) => {
        if (err) return onMiss();
        const ext = path.extname(target).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      });
    };
    tryRead(fp, () => {
      // No direct hit — try .html fallback for clean URLs like /ask, /preview-index.
      if (!path.extname(fp)) {
        return tryRead(fp + ".html", () => {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end("404 not found");
        });
      }
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("404 not found");
    });
  })
  .listen(PORT, () => console.log(`sakeenly preview on http://localhost:${PORT}`));

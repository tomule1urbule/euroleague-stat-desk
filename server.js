// Tiny zero-dependency server for EuroLeague Stat Desk.
// Serves index.html and forwards /proxy/api/* and /proxy/live/* to the official
// EuroLeague API, so the app works even if your browser blocks direct calls.
// Usage: node server.js   then open http://localhost:8787
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8787;
const UPSTREAM = { api: "api-live.euroleague.net", live: "live.euroleague.net" };

http.createServer((req, res) => {
  const m = req.url.match(/^\/proxy\/(api|live)(\/.*)$/);
  if (m) {
    const up = https.get({ host: UPSTREAM[m[1]], path: m[2], headers: { accept: "application/json", "user-agent": "Mozilla/5.0 StatDesk" } }, (r) => {
      res.writeHead(r.statusCode, { "content-type": r.headers["content-type"] || "application/json", "cache-control": "no-store" });
      r.pipe(res);
    });
    up.on("error", (e) => { res.writeHead(502, { "content-type": "text/plain" }); res.end("Upstream error: " + e.message); });
    return;
  }
  if (req.url === "/" || req.url.startsWith("/index.html")) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return fs.createReadStream(path.join(__dirname, "index.html")).pipe(res);
  }
  res.writeHead(404); res.end("Not found");
}).listen(PORT, () => console.log(`EuroLeague Stat Desk running at http://localhost:${PORT}`));

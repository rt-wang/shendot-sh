// Local dev server for canvas_ver/ — supports HTTP Range requests so
// <audio>/<video> can seek. Not for production.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "canvas_ver");
const PORT = Number(process.argv[2] || 8000);
// bind all interfaces so a phone on the same Wi-Fi can reach it
const HOST = process.argv[3] || "0.0.0.0";
const INDEX = "index.html";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".wav": "audio/wav",
  ".mp4": "video/mp4", ".webm": "video/webm", ".m3u8": "application/vnd.apple.mpegurl",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".avif": "image/avif",
  ".woff2": "font/woff2", ".ico": "image/x-icon",
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split("?")[0]);
  if (rel === "/") rel = "/" + INDEX;

  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end("forbidden"); return; }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end("not found"); return; }

    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    const head = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" };
    const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);

    if (range) {
      let [, s, e] = range;
      let start = s === "" ? stat.size - Number(e) : Number(s);
      let end = s === "" || e === "" ? stat.size - 1 : Number(e);
      if (isNaN(start) || isNaN(end) || start > end || end >= stat.size) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
        return;
      }
      res.writeHead(206, { ...head,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Content-Length": end - start + 1 });
      if (req.method !== "HEAD") fs.createReadStream(file, { start, end }).pipe(res);
      else res.end();
      return;
    }

    res.writeHead(200, { ...head, "Content-Length": stat.size });
    if (req.method !== "HEAD") fs.createReadStream(file).pipe(res);
    else res.end();
  });
}).listen(PORT, HOST, () => console.log(`serving canvas_ver/ on http://${HOST}:${PORT}`));

/**
 * Academic Excellence — Local Server with /api/send-email Support
 * Serves static HTML/assets and routes /api/send-email to the serverless handler.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// Load .env.local if present
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const emailHandler = require("./api/send-email.js");
const PORT = process.env.PORT || 3300;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf"
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = urlObj.pathname;

  // 1. API Route: /api/send-email
  if (pathname.startsWith("/api/send-email")) {
    let bodyData = "";
    req.on("data", (chunk) => {
      bodyData += chunk;
    });
    req.on("end", async () => {
      try {
        if (bodyData) {
          req.body = JSON.parse(bodyData);
        }
      } catch (_) {
        req.body = bodyData;
      }

      // Add express-like res helper methods
      res.status = function (code) {
        res.statusCode = code;
        return res;
      };
      res.json = function (obj) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(obj));
        return res;
      };

      try {
        await emailHandler(req, res);
      } catch (err) {
        console.error("API Error:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("404 Not Found: " + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Academic Excellence Local Server Running`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Pages: http://localhost:${PORT}/index.html`);
  console.log(` Admin: http://localhost:${PORT}/admin/index.html`);
  console.log(` Email API: http://localhost:${PORT}/api/send-email [ACTIVE]`);
  console.log(`======================================================\n`);
});

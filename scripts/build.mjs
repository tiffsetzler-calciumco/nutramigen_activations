/**
 * Build: src/ → dist/
 *   - copies everything in src/ (html, js, data, img, _headers) except the scss folder
 *   - compiles src/scss/main.scss → dist/css/styles.css
 *
 *   node scripts/build.mjs            one-off build (minified CSS)
 *   node scripts/build.mjs --watch    build, then rebuild on every save + serve on http://localhost:5173
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import * as sass from "sass";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const watch = process.argv.includes("--watch");
const PORT = Number(process.env.PORT) || 5173;

function compileScss() {
  const result = sass.compile(path.join(SRC, "scss/main.scss"), {
    style: watch ? "expanded" : "compressed",
    sourceMap: watch,
    sourceMapIncludeSources: watch,
  });
  fs.mkdirSync(path.join(DIST, "css"), { recursive: true });
  let css = result.css;
  if (result.sourceMap) {
    fs.writeFileSync(path.join(DIST, "css/styles.css.map"), JSON.stringify(result.sourceMap));
    css += "\n/*# sourceMappingURL=styles.css.map */";
  }
  fs.writeFileSync(path.join(DIST, "css/styles.css"), css);
}

function build() {
  const started = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.cpSync(SRC, DIST, {
    recursive: true,
    filter: (p) => !p.startsWith(path.join(SRC, "scss")) && !path.basename(p).startsWith("."),
  });
  compileScss();
  console.log(`✔ built dist/ in ${Date.now() - started}ms`);
}

try {
  build();
} catch (err) {
  console.error(`✖ build failed\n${err.message}`);
  if (!watch) process.exit(1);
}

if (watch) {
  // Rebuild on any change in src/ (debounced).
  let timer;
  fs.watch(SRC, { recursive: true }, (_event, file) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        console.log(`↻ ${file} changed`);
        build();
      } catch (err) {
        console.error(`✖ ${err.message}`);
      }
    }, 100);
  });

  // Tiny static server for dist/.
  const TYPES = {
    ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
    ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".woff2": "font/woff2", ".map": "application/json",
  };
  http
    .createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let file = path.join(DIST, urlPath);
      if (!file.startsWith(DIST)) return res.writeHead(403).end();
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      if (!fs.existsSync(file)) return res.writeHead(404).end("Not found");
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      fs.createReadStream(file).pipe(res);
    })
    .listen(PORT, () => console.log(`\n▶ Game running at http://localhost:${PORT}  (Ctrl+C to stop)\n`));
}

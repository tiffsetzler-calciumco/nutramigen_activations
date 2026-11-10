/**
 * Build → dist/
 *   index.hbs + questions.json  → dist/index.html   (Handlebars)
 *   scss/main.scss              → dist/css/styles.css (Sass)
 *   img/, js/, _headers         → copied as-is
 *   GSAP                        → dist/js/vendor/gsap.min.js
 *
 *   node scripts/build.mjs           one-off build
 *   node scripts/build.mjs --watch   build, rebuild on save, serve http://localhost:5173
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { createRequire } from "node:module";
import Handlebars from "handlebars";
import * as sass from "sass";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const watch = process.argv.includes("--watch");
const PORT = Number(process.env.PORT) || 5173;
const LETTERS = ["A", "B", "C", "D"];

/* ---------------- questions.json → template data (with friendly errors) ---------------- */
function loadQuestions() {
  const file = path.join(ROOT, "questions.json");
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`questions.json is not valid JSON — ${err.message}\n  Tip: paste it into https://jsonlint.com to find the typo.`);
  }
  const problems = [];
  const questions = (data.questions || []).map((q, i) => {
    const where = `question ${i + 1} (${q.id || "no id"})`;
    if (!q.id) problems.push(`${where}: missing "id"`);
    if (!Array.isArray(q.answers) || q.answers.length !== 4) problems.push(`${where}: needs exactly 4 answers`);
    const correctIndex = LETTERS.indexOf(String(q.correct).trim().toUpperCase());
    if (correctIndex === -1) problems.push(`${where}: "correct" must be "A", "B", "C" or "D"`);
    for (const key of ["before", "after", "incorrectImage"]) {
      if (q[key] && !fs.existsSync(path.join(ROOT, "img", q[key]))) problems.push(`${where}: img/${q[key]} not found`);
    }
    const answers = (q.answers || []).map((text, n) => ({ letter: LETTERS[n], text }));
    return { ...q, answers, correctIndex, correctAnswer: answers[correctIndex] || { letter: "?", text: "" } };
  });
  if (!questions.length) problems.push('no questions found — expected { "questions": [ … ] }');
  if (problems.length) throw new Error("questions.json:\n  - " + problems.join("\n  - "));
  return { questions, total: questions.length };
}

/* ---------------- steps ---------------- */
function renderHtml() {
  const template = Handlebars.compile(fs.readFileSync(path.join(ROOT, "index.hbs"), "utf8"));
  fs.writeFileSync(path.join(DIST, "index.html"), template(loadQuestions()));
}

function compileScss() {
  const result = sass.compile(path.join(ROOT, "scss/main.scss"), {
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

function copyStatic() {
  const notHidden = (p) => !path.basename(p).startsWith(".");
  fs.cpSync(path.join(ROOT, "img"), path.join(DIST, "img"), { recursive: true, filter: notHidden });
  fs.cpSync(path.join(ROOT, "js"), path.join(DIST, "js"), { recursive: true, filter: notHidden });
  fs.copyFileSync(path.join(ROOT, "_headers"), path.join(DIST, "_headers"));
  fs.mkdirSync(path.join(DIST, "js/vendor"), { recursive: true });
  fs.copyFileSync(require.resolve("gsap/dist/gsap.min.js"), path.join(DIST, "js/vendor/gsap.min.js"));
}

function build() {
  const started = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  copyStatic();
  renderHtml();
  compileScss();
  console.log(`✔ built dist/ in ${Date.now() - started}ms`);
}

try {
  build();
} catch (err) {
  console.error(`✖ build failed\n${err.message}`);
  if (!watch) process.exit(1);
}

/* ---------------- dev: watch + serve ---------------- */
if (watch) {
  const WATCHED = ["index.hbs", "questions.json", "_headers", "img", "js", "scss"];
  let timer;
  fs.watch(ROOT, { recursive: true }, (_event, file) => {
    if (!file || !WATCHED.some((w) => file === w || file.startsWith(w + path.sep))) return;
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

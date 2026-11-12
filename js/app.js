/**
 * Game flow. All markup + copy is in index.hbs, questions in questions.json,
 * animations in animations.js — this file just wires them together.
 */
import { CONFIG } from "./config.js";
import { createIdleWatcher } from "./idle.js";
import * as anim from "./animations.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const screens = {
  attract: $("#screen-attract"),
  home: $("#screen-home"),
  question: $("#screen-question"),
  end: $("#screen-end"),
};
const scene = $("#scene");
const ornaments = $$(".ornament");
const articles = $$(".question");
const TOTAL = articles.length;
// Remember each "solution" image so a wrong answer can be undone on reset.
const afterImages = [...$$(".question__image--after"), ...$$(".ornament__after")];
afterImages.forEach((img) => (img.dataset.originalSrc = img.getAttribute("src")));

/* ---------------- state ---------------- */
const state = {
  answered: new Map(), // id -> { selectedIndex, correct }
  justAnswered: null, // id to flip on the mobile when we return
  busy: false,
};
const score = () => [...state.answered.values()].filter((a) => a.correct).length;

/* ---------------- screens ---------------- */
function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => el.classList.toggle("is-active", key === name));
  window.scrollTo(0, 0);
  idle.setEnabled(name !== "attract"); // idle timer runs everywhere except the attract screen
}

/* ---------------- home (the mobile) ---------------- */
async function showHome() {
  anim.resetScene(scene, ornaments);
  showScreen("home");
  ornaments.forEach((o) => (o.disabled = state.answered.has(o.dataset.id)));

  // Flip the ornament that was just answered.
  const id = state.justAnswered;
  state.justAnswered = null;
  if (id) await anim.flipOrnament(ornaments.find((o) => o.dataset.id === id));
}

async function selectOrnament(ornament) {
  if (state.busy || ornament.disabled) return;
  state.busy = true;
  await anim.zoomIntoOrnament(scene, ornament);
  openQuestion(ornament.dataset.id);
  state.busy = false;
}

ornaments.forEach((o) => o.addEventListener("click", () => selectOrnament(o)));
anim.swayOrnaments(ornaments);

/* ---------------- questions ---------------- */
function updateProgress() {
  const count = state.answered.size;
  const pct = Math.round((count / TOTAL) * 100);
  $(".js-progress-count").textContent = `${count}/${TOTAL}`;
  $(".js-progress-pct").textContent = `${pct}% Complete`;
  $(".progress__track").setAttribute("aria-valuenow", String(pct));
  anim.setProgress($(".progress__fill"), pct);
}

function openQuestion(id) {
  articles.forEach((a) => (a.hidden = a.dataset.id !== id));
  const article = articles.find((a) => a.dataset.id === id);
  updateProgress();
  showScreen("question");
  anim.introQuestion(article);
}

async function answerQuestion(article, button) {
  const id = article.dataset.id;
  if (state.answered.has(id)) return;

  const selectedIndex = Number(button.dataset.index);
  const correct = selectedIndex === Number(article.dataset.correct);
  state.answered.set(id, { selectedIndex, correct });
  state.justAnswered = id;

  // "Your answer" pill
  const yours = $(".js-your-answer", article);
  yours.textContent = button.textContent;
  yours.className = `pill js-your-answer ${correct ? "pill--correct" : "pill--incorrect"}`;

  // Correct → "after" (solution) image. Incorrect → the problem image again
  // (or "incorrectImage" from questions.json), on the quiz and on the mobile.
  if (!correct) {
    const ornamentAfter = $(".ornament__after", ornaments.find((o) => o.dataset.id === id));
    [$(".question__image--after", article), ornamentAfter].forEach((img) => (img.src = img.dataset.incorrectSrc));
  }
  article.classList.add("is-answered", correct ? "is-correct" : "is-incorrect");
  article.classList.toggle("is-final", state.answered.size === TOTAL);

  $(".ask", article).hidden = true;
  const result = $(".result", article);
  result.hidden = false;
  anim.revealResult(result);
  updateProgress();
  // Correct → keep the image and bobble it. Incorrect → flip to the -incorrect image.
  await (correct ? anim.bobbleQuestionImage(article) : anim.flipQuestionImage(article));
}

articles.forEach((article) => {
  $$(".pill--choice", article).forEach((btn) => btn.addEventListener("click", () => answerQuestion(article, btn)));
  $(".js-next", article).addEventListener("click", () => {
    if (state.answered.size === TOTAL) showEnd();
    else showHome();
  });
});

/* ---------------- end ---------------- */
function showEnd() {
  $(".js-score").textContent = String(score());
  showScreen("end");
  anim.introEnd(screens.end);
}

/* ---------------- start / reset ---------------- */
function resetGame() {
  state.answered.clear();
  state.justAnswered = null;
  state.busy = false;
  $("#idle-modal").hidden = true;

  ornaments.forEach((o) => {
    o.disabled = false;
    anim.setOrnamentFlipped(o, false);
  });
  articles.forEach((article) => {
    article.classList.remove("is-answered", "is-correct", "is-incorrect", "is-final");
    $(".ask", article).hidden = false;
    $(".result", article).hidden = true;
    anim.resetQuestion(article);
  });
  afterImages.forEach((img) => (img.src = img.dataset.originalSrc)); // undo any wrong-answer images
  updateProgress();
  showScreen("attract");
}

screens.attract.addEventListener("click", showHome);
$$(".js-return").forEach((b) => b.addEventListener("click", resetGame));

/* ---------------- idle popup ---------------- */
const idle = createIdleWatcher({
  warnMs: CONFIG.idleWarnMs,
  resetMs: CONFIG.idleResetMs,
  onWarn: () => {
    $("#idle-modal").hidden = false;
    $(".outline-button.js-keep-playing").focus();
  },
  onReset: resetGame,
});

$$(".js-keep-playing").forEach((b) =>
  b.addEventListener("click", () => {
    $("#idle-modal").hidden = true;
    idle.confirm();
  })
);

// Kiosk niceties: no long-press menu.
window.addEventListener("contextmenu", (e) => e.preventDefault());

showScreen("attract");

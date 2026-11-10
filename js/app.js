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
articles.forEach((a) => {
  const after = $(".question__image--after", a);
  after.dataset.originalSrc = after.getAttribute("src");
});

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

  // Incorrect → black & white "after" image (or a custom incorrect image if provided)
  const after = $(".question__image--after", article);
  if (!correct && after.dataset.incorrectSrc) after.src = after.dataset.incorrectSrc;
  article.classList.add("is-answered", correct ? "is-correct" : "is-incorrect");
  article.classList.toggle("is-grayscale", !correct && !after.dataset.incorrectSrc);
  article.classList.toggle("is-final", state.answered.size === TOTAL);

  $(".ask", article).hidden = true;
  const result = $(".result", article);
  result.hidden = false;
  anim.revealResult(result);
  updateProgress();
  await anim.flipQuestionImage(article);
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
    article.classList.remove("is-answered", "is-correct", "is-incorrect", "is-grayscale", "is-final");
    $(".ask", article).hidden = false;
    $(".result", article).hidden = true;
    const after = $(".question__image--after", article);
    after.src = after.dataset.originalSrc; // undo any custom "incorrect" image
    anim.resetQuestion(article);
  });
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

import { ITEMS, ATTRACT, HOME, QUESTION, END, FOOTER, IDLE } from "./content.js";
import { CONFIG } from "./config.js";
import { createIdleWatcher } from "./idle.js";

/* ---------------- state ---------------- */
const state = {
  answered: new Map(), // itemId -> { selectedIndex, correct }
  busy: false, // true during the zoom animation
  screen: "attract",
};

const $ = (id) => document.getElementById(id);
const LETTERS = ["A", "B", "C", "D"];
const lettered = (i, text) => `${LETTERS[i]}. ${text}`;
const score = () => [...state.answered.values()].filter((a) => a.correct).length;

const screens = {
  attract: $("screen-attract"),
  home: $("screen-home"),
  question: $("screen-question"),
  end: $("screen-end"),
};

/* ---------------- static copy ---------------- */
const setText = (id, text) => ($(id).textContent = text);

screens.attract.style.backgroundImage = `url("${ATTRACT.background}")`;
setText("attract-title", ATTRACT.title);
setText("attract-subtitle", ATTRACT.subtitle);
setText("attract-cta", ATTRACT.cta);

$("scene").style.backgroundImage = `url("${HOME.background}")`;
$("home-title").innerHTML = `<strong></strong> <span></span>`;
$("home-title").querySelector("strong").textContent = HOME.titleBold;
$("home-title").querySelector("span").textContent = HOME.titleLight;
setText("home-subtitle", HOME.subtitle);
setText("home-cta", HOME.cta);

setText("select-prompt", QUESTION.selectPrompt);
setText("your-label", QUESTION.yourAnswer);
setText("correct-label", QUESTION.correctAnswer);

screens.end.style.backgroundImage = `url("${END.background}")`;
setText("end-title", END.title);
$("end-qr").src = END.qrImage;
$("end-qr").alt = END.qrAlt;
setText("end-intro", END.intro);
setText("end-heading", END.heading);
setText("end-body", END.body);
setText("end-hashtag", END.hashtag);
setText("exit-button", `✕  ${FOOTER.exitLabel}`);
document.querySelectorAll(".js-return").forEach((b) => (b.textContent = `↺  ${FOOTER.returnLabel}`));

setText("idle-heading", IDLE.heading);
setText("idle-body", IDLE.body);
setText("idle-question", IDLE.question);
setText("idle-button", IDLE.buttonLabel);

document.documentElement.style.setProperty("--zoom-ms", `${CONFIG.zoomMs}ms`);

// Preload every image so swaps are instant.
ITEMS.flatMap((i) => [i.before, i.after, i.questionImage, i.correctImage, i.incorrectImage])
  .filter(Boolean)
  .forEach((src) => (new Image().src = src));

/* ---------------- screens ---------------- */
function showScreen(name) {
  state.screen = name;
  Object.entries(screens).forEach(([key, el]) => el.classList.toggle("is-active", key === name));
  window.scrollTo(0, 0);
  // Idle timer runs everywhere except the attract screen.
  idle.setEnabled(name !== "attract");
}

/* ---------------- home (the mobile) ---------------- */
function renderHome() {
  $("ornaments").replaceChildren(
    ...ITEMS.map((item, i) => {
      const done = state.answered.has(item.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ornament" + (done ? " is-flipped" : "");
      btn.style.setProperty("--x", `${item.position.x}%`);
      btn.style.setProperty("--y", `${item.position.y}%`);
      btn.style.setProperty("--sway-delay", `${i * -0.7}s`);
      btn.disabled = done;
      btn.setAttribute("aria-label", done ? `${item.label} (answered)` : item.label);
      const img = document.createElement("img");
      img.src = done ? item.after : item.before;
      img.alt = "";
      img.draggable = false;
      btn.append(img);
      btn.addEventListener("click", () => selectItem(item));
      return btn;
    })
  );
}

function selectItem(item) {
  if (state.busy) return;
  state.busy = true;
  const scene = $("scene");
  // Zoom into the tapped ornament, then open its question.
  scene.style.transformOrigin = `${item.position.x}% ${item.position.y}%`;
  scene.classList.add("is-zooming");
  setTimeout(() => {
    openQuestion(item);
    scene.classList.remove("is-zooming");
    state.busy = false;
  }, CONFIG.zoomMs);
}

/* ---------------- question ---------------- */
function updateProgress() {
  const count = state.answered.size;
  const pct = Math.round((count / ITEMS.length) * 100);
  setText("progress-count", `${count}/${ITEMS.length}`);
  setText("progress-pct", `${pct}% Complete`);
  $("progress-fill").style.width = `${pct}%`;
  $("progress-track").setAttribute("aria-valuenow", String(pct));
}

function setQuestionImage(src, { grayscale = false, flip = false } = {}) {
  const img = $("question-image");
  img.src = src;
  img.classList.toggle("is-grayscale", grayscale);
  if (flip) {
    img.classList.remove("is-flipping");
    void img.offsetWidth; // restart the animation
    img.classList.add("is-flipping");
  }
}

function openQuestion(item) {
  setQuestionImage(item.questionImage || item.before);
  setText("question-text", item.question);
  $("ask").hidden = false;
  $("result").hidden = true;
  screens.question.classList.remove("is-answered", "is-correct", "is-incorrect");

  $("answers").replaceChildren(
    ...item.answers.map((text, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill pill--choice";
      btn.textContent = lettered(index, text);
      btn.addEventListener("click", () => answerQuestion(item, index), { once: true });
      return btn;
    })
  );

  updateProgress();
  showScreen("question");
}

function answerQuestion(item, selectedIndex) {
  if (state.answered.has(item.id)) return;
  const correct = selectedIndex === item.correctIndex;
  state.answered.set(item.id, { selectedIndex, correct });

  // Flip the ornament: correct → full color, incorrect → black & white.
  if (correct) setQuestionImage(item.correctImage || item.after, { flip: true });
  else setQuestionImage(item.incorrectImage || item.after, { grayscale: !item.incorrectImage, flip: true });

  // "Your answer" | "Correct answer"
  setText("your-answer", lettered(selectedIndex, item.answers[selectedIndex]));
  $("your-answer").className = `pill ${correct ? "pill--correct" : "pill--incorrect"}`;
  setText("correct-answer", lettered(item.correctIndex, item.answers[item.correctIndex]));

  $("feedback").className = `feedback ${correct ? "feedback--correct" : "feedback--incorrect"}`;
  setText("feedback-title", correct ? QUESTION.correctTitle : QUESTION.incorrectTitle);
  setText("feedback-info", item.info);

  const allDone = state.answered.size === ITEMS.length;
  setText("next-label", allDone ? QUESTION.finishLabel : QUESTION.nextLabel);

  $("ask").hidden = true;
  $("result").hidden = false;
  screens.question.classList.add("is-answered", correct ? "is-correct" : "is-incorrect");
  updateProgress();
}

$("next-button").addEventListener("click", () => {
  if (state.answered.size === ITEMS.length) {
    setText("end-score", END.score.replace("{score}", score()).replace("{total}", ITEMS.length));
    showScreen("end");
  } else {
    renderHome();
    showScreen("home");
  }
});

/* ---------------- start / reset ---------------- */
function resetGame() {
  state.answered.clear();
  state.busy = false;
  $("idle-modal").hidden = true;
  renderHome();
  showScreen("attract");
}

screens.attract.addEventListener("click", () => {
  renderHome();
  showScreen("home");
});
document.querySelectorAll(".js-return").forEach((b) => b.addEventListener("click", resetGame));
$("exit-button").addEventListener("click", resetGame);

/* ---------------- idle ---------------- */
const idle = createIdleWatcher({
  warnMs: CONFIG.idleWarnMs,
  resetMs: CONFIG.idleResetMs,
  onWarn: () => {
    $("idle-modal").hidden = false;
    $("idle-button").focus();
  },
  onReset: resetGame,
});

const keepPlaying = () => {
  $("idle-modal").hidden = true;
  idle.confirm();
};
$("idle-button").addEventListener("click", keepPlaying);
$("idle-close").addEventListener("click", keepPlaying);

// Kiosk niceties: no long-press menu.
window.addEventListener("contextmenu", (e) => e.preventDefault());

/* ---------------- go ---------------- */
renderHome();
showScreen("attract");

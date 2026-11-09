import { ITEMS, HOME, QUESTION, END, IDLE } from "./content.js";
import { CONFIG } from "./config.js";
import { createIdleWatcher } from "./idle.js";

/* ---------------- state ---------------- */
const state = {
  answered: new Map(), // itemId -> { selectedIndex, correct }
  currentId: null,
  busy: false, // true during the zoom animation
};

const $ = (id) => document.getElementById(id);
const screens = {
  home: $("screen-home"),
  question: $("screen-question"),
  end: $("screen-end"),
};

/* ---------------- static copy ---------------- */
document.querySelector(".home__title").textContent = HOME.title;
document.querySelector(".home__subtitle").textContent = HOME.subtitle;
$("scene").style.backgroundImage = `url("${HOME.background}")`;
document.documentElement.style.setProperty("--zoom-ms", `${CONFIG.zoomMs}ms`);
$("end-title").textContent = END.title;
$("end-qr").src = END.qrImage;
$("end-qr").alt = END.qrAlt;
$("end-heading").textContent = END.heading;
$("end-body").textContent = END.body;
$("restart-button").textContent = END.restartLabel;
$("idle-title").textContent = IDLE.title;
$("idle-body").textContent = IDLE.body;
$("idle-button").textContent = IDLE.buttonLabel;

// Preload every image so swaps are instant.
ITEMS.flatMap((i) => [i.image, i.imageCorrect, i.imageIncorrect]).forEach((src) => {
  new Image().src = src;
});

/* ---------------- screens ---------------- */
function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => el.classList.toggle("is-active", key === name));
  window.scrollTo(0, 0);
  // Idle timer runs whenever a game is in progress (not on an untouched homepage).
  idle.setEnabled(!(name === "home" && state.answered.size === 0));
}

/* ---------------- home ---------------- */
function renderHome() {
  const scene = $("scene");
  scene.replaceChildren(
    ...ITEMS.map((item) => {
      const done = state.answered.has(item.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "item" + (done ? " is-done" : "");
      btn.style.setProperty("--x", `${item.position.x}%`);
      btn.style.setProperty("--y", `${item.position.y}%`);
      btn.disabled = done;
      btn.setAttribute("aria-label", done ? `${item.label} (answered)` : item.label);
      btn.innerHTML = `<img src="${item.image}" alt="" draggable="false" />${
        done ? '<span class="item__check" aria-hidden="true">✓</span>' : ""
      }`;
      btn.addEventListener("click", () => selectItem(item));
      return btn;
    })
  );
}

function selectItem(item) {
  if (state.busy) return;
  state.busy = true;
  const scene = $("scene");
  // Zoom the scene into the tapped item, then switch to its question.
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
  $("progress-count").textContent = `${count}/${ITEMS.length}`;
  $("progress-pct").textContent = `${pct}% Complete`;
  $("progress-fill").style.width = `${pct}%`;
  $("progress-track").setAttribute("aria-valuenow", String(pct));
}

function openQuestion(item) {
  state.currentId = item.id;
  $("question-image").src = item.image;
  $("question-text").textContent = item.question;
  $("result").hidden = true;
  screens.question.classList.remove("is-answered");

  const answers = $("answers");
  answers.className = "answers";
  answers.replaceChildren(
    ...item.answers.map((text, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer";
      btn.innerHTML = `<span class="answer__text"></span>`;
      btn.querySelector(".answer__text").textContent = text;
      btn.addEventListener("click", () => answerQuestion(item, index), { once: true });
      return btn;
    })
  );

  updateProgress();
  showScreen("question");
}

function resultCard(text, kind, tag) {
  const card = document.createElement("div");
  card.className = `answer answer--${kind}`;
  card.innerHTML = `<span class="answer__tag"></span><span class="answer__text"></span>`;
  card.querySelector(".answer__tag").textContent = tag;
  card.querySelector(".answer__text").textContent = text;
  return card;
}

function answerQuestion(item, selectedIndex) {
  if (state.answered.has(item.id)) return;
  const correct = selectedIndex === item.correctIndex;
  state.answered.set(item.id, { selectedIndex, correct });

  // Swap the image.
  $("question-image").src = correct ? item.imageCorrect : item.imageIncorrect;

  // Correct: only the correct answer stays (green).
  // Incorrect: chosen answer (red) on the left, correct answer (green) on the right.
  const answers = $("answers");
  answers.className = `answers answers--result ${correct ? "is-correct" : "is-incorrect"}`;
  const cards = correct
    ? [resultCard(item.answers[item.correctIndex], "correct", QUESTION.correctTag)]
    : [
        resultCard(item.answers[selectedIndex], "incorrect", QUESTION.incorrectTag),
        resultCard(item.answers[item.correctIndex], "correct", QUESTION.correctTag),
      ];
  answers.replaceChildren(...cards);

  // Info note + back arrow.
  const allDone = state.answered.size === ITEMS.length;
  $("result-info").textContent = item.info;
  $("back-label").textContent = allDone ? QUESTION.finishLabel : QUESTION.backLabel;
  $("back-button").classList.toggle("is-finish", allDone);
  $("result").hidden = false;
  screens.question.classList.add("is-answered");

  updateProgress();
}

$("back-button").addEventListener("click", () => {
  if (state.answered.size === ITEMS.length) {
    showScreen("end");
  } else {
    renderHome();
    showScreen("home");
  }
});

/* ---------------- reset ---------------- */
function resetGame() {
  state.answered.clear();
  state.currentId = null;
  state.busy = false;
  $("idle-modal").hidden = true;
  renderHome();
  showScreen("home");
}

$("restart-button").addEventListener("click", resetGame);

/* ---------------- idle ---------------- */
const idle = createIdleWatcher({
  warnMs: CONFIG.idleWarnMs,
  resetMs: CONFIG.idleResetMs,
  onWarn: () => {
    $("idle-modal").hidden = false;
    $("idle-button").focus();
  },
  onTick: (secondsLeft) => {
    $("idle-countdown").textContent = String(secondsLeft);
  },
  onReset: resetGame,
});

$("idle-button").addEventListener("click", () => {
  $("idle-modal").hidden = true;
  idle.confirm();
});

// Kiosk niceties: no long-press menu / image dragging.
window.addEventListener("contextmenu", (e) => e.preventDefault());

/* ---------------- start ---------------- */
renderHome();
showScreen("home");

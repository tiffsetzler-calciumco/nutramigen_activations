/**
 * ALL GSAP ANIMATIONS LIVE HERE.
 * app.js calls these at the right moments; tweak timings/eases freely.
 * GSAP docs: https://gsap.com/docs/v3/
 *
 * `gsap` is a global loaded from js/vendor/gsap.min.js (see index.hbs).
 */
const { gsap } = window;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reducedMotion) gsap.globalTimeline.timeScale(20); // effectively instant

/* ---------------- mobile / ornaments ---------------- */

/** Gentle idle sway on every ornament (runs forever). */
export function swayOrnaments(ornaments) {
  ornaments.forEach((el, i) => {
    gsap.fromTo(
      el,
      { rotation: -3 },
      {
        rotation: 3,
        duration: 2 + (i % 3) * 0.35,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * -0.6,
      }
    );
  });
}

/** Zoom the mobile into the tapped ornament. Resolves when done. */
export function zoomIntoOrnament(scene, ornament) {
  const x = ornament.style.getPropertyValue("--x");
  const y = ornament.style.getPropertyValue("--y");
  return gsap
    .timeline()
    .to(ornament, { scale: 1.15, duration: 0.15, ease: "power1.out" })
    .to(scene, { scale: 3, autoAlpha: 0, transformOrigin: `${x} ${y}`, duration: 0.6, ease: "power2.in" }, "<0.05")
    .then();
}

/** Put the mobile back to normal (after a zoom). */
export function resetScene(scene, ornaments) {
  gsap.set(scene, { scale: 1, autoAlpha: 1 });
  gsap.set(ornaments, { scale: 1 });
}

/**
 * Flip an ornament on the mobile from its "before" to its "after" art.
 * Called when the player comes back to the mobile after answering.
 */
export function flipOrnament(ornament) {
  const inner = ornament.querySelector(".ornament__inner");
  return gsap
    .timeline()
    .to(inner, { rotationY: 90, duration: 0.35, ease: "power2.in", delay: 0.25 })
    .add(() => ornament.classList.add("is-flipped"))
    .to(inner, { rotationY: 0, duration: 0.45, ease: "back.out(2)" })
    .fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }, "<")
    .then();
}

/** Show an already-flipped ornament with no animation (e.g. after reset). */
export function setOrnamentFlipped(ornament, flipped) {
  ornament.classList.toggle("is-flipped", flipped);
  gsap.set(ornament.querySelector(".ornament__inner"), { rotationY: 0, scale: 1 });
}

/* ---------------- question screen ---------------- */

/** Ornament + card animate in when a question opens. */
export function introQuestion(article) {
  const before = article.querySelector(".question__image--before");
  const card = article.querySelector(".card");
  gsap.fromTo(before, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.6)" });
  gsap.fromTo(card, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out", delay: 0.1 });
}

/** After answering: flip the big ornament from "before" to "after". */
export function flipQuestionImage(article) {
  const before = article.querySelector(".question__image--before");
  const after = article.querySelector(".question__image--after");
  return gsap
    .timeline()
    .to(before, { rotationY: 90, duration: 0.3, ease: "power2.in" })
    .set(before, { autoAlpha: 0 })
    .fromTo(after, { rotationY: -90, autoAlpha: 1 }, { rotationY: 0, duration: 0.45, ease: "back.out(1.8)" })
    .then();
}

/** Result area fades/slides in. */
export function revealResult(result) {
  gsap.fromTo(result, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" });
}

/** Reset a question's images back to the "before" state. */
export function resetQuestion(article) {
  gsap.set(article.querySelectorAll(".question__image"), { clearProps: "all" });
}

/* ---------------- progress / end ---------------- */

export function setProgress(fill, pct) {
  gsap.to(fill, { width: `${pct}%`, duration: 0.6, ease: "power2.out" });
}

export function introEnd(screen) {
  gsap.fromTo(
    screen.querySelector(".end-card"),
    { y: 60, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", delay: 0.15 }
  );
}

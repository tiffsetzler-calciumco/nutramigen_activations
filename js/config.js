/**
 * Timing settings. For quick testing you can override the idle timers
 * from the URL, in seconds:  /?warn=5&reset=5
 */
const params = new URLSearchParams(window.location.search);
const seconds = (key, fallback) => {
  const n = Number(params.get(key));
  return Number.isFinite(n) && n > 0 ? n * 1000 : fallback;
};

export const CONFIG = {
  /** No interaction for this long → show the "still playing?" popup. */
  idleWarnMs: seconds("warn", 45_000),
  /** Popup ignored for this long → go back to the start screen and reset. */
  idleResetMs: seconds("reset", 30_000),
  /** Length of the zoom-in animation when an item is selected. */
  zoomMs: 650,
};

/**
 * Inactivity watcher.
 *  - After `warnMs` with no interaction, calls onWarn() (show the popup).
 *  - If the popup is then ignored for `resetMs`, calls onReset() (go home).
 *  - While the popup is open, other taps don't count — only confirm() dismisses it.
 */
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"];

export function createIdleWatcher({ warnMs, resetMs, onWarn, onReset, onTick }) {
  let warnTimer = null;
  let resetTimer = null;
  let tickTimer = null;
  let enabled = false;
  let warning = false;

  const clearAll = () => {
    clearTimeout(warnTimer);
    clearTimeout(resetTimer);
    clearInterval(tickTimer);
  };

  const startWarnTimer = () => {
    clearAll();
    if (!enabled) return;
    warnTimer = setTimeout(showWarning, warnMs);
  };

  const showWarning = () => {
    warning = true;
    onWarn();
    const deadline = Date.now() + resetMs;
    onTick?.(Math.ceil(resetMs / 1000));
    tickTimer = setInterval(() => {
      onTick?.(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 250);
    resetTimer = setTimeout(() => {
      warning = false;
      clearAll();
      onReset();
    }, resetMs);
  };

  const onActivity = () => {
    if (enabled && !warning) startWarnTimer();
  };

  ACTIVITY_EVENTS.forEach((evt) =>
    window.addEventListener(evt, onActivity, { passive: true, capture: true })
  );

  return {
    /** Turn watching on/off (off on the untouched homepage). */
    setEnabled(value) {
      if (enabled === value) return;
      enabled = value;
      if (enabled) startWarnTimer();
      else {
        warning = false;
        clearAll();
      }
    },
    /** Player tapped "still playing". */
    confirm() {
      warning = false;
      startWarnTimer();
    },
  };
}

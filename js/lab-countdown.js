
/**
 * Author: Leslie Brockman | Leslie's Designs | 2026
 * Description: Countdown timer functionality for the lab page.
 */
(() => {
  "use strict";

  const root = document.querySelector(".countdown-page");
  if (!root) return;
  const input = root.querySelector("#duration");
  const display = root.querySelector("#countdown-display");
  const status = root.querySelector("#timer-status");
  const buttons = Object.fromEntries(
    ["start", "pause", "resume", "reset"].map((name) => [name, root.querySelector(`#${name}`)])
  );
  const state = { mode: "idle", duration: 60, remaining: 60000, deadline: 0, interval: null };

  function clearTicker() {
    if (state.interval !== null) window.clearInterval(state.interval);
    state.interval = null;
  }

  function render() {
    const seconds = Math.max(0, Math.ceil(state.remaining / 1000));
    display.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    input.disabled = state.mode === "running" || state.mode === "paused";
    buttons.start.disabled = state.mode === "running" || state.mode === "paused";
    buttons.pause.disabled = state.mode !== "running";
    buttons.resume.disabled = state.mode !== "paused";
  }

  function selectDuration() {
    const seconds = input.valueAsNumber;
    if (!Number.isFinite(seconds) || !Number.isInteger(seconds) || seconds < 1 || seconds > 3600) {
      input.setAttribute("aria-invalid", "true");
      status.textContent = "Enter a whole number from 1 to 3600 seconds.";
      input.focus();
      return false;
    }
    input.removeAttribute("aria-invalid");
    state.duration = seconds;
    state.remaining = seconds * 1000;
    return true;
  }

  function tick() {
    state.remaining = Math.max(0, state.deadline - performance.now());
    if (state.remaining === 0) {
      clearTicker();
      state.mode = "completed";
      status.textContent = "Completed — time is up! Start again or reset the timer.";
    }
    render();
  }

  function run() {
    clearTicker();
    state.mode = "running";
    state.deadline = performance.now() + state.remaining;
    state.interval = window.setInterval(tick, 100);
    status.textContent = "Running — countdown in progress.";
    render();
  }

  buttons.start.addEventListener("click", () => {
    if (state.mode === "running" || state.mode === "paused") return;
    if (selectDuration()) run();
  });

  buttons.pause.addEventListener("click", () => {
    if (state.mode !== "running") return;
    tick();
    if (state.mode === "completed") return;
    clearTicker();
    state.mode = "paused";
    status.textContent = "Paused — remaining time is preserved. Resume to continue.";
    render();
  });

  buttons.resume.addEventListener("click", () => {
    if (state.mode === "paused") run();
  });

  buttons.reset.addEventListener("click", () => {
    clearTicker();
    state.mode = "idle";
    // A disabled input still retains the selected duration during a run.
    if (!selectDuration()) {
      state.remaining = state.duration * 1000;
      render();
      input.focus();
      return;
    }
    status.textContent = "Ready — timer reset to the selected duration.";
    render();
  });

  input.addEventListener("change", () => {
    if (state.mode === "running" || state.mode === "paused") return;
    if (!selectDuration()) return;
    state.mode = "idle";
    status.textContent = "Ready — duration updated. Press Start to begin.";
    render();
  });

  window.addEventListener("pagehide", clearTicker);
  window.addEventListener("pageshow", () => {
    if (state.mode === "running") {
      clearTicker();
      tick();
      if (state.mode === "running") state.interval = window.setInterval(tick, 100);
    }
  });
  render();
  Object.values(buttons).forEach((button) => { button.hidden = false; });
  input.disabled = false;
  status.textContent = "Ready — choose a duration and press Start.";
})();

/**
 * Author: Leslie Brockman | Leslie's Designs | 2026
 * Description: Adapted from Leslie Brockman's read-only slingshot reference; no runtime dependency.
 */
(() => {
  "use strict";
  const root = document.querySelector(".arcade-page");
  if (!root) return;
  const get = (id) => root.querySelector(`#${id}`);
  const stage = get("arcade-stage"), lane = get("arcade-lane"), zone = get("arcade-zone");
  const sling = get("arcade-sling"), projectile = get("arcade-projectile");
  const launch = get("arcade-launch"), resetButton = get("arcade-reset");
  const stationary = get("arcade-stationary"), score = get("arcade-score"), status = get("arcade-status");
  const dialog = get("arcade-dialog"), message = get("arcade-message"), back = get("arcade-back");
  if (typeof dialog.showModal !== "function") {
    status.textContent = "This experiment needs a browser supporting dialog windows.";
    return;
  }
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const messages = ["Love looks good on you!", "Peace begins with a little kindness.", "Keep calm and code on!"];
  const targets = Array.from(root.querySelectorAll(".arcade-target")).map((element, index) => ({
    element, stand: element.querySelector(".arcade-target__stand"), x: index * 144, collected: false, message: messages[index]
  }));
  let frame = null, previous = null, phase = "idle", loaded = false;
  let heldPointer = null, heldKey = null, shot = null, current = null;
  const active = () => targets.filter((target) => !target.collected);
  const still = () => stationary.checked || motion.matches;

  function clearHold() {
    loaded = false;
    heldPointer = null;
    heldKey = null;
    stage.classList.remove("is-loaded");
  }
  function cancelFrame() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    previous = null;
  }
  function paint() {
    stage.classList.toggle("is-stationary", still());
    targets.forEach((target) => {
      target.element.hidden = target.collected;
      target.element.style.transform = still() ? "" : `translateX(${target.x}px)`;
      target.element.disabled = !still() || phase !== "idle" || target.collected;
    });
    launch.disabled = still() || phase !== "idle" || !active().length;
    score.textContent = `${targets.filter((target) => target.collected).length} / 3 targets`;
  }
  function schedule() {
    if (frame === null && !document.hidden && !still() && (phase === "idle" || phase === "flying")) {
      frame = window.requestAnimationFrame(tick);
    }
  }
  function overlaps(a, b) {
    return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
  }
  function moveTargets(dt) {
    const lineup = active();
    lineup.forEach((target) => { target.x -= dt * 0.075; });
    [...lineup].sort((a, b) => a.x - b.x).forEach((target) => {
      if (target.x + target.element.offsetWidth < 0) {
        const tail = Math.max(lane.clientWidth, ...lineup.filter((other) => other !== target).map((other) => other.x + other.element.offsetWidth));
        target.x = tail + 32;
      }
    });
  }
  function hit(target) {
    if (target.collected || (phase !== "idle" && phase !== "flying")) return;
    clearHold();
    cancelFrame();
    shot = null;
    projectile.hidden = true;
    current = target;
    phase = "popup";
    target.element.classList.add("is-hit");
    message.textContent = target.message;
    status.textContent = "Target hit! A message is open.";
    paint();
    dialog.showModal();
    back.focus();
  }
  function tick(now) {
    frame = null;
    const dt = previous === null ? 0 : Math.min(now - previous, 50);
    previous = now;
    moveTargets(dt);
    paint();
    if (phase === "flying") {
      shot.elapsed += dt;
      const progress = Math.min(shot.elapsed / 380, 1);
      const area = stage.getBoundingClientRect(), start = sling.getBoundingClientRect(), end = zone.getBoundingClientRect();
      const sx = start.left + start.width / 2 - area.left, sy = start.top - area.top + 28;
      const ex = end.left + end.width / 2 - area.left, ey = end.top + end.height / 2 - area.top;
      projectile.style.transform = `translate(${sx + (ex - sx) * progress - 7}px, ${sy + (ey - sy) * progress - 7}px)`;
      if (progress === 1) {
        const candidates = active().filter((target) => overlaps(target.stand.getBoundingClientRect(), end));
        candidates.sort((a, b) => Math.abs(a.stand.getBoundingClientRect().left + a.stand.offsetWidth / 2 - (end.left + end.width / 2)) - Math.abs(b.stand.getBoundingClientRect().left + b.stand.offsetWidth / 2 - (end.left + end.width / 2)));
        if (candidates.length) hit(candidates[0]);
        else {
          phase = "idle";
          shot = null;
          projectile.hidden = true;
          status.textContent = "Miss — try again when a target stand approaches the gold hit zone.";
        }
      }
    }
    paint();
    schedule();
  }
  function load() {
    if (phase !== "idle" || still() || loaded || !active().length) return false;
    loaded = true;
    stage.classList.add("is-loaded");
    status.textContent = "Loaded — release to launch.";
    return true;
  }
  function fire() {
    if (!loaded || phase !== "idle") return;
    clearHold();
    phase = "flying";
    shot = { elapsed: 0 };
    projectile.hidden = false;
    status.textContent = "Released — projectile in flight.";
    paint();
    schedule();
  }
  function closeMessage() {
    if (phase !== "popup" || !current) return;
    current.collected = true;
    current.element.classList.remove("is-hit");
    current = null;
    dialog.close();
    phase = active().length ? "idle" : "complete";
    status.textContent = phase === "complete" ? "Complete! You hit all three targets. Reset to play again." : "Keep going — choose or launch at another target.";
    paint();
    if (phase === "complete") resetButton.focus();
    else if (still()) active()[0].element.focus();
    else launch.focus();
    previous = null;
    schedule();
  }
  function reset() {
    cancelFrame();
    clearHold();
    phase = "idle";
    current = null;
    shot = null;
    projectile.hidden = true;
    if (dialog.open) dialog.close();
    targets.forEach((target, index) => {
      target.collected = false;
      target.x = index * 144;
      target.element.classList.remove("is-hit");
    });
    status.textContent = still() ? "Stationary mode — select any target to reveal its message." : "Hold and release Launch when a moving stand approaches the gold hit zone.";
    paint();
    schedule();
  }
  function changeMode() {
    clearHold();
    cancelFrame();
    shot = null;
    projectile.hidden = true;
    if (phase === "flying") phase = "idle";
    paint();
    if (phase === "idle") status.textContent = still() ? "Stationary mode — select any target." : "Hold and release Launch as a stand approaches the hit zone.";
    schedule();
  }
  targets.forEach((target) => target.element.addEventListener("click", () => {
    if (still() && phase === "idle") hit(target);
  }));
  launch.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || heldKey !== null || heldPointer !== null) return;
    event.preventDefault();
    if (load()) {
      launch.focus();
      heldPointer = event.pointerId;
      launch.setPointerCapture(event.pointerId);
    }
  });
  launch.addEventListener("pointerup", (event) => {
    if (heldPointer === event.pointerId) { event.preventDefault(); fire(); }
  });
  launch.addEventListener("pointercancel", clearHold);
  launch.addEventListener("lostpointercapture", () => { if (loaded) clearHold(); });
  launch.addEventListener("keydown", (event) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (!event.repeat && heldPointer === null && heldKey === null && load()) heldKey = event.key;
  });
  launch.addEventListener("keyup", (event) => {
    if (event.key === heldKey) { event.preventDefault(); fire(); }
  });
  launch.addEventListener("blur", clearHold);
  back.addEventListener("click", closeMessage);
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeMessage(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Tab") { event.preventDefault(); back.focus(); }
  });
  resetButton.addEventListener("click", reset);
  stationary.addEventListener("change", changeMode);
  motion.addEventListener("change", () => {
    stationary.checked = motion.matches;
    stationary.disabled = motion.matches;
    changeMode();
  });
  document.addEventListener("visibilitychange", () => { clearHold(); cancelFrame(); schedule(); });
  window.addEventListener("blur", clearHold);
  window.addEventListener("pagehide", () => { clearHold(); cancelFrame(); });
  window.addEventListener("pageshow", () => { previous = null; schedule(); });
  stationary.checked = motion.matches;
  stationary.disabled = motion.matches;
  resetButton.disabled = false;
  reset();
})();

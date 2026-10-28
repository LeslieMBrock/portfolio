/**
 * Author: Leslie Brockman | Leslie's Designs | 2026
 * Description: Independent adaptation of Leslie Brockman's Color Garden painting mechanics.
 */
(() => {
  "use strict";
  const root = document.querySelector(".garden-page");
  if (!root) return;
  const canvas = root.querySelector("#garden-canvas");
  const ctx = canvas.getContext("2d");
  const status = root.querySelector("#garden-status");
  if (!ctx) { status.textContent = "Your browser could not initialize the painting canvas."; return; }
  const colors = {
    pink: ["Electric Pink", "#FF39C6"],
    green: ["Neon Green", "#39FF14"],
    blue: ["Cyber Blue", "#00CFFF"],
    yellow: ["Laser Yellow", "#F9FF33"],
    violet: ["Neon Violet", "#B44CFF"]
  };
  const palette = Array.from(root.querySelectorAll(".garden-color"));
  const clear = root.querySelector("#garden-clear"), reset = root.querySelector("#garden-reset");
  const marker = root.querySelector("#garden-cursor"), coordinates = root.querySelector("#garden-position");
  let paintColor = "pink", pointer = null, previous = null;
  let keyboardPosition = { x: 450, y: 250 };

  function selectPaint(color) {
    if (!Object.hasOwn(colors, color)) return;
    paintColor = color;
    palette.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.paint === color)));
    status.textContent = `${colors[color][0]} selected. Click or drag to paint; use arrow keys and Space on the canvas for keyboard painting.`;
  }
  // Preserve the fixed drawing buffer so CSS resizing does not erase the artwork.
  function position(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) * canvas.width / rect.width)),
      y: Math.max(0, Math.min(canvas.height, (event.clientY - rect.top) * canvas.height / rect.height))
    };
  }
  function draw(from, to) {
    const width = 18 * canvas.width / (canvas.getBoundingClientRect().width || canvas.width);
    ctx.fillStyle = ctx.strokeStyle = colors[paintColor][1];
    ctx.lineWidth = width;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.shadowColor = colors[paintColor][1];
    ctx.shadowBlur = Math.min(width * 0.25, 8);
    ctx.beginPath();
    if (!from) {
      ctx.arc(to.x, to.y, width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
  }
  function stopPainting(event) {
    if (event && event.pointerId !== pointer) return;
    const captured = pointer;
    pointer = null;
    previous = null;
    if (captured !== null && canvas.hasPointerCapture(captured)) canvas.releasePointerCapture(captured);
  }
  function updateCursor() {
    marker.style.left = `${keyboardPosition.x / canvas.width * 100}%`;
    marker.style.top = `${keyboardPosition.y / canvas.height * 100}%`;
    coordinates.textContent = `Keyboard position: ${keyboardPosition.x}, ${keyboardPosition.y} on a 900 × 500 canvas.`;
  }
  function clearCanvas() {
    stopPainting();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    status.textContent = "Painting cleared. Your selected color is unchanged.";
  }
  function resetGarden() {
    clearCanvas();
    keyboardPosition = { x: 450, y: 250 };
    updateCursor();
    selectPaint("pink");
    status.textContent = "Garden reset. Electric Pink selected; keyboard position centered.";
  }
  palette.forEach((button) => button.addEventListener("click", () => selectPaint(button.dataset.paint)));
  clear.addEventListener("click", clearCanvas);
  reset.addEventListener("click", resetGarden);
  canvas.addEventListener("pointerdown", (event) => {
    if (pointer !== null || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    canvas.focus();
    pointer = event.pointerId;
    canvas.setPointerCapture(pointer);
    previous = position(event);
    draw(null, previous);
    status.textContent = `Painting with ${colors[paintColor][0]}.`;
  });
  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointer) return;
    const next = position(event);
    draw(previous, next);
    previous = next;
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => canvas.addEventListener(type, stopPainting));
  canvas.addEventListener("keydown", (event) => {
    const moves = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, -15], ArrowDown: [0, 15] };
    if (event.key === " ") {
      event.preventDefault();
      draw(null, keyboardPosition);
      status.textContent = `${colors[paintColor][0]} dab placed at ${keyboardPosition.x}, ${keyboardPosition.y}.`;
      return;
    }
    if (!Object.hasOwn(moves, event.key)) return;
    event.preventDefault();
    const [x, y] = moves[event.key];
    keyboardPosition = {
      x: Math.max(0, Math.min(canvas.width, keyboardPosition.x + x)),
      y: Math.max(0, Math.min(canvas.height, keyboardPosition.y + y))
    };
    updateCursor();
  });
  canvas.addEventListener("blur", () => stopPainting());
  window.addEventListener("blur", () => stopPainting());
  window.addEventListener("pagehide", () => stopPainting());
  palette.forEach((button) => { button.disabled = false; });
  clear.disabled = reset.disabled = false;
  resetGarden();
})();

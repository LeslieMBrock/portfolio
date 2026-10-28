
/**
 * Author: Leslie Brockman | Leslie's Designs | 2026
 * Description: Matrix rain animation for the main page.
 */
"use strict";
(() => {
  const canvas = document.querySelector(".matrix-rain");
  const context = canvas?.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!canvas || !context || reducedMotion.matches) return;

  const glyphs = "0123456789ABCDEF";
  let columns = [];
  let columnWidth = 24;
  let rowHeight = 18;
  let frameId = 0;
  let lastPaint = 0;

  function resizeCanvas() {
    const compact = window.innerWidth < 680;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.35);
    const width = window.innerWidth;
    const height = window.innerHeight;
    columnWidth = compact ? 20 : 25;
    rowHeight = compact ? 18 : 20;

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.font = `${rowHeight}px monospace`;
    columns = Array.from(
      { length: Math.ceil(width / columnWidth) },
      () => Math.random() * (height / rowHeight)
    );
  }

  function paint(timestamp) {
    frameId = 0;
    if (document.hidden) return;

    const compact = window.innerWidth < 680;
    const interval = compact ? 72 : 42;
    if (timestamp - lastPaint < interval) {
      frameId = window.requestAnimationFrame(paint);
      return;
    }
    lastPaint = timestamp;

    context.fillStyle = "rgba(5, 9, 7, 0.12)";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = "#51f47e";

    columns.forEach((position, index) => {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = index * columnWidth;
      const y = position * rowHeight;
      context.fillText(glyph, x, y);

      if (y > window.innerHeight && Math.random() > 0.975) {
        columns[index] = 0;
      } else {
        columns[index] += compact ? 0.72 : 0.9;
      }
    });

    frameId = window.requestAnimationFrame(paint);
  }

  function stop() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function start() {
    if (!document.hidden && !frameId) {
      lastPaint = 0;
      frameId = window.requestAnimationFrame(paint);
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
  start();
})();

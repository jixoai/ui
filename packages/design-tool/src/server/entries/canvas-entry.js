/**
 * @jixoai/ui-design (server entries) — the canvas surface entry.
 *
 * Orthogonal intent (1): mount design/prototypes/<name>/canvas.svelte
 * for the /prototypes/<name>/ HTML shell the design server serves.
 * The prototype name comes from THIS document's pathname (one shared
 * entry file — no per-name codegen); the canvas module is looked up in
 * the root-relative convention glob. A miss renders the loud error
 * page naming the prototype and the registered canvases.
 *
 * STUDIO MODE (#24, 2026-09-12): ?studio=1 marks the design studio's
 * embed. The entry then (a) sets window.__jixoaiDesignStudio so the
 * kit renders the matrix at NATURAL size (context.isStudioHost), and
 * (b) drives the embed's channel pair —
 *   metrics report: natural scrollWidth/scrollHeight to the parent
 *     (max-content layout is container-independent, so the number is
 *     a fixed point — the parent sizes its sheet exactly); re-posts on
 *     content growth (ResizeObserver + load), so adaptive component
 *     frames and late HMR reflows stay honest.
 *   ⌘wheel relay: ctrl/meta wheel over this document zooms the STAGE
 *     (preventDefault here — the studio applies cursor-anchored zoom);
 *     frame documents relay their own ctrl/wheel up as
 *     jx-design:frame-wheel and this entry adds the child iframe's
 *     offset before forwarding — zoom works anywhere the design is
 *     (the iframe is an event black hole; postMessage is the only
 *     road out). Plain wheel keeps native scroll semantics untouched.
 *
 * Original need: Owner 2026-09-11 (design-studio T3); studio mode
 * 2026-09-12 (r3 polish #24). Browser code — plain JS served through
 * the design server's vite pipeline.
 */

import { mount } from 'svelte';
import 'virtual:jixoai-design/css';
import 'virtual:jixoai-icons.css';
import { initDesignPicker } from './picker.js';

const canvases = import.meta.glob('/design/prototypes/*/canvas.svelte');

function loudError(title, detail) {
  document.title = 'canvas error — jixoai design';
  document.body.innerHTML = [
    `<div style="font-family:monospace;padding:2rem;min-height:100vh;box-sizing:border-box;background:#1a0d0d;color:#ffb4b4">`,
    `  <h1 style="font-size:1rem;letter-spacing:.15em;text-transform:uppercase;margin:0 0 1rem">canvas miss — jixoai design studio</h1>`,
    `  <p style="font-size:1.05rem;margin:0 0 1rem"><strong>${title}</strong></p>`,
    `  <pre style="white-space:pre-wrap;word-break:break-word;margin:0;font-size:.85rem;line-height:1.6;opacity:.9">${detail}</pre>`,
    `</div>`,
  ].join('\n');
}

const match = /^\/prototypes\/([^/]+)\/?$/.exec(window.location.pathname);
const name = match === null ? null : match[1];
const key = name === null ? null : `/design/prototypes/${name}/canvas.svelte`;
const loader = key === null ? undefined : canvases[key];

// the canvas document's own stamps (kit usages) are pickable too —
// the same activation law as frames (r2 T4; lazy per-click studio
// walk as of r3 T6)
initDesignPicker();

/* ── studio mode (#24) ─────────────────────────────────────────────── */

const studio = new URLSearchParams(window.location.search).has('studio');

if (studio && window.parent !== window) {
  window.__jixoaiDesignStudio = true;
  // the sheet's breathing room: the matrix floats on the workspace
  // with its own margin — the studio's blueprint grid reads around it
  document.documentElement.classList.add('jx-studio-canvas');
  document.body.style.boxSizing = 'border-box';
  document.body.style.width = 'max-content';
  document.body.style.minWidth = '100%';
  document.body.style.padding = '24px';

  const post = (payload) => window.parent.postMessage(payload, window.location.origin);

  // metrics report: natural size, container-independent by design
  let metricsScheduled = false;
  function reportMetrics() {
    if (metricsScheduled) return;
    metricsScheduled = true;
    requestAnimationFrame(() => {
      metricsScheduled = false;
      post({
        type: 'jx-design:canvas-metrics',
        width: Math.ceil(document.documentElement.scrollWidth),
        height: Math.ceil(document.documentElement.scrollHeight),
      });
    });
  }

  // growth honesty: adaptive component frames and late HMR reflows
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => reportMetrics());
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);
  }
  window.addEventListener('load', () => reportMetrics());
  document.addEventListener('readystatechange', () => reportMetrics());
  reportMetrics();

  // ⌘wheel over THIS document zooms the stage (cursor-anchored in
  // canvas-doc coords — the studio's lens maps them: screen = t + z·c)
  window.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      post({
        type: 'jx-design:wheel-zoom',
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
        x: event.clientX,
        y: event.clientY,
      });
    },
    { passive: false },
  );

  // frame-wheel forwarding: a frame document's relayed ctrl/wheel
  // arrives in FRAME-doc coords; add the child iframe's offset within
  // THIS document, then forward (still canvas-doc coords)
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data === null || typeof data !== 'object' || data.type !== 'jx-design:frame-wheel') return;
    if (event.source === null || event.source === window) return;
    const frame = Array.from(document.querySelectorAll('iframe')).find(
      (el) => el.contentWindow === event.source,
    );
    if (frame === undefined) return;
    const rect = frame.getBoundingClientRect();
    post({
      type: 'jx-design:wheel-zoom',
      deltaY: data.deltaY,
      deltaMode: data.deltaMode,
      x: data.clientX + rect.left,
      y: data.clientY + rect.top,
    });
  });
}

if (loader === undefined) {
  const keys = Object.keys(canvases);
  loudError(
    name === null ? `not a canvas URL: ${window.location.pathname}` : `no canvas for prototype "${name}"`,
    `canvas URL form: /prototypes/<name>/ — the file design/prototypes/<name>/canvas.svelte must exist.\nregistered canvases (${keys.length}):\n${
      keys.length > 0 ? keys.map((k) => `  ${k}`).join('\n') : '  (none — scaffold a prototype first)'
    }`,
  );
} else {
  loader()
    .then((mod) => {
      mount(mod.default, { target: document.getElementById('canvas-root') });
    })
    .catch((err) => {
      loudError(`canvas load failed: ${key}`, err && err.stack ? err.stack : String(err));
    });
}

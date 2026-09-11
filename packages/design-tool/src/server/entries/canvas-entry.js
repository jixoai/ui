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
 * Original need: Owner 2026-09-11 (design-studio T3). Browser code —
 * plain JS served through the design server's vite pipeline.
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

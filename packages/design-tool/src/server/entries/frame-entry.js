/**
 * @jixoai/ui-design (server entries) — the frame surface entry.
 *
 * Orthogonal intent (1): mount ONE ref'd file by ?p=&f= lookup against
 * the server-side convention globs (root-relative literals — vite
 * resolves them against the HOST root regardless of this file's
 * location; design-studio design.md §2 r2 ruling). A miss renders the
 * LOUD error page (named ref + registered keys) — HTTP 200 with a
 * visible DOM error, never a dead white iframe.
 *
 * Original need: Owner 2026-09-11 (design-studio T3). This file is
 * BROWSER code served through the design server's vite pipeline —
 * plain JS, no build step of its own.
 */

import { mount } from 'svelte';
import 'virtual:jixoai-design/css';
import 'virtual:jixoai-icons.css';
import { initDesignPicker } from './picker.js';

const pages = import.meta.glob('/design/prototypes/*/pages/*.svelte');
const components = import.meta.glob('/design/prototypes/*/components/*.svelte');
const registered = { ...pages, ...components };

function loudError(title, detail) {
  document.title = 'frame error — jixoai design';
  document.body.innerHTML = [
    `<div style="font-family:monospace;padding:2rem;min-height:100vh;box-sizing:border-box;background:#1a0d0d;color:#ffb4b4">`,
    `  <h1 style="font-size:1rem;letter-spacing:.15em;text-transform:uppercase;margin:0 0 1rem">frame miss — jixoai design studio</h1>`,
    `  <p style="font-size:1.05rem;margin:0 0 1rem"><strong>${title}</strong></p>`,
    `  <pre style="white-space:pre-wrap;word-break:break-word;margin:0;font-size:.85rem;line-height:1.6;opacity:.9">${detail}</pre>`,
    `</div>`,
  ].join('\n');
}

const params = new URLSearchParams(window.location.search);
const proto = params.get('p') ?? '';
const ref = (params.get('f') ?? '').replace(/^\.\//, '');
const key = `/design/prototypes/${proto}/${ref}`;

// theme lands on THIS document's root (iframe isolation is the point:
// one canvas can show light and dark twins side by side)
const theme = params.get('theme');
if (theme === 'dark' || theme === 'light') document.documentElement.classList.add(theme);

// viewport hints for direct URL use (kit frames size their own iframes)
const w = params.get('w');
const h = params.get('h');
if (w) document.documentElement.style.width = `${w}px`;
if (h) document.documentElement.style.height = `${h}px`;

// the selection loop's frame half (r2 T4; lazy activation r3 T6):
// picks activate when embedded in the studio — confirmed per click by
// the parent-chain walk, so a load racing the studio seam (HMR) still
// heals — or forced with &pick=1; standalone frames stay plain
// documents (unstamped AND stamped clicks pass through untouched)
initDesignPicker();

// the ⌘wheel relay (#24, 2026-09-12): ctrl/meta wheel over the frame
// zooms the STAGE, not this document. The frame is an event black
// hole to the studio — postMessage to the parent (the canvas doc adds
// this iframe's offset and forwards; the studio applies the cursor-
// anchored zoom through its lens). Plain wheel keeps native scroll.
// Embedded only: standalone frame URLs have no parent to serve.
if (window.parent !== window) {
  window.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      window.parent.postMessage(
        {
          type: 'jx-design:frame-wheel',
          deltaY: event.deltaY,
          deltaMode: event.deltaMode,
          clientX: event.clientX,
          clientY: event.clientY,
        },
        window.location.origin,
      );
    },
    { passive: false },
  );
}

if (proto === '' || ref === '') {
  loudError(
    'missing ?p= / ?f= query parameters',
    `the frame surface mounts one ref'd file:\n  /__design__/frame?p=<prototype>&f=<file>&theme=light|dark|auto&w=<px>&h=<px>\nreceived: p=${JSON.stringify(proto)} f=${JSON.stringify(ref)}`,
  );
} else {
  const loader = registered[key];
  if (loader === undefined) {
    const keys = Object.keys(registered);
    loudError(
      `no such frame ref: ${key}`,
      `registered refs (${keys.length}):\n${keys.length > 0 ? keys.map((k) => `  ${k}`).join('\n') : '  (none — scaffold a prototype or write pages/*.svelte under design/prototypes/<name>/)'}`,
    );
  } else {
    loader()
      .then((mod) => {
        mount(mod.default, { target: document.getElementById('frame-root') });
      })
      .catch((err) => {
        loudError(`frame load failed: ${key}`, err && err.stack ? err.stack : String(err));
      });
  }
}

/**
 * jixoai inline icon set (registry/files/lib/icons.ts, 2026-08-20).
 *
 * Original request: “把 → ▾ × ↗ ✓ 文本符号替换为内联 SVG 图标” — one
 * shared module so every component renders the SAME geometry instead of
 * private glyphs. SVG strings (not a component, not Snippets): consumers
 * print them with {@html icons.x} and own layout/sizing via CSS.
 *
 * Law:
 * - 16px square, stroke currentColor, fill none, round caps/joins —
 *   the site's lucide-style stroke geometry (compare language-switcher
 *   and hero-section inline SVGs).
 * - aria-hidden="true" baked in: these are ALWAYS decorative; meaning
 *   lives in the surrounding text or the control's aria-label.
 * - class="jx-icon" for consumer CSS targeting (`.foo svg` also works).
 * - Sizing: consumers override width/height through CSS when a row is
 *   tighter than 16px (tags chip ×, tree caret) — never by editing here.
 */

/** shared opening tag — every icon below only differs in its paths */
const svg = (paths: string): string =>
  `<svg class="jx-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const arrowRight = svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>');
export const chevronDown = svg('<path d="m6 9 6 6 6-6"/>');
export const x = svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
export const externalLink = svg(
  '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
);
export const check = svg('<path d="M20 6 9 17l-5-5"/>');

/** named-access bag for {@html icons.<name>} consumption */
export const icons = { arrowRight, chevronDown, x, externalLink, check };

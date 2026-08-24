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
 * - data-jx-icon for consumer targeting (`.foo svg` also works).
 * - Sizing: consumers override width/height through CSS when a row is
 *   tighter than 16px (tags chip ×, tree caret) — never by editing here.
 */

/** shared opening tag — every icon below only differs in its paths */
const svg = (paths: string): string =>
  `<svg data-jx-icon viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const arrowRight = svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>');
export const chevronDown = svg('<path d="m6 9 6 6 6-6"/>');
export const x = svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
export const externalLink = svg(
  '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
);
export const check = svg('<path d="M20 6 9 17l-5-5"/>');

// tree-view extension set (2026-08-22, lucide 0.472 geometry): prefix
// icons, the plus/minus toggler variant and suffix action glyphs.
export const folder = svg(
  '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>'
);
export const folderOpen = svg(
  '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>'
);
export const file = svg(
  '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>'
);
export const fileCode = svg(
  '<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m5 12-3 3 3 3"/><path d="m9 18 3-3-3-3"/>'
);
export const fileText = svg(
  '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'
);
export const braces = svg(
  '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>'
);
export const palette = svg(
  '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>'
);
export const plus = svg('<path d="M5 12h14"/><path d="M12 5v14"/>');
export const minus = svg('<path d="M5 12h14"/>');
export const ellipsis = svg(
  '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'
);

// jx-pure Part A mirror set (2026-08-23, lucide 0.472 geometry): the glyphs
// the Tier-1 form sheet paints into UA pseudos via CSS mask. The path
// data below and the data-URIs in registry/files/theme/jx-pure.css (Part A)
// are the SAME geometry — edit both or neither (single-source law).
export const calendar = svg(
  '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>'
);
export const clock = svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>');
export const pipette = svg(
  '<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>'
);

/** named-access bag for {@html icons.<name>} consumption */
export const icons = {
  arrowRight,
  chevronDown,
  x,
  externalLink,
  check,
  folder,
  folderOpen,
  file,
  fileCode,
  fileText,
  braces,
  palette,
  plus,
  minus,
  ellipsis,
  calendar,
  clock,
  pipette,
};

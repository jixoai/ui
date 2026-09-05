#!/usr/bin/env node
/**
 * Icon set generator (scripts/gen-icons.mjs, 2026-08-29).
 *
 * Intent list:
 * 1. single source — the manifest below maps every export of
 *    registry/files/lib/icons.ts to a lucide@^0.472.0 IconNode; bodies
 *    are serialized from the installed package, never hand-copied.
 * 2. library-identical — every body is lucide's canonical serialization;
 *    two hand-era over-long one-liners keep their formatting via the
 *    FORCE_ONE_LINE set (formatting only, never geometry).
 * 3. freshness gate — `--check` regenerates in memory and exits 1 when
 *    the committed file differs, so CI catches post-edit drift.
 *
 * Owner ruling (2026-08-29, icon migration): "icons.ts is generated from
 * the lucide package's IconNode data behind a manifest; stroke-width and
 * sizing variance is CONSUMER CSS (presentation attributes yield to the
 * cascade) — never fork manifest variants for it."
 *
 * Usage: node scripts/gen-icons.mjs          write the file
 *        node scripts/gen-icons.mjs --check  freshness gate (exit 1 stale)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = resolve(repoRoot, 'registry/files/lib/icons.ts');
const lucide = require('lucide');

// ── manifest ─────────────────────────────────────────────────────────
// Entry: [exportName, lucideExport] — geometry serialized from lucide's
// IconNode children (attrs in insertion order, self-closing, no separators).
// NO pinned bodies: the pre-migration hand copies had drifted from lucide
// 0.472.0's canonical data (arrowLeft/calendar child order; fileCode was
// redesigned upstream) — the zero-exemption ruling (2026-08-29) adopted
// the library bytes everywhere; the fileCode visual change is deliberate.
const GROUPS = [
  {
    comment: null,
    icons: [
      ['arrowRight', 'ArrowRight'],
      ['arrowLeft', 'ArrowLeft'],
      ['rotateCcw', 'RotateCcw'],
      ['copy', 'Copy'],
      ['chevronDown', 'ChevronDown'],
      ['chevronRight', 'ChevronRight'],
      ['x', 'X'],
      ['externalLink', 'ExternalLink'],
      ['check', 'Check'],
    ],
  },
  {
    comment:
      '// tree-view extension set (2026-08-22, lucide 0.472 geometry): prefix\n// icons, the plus/minus toggler variant and suffix action glyphs.',
    icons: [
      ['folder', 'Folder'],
      ['folderOpen', 'FolderOpen'],
      ['file', 'File'],
      ['fileCode', 'FileCode'],
      ['fileText', 'FileText'],
      ['braces', 'Braces'],
      ['palette', 'Palette'],
      ['plus', 'Plus'],
      ['minus', 'Minus'],
      ['ellipsis', 'Ellipsis'],
    ],
  },
  {
    comment:
      "// jx-pure Part A mirror set (2026-08-23, lucide 0.472 geometry): the glyphs\n// the Tier-1 form sheet paints into UA pseudos via CSS mask. The path\n// data below and the data-URIs in registry/files/theme/jx-pure.css (Part A)\n// are the SAME geometry — edit both or neither (single-source law).",
    icons: [
      ['calendar', 'Calendar'],
      ['clock', 'Clock'],
      ['pipette', 'Pipette'],
    ],
  },
  {
    comment:
      '// component-migration set (2026-08-29, lucide 0.472 geometry): the\n// glyphs the registry components\' hand inline SVGs retired in favor of\n// (theme-toggle sun/moon/monitor, language-switcher, image fallback,\n// file-input kinds + upload, date-picker nav).',
    icons: [
      ['sun', 'Sun'],
      ['moon', 'Moon'],
      ['monitor', 'Monitor'],
      ['languages', 'Languages'],
      ['image', 'Image'],
      ['fileVideo', 'FileVideo'],
      ['fileAudio', 'FileAudio'],
      ['upload', 'Upload'],
      ['chevronLeft', 'ChevronLeft'],
    ],
  },
  {
    comment:
      "// input password-reveal set (2026-08-30, expand-form-family): the\n// eye/eye-off pair the reveal toggle paints — eye while the value is\n// hidden, eyeOff while revealed.",
    icons: [
      ['eye', 'Eye'],
      ['eyeOff', 'EyeOff'],
    ],
  },
  {
    comment:
      '// search entry set (2026-09-02, r9 acceptance): the magnifier the\n// TerminalHeader trigger + the palette input carry (16px baked law;\n// sizing stays consumer CSS).',
    icons: [['search', 'Search']],
  },
  {
    comment:
      "// input semantic-glyph set (2026-09-05, Owner: url/phone etc.\n// default-support their glyph): link/phone/mail ride the Input\n// shell's semantic-icon lane — search reuses the r9 entry above.",
    icons: [
      ['link', 'Link'],
      ['phone', 'Phone'],
      ['mail', 'Mail'],
    ],
  },
];

// hand-era one-liners kept past the wrap threshold (byte-compat)
const FORCE_ONE_LINE = new Set(['rotateCcw', 'copy']);
// wrap exports whose single-line form exceeds this (prettier-style 100)
const WRAP_AT = 100;

/** serialize an IconNode's children: `<path d="…"/><path …/>` */
function bodyOf(lucideName, exportName) {
  const node = lucide[lucideName];
  if (!node) throw new Error(`lucide@${lucide.version ?? '?'} exports no "${lucideName}" (wanted by icons.${exportName})`);
  return (node[2] ?? [])
    .map(([tag, attrs]) =>
      `<${tag}${Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join('')}/>`)
    .join('');
}

function exportLine(name, body) {
  const one = `export const ${name} = svg('${body}');`;
  if (one.length <= WRAP_AT || FORCE_ONE_LINE.has(name)) return one;
  return `export const ${name} = svg(\n  '${body}'\n);`;
}

// ── emit ─────────────────────────────────────────────────────────────
const HEADER = `/**
 * jixoai inline icon set — GENERATED, do not hand-edit
 * (registry/files/lib/icons.ts).
 *
 * Source of truth: the manifest in scripts/gen-icons.mjs serializing
 * lucide@^0.472.0 IconNode geometry. Regenerate: npm run gen:icons
 * (freshness gate: npm run verify:icons).
 *
 * Original request (2026-08-20): “把 → ▾ × ↗ ✓ 文本符号替换为内联 SVG
 * 图标” — one shared module so every component renders the SAME geometry
 * instead of private glyphs. SVG strings (not a component, not Snippets):
 * consumers print them with {@html icons.x} and own layout/sizing via CSS.
 *
 * Law:
 * - 24×24 viewBox, 16px baked, stroke currentColor, fill none, round
 *   caps/joins — lucide's stroke geometry.
 * - aria-hidden="true" baked in: these are ALWAYS decorative; meaning
 *   lives in the surrounding text or the control's aria-label.
 * - data-jx-icon for consumer targeting (\`.foo svg\` also works).
 * - Sizing and stroke-width overrides are CONSUMER CSS (a class rule or
 *   a Tailwind arbitrary variant like [&_svg]:stroke-[2.5] —
 *   presentation attributes yield to the cascade); never fork manifest
 *   variants for them.
 */

/** shared opening tag — every icon below only differs in its paths */
const svg = (paths: string): string =>
  \`<svg data-jx-icon viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\${paths}</svg>\`;
`;

const names = [];
const blocks = [];
for (const group of GROUPS) {
  const lines = [];
  for (const [name, lucideName] of group.icons) {
    const body = bodyOf(lucideName, name);
    names.push(name);
    lines.push(exportLine(name, body));
  }
  blocks.push((group.comment ? `${group.comment}\n` : '') + lines.join('\n'));
}

const bag = [
  '/** named-access bag for {@html icons.<name>} consumption */',
  'export const icons = {',
  ...names.map((n) => `  ${n},`),
  '};',
].join('\n');

const output = `${HEADER}\n${blocks.join('\n\n')}\n\n${bag}\n`;

// ── modes ────────────────────────────────────────────────────────────
if (process.argv[2] === '--check') {
  const committed = readFileSync(outPath, 'utf8');
  if (committed !== output) {
    console.error(`stale: registry/files/lib/icons.ts differs from the generator output — run \`npm run gen:icons\``);
    process.exit(1);
  }
  console.log(`fresh: registry/files/lib/icons.ts matches the manifest (${names.length} icons)`);
} else {
  writeFileSync(outPath, output);
  console.log(`wrote registry/files/lib/icons.ts (${names.length} icons)`);
}

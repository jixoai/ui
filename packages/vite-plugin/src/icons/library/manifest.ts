/**
 * @jixoai/ui-vite-plugin (icons library) — the built-in manifest (A1,
 * openspec icon-component-pipeline design §1).
 *
 * The 38 built-ins migrate VERBATIM from the retired gen-icons generator's GROUPS
 * (2026-08-29 → this change): name → lucide export pairs, GROUPS order
 * frozen. No pinned geometry lives here — bodies serialize from the
 * lucide package at build time (single-source law; the svgo pass is
 * pinned a no-op on that canonical serialization). Custom icons in the
 * consumer config pack AFTER these, in config insertion order.
 */

/** lucide's export surface — the manifest is compile-time checked
 *  against it (a typo'd export fails HERE, not at build time) */
type LucideExportName = keyof typeof import('lucide');

/**
 * [libraryName, lucideExport] — GROUPS order from the retired gen-icons generator:
 * core arrows → tree-view set → jx-pure Part A mirror set →
 * component-migration set → password-reveal pair → search entry →
 * input semantic-glyph set → the text glyph.
 */
export const DEFAULT_LIBRARY_MANIFEST = [
  // group 1 — the core set (2026-08-29 icon migration)
  ['arrowRight', 'ArrowRight'],
  ['arrowLeft', 'ArrowLeft'],
  ['rotateCcw', 'RotateCcw'],
  ['copy', 'Copy'],
  ['chevronDown', 'ChevronDown'],
  ['chevronRight', 'ChevronRight'],
  ['x', 'X'],
  ['externalLink', 'ExternalLink'],
  ['check', 'Check'],
  // group 2 — tree-view extension set (2026-08-22)
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
  // group 3 — jx-pure Part A mirror set (2026-08-23)
  ['calendar', 'Calendar'],
  ['clock', 'Clock'],
  ['pipette', 'Pipette'],
  // group 4 — component-migration set (2026-08-29)
  ['sun', 'Sun'],
  ['moon', 'Moon'],
  ['monitor', 'Monitor'],
  ['languages', 'Languages'],
  ['image', 'Image'],
  ['fileVideo', 'FileVideo'],
  ['fileAudio', 'FileAudio'],
  ['upload', 'Upload'],
  ['chevronLeft', 'ChevronLeft'],
  // group 5 — input password-reveal set (2026-08-30)
  ['eye', 'Eye'],
  ['eyeOff', 'EyeOff'],
  // group 6 — search entry set (2026-09-02)
  ['search', 'Search'],
  // group 7 — input semantic-glyph set (2026-09-05)
  ['link', 'Link'],
  ['phone', 'Phone'],
  ['mail', 'Mail'],
  // group 8 — the text glyph (2026-09-05)
  ['type', 'Type'],
] as const satisfies readonly (readonly [string, LucideExportName])[];

/** every built-in name, in manifest order (the packing order) */
export const DEFAULT_LIBRARY_NAMES: readonly string[] =
  DEFAULT_LIBRARY_MANIFEST.map(([name]) => name);

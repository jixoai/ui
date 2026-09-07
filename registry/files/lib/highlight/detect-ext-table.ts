/**
 * DLD layer 1 — the filename table (lib/highlight/detect-ext-table.ts,
 * highlight-lang-detector, 2026-09-07).
 *
 * The cheapest layer: a lowercase-extension map plus a case-sensitive
 * exact-basename map, both DERIVED from lang-canonical.ts (the
 * derive-then-diff law — the data lives exactly once; this module adds
 * only the frozen filename boundary semantics of design D3.1):
 *
 *   - path separators `/` AND `\` both cut — the segment after the last
 *     one is the name;
 *   - the extension is the suffix after the LAST `.` of that name,
 *     lowercased (`.TS` → ts; `foo.d.ts` → ts — the final suffix wins);
 *   - a leading dot is NOT an extension (`.babelrc` is a dotFILE — it
 *     went through the basename map, and there is no second dot to cut);
 *   - the basename map is exact full-string equality, CASE-SENSITIVE
 *     (`Dockerfile` ≠ `dockerfile`, linguist filenames semantics;
 *     `Makefile.old` matches no `Makefile` entry);
 *   - basename answers first — a full-name hit is strictly more specific
 *     than any extension it could also carry.
 *
 * No trim, no fallback guesses: a miss is null and the waterfall falls
 * through to L2.
 */

import { getBasenameMap, getExtMap } from './lang-canonical';

/**
 * Layer 1 — answer from the filename alone, or null ("no opinion"; the
 * waterfall continues). The card's filename prop passes in verbatim,
 * path and all.
 */
export function detectByFilename(filename: string): string | null {
  // both separators cut — Windows-shaped paths answer like POSIX ones
  const cut = Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\'));
  const name = cut === -1 ? filename : filename.slice(cut + 1);
  if (name === '') return null;

  // the basename map: exact, case-sensitive, dotfiles included
  const byBasename = getBasenameMap().get(name);
  if (byBasename !== undefined) return byBasename;

  // the extension: the LAST dot's suffix, lowercased; a LEADING dot is
  // the dotfile form, not an extension (dot <= 0 covers both no-dot and
  // dotfile) — those already had their basename turn
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return null;
  const byExt = getExtMap().get(name.slice(dot + 1).toLowerCase());
  return byExt ?? null;
}

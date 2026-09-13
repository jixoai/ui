/**
 * @jixoai/ui-design (server) — the prototype manifest scanner (T3).
 *
 * Orthogonal intent (1): list design/prototypes/* as
 * { name, path, frames? } — frames are BEST-EFFORT regex extractions
 * of id=/ref= pairs from canvas.svelte (the kit's declarative tree);
 * absence is legal (design.md §2 contract) and never an error.
 *
 * Original need: Owner 2026-09-11 (design-studio T3,
 * /__design__/api/manifest.json).
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ManifestFrame {
  readonly id: string;
  readonly ref?: string;
}

export interface ManifestEntry {
  readonly name: string;
  /** the canvas page URL the preview grid iframes */
  readonly path: string;
  /** best-effort id/ref list from canvas.svelte (may be absent) */
  readonly frames?: readonly ManifestFrame[];
}

/** frame-ish tags in either prop-case spelling (kit API final form TBD — cover both) */
const FRAME_TAG = /<(?:prototypePage|prototypeComponent|PrototypePage|PrototypeComponent)\b[^>]*>/g;

function attrOf(tag: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)')`).exec(tag);
  if (match === null) return undefined;
  return match[2] ?? match[3] ?? '';
}

/** best-effort frame extraction from a canvas.svelte source; undefined when nothing parses */
function extractFrames(source: string): readonly ManifestFrame[] | undefined {
  const frames: ManifestFrame[] = [];
  for (const tag of source.match(FRAME_TAG) ?? []) {
    const id = attrOf(tag, 'id');
    if (id === undefined) continue; // id is the anchor contract — skip id-less tags
    const ref = attrOf(tag, 'ref');
    frames.push(ref === undefined ? { id } : { id, ref });
  }
  return frames.length > 0 ? frames : undefined;
}

/**
 * Scan <designDir>/prototypes. Directories WITHOUT canvas.svelte are
 * listed without frames (pages may still frame directly); an absent
 * prototypes/ dir yields an empty list — an empty studio is a legal
 * first-run state.
 */
export function scanPrototypes(designDir: string): readonly ManifestEntry[] {
  const prototypesDir = join(designDir, 'prototypes');
  if (!existsSync(prototypesDir)) return [];
  const entries: ManifestEntry[] = [];
  for (const entry of readdirSync(prototypesDir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.isDirectory()) continue;
    const canvasPath = join(prototypesDir, entry.name, 'canvas.svelte');
    const manifestEntry: ManifestEntry = { name: entry.name, path: `/prototypes/${entry.name}/` };
    if (existsSync(canvasPath)) {
      const frames = extractFrames(readFileSync(canvasPath, 'utf8'));
      if (frames !== undefined) manifestEntry.frames = frames;
    }
    entries.push(manifestEntry);
  }
  return entries;
}

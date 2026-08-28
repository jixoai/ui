/**
 * Geometry consistency gate (C4, ui-plugin-followup).
 *
 * Verifies that the same lucide icon geometry hasn't diverged across
 * the three sources: plugin providers, component lib, CSS data URIs.
 * Checks the SVG path `d` attribute values (the actual geometry).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = resolve(fileURLToPath(import.meta.url), '..');
const repoRoot = resolve(here, '../../..');

const pluginSrc = readFileSync(resolve(repoRoot, 'packages/ui-plugin/src/providers/lucide.ts'), 'utf8');
const iconsSrc = readFileSync(resolve(repoRoot, 'registry/files/lib/icons.ts'), 'utf8');
const cssSrc = readFileSync(resolve(repoRoot, 'registry/files/theme/jx-pure.css'), 'utf8');
const themeSrc = readFileSync(resolve(repoRoot, 'registry/files/theme/jixoai.css'), 'utf8');

/** all `d="..."` values in a source string, sorted */
const paths = (src: string): string[] =>
  (src.match(/\bd="([^"]+)"/g) ?? []).map((s) => s.replace(/^d="|"$/g, '')).sort();

/** the known lucide geometries — if these change in one source but not
 *  the others, the gate fails */
const KNOWN_GEOMETRIES: Readonly<Record<string, string>> = {
  chevron: 'm6 9 6 6 6-6',
  clear: 'M18 6 6 18',
  clock: '12 6 12 12 16 14',
} as const;

/** decode a CSS data URI to its SVG source */
function decodeDataURI(css: string, slot: string): string {
  const re = new RegExp(`--jx-icon-${slot}[^u]*url\("data:image\/svg\+xml,([^"]+)"\)`);
  const m = re.exec(css);
  return m ? decodeURIComponent(m[1]!) : '';
}

describe('geometry consistency gate (C4)', () => {
  it('CSS data URIs exist for the icon slots', () => {
    expect(cssSrc + themeSrc).toMatch(/--jx-icon-calendar|jx-icon-calendar/);
  });

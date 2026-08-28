/**
 * Geometry consistency gate (C4, ui-plugin-followup).
 *
 * Verifies that the same lucide icon geometry hasn't diverged across
 * the plugin provider and the component lib (icons.ts).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = resolve(fileURLToPath(import.meta.url), '..');
const repoRoot = resolve(here, '../../..');
const pluginSrc = readFileSync(resolve(repoRoot, 'packages/ui-plugin/src/providers/lucide.ts'), 'utf8');
const iconsSrc = readFileSync(resolve(repoRoot, 'registry/files/lib/icons.ts'), 'utf8');

describe('geometry consistency gate (C4)', () => {
  it('chevron path is consistent', () => {
    const chev = 'm6 9 6 6 6-6';
    expect(pluginSrc).toContain(chev);
    expect(iconsSrc).toContain(chev);
  });

  it('clear/× path is consistent', () => {
    expect(pluginSrc).toContain('M18 6 6 18');
    expect(iconsSrc).toContain('M18 6 6 18');
  });

  it('clock hands path is consistent', () => {
    const clock = '12 6 12 12 16 14';
    expect(pluginSrc).toContain(clock);
    expect(iconsSrc).toContain(clock);
  });

  it('calendar rect geometry exists in both', () => {
    const rect = 'rect x="3" y="4" width="18" height="18" rx="2"';
    expect(pluginSrc).toContain(rect);
    expect(iconsSrc).toContain(rect);
  });

  it('pipette path exists in both', () => {
    expect(pluginSrc).toContain('m2 22 1-1h3l9-9');
    expect(iconsSrc).toContain('m2 22 1-1h3l9-9');
  });

  it('mail envelope path exists in plugin', () => {
    expect(pluginSrc).toContain('rect width="20" height="16" x="2" y="4" rx="2"');
  });

  it('search magnifier path exists in plugin', () => {
    expect(pluginSrc).toContain('circle cx="11" cy="11" r="8"');
  });

  it('viewBox is 0 0 24 24 across sources', () => {
    expect(pluginSrc).toContain('viewBox="0 0 24 24"');
    expect(iconsSrc).toContain('viewBox="0 0 24 24"');
  });
});

/**
 * The props-table print-hook gates (paged-doc-family, 2026-08-30).
 *
 * The markup contract: PropsTable's wrapper layer FORCES the
 * `data-jx-props-table-scroll` attribute — the audited whitelist
 * entry that flattens the horizontal scrollport under print/sim.
 * The source guard enforces the other half: no page or component
 * hand-writes the attribute as a substitute (it is component-owned,
 * exactly one writer).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PropsTable from '$lib/ui/props-table/props-table.svelte';
import type { ComponentMeta } from '$lib/schema/ir';

const meta: ComponentMeta = {
  source: 'test/props-table-print-hook.spec.ts',
  props: {
    variant: { kind: 'enum', values: ['fill', 'outline'], default: 'outline' },
    loading: { kind: 'boolean', default: false },
  },
  hooks: [],
};

describe('PropsTable markup contract', () => {
  it('the wrapper layer outputs data-jx-props-table-scroll around the table', () => {
    const { container } = render(PropsTable, { meta });
    const wrapper = container.querySelector('[data-jx-props-table-scroll]');
    expect(wrapper).not.toBeNull();
    // it wraps the real table (the API-section marker stays inside)
    expect(wrapper?.querySelector('table[data-doc-props-table]')).not.toBeNull();
  });
});

describe('source guard (one writer, no hand-written substitutes)', () => {
  const SRC = resolve(__dirname, '../src');
  // the attribute may appear ONLY in these files: the owning
  // component, the audited whitelist sheet (kernel-print.css, the
  // print-pipeline migration), and the capability page — which is
  // the print law's LIVING FIXTURE (its probe strip rides the hook
  // against three utilities on purpose; a substitute would be a page
  // REPLACING the table with a hand-rolled scroll wrapper — not this)
  const ALLOWED = new Set([
    'lib/ui/props-table/props-table.svelte',
    'lib/print/kernel-print.css',
    'routes/docs/paged.html/+page.svelte',
  ]);

  function walk(dir: string, files: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full, files);
      else files.push(full);
    }
    return files;
  }

  it('data-jx-props-table-scroll is written only by the component + the whitelist', () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const rel = file.slice(SRC.length + 1);
      if (!/\.(svelte|ts|css|js)$/.test(rel)) continue;
      if (readFileSync(file, 'utf8').includes('data-jx-props-table-scroll')) {
        if (!ALLOWED.has(rel)) offenders.push(rel);
      }
    }
    expect(offenders).toEqual([]);
  });
});

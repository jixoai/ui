import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Table from '../src/lib/ui/table/table.svelte';
import Badge from '../src/lib/ui/badge/badge.svelte';
import Tabs from '../src/lib/ui/tabs/tabs.svelte';

const familyRoots = ['table', 'tabs', 'descriptions', 'statistic', 'badge', 'kbd', 'empty', 'result', 'timeline', 'steps'];

describe('density adoption packet E', () => {
  it('Table is a sm policy root and stamps both frame and table', () => {
    const { container } = render(Table, { props: { caption: 'items', children: (() => {}) as never } });
    expect(container.querySelector('[data-density="sm"]')).toBeTruthy();
    expect(container.querySelector('table[data-density="sm"]')).toBeTruthy();
  });

  it('status and tab roots stamp inherited-policy-ready density', () => {
    const badge = render(Badge, { props: { density: 'lg', children: (() => {}) as never } });
    expect(badge.container.querySelector('[data-jx-badge][data-density="lg"]')).toBeTruthy();
    const tabs = render(Tabs, { props: { density: 'xs', children: (() => {}) as never } });
    expect(tabs.container.querySelector('[data-jx-tabs][data-density="xs"]')).toBeTruthy();
  });

  it('every family source consumes the closed density aliases', () => {
    for (const family of familyRoots) {
      const source = resolve(process.cwd(), `../../registry/files/ui/${family}`);
      const files = readdirSync(source).filter((file) => file.endsWith('.svelte') || file.endsWith('.css')).map((file) => resolve(source, file));
      const text = files.map((file) => readFileSync(file, 'utf8')).join('\n');
      expect(text).toMatch(/--jx-(text|gap|inset|stack|hit|icon|image|line|leading|row|media|secondary)/);
    }
  });
});

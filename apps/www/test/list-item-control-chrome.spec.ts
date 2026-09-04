/**
 * Control integration (codex r1 B5, 2026-09-05) — the surface-owner
 * stamp: only a DECLARED frame owner dissolves in-row control shells.
 * ItemGroup: opt-in 'integrated' on default mode; muted (slab) and
 * plain (host-owned) force 'self' regardless of the declaration.
 * ItemField: the outline field row owns its frame — 'integrated' is
 * the default, 'self' opts out. The sheet keeps the state machine
 * legible on the dissolved root (source-pinned).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ControlChromeHost from './fixtures/control-chrome-host.svelte';

const chromeOf = (container: HTMLElement, groupLabel: string) =>
  [...container.querySelectorAll('[data-slot="item-group"]')]
    .find((g) => g.textContent.includes(groupLabel))!
    .getAttribute('data-control-chrome');

describe('list-item control integration stamps (B5)', () => {
  it('group: default is self, integrated is declared, muted/plain force self', () => {
    const { container } = render(ControlChromeHost);
    expect(chromeOf(container, 'g-default')).toBe('self');
    expect(chromeOf(container, 'g-integrated')).toBe('integrated');
    expect(chromeOf(container, 'g-muted')).toBe('self');
    expect(chromeOf(container, 'g-plain')).toBe('self');
  });

  it('field rows: integrated by default (the outline row owns the frame), self opts out', () => {
    const { container } = render(ControlChromeHost);
    const fields = [...container.querySelectorAll('[data-item-field]')];
    expect(fields.map((f) => f.getAttribute('data-control-chrome'))).toEqual([
      'integrated', // ItemInput inside the default group
      'integrated', // bare ItemField
      'self', // explicit opt-out
    ]);
  });
});

describe('control integration — the sheet is source-pinned', () => {
  const sheet = readFileSync(resolve(__dirname, '../src/lib/ui/list-item/item.css'), 'utf8');

  it('dissolves background, border AND the well shadow (with its hover lift)', () => {
    expect(sheet).toContain("[data-control-chrome='integrated']");
    const block = sheet.slice(sheet.indexOf("data-control-chrome='integrated'"));
    expect(block.slice(0, 1200)).toMatch(/background:\s*transparent/u);
    expect(block.slice(0, 1200)).toMatch(/border-color:\s*transparent/u);
    expect(block.slice(0, 1200)).toMatch(/box-shadow:\s*none/u);
    expect(block.slice(0, 1600)).toMatch(/:hover/u);
  });

  it('keeps the state machine legible: focus/invalid/disabled re-assert border color', () => {
    const block = sheet.slice(sheet.indexOf("data-control-chrome='integrated'"), sheet.indexOf("integrated']") + 2400);
    expect(block).toMatch(/:has\(:focus\)/u);
    expect(block).toMatch(/aria-invalid/u);
    expect(block).toMatch(/:has\(:disabled\)/u);
  });

  it('rides the REAL tags root hook and leaves InputGroup out', () => {
    const block = sheet.slice(sheet.indexOf("data-control-chrome='integrated'"), sheet.indexOf("integrated']") + 1200);
    expect(block).toContain('[data-jx-tags-wrap]');
    expect(block).not.toContain('data-jx-igroup');
  });
});

/**
 * Control integration via the CONTROL-CHROME AXIS (codex r1 B5, the
 * Owner pivot 2026-09-05: "组件不支持就去升级组件，而不是入侵样式").
 * The row/group declares its controls bare through an ambient context;
 * each control resolves explicit ?? ambient ?? 'frame', stamps
 * data-chrome, and its OWN sheet paints the bare state. The list-item
 * sheet NEVER reaches into another family css (the first cut descendant
 * invasion died on the select chevron — a background shorthand wiped
 * the background-image arrow — and was retired whole).
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

describe('the integration declaration still stamps the row', () => {
  it('group: default self, integrated opt-in, muted/plain forced self', () => {
    const { container } = render(ControlChromeHost);
    expect(chromeOf(container, 'g-default')).toBe('self');
    expect(chromeOf(container, 'g-integrated')).toBe('integrated');
    expect(chromeOf(container, 'g-muted')).toBe('self');
    expect(chromeOf(container, 'g-plain')).toBe('self');
  });

  it('field rows: integrated by default, self opts out', () => {
    const { container } = render(ControlChromeHost);
    const fields = [...container.querySelectorAll('[data-item-field]')];
    expect(fields.map((f) => f.getAttribute('data-control-chrome'))).toEqual([
      'integrated',
      'integrated',
      'self',
    ]);
  });
});

describe('controls resolve the ambient (explicit ?? ambient ?? frame)', () => {
  it('a control inside an integrated field row renders data-chrome="bare"', () => {
    const { container } = render(ControlChromeHost);
    const shell = container.querySelector('[data-item-field] [data-chrome]');
    expect(shell?.getAttribute('data-chrome')).toBe('bare');
  });

  it('a self field leaves its control framed; outside any ambient the own default is frame', () => {
    const { container } = render(ControlChromeHost);
    const selfField = [...container.querySelectorAll('[data-item-field]')].find(
      (f) => f.getAttribute('data-control-chrome') === 'self',
    )!;
    expect(selfField.querySelector('[data-chrome]')?.getAttribute('data-chrome')).toBe('frame');
    expect(container.querySelector('[data-testid="standalone"] [data-chrome]')?.getAttribute('data-chrome')).toBe('frame');
  });
});

describe('the chrome axis — sheets are source-pinned', () => {
  const item = readFileSync(resolve(__dirname, '../src/lib/ui/list-item/item.css'), 'utf8');
  const input = readFileSync(resolve(__dirname, '../src/lib/ui/input/input.css'), 'utf8');
  const tags = readFileSync(resolve(__dirname, '../src/lib/ui/tags-input/tags-input.css'), 'utf8');
  const number = readFileSync(resolve(__dirname, '../src/lib/ui/number-input/number-input.css'), 'utf8');

  it('list-item.css NEVER reaches into another family (the retired invasion)', () => {
    expect(item).not.toMatch(/jx-html-/u);
    expect(item).not.toMatch(/jx-tags/u);
    expect(item).not.toMatch(/data-jx-igroup/u);
    expect(item).not.toMatch(/data-jx-tags-wrap/u);
  });

  it('each family paints its OWN bare state; the select keeps its chevron', () => {
    expect(input).toContain(".jx-html-control-shell[data-chrome='bare']");
    expect(input).toContain(".jx-html-select[data-chrome='bare']");
    expect(tags).toContain("[data-jx-tags-wrap][data-chrome='bare']");
    expect(number).toContain(".jx-num[data-chrome='bare']");
    const selectBlock = input.slice(input.indexOf(".jx-html-select[data-chrome='bare']"));
    const body = selectBlock.slice(0, selectBlock.indexOf('}') + 1);
    expect(body).not.toMatch(/background:\s*transparent/u);
    expect(body).toMatch(/background-color:\s*transparent/u);
  });
});

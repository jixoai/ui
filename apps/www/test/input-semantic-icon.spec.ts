/**
 * The semantic glyph lane (Owner 2026-09-05: "url/phone 等，都应该
 * 默认支持，并且支持配置 default-icon-position: start|end|null").
 *
 * The axis: url/tel/email/search carry their recognition glyph by
 * DEFAULT; `icon` swaps the glyph, `iconPosition` pins the side. The
 * unpinned side is CSS-OWNED — input.css's order ladder resolves it
 * (base LEADS, a list-item trailing lane TRAILS, the lane's 30rem fold
 * suspends back to leading — the inset-contract suspension precedent).
 * DOM assertions pin the stamps; source assertions pin the ladder and
 * both ambient rules (jsdom runs no layout, so the orders themselves
 * are pinned as css text).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/input-semantic-host.svelte';

const here = resolve(fileURLToPath(import.meta.url), '..');
const css = readFileSync(resolve(here, '../src/lib/ui/input/input.css'), 'utf8');

const shellOf = (container: HTMLElement, testid: string): HTMLElement => {
  const lane = container.querySelector(`[data-testid="${testid}"]`)!;
  return lane.closest('.jx-html-control-shell') as HTMLElement;
};
const fieldOf = (container: HTMLElement, testid: string): HTMLElement => {
  const lane = container.querySelector(`[data-testid="${testid}"]`)!;
  return lane.closest('.jx-field') as HTMLElement;
};

describe('the semantic glyph lane — DOM stamps', () => {
  it('the five text-like types render their glyph by default, stamped auto', () => {
    const { container } = render(Host);
    for (const id of ['sem-url', 'sem-tel', 'sem-email', 'sem-search', 'sem-text']) {
      const shell = shellOf(container, id);
      const glyph = shell.querySelector('[data-jx-semantic-icon]');
      expect(glyph, id).not.toBeNull();
      expect(glyph!.getAttribute('aria-hidden')).toBe('true');
      expect(shell.getAttribute('data-icon-position')).toBe('auto');
      // the glyph is a real icon-set svg (16px baked, decorative)
      expect(glyph!.querySelector('svg[data-jx-icon]'), id).not.toBeNull();
    }
  });

  it('password stays glyph-less (the eye owns it) and icon={null} opts out explicitly', () => {
    const { container } = render(Host);
    // password is not in the map — its end lane is the reveal eye's
    expect(shellOf(container, 'sem-password').querySelector('[data-jx-semantic-icon]')).toBeNull();
    expect(shellOf(container, 'sem-password').getAttribute('data-icon-position')).toBeNull();
    // the tri-state off lane: null ≠ undefined — no glyph, no stamp
    expect(shellOf(container, 'sem-optout').querySelector('[data-jx-semantic-icon]')).toBeNull();
    expect(shellOf(container, 'sem-optout').getAttribute('data-icon-position')).toBeNull();
  });

  it('the icon snippet overrides the glyph; iconPosition pins the side', () => {
    const { container } = render(Host);
    const custom = shellOf(container, 'sem-custom');
    expect(custom.querySelector('[data-jx-semantic-icon] [data-custom-glyph]')).not.toBeNull();
    expect(custom.querySelector('[data-jx-semantic-icon] svg[data-jx-icon]')).toBeNull();
    expect(shellOf(container, 'sem-pinned-start').getAttribute('data-icon-position')).toBe('start');
    expect(shellOf(container, 'sem-pinned-end').getAttribute('data-icon-position')).toBe('end');
  });

  it('the glyph extends the slot economy: slotted shell + the end-inset capability while it may trail', () => {
    const { container } = render(Host);
    // slotted: the shell carries the inline inset, the lane drops its padding
    expect(shellOf(container, 'sem-url').classList.contains('jx-slotted')).toBe(true);
    expect(shellOf(container, 'sem-optout').classList.contains('jx-slotted')).toBe(false);
    // data-self-inset (the end-inset ownership law): auto/end may trail →
    // the lane yields; an explicit START never trails → no capability
    expect(fieldOf(container, 'sem-url').getAttribute('data-self-inset')).toBe('');
    expect(fieldOf(container, 'sem-pinned-start').getAttribute('data-self-inset')).toBeNull();
    expect(fieldOf(container, 'sem-pinned-end').getAttribute('data-self-inset')).toBe('');
  });

  it("the glyph's DOM home is input-adjacent (the stepper adjacency margins read DOM order)", () => {
    const { container } = render(Host);
    const shell = shellOf(container, 'sem-url');
    const lane = shell.querySelector('.jx-html-control-lane')!;
    expect(lane.nextElementSibling?.hasAttribute('data-jx-semantic-icon')).toBe(true);
  });
});

describe('the semantic glyph lane — the css axis (source-pinned)', () => {
  it('the order ladder gives every shell child an explicit rung', () => {
    // the ladder: 0 stepper− · 1 start-slot · 2 GLYPH·lead · 10 lane
    // 12 GLYPH·trail · 13 end-slot · 14 stepper+ · 15 × · 16 eye
    expect(css).toMatch(/\[data-jx-semantic-icon\][^}]*order: 2/s);
    expect(css).toMatch(/\[data-icon-position='end'\][^}]*> \[data-jx-semantic-icon\][^}]*order: 12/s);
    expect(css).toMatch(/\.jx-html-control-lane[^}]*order: 10/s);
    expect(css).toMatch(/\.jx-input-reveal[^}]*order: 16/s);
    // the distinguishing slot stamps the ladder keys on
    expect(css).toMatch(/\[data-jx-inline-start\][^}]*order: 1/s);
    expect(css).toMatch(/\[data-jx-inline-end\][^}]*order: 13/s);
  });

  it('the trailing-lane ambient + the 30rem suspension (the inset-contract precedent)', () => {
    // ambient: inside a list-item end lane, auto trails
    expect(css).toMatch(
      /\[data-slot='item-end'\][^\n]*\[data-icon-position='auto'\][^\n]*>\s*\[data-jx-semantic-icon\]/,
    );
    // suspension: under the fold, a wrapping lane's auto leads again
    const fold = css.indexOf('@container jx-items (max-width: 30rem)');
    expect(fold).toBeGreaterThan(-1);
    const block = css.slice(fold, css.indexOf('}', css.indexOf('[data-jx-semantic-icon]', fold)));
    expect(block).toContain("[data-slot='item-end'][data-wrap='auto']");
    expect(block).toMatch(/order: 2/);
  });

  it('ONE glyph, ONE owner (Owner catch: email doubled head+tail) — the component shell kills the Tier-1 painted lane glyphs', () => {
    // jx-pure paints background icons on the native lane for email/search
    // (Tier-1's default-icon standard, leading); the component's glyph
    // lane supersedes it — same law as the search-cancel kill
    expect(css).toMatch(
      /\.jx-html-control-lane\[type='email'\][^}]*background-image: none/s,
    );
    expect(css).toMatch(/\.jx-html-control-lane\[type='search'\][^}]*background-image: none/s);
  });
});

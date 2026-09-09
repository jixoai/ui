/**
 * The carved action band gates (carved-action-band, 2026-09-09) —
 * the Owner ruling that ended the padded loose row: "button 没有在
 * 纵向上铺完整个 footer，也没有合理的分割线……padding 留白，这会
 * 令人困扰". An action band is a CARVED REGION — CardFooter's
 * cluster fills the band vertically (the rim line above IS the
 * band's top edge, the leadingSeam its carved left edge, the block
 * height IS the band), whatever surface hosts it. Grid geometry is
 * css — jsdom can't compute tracks — so these gates pin what the
 * law keys off (the card.spec / dialog-grid.spec precedent):
 *
 *   SHEET    the foot band renders the footer snippet RAW (dialog's
 *            r14-9 law verbatim) — the sheet mounts no layout
 *            wrapper; CardFooter is the standard face
 *   ADLG     the anchored strip bleeds (rim border-t) and renders
 *            CardFooter's STANDALONE mirror — the composed children
 *            auto-join ONE named cluster; the py/gap loose row is
 *            gone from the source
 *   DOCK     the non-footer proof: the reset row bleeds to the
 *            dock's edges and the icon button rides the same carved
 *            cluster
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';
import Sheet from '$lib/ui/sheet/sheet.svelte';
import AlertDialogActions from '$lib/ui/alert-dialog/alert-dialog-actions.svelte';
import CanvasSchemaHost from './fixtures/canvas-schema-host.svelte';
import SheetFooterFace from './fixtures/sheet-footer-face.svelte';

const here = import.meta.dirname;

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;

describe('sheet — the foot band is RAW (the r14-9 law, dialog verbatim)', () => {
  it('renders the snippet with NO wrapper of its own; CardFooter is the content face', () => {
    const footer = (() => {}) as unknown as Snippet;
    const { container } = render(Sheet, { props: { title: 't', children, footer } });
    const band = container.querySelector('[data-jx-card-foot]')!;
    expect(band).not.toBeNull();
    // the sheet ships no grid, no group, no loose flex row — the
    // snippet's own roots are the band's direct children (the scope
    // renders no element)
    expect(band.querySelector(':scope > .jx-card-foot-grid')).toBeNull();
    expect(band.querySelector(':scope > [data-jx-btngroup]')).toBeNull();
    expect(band.querySelector(':scope > div')).toBeNull();
  });

  it('a CardFooter snippet dissolves against the rented ruler (the cluster seats on the band)', () => {
    const { container } = render(SheetFooterFace);
    const band = container.querySelector('[data-jx-card-foot]')!;
    const grid = band.querySelector(':scope > .jx-card-foot-grid')!;
    expect(grid).not.toBeNull();
    const cluster = grid.querySelector('.jx-card-foot-cluster')!;
    expect(cluster.querySelector('[data-jx-btngroup]')).not.toBeNull();
  });

  it('the source retired the padded loose row (the py float is the ruled-out defect)', () => {
    const src = readFileSync(resolve(here, '../src/lib/ui/sheet/sheet.svelte'), 'utf8');
    expect(src).not.toContain('col-span-full flex w-full justify-end');
  });
});

describe('alert-dialog — the anchored strip is carved, not padded', () => {
  it('the strip splits evenly under a REAL Separator rim (round 3: the ink law + 均分)', () => {
    const { container } = render(AlertDialogActions, { props: { children } });
    const strip = container.querySelector('[data-jx-adlg-actions]')!;
    expect(strip.className).toContain('-mx-5');
    expect(strip.className).toContain('-mb-[1.125rem]');
    expect(strip.className).not.toContain('border-t'); // the rim is a Separator now
    // THE RIM: a real Separator instance — the contrast-ghost ink
    // engine Dialog's riding separators paint (a border-t token line
    // read washed-out over the acrylic, off-standard)
    const rim = strip.querySelector(':scope > [data-jx-separator], :scope > hr')!;
    expect(rim).not.toBeNull();
    expect(rim.getAttribute('aria-hidden')).toBe('true');
    // THE SPLIT: ONE full-width ButtonGroup, columns minmax(auto, 1fr)
    // — equal shares, long labels may widen (the macOS system posture;
    // the end-riding CardFooter cluster retired with the ruling)
    expect(strip.querySelector('.jx-card-foot-grid')).toBeNull();
    const group = strip.querySelector(':scope > [data-jx-btngroup]')!;
    expect(group).not.toBeNull();
    expect(group.getAttribute('aria-label')).toBe('Actions');
    expect(group.className).toContain('w-full');
    // the split rides an INLINE STYLE (vision r3: the arbitrary-property
    // utility silently lost the same-property cascade fight against the
    // group's own auto-cols-auto — a declaration beats every utility)
    expect(group.getAttribute('style')?.replace(/\s+/g, '')).toContain('grid-auto-columns:minmax(auto,1fr)');
    expect(group.hasAttribute('data-jx-leading-seam')).toBe(false); // full-bleed: no carved left edge
  });

  it('the source retired the padded loose row', () => {
    const src = readFileSync(
      resolve(here, '../src/lib/ui/alert-dialog/alert-dialog-actions.svelte'),
      'utf8',
    );
    expect(src).not.toContain('py-3.5');
    expect(src).not.toContain('gap-2.5');
  });
});

describe('canvas dock — the non-footer bar uses the same band', () => {
  it('the pinned reset bar rides the carved cluster (outside the guttered scroller)', () => {
    const { container } = render(CanvasSchemaHost);
    const foot = container.querySelector<HTMLElement>('[data-jx-canvas-dock-foot]')!;
    expect(foot).not.toBeNull();
    // PINNED OUTSIDE THE SCROLLER (the vision acceptance's D catch):
    // the scroll region reserves a stable thin-scrollbar gutter even
    // when idle — a bar inside it could never bleed to the dock's
    // edge. The clip hands the bar the dock's full width instead
    expect(foot.closest('[data-jx-canvas-dock-scroll]')).toBeNull();
    expect(foot.closest('[data-jx-canvas-dock-clip]')).not.toBeNull();
    // the rim is a REAL Separator instance now (the ink law — the
    // border-t token line retired with round 3)
    expect(foot.className).not.toContain('border-t');
    expect(foot.querySelector(':scope > [data-jx-separator], :scope > hr')).not.toBeNull();
    // the carved interior: the icon button rides the named cluster
    const group = foot.querySelector('.jx-card-foot-cluster > [data-jx-btngroup]')!;
    expect(group.getAttribute('aria-label')).toBe('Playground actions');
    expect(group.querySelector('[data-jx-canvas-reset]')).not.toBeNull();
    // the collapse region still owns it (the pinned-foot law)
    expect(foot.closest('.jx-canvas-dock-collapse')).not.toBeNull();
  });

  it('the head/body rim is a Separator instance inside the clip (hidden at 0fr)', () => {
    const { container } = render(CanvasSchemaHost);
    const clip = container.querySelector('[data-jx-canvas-dock-clip]')!;
    const first = clip.firstElementChild!;
    expect(first.tagName).toBe('HR'); // the rim rides first, hides with the collapse
    expect(first.getAttribute('aria-hidden')).toBe('true');
    // the collapse's own border-t retired (the Separator owns the rim)
    const collapse = container.querySelector('.jx-canvas-dock-collapse')!;
    expect(collapse.className).not.toContain('border-t');
  });

  it('the compression fix: the clip is a flex column, the scroller is the absorber', () => {
    const canvasCss = readFileSync(
      resolve(here, '../src/lib/ui/component-canvas/component-canvas.css'),
      'utf8',
    );
    // under the dock's stage-height bound the collapse squeezes — the
    // SCROLLER gives (never the pinned bar: a plain block scroller
    // overflowed the clip and the bar rendered half-clipped, the
    // Owner-reported defect)
    expect(canvasCss).toMatch(/\[data-jx-canvas-dock-scroll\][^}]*flex: 1 1 auto/s);
    expect(canvasCss).toMatch(/\[data-jx-canvas-dock-scroll\][^}]*min-block-size: 0/s);
    const clip = render(CanvasSchemaHost).container.querySelector('[data-jx-canvas-dock-clip]')!;
    expect(clip.className).toContain('flex-col');
  });

  it('the borderless-chrome law: no framed controls in the dock sheets (round 3, S1)', () => {
    const canvasCss = readFileSync(
      resolve(here, '../src/lib/ui/component-canvas/component-canvas.css'),
      'utf8',
    );
    // the seg + stepper frames retired (a box in a bounded box reads
    // catastrophic — the Owner ruling); the output rows drop their
    // cell borders in the markup
    const seg = /:where\(\.jx-canvas-seg\)\s*\{[^}]*\}/.exec(canvasCss)?.[0] ?? '';
    expect(seg).not.toContain('border: 1px');
    const stepper = /:where\(\.jx-canvas-stepper\)\s*\{[^}]*\}/.exec(canvasCss)?.[0] ?? '';
    expect(stepper).not.toContain('border: 1px');
    const value = /:where\(\.jx-canvas-step-value\)\s*\{[^}]*\}/.exec(canvasCss)?.[0] ?? '';
    expect(value).not.toContain('border-inline');
    const src = readFileSync(
      resolve(here, '../src/lib/ui/component-canvas/canvas-playground.svelte'),
      'utf8',
    );
    expect(src).not.toContain('border-[color-mix(in_oklab,var(--border)_60%,transparent)]');
  });

  it('the head chrome row is a carved band too (the ButtonBar spirit, round 2)', () => {
    const { container } = render(CanvasSchemaHost);
    const head = container.querySelector('[data-jx-canvas-dock-head]')!;
    // the band stretches its controls — no py padding floating them
    expect(head.className).toContain('items-stretch');
    // the hand-drawn chrome retired into zone IconButtons: the stamps
    // ride the rest lane onto real button roots, aria-pressed and
    // aria-expanded/controls survive the move
    const theme = container.querySelector<HTMLButtonElement>('[data-jx-canvas-theme-toggle]')!;
    expect(theme.tagName).toBe('BUTTON');
    expect(theme.getAttribute('aria-pressed')).toBe('false');
    const toggle = container.querySelector<HTMLButtonElement>('[data-jx-canvas-dock-toggle]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBeTruthy();
    // the one non-press cell: a borderless select stretched to the band
    const select = container.querySelector<HTMLSelectElement>('[data-jx-canvas-density-select]')!;
    expect(select.className).toContain('self-stretch');
    expect(select.className).toContain('border-none');
    // the hand chrome recipe is gone from the source (borders, the
    // +2px size scale, the shadow-suppression customs)
    const src = readFileSync(
      resolve(here, '../src/lib/ui/component-canvas/canvas-playground.svelte'),
      'utf8',
    );
    expect(src).not.toContain('size-[calc(var(--jx-hit)+2px)]');
    expect(src).not.toContain('[--jx-press-shadow:none]');
  });
});

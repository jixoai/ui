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
  it('the strip bleeds (rim border-t) and renders CardFooter standalone inside', () => {
    const { container } = render(AlertDialogActions, { props: { children } });
    const strip = container.querySelector('[data-jx-adlg-actions]')!;
    expect(strip.className).toContain('border-t');
    expect(strip.className).toContain('-mx-5');
    expect(strip.className).toContain('-mb-[1.125rem]');
    // the carved interior: the standalone mirror carries ONE named
    // cluster — the composed Cancel/Action join through the group
    const grid = strip.querySelector(':scope > .jx-card-foot-grid')!;
    expect(grid).not.toBeNull();
    const group = grid.querySelector('.jx-card-foot-cluster > [data-jx-btngroup]')!;
    expect(group.getAttribute('aria-label')).toBe('Actions');
    expect(group.hasAttribute('data-jx-leading-seam')).toBe(true);
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
    // the rim spans the dock, the band rides its bottom edge
    expect(foot.className).toContain('border-t');
    // the carved interior: the icon button rides the named cluster
    const group = foot.querySelector('.jx-card-foot-cluster > [data-jx-btngroup]')!;
    expect(group.getAttribute('aria-label')).toBe('Playground actions');
    expect(group.querySelector('[data-jx-canvas-reset]')).not.toBeNull();
    // the collapse region still owns it (the pinned-foot law)
    expect(foot.closest('.jx-canvas-dock-collapse')).not.toBeNull();
  });
});

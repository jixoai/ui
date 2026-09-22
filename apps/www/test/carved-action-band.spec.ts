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
import SystemDialogActions from '$lib/ui/system-dialog/system-dialog-actions.svelte';
import { sysdlgStyles } from '$lib/ui/system-dialog/system-dialog.stylex';
import { canvasStyles } from '$lib/surface/component-canvas.stylex';
import CanvasSchemaHost from './fixtures/canvas-schema-host.svelte';
import SheetFooterFace from './fixtures/sheet-footer-face.svelte';

const here = import.meta.dirname;

// tailwindless Wave 1 (2026-09-17): the canvas chrome's utility payload
// rides stylex atoms now — asserted through the same cx join the
// component rides (the progressive-blur.spec precedent)
const cx = (
  ...styles: ({ readonly [key: string]: string | object } | undefined)[]
): string =>
  styles
    .filter(Boolean)
    .map((style) =>
      Object.entries(style).flatMap(([key, value]) =>
        key !== '$$css' && typeof value === 'string' ? [value] : [],
      ).join(' '),
    )
    .join(' ');

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

describe('system-dialog — the anchored strip is carved, not padded', () => {
  it('the strip splits evenly under a REAL Separator rim (round 3: the ink law + 均分)', () => {
    const { container } = render(SystemDialogActions, { props: { children } });
    const strip = container.querySelector('[data-jx-sysdlg-actions]')!;
    // W1b: the bleed arithmetic rides the actions atom (the cx join the
    // component rides) — the -mx/-mb utilities retired with the ladder
    expect(strip.className).toContain(cx(sysdlgStyles.actions));
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
    expect(group.className).toContain(cx(sysdlgStyles.actionsFill));
    // THE SPLIT IS A FLEX LAW (Owner r4): grid fr cannot express "equal
    // halves that fill, long labels floor wider" — an fr's unit comes
    // from the leftover AFTER intrinsic bases, so max-content-floored
    // tracks freeze (measured 120+143 of 382, the void parked at the
    // end). The declaration switches the group to flex; the members'
    // flex:1 1 0 + min-width:max-content + centered labels live in
    // system-dialog.css (measured: 191+191 equal fill; a long label
    // takes its full unwrapped width, 1 line)
    expect(group.getAttribute('style')?.replace(/\s+/g, '')).toContain('display:flex');
    expect(group.hasAttribute('data-jx-leading-seam')).toBe(false); // full-bleed: no carved left edge
  });

  it('the source retired the padded loose row; the labels center (Owner r4)', () => {
    const src = readFileSync(
      resolve(here, '../src/lib/ui/system-dialog/system-dialog-actions.svelte'),
      'utf8',
    );
    expect(src).not.toContain('py-3.5');
    expect(src).not.toContain('gap-2.5');
    // a stretched split cell with a flex-start label reads as a hole
    // between the two texts — the strip's css centers its cells
    const css = readFileSync(
      resolve(here, '../src/lib/ui/system-dialog/system-dialog.css'),
      'utf8',
    );
    expect(css).toMatch(
      /\[data-jx-sysdlg-actions\] \[data-jx-btngroup\]\) > :where\(\[data-jx-press-button\]\)\s*\{[^}]*flex: 1 1 0[^}]*min-width: max-content[^}]*justify-content: center/s,
    );
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

  it("the head bar's own rim: a solid Separator sibling of the collapse (Owner r6)", () => {
    const { container } = render(CanvasSchemaHost);
    const dock = container.querySelector('[data-jx-canvas-dock]')!;
    const collapse = dock.querySelector('.jx-canvas-dock-collapse')!;
    // the rim is the head's DIRECT FOLLOWING sibling — outside the
    // overflow-hidden clip (the clip-top placement rendered in one
    // environment and not another; the sibling is immune) and
    // shrink-0 (no flex squeeze)
    const rimHost = collapse.previousElementSibling!;
    expect(rimHost.tagName).toBe('DIV');
    expect(rimHost.className).toContain(cx(canvasStyles.rimWrap));
    const rim = rimHost.querySelector('hr');
    expect(rim).not.toBeNull();
    expect(rim.getAttribute('aria-hidden')).toBe('true');
    // SOLID ink (the ghost's blind spot on the uniform acrylic)
    expect(rim.getAttribute('data-jx-separator')).toBe('solid');
    // the collapse's own border-t retired (the Separator owns the rim)
    expect(collapse.className).not.toContain('border-t');
    // no rim lingers at the clip's top (the foot bar's own rim, deeper
    // inside, is legitimate)
    const clip = container.querySelector('[data-jx-canvas-dock-clip]')!;
    expect(clip.firstElementChild!.hasAttribute('data-jx-canvas-dock-scroll')).toBe(true);
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
    expect(clip.className).toContain(cx(canvasStyles.dockClip));
  });

  it('the borderless-chrome law: no framed controls in the dock sheets (round 3, S1)', () => {
    const canvasCss = readFileSync(
      resolve(here, '../src/lib/ui/component-canvas/component-canvas.css'),
      'utf8',
    );
    // grindstone #17-3: the seg + stepper idioms retired ENTIRELY into
    // ItemSegmented/ItemStepper (the shared .jx-html-tgroup bare rung
    // and the NumberInput's bare livery own the paint) — a rule
    // reborn here would be a frame reborn (a box in a bounded box
    // reads catastrophic — the Owner ruling); the output rows drop
    // their cell borders in the markup
    for (const retired of ['.jx-canvas-seg', '.jx-canvas-stepper', '.jx-canvas-step']) {
      expect(canvasCss).not.toContain(retired);
    }
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
    expect(head.className).toContain(cx(canvasStyles.dockHead));
    // the hand-drawn chrome retired into zone IconButtons: the stamps
    // ride the rest lane onto real button roots, aria-pressed and
    // aria-expanded/controls survive the move
    const theme = container.querySelector<HTMLButtonElement>('[data-jx-canvas-theme-toggle]')!;
    expect(theme.tagName).toBe('BUTTON');
    expect(theme.getAttribute('aria-pressed')).toBe('false');
    const toggle = container.querySelector<HTMLButtonElement>('[data-jx-canvas-dock-toggle]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBeTruthy();
    // THE TOOLBAR SEAMS (Owner r7 — the ask all along): the vertical
    // whisper Separators frame the scrollable axis run, and the run's
    // OWN inter-control seams ride the ButtonGroup's ghost separator
    // policy (the same ink law, the family's carrier — the carved
    // band comment's "the select↔toggle boundary" generalizes to the
    // run↔toggle boundary under the eight-axis bar, 2026-09-21)
    const seams = head.querySelectorAll('[data-jx-separator][data-orientation="vertical"]');
    expect(seams.length).toBe(3); // grip|run, the left cluster's
    // trailing edge, and the toggle group's left edge — the breathing
    // gap stays BRACKETED by two whisper lines (Owner r11); the run's
    // INNER seams are the group's own [data-jx-btngroup-sep] elements
    for (const seam of seams) {
      // THE GHOST (Owner r9: "这种分割线本身只是一个视觉辅助"): the
      // default fused ink, zero color tokens — no variant, no class
      // paint; a visual aid whispers (on this ground: a few 255ths)
      expect(seam.getAttribute('data-jx-separator')).toBe('fused');
      expect(seam.getAttribute('aria-hidden')).toBe('true');
      expect(seam.className).not.toContain('color-mix');
    }
    // the eight-axis bar (the Owner directive 2026-09-21): the retired
    // non-press select cell is GONE — every control in the band is a
    // zone ghost IconButton (the theme cycle + the seven menu
    // triggers), the joined run rides the family's ButtonGroup at the
    // compact xs rung (the smaller bar), and the source's hand-chrome
    // recipe stays retired
    expect(head.querySelector('select')).toBeNull();
    expect(head.querySelectorAll('[data-jx-canvas-axis]').length).toBe(7);
    expect(head.querySelector('[data-jx-canvas-dock-axes]')).not.toBeNull();
    expect(head.querySelector('[data-jx-canvas-theme-toggle]')!.getAttribute('data-density')).toBe('xs');
    // W1 residue law: the retired dockDensity atom + its css channel
    // overrides are gone with the select (nothing keys on them)
    const src = readFileSync(
      resolve(here, '../src/lib/ui/component-canvas/canvas-playground.svelte'),
      'utf8',
    );
    expect(src).not.toContain('size-[calc(var(--jx-hit)+2px)]');
    expect(src).not.toContain('[--jx-press-shadow:none]');
    expect(src).not.toContain('jx-canvas-dock-density');
    const canvasCss = readFileSync(
      resolve(here, '../src/lib/ui/component-canvas/component-canvas.css'),
      'utf8',
    );
    expect(canvasCss).not.toMatch(/jx-canvas-dock-density\s*\{/);
  });
});

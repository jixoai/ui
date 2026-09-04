/**
 * button-group-scroll.spec.ts — the third overflow mode (Owner
 * 2026-09-04, the tabs scroll contract): overflow='scroll' rides a
 * scroll run.
 *
 * Contracts under test:
 *  - STRUCTURE: scroll mode renders the HOST (one-cell grid) wrapping
 *    the run; the run carries data-jx-btngroup-run +
 *    data-scroll-effect; non-scroll modes render NO host (the bare
 *    root, byte-identical legacy DOM);
 *  - THE VERDICT: the scroll-state stamp (jsdom has no layout —
 *    scrollWidth = clientWidth = 0 → max ≤ 1 → 'none'), the single
 *    truth the css keys the chevrons and the veil layer on;
 *  - NO MEASUREMENT: scroll mode never stamps data-jx-overflow (the
 *    wrap/collapse machine is exempt — css scrolls the line);
 *  - THE CHROME: chevron buttons exist with accessible names; the
 *    veil layer mounts ONLY under the veil effects; a VERTICAL scroll
 *    group gets the bare block-axis scroller (no host, no chrome);
 *  - THE SEAMS still join the scrolling line (a ghost scroll group
 *    injects its separators);
 *  - the BUILDERS export the typed effect descriptors (the tabs
 *    convention);
 *  - the CSS LAW, source-pinned: the run's scroller rules, the
 *    per-member ramp rules, and the UNLAYERED veil gates.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Host from './fixtures/button-group-scroll-host.svelte';
import {
  blur,
  blurSlide,
  progressBlur,
  shadow,
  slide,
} from '../src/lib/ui/button-group/button-group.svelte';

// same-source law: the css text comes off the www mirror (byte-identical
// to registry/files/ui/button-group/button-group.css)
const buttonGroupCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/button-group/button-group.css'),
  'utf8',
);

describe('ButtonGroup · overflow=scroll · structure', () => {
  it('renders the HOST wrapping the RUN; the run carries the run + effect stamps', () => {
    const { container } = render(Host, { props: { scrollEffect: slide({ distance: '12px' }) } });
    const host = container.querySelector('[data-jx-btngroup-host]');
    expect(host).not.toBeNull();
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.hasAttribute('data-jx-btngroup-run')).toBe(true);
    expect(run.getAttribute('data-scroll-effect')).toBe('slide');
    expect(host?.contains(run)).toBe(true);
    // the host is the one-cell grid: the run, veil layer and chevrons
    // stack in one cell
    expect(host?.classList.contains('jx-btngroup-scroll-host')).toBe(true);
  });

  it('non-scroll modes render NO host — the bare root is the legacy DOM', () => {
    const { container } = render(Host, { props: { overflow: 'wrap' } });
    expect(container.querySelector('[data-jx-btngroup-host]')).toBeNull();
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.hasAttribute('data-jx-btngroup-run')).toBe(false);
    expect(run.hasAttribute('data-scroll-effect')).toBe(false);
    // and no chevrons exist outside scroll mode
    expect(container.querySelector('[data-jx-btngroup-chevron]')).toBeNull();
  });

  it('the collapse trigger never renders in scroll mode', () => {
    const { container } = render(Host);
    expect(container.querySelector('[data-jx-btngroup-more]')).toBeNull();
  });
});

describe('ButtonGroup · overflow=scroll · the verdict + measurement exemption', () => {
  it('stamps the scroll-state verdict (none, when the run cannot travel — jsdom zero layout)', () => {
    const { container } = render(Host);
    expect(container.querySelector('[data-testid="scroll-group"]')?.getAttribute('data-jx-scroll-state')).toBe(
      'none',
    );
  });

  it('NEVER stamps the wrap/collapse overflow states — no measurement runs', () => {
    const { container } = render(Host);
    expect(container.querySelector('[data-testid="scroll-group"]')?.hasAttribute('data-jx-overflow')).toBe(false);
    expect(container.querySelectorAll('[data-jx-row-start]').length).toBe(0);
    expect(container.querySelectorAll('[data-jx-overflow-hidden]').length).toBe(0);
  });

  it('the seams still join the scrolling line (a ghost scroll group injects its separators)', () => {
    const { container } = render(Host, { props: { variant: 'ghost' } });
    const group = container.querySelector('[data-testid="scroll-group"]')!;
    const seps = [...group.children].filter((c) => c.hasAttribute('data-jx-btngroup-sep'));
    expect(seps).toHaveLength(2); // 3 buttons → 2 seams
    expect(group.getAttribute('data-jx-separator')).not.toBeNull();
  });
});

describe('ButtonGroup · overflow=scroll · the chrome', () => {
  it('the chevron buttons exist on the host, outside the run, with accessible names', () => {
    const { container } = render(Host);
    const host = container.querySelector('[data-jx-btngroup-host]')!;
    const start = host.querySelector('[data-jx-btngroup-chevron="inline-start"]');
    const end = host.querySelector('[data-jx-btngroup-chevron="inline-end"]');
    expect(start?.getAttribute('aria-label')).toBe('Scroll actions backward');
    expect(end?.getAttribute('aria-label')).toBe('Scroll actions forward');
    // scroll controls are not group actions: they live outside the run
    expect(container.querySelector('[data-testid="scroll-group"]')?.contains(start!)).toBe(false);
  });

  it('the veil layer mounts ONLY under the veil effects (shadow / progressBlur)', () => {
    const shadowed = render(Host, { props: { scrollEffect: shadow({ width: '48px' }) } });
    expect(
      shadowed.container.querySelector('.jx-btngroup-veil-layer')?.querySelectorAll('.jx-btngroup-shadow'),
    ).toHaveLength(2);
    shadowed.unmount();

    const laddered = render(Host, { props: { scrollEffect: progressBlur({ blurLevels: [1, 2, 4] }) } });
    expect(laddered.container.querySelector('.jx-btngroup-veil-layer')).not.toBeNull();
    laddered.unmount();

    // the ramp effects carry no veil
    const slid = render(Host, { props: { scrollEffect: slide() } });
    expect(slid.container.querySelector('.jx-btngroup-veil-layer')).toBeNull();
  });

  it('the effect knobs ride the HOST inline (the overlays are the run\'s siblings)', () => {
    const { container } = render(Host, { props: { scrollEffect: blurSlide({ radius: '6px', distance: '10px' }) } });
    const style = container.querySelector('[data-jx-btngroup-host]')?.getAttribute('style') ?? '';
    expect(style).toContain('--jx-btngroup-edge-blur: 6px');
    expect(style).toContain('--jx-btngroup-edge-slide: 10px');
    const { container: shadowed } = render(Host, { props: { scrollEffect: shadow({ width: '48px' }) } });
    expect(shadowed.querySelector('[data-jx-btngroup-host]')?.getAttribute('style')).toContain(
      '--jx-btngroup-veil: 48px',
    );
  });

  it('a VERTICAL scroll group gets the bare block-axis scroller — no host, no chrome', () => {
    const { container } = render(Host, { props: { orientation: 'vertical' } });
    expect(container.querySelector('[data-jx-btngroup-host]')).toBeNull();
    expect(container.querySelector('[data-jx-btngroup-chevron]')).toBeNull();
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.hasAttribute('data-jx-btngroup-run')).toBe(true);
    expect(run.hasAttribute('data-scroll-effect')).toBe(false); // chrome is the horizontal contract
  });
});

describe('ButtonGroup · the scroll-effect builders (the tabs convention)', () => {
  it('export the typed descriptors with discoverable defaults', () => {
    expect(slide()).toEqual({ type: 'slide', distance: '8px' });
    expect(slide({ distance: '12px' }).distance).toBe('12px');
    expect(blur()).toEqual({ type: 'blur', radius: '4px' });
    expect(blurSlide({ radius: '6px' })).toEqual({ type: 'blur+slide', radius: '6px', distance: '8px' });
    expect(shadow()).toEqual({ type: 'shadow', width: undefined });
    expect(shadow({ width: '48px' }).width).toBe('48px');
    expect(progressBlur({ blurLevels: [1, 2] }).blurLevels).toEqual([1, 2]);
    // the restraint ruling's default ladder (round 2): a button row's
    // height is limited — the peak caps at 4px
    expect(progressBlur().blurLevels).toEqual([0.25, 0.5, 1, 1.5, 2.5, 4]);
  });
});

describe('ButtonGroup · overflow=scroll · the css law (source-pinned)', () => {
  it('the run IS the scroller: hidden scrollbar, smooth travel, lane-clearing scroll-padding — and NO snap (the acceptance ruling: snap yanked releases to member-flush positions where the treatments pop off)', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup-run\]\[data-jx-btngroup='horizontal'\]\)\s*\{[^}]*grid-area:\s*1\s*\/\s*1;[^}]*position:\s*relative;[^}]*overflow-x:\s*auto;[^}]*scrollbar-width:\s*none;[^}]*scroll-padding-inline:[^;]*;[^}]*scroll-behavior:\s*smooth;/s,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup-run\]\[data-jx-btngroup='vertical'\]\)\s*\{[^}]*overflow-y:\s*auto;/s,
    );
    expect(buttonGroupCss).toMatch(/\[data-jx-btngroup-run\]\)::\-webkit-scrollbar\s*\{\s*display:\s*none;/);
    const rules = buttonGroupCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rules).not.toMatch(/scroll-snap/);
  });

  it('position:relative on the run is LOAD-BEARING — the offsetParent law (acceptance regression: without it the edge factors read a foreign coordinate space and the ramps clip the wrong members)', () => {
    const block = buttonGroupCss.match(
      /\[data-jx-btngroup-run\]\[data-jx-btngroup='horizontal'\]\)\s*\{([^}]*)\}/s,
    )?.[1];
    expect(block).toContain('position: relative;');
  });

  it('THE RESTRAINT RULING (Owner acceptance): compact-row scale — the chevron lane and the veil band ride half the tabs measures', () => {
    // the veil band: inset·3 (tabs runs inset·6)
    expect(buttonGroupCss).toMatch(/--jx-btngroup-veil:\s*calc\(var\(--jx-inset\)\s*\*\s*3\);/);
    // the chevron lane: inset·1.5 (tabs runs inset·2), a smaller glyph
    // at a dimmed ink
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup-chevron='inline-start'\]\),\s*\n\s*:where\(\[data-jx-btngroup-chevron='inline-end'\]\)\s*\{[^}]*width:\s*calc\(var\(--jx-inset\)\s*\*\s*1\.5\);/s,
    );
    expect(buttonGroupCss).toMatch(/--jx-btngroup-chevron-size:\s*calc\(var\(--jx-text-secondary\)\s*\*\s*0\.75\);/);
    expect(buttonGroupCss).toMatch(
      /background-color:\s*color-mix\(in oklab,\s*var\(--muted-foreground\)\s*65%,\s*transparent\);/,
    );
  });

  it('the per-member ramps calc from the scroll handler\'s edge stamps, consumed SQUARED (the eased curve — light clips barely treat, actions stay readable)', () => {
    // the squared factor: max(s,e) * max(s,e) in every treatment
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup-run\]\[data-scroll-effect='slide'\]\)\s*>\s*\*\s*\{[^}]*opacity:\s*calc\(1\s*-\s*max\(var\(--jx-edge-start,\s*0\),\s*var\(--jx-edge-end,\s*0\)\)\s*\*\s*max\(var\(--jx-edge-start,\s*0\),\s*var\(--jx-edge-end,\s*0\)\)\);/s,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup-run\]\[data-scroll-effect='blur'\]\)\s*>\s*\*\s*\{[^}]*filter:\s*blur\(calc\(max\(var\(--jx-edge-start,\s*0\),\s*var\(--jx-edge-end,\s*0\)\)\s*\*\s*max\(var\(--jx-edge-start,\s*0\),\s*var\(--jx-edge-end,\s*0\)\)\s*\*\s*var\(--jx-btngroup-edge-blur,\s*0px\)\)\)/s,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup-run\]\[data-scroll-effect='blur\+slide'\]\)\s*>\s*\*\s*\{/s,
    );
    // no LINEAR consumption survives anywhere (the acceptance bug:
    // first clipped pixel popped to full treatment)
    const rampBlocks = buttonGroupCss.match(
      /\[data-jx-btngroup-run\]\[data-scroll-effect[^{]*\{[^}]*\}/gs,
    ) ?? [];
    expect(rampBlocks.length).toBeGreaterThan(0);
    for (const block of rampBlocks) {
      expect(block).not.toMatch(/opacity:\s*calc\(1\s*-\s*max\([^*]*\)\);/s);
    }
  });

  it('the shadow veil paints NO color — backdrop contrast only (the separator INK law), masked per edge', () => {
    expect(buttonGroupCss).toMatch(
      /\.jx-btngroup-shadow\)\s*\{[^}]*backdrop-filter:\s*contrast\(0\.5\);/s,
    );
    const shadowBlock = buttonGroupCss.match(/\.jx-btngroup-shadow\)\s*\{([^}]*)\}/s)?.[1] ?? '';
    expect(shadowBlock).not.toContain('background:');
    expect(buttonGroupCss).toMatch(
      /\.jx-btngroup-shadow\)\[data-position='start'\]\s*\{[^}]*mask:\s*linear-gradient\(to left, transparent, rgb\(0, 0, 0\)\);/s,
    );
  });

  it('the verdict gates: chevrons and the veil layer never paint without travel (and the veil gates sit UNLAYERED)', () => {
    // chevron existence keys on the verdict
    expect(buttonGroupCss).toMatch(
      /\.jx-btngroup-scroll-host\):has\(\s*>\s*\[data-jx-btngroup-run\]\[data-jx-scroll-state='none'\]\)\s*>\s*:where\(\[data-jx-btngroup-chevron\]\)/,
    );
    // the veil gates are UNLAYERED: they must come AFTER the
    // components layer's DECLARATION closes (cascade law — a layered
    // display:none never beats the layer's own grid utility; the
    // prose may NAME the layer, so the probe anchors the declaration
    // itself)
    const layerDeclAt = buttonGroupCss.search(/@layer components\s*\{/);
    const gatesAt = buttonGroupCss.indexOf('veil-layer gates are UNLAYERED');
    expect(gatesAt).toBeGreaterThan(layerDeclAt);
    const gates = buttonGroupCss.slice(gatesAt);
    expect(gates).not.toMatch(/^@layer/m); // nothing re-opens a layer after the gates
    expect(gates).toMatch(
      /:has\(\s*>\s*\[data-jx-btngroup-run\]\[data-jx-scroll-state='none'\]\)\s*>\s*:where\(\.jx-btngroup-veil-layer\)/,
    );
    expect(gates).toMatch(
      /:has\(\s*>\s*\[data-jx-btngroup-run\]:not\(\[data-jx-scroll-state\]\)\)\s*>\s*:where\(\.jx-btngroup-veil-layer\)/,
    );
  });
});

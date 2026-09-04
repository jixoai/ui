/**
 * button-group-scroll.spec.ts — the third overflow mode (Owner
 * 2026-09-04) under THE UNIFICATION: the machinery, the paint laws
 * and the chrome are the SHARED scroll-run item; this family stamps
 * its run and mounts ScrollChrome.
 *
 * Contracts under test:
 *  - STRUCTURE: scroll mode renders the HOST wrapping the run; the
 *    run carries the shared data-jx-scroll-run + data-axis stamps;
 *    non-scroll modes render NO host (the bare root, byte-identical
 *    legacy DOM);
 *  - THE VERDICT: the scroll-state stamp (jsdom zero layout → max≤1
 *    → 'none'), the single truth the shared css keys the chips and
 *    the veil layer on;
 *  - NO MEASUREMENT: scroll mode never stamps data-jx-overflow;
 *  - THE CHROME: ScrollChrome's chips exist with accessible names
 *    OUTSIDE the run; the veil layer mounts ONLY under the veil
 *    effects; a VERTICAL scroll group gets the bare block scroller;
 *  - THE BUILDERS re-export from the shared item (the family API);
 *  - the SHARED css LAW, source-pinned against scroll-run.css (the
 *    run contract, the chip law, the eased ramps, the unlayered gates)
 *    and the family's own sheet carrying NOTHING scroll-painted.
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

const scrollRunCss = readFileSync(resolve(process.cwd(), 'src/lib/ui/scroll-run/scroll-run.css'), 'utf8');
const buttonGroupCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/button-group/button-group.css'),
  'utf8',
);

describe('ButtonGroup · overflow=scroll · structure (the shared contract)', () => {
  it('renders the HOST wrapping the RUN; the run carries the shared run + axis stamps', () => {
    const { container } = render(Host, { props: { scrollEffect: slide({ distance: '12px' }) } });
    const host = container.querySelector('[data-jx-btngroup-host]');
    expect(host).not.toBeNull();
    expect(host?.classList.contains('jx-scroll-host')).toBe(true);
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.hasAttribute('data-jx-scroll-run')).toBe(true);
    expect(run.getAttribute('data-axis')).toBe('horizontal');
    expect(run.getAttribute('data-scroll-effect')).toBe('slide');
    expect(host?.contains(run)).toBe(true);
  });

  it('non-scroll modes render NO host and NO run stamps — the bare root is the legacy DOM', () => {
    const { container } = render(Host, { props: { overflow: 'wrap' } });
    expect(container.querySelector('[data-jx-btngroup-host]')).toBeNull();
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.hasAttribute('data-jx-scroll-run')).toBe(false);
    expect(run.hasAttribute('data-scroll-effect')).toBe(false);
    expect(container.querySelector('[data-jx-scroll-chevron]')).toBeNull();
  });

  it('the collapse trigger never renders in scroll mode', () => {
    const { container } = render(Host);
    expect(container.querySelector('[data-jx-btngroup-more]')).toBeNull();
  });
});

describe('ButtonGroup · overflow=scroll · the verdict + measurement exemption', () => {
  it('stamps the scroll-state verdict (none, when the run cannot travel — jsdom zero layout)', () => {
    const { container } = render(Host);
    expect(
      container.querySelector('[data-testid="scroll-group"]')?.getAttribute('data-jx-scroll-state'),
    ).toBe('none');
  });

  it('NEVER stamps the wrap/collapse overflow states — no measurement runs', () => {
    const { container } = render(Host);
    expect(
      container.querySelector('[data-testid="scroll-group"]')?.hasAttribute('data-jx-overflow'),
    ).toBe(false);
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

describe('ButtonGroup · overflow=scroll · the chrome (the shared ScrollChrome)', () => {
  it('the chevron chips exist on the host, outside the run, with accessible names', () => {
    const { container } = render(Host);
    const host = container.querySelector('[data-jx-btngroup-host]')!;
    const start = host.querySelector('[data-jx-scroll-chevron="inline-start"]');
    const end = host.querySelector('[data-jx-scroll-chevron="inline-end"]');
    expect(start?.getAttribute('aria-label')).toBe('Scroll actions backward');
    expect(end?.getAttribute('aria-label')).toBe('Scroll actions forward');
    // scroll controls are not group actions: they live outside the run
    expect(container.querySelector('[data-testid="scroll-group"]')?.contains(start!)).toBe(false);
  });

  it('the veil layer mounts ONLY under the veil effects (shadow / progressBlur)', () => {
    const shadowed = render(Host, { props: { scrollEffect: shadow({ width: '48px' }) } });
    expect(
      shadowed.container.querySelector('.jx-scroll-veil-layer')?.querySelectorAll('.jx-scroll-shadow'),
    ).toHaveLength(2);
    shadowed.unmount();

    const laddered = render(Host, { props: { scrollEffect: progressBlur({ blurLevels: [1, 2, 4] }) } });
    expect(laddered.container.querySelector('.jx-scroll-veil-layer')).not.toBeNull();
    laddered.unmount();

    // the ramp effects carry no veil
    const slid = render(Host, { props: { scrollEffect: slide() } });
    expect(slid.container.querySelector('.jx-scroll-veil-layer')).toBeNull();
  });

  it('the effect knobs ride the HOST inline (the shared --jx-scroll-* names)', () => {
    const { container } = render(Host, { props: { scrollEffect: blurSlide({ radius: '6px', distance: '10px' }) } });
    const style = container.querySelector('[data-jx-btngroup-host]')?.getAttribute('style') ?? '';
    expect(style).toContain('--jx-scroll-edge-blur: 6px');
    expect(style).toContain('--jx-scroll-edge-slide: 10px');
    const { container: shadowed } = render(Host, { props: { scrollEffect: shadow({ width: '48px' }) } });
    expect(shadowed.querySelector('[data-jx-btngroup-host]')?.getAttribute('style')).toContain(
      '--jx-scroll-veil: 48px',
    );
  });

  it('a VERTICAL scroll group gets the bare block-axis scroller — no host, no chrome', () => {
    const { container } = render(Host, { props: { orientation: 'vertical' } });
    expect(container.querySelector('[data-jx-btngroup-host]')).toBeNull();
    expect(container.querySelector('[data-jx-scroll-chevron]')).toBeNull();
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.hasAttribute('data-jx-scroll-run')).toBe(true);
    expect(run.getAttribute('data-axis')).toBe('vertical');
    expect(run.hasAttribute('data-scroll-effect')).toBe(false); // chrome is the horizontal contract
  });
});

describe('ButtonGroup · the scroll-effect builders (re-exported from the shared item)', () => {
  it('export the typed descriptors with the restraint defaults', () => {
    expect(slide()).toEqual({ type: 'slide', distance: '8px' });
    expect(slide({ distance: '12px' }).distance).toBe('12px');
    expect(blur()).toEqual({ type: 'blur', radius: '4px' });
    expect(blurSlide({ radius: '6px' })).toEqual({ type: 'blur+slide', radius: '6px', distance: '8px' });
    expect(shadow()).toEqual({ type: 'shadow', width: undefined });
    expect(shadow({ width: '48px' }).width).toBe('48px');
    expect(progressBlur({ blurLevels: [1, 2] }).blurLevels).toEqual([1, 2]);
    // the restraint ruling's default ladder (round 2): the peak caps at 4px
    expect(progressBlur().blurLevels).toEqual([0.25, 0.5, 1, 1.5, 2.5, 4]);
  });
});

describe('the SHARED scroll-run css law (source-pinned, scroll-run.css)', () => {
  it('the run IS the scroller: hidden scrollbar, smooth travel, lane-clearing scroll-padding — and NO snap; position:relative is the offsetParent law', () => {
    expect(scrollRunCss).toMatch(
      /\[data-jx-scroll-run\]\[data-axis='horizontal'\]\)\s*\{[^}]*grid-area:\s*1\s*\/\s*1;[^}]*position:\s*relative;[^}]*overflow-x:\s*auto;[^}]*scrollbar-width:\s*none;[^}]*scroll-padding-inline:[^;]*;[^}]*scroll-behavior:\s*smooth;/s,
    );
    expect(scrollRunCss).toMatch(
      /\[data-jx-scroll-run\]\[data-axis='vertical'\]\)\s*\{[^}]*overflow-y:\s*auto;/s,
    );
    const rules = scrollRunCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rules).not.toMatch(/scroll-snap/);
  });

  it('THE CHIP RULING: the frosted edge chip — inset·1.5 square, centered, tucked, frosted, 14px canvas glyph, no mask/blend/hover', () => {
    expect(scrollRunCss).toMatch(/--jx-scroll-chevron-size:\s*14px;/);
    expect(scrollRunCss).toMatch(/--jx-scroll-chevron-chip:\s*oklab\(1\s*0\s*0\s*\/\s*0\.8\);/);
    const chip =
      scrollRunCss.match(
        /\[data-jx-scroll-chevron='inline-start'\]\),\s*\n\s*:where\(\[data-jx-scroll-chevron='inline-end'\]\)\s*\{([^}]*)\}/s,
      )?.[1] ?? '';
    expect(chip).toMatch(/align-self:\s*center;/);
    expect(chip).toMatch(/inline-size:\s*calc\(var\(--jx-inset\)\s*\*\s*1\.5\);/);
    expect(chip).toMatch(/block-size:\s*calc\(var\(--jx-inset\)\s*\*\s*1\.5\);/);
    expect(chip).toMatch(/background-color:\s*var\(--jx-scroll-chevron-chip\);/);
    expect(chip).toMatch(/box-shadow:\s*1px\s*1px\s*2px\s*hsl\(0\s*0%\s*0%\s*\/\s*0\.2\);/);
    expect(chip).toMatch(/backdrop-filter:\s*blur\(2px\);/);
    expect(chip).not.toMatch(/mask/);
    expect(chip).not.toMatch(/mix-blend-mode/);
    expect(scrollRunCss).not.toMatch(/\[data-jx-scroll-chevron[^\]]*\]\):hover/);
    expect(scrollRunCss).toMatch(/--jx-scroll-veil:\s*calc\(var\(--jx-inset\)\s*\*\s*1\.5\);/);
  });

  it('the per-member ramps consume the edge stamps SQUARED (the eased curve)', () => {
    expect(scrollRunCss).toMatch(
      /\[data-jx-scroll-run\]\[data-scroll-effect='slide'\]\)\s*>\s*\*\s*\{[^}]*opacity:\s*calc\(1\s*-\s*max\(var\(--jx-edge-start,\s*0\),\s*var\(--jx-edge-end,\s*0\)\)\s*\*\s*max\(var\(--jx-edge-start,\s*0\),\s*var\(--jx-edge-end,\s*0\)\)\);/s,
    );
    expect(scrollRunCss).toMatch(
      /\[data-jx-scroll-run\]\[data-scroll-effect='blur'\]\)\s*>\s*\*\s*\{[^}]*filter:\s*blur\(calc\(max\(var\(--jx-edge-start,\s*0\),\s*var\(--jx-edge-end,\s*0\)\)\s*\*\s*max\(var\(--jx-edge-start,\s*0\),\s*var\(--jx-edge-end,\s*0\)\)\s*\*\s*var\(--jx-scroll-edge-blur,\s*0px\)\)\)/s,
    );
  });

  it('the verdict gates: chips and the veil layer never paint without travel (the veil gates sit UNLAYERED)', () => {
    expect(scrollRunCss).toMatch(
      /\.jx-scroll-host\):has\(\s*>\s*\[data-jx-scroll-run\]\[data-jx-scroll-state='none'\]\)\s*>\s*:where\(\[data-jx-scroll-chevron\]\)/,
    );
    const gatesAt = scrollRunCss.indexOf('veil-layer gates are UNLAYERED');
    expect(gatesAt).toBeGreaterThan(scrollRunCss.search(/@layer components\s*\{/));
    const gates = scrollRunCss.slice(gatesAt);
    expect(gates).toMatch(
      /:has\(\s*>\s*\[data-jx-scroll-run\]\[data-jx-scroll-state='none'\]\)\s*>\s*:where\(\.jx-scroll-veil-layer\)/,
    );
    expect(gates).toMatch(
      /:has\(\s*>\s*\[data-jx-scroll-run\]:not\(\[data-jx-scroll-state\]\)\)\s*>\s*:where\(\.jx-scroll-veil-layer\)/,
    );
  });

  it('THE FAMILY SHEET CARRIES NOTHING SCROLL-PAINTED (the unification): no run/chip/veil/ramp rules in button-group.css', () => {
    const rules = buttonGroupCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rules).not.toMatch(/data-jx-scroll-run/);
    expect(rules).not.toMatch(/jx-scroll-host/);
    expect(rules).not.toMatch(/jx-scroll-veil/);
    expect(rules).not.toMatch(/data-scroll-effect/);
    expect(rules).not.toMatch(/--jx-scroll-/);
  });
});

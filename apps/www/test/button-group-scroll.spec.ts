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
  progressBlur,
  ramp,
  shadow,
} from '../src/lib/ui/button-group/button-group.svelte';

const scrollRunCss = readFileSync(resolve(process.cwd(), 'src/lib/ui/scroll-run/scroll-run.css'), 'utf8');
const buttonGroupCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/button-group/button-group.css'),
  'utf8',
);

describe('ButtonGroup · overflow=scroll · structure (the shared contract)', () => {
  it('renders the HOST wrapping the RUN; the run carries the shared run + axis stamps (ScrollChrome owns the effect attrs)', () => {
    const { container } = render(Host, { props: { scrollEffect: ramp({ distance: '12px' }) } });
    const host = container.querySelector('[data-jx-btngroup-host]');
    expect(host).not.toBeNull();
    expect(host?.classList.contains('jx-scroll-host')).toBe(true);
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.hasAttribute('data-jx-scroll-run')).toBe(true);
    expect(run.getAttribute('data-axis')).toBe('horizontal');
    expect(run.getAttribute('data-scroll-effect')).toBe('ramp');
    expect(run.hasAttribute('data-ramp-opacity')).toBe(true);
    expect(run.hasAttribute('data-ramp-blur')).toBe(true);
    expect(run.hasAttribute('data-ramp-translate')).toBe(true);
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
    const start = host.querySelector('[data-jx-scroll-chevron="start"]');
    const end = host.querySelector('[data-jx-scroll-chevron="end"]');
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
    const ramped = render(Host, { props: { scrollEffect: ramp() } });
    expect(ramped.container.querySelector('.jx-scroll-veil-layer')).toBeNull();
  });

  it('the ramp magnitudes are CHROME-STAMPED on the run (round 3) — the host carries no edge vars', () => {
    const { container } = render(Host, { props: { scrollEffect: ramp({ radius: '6px', distance: '10px' }) } });
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.style.getPropertyValue('--jx-scroll-edge-blur')).toBe('6px');
    expect(run.style.getPropertyValue('--jx-scroll-edge-slide')).toBe('10px');
    expect(container.querySelector('[data-jx-btngroup-host]')?.getAttribute('style') ?? '').not.toContain('--jx-scroll-edge-');
    const { container: shadowed } = render(Host, { props: { scrollEffect: shadow({ width: '48px' }) } });
    expect(shadowed.querySelector('[data-jx-btngroup-host]')?.getAttribute('style')).toContain(
      '--jx-scroll-veil: 48px',
    );
  });

  it('a VERTICAL scroll group rides the SAME chrome on the block axis (round 2: axis-aware)', () => {
    const { container } = render(Host, { props: { orientation: 'vertical' } });
    expect(container.querySelector('[data-jx-btngroup-host]')).not.toBeNull();
    // the logical chips render for either axis (the css places them
    // against the block edges on a vertical run)
    expect(container.querySelectorAll('[data-jx-scroll-chevron="start"], [data-jx-scroll-chevron="end"]')).toHaveLength(2);
    const run = container.querySelector('[data-testid="scroll-group"]')!;
    expect(run.hasAttribute('data-jx-scroll-run')).toBe(true);
    expect(run.getAttribute('data-axis')).toBe('vertical');
    expect(run.getAttribute('data-scroll-effect')).toBe('ramp');
  });
});

describe('ButtonGroup · the scroll-effect builders (re-exported from the shared item)', () => {
  it('export the typed descriptors with the restraint defaults (round 2: the merged ramp)', () => {
    // the ONE member-ramp builder: every toggle defaults ON
    expect(ramp()).toEqual({
      type: 'ramp',
      opacity: true,
      blur: true,
      translate: true,
      distance: '8px',
      radius: '4px',
    });
    expect(ramp({ distance: '12px' }).distance).toBe('12px');
    expect(ramp({ radius: '6px' }).radius).toBe('6px');
    // the retired trio never returns
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

  it('THE CHIP RULING: the frosted edge chip — inset·1.5 square, in-board, cross-axis centered, frosted, 14px canvas glyph, no mask/blend; hover RAISES it (round 10)', () => {
    expect(scrollRunCss).toMatch(/--jx-scroll-chevron-size:\s*14px;/);
    expect(scrollRunCss).toMatch(/--jx-scroll-chevron-chip:\s*oklab\(1\s*0\s*0\s*\/\s*0\.8\);/);
    const chip =
      scrollRunCss.match(
        /\[data-jx-scroll-chevron='start'\]\),\s*\n\s*:where\(\[data-jx-scroll-chevron='end'\]\)\s*\{([^}]*)\}/s,
      )?.[1] ?? '';
    expect(chip).toMatch(/align-self:\s*center;/);
    expect(chip).toMatch(/inline-size:\s*calc\(var\(--jx-inset\)\s*\*\s*1\.5\);/);
    expect(chip).toMatch(/block-size:\s*calc\(var\(--jx-inset\)\s*\*\s*1\.5\);/);
    expect(chip).toMatch(/background-color:\s*var\(--jx-scroll-chevron-chip\);/);
    expect(chip).toMatch(/box-shadow:\s*1px\s*1px\s*2px\s*hsl\(0\s*0%\s*0%\s*\/\s*0\.2\);/);
    expect(chip).toMatch(/backdrop-filter:\s*blur\(2px\);/);
    expect(chip).not.toMatch(/mask/);
    expect(chip).not.toMatch(/mix-blend-mode/);
    // round 10: the retired-hover era ENDS — hover raises the frost
    // toward opaque and deepens the lift (the ink is a host var)
    expect(scrollRunCss).toMatch(/--jx-scroll-chevron-chip-hover:\s*oklab\(1\s+0\s+0\s*\/\s*0\.95\);/);
    expect(scrollRunCss).toMatch(
      /:where\(\[data-jx-scroll-chevron\]:hover\)\s*\{[^}]*background-color:\s*var\(--jx-scroll-chevron-chip-hover\);[^}]*box-shadow:\s*2px\s+2px\s+6px\s+hsl\(0\s+0%\s+0%\s*\/\s*0\.3\);/s,
    );
    // the transition carries ONLY the hover pair — the opacity fade is
    // scroll-driven and must never animate
    expect(scrollRunCss).toMatch(/transition:\s*background-color\s+120ms\s+ease-out,\s*box-shadow\s+120ms\s+ease-out;/);
    expect(scrollRunCss).toMatch(/--jx-scroll-veil:\s*calc\(var\(--jx-inset\)\s*\*\s*1\.5\);/);
    // round 3: IN-BOARD — the negative-edge tuck margins are gone
    expect(scrollRunCss).not.toMatch(/margin-(inline|block)-(start|end):\s*calc\(var\(--jx-inset\)\s*\*\s*-1/);
  });

  it('the per-member ramps consume the edge stamps SQUARED (the eased curve) — ONE builder, per-toggle flags', () => {
    // rule-body extraction + plain containment: immune to regex-escape
    // drift (the decl is calc(...) with nested parens)
    const ruleFor = (flag: string) =>
      scrollRunCss.match(
        new RegExp(`\\[data-scroll-effect='ramp'\\]\\[data-ramp-${flag}\\]\\)\\s*>\\s*\\*\\s*\\{([^}]*)\\}`),
      )?.[1] ?? '';
    expect(ruleFor('opacity'), 'the opacity rule body').toContain(
      'opacity: calc(1 - max(var(--jx-edge-start, 0), var(--jx-edge-end, 0)) * max(var(--jx-edge-start, 0), var(--jx-edge-end, 0)))',
    );
    expect(ruleFor('blur'), 'the blur rule body').toMatch(
      /filter:\s*blur\(calc\(max\(var\(--jx-edge-start, 0\), var\(--jx-edge-end, 0\)\) \* max\(var\(--jx-edge-start, 0\), var\(--jx-edge-end, 0\)\) \* var\(--jx-scroll-edge-blur, 0px\)\)\)/,
    );
    expect(ruleFor('translate'), 'the translate rule body').toMatch(
      /translate:\s*calc\(\(var\(--jx-edge-end, 0\) - var\(--jx-edge-start, 0\)\) \* max\(var\(--jx-edge-start, 0\), var\(--jx-edge-end, 0\)\) \* var\(--jx-scroll-edge-slide, 0px\)\) 0/,
    );
    // each flag gates its OWN property: the siblings' declarations
    // never ride along
    expect(ruleFor('opacity')).not.toMatch(/filter|translate/);
    expect(ruleFor('blur')).not.toMatch(/opacity|translate/);
    expect(ruleFor('translate')).not.toMatch(/opacity|filter/);
    // the retired trio's type keys never return
    expect(scrollRunCss).not.toMatch(/data-scroll-effect='(slide|blur|blur\+slide)'/);
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

/**
 * scroll-run.spec — the shared system's own contract, round 2
 * (Owner 2026-09-04: 垂直滚动 · 自定义 scroll-button · 内容不足则
 * scroll-button 不出现 · the merged ramp() builder).
 *
 * The family specs (tabs-indicator, button-group-scroll) pin the
 * consumer integrations and the css law source; THIS spec pins the
 * system's own behaviors that no family exercises alone:
 *  - the none-verdict law: a run whose content cannot scroll stamps
 *    'none' and the css gates BOTH chips (and the veil layer) out —
 *    and the verdict FOLLOWS the content (a member removed re-verdicts
 *    through the childList MutationObserver, jsdom's zero layout makes
 *    every run 'none' here — the insufficient-content posture itself)
 *  - the vertical axis: the machine measures along the block axis, the
 *    nudge steps along the block axis, the chrome substitutes the
 *    shadow veil for the inline-only progressBlur ladder
 *  - the custom chip content: the snippets render INSIDE the chip
 *    buttons; the frost/gating/button law stays, the glyph retires
 *    (data-jx-scroll-chip-content)
 *  - the merged ramp(): one builder, three toggles, and ScrollChrome
 *    owns the run's effect attributes (type + flags)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';

import Host from './fixtures/scroll-run-host.svelte';
import {
  createScrollStamp,
  nudgeRun,
  progressBlur,
  ramp,
  shadow,
} from '../src/lib/ui/scroll-run/scroll-run.svelte';

const scrollRunCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/scroll-run/scroll-run.css'),
  'utf8',
);
const chromeSource = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/scroll-run/scroll-chrome.svelte'),
  'utf8',
);

// ---- the insufficient-content law (requirement 3) --------------------
describe('scroll-run · the none-verdict law (content that cannot scroll paints NO chips)', () => {
  it("a run whose content cannot scroll stamps data-jx-scroll-state='none' (jsdom's zero layout IS the posture)", () => {
    const { container } = render(Host, { props: { scrollEffect: ramp() } });
    expect(container.querySelector('[data-testid="run"]')?.getAttribute('data-jx-scroll-state')).toBe('none');
  });

  it('the css gates BOTH chips and the veil layer out under the none verdict (source-pinned)', () => {
    const gate = /data-jx-scroll-state='none'\]\)\s*>\s*:where\(\[data-jx-scroll-chevron\]\)/;
    expect(scrollRunCss).toMatch(gate);
    expect(scrollRunCss).toMatch(
      /data-jx-scroll-state='none'\]\)\s*>\s*:where\(\.jx-scroll-veil-layer\),[\s\S]{0,120}?:not\(\[data-jx-scroll-state\]\)\)\s*>\s*:where\(\.jx-scroll-veil-layer\)\s*\{[^}]*display:\s*none/s,
    );
  });

  it('the verdict FOLLOWS the content: a member removed re-verdicts through the childList MutationObserver', async () => {
    const run = document.createElement('div');
    run.setAttribute('data-jx-scroll-run', '');
    run.setAttribute('data-axis', 'horizontal');
    const a = document.createElement('span');
    const b = document.createElement('span');
    run.append(a, b);
    document.body.append(run);
    const stamp = createScrollStamp({
      run,
      host: null,
      members: () => [...run.children].filter((c): c is HTMLElement => c instanceof HTMLElement),
      ramps: true,
    });
    expect(run.getAttribute('data-jx-scroll-state')).toBe('none');
    run.removeAttribute('data-jx-scroll-state'); // pretend staleness
    b.remove(); // membership change must re-stamp
    await new Promise((r) => setTimeout(r, 0));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('none');
    stamp.destroy();
    run.remove();
  });
});

// ---- the vertical axis (requirement 1) --------------------------------
describe('scroll-run · the vertical axis', () => {
  it('the vertical run arm carries the full contract parity (grid cell, relative, block lane)', () => {
    const arm = scrollRunCss.match(/\[data-jx-scroll-run\]\[data-axis='vertical'\]\)\s*\{([^}]*)\}/s)?.[1] ?? '';
    expect(arm).toMatch(/grid-area:\s*1\s*\/\s*1/);
    expect(arm).toMatch(/position:\s*relative/);
    expect(arm).toMatch(/overflow-y:\s*auto/);
    expect(arm).toMatch(/scroll-padding-block:/);
  });

  it('nudgeRun steps along the BLOCK axis on a vertical run (no inline mapping)', () => {
    const run = document.createElement('div');
    run.setAttribute('data-jx-scroll-run', '');
    run.setAttribute('data-axis', 'vertical');
    const by = vi.fn();
    run.scrollBy = by as never;
    nudgeRun(run, 1);
    expect(by).toHaveBeenCalledWith(expect.objectContaining({ top: expect.any(Number) }));
  });

  it('nudgeRun steps along the INLINE axis on a horizontal run', () => {
    const run = document.createElement('div');
    run.setAttribute('data-jx-scroll-run', '');
    run.setAttribute('data-axis', 'horizontal');
    const by = vi.fn();
    run.scrollBy = by as never;
    nudgeRun(run, -1);
    expect(by).toHaveBeenCalledWith(expect.objectContaining({ left: expect.any(Number) }));
  });

  it('the chips place against the BLOCK edges on a vertical host — horizontally CENTERED, painting the up/down slots (source-pinned)', () => {
    expect(scrollRunCss).toMatch(
      /:has\(\s*>\s*\[data-jx-scroll-run\]\[data-axis='vertical'\]\)\s*\n?\s*>\s*\[data-jx-scroll-chevron='start'\]\)?\s*\{[^}]*align-self:\s*start;[^}]*justify-self:\s*center;[^}]*background-image:\s*var\(--jx-scroll-chevron-up\)/s,
    );
    expect(scrollRunCss).toMatch(
      /:has\(\s*>\s*\[data-jx-scroll-run\]\[data-axis='vertical'\]\)\s*\n?\s*>\s*\[data-jx-scroll-chevron='end'\]\)?\s*\{[^}]*align-self:\s*end;[^}]*justify-self:\s*center;[^}]*background-image:\s*var\(--jx-scroll-chevron-down\)/s,
    );
    // the axis funnel rides INSIDE :where() — a :has() outside it
    // would out-specify the custom-content rule and double-paint the
    // glyph (the live-caught bug)
    expect(scrollRunCss).toMatch(
      /:where\(\.jx-scroll-host:has\(\s*>\s*\[data-jx-scroll-run\]\[data-axis='vertical'\]\)/s,
    );
    expect(scrollRunCss).not.toMatch(/:where\(\.jx-scroll-host\):has\(\s*>\s*\[data-jx-scroll-run\]\[data-axis='vertical'\]\)\s*\n?\s*>\s*\[data-jx-scroll-chevron/s);
  });

  it('FOUR direction glyph slots — one per physical direction, independently swappable; RTL swaps the inline pair (source-pinned)', () => {
    // the four customization slots live on the host var family
    for (const dir of ['left', 'right', 'up', 'down']) {
      expect(scrollRunCss).toMatch(new RegExp(`--jx-scroll-chevron-${dir}:\\s*url\\(`));
    }
    // the horizontal chips read the left/right slots
    expect(scrollRunCss).toMatch(
      /:where\(\[data-jx-scroll-chevron='start'\]\)\s*\{[^}]*background-image:\s*var\(--jx-scroll-chevron-left\)/s,
    );
    expect(scrollRunCss).toMatch(
      /:where\(\[data-jx-scroll-chevron='end'\]\)\s*\{[^}]*background-image:\s*var\(--jx-scroll-chevron-right\)/s,
    );
    // RTL flips the inline pair (the block pair never flips)
    expect(scrollRunCss).toMatch(
      /:dir\(rtl\)\s*:where\(\[data-jx-scroll-chevron='start'\]\)\s*\{[^}]*background-image:\s*var\(--jx-scroll-chevron-right\)/s,
    );
    expect(scrollRunCss).toMatch(
      /:dir\(rtl\)\s*:where\(\[data-jx-scroll-chevron='end'\]\)\s*\{[^}]*background-image:\s*var\(--jx-scroll-chevron-left\)/s,
    );
    // the old two-var re-aim block never returns
    expect(scrollRunCss).not.toMatch(/--jx-scroll-chevron-(start|end)/);
  });

  it('the chips sit IN-BOARD: no negative-edge tuck margins survive (source-pinned)', () => {
    expect(scrollRunCss).not.toMatch(/margin-inline-(start|end):\s*calc\(var\(--jx-inset\)\s*\*\s*-1/);
    expect(scrollRunCss).not.toMatch(/margin-block-(start|end):\s*calc\(var\(--jx-inset\)\s*\*\s*-1/);
  });

  it('the vertical veil entrance slides along the BLOCK axis; the shadow bands re-aim + STRETCH (source-pinned)', () => {
    expect(scrollRunCss).toMatch(
      /:has\(\s*>\s*\[data-jx-scroll-run\]\[data-axis='vertical'\]\)\s*\n?\s*>\s*:where\(\.jx-scroll-veil-layer\)\s*>\s*:where\(\.jx-scroll-veil\)\[data-position='start'\]\s*\{[^}]*translate:\s*0\s*calc\(/s,
    );
    // the vertical bands span the full inline width: width auto + STRETCH
    // (stretch is load-bearing — the horizontal start/end rules match
    // these bands too and would collapse the auto width to 0)
    expect(scrollRunCss).toMatch(
      /:has\(\s*>\s*\[data-jx-scroll-run\]\[data-axis='vertical'\]\)\s*\n?\s*>\s*:where\(\.jx-scroll-veil-layer\)\s*>\s*:where\(\.jx-scroll-shadow\)\s*\{[^}]*width:\s*auto;[^}]*height:\s*var\(--jx-scroll-veil\);[^}]*justify-self:\s*stretch;/s,
    );
    // the horizontal placement lives in the SHEET (never as markup
    // utilities — the utilities layer would beat the vertical rules)
    expect(scrollRunCss).toMatch(
      /:where\(\.jx-scroll-shadow\)\[data-position='start'\]\s*\{[^}]*justify-self:\s*start;/s,
    );
    expect(scrollRunCss).toMatch(
      /:where\(\.jx-scroll-shadow\)\[data-position='end'\]\s*\{[^}]*justify-self:\s*end;/s,
    );
    expect(chromeSource).not.toMatch(/jx-scroll-shadow[^"]*justify-self/);
  });

  it('the vertical ramp translates along the BLOCK axis (source-pinned)', () => {
    expect(scrollRunCss).toMatch(
      /\[data-ramp-translate\]\[data-axis='vertical'\]\)\s*>\s*\*\s*\{[^}]*translate:\s*0\s*calc\(/s,
    );
  });

  it('a vertical run substitutes the SHADOW veil for the inline-only progressBlur ladder', async () => {
    const { container } = render(Host, {
      props: { axis: 'vertical', scrollEffect: progressBlur() },
    });
    await tick();
    const layer = container.querySelector('.jx-scroll-veil-layer')!;
    expect(layer).not.toBeNull();
    // the ladder never mounts on the block axis — the shadow bands do
    expect(layer.querySelector('.jx-pblur')).toBeNull();
    expect(layer.querySelectorAll('.jx-scroll-shadow')).toHaveLength(2);
  });

  it('a horizontal run mounts the ladder under progressBlur', () => {
    const { container } = render(Host, { props: { scrollEffect: progressBlur() } });
    expect(container.querySelectorAll('.jx-scroll-veil-layer .jx-pblur')).toHaveLength(2);
  });
});

// ---- the custom scroll-button (requirement 2) -------------------------
describe('scroll-run · custom chip content', () => {
  it('the content snippets render INSIDE the chip buttons — the button law, frost and gating stay', async () => {
    const { container } = render(Host, {
      props: { scrollEffect: ramp(), custom: true },
    });
    await tick();
    const start = container.querySelector('[data-jx-scroll-chevron="start"]')!;
    const end = container.querySelector('[data-jx-scroll-chevron="end"]')!;
    expect(start.querySelector('[data-glyph="back"]')?.textContent).toContain('«prev');
    expect(end.querySelector('[data-glyph="fwd"]')?.textContent).toContain('next»');
    // still real buttons with the labels; the glyph layer retires
    expect(start.tagName).toBe('BUTTON');
    expect(start.getAttribute('aria-label')).toBe('Scroll back');
    expect(start.hasAttribute('data-jx-scroll-chip-content')).toBe(true);
  });

  it('a default chip carries NO content flag — the css glyph layer paints (source-pinned + dom)', () => {
    const { container } = render(Host, { props: { scrollEffect: ramp() } });
    expect(container.querySelector('[data-jx-scroll-chevron="start"]')!.hasAttribute('data-jx-scroll-chip-content')).toBe(false);
    expect(scrollRunCss).toMatch(/\[data-jx-scroll-chevron\]\[data-jx-scroll-chip-content\]\)\s*\{[^}]*background-image:\s*none/s);
  });

  it('a content chip CENTERS its content: the box law is grid + place-items (source-pinned)', () => {
    expect(scrollRunCss).toMatch(
      /\[data-jx-scroll-chevron\]\[data-jx-scroll-chip-content\]\)\s*\{[^}]*display:\s*grid;[^}]*place-items:\s*center;[^}]*background-image:\s*none/s,
    );
  });

  it('a chip can be DECLARED disabled (default rendered) — a disabled chip does not render AT ALL', async () => {
    // default: both chips in the DOM
    const { container, rerender } = render(Host, { props: { scrollEffect: ramp() } });
    await tick();
    expect(container.querySelector('[data-jx-scroll-chevron="start"]')).not.toBeNull();
    expect(container.querySelector('[data-jx-scroll-chevron="end"]')).not.toBeNull();
    // declared: the buttons are GONE from the DOM (completely hidden,
    // Owner round 7 — not inert paint, absence)
    await rerender({ props: { scrollEffect: ramp(), disabled: true } });
    await tick();
    expect(container.querySelector('[data-jx-scroll-chevron="start"]')).toBeNull();
    expect(container.querySelector('[data-jx-scroll-chevron="end"]')).toBeNull();
    // the sheet carries no :disabled inert arm — hiding lives in the
    // conditional render, not in paint
    expect(scrollRunCss).not.toMatch(/\[data-jx-scroll-chevron\]:disabled/);
  });
});

// ---- the merged ramp (the breaking change) ----------------------------
describe('scroll-run · the merged ramp builder + chrome ownership', () => {
  it('ramp() defaults every toggle ON; the toggles compose with the magnitudes', () => {
    expect(ramp()).toEqual({
      type: 'ramp',
      opacity: true,
      blur: true,
      translate: true,
      distance: '8px',
      radius: '4px',
    });
    expect(ramp({ opacity: false, translate: false })).toMatchObject({ opacity: false, translate: false, blur: true });
  });

  it('ScrollChrome owns the run effect attributes: type + per-toggle flags, cleared on flips', async () => {
    const { container, rerender } = render(Host, { props: { scrollEffect: ramp() } });
    await tick();
    const run = container.querySelector('[data-testid="run"]')!;
    expect(run.getAttribute('data-scroll-effect')).toBe('ramp');
    expect(run.hasAttribute('data-ramp-opacity')).toBe(true);
    expect(run.hasAttribute('data-ramp-blur')).toBe(true);
    expect(run.hasAttribute('data-ramp-translate')).toBe(true);
    await rerender({ props: { scrollEffect: ramp({ blur: false }) } });
    await tick();
    expect(run.hasAttribute('data-ramp-blur')).toBe(false);
    expect(run.hasAttribute('data-ramp-translate')).toBe(true);
    await rerender({ props: { scrollEffect: shadow() } });
    await tick();
    expect(run.getAttribute('data-scroll-effect')).toBe('shadow');
    expect(run.hasAttribute('data-ramp-opacity')).toBe(false);
    expect(run.hasAttribute('data-ramp-translate')).toBe(false);
  });

  it('each css ramp property keys its OWN flag (source-pinned) — a toggle off never pays its property', () => {
    for (const flag of ['opacity', 'blur', 'translate']) {
      expect(scrollRunCss).toMatch(
        new RegExp(`\\[data-scroll-effect='ramp'\\]\\[data-ramp-${flag}\\]\\)\\s*>\\s*\\*\\s*\\{`),
      );
    }
    // the retired trio's type keys never return
    expect(scrollRunCss).not.toMatch(/data-scroll-effect='(slide|blur|blur\+slide)'/);
  });

  it('ScrollChrome owns the ramp MAGNITUDES: distance/radius land on the run as inline vars, cleared with their toggles (round 3)', async () => {
    const { container, rerender } = render(Host, { props: { scrollEffect: ramp() } });
    await tick();
    const run = container.querySelector('[data-testid="run"]')!;
    // the builder defaults reach the DOM out of the box — a bare ramp()
    // visibly blurs and translates with no consumer styling
    expect(run.style.getPropertyValue('--jx-scroll-edge-slide')).toBe('8px');
    expect(run.style.getPropertyValue('--jx-scroll-edge-blur')).toBe('4px');
    await rerender({ props: { scrollEffect: ramp({ blur: false, radius: '6px', distance: '12px' }) } });
    await tick();
    expect(run.style.getPropertyValue('--jx-scroll-edge-slide')).toBe('12px');
    // a toggle off never sets its var — the magnitude retires with it
    expect(run.style.getPropertyValue('--jx-scroll-edge-blur')).toBe('');
    await rerender({ props: { scrollEffect: shadow() } });
    await tick();
    // a non-ramp effect clears both (stale vars never outlive a flip)
    expect(run.style.getPropertyValue('--jx-scroll-edge-slide')).toBe('');
    expect(run.style.getPropertyValue('--jx-scroll-edge-blur')).toBe('');
  });
});

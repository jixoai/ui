/**
 * MathBlock behavior suite (test/math-block.spec.ts, 2026-09-06, the
 * katex-mermaid change — intent (Owner): "引入开箱即用的 KaTeX/Mermaid
 * 渲染组件").
 *
 * The display surface promises:
 *  - the SYNC SSR lane: real katex display markup rendered
 *    synchronously ($derived — no async upgrade, the markup IS the
 *    paint), inside the shared scroll-run rider (host + run +
 *    ScrollChrome) whose createScrollStamp verdict is armed in
 *    $effect;
 *  - role placement: the figure KEEPS figure semantics (no role
 *    override); role="math" sits on the INNER content wrapper only, so
 *    the copy control stays a discoverable interactive node;
 *  - the copy control (code-card pattern): clipboard payload is the
 *    RAW TeX source, execCommand fallback, 1.6s copied feedback, and a
 *    labels localization payload ({copy?, copied?}; absent = English
 *    verbatim);
 *  - the stamp machine's four verdict states (jsdom's zero layout IS
 *    the 'none' posture; Object.defineProperty simulates the scroll
 *    geometry for the other three — the tabs-indicator precedent) and
 *    the content-growth restest (a wider formula flips the verdict);
 *  - rest passthrough with the component's own stamps AFTER the spread
 *    (consumer data-testid/title land; data-jx-math-block/data-kind
 *    cannot be overridden);
 *  - errors paint in place (katex-error in var(--error)) with ONE
 *    console.warn diagnostic; a caller-forced throw (a throwing macro
 *    function) is caught by the surface — escaped raw source + warn.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tick } from 'svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import MathBlock from '../src/lib/ui/math-block/math-block.svelte';

const mathBlockCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/math-block/math-block.css'),
  'utf8',
);

// jsdom ships no clipboard (the copy path falls back) and no execCommand
document.execCommand = vi.fn(() => true) as unknown as typeof document.execCommand;

afterEach(() => {
  vi.restoreAllMocks();
});

/** pin fake scroll geometry on the run (the tabs-indicator precedent) */
function setGeometry(run: HTMLElement, scrollWidth: number, clientWidth: number): void {
  Object.defineProperty(run, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(run, 'clientWidth', { value: clientWidth, configurable: true });
}

/** stub navigator.clipboard for the grant path; returns a restore fn */
function stubClipboard(writeText: ReturnType<typeof vi.fn>): () => void {
  const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return () => {
    delete (navigator as { clipboard?: unknown }).clipboard;
    if (original) Object.defineProperty(Navigator.prototype, 'clipboard', original);
  };
}

describe('MathBlock · the sync render lane + structure', () => {
  it('renders real katex DISPLAY markup synchronously (no async upgrade to await)', () => {
    const { container } = render(MathBlock, { props: { tex: '\\int_0^1 x^2\\,dx = \\tfrac{1}{3}' } });
    const math = container.querySelector('[data-jx-math-block] [role="math"]')!;
    expect(math).not.toBeNull();
    expect(math.querySelector('.katex')).not.toBeNull();
    expect(math.querySelector('.katex-display')).not.toBeNull();
    expect(math.querySelector('.katex-mathml math')).not.toBeNull();
  });

  it('the figure KEEPS native figure semantics; role="math" is the INNER content wrapper; the copy button stays discoverable', () => {
    const { container, getByRole } = render(MathBlock, { props: { tex: 'E = mc^2' } });
    const figure = container.querySelector('figure[data-kind="math"][data-jx-math-block]')!;
    expect(figure).not.toBeNull();
    // no role override on the figure (native-element-first)
    expect(figure.hasAttribute('role')).toBe(false);
    // role="math" lives on the wrapper carrying ONLY the katex output
    const inner = figure.querySelector('[data-jx-scroll-run] > [role="math"]')!;
    expect(inner.querySelector('.katex')).not.toBeNull();
    expect(inner.querySelector('button')).toBeNull();
    // the control is a real reachable button OUTSIDE the math wrapper
    expect(getByRole('button', { name: 'copy' })).toBeTruthy();
  });

  it('rides the shared scroll-run contract: grid host, run hooks, shadow veil layer + chips from ScrollChrome', async () => {
    const { container } = render(MathBlock, { props: { tex: 'x' } });
    await tick();
    expect(container.querySelector('.jx-scroll-host.grid')).not.toBeNull();
    const run = container.querySelector('[data-jx-scroll-run][data-axis="horizontal"]')!;
    expect(run).not.toBeNull();
    // the shadow veil pair mounts (verdict-gated by the shared css, not by JS)
    expect(container.querySelectorAll('.jx-scroll-veil-layer .jx-scroll-shadow')).toHaveLength(2);
    expect(container.querySelector('[data-jx-scroll-chevron="start"]')).not.toBeNull();
    expect(container.querySelector('[data-jx-scroll-chevron="end"]')).not.toBeNull();
  });

  it('rest passthrough: data-testid/title land; the component stamps win their own fields; class merges', () => {
    const { container } = render(MathBlock, {
      props: {
        tex: 'x',
        'data-testid': 'pythagoras',
        title: 'Pythagoras',
        // the conflict pin: consumer attributes of the component's own
        // semantic fields LOSE (spread order law — Svelte later-wins)
        'data-jx-math-block': 'x',
        'data-kind': 'other',
        class: 'wide-eq',
      },
    });
    const figure = container.querySelector('[data-testid="pythagoras"]')!;
    expect(figure.tagName).toBe('FIGURE');
    expect(figure.getAttribute('title')).toBe('Pythagoras');
    expect(figure.getAttribute('data-jx-math-block')).toBe('');
    expect(figure.getAttribute('data-kind')).toBe('math');
    expect(figure.className).toContain('wide-eq');
  });
});

describe('MathBlock · the copy control (code-card pattern, TeX payload)', () => {
  it('copies the RAW TeX source and flashes the copied feedback (default English labels)', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const restore = stubClipboard(writeText);
    try {
      const { container, getByRole } = render(MathBlock, { props: { tex: 'E = mc^2' } });
      const button = getByRole('button', { name: 'copy' });
      expect(button.textContent).toContain('copy');
      await fireEvent.click(button);
      // the payload is what the author wrote — the raw TeX, not painted markup
      expect(writeText).toHaveBeenCalledWith('E = mc^2');
      expect(button.textContent).toContain('copied');
      expect(container.querySelector('[data-jx-math-block-copy]')!.className).toContain('copied');
    } finally {
      restore();
    }
  });

  it('falls back to execCommand when no clipboard grant exists', async () => {
    const { getByRole } = render(MathBlock, { props: { tex: 'a + b' } });
    await fireEvent.click(getByRole('button', { name: 'copy' }));
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('labels localizes the control vocabulary; absent = English verbatim', async () => {
    const { getByRole } = render(MathBlock, {
      props: { tex: 'x', labels: { copy: '复制', copied: '已复制' } },
    });
    const button = getByRole('button', { name: '复制' });
    expect(button.textContent).toContain('复制');
    await fireEvent.click(button);
    expect(button.textContent).toContain('已复制');
  });

  it('copyable=false retires the control and the footer row', () => {
    const { container } = render(MathBlock, { props: { tex: 'x', copyable: false } });
    expect(container.querySelector('[data-jx-math-block-copy]')).toBeNull();
    expect(container.querySelector('[data-jx-math-block-foot]')).toBeNull();
  });
});

describe('MathBlock · the shared stamp verdict (scroll-run rider)', () => {
  it("a formula that fits stamps 'none' (jsdom's zero layout IS the posture)", async () => {
    const { container } = render(MathBlock, { props: { tex: 'a + b' } });
    await tick();
    expect(
      container.querySelector('[data-jx-scroll-run]')!.getAttribute('data-jx-scroll-state'),
    ).toBe('none');
  });

  it('the three traveling verdicts: start-closed → open → end-closed, with the host progress var', async () => {
    const { container } = render(MathBlock, { props: { tex: 'x' } });
    await tick();
    const run = container.querySelector('[data-jx-scroll-run]')! as HTMLElement;
    const host = container.querySelector('.jx-scroll-host')! as HTMLElement;
    // fake geometry: 600 of formula in a 200-wide run (the tabs-indicator precedent)
    setGeometry(run, 600, 200);
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('start-closed');
    expect(host.style.getPropertyValue('--jx-scroll-progress')).toBe('0');
    run.scrollLeft = 50;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('open');
    expect(host.style.getPropertyValue('--jx-scroll-progress')).toBe('0.125');
    run.scrollLeft = 400;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('end-closed');
    expect(host.style.getPropertyValue('--jx-scroll-progress')).toBe('1');
  });

  it('the verdict FOLLOWS the content: a wider formula re-tests from none to start-closed', async () => {
    const { container, rerender } = render(MathBlock, { props: { tex: 'a + b' } });
    await tick();
    const run = container.querySelector('[data-jx-scroll-run]')! as HTMLElement;
    expect(run.getAttribute('data-jx-scroll-state')).toBe('none');
    // the formula grows past the viewport — the derived swap restamps
    setGeometry(run, 900, 300);
    await rerender({ tex: '\\sum_{n=1}^{\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}' });
    await tick();
    expect(run.getAttribute('data-jx-scroll-state')).toBe('start-closed');
    // the NEW formula is the rendered content (the re-derive itself)
    expect(run.querySelector('[role="math"] .katex-display')).not.toBeNull();
  });
});

describe('MathBlock · errors never escape the boundary', () => {
  it('an invalid formula paints in place (katex-error in var(--error)) with ONE console.warn diagnostic', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(MathBlock, { props: { tex: '\\notacommand {' } });
    const error = container.querySelector('[role="math"] .katex-error')!;
    expect(error).not.toBeNull();
    expect(error.getAttribute('style')).toContain('var(--error)');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('KaTeX parse error'));
  });

  it('a caller-forced throw (a throwing macro function) degrades to the raw source paint + warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(MathBlock, {
      props: {
        tex: '\\boom + 1',
        macros: {
          '\\boom': () => {
            throw new Error('macro exploded');
          },
        },
      },
    });
    const math = container.querySelector('[role="math"]')!;
    // the raw TeX source paints in place — escaped, inert text
    expect(math.textContent).toContain('\\boom + 1');
    expect(math.querySelector('.katex')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      '[jixoai/math-block] KaTeX render failed; painting raw source:',
      expect.any(Error),
    );
  });
});

describe('MathBlock · math-block.css (source-pinned)', () => {
  it('carries the canonical layer prologue and :where() placement (the placement law)', () => {
    expect(mathBlockCss.startsWith('@layer theme, base, components, utilities;')).toBe(true);
    // every static rule opener inside @layer rides :where() — consumer utilities win
    const openers = mathBlockCss.match(/^ {2}[^\n]*\{ ?$/gm) ?? [];
    expect(openers.length).toBeGreaterThanOrEqual(1);
    for (const rule of openers) {
      expect(rule.trim()).toMatch(/^:where\(/);
    }
  });

  it('the scrollport tuning and the focus/reduced-motion carve-outs exist', () => {
    expect(mathBlockCss).toMatch(/:where\(\[data-jx-math-block\] \.scrollport\)\s*\{/);
    expect(mathBlockCss).toMatch(/:where\(\[data-jx-math-block-copy\]\):focus-visible/);
    expect(mathBlockCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*:where\(\[data-jx-math-block-copy\]\)/,
    );
  });

  // ---- fit mode (the no-scroll variant, Owner acceptance 2026-09-07) ----

  it('fit=true scales the formula down instead of scrolling (a font-size fit, never up)', async () => {
    const { container } = render(MathBlock, {
      props: { tex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', fit: true },
    });
    const figure = container.querySelector('figure[data-jx-math-block]') as HTMLElement;
    const run = figure.querySelector('[data-jx-scroll-run]') as HTMLElement;
    const math = figure.querySelector('[role="math"]') as HTMLElement;
    const katexEl = math.querySelector('.katex') as HTMLElement;
    expect(figure.hasAttribute('data-fit')).toBe(true);
    // a wide formula (900 true width) in a 400px box fits to ~44.2% (the
    // 0.5% anti-rounding shave) AND the verdict re-measures to none —
    // the stale-verdict bug (r2: the stamp watched only the run's border
    // box) and the centered-overflow under-measurement (r3: scrollWidth
    // sees only the RIGHT half of a centered nowrap line — the TRUE
    // width comes from a Range rect) are both pinned here
    // jsdom ranges lay out to zero-width — stub the range the fitter
    // builds (the TRUE 900 spans both sides of the centered line)
    vi.spyOn(document, 'createRange').mockImplementation(() => ({
      selectNodeContents: () => {},
      getBoundingClientRect: () => ({ width: 900, left: -250, right: 650, top: 0, bottom: 10, x: -250, y: 0 }),
    }) as unknown as Range);
    Object.defineProperty(katexEl, 'scrollWidth', { value: 650, configurable: true }); // the RIGHT half only — must NOT be trusted
    Object.defineProperty(run, 'clientWidth', { value: 400, configurable: true });
    // the fitted geometry the run now reports (content no longer overflows)
    setGeometry(run, 400, 400);
    window.dispatchEvent(new Event('resize'));
    await vi.waitFor(() => {
      expect(math.style.fontSize).toBe('44.222%');
      expect(run.getAttribute('data-jx-scroll-state')).toBe('none');
    });
  });

  it('fit never scales UP (a short formula keeps its natural size)', async () => {
    const { container } = render(MathBlock, {
      props: { tex: 'a^2 + b^2 = c^2', fit: true },
    });
    const figure = container.querySelector('figure[data-jx-math-block]') as HTMLElement;
    const run = figure.querySelector('[data-jx-scroll-run]') as HTMLElement;
    const math = figure.querySelector('[role="math"]') as HTMLElement;
    const katexEl = math.querySelector('.katex') as HTMLElement;
    Object.defineProperty(katexEl, 'scrollWidth', { value: 120, configurable: true });
    Object.defineProperty(run, 'clientWidth', { value: 400, configurable: true });
    window.dispatchEvent(new Event('resize'));
    await vi.waitFor(() => {
      expect(math.style.fontSize).toBe('');
    });
  });

  it('PRINT engages fit by default — beforeprint paints the data-fit hook without the prop, afterprint restores', async () => {
    const { container } = render(MathBlock, { props: { tex: 'e^{i\\pi}+1=0' } });
    const figure = container.querySelector('figure[data-jx-math-block]') as HTMLElement;
    expect(figure.hasAttribute('data-fit')).toBe(false);
    window.dispatchEvent(new Event('beforeprint'));
    await vi.waitFor(() => {
      expect(figure.hasAttribute('data-fit')).toBe(true);
    });
    window.dispatchEvent(new Event('afterprint'));
    await vi.waitFor(() => {
      expect(figure.hasAttribute('data-fit')).toBe(false);
    });
  });
});

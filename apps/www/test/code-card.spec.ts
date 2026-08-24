/**
 * CodeCard behavior suite (test/code-card.spec.ts, 2026-08-22).
 *
 * The card promises: progressive enhancement (escaped plain sample paints
 * immediately, Shiki token spans upgrade the SAME code element after the
 * async highlight resolves), runtime-string safety (a literal closing-script
 * tag in the sample is inert data), theme editor colors applied verbatim to
 * the card's pre, the scrollport law (pre owns scrolling; maxHeight turns
 * on the vertical lane), and the copied feedback on the copy control.
 * Assertions read the DOM only, never component internals.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';

import CodeCard from '../src/lib/ui/code-card/code-card.svelte';
import CodeCardHost from './fixtures/code-card-host.svelte';

// jsdom ships no clipboard (the copy path falls back) and no execCommand
document.execCommand = vi.fn(() => true) as unknown as typeof document.execCommand;

describe('CodeCard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('paints the escaped plain sample first, then upgrades it with Shiki spans', async () => {
    const { container } = render(CodeCard, {
      props: { code: 'const value: number = 42;', lang: 'ts', filename: 'spawn.ts' },
    });

    const code = container.querySelector('pre code');
    expect(code).not.toBeNull();
    expect(code!.textContent).toContain('const value: number = 42;');

    await waitFor(
      () => expect(container.querySelector('pre code .line')).not.toBeNull(),
      { timeout: 8000 },
    );
    // same element upgraded in place — the plain text is still what screen readers read
    expect(code!.textContent).toContain('const value: number = 42;');
  }, 20000);

  it('keeps a literal closing-script tag as inert data', async () => {
    const scriptCount = document.querySelectorAll('script').length;
    const hostile = 'const s = "</script>"; alert(1);';

    const { container } = render(CodeCard, { props: { code: hostile, lang: 'js' } });

    await waitFor(() => expect(container.querySelector('pre code .line')).not.toBeNull(), {
      timeout: 8000,
    });
    expect(container.querySelector('pre code')!.textContent).toContain('</script>');
    expect(document.querySelectorAll('script').length).toBe(scriptCount);
  }, 20000);

  it('applies a named theme editor colors to the card pre verbatim', async () => {
    const { container } = render(CodeCard, {
      props: { code: 'const a = 1;', lang: 'ts', theme: 'github-dark' },
    });

    const pre = container.querySelector('pre')!;
    // jsdom normalizes the hex to rgb() — assert the theme's editor color landed
    await waitFor(() => expect(pre.getAttribute('style')).toContain('rgb(36, 41, 46)'), {
      timeout: 8000,
    });
  }, 20000);

  it('makes the pre the scrollport; maxHeight turns on the vertical lane', () => {
    const capped = render(CodeCard, { props: { code: 'x', maxHeight: '14rem' } });
    const pre = capped.container.querySelector('pre')!;
    expect(pre.className).toContain('vscroll');
    expect(pre.getAttribute('style')).toContain('max-height');
    expect(pre.getAttribute('style')).toContain('14rem');
    expect(pre.getAttribute('tabindex')).toBe('0');
    expect(pre.getAttribute('aria-label')).toBe('ts code sample');

    const free = render(CodeCard, { props: { code: 'x' } });
    const plainPre = free.container.querySelector('pre')!;
    expect(plainPre.className).not.toContain('vscroll');
    expect(plainPre.getAttribute('style') ?? '').not.toContain('max-height');
  });

  it('drops the stale highlight immediately when the code prop changes', async () => {
    const { container, getByRole } = render(CodeCardHost);

    await waitFor(() => expect(container.querySelector('pre code .line')).not.toBeNull(), {
      timeout: 8000,
    });

    await fireEvent.click(getByRole('button', { name: 'swap' }));
    flushSync();
    // old token spans are gone synchronously; the CURRENT plain sample is
    // the interim paint — never the previous code's highlighted content
    expect(container.querySelector('pre code .line')).toBeNull();
    expect(container.querySelector('pre code')!.textContent).toContain('const second = 2;');
    expect(container.querySelector('pre code')!.textContent).not.toContain('const first');

    await waitFor(() => expect(container.querySelector('pre code .line')).not.toBeNull(), {
      timeout: 8000,
    });
  }, 20000);

  it('copies and flashes the copied feedback', async () => {
    const { container, getByRole } = render(CodeCard, {
      props: { code: 'const a = 1;', lang: 'ts', copyable: true },
    });

    await fireEvent.click(getByRole('button'));
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(getByRole('button').textContent).toContain('copied');
    expect(container.querySelector('.jx-code-card-copy')!.className).toContain('copied');
  });

  it('renders the head only with filename/header and the default lang label', () => {
    const withFile = render(CodeCard, { props: { code: 'x', filename: 'a.ts' } });
    expect(withFile.container.querySelector('[data-jx-code-card-file]')!.textContent).toBe('a.ts');
    expect(withFile.container.querySelector('[data-jx-code-card-lang]')!.textContent).toBe('ts');

    const bare = render(CodeCard, { props: { code: 'x', copyable: false } });
    expect(bare.container.querySelector('[data-jx-code-card-head]')).toBeNull();
    expect(bare.container.querySelector('[data-jx-code-card-foot]')).toBeNull();
  });
});

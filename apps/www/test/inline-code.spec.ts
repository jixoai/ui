/**
 * InlineCode behavior suite (test/inline-code.spec.ts, 2026-08-26).
 *
 * The chip promises: a native <code> whose first paint is the plain
 * children text (no async dependency — the SSR contract), the variant
 * grammar's tonal/outline utilities with the local neutral injection
 * (a consumer's jx-hue-* replaces it through cn()'s dedupe),
 * Shiki tokens as a strictly async enhancement over the SAME
 * characters (zero layout shift, --tok-* colors), honest degradation
 * for unknown languages, and the zero-download fingerprint heuristic
 * exported pure (detectInlineLang) over the shiki-registered
 * candidate set (INLINE_LANGS). Assertions read the DOM only.
 */
import { render, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { INLINE_LANGS, detectInlineLang } from '../src/lib/ui/inline-code/inline-code.svelte';
import InlineCodeHost from './fixtures/inline-code-host.svelte';

describe('InlineCode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a native <code> with the plain children text and no token spans', () => {
    const { container } = render(InlineCodeHost, {
      props: { text: '--jx-tonal', lang: 'text' },
    });
    const code = container.querySelector('code[data-jx-inline-code]');
    expect(code).not.toBeNull();
    expect(code!.getAttribute('data-density')).toBe('default');
    expect(code!.textContent).toBe('--jx-tonal');
    // plain path: no grammar ever loads, no span ever mounts
    expect(code!.querySelector('span')).toBeNull();
  });

  it('ships the ladder utilities: neutral tonal default, structural outline', () => {
    const tonal = render(InlineCodeHost, { props: { text: 'x', lang: 'text' } });
    const tonalEl = tonal.container.querySelector('code')!;
    expect(tonalEl.getAttribute('data-jx-inline-code')).toBe('tonal');
    expect(tonalEl.className).toContain('jx-hue-neutral');
    expect(tonalEl.className).not.toContain('[--jx-tonal:');
    expect(tonalEl.className).toContain('bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)]');
    expect(tonalEl.className).toContain(
      'border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)]',
    );
    expect(tonalEl.className).toContain('rounded-(--radius)');

    const outline = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', variant: 'outline' },
    });
    const outlineEl = outline.container.querySelector('code')!;
    expect(outlineEl.getAttribute('data-jx-inline-code')).toBe('outline');
    expect(outlineEl.className).toContain('bg-transparent');
    expect(outlineEl.className).toContain('border-[color:var(--jx-outline)]');
    expect(outlineEl.className).not.toContain('[--jx-tonal:');
  });

  it("lets a consumer's jx-hue-* injection replace the neutral default", () => {
    const { container } = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', consumerClass: 'jx-hue-error' },
    });
    const code = container.querySelector('code')!;
    expect(code.className).toContain('jx-hue-error');
    expect(code.className).not.toContain('jx-hue-neutral');
    expect(code.className).not.toContain('[--jx-tonal:');
  });

  it('upgrades the same text with --tok-* token spans after hydration (zero CLS)', async () => {
    const { container } = render(InlineCodeHost, {
      props: { text: 'const value: number = 42', lang: 'ts' },
    });
    const code = container.querySelector('code')!;
    await waitFor(() => expect(code.querySelector('span')).not.toBeNull(), { timeout: 8000 });
    // the SAME characters — only the paint changed
    expect(code.textContent).toBe('const value: number = 42');
    const colored = [...code.querySelectorAll('span')].filter((span) =>
      (span.getAttribute('style') ?? '').includes('var(--tok-'),
    );
    expect(colored.length).toBeGreaterThan(0);
  }, 20000);

  it('auto-detects the grammar for plain prose-code and highlights it', async () => {
    const { container } = render(InlineCodeHost, {
      props: { text: 'npm install @jixoai/ui', lang: 'auto' },
    });
    const code = container.querySelector('code')!;
    await waitFor(() => expect(code.querySelector('span')).not.toBeNull(), { timeout: 8000 });
    expect(code.textContent).toBe('npm install @jixoai/ui');
  }, 20000);

  it('degrades to the plain chip for an unregistered explicit lang', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(InlineCodeHost, {
      props: { text: 'def hi(): pass', lang: 'python' },
    });
    await waitFor(() => expect(warn).toHaveBeenCalled(), { timeout: 8000 });
    const code = container.querySelector('code')!;
    expect(code.querySelector('span')).toBeNull();
    expect(code.textContent).toBe('def hi(): pass');
  }, 20000);

  describe('detectInlineLang (the pure fingerprint heuristic)', () => {
    it.each([
      ['css', 'color: var(--jx-tonal)'],
      ['svelte', '{#each list as item (item.id)}{/each}'],
      ['typescript', 'const value: number = 42'],
      ['bash', 'npm install @jixoai/ui'],
      ['json', '{"name": "jixoai", "private": true}'],
      ['', 'Ctrl + C'],
    ])('detects %s', (expected, code) => {
      expect(detectInlineLang(code)).toBe(expected);
    });
  });

  it('exports the shiki-registered candidate set (ids + aliases)', () => {
    expect(INLINE_LANGS.length).toBeGreaterThan(0);
    expect([...INLINE_LANGS]).toContain('typescript');
    expect([...INLINE_LANGS]).toContain('ts'); // alias rides along
    expect([...INLINE_LANGS]).toContain('svelte');
    expect([...INLINE_LANGS]).toContain('shell');
  });
});

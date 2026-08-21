/**
 * lib/shiki contract suite (test/shiki-lib.spec.ts, 2026-08-22).
 *
 * The lib promises: a stock shiki/core HighlighterCore behind a lazy
 * singleton, on-demand grammars/themes (loaded exactly when requested,
 * never speculatively), alias resolution, sub-grammar detection from the
 * code itself, Shiki-option passthrough (dual themes, transformers), and a
 * zero-download css-variables default theme. These tests read behavior
 * through the public exports only — the singleton is shared across the
 * file, so on-demand ordering is asserted before any wide language use.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME,
  getHighlighter,
  getRegisteredLanguages,
  getRegisteredThemes,
  highlightCode,
  registerLanguage,
  registerTheme,
} from '$lib/shiki';

const loadedLanguages = async (): Promise<string[]> =>
  (await getHighlighter()).getLoadedLanguages();

describe('lib/shiki', () => {
  it('loads nothing until the first highlight, then only the requested grammar', async () => {
    const before = await loadedLanguages();
    expect(before).not.toContain('css');

    const html = await highlightCode('.a { color: red }', { lang: 'css' });
    expect(html).toContain('class="shiki');
    expect(await loadedLanguages()).toContain('css');
    // speculatively curated ≠ speculatively loaded
    expect(await loadedLanguages()).not.toContain('svelte');
    expect(await loadedLanguages()).not.toContain('markdown');
  });

  it('resolves language aliases (ts, sh) to their grammars', async () => {
    const ts = await highlightCode('const a: number = 1;', { lang: 'ts' });
    expect(ts).toContain('class="shiki');

    const sh = await highlightCode('echo "hi"', { lang: 'sh' });
    expect(sh).toContain('class="shiki');
    expect(await loadedLanguages()).toContain('typescript');
    expect(await loadedLanguages()).toContain('bash');
  });

  it('defaults to the zero-download jixoai css-variables theme', async () => {
    const html = await highlightCode('const a = 1;', { lang: 'ts' });
    expect(html).toContain(DEFAULT_THEME);
    expect(html).toContain('var(--tok-token-keyword)');
    expect(html).toContain('var(--tok-background, transparent)');
  });

  it('loads named themes on demand and passes dual themes through', async () => {
    const single = await highlightCode('const a = 1;', { lang: 'ts', theme: 'github-dark' });
    expect(single).toContain('class="shiki github-dark"');

    const dual = await highlightCode('const a = 1;', {
      lang: 'ts',
      themes: { light: 'github-light', dark: 'github-dark' },
    });
    // dual-theme output: light stays the base color, dark rides CSS variables
    expect(dual).toContain('shiki-themes');
    expect(dual).toContain('--shiki-dark');
  }, 20000);

  it('detects sub-grammars hinted by the code (markdown fences)', async () => {
    expect(await loadedLanguages()).not.toContain('yaml');
    await highlightCode('# hi\n\n```yaml\nname: x\n```\n', { lang: 'markdown' });
    expect(await loadedLanguages()).toContain('markdown');
    expect(await loadedLanguages()).toContain('yaml');
  }, 20000);

  it('throws with a registration hint for unknown languages and themes', async () => {
    await expect(highlightCode('x = 1', { lang: 'python' })).rejects.toThrow(/registerLanguage/);
    await expect(highlightCode('x = 1', { lang: 'ts', theme: 'nord' })).rejects.toThrow(
      /registerTheme/,
    );
  }, 20000);

  it('joins the ecosystem: registerLanguage extends the on-demand set', async () => {
    registerLanguage('python', () => import('shiki/langs/python.mjs'));
    const html = await highlightCode('def hi():\n    return 1', { lang: 'python' });
    expect(html).toContain('class="shiki');
    expect(await loadedLanguages()).toContain('python');
  });

  it('joins the ecosystem: registerTheme accepts a ThemeRegistration object', async () => {
    registerTheme('spec-object', {
      name: 'spec-object',
      type: 'dark',
      colors: { 'editor.background': '#101010', 'editor.foreground': '#eeeeee' },
      settings: [{ scope: 'keyword', settings: { foreground: '#ff0055' } }],
    });
    const html = await highlightCode('const a = 1;', { lang: 'ts', theme: 'spec-object' });
    expect(html).toContain('class="shiki spec-object"');
    expect(html).toContain('#101010');
    expect(html.toLowerCase()).toContain('#ff0055');
  });

  it('renders special languages (text) without any grammar', async () => {
    const html = await highlightCode('plain words', { lang: 'text' });
    expect(html).toContain('plain words');
    expect(await loadedLanguages()).not.toContain('text');
  });

  it('enumerates registered languages and themes for docs UIs', () => {
    expect(getRegisteredLanguages()).toContain('tsx');
    expect(getRegisteredLanguages()).toContain('vue');
    expect(getRegisteredThemes()).toContain(DEFAULT_THEME);
    expect(getRegisteredThemes()).toContain('vitesse-dark');
  });

  it('shares one in-flight load across concurrent first highlights', async () => {
    const [a, b] = await Promise.all([
      highlightCode('<template><p>hi</p></template>', { lang: 'vue' }),
      highlightCode('<template><p>hi</p></template>', { lang: 'vue' }),
    ]);
    expect(a).toContain('class="shiki');
    expect(b).toContain('class="shiki');
  }, 20000);

  it('runs a counting grammar loader exactly once under concurrent first highlights', async () => {
    let calls = 0;
    registerLanguage('jsx', async () => {
      calls++;
      // artificial delay keeps the in-flight window open long enough that
      // all concurrent callers must share the single promise
      await new Promise((resolve) => setTimeout(resolve, 50));
      return import('shiki/langs/jsx.mjs');
    });
    const all = await Promise.all([
      highlightCode('const a = <b />;', { lang: 'jsx' }),
      highlightCode('const c = <d />;', { lang: 'jsx' }),
      highlightCode('const e = <f />;', { lang: 'jsx' }),
    ]);
    expect(calls).toBe(1);
    expect(all.every((html) => html.includes('class="shiki'))).toBe(true);
  }, 20000);

  it('recovers after a failed grammar loader is replaced', async () => {
    registerLanguage('rust', () => Promise.reject(new Error('boom')));
    await expect(highlightCode('fn main() {}', { lang: 'rust' })).rejects.toThrow('boom');

    registerLanguage('rust', () => import('shiki/langs/rust.mjs'));
    const html = await highlightCode('fn main() {}', { lang: 'rust' });
    expect(html).toContain('class="shiki');
  }, 20000);
});

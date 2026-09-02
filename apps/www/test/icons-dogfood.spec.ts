/**
 * icons-dogfood.spec.ts — the B2 build-artifact lock (icons-docs
 * ICON-4, 2026-09-02).
 *
 * The site's rendering path consumes the icon plugin's virtual CSS:
 * +layout.svelte imports 'virtual:jixoai-icons.css', aliased in
 * vite.config.ts onto the registered jixoai-icons plugin's own load
 * hook (the documented CSS-entry `@import 'virtual:jixoai-icons'` is
 * IMPOSSIBLE under @tailwindcss/vite — its generate pass resolves the
 * entry's whole @import graph through enhanced-resolve without plugin
 * resolveId hooks; see vite.config.ts for the full ruling).
 *
 * This suite pins the wiring at both ends:
 *   source — the layout's virtual import + app.css's frozen jx-pure
 *     vocabulary import (the OTHER supply) stay wired;
 *   dist   — (a) the plugin's vocabulary declarations really ride the
 *              built CSS (proven by --jx-icon-palette, a :root
 *              declaration ONLY the plugin emits — the sheet declares
 *              palette solely as a var() fallback in the mask paint);
 *            (b) every dist declaration is byte-equal to the frozen
 *              sheet vocabulary (read from src/lib/jx-pure.css's
 *              generated jx-icon-vocab block — the SERVED rendering
 *              oracle) and byte-equal to the css-laws frozen fixtures
 *              imported live cross-package (every key, invalid-ink
 *              included since the B3 re-freeze; test-only import
 *              precedent:
 *              packages/vite-plugin/test/icons/ink-equivalence.test.ts);
 *            (c) the dual supply (sheet vocabulary block + virtual
 *              module output) can never disagree: every occurrence of
 *              a (scope, key) pair in the dist CSS must carry one
 *              byte-identical value, and no key may appear more than
 *              twice per scope — a diverging second supply (e.g. a
 *              layer-order ink flip) fails loudly instead of letting
 *              the cascade silently pick a winner.
 *
 * dist/ is the vite-owned artifact; pre-build runs skip (same law as
 * docs-structure.spec.ts's dist walk). The block scanner below is
 * quote- and comment-aware and tracks the selector stack so each
 * declaration knows whether it rides :root, .dark or .jx-light — the
 * three sanctioned vocabulary surfaces.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  committedDarkVars,
  committedPaletteMask,
  committedRootVars,
} from '../../../packages/css-laws/test/icon-uri-fixtures.ts';

const here = resolve(fileURLToPath(import.meta.url), '..');
const repoRoot = resolve(here, '../../..');
const distAssets = resolve(repoRoot, 'apps/www/dist/_app/immutable/assets');

/** the 12 vocabulary variables the default plugin output carries (11 sheet vars + the palette override) */
const VOCAB = [
  '--jx-icon-calendar', '--jx-icon-clock', '--jx-icon-mail',
  '--jx-icon-search', '--jx-icon-chevron', '--jx-icon-clear',
  '--jx-icon-check', '--jx-icon-calendar-ink', '--jx-icon-clock-ink',
  '--jx-icon-valid-ink', '--jx-icon-invalid-ink', '--jx-icon-palette',
] as const;

type VocabKey = (typeof VOCAB)[number];
type Scope = ':root' | '.dark' | '.jx-light';

interface Declaration {
  readonly key: VocabKey;
  readonly value: string;
  readonly scope: Scope;
}

/**
 * collect the vocabulary's direct custom-property declarations with
 * their enclosing surface (:root / .dark / .jx-light). declarations
 * under any other selector are ignored — only the three sanctioned
 * surfaces carry the vocabulary by law.
 */
function collectDeclarations(css: string): Declaration[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const found: Declaration[] = [];
  const stack: string[] = [];
  let buffer = '';
  let quote: string | null = null;

  const flush = (): void => {
    const declaration = buffer.trim();
    buffer = '';
    const match = /^(--jx-icon-[a-z-]+):\s*(.+)$/.exec(declaration);
    if (!match) return;
    const key = match[1] as VocabKey;
    if (!(VOCAB as readonly string[]).includes(key)) return;
    // nearest enclosing selector decides the surface; @layer/@media
    // wrappers are transparent, any other selector ends the walk
    let scope: Scope | null = null;
    for (let depth = stack.length - 1; depth >= 0; depth -= 1) {
      const selector = stack[depth]!;
      if (selector === ':root' || selector === '.dark' || selector === '.jx-light') {
        scope = selector;
        break;
      }
      if (selector.startsWith('@')) continue;
      break;
    }
    if (scope !== null) found.push({ key, value: match[2]!, scope });
  };

  for (const character of stripped) {
    if (quote !== null) {
      buffer += character;
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      buffer += character;
      continue;
    }
    if (character === '{') {
      stack.push(buffer.trim());
      buffer = '';
      continue;
    }
    if (character === '}') {
      flush();
      stack.pop();
      buffer = '';
      continue;
    }
    if (character === ';') {
      flush();
      continue;
    }
    buffer += character;
  }
  return found;
}

/** the sheet's generated vocabulary block (the served rendering oracle) */
function sheetVocabulary(): Map<string, string> {
  const sheet = readFileSync(resolve(here, '../src/lib/jx-pure.css'), 'utf8');
  const begin = sheet.indexOf('@jixoai/css-laws:begin:jx-icon-vocab');
  const end = sheet.indexOf('@jixoai/css-laws:end:jx-icon-vocab');
  expect(begin).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(begin);
  const block = sheet.slice(begin, end);
  const entries = collectDeclarations(block).map(
    (declaration) => [`${declaration.scope} ${declaration.key}`, declaration.value] as const,
  );
  return new Map(entries);
}

describe('icons dogfood: the plugin pipeline feeds the site rendering path', () => {
  it("the layout consumes the plugin's virtual CSS (the JS-entry wiring)", () => {
    const layout = readFileSync(resolve(here, '../src/routes/+layout.svelte'), 'utf8');
    expect(layout).toContain("import 'virtual:jixoai-icons.css';");
    // the wiring rides the canonical plugins: the alias resolves onto
    // the jixoai-icons plugin's own load hook (see vite.config.ts)
    const viteConfig = readFileSync(resolve(here, '../vite.config.ts'), 'utf8');
    expect(viteConfig).toContain('virtual:jixoai-icons.css');
    expect(viteConfig).toContain("plugin.name === 'jixoai-icons'");
  });

  it('app.css keeps the other supply: the frozen jx-pure vocabulary import', () => {
    const appCss = readFileSync(resolve(here, '../src/app.css'), 'utf8');
    expect(appCss).toContain("@import './lib/jx-pure.css';");
    // and documents why the icons ride the JS entry instead of a CSS
    // @import here (the @tailwindcss/vite impossibility)
    expect(appCss).toContain('virtual:jixoai-icons.css');
  });

  describe('built dist', () => {
    if (!existsSync(distAssets)) return; // pre-build runs skip

    const sheet = sheetVocabulary();
    const paletteUri = /url\("data:image\/svg\+xml,[^"]*"\)/.exec(committedPaletteMask)?.[0];
    expect(paletteUri).toBeDefined();

    /** every vocabulary declaration across every built css asset */
    const declarations: Declaration[] = [];
    for (const name of readdirSync(distAssets)) {
      if (!name.endsWith('.css')) continue;
      declarations.push(
        ...collectDeclarations(readFileSync(join(distAssets, name), 'utf8')),
      );
    }

    const occurrencesOf = (scope: Scope, key: VocabKey): string[] =>
      declarations
        .filter((declaration) => declaration.scope === scope && declaration.key === key)
        .map((declaration) => declaration.value);

    /** scopes each key must cover (palette sits out the theme matrix — mask + currentColor themes it) */
    const scopesOf = (key: VocabKey): readonly Scope[] =>
      key === '--jx-icon-palette' ? [':root'] : [':root', '.dark', '.jx-light'];

    it('(a) the plugin output rides the dist: :root declares --jx-icon-palette with the committed glyph bytes', () => {
      // the sheet declares palette ONLY as a var() fallback inside the
      // mask paint — a :root --jx-icon-palette declaration can only
      // come from the plugin's virtual module. Its presence proves the
      // plugin pipeline's output landed in the served CSS.
      const palette = occurrencesOf(':root', '--jx-icon-palette');
      expect(palette).toHaveLength(1);
      expect(palette[0]).toBe(paletteUri);
      // and the plugin's whole default surface landed: all 12 keys ride :root
      for (const key of VOCAB) {
        expect(occurrencesOf(':root', key).length, `${key} :root`).toBeGreaterThanOrEqual(1);
      }
    });

    it('(b) every dist declaration is byte-equal to the frozen sheet vocabulary and the css-laws fixtures', () => {
      expect(declarations.length).toBeGreaterThan(0);
      for (const declaration of declarations) {
        const label = `${declaration.scope} ${declaration.key}`;

        if (declaration.key === '--jx-icon-palette') {
          // palette has no sheet/fixture :root entry — compared in (a)
          expect(declaration.value, label).toBe(paletteUri);
          continue;
        }
        // the served sheet block (current for every key, invalid-ink included)
        const sheetValue = sheet.get(`${declaration.scope} ${declaration.key}`);
        expect(sheetValue, `${label} present in sheet vocabulary`).toBeDefined();
        expect(declaration.value, `${label} === sheet bytes`).toBe(sheetValue);

        // the css-laws frozen fixtures (live cross-package import);
        // invalid-ink rides the same law since the B3 re-freeze
        const fixture =
          declaration.scope === ':root'
            ? committedRootVars[declaration.key]
            : declaration.scope === '.dark'
              ? committedDarkVars[declaration.key]
              : undefined; // .jx-light mirrors root at black ink — locked via the sheet above
        if (fixture !== undefined) {
          expect(declaration.value, `${label} === css-laws fixture`).toBe(fixture);
        }
      }
    });

    it('(c) the dual supply never diverges: one byte-identical value per (scope, key), at most two supplies', () => {
      for (const key of VOCAB) {
        for (const scope of scopesOf(key)) {
          const values = occurrencesOf(scope, key);
          // both supplies are wired (sheet vocabulary block + virtual
          // module output), so 1–2 occurrences per surface is the
          // honest envelope: the css minifier is free to merge/dedupe
          // byte-identical declarations (observed: the -ink quartet
          // dedupes to one :root copy; plain slots and the .dark /
          // .jx-light matrices keep both). MORE than two means a third
          // supplier appeared; ZERO means a supply went missing.
          expect(values.length, `${scope} ${key} occurrence count`).toBeGreaterThanOrEqual(1);
          expect(values.length, `${scope} ${key} occurrence count`).toBeLessThanOrEqual(2);
          // the anti-flip lock: whatever supplies survive into the
          // dist, they must agree byte-for-byte — a diverging value
          // would let layer/scope order silently pick the winner
          expect(new Set(values).size, `${scope} ${key} single value`).toBe(1);
        }
        // palette never joins the theme matrix (mask + currentColor themes it)
        if (key !== '--jx-icon-palette') {
          expect(occurrencesOf('.dark', key).length, `${key} dark matrix`).toBeGreaterThanOrEqual(1);
        } else {
          expect(occurrencesOf('.dark', key)).toHaveLength(0);
        }
      }
    });
  });
});

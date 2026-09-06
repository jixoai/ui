/**
 * The Sugar High highlight backend (lib/highlight/sugar-high.ts,
 * highlight-engine-matrix, 2026-09-06 —
 * https://github.com/huozhi/sugar-high).
 *
 * A MARKUP backend over sugar-high 2.3.1 — a 29-language, zero-dependency
 * tokenizer whose highlight(code, { lang }) returns the final HTML string
 * directly: every token value is entity-escaped BY THE ENGINE (verified
 * against 2.3.1 output in node), so this adapter's whole job is language
 * canonicalization plus the palette stylesheet — el.innerHTML receives the
 * engine's verbatim output, and the markup survives the print pipeline's
 * freeze clone like shiki's does.
 *
 * OUTPUT FORM (empirical, 2.3.1 — measured, not assumed): line wrappers
 * <span class="sh__line"> joined by literal "\n" text nodes (the card's
 * white-space:pre <pre> renders those breaks; .sh__line must stay inline),
 * tokens <span class="sh__token--<type>" style="color:var(--sh-<type>)"> —
 * a class AND an inline style whose color value is an UNRESOLVED
 * custom-property reference. The engine ships NO stylesheet (its README's
 * "default theme" is the --sh-* block it expects the host to write), so
 * sugar-high-jixoai.css — loaded lazily below — is what makes the paint
 * visible: the engine's --sh-* vocabulary defined in terms of the card's
 * --tok-token-* palette (light/dark adapted by code-card.css). Outside a
 * --tok-* host the references degrade to the inherited foreground —
 * monochrome, never broken markup.
 *
 * ZERO-OPTION FACTORY (the spec's minimal-engine exemption): sugar-high's
 * distribution model is ONE whole bundle — per-language splitting is not a
 * channel it ships (its README's own TypeScript benchmark, measured on
 * 2.2.2: 9.90 KiB min / 4.35 KiB gzip vs PrismJS 14.63 / highlight.js
 * 29.54), so a langs allowlist would trim nothing. The 29 canonical
 * languages are the whole curated surface.
 *
 * LANGUAGES: canonical ids are its 29 LanguageName values; the alias table
 * below mirrors the shiki facade's (cross-backend sample parity) converged
 * onto sugar-high canonicals — 'shell' (not bash) is the shell canonical,
 * 'html' (not markup) the markup one. JSX is a native dialect of its
 * JavaScript runtime (jsx parsing stays on for the javascript/typescript
 * presets), so jsx → javascript. TSX rejects with a shiki hint instead:
 * the matrix design (D4) keeps tsx off this backend's surface — sugar-high
 * has no tsx canonical id (its registry admits tsx only as an input alias
 * of the typescript preset), so TSX samples steer to shiki's structural
 * TSX grammars. Everything unmapped rejects listing the canonical set —
 * the card's plain-text fallback law takes over.
 *
 * THEME SEMANTICS (per-backend mapping): 'jixoai'/undefined → the engine's
 * default form — its own markup untouched (no cx/mark hooks), resolved by
 * the item's jixoai stylesheet. Any other name warns and stays on that
 * same default: sugar-high has no theme system and no stock stylesheets,
 * there is nothing else to map onto.
 *
 * Lazy loading (the engine-minisearch precedent): the engine module and
 * the palette stylesheet are dynamic imports inside highlight() — nothing
 * of sugar-high joins the page until a sugarHigh()-backed card paints; a
 * failed load clears its cached promise so the next paint retries.
 */

import { canonicalLang, requestedLang, type HighlightBackend } from './backend';

/**
 * sugar-high's typed lang option — type-only, erased at compile time, so
 * the engine still joins the page exclusively through the dynamic import
 * below (the lazy law).
 */
import type { LanguageName } from 'sugar-high';

/** the engine surface this backend consumes (typed by sugar-high 2.3.1) */
type SugarHigh = typeof import('sugar-high');

let libPromise: Promise<SugarHigh> | undefined;

/** the lazy engine — one shared load; failure clears the cache for a retry */
function getEngine(): Promise<SugarHigh> {
  libPromise ??= import('sugar-high').catch((error: unknown) => {
    libPromise = undefined;
    throw error;
  });
  return libPromise;
}

let stylesPromise: Promise<void> | undefined;

/**
 * The lazy jixoai palette — the --sh-* → --tok-token-* stylesheet shipped
 * beside this file (the header's empirical finding: without it the
 * engine's inline var() references never resolve). One shared load;
 * failure clears the cache for a retry.
 */
function ensureJixoaiStyles(): Promise<void> {
  stylesPromise ??= import('./sugar-high-jixoai.css').then(
    () => undefined,
    (error: unknown) => {
      stylesPromise = undefined;
      throw error;
    },
  );
  return stylesPromise;
}

/**
 * sugar-high's 29 canonical languages (its LanguageName union, 2.3.1) —
 * the whole curated surface, and the unknown-lang reject hint's list.
 */
const CANONICAL_LANGUAGES: readonly LanguageName[] = [
  'javascript',
  'typescript',
  'css',
  'python',
  'c',
  'go',
  'java',
  'rust',
  'json',
  'diff',
  'shell',
  'cpp',
  'csharp',
  'sql',
  'html',
  'yaml',
  'markdown',
  'plaintext',
  'ruby',
  'kotlin',
  'swift',
  'php',
  'toml',
  'powershell',
  'dockerfile',
  'graphql',
  'hcl',
  'zig',
  'lua',
];

/** membership narrowing into the engine's typed lang option */
function isLanguageName(lang: string): lang is LanguageName {
  return (CANONICAL_LANGUAGES as readonly string[]).includes(lang);
}

/**
 * alias → canonical, mirroring the shiki facade's table (sample parity
 * across backends) converged onto sugar-high canonicals: the shell family
 * lands on 'shell' (bash is an input alias THERE, not a canonical here)
 * and the markup family on 'html'. jsx is javascript (its JS runtime
 * keeps jsx parsing on); tsx is deliberately absent — see the header.
 */
const langAliases: Record<string, string> = {
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  shellscript: 'shell',
  md: 'markdown',
  yml: 'yaml',
  htm: 'html',
  xml: 'html',
};

/**
 * The sugar-high backend factory: `<CodeCard backend={sugarHigh()} />`.
 * Zero options by design (the header's minimal-engine exemption) —
 * instances are stateless adapters over the shared lazy loads; create as
 * many as you like.
 */
export function sugarHigh(): HighlightBackend {
  return {
    id: 'sugar-high',
    async highlight(el, code, opts) {
      const lang = canonicalLang(langAliases, requestedLang(opts));
      if (lang === 'tsx') {
        throw new Error(
          '[jixoai/highlight/sugar-high] lang "tsx" is not a sugar-high language ' +
            '(its 29 canonical ids have no tsx — typescript covers it only as an ' +
            'input alias) — use the shiki backend for TSX samples',
        );
      }
      if (!isLanguageName(lang)) {
        throw new Error(
          `[jixoai/highlight/sugar-high] no sugar-high language for "${lang}" — ` +
            `supported: ${CANONICAL_LANGUAGES.join(', ')} ` +
            '(ts/js/jsx/sh/bash/md/yml/htm/xml… resolve into that set)',
        );
      }
      if (opts.theme !== undefined && opts.theme !== 'jixoai') {
        console.warn(
          `[jixoai/highlight/sugar-high] no sugar-high theme "${opts.theme}" — the engine ` +
            'has no theme system (its default --sh-* palette is the only form), staying on it',
        );
      }
      const { highlight } = await getEngine();
      // the engine escapes token values itself (the header's empirical
      // finding) — its HTML is taken verbatim; '' (an empty sample) would
      // wipe the plain text, so it is skipped like shiki's guard
      const html = highlight(code, { lang });
      if (html !== '') el.innerHTML = html;
      await ensureJixoaiStyles();
    },
  };
}

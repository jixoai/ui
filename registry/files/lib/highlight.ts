/**
 * Tiny deterministic tokenizer for readonly code surfaces
 * (registry/files/lib/highlight.ts → @lib/highlight.ts).
 *
 * Deliberately NOT shiki: jixoai sites ship short samples and the visual law
 * needs only comment / string / keyword / number / function / tag tints that
 * follow the --tok-* theme palette (primary family + muted, light/dark
 * adaptive). One escape-first pass, one alternation regex, first alternative
 * wins — output is stable across server prerender and client hydration, so
 * `{@html}` never mismatches.
 *
 * Safety: `code` is always a runtime prop, never markup inlined in a
 * template. The escape-first pass turns literal `<`, `>`, `&` into entities,
 * so a sample containing a closing-script tag stays inert data — it can
 * never terminate the host page's script or inject tags. (This is why the
 * svelte tag patterns match the escaped `&lt;` form.)
 */

const TS_KEYWORDS =
  'as|async|await|break|case|catch|class|const|continue|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|if|implements|import|in|instanceof|interface|keyof|let|namespace|new|of|private|protected|public|readonly|return|satisfies|static|super|switch|this|throw|try|type|typeof|var|void|while|yield|true|false|null|undefined';

/** keyword vocabularies; '' disables the keyword alternative */
const KEYWORDS: Record<string, string> = {
  ts: TS_KEYWORDS,
  svelte: TS_KEYWORDS, // svelte markup embeds ts script bodies
  js: 'async|await|break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|super|switch|this|throw|try|typeof|var|void|while|yield|true|false|null|undefined',
  json: 'true|false|null',
  bash:
    'if|then|elif|else|fi|for|while|until|do|done|case|esac|in|function|select|return|break|continue|export|local|readonly|declare|shift|source|echo|printf|read|cd|pushd|popd|pwd|set|unset|exit|exec|eval|trap|test|true|false',
  css: '',
};

/** alias → canonical language */
const ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  html: 'svelte',
  tsx: 'ts',
  typescript: 'ts',
  jsx: 'js',
  mjs: 'js',
  cjs: 'js',
  javascript: 'js',
  scss: 'css',
};

/** comment styles per canonical language */
const JS_LINE = String.raw`\/\/[^\n]*`;
const BLOCK = String.raw`\/\*[\s\S]*?\*\/`;
const HASH = String.raw`#[^\n]*`;
const COMMENTS: Record<string, string> = {
  ts: `${JS_LINE}|${BLOCK}`,
  js: `${JS_LINE}|${BLOCK}`,
  // svelte markup comments arrive in escaped form (&lt;!-- … --&gt;)
  svelte: `${JS_LINE}|${BLOCK}|${String.raw`&lt;!--[\s\S]*?--&gt;`}`,
  json: BLOCK,
  css: BLOCK,
  bash: HASH,
};

/**
 * Tag shapes. svelte: element tags (escaped form) and block markers
 * ({#if} {:else} {/each} {@render}). css: property names before `:`
 * (including `--` custom properties) and at-rules (@media, @theme…).
 */
const TAGS: Record<string, string> = {
  svelte: String.raw`&lt;\/?[A-Za-z][\w.:-]*|\{[#/:@][a-z]+`,
  css: String.raw`-{0,2}[A-Za-z][\w-]*(?=\s*:)|@[a-z-]+`,
};

/** call-position identifiers — `name(` in ts/js/svelte, `var(`/`oklch(` in css */
const FUNCTION = String.raw`\b[A-Za-z_$][\w$]*(?=\s*\()`;
const FUNCTION_LANGS = new Set(['ts', 'js', 'svelte', 'css']);

/**
 * Numbers: decimals with `_` separators. The lookbehind keeps ids (v2.5) and
 * hyphenated tokens (--shadow-2xs) plain — and, as a trade-off, leaves a
 * sign directly attached to a number (oklch(-0.02…)) untinted. css also
 * matches #hex colors.
 */
const NUMBER = String.raw`(?<![\w$#.-])\d[\d_]*(?:\.\d+)?`;
const NUMBER_CSS = `${NUMBER}|${String.raw`#[0-9a-fA-F]{3,8}\b`}`;

const STRINGS =
  String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*"|` + '`(?:[^`\\\\]|\\\\.)*`';

const escapeCode = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Escaped HTML with `<span class="tok-*">` tints; deterministic in/out. */
export function highlight(code: string, lang: string): string {
  const escaped = escapeCode(code);
  const key = ALIASES[lang] ?? (Object.hasOwn(KEYWORDS, lang) ? lang : 'ts');
  const cats: string[] = [];
  const parts: string[] = [];
  const push = (cat: string, src: string): void => {
    cats.push(cat);
    parts.push(`(${src})`);
  };

  push('comment', COMMENTS[key] ?? COMMENTS.ts);
  push('string', STRINGS);
  const keywords = KEYWORDS[key];
  if (keywords) push('keyword', `\\b(?:${keywords})\\b`);
  if (TAGS[key]) push('tag', TAGS[key]);
  if (FUNCTION_LANGS.has(key)) push('function', FUNCTION);
  push('number', key === 'css' ? NUMBER_CSS : NUMBER);

  const re = new RegExp(parts.join('|'), 'g');
  return escaped.replace(re, (match: string, ...groups: unknown[]) => {
    const cat = cats[groups.findIndex((group) => group !== undefined)];
    return cat ? `<span class="tok-${cat}">${match}</span>` : match;
  });
}

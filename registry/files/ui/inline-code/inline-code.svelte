<!--
  jixoai inline code (registry/files/ui/inline-code/inline-code.svelte).
  The inline source-code chip of the variant grammar (frozen r1,
  2026-08-26): a native <code> — the element whose entire meaning is
  "this is source code" — wearing the ladder's tonal/outline paint and
  the kbd-law geometry (band from --jx-line-secondary, inline insets
  only, 1px border, radius var(--radius)). Mono with UNTOUCHED case:
  code is not a label, so none of the eyebrow voice applies (no
  uppercase, no tracking, no font-nav).

  Default tonal parity with jx-pure's bare <code> law (design §4):
  the base carries the local neutral injection as the ARBITRARY form
  ([--jx-tonal:var(--muted-foreground)]) — the EARLY slot — so BOTH
  consumer layers override it (hue-injection-utilities, 2026-08-27;
  the r2 blocker fix): a consumer's arbitrary class dedupes against
  it through cn() (same-form last-wins), and a consumer's jx-hue-*
  intent utility outranks it (utilities sort AFTER arbitrary
  properties in the sheet — probed on Tailwind 4.3.3). Component
  token defaults ride the early slot; consumers win from either
  layer. That is the frozen consumer-wins contract (design §4).
  Overriding the recipe's own properties with same-family utilities
  may need the consumer's `!` — same-property utility order is not
  consumer-guaranteed (the press-button precedent).

  Shiki tokens are an ASYNC ENHANCEMENT, never the frame: SSR paints
  the plain children text; after hydration an $effect tokenizes it
  through lib/shiki's highlightTokens (on-demand grammars, the
  zero-download jixoai css-variables theme) and swaps in
  <span style="color:var(--tok-…)">…</span> over the SAME text — zero
  layout shift, and an unknown language or highlighter failure
  degrades to the plain chip. The chip carries the --tok-* palette
  itself (see tokenPalette below — the utilities twin of
  code-card.css's palette), so it highlights anywhere in prose; the
  frame NEVER depends on detection: lang="auto" (default) runs the
  zero-download fingerprint heuristic below; an explicit lang skips
  it; 'text'/'plain' stay plain forever.

  The source is snapshotted from the DOM when the effect runs (mount
  or a lang change). Children whose text mutates reactively in place
  re-render as authored — remount ({#key}) to re-detect; anything
  long or dynamic belongs to code-card, which takes code as a prop.
-->
<script module lang="ts">
  /** the ladder paint ids InlineCode ships (design.md §1/§4) */
  export type InlineCodeVariant = 'tonal' | 'outline';

  /**
   * Detection candidates: the grammar ids + aliases registered in
   * lib/shiki's langLoaders/langAliases, mirrored here by hand. This
   * list powers the heuristic and the docs enumeration only —
   * highlightTokens itself accepts anything registered in lib/shiki.
   */
  export const INLINE_LANGS = [
    'typescript', 'tsx', 'javascript', 'jsx', 'svelte', 'html', 'css',
    'scss', 'json', 'bash', 'markdown', 'yaml', 'vue',
    'ts', 'mts', 'cts', 'js', 'mjs', 'cjs',
    'sh', 'shell', 'zsh', 'shellscript',
    'md', 'yml', 'htm',
  ] as const;

  /** a fingerprint: a cheap regex tuned for INLINE snippets + its confidence weight */
  type Fingerprint = readonly [pattern: RegExp, weight: number];

  /** canonical grammar id → fingerprints (aliases resolve in detectInlineLang) */
  const FINGERPRINTS: Readonly<Record<string, readonly Fingerprint[]>> = {
    svelte: [
      [/\{#(if|each|await|snippet|key)/, 3],
      [/\{@(html|render|const|debug)/, 3],
      [/<svelte:/, 3],
      [/<[a-z][^>]*=\{[^}]+\}/, 2],
    ],
    vue: [
      [/<template>/, 3],
      [/[\s<]v-(if|for|model|show)\b/, 3],
      [/:class=/, 2],
    ],
    html: [
      [/<!DOCTYPE/i, 3],
      [/<\/[a-z][a-z0-9-]*>/, 2],
      [/<(div|span|p|a|section|main|head|body|ul|li)\b/i, 1],
    ],
    css: [
      [/\bvar\(--[\w-]+\)/, 3],
      [/[.#][\w-]+\s*\{[^{}]*:[^{}]*\}/, 2],
      [/@(media|layer|supports|keyframes)\b/, 1],
    ],
    scss: [
      [/\$[\w-]+\s*:/, 3],
      [/@(use|include|mixin|extend)\b/, 3],
      [/\bvar\(--[\w-]+\)/, 1],
    ],
    typescript: [
      [/\binterface\s+\w+/, 3],
      [/\btype\s+\w+\s*=/, 3],
      [/:\s*(string|number|boolean|unknown|any)\b/, 2],
      [/\b(const|let)\s+[\w$]+\s*(:|=)/, 2],
      [/=>/, 2],
      [/\bas\s+[A-Z]\w*/, 1],
    ],
    tsx: [
      [/\binterface\s+\w+/, 3],
      [/<[A-Z]\w*[\s/>]/, 2],
      [/:\s*(string|number|boolean)\b/, 1],
    ],
    javascript: [
      [/\b(function|const|let)\s/, 1],
      [/=>/, 1],
      [/\b(document|console)\./, 1],
    ],
    jsx: [
      [/<[A-Z]\w*[\s/>]/, 2],
      [/=>/, 1],
      [/\bconst\s/, 1],
    ],
    json: [
      [/^[\[{]/, 2],
      [/["'][\w.-]+["']\s*:\s*["'[\{tfn-]/, 3],
      [/\b(true|false|null)\b/, 1],
    ],
    bash: [
      [/^(npm|pnpm|yarn|bun|cd|git|mkdir|rm|sudo|brew|curl|chmod)\s/m, 3],
      [/^\$\s/m, 2],
      [/&&\s/, 1],
      [/\b(grep|awk|sed|export|echo)\b/, 1],
    ],
    markdown: [
      [/```/, 3],
      [/^#{1,6}\s/m, 2],
      [/^\s*[-*]\s+\S/m, 1],
      [/\[.+?\]\(.+?\)/, 1],
    ],
    yaml: [
      [/^---\s*$/m, 3],
      [/^[\w.$-]+:\s(\S|$)/m, 2],
      [/^\s+-\s/m, 1],
    ],
  };

  /** alias → canonical grammar id, mirroring lib/shiki's langAliases */
  const DETECT_ALIASES: Readonly<Record<string, string>> = {
    ts: 'typescript', mts: 'typescript', cts: 'typescript',
    js: 'javascript', mjs: 'javascript', cjs: 'javascript',
    sh: 'bash', shell: 'bash', zsh: 'bash', shellscript: 'bash',
    md: 'markdown', yml: 'yaml', htm: 'html',
  };

  /**
   * The honest heuristic: zero-download regex fingerprints tuned for
   * SHORT INLINE snippets — this is not a general language detector.
   * Every candidate's fingerprints run against the source; weights of
   * the matching ones add up; the highest score wins (table order
   * breaks ties, most-specific grammars first) and the CANONICAL
   * grammar id comes back. A lone weight-1 fingerprint never claims a
   * language, and no candidate reaching 2 means '' — plain text, no
   * grammar downloaded, the chip stays exactly as SSR painted it. An
   * explicit lang prop skips this entirely; a wrong guess costs color
   * only, never the frame (design.md §4).
   */
  export function detectInlineLang(code: string): string {
    let best = '';
    let bestScore = 1; // the threshold: single weight-1 hits stay plain
    for (const candidate of Object.keys(FINGERPRINTS)) {
      let score = 0;
      for (const [pattern, weight] of FINGERPRINTS[candidate]) {
        if (pattern.test(code)) score += weight;
      }
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    return DETECT_ALIASES[best] ?? best;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { highlightTokens } from '$lib/shiki';

  interface Props extends HTMLAttributes<HTMLElement> {
    density?: Density;
    variant?: InlineCodeVariant;
    /**
     * 'auto' (default) = the zero-download fingerprint heuristic picks
     * the grammar; an explicit id/alias (ts, svelte, sh, …) skips
     * detection; 'text'/'plain'/'plaintext' stay plain forever.
     */
    lang?: string;
  }

  let {
    density,
    variant = 'tonal',
    lang = 'auto',
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));

  /**
   * The design.md §1 recipes + the §6 forced-colors degradation
   * (Canvas/CanvasText; the 1px border survives on both variants).
   * Paint law (batch D's TW4 probe, 2026-08-26): the base carries
   * width-only `border`; each rung is the SOLE border-color source in
   * its class list (a named .border-* would sort AFTER an arbitrary
   * [border-color:…] and silently win), and the recipes ride TYPED
   * arbitrary forms (bg-[color-mix(…)], border-[color:var(…)]) which
   * emit @supports fallbacks to plain var(--jx-tonal) in engines
   * without color-mix. The tonal base carries the local neutral
   * injection ([--jx-tonal:var(--muted-foreground)]) — parity with jx-pure's bare <code>
   * law; a consumer's jx-hue-* replaces it through cn().
   */
  const variantUtilities = {
    tonal:
      '[--jx-tonal:var(--muted-foreground)] bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-[color:var(--jx-tonal)] forced-colors:bg-[color:Canvas] forced-colors:border-[color:CanvasText] forced-colors:text-[color:CanvasText]',
    outline:
      'bg-transparent border-[color:var(--jx-outline)] text-foreground forced-colors:bg-[color:Canvas] forced-colors:border-[color:CanvasText] forced-colors:text-[color:CanvasText]',
  } as const;

  /**
   * The --tok-* Shiki palette as arbitrary-property utilities — the SAME
   * values code-card.css wires (one palette, two surfaces; the dark
   * adaptations ride the theme sheet's dark: variant), so a chip in
   * prose highlights without living inside a code-card. Consumers
   * retune any slot with their own [--tok-token-…:…] utility.
   */
  const tokenPalette =
    '[--tok-token-comment:color-mix(in_oklab,var(--foreground)_44%,transparent)] ' +
    '[--tok-token-string:var(--accent)] [--tok-token-string-expression:var(--accent)] ' +
    '[--tok-token-keyword:var(--primary)] ' +
    '[--tok-token-constant:color-mix(in_oklab,var(--secondary)_78%,var(--foreground))] ' +
    '[--tok-token-function:color-mix(in_oklab,var(--primary)_62%,var(--foreground))] ' +
    '[--tok-token-parameter:color-mix(in_oklab,var(--foreground)_78%,var(--accent))] ' +
    '[--tok-token-punctuation:color-mix(in_oklab,var(--foreground)_62%,transparent)] ' +
    '[--tok-token-link:var(--accent)] ' +
    '[--tok-token-inserted:oklch(0.58_0.12_150)] [--tok-token-deleted:oklch(0.55_0.16_25)] ' +
    '[--tok-token-changed:oklch(0.68_0.12_85)] ' +
    'dark:[--tok-token-comment:color-mix(in_oklab,var(--foreground)_55%,transparent)] ' +
    'dark:[--tok-token-constant:var(--secondary)] ' +
    'dark:[--tok-token-function:color-mix(in_oklab,var(--primary)_58%,oklch(1_0_0))]';

  /** one token of the flattened stream highlightTokens returns */
  type InlineToken = Awaited<ReturnType<typeof highlightTokens>>[number];

  let codeEl = $state<HTMLElement>();
  /** the token paint; null = the SSR/plain paint (children verbatim) */
  let tokens: InlineToken[] | null = $state(null);
  /** guards against out-of-order resolutions when lang changes quickly */
  let generation = 0;

  /** Shiki's special languages render plain — no grammar, no detection */
  const PLAIN_LANGS = new Set(['text', 'plain', 'plaintext', 'ansi']);

  $effect(() => {
    // deps: the element mount + the lang prop. The source is snapshotted
    // from the DOM here; the token swap keeps the same text, so a later
    // lang change re-reads the same string through the token spans.
    const language = lang;
    const source = codeEl?.textContent ?? '';
    const mine = ++generation;
    const resolved = language === 'auto' ? detectInlineLang(source) : language;
    if (source === '' || resolved === '' || PLAIN_LANGS.has(resolved)) {
      tokens = null;
      return;
    }
    highlightTokens(source, { lang: resolved })
      .then((next) => {
        if (mine !== generation) return;
        // spans with no color gain nothing over the plain paint
        tokens = next.some((token) => token.color !== undefined) ? next : null;
      })
      .catch((error: unknown) => {
        // unknown language or a highlighter failure: the plain chip is
        // already correct — keep it and say why (code-card parity)
        if (mine !== generation) return;
        tokens = null;
        console.warn('[jixoai/inline-code] plain-text fallback:', error);
      });
  });
</script>

{#snippet tokenPaint()}
  {#each tokens as token, index (index)}
    {#if token.color}
      <span style={`color:${token.color}`}>{token.content}</span>
    {:else}
      {token.content}
    {/if}
  {/each}
{/snippet}

<code
  bind:this={codeEl}
  data-jx-inline-code={variant}
  data-density={resolvedDensity}
  class={cn(
    'inline-block font-mono [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] [padding-inline:var(--jx-inset)] border rounded-(--radius) whitespace-nowrap',
    tokenPalette,
    variantUtilities[variant],
    className,
  )}
  {...rest}
>
  {#if tokens}
    {@render tokenPaint()}
  {:else}
    {@render children?.()}
  {/if}
</code>

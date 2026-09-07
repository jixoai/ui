<!--
  jixoai inline code (registry/files/ui/inline-code/inline-code.svelte).
  The inline source-code chip of the variant grammar: a native <code> —
  the element whose entire meaning is "this is source code" — wearing
  the ladder's fused/tonal/outline paint (frozen r4, 2026-09-08) and
  the kbd-law geometry (band from --jx-line-secondary, the padding
  formula's inline insets, 1px border, radius var(--jx-chip-radius)).
  Mono with UNTOUCHED case: code is not a label, so none of the
  eyebrow voice applies (no uppercase, no tracking, no font-nav).

  DEFAULT FUSED (Owner ruling, 2026-09-08, design D2): the separator's
  backdrop-fusion technique promoted to chip paint — a transparent
  ground + a backdrop contrast filter pulls whatever sits BEHIND the
  chip toward mid (near-black lifts, near-white dims), so the band
  reads over any ground with zero color tokens. The fusion IS the
  frame: the shared base keeps its width-only `border`, fused colors
  it border-transparent (a colorless width-only border would paint
  currentColor — the frame law), and forced-colors repaints the same
  frame border-[color:CanvasText] so the degrade stays visible. On a
  flat page ground fused is deliberately near-invisible — the ghost's
  own quiet; the tuning knob is the contrast %, never a revert.
  tonal/outline stay available verbatim, and tonal keeps the arbitrary
  early-slot neutral injection ([--jx-tonal:var(--muted-foreground)])
  — parity with jx-pure's bare <code> law; a consumer's arbitrary
  class dedupes against it through cn() (same-form last-wins), and a
  consumer's jx-hue-* intent utility outranks it (utilities sort AFTER
  arbitrary properties in the sheet). That is the frozen
  consumer-wins contract; overriding a rung's own properties with
  same-family utilities may need the consumer's `!` (same-property
  utility order is not consumer-guaranteed — the press-button
  precedent).

  THE ENGINE SEAM (design D1, code-card.svelte's chain verbatim):
  backend prop → HIGHLIGHT_KEY context → the stock
  DEFAULT_MICROLIGHTER_BACKEND — the microlighter RANGE engine (zero
  markup: token ranges in the global CSS.highlights registry over the
  SAME text node, so the text stays copyable and editable; scans are
  rAF-coalesced document-wide, see microlighter.ts). The shiki
  token-span path is RETIRED; the --tok-* palette below STAYS because
  the microlighter jixoai theme's --syntax-* rules bridge onto it —
  the range paint resolves chip-side without a card's <pre>.
  PRE-GATE (the Owner's 纯文本降级 ruling): the chip checks
  CSS.highlights + the Highlight constructor BEFORE calling any
  backend — unavailable (jsdom, old Safari) ⇒ stay plain, silently:
  no call, no console noise. Print degrades by a SEPARATE mechanism
  (the pre-gate passes there, but ranges do not survive the freeze
  clone — microlighter.ts's documented limitation); the two degrades
  are never conflated. Detection stays OURS — sync, zero-download
  fingerprints below; the backend call is the async in-place upgrade,
  so a markdown page full of chips costs one scan per frame and zero
  per-span keyed work.

  GEOMETRY (design D4/D6): radius rides the density ladder token
  --jx-chip-radius (2xs/xs/sm→2px, default→4px, lg→8px — NOT the
  global --radius corner token); padding-inline =
  radius + fontSize × (lineHeight − 1) / 2, owned by inline-code.css's
  ONE :where rule over --jx-code-fs/--jx-code-line custom properties
  (explicit modifier props mirror onto them via the style attribute —
  the vision-pass pivot; the arbitrary-utility form never survived
  Tailwind's scanner).

  THE SIX TEXT MODIFIERS (lineHeight/weight/italic/tracking/family/
  fontSize) ride the shared kernel ($lib/text-style.svelte — the
  @jixoai/text item, pulled in by the registry edge): resolveTextStyle
  lands AFTER the variant utilities and BEFORE the consumer class. An
  explicit fontSize/lineHeight also feeds the padding calc AND
  replaces the base's token utility for that property (conditional
  emission — same-property utility order is not guaranteed, so the
  token twin is dropped, not outranked).

  The source is snapshotted from the DOM when the effect runs (mount
  or a lang change). Children whose text mutates reactively in place
  re-render as authored — remount ({#key}) to re-detect; anything
  long or dynamic belongs to code-card, which takes code as a prop.
-->
<script module lang="ts">
  /** the ladder paint ids InlineCode ships — the frozen-table union
   *  lives in the family Defaults (r11 same-folder-literal convention)
   *  and is re-exported here so the public surface keeps its shape */
  import type { InlineCodeVariant } from './inline-code-defaults.svelte';
  export type { InlineCodeVariant };

  /**
   * Detection candidates: the grammar ids + aliases the heuristic and
   * the docs enumeration cover, mirrored by hand from the highlight
   * engines' curated sets. The resolved id rides opts.lang to the
   * backend; microlighter's grammar miss degrades silently (its
   * documented bundler/miss contract).
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
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import type { Density } from '$lib/density.svelte';
  import type { HighlightBackend } from '$lib/highlight/backend';
  // registry-safe seam (the density law): the key + structural type
  // only — the chip never imports the kernel side
  // (lib/highlight/context.svelte.ts stays a site-only module), the
  // code-card.svelte precedent
  import { HIGHLIGHT_KEY, type HighlightContextValue } from '$lib/highlight/context-key';
  import { DEFAULT_MICROLIGHTER_BACKEND } from '$lib/highlight/microlighter';
  import { resolveTextStyle, type TextStyleProps } from '$lib/text-style.svelte';
  import { InlineCodeDefaults } from './inline-code-defaults.svelte';
  import './inline-code.css';

  interface Props extends HTMLAttributes<HTMLElement>, TextStyleProps {
    density?: Density;
    variant?: InlineCodeVariant;
    /**
     * 'auto' (default) = the zero-download fingerprint heuristic picks
     * the grammar; an explicit id/alias (ts, svelte, sh, …) skips
     * detection; 'text'/'plain'/'plaintext' stay plain forever.
     */
    lang?: string;
    /**
     * Highlight backend instance — the engine seam (code-card's
     * chain): prop → HIGHLIGHT_KEY context → the stock microlighter
     * range engine. Omitted with no provider: DEFAULT_MICROLIGHTER_
     * BACKEND. The pre-gate below guards the API range backends need;
     * a rejecting backend leaves the plain chip standing.
     */
    backend?: HighlightBackend;
  }

  let {
    density,
    variant,
    lang = 'auto',
    backend,
    lineHeight,
    weight,
    italic,
    tracking,
    family,
    fontSize,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4): variant rides the paint axis slot (zone ambient,
  // frozen own 'fused'), density the no-opinion axis slot
  const d = $derived(InlineCodeDefaults.resolve({ variant, density }));

  // backend resolution: prop → context default → stock microlighter.
  // The context is captured ONCE at init (Svelte's getContext phase);
  // its getter-backed `.backend` stays reactive inside the derived
  // below, so an app-side `highlight.set(...)` repaints chips live.
  const highlightContext = getContext<HighlightContextValue | undefined>(HIGHLIGHT_KEY);
  const activeBackend = $derived(
    backend ?? highlightContext?.backend ?? DEFAULT_MICROLIGHTER_BACKEND,
  );

  /**
   * The design.md §1 recipes + the §6 forced-colors degradation
   * (Canvas/CanvasText; the 1px border survives on every rung).
   * Paint law (batch D's TW4 probe, 2026-08-26): the base carries
   * width-only `border`; each rung is the SOLE border-color source in
   * its class list (a named .border-* would sort AFTER an arbitrary
   * [border-color:…] and silently win), and the recipes ride TYPED
   * arbitrary forms (bg-[color-mix(…)], border-[color:var(…)]) which
   * emit @supports fallbacks to plain var(--jx-tonal) in engines
   * without color-mix. The tonal rung carries the local neutral
   * injection ([--jx-tonal:var(--muted-foreground)]) — parity with jx-pure's bare <code>
   * law; a consumer's jx-hue-* replaces it through cn().
   *
   * fused (design D2, 2026-09-08): the backdrop-fusion rung —
   * transparent ground, the width-only border painted transparent
   * (currentColor would otherwise leak), and backdrop-contrast-75
   * pulling the backdrop toward mid. 75 is measured against the
   * retired tonal default's band weight — a 12% foreground tint on
   * near-white lands within a hair of contrast(0.75)'s mapping — and
   * sits strictly under the separator's full ghost (0.5). Print drops
   * backdrop-filter to transparent (bare mono code — the separator's
   * own print posture); forced-colors keeps the CanvasText frame.
   */
  const variantUtilities = {
    fused:
      'bg-transparent border-transparent backdrop-contrast-75 text-foreground forced-colors:border-[color:CanvasText]',
    tonal:
      '[--jx-tonal:var(--muted-foreground)] bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-[color:var(--jx-tonal)] forced-colors:bg-[color:Canvas] forced-colors:border-[color:CanvasText] forced-colors:text-[color:CanvasText]',
    outline:
      'bg-transparent border-[color:var(--jx-outline)] text-foreground forced-colors:bg-[color:Canvas] forced-colors:border-[color:CanvasText] forced-colors:text-[color:CanvasText]',
  } as const;

  /**
   * The --tok-* palette as arbitrary-property utilities — the SAME
   * values code-card.css wires (one palette, two surfaces; the dark
   * adaptations ride the theme sheet's dark: variant), carried by the
   * chip itself so range paint resolves WITHOUT a card: the
   * microlighter jixoai theme's [data-syntax-theme='jixoai'] rules
   * bridge --syntax-* onto these --tok-* slots, and the chip stamps
   * that anchor on its own <code>. Consumers retune any slot with
   * their own [--tok-token-…:…] utility.
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

  /** Shiki's special languages render plain — no grammar, no detection */
  const PLAIN_LANGS = new Set(['text', 'plain', 'plaintext', 'ansi']);

  let codeEl = $state<HTMLElement>();
  /** guards the async tail: a stale rejection must not warn over a
   * newer run's outcome when lang changes quickly */
  let generation = 0;

  /**
   * The padding formula's INPUT MIRROR (design D6, the vision-pass
   * pivot): the formula itself lives in inline-code.css as ONE
   * :where([data-jx-inline-code]) rule over custom properties with
   * token fallbacks — the long nested calc could never survive
   * Tailwind's source scanner as an arbitrary utility (found live:
   * zero padding-inline on every chip). Explicit modifier props are
   * mirrored here onto --jx-code-fs / --jx-code-line through the
   * style attribute, the only channel that carries runtime literals:
   *
   *   fontSize set               → --jx-code-fs:<the length>
   *   lineHeight number          → --jx-code-line:calc((fs) * ratio)
   *                               (fs = the explicit fontSize, else the
   *                               --jx-text-secondary token var)
   *   lineHeight string (length) → --jx-code-line:<the length> (it IS
   *                               the line box)
   *
   * Absent props emit nothing — the css rule's fallbacks read the
   * density pair and the formula stays exact for ambient density
   * (radius is a var everywhere). The style attribute sits BEFORE
   * the rest spread: a consumer's own style wins wholesale.
   */
  const codeVars = $derived.by(() => {
    const decls: string[] = [];
    if (fontSize !== undefined) decls.push(`--jx-code-fs:${fontSize}`);
    if (lineHeight !== undefined) {
      decls.push(
        typeof lineHeight === 'number'
          ? `--jx-code-line:calc((${fontSize ?? 'var(--jx-text-secondary)'}) * ${lineHeight})`
          : `--jx-code-line:${lineHeight}`,
      );
    }
    return decls.length > 0 ? decls.join(';') : undefined;
  });

  /**
   * The base frame. The token paint utilities are emitted ONLY when
   * the matching modifier prop is absent: resolveTextStyle's utility
   * for the same property would race them in the sheet (same-property
   * utility order is not consumer-guaranteed) — DROPPING the token
   * twin is the guarantee, not ordering. padding-inline is NOT here:
   * the formula rides inline-code.css's :where rule (the vision-pass
   * pivot — see codeVars below).
   */
  const baseUtilities = $derived.by(() => {
    const parts = ['inline-block', 'font-mono'];
    if (fontSize === undefined) parts.push('[font-size:var(--jx-text-secondary)]');
    if (lineHeight === undefined) parts.push('[line-height:var(--jx-line-secondary)]');
    parts.push('border', 'rounded-(--jx-chip-radius)', 'whitespace-nowrap');
    return parts.join(' ');
  });

  $effect(() => {
    // deps: the element mount + the lang prop + the resolved backend.
    // The source is snapshotted from the DOM here; the range paint
    // keeps the same text node, so a later lang change re-reads the
    // same string.
    const el = codeEl;
    const source = el?.textContent ?? '';
    const mine = ++generation;
    const resolved = lang === 'auto' ? detectInlineLang(source) : lang;
    if (el === undefined || source === '' || resolved === '' || PLAIN_LANGS.has(resolved)) {
      return;
    }
    // the PRE-GATE: no CSS Custom Highlight API ⇒ stay plain,
    // silently — no call, no console noise (jsdom + old Safari; print
    // degrades by range-loss separately, never conflated). Applies to
    // ANY backend: a range surface has no honest fallback but plain.
    const globals = globalThis as { CSS?: { highlights?: unknown }; Highlight?: unknown };
    if (globals.CSS?.highlights === undefined || typeof globals.Highlight !== 'function') {
      return;
    }
    // no theme passed: undefined ⇒ the jixoai default, whose --syntax-*
    // bridge resolves onto the chip's own --tok-* palette above
    activeBackend
      .highlight(el, source, { lang: resolved })
      .catch((error: unknown) => {
        // grammar miss or engine failure: the plain chip is already
        // correct — keep it and say why (code-card parity)
        if (mine !== generation) return;
        console.warn('[jixoai/inline-code] plain-text fallback:', error);
      });
  });
</script>

<code
  bind:this={codeEl}
  data-jx-inline-code={d.variant}
  data-density={d.density}
  style={codeVars}
  class={cn(
    baseUtilities,
    tokenPalette,
    variantUtilities[d.variant],
    resolveTextStyle({ lineHeight, weight, italic, tracking, family, fontSize }),
    className,
  )}
  {...rest}
>
  {@render children?.()}
</code>

<!--
  jixoai code card (registry/files/ui/code-card.svelte).
  Readonly code surface — highlighting IS Shiki (lib/shiki.ts): a stock
  `shiki/core` highlighter with on-demand grammars and themes, the JavaScript
  regex engine (no WASM), and the default zero-download `jixoai` theme built
  from Shiki's own css-variables recipe so token paint resolves to the --tok-*
  palette below — light/dark adaptation is pure CSS, one markup both themes.

  Intent list (2026-08-22, user): "基于 Shiki 的成熟高亮，按需加载；良好的
  滚动支持；明确声明基于 Shiki，不过度封装，兼容 Shiki 生态。"
  1. progressive enhancement: prerender paints the escaped plain sample
     (readable, zero JS); after hydration Shiki resolves and the SAME <code>
     element swaps in token spans — same box, same font, no layout shift.
  2. scroll law: the <pre> is the scrollport — horizontal always (Tab chars
     stay tabs, long lines never wrap), vertical when maxHeight caps it;
     thin currentColor scrollbars, overscroll containment, keyboard-focusable.
  3. named Shiki themes ride along: the theme's editor colors from Shiki's
     <pre> output are re-applied to this card's <pre> verbatim, so a real
     theme (github-dark, …) paints its own ground instead of fighting the
     card.

  `code` is a runtime prop, never markup-inlined text: Shiki HTML-escapes all
  source, so a sample containing a literal closing-script tag is inert data
  and cannot terminate the host page's script — consumers owe no
  template-level escaping.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { highlightCode } from '$lib/shiki';

  interface Props {
    /** Code sample (runtime string; Shiki escapes it into inert spans). */
    code: string;
    /** Shiki language id (ts/tsx/js/jsx/svelte/html/css/scss/json/bash/… and aliases). */
    lang?: string;
    /**
     * Shiki theme: 'jixoai' (default — the css-variables theme bound to the
     * --tok-* palette) or any theme registered in lib/shiki (github-dark,
     * vitesse-light, … or your own registerTheme entry).
     */
    theme?: string;
    /** Filename tab on the head's left. The head renders when filename or header exists. */
    filename?: string;
    /** Custom head-right area; fully replaces the default lang label (filename stays left). */
    header?: Snippet;
    /** Custom footer content on the footer bar's left. */
    footer?: Snippet;
    /** Copy control on the footer bar's right (press physics, copied feedback). */
    copyable?: boolean;
    /** CSS length that caps the code body and turns on vertical scrolling. */
    maxHeight?: string;
    class?: string;
  }

  let {
    code,
    lang = 'ts',
    theme = 'jixoai',
    filename = '',
    header,
    footer,
    copyable = true,
    maxHeight = '',
    class: className = '',
  }: Props = $props();

  /** Shiki token markup (inner of its <code>); '' = plain-text paint. */
  let tokenHtml = $state('');
  /** Shiki's <pre> inline style (theme editor colors), applied verbatim. */
  let preStyle = $state('');
  /** Guards against out-of-order resolutions when props change quickly. */
  let generation = 0;

  $effect(() => {
    const source = code;
    const language = lang;
    const themeName = theme;
    const mine = ++generation;
    highlightCode(source, { lang: language, theme: themeName })
      .then((html) => {
        if (mine !== generation) return;
        tokenHtml = innerCodeHtml(html);
        preStyle = preStyleOf(html);
      })
      .catch((error: unknown) => {
        // unknown lang/theme or a highlighter failure: the plain sample is
        // already on screen — keep it and say why in the console
        if (mine !== generation) return;
        tokenHtml = '';
        preStyle = '';
        console.warn('[jixoai/code-card] plain-text fallback:', error);
      });
  });

  /**
   * Shiki's classic structure is <pre …><code…>INNER</code></pre>; source
   * text is entity-escaped inside INNER, so the first <code open and the
   * last </code> close bracket exactly the token markup. Keeping only the
   * inner markup makes this card's <pre> the single scrollport — padding,
   * scrollbars and max-height stay one implementation across the plain and
   * highlighted paints (no CLS on the swap, no nested scroll areas).
   */
  function innerCodeHtml(html: string): string {
    const open = html.indexOf('<code');
    const openEnd = html.indexOf('>', open);
    const close = html.lastIndexOf('</code>');
    return open === -1 || openEnd === -1 || close === -1 ? html : html.slice(openEnd + 1, close);
  }

  /** the theme's editor colors from Shiki's <pre style="…">, verbatim */
  function preStyleOf(html: string): string {
    return /^<pre[^>]*style="([^"]*)"/.exec(html)?.[1] ?? '';
  }

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  const copyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // preview servers / embedded contexts without a clipboard grant
      const area = document.createElement('textarea');
      area.value = code;
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1600);
  };
</script>

<figure class={`jx-code-card ${className}`}>
  {#if filename || header}
    <figcaption class="jx-code-card-head">
      {#if filename}
        <span class="jx-code-card-file">{filename}</span>
      {/if}
      <span class="jx-code-card-side">
        {#if header}
          {@render header()}
        {:else}
          <span class="jx-code-card-lang">{lang}</span>
        {/if}
      </span>
    </figcaption>
  {/if}
  <pre
    data-lang={lang}
    class:vscroll={maxHeight !== ''}
    style={[preStyle, maxHeight !== '' ? `max-height:${maxHeight}` : '']
      .filter(Boolean)
      .join(';')}
    tabindex="0"
    aria-label={filename ? `${filename} code sample` : `${lang} code sample`}
  ><code>{#if tokenHtml}{@html tokenHtml}{:else}{code}{/if}</code></pre>
  {#if footer || copyable}
    <div class="jx-code-card-foot">
      <span class="jx-code-card-foot-side">
        {#if footer}
          {@render footer()}
        {/if}
      </span>
      {#if copyable}
        <button
          type="button"
          class="jx-code-card-copy"
          class:copied
          onclick={copyCode}
          aria-label={copied ? 'copied' : `copy ${filename || lang} sample`}
        >
          {#if copied}
            <svg
              class="jx-code-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>copied</span>
          {:else}
            <svg
              class="jx-code-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="12" height="12" rx="0" />
              <path d="M5 15V4a1 1 0 0 1 1-1h10" />
            </svg>
            <span>copy</span>
          {/if}
        </button>
      {/if}
    </div>
  {/if}
</figure>

<style>
  /* readonly-code law (design-tokens.md supplements): the scoped token
     definitions mirror the documented values so the card is self-sufficient
     with only the jixoai-theme sheet installed. The variable names are the
     Shiki css-variables theme contract (--tok-foreground / --tok-token-*),
     so lib/shiki's default theme paints straight from here. */
  .jx-code-card {
    --readonly-code-bg: color-mix(in oklab, var(--muted) 42%, var(--background));
    --readonly-code-border: color-mix(in oklab, var(--border) 18%, transparent);
    --readonly-code-meta-bg: color-mix(in oklab, var(--accent) 12%, var(--background));
    --readonly-code-meta-fg: color-mix(in oklab, var(--accent) 58%, var(--foreground));

    /* Shiki css-variables palette: primary family + muted, per the visual law */
    --tok-foreground: var(--foreground);
    --tok-background: transparent;
    --tok-token-comment: color-mix(in oklab, var(--foreground) 44%, transparent);
    --tok-token-string: var(--accent);
    --tok-token-string-expression: var(--accent);
    --tok-token-keyword: var(--primary);
    --tok-token-constant: color-mix(in oklab, var(--secondary) 78%, var(--foreground));
    --tok-token-function: color-mix(in oklab, var(--primary) 62%, var(--foreground));
    --tok-token-parameter: color-mix(in oklab, var(--foreground) 78%, var(--accent));
    --tok-token-punctuation: color-mix(in oklab, var(--foreground) 62%, transparent);
    --tok-token-link: var(--accent);
    --tok-token-inserted: oklch(0.58 0.12 150);
    --tok-token-deleted: oklch(0.55 0.16 25);
    --tok-token-changed: oklch(0.68 0.12 85);

    background: var(--readonly-code-bg);
    border: 1px solid var(--readonly-code-border);
    margin: 0;
    min-width: 0;
  }
  :global(.dark) .jx-code-card {
    --readonly-code-bg: color-mix(in oklab, var(--muted) 78%, var(--background));
    --readonly-code-meta-bg: color-mix(in oklab, var(--accent) 18%, var(--background));
    --readonly-code-meta-fg: color-mix(in oklab, var(--accent) 60%, oklch(1 0 0));

    /* dark: brighter primary family */
    --tok-token-comment: color-mix(in oklab, var(--foreground) 55%, transparent);
    --tok-token-constant: var(--secondary);
    --tok-token-function: color-mix(in oklab, var(--primary) 58%, oklch(1 0 0));
  }

  /* the pre is the scrollport: native Tab characters stay tabs, long lines
     scroll instead of wrapping; thin currentColor scrollbars on both axes
     with containment so a horizontal wheel/flick never chains to the page */
  .jx-code-card pre {
    font-size: 12.5px;
    line-height: 1.6;
    margin: 0;
    overflow-x: auto;
    overflow-y: visible;
    overscroll-behavior-x: contain;
    padding: 0.875rem;
    scrollbar-color: color-mix(in oklab, currentColor 26%, transparent) transparent;
    scrollbar-width: thin;
    tab-size: 4;
  }
  .jx-code-card pre.vscroll {
    overflow-y: auto;
    scrollbar-gutter: stable;
  }
  .jx-code-card pre::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  .jx-code-card pre::-webkit-scrollbar-track {
    background: transparent;
  }
  .jx-code-card pre::-webkit-scrollbar-thumb {
    background: color-mix(in oklab, currentColor 26%, transparent);
  }
  .jx-code-card pre:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: -2px;
  }

  /* head: hairline divider + font-nav filename tab on the meta tint */
  .jx-code-card-head {
    align-items: center;
    background: var(--readonly-code-meta-bg);
    border-bottom: 1px solid var(--readonly-code-border);
    color: var(--readonly-code-meta-fg);
    display: flex;
    font-size: 11px;
    gap: 0.75rem;
    letter-spacing: 0.08em;
    min-width: 0;
    padding: 0.32rem 0.75rem;
  }
  .jx-code-card-file {
    font-family: var(--font-nav);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-code-card-side {
    align-items: center;
    display: flex;
    margin-left: auto;
    min-width: 0;
  }
  .jx-code-card-lang {
    letter-spacing: 0.14em;
    opacity: 0.75;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* foot: hairline divider; custom content left, copy control right */
  .jx-code-card-foot {
    align-items: center;
    border-top: 1px solid var(--readonly-code-border);
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    min-height: 2.1rem;
    padding: 0.3rem 0.5rem 0.3rem 0.75rem;
  }
  .jx-code-card-foot-side {
    align-items: center;
    display: flex;
    min-width: 0;
  }

  /* compact copy control: the press-button grammar (shadow lift on hover,
     press on active) at card scale — press-button ships no size prop, so the
     same vocabulary is scoped here */
  .jx-code-card-copy {
    align-items: center;
    background: var(--background);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-2xs);
    color: var(--foreground);
    cursor: pointer;
    display: inline-flex;
    font-size: 11px;
    font-weight: 500;
    gap: 0.4rem;
    letter-spacing: 0.04em;
    padding: 0.25rem 0.6rem;
    transition:
      transform 150ms ease,
      box-shadow 150ms ease,
      background-color 150ms ease;
    white-space: nowrap;
  }
  .jx-code-card-copy:hover {
    background: var(--muted);
    box-shadow: var(--shadow-xs);
    transform: translate(-1px, -1px);
  }
  .jx-code-card-copy:active {
    box-shadow: none;
    transform: translate(1px, 1px);
  }
  .jx-code-card-copy.copied {
    background: var(--secondary);
    color: var(--secondary-foreground);
  }
  .jx-code-card-copy:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .jx-code-card-icon {
    height: 12px;
    width: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-code-card-copy {
      transition: none;
    }
  }
</style>

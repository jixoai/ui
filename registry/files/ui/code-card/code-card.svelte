<!--
  jixoai code card (registry/files/ui/code-card/code-card.svelte).
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
     stay tabs, long lines never wrap), vertical when maxHeight caps it or
     when fill mode pins head/foot and hands the whole body height to the
     <pre>; the theme scrollbar law (thin currentColor + both-edges
     gutters), overscroll containment, keyboard-focusable.
  3. named Shiki themes ride along: the theme's editor colors from Shiki's
     <pre> output are re-applied to this card's <pre> verbatim, so a real
     theme (github-dark, …) paints its own ground instead of fighting the
     card.

  `code` is a runtime prop, never markup-inlined text: Shiki HTML-escapes all
  source, so a sample containing a literal closing-script tag is inert data
  and cannot terminate the host page's script — consumers owe no
  template-level escaping.

  tw4 (2026-08-24): card/head/foot/copy statics + the fill/vscroll
  conditional paint ride token utilities in the markup (deterministic
  branches); code-card.css keeps the D1-exempt residue — the --tok-*
  Shiki palette wiring (with its .dark adaptation), the pre scrollport
  law (scrollbar-gutter compensation recipe), focus-visible rings and
  the reduced-motion kill.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { icons } from '$lib/icons';
  import { highlightCode } from '$lib/shiki';
  import { cn } from '$lib/utils';
  import './code-card.css';

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
    /**
     * Fill mode: the card stretches to its container's height and the <pre>
     * becomes the ONLY scroll area (head and foot stay pinned). The parent
     * owes the height (flex item, grid track, or an explicit height) — the
     * card never scrolls as a whole.
     */
    fill?: boolean;
    /**
     * CSS length that floors the card height — pairs with fill: a short
     * sample still opens the panel to a readable size instead of a slit,
     * while tall samples keep scrolling inside the <pre>.
     */
    minHeight?: string;
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
    fill = false,
    minHeight = '',
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
    // drop the previous paint IMMEDIATELY: until the new highlight resolves,
    // the plain fallback shows the CURRENT code — never stale highlighted
    // content from a previous code/lang/theme (Codex r1 P1)
    tokenHtml = '';
    preStyle = '';
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
   * Any structure we do not recognize yields '' — the plain-text fallback —
   * rather than feeding foreign markup to {@html} (Codex r1 hardening).
   */
  function innerCodeHtml(html: string): string {
    const open = html.indexOf('<code');
    const openEnd = html.indexOf('>', open);
    const close = html.lastIndexOf('</code>');
    if (open === -1 || openEnd === -1 || close === -1 || close <= openEnd) return '';
    return html.slice(openEnd + 1, close);
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

<figure
  class={cn(
    'jx-code-card bg-[color:var(--readonly-code-bg)] border border-[color:var(--readonly-code-border)] m-0 min-w-0',
    fill && 'fill flex flex-col h-full',
    className,
  )}
  style={minHeight !== '' ? `min-height:${minHeight}` : ''}
>
  {#if filename || header}
    <figcaption
      data-jx-code-card-head
      class="flex items-center gap-3 min-w-0 px-3 py-[0.32rem] text-[11px] tracking-[0.08em] bg-[color:var(--readonly-code-meta-bg)] border-b border-[color:var(--readonly-code-border)] text-[color:var(--readonly-code-meta-fg)]"
    >
      {#if filename}
        <span data-jx-code-card-file class="font-nav truncate">{filename}</span>
      {/if}
      <span data-jx-code-card-side class="flex items-center ml-auto min-w-0">
        {#if header}
          {@render header()}
        {:else}
          <span data-jx-code-card-lang class="tracking-[0.14em] opacity-75 uppercase whitespace-nowrap">{lang}</span>
        {/if}
      </span>
    </figcaption>
  {/if}
  <!-- tabindex keeps the scrollport keyboard-reachable (arrow scrolling for
       long lines / capped bodies) — the a11y lint prefers interactive roles,
       but this is the same contract Shiki's own <pre tabindex="0"> ships -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <pre
    data-lang={lang}
    data-jx-code-card-pre
    class={cn(maxHeight !== '' && 'vscroll overflow-y-auto', fill && 'flex-1 min-h-0 overflow-y-auto')}
    style={[preStyle, maxHeight !== '' ? `max-height:${maxHeight}` : '']
      .filter(Boolean)
      .join(';')}
    tabindex="0"
    aria-label={filename ? `${filename} code sample` : `${lang} code sample`}
  ><code>{#if tokenHtml}{@html tokenHtml}{:else}{code}{/if}</code></pre>
  {#if footer || copyable}
    <div
      data-jx-code-card-foot
      class="flex items-center justify-between gap-3 min-h-[2.1rem] pt-[0.3rem] pe-2 pb-[0.3rem] ps-3 border-t border-[color:var(--readonly-code-border)]"
    >
      <span class="flex items-center min-w-0">
        {#if footer}
          {@render footer()}
        {/if}
      </span>
      {#if copyable}
        <button
          type="button"
          class={cn(
            'jx-press jx-code-card-copy inline-flex items-center gap-[0.4rem] bg-background border border-border text-foreground cursor-pointer text-[11px] font-medium tracking-[0.04em] px-[0.6rem] py-1 whitespace-nowrap',
            '[--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]',
            copied
              ? 'copied bg-secondary text-secondary-foreground hover:bg-secondary'
              : 'hover:bg-muted',
          )}
          onclick={copyCode}
          aria-label={copied ? 'copied' : `copy ${filename || lang} sample`}
        >
          {#if copied}
            <!-- shared-module glyphs (full lucide copy geometry — the
                 hand-simplified variant retired 2026-08-29); the copied
                 check rides a strokier consuming utility -->
            <span data-jx-code-card-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3 [&_svg]:stroke-[2.5]">
              {@html icons.check}
            </span>
            <span>copied</span>
          {:else}
            <span data-jx-code-card-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3">
              {@html icons.copy}
            </span>
            <span>copy</span>
          {/if}
        </button>
      {/if}
    </div>
  {/if}
</figure>

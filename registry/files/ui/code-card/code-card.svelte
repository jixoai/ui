<!--
  jixoai code card (registry/files/ui/code-card/code-card.svelte).
  Readonly code surface — highlighting IS pluggable
  (highlight-backend-pluggable, 2026-09-02): a `backend` prop
  (shiki() | prismjs() | microLighter() | custom, lib/highlight) or,
  without one, the context-provided default
  (createHighlightContext at any subtree root — the kernel-endorsed
  runtime value; stock fallback is the SAME lib/shiki integration the
  card always shipped). Backends paint the card's own <code> element:
  markup backends (shiki, prismjs) swap token spans in; range backends
  (microlighter) register CSS Custom Highlight ranges and keep the
  plain text — see lib/highlight/backend.ts for the contract and the
  print-freeze limitation of range backends. The default theme remains
  the zero-download `jixoai` css-variables theme bound to the --tok-*
  palette below; non-shiki backends map the theme prop into their own
  vocabulary.

  Intent list (2026-08-22, user): "基于 Shiki 的成熟高亮，按需加载；良好的
  滚动支持；明确声明基于 Shiki，不过度封装，兼容 Shiki 生态。"
  (2026-09-02, Owner): "配置默认使用的高亮库 … 不需要编译，只是一个默认
  的值，利用 context 技术，运行中配置 backend={…}。"
  1. progressive enhancement: prerender paints the escaped plain sample
     (readable, zero JS); after hydration the resolved backend paints
     the SAME <code> element asynchronously — same box, same font, no
     layout shift. A backend that rejects leaves the plain sample
     standing (warn in the console).
  2. scroll law: the <pre> is the scrollport — horizontal always (Tab chars
     stay tabs, long lines never wrap), vertical when maxHeight caps it or
     when fill mode pins head/foot and hands the whole body height to the
     <pre>; the theme scrollbar law (thin currentColor + both-edges
     gutters), overscroll containment, keyboard-focusable. The horizontal
     AFFORDANCE (V1-8/V2-8): a non-scrolling wrapper hosts start/end edge
     veils that appear only while that direction can scroll — the rest-
     state hint overlay-scrollbar systems never give (see the effect
     below).
  3. named Shiki themes ride along: the theme's editor colors from Shiki's
     <pre> output are re-applied to this card's <pre> verbatim (the shiki
     backend's applyDeclarations), so a real theme (github-dark, …) paints
     its own ground instead of fighting the card.

  `code` is a runtime prop, never markup-inlined text: markup backends
  (shiki, prismjs) escape all source into inert spans, so a sample
  containing a literal closing-script tag is inert data and cannot
  terminate the host page's script — consumers owe no template-level
  escaping. The microlighter backend never writes markup at all.

  tw4 (2026-08-24): card/head/foot/copy statics + the fill/vscroll
  conditional paint ride token utilities in the markup (deterministic
  branches); code-card.css keeps the D1-exempt residue — the --tok-*
  Shiki palette wiring (with its .dark adaptation), the pre scrollport
  law (scrollbar-gutter compensation recipe), focus-visible rings and
  the reduced-motion kill.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';
  import type { HighlightBackend } from '$lib/highlight/backend';
  // registry-safe seam (the density law): the key + structural type
  // only — the card never imports the kernel side
  // (lib/highlight/context.svelte.ts stays a site-only module)
  import { HIGHLIGHT_KEY, type HighlightContextValue } from '$lib/highlight/context-key';
  import { DEFAULT_SHIKI_BACKEND } from '$lib/highlight/shiki';
  import './code-card.css';

  interface Props {
    /** Code sample (runtime string; markup backends escape it into inert spans). */
    code: string;
    /** Shiki language id (ts/tsx/js/jsx/svelte/html/css/scss/json/bash/… and aliases). */
    lang?: string;
    /**
     * Theme name — shiki vocabulary ('jixoai' default, or any theme
     * registered in lib/shiki). Non-shiki backends map it into their
     * own theme vocabulary (see each backend factory).
     */
    theme?: string;
    /**
     * Highlight backend instance — shiki() | prismjs() | microLighter()
     * (lib/highlight). Omitted: the context-provided default applies
     * (createHighlightContext at any subtree root); no provider: the
     * stock shiki default — the pre-pluggable behavior, unchanged.
     */
    backend?: HighlightBackend;
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
    backend,
    filename = '',
    header,
    footer,
    copyable = true,
    maxHeight = '',
    fill = false,
    minHeight = '',
    class: className = '',
  }: Props = $props();

  // backend resolution: prop → context default → stock shiki. The
  // context is captured ONCE at init (Svelte's getContext phase); its
  // getter-backed `.backend` stays reactive inside the derived below,
  // so an app-side `highlight.set(...)` repaints this card live.
  const highlightContext = getContext<HighlightContextValue | undefined>(HIGHLIGHT_KEY);
  const activeBackend = $derived(backend ?? highlightContext?.backend ?? DEFAULT_SHIKI_BACKEND);

  /** The <code> box the resolved backend paints into. */
  let codeEl = $state<HTMLElement>();
  /** Guards against out-of-order resolutions when props change quickly. */
  let generation = 0;
  /**
   * Stale-resolution reconciliation channel: a backend call that
   * resolves AFTER a newer run took over may have painted stale
   * content over the newer paint — bumping re-runs the effect with
   * the CURRENT props (fresh resolutions never bump: no loop).
   */
  let repaintTick = $state(0);

  $effect(() => {
    void repaintTick;
    const el = codeEl;
    if (!el) return;
    const source = code;
    const backendNow = activeBackend;
    const mine = ++generation;
    // drop the previous paint IMMEDIATELY: until the new highlight resolves,
    // the plain fallback shows the CURRENT code — never stale highlighted
    // content from a previous code/lang/theme/backend (Codex r1 P1)
    resetToPlain(el, source);
    backendNow
      .highlight(el, source, { lang, theme })
      .catch((error: unknown) => {
        // unknown lang/theme or a backend failure: keep the plain sample
        // on screen and say why in the console
        if (mine !== generation) return;
        resetToPlain(el, source);
        console.warn('[jixoai/code-card] plain-text fallback:', error);
      })
      .finally(() => {
        if (mine !== generation) repaintTick++;
      });
  });

  /**
   * The synchronous plain reset: the sample text back into the code box
   * (also the microlighter single-text-node contract) and the pre's
   * inline style back to this card's own baseline — markup backends
   * append their engine's editor colors to the pre (applyDeclarations),
   * and maxHeight is the only inline law this card itself owns. Writing
   * the attribute directly matches what the template's style binding
   * computes, so the two owners never diverge.
   */
  function resetToPlain(el: HTMLElement, source: string): void {
    el.textContent = source;
    const pre = el.closest('pre');
    if (pre) pre.setAttribute('style', maxHeight !== '' ? `max-height:${maxHeight}` : '');
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

  // ---- horizontal scroll affordance (V1-8/V2-8, 2026-09-02) -------------
  // The <pre> has always been the scrollport (Tab stays tabs, long lines
  // never wrap), but on overlay-scrollbar systems NOTHING at rest says
  // "there is more to the right" — the line just hard-clips at the edge.
  // The wrapper below carries two edge veils (css) that appear only
  // while that direction can still scroll; scroll events + a
  // ResizeObserver on the pre AND its <code> catch every geometry
  // change (the plain↔highlight swap, font resolution, container
  // resizes) without listening to the wheel.
  let preEl = $state<HTMLElement>();
  let hScrollStart = $state(false);
  let hScrollEnd = $state(false);

  function readScrollState(): void {
    const pre = preEl;
    if (!pre) return;
    hScrollStart = pre.scrollLeft > 1;
    hScrollEnd = pre.scrollLeft + pre.clientWidth < pre.scrollWidth - 1;
  }

  $effect(() => {
    const pre = preEl;
    if (!pre) return;
    readScrollState();
    pre.addEventListener('scroll', readScrollState, { passive: true });
    const ro = new ResizeObserver(readScrollState);
    ro.observe(pre);
    const codeBox = pre.querySelector('code');
    if (codeBox) ro.observe(codeBox);
    return () => {
      pre.removeEventListener('scroll', readScrollState);
      ro.disconnect();
    };
  });
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
  <!-- the wrapper is the VEIL HOST (V1-8/V2-8): it never scrolls itself —
       it only frames the pre so the edge fades can sit still while the
       code moves under them (a pseudo on the pre itself would scroll
       along). In fill mode the wrapper inherits the flex plumbing the
       pre used to carry alone; the pre keeps its own scroll laws -->
  <div
    data-jx-code-card-scroll
    data-hscroll-start={hScrollStart || undefined}
    data-hscroll-end={hScrollEnd || undefined}
    class={cn('relative min-w-0', fill && 'flex flex-1 min-h-0 flex-col')}
  >
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      bind:this={preEl}
      data-lang={lang}
      data-jx-code-card-pre
      class={cn(maxHeight !== '' && 'vscroll overflow-y-auto', fill && 'flex-1 min-h-0 overflow-y-auto')}
      style={maxHeight !== '' ? `max-height:${maxHeight}` : ''}
      tabindex="0"
      aria-label={filename ? `${filename} code sample` : `${lang} code sample`}
    ><!-- the plain sample is the progressive-enhancement floor AND the
        microlighter contract target: the resolved backend paints this
        very <code> element (markup swaps, ranges register over the text
        node) after hydration — same box, no layout shift --><code bind:this={codeEl}>{code}</code></pre>
  </div>
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

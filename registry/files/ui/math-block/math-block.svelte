<!--
  jixoai math block (registry/files/ui/math-block/math-block.svelte).
  The display math surface: a native <figure> (figure semantics KEPT —
  native-element-first; no role override) framing a wide-equation strip
  that rides the SHARED scroll-run contract wholesale (the
  unification law; the tabs/button-group precedent): a one-cell grid
  host, the run itself as the scroller (data-jx-scroll-run +
  data-axis="horizontal"), ScrollChrome's shadow veil + nudge chips —
  all gated by createScrollStamp's verdict (data-jx-scroll-state: none |
  start-closed | end-closed | open, the single truth the shared css
  keys chips and veil on). A formula that fits paints NO chrome; no
  verdict (pre-hydration) paints none either.

  SYNC SSR LANE (the load-bearing ruling): the math engine is
  isomorphic and small, so the render is $derived over renderTex —
  prerender bakes REAL katex markup (true zero flash, zero CLS,
  print-freeze-safe), NOT code-card's plain-text-floor-then-upgrade; a
  tex prop change re-derives live. The stamp machine is CLIENT-only
  (hydration arms it in $effect).

  role placement (B8): the figure keeps figure semantics; role="math"
  lives on the INNER wrapper carrying only the katex output — the copy
  control stays a discoverable interactive node in the a11y tree.
  katex's hidden MathML is the screen-reader path; no aria-label.

  Errors paint IN PLACE: the facade default throwOnError:false +
  errorColor 'var(--error)' renders the bad source run error-tinted
  inside the same box (katex's own output — no error chrome), and one
  console.warn carries the katex diagnostic out of the markup's title;
  a caller-forced throw (a throwing macro function) is caught by this
  surface: escaped raw source paints + one warn — errors never escape a
  component boundary.

  The copy control is the code-card pattern verbatim (icons.copy/check
  from the generated module, .jx-press physics, clipboard fallback,
  1.6s copied feedback) with a labels localization payload ({copy?,
  copied?}; absent = English verbatim — the localization-payload law).

  Rest-attributes contract: {...rest} spreads FIRST, the component's
  own data-kind/data-jx-math-block stamps AFTER (Svelte later-wins) —
  consumer data-testid/title/aria-*/handlers pass through untouched
  while the component's semantic fields cannot be overridden; class
  merges through the destructured class prop.

  Intent (2026-09-06, Owner): "引入开箱即用的 KaTeX/Mermaid 渲染组件".
-->
<script module lang="ts">
  /**
   * The localization payload — presentation vocabulary only (the
   * localization-payload law): absent = the English literals shipped,
   * rendered byte-identically.
   */
  export interface MathBlockLabels {
    /** the copy control's resting label (default 'copy'). */
    copy?: string;
    /** the copy control's success label (default 'copied'). */
    copied?: string;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { KatexOptions } from 'katex';
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';
  import { renderTex } from '$lib/katex';
  import ScrollChrome from '../scroll-run/scroll-chrome.svelte';
  import { createScrollStamp, shadow, type ScrollStamp } from '../scroll-run/scroll-run.svelte';
  import './math-block.css';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** TeX source (runtime string — rendered synchronously in display mode). */
    tex: string;
    /** Copy control on the footer bar (press physics, copied feedback, TeX payload). */
    copyable?: boolean;
    /** localization payload for the control vocabulary; absent = English verbatim. */
    labels?: MathBlockLabels;
    /** KaTeX macros — merged per key over the site-level registerMacros table. */
    macros?: KatexOptions['macros'];
    /** KaTeX strict mode passthrough (boolean | 'ignore'|'warn'|'error' | handler). */
    strict?: KatexOptions['strict'];
    /** KaTeX trust passthrough (boolean | handler). */
    trust?: KatexOptions['trust'];
  }

  let {
    tex,
    copyable = true,
    labels,
    macros,
    strict,
    trust,
    class: className = '',
    ...rest
  }: Props = $props();

  /**
   * SYNC RENDER (the lane ruling): $derived over renderTex — prerender
   * bakes real markup, prop changes re-derive live. Errors never escape
   * the boundary: a parse error paints in place (the katex-error run in
   * var(--error), katex's own output) and ONE console.warn carries the
   * diagnostic out of the markup's title attribute; a caller-forced
   * throw (a throwing macro function) degrades to the escaped raw
   * source + one warn.
   */
  const rendered = $derived.by(() => {
    try {
      const html = renderTex(tex, { displayMode: true, macros, strict, trust });
      if (html.includes('katex-error')) {
        const diagnostic = html.match(/title="([^"]*)"/)?.[1] ?? '';
        console.warn(`[jixoai/math-block] KaTeX parse error (painted in place): ${diagnostic}`);
      }
      return html;
    } catch (error) {
      console.warn('[jixoai/math-block] KaTeX render failed; painting raw source:', error);
      return escapeSource(tex);
    }
  });

  /** minimal HTML escaping for the raw-source fallback paint */
  function escapeSource(source: string): string {
    return source
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  // ---- the copy control (code-card pattern) -----------------------------
  // clipboard with the textarea/execCommand fallback for contexts
  // without a grant; 1.6s copied feedback; the payload is the RAW TeX
  // source (what the author wrote, not what katex painted)
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  const copyLabel = $derived(labels?.copy ?? 'copy');
  const copiedLabel = $derived(labels?.copied ?? 'copied');

  const copyTex = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(tex);
    } catch {
      // preview servers / embedded contexts without a clipboard grant
      let ok = false;
      const area = document.createElement('textarea');
      area.value = tex;
      document.body.append(area);
      area.select();
      ok = document.execCommand('copy');
      area.remove();
      if (!ok) return; // neither path copied — no false "copied" feedback
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1600);
  };

  // ---- the shared scroll-run rider (the unification law) ----------------
  // host + run hooks + ScrollChrome + ONE createScrollStamp effect: the
  // machine owns the verdict, the host progress var and (ramps:false —
  // the shadow veil never pays the member stamp loop) nothing else.
  // members = the math wrapper (the strip's single member). CLIENT-only:
  // SSR paints no verdict and the shared css gates all chrome on it.
  let hostEl = $state<HTMLDivElement>();
  let runEl = $state<HTMLDivElement>();
  let mathEl = $state<HTMLDivElement>();
  let stampMachine: ScrollStamp | undefined;

  $effect(() => {
    const run = runEl;
    if (!run) return;
    stampMachine = createScrollStamp({
      run,
      host: hostEl,
      members: () => (mathEl ? [mathEl] : []),
      ramps: false,
    });
    return () => {
      stampMachine?.destroy();
      stampMachine = undefined;
    };
  });

  // a re-rendered formula re-widens the strip: the machine's own
  // observers (run/member ResizeObservers) catch box growth in real
  // browsers; the derived swap gets an EXPLICIT restamp here so the
  // verdict follows the content in every environment (the stamp's
  // public update — the tabs measure() precedent)
  $effect(() => {
    void rendered;
    stampMachine?.update();
  });
</script>

<figure
  {...rest}
  data-kind="math"
  data-jx-math-block=""
  class={cn('m-0 min-w-0', className)}
>
  <div class="jx-scroll-host grid [grid-template-columns:minmax(0,1fr)]" bind:this={hostEl}>
    <div data-jx-scroll-run="" data-axis="horizontal" class="scrollport" bind:this={runEl}>
      <div role="math" bind:this={mathEl}>{@html rendered}</div>
    </div>
    <ScrollChrome
      scrollEffect={shadow()}
      run={runEl}
      backwardLabel="Scroll math backward"
      forwardLabel="Scroll math forward"
    />
  </div>
  {#if copyable}
    <div
      data-jx-math-block-foot
      class="flex items-center justify-end gap-3 pt-[0.3rem]"
    >
      <button
        type="button"
        data-jx-math-block-copy
        class={cn(
          'jx-press inline-flex items-center gap-[0.4rem] bg-background border border-border text-foreground cursor-pointer text-[11px] font-medium tracking-[0.04em] px-[0.6rem] py-1 whitespace-nowrap',
          '[--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]',
          copied
            ? 'copied bg-secondary text-secondary-foreground hover:bg-secondary'
            : 'hover:bg-muted',
        )}
        onclick={copyTex}
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {#if copied}
          <!-- shared-module glyphs (the icon law); the copied check rides
               a strokier consuming utility -->
          <span data-jx-math-block-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3 [&_svg]:stroke-[2.5]">
            {@html icons.check}
          </span>
          <span>{copiedLabel}</span>
        {:else}
          <span data-jx-math-block-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3">
            {@html icons.copy}
          </span>
          <span>{copyLabel}</span>
        {/if}
      </button>
    </div>
  {/if}
</figure>

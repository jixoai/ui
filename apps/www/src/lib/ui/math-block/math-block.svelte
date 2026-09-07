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

  The copy control is the code-card pattern verbatim (the Icon components, name-typed
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
  import Icon from '$lib/ui/icon';
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
    /**
     * Fit mode (Owner acceptance, 2026-09-07): force-scale the formula
     * into the container instead of scrolling. KaTeX is em-based
     * throughout, so the fit is a FONT-SIZE scale — a true re-layout
     * (no transform residue, no layout compensation, and the print
     * freeze carries the inline style verbatim). PRINT defaults to
     * fit regardless of this prop: a paged sheet never owes a
     * horizontal scrollport.
     */
    fit?: boolean;
  }

  let {
    tex,
    copyable = true,
    labels,
    macros,
    strict,
    trust,
    fit = false,
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

  // ---- fit mode (the no-scroll variant) --------------------------------
  // print engages fit by DEFAULT (the Owner ruling): matchMedia tracks
  // the medium, beforeprint/afterprint catch the freeze boundaries the
  // media query can miss under paged layouts
  let printFit = $state(false);
  const fitActive = $derived(fit || printFit);
  $effect(() => {
    const before = () => (printFit = true);
    const after = () => (printFit = false);
    // jsdom and ancient embeddeds ship no matchMedia — the print EVENT
    // pair alone still carries the engagement (browsers get both)
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('print') : null;
    const sync = () => (printFit = mq?.matches ?? false);
    sync();
    mq?.addEventListener('change', sync);
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      mq?.removeEventListener('change', sync);
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  });

  // the fitter: measure the formula's natural width (the .katex box —
  // the display wrappers are block-fillers) and scale the wrapper's
  // font-size down to the run's client box; never scales UP. Re-fits
  // on resize (RO) and on formula swaps (the rendered dependency);
  // off → the inline style clears and the scroll law owns the strip
  // again (the stamp verdict follows the restored width naturally).
  $effect(() => {
    void rendered;
    const run = runEl;
    const math = mathEl;
    if (!run || !math) return;
    const refit = () => {
      if (!fitActive) {
        math.style.fontSize = '';
        stampMachine?.update();
        return;
      }
      math.style.fontSize = ''; // measure at the natural size first
      const katexEl = math.querySelector('.katex');
      if (!katexEl) return;
      const natural = katexEl.scrollWidth || 1;
      const avail = run.clientWidth || 1;
      // 0.5% shave: percentage rounding must never round a fit BACK
      // into overflow (a 1px sliver would light the verdict up again)
      const k = Math.min(1, (avail / natural) * 0.995);
      math.style.fontSize = k < 1 ? `${(k * 100).toFixed(3)}%` : '';
      // THE FIX (Owner acceptance r2): the stamp machine's own observers
      // watch the run's BORDER box — a block filler whose box the
      // font-size scale never changes — so the verdict would sit stale
      // at the pre-fit overflow and the chips would linger. Every fit
      // re-measures the verdict SYNCHRONOUSLY; the shared machine stays
      // the single truth (the tabs measure() precedent).
      stampMachine?.update();
    };
    refit();
    const ro = new ResizeObserver(refit);
    ro.observe(run);
    // the CONTENT box is what the scale actually moves: observe the
    // katex element itself (font-size changes and late font swaps
    // resize IT — the wrappers are block fillers whose boxes stand
    // still, which is exactly how the stale verdict slipped through)
    const katexEl = math.querySelector('.katex');
    if (katexEl) ro.observe(katexEl);
    // web fonts arriving late re-widen the formula — refit once ready
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) refit();
    });
    // the viewport-driven belt to the RO (overlay-scrollbar systems and
    // RO-less embeddeds still re-fit when the window resizes)
    window.addEventListener('resize', refit);
    return () => {
      alive = false;
      ro.disconnect();
      window.removeEventListener('resize', refit);
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
  data-fit={fitActive ? '' : undefined}
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
          <!-- the icon law's typed component; the copied check rides
               a strokier strokeWidth -->
          <span data-jx-math-block-icon class="inline-flex">
            <Icon name="check" size={12} strokeWidth={2.5} />
          </span>
          <span>{copiedLabel}</span>
        {:else}
          <span data-jx-math-block-icon class="inline-flex">
            <Icon name="copy" size={12} />
          </span>
          <span>{copyLabel}</span>
        {/if}
      </button>
    </div>
  {/if}
</figure>

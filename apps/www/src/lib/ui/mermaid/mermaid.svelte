<!--
  jixoai mermaid diagram surface (registry/files/ui/mermaid/mermaid.svelte,
  2026-09-06 katex-mermaid).

  The code-card progressive-enhancement law, verbatim, for a ~1MB
  DOM-bound engine: prerender paints the escaped diagram source as a
  readable plain-text floor (zero JS, semantically complete — the
  declared-limit surfaces pattern), and after hydration the lazy engine
  (lib/mermaid-engine — a code-split singleton) swaps the rendered,
  sanitized SVG into the same box: fade-in (reduced-motion respected)
  over a min-height reserve (--jx-mermaid-floor-min, consumer-tunable)
  that bounds the CLS of an unknowable-pre-render diagram height.

  Effect discipline = the code-card generation law: prop changes drop
  the previous paint booking (the floor shows the CURRENT source while
  a render is in flight), out-of-order resolutions no-op, and render
  ids follow the engine's §3.4 collision contract (per-instance
  monotonic base + per-render suffix — two instances, same names, and
  consecutive re-renders never share a live id); the engine's serial
  queue orders the actual initialize/render pairs.

  Theming: the surface passes its OWN figure as renderDiagram's
  themeRoot (scoped containers — a .jx-light canvas stage, a dark panel
  — resolve THEIR tokens, never the page's). theme='auto' (default)
  follows the theme flip across the figure's ENTIRE effective scope —
  a document-root class observer (subtree) filtered to the figure
  ITSELF plus its CURRENT ancestors (a scope class flipping on either
  re-renders even when documentElement never mutated), debounced; the
  observers disconnect in the effect cleanup. Explicit 'light'|'dark'
  pins the palette through the engine's local probe wrapper — no
  observer, no global class mutation.

  Viewport ruling (recorded scroll-run exemption): the zoom-pan
  viewport is a TWO-AXIS pan surface for scaled content, not a linear
  overflow strip — it rides the theme scrollbar law (thin
  currentColor thumbs, both axes) and mounts NO shared chrome (no
  data-jx-scroll-run, chips, or veils inside; the negative contract).
  math-block (a true horizontal strip) rides the full shared contract
  instead.
-->
<script module lang="ts">
  /** the control + a11y vocabulary — absent entries fall to shipped English */
  export interface MermaidLabels {
    copy?: string;
    copied?: string;
    zoomIn?: string;
    zoomOut?: string;
    zoomReset?: string;
    renderError?: string;
    /** the viewport's accessible name when `name` is absent (never a nameless img) */
    diagram?: string;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';
  import {
    createRenderIdMinter,
    MermaidRenderError,
    renderDiagram,
    type MermaidConfig,
    type MermaidThemeMode,
  } from '$lib/mermaid-engine';
  import './mermaid.css';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** diagram source (runtime prop — the code-card rule: never markup-inlined text) */
    source: string;
    /** head tab label + render-id base */
    name?: string;
    theme?: MermaidThemeMode;
    copyable?: boolean;
    zoomable?: boolean;
    labels?: MermaidLabels;
    /** mermaid's own config — the engine's precedence ladder applies (§3.3) */
    config?: MermaidConfig;
    class?: string;
  }

  let {
    source,
    name,
    theme = 'auto',
    copyable = true,
    zoomable = true,
    labels = {},
    config,
    class: className = '',
    ...rest
  }: Props = $props();

  // rest spreads BEFORE the component's own stamps (Svelte: later
  // attributes win) — consumer data-testid/title/aria-*/handlers pass
  // through untouched, while the component's semantic fields stay its own

  /** the per-instance render-id minter (the engine's §3.4 contract).
   *  The base captures `name` ON PURPOSE — the instance owns its base
   *  from init; a later name change keeps the minted family (uniqueness
   *  is the contract, re-basing buys nothing and re-collides nothing). */
  // svelte-ignore state_referenced_locally
  const ids = createRenderIdMinter(name);

  let figureEl = $state<HTMLElement>();
  /** null = the floor paints (also the error fallback — never a blank) */
  let svg = $state<string | null>(null);
  let dataState = $state<'floor' | 'rendering' | 'rendered' | 'error'>('floor');
  let diagnostic = $state('');
  /** bumped by the effective-scope observer — a reactive render trigger */
  let themeEpoch = $state(0);
  /** guards against out-of-order resolutions when props change quickly */
  let generation = 0;

  $effect(() => {
    void themeEpoch;
    const root = figureEl;
    if (!root) return;
    const mine = ++generation;
    // drop the previous paint IMMEDIATELY: until the new render resolves,
    // the floor shows the CURRENT source — never a stale diagram (and on
    // failure the floor simply stays standing)
    svg = null;
    diagnostic = '';
    dataState = 'rendering';
    renderDiagram(source, {
      id: ids.next(),
      theme,
      config,
      themeRoot: root,
    })
      .then((result) => {
        if (mine !== generation) return; // a late resolution no-ops
        svg = result.svg;
        dataState = 'rendered';
      })
      .catch((error: unknown) => {
        if (mine !== generation) return;
        diagnostic =
          error instanceof MermaidRenderError ? error.diagnostic : String(error ?? 'unknown error');
        dataState = 'error';
      });
  });

  // theme='auto' effective-scope watch: a class observer on the document
  // root (subtree) whose records are filtered to the figure ITSELF plus
  // its CURRENT ancestors (target.contains(root)) — a scope class
  // flipping on the figure directly OR on an ancestor (.jx-light→.dark)
  // re-renders even when documentElement never mutated; mutations inside
  // the figure's own subtree (our own svg swaps) and unrelated siblings
  // trigger nothing. Explicit pins observe nothing (the engine's local
  // wrapper owns the sheet read). Debounced; disconnected on cleanup.
  $effect(() => {
    if (theme !== 'auto') return;
    const root = figureEl;
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver((records) => {
      const inScope = records.some((record) => {
        const target = record.target;
        return target === root || (target instanceof Node && target.contains(root));
      });
      if (!inScope) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        themeEpoch++;
      }, 50);
    });
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  });

  // ---- zoom: pure transform, no engine call --------------------------------
  // ±0.25 steps, clamp 0.5–3, reset to 1; transform:scale() on the inner
  // wrapper (origin top left) — the transformed overflow contributes to
  // the viewport's scrollable area, which becomes the pan surface
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;
  let scale = $state(1);

  function stepZoom(direction: 1 | -1): void {
    const next = Math.round((scale + direction * ZOOM_STEP) * 100) / 100;
    scale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
  }

  // ---- copy control (the code-card pattern: press physics, clipboard
  // fallback, 1.6s copied feedback; the payload is the raw source) --------
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function copySource(): Promise<void> {
    let ok = true; // the clipboard path either resolves or throws
    try {
      await navigator.clipboard.writeText(source);
    } catch {
      // preview servers / embedded contexts without a clipboard grant
      ok = false;
      const area = document.createElement('textarea');
      area.value = source;
      document.body.append(area);
      area.select();
      ok = document.execCommand('copy');
      area.remove();
    }
    if (!ok) return; // neither path copied — no false "copied" feedback
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1600);
  }

  // ---- the localization payload: absent entries = shipped English -------
  const copyLabel = $derived(labels.copy ?? 'copy');
  const copiedLabel = $derived(labels.copied ?? 'copied');
  const zoomInLabel = $derived(labels.zoomIn ?? 'zoom in');
  const zoomOutLabel = $derived(labels.zoomOut ?? 'zoom out');
  const zoomResetLabel = $derived(labels.zoomReset ?? 'reset');
  const renderErrorLabel = $derived(labels.renderError ?? 'render error');
  // the trimmed ladder: an empty/whitespace name falls THROUGH (never a
  // nameless img), a localized diagram name rides second, 'Diagram' ships
  const accessibleName = $derived(name?.trim() || labels.diagram?.trim() || 'Diagram');
</script>

<figure
  {...rest}
  bind:this={figureEl}
  data-kind="diagram"
  data-jx-mermaid
  data-state={dataState}
  class={cn(
    'jx-mermaid bg-[color:var(--readonly-code-bg)] border border-[color:var(--readonly-code-border)] m-0 min-w-0',
    className,
  )}
>
  {#if name}
    <figcaption
      data-jx-mermaid-head
      class="flex items-center gap-3 min-w-0 px-3 py-[0.32rem] text-[11px] tracking-[0.08em] bg-[color:var(--readonly-code-meta-bg)] border-b border-[color:var(--readonly-code-border)] text-[color:var(--readonly-code-meta-fg)]"
    >
      <span data-jx-mermaid-file class="font-nav truncate">{name}</span>
    </figcaption>
  {/if}
  {#if dataState === 'error'}
    <!-- the error summary strip paints ABOVE the standing source floor:
         the floor below never disappears on failure -->
    <div
      data-jx-mermaid-error
      role="status"
      class="flex items-center gap-2 min-w-0 px-3 py-[0.32rem] text-[11px] tracking-[0.04em] border-b border-[color:var(--readonly-code-border)] text-[color:var(--error)]"
    >
      <span class="whitespace-nowrap">{renderErrorLabel}</span>
      <span data-jx-mermaid-diagnostic class="truncate opacity-80">{diagnostic.split('\n')[0]}</span>
    </div>
  {/if}
  <!-- the TWO-AXIS pan viewport (the recorded scroll-run exemption):
       theme scrollbar law both axes, NO shared chrome inside; role="img"
       with a NON-EMPTY accessible name at all times -->
  <div data-jx-mermaid-viewport role="img" aria-label={accessibleName}>
    {#if svg}
      <div data-jx-mermaid-zoom style={`transform:scale(${scale})`}>{@html svg}</div>
    {:else}
      <!-- the floor: escaped source, readable, zero JS — also the error fallback -->
      <pre data-jx-mermaid-floor><code>{source}</code></pre>
    {/if}
  </div>
  {#if copyable || zoomable}
    <div
      data-jx-mermaid-foot
      class="flex items-center justify-between gap-3 min-h-[2.1rem] pt-[0.3rem] pe-2 pb-[0.3rem] ps-3 border-t border-[color:var(--readonly-code-border)]"
    >
      <span class="flex items-center min-w-0">
        {#if copyable}
          <button
            type="button"
            class={cn(
              'jx-press jx-mermaid-copy inline-flex items-center gap-[0.4rem] bg-background border border-border text-foreground cursor-pointer text-[11px] font-medium tracking-[0.04em] px-[0.6rem] py-1 whitespace-nowrap',
              '[--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]',
              copied
                ? 'copied bg-secondary text-secondary-foreground hover:bg-secondary'
                : 'hover:bg-muted',
            )}
            onclick={copySource}
            aria-label={copied ? copiedLabel : copyLabel}
          >
            {#if copied}
              <span data-jx-mermaid-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3 [&_svg]:stroke-[2.5]">
                {@html icons.check}
              </span>
              <span>{copiedLabel}</span>
            {:else}
              <span data-jx-mermaid-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3">
                {@html icons.copy}
              </span>
              <span>{copyLabel}</span>
            {/if}
          </button>
        {/if}
      </span>
      {#if zoomable}
        <span data-jx-mermaid-zoom-controls class="flex items-center gap-1.5">
          <button
            type="button"
            data-jx-mermaid-zoom-out
            class="jx-press jx-mermaid-zoom-btn inline-flex items-center bg-background border border-border text-foreground cursor-pointer p-[0.32rem] [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] hover:bg-muted"
            onclick={() => stepZoom(-1)}
            aria-label={zoomOutLabel}
          >
            <span data-jx-mermaid-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3">{@html icons.minus}</span>
          </button>
          <button
            type="button"
            data-jx-mermaid-zoom-reset
            class="jx-press jx-mermaid-zoom-btn inline-flex items-center bg-background border border-border text-foreground cursor-pointer p-[0.32rem] [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] hover:bg-muted"
            onclick={() => (scale = 1)}
            aria-label={zoomResetLabel}
          >
            <span data-jx-mermaid-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3">{@html icons.rotateCcw}</span>
          </button>
          <button
            type="button"
            data-jx-mermaid-zoom-in
            class="jx-press jx-mermaid-zoom-btn inline-flex items-center bg-background border border-border text-foreground cursor-pointer p-[0.32rem] [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] hover:bg-muted"
            onclick={() => stepZoom(1)}
            aria-label={zoomInLabel}
          >
            <span data-jx-mermaid-icon class="inline-flex [&_svg]:h-3 [&_svg]:w-3">{@html icons.plus}</span>
          </button>
        </span>
      {/if}
    </div>
  {/if}
</figure>

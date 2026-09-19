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

  Backdrop (Owner 2026-09-15, W2): a dark EFFECTIVE theme paints the
  viewport as a subtractive backdrop-filter veil with ZERO ink (the
  subtraction ink law) — see the veil effect below + mermaid.css; the
  opaque theme-ground fill survives ONLY as the no-backdrop-filter
  floor. `backdrop={false}` opts out to full transparency.
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
  import Icon from '$lib/ui/icon';
  import { cn } from '$lib/utils';
  import {
    createRenderIdMinter,
    isDarkHex,
    MermaidRenderError,
    readThemeTokens,
    renderDiagram,
    resolveTheme,
    type MermaidConfig,
    type MermaidThemeMode,
  } from '$lib/mermaid-engine';
  import { mermaidStyles } from './mermaid.stylex';
  import { MermaidDefaults } from './mermaid-defaults.svelte';
  import './mermaid.css';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** diagram source (runtime prop — the code-card rule: never markup-inlined text) */
    source: string;
    /** head tab label + render-id base */
    name?: string;
    theme?: MermaidThemeMode;
    /** the dark veil switch (Owner 2026-09-15): on = the subtractive
     *  backdrop-filter veil when the effective theme is dark; off = no
     *  veil and no ground (transparent, exactly as a light surface) */
    backdrop?: boolean;
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
    theme,
    backdrop = true,
    copyable = true,
    zoomable = true,
    labels = {},
    config,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults
  // round 2): theme rides its literal slot — own 'auto' (resolve
  // against the figure's effective scope) lives in the contract,
  // never a destructure default
  const d = $derived(MermaidDefaults.resolve({ theme }));

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
      theme: d.theme,
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

  /** THE DARK BACKDROP VEIL (Owner 2026-09-15, W2): when the EFFECTIVE
   *  theme is dark and `backdrop` is on (default), the viewport paints a
   *  designed dark veil built on backdrop-filter with ZERO ink (the
   *  subtraction ink law — design-tokens: no dark background, no
   *  hand-mixed tint): the CSS chain blurs + subtracts whatever sits
   *  behind the viewport toward the dark ground. The verdict rides the
   *  EFFECTIVE theme — the SAME token resolution the palette uses
   *  (readThemeTokens through the figure, pin wrapper for explicit
   *  themes): a dark pin on a light page reads DARK tokens and veils,
   *  an `auto` surface inside a dark scope veils, a scoped `.jx-light`
   *  stage reads LIGHT tokens and never veils, and light themes never
   *  paint a backdrop at all.
   *
   *  `backdrop={false}`: no veil AND no ground — the inline paints clear
   *  (transparent, exactly as a light-theme surface today).
   *
   *  THE SURFACE-GROUND FLOOR (this change's named boundary): where
   *  backdrop-filter is unsupported (the data-jx-mermaid-veil='floor'
   *  lane + the CSS @supports-not block in mermaid.css), the component's
   *  OWN opaque theme-ground fill returns — the standing PRE-VEIL
   *  behavior. A surface may paint its ground; a VEIL may not add ink —
   *  the opaque fill under no-support is the surface's ground, not a
   *  tint over content. */
  let viewportEl = $state<HTMLElement>();
  $effect(() => {
    void themeEpoch;
    const viewport = viewportEl;
    const root = figureEl;
    if (!viewport || !root) return;
    const tokens = readThemeTokens(root, d.theme === 'auto' ? undefined : resolveTheme(d.theme));
    if (!(backdrop && isDarkHex(tokens.background))) {
      viewport.removeAttribute('data-jx-mermaid-veil');
      viewport.style.removeProperty('--jx-mermaid-veil-ground');
      viewport.style.removeProperty('background-color');
      viewport.style.removeProperty('color');
      return;
    }
    // ZERO ink on the veil layer: `background` is never set here — the
    // ground var feeds ONLY the no-support floor (the @supports-not
    // block + the 'floor' lane in mermaid.css); the supported branch
    // paints none (probe-asserted: computed background transparent)
    viewport.style.setProperty('--jx-mermaid-veil-ground', tokens.background);
    viewport.style.color = tokens.foreground; // the scrollbar law's currentColor link
    const supported =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('backdrop-filter', 'blur(1px)');
    viewport.setAttribute('data-jx-mermaid-veil', supported ? 'on' : 'floor');
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

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner, never a
  // raw class={styles.x} interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<figure
  {...rest}
  bind:this={figureEl}
  data-kind="diagram"
  data-jx-mermaid
  data-state={dataState}
  class={cn(
    'jx-mermaid',
    cx(mermaidStyles.figure),
    className,
  )}
>
  {#if name}
    <figcaption
      data-jx-mermaid-head
      class={cx(mermaidStyles.caption)}
    >
      <span data-jx-mermaid-file class={cx(mermaidStyles.captionFile)}>{name}</span>
    </figcaption>
  {/if}
  {#if dataState === 'error'}
    <!-- the error summary strip paints ABOVE the standing source floor:
         the floor below never disappears on failure -->
    <div
      data-jx-mermaid-error
      role="status"
      class={cx(mermaidStyles.error)}
    >
      <span class={cx(mermaidStyles.errorLabel)}>{renderErrorLabel}</span>
      <span data-jx-mermaid-diagnostic class={cx(mermaidStyles.errorDiagnostic)}>{diagnostic.split('\n')[0]}</span>
    </div>
  {/if}
  <!-- the TWO-AXIS pan viewport (the recorded scroll-run exemption):
       theme scrollbar law both axes, NO shared chrome inside; role="img"
       with a NON-EMPTY accessible name at all times -->
  <div bind:this={viewportEl} data-jx-mermaid-viewport role="img" aria-label={accessibleName}>
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
      class={cx(mermaidStyles.foot)}
    >
      <span class={cx(mermaidStyles.footLead)}>
        {#if copyable}
          <button
            type="button"
            class={cn(
              'jx-press jx-mermaid-copy',
              cx(mermaidStyles.copyBtn),
              copied && `copied ${cx(mermaidStyles.copyBtnCopied)}`,
            )}
            onclick={copySource}
            aria-label={copied ? copiedLabel : copyLabel}
          >
            {#if copied}
              <span data-jx-mermaid-icon class={cx(mermaidStyles.iconLane)}>
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
              <span>{copiedLabel}</span>
            {:else}
              <span data-jx-mermaid-icon class={cx(mermaidStyles.iconLane)}>
                <Icon name="copy" size={12} />
              </span>
              <span>{copyLabel}</span>
            {/if}
          </button>
        {/if}
      </span>
      {#if zoomable}
        <span data-jx-mermaid-zoom-controls class={cx(mermaidStyles.zoomControls)}>
          <button
            type="button"
            data-jx-mermaid-zoom-out
            class="jx-press jx-mermaid-zoom-btn {cx(mermaidStyles.zoomBtn)}"
            onclick={() => stepZoom(-1)}
            aria-label={zoomOutLabel}
          >
            <span data-jx-mermaid-icon class={cx(mermaidStyles.iconLane)}><Icon name="minus" size={12} /></span>
          </button>
          <button
            type="button"
            data-jx-mermaid-zoom-reset
            class="jx-press jx-mermaid-zoom-btn {cx(mermaidStyles.zoomBtn)}"
            onclick={() => (scale = 1)}
            aria-label={zoomResetLabel}
          >
            <span data-jx-mermaid-icon class={cx(mermaidStyles.iconLane)}><Icon name="rotateCcw" size={12} /></span>
          </button>
          <button
            type="button"
            data-jx-mermaid-zoom-in
            class="jx-press jx-mermaid-zoom-btn {cx(mermaidStyles.zoomBtn)}"
            onclick={() => stepZoom(1)}
            aria-label={zoomInLabel}
          >
            <span data-jx-mermaid-icon class={cx(mermaidStyles.iconLane)}><Icon name="plus" size={12} /></span>
          </button>
        </span>
      {/if}
    </div>
  {/if}
</figure>

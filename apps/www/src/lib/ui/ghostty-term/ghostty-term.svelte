<!--
  jixoai ghostty-term (registry/files/ui/ghostty-term/ghostty-term.svelte).
  The brand's LIVE terminal surface: a canvas grid rendered by the real
  libghostty-vt wasm through the registry/files/lib/ghostty-vt.ts binding
  (design.md D5). The consumer owns the pty: onData(bytes) carries
  terminal INPUT (keys/paste) out, write(bytes) feeds terminal OUTPUT
  (pty stream) in via bind:this.

  Orthogonal intents (5 — at the file-intent limit; D5 freezes the
  registry item as this single canonical main, so the render pipeline and
  geometry stay colocated rather than split into a private module):
    1. wasm lifecycle — load (prop url > virtual:jixoai-ghostty),
       error degradation (data-state machine), free on destroy.
    2. render pipeline — rAF-batched vtWrite, dirty-row painting, a row
       cache powering full repaints (theme/font), shell-vs-content color
       boundary (D5.1: ANSI colors pass through verbatim; the shell's
       default paper/ink resolve from jixoai tokens via color-utils).
    3. geometry — density-derived metrics (--jx-text/--jx-line kernels),
       auto (ResizeObserver) vs explicit cols/rows, DPR-aware canvas.
    4. input bridge — keydown/paste/wheel translated by the binding
       (keyEncode / paste.isSafe+encode / scrollViewport) into onData.
    5. handle API — write/reset/resizeTo/snapshot exports.

  Owner original demand: 2026-08-28 "ghostty-term / Batch D (design.md
  D5 — registry:ui component)". Binding ABI notes below are Batch B
  field-probed facts, not assumptions.

  Known V1 bounds (design non-goals or binding-surface limits, reported
  to the orchestrator): no cursor/selection paint (the frozen vt face
  exposes no cursor read), no hyperlink activation, viewport-only
  scroll, and a clamped shift heuristic on wheel-scroll because the
  upstream render state under-reports dirty rows on scroll-down
  (probed: scrollViewport(+3) after a clean pass yields 0 dirty rows).
-->
<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  // type-only: erased at compile time, so the runtime module graph never
  // touches $lib/ghostty-vt directly — instantiation goes through the
  // vt-deps seam (see the load seam note in the bootstrap below).
  import type { GhosttyVT, RowSnapshot } from '$lib/ghostty-vt';
  import { loadVt, virtualWasmUrl } from './vt-deps.js';
  import { parseColor, oklchToRgb } from '$lib/color-utils';
  import './ghostty-term.css';

  // ---- public types -------------------------------------------------------

  /** Shell overrides ONLY (D5.1 color boundary): the canvas paper/ink for
   * cells that carry the wasm DEFAULT colors. ANSI/256/truecolor content
   * colors are never themed through this prop. */
  export interface GhosttyTermTheme {
    /** CSS color for the default cell background (default: var(--terminal)). */
    background?: string;
    /** CSS color for the default cell ink (default: var(--terminal-foreground)). */
    foreground?: string;
  }

  export interface GhosttyTermResizeDetail {
    cols: number;
    rows: number;
  }

  /** The bind:this surface (write = pty OUTPUT in; the rest are VT controls). */
  export interface GhosttyTermHandle {
    write(bytes: Uint8Array): void;
    reset(): void;
    resizeTo(cols: number, rows: number): void;
    /** Base64 terminal snapshot (V1: encode only, no decode). */
    snapshot(): string;
  }

  interface Props {
    /** Fixed grid columns (explicit cols/rows switches out of auto mode). */
    cols?: number;
    /** Fixed grid rows. */
    rows?: number;
    /** Derive the grid from the container (default true; any explicit
     * cols/rows value fixes the grid instead). */
    auto?: boolean;
    /** Cell font size in px. Default derives from the --jx-text density
     * token. Must be a finite positive number — anything else warns once
     * and falls back to the density default (the registered density
     * exception escape hatch). */
    fontSize?: number;
    /** wasm asset URL. Default resolves the virtual:jixoai-ghostty module
     * served by the vite plugin (the install prerequisite). */
    wasmUrl?: string;
    theme?: GhosttyTermTheme;
    /** Terminal INPUT bridge: encoded key/paste bytes for the pty. */
    onData?: (bytes: Uint8Array) => void;
    /** Fires when the auto-mode grid derivation changes. */
    onResize?: (detail: GhosttyTermResizeDetail) => void;
    density?: Density;
    class?: string;
    /** Overlay slot; when provided it also replaces the default error
     * fallback UI (the consumer owns the degraded face). */
    children?: Snippet;
    [key: string]: unknown;
  }

  let {
    cols,
    rows,
    auto = true,
    fontSize,
    wasmUrl,
    theme,
    onData,
    onResize,
    density,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  // ---- constants ----------------------------------------------------------

  const FONT_STACK =
    "'JetBrains Mono Variable', 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
  /** Density-kernel fallbacks (the ruler equations at default density):
   * T = 13px, line = T * 20/13 = 20px. Used when the token sheet cannot
   * be probed (jsdom, unthemed embedding). */
  const FALLBACK_TEXT_PX = 13;
  const FALLBACK_LEADING = 20 / 13;
  const DEFAULT_COLS = 80;
  const DEFAULT_ROWS = 24;
  /** Bare modifier keys produce no pty bytes; skip them before encode. */
  const MODIFIER_KEYS = new Set([
    'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock',
    'AltGraph', 'Fn', 'FnLock', 'Hyper', 'Super', 'OS', 'Dead', 'Compose',
  ]);

  // ---- reactive state -----------------------------------------------------

  let rootEl = $state<HTMLDivElement | null>(null);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let phase = $state<'loading' | 'ready' | 'error'>('loading');
  let errorMessage = $state('');
  /** --jx-text probed px (0 = not probed yet). */
  let tokenTextPx = $state(0);
  /** --jx-line / --jx-text probed unitless leading (0 = not probed). */
  let tokenLeading = $state(0);

  const inheritedDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, inheritedDensity));

  let warnedFontSize = '';

  const resolvedFontSize = $derived.by(() => {
    const fallback = tokenTextPx > 0 ? tokenTextPx : FALLBACK_TEXT_PX;
    if (fontSize === undefined) return fallback;
    // finite positive only (NaN / <=0 / Infinity are rejected loudly)
    if (!Number.isFinite(fontSize) || fontSize <= 0) {
      if (String(fontSize) !== warnedFontSize) {
        warnedFontSize = String(fontSize);
        console.warn(
          `[ghostty-term] fontSize must be a finite positive number of px; got ${String(
            fontSize,
          )}. Falling back to the density default.`,
        );
      }
      return fallback;
    }
    return fontSize;
  });

  // ---- engine (non-reactive; canvas painting is imperative) ----------------

  let vt: GhosttyVT | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let probeEl: HTMLDivElement | null = null;
  let cell = { w: 8, h: 20 };
  let grid = { cols: 0, rows: 0 };
  /** Last painted row per viewport y — the full-repaint source. */
  let screen: (RowSnapshot | undefined)[] = [];
  /** Viewport offset in lines above the stream tail (>= 0) — clamps the
   * wheel-scroll cache shift at the bottom edge. */
  let scrollOffset = 0;
  let pendingChunks: Uint8Array[] = [];
  let rafId = 0;
  let alive = true;
  /** wasm default ink/paper sentinels (sampled from a pristine terminal). */
  let wasmDefaultFg = '';
  let wasmDefaultBg = '';
  /** Resolved shell colors (rgb() strings ready for canvas). */
  let shell = { bg: '#000000', fg: '#ffffff' };

  const fontString = (italic: boolean, bold: boolean, sizePx: number): string =>
    `${italic ? 'italic ' : ''}${bold ? 700 : 400} ${sizePx}px ${FONT_STACK}`;

  /** Normalize any CSS color (token oklch() included) to a canvas rgb()
   * string via the shared color-utils bridge. */
  const toCanvasColor = (value: string, fallback: string): string => {
    const oklch = parseColor(value);
    if (oklch === null) return value.trim() === '' ? fallback : value;
    const { r, g, b } = oklchToRgb(oklch);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  /** Probe a density length token to px through the computed font-size of
   * an in-tree element (custom properties keep calc() text; the used
   * font-size resolves it). Returns 0 when unresolvable. */
  const probeTokenPx = (name: string): number => {
    if (probeEl === null) return 0;
    const raw = getComputedStyle(probeEl).getPropertyValue(name).trim();
    if (raw === '') return 0;
    probeEl.style.fontSize = raw;
    const used = parseFloat(getComputedStyle(probeEl).fontSize);
    probeEl.style.fontSize = '';
    return Number.isFinite(used) && used >= 6 ? used : 0;
  };

  const measureDensityTokens = (): void => {
    const textPx = probeTokenPx('--jx-text');
    const linePx = probeTokenPx('--jx-line');
    if (textPx > 0) tokenTextPx = textPx;
    tokenLeading =
      textPx > 0 && linePx > 0 && linePx >= textPx ? linePx / textPx : FALLBACK_LEADING;
  };

  const measureCell = (): void => {
    if (ctx === null) return;
    const size = resolvedFontSize;
    const leading = tokenLeading > 0 ? tokenLeading : FALLBACK_LEADING;
    ctx.font = fontString(false, false, size);
    const advance = ctx.measureText('W').width;
    cell = {
      w: Math.max(1, Number.isFinite(advance) ? advance : 8),
      h: Math.max(1, Math.round(size * leading)),
    };
  };

  const resolveShellColors = (): void => {
    const token = (name: string): string =>
      probeEl === null ? '' : getComputedStyle(probeEl).getPropertyValue(name).trim();
    shell = {
      bg: toCanvasColor(theme?.background ?? token('--terminal'), 'rgb(0, 0, 0)'),
      fg: toCanvasColor(theme?.foreground ?? token('--terminal-foreground'), 'rgb(255, 255, 255)'),
    };
  };

  // ---- render pipeline ----------------------------------------------------

  const scheduleFrame = (): void => {
    if (rafId === 0 && typeof requestAnimationFrame === 'function') {
      rafId = requestAnimationFrame(flushFrame);
    }
  };

  const flushFrame = (): void => {
    rafId = 0;
    if (!alive || vt === null) return;
    if (pendingChunks.length > 0) {
      let total = 0;
      for (const chunk of pendingChunks) total += chunk.length;
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const chunk of pendingChunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      pendingChunks = [];
      vt.vtWrite(merged);
    }
    paintFromDirty();
  };

  /** Paint one viewport row from its snapshot (the D5.2 cell recipe). */
  const paintRow = (row: RowSnapshot): void => {
    if (ctx === null) return;
    const size = resolvedFontSize;
    const rowY = row.y * cell.h;
    const width = grid.cols * cell.w;

    // row paper: the shell background unless the cell carries content bg
    ctx.fillStyle = shell.bg;
    ctx.fillRect(0, rowY, width, cell.h);

    let x = 0;
    const maxCols = Math.min(row.cells.length, grid.cols);
    for (let i = 0; i < maxCols; i++) {
      const cellView = row.cells[i]!;
      const style = cellView.style;
      let rawFg = style.fg ?? '';
      let rawBg = style.bg ?? '';
      if (style.reverse) {
        const swap = rawFg;
        rawFg = rawBg;
        rawBg = swap;
      }
      const ink = rawFg === wasmDefaultFg ? shell.fg : rawFg;
      const paper = rawBg === wasmDefaultBg ? shell.bg : rawBg;

      if (paper !== shell.bg) {
        ctx.fillStyle = paper;
        ctx.fillRect(x, rowY, cell.w, cell.h);
      }
      if (cellView.grapheme !== '' && !style.invisible) {
        if (style.bold || style.italic) ctx.font = fontString(style.italic, style.bold, size);
        else if (ctx.font !== fontString(false, false, size)) ctx.font = fontString(false, false, size);
        ctx.fillStyle = ink;
        ctx.textBaseline = 'middle';
        ctx.fillText(cellView.grapheme, x, rowY + cell.h / 2);
        if (style.underline >= 1) {
          ctx.fillRect(x, rowY + cell.h - 1, cell.w, 1);
        }
      }
      x += cell.w;
    }
    screen[row.y] = row;
  };

  const paintFromDirty = (): void => {
    if (vt === null) return;
    for (const row of vt.dirtyRows()) paintRow(row);
  };

  /** Full repaint from the row cache (theme change / font swap / reset). */
  const repaintAll = (): void => {
    if (ctx === null) return;
    ctx.fillStyle = shell.bg;
    ctx.fillRect(0, 0, grid.cols * cell.w, grid.rows * cell.h);
    for (let y = 0; y < grid.rows; y++) {
      const cached = screen[y];
      if (cached !== undefined) paintRow(cached);
    }
  };

  // ---- geometry -----------------------------------------------------------

  /** Last geometry actually applied to the canvas — the auto-derivation's
   * change detector (dims AND metrics; a metric-only change must still
   * re-apply because the canvas pixel size is grid x cell). */
  let applied = { cols: 0, rows: 0, w: 0, h: 0 };

  const applyGrid = (nextCols: number, nextRows: number): void => {
    if (vt === null || canvasEl === null || ctx === null) return;
    const dimsChanged = nextCols !== grid.cols || nextRows !== grid.rows;
    grid = { cols: nextCols, rows: nextRows };
    const cssW = nextCols * cell.w;
    const cssH = nextRows * cell.h;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvasEl.style.width = `${cssW}px`;
    canvasEl.style.height = `${cssH}px`;
    canvasEl.width = Math.max(1, Math.round(cssW * dpr));
    canvasEl.height = Math.max(1, Math.round(cssH * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    vt.resize(nextCols, nextRows);
    scrollOffset = 0;
    if (dimsChanged) {
      // a dimension change marks every row dirty (Batch B contract): one
      // pass repaints the whole grid AND refreshes the cache
      screen = [];
      paintFromDirty();
    } else {
      // same-dims resize reports ZERO dirty rows (probed) — the cache is
      // the truth; this path serves metric-only re-applies (font swap)
      repaintAll();
    }
    applied = { cols: nextCols, rows: nextRows, w: cell.w, h: cell.h };
  };

  /** Explicit grid = any cols/rows value or auto=false; else container-driven. */
  const fixedGrid = $derived(cols !== undefined || rows !== undefined || auto === false);

  $effect(() => {
    if (phase !== 'ready' || rootEl === null) return;
    const el = rootEl;
    // deps: the grid re-derives when the density tokens or the font
    // override change (metric-only changes must still re-apply — the
    // canvas pixel size is grid x cell)
    void resolvedFontSize;
    void resolvedDensity;
    measureDensityTokens();
    measureCell();

    if (fixedGrid) {
      applyGrid(
        Math.max(1, Math.round(cols ?? DEFAULT_COLS)),
        Math.max(1, Math.round(rows ?? DEFAULT_ROWS)),
      );
      return;
    }

    const derive = (width: number, height: number): void => {
      const nextCols = Math.max(1, Math.floor(width / cell.w));
      const nextRows = Math.max(1, Math.floor(height / cell.h));
      if (
        nextCols === applied.cols &&
        nextRows === applied.rows &&
        applied.w === cell.w &&
        applied.h === cell.h
      ) {
        return;
      }
      const gridChanged = nextCols !== applied.cols || nextRows !== applied.rows;
      applyGrid(nextCols, nextRows);
      if (gridChanged) untrack(() => onResize)?.({ cols: nextCols, rows: nextRows });
    };

    if (typeof ResizeObserver === 'undefined') {
      const rect = el.getBoundingClientRect();
      derive(rect.width, rect.height);
      return;
    }
    const ro = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.contentRect;
      const fallback = el.getBoundingClientRect();
      derive(box?.width ?? fallback.width, box?.height ?? fallback.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // theme change → re-resolve shell colors + full repaint (content colors
  // are untouched — they live in the row snapshots verbatim)
  $effect(() => {
    void theme?.background;
    void theme?.foreground;
    if (phase !== 'ready' || ctx === null) return;
    resolveShellColors();
    repaintAll();
  });

  // ---- input bridge -------------------------------------------------------

  const handleKeydown = (event: KeyboardEvent): void => {
    if (vt === null || phase !== 'ready') return;
    if (MODIFIER_KEYS.has(event.key)) return;
    const bytes = vt.keyEncode({
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    });
    if (bytes.length === 0) return;
    // the terminal consumed the key: keep it away from the page
    event.preventDefault();
    onData?.(bytes);
  };

  const handlePaste = (event: ClipboardEvent): void => {
    if (vt === null || phase !== 'ready') return;
    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (text === '') return;
    // always swallow the paste so the document never receives terminal
    // input; unsafe text (newlines / bracketed-paste markers) is dropped
    event.preventDefault();
    if (!vt.paste.isSafe(text)) return;
    onData?.(vt.paste.encode(text));
  };

  // wheel needs a non-passive listener (preventDefault keeps the page from
  // scrolling while the viewport scrolls) — Svelte's attribute listeners
  // cannot guarantee that, so it is attached imperatively.
  $effect(() => {
    if (phase !== 'ready' || rootEl === null) return;
    const el = rootEl;
    const onWheel = (event: WheelEvent): void => {
      if (vt === null) return;
      event.preventDefault();
      const magnitude = Math.max(1, Math.round(Math.abs(event.deltaY) / cell.h));
      // binding contract: scrollViewport(lines) — negative scrolls UP, so a
      // downward wheel (deltaY > 0) feeds positive lines
      const lines = event.deltaY > 0 ? magnitude : -magnitude;
      const before = scrollOffset;
      vt.scrollViewport(lines);
      // clamped offset tracking: the viewport cannot scroll past the tail
      scrollOffset = Math.max(0, before - lines);
      const shift = scrollOffset - before;
      if (shift !== 0) {
        // shift the row cache by the actual offset delta (new[y] =
        // old[y - shift]) so the 0-dirty scroll-down case still paints
        // coherently (probed upstream gap); rows entering from scrollback
        // stay blank until wasm reports them dirty
        const next: (RowSnapshot | undefined)[] = [];
        for (let y = 0; y < grid.rows; y++) {
          const source = y - shift;
          next[y] = source >= 0 && source < grid.rows ? screen[source] : undefined;
        }
        screen = next;
      }
      scheduleFrame();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  // ---- bootstrap ----------------------------------------------------------

  onMount(() => {
    alive = true;
    const boot = async (): Promise<void> => {
      try {
        // Load seam (dual-channel, D5): the prop url wins; the fallback
        // resolves the plugin-served virtual module. Both the virtual id
        // and the $lib/ghostty-vt binding id live behind the vt-deps
        // seam module so this component's own transform never depends on
        // contexts that cannot resolve them (jsdom tests mock the seam).
        let url = untrack(() => wasmUrl);
        if (url === undefined) url = await virtualWasmUrl();
        const loaded = await loadVt({ url });

        if (!alive) {
          loaded.free();
          return;
        }
        vt = loaded;
        ctx = canvasEl?.getContext('2d') ?? null;
        probeEl = document.createElement('div');
        probeEl.setAttribute('aria-hidden', 'true');
        probeEl.style.cssText =
          'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0';
        rootEl?.appendChild(probeEl);

        // sample the wasm default ink/paper from a PRISTINE terminal (the
        // constructor's 80x24 grid is fully dirty on the first pass) —
        // these two sentinels are the shell/content color boundary
        for (const row of vt.dirtyRows()) {
          const first = row.cells[0];
          if (first !== undefined) {
            wasmDefaultFg = first.style.fg ?? '';
            wasmDefaultBg = first.style.bg ?? '';
            break;
          }
        }

        resolveShellColors();
        phase = 'ready';
        // metrics + grid derive in the sizing effect off phase === 'ready'

        // pre-ready writes must not be lost: any rAF that fired while
        // vt was still null returned early and left the queue pending
        // with no frame scheduled — flush it now that vt exists
        if (pendingChunks.length > 0) scheduleFrame();

        // font timing (D5.2): first frames may ride the fallback mono;
        // once the real mono lands, re-measure and repaint the grid
        if (typeof document !== 'undefined' && document.fonts) {
          document.fonts.ready.then(() => {
            if (!alive || phase !== 'ready' || vt === null) return;
            measureDensityTokens();
            measureCell();
            applyGrid(grid.cols || DEFAULT_COLS, grid.rows || DEFAULT_ROWS);
          });
        }
      } catch (err) {
        if (!alive) return;
        errorMessage = err instanceof Error ? err.message : String(err);
        phase = 'error';
      }
    };
    void boot();
    return () => {
      alive = false;
    };
  });

  onDestroy(() => {
    alive = false;
    if (rafId !== 0 && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafId);
    }
    rafId = 0;
    pendingChunks = [];
    screen = [];
    probeEl?.remove();
    probeEl = null;
    vt?.free();
    vt = null;
  });

  // ---- handle API (bind:this) ----------------------------------------------

  /** Feed pty OUTPUT into the terminal (rAF-batched with in-flight writes). */
  export function write(bytes: Uint8Array): void {
    if (bytes.length === 0) return;
    pendingChunks.push(bytes);
    scheduleFrame();
  }

  /** Full reset (RIS) back to a pristine grid. */
  export function reset(): void {
    if (vt === null) return;
    vt.reset();
    scrollOffset = 0;
    screen = [];
    repaintAll();
  }

  /** Imperatively resize the grid (an auto-mode container change overrides
   * it again on the next derivation). */
  export function resizeTo(nextCols: number, nextRows: number): void {
    applyGrid(Math.max(1, Math.round(nextCols)), Math.max(1, Math.round(nextRows)));
  }

  /** Base64 snapshot of the terminal (diagnostics/tests; V1 encode only). */
  export function snapshot(): string {
    return vt === null ? '' : vt.snapshotEncode();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (D5.1: the terminal is a
     generic labeled container by design — the canvas carries no semantics,
     so the root is the keyboard surface; role stays unset per the frozen
     component contract) -->
<!-- svelte-ignore a11y_no_static_element_interactions (keyboard + paste +
     wheel are the terminal's native interaction surface; declared here
     because the canvas itself is aria-hidden) -->
<div
  bind:this={rootEl}
  class={cn(
    'relative block w-full overflow-hidden bg-terminal text-terminal-foreground',
    'outline-none focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1',
    // auto mode FILLS its host (block-size:100%) and the canvas is
    // absolutely inset — sizing must not feed back through content flow
    // (otherwise the intrinsic grid height drives root height and the
    // host's definite height is ignored, owner acceptance 2026-08-28).
    // explicit cols/rows (or auto=false) keeps the intrinsic grid size.
    !fixedGrid && 'h-full',
    className,
  )}
  tabindex="0"
  aria-label="terminal"
  onkeydown={handleKeydown}
  onpaste={handlePaste}
  {...rest}
  data-density={resolvedDensity}
  data-state={phase}
  data-jx-ghostty-term
>
  <canvas
    bind:this={canvasEl}
    class={cn('block', !fixedGrid && 'absolute inset-0')}
    aria-hidden="true"
  ></canvas>

  {#if children}
    <!-- consumer overlay (also the error-face owner when provided) -->
    {@render children()}
  {:else if phase === 'error'}
    <div
      class="p-4 font-mono text-[13px] leading-5 whitespace-pre-wrap break-words"
      role="status"
    >
      <span class="text-primary mr-2" aria-hidden="true">$</span>ghostty-term: {errorMessage}
    </div>
  {/if}
</div>

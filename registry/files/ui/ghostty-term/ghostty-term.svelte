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
  to the orchestrator): no hyperlink activation, viewport-only
  scroll, and a clamped shift heuristic on wheel-scroll because the
  upstream render state under-reports dirty rows on scroll-down
  (probed: scrollViewport(+3) after a clean pass yields 0 dirty rows).
  Cursor (2026-08-28) and text selection (2026-08-28, gesture-driven)
  have since landed in the binding face.
-->
<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  // type-only: erased at compile time.
  import type { RowSnapshot } from '$lib/ghostty-vt';
  // VALUE import: the xterm-convention Terminal facade (owner directive
  // 2026-08-28). '$lib/ghostty-vt' is resolvable in mirrored contexts and
  // consumer installs (vt-deps itself imports it); only the WASM
  // INSTANTIATION stays behind the vt-deps seam — the facade wraps the
  // core that loadVt produces and never loads anything itself.
  import { Terminal } from '$lib/ghostty-vt';
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
    /**
   * Primary typeface override for the cell grid (owner request
   * 2026-08-28: playground font switching). The consumer must ensure the
   * face is loaded (@fontsource etc.); the CJK/mono fallback tail stays
   * regardless so non-latin graphemes always resolve. Default: the
   * JetBrains Mono stack.
   */
  fontFamily?: string;

  /**
   * Cursor rendering (owner request 2026-08-28). Default: on, style and
   * blink follow the APPLICATION's choices (DECSCUSR via the render
   * state — the fake shell and real ptys set it). Override pins style
   * and/or blink; `false` hides the cursor entirely.
   */
  cursor?: boolean | { blink?: boolean; style?: 'bar' | 'block' | 'underline' };

    /**
   * Text selection (owner request 2026-08-28). Default: on — mouse
   * drag/double/triple click drive the wasm gesture state machine,
   * selected cells paint inverted, mouseup/Cmd-C copy the text, and
   * the root gains select-none. `false` disables the whole surface
   * (mouse events fall through untouched).
   */
  selection?: boolean;

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
    cursor = true,
    selection = true,
    fontFamily,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  // ---- constants ----------------------------------------------------------

  // latin rides JetBrains Mono (or the fontFamily prop); CJK/emoji fall
  // through to the system CJK faces (terminal cell math stays ghostty's —
  // 2 cells per wide grapheme; the fallback only supplies the glyphs)
  const DEFAULT_FONT_PRIMARY = "'JetBrains Mono Variable', 'JetBrains Mono'";
  const FONT_FALLBACK_TAIL =
    "SFMono-Regular, Menlo, Consolas, 'Liberation Mono', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans Mono CJK SC', 'Microsoft YaHei', monospace";
  const fontStack = $derived(fontFamily ? `'${fontFamily.replaceAll("'", '')}', ${FONT_FALLBACK_TAIL}` : `${DEFAULT_FONT_PRIMARY}, ${FONT_FALLBACK_TAIL}`);
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

  // the xterm-convention facade over the loaded core (owner directive
  // 2026-08-28); the raw GhosttyVT stays reachable as vt.core for the
  // surfaces with no xterm counterpart (gesture events, snapshot).
  let vt: Terminal | null = null;
  /** facade onData subscription → props.onData (installed once at boot). */
  let dataSub: { dispose(): void } | null = null;
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
    `${italic ? 'italic ' : ''}${bold ? 700 : 400} ${sizePx}px ${fontStack}`;

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

  // ---- cursor overlay (owner request 2026-08-28) -------------------------
  // Focus is tracked so the cursor goes HOLLOW when the terminal is not
  // the keyboard surface (the xterm convention) and blinks only while
  // focused; reduced-motion pins it steady.

  let focused = $state(false);
  let blinkOn = true;
  let blinkTimer: ReturnType<typeof setInterval> | undefined;

  const cursorConfig = $derived(
    cursor === true
      ? { on: true as const, blink: undefined, style: undefined }
      : cursor === false
        ? { on: false as const, blink: undefined, style: undefined }
        : { on: true as const, blink: cursor.blink, style: cursor.style },
  );

  const reducedMotion = (): boolean =>
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Paint the cursor AFTER rows (cursor movement dirties both the old
   *  and the new row upstream, so overlay-after-paint is complete). */
  const paintCursor = (): void => {
    if (ctx === null || vt === null || !cursorConfig.on) return;
    const c = vt.readCursor();
    if (c === null || !c.visible) return;
    if (!blinkOn && focused) return; // blink off-phase hides a filled cursor
    const style = cursorConfig.style ?? c.style;
    const x = c.x * cell.w;
    const y = c.y * cell.h;
    const w = (c.wideTail ? 2 : 1) * cell.w;
    const ink = c.color ?? shell.fg;
    ctx.fillStyle = ink;
    if (style === 'bar') {
      ctx.fillRect(x, y, Math.max(2, cell.w / 6), cell.h);
    } else if (style === 'underline') {
      ctx.fillRect(x, y + cell.h - 2, w, 2);
    } else if (focused) {
      // block: paper out the glyph, redraw it in the cursor ink
      ctx.fillRect(x, y, w, cell.h);
      const under = screen[c.y]?.cells[c.x];
      if (under && under.grapheme !== '' && !under.style.invisible) {
        ctx.fillStyle = shell.bg;
        ctx.font = fontString(under.style.italic, under.style.bold, resolvedFontSize);
        ctx.textBaseline = 'middle';
        ctx.fillText(under.grapheme, x, y + cell.h / 2);
      }
    } else {
      // unfocused: hollow block outline
      ctx.fillRect(x, y, w, 2);
      ctx.fillRect(x, y + cell.h - 2, w, 2);
      ctx.fillRect(x, y, 2, cell.h);
      ctx.fillRect(x + w - 2, y, 2, cell.h);
    }
  };

  /** Blink loop: only while the surface is the keyboard surface, the app
   *  asked for blinking, motion is allowed, and the cursor is enabled. */
  $effect(() => {
    if (blinkTimer !== undefined) clearInterval(blinkTimer);
    blinkTimer = undefined;
    blinkOn = true;
    const teardown = (): void => {
      if (blinkTimer !== undefined) clearInterval(blinkTimer);
      blinkTimer = undefined;
    };
    if (!cursorConfig.on || !focused || reducedMotion()) return;
    let appBlinks = true;
    try {
      appBlinks = vt?.readCursor()?.blinking ?? true;
    } catch {
      /* freed between checks — the next paint reports its own error */
    }
    const blinkWanted = cursorConfig.blink ?? appBlinks;
    if (!blinkWanted) return;
    blinkTimer = setInterval(() => {
      blinkOn = !blinkOn;
      if (alive && ctx !== null) {
        // cheap repaint: the grid is cache-fed; blink flips one cell
        repaintAll();
      }
    }, 530);
    return teardown;
  });

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
      vt.write(merged);
    }
    paintFromDirty();
  };

  /** Paint one viewport row from its snapshot (the D5.2 cell recipe). */
  const paintRow = (row: RowSnapshot): void => {
    if (ctx === null) return;
    const size = resolvedFontSize;
    const rowY = row.y * cell.h;
    const width = grid.cols * cell.w;

    // two-pass row paint (owner acceptance 2026-08-28): pass 1 lays EVERY
    // background (row paper, content paper, selection inversion), pass 2
    // draws EVERY glyph — a per-cell paint used to cut wide graphemes
    // (CJK/emoji span 2 cells) in half when the tail cell's paper was
    // filled after the head glyph.
    ctx.fillStyle = shell.bg;
    ctx.fillRect(0, rowY, width, cell.h);

    const maxCols = Math.min(row.cells.length, grid.cols);
    const sel = row.selection; // startX/endX both inclusive (binding contract)
    const selected = (i: number): boolean => sel !== undefined && i >= sel.startX && i <= sel.endX;

    const inks: (string | undefined)[] = [];
    for (let i = 0; i < maxCols; i++) {
      const style = row.cells[i]!.style;
      let rawFg = style.fg ?? '';
      let rawBg = style.bg ?? '';
      if (style.reverse) {
        const swap = rawFg;
        rawFg = rawBg;
        rawBg = swap;
      }
      let ink = rawFg === wasmDefaultFg ? shell.fg : rawFg;
      let paper = rawBg === wasmDefaultBg ? shell.bg : rawBg;
      // selection inverts the resolved colors (the style.reverse path again)
      if (selected(i)) {
        const swap = ink;
        ink = paper;
        paper = swap;
      }
      if (paper !== shell.bg) {
        ctx.fillStyle = paper;
        ctx.fillRect(i * cell.w, rowY, cell.w, cell.h);
      }
      inks.push(style.invisible ? undefined : ink);
    }

    for (let i = 0; i < maxCols; i++) {
      const cellView = row.cells[i]!;
      const style = cellView.style;
      if (cellView.grapheme === '') continue;
      const ink = inks[i];
      if (ink === undefined) continue;
      if (style.bold || style.italic) ctx.font = fontString(style.italic, style.bold, size);
      else if (ctx.font !== fontString(false, false, size)) ctx.font = fontString(false, false, size);
      ctx.fillStyle = ink;
      ctx.textBaseline = 'middle';
      ctx.fillText(cellView.grapheme, i * cell.w, rowY + cell.h / 2);
      if (style.underline >= 1) {
        ctx.fillRect(i * cell.w, rowY + cell.h - 1, cell.w, 1);
      }
    }
    screen[row.y] = row;
  };

  const paintFromDirty = (): void => {
    if (vt === null) return;
    for (const row of vt.dirtyRows()) paintRow(row);
    paintCursor();
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
    paintCursor();
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
    // a typeface swap changes the cell metrics — full re-apply required
    void fontStack;
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

  // selection mouse bridge (owner request 2026-08-28): the wasm gesture
  // state machine owns the semantics; this side only translates pixels to
  // clamped cell coordinates and tracks the multi-click cadence.
  let selPressed = false;
  let selTier = 1;
  let selLastClickAt = 0;
  let selLastCell = { x: -1, y: -1 };

  const cellFromEvent = (event: MouseEvent): { x: number; y: number } => ({
    x: Math.max(0, Math.min(grid.cols - 1, Math.floor((event.offsetX || 0) / cell.w))),
    y: Math.max(0, Math.min(grid.rows - 1, Math.floor((event.offsetY || 0) / cell.h))),
  });

  /** clipboard best-effort: insecure contexts / headless tests stay silent */
  const copyText = (text: string): void => {
    try {
      navigator.clipboard?.writeText(text)?.catch(() => {});
    } catch {
      /* no clipboard — selection still paints */
    }
  };

  const handleMouseDown = (event: MouseEvent): void => {
    if (!selection || vt === null || phase !== 'ready' || event.button !== 0) return;
    // keep native selection AND the focus loss preventDefault would cause
    event.preventDefault();
    rootEl?.focus();
    const c = cellFromEvent(event);
    const now = Date.now();
    const repeat = now - selLastClickAt <= 250 && c.x === selLastCell.x && c.y === selLastCell.y;
    selLastCell = c;
    selLastClickAt = now;
    selTier = repeat ? (selTier % 3) + 1 : 1; // 1=cell 2=word 3=line, cycling
    selPressed = true;
    vt.core.selection.events.press(c.x, c.y, selTier);
    scheduleFrame();
  };

  const handleMouseMove = (event: MouseEvent): void => {
    if (!selection || !selPressed || vt === null) return;
    event.preventDefault(); // no native text selection while dragging
    const c = cellFromEvent(event);
    vt.core.selection.events.drag(c.x, c.y);
    scheduleFrame();
  };

  const handleMouseUp = (event: MouseEvent): void => {
    if (!selPressed || vt === null) return;
    selPressed = false;
    const c = cellFromEvent(event);
    vt.core.selection.events.release(c.x, c.y);
    const text = vt.getSelection();
    if (text !== undefined && text !== '') copyText(text);
    scheduleFrame();
  };

  const handleMouseLeave = (): void => {
    if (!selPressed || vt === null) return;
    selPressed = false;
    vt.core.selection.events.release(selLastCell.x, selLastCell.y);
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (vt === null || phase !== 'ready') return;
    // Cmd/Ctrl+C copies the active selection when one exists; without a
    // selection the key falls through to the pty (^C / SIGINT) as before
    if (selection && (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey
      && (event.key === 'c' || event.key === 'C')) {
      const text = vt.getSelection();
      if (text !== undefined && text !== '') {
        event.preventDefault();
        copyText(text);
        return;
      }
    }
    if (MODIFIER_KEYS.has(event.key)) return;
    // facade path: handleKey encodes AND replays the bytes on the facade's
    // onData channel, where the boot-time subscription hands them to
    // props.onData as Uint8Array (the consumer contract is unchanged)
    const bytes = vt.handleKey({
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
  };

  const handlePaste = (event: ClipboardEvent): void => {
    if (vt === null || phase !== 'ready') return;
    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (text === '') return;
    // always swallow the paste so the document never receives terminal
    // input; the facade paste gate drops unsafe text (newlines /
    // bracketed-paste markers) and replays sanitized bytes on onData
    event.preventDefault();
    vt.paste(text);
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
      vt.scrollLines(lines);
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
        // wrap the loaded core in the xterm-convention facade (injected
        // core: the component keeps ownership and frees it on destroy)
        vt = new Terminal({ core: loaded });
        // single bridge: the facade's onData carries pty bytes as a latin1
        // STRING; rebuild the exact bytes the consumer contract promises
        dataSub = vt.onData((str) => {
          onData?.(Uint8Array.from(str, (ch) => ch.charCodeAt(0) & 0xff));
        });
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
    dataSub?.dispose();
    dataSub = null;
    if (vt !== null) {
      vt.dispose(); // unbinds the facade registries (never frees the core)
      vt.core.free(); // injected core: the component owns its lifetime
      vt = null;
    }
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
    return vt === null ? '' : vt.core.snapshotEncode();
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
    // selection owns the pointer — native text selection stays off
    selection && 'select-none',
    className,
  )}
  tabindex="0"
  aria-label="terminal"
  onkeydown={handleKeydown}
  onmousedown={handleMouseDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseLeave}
  onpaste={handlePaste}
  onfocus={() => (focused = true)}
  onblur={() => (focused = false)}
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

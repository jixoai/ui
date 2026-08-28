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
    4. input bridge — keydown/paste/wheel/IME/mouse translated by the
       binding (keyEncode / paste gate / mouseEncode / scrollViewport)
       into onData, plus the terminal-input-p0 surfaces riding the same
       bridge: IME composition (hidden textarea, design D2), mouse-
       reporting routing with the Shift bypass (design D3), and the
       OSC 52 clipboard security model + onTitleChange (design D4).
    5. handle API — write/reset/resizeTo/snapshot exports.

  Owner original demand: 2026-08-28 "ghostty-term / Batch D (design.md
  D5 — registry:ui component)". Binding ABI notes below are Batch B
  field-probed facts, not assumptions.

  TODO roadmap (owner closeout review 2026-08-29 — P1/P2 backlog as
  comments until their changes open; every P1 item is "wasm ammo ready,
  host wiring pending"):
    P1 1. scrollback UI — a scrollbar + history browsing surface; the
          exact viewport state is already readable (vt.readScrollbar():
          total/offset/len) and scrollViewport() accepts absolute ROW/TOP
          tags beyond deltas.
    P1 2. hyperlinks — cell.hyperlinkUri is already surfaced on every
          CellView (OSC 8 read path); missing: hover underline styling
          + click activation (open in new tab + security prompt).
    P1 3. rectangle (column) selection — the binding gesture already
          memoizes `rectangle` on press and applies it to drags
          (selection.events.press(x, y, tier, {rectangle:true})); expose
          the toggle (prop or Alt+drag convention).
    P1 4. addon system (xterm loadAddon convention) — architecture-level
          change; opens the ecosystem slots: WebGL renderer, fit, search.
          Deserves its own change, not a rider.
    P2 5. rendering perf — glyph atlas (offscreen prerendered glyph
          bitmaps) then WebGL; current per-cell fillText is fine for
          interactive use, chokes on bulk output (reference: coder/
          ghostty-web's webgl addon).
    P2 6. mobile — touch scroll, long-press context menu, virtual
          keyboard shell; sendKey()/pasteText() handles already provide
          the programmatic input surface (keyboard-less hosts).
    P2 7. in-terminal search — the binding's grid refs accept HISTORY
          points (GhosttyPoint tag); needs a row-read helper + match
          highlight + jump-to (depends on scrollback UI for navigation).
    UX 8. "shell starting" state — hosts with slow shells (heavy zshrc:
          multi-second boot on the owner's machine) show an empty canvas
          until the first byte; a first-write placeholder would mask it
          (demo App.svelte level, or a prop here if generalized).
  Known upstream limit: emoji VS16 (❤️) width — ghostty judges 1 cell,
  color glyphs render wider; needs upstream collaboration, not a host
  hack (xterm has the same behavior).

  Known V1 bounds (design non-goals or binding-surface limits, reported
  to the orchestrator): no hyperlink activation, viewport-only
  scroll (exact offsets via readScrollbar; the cache-shift rides them),
  reported drags are lock-paired (a leave emits the RELEASE — no
  phantom buttons, no pointer capture in V1).
  Cursor (2026-08-28) and text selection (2026-08-28, gesture-driven)
  have since landed in the binding face. Input-p0 bounds: wheel reports
  carry no release (X10/SGR convention), a reported drag that leaves the
  surface emits the paired RELEASE (lock-paired; no pointer capture),
  OSC 52 clear-clipboard is
  explicitly not implemented, and the preedit overlay carries no width
  judgment source (canvas clip is the only bound — the V1 law).
-->
<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  // type-only: erased at compile time.
  import type { GhosttyOsc52Request, RowSnapshot } from '$lib/ghostty-vt';
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
  /**
   * Shell theme — every knob is an extension point; the jixoai token
   * defaults are just the preset we ship (owner architecture ruling
   * 2026-08-28: defaults ride the extension layer, never hardcode).
   * ANSI/256/truecolor CONTENT colors are never themed here (D5.1).
   */
  export interface GhosttyTermTheme {
    /** default cell paper (default: var(--terminal)) */
    background?: string;
    /** default cell ink (default: var(--terminal-foreground)) */
    foreground?: string;
    /** cursor paint; overrides the app's OSC 12 when set (default: app color, else foreground) */
    cursor?: string;
    /** ink for the glyph under a filled block cursor (default: background) */
    cursorAccent?: string;
    /** selected-cell paper; when unset selection paints as classic inverse */
    selectionBackground?: string;
    /** selected-cell ink; pairs with selectionBackground (default: background) */
    selectionForeground?: string;
  }

  export interface GhosttyTermResizeDetail {
    cols: number;
    rows: number;
  }

  /** The bind:this surface (write = pty OUTPUT in; the rest are VT controls). */
  export interface GhosttyTermHandle {
    write(bytes: Uint8Array): void;
    reset(): void;
    /** programmatic key input (virtual keyboard / IME surface) */
    sendKey(event: import('$lib/ghostty-vt').GhosttyKeyEventLike): void;
    /** programmatic sanitized paste (gate-protected) */
    pasteText(text: string): void;
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
   * RAW key-event layer (owner architecture ruling 2026-08-28): runs
   * FIRST on every keydown. Return true to consume the event (the
   * default chain — clipboard layer, keyEncode — never sees it). This is
   * the base for custom keymaps (vim modes), conflict avoidance, IME
   * composition handling, and virtual keyboards (which can instead call
   * the sendKey/pasteText handle methods directly — no DOM events needed).
   */
  onKeyDown?: (event: KeyboardEvent) => boolean | void;

  /**
   * The DEFAULT clipboard layer, implemented ON the key architecture as
   * overridable defaults (not hardcoded): copy = Cmd/Ctrl(+Shift)+C with
   * a selection, paste = Cmd/Ctrl(+Shift)+V through the sanitized gate.
   * `false` disables both; fine-grained via the object form. Set false
   * and consume via onKeyDown for fully custom bindings.
   */
  clipboard?: boolean | { copy?: boolean; paste?: boolean };

  /**
   * OSC 52 clipboard-WRITE security model (terminal-input-p0 design
   * D4). Default: on with a 1 MiB decoded cap — pty-driven set
   * requests are base64-decoded and written to navigator.clipboard
   * only under the executable cap pair ①③ (encoded-before-decode /
   * decoded double-check; cap ② — the observer buffer — lives in the
   * binding). `false` disables writes entirely; `{ maxSize }` tunes
   * the cap. maxSize must be a finite positive number of bytes —
   * anything else throws a developer error at instantiation (never a
   * silent fallback).
   */
  clipboardWrite?: boolean | { maxSize?: number };

  /**
   * OSC 52 clipboard READ (query replies). Default: **false** — a pty
   * asking for the clipboard gets no answer until the consumer opts
   * in (the xterm security model: writes allowed, reads explicit).
   * When true, queries read navigator.clipboard and reply through the
   * onData INPUT channel (never write/vtWrite — design D4), capped ④:
   * an oversized reply is answered with the empty sequence + warn.
   */
  clipboardReadFrom?: boolean;

  /**
   * Terminal title changes (OSC 0/2 observed on the pty stream) —
   * hook the host window chrome here (vim/tmux renames land live).
   */
  onTitleChange?: (title: string) => void;

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

  /**
   * Mouse-reporting routing (terminal-input-p0 design D3). Default:
   * on — when the APPLICATION has enabled mouse tracking
   * (DECSET ?9/?1000-?1003, observed live via the facade), mouse
   * presses/motions/releases/wheel are encoded by the wasm encoder
   * (mode + format follow the pty) and emitted on onData; holding
   * Shift bypasses to the LOCAL behavior (selection/scroll — the
   * xterm/ghostty arbitration). `false` forces local behavior even
   * under active tracking: identical to the pre-p0 component.
   */
  mouse?: boolean;

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
    mouse = true,
    fontFamily,
    onKeyDown,
    clipboard = true,
    clipboardWrite = true,
    clipboardReadFrom = false,
    onTitleChange,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  // ---- frozen-prop validation (design D4) ---------------------------------
  // An invalid clipboardWrite.maxSize is a DEVELOPER error: validated
  // once at instantiation (late prop mutations are not re-validated —
  // fix the call site). Legal domain: finite positive byte counts.
  // (state_referenced_locally is deliberate here: this IS the one-shot
  // initial-value check.)
  // svelte-ignore state_referenced_locally
  if (typeof clipboardWrite === 'object' && clipboardWrite !== null) {
    const declared = clipboardWrite.maxSize;
    if (declared !== undefined && (!Number.isFinite(declared) || declared <= 0)) {
      throw new Error(
        `[ghostty-term] clipboardWrite.maxSize must be a finite positive number of bytes (e.g. 1048576); got ${String(declared)}`,
      );
    }
  }

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
  /** OSC 52 decoded-byte default cap (design D4: decoupled from wasm's
   * Kitty-5522 OPT limit — this repo's own law, 1 MiB). */
  const OSC52_DEFAULT_MAX_BYTES = 1024 * 1024;
  const B64_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  /** UTF-8 text → base64 (the OSC 52 query-reply payload; dependency-free
   *  so the component never reaches into the binding's private helpers). */
  const utf8ToBase64 = (text: string): string => {
    const bytes = new TextEncoder().encode(text);
    let out = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const b0 = bytes[i]!;
      const b1 = i + 1 < bytes.length ? bytes[i + 1]! : 0;
      const b2 = i + 2 < bytes.length ? bytes[i + 2]! : 0;
      const trip = (b0 << 16) | (b1 << 8) | b2;
      out += B64_ALPHABET[(trip >> 18) & 63];
      out += B64_ALPHABET[(trip >> 12) & 63];
      out += i + 1 < bytes.length ? B64_ALPHABET[(trip >> 6) & 63] : '=';
      out += i + 2 < bytes.length ? B64_ALPHABET[trip & 63] : '=';
    }
    return out;
  };

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
  /** input-p0 observer subscriptions (tracking flips, OSC 52, title). */
  let observerSubs: { dispose(): void }[] = [];
  let ctx: CanvasRenderingContext2D | null = null;
  let probeEl: HTMLDivElement | null = null;
  let cell = { w: 8, h: 20 };
  let grid = { cols: 0, rows: 0 };
  /** device pixel ratio (fill-rect snapping + canvas raster scale). */
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

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
  let shell: {
    bg: string;
    fg: string;
    selectionBg?: string;
    selectionFg?: string;
    cursor?: string;
    cursorAccent?: string;
  } = { bg: '#000000', fg: '#ffffff' };

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
      selectionBg: theme?.selectionBackground !== undefined ? toCanvasColor(theme.selectionBackground, 'rgb(255, 255, 255)') : undefined,
      selectionFg: theme?.selectionForeground !== undefined ? toCanvasColor(theme.selectionForeground, 'rgb(0, 0, 0)') : undefined,
      cursor: theme?.cursor !== undefined ? toCanvasColor(theme.cursor, 'rgb(255, 255, 255)') : undefined,
      cursorAccent: theme?.cursorAccent !== undefined ? toCanvasColor(theme.cursorAccent, 'rgb(0, 0, 0)') : undefined,
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
    // theme.cursor OVERRIDES the app's OSC 12 (xterm setOption semantics);
    // fallback chain: theme → OSC 12 → shell foreground
    const ink = shell.cursor ?? c.color ?? shell.fg;
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
        ctx.fillStyle = shell.cursorAccent ?? shell.bg;
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

  /**
   * Preedit overlay (design D2): the composition string draws to the
   * RIGHT of the cursor as one underlined run, truncated at the grid
   * edge by the canvas clip — the ONLY width bound (no wcwidth/ghostty
   * probing: the V1 law). The cursor never advances; the pty never sees
   * the intermediate string (compositionend commits it through the
   * paste gate).
   */
  const paintPreedit = (): void => {
    if (ctx === null || vt === null || preedit === '') return;
    const c = vt.readCursor();
    if (c === null) return;
    const x = c.x * cell.w;
    const y = c.y * cell.h;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, grid.cols * cell.w, grid.rows * cell.h);
    ctx.clip();
    ctx.font = fontString(false, false, resolvedFontSize);
    ctx.fillStyle = shell.fg;
    ctx.textBaseline = 'middle';
    ctx.fillText(preedit, x, y + cell.h / 2);
    const advance = ctx.measureText(preedit).width;
    ctx.fillRect(x, y + cell.h - 2, advance, 2); // underline style
    ctx.restore();
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

  // ---- IME composition (terminal-input-p0 design D2) -----------------------
  // Browsers only activate text composition on EDITABLE elements (the
  // reason xterm/ace/monaco all keep a hidden textarea — a div surface
  // goes mute in real browsers). The root docks focus into a sr-only
  // textarea whose keydown still BUBBLES to the root handler, so the
  // keyboard path is unchanged; only the composition trio is textarea-
  // owned. Pointer events stay off the field so the mouse bridge never
  // sees it as a target.

  let imeEl = $state<HTMLTextAreaElement | null>(null);
  /** composition in flight (compositionstart .. compositionend). */
  let composing = false;
  /** live preedit string — never touches the pty; end commits via the gate. */
  let preedit = '';

  /** root focus docks the IME surface (never mid-composition — ripping
   *  focus would cancel the session the user is in). */
  const dockIme = (): void => {
    if (imeEl === null || composing) return;
    if (document.activeElement === imeEl) return;
    imeEl.focus();
  };

  const handleRootFocus = (): void => {
    focused = true;
    dockIme();
  };

  /** focus may be shuttling root ↔ the IME textarea — the surface only
   *  reports blur when focus actually leaves the terminal. */
  const handleFocusOut = (): void => {
    if (rootEl === null || !rootEl.contains(document.activeElement)) focused = false;
  };

  const setPreedit = (text: string): void => {
    if (preedit === text) return;
    preedit = text;
    scheduleFrame(); // the overlay repaints with the next cursor paint
  };

  const handleCompositionStart = (): void => {
    composing = true;
  };

  const handleCompositionUpdate = (event: CompositionEvent): void => {
    setPreedit(event.data ?? '');
  };

  const handleCompositionEnd = (event: CompositionEvent): void => {
    composing = false;
    setPreedit('');
    if (imeEl !== null) imeEl.value = '';
    const committed = event.data ?? '';
    if (committed !== '' && vt !== null) vt.paste(committed); // paste gate
    // adverse-ordering re-dock (impl self-review B1): a mid-composition
    // click can rip focus root-ward BEFORE compositionend fires — dockIme
    // then skipped (composing was still true) and nothing re-docks after.
    // If focus is inside the terminal but not on the IME surface, put it
    // back so the next composition can start (D2 invariant). Chrome's
    // compositionend-before-refocus ordering makes this a no-op there.
    if (
      rootEl !== null &&
      document.activeElement !== imeEl &&
      rootEl.contains(document.activeElement)
    ) {
      imeEl?.focus();
    }
  };

  /** keys that land in the textarea outside composition (default actions
   *  of un-consumed keydowns) never accumulate — the field stays pristine. */
  const handleImeInput = (): void => {
    if (!composing && imeEl !== null) imeEl.value = '';
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
    // Device-pixel snapping: fractional cell rects each antialias their
    // own half-pixel edge, leaving hairline seams wherever neighbor
    // papers differ (visible inside selections — owner report
    // 2026-08-28). Every fill aligns to the device grid instead.
    const dprPx = (v: number): number => Math.round(v * dpr) / dpr;
    const cellLeft = (i: number): number => dprPx(i * cell.w);
    const cellWidth = (i: number): number => dprPx((i + 1) * cell.w) - cellLeft(i);
    const rowTop = dprPx(rowY);
    const rowHeight = dprPx(rowY + cell.h) - rowTop;
    ctx.fillStyle = shell.bg;
    ctx.fillRect(0, rowTop, dprPx(width), rowHeight);

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
      // selection: themed papers when provided (selectionBackground /
      // selectionForeground are extension points), classic inverse
      // otherwise — the default RIDES the same swap path
      if (selected(i)) {
        if (shell.selectionBg !== undefined || shell.selectionFg !== undefined) {
          // themed selection paper; ink keeps each cell's content color —
          // mono ink happens ONLY when selectionForeground is set
          // explicitly (owner report 2026-08-28: forced mono flattened
          // ANSI colors; xterm preserves fg hues on selection bg)
          paper = shell.selectionBg ?? paper;
          ink = shell.selectionFg ?? ink;
        } else {
          const swap = ink;
          ink = paper;
          paper = swap;
        }
      }
      if (paper !== shell.bg) {
        ctx.fillStyle = paper;
        ctx.fillRect(cellLeft(i), rowTop, cellWidth(i), rowHeight);
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
        ctx.fillRect(cellLeft(i), rowTop + rowHeight - dprPx(1), cellWidth(i), dprPx(1));
      }
    }
    screen[row.y] = row;
  };

  const paintFromDirty = (): void => {
    if (vt === null) return;
    for (const row of vt.dirtyRows()) paintRow(row);
    paintCursor();
    paintPreedit();
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
    paintPreedit();
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
    void theme?.selectionBackground;
    void theme?.selectionForeground;
    void theme?.cursor;
    void theme?.cursorAccent;
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

  // ---- mouse-reporting routing (terminal-input-p0 design D3) ---------------
  // Event order (frozen): mousedown / mousemove(pressed) / mouseup / wheel →
  // !mouse || shiftKey || !trackingActive → LOCAL (selection/scroll, the
  // pre-p0 behavior) — else mouseEncode → onData (the facade replays).

  /** live tracking state (MOUSE_TRACKING bool; seeded after boot, then
   *  flip-driven through the facade registry). */
  let mouseTracking = false;
  /** DOM button (0/1/2) of the in-flight REPORTED press; -1 = none. */
  let mouseButton = -1;

  const domButtonName = (domButton: number): 'left' | 'middle' | 'right' | undefined =>
    domButton === 0 ? 'left' : domButton === 1 ? 'middle' : domButton === 2 ? 'right' : undefined;

  /** true when the event routes to the pty encoder (the design D3 gate). */
  const reportMouse = (event: MouseEvent): boolean =>
    mouse && !event.shiftKey && mouseTracking;

  /**
   * Encode one mouse event — pixel coordinates (offsetX/Y are the
   * terminal-surface px; the canvas is inset-0 in the root) plus the
   * live cellSize, which the Batch A contract made REQUIRED for every
   * format (without SIZE every position reads out-of-viewport). The
   * facade replays non-empty bytes on onData (the handleKey mirror) —
   * the component never double-sends.
   */
  const encodeMouse = (
    action: 'press' | 'release' | 'motion',
    event: MouseEvent,
    domButton: number,
    motionBetween = false,
  ): void => {
    if (vt === null) return;
    const button = domButtonName(domButton);
    const px = event.offsetX || 0;
    const py = event.offsetY || 0;
    lastReportedCell = { x: Math.floor(px / cell.w), y: Math.floor(py / cell.h) };
    vt.mouseEncode(
      {
        action,
        x: px,
        y: py,
        mods: {
          shift: event.shiftKey,
          ctrl: event.ctrlKey,
          alt: event.altKey,
          meta: event.metaKey,
        },
        ...(button !== undefined ? { button } : {}),
        ...(motionBetween ? { motionBetween: true } : {}),
      },
      { w: cell.w, h: cell.h },
    );
  };

  /** last cell a reported event landed on — the leave-release fallback
   *  coordinate when no MouseEvent is available (codex impl-review). */
  let lastReportedCell = { x: 0, y: 0 };

  const encodeMouseAt = (
    action: 'press' | 'release' | 'motion',
    cellX: number,
    cellY: number,
    domButton: number,
  ): void => {
    if (vt === null) return;
    const button = domButtonName(domButton);
    lastReportedCell = { x: cellX, y: cellY };
    vt.mouseEncode(
      {
        action,
        x: cellX * cell.w,
        y: cellY * cell.h,
        ...(button !== undefined ? { button } : {}),
      },
      { w: cell.w, h: cell.h },
    );
  };

  const handleMouseDown = (event: MouseEvent): void => {
    if (vt === null || phase !== 'ready') return;
    if (reportMouse(event) && event.button <= 2) {
      // the APPLICATION owns the mouse: report the press, keep the
      // keyboard surface focused, never seed a selection gesture
      // (reporting and selection are mutually exclusive — Shift is the
      // only bypass into the local path)
      event.preventDefault();
      rootEl?.focus();
      mouseButton = event.button;
      encodeMouse('press', event, event.button);
      return;
    }
    mouseButton = -1;
    if (!selection || event.button !== 0) return;
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
    if (vt === null || phase !== 'ready') return;
    if (mouseButton >= 0) {
      // reported drag: motion with the HELD button; motionBetween keeps
      // out-of-viewport drags reporting (the strict ANY_BUTTON_PRESSED
      // mapping — Batch A contract: it is never auto-set).
      // SESSION-LOCK (codex impl-review): the press captured the modality —
      // mid-drag tracking-off / Shift / mouse-prop changes do NOT divert
      // this stream (only the paired release ends it), so the app can
      // never be stranded mid-gesture.
      event.preventDefault();
      encodeMouse('motion', event, mouseButton, true);
      return;
    }
    if (reportMouse(event) && event.buttons === 0) {
      // hover motion is offered to the encoder BUTTON-LESS (no
      // motionBetween): ?1003 any-event tracking reports it, stricter
      // modes drop it — mode differences stay absorbed inside the
      // encoder (setopt_from_terminal), the host only routes
      encodeMouse('motion', event, -1);
      return;
    }
    if (!selection || !selPressed) return;
    event.preventDefault(); // no native text selection while dragging
    const c = cellFromEvent(event);
    vt.core.selection.events.drag(c.x, c.y);
    scheduleFrame();
  };

  const handleMouseUp = (event: MouseEvent): void => {
    if (mouseButton >= 0 && vt !== null) {
      const domButton = mouseButton;
      mouseButton = -1;
      encodeMouse('release', event, domButton);
      return;
    }
    mouseButton = -1;
    if (!selPressed || vt === null) return;
    selPressed = false;
    const c = cellFromEvent(event);
    vt.core.selection.events.release(c.x, c.y);
    const text = vt.getSelection();
    if (text !== undefined && text !== '') copyText(text);
    scheduleFrame();
  };

  const handleMouseLeave = (event?: MouseEvent): void => {
    // SESSION-LOCK pairing (codex impl-review): a reported press OWNS the
    // drag session — motion/release keep reporting even if tracking turns
    // off or Shift appears mid-drag (diverting would strand the app in a
    // pressed state); and leaving the surface during a reported drag
    // emits the RELEASE (V1 has no pointer capture — the app must never
    // be left holding a phantom button).
    if (mouseButton >= 0 && vt !== null) {
      const domButton = mouseButton;
      mouseButton = -1;
      if (event !== undefined) encodeMouse('release', event, domButton);
      else encodeMouseAt('release', lastReportedCell.x, lastReportedCell.y, domButton);
      return;
    }
    mouseButton = -1;
    if (!selPressed || vt === null) return;
    selPressed = false;
    vt.core.selection.events.release(selLastCell.x, selLastCell.y);
  };

  const clipboardLayer = $derived(
    clipboard === false
      ? { copy: false, paste: false }
      : clipboard === true
        ? { copy: true, paste: true }
        : { copy: clipboard.copy ?? true, paste: clipboard.paste ?? true },
  );

  const handleKeydown = (event: KeyboardEvent): void => {
    if (vt === null || phase !== 'ready') return;
    // the RAW layer owns the event first — returning true consumes it and
    // the default chain never runs (custom keymaps / IME / conflicts)
    if (onKeyDown?.(event) === true) {
      event.preventDefault();
      return;
    }
    // IME composition owns the keyboard (design D1/D2): no clipboard
    // layer, no keyEncode — only the raw layer above stays in the chain.
    // Escape cancels the local preedit (the IME itself usually already
    // did; the component only clears its state).
    if (composing || event.isComposing === true) {
      if (event.key === 'Escape') setPreedit('');
      return;
    }
    const plain = !event.shiftKey && !event.altKey;
    // copy: Cmd/Ctrl+C (mac/win) and Ctrl+Shift+C (linux convention) —
    // copies the active selection when one exists; without a selection
    // Cmd/Ctrl+C falls through to the pty (^C / SIGINT) as before
    const isCopy =
      (event.metaKey || event.ctrlKey) && !event.altKey
      && (event.key === 'c' || event.key === 'C')
      && (plain || (event.shiftKey && event.ctrlKey && !event.metaKey));
    if (selection && clipboardLayer.copy && isCopy) {
      const text = vt.getSelection();
      if (text !== undefined && text !== '') {
        event.preventDefault();
        copyText(text);
        return;
      }
    }
    // paste: Cmd/Ctrl+V and Ctrl+Shift+V (linux). A canvas host never
    // receives the browser paste event (nothing editable is focused), so
    // the shortcut IS the paste path — clipboard read is async; the bytes
    // ride the sanitized paste gate, never raw into the pty
    const isPaste =
      (event.metaKey || event.ctrlKey) && !event.altKey
      && (event.key === 'v' || event.key === 'V')
      && (plain || (event.shiftKey && event.ctrlKey && !event.metaKey));
    if (clipboardLayer.paste && isPaste) {
      event.preventDefault();
      void navigator.clipboard
        ?.readText()
        .then((text) => {
          if (text !== '' && vt !== null) vt.paste(text);
        })
        .catch(() => {
          /* clipboard denied (permissions/unsupported context) — no-op */
        });
      return;
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

  // ---- OSC 52 clipboard security model (terminal-input-p0 design D4) -------
  // The executable cap quartet: ① encoded-before-decode, ③ decoded
  // double-check, ④ query-reply cap live HERE; ② (the observer buffer)
  // lives in the binding. Every rejection is a named warn + drop, never
  // a throw.

  /**
   * pty INPUT bytes out — the ONE bridge every input path shares.
   * keyEncode/paste/mouseEncode bytes arrive as facade onData latin1
   * strings and are rebuilt to bytes here; OSC 52 query replies join
   * the same channel (they are pty INPUT, exactly like keyEncode bytes
   * — the write-priority law forbids write/vtWrite with a vengeance:
   * an injected reply would be re-ingested by the observer and never
   * reach the program).
   */
  const emitPtyBytes = (bytes: Uint8Array): void => {
    onData?.(bytes);
  };

  const clipboardCap = (): { write: boolean; maxSize: number } =>
    clipboardWrite === false
      ? { write: false, maxSize: OSC52_DEFAULT_MAX_BYTES }
      : {
          write: true,
          maxSize:
            typeof clipboardWrite === 'object' && clipboardWrite !== null
              ? clipboardWrite.maxSize ?? OSC52_DEFAULT_MAX_BYTES
              : OSC52_DEFAULT_MAX_BYTES,
        };

  const warnOsc52 = (reason: string): void => {
    console.warn(`[ghostty-term] OSC 52 ${reason}`);
  };

  const handleOsc52 = (req: GhosttyOsc52Request): void => {
    if (req.selector !== 'c' && req.selector !== '') return; // system clipboard only
    const { write: writeOn, maxSize } = clipboardCap();
    const encodedCap = Math.ceil(maxSize / 3) * 4; // cap ① threshold
    if (req.kind === 'set') {
      if (!writeOn) return;
      const payload = req.payloadBase64 ?? '';
      if (payload === '') return; // clear-clipboard: V1 explicitly not done
      if (payload.length > encodedCap) {
        warnOsc52(
          `set payload of ${payload.length} chars exceeds the encoded cap of ${encodedCap} — dropped before decode`,
        );
        return;
      }
      let bin: string;
      try {
        bin = atob(payload);
      } catch {
        warnOsc52('set payload is not valid base64 — dropped');
        return;
      }
      if (bin.length > maxSize) {
        warnOsc52(`decoded payload of ${bin.length} bytes exceeds maxSize of ${maxSize} — dropped`);
        return;
      }
      const text = new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0) & 0xff));
      try {
        navigator.clipboard?.writeText(text)?.catch(() => warnOsc52('clipboard write failed'));
      } catch {
        warnOsc52('clipboard unavailable');
      }
      return;
    }
    // query: silent by default — reads are opt-in (the xterm model)
    if (!clipboardReadFrom) return;
    let read: Promise<string> | undefined;
    try {
      read = navigator.clipboard?.readText();
    } catch {
      warnOsc52('clipboard unavailable — query not answered');
      return;
    }
    if (read === undefined) {
      warnOsc52('clipboard unavailable — query not answered');
      return;
    }
    // capture the liveness token: an async clipboard read resolving after
    // unmount must never emit into a dead component's onData (codex
    // impl-review #3)
    const token = alive;
    void read
      .then((text) => {
        if (!token || !alive) return;
        const b64 = utf8ToBase64(text);
        if (b64.length > encodedCap) {
          // cap ④: refuse to ship an oversized reply, answer empty
          warnOsc52(
            `query reply of ${b64.length} chars exceeds the encoded cap of ${encodedCap} — replying with the empty sequence`,
          );
          emitPtyBytes(new TextEncoder().encode('\x1b]52;c;\x07'));
          return;
        }
        emitPtyBytes(new TextEncoder().encode(`\x1b]52;c;${b64}\x07`));
      })
      .catch(() => warnOsc52('clipboard read failed — query not answered'));
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
      if (reportMouse(event)) {
        // wheel reports as PRESS events on the four/five buttons (the
        // X10/SGR convention: no wheel release); one sequence per line,
        // deltaY < 0 → four (up). The magnitude cap mirrors the local
        // path's trackpad-inertia bound.
        const magnitude = Math.min(
          Math.max(1, Math.round(Math.abs(event.deltaY) / cell.h)),
          grid.rows * 3,
        );
        const button = event.deltaY < 0 ? 'four' : 'five';
        for (let i = 0; i < magnitude; i++) {
          vt.mouseEncode(
            {
              action: 'press',
              button,
              x: event.offsetX || 0,
              y: event.offsetY || 0,
              mods: {
                shift: event.shiftKey,
                ctrl: event.ctrlKey,
                alt: event.altKey,
                meta: event.metaKey,
              },
            },
            { w: cell.w, h: cell.h },
          );
        }
        return;
      }
      // cap per-event magnitude: trackpad inertia can emit absurd deltas
      // that once desynced the heuristic tracker (owner report 2026-08-28:
      // fast flicks jumped the viewport to the top of scrollback)
      const raw = Math.max(1, Math.round(Math.abs(event.deltaY) / cell.h));
      const magnitude = Math.min(raw, grid.rows * 3);
      // binding contract: scrollViewport(lines) — negative scrolls UP, so a
      // downward wheel (deltaY > 0) feeds positive lines
      const lines = event.deltaY > 0 ? magnitude : -magnitude;
      const before = scrollOffset;
      vt.scrollLines(lines);
      // EXACT offset from the terminal (readScrollbar): the viewport top
      // line in absolute coordinates. Cache shifts ride the real delta —
      // the old heuristic (before − lines) drifted on clamped scrolls and
      // fast flicks. viewportOffset = offset above the stream tail.
      const bar = vt.readScrollbar();
      const tailOffset = Math.max(0, bar.total - bar.len);
      scrollOffset = Math.max(0, tailOffset - bar.offset);
      // cache-shift convention below: next[y] = screen[y - shift], so
      // shift = offset delta (down-scroll = negative shift = rows rise)
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
          emitPtyBytes(Uint8Array.from(str, (ch) => ch.charCodeAt(0) & 0xff));
        });
        // input-p0 observers (design D3/D4): seed the tracking state from
        // the live terminal, then ride the flip registries; OSC 52 runs
        // the cap quartet; title changes pass straight through
        mouseTracking = vt.core.readMouseTracking();
        observerSubs.push(
          vt.onMouseTrackingChange((active) => {
            mouseTracking = active;
          }),
          vt.onOsc52((req) => handleOsc52(req)),
          vt.onTitleChange((title) => {
            onTitleChange?.(title);
          }),
        );
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
    for (const sub of observerSubs) sub.dispose();
    observerSubs = [];
    composing = false;
    preedit = '';
    mouseButton = -1;
    mouseTracking = false;
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

  /**
   * Programmatic key input (virtual keyboards, IME, tests): encode the
   * key-shape via the wasm encoder and emit it on onData — the exact
   * path a physical keydown takes, minus the DOM event. This plus
   * pasteText is the full input surface for keyboard-less hosts.
   */
  export function sendKey(event: import('$lib/ghostty-vt').GhosttyKeyEventLike): void {
    if (vt === null) return;
    vt.handleKey(event);
  }

  /**
   * Programmatic sanitized paste (virtual keyboards, IME composition
   * commit): rides the paste gate, never raw bytes into the pty.
   */
  export function pasteText(text: string): void {
    if (vt === null || text === '') return;
    vt.paste(text);
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
    // the IME textarea takes over focus from the root (composition needs
    // an editable surface) — the keyboard ring survives the dock because
    // the root matches on its FOCUSED DESCENDANT (focus-visible carries
    // through programmatic focus after keyboard interaction)
    'has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-ring has-[:focus-visible]:-outline-offset-1',
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
  onfocus={handleRootFocus}
  onblur={handleFocusOut}
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

  <!-- IME composition surface (design D2): browsers only compose on
       editable elements, so root focus docks here. Keydown bubbles back
       to the root handler (the keyboard path is unchanged); pointer
       events are disabled so the mouse bridge never sees it as a
       target; the ring stays on the root via has-[:focus-visible]. -->
  <textarea
    bind:this={imeEl}
    class="sr-only"
    style="pointer-events: none; outline: none;"
    tabindex="-1"
    aria-hidden="true"
    spellcheck="false"
    autocomplete="off"
    autocapitalize="off"
    onfocus={() => (focused = true)}
    onblur={handleFocusOut}
    oncompositionstart={handleCompositionStart}
    oncompositionupdate={handleCompositionUpdate}
    oncompositionend={handleCompositionEnd}
    oninput={handleImeInput}
  ></textarea>

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

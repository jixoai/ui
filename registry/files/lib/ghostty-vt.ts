//
// ghostty-vt — framework-free WebAssembly ABI binding for libghostty-vt
// (registry/files/lib/ghostty-vt.ts, design.md D4).
//
// Intents (orthogonal count: 3):
//   1. Runtime-reflection marshaling: EVERY struct offset, enum value and
//      bit position is read from ghostty_type_json() at load time — zero
//      hardcoded offsets (the official example/wasm-vt pattern, generalized
//      into table-driven getField/setField helpers). This is the nightly
//      ABI-drift armor; the only compile-time constants that remain are the
//      GhosttyMods bit positions (SHIFT/CTRL/ALT/SUPER), which are C
//      #defines not present in the type manifest (documented below).
//   2. The frozen GhosttyVT surface (design.md D4): terminal lifecycle
//      (new/free/reset/resize/scrollViewport), vtWrite as the pty-output
//      entry point (write + render-state update in one transaction),
//      dirtyRows() iteration producing fully JS-materialized RowSnapshots
//      (strings copied out before any further wasm call can detach the
//      memory buffer), keyEncode with a KeyboardEvent-shape adapter, the
//      paste safety/encode pair, and base64 snapshotEncode (V1 encodes
//      only; decode stays out of the surface).
//   3. Typed failure discipline: instantiation problems (missing simd128,
//      streaming unsupported, compile/link errors) and use-after-free both
//      surface as GhosttyVTError with `cause` — the component layer maps
//      that to data-state="error" without sniffing messages.
//
// Memory safety contract (per wasm.h): every scratch buffer written across
// the wasm boundary is freed immediately after use; wasm exports may grow
// linear memory, so every host-side access re-derives its view from
// memory.buffer instead of caching ArrayBuffers/DataViews.
//
// Owner original demand: 2026-08-28 "ghostty-term / registry:lib
// ghostty-vt ABI binding layer (design.md D4 — interface freeze)".

/** Typed error for every ghostty-vt failure (load, ABI, use-after-free). */
export class GhosttyVTError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'GhosttyVTError';
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

// ---------------------------------------------------------------------------
// type_json manifest shapes (diagnostic + marshaling source of truth)
// ---------------------------------------------------------------------------

export interface GhosttyTypeField {
  offset: number;
  size: number;
  type: string;
}

export interface GhosttyTypeEntry {
  kind: string;
  size: number;
  align?: number;
  fields?: Record<string, GhosttyTypeField>;
  values?: Record<string, number>;
  bits?: Record<string, { lsb: number; width: number }>;
  [extra: string]: unknown;
}

export interface GhosttyTypeLayout {
  schema: number;
  library_version: string;
  commit: string | null;
  dirty: boolean | null;
  abi: {
    target: string;
    os: string;
    environment: string;
    pointer_size: number;
    usize_size: number;
    max_alignment: number;
    endian: string;
  };
  types: Record<string, GhosttyTypeEntry>;
}

// ---------------------------------------------------------------------------
// frozen public surface (design.md D4)
// ---------------------------------------------------------------------------

export interface LoadGhosttyVTOpts {
  /** URL of a ghostty-vt wasm asset; fetched (streaming first, buffered fallback). */
  url?: string;
  /** Raw module bytes (node tests pass readFileSync output here). */
  bytes?: Uint8Array;
  /** Diagnostic label only — the module content is what it is. */
  variant?: 'full' | 'small';
}

/** Resolved cell style. fg/bg are draw-ready `rgb(r, g, b)` strings (palette indices and truecolor flattened; unset fields fall back to the render-state defaults before being omitted). */
export interface GhosttyStyle {
  fg?: string;
  bg?: string;
  bold: boolean;
  italic: boolean;
  /** GhosttySgrUnderline enum value from the manifest (0 = none, 1 = single, ...). */
  underline: number;
  reverse: boolean;
  invisible: boolean;
}

export interface CellView {
  /** Full grapheme cluster of the cell ('' for empty cells). */
  grapheme: string;
  style: GhosttyStyle;
  /** Resolved lazily via grid-ref for cells carrying the hyperlink bit. */
  hyperlinkUri?: string;
}

export interface RowSnapshot {
  /** Viewport y (0 = top row). */
  y: number;
  /** One cell per column (empty cells included with grapheme ''). */
  cells: CellView[];
  /**
   * Render-state selection span for this row (present only when the row is
   * at least partially selected). startX/endX are viewport columns and are
   * BOTH INCLUSIVE (probed: drag to (5,1) selects x 0..4 on that row and
   * reports end_x=4; a row-spanning middle row reports end_x=cols-1).
   */
  selection?: { startX: number; endX: number };
}

/** KeyboardEvent-shaped input for keyEncode (either a real event or a plain object). */
export interface GhosttyKeyEventLike {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

/** Behavior for one click tier of a selection gesture (CELL granularity default). */
export type SelectionBehavior = 'cell' | 'word' | 'line' | 'output';

/** Per-tier click behaviors; unset tiers fall back to the upstream default (cell/word/line). */
export interface Behaviors {
  singleClick?: SelectionBehavior;
  doubleClick?: SelectionBehavior;
  tripleClick?: SelectionBehavior;
}

/**
 * Gesture-driven text selection (owner request 2026-08-28). Coordinates are
 * viewport CELL coordinates (x = column, y = row). The binding marshals each
 * call into the typed gesture events, applies them to the terminal, installs
 * the resulting selection as the terminal's active selection, and refreshes
 * the render state so dirtyRows() republishes selection spans.
 */
export interface GhosttySelectionGestureEvents {
  /**
   * Begin (or continue) a click sequence at a cell. clickCount is the
   * multi-click tier (1=cell 2=word 3=line); the binding synthesizes the
   * monotonic event times that drive the upstream click counter.
   */
  press(x: number, y: number, clickCount: number, opts?: { rectangle?: boolean; behaviors?: Behaviors }): void;
  /** Extend the active selection to a cell (geometry tracks the live grid). */
  drag(x: number, y: number): void;
  /** End the gesture at a cell (the established selection stays active). */
  release(x: number, y: number): void;
}

export interface GhosttySelectionFace {
  /** Gesture event bridge (see GhosttySelectionGestureEvents). */
  events: GhosttySelectionGestureEvents;
  /**
   * Active selection text (PLAIN, unwrap+trim — Ghostty's copy semantics).
   * Returns null when there is no active selection.
   */
  text(): string | null;
  /** Clear the active selection (marks the affected rows dirty). */
  clear(): void;
}

export interface GhosttyCursor {
  /** viewport column/row (already viewport-space; render-ready). */
  x: number;
  y: number;
  /** DECSCUSR style the application selected (upstream visual_style). */
  style: 'bar' | 'block' | 'underline' | 'block-hollow';
  visible: boolean;
  blinking: boolean;
  passwordInput: boolean;
  /** the grapheme under the cursor spans two cells */
  wideTail: boolean;
  /** OSC 12 app cursor color, when the app set one. */
  color?: string;
}

export interface GhosttyVT {
  readonly buildInfo: string;
  readonly typeLayout: GhosttyTypeLayout;
  readonly variant: 'full' | 'small';

  /**
   * (Re)create the terminal + render state at cols x rows (frees any prior
   * terminal). Declared as a function-typed property: method shorthand
   * `new(...)` would parse as a construct signature.
   */
  new: (cols: number, rows: number) => void;
  /** Full reset (RIS) + render-state refresh. */
  reset(): void;
  /** Resize the terminal; cell pixel sizes stay at the wasm defaults (0). */
  resize(cols: number, rows: number): void;
  /** Scroll the viewport by `lines` (negative scrolls up). */
  scrollViewport(lines: number): void;

  /**
   * Pty-output entry point: writes bytes into the VT parser and refreshes
   * the render state (update = begin_update + end_update transaction) so
   * dirtyRows() reflects the write immediately.
   */
  vtWrite(bytes: Uint8Array): void;

  /**
   * Iterate rows needing a redraw since the last COMPLETED iteration
   * (completion runs ghostty_render_state_clean; abandoning the iterator
   * early keeps the remaining dirty state for the next pass). Snapshots
   * are fully copied into JS before being yielded.
   */
  dirtyRows(): IterableIterator<RowSnapshot>;

  /**
   * Cursor view for the current render state: viewport coordinates, the
   * app-selected visual style (DECSCUSR), blink/visibility flags, and the
   * app-provided cursor color when one was set (OSC 12). Returns null
   * when the cursor is outside the viewport (viewport_has_value=false).
   */
  readCursor(): GhosttyCursor | null;

  /** Text selection: gesture events + active-selection reads/clears. */
  selection: GhosttySelectionFace;

  /** Encode a key event into the bytes a pty expects (may be empty, e.g. bare modifiers). */
  keyEncode(event: GhosttyKeyEventLike): Uint8Array;

  paste: {
    /**
     * Upstream strict rule: unsafe iff the text contains a newline or the
     * bracketed-paste end marker "\x1b[201~" (bare ESC bytes are NOT
     * flagged — paste.encode sanitizes them to spaces).
     */
    isSafe(text: string): boolean;
    /** Sanitize + optionally bracket the text for pty input. */
    encode(text: string, bracketed?: boolean): Uint8Array;
  };

  /** Base64 of the binary terminal snapshot (V1: encode only, no decode). */
  snapshotEncode(): string;

  /** Release terminal + render state + all wasm scratch (idempotent; for onDestroy). */
  free(): void;
}

// ---------------------------------------------------------------------------
// wasm exports (the subset this binding drives; one boundary cast total)
// ---------------------------------------------------------------------------

interface GhosttyWasmExports {
  memory: WebAssembly.Memory;
  ghostty_type_json(): number;
  ghostty_build_info(data: number, out: number): number;
  ghostty_wasm_alloc(len: number): number;
  ghostty_wasm_free(ptr: number, len: number): void;
  ghostty_wasm_alloc_opaque(): number;
  ghostty_wasm_free_opaque(ptr: number): void;
  ghostty_wasm_take_opaque(ptr: number): number;
  ghostty_free(allocator: number, ptr: number, len: number): void;
  ghostty_terminal_new(allocator: number, out: number, cols: number, rows: number): number;
  ghostty_terminal_free(terminal: number): void;
  ghostty_terminal_reset(terminal: number): void;
  ghostty_terminal_resize(terminal: number, cols: number, rows: number, cellWidthPx: number, cellHeightPx: number): number;
  ghostty_terminal_vt_write(terminal: number, ptr: number, len: number): void;
  ghostty_terminal_scroll_viewport(terminal: number, behaviorPtr: number): void;
  ghostty_terminal_grid_ref(terminal: number, pointPtr: number, outRefPtr: number): number;
  ghostty_grid_ref_hyperlink_uri(refPtr: number, buf: number, bufLen: number, outLen: number): number;
  ghostty_render_state_new(allocator: number, out: number): number;
  ghostty_render_state_free(state: number): void;
  ghostty_render_state_update(state: number, terminal: number): number;
  ghostty_render_state_clean(state: number): number;
  ghostty_render_state_get(state: number, data: number, out: number): number;
  ghostty_render_state_row_iterator_new(allocator: number, out: number): number;
  ghostty_render_state_row_iterator_free(iterator: number): void;
  /** returns C bool as i32 */
  ghostty_render_state_row_iterator_next_dirty(iterator: number, outY: number): number;
  ghostty_render_state_row_get(iterator: number, data: number, out: number): number;
  ghostty_render_state_row_cells_new(allocator: number, out: number): number;
  ghostty_render_state_row_cells_free(cells: number): void;
  /** returns C bool as i32 */
  ghostty_render_state_row_cells_next(cells: number): number;
  ghostty_render_state_row_cells_get(cells: number, data: number, out: number): number;
  ghostty_key_encoder_new(allocator: number, out: number): number;
  ghostty_key_encoder_free(encoder: number): void;
  ghostty_key_encoder_setopt_from_terminal(encoder: number, terminal: number): void;
  ghostty_key_encoder_encode(encoder: number, event: number, buf: number, bufSize: number, outLen: number): number;
  ghostty_key_event_new(allocator: number, out: number): number;
  ghostty_key_event_free(event: number): void;
  ghostty_key_event_set_action(event: number, action: number): void;
  ghostty_key_event_set_key(event: number, key: number): void;
  ghostty_key_event_set_mods(event: number, mods: number): void;
  ghostty_key_event_set_utf8(event: number, ptr: number, len: number): void;
  /** returns C bool as i32 */
  ghostty_paste_is_safe(ptr: number, len: number): number;
  ghostty_paste_encode(data: number, dataLen: number, bracketed: boolean, buf: number, bufLen: number, outWritten: number): number;
  ghostty_snapshot_encode_alloc(terminal: number, allocator: number, outPtr: number, outLen: number): number;
  ghostty_selection_gesture_new(allocator: number, out: number): number;
  /** terminal may be 0 once the terminal is gone (upstream free contract) */
  ghostty_selection_gesture_free(gesture: number, terminal: number): void;
  ghostty_selection_gesture_reset(gesture: number, terminal: number): void;
  /** returns GhosttyResult; NO_VALUE when the event produces no selection */
  ghostty_selection_gesture_event(gesture: number, terminal: number, event: number, outSelection: number): number;
  ghostty_selection_gesture_event_new(allocator: number, out: number, type: number): number;
  ghostty_selection_gesture_event_free(event: number): void;
  ghostty_selection_gesture_event_set(event: number, option: number, valuePtr: number): number;
  ghostty_terminal_set(terminal: number, option: number, valuePtr: number): number;
  ghostty_terminal_selection_format_alloc(
    terminal: number,
    allocator: number,
    optionsPtr: number,
    outOpaque: number,
    outLen: number,
  ): number;
}

const REQUIRED_EXPORTS = [
  'memory', 'ghostty_type_json', 'ghostty_build_info',
  'ghostty_wasm_alloc', 'ghostty_wasm_free', 'ghostty_wasm_alloc_opaque',
  'ghostty_wasm_free_opaque', 'ghostty_wasm_take_opaque', 'ghostty_free',
  'ghostty_terminal_new', 'ghostty_terminal_free', 'ghostty_terminal_reset',
  'ghostty_terminal_resize', 'ghostty_terminal_vt_write',
  'ghostty_terminal_scroll_viewport', 'ghostty_terminal_grid_ref',
  'ghostty_grid_ref_hyperlink_uri', 'ghostty_render_state_new',
  'ghostty_render_state_free', 'ghostty_render_state_update',
  'ghostty_render_state_clean', 'ghostty_render_state_get',
  'ghostty_render_state_row_iterator_new', 'ghostty_render_state_row_iterator_free',
  'ghostty_render_state_row_iterator_next_dirty', 'ghostty_render_state_row_get',
  'ghostty_render_state_row_cells_new', 'ghostty_render_state_row_cells_free',
  'ghostty_render_state_row_cells_next', 'ghostty_render_state_row_cells_get',
  'ghostty_key_encoder_new', 'ghostty_key_encoder_free',
  'ghostty_key_encoder_setopt_from_terminal', 'ghostty_key_encoder_encode',
  'ghostty_key_event_new', 'ghostty_key_event_free', 'ghostty_key_event_set_action',
  'ghostty_key_event_set_key', 'ghostty_key_event_set_mods',
  'ghostty_key_event_set_utf8', 'ghostty_paste_is_safe', 'ghostty_paste_encode',
  'ghostty_snapshot_encode_alloc',
  'ghostty_selection_gesture_new', 'ghostty_selection_gesture_free',
  'ghostty_selection_gesture_reset',
  'ghostty_selection_gesture_event', 'ghostty_selection_gesture_event_new',
  'ghostty_selection_gesture_event_free', 'ghostty_selection_gesture_event_set',
  'ghostty_terminal_set', 'ghostty_terminal_selection_format_alloc',
] as const;

// GhosttyMods bit positions (event.h #defines — compile-time constants the
// type manifest cannot carry; stable W3C-style contract, the sole hardcoded
// ABI values in this file, kept visible on purpose).
const MODS_SHIFT = 1 << 0;
const MODS_CTRL = 1 << 1;
const MODS_ALT = 1 << 2;
const MODS_SUPER = 1 << 3;

// ---------------------------------------------------------------------------
// implementation
// ---------------------------------------------------------------------------

class GhosttyVTCore implements GhosttyVT {
  readonly buildInfo: string;
  readonly typeLayout: GhosttyTypeLayout;
  readonly variant: 'full' | 'small';

  private readonly wasm: GhosttyWasmExports;
  private readonly memory: WebAssembly.Memory;

  // handles (0 = not created)
  private term = 0;
  private renderState = 0;
  private rowIter = 0;
  private rowCells = 0;
  private keyEncoder = 0;
  private keyEvent = 0;
  private selGesture = 0;
  private selPressEvent = 0;
  private selDragEvent = 0;
  private selReleaseEvent = 0;
  /** live grid dims — the gesture drag geometry source */
  private dims = { cols: 0, rows: 0 };
  /** synthesized monotonic clock (ns) driving the upstream click counter */
  private selClockNs = 0n;
  private selLastClick = 0;

  // one reusable opaque out-slot (wasm.h: a single slot serves every constructor)
  private readonly slot: number;

  // persistent scratch (allocated once per instance, freed in free())
  private readonly stylePtr: number;
  private readonly bufPtr: number;
  private readonly rgbPtr: number;
  private readonly colorsPtr: number;
  private readonly cursorPtr: number;
  private readonly lenPtr: number;
  private readonly outYPtr: number;
  private readonly pointPtr: number;
  private readonly refPtr: number;
  private readonly viewPtr: number;
  private readonly scrollPtr: number;
  private readonly selPtr: number;
  private readonly geoPtr: number;
  private readonly u64Ptr: number;
  private readonly boolPtr: number;
  private readonly behaviorsPtr: number;
  private readonly fmtOptsPtr: number;
  private readonly rowSelPtr: number;

  private alive = true;

  constructor(instance: WebAssembly.Instance, variant: 'full' | 'small') {
    const missing = REQUIRED_EXPORTS.filter((name) => !(name in instance.exports));
    if (missing.length > 0) {
      throw new GhosttyVTError(
        `ghostty-vt module is missing required exports [${missing.join(', ')}] — ABI drift; regenerate the wasm asset`,
      );
    }
    this.wasm = instance.exports as unknown as GhosttyWasmExports;
    this.memory = this.wasm.memory;
    this.variant = variant;

    this.typeLayout = this.parseTypeLayout();
    const { abi } = this.typeLayout;
    if (abi.endian !== 'little') {
      throw new GhosttyVTError(`unsupported wasm endianness: ${abi.endian}`);
    }
    if (abi.pointer_size !== 4) {
      // V1 targets wasm32; the opaque-slot helpers are pointer-sized.
      throw new GhosttyVTError(`unsupported pointer width: ${abi.pointer_size}`);
    }
    this.buildInfo = this.readBuildInfo();
    this.slot = this.checkedAllocOpaque();

    const size = (struct: string): number => this.structSize(struct);
    this.stylePtr = this.checkedAlloc(size('GhosttyStyle'));
    this.bufPtr = this.checkedAlloc(size('GhosttyBuffer'));
    this.rgbPtr = this.checkedAlloc(size('GhosttyColorRgb'));
    this.colorsPtr = this.checkedAlloc(size('GhosttyRenderStateColors'));
    this.cursorPtr = this.checkedAlloc(size('GhosttyRenderStateCursor'));
    this.lenPtr = this.checkedAlloc(4);
    this.outYPtr = this.checkedAlloc(2);
    this.pointPtr = this.checkedAlloc(size('GhosttyPoint'));
    this.refPtr = this.checkedAlloc(size('GhosttyGridRef'));
    this.viewPtr = this.checkedAlloc(size('GhosttyCellsView'));
    this.scrollPtr = this.checkedAlloc(size('GhosttyTerminalScrollViewport'));
    this.selPtr = this.checkedAlloc(size('GhosttySelection'));
    this.geoPtr = this.checkedAlloc(size('GhosttySelectionGestureGeometry'));
    this.u64Ptr = this.checkedAlloc(8);
    this.boolPtr = this.checkedAlloc(1);
    this.behaviorsPtr = this.checkedAlloc(size('GhosttySelectionGestureBehaviors'));
    this.fmtOptsPtr = this.checkedAlloc(size('GhosttyTerminalSelectionFormatOptions'));
    this.rowSelPtr = this.checkedAlloc(size('GhosttyRenderStateRowSelection'));

    this.new(80, 24);
  }

  // ---- diagnostics ----

  private parseTypeLayout(): GhosttyTypeLayout {
    const ptr = this.wasm.ghostty_type_json();
    const text = this.decodeCString(ptr);
    try {
      return JSON.parse(text) as GhosttyTypeLayout;
    } catch (cause) {
      throw new GhosttyVTError(`ghostty_type_json returned unparseable JSON`, { cause });
    }
  }

  private readBuildInfo(): string {
    const info = this.enumValue('GhosttyBuildInfo', 'VERSION_STRING');
    this.wasm.ghostty_build_info(info, this.lenPtr);
    const strPtr = this.dv().getUint32(this.lenPtr, true);
    return strPtr === 0 ? this.typeLayout.library_version : this.decodeCString(strPtr);
  }

  // ---- lifecycle ----

  new(cols: number, rows: number): void {
    this.assertAlive();
    this.teardownTerminal();
    const { wasm } = this;
    this.check(wasm.ghostty_terminal_new(0, this.slot, cols, rows), 'ghostty_terminal_new');
    this.term = wasm.ghostty_wasm_take_opaque(this.slot);
    this.check(wasm.ghostty_render_state_new(0, this.slot), 'ghostty_render_state_new');
    this.renderState = wasm.ghostty_wasm_take_opaque(this.slot);
    this.check(wasm.ghostty_render_state_row_iterator_new(0, this.slot), 'ghostty_render_state_row_iterator_new');
    this.rowIter = wasm.ghostty_wasm_take_opaque(this.slot);
    this.check(wasm.ghostty_render_state_row_cells_new(0, this.slot), 'ghostty_render_state_row_cells_new');
    this.rowCells = wasm.ghostty_wasm_take_opaque(this.slot);
    this.check(wasm.ghostty_key_encoder_new(0, this.slot), 'ghostty_key_encoder_new');
    this.keyEncoder = wasm.ghostty_wasm_take_opaque(this.slot);
    this.check(wasm.ghostty_key_event_new(0, this.slot), 'ghostty_key_event_new');
    this.keyEvent = wasm.ghostty_wasm_take_opaque(this.slot);
    this.check(wasm.ghostty_selection_gesture_new(0, this.slot), 'ghostty_selection_gesture_new');
    this.selGesture = wasm.ghostty_wasm_take_opaque(this.slot);
    const eventType = (name: string): number =>
      this.enumValue('GhosttySelectionGestureEventType', name);
    this.check(wasm.ghostty_selection_gesture_event_new(0, this.slot, eventType('PRESS')), 'selection press event new');
    this.selPressEvent = wasm.ghostty_wasm_take_opaque(this.slot);
    this.check(wasm.ghostty_selection_gesture_event_new(0, this.slot, eventType('DRAG')), 'selection drag event new');
    this.selDragEvent = wasm.ghostty_wasm_take_opaque(this.slot);
    this.check(wasm.ghostty_selection_gesture_event_new(0, this.slot, eventType('RELEASE')), 'selection release event new');
    this.selReleaseEvent = wasm.ghostty_wasm_take_opaque(this.slot);
    // the multi-click window rides on the reusable press event (250ms — the
    // classic terminal triple-click cadence)
    this.dv().setBigUint64(this.u64Ptr, 250_000_000n, true);
    this.check(
      wasm.ghostty_selection_gesture_event_set(
        this.selPressEvent,
        this.enumValue('GhosttySelectionGestureEventOption', 'REPEAT_INTERVAL_NS'),
        this.u64Ptr,
      ),
      'REPEAT_INTERVAL_NS set',
    );
    this.selClockNs = 0n;
    this.selLastClick = 0;
    this.dims = { cols, rows };
    this.refreshRenderState();
  }

  free(): void {
    if (!this.alive) return;
    this.teardownTerminal();
    const { wasm } = this;
    wasm.ghostty_wasm_free(this.stylePtr, this.structSize('GhosttyStyle'));
    wasm.ghostty_wasm_free(this.bufPtr, this.structSize('GhosttyBuffer'));
    wasm.ghostty_wasm_free(this.rgbPtr, this.structSize('GhosttyColorRgb'));
    wasm.ghostty_wasm_free(this.colorsPtr, this.structSize('GhosttyRenderStateColors'));
    wasm.ghostty_wasm_free(this.cursorPtr, this.structSize('GhosttyRenderStateCursor'));
    wasm.ghostty_wasm_free(this.lenPtr, 4);
    wasm.ghostty_wasm_free(this.outYPtr, 2);
    wasm.ghostty_wasm_free(this.pointPtr, this.structSize('GhosttyPoint'));
    wasm.ghostty_wasm_free(this.refPtr, this.structSize('GhosttyGridRef'));
    wasm.ghostty_wasm_free(this.viewPtr, this.structSize('GhosttyCellsView'));
    wasm.ghostty_wasm_free(this.scrollPtr, this.structSize('GhosttyTerminalScrollViewport'));
    wasm.ghostty_wasm_free(this.selPtr, this.structSize('GhosttySelection'));
    wasm.ghostty_wasm_free(this.geoPtr, this.structSize('GhosttySelectionGestureGeometry'));
    wasm.ghostty_wasm_free(this.u64Ptr, 8);
    wasm.ghostty_wasm_free(this.boolPtr, 1);
    wasm.ghostty_wasm_free(this.behaviorsPtr, this.structSize('GhosttySelectionGestureBehaviors'));
    wasm.ghostty_wasm_free(this.fmtOptsPtr, this.structSize('GhosttyTerminalSelectionFormatOptions'));
    wasm.ghostty_wasm_free(this.rowSelPtr, this.structSize('GhosttyRenderStateRowSelection'));
    wasm.ghostty_wasm_free_opaque(this.slot);
    this.alive = false;
  }

  private teardownTerminal(): void {
    const { wasm } = this;
    if (this.selReleaseEvent !== 0) { wasm.ghostty_selection_gesture_event_free(this.selReleaseEvent); this.selReleaseEvent = 0; }
    if (this.selDragEvent !== 0) { wasm.ghostty_selection_gesture_event_free(this.selDragEvent); this.selDragEvent = 0; }
    if (this.selPressEvent !== 0) { wasm.ghostty_selection_gesture_event_free(this.selPressEvent); this.selPressEvent = 0; }
    // gesture first while the terminal is still alive (tracked-ref release),
    // per the upstream free contract
    if (this.selGesture !== 0) { wasm.ghostty_selection_gesture_free(this.selGesture, this.term); this.selGesture = 0; }
    if (this.keyEvent !== 0) { wasm.ghostty_key_event_free(this.keyEvent); this.keyEvent = 0; }
    if (this.keyEncoder !== 0) { wasm.ghostty_key_encoder_free(this.keyEncoder); this.keyEncoder = 0; }
    if (this.rowCells !== 0) { wasm.ghostty_render_state_row_cells_free(this.rowCells); this.rowCells = 0; }
    if (this.rowIter !== 0) { wasm.ghostty_render_state_row_iterator_free(this.rowIter); this.rowIter = 0; }
    if (this.renderState !== 0) { wasm.ghostty_render_state_free(this.renderState); this.renderState = 0; }
    if (this.term !== 0) { wasm.ghostty_terminal_free(this.term); this.term = 0; }
  }

  reset(): void {
    this.assertAlive();
    // the gesture's tracked refs do not survive a full terminal reset
    if (this.selGesture !== 0) this.wasm.ghostty_selection_gesture_reset(this.selGesture, this.term);
    this.selClockNs = 0n;
    this.selLastClick = 0;
    this.wasm.ghostty_terminal_reset(this.term);
    this.refreshRenderState();
  }

  resize(cols: number, rows: number): void {
    this.assertAlive();
    this.check(this.wasm.ghostty_terminal_resize(this.term, cols, rows, 0, 0), 'ghostty_terminal_resize');
    this.dims = { cols, rows };
    this.refreshRenderState();
  }

  scrollViewport(lines: number): void {
    this.assertAlive();
    const tag = this.enumValue('GhosttyTerminalScrollViewportTag', 'DELTA');
    const deltaOff = this.fieldOffset('GhosttyTerminalScrollViewport', 'tag')
      + this.fieldOffset('GhosttyTerminalScrollViewportValue', 'delta');
    const size = this.structSize('GhosttyTerminalScrollViewport');
    this.zeroScratch(this.scrollPtr, size);
    const dv = this.dvAt(this.scrollPtr, size);
    dv.setInt32(this.fieldOffset('GhosttyTerminalScrollViewport', 'tag'), tag, true);
    dv.setInt32(deltaOff, lines, true);
    this.wasm.ghostty_terminal_scroll_viewport(this.term, this.scrollPtr);
    this.refreshRenderState();
  }

  // ---- pty output + render reads ----

  vtWrite(bytes: Uint8Array): void {
    this.assertAlive();
    if (bytes.length > 0) {
      const ptr = this.checkedAlloc(bytes.length);
      new Uint8Array(this.memory.buffer).set(bytes, ptr);
      this.wasm.ghostty_terminal_vt_write(this.term, ptr, bytes.length);
      this.wasm.ghostty_wasm_free(ptr, bytes.length);
    }
    this.refreshRenderState();
  }

  private refreshRenderState(): void {
    this.check(this.wasm.ghostty_render_state_update(this.renderState, this.term), 'ghostty_render_state_update');
  }

  *dirtyRows(): IterableIterator<RowSnapshot> {
    this.assertAlive();
    const { wasm } = this;
    const defaults = this.readDefaultColors();
    const rowEnum = this.enumValue('GhosttyRenderStateRowData', 'CELLS');
    const rawEnum = this.enumValue('GhosttyRenderStateRowData', 'CELLS_RAW');
    const selRowEnum = this.enumValue('GhosttyRenderStateRowData', 'SELECTION');
    const NO_VALUE = this.enumValue('GhosttyResult', 'NO_VALUE');
    const rowSelSize = this.structSize('GhosttyRenderStateRowSelection');
    const selStartOff = this.fieldOffset('GhosttyRenderStateRowSelection', 'start_x');
    const selEndOff = this.fieldOffset('GhosttyRenderStateRowSelection', 'end_x');
    const iterEnum = this.enumValue('GhosttyRenderStateData', 'ROW_ITERATOR');
    const linkBit = this.cellBit('hyperlink');
    const cellSize = this.structSize('GhosttyCell');

    // populate (reset) the row iterator for this pass
    this.putSlot(this.rowIter);
    this.check(wasm.ghostty_render_state_get(this.renderState, iterEnum, this.slot), 'ROW_ITERATOR populate');

    while (wasm.ghostty_render_state_row_iterator_next_dirty(this.rowIter, this.outYPtr) !== 0) {
      const y = this.dv().getUint16(this.outYPtr, true);
      // borrowed u64-per-cell view, used only for the hyperlink bit flags
      const rawOk = wasm.ghostty_render_state_row_get(this.rowIter, rawEnum, this.viewPtr);
      let cellsPtr = 0;
      let cellsLen = 0;
      if (rawOk === this.enumValue('GhosttyResult', 'SUCCESS')) {
        const view = this.dvAt(this.viewPtr, this.structSize('GhosttyCellsView'));
        cellsPtr = view.getUint32(this.fieldOffset('GhosttyCellsView', 'ptr'), true);
        cellsLen = view.getUint32(this.fieldOffset('GhosttyCellsView', 'len'), true);
      }

      this.putSlot(this.rowCells);
      this.check(wasm.ghostty_render_state_row_get(this.rowIter, rowEnum, this.slot), 'ROW_DATA_CELLS');

      const cells: CellView[] = [];
      while (wasm.ghostty_render_state_row_cells_next(this.rowCells) !== 0) {
        const cell: CellView = {
          grapheme: this.readGrapheme(),
          style: this.readStyle(defaults),
        };
        const index = cells.length;
        if (cellsPtr !== 0 && index < cellsLen && this.hasCellBit(cellsPtr + index * cellSize, linkBit)) {
          const uri = this.readHyperlinkUri(index, y);
          if (uri !== undefined && uri !== '') cell.hyperlinkUri = uri;
        }
        cells.push(cell);
      }

      // selection span for this row (sized struct; NO_VALUE = unselected)
      let selection: RowSnapshot['selection'];
      this.sizedInit(this.rowSelPtr, 'GhosttyRenderStateRowSelection');
      const selOk = wasm.ghostty_render_state_row_get(this.rowIter, selRowEnum, this.rowSelPtr);
      if (selOk === this.enumValue('GhosttyResult', 'SUCCESS')) {
        const sdv = this.dvAt(this.rowSelPtr, rowSelSize);
        selection = {
          startX: sdv.getUint16(selStartOff, true),
          endX: sdv.getUint16(selEndOff, true),
        };
      } else if (selOk !== NO_VALUE) {
        throw new GhosttyVTError(`row SELECTION query failed: ${selOk}`);
      }
      yield selection === undefined ? { y, cells } : { y, cells, selection };
    }

    // completed pass: mark every dirty layer consumed
    this.check(wasm.ghostty_render_state_clean(this.renderState), 'ghostty_render_state_clean');
  }

  readCursor(): GhosttyCursor | null {
    this.assertAlive();
    const cursorEnum = this.enumValue('GhosttyRenderStateData', 'CURSOR');
    this.sizedInit(this.cursorPtr, 'GhosttyRenderStateCursor');
    const size = this.structSize('GhosttyRenderStateCursor');
    const r = this.wasm.ghostty_render_state_get(this.renderState, cursorEnum, this.cursorPtr);
    if (r !== this.enumValue('GhosttyResult', 'SUCCESS')) {
      throw new GhosttyVTError(`render-state CURSOR query failed: ${r}`);
    }
    const dv = this.dvAt(this.cursorPtr, size);
    const off = (f: string): number => this.fieldOffset('GhosttyRenderStateCursor', f);
    if (dv.getUint8(off('viewport_has_value')) === 0) return null;
    const styleIdx = dv.getUint32(off('visual_style'), true);
    const styles = ['BAR', 'BLOCK', 'UNDERLINE', 'BLOCK_HOLLOW'] as const;
    let style: GhosttyCursor['style'] = 'block';
    for (const name of styles) {
      if (this.enumValue('GhosttyRenderStateCursorVisualStyle', name) === styleIdx) {
        style = name === 'BLOCK_HOLLOW' ? 'block-hollow' : (name.toLowerCase() as GhosttyCursor['style']);
        break;
      }
    }
    // OSC 12 app cursor color piggybacks on the COLORS struct
    let color: string | undefined;
    this.sizedInit(this.colorsPtr, 'GhosttyRenderStateColors');
    const cr = this.wasm.ghostty_render_state_get(
      this.renderState,
      this.enumValue('GhosttyRenderStateData', 'COLORS'),
      this.colorsPtr,
    );
    if (cr === this.enumValue('GhosttyResult', 'SUCCESS')) {
      const cdv = this.dvAt(this.colorsPtr, this.structSize('GhosttyRenderStateColors'));
      if (cdv.getUint8(this.fieldOffset('GhosttyRenderStateColors', 'cursor_has_value')) !== 0) {
        const c = this.fieldOffset('GhosttyRenderStateColors', 'cursor');
        color = this.rgbString(cdv.getUint8(c), cdv.getUint8(c + 1), cdv.getUint8(c + 2));
      }
    }
    return {
      x: dv.getUint16(off('viewport_x'), true),
      y: dv.getUint16(off('viewport_y'), true),
      style,
      visible: dv.getUint8(off('visible')) !== 0,
      blinking: dv.getUint8(off('blinking')) !== 0,
      passwordInput: dv.getUint8(off('password_input')) !== 0,
      wideTail: dv.getUint8(off('wide_tail')) !== 0,
      ...(color !== undefined ? { color } : {}),
    };
  }

  /** default fg/bg strings for this frame (queried once per dirtyRows pass) */
  private readDefaultColors(): { fg: string; bg: string } {
    const colorsEnum = this.enumValue('GhosttyRenderStateData', 'COLORS');
    this.sizedInit(this.colorsPtr, 'GhosttyRenderStateColors');
    const r = this.wasm.ghostty_render_state_get(this.renderState, colorsEnum, this.colorsPtr);
    if (r !== this.enumValue('GhosttyResult', 'SUCCESS')) {
      throw new GhosttyVTError(`render-state COLORS query failed: ${r}`);
    }
    const dv = this.dvAt(this.colorsPtr, this.structSize('GhosttyRenderStateColors'));
    const fg = this.fieldOffset('GhosttyRenderStateColors', 'foreground');
    const bg = this.fieldOffset('GhosttyRenderStateColors', 'background');
    return {
      fg: this.rgbString(dv.getUint8(fg), dv.getUint8(fg + 1), dv.getUint8(fg + 2)),
      bg: this.rgbString(dv.getUint8(bg), dv.getUint8(bg + 1), dv.getUint8(bg + 2)),
    };
  }

  /** GRAPHEMES_UTF8 via the sized GhosttyBuffer: probe for the required size, then decode. */
  private readGrapheme(): string {
    const utf8Enum = this.enumValue('GhosttyRenderStateRowCellsData', 'GRAPHEMES_UTF8');
    const SUCCESS = this.enumValue('GhosttyResult', 'SUCCESS');
    const OUT_OF_SPACE = this.enumValue('GhosttyResult', 'OUT_OF_SPACE');
    const ptrOff = this.fieldOffset('GhosttyBuffer', 'ptr');
    const capOff = this.fieldOffset('GhosttyBuffer', 'cap');
    const lenOff = this.fieldOffset('GhosttyBuffer', 'len');

    this.zeroScratch(this.bufPtr, this.structSize('GhosttyBuffer'));
    let r = this.wasm.ghostty_render_state_row_cells_get(this.rowCells, utf8Enum, this.bufPtr);
    let dv = this.dvAt(this.bufPtr, this.structSize('GhosttyBuffer'));
    const len = dv.getUint32(lenOff, true);
    if (r === SUCCESS) {
      const ptr = dv.getUint32(ptrOff, true);
      return ptr === 0 || len === 0 ? '' : this.decodeBytes(ptr, len);
    }
    if (r !== OUT_OF_SPACE || len === 0) {
      throw new GhosttyVTError(`GRAPHEMES_UTF8 query failed: ${r}`);
    }
    // retry with an exactly-sized caller buffer (free uses the alloc length,
    // decode uses the freshly written length — they can differ)
    const required = len;
    const ptr = this.checkedAlloc(required);
    dv = this.dvAt(this.bufPtr, this.structSize('GhosttyBuffer'));
    dv.setUint32(ptrOff, ptr, true);
    dv.setUint32(capOff, required, true);
    r = this.wasm.ghostty_render_state_row_cells_get(this.rowCells, utf8Enum, this.bufPtr);
    const written = this.dvAt(this.bufPtr, this.structSize('GhosttyBuffer')).getUint32(lenOff, true);
    const text = r === SUCCESS ? this.decodeBytes(ptr, written) : '';
    this.wasm.ghostty_wasm_free(ptr, required);
    if (r !== SUCCESS) {
      throw new GhosttyVTError(`GRAPHEMES_UTF8 retry failed: ${r}`);
    }
    return text;
  }

  private readStyle(defaults: { fg: string; bg: string }): GhosttyStyle {
    const { wasm } = this;
    const styleEnum = this.enumValue('GhosttyRenderStateRowCellsData', 'STYLE');
    const fgEnum = this.enumValue('GhosttyRenderStateRowCellsData', 'FG_COLOR');
    const bgEnum = this.enumValue('GhosttyRenderStateRowCellsData', 'BG_COLOR');
    const SUCCESS = this.enumValue('GhosttyResult', 'SUCCESS');

    this.sizedInit(this.stylePtr, 'GhosttyStyle');
    this.check(wasm.ghostty_render_state_row_cells_get(this.rowCells, styleEnum, this.stylePtr), 'STYLE query');
    const dv = this.dvAt(this.stylePtr, this.structSize('GhosttyStyle'));
    const off = (name: string): number => this.fieldOffset('GhosttyStyle', name);
    const style: GhosttyStyle = {
      bold: dv.getUint8(off('bold')) !== 0,
      italic: dv.getUint8(off('italic')) !== 0,
      underline: dv.getInt32(off('underline'), true),
      reverse: dv.getUint8(off('inverse')) !== 0,
      invisible: dv.getUint8(off('invisible')) !== 0,
    };

    // flattened per-cell colors (content-tag RGB/palette + style colors); fall back to frame defaults
    style.fg = wasm.ghostty_render_state_row_cells_get(this.rowCells, fgEnum, this.rgbPtr) === SUCCESS
      ? this.rgbFromScratch()
      : defaults.fg;
    style.bg = wasm.ghostty_render_state_row_cells_get(this.rowCells, bgEnum, this.rgbPtr) === SUCCESS
      ? this.rgbFromScratch()
      : defaults.bg;
    return style;
  }

  private rgbFromScratch(): string {
    const dv = this.dv();
    return this.rgbString(dv.getUint8(this.rgbPtr), dv.getUint8(this.rgbPtr + 1), dv.getUint8(this.rgbPtr + 2));
  }

  private hasCellBit(cellPtr: number, bit: { lsb: number; width: number }): boolean {
    const value = this.dv().getBigUint64(cellPtr, true);
    const mask = (1n << BigInt(bit.width)) - 1n;
    return ((value >> BigInt(bit.lsb)) & mask) !== 0n;
  }

  private cellBit(name: string): { lsb: number; width: number } {
    const bits = this.typeLayout.types.GhosttyCell?.bits?.[name];
    if (bits === undefined) {
      throw new GhosttyVTError(`type manifest lacks GhosttyCell.bits.${name}`);
    }
    return bits;
  }

  private readHyperlinkUri(x: number, y: number): string | undefined {
    const { wasm } = this;
    const SUCCESS = this.enumValue('GhosttyResult', 'SUCCESS');
    const OUT_OF_SPACE = this.enumValue('GhosttyResult', 'OUT_OF_SPACE');

    // GhosttyPoint { tag: VIEWPORT, value.coordinate { x: u16, y: u32 } } — the
    // wasm build passes this by-pointer even though the C header says by-value.
    const pointSize = this.structSize('GhosttyPoint');
    this.zeroScratch(this.pointPtr, pointSize);
    const pointDv = this.dvAt(this.pointPtr, pointSize);
    const valueOff = this.fieldOffset('GhosttyPoint', 'value');
    pointDv.setInt32(this.fieldOffset('GhosttyPoint', 'tag'), this.enumValue('GhosttyPointTag', 'VIEWPORT'), true);
    pointDv.setUint16(valueOff + this.fieldOffset('GhosttyPointCoordinate', 'x'), x, true);
    pointDv.setUint32(valueOff + this.fieldOffset('GhosttyPointCoordinate', 'y'), y, true);

    this.sizedInit(this.refPtr, 'GhosttyGridRef');
    const refOk = wasm.ghostty_terminal_grid_ref(this.term, this.pointPtr, this.refPtr);
    if (refOk !== SUCCESS) return undefined;
    const refDv = this.dvAt(this.refPtr, this.structSize('GhosttyGridRef'));
    if (refDv.getUint32(this.fieldOffset('GhosttyGridRef', 'node'), true) === 0) return undefined;

    let r = wasm.ghostty_grid_ref_hyperlink_uri(this.refPtr, 0, 0, this.lenPtr);
    const len = this.dv().getUint32(this.lenPtr, true);
    if (r === SUCCESS) return len === 0 ? '' : undefined;
    if (r !== OUT_OF_SPACE || len === 0) return undefined;
    const required = len;
    const ptr = this.checkedAlloc(required);
    r = wasm.ghostty_grid_ref_hyperlink_uri(this.refPtr, ptr, required, this.lenPtr);
    const written = this.dv().getUint32(this.lenPtr, true);
    const uri = r === SUCCESS ? this.decodeBytes(ptr, written) : '';
    wasm.ghostty_wasm_free(ptr, required);
    return uri;
  }

  // ---- input side ----

  keyEncode(event: GhosttyKeyEventLike): Uint8Array {
    this.assertAlive();
    const { wasm } = this;
    const SUCCESS = this.enumValue('GhosttyResult', 'SUCCESS');
    const OUT_OF_SPACE = this.enumValue('GhosttyResult', 'OUT_OF_SPACE');

    const keyName = resolveGhosttyKeyName(event);
    if (keyName === undefined) return new Uint8Array(0);
    const keyValue = this.typeLayout.types.GhosttyKey?.values?.[keyName];
    if (keyValue === undefined) return new Uint8Array(0);

    // keep encoder options in sync with the terminal's live modes
    wasm.ghostty_key_encoder_setopt_from_terminal(this.keyEncoder, this.term);
    wasm.ghostty_key_event_set_action(this.keyEvent, this.enumValue('GhosttyKeyAction', 'PRESS'));
    wasm.ghostty_key_event_set_key(this.keyEvent, keyValue);
    let mods = 0;
    if (event.shiftKey) mods |= MODS_SHIFT;
    if (event.ctrlKey) mods |= MODS_CTRL;
    if (event.altKey) mods |= MODS_ALT;
    if (event.metaKey) mods |= MODS_SUPER;
    wasm.ghostty_key_event_set_mods(this.keyEvent, mods);

    // single printable char: pass the layout text through (never control chars)
    const text = event.key;
    if (text.length === 1 && text.charCodeAt(0) >= 0x20 && text.charCodeAt(0) !== 0x7f) {
      const bytes = this.encodeToScratch(text);
      wasm.ghostty_key_event_set_utf8(this.keyEvent, bytes.ptr, bytes.len);
      wasm.ghostty_wasm_free(bytes.ptr, bytes.len);
    } else {
      wasm.ghostty_key_event_set_utf8(this.keyEvent, 0, 0);
    }

    const probe = wasm.ghostty_key_encoder_encode(this.keyEncoder, this.keyEvent, 0, 0, this.lenPtr);
    const len = this.dv().getUint32(this.lenPtr, true);
    if (len === 0) return new Uint8Array(0);
    if (probe !== SUCCESS && probe !== OUT_OF_SPACE) {
      throw new GhosttyVTError(`key encode probe failed: ${probe}`);
    }
    const ptr = this.checkedAlloc(len);
    const r = wasm.ghostty_key_encoder_encode(this.keyEncoder, this.keyEvent, ptr, len, this.lenPtr);
    const written = this.dv().getUint32(this.lenPtr, true);
    const out = new Uint8Array(this.dv().buffer.slice(ptr, ptr + written));
    wasm.ghostty_wasm_free(ptr, len);
    if (r !== SUCCESS) {
      throw new GhosttyVTError(`key encode failed: ${r}`);
    }
    return out;
  }

  // ---- text selection (owner request 2026-08-28) ---------------------------
  // Field-probed ABI facts this marshaling relies on (see selection-probe):
  //   * ghostty_selection_gesture_event applies an event and RETURNS a
  //     selection snapshot that is NOT installed — we install it through
  //     ghostty_terminal_set(GHOSTTY_TERMINAL_OPT_SELECTION) so the render
  //     state republishes per-row spans and format reads the active selection.
  //   * PRESS yields NO_VALUE for a bare cell anchor (the old selection is
  //     cleared instead) and SUCCESS for word/line behaviors.
  //   * RELEASE always yields NO_VALUE (state update only).
  //   * The upstream click counter is driven by TIME_NS deltas against
  //     REPEAT_INTERVAL_NS, so press() synthesizes a monotonic clock.

  /** rectangle stickiness: a press's rectangle mode carries into its drags */
  private selRectangle = false;

  /** Write a viewport-cell grid ref into refPtr; false when the cell is invalid. */
  private writeViewportRef(x: number, y: number): boolean {
    // GhosttyPoint { tag: VIEWPORT, value.coordinate { x: u16, y: u32 } } — the
    // wasm build passes this by-pointer even though the C header says by-value.
    const pointSize = this.structSize('GhosttyPoint');
    this.zeroScratch(this.pointPtr, pointSize);
    const pointDv = this.dvAt(this.pointPtr, pointSize);
    const valueOff = this.fieldOffset('GhosttyPoint', 'value');
    pointDv.setInt32(this.fieldOffset('GhosttyPoint', 'tag'), this.enumValue('GhosttyPointTag', 'VIEWPORT'), true);
    pointDv.setUint16(valueOff + this.fieldOffset('GhosttyPointCoordinate', 'x'), x, true);
    pointDv.setUint32(valueOff + this.fieldOffset('GhosttyPointCoordinate', 'y'), y, true);
    this.sizedInit(this.refPtr, 'GhosttyGridRef');
    return this.wasm.ghostty_terminal_grid_ref(this.term, this.pointPtr, this.refPtr)
      === this.enumValue('GhosttyResult', 'SUCCESS');
  }

  /** apply a gesture event; on SUCCESS install the snapshot as the active selection */
  private applySelectionEvent(event: number): number {
    const SUCCESS = this.enumValue('GhosttyResult', 'SUCCESS');
    const NO_VALUE = this.enumValue('GhosttyResult', 'NO_VALUE');
    this.sizedInit(this.selPtr, 'GhosttySelection');
    const r = this.wasm.ghostty_selection_gesture_event(this.selGesture, this.term, event, this.selPtr);
    if (r === SUCCESS) {
      this.check(
        this.wasm.ghostty_terminal_set(this.term, this.enumValue('GhosttyTerminalOption', 'SELECTION'), this.selPtr),
        'terminal_set SELECTION',
      );
      this.refreshRenderState();
    } else if (r !== NO_VALUE) {
      throw new GhosttyVTError(`selection gesture event failed: ${r}`);
    }
    return r;
  }

  private setEventU64(event: number, option: string, value: bigint): void {
    this.dv().setBigUint64(this.u64Ptr, value, true);
    this.check(
      this.wasm.ghostty_selection_gesture_event_set(
        event,
        this.enumValue('GhosttySelectionGestureEventOption', option),
        this.u64Ptr,
      ),
      `selection event set ${option}`,
    );
  }

  private setEventBool(event: number, option: string, value: boolean): void {
    this.dv().setUint8(this.boolPtr, value ? 1 : 0);
    this.check(
      this.wasm.ghostty_selection_gesture_event_set(
        event,
        this.enumValue('GhosttySelectionGestureEventOption', option),
        this.boolPtr,
      ),
      `selection event set ${option}`,
    );
  }

  private writeDragGeometry(): void {
    const dv = this.dvAt(this.geoPtr, this.structSize('GhosttySelectionGestureGeometry'));
    const off = (f: string): number => this.fieldOffset('GhosttySelectionGestureGeometry', f);
    dv.setUint32(off('columns'), Math.max(1, this.dims.cols), true);
    // cell_width=1 / padding_left=0: the component feeds CELL coordinates, so
    // the geometry only needs a non-degenerate 1px grid (all-u32, must be non-zero)
    dv.setUint32(off('cell_width'), 1, true);
    dv.setUint32(off('padding_left'), 0, true);
    dv.setUint32(off('screen_height'), Math.max(1, this.dims.rows), true);
    this.check(
      this.wasm.ghostty_selection_gesture_event_set(
        this.selDragEvent,
        this.enumValue('GhosttySelectionGestureEventOption', 'GEOMETRY'),
        this.geoPtr,
      ),
      'selection event set GEOMETRY',
    );
  }

  selection: GhosttySelectionFace = {
    events: {
      press: (x, y, clickCount, opts): void => {
        this.assertAlive();
        if (!this.writeViewportRef(x, y)) return;
        const { wasm } = this;
        const REF = this.enumValue('GhosttySelectionGestureEventOption', 'REF');
        wasm.ghostty_selection_gesture_event_set(this.selPressEvent, REF, this.refPtr);
        wasm.ghostty_selection_gesture_event_set(this.selDragEvent, REF, this.refPtr);

        // synthesize the monotonic clock the upstream counter consumes: a
        // same-sequence click lands 100ms after the previous one (< the 250ms
        // interval); any sequence break jumps a full second past it
        const tier = Math.max(1, Math.min(3, Math.round(clickCount)));
        this.selClockNs += tier === this.selLastClick + 1 && tier > 1 ? 100_000_000n : 1_000_000_000n;
        this.selLastClick = tier;
        this.setEventU64(this.selPressEvent, 'TIME_NS', this.selClockNs);

        // RECTANGLE is a drag/tick-only option (header); press just remembers
        this.selRectangle = opts?.rectangle === true;
        this.setEventBool(this.selDragEvent, 'RECTANGLE', this.selRectangle);

        const behaviors = opts?.behaviors;
        if (behaviors !== undefined) {
          const dv = this.dvAt(this.behaviorsPtr, this.structSize('GhosttySelectionGestureBehaviors'));
          const off = (f: string): number => this.fieldOffset('GhosttySelectionGestureBehaviors', f);
          const map = { cell: 'CELL', word: 'WORD', line: 'LINE', output: 'OUTPUT' } as const;
          dv.setInt32(off('single_click'), this.enumValue('GhosttySelectionGestureBehavior', map[behaviors.singleClick ?? 'cell']), true);
          dv.setInt32(off('double_click'), this.enumValue('GhosttySelectionGestureBehavior', map[behaviors.doubleClick ?? 'word']), true);
          dv.setInt32(off('triple_click'), this.enumValue('GhosttySelectionGestureBehavior', map[behaviors.tripleClick ?? 'line']), true);
          this.check(
            wasm.ghostty_selection_gesture_event_set(
              this.selPressEvent,
              this.enumValue('GhosttySelectionGestureEventOption', 'BEHAVIORS'),
              this.behaviorsPtr,
            ),
            'selection event set BEHAVIORS',
          );
        }

        const r = this.applySelectionEvent(this.selPressEvent);
        if (r === this.enumValue('GhosttyResult', 'NO_VALUE')) {
          // bare cell anchor: a fresh press always retires the old highlight
          this.check(
            wasm.ghostty_terminal_set(this.term, this.enumValue('GhosttyTerminalOption', 'SELECTION'), 0),
            'terminal_set SELECTION clear',
          );
          this.refreshRenderState();
        }
      },

      drag: (x, y): void => {
        this.assertAlive();
        if (!this.writeViewportRef(x, y)) return;
        const { wasm } = this;
        wasm.ghostty_selection_gesture_event_set(
          this.selDragEvent,
          this.enumValue('GhosttySelectionGestureEventOption', 'REF'),
          this.refPtr,
        );
        this.writeDragGeometry();
        this.applySelectionEvent(this.selDragEvent);
      },

      release: (x, y): void => {
        this.assertAlive();
        if (!this.writeViewportRef(x, y)) return;
        const { wasm } = this;
        wasm.ghostty_selection_gesture_event_set(
          this.selReleaseEvent,
          this.enumValue('GhosttySelectionGestureEventOption', 'REF'),
          this.refPtr,
        );
        // RELEASE never yields a selection (NO_VALUE); the established one stays
        const r = wasm.ghostty_selection_gesture_event(this.selGesture, this.term, this.selReleaseEvent, 0);
        if (r !== this.enumValue('GhosttyResult', 'NO_VALUE') && r !== this.enumValue('GhosttyResult', 'SUCCESS')) {
          throw new GhosttyVTError(`selection release failed: ${r}`);
        }
      },
    },

    text: (): string | null => {
      this.assertAlive();
      const { wasm } = this;
      const SUCCESS = this.enumValue('GhosttyResult', 'SUCCESS');
      const NO_VALUE = this.enumValue('GhosttyResult', 'NO_VALUE');
      const optsSize = this.structSize('GhosttyTerminalSelectionFormatOptions');
      this.sizedInit(this.fmtOptsPtr, 'GhosttyTerminalSelectionFormatOptions');
      const dv = this.dvAt(this.fmtOptsPtr, optsSize);
      const off = (f: string): number => this.fieldOffset('GhosttyTerminalSelectionFormatOptions', f);
      dv.setInt32(off('emit'), this.enumValue('GhosttyFormatterFormat', 'PLAIN'), true);
      dv.setUint8(off('unwrap'), 1);
      dv.setUint8(off('trim'), 1);
      dv.setUint32(off('selection'), 0, true); // null = the ACTIVE selection
      const r = wasm.ghostty_terminal_selection_format_alloc(this.term, 0, this.fmtOptsPtr, this.slot, this.lenPtr);
      if (r === NO_VALUE) return null;
      if (r !== SUCCESS) {
        throw new GhosttyVTError(`selection format failed: ${r}`);
      }
      const ptr = wasm.ghostty_wasm_take_opaque(this.slot);
      const len = this.dv().getUint32(this.lenPtr, true);
      if (ptr === 0 || len === 0) return null;
      const text = this.decodeBytes(ptr, len);
      wasm.ghostty_free(0, ptr, len);
      return text;
    },

    clear: (): void => {
      this.assertAlive();
      this.check(
        this.wasm.ghostty_terminal_set(this.term, this.enumValue('GhosttyTerminalOption', 'SELECTION'), 0),
        'terminal_set SELECTION clear',
      );
      this.refreshRenderState();
    },
  };

  paste = {
    isSafe: (text: string): boolean => {
      this.assertAlive();
      const bytes = this.encodeToScratch(text);
      // C bool crosses the wasm boundary as i32 — normalize to a JS boolean
      const safe = this.wasm.ghostty_paste_is_safe(bytes.ptr, bytes.len) !== 0;
      this.wasm.ghostty_wasm_free(bytes.ptr, bytes.len);
      return safe;
    },
    encode: (text: string, bracketed = false): Uint8Array => {
      this.assertAlive();
      const { wasm } = this;
      const SUCCESS = this.enumValue('GhosttyResult', 'SUCCESS');
      const OUT_OF_SPACE = this.enumValue('GhosttyResult', 'OUT_OF_SPACE');
      const bytes = this.encodeToScratch(text);
      // paste_encode rewrites `data` in place (sanitizes control bytes) and
      // copies into buf; worst case growth is the 12-byte bracket pair.
      let cap = bytes.len + 16;
      let out = this.checkedAlloc(cap);
      let r = wasm.ghostty_paste_encode(bytes.ptr, bytes.len, bracketed, out, cap, this.lenPtr);
      let written = this.dv().getUint32(this.lenPtr, true);
      if (r === OUT_OF_SPACE) {
        wasm.ghostty_wasm_free(out, cap);
        cap = written;
        out = this.checkedAlloc(cap);
        // the first call already sanitized `data` in place — re-run as-is
        r = wasm.ghostty_paste_encode(bytes.ptr, bytes.len, bracketed, out, cap, this.lenPtr);
        written = this.dv().getUint32(this.lenPtr, true);
      }
      const result = new Uint8Array(this.dv().buffer.slice(out, out + written));
      wasm.ghostty_wasm_free(out, cap);
      wasm.ghostty_wasm_free(bytes.ptr, bytes.len);
      if (r !== SUCCESS) {
        throw new GhosttyVTError(`paste encode failed: ${r}`);
      }
      return result;
    },
  };

  // ---- snapshot ----

  snapshotEncode(): string {
    this.assertAlive();
    const { wasm } = this;
    this.check(wasm.ghostty_snapshot_encode_alloc(this.term, 0, this.slot, this.lenPtr), 'ghostty_snapshot_encode_alloc');
    const ptr = wasm.ghostty_wasm_take_opaque(this.slot);
    const len = this.dv().getUint32(this.lenPtr, true);
    if (ptr === 0 || len === 0) return '';
    const bytes = new Uint8Array(this.dv().buffer.slice(ptr, ptr + len));
    wasm.ghostty_free(0, ptr, len);
    return bytesToBase64(bytes);
  }

  // ---- marshaling helpers (all layout-driven) ----

  /** fresh DataView over the whole linear memory (exports may grow it) */
  private dv(): DataView {
    return new DataView(this.memory.buffer);
  }

  /** fresh sub-view at a struct pointer, so manifest field offsets apply directly */
  private dvAt(ptr: number, len: number): DataView {
    return new DataView(this.memory.buffer, ptr, len);
  }

  private structSize(name: string): number {
    const entry = this.typeLayout.types[name];
    if (entry === undefined) throw new GhosttyVTError(`type manifest lacks ${name}`);
    return entry.size;
  }

  private fieldOffset(struct: string, field: string): number {
    const offset = this.typeLayout.types[struct]?.fields?.[field]?.offset;
    if (offset === undefined) {
      throw new GhosttyVTError(`type manifest lacks ${struct}.fields.${field}`);
    }
    return offset;
  }

  private enumValue(enumName: string, key: string): number {
    const value = this.typeLayout.types[enumName]?.values?.[key];
    if (value === undefined) {
      throw new GhosttyVTError(`type manifest lacks ${enumName}.values.${key}`);
    }
    return value;
  }

  private check(result: number, what: string): void {
    if (result !== this.enumValue('GhosttyResult', 'SUCCESS')) {
      throw new GhosttyVTError(`${what} failed with result ${result}`);
    }
  }

  private checkedAlloc(len: number): number {
    const ptr = this.wasm.ghostty_wasm_alloc(len);
    if (ptr === 0) throw new GhosttyVTError(`ghostty_wasm_alloc(${len}) returned NULL`);
    return ptr;
  }

  private checkedAllocOpaque(): number {
    const ptr = this.wasm.ghostty_wasm_alloc_opaque();
    if (ptr === 0) throw new GhosttyVTError('ghostty_wasm_alloc_opaque returned NULL');
    return ptr;
  }

  /** store a handle into the reusable opaque out-slot (C: `slot = handle`) */
  private putSlot(handle: number): void {
    this.dv().setUint32(this.slot, handle, true);
  }

  private zeroScratch(ptr: number, len: number): DataView {
    new Uint8Array(this.memory.buffer, ptr, len).fill(0);
    return this.dv();
  }

  /** sized-struct ABI: write struct.size at offset 0 before a query */
  private sizedInit(ptr: number, struct: string): void {
    this.dv().setUint32(ptr, this.structSize(struct), true);
  }

  private decodeCString(ptr: number): string {
    const bytes = new Uint8Array(this.memory.buffer);
    let end = ptr;
    while (end < bytes.length && bytes[end] !== 0) end++;
    return new TextDecoder().decode(bytes.subarray(ptr, end));
  }

  private decodeBytes(ptr: number, len: number): string {
    return new TextDecoder().decode(new Uint8Array(this.memory.buffer, ptr, len));
  }

  private encodeToScratch(text: string): { ptr: number; len: number } {
    const bytes = new TextEncoder().encode(text);
    const ptr = this.checkedAlloc(bytes.length);
    new Uint8Array(this.memory.buffer).set(bytes, ptr);
    return { ptr, len: bytes.length };
  }

  private rgbString(r: number, g: number, b: number): string {
    return `rgb(${r}, ${g}, ${b})`;
  }

  private assertAlive(): void {
    if (!this.alive) {
      throw new GhosttyVTError('GhosttyVT instance was freed — create a new one via loadGhosttyVT()');
    }
  }
}

// ---------------------------------------------------------------------------
// KeyboardEvent → GhosttyKey name resolution (values stay manifest-driven)
// ---------------------------------------------------------------------------

const KEY_NAME_BY_KEY: Readonly<Record<string, string>> = {
  ' ': 'SPACE',
  Spacebar: 'SPACE',
};

function camelToScreamingSnake(name: string): string | undefined {
  if (name.length === 0) return undefined;
  let out = '';
  for (let i = 0; i < name.length; i++) {
    const ch = name[i]!;
    if (i > 0 && (/[a-z0-9]/.test(name[i - 1]!) && /[A-Z0-9]/.test(ch))) {
      out += '_';
      out += ch.toUpperCase();
    } else {
      out += ch.toUpperCase();
    }
  }
  return out;
}

/**
 * Resolve the GhosttyKey enum NAME for an event (W3C `code` preferred,
 * falling back to `key`). Returns undefined when nothing identifiable
 * remains (bare modifiers, dead keys, unmapped media keys).
 */
function resolveGhosttyKeyName(event: GhosttyKeyEventLike): string | undefined {
  const code = event.code;
  if (code !== undefined && code !== '') {
    let name: string | undefined;
    if (/^Key[A-Z]$/.test(code)) name = code.slice(3);
    else if (/^Digit\d$/.test(code)) name = `DIGIT_${code.slice(5)}`;
    else if (/^Numpad\d$/.test(code)) name = `NUMPAD_${code.slice(6)}`;
    else name = camelToScreamingSnake(code);
    if (name !== undefined && name !== '') return name;
  }
  const key = event.key;
  if (key === undefined || key === '') return undefined;
  if (KEY_NAME_BY_KEY[key] !== undefined) return KEY_NAME_BY_KEY[key];
  if (/^[a-z]$/i.test(key)) return key.toUpperCase();
  if (/^[0-9]$/.test(key)) return `DIGIT_${key}`;
  if (/^F\d{1,2}$/.test(key)) return key.toUpperCase();
  if (key.length === 1) return undefined; // printable punctuation needs a real `code`
  return camelToScreamingSnake(key);
}

// ---------------------------------------------------------------------------
// base64 (dependency-free; browser + node)
// ---------------------------------------------------------------------------

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = i + 1 < bytes.length ? bytes[i + 1]! : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2]! : 0;
    const trip = (b0 << 16) | (b1 << 8) | b2;
    out += BASE64_ALPHABET[(trip >> 18) & 63];
    out += BASE64_ALPHABET[(trip >> 12) & 63];
    out += i + 1 < bytes.length ? BASE64_ALPHABET[(trip >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? BASE64_ALPHABET[trip & 63] : '=';
  }
  return out;
}

// ---------------------------------------------------------------------------
// loader
// ---------------------------------------------------------------------------

async function instantiateBytes(bytes: Uint8Array): Promise<WebAssembly.Instance> {
  try {
    // ghostty-vt imports nothing (imports = [] in both variants), so the
    // import object is empty. The constructor copy pins the element buffer
    // to a plain ArrayBuffer (WebAssembly.compile's BufferSource) and also
    // freezes the module bytes against caller-side mutation.
    const module = await WebAssembly.compile(new Uint8Array(bytes));
    return await WebAssembly.instantiate(module, {});
  } catch (cause) {
    throw new GhosttyVTError(
      'ghostty-vt wasm instantiation failed (missing simd128 or a corrupt asset?)',
      { cause },
    );
  }
}

/**
 * Load and bind a ghostty-vt wasm module. Exactly one of `bytes` / `url`
 * must be provided (`variant` is a diagnostic label). Streaming
 * instantiation is attempted first for URLs and falls back to a buffered
 * instantiate; failures raise GhosttyVTError with `cause`.
 */
export async function loadGhosttyVT(opts: LoadGhosttyVTOpts = {}): Promise<GhosttyVT> {
  const variant = opts.variant ?? 'full';
  if (opts.bytes !== undefined) {
    return new GhosttyVTCore(await instantiateBytes(opts.bytes), variant);
  }
  if (opts.url === undefined) {
    throw new GhosttyVTError('loadGhosttyVT: provide either bytes or url');
  }
  let bytes: Uint8Array;
  try {
    // streaming first (double-compile avoided); any mismatch (e.g. a
    // non-application/wasm content type) falls back to the buffered path.
    // The clone is taken BEFORE any body consumption: instantiateStreaming
    // may reject only after disturbing the stream, and re-reading the
    // consumed response would throw "body already read" — the pristine
    // clone is what the fallback compiles.
    const response = await fetch(opts.url);
    if (!response.ok) {
      throw new GhosttyVTError(`fetch ${opts.url} -> HTTP ${response.status}`);
    }
    const buffered = response.clone();
    try {
      const imports: WebAssembly.Imports = {};
      const { instance } = await WebAssembly.instantiateStreaming(response, imports);
      return new GhosttyVTCore(instance, variant);
    } catch {
      bytes = new Uint8Array(await buffered.arrayBuffer());
    }
  } catch (cause) {
    throw new GhosttyVTError(`ghostty-vt wasm could not be loaded from ${opts.url}`, { cause });
  }
  return new GhosttyVTCore(await instantiateBytes(bytes), variant);
}

// ---------------------------------------------------------------------------
// xterm.js-convention facade (owner directive 2026-08-28)
// ---------------------------------------------------------------------------
// A thin `Terminal` shaped after xterm.js / coder's ghostty-web conventions,
// layered ON TOP of the frozen GhosttyVT ABI surface above (the core and all
// marshaling are untouched — this layer only orchestrates the core face):
//
//   xterm convention    | direction        | core face
//   write/writeln       | pty OUTPUT in    | vtWrite
//   onData / handleKey  | pty INPUT out    | keyEncode (+ latin1 replay)
//   paste               | pty INPUT out    | paste.isSafe + paste.encode
//   resize/reset/clear  | VT control       | resize / reset / vtWrite(ED)
//   scrollLines         | viewport control | scrollViewport
//   getSelection/...    | selection reads  | selection.text / clear
//   dirtyRows/readCursor| renderer EXT (non-xterm, documented): the
//                       | component's paint loop consumes these directly.
//
// The onData channel carries pty bytes as a latin1 STRING (xterm's onData
// gives strings); the byte-preserving round trip is
// Uint8Array.from(str, c => c.charCodeAt(0) & 0xff).
//
// Reserved (accepted, advisory, unused in V1): cursorBlink / cursorStyle
// (consumers render blink; undefined = follow the app via DECSCUSR) and
// scrollback (upstream owns the scrollback). onCursorMove is likewise
// reserved — consumers poll readCursor() from their paint loop in V1.

export interface IDisposable {
  dispose(): void;
}

export type TerminalEventHandler<T> = (value: T) => void;

export interface ITerminalOptions {
  /** initial columns (default 80). */
  cols?: number;
  /** initial rows (default 24). */
  rows?: number;
  /** advisory: consumers render blink; undefined = follow the app (DECSCUSR). reserved V1. */
  cursorBlink?: boolean;
  /** advisory, same follow semantics as cursorBlink. reserved V1. */
  cursorStyle?: 'block' | 'underline' | 'bar';
  /** advisory V1 (upstream owns scrollback). reserved. */
  scrollback?: number;
  /**
   * Bypass the module-level shared core (test isolation; ghostty-web's
   * `ghostty` option precedent). The caller keeps ownership of an injected
   * core — Terminal.dispose() never frees it.
   */
  core?: GhosttyVT;
}

/** module-level shared wasm instance (ghostty-web's init() pattern). */
let sharedCore: GhosttyVT | null = null;
let sharedInit: Promise<void> | null = null;

/**
 * Load (once) and cache the shared wasm core for `new Terminal()` without an
 * explicit `core` option. The facade never imports a virtual module — pass
 * the asset url (the component layer owns virtual-module resolution) or raw
 * bytes. Idempotent while the shared core lives; a failed load clears the
 * slot so a retry is possible.
 */
export function init(opts: LoadGhosttyVTOpts = {}): Promise<void> {
  sharedInit ??= loadGhosttyVT(opts)
    .then((core) => {
      sharedCore = core;
    })
    .catch((cause: unknown) => {
      sharedInit = null;
      throw cause;
    });
  return sharedInit;
}

/** latin1 channel: bytes → string, one char code per byte (byte-preserving). */
function bytesToLatin1(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) out += String.fromCharCode(byte);
  return out;
}

export class Terminal {
  /**
   * Renderer-facing escape hatch to the frozen ABI surface (documented
   * NON-xterm extension): selection gesture events, paste.isSafe, and
   * snapshotEncode have no xterm.js counterpart, so consumers reach them
   * through the underlying core instead of the facade duplicating them.
   */
  readonly core: GhosttyVT;
  /** advisory only (reserved V1; follow-the-app is the default). */
  readonly cursorBlink: boolean | undefined;
  /** advisory only (reserved V1; follow-the-app is the default). */
  readonly cursorStyle: ITerminalOptions['cursorStyle'];
  /** advisory only (reserved V1; upstream owns scrollback). */
  readonly scrollback: number | undefined;

  private cols_: number;
  private rows_: number;
  private readonly dataHandlers = new Set<TerminalEventHandler<string>>();
  private readonly resizeHandlers = new Set<TerminalEventHandler<{ cols: number; rows: number }>>();
  private disposed = false;

  constructor(options: ITerminalOptions = {}) {
    const core = options.core ?? sharedCore;
    if (core === null) {
      throw new GhosttyVTError(
        'Terminal: no wasm core — await init({ url | bytes }) first, or pass options.core (e.g. for test isolation)',
      );
    }
    this.core = core;
    this.cursorBlink = options.cursorBlink;
    this.cursorStyle = options.cursorStyle;
    this.scrollback = options.scrollback;
    this.cols_ = Math.max(1, Math.round(options.cols ?? 80));
    this.rows_ = Math.max(1, Math.round(options.rows ?? 24));
    // establish the requested grid (recreates the terminal on an injected
    // core — wrap a fresh core, not one with content worth keeping)
    this.core.new(this.cols_, this.rows_);
  }

  get cols(): number {
    return this.cols_;
  }

  get rows(): number {
    return this.rows_;
  }

  /**
   * Pty OUTPUT in (xterm convention: data from the host process). The
   * callback fires on a microtask after the write — an approximation of
   * xterm's async write acknowledgment, good enough for sequencing tests.
   */
  write(data: string | Uint8Array, callback?: () => void): void {
    this.assertLive('write');
    this.core.vtWrite(typeof data === 'string' ? new TextEncoder().encode(data) : data);
    if (callback !== undefined) queueMicrotask(callback);
  }

  /** write(data + '\n') (xterm's writeln appends a line feed). */
  writeln(data: string | Uint8Array, callback?: () => void): void {
    if (typeof data === 'string') {
      this.write(`${data}\n`, callback);
      return;
    }
    const withNewline = new Uint8Array(data.length + 1);
    withNewline.set(data);
    withNewline[data.length] = 0x0a;
    this.write(withNewline, callback);
  }

  /**
   * Sanitized pty INPUT via the paste gate (xterm's paste triggers the data
   * event): unsafe text — newlines / the bracketed-paste end marker — is
   * dropped, safe text is sanitized and replayed to the onData subscribers.
   * (Deviation: V1 emits the unbracketed bytes; bracketing belongs to the
   * consumer that knows the pty's mode.)
   */
  paste(text: string): void {
    this.assertLive('paste');
    if (!this.core.paste.isSafe(text)) return;
    this.emitData(bytesToLatin1(this.core.paste.encode(text)));
  }

  resize(cols: number, rows: number): void {
    this.assertLive('resize');
    const nextCols = Math.max(1, Math.round(cols));
    const nextRows = Math.max(1, Math.round(rows));
    const changed = nextCols !== this.cols_ || nextRows !== this.rows_;
    this.cols_ = nextCols;
    this.rows_ = nextRows;
    this.core.resize(nextCols, nextRows);
    if (changed) {
      const detail = { cols: nextCols, rows: nextRows };
      for (const handler of [...this.resizeHandlers]) handler(detail);
    }
  }

  /** Full reset (RIS). */
  reset(): void {
    this.assertLive('reset');
    this.core.reset();
  }

  /** Erase display + cursor home (\x1b[2J\x1b[H — xterm's clear()). */
  clear(): void {
    this.assertLive('clear');
    this.core.vtWrite(new TextEncoder().encode('\x1b[2J\x1b[H'));
  }

  /** Scroll the viewport by `lines` (negative scrolls up, into scrollback). */
  scrollLines(lines: number): void {
    this.assertLive('scrollLines');
    this.core.scrollViewport(lines);
  }

  /**
   * Keyboard INPUT out (xterm onData: pty bytes as a latin1 string).
   * Multiple subscribers; each subscription is independently disposable.
   */
  onData(handler: TerminalEventHandler<string>): IDisposable {
    this.dataHandlers.add(handler);
    return { dispose: () => this.dataHandlers.delete(handler) };
  }

  onResize(handler: TerminalEventHandler<{ cols: number; rows: number }>): IDisposable {
    this.resizeHandlers.add(handler);
    return { dispose: () => this.resizeHandlers.delete(handler) };
  }

  /**
   * KeyboardEvent → pty bytes (returns them AND replays them as a latin1
   * string to the onData subscribers — xterm's data event rides the key
   * handler). Empty bytes (bare modifiers) reach no subscriber.
   */
  handleKey(event: GhosttyKeyEventLike): Uint8Array {
    this.assertLive('handleKey');
    const bytes = this.core.keyEncode(event);
    if (bytes.length > 0) this.emitData(bytesToLatin1(bytes));
    return bytes;
  }

  /** Active selection text, PLAIN + unwrapped + trimmed (xterm's getSelection). */
  getSelection(): string | undefined {
    this.assertLive('getSelection');
    return this.core.selection.text() ?? undefined;
  }

  hasSelection(): boolean {
    this.assertLive('hasSelection');
    const text = this.core.selection.text();
    return text !== null && text !== '';
  }

  clearSelection(): void {
    this.assertLive('clearSelection');
    this.core.selection.clear();
  }

  /** renderer-facing extension (non-xterm): the component's paint loop. */
  dirtyRows(): IterableIterator<RowSnapshot> {
    this.assertLive('dirtyRows');
    return this.core.dirtyRows();
  }

  /** renderer-facing extension (non-xterm): the cursor overlay. */
  readCursor(): GhosttyCursor | null {
    this.assertLive('readCursor');
    return this.core.readCursor();
  }

  /**
   * Unbind the event registries. Ownership rule: the facade NEVER frees a
   * core in V1 — an injected core belongs to the consumer, and the init()
   * shared core may serve other Terminals. Releasing wasm memory stays with
   * whoever created the core (component onDestroy / the test).
   */
  dispose(): void {
    this.disposed = true;
    this.dataHandlers.clear();
    this.resizeHandlers.clear();
  }

  private emitData(value: string): void {
    for (const handler of [...this.dataHandlers]) handler(value);
  }

  private assertLive(what: string): void {
    if (this.disposed) {
      throw new GhosttyVTError(`Terminal.${what} called after dispose`);
    }
  }
}

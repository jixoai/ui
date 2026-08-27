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

  // one reusable opaque out-slot (wasm.h: a single slot serves every constructor)
  private readonly slot: number;

  // persistent scratch (allocated once per instance, freed in free())
  private readonly stylePtr: number;
  private readonly bufPtr: number;
  private readonly rgbPtr: number;
  private readonly colorsPtr: number;
  private readonly lenPtr: number;
  private readonly outYPtr: number;
  private readonly pointPtr: number;
  private readonly refPtr: number;
  private readonly viewPtr: number;
  private readonly scrollPtr: number;

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
    this.lenPtr = this.checkedAlloc(4);
    this.outYPtr = this.checkedAlloc(2);
    this.pointPtr = this.checkedAlloc(size('GhosttyPoint'));
    this.refPtr = this.checkedAlloc(size('GhosttyGridRef'));
    this.viewPtr = this.checkedAlloc(size('GhosttyCellsView'));
    this.scrollPtr = this.checkedAlloc(size('GhosttyTerminalScrollViewport'));

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
    wasm.ghostty_wasm_free(this.lenPtr, 4);
    wasm.ghostty_wasm_free(this.outYPtr, 2);
    wasm.ghostty_wasm_free(this.pointPtr, this.structSize('GhosttyPoint'));
    wasm.ghostty_wasm_free(this.refPtr, this.structSize('GhosttyGridRef'));
    wasm.ghostty_wasm_free(this.viewPtr, this.structSize('GhosttyCellsView'));
    wasm.ghostty_wasm_free(this.scrollPtr, this.structSize('GhosttyTerminalScrollViewport'));
    wasm.ghostty_wasm_free_opaque(this.slot);
    this.alive = false;
  }

  private teardownTerminal(): void {
    const { wasm } = this;
    if (this.keyEvent !== 0) { wasm.ghostty_key_event_free(this.keyEvent); this.keyEvent = 0; }
    if (this.keyEncoder !== 0) { wasm.ghostty_key_encoder_free(this.keyEncoder); this.keyEncoder = 0; }
    if (this.rowCells !== 0) { wasm.ghostty_render_state_row_cells_free(this.rowCells); this.rowCells = 0; }
    if (this.rowIter !== 0) { wasm.ghostty_render_state_row_iterator_free(this.rowIter); this.rowIter = 0; }
    if (this.renderState !== 0) { wasm.ghostty_render_state_free(this.renderState); this.renderState = 0; }
    if (this.term !== 0) { wasm.ghostty_terminal_free(this.term); this.term = 0; }
  }

  reset(): void {
    this.assertAlive();
    this.wasm.ghostty_terminal_reset(this.term);
    this.refreshRenderState();
  }

  resize(cols: number, rows: number): void {
    this.assertAlive();
    this.check(this.wasm.ghostty_terminal_resize(this.term, cols, rows, 0, 0), 'ghostty_terminal_resize');
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
      yield { y, cells };
    }

    // completed pass: mark every dirty layer consumed
    this.check(wasm.ghostty_render_state_clean(this.renderState), 'ghostty_render_state_clean');
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
    // non-application/wasm content type) falls back to the buffered path
    const response = await fetch(opts.url);
    if (!response.ok) {
      throw new GhosttyVTError(`fetch ${opts.url} -> HTTP ${response.status}`);
    }
    try {
      const imports: WebAssembly.Imports = {};
      const { instance } = await WebAssembly.instantiateStreaming(response, imports);
      return new GhosttyVTCore(instance, variant);
    } catch {
      bytes = new Uint8Array(await response.arrayBuffer());
    }
  } catch (cause) {
    throw new GhosttyVTError(`ghostty-vt wasm could not be loaded from ${opts.url}`, { cause });
  }
  return new GhosttyVTCore(await instantiateBytes(bytes), variant);
}

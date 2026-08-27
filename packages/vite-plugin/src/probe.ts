// jixoai-ghostty-probe: ABI sentinel for the pinned ghostty-vt wasm.
//
// Intents (orthogonal count: 3):
//   1. `probeGhosttyWasm(bytes)` — the five frozen check faces from
//      design.md D2: WebAssembly.validate; required-export superset;
//      empty import face (contract for the binding layer's `{}`
//      instantiation); an instantiate + marshalling smoke driven entirely
//      by ghostty_type_json (zero hardcoded offsets); simd128 as a
//      compile-level probe (engines without simd128 reject the module).
//   2. The `jixoai-ghostty-probe` bin: --wasm/--variant/--json emitting
//      the pin fragment {variant, sha256, size, buildInfo} on stdout,
//      non-zero exit + named reason on stderr.
//   3. Layout-driven marshalling helpers (memory views are re-acquired
//      after every allocation — wasm memory growth detaches old views).
//
// Owner original demand: 2026-08-28 "ghostty-term / packages/vite-plugin".

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

export interface ProbeResult {
  /** ghostty_build_info VERSION_STRING, read from the wasm itself */
  buildInfo: string;
  exportCount: number;
  importCount: number;
}

export class GhosttyProbeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GhosttyProbeError';
  }
}

/** C-string scan cap: the type manifest and build info are far below this;
 * a missing NUL must fail loudly, not walk off the linear memory. */
export const MAX_C_STR_BYTES = 1 << 20; // 1 MiB

/**
 * Read a NUL-terminated string out of a memory view, bounded by both the
 * view length and MAX_C_STR_BYTES. Throws GhosttyProbeError when the
 * string is unterminated within those bounds (prevents the unbounded
 * scan-forever loop of `while (mem[end] !== 0)` past the buffer).
 */
export function readCString(mem: Uint8Array, ptr: number, decoder: TextDecoder): string {
  if (!Number.isInteger(ptr) || ptr < 0 || ptr >= mem.length) {
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] UNTERMINATED C STRING — ptr ${ptr} is outside linear memory [0, ${mem.length})`,
    );
  }
  const hardEnd = Math.min(mem.length, ptr + MAX_C_STR_BYTES);
  let end = ptr;
  while (end < hardEnd && mem[end] !== 0) end += 1;
  if (end === hardEnd) {
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] UNTERMINATED C STRING — no NUL byte within ${MAX_C_STR_BYTES} bytes (or before the end of linear memory) from ptr ${ptr}`,
    );
  }
  return decoder.decode(mem.subarray(ptr, end));
}

/**
 * Required export families (superset assertion). Everything the binding
 * layer and the smoke below touch; upstream dropping any of these is an
 * ABI break and must fail the probe.
 */
const REQUIRED_EXPORTS: readonly string[] = [
  'memory',
  'ghostty_free',
  // terminal (vt) family
  'ghostty_terminal_new',
  'ghostty_terminal_free',
  'ghostty_terminal_resize',
  'ghostty_terminal_vt_write',
  // render_state family
  'ghostty_render_state_new',
  'ghostty_render_state_free',
  'ghostty_render_state_update',
  'ghostty_render_state_begin_update',
  'ghostty_render_state_end_update',
  'ghostty_render_state_clean',
  'ghostty_render_state_get',
  'ghostty_render_state_row_iterator_new',
  'ghostty_render_state_row_iterator_next',
  'ghostty_render_state_row_iterator_next_dirty',
  'ghostty_render_state_row_iterator_free',
  'ghostty_render_state_row_get',
  'ghostty_render_state_row_cells_new',
  'ghostty_render_state_row_cells_next',
  'ghostty_render_state_row_cells_select',
  'ghostty_render_state_row_cells_get',
  'ghostty_render_state_row_cells_free',
  // key encoder family
  'ghostty_key_encoder_new',
  'ghostty_key_encoder_free',
  'ghostty_key_encoder_setopt',
  'ghostty_key_encoder_setopt_from_terminal',
  'ghostty_key_encoder_encode',
  'ghostty_key_event_new',
  'ghostty_key_event_free',
  'ghostty_key_event_set_action',
  'ghostty_key_event_set_key',
  'ghostty_key_event_set_mods',
  'ghostty_paste_is_safe',
  // reflection / build identity / wasm marshalling
  'ghostty_build_info',
  'ghostty_type_json',
  'ghostty_wasm_alloc',
  'ghostty_wasm_free',
  'ghostty_wasm_alloc_opaque',
  'ghostty_wasm_free_opaque',
  'ghostty_wasm_take_opaque',
];

interface WasmExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  ghostty_type_json(): number;
  ghostty_build_info(data: number, out: number): number;
  ghostty_wasm_alloc(len: number): number;
  ghostty_wasm_free(ptr: number, len: number): void;
  ghostty_wasm_alloc_opaque(): number;
  ghostty_wasm_free_opaque(slot: number): void;
  ghostty_wasm_take_opaque(slot: number): number;
  ghostty_terminal_new(alloc: number, slot: number, cols: number, rows: number): number;
  ghostty_terminal_free(term: number): void;
  ghostty_terminal_vt_write(term: number, ptr: number, len: number): void;
  ghostty_render_state_new(alloc: number, slot: number): number;
  ghostty_render_state_free(state: number): void;
  ghostty_render_state_update(state: number, term: number): number;
  ghostty_render_state_get(state: number, data: number, out: number): number;
  ghostty_render_state_row_iterator_new(alloc: number, slot: number): number;
  ghostty_render_state_row_iterator_next_dirty(iter: number, outY: number): number;
  ghostty_render_state_row_iterator_free(iter: number): void;
  ghostty_render_state_row_get(iter: number, data: number, out: number): number;
  ghostty_render_state_row_cells_new(alloc: number, slot: number): number;
  ghostty_render_state_row_cells_next(cells: number): number;
  ghostty_render_state_row_cells_get(cells: number, data: number, out: number): number;
  ghostty_render_state_row_cells_free(cells: number): void;
  ghostty_key_encoder_new(alloc: number, slot: number): number;
  ghostty_key_encoder_free(encoder: number): void;
  ghostty_key_encoder_setopt_from_terminal(encoder: number, term: number): void;
  ghostty_key_encoder_encode(
    encoder: number,
    event: number,
    outBuf: number,
    outBufSize: number,
    outLen: number,
  ): number;
  ghostty_key_event_new(alloc: number, slot: number): number;
  ghostty_key_event_free(event: number): void;
  ghostty_key_event_set_action(event: number, action: number): void;
  ghostty_key_event_set_key(event: number, key: number): void;
  ghostty_paste_is_safe(ptr: number, len: number): number;
}

interface TypeField {
  offset: number;
  size: number;
  type: string | { type?: string; [k: string]: unknown };
}

interface TypeLayout {
  schema: number;
  abi: { usize_size: number };
  types: Record<
    string,
    {
      kind: string;
      size: number;
      fields?: Record<string, TypeField>;
      values?: Record<string, number>;
    }
  >;
}

/**
 * Fresh-view accessor bundle. NEVER cache Uint8Array/DataView across an
 * allocation: memory growth detaches the backing ArrayBuffer.
 */
class Wasm {
  readonly e: WasmExports;
  private readonly text = new TextDecoder();
  private readonly encoder = new TextEncoder();

  constructor(instance: WebAssembly.Instance) {
    const e = instance.exports as WasmExports;
    if (typeof e.ghostty_type_json !== 'function' || !(e.memory instanceof WebAssembly.Memory)) {
      throw new GhosttyProbeError('[jixoai-ghostty-probe] EXPORT SHAPE — memory or reflection exports missing');
    }
    this.e = e;
  }

  private u8(): Uint8Array {
    return new Uint8Array(this.e.memory.buffer);
  }

  private dv(): DataView {
    return new DataView(this.e.memory.buffer);
  }

  readCStr(ptr: number): string {
    return readCString(this.u8(), ptr, this.text);
  }

  readUsize(ptr: number, usizeSize: number): number {
    const dv = this.dv();
    return usizeSize === 4 ? dv.getUint32(ptr, true) : Number(dv.getBigUint64(ptr, true));
  }

  writeBytes(ptr: number, bytes: Uint8Array): void {
    this.u8().set(bytes, ptr);
  }

  encodeUtf8(s: string): Uint8Array {
    return this.encoder.encode(s);
  }

  alloc(len: number): number {
    const ptr = this.e.ghostty_wasm_alloc(len);
    if (ptr === 0 && len > 0) {
      throw new GhosttyProbeError(`[jixoai-ghostty-probe] OUT OF MEMORY — wasm_alloc(${len}) returned NULL`);
    }
    return ptr;
  }

  free(ptr: number, len: number): void {
    this.e.ghostty_wasm_free(ptr, len);
  }

  allocSlot(): number {
    const slot = this.e.ghostty_wasm_alloc_opaque();
    if (slot === 0) {
      throw new GhosttyProbeError('[jixoai-ghostty-probe] OUT OF MEMORY — wasm_alloc_opaque returned NULL');
    }
    return slot;
  }

  /** Take the handle out of a slot and free the slot itself. */
  takeSlot(slot: number): number {
    const handle = this.e.ghostty_wasm_take_opaque(slot);
    this.e.ghostty_wasm_free_opaque(slot);
    if (handle === 0) {
      throw new GhosttyProbeError('[jixoai-ghostty-probe] NULL HANDLE — constructor wrote NULL into the out slot');
    }
    return handle;
  }

  writeHandle(ptr: number, handle: number): void {
    this.dv().setUint32(ptr, handle, true);
  }
}

function layoutValue(wasm: Wasm, json: string): TypeLayout {
  let layout: TypeLayout;
  try {
    layout = JSON.parse(json) as TypeLayout;
  } catch (err) {
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] TYPE_JSON — ghostty_type_json did not return JSON (${(err as Error).message})`,
    );
  }
  if (typeof layout.schema !== 'number') {
    throw new GhosttyProbeError('[jixoai-ghostty-probe] TYPE_JSON — missing numeric schema field');
  }
  if (layout.abi?.usize_size !== 4 && layout.abi?.usize_size !== 8) {
    throw new GhosttyProbeError('[jixoai-ghostty-probe] TYPE_JSON — abi.usize_size must be 4 or 8');
  }
  return layout;
}

function enumValue(layout: TypeLayout, typeName: string, valueName: string, what: string): number {
  const type = layout.types[typeName];
  const value = type?.values?.[valueName];
  if (typeof value !== 'number') {
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] TYPE_JSON — ${typeName}.${valueName} missing (${what}) — upstream ABI manifest drift`,
    );
  }
  return value;
}

function fieldOffset(layout: TypeLayout, typeName: string, fieldName: string, what: string): { offset: number; size: number } {
  const field = layout.types[typeName]?.fields?.[fieldName];
  if (field === undefined) {
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] TYPE_JSON — ${typeName}.${fieldName} missing (${what}) — upstream ABI manifest drift`,
    );
  }
  return { offset: field.offset, size: field.size };
}

function step<T>(name: string, fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    if (err instanceof GhosttyProbeError) throw err;
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] ABI SMOKE FAILED at ${name} — ${(err as Error).message}`,
    );
  }
}

/**
 * Probe the wasm bytes. Throws GhosttyProbeError with a named reason on
 * any failure; returns buildInfo (from ghostty_build_info) plus face
 * counts on success.
 */
export function probeGhosttyWasm(bytes: Uint8Array<ArrayBuffer>): ProbeResult {
  // (1) validation — also the simd128 story for incapable engines is a
  // compile failure surfaced at step 2 with the engine's own message.
  if (!WebAssembly.validate(bytes)) {
    throw new GhosttyProbeError(
      '[jixoai-ghostty-probe] INVALID WASM — WebAssembly.validate rejected the bytes (truncated or corrupted file?)',
    );
  }

  // (2) compile — CompileError here is the simd128 probe (among others).
  let module: WebAssembly.Module;
  try {
    module = new WebAssembly.Module(bytes);
  } catch (err) {
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] COMPILE FAILED — the engine refused to compile the module (${(err as Error).message}); engines without simd128 reject ghostty-vt builds`,
    );
  }

  // (3) import face — the binding layer instantiates with {}; any import
  // is an ABI contract break.
  const imports = WebAssembly.Module.imports(module);
  if (imports.length > 0) {
    const first = imports[0]!;
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] IMPORT FACE CHANGED — expected zero imports (binding layer instantiates with {}), found ${imports.length} (first: ${first.module}.${first.name} ${first.kind}) — upstream ABI break`,
    );
  }

  // (4) export face — superset assertion.
  const exportNames = new Set(WebAssembly.Module.exports(module).map((x) => x.name));
  const missing = REQUIRED_EXPORTS.filter((name) => !exportNames.has(name));
  if (missing.length > 0) {
    throw new GhosttyProbeError(
      `[jixoai-ghostty-probe] MISSING EXPORTS — required ABI surface is absent upstream: ${missing.join(', ')}`,
    );
  }

  // (5) instantiate + marshalling smoke (layout-driven, zero hardcoded offsets).
  const instance = step('instantiate with {}', () => new WebAssembly.Instance(module, {}));
  const wasm = new Wasm(instance);
  const typeJsonPtr = step('ghostty_type_json', () => wasm.e.ghostty_type_json());
  const layout = step('parse type_json', () => layoutValue(wasm, wasm.readCStr(typeJsonPtr)));

  const SUCCESS = enumValue(layout, 'GhosttyResult', 'SUCCESS', 'result codes');
  const ENTER = enumValue(layout, 'GhosttyKey', 'ENTER', 'Enter key encoding');
  const PRESS = enumValue(layout, 'GhosttyKeyAction', 'PRESS', 'Enter key encoding');
  const VERSION_STRING = enumValue(layout, 'GhosttyBuildInfo', 'VERSION_STRING', 'build info');
  const DATA_ROW_ITERATOR = enumValue(layout, 'GhosttyRenderStateData', 'ROW_ITERATOR', 'dirty row iteration');
  const ROW_DATA_CELLS = enumValue(layout, 'GhosttyRenderStateRowData', 'CELLS', 'cell iteration');
  const CELLS_DATA_GRAPHEMES_UTF8 = enumValue(
    layout,
    'GhosttyRenderStateRowCellsData',
    'GRAPHEMES_UTF8',
    'grapheme readout',
  );
  const bufPtr = fieldOffset(layout, 'GhosttyBuffer', 'ptr', 'grapheme readout');
  const bufCap = fieldOffset(layout, 'GhosttyBuffer', 'cap', 'grapheme readout');
  const bufLen = fieldOffset(layout, 'GhosttyBuffer', 'len', 'grapheme readout');
  const bufferStructSize = layout.types['GhosttyBuffer']?.size ?? 12;

  // build info — static per process lifetime (build_info.h), read-only.
  const buildInfo = step('ghostty_build_info', () => {
    const slot = wasm.allocSlot();
    const code = wasm.e.ghostty_build_info(VERSION_STRING, slot);
    if (code !== SUCCESS) {
      throw new Error(`ghostty_build_info returned ${code}`);
    }
    const ptr = wasm.e.ghostty_wasm_take_opaque(slot);
    wasm.e.ghostty_wasm_free_opaque(slot);
    if (ptr === 0) throw new Error('build info string pointer is NULL');
    const info = wasm.readCStr(ptr);
    if (info.length === 0) throw new Error('build info string is empty');
    return info;
  });

  // terminal + vt_write
  const term = step('terminal_new 80x24', () => {
    const slot = wasm.allocSlot();
    const code = wasm.e.ghostty_terminal_new(0, slot, 80, 24);
    if (code !== SUCCESS) throw new Error(`ghostty_terminal_new returned ${code}`);
    return wasm.takeSlot(slot);
  });

  step('terminal_vt_write', () => {
    const payload = wasm.encodeUtf8('\x1b[31mhello \x1b[1;44mghostty\x1b[0m!');
    const ptr = wasm.alloc(payload.length);
    wasm.writeBytes(ptr, payload);
    wasm.e.ghostty_terminal_vt_write(term, ptr, payload.length);
    wasm.free(ptr, payload.length);
  });

  // render state -> dirty rows -> cells -> graphemes
  const renderState = step('render_state_new', () => {
    const slot = wasm.allocSlot();
    const code = wasm.e.ghostty_render_state_new(0, slot);
    if (code !== SUCCESS) throw new Error(`ghostty_render_state_new returned ${code}`);
    return wasm.takeSlot(slot);
  });

  step('render_state_update', () => {
    const code = wasm.e.ghostty_render_state_update(renderState, term);
    if (code !== SUCCESS) throw new Error(`ghostty_render_state_update returned ${code}`);
  });

  const iterator = step('row_iterator_new', () => {
    const slot = wasm.allocSlot();
    const code = wasm.e.ghostty_render_state_row_iterator_new(0, slot);
    if (code !== SUCCESS) throw new Error(`ghostty_render_state_row_iterator_new returned ${code}`);
    return wasm.takeSlot(slot);
  });

  step('render_state_get(ROW_ITERATOR)', () => {
    const outPtr = wasm.alloc(4);
    wasm.writeHandle(outPtr, iterator);
    const code = wasm.e.ghostty_render_state_get(renderState, DATA_ROW_ITERATOR, outPtr);
    wasm.free(outPtr, 4);
    if (code !== SUCCESS) throw new Error(`render_state_get(ROW_ITERATOR) returned ${code}`);
  });

  const cells = step('row_cells_new', () => {
    const slot = wasm.allocSlot();
    const code = wasm.e.ghostty_render_state_row_cells_new(0, slot);
    if (code !== SUCCESS) throw new Error(`ghostty_render_state_row_cells_new returned ${code}`);
    return wasm.takeSlot(slot);
  });

  let graphemeSample = '';
  step('dirty row -> cells -> graphemes', () => {
    const yPtr = wasm.alloc(2);
    const cellsOutPtr = wasm.alloc(4);
    let dirtyRows = 0;
    let cellsSeen = 0;
    outer: while (wasm.e.ghostty_render_state_row_iterator_next_dirty(iterator, yPtr) !== 0 && dirtyRows < 32) {
      dirtyRows += 1;
      wasm.writeHandle(cellsOutPtr, cells);
      const code = wasm.e.ghostty_render_state_row_get(iterator, ROW_DATA_CELLS, cellsOutPtr);
      if (code !== SUCCESS) throw new Error(`row_get(CELLS) returned ${code}`);
      while (wasm.e.ghostty_render_state_row_cells_next(cells) !== 0 && cellsSeen < 4096) {
        cellsSeen += 1;
        // GhosttyBuffer{ptr,cap,len} per type_json layout; retry on OUT_OF_SPACE.
        const buf = wasm.alloc(bufferStructSize);
        const scratch = wasm.alloc(16);
        let dv = new DataView(wasm.e.memory.buffer);
        dv.setUint32(buf + bufPtr.offset, scratch, true);
        dv.setUint32(buf + bufCap.offset, 16, true);
        dv.setUint32(buf + bufLen.offset, 0, true);
        let code2 = wasm.e.ghostty_render_state_row_cells_get(cells, CELLS_DATA_GRAPHEMES_UTF8, buf);
        if (code2 === -3) {
          // OUT_OF_SPACE: len now holds the required size.
          dv = new DataView(wasm.e.memory.buffer);
          const required = dv.getUint32(buf + bufLen.offset, true);
          const big = wasm.alloc(required);
          dv = new DataView(wasm.e.memory.buffer);
          dv.setUint32(buf + bufPtr.offset, big, true);
          dv.setUint32(buf + bufCap.offset, required, true);
          code2 = wasm.e.ghostty_render_state_row_cells_get(cells, CELLS_DATA_GRAPHEMES_UTF8, buf);
          wasm.free(big, required);
        }
        if (code2 === SUCCESS) {
          dv = new DataView(wasm.e.memory.buffer);
          const ptr = dv.getUint32(buf + bufPtr.offset, true);
          const len = dv.getUint32(buf + bufLen.offset, true);
          if (len > 0 && graphemeSample.length === 0) {
            graphemeSample = new TextDecoder().decode(
              new Uint8Array(wasm.e.memory.buffer).subarray(ptr, ptr + len),
            );
          }
        }
        wasm.free(scratch, 16);
        wasm.free(buf, bufferStructSize);
        if (graphemeSample.length > 0) break outer;
      }
    }
    wasm.free(yPtr, 2);
    wasm.free(cellsOutPtr, 4);
    if (dirtyRows === 0) throw new Error('no dirty rows after vt_write — expected at least the written line');
    if (cellsSeen === 0) throw new Error('dirty row yielded zero cells');
    if (graphemeSample.length === 0) throw new Error('no non-empty cell grapheme observed');
  });

  // Enter key encoding must be exactly "\r" (C0 CR).
  step('key_encoder Enter === "\\r"', () => {
    const encSlot = wasm.allocSlot();
    let code = wasm.e.ghostty_key_encoder_new(0, encSlot);
    if (code !== SUCCESS) throw new Error(`key_encoder_new returned ${code}`);
    const encoder = wasm.takeSlot(encSlot);

    const evtSlot = wasm.allocSlot();
    code = wasm.e.ghostty_key_event_new(0, evtSlot);
    if (code !== SUCCESS) throw new Error(`key_event_new returned ${code}`);
    const event = wasm.takeSlot(evtSlot);

    wasm.e.ghostty_key_event_set_action(event, PRESS);
    wasm.e.ghostty_key_event_set_key(event, ENTER);
    wasm.e.ghostty_key_encoder_setopt_from_terminal(encoder, term);

    const CAP = 128;
    const outBuf = wasm.alloc(CAP);
    const outLen = wasm.alloc(layout.abi.usize_size);
    code = wasm.e.ghostty_key_encoder_encode(encoder, event, outBuf, CAP, outLen);
    if (code !== SUCCESS) throw new Error(`key_encoder_encode returned ${code}`);
    const written = wasm.readUsize(outLen, layout.abi.usize_size);
    const sequence = new TextDecoder().decode(
      new Uint8Array(wasm.e.memory.buffer).subarray(outBuf, outBuf + written),
    );
    wasm.free(outBuf, CAP);
    wasm.free(outLen, layout.abi.usize_size);
    wasm.e.ghostty_key_event_free(event);
    wasm.e.ghostty_key_encoder_free(encoder);
    if (sequence !== '\r') {
      throw new Error(`Enter encoded to ${JSON.stringify(sequence)}, expected "\\r"`);
    }
  });

  // paste safety: plain text safe, bracketed-paste intro unsafe.
  step('paste_is_safe', () => {
    const plain = wasm.encodeUtf8('echo hello');
    const p1 = wasm.alloc(plain.length);
    wasm.writeBytes(p1, plain);
    const safe = wasm.e.ghostty_paste_is_safe(p1, plain.length);
    wasm.free(p1, plain.length);
    const bracket = wasm.encodeUtf8('\x1b[201~');
    const p2 = wasm.alloc(bracket.length);
    wasm.writeBytes(p2, bracket);
    const unsafe = wasm.e.ghostty_paste_is_safe(p2, bracket.length);
    wasm.free(p2, bracket.length);
    if (safe !== 1) throw new Error('paste_is_safe(plain text) must be true');
    if (unsafe !== 0) throw new Error('paste_is_safe(bracketed paste intro) must be false');
  });

  // cleanup — leaked wasm-heap handles are invisible to GC by design.
  step('cleanup', () => {
    wasm.e.ghostty_render_state_row_cells_free(cells);
    wasm.e.ghostty_render_state_row_iterator_free(iterator);
    wasm.e.ghostty_render_state_free(renderState);
    wasm.e.ghostty_terminal_free(term);
  });

  return {
    buildInfo,
    exportCount: exportNames.size,
    importCount: imports.length,
  };
}

// ---------------------------------------------------------------------------
// CLI: jixoai-ghostty-probe --wasm <path> --variant full|small --json
// ---------------------------------------------------------------------------

export interface ProbeCliIo {
  stdout(line: string): void;
  stderr(line: string): void;
}

const defaultIo: ProbeCliIo = {
  stdout: (line) => console.log(line),
  stderr: (line) => console.error(line),
};

/** Run the CLI with explicit io (unit-testable); returns the exit code. */
export async function runProbeCli(argv: string[], io: ProbeCliIo = defaultIo): Promise<number> {
  let args: ReturnType<typeof parseArgs>;
  try {
    args = parseArgs({
      args: argv,
      options: {
        wasm: { type: 'string' },
        variant: { type: 'string' },
        json: { type: 'boolean', default: false },
      },
      strict: true,
    });
  } catch (err) {
    io.stderr(
      `[jixoai-ghostty-probe] BAD ARGS — ${(err as Error).message}; usage: jixoai-ghostty-probe --wasm <path> --variant full|small --json`,
    );
    return 2;
  }
  const wasmPath = args.values.wasm;
  const variant = args.values.variant;
  if (typeof wasmPath !== 'string' || wasmPath.length === 0) {
    io.stderr('[jixoai-ghostty-probe] MISSING ARG — --wasm <path> is required');
    return 2;
  }
  if (variant !== 'full' && variant !== 'small') {
    io.stderr('[jixoai-ghostty-probe] MISSING ARG — --variant must be full or small');
    return 2;
  }

  let bytes: Uint8Array<ArrayBuffer>;
  try {
    // node's Buffer may wrap a pooled/shared ArrayBuffer; copy into a
    // plain one so WebAssembly APIs accept it as a BufferSource
    const raw = await readFile(wasmPath);
    bytes = new Uint8Array(raw.byteLength);
    bytes.set(raw);
  } catch (err) {
    io.stderr(`[jixoai-ghostty-probe] UNREADABLE — ${wasmPath}: ${(err as Error).message}`);
    return 1;
  }

  let result: ProbeResult;
  try {
    result = probeGhosttyWasm(bytes);
  } catch (err) {
    io.stderr((err as GhosttyProbeError).message);
    return 1;
  }

  const fragment = {
    variant,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    size: bytes.byteLength,
    buildInfo: result.buildInfo,
  };
  io.stdout(JSON.stringify(fragment, null, args.values.json ? 2 : 0));
  return 0;
}

// Bin entry point (dist/probe.js). Guarded so importing the module (e.g.
// from tests) never runs main. Compared through realpath: npm bin links
// are symlinks, and node resolves the module to its real path.
if (process.argv[1] !== undefined) {
  try {
    const self = realpathSync(fileURLToPath(import.meta.url));
    const invoked = realpathSync(process.argv[1]);
    if (self === invoked) {
      process.exitCode = await runProbeCli(process.argv.slice(2));
    }
  } catch {
    // argv[1] not a resolvable file (tsx/vitest loaders) — not the bin.
  }
}

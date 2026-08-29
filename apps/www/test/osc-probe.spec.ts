/*
 * OSC 52 / title live probe (design.md D4, owner request 2026-08-28).
 *
 * This file locks BOTH the probe verdict that froze the observer route and
 * the behavior of the winning implementation:
 *
 *   Route 1 (terminal OPT callbacks, CLIPBOARD_WRITE=26 / CLIPBOARD_READ=38)
 *   is INFEASIBLE from this runtime: the wasm imports nothing (no import
 *   boundary to hand a host fn through), and its exported indirect function
 *   table rejects plain JS functions outright — only Wasm function objects
 *   are valid funcrefs. WebAssembly.Function (JS type reflection), the only
 *   wrapper that could bridge that, is undefined in this runtime
 *   (Node 22.20, probed 2026-08-28); even with it, the synchronous
 *   reply(write, reply) contract has no wasm-side trampoline export to
 *   invoke. Evidence tests below.
 *
 *   Route 2 (standalone osc parser, boundaries only) WORKS mechanically —
 *   ghostty_osc_next pumps one body byte at a time, ghostty_osc_end(parser,
 *   terminator) yields a command whose command_type is CLIPBOARD_CONTENTS
 *   (4) — but GhosttyOscCommandData offers exactly INVALID and
 *   CHANGE_WINDOW_TITLE_STR: there is NO payload channel for clipboard
 *   contents, and the parser expects the host to have already extracted the
 *   OSC body (start + terminator detection stay host-side anyway). Evidence
 *   tests below.
 *
 *   Route 3 (host-side boundary scanner) therefore WINS: the binding scans
 *   the vtWrite byte stream itself (see ghostty-vt.ts scanOsc52). Its
 *   behavioral goldens — set/query parsing, mixed streams, split feeds,
 *   resync after aborts, the observer buffer cap, title reads/changes — are
 *   the rest of this file.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GhosttyVTError, loadGhosttyVT, type GhosttyOsc52Request, type GhosttyVT } from '../../../registry/files/lib/ghostty-vt';

const wasmPath = process.env.JIXOAI_GHOSTTY_WASM_PATH ?? '/tmp/ghostty-research/ghostty-vt.wasm';
/** explicit copy so the array's buffer is a plain ArrayBuffer (BufferSource-safe) */
function wasmBytes(): Uint8Array<ArrayBuffer> {
  const raw = readFileSync(resolve(wasmPath));
  const copy = new Uint8Array(new ArrayBuffer(raw.length));
  copy.set(raw);
  return copy;
}
const enc = (text: string): Uint8Array => new TextEncoder().encode(text);

async function loadVT(): Promise<GhosttyVT> {
  const vt = await loadGhosttyVT({ bytes: wasmBytes() });
  vt.new(80, 24);
  return vt;
}

// ---------------------------------------------------------------------------
// route 1 evidence: no host-fn registration mechanism
// ---------------------------------------------------------------------------

describe('OSC 52 route 1 evidence — OPT callbacks are unreachable from JS', () => {
  it('the wasm imports NOTHING: no import boundary exists for host functions', async () => {
    const module = await WebAssembly.compile(wasmBytes());
    expect(WebAssembly.Module.imports(module)).toEqual([]);
  });

  it('the exported indirect function table rejects plain JS functions (funcref discipline)', async () => {
    const module = await WebAssembly.compile(wasmBytes());
    const table = WebAssembly.Module.exports(module).find((e) => e.kind === 'table');
    expect(table?.name).toBe('__indirect_function_table');
    const instance = await WebAssembly.instantiate(module, {});
    const fnTable = instance.exports.__indirect_function_table as WebAssembly.Table;
    // Probed 2026-08-28: typeof WebAssembly.Function === 'undefined' here
    // (Node 22.20 — no JS type reflection), so this is the ONLY way a host
    // callable could reach the table, and it throws.
    expect(() => fnTable.set(0, () => {})).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// route 2 evidence: the standalone parser classifies but carries no payload
// ---------------------------------------------------------------------------

describe('OSC 52 route 2 evidence — byte pump + end, type only, no data channel', () => {
  it('pumps `52;c;aGVsbG8=` and ends at BEL with command_type CLIPBOARD_CONTENTS', async () => {
    const vt = await loadVT(); // manifest source for enum values
    const CLIPBOARD = vt.typeLayout.types.GhosttyOscCommandType?.values?.CLIPBOARD_CONTENTS;
    vt.free();
    const instance = await WebAssembly.instantiate(await WebAssembly.compile(wasmBytes()), {});
    const ex = instance.exports as unknown as Record<string, (...args: number[]) => number>;
    const slot = ex.ghostty_wasm_alloc_opaque();
    expect(ex.ghostty_osc_new(0, slot)).toBe(0);
    const parser = ex.ghostty_wasm_take_opaque(slot);
    for (const b of enc('52;c;aGVsbG8=')) ex.ghostty_osc_next(parser, b);
    const command = ex.ghostty_osc_end(parser, 0x07);
    expect(ex.ghostty_osc_command_type(command)).toBe(CLIPBOARD);
    ex.ghostty_osc_free(parser);
    ex.ghostty_wasm_free_opaque(slot);
  });

  it('keeps parser state across split feeds and accepts the ST terminator byte', async () => {
    const vt = await loadVT();
    const CLIPBOARD = vt.typeLayout.types.GhosttyOscCommandType?.values?.CLIPBOARD_CONTENTS;
    vt.free();
    const instance = await WebAssembly.instantiate(await WebAssembly.compile(wasmBytes()), {});
    const ex = instance.exports as unknown as Record<string, (...args: number[]) => number>;
    const slot = ex.ghostty_wasm_alloc_opaque();
    ex.ghostty_osc_new(0, slot);
    const parser = ex.ghostty_wasm_take_opaque(slot);
    for (const b of enc('52;')) ex.ghostty_osc_next(parser, b);
    for (const b of enc('c;?')) ex.ghostty_osc_next(parser, b);
    let command = ex.ghostty_osc_end(parser, 0x5c); // ST = ESC \ -> 0x5c
    expect(ex.ghostty_osc_command_type(command)).toBe(CLIPBOARD);
    ex.ghostty_osc_reset(parser);
    for (const b of enc('0;other')) ex.ghostty_osc_next(parser, b);
    command = ex.ghostty_osc_end(parser, 0x07);
    expect(ex.ghostty_osc_command_type(command)).toBe(
      vt.typeLayout.types.GhosttyOscCommandType?.values?.CHANGE_WINDOW_TITLE,
    );
    ex.ghostty_osc_free(parser);
    ex.ghostty_wasm_free_opaque(slot);
    vt.free(); // idempotent; keeps ownership tidy in case of reuse
  });

  it('GhosttyOscCommandData has NO clipboard payload data type (the payload falsification)', async () => {
    const vt = await loadVT();
    // the complete data enum: only INVALID + CHANGE_WINDOW_TITLE_STR —
    // CLIPBOARD_CONTENTS has a type but no data channel, so a bypass
    // parser route can never hand the payload to the host
    expect(vt.typeLayout.types.GhosttyOscCommandData?.values).toEqual({
      INVALID: 0,
      CHANGE_WINDOW_TITLE_STR: 1,
      MAX_VALUE: 2147483647,
    });
    vt.free();
  });
});

// ---------------------------------------------------------------------------
// route 3 goldens: the host-side scanner behind onOsc52 (winner)
// ---------------------------------------------------------------------------

describe('OSC 52 observer (route 3 goldens, live wasm)', () => {
  it('parses set and query requests with c and empty selectors, BEL and ST terminators', async () => {
    const vt = await loadVT();
    const seen: GhosttyOsc52Request[] = [];
    vt.onOsc52((req) => seen.push(req));
    vt.vtWrite(enc('\x1b]52;c;aGVsbG8=\x07')); // set, BEL
    vt.vtWrite(enc('\x1b]52;c;?\x1b\\')); // query, ST
    vt.vtWrite(enc('\x1b]52;;QQ==\x07')); // empty selector
    expect(seen).toEqual([
      { kind: 'set', selector: 'c', payloadBase64: 'aGVsbG8=' },
      { kind: 'query', selector: 'c' },
      { kind: 'set', selector: '', payloadBase64: 'QQ==' },
    ]);
    vt.free();
  });

  it('drops other selectors, empty payloads, and non-52 OSC sequences', async () => {
    const vt = await loadVT();
    const seen: GhosttyOsc52Request[] = [];
    vt.onOsc52((req) => seen.push(req));
    vt.vtWrite(enc('\x1b]52;s;QUJD\x07')); // selection clipboard — not surfaced
    vt.vtWrite(enc('\x1b]52;p;QUJD\x07')); // primary — not surfaced
    vt.vtWrite(enc('\x1b]52;c;\x07')); // empty payload = clear clipboard: V1 drop
    vt.vtWrite(enc('\x1b]0;title\x07')); // OSC 0 — title path, not clipboard
    vt.vtWrite(enc('\x1b]8;;https://example.com\x1b\\LINK\x1b]8;;\x1b\\')); // OSC 8
    expect(seen).toEqual([]);
    vt.free();
  });

  it('survives mixed streams (text + CSI + OSC 52) and the terminal still renders the text', async () => {
    const vt = await loadVT();
    const seen: GhosttyOsc52Request[] = [];
    vt.onOsc52((req) => seen.push(req));
    vt.vtWrite(enc('hi\x1b[31m\x1b]52;c;QUJD\x07after\x1b[0m'));
    expect(seen).toEqual([{ kind: 'set', selector: 'c', payloadBase64: 'QUJD' }]);
    const rows = [...vt.dirtyRows()];
    const row0 = rows.map((row) => row.cells.map((cell) => cell.grapheme).join('')).find((t) => t.length > 0);
    expect(row0).toContain('hi');
    expect(row0).toContain('after');
    vt.free();
  });

  it('reassembles one OSC 52 split across TWO vtWrite feeds (the golden split case)', async () => {
    const vt = await loadVT();
    const seen: GhosttyOsc52Request[] = [];
    vt.onOsc52((req) => seen.push(req));
    vt.vtWrite(enc('\x1b]52;c;aG'));
    expect(seen).toEqual([]); // not yet terminated
    vt.vtWrite(enc('VsbG8=\x07text'));
    expect(seen).toEqual([{ kind: 'set', selector: 'c', payloadBase64: 'aGVsbG8=' }]);
    vt.free();
  });

  it('handles two OSC 52 sequences in one feed and resyncs after an aborted one', async () => {
    const vt = await loadVT();
    const seen: GhosttyOsc52Request[] = [];
    vt.onOsc52((req) => seen.push(req));
    vt.vtWrite(enc('\x1b]52;c;QQ==\x07mid\x1b]52;c;Ulk=\x07'));
    expect(seen.map((r) => r.payloadBase64)).toEqual(['QQ==', 'Ulk=']);
    // an ESC followed by CSI garbage aborts the in-flight sequence; the
    // scanner must resync on the next ESC ] and keep observing
    seen.length = 0;
    vt.vtWrite(enc('\x1b]52;c;AA\x1b[31m\x1b]52;c;Qg==\x07'));
    expect(seen).toEqual([{ kind: 'set', selector: 'c', payloadBase64: 'Qg==' }]);
    vt.free();
  });

  it('keeps an unterminated sequence buffered without emitting (no terminator, no event)', async () => {
    const vt = await loadVT();
    const seen: GhosttyOsc52Request[] = [];
    vt.onOsc52((req) => seen.push(req));
    vt.vtWrite(enc('\x1b]52;c;QUJD'));
    vt.vtWrite(enc('more-bytes-without-terminator'));
    expect(seen).toEqual([]);
    // reset() grounds the parser: the pending fragment is dead, and the
    // NEXT clean sequence is still observed
    vt.reset();
    vt.vtWrite(enc('\x1b]52;c;Ulk=\x07'));
    expect(seen).toEqual([{ kind: 'set', selector: 'c', payloadBase64: 'Ulk=' }]);
    vt.free();
  });

  it('drops sequences exceeding the observer raw cap (~4 MiB) and recovers', async () => {
    const vt = await loadVT();
    const seen: GhosttyOsc52Request[] = [];
    vt.onOsc52((req) => seen.push(req));
    // one sequence with > 4 MiB of body: chunked through many feeds
    const chunk = 'A'.repeat(64 * 1024);
    vt.vtWrite(enc('\x1b]52;c;'));
    for (let i = 0; i < 65; i++) vt.vtWrite(enc(chunk)); // 65 * 64KiB > 4 MiB
    vt.vtWrite(enc('\x07'));
    expect(seen).toEqual([]); // cap exceeded: whole sequence abandoned
    vt.vtWrite(enc('\x1b]52;c;Qg==\x07'));
    expect(seen).toEqual([{ kind: 'set', selector: 'c', payloadBase64: 'Qg==' }]);
    vt.free();
  }, 30_000);

  it('onOsc52 subscriptions are individually disposable', async () => {
    const vt = await loadVT();
    const seen: string[] = [];
    const a = vt.onOsc52((req) => seen.push(`a:${req.payloadBase64 ?? '?'}`));
    vt.onOsc52((req) => seen.push(`b:${req.payloadBase64 ?? '?'}`));
    vt.vtWrite(enc('\x1b]52;c;QQ==\x07'));
    a.dispose();
    vt.vtWrite(enc('\x1b]52;c;Ulk=\x07'));
    expect(seen).toEqual(['a:QQ==', 'b:QQ==', 'b:Ulk=']);
    vt.free();
  });

  it('new() clears the registry; free() silences forever (design freeze)', async () => {
    const vt = await loadVT();
    const seen: GhosttyOsc52Request[] = [];
    vt.onOsc52((req) => seen.push(req));
    vt.new(80, 24); // recreation drops handlers + scanner state
    vt.vtWrite(enc('\x1b]52;c;QQ==\x07'));
    expect(seen).toEqual([]);
    vt.free();
    expect(() => vt.onOsc52((req) => seen.push(req))).toThrow(GhosttyVTError);
  });
});

describe('title surface (live wasm)', () => {
  it('readTitle starts empty and tracks OSC 0 / OSC 2 with either terminator', async () => {
    const vt = await loadVT();
    expect(vt.readTitle()).toBe('');
    vt.vtWrite(enc('\x1b]0;hello vt\x07'));
    expect(vt.readTitle()).toBe('hello vt');
    vt.vtWrite(enc('\x1b]2;second\x1b\\'));
    expect(vt.readTitle()).toBe('second');
    vt.free();
  });

  it('onTitleChange fires on changes only (no duplicate for same-title writes)', async () => {
    const vt = await loadVT();
    const titles: string[] = [];
    vt.onTitleChange((title) => titles.push(title));
    vt.vtWrite(enc('text without title'));
    expect(titles).toEqual([]);
    vt.vtWrite(enc('\x1b]0;vim: index.ts\x07'));
    expect(titles).toEqual(['vim: index.ts']);
    vt.vtWrite(enc('\x1b]2;vim: index.ts\x07')); // same value — no event
    expect(titles).toEqual(['vim: index.ts']);
    // probed: OSC 1 (icon title) does NOT touch the window TITLE
    vt.vtWrite(enc('\x1b]1;icon-only\x07'));
    expect(titles).toEqual(['vim: index.ts']);
    vt.vtWrite(enc('\x1b]2;vim: app.ts\x07'));
    expect(titles).toEqual(['vim: index.ts', 'vim: app.ts']);
    vt.free();
  });

  it('RIS clears the title and observers see the flip', async () => {
    const vt = await loadVT();
    const titles: string[] = [];
    vt.onTitleChange((title) => titles.push(title));
    vt.vtWrite(enc('\x1b]0;before\x07'));
    expect(titles).toEqual(['before']);
    vt.reset();
    expect(titles).toEqual(['before', '']);
    expect(vt.readTitle()).toBe('');
    vt.free();
  });
});

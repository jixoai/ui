/**
 * lab-helpers.ts — shared scaffolding for the epic40 substrate-lab probe
 * battery (P1-P20) ported into the package (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Semantic source of truth: `.zcode/epic40/lab/common.mjs`
 * (frozen, research archive). Deviation from the lab: `finish()` keeps the
 * stdout result envelope for diffing against `lab/results/` but drops the
 * `results/<name>.json` scratch write; assertions use `node:assert/strict`
 * instead of the lab's boolean `assert()` (identical throw-on-falsy
 * semantics).
 *
 * Engine scope note: the package pins loro-crdt + quickjs-emscripten only
 * (collab-protocol design.md 引擎钉死). The lab probes additionally used
 * yjs as engine-selection comparison evidence; those arms are recorded as
 * omitted (`YJS_OMITTED`) in the ported probes instead of being executed.
 */

import { strict as assert } from 'node:assert';

/** The `#+-!` edit vocabulary operation (p1/p20 grammar). */
export type VocabularyOperation =
  | { type: 'cursor'; row: number; col: number }
  | { type: 'insert'; text: string }
  | { type: 'delete'; length: number }
  | { type: 'replace'; length: number; text: string };

/** Journal range op shape used by the overlap predicates (p2). */
export interface RangeOp {
  actor: string;
  offset: number;
  length: number;
  baseVersion: string;
  kind: string;
}

/**
 * Marker recorded in place of the lab's executed yjs arms. yjs is not a
 * dependency of @jixoai/ui-design and the engine is pinned to loro-crdt;
 * changing this means changing the pinned engine set — see the M0 port
 * report before touching it.
 */
export const YJS_OMITTED =
  'omitted: yjs arm is engine-selection evidence only; yjs is not a pinned dependency of @jixoai/ui-design (collab-protocol design.md 引擎钉死: loro-crdt + quickjs-emscripten)';

export function jsonSafe(value: unknown): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(value, (_key: string, item: unknown) =>
      typeof item === 'bigint' ? `${item}n` : item,
    ),
  ) as Record<string, unknown>;
}

/**
 * Print the probe result envelope exactly as the lab did (`name: PASS` plus
 * one JSON line), so output stays diffable against `lab/results/`.
 */
export function finish(name: string, payload: Record<string, unknown>): void {
  const output = { name, ok: true, ...jsonSafe(payload) };
  console.log(`${name}: PASS`);
  console.log(JSON.stringify(output));
}

export function rowColToOffset(source: string, row: number, col: number): number {
  assert.ok(row >= 1 && col >= 1, 'ROW and COL are 1-based positive integers');
  const lines = source.split('\n');
  assert.ok(row <= lines.length, `row ${row} is outside source`);
  const line = lines[row - 1]!;
  assert.ok(col - 1 <= line.length, `column ${col} is outside row ${row}`);
  const offset =
    lines.slice(0, row - 1).reduce((sum: number, item: string) => sum + item.length + 1, 0) +
    col -
    1;
  if (offset > 0 && offset < source.length) {
    const previous = source.charCodeAt(offset - 1);
    const next = source.charCodeAt(offset);
    assert.ok(
      !(previous >= 0xd800 && previous <= 0xdbff && next >= 0xdc00 && next <= 0xdfff),
      'utf16-boundary: cursor splits a surrogate pair',
    );
  }
  return offset;
}

export function applyVocabulary(
  source: string,
  operations: VocabularyOperation[],
): { text: string; cursor: number } {
  let text = source;
  let cursor = 0;
  for (const operation of operations) {
    if (operation.type === 'cursor') {
      cursor = rowColToOffset(text, operation.row, operation.col);
    } else if (operation.type === 'insert') {
      text = text.slice(0, cursor) + operation.text + text.slice(cursor);
      cursor += operation.text.length;
    } else if (operation.type === 'delete') {
      text = text.slice(0, cursor) + text.slice(cursor + operation.length);
    } else if (operation.type === 'replace') {
      text = text.slice(0, cursor) + operation.text + text.slice(cursor + operation.length);
      cursor += operation.text.length;
    } else {
      throw new Error(`unknown operation ${(operation as VocabularyOperation).type}`);
    }
  }
  return { text, cursor };
}

/**
 * State-vector decoder surface (yjs module shape: `decodeStateVector`). The
 * decoder is injected so the helper stays dependency-free under the pinned
 * engine set; the lab called it with the yjs module directly. Body is the
 * lab verbatim: decode → entries → sort by client id.
 */
export interface StateVectorDecoder {
  decodeStateVector(bytes: Uint8Array): Map<number, number>;
}

export function vectorEntries(
  decoder: StateVectorDecoder,
  bytes: Uint8Array,
): Array<[number, number]> {
  return [...decoder.decodeStateVector(bytes).entries()].sort((a, b) => a[0]! - b[0]!);
}

export function concurrentRanges(a: RangeOp, b: RangeOp): boolean {
  return a.baseVersion === b.baseVersion && a.actor !== b.actor;
}

export function rangesOverlap(a: RangeOp, b: RangeOp): boolean {
  const aEnd = a.offset + a.length;
  const bEnd = b.offset + b.length;
  return a.offset < bEnd && b.offset < aEnd;
}

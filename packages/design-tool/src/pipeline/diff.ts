/**
 * @jixoai/ui-design (pipeline) — the line diff + unified rendering (r2 T2).
 *
 * Orthogonal intents (2):
 *   1. diffHunks: an LCS-based line diff over string arrays, emitted as
 *      non-overlapping {aStart,aLen,bStart,bLen} hunks — the shared
 *      kernel consumed by the three-way merge (merge3.ts) and the
 *      unified renderer below.
 *   2. unifiedDiff: the GNU-style unified diff string (`--- a` / `+++ b`
 *      / `@@ -l,c +l,c @@` with 3 context lines) used by promotion
 *      status and refusal reports. Node ships no builtin diff and the
 *      r2 brief allows a light self-written one (design-studio r2
 *      tasks.md T2, 2026-09-11).
 *
 * Original need: Owner 2026-09-11 (design-studio r2, promote/status
 * drift reports — the "notify through diff" law of design.md §2).
 * Lines are raw '\n'-split array elements: a trailing '' element is
 * the trailing-newline sentinel and merges/diffs stay byte-faithful.
 */

/** a contiguous changed region between two line arrays (0-based, half-open) */
export interface DiffHunk {
  /** first replaced/removed line in a */
  readonly aStart: number;
  /** removed line count (0 = pure insertion) */
  readonly aLen: number;
  /** first added line position in b */
  readonly bStart: number;
  /** added line count (0 = pure deletion) */
  readonly bLen: number;
}

/**
 * LCS table (classic DP; O(a.length * b.length) — prototype/design files
 * are KB-scale, and the production three-way path uses the npm diff3
 * package anyway, this kernel backs status reports and tests).
 */
function lcsTable(a: readonly string[], b: readonly string[]): Uint32Array[] {
  const table: Uint32Array[] = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i]![j] = a[i] === b[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }
  return table;
}

/**
 * Changed hunks between a and b, ordered by position, never overlapping:
 * walks the LCS backtrack, folding adjacent deletes/inserts into one
 * hunk and closing it at every common line.
 */
export function diffHunks(a: readonly string[], b: readonly string[]): readonly DiffHunk[] {
  const table = lcsTable(a, b);
  const hunks: DiffHunk[] = [];
  let i = 0;
  let j = 0;
  let current: DiffHunk | null = null;
  const flush = (): void => {
    if (current !== null) hunks.push(current);
    current = null;
  };
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      flush();
      i++;
      j++;
      continue;
    }
    // prefer the branch the LCS table says keeps the longest common tail
    const deleteA = table[i + 1]![j]! >= table[i]![j + 1]!;
    const start = current ?? { aStart: i, aLen: 0, bStart: j, bLen: 0 };
    if (deleteA) {
      i++;
    } else {
      j++;
    }
    current = { aStart: start.aStart, aLen: i - start.aStart, bStart: start.bStart, bLen: j - start.bStart };
  }
  if (i < a.length || j < b.length) {
    const start = current ?? { aStart: i, aLen: 0, bStart: j, bLen: 0 };
    current = { aStart: start.aStart, aLen: a.length - start.aStart, bStart: start.bStart, bLen: b.length - start.bStart };
  }
  flush();
  return hunks;
}

/** GNU range display: `-l,c` omits the count when it is exactly 1, and an empty range shows the line BEFORE it */
function rangeDisplay(start: number, len: number): string {
  const line = len === 0 ? start : start + 1;
  return len === 1 ? `${line}` : `${line},${len}`;
}

/** the unified diff header line for one merged hunk group */
function hunkHeader(aStart: number, aLen: number, bStart: number, bLen: number): string {
  return `@@ -${rangeDisplay(aStart, aLen)} +${rangeDisplay(bStart, bLen)} @@`;
}

/** context lines around hunks in the unified renderer */
const CONTEXT = 3;

/**
 * GNU-style unified diff of two full-text contents. Labels default to
 * the base/theirs vocabulary of the promotion report (a = inline base,
 * b = new design content through the same rewrite pipeline).
 */
export function unifiedDiff(aText: string, bText: string, labels: { readonly a?: string; readonly b?: string } = {}): string {
  const a = aText.split('\n');
  const b = bText.split('\n');
  const hunks = diffHunks(a, b);
  if (hunks.length === 0) return '';

  // merge hunks whose context windows touch (gap <= 2*CONTEXT lines)
  const groups: DiffHunk[][] = [];
  let group: DiffHunk[] = [hunks[0]!];
  for (let k = 1; k < hunks.length; k++) {
    const prev = group[group.length - 1]!;
    const hunk = hunks[k]!;
    const prevAEnd = prev.aStart + prev.aLen;
    if (hunk.aStart - prevAEnd <= CONTEXT * 2) {
      group.push(hunk);
    } else {
      groups.push(group);
      group = [hunk];
    }
  }
  groups.push(group);

  const out: string[] = [`--- ${labels.a ?? 'a'}`, `+++ ${labels.b ?? 'b'}`];
  for (const parts of groups) {
    const first = parts[0]!;
    const last = parts[parts.length - 1]!;
    const aFrom = Math.max(0, first.aStart - CONTEXT);
    const bFrom = Math.max(0, first.bStart - CONTEXT);
    const aTo = Math.min(a.length, last.aStart + last.aLen + CONTEXT);
    const bTo = Math.min(b.length, last.bStart + last.bLen + CONTEXT);
    out.push(hunkHeader(aFrom, aTo - aFrom, bFrom, bTo - bFrom));
    // walk both sides emitting ' ' / '-' / '+' lines hunk by hunk;
    // common runs advance BOTH cursors (a and b stay aligned there —
    // group clamping keeps the first/last context windows aligned too)
    let ai = aFrom;
    let bi = bFrom;
    for (const hunk of parts) {
      while (ai < hunk.aStart) {
        out.push(` ${a[ai++]!}`);
        bi++;
      }
      for (let k = 0; k < hunk.aLen; k++) out.push(`-${a[ai++]!}`);
      for (let k = 0; k < hunk.bLen; k++) out.push(`+${b[bi++]!}`);
    }
    while (ai < aTo) {
      out.push(` ${a[ai++]!}`);
      bi++;
    }
  }
  return `${out.join('\n')}\n`;
}

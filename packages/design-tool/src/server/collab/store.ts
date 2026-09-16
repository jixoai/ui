/**
 * @jixoai/ui-design (collab) — the persistence boundary of the collab
 * kernel (collab-protocol M2; design.md 持久化布局冻结).
 *
 * One injected interface, two implementations:
 *   - `MemoryCollabStore` — the in-memory truth used by tests and by
 *     workspaces that live only for a session. `clone()` snapshots the
 *     full persisted state so crash-recovery tests can fork a store at
 *     any point ("the process died HERE").
 *   - `FileCollabStore` — the frozen on-disk layout inside the design
 *     workspace: `design/.jx-collab/` holding `journal.ndjson`,
 *     `wal/wal.ndjson`, `peers.json` and `ledger.json`. `init()` also
 *     writes `.jx-collab/` into the design repo's `.gitignore` — the
 *     journal is audit truth but must never ride a design release tag.
 *
 * All methods are synchronous on purpose: the §5.5 WAL ordering
 * (`prepare → candidate → canonical → journal → receipt`) must hold as
 * one uninterrupted section inside the serialized admission gate.
 *
 * The journal is the ONLY truth for canonical state, receipts, peers and
 * buffers; `peers.json` / `ledger.json` are materialized caches the
 * kernel rewrites after admissions and rebuilds from the journal
 * whenever they disagree (crash between artifacts).
 *
 * Persisted input is VALIDATED, never trusted (impl-review-1 B7): every
 * journal/WAL line and both cache files go through a runtime schema
 * parse (discriminated unions, field types/ranges, base64
 * decodability) before they can reach the recovery path — the previous
 * `JSON.parse(...) as T` passthrough is gone. A truncated final line
 * (no newline terminator) is treated as an append interrupted by a
 * crash: fail-stop naming the file and line. Unknown row types fail
 * stop too — corrupted audit trails are never silently skipped.
 *
 * M6: the validated journal vocabulary grows the `script` intent row
 * (§7) and the formal `projection-pending` row (M5 leftover ②), and the
 * rejection-code set grows `compile-failed`/`dep-unmet` (the §7
 * transaction lane) — all additive to the frozen row shapes.
 *
 * Original need: collab-protocol M2 + M6 (2026-09-15).
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { JournalEntry, LedgerState, PeerRegistryState, WalEntry } from './types.ts';

/* ── the injected persistence interface ───────────────────────────────── */

export interface CollabStore {
  /** ensure the layout exists (file backend: dirs + .gitignore line) */
  init(): void;
  /** append one journal row — the audit truth is append-only (§9) */
  appendJournal(entry: JournalEntry): void;
  /** the full journal, oldest first */
  readJournal(): JournalEntry[];
  /** append one WAL marker (prepare/abort/receipt — §5.5) */
  appendWal(entry: WalEntry): void;
  /** the full WAL, oldest first */
  readWal(): WalEntry[];
  /** rewrite the materialized actor→peer cache (peers.json) */
  savePeers(state: PeerRegistryState): void;
  loadPeers(): PeerRegistryState | undefined;
  /** rewrite the materialized idempotency-index cache (ledger.json) */
  saveLedger(state: LedgerState): void;
  loadLedger(): LedgerState | undefined;
}

/* ── in-memory backend ────────────────────────────────────────────────── */

export class MemoryCollabStore implements CollabStore {
  readonly #journal: JournalEntry[] = [];
  readonly #wal: WalEntry[] = [];
  #peers: PeerRegistryState | undefined;
  #ledger: LedgerState | undefined;

  init(): void {
    /* nothing to lay out */
  }

  appendJournal(entry: JournalEntry): void {
    this.#journal.push(entry);
  }

  readJournal(): JournalEntry[] {
    return [...this.#journal];
  }

  appendWal(entry: WalEntry): void {
    this.#wal.push(entry);
  }

  readWal(): WalEntry[] {
    return [...this.#wal];
  }

  savePeers(state: PeerRegistryState): void {
    this.#peers = state;
  }

  loadPeers(): PeerRegistryState | undefined {
    return this.#peers;
  }

  saveLedger(state: LedgerState): void {
    this.#ledger = state;
  }

  loadLedger(): LedgerState | undefined {
    return this.#ledger;
  }

  /**
   * A deep snapshot of everything this store persists — the substrate a
   * "process died at this instant" recovery test reopens a kernel from.
   */
  clone(): MemoryCollabStore {
    const copy = new MemoryCollabStore();
    for (const entry of this.#journal) copy.appendJournal(structuredClone(entry) as JournalEntry);
    for (const entry of this.#wal) copy.appendWal(structuredClone(entry) as WalEntry);
    copy.#peers = this.#peers === undefined ? undefined : structuredClone(this.#peers);
    copy.#ledger = this.#ledger === undefined ? undefined : structuredClone(this.#ledger);
    return copy;
  }
}

/* ── file backend — the frozen `.jx-collab/` layout ───────────────────── */

const JOURNAL_FILE = 'journal.ndjson';
const WAL_DIR = 'wal';
const WAL_FILE = 'wal.ndjson';
const PEERS_FILE = 'peers.json';
const LEDGER_FILE = 'ledger.json';
const IGNORE_LINE = '.jx-collab/';

/**
 * A persisted-row schema violation (impl-review-1 B7) — fail-stop with
 * the offending file (and line, for ndjson) so a corrupted or hand-edited
 * audit trail can never `as T` its way into the recovery path.
 */
export class PersistedStateError extends Error {
  readonly file: string;
  readonly line: number | undefined;
  constructor(file: string, line: number | undefined, message: string) {
    super(`${file}${line === undefined ? '' : `:${line}`}: ${message}`);
    this.name = 'PersistedStateError';
    this.file = file;
    this.line = line;
  }
}

/* ── runtime schema primitives (B7 — persisted input is untrusted) ─────── */

const isObj = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isStr = (value: unknown): value is string => typeof value === 'string';
const isInt = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);
const isNonEmptyStr = (value: unknown): value is string => isStr(value) && value.length > 0;

/** canonical base64 — round-trip identity catches every junk decoder leniency */
const isBase64 = (value: unknown): value is string => isStr(value) && Buffer.from(value, 'base64').toString('base64') === value;

const isFrontier = (value: unknown): boolean =>
  Array.isArray(value) && value.every((point) => isObj(point) && isStr(point.peer) && isInt(point.counter));

const isVersionVector = (value: unknown): boolean => isObj(value) && Object.values(value).every(isInt);

const isSyncCursor = (value: unknown): boolean =>
  isObj(value) && ((value.kind === 'frontier' && isFrontier(value.value)) || (value.kind === 'vv' && isVersionVector(value.value)));

const isOpTarget = (value: unknown): boolean =>
  isObj(value) && isNonEmptyStr(value.componentId) && (value.buffer === undefined || isNonEmptyStr(value.buffer));

/** the §5.2 conflict body — full structural check (it rides rejection rows) */
const isConflictDetail = (value: unknown): boolean => {
  if (!isObj(value)) return false;
  const span = (item: unknown): boolean => isObj(item) && isNonEmptyStr(item.opId) && isStr(item.actor) && isStr(item.kind) && isInt(item.offset) && isInt(item.length);
  const tailEntry = (item: unknown): boolean =>
    isObj(item) && isInt(item.seq) && isNonEmptyStr(item.opId) && isStr(item.actor) && isStr(item.componentId) && isStr(item.buffer) && isStr(item.kind) && isStr(item.value) && isFrontier(item.frontier);
  return (
    span(value.incoming) &&
    Array.isArray(value.committed) && value.committed.every(span) &&
    Array.isArray(value.tail) && value.tail.every(tailEntry) &&
    isStr(value.currentText)
  );
};

/** field checks that surface as one fail-stop message naming the row */
function requireRow(file: string, line: number, row: Record<string, unknown>, checks: Record<string, boolean>): void {
  for (const [field, ok] of Object.entries(checks)) {
    if (!ok) throw new PersistedStateError(file, line, `field ${JSON.stringify(field)} failed its runtime schema check`);
  }
}

/* ── per-file row validators ──────────────────────────────────────────── */

const REJECTION_CODES = new Set([
  'stale-or-unknown-frontier',
  'stale-cursor',
  'conflict',
  'bad-target',
  'utf16-boundary',
  'compile-failed',
  'dep-unmet',
  'transaction-executor-unavailable',
  'compensation-unsupported',
]);

const isSha256Hex = (value: unknown): value is string => isStr(value) && /^[0-9a-f]{64}$/.test(value);

function validateJournalRow(path: string, line: number, row: unknown): JournalEntry {
  if (!isObj(row)) throw new PersistedStateError(path, line, 'journal row is not a JSON object');
  if (!isInt(row.seq) || row.seq < 1 || !isInt(row.serverAdmissionTime)) {
    throw new PersistedStateError(path, line, 'journal row needs integer seq (>=1) and serverAdmissionTime');
  }
  switch (row.type) {
    case 'peer': {
      requireRow(path, line, row, { actor: isNonEmptyStr(row.actor), peer: isInt(row.peer) && row.peer >= 1 });
      return row as unknown as JournalEntry;
    }
    case 'buffer-seed': {
      requireRow(path, line, row, {
        containerKey: isNonEmptyStr(row.containerKey),
        componentId: isNonEmptyStr(row.componentId),
        buffer: isNonEmptyStr(row.buffer),
        value: isStr(row.value),
        frontier: isFrontier(row.frontier),
        updateB64: isBase64(row.updateB64),
      });
      return row as unknown as JournalEntry;
    }
    case 'commit': {
      requireRow(path, line, row, {
        opId: isNonEmptyStr(row.opId),
        actor: isNonEmptyStr(row.actor),
        transactionId: row.transactionId === undefined || isNonEmptyStr(row.transactionId),
        peer: isInt(row.peer) && row.peer >= 1,
        domain: row.domain === 'text' || row.domain === 'tree',
        kind: isNonEmptyStr(row.kind),
        target: isOpTarget(row.target),
        containerKey: isNonEmptyStr(row.containerKey),
        before: isStr(row.before),
        value: isStr(row.value),
        offset: isInt(row.offset) && row.offset >= 0,
        length: isInt(row.length) && row.length >= 0,
        text: isStr(row.text),
        frontier: isFrontier(row.frontier),
        updateB64: isBase64(row.updateB64),
        anchors:
          row.anchors === undefined ||
          (isObj(row.anchors) && isBase64(row.anchors.start) && isBase64(row.anchors.end)),
        tree:
          row.tree === undefined ||
          (isObj(row.tree) && isNonEmptyStr(row.tree.componentId) && isNonEmptyStr(row.tree.treeNodeId)),
        treeEcho:
          row.treeEcho === undefined ||
          (isObj(row.treeEcho) &&
            (row.treeEcho.componentId === undefined || isNonEmptyStr(row.treeEcho.componentId)) &&
            (row.treeEcho.newParentId === undefined || isNonEmptyStr(row.treeEcho.newParentId)) &&
            (row.treeEcho.index === undefined || isInt(row.treeEcho.index))),
        lww:
          row.lww === undefined ||
          (isObj(row.lww) &&
            isNonEmptyStr(row.lww.componentId) &&
            Array.isArray(row.lww.contenders) &&
            row.lww.contenders.every(
              (contender) =>
                isObj(contender) &&
                isNonEmptyStr(contender.opId) &&
                isStr(contender.actor) &&
                isInt(contender.peer) &&
                (contender.newParentId === undefined || isNonEmptyStr(contender.newParentId)) &&
                isObj(contender.orderKey) &&
                isInt(contender.orderKey.lamport) &&
                isInt(contender.orderKey.peer),
            ) &&
            isNonEmptyStr(row.lww.winnerOpId) &&
            row.lww.resolution === 'lww'),
        responseB64: isBase64(row.responseB64),
        responseSyncCursor: isSyncCursor(row.responseSyncCursor),
        parentFrontier: row.parentFrontier === undefined || isFrontier(row.parentFrontier),
        supersedes: row.supersedes === undefined || isNonEmptyStr(row.supersedes),
        clientEventTime: row.clientEventTime === undefined || isInt(row.clientEventTime),
      });
      return row as unknown as JournalEntry;
    }
    case 'rejection': {
      requireRow(path, line, row, {
        opId: isNonEmptyStr(row.opId),
        actor: isNonEmptyStr(row.actor),
        status: isInt(row.status) && (row.status === 409 || row.status === 404 || row.status === 422 || row.status === 503),
        code: isStr(row.code) && REJECTION_CODES.has(row.code),
        target: isOpTarget(row.target),
        frontier: isFrontier(row.frontier),
        canonicalUpdateB64: row.canonicalUpdateB64 === undefined || isBase64(row.canonicalUpdateB64),
        syncCursor: row.syncCursor === undefined || isSyncCursor(row.syncCursor),
        retryB64:
          row.retryB64 === undefined ||
          (isObj(row.retryB64) &&
            (row.retryB64.cursorBytesB64 === undefined || isBase64(row.retryB64.cursorBytesB64)) &&
            (row.retryB64.reason === undefined || row.retryB64.reason === 'reselect')),
        conflict: row.conflict === undefined || isConflictDetail(row.conflict),
        range:
          row.range === undefined ||
          (isObj(row.range) && isInt(row.range.offset) && isInt(row.range.length)),
        detail: row.detail === undefined || isStr(row.detail),
      });
      return row as unknown as JournalEntry;
    }
    case 'script': {
      // M6 §7: the intent artifact — source + hash + pinned engine identity
      // + capability list. No canonical effect; the audit pairs it with the
      // commit rows the script's ops actually landed.
      requireRow(path, line, row, {
        scriptId: isNonEmptyStr(row.scriptId),
        actor: isNonEmptyStr(row.actor),
        source: isStr(row.source),
        sourceHash: isSha256Hex(row.sourceHash),
        engine:
          isObj(row.engine) &&
          isNonEmptyStr(row.engine.package) &&
          isNonEmptyStr(row.engine.variant) &&
          isSha256Hex(row.engine.wasmSha256),
        capabilities: Array.isArray(row.capabilities) && row.capabilities.every(isNonEmptyStr),
        transactionIds: row.transactionIds === undefined || (Array.isArray(row.transactionIds) && row.transactionIds.every(isNonEmptyStr)),
      });
      return row as unknown as JournalEntry;
    }
    case 'projection-pending': {
      // M5 leftover ② (M6 delivery): the §8 write-back failure record —
      // append-only audit, zero replay effect on canonical. M6 收敛轮:
      // the structural `base` (pre-write file hash) replaces the M6b
      // host's reason-suffix smuggling — recovery reads the field.
      requireRow(path, line, row, {
        path: isNonEmptyStr(row.path),
        projectionHash: isSha256Hex(row.projectionHash),
        base: row.base === undefined || isSha256Hex(row.base),
        reason: isStr(row.reason),
      });
      return row as unknown as JournalEntry;
    }
    default:
      throw new PersistedStateError(
        path,
        line,
        `unknown journal row type ${JSON.stringify(row.type)} — persisted rows are never silently skipped (B7)`,
      );
  }
}

function validateWalRow(path: string, line: number, row: unknown): WalEntry {
  if (!isObj(row)) throw new PersistedStateError(path, line, 'WAL row is not a JSON object');
  switch (row.type) {
    case 'prepare': {
      requireRow(path, line, row, {
        opId: isNonEmptyStr(row.opId),
        transactionId: row.transactionId === undefined || isNonEmptyStr(row.transactionId),
        actor: isNonEmptyStr(row.actor),
        peer: isInt(row.peer) && row.peer >= 1,
        target: isOpTarget(row.target),
        baseFrontiers: isFrontier(row.baseFrontiers),
        serverTime: isInt(row.serverTime),
      });
      return row as unknown as WalEntry;
    }
    case 'abort': {
      requireRow(path, line, row, { opId: isNonEmptyStr(row.opId), reason: isStr(row.reason), serverTime: isInt(row.serverTime) });
      return row as unknown as WalEntry;
    }
    case 'receipt': {
      requireRow(path, line, row, { opId: isNonEmptyStr(row.opId), status: isInt(row.status), serverTime: isInt(row.serverTime) });
      return row as unknown as WalEntry;
    }
    default:
      throw new PersistedStateError(
        path,
        line,
        `unknown WAL row type ${JSON.stringify(row.type)} — persisted rows are never silently skipped (B7)`,
      );
  }
}

function validatePeersState(path: string, value: unknown): PeerRegistryState {
  if (!isObj(value) || !isObj(value.actors) || !Object.values(value.actors).every((peer) => isInt(peer) && peer >= 1) || !isInt(value.nextPeer) || value.nextPeer < 1) {
    throw new PersistedStateError(path, undefined, 'peers.json must be { actors: Record<string, peer>, nextPeer } with integer peers');
  }
  return value as unknown as PeerRegistryState;
}

function validateLedgerState(path: string, value: unknown): LedgerState {
  const receiptOk = (item: unknown): boolean => isObj(item) && isInt(item.status) && (item.code === undefined || isStr(item.code)) && isInt(item.seq);
  if (
    !isObj(value) ||
    !isInt(value.journalSeq) ||
    value.journalSeq < 0 ||
    !isInt(value.nextPeer) ||
    value.nextPeer < 1 ||
    !isObj(value.receipts) ||
    !Object.values(value.receipts).every(receiptOk)
  ) {
    throw new PersistedStateError(path, undefined, 'ledger.json must be { journalSeq, nextPeer, receipts: Record<opId, {status, code?, seq}> }');
  }
  return value as unknown as LedgerState;
}

/**
 * Reads an ndjson file as T[] (missing/empty file → empty). Every line is
 * schema-validated (B7) — malformed JSON, schema violations and unknown
 * row types fail stop with the file and line. A final line without the
 * newline terminator is an append that a crash interrupted: fail-stop,
 * never parse the partial row.
 */
function readNdjson<T>(path: string, validate: (path: string, line: number, row: unknown) => T): T[] {
  if (!existsSync(path)) return [];
  const text = readFileSync(path, 'utf8');
  if (text.length === 0) return [];
  const lines = text.split('\n');
  // every append writes `…\n`; a non-empty final segment means the write
  // was cut before its terminator — the crash window, decided here. The
  // final segment is never parsed (terminated → it is the empty string
  // after the last newline; unterminated → it is the partial row)
  const terminated = lines.at(-1) === '';
  const completeLines = lines.length - 1;
  const out: T[] = [];
  for (let index = 0; index < completeLines; index += 1) {
    const line = lines[index]!;
    if (line.trim().length === 0) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new PersistedStateError(path, index + 1, `malformed JSON line (${message})`);
    }
    out.push(validate(path, index + 1, parsed));
  }
  if (!terminated && lines.length > 0) {
    throw new PersistedStateError(
      path,
      lines.length,
      `truncated final line — the append was interrupted by a crash (partial bytes: ${JSON.stringify(lines.at(-1)!.slice(0, 48))})`,
    );
  }
  return out;
}

export class FileCollabStore implements CollabStore {
  readonly #root: string;
  readonly #dir: string;

  /**
   * @param designDir the design workspace root — the store lays out
   *        `<designDir>/.jx-collab/` and keeps that path git-ignored.
   */
  constructor(designDir: string) {
    this.#root = designDir;
    this.#dir = join(designDir, '.jx-collab');
  }

  init(): void {
    mkdirSync(join(this.#dir, WAL_DIR), { recursive: true });
    for (const name of [JOURNAL_FILE, join(WAL_DIR, WAL_FILE)]) {
      const path = join(this.#dir, name);
      if (!existsSync(path)) writeFileSync(path, '');
    }
    this.#ensureGitIgnored();
  }

  appendJournal(entry: JournalEntry): void {
    appendFileSync(join(this.#dir, JOURNAL_FILE), `${JSON.stringify(entry)}\n`);
  }

  readJournal(): JournalEntry[] {
    return readNdjson<JournalEntry>(join(this.#dir, JOURNAL_FILE), validateJournalRow);
  }

  appendWal(entry: WalEntry): void {
    appendFileSync(join(this.#dir, WAL_DIR, WAL_FILE), `${JSON.stringify(entry)}\n`);
  }

  readWal(): WalEntry[] {
    return readNdjson<WalEntry>(join(this.#dir, WAL_DIR, WAL_FILE), validateWalRow);
  }

  savePeers(state: PeerRegistryState): void {
    writeFileSync(join(this.#dir, PEERS_FILE), `${JSON.stringify(state, null, 2)}\n`);
  }

  loadPeers(): PeerRegistryState | undefined {
    const path = join(this.#dir, PEERS_FILE);
    if (!existsSync(path)) return undefined;
    return validatePeersState(path, JSON.parse(readFileSync(path, 'utf8')));
  }

  saveLedger(state: LedgerState): void {
    writeFileSync(join(this.#dir, LEDGER_FILE), `${JSON.stringify(state, null, 2)}\n`);
  }

  loadLedger(): LedgerState | undefined {
    const path = join(this.#dir, LEDGER_FILE);
    if (!existsSync(path)) return undefined;
    return validateLedgerState(path, JSON.parse(readFileSync(path, 'utf8')));
  }

  /** the directory holding the frozen artifacts (tests assert the layout) */
  get dir(): string {
    return this.#dir;
  }

  /**
   * `.jx-collab/` never enters the design repo: append the ignore line to
   * the nested repo's `.gitignore` (creating the file when the workspace
   * has none yet). Idempotent — an existing line is left alone.
   */
  #ensureGitIgnored(): void {
    const path = join(this.#root, '.gitignore');
    const existing = existsSync(path) ? readFileSync(path, 'utf8') : '';
    if (existing.split('\n').some((line) => line.trim() === IGNORE_LINE)) return;
    const withNewline = existing.length === 0 || existing.endsWith('\n') ? existing : `${existing}\n`;
    writeFileSync(path, `${withNewline}${IGNORE_LINE}\n`);
  }
}

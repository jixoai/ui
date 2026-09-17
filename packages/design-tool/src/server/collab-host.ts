/**
 * @jixoai/ui-design (server) — the collab kernel HOST (collab-protocol
 * M6b: 协同内核接入 design server + dsh 写入迁轨; M6 收敛轮 2026-09-15:
 * the kernel gaps repaid, the synthesized-envelope lane RETIRED).
 *
 * Orthogonal intents (5):
 *   1. HOSTING — one CollabKernel + one shared AdmissionGate + one
 *      ResyncStation per design workspace (`<root>/design`), opened
 *      through the frozen `openWorkspaceCollab` resolution
 *      (`.jx-collab/` at the design root). A process-level registry
 *      keyed by the resolved designDir makes repeated opens IDEMPOTENT:
 *      the design server and the dsh adapter (both live in one
 *      process) must share ONE kernel — two kernel instances over the
 *      same `.jx-collab/` journal would fork in-memory canonical and
 *      interleave journal appends. `dispose()` (server close) settles
 *      in-flight cycles, stops routing, releases watchers and drops
 *      the registry entry; a later open replays the journal and
 *      continues (letters/counters recovered — §2 ledger recovery).
 *      On open the station's `projection-pending` worklist is flushed
 *      (§8 crash recovery: canonical may be ahead of the files).
 *   2. WATCHER WIRING — `.svelte` changes under design/ (hand edits,
 *      git apply/promote, dsh subprocess writes) route through the §8
 *      cycle with the station's own laws preserved: per-path debounce
 *      (latest content wins at fire time), atomic projection
 *      write-back (tmp + rename + hash check) and projection-pending
 *      recovery. The watcher layer is INJECTED: the design server
 *      hooks its existing vite watcher (chokidar — no second watcher);
 *      standalone hosts use the minimal `fsWatchDesignDir`
 *      (fs.watch recursive), which the host OWNS and must close.
 *   3. THE HOST §8 CYCLE (M6 收敛轮 — kernel gap ① repaid, the
 *      deviation note RETIRED): the station's fresh-observed lane now
 *      lands buffer drift for ALREADY-INGESTED pages itself (three-way
 *      at the station's convergence frontier, through admission as
 *      `file-system` ops — same engine as the rebase lane), so the
 *      host drives ONE direct `station.ingestFile` cycle per change.
 *      The M6b workaround — synthesizing a §8 stale envelope with a
 *      remembered base frontier and routing through `station.rebase`
 *      — is retired (base tracking moved into the station). A genuine
 *      station 409 (a pre-recorded observed state that raced a
 *      canonical op) still takes the envelope's rebase lane; one §5.2
 *      admission conflict (409) mid-cycle is retried once after a
 *      re-read, and a still-conflicting outcome surfaces the envelope
 *      instead of ever clobbering the external file.
 *   4. SELF-WRITE RECOGNITION + THE CONVERGE-ALIGNED GUARDS (M7 收官轮
 *      root fix): the file adapter records the sha256 of every
 *      projection it wrote; the station tracks each page's convergence
 *      marker. An event whose bytes verifiably match EITHER is a held
 *      projection — but that justifies a skip only while the file ALSO
 *      equals the CURRENT projection: a panel/agent op advances
 *      canonical without any file event, so an out-of-band advance
 *      pushes the current projection through the station's
 *      `pushCurrentProjection` (held bytes = the no-clobber
 *      precondition) instead of answering a stale "idempotent" (the
 *      M7a finding). A genuine edit racing inside the window changes
 *      the bytes past the held hash and routes the full §8 cycle.
 *      Plus the STARTUP RECONCILE sweep (opt-in `reconcileAtOpen`, the
 *      design server's lane): every KNOWN page runs one §8 reconcile
 *      cycle at open — unhosted hand-edit drift lands, and cross-era
 *      `.jx-collab` tree meta realigns to the current planner.
 *   5. PRESENCE JOURNAL-TAIL (collab-presence §3): every §8 cycle that
 *      returns through the public drives notifies the presence
 *      gateway's journal-tail with the kernel's CURRENT journal row
 *      count — read-only on the commit result, deduped by seq inside
 *      the gateway, and swallowed on any fault (presence is never the
 *      edit path).
 *
 * Internal accessor only — NO new HTTP surface (panels are M7; the
 * server object exposes this host as `server.collab`).
 *
 * Original need: collab-protocol M6b (2026-09-15); M6 收敛轮 (kernel
 * gaps ①② repaid, 2026-09-15); M7 收官轮 (converge-aligned guards +
 * the startup reconcile, 2026-09-15).
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, watch as fsWatch, type FSWatcher } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

import type { AdmissionGate } from './collab/admission.ts';
import { projectSource, treeItemsOf } from './collab/bridge.ts';
import { openWorkspaceCollab } from './collab/cli.ts';
import type { CollabKernel } from './collab/kernel.ts';
import {
  nodeProjectionFiles,
  ResyncError,
  ResyncStation,
  type IngestReport,
  type ProjectionFileAdapter,
  type StaleIngest,
} from './collab/resync.ts';
import { findPresenceGateway } from './presence/gateway.ts';

/* ── page paths ────────────────────────────────────────────────────────── */

/** a page's identity: POSIX path relative to the design workspace root */
export type PagePath = string;

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

/** realpath that tolerates absence (an empty candidate list, never a throw) */
function realpathSafe(path: string): string[] {
  try {
    return [realpathSync(path)];
  } catch {
    return [];
  }
}

/* ── the watcher seam (injected; the server hooks vite's own) ──────────── */

export interface HostFileEvent {
  /** absolute path of the changed file */
  readonly path: string;
  readonly kind: 'change' | 'add' | 'unlink';
}

export interface HostWatcherSubscription {
  /** stop delivering events to this listener (idempotent) */
  dispose(): void;
}

/** the minimal watcher face the host consumes (chokidar or fs.watch) */
export interface HostFileWatcher {
  onEvent(listener: (event: HostFileEvent) => void): HostWatcherSubscription;
}

/** a watcher the host OWNS (standalone path) — closed on dispose/exit */
export interface OwnedFileWatcher extends HostFileWatcher {
  close(): void;
  /** true once close() ran (handle-release evidence) */
  readonly closed: boolean;
}

/** owned-watcher internals: the closed flag must be internally mutable */
interface OwnedFileWatcherState extends OwnedFileWatcher {
  closed: boolean;
}

/** structural ownership probe: a walker with close/closed is host-owned on dispose */
function isOwnedWatcher(watcher: HostFileWatcher): watcher is OwnedFileWatcher {
  return 'close' in watcher && 'closed' in watcher;
}

/**
 * The minimal standalone watcher: ONE recursive fs.watch over the
 * design dir. Rename-vs-change is disambiguated by existence at emit
 * time; a missing dir answers null (the host stays sync-only — dsh's
 * explicit routing still works, only passive events are absent).
 * Node ≥20 supports recursive fs.watch on macOS/Linux/Windows.
 */
export function fsWatchDesignDir(designDir: string): OwnedFileWatcher | null {
  if (!existsSync(designDir)) return null;
  const listeners = new Set<(event: HostFileEvent) => void>();
  let raw: FSWatcher;
  try {
    raw = fsWatch(designDir, { recursive: true }, (eventType, filename) => {
      if (filename === null || typeof filename !== 'string') return; // directory-level noise
      const abs = join(designDir, filename);
      // 'rename' covers create/delete/rename-through-replace (the atomic
      // write-back!) — existence at emit time decides the kind
      const kind: HostFileEvent['kind'] = eventType === 'change' ? 'change' : existsSync(abs) ? 'add' : 'unlink';
      for (const listener of [...listeners]) listener({ path: abs, kind });
    });
  } catch {
    return null; // recursive watch unsupported / permission denied — degrade honestly
  }
  const owned: OwnedFileWatcherState = {
    closed: false,
    onEvent(listener) {
      listeners.add(listener);
      return {
        dispose() {
          listeners.delete(listener);
        },
      };
    },
    close() {
      if (owned.closed) return;
      owned.closed = true;
      listeners.clear();
      raw.close();
    },
  };
  return owned;
}

/** the structural face of vite's chokidar watcher (on/off pairs) */
export interface ViteLikeWatcher {
  on(event: 'change' | 'add' | 'unlink', listener: (path: string) => void): unknown;
  off(event: 'change' | 'add' | 'unlink', listener: (path: string) => void): unknown;
}

/**
 * Adapt the design server's OWN vite watcher (server.watcher) — the
 * brief's「复用既有文件监听机制」: no second handle to track, vite
 * closes it with the server, HMR keeps riding the same events.
 */
export function viteWatcherAdapter(watcher: ViteLikeWatcher): HostFileWatcher {
  return {
    onEvent(listener) {
      const forward = (kind: HostFileEvent['kind']) => (path: string): void => listener({ path, kind });
      const onChange = forward('change');
      const onAdd = forward('add');
      const onUnlink = forward('unlink');
      watcher.on('change', onChange);
      watcher.on('add', onAdd);
      watcher.on('unlink', onUnlink);
      let disposed = false;
      return {
        dispose() {
          if (disposed) return;
          disposed = true;
          watcher.off('change', onChange);
          watcher.off('add', onAdd);
          watcher.off('unlink', onUnlink);
        },
      };
    },
  };
}

/* ── sync outcomes (the dsh lane's chat-visible vocabulary) ────────────── */

export interface CollabConflictNote {
  readonly status: number;
  readonly code: string;
  readonly detail?: string;
}

export interface CollabSyncOutcome {
  readonly page: PagePath;
  readonly kind: 'adopted' | 'rebased' | 'idempotent' | 'written' | 'skipped' | 'conflict' | 'failed';
  /** the station's ingest/rebase report (adopted/rebased lanes) */
  readonly report?: IngestReport;
  /** a 409/conflict envelope that surfaced (auto-retried-and-landed or not) */
  readonly conflict?: CollabConflictNote;
  /** deferred diff entries (scaffold rewrites, external removals — kernel gaps) */
  readonly deferred?: readonly { readonly kind: string; readonly componentId: string }[];
  /** the §8 write-back guard fired: external scaffold bytes stayed authoritative — the file was NOT converged */
  readonly writeBackGuard?: true;
  readonly detail?: string;
}

/* ── options ───────────────────────────────────────────────────────────── */

export interface CollabHostOptions {
  /** the passive event source; omit for a host-owned fs.watch (or none) */
  readonly watcher?: HostFileWatcher;
  /** when true (or no watcher given) the host owns a minimal fs.watch */
  readonly ownFsWatch?: boolean;
  /**
   * the startup reconcile sweep (M7 收官轮): at open, every KNOWN page
   * whose convergence state does not match its file runs ONE §8
   * reconcile cycle (drift landing + cross-era tree-meta realignment).
   * The design server opens with true; bare/embedded hosts opt in.
   */
  readonly reconcileAtOpen?: boolean;
  /** debounce window per path (default 40ms, the station's law) */
  readonly debounceMs?: number;
  /** the timer seam — deterministic tests */
  readonly scheduler?: { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
  /** injectable projection adapter (tests/embedding; default real fs) */
  readonly files?: ProjectionFileAdapter;
}

/* ── the host ──────────────────────────────────────────────────────────── */

export interface CollabHost {
  readonly designDir: string;
  readonly kernel: CollabKernel;
  readonly gate: AdmissionGate;
  readonly station: ResyncStation;

  /**
   * Watcher-facing entry (debounced): one external file event. Non-page
   * files are ignored synchronously; self-writes are swallowed at fire
   * time; every burst for a path collapses into one read-at-fire cycle.
   */
  routeFileEvent(path: string, kind: 'change' | 'add' | 'unlink'): void;

  /**
   * Drive ONE external change through the §8 cycle NOW (the dsh lane
   * and tests): the station's fresh lane adopts new pages AND lands
   * existing pages' buffer drift (kernel gap ① repaid — one direct
   * cycle, no synthesized envelope). `path` may be absolute or
   * design-relative.
   */
  syncExternalChange(path: string): Promise<CollabSyncOutcome>;

  /**
   * Land a GENUINE station 409 envelope (§8 stale lane): rebase. Exposed
   * for callers that pre-record observed state (the protocol
   * demos/tests) — `syncExternalChange` takes the same lane internally
   * when a pre-recorded observed state raced a canonical op.
   */
  resolveStale(stale: StaleIngest): Promise<IngestReport>;

  /**
   * The known-page reconcile (M7 收官轮): ONE §8 cycle for a page the
   * workspace already holds, whose convergence state does not match the
   * current file — lands drift AND realigns cross-era tree meta (the
   * M3-shape journals whose stored items never referenced the
   * prop-expression buffers the current planner produces). Idempotent
   * (no cycle) when the file verifiably holds its converged projection.
   */
  reconcilePage(page: PagePath): Promise<CollabSyncOutcome>;

  /** settle every armed and in-flight cycle (deterministic tests, dispose) */
  flush(): Promise<void>;

  /** stop routing, settle cycles, release the owned watcher, unregister */
  dispose(): Promise<void>;

  /** disposed hosts refuse further routing (evidence for cleanup tests) */
  readonly disposed: boolean;
}

/* ── the process-level registry (idempotent open) ─────────────────────── */

const registry = new Map<string, CollabHostImpl>();

/** lookup WITHOUT creating — the dsh lane's probe */
export function findCollabHost(designDir: string): CollabHost | undefined {
  return registry.get(resolve(designDir));
}

/**
 * Open (or reuse) the collab host of a design workspace. The FIRST
 * open fixes the host's shape (watcher/adapters); later opens return
 * the same instance regardless of options — one kernel per journal.
 */
export function openCollabHost(designDir: string, options: CollabHostOptions = {}): CollabHost {
  const dir = resolve(designDir);
  const existing = registry.get(dir);
  if (existing !== undefined) return existing;
  const host = new CollabHostImpl(dir, options);
  registry.set(dir, host);
  return host;
}

/* ── implementation ────────────────────────────────────────────────────── */

interface PendingArm {
  readonly handle: unknown;
  readonly run: Promise<void>;
  readonly supersede: () => void;
}

class CollabHostImpl implements CollabHost {
  readonly designDir: string;
  readonly kernel: CollabKernel;
  readonly gate: AdmissionGate;
  readonly station: ResyncStation;

  readonly #files: ProjectionFileAdapter;
  readonly #selfWrites = new Map<PagePath, string>();
  readonly #debounceMs: number;
  readonly #scheduler: { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
  readonly #pending = new Map<PagePath, PendingArm>();
  readonly #inflight = new Set<Promise<void>>();
  readonly #pendingFlush: Promise<number>;
  /** the source bytes each page's in-flight cycle read (pending-row recovery base) */
  readonly #cycleSource = new Map<PagePath, string>();
  readonly #ownedWatcher: OwnedFileWatcher | null;
  readonly #watcherSub: HostWatcherSubscription | null;
  readonly #exitHook: (() => void) | null;
  /** the design root's realpath when it resolves (macOS /var → /private/var) */
  readonly #designBases: readonly string[];
  /** the opt-in startup reconcile sweep (settled by flush/dispose) */
  readonly #startupReconcile: Promise<void> | undefined;
  #disposed = false;

  constructor(designDir: string, options: CollabHostOptions) {
    this.designDir = designDir;
    this.#designBases = [designDir, ...realpathSafe(designDir)];
    const opened = openWorkspaceCollab(designDir); // the frozen M6a resolution
    this.kernel = opened.kernel;
    this.gate = opened.gate;

    // the guarded file adapter: page paths resolve against the design
    // root; station write-backs record their hash (the HMR loop guard);
    // a FAILED write lands a kernel `projection-pending` journal row
    // (the M6 row type) carrying the pre-write file hash as the
    // STRUCTURAL `base` field (kernel gap ② repaid — the M6b
    // reason-suffix smuggling is retired)
    const real = options.files ?? nodeProjectionFiles();
    this.#files = {
      read: (path) => real.read(this.#resolve(path)),
      writeAtomic: (path, content, expectedHash) => {
        try {
          real.writeAtomic(this.#resolve(path), content, expectedHash);
        } catch (error) {
          const page = this.#toPage(this.#resolve(path));
          const message = errorMessageOf(error);
          const source = page === null ? undefined : this.#cycleSource.get(page);
          try {
            // audit truth in the append-only kernel journal + the
            // kernel-side worklist (the row survives crashes)
            if (page !== null) {
              this.kernel.recordProjectionPending({
                path: page,
                projectionHash: expectedHash,
                reason: message,
                ...(source !== undefined ? { base: sha256(source) } : {}),
              });
            }
          } catch {
            /* the journal write failing must not mask the original error */
          }
          throw error;
        }
        const page = this.#toPage(this.#resolve(path));
        if (page !== null) this.#selfWrites.set(page, expectedHash);
      },
    };

    this.#debounceMs = options.debounceMs ?? 40;
    this.#scheduler = options.scheduler ?? {
      setTimeout: (fn, ms) => setTimeout(fn, ms),
      clearTimeout: (handle) => clearTimeout(handle as Parameters<typeof clearTimeout>[0]),
    };
    this.station = new ResyncStation(this.kernel, this.gate, { files: this.#files, debounceMs: this.#debounceMs, scheduler: this.#scheduler });
    // §8 crash recovery at open: canonical may be ahead of the files —
    // retry the station's pending-projection worklist (settled by flush())
    this.#pendingFlush = this.station.flushPendingProjections().catch(() => 0);
    // …and the KERNEL worklist recovered from the journal (kernel gap ②:
    // cross-process truth; the station's own sidecar is memory-only);
    // pushes only when the file still holds the recorded pre-write base
    // bytes, so a human edit meanwhile is never clobbered
    this.#recoverJournaledPending();
    // the startup reconcile sweep (M7 收官轮): opt-in — the design server
    // passes it; every KNOWN page runs one §8 reconcile cycle, landing
    // unhosted drift and realigning cross-era tree meta. Settled by
    // flush() (and dispose): §8 never aborts mid-cycle.
    this.#startupReconcile = options.reconcileAtOpen === true ? this.#sweepKnownPages() : undefined;

    // watcher: injected (vite — vite owns its lifecycle) or host-owned
    // (a fsWatchDesignDir walker, whether the host created it or the
    // caller handed it over — either way the HOST must close it)
    if (options.watcher !== undefined) {
      const injected = options.watcher;
      this.#ownedWatcher = isOwnedWatcher(injected) ? injected : null;
      this.#watcherSub = injected.onEvent((event) => this.routeFileEvent(event.path, event.kind));
    } else if (options.ownFsWatch === false) {
      this.#ownedWatcher = null;
      this.#watcherSub = null;
    } else {
      const owned = fsWatchDesignDir(designDir);
      this.#ownedWatcher = owned;
      this.#watcherSub = owned?.onEvent((event) => this.routeFileEvent(event.path, event.kind)) ?? null;
    }
    // best-effort handle release for un-disposed hosts at process exit
    // (sync close only — async settling cannot happen on the exit hook)
    const ownedRef = this.#ownedWatcher;
    this.#exitHook = ownedRef === null ? null : () => ownedRef.close();
    if (this.#exitHook !== null) process.once('exit', this.#exitHook);
  }

  get disposed(): boolean {
    return this.#disposed;
  }

  /** absolute file path of a page (design-relative page paths resolve) */
  #resolve(path: string): string {
    return isAbsolute(path) ? path : join(this.designDir, path);
  }

  /**
   * Absolute file → page identity, or null when the file is not a
   * design page: outside the design root, not `.svelte`, or inside a
   * dot directory (`.jx-collab/`, `.dsh-home/`, `.git/`, …).
   *
   * Path-form tolerant: watchers report REALPATHs (chokidar resolves;
   * macOS tmpdirs sit behind the /var → /private/var symlink) while
   * the probe's designDir may be unresolved — each side is tried
   * against both bases so an event never gets silently dropped.
   */
  #toPage(absPath: string): PagePath | null {
    const candidates = [absPath];
    try {
      const real = realpathSync(absPath);
      if (real !== absPath) candidates.push(real);
    } catch {
      /* deleted mid-flight — the unresolved form carries on */
    }
    for (const candidate of candidates) {
      for (const base of this.#designBases) {
        const rel = relative(base, candidate);
        if (rel.length === 0 || rel.startsWith('..') || isAbsolute(rel)) continue;
        const posix = rel.split(sep).join('/');
        if (!posix.endsWith('.svelte')) continue;
        if (posix.split('/').some((segment) => segment.startsWith('.'))) continue;
        return posix;
      }
    }
    return null;
  }

  routeFileEvent(path: string, kind: 'change' | 'add' | 'unlink'): void {
    if (this.#disposed) return;
    if (kind === 'unlink') return; // external deletion policy is deferred (§8 removal gap) — nothing to ingest
    const page = this.#toPage(this.#resolve(path));
    if (page === null) return;
    this.#arm(page);
  }

  /** per-path debounce, the station's law: latest content wins at fire time */
  #arm(page: PagePath): void {
    const pending = this.#pending.get(page);
    if (pending !== undefined) {
      this.#scheduler.clearTimeout(pending.handle);
      pending.supersede(); // the cancelled arm settles WITHOUT a cycle — the new arm owns it
    }
    let fire: () => void = () => {};
    let supersede: () => void = () => {};
    const run = new Promise<void>((resolveRun) => {
      supersede = () => resolveRun();
      fire = () => {
        this.syncExternalChange(page).then(
          () => resolveRun(),
          () => resolveRun(), // cycle failures are outcomes, not rejections, here — flush() still settles
        );
      };
    });
    this.#inflight.add(run);
    run.then(
      () => this.#inflight.delete(run),
      () => this.#inflight.delete(run),
    );
    const handle = this.#scheduler.setTimeout(() => {
      this.#pending.delete(page);
      fire();
    }, this.#debounceMs);
    this.#pending.set(page, { handle, run, supersede });
  }

  /**
   * The collapsed §8 cycle (kernel gap ① repaid): ONE direct
   * `station.ingestFile` drive — the fresh lane adopts new pages AND
   * lands existing pages' buffer drift (the M6b synthesized-envelope
   * lane is retired; the station's convergence tracking owns the
   * three-way base). A genuine 409 outcome (a pre-recorded observed
   * state that raced a canonical op) takes the envelope's rebase lane;
   * one §5.2 admission conflict mid-cycle retries once after a re-read,
   * then surfaces. The presence journal-tail follows every return
   * (deduped by seq inside the gateway — idempotent cycles are free).
   */
  async syncExternalChange(path: string): Promise<CollabSyncOutcome> {
    const outcome = await this.#syncExternalCore(path);
    this.#notifyJournalTail();
    return outcome;
  }

  async #syncExternalCore(path: string): Promise<CollabSyncOutcome> {
    if (this.#disposed) return { page: path, kind: 'skipped', detail: 'host disposed' };
    const abs = this.#resolve(path);
    const page = this.#toPage(abs);
    if (page === null) return { page: path, kind: 'skipped', detail: 'not a design page (.svelte under the design root)' };

    let conflictNote: CollabConflictNote | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let source: string;
      try {
        source = this.#files.read(abs);
      } catch (error) {
        return { page, kind: 'skipped', detail: `unreadable (${errorMessageOf(error)})` };
      }
      this.#cycleSource.set(page, source); // the pending-row recovery base

      // THE CONVERGE-ALIGNED GUARDS (M7 收官轮, the M7a root fix): the
      // echo expectation and the station's convergence marker answer for
      // bytes the file VERIFIABLY held as a projection — but canonical
      // may have advanced out-of-band since (a panel/agent op through
      // admission raises no file event), so "file == LAST projection" is
      // idempotent ONLY while it is also "file == CURRENT projection".
      // When canonical moved on, the current projection is PUSHED
      // atomically (the held bytes are the no-clobber precondition — a
      // file that moved past them answers 'moved' and takes the genuine
      // cycle below). The M7a consumption-side workaround (collab-api
      // writing the projection itself + healing the marker) retired.
      const sourceHash = sha256(source);
      const selfHash = this.#selfWrites.get(page);
      if (selfHash !== undefined) {
        // ONE-ECHO expectation: any cycle that runs with these bytes
        // consumes it (a later event reproducing old write bytes is a
        // genuine edit — the toggle-back regression, M6 收敛轮)
        this.#selfWrites.delete(page);
      }
      const convergence = this.station.fileConvergence(page);
      const held = (selfHash !== undefined && selfHash === sourceHash) || (convergence !== undefined && convergence.projectionHash === sourceHash);
      if (held) {
        const pushed = await this.station.pushCurrentProjection(page, sourceHash);
        if (pushed === 'idempotent') return { page, kind: 'idempotent' };
        if (pushed === 'written') return { page, kind: 'written' };
        if (pushed === 'pending') {
          return { page, kind: 'failed', detail: 'the out-of-band projection push failed — a projection-pending row records it (retried at the next open/drive)' };
        }
        // 'moved' / 'untracked' — the bytes raced past the verified state
        // (or the page left the protocol): the genuine §8 cycle owns it
      }

      try {
        const outcome = await this.station.ingestFile(page, source);
        if (outcome.status === 409) {
          // a genuine §8 stale envelope — the rebase lane lands its diff
          const report = await this.station.rebase(outcome);
          return {
            page,
            kind: report.idempotent ? 'idempotent' : 'rebased',
            report,
            ...(conflictNote !== undefined ? { conflict: conflictNote } : {}),
            ...deferredOf(report),
          };
        }
        return {
          page,
          kind: outcome.pageAdopted ? 'adopted' : outcome.idempotent ? 'idempotent' : 'rebased',
          report: outcome,
          ...(conflictNote !== undefined ? { conflict: conflictNote } : {}),
          ...deferredOf(outcome),
        };
      } catch (error) {
        if (error instanceof ResyncError && error.code === 'admission-rejected' && error.result !== undefined) {
          // §5.2 same-buffer conflict (409): auto-retry — re-read and
          // re-land once; the next round's base includes the winner
          conflictNote = {
            status: error.result.status,
            code: 'code' in error.result ? String(error.result.code) : 'conflict',
            ...('detail' in error.result ? { detail: String(error.result.detail) } : {}),
          };
          if (attempt === 0) continue;
          return { page, kind: 'conflict', conflict: conflictNote, detail: 'unresolved after the auto-retry — the external file keeps its bytes (never clobbered)' };
        }
        return { page, kind: 'failed', detail: errorMessageOf(error) };
      }
    }
    return { page, kind: 'failed', detail: 'unreachable — the retry loop returns within two attempts' };
  }

  async resolveStale(stale: StaleIngest): Promise<IngestReport> {
    const report = await this.station.rebase(stale);
    this.#notifyJournalTail();
    return report;
  }

  async reconcilePage(page: PagePath): Promise<CollabSyncOutcome> {
    const outcome = await this.#reconcileCore(page);
    this.#notifyJournalTail();
    return outcome;
  }

  async #reconcileCore(page: PagePath): Promise<CollabSyncOutcome> {
    if (this.#disposed) return { page, kind: 'skipped', detail: 'host disposed' };
    const abs = this.#resolve(page);
    if (this.#toPage(abs) === null) return { page, kind: 'skipped', detail: 'not a design page (.svelte under the design root)' };

    let conflictNote: CollabConflictNote | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let source: string;
      try {
        source = this.#files.read(abs);
      } catch (error) {
        return { page, kind: 'skipped', detail: `unreadable (${errorMessageOf(error)})` };
      }
      // the convergence short-circuit: a page whose file verifiably holds
      // its converged projection needs no cycle (the /usage lane calls
      // this on every selection — the fixed point must be free)
      const convergence = this.station.fileConvergence(page);
      if (convergence !== undefined && convergence.projectionHash === sha256(source)) {
        return { page, kind: 'idempotent' };
      }
      this.#cycleSource.set(page, source); // the pending-row recovery base

      try {
        const outcome = await this.station.reconcileFile(page, source);
        if (outcome.status === 409) {
          // a genuine §8 stale envelope (defensive — the fresh observe
          // cannot go stale): the rebase lane lands its diff
          const report = await this.station.rebase(outcome);
          return {
            page,
            kind: report.idempotent ? 'idempotent' : 'rebased',
            report,
            ...(conflictNote !== undefined ? { conflict: conflictNote } : {}),
            ...deferredOf(report),
          };
        }
        return {
          page,
          kind: outcome.pageAdopted ? 'adopted' : outcome.idempotent ? 'idempotent' : 'rebased',
          report: outcome,
          ...(conflictNote !== undefined ? { conflict: conflictNote } : {}),
          ...deferredOf(outcome),
        };
      } catch (error) {
        if (error instanceof ResyncError && error.code === 'admission-rejected' && error.result !== undefined) {
          // §5.2 same-buffer conflict mid-reconcile: auto-retry — re-read
          // and re-land once; the next round's base includes the winner
          conflictNote = {
            status: error.result.status,
            code: 'code' in error.result ? String(error.result.code) : 'conflict',
            ...('detail' in error.result ? { detail: String(error.result.detail) } : {}),
          };
          if (attempt === 0) continue;
          return { page, kind: 'conflict', conflict: conflictNote, detail: 'unresolved after the auto-retry — the external file keeps its bytes (never clobbered)' };
        }
        return { page, kind: 'failed', detail: errorMessageOf(error) };
      }
    }
    return { page, kind: 'failed', detail: 'unreachable — the retry loop returns within two attempts' };
  }

  /**
   * The startup sweep (opt-in `reconcileAtOpen`): ONE reconcile cycle per
   * KNOWN page (journal-replayed pages included — their convergence state
   * is unknown at open). Per-page failures degrade honestly (the next
   * /usage or open retries); the sweep settles inside flush()/dispose().
   */
  async #sweepKnownPages(): Promise<void> {
    const pages = [
      ...new Set(
        treeItemsOf(this.kernel)
          .filter((entry) => !entry.deleted && entry.page !== undefined)
          .map((entry) => entry.page!.path),
      ),
    ];
    for (const page of pages) {
      if (this.#disposed) return;
      try {
        await this.reconcilePage(page);
      } catch {
        /* the outcome lane already reported — the sweep never throws */
      }
    }
  }

  /**
   * The presence journal-tail (intent 5): read-only on the commit result —
   * the kernel's CURRENT journal row count goes to the workspace's
   * gateway when one is attached. Swallowed whole: a gateway fault (or
   * no gateway at all — standalone hosts) never reaches the §8 lane.
   */
  #notifyJournalTail(): void {
    if (this.#disposed) return;
    try {
      findPresenceGateway(this.designDir)?.notifyJournalTail(this.kernel.stats().journalSeq);
    } catch {
      /* presence is never the edit path */
    }
  }

  async flush(): Promise<void> {
    await this.#pendingFlush; // the open-time projection recovery settles too
    if (this.#startupReconcile !== undefined) await this.#startupReconcile;
    const runs = [...this.#pending.values()].map((pending) => pending.run);
    await Promise.all([...runs, ...this.#inflight]);
  }

  /**
   * §8 cross-process recovery (kernel gap ② repaid): every un-flushed
   * `projection-pending` worklist row (recovered from the journal at
   * open) whose file still holds the recorded pre-write `base` gets the
   * CURRENT canonical projection pushed atomically. A file that moved
   * on (a human edit while unhosted) keeps its bytes — the next change
   * event runs the normal drift cycle. Rows without a base marker are
   * left to the operator (conservative by construction).
   */
  #recoverJournaledPending(): void {
    for (const entry of this.kernel.pendingProjections()) {
      if (entry.base === undefined) continue;
      let current: string;
      try {
        current = this.#files.read(this.#resolve(entry.path));
      } catch {
        continue; // unreadable/absent — stays pending for the operator
      }
      if (sha256(current) !== entry.base) continue; // moved on — never clobber
      try {
        const projection = projectSource(this.kernel, entry.path).source;
        if (projection === current) {
          this.kernel.markProjectionFlushed(entry.seq); // already converged
          continue;
        }
        this.#files.writeAtomic(this.#resolve(entry.path), projection, sha256(projection));
        this.kernel.markProjectionFlushed(entry.seq);
      } catch {
        // still failing — the row stays; the next open retries
      }
    }
  }

  async dispose(): Promise<void> {
    if (this.#disposed) return;
    this.#disposed = true;
    // stop routing first: no new arms may fire after the settled state
    for (const pending of this.#pending.values()) {
      this.#scheduler.clearTimeout(pending.handle);
      pending.supersede();
    }
    this.#watcherSub?.dispose();
    this.#ownedWatcher?.close();
    if (this.#exitHook !== null) process.removeListener('exit', this.#exitHook);
    // settle whatever was already in flight — §8 never aborts mid-cycle
    await this.flush();
    if (registry.get(this.designDir) === this) registry.delete(this.designDir);
  }
}

function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** the outcome's visible §8 envelope extras: deferred entries + the write-back guard marker */
function deferredOf(report: IngestReport): Pick<CollabSyncOutcome, 'deferred' | 'writeBackGuard'> {
  return {
    ...(report.deferred !== undefined && report.deferred.length > 0 ? { deferred: report.deferred } : {}),
    ...(report.writeBackGuard !== undefined ? { writeBackGuard: true as const } : {}),
  };
}

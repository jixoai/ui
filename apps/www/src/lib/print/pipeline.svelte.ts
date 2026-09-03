/**
 * jixoai print pipeline (lib/print/pipeline.svelte.ts, print-pipeline,
 * 2026-08-30) — ONE pipeline, TWO exits (sim preview / direct print),
 * ONE artifact.
 *
 *   prepareSnapshot (freeze.svelte.ts — the transaction)
 *     → paged.js preview(clone, [kernel-print.css, compiled @page css],
 *       renderTo) with the kernel LAZY-LOADED (client-only chunk; SSR
 *       and the prerendered pages carry zero pagedjs — the
 *       verify-print bundle gate)
 *     → the rendered gate (every computed probe waits for the flow)
 *     → exit: sim-off / afterprint — idempotent cleanup of pages,
 *       head-style handles and listeners across all four paths
 *       (success / failure / afterprint / sim-off)
 *
 * THE SAME-ARTIFACT SEMANTICS (design.md «同一产物语义»): the
 * pipeline owns the artifact; it stays valid while (frozen snapshot
 * hash + stylesheet hash) hold — the direct-print exit REUSES the
 * sim's completed artifact and only rebuilds from a fresh snapshot
 * when either hash moved.
 *
 * ROOT LAW (design.md «根与并发合同»): the source root
 * [data-print-source] is never the render root; the output sibling
 * [data-print-output] is document-connected, cleared before every
 * run (a second sim never contains stale .pagedjs_pages), and
 * asserted MEASURABLE before preview (offsetWidth > 0 — paged.js
 * emits zero-size pages from a display:none root; the print-only
 * state uses OFFSCREEN positioning, never hiding).
 *
 * STAMP OWNERSHIP (the r6 CLOSED contract): only a 'print' purpose
 * starting from SCREEN self-stamps (recorded on the snapshot); an
 * existing sim stamp is reused, never owned; afterprint releases
 * ONLY the transaction's own stamp — a surviving sim re-derives the
 * medium back to 'sim' and KEEPS the artifact. Every failure road
 * AFTER a successful prepare carries the same law (codex review P1,
 * 2026-08-30): the measurability throw and the preview-phase catch
 * both release the transaction's own stamp — releaseStamp is
 * ownership-guarded, so a reused sim stamp is a structural no-op.
 *
 * FLIGHT SUPERSEDE (codex review P1, 2026-08-30): a generation
 * token — dispose(), cancel() and every NEW flight bump it. An
 * attempt that observes a bump after any await (a late
 * prepareSnapshot, a late kernel import, a late preview) is stale:
 * it unwinds ITS OWN attempt DOM, releases its own stamp and exits
 * SILENTLY (FlightSuperseded — guarded's catch skips the error
 * flip). It never publishes an artifact, never registers listeners
 * into an array dispose() already drained, never flips status. The
 * afterprint grace fallback carries the same hygiene: cleared and
 * detached on FIRST entry (the sim-survives branch never runs
 * dispose), and a stale fallback resolves without touching state.
 *
 * THE AMBIENT PRINT ENTRY (Owner directive, 2026-09-01): a print the
 * BROWSER initiates (Ctrl/Cmd+P, the menu, a foreign window.print)
 * auto-initializes the pipeline — beforeprint stamps the print pose
 * SYNCHRONOUSLY (the dialog can never print the raw screen), then
 * runs the button-print transaction async (Chromium's live print
 * preview picks the pages up as they mount); afterprint owns the
 * exit, including the dialog-closed-early settle. The listeners ride
 * their own arm/disarm pair: dispose() re-arms (the pipeline keeps
 * serving the next print), destroy() — the layer's unmount — is the
 * only disarm, ENFORCED by a destroyed flag no later dispose() can
 * undo (a late flight's error branch re-arms nothing; the run
 * entries reject).
 *
 * DIAGNOSTIC CARRIERS: the sim renders rows; direct print records
 * into the artifact metadata + the console.
 */

import { PRINT_SIM_ATTR } from '../medium.svelte';
import {
  prepareSnapshot,
  hashString,
  type FrozenSnapshot,
  type PrintDiagnostic,
  type PrintProgress,
} from './freeze.svelte';
import { compilePageCss, parsePageConfig } from './page-config';
import {
  awaitSettledLayout,
  relocateStrandedKeeps,
  resyncStringSets,
  stampSplitDashes,
} from './relocate';
// the kernel stylesheet, as TEXT — the only form preview() receives;
// sim-shell.css never appears below (the preview-inputs runtime spy)
import kernelPrintCss from './kernel-print.css?raw';

export type PrintStatus = 'idle' | 'preparing' | 'rendering' | 'ready' | 'error';

export interface PrintRunOptions {
  /** the page grammar (PrintPageConfig) — structured values only */
  config?: PrintPageConfig | unknown;
  /** the clone transform bits (default: gutter on, ToC on) */
  lineNumbers?: boolean;
  toc?: boolean;
  tocLabel?: string;
  /** readiness budget passed through to the transaction */
  timeoutMs?: number;
}

export interface PrintArtifactMetadata {
  pages: number;
  /** monotonic per-BUILD id: unchanged when a later exit REUSES the
   *  artifact (the mounted-artifact fast path) — the zero-rebuild
   *  signal the gates assert on */
  renderId: number;
  snapshotHash: string;
  stylesheetHash: string;
  purpose: 'sim' | 'print';
  createdStamp: boolean;
  /** stranded keep-with-next carriers the pipeline relocated into
   *  their continuation halves (pagedjs's own avoid backwalk is
   *  blind to breaks that start deep inside the next block) */
  keepRelocated: number;
  /** cut avoid blocks reunited with their split pair — the heading
   *  strand's dominant shape (a section header's eyebrow or
   *  eyebrow+title shipped at a page bottom while the rest moved
   *  on; relocate.ts reassembles the block on the pair's page) */
  keepRejoined: number;
  diagnostics: PrintDiagnostic[];
  transfer: {
    applied: number;
    writes: {
      path: number[];
      slot: number;
      animationName: string;
      c: number;
      d: number;
      D: number;
      N: number;
      delayPrime: number | null;
    }[];
  };
  at: number;
}

interface Artifact {
  readonly snapshotHash: string;
  readonly stylesheetHash: string;
  readonly outputRoot: HTMLElement;
  readonly headStyles: Element[];
  metadata: PrintArtifactMetadata;
}

const ACTIVE_ATTR = 'data-jx-print-active';

/** the supersede abort (codex review P1, 2026-08-30): thrown by a
 *  stale flight's resumption points. guarded's catch recognizes the
 *  shape and exits SILENTLY — the invalidator (dispose/cancel/a
 *  newer flight) owns the pipeline state by then, so a superseded
 *  attempt must not flip status to 'error' nor rethrow at the caller */
class FlightSuperseded extends Error {
  constructor() {
    super('[print/pipeline] flight superseded — disposed/cancelled while in flight');
    this.name = 'FlightSuperseded';
  }
}

export interface PrintPipeline {
  readonly status: PrintStatus;
  readonly progress: PrintProgress | undefined;
  readonly diagnostics: PrintDiagnostic[];
  readonly pageCount: number;
  readonly lastError: string | undefined;
  readonly artifactMetadata: PrintArtifactMetadata | undefined;
  /** the sim exit — the toggle stamps FIRST (the preparatory signal),
   *  then this runs the transaction and the preview */
  runSim(options?: PrintRunOptions): Promise<void>;
  /** the direct-print exit — prepareSnapshot completes, then
   *  window.print(); afterprint owns the exit */
  runPrint(options?: PrintRunOptions): Promise<void>;
  /** PREWARM (Owner r7): resolve the async准备工作 before a print
   *  exit wants it — the header icon's bytes as a data URI (the
   *  margin-box stamp goes synchronous) and the pagedjs chunk at
   *  idle (the lazy-client-only bundle law holds; the bytes are
   *  simply warm). PrintDoc calls this at mount off its live
   *  printOptions getter. Never throws — a bad config fails loud
   *  at the flight, not here */
  prewarm(options?: PrintRunOptions): Promise<void>;
  /** sim off: the CALLER removes its own stamp; this disposes the artifact */
  closeSim(): void;
  /** cancel: preparation-phase abort; post-preview best-effort
   *  (remove the output root + destroy the artifact handle) */
  cancel(): void;
  dispose(): void;
  /** TERMINAL teardown — the print layer's unmount: dispose() plus
   *  the ambient print entry's disarm, BEHIND a destroyed flag that
   *  no later dispose() (a late flight's error branch, an external
   *  call) can undo — the run entries reject afterwards (a disposed
   *  pipeline still serves the next print; a destroyed one serves
   *  nothing, enforced) */
  destroy(): void;
}

export function createPrintPipeline(
  getSourceRoot: () => HTMLElement | undefined,
  ambientOptions?: () => PrintRunOptions | undefined,
): PrintPipeline {
  let status = $state<PrintStatus>('idle');
  let progress = $state<PrintProgress | undefined>(undefined);
  let diagnostics = $state<PrintDiagnostic[]>([]);
  let pageCount = $state(0);
  let lastError = $state<string | undefined>(undefined);
  let artifactMetadata = $state<PrintArtifactMetadata | undefined>(undefined);

  let artifact: Artifact | undefined;
  let inFlight: Promise<void> | undefined;
  /** PER-FLIGHT "preview entered" gate — reset at every guarded entry
   *  (a stale true left by a previous flight would misroute cancel()
   *  into the post-preview branch while the new attempt is still
   *  preparing — the cross-flight leak, codex review P1 2026-08-30);
   *  dispose clears it too */
  let previewEntered = false;
  /** the generation token (codex review P1, 2026-08-30): bumped by
   *  dispose()/cancel()/every new flight — an attempt that observes a
   *  bump after any await is stale and must unwind, not publish */
  let generation = 0;
  /** the in-flight transaction's abort handle (cancel() reaches it) */
  let controllerRef: AbortController | undefined;
  /** the transaction whose stamp the afterprint hook may release */
  let liveSnapshot: FrozenSnapshot | undefined;
  /** AMBIENT PRINT (Owner directive, 2026-09-01): the settle handle of
   *  an ambient flight's afterprint wait + whether that afterprint has
   *  already fired (a dialog that closed before the render finished —
   *  the flight settles itself at completion instead of waiting for an
   *  event that already passed) */
  let ambientSettle: (() => void) | undefined;
  let ambientAfterprintSeen = true;
  /** the direct-print afterprint wait's settle handle — dispose()/
   *  cancel() end the wait THROUGH it (the 400ms grace fallback is a
   *  headless backstop, not the only way the promise clears; codex r2) */
  let pendingPrintSettle: (() => void) | undefined;
  /** TERMINAL, and ENFORCED (codex r3): once the layer left the tree,
   *  every later dispose() (a late flight's error branch, an external
   *  call) cleans state but never re-arms the ambient entry, and the
   *  run entries reject instead of resurrecting the layer */
  let destroyed = false;
  const ownedListeners: (() => void)[] = [];
  const cssCache = new Map<string, string>();
  /** the stamped sim bar's live handle (Owner r7) — the pipeline owns
   *  the bar's stage text; detached with the output root it rode */
  let simBar: HTMLElement | undefined;
  /** the flight's post-ready mend, armed by run() at ready and FIRED
   *  by guarded() at the flight's tail (the sim path at return; the
   *  print paths inside settlePrintExit) — never scheduled while a
   *  flight is mid-wait, so timer-hygiene contracts stay clean */
  let pendingFlightMend: (() => void) | undefined;
  /** monotonic per-BUILD render id — a reuse never bumps it */
  let renderSeq = 0;
  /** the PREWARMED header-icon bytes (Owner r7): margin-box content
   *  css cannot carry images and a post-render img.src races the
   *  print dialog — PrintDoc prewarms at mount, the bytes land here
   *  as a data URI, and the stamp is synchronous for both exits */
  const headerIconCache = new Map<string, string>();

  /** resolve the icon to stampable bytes: the cache when prewarmed,
   *  a bounded in-flight fetch otherwise (a cold ambient print), the
   *  raw URL as the best-effort fallback on failure */
  const ensureHeaderIcon = async (icon: string): Promise<string> => {
    const cached = headerIconCache.get(icon);
    if (cached !== undefined) return cached;
    try {
      const blob = await fetch(icon).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      const dataUri = `data:${blob.type || 'image/svg+xml'};base64,${btoa(binary)}`;
      headerIconCache.set(icon, dataUri);
      return dataUri;
    } catch {
      return icon; // the URL rides as-is; the sim has time to load it
    }
  };

  const parsedSignature = (options: PrintRunOptions | undefined): string =>
    JSON.stringify([
      parsePageConfig(options?.config ?? {}),
      options?.lineNumbers ?? true,
      options?.toc ?? true,
      options?.tocLabel ?? 'contents',
    ]);

  const pageCssFor = (options: PrintRunOptions | undefined): string => {
    const signature = parsedSignature(options);
    let css = cssCache.get(signature);
    if (css === undefined) {
      css = compilePageCss(parsePageConfig(options?.config ?? {}));
      cssCache.set(signature, css);
    }
    return css;
  };

  const stylesheetHashFor = (options: PrintRunOptions | undefined): string =>
    hashString(`${parsedSignature(options)}\u0000${pageCssFor(options)}`);

  /** returns the TARGETED un-listen: detaches the listener AND splices
   *  its own registry entry — a short-lived waiter (the afterprint
   *  hook) that settles itself must not leave its closure in the
   *  dispose-drained array until the next dispose (codex r2, P1-4) */
  const addListener = (
    target: { addEventListener: typeof window.addEventListener },
    type: string,
    listener: EventListener,
  ): (() => void) => {
    target.addEventListener(type, listener);
    const unlisten = (): void => {
      target.removeEventListener(type, listener);
      const at = ownedListeners.indexOf(unlisten);
      if (at !== -1) ownedListeners.splice(at, 1);
    };
    ownedListeners.push(unlisten);
    return unlisten;
  };

  const removeOwnedListeners = (): void => {
    while (ownedListeners.length) ownedListeners.pop()();
  };

  /** the render root: connected, cleared before every run, measurable */
  const ensureOutputRoot = (standby: boolean): HTMLElement => {
    let root = document.querySelector<HTMLElement>('[data-print-output]');
    if (root === null) {
      root = document.createElement('div');
      root.setAttribute('data-print-output', '');
      root.setAttribute('data-jx-print-root', ''); // probe handle
      document.body.appendChild(root);
    }
    root.textContent = ''; // the second sim never contains stale pages
    if (standby) root.setAttribute('data-print-standby', '');
    else root.removeAttribute('data-print-standby');
    return root;
  };

  const stampActive = (on: boolean): void => {
    if (on) document.documentElement.setAttribute(ACTIVE_ATTR, '');
    else document.documentElement.removeAttribute(ACTIVE_ATTR);
  };

  /** The ToC folio backfill (vision r3): page numbers are a static
   *  fact of the FINISHED layout, so once preview has placed every
   *  section the pipeline stamps each nav anchor with
   *  data-jx-folio = the target's real page. attr() beats
   *  target-counter here: pagedjs's own resolver loses targets whose
   *  block was moved by keep-with-next (the moved clone sheds its
   *  id), and [data-id] survives every id-shedding path — the same
   *  read the sim's click-takeover uses. Same philosophy as the line
   *  gutter's data-line. */
  const fillTocFolios = (outputRoot: HTMLElement): void => {
    for (const anchor of [...outputRoot.querySelectorAll<HTMLAnchorElement>('nav[data-jx-print-toc] a[href^="#"]')]) {
      const id = anchor.getAttribute('href')?.slice(1);
      if (!id) continue;
      const escaped = (window.CSS && CSS.escape) ? CSS.escape(id) : id;
      const target =
        outputRoot.querySelector(`#${escaped}`) ??
        outputRoot.querySelector(`[data-id="${escaped}"]`);
      const pageNo = target?.closest('.pagedjs_page')?.getAttribute('data-page-number');
      if (pageNo) anchor.setAttribute('data-jx-folio', pageNo);
    }
  };

  /** the running header's brand mark (Owner acceptance r5, 2026-09-01):
   *  margin-box content css cannot carry images — after layout, every
   *  top-LEFT margin box carrying header content gets the configured
   *  icon as its first child (the ::after title text follows; the icon
   *  reads left of it on ONE line, r7). The bytes arrive prewarmed as
   *  a data URI (PrintDoc.prewarm) — synchronous, no network race
   *  between the preview and the export */
  const stampHeaderIcons = (
    outputRoot: HTMLElement,
    icon: string | undefined,
    withTitle: boolean,
  ): number => {
    if (!icon || !withTitle) return 0;
    let stamped = 0;
    for (const box of outputRoot.querySelectorAll<HTMLElement>(
      '.pagedjs_margin-top-left .pagedjs_margin-content',
    )) {
      const img = document.createElement('img');
      img.src = icon;
      img.alt = '';
      img.className = 'jx-print-header-icon';
      box.prepend(img);
      stamped++;
    }
    return stamped;
  };

  /** the sim ToC click takeover: ids repeat between source and pages —
   *  native anchors would jump into the LIVE tree; we scroll the
   *  output stack to the page carrying the target instead */
  const wireTocTakeover = (outputRoot: HTMLElement): void => {
    const onClick = (event: MouseEvent): void => {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!anchor || !outputRoot.contains(anchor)) return;
      const id = anchor.getAttribute('href')?.slice(1);
      if (!id) return;
      const holder = outputRoot.querySelector(`.pagedjs_page [data-id="${CSS.escape(id)}"]`);
      const page = holder?.closest('.pagedjs_page');
      if (page) {
        event.preventDefault();
        page.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
      }
    };
    addListener(outputRoot, 'click', onClick as EventListener);
  };

  /** the sim overlay's own control bar (Owner r7): stamped the moment
   *  a VISIBLE flight starts — BEFORE pagedjs renders anything, so the
   *  dynamic re-layout is watched through the bar's stage text, never
   *  a silent void — carrying [data-jx-print-bar-status] (fed from the
   *  pipeline's own status/progress surface at every transition) and
   *  buttons that stay disabled until the artifact is ready. The
   *  overlay covers the live controls, so it drives the same exits
   *  through document-level custom events (the controls' event
   *  protocol — kept symmetrical with probes).
   *
   *  THE r9 LAYOUT (Owner acceptance): [copy | actions] — the two
   *  texts STACK inside [data-jx-print-bar-copy] as a label
   *  ([data-jx-print-bar-title]) over a description
   *  ([data-jx-print-bar-status]); the button group
   *  ([data-jx-print-bar-actions]) rides the right edge. The stamp
   *  attribute names are a gate contract (verify-print + lifecycle
   *  specs) — the nesting may change, the names never */
  const stampSimBar = (outputRoot: HTMLElement, ready: boolean): void => {
    if (simBar?.isConnected) {
      syncSimBar(ready);
      return;
    }
    const bar = document.createElement('div');
    bar.setAttribute('data-jx-print-sim-bar', '');
    const copy = document.createElement('div');
    copy.setAttribute('data-jx-print-bar-copy', '');
    const title = document.createElement('span');
    title.setAttribute('data-jx-print-bar-title', '');
    title.textContent = 'print-pipeline · sim';
    const status_ = document.createElement('span');
    status_.setAttribute('data-jx-print-bar-status', '');
    copy.append(title, status_);
    const actions = document.createElement('div');
    actions.setAttribute('data-jx-print-bar-actions', '');
    const print_ = document.createElement('button');
    print_.type = 'button';
    print_.setAttribute('data-jx-print-bar-print', '');
    print_.textContent = '打印 / 导出 PDF';
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('data-jx-print-bar-toggle', '');
    close.textContent = '退出预览';
    actions.append(print_, close);
    bar.append(copy, actions);
    outputRoot.prepend(bar);
    simBar = bar;
    const fire = (name: string) => () => document.dispatchEvent(new CustomEvent(name));
    bar.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-jx-print-bar-print]')) fire('jx-print-direct')();
      else if (target.closest('[data-jx-print-bar-toggle]')) fire('jx-print-sim-toggle')();
    });
    ownedListeners.push(() => {
      bar.remove();
      if (simBar === bar) simBar = undefined;
    });
    syncSimBar(ready);
  };

  /** the bar's stage text, derived from the pipeline's reactive
   *  surface — the same fields the app-side controls read */
  const syncSimBar = (ready: boolean): void => {
    if (simBar === undefined) return;
    const statusEl = simBar.querySelector<HTMLElement>('[data-jx-print-bar-status]');
    if (statusEl !== null) {
      statusEl.textContent =
        status === 'preparing'
          ? `preparing${progress ? ` · ${progress.phase} ${progress.done}/${progress.total}` : ''}`
          : status === 'rendering'
            ? 'rendering pages…'
            : status === 'error'
              ? `error: ${lastError ?? ''}`
              : status === 'ready'
                ? `${pageCount} pages · ready`
                : '';
    }
    const printBtn = simBar.querySelector<HTMLButtonElement>('[data-jx-print-bar-print]');
    if (printBtn !== null) printBtn.disabled = !ready;
  };

  const collectHeadStyles = (before: Element[]): Element[] => {
    const known = new Set(before);
    return [...document.head.children].filter((el) => !known.has(el));
  };

  const removeArtifactDom = (target: Artifact | undefined): void => {
    if (target === undefined) return;
    target.outputRoot.remove();
    for (const style of target.headStyles) style.remove();
  };

  /** THIS ATTEMPT's unwinder (codex review P1, 2026-08-30): the output
   *  root + every head style inserted since the attempt began + the
   *  active stamp. Serves both roads that fail BEFORE an artifact
   *  handle exists (dispose() cannot reach this DOM — `artifact` is
   *  still undefined while a preview pends): the preview-phase catch
   *  and the stale-flight resumption gates */
  const teardownAttempt = (outputRoot: HTMLElement, headBefore: Element[]): void => {
    outputRoot.remove();
    for (const style of collectHeadStyles(headBefore)) style.remove();
    stampActive(false);
  };

  /** IDEMPOTENT cleanup — all four paths land here (success / failure /
   *  afterprint / sim-off): pages, head-style handles, listeners. The
   *  pipeline SURVIVES dispose (the next sim/print reuses it), so the
   *  ambient print entry re-arms at the end — only destroy() (the
   *  layer's unmount) takes it down for good */
  const dispose = (): void => {
    // invalidate any in-flight attempt FIRST (codex review P1,
    // 2026-08-30): its late continuations must not publish DOM nor
    //  register listeners into the array this function is about to drain
    generation++;
    // a pending ambient wait must not outlive the state that owns it —
    // settle it STALE (the flight's exit checks the token and leaves
    // the state to this invalidator)
    ambientAfterprintSeen = true;
    ambientSettle?.();
    ambientSettle = undefined;
    // the direct-print wait settles through its own handle — release,
    // hygiene and the promise clear NOW, not on the 400ms backstop
    // (codex r2, P1-4: dispose must not depend on an unmanaged timer)
    pendingPrintSettle?.();
    pendingPrintSettle = undefined;
    removeArtifactDom(artifact);
    artifact = undefined;
    removeOwnedListeners();
    stampActive(false);
    liveSnapshot = undefined;
    previewEntered = false;
    pageCount = 0;
    status = 'idle';
    // the terminal gate (codex r3): on a destroyed pipeline dispose
    // still cleans, but NEVER re-arms — a late flight's error branch
    // lands here after destroy() and must not put the unmounted
    // layer's listeners back on the window
    if (!destroyed) armAmbient();
  };

  const publishMetadata = (target: Artifact): void => {
    artifactMetadata = target.metadata;
    // the probe surface: the built page exposes the artifact's truth
    // without any window global
    target.outputRoot.dataset.jxPrintMeta = JSON.stringify(target.metadata);
  };

  const run = async (
    purpose: 'sim' | 'print',
    options: PrintRunOptions | undefined,
    signal: AbortSignal,
    gen: number,
  ): Promise<FrozenSnapshot> => {
    const root = getSourceRoot();
    if (root === undefined || !root.isConnected) {
      throw new Error('[print/pipeline] no connected [data-print-source] root');
    }
    status = 'preparing';
    lastError = undefined;
    progress = undefined;

    const snapshot = await prepareSnapshot(root, {
      purpose,
      lineNumbers: options?.lineNumbers ?? true,
      toc: options?.toc ?? true,
      tocLabel: options?.tocLabel,
      timeoutMs: options?.timeoutMs,
      signal,
      onProgress: (p) => {
        progress = p;
        syncSimBar(false);
      },
    });
    // ── the supersede gate, checkpoint 1 (codex review P1,
    //    2026-08-30): dispose()/cancel() may have landed while the
    //    transaction sat between awaits. A stale attempt touches NO
    //    pipeline state — it only unwinds the stamp it owns
    //    (prepareSnapshot already resumed what it paused before
    //    returning); releaseStamp is a no-op for a reused sim stamp
    if (gen !== generation) {
      snapshot.releaseStamp();
      throw new FlightSuperseded();
    }
    diagnostics = snapshot.diagnostics;
    liveSnapshot = snapshot;

    // a config the grammar rejects is fail-loud input — but it lands
    // AFTER the transaction self-stamped (config is a public unknown
    // boundary; parsePageConfig throws). The release law holds on
    // this road too (codex r2, P1-5): the self-stamp unwinds before
    // the throw reaches guarded's dispose-only catch
    let stylesheetHash: string;
    let parsedConfig: ReturnType<typeof parsePageConfig>;
    try {
      stylesheetHash = stylesheetHashFor(options);
      parsedConfig = parsePageConfig(options?.config ?? {});
    } catch (error) {
      snapshot.releaseStamp();
      throw error;
    }
    const current = artifact;
    if (
      current !== undefined &&
      current.snapshotHash === snapshot.hash &&
      current.stylesheetHash === stylesheetHash
    ) {
      // the SAME completed artifact serves both exits — no rebuild
      if (purpose === 'sim') {
        current.outputRoot.removeAttribute('data-print-standby');
        stampSimBar(current.outputRoot, true);
      }
      publishMetadata(current);
      pageCount = current.metadata.pages;
      status = 'ready';
      syncSimBar(true);
      return snapshot;
    }

    // invalidated (or none): rebuild from THIS frozen snapshot
    removeArtifactDom(current);
    artifact = undefined;

    // standby = a direct print that started from SCREEN (this
    // transaction self-stamped — no sim artifact is on screen). An
    // existing sim keeps its overlay; the prepared stamp is OURS.
    const standby = purpose === 'print' && snapshot.createdStamp;
    const outputRoot = ensureOutputRoot(standby);
    const headBefore = [...document.head.children];
    stampActive(true);
    // the bar precedes the render (Owner r7): a visible flight shows
    // its stages from the first frame, never a silent void
    if (!standby) stampSimBar(outputRoot, false);

    // ── the measurability assertion (fail-loud, never zero-size pages)
    if (outputRoot.offsetWidth <= 0) {
      outputRoot.remove();
      stampActive(false);
      // a failure road AFTER a successful prepare still unwinds the
      // transaction's own self-stamp (codex review P1, 2026-08-30) —
      // without this a screen→direct-print that dies here strands
      // data-jx-print-sim on the source and the medium sticks on 'sim'
      snapshot.releaseStamp();
      throw new Error(
        `[print/pipeline] the output root is not measurable (offsetWidth=${outputRoot.offsetWidth}) — paged.js would emit zero-size pages; use offscreen positioning, not display:none`,
      );
    }
    previewEntered = true;

    try {
      status = 'rendering';
      syncSimBar(false);
      // ── the lazy client-only kernel chunk (SSR carries zero pagedjs)
      const { Previewer } = await import('pagedjs');
      // ── the supersede gate, checkpoint 2: the chunk pended — a
      //    dispose/cancel may own the state by now
      if (gen !== generation) throw new FlightSuperseded();
      const previewer = new Previewer();
      // the clone rides in a DocumentFragment: paged.js's walker
      // breaks on element roots (findElement/replaceOrAppend null
      // path), while a fragment renders cleanly — and a fragment IS
      // the "detached from the live tree" handoff the design demands
      const fragment = document.createDocumentFragment();
      fragment.appendChild(snapshot.clone);
      // the token-color mapping (Owner r7): the freeze moved Shiki's
      // inline color:var(--tok-*) OFF the token spans (pagedjs's
      // UndisplayedFilter marks [style] elements data-undisplayed and
      // the chunker goes blind inside the code — the swallowed-tail
      // root cause); this stylesheet restores the colors class-backed
      const tokenCss = snapshot.tokenKinds
        .map((variable) => `.jx-tk-${variable.slice('--tok-'.length)} { color: var(${variable}); }`)
        .join('\n');
      const flow = await previewer.preview(
        fragment,
        [
          { 'jx-kernel-print.css': kernelPrintCss },
          { 'jx-page.css': pageCssFor(options) },
          ...(tokenCss ? [{ 'jx-tok.css': tokenCss }] : []),
        ],
        outputRoot,
      );
      // ── the supersede gate, checkpoint 3 (the LAST await): the
      //    preview resolved after a dispose/cancel — publishing now
      //    would resurrect the artifact dispose() removed and push
      //    listeners into the array it drained. Unwind instead; the
      //    catch below is the shared unwinder
      if (gen !== generation) throw new FlightSuperseded();
      const pages =
        Number(flow?.total) || outputRoot.querySelectorAll('.pagedjs_page').length;
      // the header icon's bytes resolve HERE (Owner r7): prewarmed,
      // the cache answers synchronously; a cold flight pays one
      // bounded fetch before the stamp — the export and the preview
      // then agree, no network race at dialog time
      const headerIcon = parsedConfig.headerIcon
        ? await ensureHeaderIcon(parsedConfig.headerIcon)
        : undefined;
      if (gen !== generation) throw new FlightSuperseded();
      // ── THE ENFORCEMENT SWEEP: settle → mend → re-settle, capped.
      // pagedjs's flow promise can resolve while a late re-chunk
      // still shifts geometry WITHOUT observable mutations (the live
      // probe watched a cut eyebrow half sit mutation-quiet for
      // 100ms at a mid-page slot, then ride 942px to its resting
      // page-bottom slot) — a pure WAIT cannot see that tail. So the
      // mend is DETECTION-driven: each sweep measures the layout it
      // finds, mends what fits, and only stops when a settled layout
      // needs nothing; a sweep that acted on a transient is healed
      // by the next (the pass's own detection certifies the product)
      let keepRelocated = 0;
      let keepRejoined = 0;
      for (let sweep = 0; sweep < 3; sweep++) {
        await awaitSettledLayout(outputRoot);
        if (gen !== generation) throw new FlightSuperseded();
        const mended = relocateStrandedKeeps(outputRoot);
        keepRelocated += mended.relocated;
        keepRejoined += mended.rejoined;
        if (mended.relocated === 0 && mended.rejoined === 0) break;
      }
      const built: Artifact = {
        snapshotHash: snapshot.hash,
        stylesheetHash,
        outputRoot,
        headStyles: collectHeadStyles(headBefore),
        metadata: {
          pages,
          renderId: ++renderSeq,
          snapshotHash: snapshot.hash,
          stylesheetHash,
          purpose,
          createdStamp: snapshot.createdStamp,
          keepRelocated,
          keepRejoined,
          diagnostics: snapshot.diagnostics,
          transfer: {
            applied: snapshot.transfer.applied,
            writes: snapshot.transfer.writes.flatMap((write) =>
              write.slots.map((slot) => ({
                path: [...slot.path],
                slot: slot.slot,
                animationName: slot.animationName,
                c: slot.c,
                d: slot.d,
                D: slot.D,
                N: slot.N,
                delayPrime: slot.delayPrime,
              })),
            ),
          },
          at: Date.now(),
        },
      };
      artifact = built;
      publishMetadata(built);
      pageCount = pages;
      // the post-layout passes BEFORE the rendered gate — every
      // computed probe sees the dash-stamped blocks, the quieted
      // ancestor chain + the folios (relocate.ts: the dash is a
      // BLOCK judgment — only boxed-card cuts draw it)
      stampSplitDashes(outputRoot);
      // a moved h2 changes what a page's running head names — the
      // string-set vars pagedjs froze per page are re-derived from
      // the FINAL DOM (relocate.ts)
      resyncStringSets(outputRoot);
      fillTocFolios(outputRoot);
      // the running header's brand mark (config already validated by
      // the stylesheet hash road above — no rethrow path here)
      stampHeaderIcons(
        outputRoot,
        headerIcon,
        parsedConfig.header?.['top-left'] !== undefined,
      );
      // the overlay UX rides any mounted artifact while the sim stamp
      // is live — sim builds AND direct-print rebuilds over a sim
      if (!standby) {
        wireTocTakeover(outputRoot);
        stampSimBar(outputRoot, true);
      }
      status = 'ready';
      syncSimBar(true);
      // ── THE POST-READY MEND, ARMED (fired at the flight's tail):
      // pagedjs's re-chunk tail can re-slot a split half into its
      // resting position well after any flight bounded wait (the
      // live probe watched a cut eyebrow half ride 942px on a tail
      // no settle window caught) — so detection runs ONCE MORE on
      // the rested layout, off the critical path. The generation +
      // artifact-identity guards retire the mend against dispose/
      // cancel/a newer build; a mend re-derives the dash layers, the
      // running-head vars and the folios, and republishes the
      // metadata (Chromium's live print preview picks the pages up
      // as they mutate — the ambient entry's own mechanism)
      pendingFlightMend = (): void => {
        void (async () => {
          await awaitSettledLayout(outputRoot, 2500, 400);
          if (gen !== generation || artifact !== built || destroyed) return;
          try {
            const mended = relocateStrandedKeeps(outputRoot);
            if (mended.relocated === 0 && mended.rejoined === 0) return;
            built.metadata.keepRelocated += mended.relocated;
            built.metadata.keepRejoined += mended.rejoined;
            stampSplitDashes(outputRoot);
            resyncStringSets(outputRoot);
            fillTocFolios(outputRoot);
            publishMetadata(built);
            syncSimBar(true);
          } catch {
            // best-effort upkeep — a failure leaves the published
            // artifact exactly as the flight rendered it
          }
        })();
      };
      return snapshot;
    } catch (error) {
      // the failure road: best-effort teardown of this attempt's DOM.
      // PLUS the stamp release (codex review P1, 2026-08-30): every
      // road that fails AFTER a successful prepare unwinds the stamp
      // this transaction self-created — releaseStamp is
      // ownership-guarded (a reused sim stamp is a no-op), and
      // prepareSnapshot's OWN catch has already released on its
      // failures, so this can never double-release
      teardownAttempt(outputRoot, headBefore);
      snapshot.releaseStamp();
      throw error;
    }
  };

  const guarded = async (
    purpose: 'sim' | 'print',
    options?: PrintRunOptions,
    ambient = false,
  ): Promise<void> => {
    if (destroyed) {
      // the terminal gate (codex r3): a destroyed pipeline serves
      // nothing — a retained external reference must not resurrect
      // the unmounted layer's output
      return Promise.reject(
        new Error('[print/pipeline] destroyed — the print layer left the tree; a new layer owns the next print'),
      );
    }
    if (inFlight !== undefined) return inFlight; // single-flight
    const gen = ++generation; // this flight's token — retires any zombie attempt
    previewEntered = false; // never inherit a previous flight's phase
    const controller = new AbortController();
    controllerRef = controller;
    const flight = (async () => {
      // ── the MOUNTED-ARTIFACT fast path (Owner r7, the bar's print
      //    button): a COMPLETED artifact on screen IS the print
      //    authority — the ambient beforeprint entry has honored a
      //    mounted sim this way since r6. Re-running prepareSnapshot
      //    would hash a live animation's phase, invalidate the cache,
      //    tear the visible overlay down and rebuild it page by page
      //    (the "collapses into chaos, then recovers" the Owner
      //    watched). Print what is on screen; changed content
      //    re-opens the sim. (Never ambient: the ambient entry itself
      //    no-ops on a mounted artifact — window.print would stack a
      //    second dialog on the open one)
      const reuse = purpose === 'print' && !ambient && artifact !== undefined;
      let releaseStamp: (() => void) | undefined;
      if (reuse) {
        pageCount = artifact.metadata.pages;
        status = 'ready';
        syncSimBar(true);
      } else {
        const snapshot = await run(purpose, options, controller.signal, gen);
        releaseStamp = () => snapshot.releaseStamp();
        if (purpose !== 'print') {
          // the sim flight ends here — its artifact is the product;
          // the post-ready mend starts now (guarded internally)
          pendingFlightMend?.();
          pendingFlightMend = undefined;
          return;
        }
      }
      // the print-exit law, shared by both entries: release ONLY the
      // transaction's own stamp (a surviving sim re-derives the medium
      // and keeps the artifact); on a superseded wait the invalidator
      // owns the state, so the flight resolves without flipping it
      const settlePrintExit = (): void => {
        releaseStamp?.();
        pendingFlightMend?.(); // a disposed road retires it at its first gate
        pendingFlightMend = undefined;
        if (gen !== generation) return;
        const root = getSourceRoot();
        const simSurvives = root?.hasAttribute(PRINT_SIM_ATTR) ?? false;
        if (!simSurvives) dispose();
        else status = 'ready';
      };
      if (ambient) {
        // ── the AMBIENT exit: the browser already opened its dialog
        //    (beforeprint kicked this flight) — calling window.print()
        //    here would stack a SECOND dialog. The exit is the
        //    afterprint that ends the print in progress; a dialog that
        //    closed before the render finished settles at once (the
        //    artifact never outlives the print that requested it)
        if (!ambientAfterprintSeen) {
          await new Promise<void>((resolve) => {
            ambientSettle = resolve;
          });
        }
        settlePrintExit();
        return;
      }
      // ── the direct-print exit: prepareSnapshot has COMPLETED; the
      //    real dialog upgrades the medium ('print' > 'sim'); the
      //    afterprint hook is the only exit
      await new Promise<void>((resolve) => {
        let settled = false;
        let fallback: ReturnType<typeof setTimeout> | undefined;
        let unlisten: (() => void) | undefined;
        // ONE settle owns the whole exit (codex r1 P1-4 + r2): the
        // grace timer, the window listener AND its registry entry,
        // the settle handle dispose/cancel reach — idempotent through
        // the settled guard
        const settle = (): void => {
          if (settled) return;
          settled = true;
          pendingPrintSettle = undefined;
          if (fallback !== undefined) clearTimeout(fallback);
          unlisten?.();
          settlePrintExit();
          resolve();
        };
        pendingPrintSettle = settle;
        unlisten = addListener(window, 'afterprint', settle as EventListener);
        // the grace fallback arms BEFORE the modal call (codex r2,
        // P1-4): an embedded environment whose print() dispatches
        // afterprint SYNCHRONOUSLY settles inside the call — the
        // timer must already exist for settle to clear it. Production
        // window.print() is modal and blocks the event loop, so
        // arming early cannot fire mid-dialog; without a real
        // afterprint the fallback is what clears the headless stub
        fallback = setTimeout(settle, 400);
        window.print();
      });
    })();
    inFlight = flight;
    try {
      await flight;
    } catch (error) {
      if (error instanceof FlightSuperseded) {
        // a superseded attempt has already unwound its own DOM and
        // stamp; the invalidator owns the pipeline state — silent
        // exit, no error flip, no rethrow at the caller
        return;
      }
      lastError = error instanceof Error ? error.message : String(error);
      dispose();
      status = 'error';
      // the failure's own stack (fail-loud diagnostics; the structured
      // rows below are the contract carriers)
      console.error('[print/pipeline] run failed:', error);
      // direct print's diagnostic carrier: the console
      for (const row of diagnostics) {
        console.warn(`[print/pipeline] ${row.code}: ${row.owner} — ${row.message}`);
      }
      throw error;
    } finally {
      if (inFlight === flight) inFlight = undefined;
      if (controllerRef === controller) controllerRef = undefined;
    }
  };

  /** THE AMBIENT PRINT ENTRY (Owner directive, 2026-09-01): a print
   *  the BROWSER initiates (Ctrl/Cmd+P, the menu, a foreign
   *  window.print) fires beforeprint synchronously as its dialog
   *  opens — there is no await-room inside the handler and no
   *  cancelling the dialog. The synchronous half is the POSE: the
   *  active stamp hides the app shell through @media print at once,
   *  so the dialog can never print the raw screen. The async half is
   *  the very transaction the print button runs (prepare → paged
   *  preview → the standby mount); Chromium's print preview is LIVE
   *  (it re-renders as the DOM mutates), so the pages appear in the
   *  open dialog as they mount. afterprint owns the exit.
   *
   *  The listeners ride their OWN arm/disarm pair, NOT addListener:
   *  dispose() drains the owned array after every print exit, and the
   *  pipeline must keep serving the NEXT ambient print — dispose()
   *  re-arms; only destroy() (the print layer's unmount) disarms. */
  const onAmbientBeforePrint = (): void => {
    // the terminal gate's belt (codex r3): disarm already removed us,
    // but a destroy() racing this dispatch must be a no-op too
    if (destroyed) return;
    // ours already owns the pose — a mounted artifact (the sim), or
    // our own print flight (its window.print() fired this event)
    if (inFlight !== undefined || artifact !== undefined) return;
    const root = getSourceRoot();
    if (root === undefined || !root.isConnected) return; // nothing printable: the raw print stands
    ambientAfterprintSeen = false;
    stampActive(true); // synchronous — the pose beats the dialog
    void guarded('print', ambientOptions?.(), true).catch(() => {
      // guarded surfaces failures (lastError, status, console)
    });
  };
  const onAmbientAfterPrint = (): void => {
    ambientAfterprintSeen = true;
    ambientSettle?.();
    ambientSettle = undefined;
  };
  let ambientArmed = false;
  // SSR-inert: the pipeline's creation touches no browser global (the
  // print layer prerenders on the server, where beforeprint cannot
  // fire) — the entry arms on the client, and dispose()'s re-arm is a
  // no-op there too
  const armAmbient = (): void => {
    if (ambientArmed || typeof window === 'undefined') return;
    ambientArmed = true;
    window.addEventListener('beforeprint', onAmbientBeforePrint);
    window.addEventListener('afterprint', onAmbientAfterPrint);
  };
  const disarmAmbient = (): void => {
    if (!ambientArmed || typeof window === 'undefined') return;
    ambientArmed = false;
    window.removeEventListener('beforeprint', onAmbientBeforePrint);
    window.removeEventListener('afterprint', onAmbientAfterPrint);
  };
  armAmbient();

  return {
    get status() {
      return status;
    },
    get progress() {
      return progress;
    },
    get diagnostics() {
      return diagnostics;
    },
    get pageCount() {
      return pageCount;
    },
    get lastError() {
      return lastError;
    },
    get artifactMetadata() {
      return artifactMetadata;
    },
    async runSim(options) {
      await guarded('sim', options);
    },
    async runPrint(options) {
      await guarded('print', options);
    },
    async prewarm(options) {
      if (typeof window === 'undefined') return; // creation stays browser-free
      try {
        const parsed = parsePageConfig(options?.config ?? {});
        if (parsed.headerIcon !== undefined) {
          await ensureHeaderIcon(parsed.headerIcon);
        }
      } catch {
        // prewarm never throws — an invalid config fails loud at the flight
      }
      // the kernel chunk, fetched at idle: never competes with page
      // load, warm before any print exit wants it
      const warm = (): void => {
        void import('pagedjs').catch(() => {});
      };
      if (typeof requestIdleCallback === 'function') requestIdleCallback(() => warm());
      else setTimeout(warm, 500);
    },
    closeSim() {
      dispose();
    },
    cancel() {
      // invalidate any in-flight attempt (codex review P1,
      // 2026-08-30): the signal abort only unwinds the preparation
      // phase's budget waits — a prepareSnapshot/import/preview that
      // already raced past the last checkpoint must still die at its
      // next resumption gate
      generation++;
      if (inFlight !== undefined) {
        if (!previewEntered) {
          // preparation-phase cancellation: the transaction aborts
          // through its signal
          controllerRef?.abort();
        } else {
          // post-preview: best-effort — remove the output root and
          // destroy the artifact handle
          dispose();
        }
      } else dispose();
    },
    dispose,
    destroy() {
      // TERMINAL, and enforced (codex r3): the flag lands FIRST —
      // abort any in-flight preparation, then the (guarded) dispose
      // cleans without re-arming, then the disarm. A late flight's
      // error branch may still call dispose() after this; the flag
      // holds. Idempotent.
      destroyed = true;
      controllerRef?.abort();
      dispose();
      disarmAmbient();
    },
  };
}

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
  snapshotHash: string;
  stylesheetHash: string;
  purpose: 'sim' | 'print';
  createdStamp: boolean;
  /** stranded keep-with-next carriers the pipeline relocated into
   *  their continuation halves (pagedjs's own avoid backwalk is
   *  blind to breaks that start deep inside the next block) */
  keepRelocated: number;
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

  /** the split-dash normalization (vision r3): pagedjs marks the
   *  WHOLE rebuilt ancestor chain with data-split-from/to, so a naive
   *  per-element dashed rule stacks seven deep at one cut edge — a
   *  thick sawtooth band. The INNERMOST marked element owns the dash;
   *  every marked element whose subtree still carries the same-side
   *  marker is an ancestor layer and gets data-jx-split-outer, which
   *  the kernel rule excludes. Runs on the mounted pages, both exits
   *  (the sim overlay and the standby paper see the same product). */
  const quietOuterSplitDashes = (outputRoot: HTMLElement): void => {
    for (const el of [...outputRoot.querySelectorAll('[data-split-to]')]) {
      if (el.querySelector('[data-split-to]')) el.setAttribute('data-jx-split-outer', '');
    }
    for (const el of [...outputRoot.querySelectorAll('[data-split-from]')]) {
      if (el.querySelector('[data-split-from]')) el.setAttribute('data-jx-split-outer', '');
    }
  };

  /** the keep-with-next ENFORCEMENT (vision r4): pagedjs consumes the
   *  break-after: avoid declaration (data-break-after) but its own
   *  backwalk is blind to a break that starts deep inside the next
   *  block — a code card's head strip or a section card's header
   *  strand alone at a page's bottom edge over dead space, their body
   *  moved whole. The pipeline enforces the keep on the FINISHED
   *  layout: a stamped carrier whose subtree is the page's last
   *  rendered content, whose host (figure/section) continues on a
   *  later page, moves INTO that continuation half — pagedjs's
   *  rebuilds preserve data-ref, so the halves pair up. The emptied
   *  half drops; the cut dash lands on real content. */
  const relocateStrandedKeeps = (outputRoot: HTMLElement): number => {
    let moved = 0;
    const pages = [...outputRoot.querySelectorAll<HTMLElement>('.pagedjs_page')];
    for (let i = 0; i < pages.length - 1; i++) {
      const content = pages[i].querySelector<HTMLElement>('.pagedjs_page_content');
      if (!content) continue;
      // the page's last rendered content = its bottom-most visible
      // LEAF (containers own the bottom edge through padding — the
      // stranded carrier hides INSIDE the outermost container)
      let deepest: HTMLElement | null = null;
      let deepestBottom = -Infinity;
      for (const el of content.querySelectorAll<HTMLElement>('*')) {
        const rect = el.getBoundingClientRect();
        if (rect.height <= 1) continue;
        let leaf = true;
        for (const child of el.children) {
          if ((child as HTMLElement).getBoundingClientRect().height > 1) {
            leaf = false;
            break;
          }
        }
        if (leaf && rect.bottom > deepestBottom) {
          deepestBottom = rect.bottom;
          deepest = el;
        }
      }
      if (!deepest) continue;
      // the stranded carrier: the OUTERMOST avoid-stamped ancestor of
      // that content whose host carries a data-ref (the figure/section
      // pagedjs re-identified across the break)
      const carriers: HTMLElement[] = [];
      for (let el: HTMLElement | null = deepest; el && el !== content; el = el.parentElement) {
        if (el.getAttribute('data-break-after') === 'avoid') carriers.push(el);
      }
      const carrier = carriers
        .reverse()
        .find((el) => (el.parentElement?.getAttribute('data-ref') ?? '') !== '');
      const host = carrier?.parentElement ?? null;
      const ref = host?.getAttribute('data-ref');
      if (!carrier || !host || !ref) continue;
      // the continuation half: same ref, split-from, on a LATER page
      const continuation = pages
        .slice(i + 1)
        .map((p) => p.querySelector<HTMLElement>(`[data-ref="${CSS.escape(ref)}"][data-split-from]`))
        .find((el): el is HTMLElement => el !== null);
      if (!continuation) continue;
      continuation.prepend(carrier);
      moved++;
      // a half emptied by the move is a dead strip — its dash would
      // cut at nothing (the figcaption-only figure half)
      if (host.hasAttribute('data-split-to') && !host.querySelector('*')) host.remove();
    }
    return moved;
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

  /** the sim overlay's own control bar: the overlay covers the live
   *  controls, so it carries a close button + a direct-print button,
   *  driving the same exits through document-level custom events (the
   *  controls' event protocol — kept symmetrical with probes) */
  const stampSimBar = (outputRoot: HTMLElement): void => {
    const bar = document.createElement('div');
    bar.setAttribute('data-jx-print-sim-bar', '');
    const title = document.createElement('span');
    title.textContent = 'print-pipeline · sim';
    const print_ = document.createElement('button');
    print_.type = 'button';
    print_.setAttribute('data-jx-print-bar-print', '');
    print_.textContent = '打印 / 导出 PDF';
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('data-jx-print-bar-toggle', '');
    close.textContent = '退出预览';
    bar.append(title, print_, close);
    outputRoot.prepend(bar);
    const fire = (name: string) => () => document.dispatchEvent(new CustomEvent(name));
    bar.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-jx-print-bar-print]')) fire('jx-print-direct')();
      else if (target.closest('[data-jx-print-bar-toggle]')) fire('jx-print-sim-toggle')();
    });
    ownedListeners.push(() => bar.remove());
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
      onProgress: (p) => (progress = p),
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
    try {
      stylesheetHash = stylesheetHashFor(options);
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
        if (!current.outputRoot.querySelector('[data-jx-print-sim-bar]')) {
          stampSimBar(current.outputRoot);
        }
      }
      publishMetadata(current);
      pageCount = current.metadata.pages;
      status = 'ready';
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
      const flow = await previewer.preview(
        fragment,
        [
          { 'jx-kernel-print.css': kernelPrintCss },
          { 'jx-page.css': pageCssFor(options) },
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
      // the keep enforcement runs on the finished layout, BEFORE the
      // metadata freezes (the count rides meta.keepRelocated) and
      // BEFORE the dash normalization (relocation may drop emptied
      // halves — the quiet pass must see the final split tree)
      const keepRelocated = relocateStrandedKeeps(outputRoot);
      const built: Artifact = {
        snapshotHash: snapshot.hash,
        stylesheetHash,
        outputRoot,
        headStyles: collectHeadStyles(headBefore),
        metadata: {
          pages,
          snapshotHash: snapshot.hash,
          stylesheetHash,
          purpose,
          createdStamp: snapshot.createdStamp,
          keepRelocated,
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
      // computed probe sees the quieted ancestor chain + the folios
      quietOuterSplitDashes(outputRoot);
      fillTocFolios(outputRoot);
      // the overlay UX rides any mounted artifact while the sim stamp
      // is live — sim builds AND direct-print rebuilds over a sim
      if (!standby) {
        wireTocTakeover(outputRoot);
        stampSimBar(outputRoot);
      }
      status = 'ready';
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
      const snapshot = await run(purpose, options, controller.signal, gen);
      if (purpose !== 'print') return;
      // the print-exit law, shared by both entries: release ONLY the
      // transaction's own stamp (a surviving sim re-derives the medium
      // and keeps the artifact); on a superseded wait the invalidator
      // owns the state, so the flight resolves without flipping it
      const settlePrintExit = (): void => {
        snapshot.releaseStamp();
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

<!--
  @jixoai/ui-design (studio) — the default studio shell (T4 + r2
  T4/T5/T6 selection integration + T8 panel mount + T11 updates badge).

  Intents (5, a single-surface compromise — layout is not split out):
    1. navigator + preview grid: list canvases from the manifest, show
       the selected canvas in a full-width iframe tab; frame ids deep-
       link by appending #<id> to the iframe src (canvas anchors are
       the kit's DOM contract). r3 #20: the frames anchor LIST is gone
       — the frames live as `page:` folders inside the unified treeView
       (component-tree.svelte), and their anchor action rides the
       tree's onAnchorFrame up-call (same selectCanvas path, same hash
       semantics). Manifest polling is GATED (#12/T0):
       a structurally unchanged response never rewrites $state, and
       the panel receives selectionFile (a primitive), not a table.
       The first-pull gate (design-studio-acceptance §2): until ONE
       fetch has completed (ok or failed) the navigator renders the
       loading line — `manifest.length === 0` alone never asserts
       "no prototypes yet".
       r3 T4 skin: the canvas rows are the host's REAL list-item
       family (#jixoai/ link rows, intercepted activation — semantics
       untouched) and the drift badge is the badge item; .studio-canvas
       / .studio-updates-badge survive as the walkthrough scripts' DOM
       hooks, not as chrome (.studio-frame rows are retired with the
       list; the class remains on the error-retry buttons only).
       r3 issue #21: the preview tab DELEGATES to StageView
       (stage-view.svelte) — the zoom/pan/fit camera is its own file,
       this shell keeps only the iframe seam (canvasIframe) for the
       tree; no sixth intent lands here.
    2. the CONSTANT three-column grid (r3 T2, ID1/ID10): nav 15rem |
       stage 1fr | inspector 24rem — the columns never move with
       selection (no .studio-with-panel fourth column; the stage
       iframe is never re-laid-out by a pick). The inspector's two
       zones: the property panel on top (min 40%), chat/guide tabs
       below — both tabs stay MOUNTED (the inactive side gets the
       hidden attribute), so chat state survives switches.
    3. the ONE selection state (r2): window.__jixoaiDesignSelect is
       the picker's same-origin up-call target; the ComponentTreeView,
       the chat chip and the property panel all read the same state.
       Canvas switches clear it (the frames it addressed are gone) —
       that remains the ONLY clear path (r3 T2 re-layout added none).
       The sessionStorage RESTORE drives DOWN too (design-studio-
       acceptance §1 恢复): the stored record rides the tree-pick
       seam (__jixoaiDesignHighlight) to its canvas document once one
       is live — the ring rebuilds from the same source as the panel.
    4. the property panel mount (r2 T8, re-homed by r3 T2): the
       inspector's top zone — ALWAYS present; unselected is the empty
       state's flow guide, not a blank. M7a: the chat-streaming
       read-only lock is RETIRED — the panel edits ride the collab op
       lane and the admission gate arbitrates concurrency (a racing
       agent turn auto-merges or raises the panel's inline conflict
       card); panel edits reach frames through the canonical
       projection's server-side write-back + HMR.
    5. promotion drift badge (r2 T11): the navigator's canvases carry
       an "updates" badge when their promoted files lag the design
       file (the promotions.json status endpoint, A's pipeline); the
       badge expands to the changelog intent + per-file diffs. r3 T4:
       the badge paint is the badge item (jx-hue-warning tonal); the
       family ships no interactive badge (span only) — the toggle
       stays a chrome-less button carrying it (ledger Q2).

  Original need: Owner 2026-09-11 (design-studio T4; design-studio-r2
  T4/T5/T8/T11). r3 P1 (issue #10): the dogfooding MAIN PATH — this
  shell imports the host's real components through the design server's
  #jixoai/ alias (rebuild-plan §2.1); the r1 HOST DECOUPLING LAW is
  retired. Residual studio CSS is layout skeleton + studio-specific
  spacing only. Svelte 5 runes throughout ($state/$derived/$effect).
-->
<script module lang="ts">
  // the picker-facing seam, installed at MODULE level (GATE-0 relay,
  // 2026-09-12): assignments inside $.user_effect vanish on fresh
  // loads (see the comment at the listener below) — module scope is
  // the proven-sticky surface. The seam relays through a CustomEvent;
  // it lives for the page's whole life and needs no cleanup.
  if (typeof window !== 'undefined') {
    const seams = window as unknown as import('./selection.ts').DesignStudioSeams;
    seams.__jixoaiDesignSelect = (incoming: import('./selection.ts').DesignSelection | null): void => {
      window.dispatchEvent(new CustomEvent('jx-design:select', { detail: incoming }));
    };
    // the hover twin (#31): the picker calls it on canvas hover — the
    // tree listens and highlights the matching row (same relay law)
    seams.__jixoaiDesignHover = (incoming: import('./selection.ts').DesignSelection | null): void => {
      window.dispatchEvent(new CustomEvent('jx-design:hover', { detail: incoming }));
    };
  }
</script>

<script lang="ts">
  // the dogfooding main path (r3 T4, issue #10): the host's REAL
  // components via the design server's #jixoai/ alias
  import { untrack } from 'svelte';
  import Badge from '#jixoai/badge';
  import Empty from '#jixoai/empty';
  import Separator from '#jixoai/separator';
  import { Item, ItemContent, ItemTitle } from '#jixoai/list-item';
  import ChatPanel from './chat-panel.svelte';
  import ComponentTree from './component-tree.svelte';
  import {
    manifestSignature,
    promotionsSignature,
    type ManifestEntry,
    type PromotionFileStatus,
  } from './equivalence.ts';
  import GuidePanel from './guide-panel.svelte';
  import PropertyPanel from './property-panel.svelte';
  import StageView from './stage-view.svelte';
  import {
    PresenceStore,
    browserPresenceSocket,
    type AttentionFocus,
    type CursorSurface,
    type PresenceSnapshot,
    type RemotePlayer,
    type SelfView,
  } from './presence-store.ts';
  import { applyBrandHue, hslHueToOklchHue, playerHueCss, ribbonOf } from './presence-visuals.ts';
  import {
    FRAME_NAME_PREFIX,
    type DesignFrameSeams,
    type DesignHighlightTarget,
    type DesignSelection,
    type DesignStudioSeams,
  } from './selection.ts';

  export interface ShellEndpoints {
    manifestUrl?: string;
    chatUrl?: string;
    agentInfoUrl?: string;
    knowledgeUrl?: string;
    promotionsUrl?: string;
  }

  let {
    manifestUrl = '/__design__/api/manifest.json',
    chatUrl = '/__design__/api/chat',
    agentInfoUrl = '/__design__/api/agent.json',
    knowledgeUrl = '/__design__/api/knowledge.json',
    promotionsUrl = '/__design__/api/promotions.json',
  }: ShellEndpoints = $props();

  /** promotion drift status — THREE-state (loading/ok/error, r3 T0/ID6):
   *  a failed fetch is NOT "no drift"; the two must stay distinguishable */
  type PromotionsState =
    | { readonly phase: 'loading' }
    | { readonly phase: 'ok'; readonly statuses: readonly PromotionFileStatus[] }
    | { readonly phase: 'error' };

  let manifest: ManifestEntry[] = $state([]);
  let currentName: string | null = $state(null);
  let manifestError: string | null = $state(null);
  /** the manifest's first-pull gate (design-studio-acceptance §2): has
   *  at least ONE fetch completed (ok OR failed)? Until it has, the
   *  navigator shows the loading line — `manifest.length === 0` alone
   *  must never assert "no prototypes yet" (absent is not empty) */
  let manifestLoadedOnce = $state(false);
  /** the ONE selection (r2 T4): picker and tree both feed this */
  let selection: DesignSelection | null = $state(null);
  /** the live canvas iframe (the tree walks its DOM, same-origin) */
  let canvasIframe: HTMLIFrameElement | null = $state(null);
  /** the open updates-badge proto (null = all collapsed) */
  let updatesOpen: string | null = $state(null);
  /** the inspector's bottom-zone tab (r3 T2): chat is the default
   *  (high frequency); guide is the low-frequency lookup. Both panels
   *  stay MOUNTED — the inactive side gets the hidden attribute, so
   *  chat state (draft, message flow, streaming) survives switches */
  let railTab: 'chat' | 'guide' = $state('chat');
  /** promotion drift status (r2 T11 contract; three-state as of r3 T0/ID6) */
  let promotions: PromotionsState = $state({ phase: 'loading' });

  /* ── collab-presence §4: the shell's presence state (store-fed) ────── */

  /** the store's snapshot copy — svelte renders this, never the store */
  let presenceStatus = $state<import('./presence-store.ts').PresenceStatus>('idle');
  let presenceSelf = $state<SelfView | null>(null);
  let presencePlayers = $state<readonly RemotePlayer[]>([]);

  // #12 T0 layer 1 — source equivalence gates: the last ACCEPTED
  // signature per source. Non-reactive on purpose (never rendered);
  // a poll that matches it writes NOTHING, so downstream derived
  // identities (and the panel seed effect) see zero churn.
  let manifestGate: string | null = null;
  let promotionsGate: string | null = null;
  // last-writer-wins guards: a slow STALE response landing after a
  // newer one must not overwrite it (that bounce is flicker too)
  let manifestRequest = 0;
  let promotionsRequest = 0;

  const current = $derived(manifest.find((entry) => entry.name === currentName) ?? null);
  // ?studio=1 puts the canvas doc in kit STUDIO MODE (#24): natural-
  // size matrix + metrics reporting + the ⌘wheel relay — the embed's
  // contract with its document
  const previewSrc = $derived(current === null ? null : `${current.path}?studio=1`);

  /**
   * The panel's edit target (#12 T0 layer 2): the selection's frame →
   * root-relative source file, resolved to a PRIMITIVE here — the
   * panel's seed effect depends on no table object, so manifest
   * identity churn can never reach it, only a real path change can.
   * '' addresses the canvas document itself (frameId-null picks);
   * frames without a ref resolve to null (the panel's read-only path).
   */
  const selectionFile = $derived.by(() => {
    if (current === null) return null;
    const frameId = selection?.frameId ?? '';
    if (frameId === '') return `design/prototypes/${current.name}/canvas.svelte`;
    const ref = (current.frames ?? []).find((frame) => frame.id === frameId)?.ref;
    return ref === undefined ? null : `design/prototypes/${current.name}/${ref.replace(/^\.\//, '')}`;
  });

  /** drifted promotions grouped per proto — the badge source (ok data only) */
  const updatesByProto = $derived.by(() => {
    const grouped = new Map<string, PromotionFileStatus[]>();
    if (promotions.phase !== 'ok') return grouped;
    for (const status of promotions.statuses) {
      if (!status.drifted) continue;
      const bucket = grouped.get(status.proto) ?? [];
      bucket.push(status);
      grouped.set(status.proto, bucket);
    }
    return grouped;
  });

  async function refreshManifest(): Promise<void> {
    const request = ++manifestRequest;
    try {
      const response = await fetch(manifestUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const next = (await response.json()) as ManifestEntry[];
      if (request !== manifestRequest) return; // a newer poll already landed
      // source equivalence gate (#12 T0 layer 1): a structurally
      // identical poll writes NOTHING — current/selectionFile keep
      // their identities, the panel seed effect never re-seeds
      const signature = manifestSignature(next);
      if (signature !== manifestGate) {
        manifestGate = signature;
        manifest = next;
      }
      manifestError = null;
      // §2: a completed pull (ok or failed) lifts the first-pull gate
      manifestLoadedOnce = true;
      // first landing prefers the scaffold's welcome demo — the
      // manifest otherwise opens on whatever sorts first (V5 catch:
      // it landed on a broken probe canvas)
      const preferred = manifest.find((entry) => entry.name === 'welcome') ?? manifest[0];
      if (currentName === null && preferred !== undefined) currentName = preferred.name;
      if (currentName !== null && !manifest.some((entry) => entry.name === currentName)) {
        currentName = preferred !== undefined ? preferred.name : null;
      }
    } catch (cause) {
      if (request === manifestRequest) {
        manifestError = cause instanceof Error ? cause.message : String(cause);
        // §2: a FAILED first pull still completes the pull — the error
        // line owns the message, the loading line leaves
        manifestLoadedOnce = true;
      }
    }
  }

  /**
   * Selection persistence across vite's full-reload broadcasts (T3's
   * cross-task finding, 2026-09-12): every design/ file write (a prop
   * edit, an agent turn) makes the dev server broadcast full-reload to
   * ALL connected clients — the studio page reloads even though the
   * change only concerned the canvas iframe's graph, and the selection
   * died with it mid-walkthrough. sessionStorage restores it. Writes
   * happen at the explicit mutation sites (event contexts — the effect
   * ghost below taught us not to assign globals from effect bodies;
   * sessionStorage calls from effects are equally unproven, and the
   * explicit sites cost four lines).
   */
  const SELECTION_STORE_KEY = 'jx-design:selection';
  /** the stored record rides the canvas it was picked on: usageIndex
   *  is FILE-scoped, so the same number on another canvas names a
   *  DIFFERENT usage — a record that lands on the wrong canvas
   *  restores nothing (the acceptance-review B2 blind spot: a wrong-
   *  canvas drive either rings an unrelated usage forever or retries
   *  into eternity). */
  interface StoredSelection {
    canvas: string;
    selection: DesignSelection;
  }
  function restoreStoredSelection(): StoredSelection | null {
    try {
      const raw = sessionStorage.getItem(SELECTION_STORE_KEY);
      if (raw === null) return null;
      const parsed = JSON.parse(raw) as Partial<StoredSelection>;
      if (typeof parsed.canvas !== 'string' || parsed.selection === null || typeof parsed.selection !== 'object') {
        return null; // a legacy or foreign record restores nothing
      }
      return parsed as StoredSelection;
    } catch {
      return null;
    }
  }
  function persistSelection(): void {
    try {
      if (selection === null) sessionStorage.removeItem(SELECTION_STORE_KEY);
      else if (currentName !== null) {
        sessionStorage.setItem(SELECTION_STORE_KEY, JSON.stringify({ canvas: currentName, selection }));
      }
    } catch {
      /* private mode etc. — persistence is best-effort */
    }
  }

  /* ── the restore's DOWN drive (design-studio-acceptance §1 恢复 /
   *    task 1.4): a restored selection must reach its canvas document —
   *    a panel selection over a ring-less canvas was the asymmetry. The
   *    canvas (and its frames) load long after bootstrap, so the record
   *    stays PENDING until a live document accepts it; any selection
   *    that is not the restored record itself (a live pick drove its
   *    own document, a canvas switch cleared) retires the drive. */

  let restoreDrive: DesignSelection | null = null;
  /** the drive's identity key: $state DEEP-PROXIES the selection on
   *  assignment (svelte 5), so object identity can never compare — the
   *  serialized record is the stable identity (a live pick of the SAME
   *  usage re-drives the same ring; only a DIFFERENT record retires) */
  let restoreDriveKey = '';

  /* the restore gate: bootstrap stashes the record, but the canvas
   *  only lands when the first manifest pull resolves (the studio
   *  always reopens on the preferred canvas — the picker's canvas is
   *  NOT persisted). Until the name lands the record waits; a name
   *  MISMATCH drops it: usageIndex is file-scoped, so the "same"
   *  number on this canvas names a different usage — restoring it
   *  would drive the ring onto an unrelated element (the acceptance
   *  review's B2 blind spot). */
  let pendingRestore: StoredSelection | null = null;
  $effect(() => {
    if (currentName === null || pendingRestore === null) return;
    const stored = pendingRestore;
    pendingRestore = null;
    if (stored.canvas !== currentName) return; // a record from another canvas restores nothing
    // OUT of the tracking scope (the select-bus effect below owns the
    // ghost story: a synchronous dispatch tracks itself into a flush
    // loop — the microtask escapes)
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent('jx-design:select', { detail: stored.selection }));
      // the DOWN drive: the record is the panel's selection now — its
      // ring is owed on the canvas once a document is ready
      restoreDrive = stored.selection;
      restoreDriveKey = JSON.stringify(stored.selection);
    });
  });

  /** the tree-pick seam precedent (component-tree.svelte pick): the
   *  selection's frame id → the kit iframe's contentWindow → its
   *  __jixoaiDesignHighlight. False while the target document is not
   *  ready (no frame window / no seam yet) — the driver retries */
  function driveHighlightDown(target: DesignSelection): boolean {
    const element = canvasIframe;
    if (element === null) return false;
    const doc = element.contentDocument;
    if (doc === null) return false;
    const contentWindow: Window | null =
      target.frameId === null
        ? element.contentWindow
        : (Array.from(doc.querySelectorAll('iframe')).find(
            (frame) => frame.name === `${FRAME_NAME_PREFIX}${target.frameId}`,
          )?.contentWindow ?? null);
    const seams = contentWindow as (Window & DesignFrameSeams) | null;
    if (seams === null || typeof seams.__jixoaiDesignHighlight !== 'function') return false;
    // READINESS: the seam registers at picker init — BEFORE the canvas
    // svelte mount renders its stamps. A call into an empty document
    // highlights nothing and the drive would consume itself ringless
    // (probe-caught). The picker's own elementFor lookup is the
    // oracle: the usage's stamp must already exist in the target doc.
    const targetDoc = contentWindow.document;
    if (targetDoc === null || targetDoc.querySelector(`[data-jx-instance="${target.usageIndex}"]`) === null) {
      return false;
    }
    seams.__jixoaiDesignHighlight({
      usageIndex: target.usageIndex,
      iterationIndex: target.iterationIndex,
    } satisfies DesignHighlightTarget);
    return true;
  }

  // the drive's freshness bus (the tree's law, GATE-0): the canvas
  // iframe's load event covers the document itself, the light poll
  // covers the nested frames that load after it. The element is
  // captured once — cleanup runs after onIframe has already nulled
  // the reactive prop; the selection read stays UNTRACKED (a tracked
  // read would rewire this bus on every selection change)
  $effect(() => {
    if (canvasIframe === null) return;
    const element = canvasIframe;
    const attempt = (): void => {
      if (restoreDrive === null) return;
      const liveKey = untrack(() => (selection === null ? 'null' : JSON.stringify(selection)));
      if (liveKey !== restoreDriveKey) {
        restoreDrive = null; // a live pick owns the ring — it drove its own document
        return;
      }
      if (driveHighlightDown(restoreDrive)) restoreDrive = null;
    };
    attempt();
    const timer = setInterval(attempt, 1000);
    element.addEventListener('load', attempt);
    return () => {
      clearInterval(timer);
      element.removeEventListener('load', attempt);
    };
  });

  /** the tree's page-folder anchor (#32): a CAMERA move handed to the
   *  stage — never an iframe src change (the hash-append reloaded every
   *  frame per click); the nonce re-fires for repeat clicks */
  let anchorRequest = $state<{ frameId: string; nonce: number } | null>(null);
  let anchorNonce = 0;

  function selectCanvas(name: string): void {
    currentName = name;
    // the selection addressed the PREVIOUS canvas's frames — gone
    selection = null;
    persistSelection();
  }

  // selection IS attention (presence-liveness P1): picking a component
  // tells every studio WHERE this player works — the panel's field focus
  // outranks it while held
  $effect(() => {
    const store = presenceStoreRef;
    if (store === null) return;
    if (panelFocusHeld) return; // the tie-break holds
    if (selection === null) {
      store.reportAttention(null);
      return;
    }
    const id = selection.componentId ?? null;
    if (id === null) return; // unaddressable picks stay local
    // the kit-addressed selection (walkthrough R2): the same component id
    // lives in MULTIPLE kits (mobile/desktop variants of one file) — the
    // source kit rides the attention so the remote ring lands in the kit
    // the pick happened in, never blindly in DOM-order kit #1
    store.reportAttention({ kind: 'canvas', component: id, instance: null, frameId: selection.frameId ?? null });
  });

  // the canvas-mount re-push (walkthrough R2 A4): the roster forward is
  // edge-triggered on store notifies — when the canvas iframe lands
  // AFTER welcome (slow first manifest pull), that forward dropped on a
  // null target and idle players never reached the overlay (the late
  // joiner saw nothing until someone moved). Every iframe bind re-sends
  // the current roster snapshot — and again on the iframe's LOAD: at
  // bind the document is often still about:blank, and messages posted
  // there die with it.
  $effect(() => {
    const target = canvasIframe;
    const storeNow = presenceStoreRef;
    if (target === null || storeNow === null) return;
    forwardPresenceToCanvas(storeNow.snapshot());
    const onCanvasLoad = (): void => forwardPresenceToCanvas(storeNow.snapshot());
    target.addEventListener('load', onCanvasLoad);
    return () => target.removeEventListener('load', onCanvasLoad);
  });

  // the picker's up-call seam (GATE-0 relay, 2026-09-12): a window
  // property assigned INSIDE $.user_effect vanished between the
  // assignment and the next statement on fresh page loads (module-
  // level assignments to the same name stick; direct evaluate sticks;
  // post-HMR re-evaluation sticks — platform ghost, filed in the
  // problems ledger). The relay uses only proven mechanisms: the
  // picker-facing seam installs at MODULE level (see below the
  // component) and dispatches a CustomEvent this effect listens for.
  // The RESTORE rides the same bus once it clears the canvas gate
  // above — bootstrap only stashes the record here (pendingRestore),
  // the gate effect re-dispatches it on the canvas it belongs to.
  $effect(() => {
    const onSelectEvent = (event: Event): void => {
      selection = (event as CustomEvent<DesignSelection | null>).detail;
      persistSelection();
    };
    window.addEventListener('jx-design:select', onSelectEvent);
    const stored = restoreStoredSelection();
    if (stored !== null) pendingRestore = stored; // the gate effect picks it up (canvas must land first)
    return () => window.removeEventListener('jx-design:select', onSelectEvent);
  });

  // manifest bootstrap + light polling: new prototypes (agent writes)
  // appear in the navigator without a manual reload; the promotions
  // status rides the same cadence (the badge refreshes after every
  // save/promote/apply — A's endpoint re-reads per request)
  $effect(() => {
    void refreshManifest();
    void refreshPromotions();
    const timer = setInterval(() => {
      void refreshManifest();
      void refreshPromotions();
    }, 4000);
    return () => clearInterval(timer);
  });

  async function refreshPromotions(): Promise<void> {
    const request = ++promotionsRequest;
    try {
      const response = await fetch(promotionsUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as { promotions?: PromotionFileStatus[] };
      if (request !== promotionsRequest) return; // stale response — drop
      const next = payload.promotions ?? [];
      // source equivalence gate (#12 T0 layer 1): an identical poll
      // keeps the ok-state's identity — the badge data never churns.
      // A phase transition (loading/error → ok) always writes.
      const signature = promotionsSignature(next);
      if (promotions.phase !== 'ok' || signature !== promotionsGate) {
        promotionsGate = signature;
        promotions = { phase: 'ok', statuses: next };
      }
    } catch {
      // ID6 (r3 T0): a failed fetch is NOT "no drift" — three-state
      // keeps them distinguishable (the error line + retry below);
      // badges stay absent but never fake an all-converged studio
      if (request === promotionsRequest) promotions = { phase: 'error' };
    }
  }

  /** the promotions retry affordance (ID6): the explicit loading lock —
   *  the error line leaves while the refetch is in flight, and the
   *  4s-poll/refresh guard makes double clicks harmless */
  function retryPromotions(): void {
    promotions = { phase: 'loading' };
    void refreshPromotions();
  }

  /* ── collab-presence §4: the store wiring + the shell indicators ──── */

  /** the remote players worth rendering indicators for (online, not
   *  self) — the CHIP list keeps offline rows (design §4: the list
   *  shows the offline state), the indicators do not */
  const remotePlayers = $derived(
    presencePlayers.filter((player) => player.online && player.playerId !== presenceSelf?.playerId),
  );
  /** every non-self player, online or not — the chips list */
  const chipPlayers = $derived(
    presencePlayers.filter((player) => player.playerId !== presenceSelf?.playerId),
  );
  /** remote panel foci — fed to the property panel's IN-PANEL rendering
   *  (presence-visuals ruling 4: focusWithIn + selection live on the
   *  field rows themselves; the shell overlay lane is retired; the
   *  selection {start,end} passthrough is presence-liveness P4) */
  const panelFoci = $derived(
    remotePlayers
      .filter((player) => player.attention !== null && player.attention.kind === 'panel')
      .map((player) => {
        const focus = player.attention as Extract<AttentionFocus, { kind: 'panel' }>;
        return { playerId: player.playerId, name: player.name, colorHue: player.colorHue,
                 field: focus.field, ...(focus.selection !== undefined ? { selection: focus.selection } : {}) };
      }),
  );
  /** remote tree attentions — the rainbow-ribbon feed (ruling 3) */
  const remoteTreeAttentions = $derived(
    remotePlayers
      .filter((player) => player.attention !== null && player.attention.kind === 'canvas')
      .map((player) => {
        const focus = player.attention as Extract<AttentionFocus, { kind: 'canvas' }>;
        return { playerId: player.playerId, colorHue: player.colorHue, componentId: focus.component, online: true };
      }),
  );
  /** the nav ribbon: which canvas each player sits on — the local
   *  cursor's canvas counts too (presence-liveness P5's self-first
   *  law: ownCursor mirrors the jx-design:local-cursor uplink the
   *  store already forwards; the store's own snapshot never carries
   *  self, and a human always has a mouse, gateway §1) */
  let ownCursor = $state<string | null>(null);
  const navRibbons = $derived.by(() => {
    const byCanvas = new Map<string, number[]>();
    const light = (canvas: string, hue: number): void => {
      const list = byCanvas.get(canvas) ?? [];
      list.push(hue);
      byCanvas.set(canvas, list);
    };
    // the LOCAL order is self first, then the joining ordinal (the
    // remote roster arrives already ordinal-sorted from the snapshot)
    if (ownCursor !== null && presenceSelf !== null) light(ownCursor, presenceSelf.colorHue);
    for (const player of remotePlayers) {
      const canvas = player.cursor?.canvas;
      if (canvas === undefined || player.hasMouse !== true) continue; // a mouseless player casts no nav light
      light(canvas, player.colorHue);
    }
    return byCanvas;
  });
  /** the nav row's ribbon style (one calculation, one string — the
   *  svelte @const law bars it from plain <li> children): ribbonOf
   *  owns the Owner syntax wholesale — single = the plain 2px player
   *  color, multi = the vertical border-image gradient */
  function navRibbonStyle(canvasName: string): string | null {
    const ribbon = ribbonOf(navRibbons.get(canvasName) ?? []);
    return ribbon === null ? null : ribbon.style;
  }
  /** the chips list: SELF FIRST with the (you) mark, then the joining ordinal */
  const presenceChips = $derived.by(() => {
    const others = chipPlayers.map((player) => ({
      playerId: player.playerId,
      name: player.name,
      kind: player.kind,
      colorHue: player.colorHue,
      online: player.online,
      isSelf: false,
    }));
    if (presenceSelf === null) return others;
    return [
      {
        playerId: presenceSelf.playerId,
        name: presenceSelf.name,
        kind: presenceSelf.kind,
        colorHue: presenceSelf.colorHue,
        online: presenceStatus === 'online',
        isSelf: true,
      },
      ...others.filter((chip) => chip.playerId !== presenceSelf.playerId),
    ];
  });
  const presenceOnlineCount = $derived(presenceChips.filter((chip) => chip.online).length);

  /** the /sync rebase the journal-tail owes (§1): the panel's own 4s
   *  mirror poll keeps its client current — this lane adds the
   *  journal-tail's IMMEDIATE pull (serialized; a burst collapses to
   *  the last queued pass). The editing lane never waits on it.
   *  collabTailSeq (presence-liveness P3) is the same event's PRIMITIVE
   *  hand-off to the property panel: every bump orders the panel
   *  client's own mirror pull, so a peer's live-typed admit mirrors
   *  inside the 600ms budget; $state so the prop feeds the panel's
   *  sync effect. */
  const COLLAB_SYNC_URL = '/__design__/api/collab/sync';
  let collabSyncInFlight = false;
  let collabSyncQueued = false;
  let collabTailSeq = $state(0);
  function rebaseAfterJournalTail(): void {
    collabTailSeq += 1;
    if (collabSyncInFlight) {
      collabSyncQueued = true;
      return;
    }
    collabSyncInFlight = true;
    void fetch(COLLAB_SYNC_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .catch(() => undefined)
      .finally(() => {
        collabSyncInFlight = false;
        if (collabSyncQueued) {
          collabSyncQueued = false;
          rebaseAfterJournalTail();
        }
      });
  }

  /** the DOWN broadcast to the canvas overlay (the lens-broadcast
   *  pattern): every snapshot change coalesces into one rAF post of
   *  the remote roster — cursors stream at ~50ms, the frame budget
   *  caps the traffic at one message per frame */
  /** the live presence store (component-scoped so the panel's attention
   *  uplink can reach it from the template; the lifecycle effect owns it).
   *  $state — the selection→attention effect below reads it; a plain let
   *  would strand that effect dead at mount (read-before-assign never
   *  re-runs — the P1 lesson: three probes to find a dead effect) */
  let presenceStoreRef = $state<PresenceStore | null>(null);
  /** the attention priority law (presence-liveness P1): a field being
   *  edited outranks the canvas selection; both outrank nothing. The
   *  panel reports its focus through onPresenceAttention — this flag
   *  holds the tie-break so a selection change never clobbers it;
   *  $state so a blur (flag flip) lets the held selection reclaim */
  let panelFocusHeld = $state(false);
  function reportOwnAttention(panelFocus: AttentionFocus | null): void {
    panelFocusHeld = panelFocus !== null;
    presenceStoreRef?.reportAttention(panelFocus);
  }
  let presenceFlushRaf = 0;
  function forwardPresenceToCanvas(snapshot: PresenceSnapshot): void {
    if (presenceFlushRaf !== 0) return;
    presenceFlushRaf = requestAnimationFrame(() => {
      presenceFlushRaf = 0;
      // async read — this callback never tracks the iframe seam
      const target = canvasIframe?.contentWindow ?? null;
      if (target === null) return;
      const selfHueOklch = snapshot.self === null ? null : hslHueToOklchHue(snapshot.self.colorHue);
      target.postMessage(
        {
          type: 'jx-design:presence',
          ...(selfHueOklch === null ? {} : { brandHueOklch: selfHueOklch }),
          players: snapshot.players
            .filter((player) => player.online && player.playerId !== snapshot.self?.playerId)
            .map((player) => ({
              playerId: player.playerId,
              name: player.name,
              colorHue: player.colorHue,
              hasMouse: player.hasMouse,
              cursor: player.cursor,
              attention: player.attention,
            })),
        },
        window.location.origin,
      );
    });
  }



  // the store's lifecycle: connect on mount, dispose on teardown. The
  // ws NEVER carries an edit — a dead gateway costs the indicators only
  $effect(() => {
    if (typeof window === 'undefined') return;
    const urlName = new URLSearchParams(window.location.search).get('name');
    const store = new PresenceStore({
      socketFactory: browserPresenceSocket(window.location),
      name: urlName ?? undefined,
      storage: sessionStorage,
    });
    const unsubscribe = store.subscribe(() => {
      const snapshot = store.snapshot();
      presenceStatus = snapshot.status;
      presenceSelf = snapshot.self;
      presencePlayers = snapshot.players;
      forwardPresenceToCanvas(snapshot);
    });
    const offTail = store.on('journal-tail', () => rebaseAfterJournalTail());
    presenceStoreRef = store;
    store.connect();
    // the shell's own document rides the primary law too (ruling 1):
    // the local player's hue re-paints the studio chrome's jixoai-ui
    const applySelfHue = (snapshotNow: PresenceSnapshot): void => {
      if (snapshotNow.self !== null) applyBrandHue(document, snapshotNow.self.colorHue);
    };
    applySelfHue(store.snapshot());
    // subscribe listeners are called with NO arguments — passing
    // applySelfHue directly made snapshotNow undefined, threw on every
    // notify, and aborted #onWelcome before #armPing (the gateway's 5s
    // sweep then kicked the player into a reconnect loop — found by the
    // E-matrix, 2026-09-17)
    const unsubscribe2 = store.subscribe(() => applySelfHue(store.snapshot()));
    // cursors are canvas-scoped (ruling 2): the ONLY uplink is the
    // canvas overlay's jx-design:local-cursor report, forwarded with
    // its own canvas name — nothing tracks the studio chrome
    const onMessage = (event: MessageEvent): void => {
      const data = event.data as { type?: string; canvas?: unknown; x?: unknown; y?: unknown } | null;
      if (data === null || typeof data !== 'object' || data.type !== 'jx-design:local-cursor') return;
      if (typeof data.canvas !== 'string' || data.canvas.length === 0) return;
      if (typeof data.x !== 'number' || typeof data.y !== 'number') return;
      // async read — the listener body never tracks the iframe seam
      if (event.source !== (canvasIframe?.contentWindow ?? null)) return;
      // runtime narrowing to the transport vocabulary (no `as never`):
      // 'canvas' or a kit frame relay `frame:<id>` — anything else is
      // a frame-content bug and dies here, at the seam
      const rawSurface = typeof data.surface === 'string' && data.surface.length > 0 ? data.surface : 'canvas';
      if (rawSurface !== 'canvas' && !rawSurface.startsWith('frame:')) return;
      const surface: CursorSurface = rawSurface;
      ownCursor = data.canvas; // P5 self-first nav light
      store.reportCursor(data.canvas, surface, data.x, data.y);
    };
    window.addEventListener('message', onMessage);
    return () => {
      presenceStoreRef = null;
      window.removeEventListener('message', onMessage);
      offTail();
      unsubscribe2();
      unsubscribe();
      store.dispose();
    };
  });

  // panel-edit events (#19, Owner walkthrough 2026-09-12): the reload
  // fallback is DEAD — HMR has carried every edit since the T0d spike
  // (proven by probe, GATE-0 and the Owner's own session), while the
  // fallback's reload was the visible refresh the Owner felt AND the
  // race behind #18's full-reload broadcast chain. The event stays as
  // a seam (future listeners); no reload path remains.
  $effect(() => {
    const onPanelEdited = (_event: Event): void => {};
    window.addEventListener('jx-design:panel-edited', onPanelEdited);
    return () => window.removeEventListener('jx-design:panel-edited', onPanelEdited);
  });
</script>

<div class="studio">
  <nav class="studio-nav">
    <header class="studio-brand">
      <span class="studio-dot"></span>
      jixoai design
    </header>
    <!-- collab-presence §4: the Player chips — color dot (hue, 85%, 45%),
         name, self first with the (you) mark, the online count beside -->
    <div class="studio-presence" data-presence-chips aria-label="collaborators">
      {#each presenceChips as chip (chip.playerId)}
        <span class="studio-presence-chip" class:offline={!chip.online} data-presence-chip={chip.playerId} data-kind={chip.kind} title={chip.online ? 'online' : 'offline'}>
          <span class="studio-presence-dot" style:background={`hsl(${chip.colorHue}, 85%, 45%)`}></span>
          <span class="studio-presence-name">{chip.name}{chip.kind === 'ai' ? ' ·ai' : ''}{chip.isSelf ? ' (you)' : ''}</span>
        </span>
      {:else}
        <!-- the store has not spoken: connecting is not absent -->
        <span class="studio-presence-count">connecting…</span>
      {/each}
      {#if presenceChips.length > 0}
        <span class="studio-presence-count" data-presence-online>{presenceOnlineCount} online</span>
      {:else if presenceStatus === 'offline'}
        <span class="studio-presence-count">offline — reconnecting</span>
      {/if}
    </div>
    {#if manifestError !== null}
      <!-- ID3 (r3 T1): a failed manifest is recoverable, not a dead
           end — retry re-fetches (the 4s poll self-heals transient
           failures; this is the user's explicit affordance) -->
      <p class="studio-error">manifest failed: {manifestError} <button class="studio-frame" onclick={() => void refreshManifest()}>retry</button></p>
    {/if}
    {#if promotions.phase === 'error'}
      <!-- ID6 (r3 T0): promotions failure ≠ no drift — one honest
           line where the badges live, with the explicit retry; the
           4s poll also keeps self-healing in the background -->
      <p class="studio-error">promotions unavailable — <button class="studio-frame" onclick={retryPromotions}>retry</button></p>
    {/if}
    {#if !manifestLoadedOnce}
      <!-- the first-pull loading line (design-studio-acceptance §2):
           until the manifest has completed ONE fetch (ok or failed) the
           navigator must not claim "no prototypes yet" — a pulsing dot
           line, visually distinct from the Empty no-data state below -->
      <p class="studio-loading" data-manifest-loading><span class="studio-loading-dot" aria-hidden="true"></span>loading manifest…</p>
    {:else if manifest.length === 0 && manifestError === null}
      <Empty
        density="xs"
        class="studio-empty"
        title="no prototypes yet"
        description="the navigator fills as design/prototypes/<name>/ appears"
      >
        {#snippet illustration()}
          <span class="text-muted-foreground">ls design/prototypes/</span>
          <span class="text-primary">0 canvases</span>
        {/snippet}
      </Empty>
    {/if}
    <!-- one li per canvas entry (row + drift detail + frames) — the
         gate scripts' `.studio-list li` scoping contract; the rows
         themselves are standalone chrome-none family link rows -->
    <ul class="studio-list">
      {#each manifest as entry (entry.name)}
        {@const updates = updatesByProto.get(entry.name)}
        <li>
          <!-- the family's law: interactive descendants belong OUTSIDE
               anchors — the canvas row is a family LINK row (name,
               selected, hover) and the drift toggle is its sibling,
               laid out by the row wrapper (layout, not chrome) -->
          <!-- the ribbon rides the ROW ITSELF (the tree's li[data-path]
               contract, unified): border-inline-start 2px, single =
               player color, multi = the Owner vertical border-image
               gradient — no child span -->
          <div
            class="studio-canvas-row"
            data-nav-ribbon={entry.name}
            data-jx-remote-ribbon={navRibbonStyle(entry.name) === null ? undefined : ((navRibbons.get(entry.name) ?? []).length > 1 ? 'multi' : 'single')}
            style={navRibbonStyle(entry.name) ?? ''}
          >
            <Item
              class="studio-canvas"
              variant="default"
              density="sm"
              href={`#${entry.name}`}
              selected={entry.name === currentName}
              onclick={(event) => {
                event.preventDefault();
                selectCanvas(entry.name);
              }}
            >
              <ItemContent wrap="truncate">
                <ItemTitle>{entry.name}</ItemTitle>
              </ItemContent>
            </Item>
            {#if updates !== undefined && updates.length > 0}
              <button
                type="button"
                class="studio-updates-badge"
                title="promoted files lag the design file — click for the drift report"
                aria-expanded={updatesOpen === entry.name}
                onclick={() => (updatesOpen = updatesOpen === entry.name ? null : entry.name)}
              ><Badge variant="tonal" class="jx-hue-warning">updates</Badge></button>
            {/if}
          </div>
          {#if updatesOpen === entry.name && updates !== undefined}
            <div class="studio-updates-detail">
              {#each updates as status (status.file)}
                <p class="studio-updates-file">
                  <code>{status.file}</code>
                  {status.tag} → {status.currentTag ?? '?'}{status.hostModified ? ' · host-modified' : ''}{status.hostMissing ? ' · host file gone' : ''}
                </p>
                {#each status.changelogSince as change (change.tag)}
                  <p class="studio-updates-note">— {change.note}</p>
                {/each}
                {#if status.diff !== null}
                  <details class="studio-updates-diff">
                    <summary>diff</summary>
                    <pre>{status.diff}</pre>
                  </details>
                {/if}
              {/each}
              <p class="studio-updates-hint">apply with `jixoai-ui design apply`</p>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
    <!-- the canvases/tree section divide (r3 T4): the family's
         DEFAULT fused ghost — the contrast ink reads as a tonal lift
         on the studio's near-black ground (the solid escape painted
         --border = pure black there, imperceptible; pixel-probed) -->
    <Separator class="studio-sep" />
    <!-- the UNIFIED tree (r3 #20): pages + components in one treeView
         below the canvases list — keyed per canvas so tree-view's
         mount-time defaultExpanded re-reads the per-canvas store; the
         page folders' anchor up-call is the frames list's old W1 seam
         (hash scroll on the preview iframe) -->
    {#key currentName}
      <ComponentTree
        iframe={canvasIframe}
        canvas={currentName}
        frames={current?.frames ?? []}
        remoteAttentions={remoteTreeAttentions}
        selfHue={presenceSelf?.colorHue ?? null}
        {selection}
        onSelect={(incoming) => { selection = incoming; persistSelection(); }}
        onAnchorFrame={(frameId) => {
          anchorNonce += 1;
          anchorRequest = { frameId, nonce: anchorNonce };
        }}
      />
    {/key}
  </nav>

  <!-- r3 issue #21: the stage is StageView — the camera (zoom/pan/fit)
       over the canvas iframe lives there, transform-only, the iframe's
       size/URL invariant; the tree keeps the live iframe via onIframe -->
  <StageView
    src={previewSrc}
    title={`canvas ${currentName}`}
    canvas={currentName}
    anchor={anchorRequest}
    onIframe={(element) => (canvasIframe = element)}
  />

  <!-- r3 T2: the inspector — the property panel zone on top (ALWAYS
       mounted; unselected renders the empty-state flow guide), the
       chat/guide tab zone below. Both tabs stay in the DOM; the
       inactive one carries `hidden` so chat state survives switches -->
  <aside class="studio-inspector">
    <div class="studio-panel-zone">
      <PropertyPanel
        {selection}
        {selectionFile}
        presencePlayerId={presenceSelf?.playerId ?? null}
        presenceFoci={panelFoci}
        onPresenceAttention={(focus) => reportOwnAttention(focus === null ? null : focus)}
        collabTail={collabTailSeq}
      />
    </div>
    <div class="studio-tab-zone">
      <div class="studio-tabs" role="tablist" aria-label="inspector panels">
        <button
          class="studio-tab"
          type="button"
          role="tab"
          id="studio-tab-chat"
          aria-selected={railTab === 'chat'}
          onclick={() => (railTab = 'chat')}
        >chat</button>
        <button
          class="studio-tab"
          type="button"
          role="tab"
          id="studio-tab-guide"
          aria-selected={railTab === 'guide'}
          onclick={() => (railTab = 'guide')}
        >guide</button>
      </div>
      <div class="studio-tab-panel" role="tabpanel" aria-labelledby="studio-tab-chat" hidden={railTab !== 'chat'}>
        <ChatPanel
          {chatUrl}
          {agentInfoUrl}
          {selection}
          onClearSelection={() => { selection = null; persistSelection(); }}
          onTurnSettled={() => void refreshManifest()}
        />
      </div>
      <div class="studio-tab-panel" role="tabpanel" aria-labelledby="studio-tab-guide" hidden={railTab !== 'guide'}>
        <GuidePanel {knowledgeUrl} />
      </div>
    </div>
  </aside>
</div>

<style>
  .studio {
    display: grid;
    /* r3 T2 (ID1): CONSTANT three columns — nav | stage | inspector.
       No fourth column ever appears; the stage width is invariant
       under every selection state (the stage iframe is never
       re-laid-out by a pick) */
    grid-template-columns: 15rem 1fr 24rem;
    height: 100vh;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 0.8125rem;
    color: #e8e4dd;
    background: #0d0c0b;
  }
  /* the inspector (right column): the property panel zone on top —
     fits its content with a 40% floor — and the chat/guide tab zone
     eating the rest (a draggable divider is P2, not yet) */
  .studio-inspector {
    display: grid;
    grid-template-rows: minmax(40%, auto) minmax(0, 1fr);
    min-height: 0;
    border-left: 1px solid #262320;
  }
  .studio-panel-zone {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .studio-tab-zone {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-top: 1px solid #262320;
  }
  .studio-tabs {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem 0.375rem;
    border-bottom: 1px solid #262320;
  }
  .studio-tab {
    all: unset;
    cursor: pointer;
    padding: 0.1875rem 0.625rem;
    border-radius: 3px;
    color: #8d8578;
    font-size: 0.6875rem;
  }
  .studio-tab:hover {
    color: #e8e4dd;
    background: #1b1917;
  }
  .studio-tab[aria-selected='true'] {
    background: #262320;
    color: #f5f1e8;
  }
  .studio-tab-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  /* both tab panels stay MOUNTED (chat state survives switches); the
     [hidden] override must beat the author `display` above — the
     attribute's UA rule alone does not */
  .studio-tab-panel[hidden] {
    display: none;
  }

  /* r3 T2 (ID10): the left column is a flex column — the canvases
     list sizes to its content (scrolling itself only if enormous),
     the component tree below is the FLEXIBLE zone (its own file
     drops the 45% max-height for flex + min-height:0) */
  .studio-nav {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0.75rem;
    border-right: 1px solid #262320;
    min-height: 0;
  }
  .studio-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.6875rem;
    color: #b9b2a6;
  }
  .studio-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    /* the brand hue rides the token sheet (#23): the document-level
       .dark scope (studio-entry) carries it — one accent everywhere */
    background: var(--primary, #e05656);
  }
  .studio-error {
    margin: 0;
    color: #e08585;
    line-height: 1.5;
  }
  /* the manifest's first-pull line (§2): a muted pulse — distinct from
     the no-data Empty (a claim) and from the error line (a failure):
     this one says the answer simply is not in yet */
  .studio-loading {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #8d8578;
    font-size: 0.6875rem;
    line-height: 1.5;
  }
  .studio-loading-dot {
    flex: none;
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: var(--primary, #e05656);
    animation: studio-loading-pulse 1.4s ease-in-out infinite;
  }
  @keyframes studio-loading-pulse {
    0%,
    100% {
      opacity: 0.25;
    }
    50% {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .studio-loading-dot {
      animation: none;
    }
  }
  .studio-empty {
    margin: 0 0.25rem;
  }
  .studio-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 0 1 auto;
    min-height: 0;
    overflow-y: auto;
  }
  .studio-list > li {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .studio-canvas-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  /* the ribbon slot law (walkthrough R2): when a nav row carries the
     presence ribbon, the ribbon OWNS the left 2px slot — the family
     Item's selected inset accent would otherwise double it into an
     8-physical-px slab (vision-measured). The selected BACKGROUND
     stays; unribboned selected rows keep the family look untouched.
     :global — .jx-item is the host family's element (child component),
     a scoped descendant selector gets pruned by Svelte as unused */
  .studio-canvas-row[data-jx-remote-ribbon] :global(.jx-item[data-selected='true']) {
    box-shadow: none;
  }
  /* r3 T4: the canvas/frame rows are family link rows (the Item
     supplies row chrome, hover, selected, focus). Residual CSS here
     is layout + spacing ONLY: the badge toggle is a chrome-less
     button carrying the Badge paint (the family ships no interactive
     badge), and `button.studio-frame` keeps the error-retry buttons'
     look — the frame ROWS share the class as a script hook, so the
     reset scopes to buttons */
  .studio-updates-badge {
    all: unset;
    cursor: pointer;
    flex: none;
    display: inline-flex;
    border-radius: 2px;
  }
  .studio-updates-badge[aria-expanded='true'] {
    outline: 1px solid #3a352f;
    outline-offset: 1px;
  }
  .studio-updates-detail {
    margin: 0.25rem 0 0.25rem 0.5rem;
    padding: 0.375rem 0.5rem;
    border-left: 2px solid #d9b46a;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .studio-updates-file {
    margin: 0;
    color: #b9b2a6;
    font-size: 0.6875rem;
  }
  .studio-updates-file code {
    color: #a9c4a9;
  }
  .studio-updates-note {
    margin: 0 0 0 0.5rem;
    color: #8d8578;
    font-size: 0.6875rem;
    line-height: 1.45;
  }
  .studio-updates-diff summary {
    cursor: pointer;
    color: #8d8578;
    font-size: 0.6875rem;
  }
  .studio-updates-diff pre {
    margin: 0.25rem 0 0;
    padding: 0.375rem;
    background: #161412;
    border: 1px solid #262320;
    border-radius: 3px;
    color: #b9b2a6;
    font-size: 0.625rem;
    line-height: 1.5;
    max-height: 12rem;
    overflow: auto;
    white-space: pre;
  }
  .studio-updates-hint {
    margin: 0;
    color: #8d8578;
    font-size: 0.625rem;
  }
  /* the error lines' retry buttons (ID3/ID6) — button-scoped residue;
     the frames rows that once shared the class are gone (r3 #20: the
     frames list merged into the unified tree below) */
  button.studio-frame {
    all: unset;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    color: #8d8578;
    font-size: 0.6875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  button.studio-frame:hover {
    color: #e8e4dd;
    background: #1b1917;
  }
  .studio-sep {
    flex: none;
  }

  /* ── collab-presence §4: the chips + the shell indicator layer ────── */

  .studio-presence {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
  }
  .studio-presence-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.0625rem 0.375rem 0.0625rem 0.25rem;
    border: 1px solid #262320;
    border-radius: 3px;
    font-size: 0.625rem;
    line-height: 1.5;
    color: #b9b2a6;
    white-space: nowrap;
    max-width: 100%;
  }
  .studio-presence-chip.offline {
    opacity: 0.45;
  }
  .studio-presence-chip.offline .studio-presence-dot {
    background: #4a443d !important;
  }
  .studio-presence-dot {
    flex: none;
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
  }
  .studio-presence-name {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .studio-presence-count {
    color: #8d8578;
    font-size: 0.625rem;
    white-space: nowrap;
  }
  /* the shell indicator layer: fixed over everything, pointer-inert —
     the same namespace grammar the canvas overlay speaks */
  .studio-remote-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483646;
  }
</style>

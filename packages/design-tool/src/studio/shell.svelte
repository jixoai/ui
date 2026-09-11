<!--
  @jixoai/ui-design (studio) — the default studio shell (T4 + r2
  T4/T5/T6 selection integration + T8 panel mount + T11 updates badge).

  Intents (5, a single-surface compromise — layout is not split out):
    1. navigator + preview grid: list canvases from the manifest, show
       the selected canvas in a full-width iframe tab; frame ids deep-
       link by appending #<id> to the iframe src (canvas anchors are
       the kit's DOM contract). Manifest polling is GATED (#12/T0):
       a structurally unchanged response never rewrites $state, and
       the panel receives selectionFile (a primitive), not a table.
       r3 T4 skin: the canvas/frame rows are the host's REAL list-item
       family (#jixoai/ link rows, intercepted activation — semantics
       untouched) and the drift badge is the badge item; .studio-canvas
       / .studio-frame / .studio-updates-badge survive as the
       walkthrough scripts' DOM hooks, not as chrome.
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
    4. the property panel mount (r2 T8, re-homed by r3 T2): the
       inspector's top zone — ALWAYS present; unselected is the empty
       state's flow guide, not a blank. The chat's streaming state
       locks it read-only; panel edits ride HMR with a targeted frame
       reload as the fallback path.
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
  }
</script>

<script lang="ts">
  // the dogfooding main path (r3 T4, issue #10): the host's REAL
  // components via the design server's #jixoai/ alias
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
  import { FRAME_NAME_PREFIX, type DesignSelection, type DesignStudioSeams } from './selection.ts';

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
  let frameHash: string | null = $state(null);
  let manifestError: string | null = $state(null);
  /** the ONE selection (r2 T4): picker and tree both feed this */
  let selection: DesignSelection | null = $state(null);
  /** the live canvas iframe (the tree walks its DOM, same-origin) */
  let canvasIframe: HTMLIFrameElement | null = $state(null);
  /** the chat's streaming state — the property panel's read-only lock (r2 §4) */
  let chatStreaming = $state(false);
  /** the open updates-badge proto (null = all collapsed) */
  let updatesOpen: string | null = $state(null);
  /** the inspector's bottom-zone tab (r3 T2): chat is the default
   *  (high frequency); guide is the low-frequency lookup. Both panels
   *  stay MOUNTED — the inactive side gets the hidden attribute, so
   *  chat state (draft, message flow, streaming) survives switches */
  let railTab: 'chat' | 'guide' = $state('chat');
  /** promotion drift status (r2 T11 contract; three-state as of r3 T0/ID6) */
  let promotions: PromotionsState = $state({ phase: 'loading' });

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
  const previewSrc = $derived(current === null ? null : current.path + (frameHash === null ? '' : `#${frameHash}`));

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
      }
    }
  }

  function selectCanvas(name: string, hash: string | null = null): void {
    currentName = name;
    frameHash = hash;
    // the selection addressed the PREVIOUS canvas's frames — gone
    selection = null;
  }

  // the picker's up-call seam (GATE-0 relay, 2026-09-12): a window
  // property assigned INSIDE $.user_effect vanished between the
  // assignment and the next statement on fresh page loads (module-
  // level assignments to the same name stick; direct evaluate sticks;
  // post-HMR re-evaluation sticks — platform ghost, filed in the
  // problems ledger). The relay uses only proven mechanisms: the
  // picker-facing seam installs at MODULE level (see below the
  // component) and dispatches a CustomEvent this effect listens for.
  $effect(() => {
    const onSelectEvent = (event: Event): void => {
      selection = (event as CustomEvent<DesignSelection | null>).detail;
    };
    window.addEventListener('jx-design:select', onSelectEvent);
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

  // the panel-edit HMR fallback (r2 T8): when HMR does not carry a
  // panel edit into the frame, reload the OWNING frame iframe by its
  // kit name (same-origin), else the whole canvas document
  $effect(() => {
    const onPanelEdited = (event: Event): void => {
      const detail = (event as CustomEvent<{ frameId: string | null; file: string }>).detail;
      const doc = canvasIframe?.contentDocument;
      if (doc !== null && doc !== undefined && detail.frameId !== null) {
        const frame = doc.querySelector(`iframe[name="${FRAME_NAME_PREFIX}${detail.frameId}"]`) as HTMLIFrameElement | null;
        frame?.contentWindow?.location.reload();
        return;
      }
      canvasIframe?.contentWindow?.location.reload();
    };
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
    {#if manifest.length === 0 && manifestError === null}
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
          <div class="studio-canvas-row">
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
          {#if entry.frames !== undefined && entry.frames.length > 0}
            <div class="studio-frames">
              {#each entry.frames as frame (frame.id)}
                <Item
                  class="studio-frame"
                  variant="default"
                  density="xs"
                  href={`#${entry.name}/${frame.id}`}
                  title={frame.ref ?? frame.id}
                  onclick={(event) => {
                    event.preventDefault();
                    selectCanvas(entry.name, frame.id);
                  }}
                >
                  <ItemContent wrap="truncate">
                    <ItemTitle>{frame.id}</ItemTitle>
                  </ItemContent>
                </Item>
              {/each}
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
    <ComponentTree iframe={canvasIframe} {selection} onSelect={(incoming) => (selection = incoming)} />
  </nav>

  <main class="studio-preview">
    {#if previewSrc === null}
      <div class="studio-preview-empty">select a canvas on the left</div>
    {:else}
      {#key previewSrc}
        <iframe
          class="studio-iframe"
          src={previewSrc}
          title={`canvas ${currentName}`}
          bind:this={canvasIframe}
        ></iframe>
      {/key}
    {/if}
  </main>

  <!-- r3 T2: the inspector — the property panel zone on top (ALWAYS
       mounted; unselected renders the empty-state flow guide), the
       chat/guide tab zone below. Both tabs stay in the DOM; the
       inactive one carries `hidden` so chat state survives switches -->
  <aside class="studio-inspector">
    <div class="studio-panel-zone">
      <PropertyPanel {selection} {selectionFile} locked={chatStreaming} />
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
          onClearSelection={() => (selection = null)}
          onTurnSettled={() => void refreshManifest()}
          onStreamingChange={(value) => (chatStreaming = value)}
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
    background: #e05656;
  }
  .studio-error {
    margin: 0;
    color: #e08585;
    line-height: 1.5;
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
    color: #6f6759;
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
    color: #6f6759;
    font-size: 0.625rem;
  }
  .studio-frames {
    margin: 0;
    padding: 0 0 0 1rem;
    display: flex;
    flex-direction: column;
  }
  /* the error lines' retry buttons (ID3/ID6) — kept button-scoped so
     the family frame rows sharing the class as a hook stay untouched */
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

  .studio-preview {
    display: flex;
    min-width: 0;
    background: #161412;
  }
  .studio-preview-empty {
    margin: auto;
    color: #8d8578;
  }
  .studio-iframe {
    flex: 1;
    border: 0;
    background: #fff;
  }
</style>

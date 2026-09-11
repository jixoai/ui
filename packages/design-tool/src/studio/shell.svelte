<!--
  @jixoai/ui-design (studio) — the default studio shell (T4 + r2
  T4/T5/T6 selection integration + T8 panel mount + T11 updates badge).

  Intents (5, a single-surface compromise — layout is not split out):
    1. navigator + preview grid: list canvases from the manifest, show
       the selected canvas in a full-width iframe tab; frame ids deep-
       link by appending #<id> to the iframe src (canvas anchors are
       the kit's DOM contract).
    2. right rail composition: chat panel + guide panel (own files).
    3. the ONE selection state (r2): window.__jixoaiDesignSelect is
       the picker's same-origin up-call target; the ComponentTreeView,
       the chat chip and the property panel all read the same state.
       Canvas switches clear it (the frames it addressed are gone).
    4. the property panel mount (r2 T8): a side container (sibling of
       the navigator — additive mount, the nav's own structure stays
       B-owned) that shows while a selection is live. The chat's
       streaming state locks it read-only; panel edits ride HMR with
       a targeted frame reload as the fallback path.
    5. promotion drift badge (r2 T11): the navigator's canvases carry
       an "updates" badge when their promoted files lag the design
       file (the promotions.json status endpoint, A's pipeline); the
       badge expands to the changelog intent + per-file diffs.

  Original need: Owner 2026-09-11 (design-studio T4; design-studio-r2
  T4/T5/T8/T11). HOST DECOUPLING LAW (design.md §6.4): this shell
  imports NO host components and no host aliases — self-contained
  scoped CSS only; dogfooding happens in the host's design/studio.svelte
  which wraps this shell. Svelte 5 runes throughout ($state/$derived/
  $effect).
-->
<script lang="ts">
  import ChatPanel from './chat-panel.svelte';
  import ComponentTree from './component-tree.svelte';
  import GuidePanel from './guide-panel.svelte';
  import PropertyPanel, { type FrameFileTable } from './property-panel.svelte';
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

  interface ManifestFrame {
    id: string;
    ref?: string;
  }
  interface ManifestEntry {
    name: string;
    path: string;
    frames?: ManifestFrame[];
  }

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
  /** promotion drift status (r2 T11 — A's promotions.json contract) */
  let promotions: readonly PromotionFileStatus[] | null = $state(null);
  let promotionsFailed = false;

  /** the promotions.json per-file verdict (A's PromotionFileStatus, structural) */
  interface PromotionFileStatus {
    readonly file: string;
    readonly proto: string;
    readonly designVersion: number;
    readonly currentDesignVersion: number | null;
    readonly drifted: boolean;
    readonly regressed: boolean;
    readonly hostMissing: boolean;
    readonly hostModified: boolean;
    readonly changelogSince: readonly { readonly version: number; readonly note: string }[];
    readonly diff: string | null;
  }

  const current = $derived(manifest.find((entry) => entry.name === currentName) ?? null);
  const previewSrc = $derived(current === null ? null : current.path + (frameHash === null ? '' : `#${frameHash}`));

  /**
   * frameId → root-relative source file (the panel's edit target):
   * manifest refs minus the leading ./; '' addresses the canvas
   * document itself (frameId-null picks).
   */
  const frameFiles: FrameFileTable = $derived.by(() => {
    const table: FrameFileTable = {};
    if (current === null) return table;
    table[''] = `design/prototypes/${current.name}/canvas.svelte`;
    for (const frame of current.frames ?? []) {
      if (frame.ref === undefined) continue;
      table[frame.id] = `design/prototypes/${current.name}/${frame.ref.replace(/^\.\//, '')}`;
    }
    return table;
  });

  /** drifted (or regressed) promotions grouped per proto — the badge source */
  const updatesByProto = $derived.by(() => {
    const grouped = new Map<string, PromotionFileStatus[]>();
    for (const status of promotions ?? []) {
      if (!status.drifted && !status.regressed) continue;
      const bucket = grouped.get(status.proto) ?? [];
      bucket.push(status);
      grouped.set(status.proto, bucket);
    }
    return grouped;
  });

  async function refreshManifest(): Promise<void> {
    try {
      const response = await fetch(manifestUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      manifest = (await response.json()) as ManifestEntry[];
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
      manifestError = cause instanceof Error ? cause.message : String(cause);
    }
  }

  function selectCanvas(name: string, hash: string | null = null): void {
    currentName = name;
    frameHash = hash;
    // the selection addressed the PREVIOUS canvas's frames — gone
    selection = null;
  }

  // the picker's up-call seam (r2 T4): same-origin direct call from
  // any embedded frame document; null clears (Escape / chip removal)
  $effect(() => {
    const seams = window as unknown as DesignStudioSeams;
    seams.__jixoaiDesignSelect = (incoming: DesignSelection | null) => {
      selection = incoming;
    };
    return () => {
      delete seams.__jixoaiDesignSelect;
    };
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
    try {
      const response = await fetch(promotionsUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as { promotions?: PromotionFileStatus[] };
      promotions = payload.promotions ?? [];
      promotionsFailed = false;
    } catch {
      // no promotions data (nothing promoted yet, endpoint pending) —
      // the badges simply stay absent, never an error surface
      promotions = promotionsFailed ? promotions : [];
      promotionsFailed = true;
    }
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

<div class="studio" class:studio-with-panel={selection !== null}>
  <nav class="studio-nav">
    <header class="studio-brand">
      <span class="studio-dot"></span>
      jixoai design
    </header>
    {#if manifestError !== null}
      <p class="studio-error">manifest failed: {manifestError}</p>
    {/if}
    {#if manifest.length === 0 && manifestError === null}
      <p class="studio-empty">no prototypes yet — the navigator fills as design/prototypes/&lt;name&gt;/ appears</p>
    {/if}
    <ul class="studio-list">
      {#each manifest as entry (entry.name)}
        {@const updates = updatesByProto.get(entry.name)}
        <li class:active={entry.name === currentName}>
          <span class="studio-canvas-row">
            <button class="studio-canvas" onclick={() => selectCanvas(entry.name)}>
              {entry.name}
            </button>
            {#if updates !== undefined && updates.length > 0}
              <button
                class="studio-updates-badge"
                title="promoted files lag the design file — click for the drift report"
                aria-expanded={updatesOpen === entry.name}
                onclick={() => (updatesOpen = updatesOpen === entry.name ? null : entry.name)}
              >updates</button>
            {/if}
          </span>
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
            <ul class="studio-frames">
              {#each entry.frames as frame (frame.id)}
                <li>
                  <button
                    class="studio-frame"
                    onclick={() => selectCanvas(entry.name, frame.id)}
                    title={frame.ref ?? frame.id}
                  >
                    {frame.id}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
    <ComponentTree iframe={canvasIframe} {selection} onSelect={(incoming) => (selection = incoming)} />
  </nav>

  <div class="studio-side">
    <PropertyPanel {selection} {frameFiles} locked={chatStreaming} />
  </div>

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

  <aside class="studio-rail">
    <ChatPanel
      {chatUrl}
      {agentInfoUrl}
      {selection}
      onClearSelection={() => (selection = null)}
      onTurnSettled={() => void refreshManifest()}
      onStreamingChange={(value) => (chatStreaming = value)}
    />
    <GuidePanel {knowledgeUrl} />
  </aside>
</div>

<style>
  .studio {
    display: grid;
    grid-template-columns: 15rem 1fr 22rem;
    height: 100vh;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 0.8125rem;
    color: #e8e4dd;
    background: #0d0c0b;
  }
  /* the property panel's side container occupies a column only while a
     selection is live — the default layout stays byte-stable */
  .studio-with-panel {
    grid-template-columns: 15rem 16rem 1fr 22rem;
  }
  .studio-side {
    display: none;
    min-height: 0;
    border-right: 1px solid #262320;
  }
  .studio-with-panel .studio-side {
    display: flex;
  }

  .studio-nav {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0.75rem;
    border-right: 1px solid #262320;
    overflow-y: auto;
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
  .studio-error,
  .studio-empty {
    margin: 0;
    color: #8d8578;
    line-height: 1.5;
  }
  .studio-error {
    color: #e08585;
  }
  .studio-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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
  .studio-list > li.active > .studio-canvas-row > .studio-canvas {
    color: #f5f1e8;
    background: #262320;
  }
  .studio-updates-badge {
    all: unset;
    cursor: pointer;
    font-size: 0.5625rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #0d0c0b;
    background: #d9b46a;
    border-radius: 2px;
    padding: 0.0625rem 0.3125rem;
    flex: none;
  }
  .studio-updates-badge[aria-expanded='true'] {
    background: #e8e4dd;
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
  .studio-canvas {
    all: unset;
    cursor: pointer;
    padding: 0.375rem 0.5rem;
    border-radius: 3px;
    color: #b9b2a6;
  }
  .studio-canvas:hover {
    background: #1b1917;
    color: #e8e4dd;
  }
  .studio-frames {
    list-style: none;
    margin: 0;
    padding: 0 0 0 1rem;
    display: flex;
    flex-direction: column;
  }
  .studio-frame {
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
  .studio-frame:hover {
    color: #e8e4dd;
    background: #1b1917;
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

  .studio-rail {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-left: 1px solid #262320;
  }
</style>

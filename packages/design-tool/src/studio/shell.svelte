<!--
  @jixoai/ui-design (studio) — the default studio shell (T4).

  Intents (2, a single-surface compromise — layout is not split out):
    1. navigator + preview grid: list canvases from the manifest, show
       the selected canvas in a full-width iframe tab; frame ids deep-
       link by appending #<id> to the iframe src (canvas anchors are
       the kit's DOM contract).
    2. right rail composition: chat panel + guide panel (own files).

  Original need: Owner 2026-09-11 (design-studio T4). HOST DECOUPLING
  LAW (design.md §6.4): this shell imports NO host components and no
  host aliases — self-contained scoped CSS only; dogfooding happens in
  the host's design/studio.svelte which wraps this shell. Svelte 5
  runes throughout ($state/$derived/$effect).
-->
<script lang="ts">
  import ChatPanel from './chat-panel.svelte';
  import GuidePanel from './guide-panel.svelte';

  export interface ShellEndpoints {
    manifestUrl?: string;
    chatUrl?: string;
    agentInfoUrl?: string;
    knowledgeUrl?: string;
  }

  let {
    manifestUrl = '/__design__/api/manifest.json',
    chatUrl = '/__design__/api/chat',
    agentInfoUrl = '/__design__/api/agent.json',
    knowledgeUrl = '/__design__/api/knowledge.json',
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

  const current = $derived(manifest.find((entry) => entry.name === currentName) ?? null);
  const previewSrc = $derived(current === null ? null : current.path + (frameHash === null ? '' : `#${frameHash}`));

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
  }

  // manifest bootstrap + light polling: new prototypes (agent writes)
  // appear in the navigator without a manual reload
  $effect(() => {
    void refreshManifest();
    const timer = setInterval(() => void refreshManifest(), 4000);
    return () => clearInterval(timer);
  });
</script>

<div class="studio">
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
        <li class:active={entry.name === currentName}>
          <button class="studio-canvas" onclick={() => selectCanvas(entry.name)}>
            {entry.name}
          </button>
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
        ></iframe>
      {/key}
    {/if}
  </main>

  <aside class="studio-rail">
    <ChatPanel {chatUrl} {agentInfoUrl} onTurnSettled={() => void refreshManifest()} />
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
  .studio-list > li.active > .studio-canvas {
    color: #f5f1e8;
    background: #262320;
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

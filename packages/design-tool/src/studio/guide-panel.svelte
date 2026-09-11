<!--
  @jixoai/ui-design (studio) — the guide panel (T4/T6 client half).

  Orthogonal intent (1): render the knowledge pack's componentIndex
  (grouped list + descriptions) — the SAME index the agent
  systemPrompt's selection layer consumes (one source, design.md §5).

  Original need: Owner 2026-09-11 (design-studio T4). No host imports;
  self-contained scoped CSS. Svelte 5 runes.
-->
<script lang="ts">
  interface KnowledgeItem {
    readonly name: string;
    readonly title: string;
    readonly description: string;
    /** the alpha-track marker (r2 T9) — renders the track badge */
    readonly alpha?: boolean;
  }
  interface KnowledgeGroup {
    readonly id: string;
    readonly items: readonly KnowledgeItem[];
  }
  interface KnowledgePayload {
    readonly componentIndex?: { readonly groups?: readonly KnowledgeGroup[] };
  }

  let { knowledgeUrl = '/__design__/api/knowledge.json' }: { knowledgeUrl?: string } = $props();

  let groups: readonly KnowledgeGroup[] = $state([]);
  let query: string = $state('');
  let failed: string | null = $state(null);

  $effect(() => {
    void (async () => {
      try {
        const response = await fetch(knowledgeUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as KnowledgePayload;
        groups = payload.componentIndex?.groups ?? [];
      } catch (cause) {
        failed = cause instanceof Error ? cause.message : String(cause);
      }
    })();
  });

  const filtered = $derived(
    query.trim() === ''
      ? groups
      : groups
          .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
              `${item.name} ${item.title} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()),
            ),
          }))
          .filter((group) => group.items.length > 0),
  );
</script>

<section class="guide">
  <header class="guide-head">
    <span class="guide-title">guide</span>
    <input
      class="guide-search"
      type="search"
      placeholder="filter components…"
      bind:value={query}
      aria-label="filter the component index"
    />
  </header>

  <div class="guide-flow">
    {#if failed !== null}
      <p class="guide-error">knowledge failed: {failed}</p>
    {/if}
    {#each filtered as group (group.id)}
      <details class="guide-group">
        <summary>{group.id} <span class="guide-count">({group.items.length})</span></summary>
        <ul>
          {#each group.items as item (item.name)}
            <li>
              <span class="guide-item-head">
                <code class="guide-name">#jixoai/{item.name}</code>
                {#if item.alpha === true}
                  <span class="guide-alpha" title="alpha track — vocabulary and behavior may still move (r2 T9)">alpha</span>
                {/if}
              </span>
              <p class="guide-desc">{item.description}</p>
            </li>
          {/each}
        </ul>
      </details>
    {/each}
  </div>
</section>

<style>
  .guide {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1 1 45%;
  }
  .guide-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
  }
  .guide-title {
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.6875rem;
    color: #b9b2a6;
  }
  .guide-search {
    flex: 1;
    background: #161412;
    color: #e8e4dd;
    border: 1px solid #262320;
    border-radius: 3px;
    padding: 0.25rem 0.5rem;
    font: inherit;
    font-size: 0.6875rem;
  }
  .guide-flow {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.75rem 0.75rem;
  }
  .guide-error {
    color: #e08585;
  }
  .guide-group {
    border-top: 1px solid #1f1c19;
    padding: 0.375rem 0;
  }
  .guide-group summary {
    cursor: pointer;
    color: #b9b2a6;
    font-size: 0.75rem;
    list-style: none;
  }
  .guide-group summary::before {
    content: '▸ ';
    color: #6f6759;
  }
  .guide-group[open] summary::before {
    content: '▾ ';
  }
  .guide-count {
    color: #6f6759;
  }
  .guide-group ul {
    list-style: none;
    margin: 0.375rem 0 0.75rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .guide-name {
    font-size: 0.6875rem;
    color: #a9c4a9;
    background: #1b1917;
    border: 1px solid #262320;
    border-radius: 3px;
    padding: 0.0625rem 0.375rem;
  }
  .guide-item-head {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }
  .guide-alpha {
    font-size: 0.5625rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #0d0c0b;
    background: #8fa88f;
    border-radius: 2px;
    padding: 0.0625rem 0.3125rem;
  }
  .guide-desc {
    margin: 0.25rem 0 0;
    color: #8d8578;
    font-size: 0.6875rem;
    line-height: 1.5;
  }
</style>

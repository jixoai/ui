<!--
  @jixoai/ui-design (studio) — the guide panel (T4/T6 client half +
  r3 T5 component rebuild).

  Orthogonal intent (1): render the knowledge pack's componentIndex
  (grouped list + descriptions) — the SAME index the agent
  systemPrompt's selection layer consumes (one source, design.md §5).

  r3 T5 (2026-09-12): the chrome is now the library's own — groups are
  #jixoai/accordion (ghost set: hairline separators, no card frame),
  the search field is #jixoai/input (search glyph + clearable ×), the
  filtered-to-nothing state is #jixoai/empty (ID4, migrated from T1's
  one-liner), the alpha track marker is #jixoai/badge. Entry chips
  (#jixoai/<name> code) stay <code>: item ids are case-sensitive.
  The fetch/filter logic is untouched.

  Original need: Owner 2026-09-11 (design-studio T4). Svelte 5 runes.
-->
<script lang="ts">
  import Accordion, { AccordionItem } from '#jixoai/accordion';
  import Badge from '#jixoai/badge';
  import Empty from '#jixoai/empty';
  import Input from '#jixoai/input';

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
    <Input
      class="guide-search"
      type="search"
      placeholder="filter components…"
      aria-label="filter the component index"
      bind:value={query}
      clearable
    />
  </header>

  <div class="guide-flow">
    {#if failed !== null}
      <p class="guide-error">knowledge failed: {failed}</p>
    {/if}
    <!-- ID4 (r3 T1 → T5): a filtered-to-nothing index is an honest
         empty state, not a silent blank — only meaningful when there
         IS an index to search (empty/failed payloads are not matches) -->
    {#if failed === null && groups.length > 0 && query.trim() !== '' && filtered.length === 0}
      <Empty
        class="guide-empty"
        title="no matches"
        description={`no components match "${query.trim()}" — clear the filter or try a shorter term.`}
      >
        {#snippet illustration()}
          <span class="text-muted-foreground">grep {query.trim()}</span>
          <span class="text-primary">0 matches</span>
        {/snippet}
      </Empty>
    {/if}
    {#if filtered.length > 0}
      <Accordion ghost>
        {#each filtered as group (group.id)}
          <AccordionItem>
            {#snippet summary()}
              {group.id} <span class="guide-count">({group.items.length})</span>
            {/snippet}
            <ul>
              {#each group.items as item (item.name)}
                <li>
                  <span class="guide-item-head">
                    <code class="guide-name">#jixoai/{item.name}</code>
                    {#if item.alpha === true}
                      <Badge variant="tonal" class="jx-hue-success">alpha</Badge>
                    {/if}
                  </span>
                  <p class="guide-desc">{item.description}</p>
                </li>
              {/each}
            </ul>
          </AccordionItem>
        {/each}
      </Accordion>
    {/if}
  </div>
</section>

<style>
  .guide {
    display: flex;
    flex-direction: column;
    min-height: 0;
    /* r3 T2: guide fills its tab panel (the old 45% stacked-rail
       share is gone — it is now the low-frequency tab) */
    flex: 1;
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
  /* the input's field wrapper is the flex child (the component's own
     class lands on the inner shell) */
  .guide-head :global(.jx-field) {
    flex: 1;
    min-width: 0;
  }
  .guide-flow {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.75rem 0.75rem;
  }
  .guide-error {
    color: #e08585;
  }
  .guide-empty {
    margin-top: 0.75rem;
  }
  .guide-count {
    color: #6f6759;
    text-transform: none;
    letter-spacing: normal;
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
    min-width: 0;
  }
  .guide-desc {
    margin: 0.25rem 0 0;
    color: #8d8578;
    font-size: 0.6875rem;
    line-height: 1.5;
  }
</style>

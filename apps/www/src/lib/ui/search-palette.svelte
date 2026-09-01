<script lang="ts">
  /**
   * The full-text search palette (search-corpus change, 2026-09-02).
   * ⌘K/Ctrl-K opens; results are SECTION-granularity (page × heading,
   * deep-linked via the corpus's converging ids); keyboard navigation
   * (arrows/enter/escape); the glass material rides the house law.
   * The palette speaks ONLY the SearchEngine interface — which engine
   * backs it is a wiring decision (engine-minisearch today).
   */
  import { createMinisearchEngine, type CorpusPage } from '$lib/search/engine-minisearch';
  import { tokenize } from '$lib/search/tokenizer';
  import type { SearchHit } from '$lib/search/engine-types';

  let open = $state(false);
  let query = $state('');
  let hits = $state<SearchHit[]>([]);
  let searching = $state(false);
  let active = $state(0);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);
  let debounce: ReturnType<typeof setTimeout> | undefined;

  const engine = createMinisearchEngine(tokenize, async (): Promise<CorpusPage[]> => {
    const response = await fetch('/search/corpus.json');
    if (!response.ok) throw new Error(`corpus fetch failed: ${response.status}`);
    const corpus = (await response.json()) as { pages: CorpusPage[] };
    return corpus.pages;
  });

  const run = async (): Promise<void> => {
    const value = query.trim();
    active = 0;
    if (value === '') {
      hits = [];
      searching = false;
      return;
    }
    searching = true;
    try {
      hits = (await engine.search(value)).slice(0, 12);
    } catch {
      hits = [];
    } finally {
      searching = false;
    }
  };

  $effect(() => {
    query;
    clearTimeout(debounce);
    debounce = setTimeout(() => void run(), 120);
  });

  const openPalette = (): void => {
    open = true;
    queueMicrotask(() => inputEl?.focus());
  };
  const close = (): void => {
    open = false;
    query = '';
    hits = [];
    active = 0;
  };
  const go = (hit: SearchHit): void => {
    close();
    window.location.assign(hit.href);
  };
  const onKey = (event: KeyboardEvent): void => {
    // IME composition (Chinese input): the Enter that COMMITS a
    // composition must not navigate — only a real Enter does
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown' || (event.key === 'n' && event.ctrlKey)) {
      event.preventDefault();
      if (hits.length > 0) active = (active + 1) % hits.length;
    } else if (event.key === 'ArrowUp' || (event.key === 'p' && event.ctrlKey)) {
      event.preventDefault();
      if (hits.length > 0) active = (active - 1 + hits.length) % hits.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const hit = hits[active];
      if (hit !== undefined) go(hit);
    }
  };

  const onGlobalKey = (event: KeyboardEvent): void => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (open) close();
      else openPalette();
    }
  };

  const highlight = (text: string, terms: string[]): string => {
    if (text === '' || terms.length === 0) return text;
    const pattern = terms
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    return text.replace(new RegExp(`(${pattern})`, 'gi'), '\u0001$1\u0002');
  };
  const parts = (marked: string): { text: string; mark: boolean }[] =>
    marked
      .split(/[\u0001\u0002]/)
      .map((chunk, i) => ({ text: chunk, mark: i % 2 === 1 }))
      .filter((part) => part.text !== '');
</script>

<svelte:window onkeydown={onGlobalKey} />
<svelte:document onjx-search-open={() => openPalette()} />

{#if open}
  <!-- the palette layer: click-away closes, key handling rides the panel -->
  <div
    class="fixed inset-0 z-[90] flex items-start justify-center pt-[14vh]"
    role="presentation"
    onclick={(event) => {
      if (event.target === event.currentTarget) close();
    }}
  >
    <div class="jx-glass search-panel" role="dialog" aria-modal="true" aria-label="全文搜索">
      <div class="flex items-center gap-2 border-b border-border/40 px-3 py-2.5">
        <span class="font-mono text-[12px] text-muted-foreground select-none">⌘K</span>
        <input
          bind:this={inputEl}
          bind:value={query}
          onkeydown={onKey}
          class="w-full bg-transparent font-mono text-[13px] outline-none placeholder:text-muted-foreground/60"
          placeholder="搜索全部文档（中英皆可）…"
          aria-label="搜索查询"
        />
        {#if searching}<span class="text-[11px] text-muted-foreground">…</span>{/if}
      </div>
      {#if query.trim() !== ''}
        <ul class="max-h-[52vh] overflow-y-auto py-1" role="listbox">
          {#each hits as hit, i (hit.href)}
            <li role="option" aria-selected={i === active}>
              <a
                href={hit.href}
                class="block px-3 py-2 {i === active ? 'bg-primary/10' : ''}"
                onclick={() => close()}
                onmousemove={() => (active = i)}
              >
                <div class="flex items-baseline gap-2">
                  <span class="font-mono text-[12px] text-muted-foreground">{hit.pageTitle}</span>
                  <span class="text-[10px] text-muted-foreground/60">§</span>
                  <span class="font-mono text-[12.5px] font-medium">{hit.heading}</span>
                </div>
                {#if hit.summary !== ''}
                  <p class="mt-0.5 line-clamp-1 text-[11.5px] text-muted-foreground">
                    {#each parts(highlight(hit.summary, hit.terms)) as part}{#if part.mark}<mark
                          class="bg-transparent text-primary">{part.text}</mark
                        >{:else}{part.text}{/if}{/each}
                  </p>
                {/if}
              </a>
            </li>
          {:else}
            {#if !searching}
              <li class="px-3 py-6 text-center text-[12px] text-muted-foreground">
                no matches for “{query.trim()}”
              </li>
            {/if}
          {/each}
        </ul>
      {:else}
        <div class="px-3 py-6 text-center text-[11.5px] text-muted-foreground/80">
          输入以搜索全部文档 · ↑↓ 选择 · ↵ 跳转 · esc 关闭
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .search-panel {
    inline-size: min(40rem, calc(100vw - 2rem));
    border-radius: 0.75rem;
    outline: 1px solid color-mix(in oklab, currentColor 18%, transparent);
    outline-offset: -1px;
    box-shadow:
      0 24px 60px rgb(0 0 0 / 0.4),
      0 4px 16px rgb(0 0 0 / 0.25);
  }
</style>

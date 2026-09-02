<script lang="ts">
  /**
   * The full-text search palette (search-corpus change, 2026-09-02;
   * native-dialog rewrite, r9 acceptance). A real <dialog> driven by
   * showModal()/close(): the platform supplies the top layer, the
   * ::backdrop scrim, the focus trap, the inert page behind, and the
   * Escape close (the cancel request — no hand-rolled Escape handler).
   * The palette adds only the house laws on top: the glass material on
   * the dialog box, the subtraction scrim on ::backdrop, the 14vh top
   * anchor via dialog MARGIN (never a fixed overlay div), focus handed
   * back to the recorded opener on close, and click-away through the
   * native idiom (event.target === dialog — the backdrop pseudo
   * belongs to the dialog's own hit area). Results are
   * SECTION-granularity (page × heading, deep-linked via the corpus's
   * converging ids); ⌘K/Ctrl-K toggles; the palette speaks ONLY the
   * SearchEngine interface — which engine backs it is a wiring
   * decision (engine-minisearch today).
   */
  import { createMinisearchEngine, type CorpusPage } from '$lib/search/engine-minisearch';
  import { tokenize } from '$lib/search/tokenizer';
  import type { SearchHit } from '$lib/search/engine-types';
  import { icons } from '$lib/icons';

  let dialogEl = $state<HTMLDialogElement | undefined>(undefined);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);
  let query = $state('');
  let hits = $state<SearchHit[]>([]);
  let searching = $state(false);
  let active = $state(0);
  let debounce: ReturnType<typeof setTimeout> | undefined;
  // focus restoration: whoever held focus when the palette opened
  // (the header trigger, most often) receives it back on close
  let opener: HTMLElement | null = null;

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
    if (dialogEl === undefined) return;
    if (!dialogEl.open) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialogEl.showModal();
    }
    inputEl?.focus();
  };
  const close = (): void => {
    dialogEl?.close();
  };
  // EVERY native close path lands here (Escape's cancel request, the
  // backdrop click, a picked result): reset the palette and hand
  // focus back to the opener
  const onClosed = (): void => {
    query = '';
    hits = [];
    active = 0;
    opener?.focus();
  };
  const onDialogClick = (event: MouseEvent): void => {
    // the native idiom: a click whose target IS the dialog hit the
    // backdrop — children (the panel surface) never match
    if (event.target === dialogEl) close();
  };
  const go = (hit: SearchHit): void => {
    close();
    window.location.assign(hit.href);
  };
  const onKey = (event: KeyboardEvent): void => {
    // IME composition (Chinese input): the Enter that COMMITS a
    // composition must not navigate — only a real Enter does (Escape
    // never travels this path anymore: the platform's cancel request
    // owns it, and it stays suppressed while composing)
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key === 'ArrowDown' || (event.key === 'n' && event.ctrlKey)) {
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
      if (dialogEl?.open) close();
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

<!-- the dialog IS the panel: closed by default (the UA hides it), the
     top layer above the page when modal, its ::backdrop the scrim -->
<dialog
  bind:this={dialogEl}
  class="jx-glass search-dialog"
  aria-label="Search the docs"
  onclick={onDialogClick}
  onclose={onClosed}
>
  <div class="flex items-center gap-2 border-b border-border/40 px-3 py-2.5">
    <!-- the shared magnifier (icons law): 16px baked, 18px here via
         consumer CSS; currentColor rides the muted chain -->
    <span
      class="flex-none select-none text-muted-foreground [&_svg]:h-[18px] [&_svg]:w-[18px]"
      aria-hidden="true">{@html icons.search}</span>
    <input
      bind:this={inputEl}
      bind:value={query}
      onkeydown={onKey}
      class="w-full bg-transparent font-mono text-[13px] outline-none placeholder:text-muted-foreground/60"
      placeholder="Search the docs…"
      aria-label="Search the docs"
      title="Full-text search — ⌘K / Ctrl-K toggles, ↑↓ selects, ↵ opens, esc closes"
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
  {/if}
</dialog>

<style>
  /* UA geometry re-anchored with MARGIN alone: the fixed inset-0 box
     keeps margin-inline auto for centering and takes 14vh at the top —
     no fixed overlay, no transform tricks */
  .search-dialog {
    margin: 14vh auto auto;
    inline-size: min(40rem, calc(100vw - 2rem));
    padding: 0;
    border: none;
    border-radius: 0.75rem;
    color: var(--foreground);
    outline: 1px solid color-mix(in oklab, currentColor 18%, transparent);
    outline-offset: -1px;
    box-shadow:
      0 24px 60px rgb(0 0 0 / 0.4),
      0 4px 16px rgb(0 0 0 / 0.25);
  }
  /* the scrim rides the house subtraction law (never added black):
     contrast pulls the page behind toward mid-tones — near-white
     darkens, near-black lightens, both themes correct at zero color
     tokens (the tabs/separator contrast-ghost law) */
  .search-dialog::backdrop {
    -webkit-backdrop-filter: contrast(0.5);
    backdrop-filter: contrast(0.5);
  }
</style>

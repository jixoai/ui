<script lang="ts">
  /**
   * The full-text search palette (search-corpus change, 2026-09-02).
   * r12: the surface COMPOSES the Dialog component — the house's
   * dialog family carries the curated motion essence (the --jx-p
   * kernel entry, the cancel-routed ANIMATED exit, live tracking, the
   * --scrim law, the entity depth). The palette hand-rolling its own
   * kernel wiring in r11 missed exactly that essence (Owner: "use the
   * Dialog component — it already animates"); now it adds only the
   * search specifics: the input head, the three states, the staggered
   * results, the IME cancel guard, backdrop-click close, and focus
   * handed back to the opener. ⌘K/Ctrl-K toggles; results are
   * SECTION-granularity (page × heading, deep-linked via the corpus's
   * converging ids); the palette speaks ONLY the SearchEngine
   * interface (engine-minisearch today).
   */
  import Dialog from '$lib/ui/dialog/dialog.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import { createMinisearchEngine, type CorpusPage } from '$lib/search/engine-minisearch';
  import { tokenize } from '$lib/search/tokenizer';
  import type { SearchHit } from '$lib/search/engine-types';
  import { icons } from '$lib/icons';

  // the palette's own root; the Dialog's platform element is found
  // beneath it (bind:this on a component yields its bindings, not its
  // DOM — a wrapper query is the composition-safe route)
  let rootEl = $state<HTMLDivElement | undefined>(undefined);
  const platform = (): HTMLDialogElement | null =>
    rootEl?.querySelector('dialog') ?? null;
  // the native field, found under the Dialog's platform (bind:this on
  // the Input component yields its bindings, not its DOM)
  const field = (): HTMLInputElement | null => rootEl?.querySelector('input') ?? null;
  let open = $state(false);
  let query = $state('');
  let hits = $state<SearchHit[]>([]);
  let searching = $state(false);
  let debouncing = $state(false);
  let active = $state(0);
  let debounce: ReturnType<typeof setTimeout> | undefined;
  // focus restoration: whoever held focus when the palette opened
  // (the header trigger, most often) receives it back on close
  let opener: HTMLElement | null = null;
  // IME flight: while a composition is live the cancel request (Escape)
  // must hold — the commit key belongs to the IME (Dialog's cancelGuard)
  let composing = false;

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
    if (query.trim() === '') {
      debouncing = false;
      return;
    }
    debouncing = true;
    debounce = setTimeout(
      () => void run().finally(() => (debouncing = false)),
      120,
    );
  });
  // the two flight phases the UI speaks: the debounce window and the
  // engine's await — one busy flag drives the pending state
  const busy = $derived(debouncing || searching);

  // the open edge: record the opener, focus the input, and arm the
  // native backdrop-click idiom on the platform element (the Dialog
  // owns the element; an added listener composes, never forks)
  $effect(() => {
    const dialog = platform();
    if (!open || dialog === null) return;
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    queueMicrotask(() => field()?.focus());
    const onPlatformClick = (event: MouseEvent): void => {
      if (event.target === dialog) open = false; // the falling edge runs Dialog's animated shut
    };
    dialog.addEventListener('click', onPlatformClick);
    return () => dialog.removeEventListener('click', onPlatformClick);
  });
  // the close edge: focus goes home (the header trigger law) and the
  // palette state resets
  $effect(() => {
    if (!open) {
      opener?.focus();
      query = '';
      hits = [];
      active = 0;
    }
  });

  const openPalette = (): void => {
    open = true;
  };
  const close = (): void => {
    open = false;
  };
  const go = (hit: SearchHit): void => {
    close();
    window.location.assign(hit.href);
  };
  const onKey = (event: KeyboardEvent): void => {
    // IME composition (Chinese input): the Enter that COMMITS a
    // composition must not navigate — only a real Enter does (Escape
    // never travels this path: Dialog routes the cancel request, and
    // the cancelGuard holds it through the composition)
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
      if (open) close();
      else openPalette();
    }
  };

  // content motion (r11, kept): enter-only WAAPI — a fast rise whose
  // stagger makes lists feel summoned. transform/opacity only; reduced
  // motion or a WAAPI-less engine skips straight to rest
  const canAnimate = (): boolean =>
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.body.animate === 'function' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches === false;

  /** mount-time rise: state blocks swap with one fast beat */
  const riseIn = (node: HTMLElement): { destroy: () => void } => {
    if (!canAnimate()) return { destroy: () => {} };
    const anim = node.animate(
      [
        { opacity: 0, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 150, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' },
    );
    return { destroy: () => anim.cancel() };
  };

  // list entrance: each result rises with a tight stagger (18ms/item,
  // first 8 only — long lists land as one fleet, never a slow pour)
  $effect(() => {
    void hits;
    const dialog = platform();
    if (dialog === null || !open || !canAnimate()) return;
    const items = [...dialog.querySelectorAll<HTMLLIElement>('[role="option"]')];
    items.forEach((item, i) => {
      if (typeof item.animate !== 'function') return;
      item.animate(
        [
          { opacity: 0, transform: 'translateY(5px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 160,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          fill: 'backwards',
          delay: i < 8 ? i * 18 : 0,
        },
      );
    });
  });

  const MARK_OPEN = '\x01';
  const MARK_CLOSE = '\x02';
  const highlight = (text: string, terms: string[]): string => {
    if (text === '' || terms.length === 0) return text;
    const pattern = terms
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    return text.replace(new RegExp(`(${pattern})`, 'gi'), `${MARK_OPEN}$1${MARK_CLOSE}`);
  };
  const parts = (marked: string): { text: string; mark: boolean }[] =>
    marked
      .split(MARK_OPEN)
      .flatMap((chunk) => chunk.split(MARK_CLOSE))
      .map((chunk, i) => ({ text: chunk, mark: i % 2 === 1 }))
      .filter((part) => part.text !== '');
</script>

<svelte:window onkeydown={onGlobalKey} />
<svelte:document onjx-search-open={() => openPalette()} />

<!-- the palette IS the Dialog now (r12): geometry-only platform
     overrides (the 14vh top anchor, the wider 44rem); the motion, the
     scrim, the entity depth, and the animated cancel exit all come
     from the component -->
<div bind:this={rootEl} class="contents">
<Dialog
  bind:open={open}
  title="Search the docs"
  variant="auto"
  class="mt-[14vh] w-[min(92vw,44rem)]"
  cancelGuard={() => composing}
>
  {#snippet head()}
    <!-- the r14 tuning: the Input component IS the head (flush,
         edge-to-edge) — its prefix-icon lane carries the magnifier,
         its suffix lane the flight cue, its own shell the row's
         height and padding. Dialog's x button rides the row's end -->
    <Input
      class="w-full min-w-0 flex-1"
      bind:value={query}
      onkeydown={onKey}
      oncompositionstart={() => (composing = true)}
      oncompositionend={() => (composing = false)}
      placeholder="Search the docs…"
      aria-label="Search the docs"
      title="Full-text search — ⌘K / Ctrl-K toggles, ↑↓ selects, ↵ opens, esc closes"
    >
      {#snippet innerInlineStart()}
        <span
          class="flex-none select-none text-muted-foreground [&_svg]:h-[16px] [&_svg]:w-[16px]"
          aria-hidden="true">{@html icons.search}</span>
      {/snippet}
      {#snippet innerInlineEnd()}
        {#if busy}
          <span class="jx-flight flex flex-none gap-1" aria-hidden="true"><i></i><i></i><i></i></span>
        {/if}
      {/snippet}
    </Input>
  {/snippet}

  {#if query.trim() === ''}
    <!-- idle: no teaching copy (the global law) — the palette is just
         the field until there is something to say -->
  {:else if busy}
    <!-- PENDING: a named state, not a trailing ellipsis -->
    <div class="flex items-center gap-3 px-5 py-8" data-jx-search-pending role="status" use:riseIn>
      <span class="jx-flight flex gap-1" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="font-mono text-[12px] text-muted-foreground">Searching…</span>
    </div>
  {:else if hits.length === 0}
    <!-- NO RESULT: a real empty state, not a stray line -->
    <div class="flex flex-col items-center gap-2 px-5 py-9 text-center" data-jx-search-empty use:riseIn>
      <span
        class="select-none text-muted-foreground/50 [&_svg]:h-6 [&_svg]:w-6"
        aria-hidden="true">{@html icons.search}</span>
      <p class="font-mono text-[12.5px] text-foreground/80">
        No results for <span class="text-foreground">“{query.trim()}”</span>
      </p>
      <p class="text-[11px] text-muted-foreground/70">try a shorter or different term</p>
    </div>
  {:else}
    <ul class="max-h-[60vh] overflow-y-auto p-2" role="listbox" use:riseIn>
      {#each hits as hit, i (hit.href)}
        <li role="option" aria-selected={i === active}>
          <a
            href={hit.href}
            class="block rounded-md px-3.5 py-2.5 {i === active ? 'bg-primary/10' : ''}"
            onclick={() => close()}
            onmousemove={() => (active = i)}
          >
            <p class="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {hit.pageTitle}
            </p>
            <p class="mt-1 font-mono text-[13px] font-medium leading-snug">{hit.heading}</p>
            {#if hit.summary !== ''}
              <p class="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                {#each parts(highlight(hit.summary, hit.terms)) as part}{#if part.mark}<mark
                      class="bg-transparent text-primary">{part.text}</mark
                    >{:else}{part.text}{/if}{/each}
              </p>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</Dialog>
</div>

<style>
  /* the flight cue: three dots pulsing in sequence — the quiet way
     to say busy without a spinner's motion weight */
  .jx-flight {
    align-items: center;
  }
  .jx-flight i {
    inline-size: 4px;
    block-size: 4px;
    border-radius: 9999px;
    background: currentColor;
    opacity: 0.4;
    animation: jx-flight-dot 0.9s ease-in-out infinite;
  }
  .jx-flight i:nth-child(2) {
    animation-delay: 0.15s;
  }
  .jx-flight i:nth-child(3) {
    animation-delay: 0.3s;
  }
  @keyframes jx-flight-dot {
    0%,
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-2px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .jx-flight i {
      animation: none;
    }
  }
</style>

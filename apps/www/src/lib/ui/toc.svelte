<!--
  jixoai Combo ToC (registry/files/ui/toc.svelte).
  Desktop: Rule Tracker (spine + weight-driven level-1 nodes, flat
  weight-driven level-2 text, pick + parent markers). Mobile: Terminal Rail
  (glass single-row viewport — expand changes ONLY height; page scroll
  drives the row via the line pick; scroll-snap list). Powered by
  toc-engine (IoM weights + line algorithm + margin-downward law).

  Usage:
    - Pass the outline via `sections` (same shape as your docs model), or
      go zero-handwritten-id with `outline: { root }` — sections and
      extents derive from the content's heading tree (toc-outline lib;
      client-side, refreshed on content mutation). Explicit `sections`
      wins over `outline`.
    - With `sections`, content must mark non-overlapping leaf blocks with
      data-region="<id>" and parent section extents with
      data-family="<id>". With `outline`, neither is needed — the engine
      consumes derived extents.
    - This component renders BOTH surfaces; hide rules come from toc.css.
    - Place the wrapping <aside> BEFORE main content in the DOM; position
      it with your page grid (desktop right column, sticky; mobile sticky
      with height: 0 — see README).
    - Top-layer auto-mount (Owner request, 2026-08-23): "if a topLayer
      exists, the ToC automatically uses it; a prop can disable this."
      Inside a website-scaffold the rail adopts itself with the area role
      'toc' — the scaffold's grid resolves its cell per container form;
      the immersive law keeps it on screen (it compacts under the header
      instead of leaving). topLayer={false} opts out (embedded demos);
      with NO scaffold context the classic in-flow behavior is unchanged.
-->
<script lang="ts">
  import { getContext, untrack } from 'svelte';
  import { createTocEngine } from '$lib/toc-engine';
  import { deriveTocOutline, tocOutlineToSections, type TocOutlineEntry } from '$lib/toc-outline';
  import { icons } from '$lib/icons';
  import '$lib/toc.css';

  export interface TocChild {
    id: string;
    label: string;
  }
  export interface TocSection {
    id: string;
    label: string;
    children?: TocChild[];
  }
  /** zero-handwritten-id mode: derive sections + extents from a content
   *  root's heading tree (the toc-outline lib). Client-side derivation —
   *  SSR renders an empty rail that fills on hydration (the reveal
   *  philosophy); pages needing a complete prerendered rail keep passing
   *  `sections` by hand (an explicit `sections` wins over `outline`). */
  export interface TocOutlineConfig {
    /** the content container whose h2/h3 (configurable) tree is the outline */
    root: string | HTMLElement;
    /** heading levels, default [2, 3] */
    levels?: readonly number[];
  }

  /** The website-scaffold top-layer adoption contract — STRUCTURAL on
   *  purpose: the toc ships standalone in the registry and must not
   *  depend on website-scaffold at build time; the shapes are identical
   *  (see website-scaffold's exported TopLayerApi). Grid era: adoption
   *  carries a semantic area role; the scaffold's grid resolves the
   *  physical cell per container form. */
  interface TopLayerApi {
    /** Adopt a live DOM node into the scaffold's top layer with an area
     *  role; the returned fn releases it. */
    adopt: (node: HTMLElement, opts?: { area?: 'toc' | 'tree' | 'float' }) => () => void;
  }

  interface Props {
    sections?: TocSection[];
    outline?: TocOutlineConfig;
    title?: string;
    /** Scroll root for overlay-shell layouts (selector or element);
     *  defaults to the document. */
    scrollRoot?: string | HTMLElement | null;
    /** Top-layer auto-mount (Owner request, 2026-08-23): true/undefined =
     *  auto — adopt the rail into the website-scaffold's top layer when
     *  the context exists; false = never (embedded demos, bespoke
     *  layouts). No context (sites without the scaffold): unchanged
     *  in-flow behavior either way. */
    topLayer?: boolean;
  }

  let {
    sections,
    outline,
    title = 'reading progress',
    scrollRoot = null,
    topLayer = true,
  }: Props = $props();

  // outline mode: sections + extents derived on the client, refreshed by a
  // MutationObserver on the content root (add/remove/move of headings)
  let outlineSections = $state<TocSection[]>([]);
  let outlineEntries: readonly TocOutlineEntry[] = [];

  const effectiveSections = $derived(sections ?? outlineSections);

  const flat = $derived(
    effectiveSections.flatMap((section, i) => [
      { id: section.id, label: section.label, level: 1 as const, index: i + 1 },
      ...(section.children ?? []).map((child) => ({
        id: child.id,
        label: child.label,
        level: 2 as const,
        index: i + 1,
      })),
    ]),
  );
  const order = $derived(flat.map((entry) => entry.id));
  const parentOf = $derived(
    new Map(
      effectiveSections.flatMap((section) =>
        (section.children ?? []).map((c) => [c.id, section.id] as const),
      ),
    ),
  );

  let desktopItems = $state<HTMLElement[]>([]);
  let mobileLinks = $state<HTMLElement[]>([]);
  let spineFill = $state<HTMLElement | null>(null);
  let viewport = $state<HTMLElement | null>(null);
  let mobileRoot = $state<HTMLElement | null>(null);
  let open = $state(false);
  let currentPick = $state<string | null>(null);
  let rootEl = $state<HTMLElement | null>(null);

  // Top-layer auto-mount: the whole rail (both surfaces) is adopted as a
  // LIVE node — move, never clone (the scaffold-float law) — so Svelte
  // ownership, listeners, bound refs and the engine below all survive the
  // re-parent untouched. The engine reads region rects from the body and
  // scroll offsets from the scroll root; neither moves.
  // Grid era (2026-08-23): adoption carries the semantic role 'toc'; the
  // scaffold's grid resolves the physical cell per container form. ALL
  // measured geometry sync (--jx-toc-right/-w/-top + the resize/layout
  // watchers) is gone — placement is declarative now.
  const topLayerApi = getContext<TopLayerApi>('jx-top-layer');

  $effect(() => {
    if (!rootEl || !topLayerApi || topLayer === false) return;
    const el = rootEl;
    // untrack: adoption touches scaffold state (floatNodes) and moves
    // DOM — neither may feed back into THIS effect's dependencies, or
    // the flush loop exceeds update depth and kills the page runtime
    // (the playCanvas-bindings-dead report, 2026-08-23)
    return untrack(() => {
      // `home` is the return ticket so teardown/hot-reload/route change
      // never leaks a moved node
      const home = el.parentElement;
      el.dataset.toplayer = '';
      const release = topLayerApi.adopt(el, { area: 'toc' });
      return () => {
        release();
        delete el.dataset.toplayer;
        // return the node to its authoring parent so Svelte teardown
        // finds and destroys exactly what it created
        home?.appendChild(el);
      };
    });
  });

  // Live line: WHERE pinned chrome ends. Inside the grid shell this reads
  // the body's resolved scroll-padding — the shell owns the single truth
  // (--jx-toc-line derives from the measured header height + the toc bar
  // row; website-scaffold.css). Standalone consumers (no shell) keep the
  // legacy measurement: mobile = this glass rail's bottom, desktop = the
  // header band's bottom, + 32px breathing room. The engine's line getter
  // and the anchor landing share one value, so algorithm and landing can
  // never drift.
  const tocLine = () => {
    const shellBody = document.querySelector<HTMLElement>('.jx-shell-body');
    if (shellBody) {
      const line = parseInt(getComputedStyle(shellBody).scrollPaddingTop, 10);
      if (Number.isFinite(line) && line > 0) return line;
    }
    const mobile = innerWidth < 900;
    const anchor = mobile
      ? (viewport as HTMLElement | null)
      : (document.querySelector('.jx-scaffold-header') as HTMLElement | null);
    const rect = anchor?.getBoundingClientRect();
    return rect ? Math.round(rect.bottom) + 32 : mobile ? 76 : 106;
  };

  // outline derivation (client-only; SSR renders the empty rail and this
  // fills it on hydration): derive once, then re-derive on content
  // mutations (childList subtree — attribute-only churn never re-derives).
  // The engine reads `outlineEntries` through the extents getter each
  // compute, so a re-derivation goes live without an engine restart.
  $effect(() => {
    if (!outline) return;
    const rootEl =
      typeof outline.root === 'string'
        ? document.querySelector<HTMLElement>(outline.root)
        : outline.root;
    if (!rootEl) return;

    const rederive = () => {
      outlineEntries = deriveTocOutline(rootEl, { levels: outline?.levels });
      outlineSections = tocOutlineToSections(outlineEntries);
    };
    rederive();

    let raf = 0;
    const observer = new MutationObserver(() => {
      if (!raf) raf = requestAnimationFrame(rederive);
    });
    observer.observe(rootEl, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  });

  $effect(() => {
    // publish the line var before any scroll/anchor logic runs so
    // scroll-padding/margin and the engine share one value from frame one
    tocLine();
    const stopEngine = createTocEngine(
      ({ weights, pick }) => {
        for (const li of desktopItems) {
          li.style.setProperty('--w', (weights.get(li.dataset.id!) ?? 0).toFixed(3));
        }
        for (const a of mobileLinks) {
          a.style.setProperty('--w', (weights.get(a.dataset.id!) ?? 0).toFixed(3));
        }
        if (!pick) return;
        currentPick = pick;
        const parent = parentOf.get(pick);
        for (const li of desktopItems) {
          const current = li.dataset.id === pick || li.dataset.id === parent;
          li.classList.toggle('active', current);
        }
        for (const a of mobileLinks) {
          const isPick = a.dataset.id === pick;
          a.style.setProperty('--jx-cur', isPick ? '1' : '0');
          if (isPick) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
        // unified sync (Owner, 2026-08-21): ONE algorithm for both paths —
        // page scroll and expanded-click alike. Instant scrollTo on the
        // collapsed row: no smooth animation to race the height transition,
        // no snap semantics to disagree with. The 44px row shows exactly
        // the picked li, every time.
        const li = mobileLinks.find((a) => a.dataset.id === pick)?.closest('li');
        if (viewport && li) {
          viewport.scrollTo({ top: (li as HTMLElement).offsetTop });
        }
      },
      { lineOffset: tocLine, scrollRoot, extents: outline ? () => outlineEntries : undefined },
    );

    const root =
      typeof scrollRoot === 'string'
        ? document.querySelector<HTMLElement>(scrollRoot)
        : scrollRoot;
    const onScroll = () => {
      if (!spineFill) return;
      const max = root ? root.scrollHeight - root.clientHeight : document.documentElement.scrollHeight - innerHeight;
      const y = root ? root.scrollTop : scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      spineFill.style.setProperty('--jx-progress', Math.max(0.02, p).toFixed(3));
    };
    (root ?? window).addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      stopEngine();
      (root ?? window).removeEventListener('scroll', onScroll);
    };
  });

  const syncRow = () => {
    const li = mobileLinks.find((a) => a.dataset.id === currentPick)?.closest('li');
    if (viewport && li) viewport.scrollTo({ top: (li as HTMLElement).offsetTop });
  };

  const close = () => {
    open = false;
    // re-draw after the height transition truly ends: mid-transition the
    // viewport's clamp ceiling (scrollHeight - clientHeight) is still
    // shrinking, so an early scrollTo gets clamped and never auto-recovers.
    // transitionend fires exactly once when height reaches 44px.
    viewport?.addEventListener(
      'transitionend',
      (ev) => {
        if (ev.propertyName === 'height') syncRow();
      },
      { once: true },
    );
  };
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<div class="jx-toc" bind:this={rootEl}>
  <nav class="jx-toc-desktop" aria-label="Table of contents">
    <span class="jx-spine"><span class="jx-spine-fill" bind:this={spineFill}></span></span>
    <p class="jx-toc-title">{title}</p>
    <ol>
      {#each flat as entry (entry.id)}
        <li
          class={entry.level === 2 ? 'lvl-2' : ''}
          data-id={entry.id}
          bind:this={desktopItems[order.indexOf(entry.id)]}
        >
          <a href={`#${entry.id}`}>{entry.label}</a>
        </li>
      {/each}
    </ol>
  </nav>

  <div class="jx-toc-mobile jx-glass" bind:this={mobileRoot} data-open={open || undefined}>
    <div class="jx-viewport" bind:this={viewport}>
      <ol>
        {#each flat as entry (entry.id)}
          <li>
            <a
              class={entry.level === 2 ? 'lvl-2' : ''}
              href={`#${entry.id}`}
              data-id={entry.id}
              onclick={close}
              bind:this={mobileLinks[order.indexOf(entry.id)]}
            >
              <span class="jx-cursor" aria-hidden="true">❯</span>
              <span>{entry.label}</span>
            </a>
          </li>
        {/each}
      </ol>
    </div>
    <button
      type="button"
      class="jx-toggle"
      aria-expanded={open}
      aria-label="Expand table of contents"
      onclick={() => (open ? close() : (open = true))}
    >
      {@html icons.chevronDown}
    </button>
  </div>
</div>

<script lang="ts">
  // App.svelte — hash router (#/press-button …) + the demo chrome.
  // One route page per frozen family; the hub lists all eight.
  import * as stylex from '@stylexjs/stylex';
  import { demo } from './demo.stylex';
  import PressButtonPage from './pages/press-button-page.svelte';
  import RangePage from './pages/range-page.svelte';
  import PopoverPage from './pages/popover-page.svelte';
  import IconPage from './pages/icon-page.svelte';
  import CodeCardPage from './pages/code-card-page.svelte';
  import ProsePage from './pages/prose-page.svelte';
  import SwitchPage from './pages/switch-page.svelte';
  import SeparatorPage from './pages/separator-page.svelte';

  const FAMILIES = [
    ['press-button', 'press-button'],
    ['range', 'range'],
    ['popover', 'popover'],
    ['icon', 'icon'],
    ['code-card', 'code-card'],
    ['prose', 'prose'],
    ['switch (toggle)', 'switch'],
    ['separator', 'separator'],
  ] as const;

  const PAGES = {
    'press-button': PressButtonPage,
    range: RangePage,
    popover: PopoverPage,
    icon: IconPage,
    'code-card': CodeCardPage,
    prose: ProsePage,
    switch: SwitchPage,
    separator: SeparatorPage,
  } as const;
  type Route = keyof typeof PAGES;

  let hash = $state(location.hash);
  function onHashChange(): void {
    hash = location.hash;
  }

  const route = $derived.by(() => {
    const r = hash.replace(/^#\//, '');
    return (Object.keys(PAGES) as Route[]).find((k) => k === r) ?? null;
  });
  const Page = $derived(route ? PAGES[route] : null);

  // demo chrome state: dark + density ride documentElement (the real
  // scope channel), enabling the same-element computed-style flips the
  // assertions probe
  let dark = $state(false);
  let density = $state<'sm' | 'default' | 'lg'>('default');
  $effect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-density', density);
  });
</script>

<svelte:window onhashchange={onHashChange} />

<div {...stylex.attrs(demo.page)}>
  <nav {...stylex.attrs(demo.nav)}>
    <a {...stylex.attrs(demo.navLink)} href="#/">corpus</a>
    {#each FAMILIES as [label, key] (key)}
      <a {...stylex.attrs(demo.navLink)} href={`#/${key}`}>{label}</a>
    {/each}
    <div {...stylex.attrs(demo.toggleRow)}>
      <button {...stylex.attrs(demo.miniButton)} onclick={() => (dark = !dark)}>
        {dark ? 'light' : 'dark'}
      </button>
      {#each ['sm', 'default', 'lg'] as d (d)}
        <button
          {...stylex.attrs(demo.miniButton)}
          aria-pressed={density === d}
          onclick={() => (density = d as typeof density)}
        >
          {d}
        </button>
      {/each}
    </div>
  </nav>

  {#if Page}
    <Page />
  {:else}
    <h1 {...stylex.attrs(demo.title)}>stylex spike corpus — the frozen 8</h1>
    <p {...stylex.attrs(demo.note)}>
      Each route re-authors one frozen registry family in StyleX on the pinned set
      (svelte 5.57.0 · vite 8.3.0 · @stylexjs 0.19.0). Folder-css residue stays only
      where the placement law demands it (container queries, anchor positioning,
      descendant presence lanes) — per-family ledgers in research/corpus-report.md.
    </p>
  {/if}
</div>

<script lang="ts">
  // App.svelte — d3/tw-baseline demo chrome: same hash-router + dark/
  // density toggles as the corpus App (payload symmetry across all
  // four D3 configurations).
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

  let dark = $state(false);
  let density = $state<'sm' | 'default' | 'lg'>('default');
  $effect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-density', density);
  });
</script>

<svelte:window onhashchange={onHashChange} />

<div class="min-h-dvh bg-background text-primary font-mono text-sm p-4">
  <nav class="flex flex-wrap items-center gap-2 mb-6">
    <a class="text-primary underline underline-offset-4" href="#/">d3 tw-baseline</a>
    {#each FAMILIES as [label, key] (key)}
      <a class="text-muted-foreground hover:text-primary" href={`#/${key}`}>{label}</a>
    {/each}
    <div class="ml-auto flex gap-2">
      <button
        class="border border-border rounded-xs px-2 py-1 hover:bg-accent"
        onclick={() => (dark = !dark)}
      >
        {dark ? 'light' : 'dark'}
      </button>
      {#each ['sm', 'default', 'lg'] as d (d)}
        <button
          class="border border-border rounded-xs px-2 py-1 hover:bg-accent"
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
    <h1 class="text-lg font-semibold">d3 tw-baseline — the frozen 8, TW forms</h1>
    <p class="text-muted-foreground max-w-prose">
      The registry TW forms of the 8 frozen families on the D1 pin set (svelte 5.57.0 ·
      vite 8.3.0 · tailwindcss 4.3.3). Payload trims disclosed in research/d3-consumer.md
      (shiki backend seam → plain-text null backend; @fontsource imports neutralized).
    </p>
  {/if}
</div>

<!-- hmr-probe -->
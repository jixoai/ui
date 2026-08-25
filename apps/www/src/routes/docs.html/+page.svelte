<!--
  docs.html — the docs entry (docs-restructure, 2026-08-25). The
  learning path itself: the three sections as routing cards. The left
  rail (the sections spine) renders in the scaffold chrome; this page
  answers "where do I start".
-->
<script lang="ts">
  import { page } from '$app/state';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { docsSections, flatComponents } from '$lib/docs-route-model';
  import { CATALOG } from '$lib/catalog';

  const sections = docsSections;
  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );
  const hrefNormalized = (href: string): string =>
    href.replace(/\.html$/, '').split('#')[0].replace(/\/+$/, '') || '/';
  const installTargets = CATALOG.filter((e) => e.type !== 'registry:ui');
</script>

<svelte:head>
  <title>Docs · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui docs — the learning path: Sections carries the curriculum (theming, the boundary rulings, the componentless face), Components is the UI-module inventory, Registry is the distribution protocol."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex flex-col gap-10">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="jixoai-ui · docs"
        title="Docs — the learning path"
        summary="Three sections carry the docs: Sections is the curriculum — theming & tokens, the boundary rulings (where wrapping stops) and the componentless face (jx-pure). Components is the UI-module inventory. Registry is the distribution protocol; its overview carries every installable target. The left rail is exactly these three."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">{flatComponents.length} ui modules</span>
          <span class="pill">{installTargets.length} install targets</span>
          <span class="pill">curriculum · inventory · protocol</span>
        </div>
      </SectionCard>
    </div>

    <!-- the section cards: the curriculum index -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal="">
      {#each sections as section (section.id)}
        <section
          class="border-border bg-card flex flex-col gap-3 border p-5"
          aria-label="{section.label} section"
        >
          <div class="flex items-baseline justify-between gap-3">
            <h2 class="font-nav text-[1.05rem] tracking-tight">{section.label}</h2>
          </div>
          <ul class="flex flex-col gap-2" role="list">
            {#each section.pages as pg (pg.title)}
              <li>
                <a
                  class="grid grid-cols-[auto_1fr] items-baseline gap-x-2 gap-y-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  href={pg.href}
                  aria-current={hrefNormalized(pg.href) === normalized ? 'page' : undefined}
                >
                  <span class="text-primary col-start-1 row-start-1 font-mono text-xs" aria-hidden="true">&gt;</span>
                  <span class="col-start-2 row-start-1 flex items-baseline gap-2">
                    <span class="font-mono text-xs">{pg.title}</span>
                    {#if pg.count !== undefined}
                      <span class="font-mono text-[10px] opacity-50">{pg.count}</span>
                    {/if}
                  </span>
                  {#if pg.subtitle}
                    <span class="text-muted-foreground/70 col-start-2 row-start-2 font-nav text-[10px] tracking-[0.02em]">
                      {pg.subtitle}
                    </span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </div>
</div>

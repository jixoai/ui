<!--
  docs.html — the docs entry (docs-restructure, 2026-08-25). The
  learning path itself: the three sections as routing cards. The left
  rail (the sections spine) renders in the scaffold chrome; this page
  answers "where do I start".
-->
<script lang="ts">
  import { page } from '$app/state';
  import { rt } from '$lib/surface/routes.stylex';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { docsSections, flatComponents } from '$lib/docs-route-model';
  import Icon from '$lib/ui/icon';
  import { CATALOG } from '$lib/catalog';

  const sections = docsSections;
  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );
  const hrefNormalized = (href: string): string =>
    href.replace(/\.html$/, '').split('#')[0].replace(/\/+$/, '') || '/';
  const installTargets = CATALOG.filter((e) => e.type !== 'registry:ui');

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Docs · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui docs — the learning path: Sections carries the curriculum (theming, the boundary rulings, the componentless face), Components is the UI-module inventory, Registry is the distribution protocol."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.flex, rt.col, rt.gap40)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="jixoai-ui · docs"
        title="Docs — the learning path"
        summary="Three sections carry the docs: Sections is the curriculum — theming & tokens, the boundary rulings (where wrapping stops) and the componentless face (jx-pure). Components is the UI-module inventory. Registry is the distribution protocol; its overview carries every installable target. The left rail is exactly these three."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">{flatComponents.length} ui modules</span>
          <span class="pill">{installTargets.length} install targets</span>
          <span class="pill">curriculum · inventory · protocol</span>
        </div>
      </SectionCard>
    </div>

    <!-- the section cards: the curriculum index -->
    <div class={cx(rt.dxGrid)} data-reveal="">
      {#each sections as section (section.id)}
        <section
          class={cx(rt.frame, rt.bgCard, rt.flex, rt.col, rt.gap12, rt.p20)}
          aria-label="{section.label} section"
        >
          <div class={cx(rt.flex, rt.itemsBaseline, rt.justifyBetween, rt.gap12)}>
            <h2 class={cx(rt.fontNav, rt.dxHeading, rt.trackTight)}>{section.label}</h2>
          </div>
          <ul class={cx(rt.col8)} role="list">
            {#each section.pages as pg (pg.title)}
              <li>
                <a
                  class={cx(rt.dxNavLink)}
                  href={pg.href}
                  aria-current={hrefNormalized(pg.href) === normalized ? 'page' : undefined}
                >
                  <span class={cx(rt.inkPrimary, rt.dxCol1, rt.dxRow1, rt.flex, rt.itemsCenter)} aria-hidden="true"><Icon name="arrowRight" size={12} /></span>
                  <span class={cx(rt.dxCol2, rt.dxRow1, rt.flex, rt.itemsBaseline, rt.gap8)}>
                    <span class={cx(rt.fontMono, rt.text12)}>{pg.title}</span>
                    {#if pg.count !== undefined}
                      <span class={cx(rt.fontMono, rt.text10, rt.dxOpacity50)}>{pg.count}</span>
                    {/if}
                  </span>
                  {#if pg.subtitle}
                    <span class={cx(rt.inkMuted70, rt.dxCol2, rt.dxRow2, rt.fontNav, rt.text10, rt.dxTrack02)}>
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

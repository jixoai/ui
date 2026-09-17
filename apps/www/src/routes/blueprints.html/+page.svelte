<!--
  Blueprint gallery (apps/www/src/routes/blueprints.html/+page.svelte).

  The render farm for the satori pipeline (2026-08-22, user request):
  one fixed-size stage per catalog entry, each hosting that component's
  REAL demo in its showcase state (dialogs open, popovers shown, toasts
  mounted — see lib/blueprints/force-show.ts). scripts/build-blueprints.mjs
  loads THIS page headless, serializes every [data-blueprint] stage to
  geometry+style JSON, and renders each through vercel/satori into
  apps/www/static/blueprints/<name>.svg — the gray blueprint previews the
  overview cards embed. Not a public docs surface: noindex, not in nav.

  Scene contract (scenes/<name>.svelte):
    - root: <div class="h-full w-full"> filling the stage
    - REAL components from $lib/ui (the blueprint is the real HTML)
    - interactive surfaces forced into their OPEN state
    - one iconic composition — a hero shot, not a documentation dump
-->
<script lang="ts">
  import { CATALOG } from '$lib/catalog';
  import { rt } from '$lib/surface/routes.stylex';
  import { STAGE_H, STAGE_W } from '$lib/blueprints/stage';
  import { SCENES } from '$lib/blueprints/scenes';

  // stages = the catalog + the overview page's guide cards (they embed
  // blueprint bodies too — blueprints.spec.ts locks this union)
  const stages = [
    ...CATALOG.map((entry) => ({ name: entry.name })),
    { name: 'recipes' },
  ];

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
  <title>Blueprints · jixoai-ui</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class={cx(rt.shell, rt.col, rt.gap32)}>
  <h1 class={cx(rt.fontNav, rt.textLg, rt.upper, rt.bpTrack30)}>
    Blueprint gallery
    <span class={cx(rt.inkMuted, rt.bpText08, rt.bpTrack20)}>blueprint rendering</span>
  </h1>

  <div class={cx(rt.bpGrid)}>
    {#each stages as entry (entry.name)}
      {@const Scene = SCENES[entry.name]}
      <figure class={cx(rt.col8)}>
        <figcaption class={cx(rt.eyebrow, rt.inkMuted)}>
          {entry.name}
          {#if !Scene}<span class={cx(rt.bpInkDestructive)}> — scene missing</span>{/if}
        </figcaption>
        <!-- The stage IS the serialization root: fixed geometry, light
             paper background baked into the SVG (theme-independent
             drafting-paper look), everything outside (the caption, the
             shell) is invisible to the tool. -->
        <div
          class="bp-stage"
          data-blueprint={entry.name}
          style="width:{STAGE_W}px;height:{STAGE_H}px"
        >
          {#if Scene}
            <Scene />
          {/if}
        </div>
      </figure>
    {/each}
  </div>
</div>

<style>
  .bp-stage {
    background: var(--card);
    overflow: hidden;
    container-type: inline-size;
  }
</style>

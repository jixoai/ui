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
  import { STAGE_H, STAGE_W } from '$lib/blueprints/stage';
  import { SCENES } from '$lib/blueprints/scenes';
</script>

<svelte:head>
  <title>Blueprints · jixoai-ui</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <h1 class="font-nav text-lg uppercase tracking-[0.3em]">
    Blueprint gallery
    <span class="text-muted-foreground text-[0.8em] tracking-[0.2em]">蓝图渲染场</span>
  </h1>

  <div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
    {#each CATALOG as entry (entry.name)}
      {@const Scene = SCENES[entry.name]}
      <figure class="flex flex-col gap-2">
        <figcaption class="font-nav text-muted-foreground text-[11px] uppercase tracking-[0.24em]">
          {entry.name}
          {#if !Scene}<span class="text-destructive"> — scene missing</span>{/if}
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

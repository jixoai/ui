<!--
  Overview card (apps/www/src/lib/overview-card.svelte).

  The catalog card:
    - body: ONLY the component's SVG blueprint (the gray drafting
      preview rendered from the REAL component by the satori pipeline —
      see scripts/build-blueprints.mjs); the text introduction stays in
      the access tree only, sr-only (the wing popover retired,
      2026-08-25, Owner ruling: no hover-revealed descriptions).
    - hover NEVER moves the card (press law, jixoai.css): only the
      border warms and the shadow grows; active presses 1px into the
      page (2026-08-25, Owner ruling — the hover translate removed
      with it).
    - the copy control sits in the card's top corner: an icon-only
      button whose tooltip carries the full command.
-->
<script lang="ts">
  import CopyIconButton from '$lib/copy-icon-button.svelte';
  import { STAGE_H, STAGE_W } from '$lib/blueprints/stage';

  interface Props {
    /** registry item name (blueprint slug + install argument) */
    name: string;
    /** registry type eyebrow (registry:ui → ui) */
    type: string;
    /** one-line introduction — kept for the access tree (sr-only) */
    summary: string;
    /** docs page */
    href: string;
    /** install command; omit for non-registry cards (guides) */
    command?: string;
  }

  let { name, type, summary, href, command }: Props = $props();

  let blueprintFailed = $state(false);
</script>

<section
  class="border-border bg-card shadow-xs relative grid grid-rows-subgrid row-span-2
    transition-[transform,box-shadow,border-color] duration-150
    hover:border-primary hover:shadow-sm
    active:translate-x-px active:translate-y-px active:shadow-none
    motion-reduce:transition-none"
  aria-label={name}
>
  <!-- header: eyebrow + title; the summary stays in the access tree -->
  <div class="border-border relative flex flex-col gap-3 border-b px-4 py-3 sm:px-5 sm:py-4">
    <p class="text-primary font-nav text-[11px] uppercase tracking-[0.24em]">{type}</p>
    <h3 class="font-nav text-balance text-[1.05rem] leading-tight tracking-tight sm:text-[1.22rem]">
      {name}
    </h3>
    <p class="sr-only">{summary}</p>
    {#if command}
      <!-- top-corner copy control: icon-only, tooltip carries the
           command. z-2 keeps it above the stretched link below. -->
      <div class="pointer-events-none absolute top-2.5 right-2.5 z-[2] sm:top-3 sm:right-3">
        <CopyIconButton {command} />
      </div>
    {/if}
  </div>

  <!-- body: ONLY the blueprint -->
  <div class="px-4 py-4 sm:px-5 sm:py-5">
    {#if blueprintFailed}
      <!-- transitional hatch: a scene/blueprint that has not been
           generated yet (the catalog lock test makes this rare) -->
      <div
        class="border-border/60 border"
        style="aspect-ratio:{STAGE_W}/{STAGE_H};background:repeating-linear-gradient(45deg,transparent 0 10px,var(--border) 10px 11px);opacity:.35"
        aria-hidden="true"
      ></div>
    {:else}
      <img
        src="/blueprints/{name}.svg"
        alt=""
        loading="lazy"
        decoding="async"
        width={STAGE_W}
        height={STAGE_H}
        class="border-border/60 h-auto w-full border"
        onerror={() => (blueprintFailed = true)}
      />
    {/if}
  </div>

  <!-- stretched link: overlays the whole card so any click opens the
       page; the copy button above sits at z-2 as its own target -->
  <a class="jx-card-link" href={href} aria-label="open the {name} page"></a>
</section>

<style>
  .jx-card-link {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .jx-card-link:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }
</style>

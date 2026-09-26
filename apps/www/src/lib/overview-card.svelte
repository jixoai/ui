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
  import { siteChrome } from '$lib/surface/site-chrome.stylex';
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

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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

<section
  class={cx(siteChrome.ocCard)}
  aria-label={name}
>
  <!-- header: eyebrow + title; the summary stays in the access tree -->
  <div class={cx(siteChrome.ocHeader)}>
    <p class={cx(siteChrome.ocEyebrow)}>{type}</p>
    <h3 class={cx(siteChrome.ocTitle)}>
      {name}
    </h3>
    <p class={cx(siteChrome.ocSummary)}>{summary}</p>
    {#if command}
      <!-- top-corner copy control: icon-only, tooltip carries the
           command. z-2 keeps it above the stretched link below. -->
      <div class={cx(siteChrome.ocCopySlot)}>
        <CopyIconButton {command} />
      </div>
    {/if}
  </div>

  <!-- body: ONLY the blueprint -->
  <div class={cx(siteChrome.ocBody)}>
    {#if blueprintFailed}
      <!-- transitional hatch: a scene/blueprint that has not been
           generated yet (the catalog lock test makes this rare) -->
      <div
        class={cx(siteChrome.ocHatch)}
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
        class={cx(siteChrome.ocBlueprint)}
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

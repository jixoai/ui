<!--
  Overview card (apps/www/src/lib/overview-card.svelte).

  The catalog card, redesigned (2026-08-22, user spec):
    - body: ONLY the component's SVG blueprint (the gray drafting
      preview rendered from the REAL component by the satori pipeline —
      see scripts/build-blueprints.mjs); the text introduction moved
      out of the always-visible header into the hover wing.
    - hover/focus: the card extends a wing on the inline-end side —
      an absolutely-positioned continuation (border + surface continue
      the card) carrying the summary and the install command. Pure
      overlay: grid layout never shifts. Near the viewport's inline-end
      edge the wing flips to the inline-start side instead.
    - the copy control moved to the card's top corner: an icon-only
      button whose tooltip carries the full command (user spec #1).

  Pointer continuity: the wing is a DOM CHILD of the card, so moving
  the pointer onto it never leaves the card — no collapse flicker.
-->
<script lang="ts">
  import CopyIconButton from '$lib/copy-icon-button.svelte';
  import { icons } from '$lib/icons';
  import { STAGE_H, STAGE_W } from '$lib/blueprints/stage';

  interface Props {
    /** registry item name (blueprint slug + install argument) */
    name: string;
    /** registry type eyebrow (registry:ui → ui) */
    type: string;
    /** one-line introduction — shown in the hover wing */
    summary: string;
    /** docs page */
    href: string;
    /** install command; omit for non-registry cards (guides) */
    command?: string;
    /** body shows the blueprint (registry cards); guides fall back to
     *  a text body — they have no rendered scene */
    blueprint?: boolean;
  }

  let { name, type, summary, href, command, blueprint = true }: Props = $props();

  const WING_W = 280;

  let cardEl = $state<HTMLElement | null>(null);
  let expanded = $state(false);
  let flip = $state(false);
  let blueprintFailed = $state(false);

  // which side has room for the wing? checked on every expand — resize
  // between hovers must not pin a stale side
  function side(): void {
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    flip = rect.right + WING_W + 24 > window.innerWidth;
  }
</script>

<section
  bind:this={cardEl}
  onpointerenter={() => {
    side();
    expanded = true;
  }}
  onpointerleave={() => (expanded = false)}
  onfocusin={() => {
    side();
    expanded = true;
  }}
  onfocusout={(e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) expanded = false;
  }}
  class="border-border bg-card shadow-xs relative grid grid-rows-subgrid row-span-2
    transition-[transform,box-shadow,border-color] duration-150
    hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm
    active:translate-x-px active:translate-y-px active:shadow-none
    motion-reduce:transition-none
    {expanded ? 'z-30' : ''}"
  aria-label={name}
>
  <!-- header: eyebrow + title only; the summary lives in the wing (+
       the sr-only copy below keeps it in the access tree) -->
  <div class="border-border relative flex flex-col gap-3 border-b px-4 py-3 sm:px-5 sm:py-4">
    <p class="text-primary font-nav text-[11px] uppercase tracking-[0.24em]">{type}</p>
    <h3 class="font-nav text-balance text-[1.05rem] leading-tight tracking-tight sm:text-[1.22rem]">
      {name}
    </h3>
    <p class="sr-only">{summary}</p>
    {#if command}
      <!-- top-corner copy control: icon-only, tooltip carries the
           command (user spec #1). z-2 keeps it above the stretched
           link below. -->
      <div class="pointer-events-none absolute top-2.5 right-2.5 z-[2] sm:top-3 sm:right-3">
        <CopyIconButton {command} />
      </div>
    {/if}
  </div>

  <!-- body: the blueprint for registry cards; guides (no scene) read
       as a text body instead (user spec #4 is about the component
       inventory) -->
  <div class="px-4 py-4 sm:px-5 sm:py-5">
    {#if !blueprint}
      <p class="text-pretty text-[13px] leading-5 text-muted-foreground sm:text-[14px] sm:leading-6">
        {summary}
      </p>
    {:else if blueprintFailed}
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

  <!-- the wing: a continuation of the card surface on the inline-end
       side (flips near the viewport edge). It is a link — the same
       destination as the stretched link — so the expanded region is
       fully clickable. visibility (not display) keeps the transition
       and removes the hidden link from the tab order. -->
  <a
    href={href}
    aria-label="open the {name} page"
    class="border-border bg-card shadow-xs jx-wing
      {flip ? 'jx-wing-start' : 'jx-wing-end'}
      {expanded ? 'jx-wing-open' : ''}"
    style="--jx-wing-w:{WING_W}px"
  >
    <span class="text-pretty text-[13px] leading-5 text-muted-foreground sm:text-[14px] sm:leading-6">
      {summary}
    </span>
    <span class="mt-auto flex items-center justify-between gap-3">
      {#if command}
        <code class="text-foreground/70 font-mono text-[12px]">$ {command}</code>
      {:else}
        <span class="font-mono text-[12px]">guide</span>
      {/if}
      <span class="text-primary flex-none select-none" aria-hidden="true">{@html icons.arrowRight}</span>
    </span>
  </a>

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

  .jx-wing {
    position: absolute;
    top: -1px; /* cover the card's own border: the two read as ONE surface */
    bottom: -1px;
    width: var(--jx-wing-w);
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    /* visibility: not display — transitionable, and a hidden wing link
       must not be focusable */
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 150ms ease,
      transform 150ms ease,
      visibility 150ms;
  }
  .jx-wing-end {
    left: calc(100% - 1px);
    border-width: 1px 1px 1px 0;
    transform: translateX(-8px);
  }
  .jx-wing-start {
    right: calc(100% - 1px);
    border-width: 1px 0 1px 1px;
    transform: translateX(8px);
  }
  .jx-wing-open {
    visibility: visible;
    opacity: 1;
    transform: translateX(0);
  }
  /* the wing continues the card surface — when the card's border
     warms on hover, the wing's border follows (one surface, one law) */
  section:hover .jx-wing {
    border-color: var(--primary);
  }
  @media (prefers-reduced-motion: reduce) {
    .jx-wing {
      transition: none;
    }
  }
</style>

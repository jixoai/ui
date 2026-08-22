<!--
  Overview card (apps/www/src/lib/overview-card.svelte).

  The catalog card, redesigned (2026-08-22, user spec):
    - body: ONLY the component's SVG blueprint (the gray drafting
      preview rendered from the REAL component by the satori pipeline —
      see scripts/build-blueprints.mjs); the text introduction moved
      out of the always-visible header into the wing.
    - the wing is a native Popover API panel anchored to the card
      through CSS Anchor Positioning (the popover.svelte/tooltip.svelte
      laws): it starts on the inline-end side and position-try flips
      it inline/block automatically — the browser picks left / right /
      top / bottom by available space, which also makes it behave on
      narrow mobile viewports (2026-08-23 refactor from the hand-rolled
      absolute overlay). Top layer = zero stacking-context games and
      zero layout impact by construction.
    - open model: hover intent (fine pointers, 150ms in / 150ms grace
      out), keyboard focus opens instantly, and on coarse pointers the
      FIRST tap opens the wing while the second (or a tap on the wing)
      navigates — light dismiss (popover=auto) closes it anywhere else.
    - the copy control sits in the card's top corner: an icon-only
      button whose tooltip carries the full command (user spec #1).
-->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import CopyIconButton from '$lib/copy-icon-button.svelte';
  import { icons } from '$lib/icons';
  import { STAGE_H, STAGE_W } from '$lib/blueprints/stage';

  interface Props {
    /** registry item name (blueprint slug + install argument) */
    name: string;
    /** registry type eyebrow (registry:ui → ui) */
    type: string;
    /** one-line introduction — shown in the wing */
    summary: string;
    /** docs page */
    href: string;
    /** install command; omit for non-registry cards (guides) */
    command?: string;
  }

  let { name, type, summary, href, command }: Props = $props();

  // $derived: reading props outside a reactive context warns (Codex r1)
  const anchorName = $derived(`--jx-wing-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const panelId = $derived(`jx-wing-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

  let panel = $state<HTMLElement | null>(null);
  let cardLink = $state<HTMLAnchorElement | null>(null);
  let blueprintFailed = $state(false);
  let open = $state(false);

  // one schedule state machine, not ad-hoc timers (Codex r1): open and
  // close are mutually exclusive pending intents
  let pending: 'open' | 'close' | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const popoverApi = (el: HTMLElement | null): el is HTMLElement & { showPopover(): void; hidePopover(): void } =>
    !!el && typeof el.showPopover === 'function';

  function clearTimers(): void {
    clearTimeout(timer);
    pending = null;
  }

  function schedule(intent: 'open' | 'close', delay: number): void {
    if (pending === intent) return;
    clearTimeout(timer);
    pending = intent;
    timer = intent === 'open' ? setTimeout(show, delay) : setTimeout(hide, delay);
  }

  function show(): void {
    clearTimers();
    if (popoverApi(panel) && !panel!.matches(':popover-open')) panel!.showPopover();
  }
  function hide(): void {
    clearTimers();
    if (popoverApi(panel) && panel!.matches(':popover-open')) panel!.hidePopover();
  }

  function onPointerEnter(e: PointerEvent): void {
    // touch taps fire pointerenter too — their open path is the click
    // intercept below, not hover
    if (e.pointerType === 'touch') return;
    schedule('open', 150);
  }
  function onPointerLeave(): void {
    schedule('close', 150);
  }

  // the open truth is :popover-open (native light dismiss, Escape and
  // this component's own paths all land in the same toggle seam)
  function onPanelToggle(): void {
    open = panel?.matches(':popover-open') ?? false;
    cardLink?.setAttribute('aria-expanded', String(open));
  }

  // coarse-pointer interaction is decided by the EVENT, not by a media
  // query — `(pointer: coarse)` misreports in some embedded/headless
  // engines; the pointerdown that precedes the click never lies
  let lastPointerType = '';
  // a touch tap ALSO focuses the card link — the focusin handler would
  // open the wing mid-gesture and the click's live :popover-open read
  // would then treat the FIRST tap as "already open" and navigate away.
  // Suppress focus-open while a touch gesture is in flight
  let touchGestureUntil = 0;
  function onPointerDown(e: PointerEvent): void {
    lastPointerType = e.pointerType;
    if (e.pointerType === 'touch') touchGestureUntil = performance.now() + 600;
  }
  function onFocusIn(): void {
    if (performance.now() < touchGestureUntil) return;
    show();
  }

  // coarse pointers: first tap unfolds the wing, second navigates.
  // Open state is read LIVE at fire time (the popover.svelte lesson —
  // the toggle event may lag the click), and a just-opened-then-
  // light-dismissed wing still counts as "first tap consumed" so the
  // next tap navigates instead of reopening (Codex r2 race)
  let openedAtTap = 0;
  function onCardClick(e: MouseEvent): void {
    // keyboard-activated clicks (Enter on the link) carry detail === 0 —
    // never treat them as touch even if a stale type lingers (Codex r4)
    if (lastPointerType !== 'touch' || e.detail === 0) return;
    // engines without the Popover API keep the default link behavior —
    // preventDefault here would strand the tap (show() is a no-op)
    if (!popoverApi(panel)) return;
    if (panel?.matches(':popover-open')) return;
    if (performance.now() - openedAtTap < 800) {
      openedAtTap = 0;
      // consumed: clear so a later pointerdown-less click (keyboard)
      // can't inherit the stale touch state (Codex r3)
      lastPointerType = '';
      return;
    }
    e.preventDefault();
    openedAtTap = performance.now();
    show();
  }

  onDestroy(clearTimers);
</script>

<section
  style="anchor-name: {anchorName}"
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
  onpointerdown={onPointerDown}
  onfocusin={onFocusIn}
  onfocusout={(e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) hide();
  }}
  class="border-border bg-card shadow-xs relative grid grid-rows-subgrid row-span-2
    transition-[transform,box-shadow,border-color] duration-150
    hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm
    active:translate-x-px active:translate-y-px active:shadow-none
    motion-reduce:transition-none"
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

  <!-- body: ONLY the blueprint (user spec #4) -->
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

  <!-- the wing: a continuation of the card surface, starting on the
       inline-end side; native position-try flips it left / up / down
       wherever space runs out. It is a link — the same destination as
       the stretched link — so the unfolded region is fully clickable. -->
  <a
    bind:this={panel}
    href={href}
    id={panelId}
    popover="auto"
    aria-label="open the {name} page"
    ontoggle={onPanelToggle}
    onpointerenter={clearTimers}
    onpointerleave={onPointerLeave}
    class="jx-wing jx-surface"
    data-variant="auto"
    style="position-anchor: {anchorName}"
  >
    <!-- surface body (paint + ::after shadow) + scroll ring
         (floating-surface law arch r3: the platform <a popover> paints
         nothing) -->
    <span class="jx-wing-body jx-surface-body">
      <span class="jx-wing-scroll">
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
      </span>
    </span>
  </a>

  <!-- stretched link: overlays the whole card so any click opens the
       page; the copy button above sits at z-2 as its own target -->
  <a
    bind:this={cardLink}
    class="jx-card-link"
    href={href}
    aria-label="open the {name} page"
    aria-expanded="false"
    aria-controls={panelId}
    onclick={onCardClick}
  ></a>
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

  /* explicit fallback candidates (Codex r1, blocking #1): flip-block
     alone does NOT reliably produce top/bottom placements from an
     inline-end inset-area — on narrow viewports the panel must be able
     to land ABOVE or BELOW the card, spanning almost the full width */
  @position-try --jx-wing-block-end {
    inset-area: bottom;
    position-area: bottom; /* legacy alias — set both (Codex r3) */
    width: min(280px, 92vw);
    margin: 8px 0 0 0;
  }
  @position-try --jx-wing-block-start {
    inset-area: top;
    position-area: top; /* legacy alias — set both (Codex r3) */
    width: min(280px, 92vw);
    margin: 0 0 8px 0;
  }

  .jx-wing {
    /* hidden unless the Popover API is live (Codex r1, blocking #3):
       without popover support the UA styles for [popover] never apply
       and the panel would render as a permanent second link inside the
       card — engines without it simply get no wing (the sr-only
       summary keeps the introduction in the access tree) */
    display: none;
    /* MUST live here, NOT inline: @position-try candidates cannot
       override inline styles — with an inline inset-area every custom
       candidate silently fails and the panel overflows narrow
       viewports (Codex r2, reproduced on Chromium 140) */
    inset-area: right;
    position-area: right;
    width: min(280px, 78vw);
    margin: 0 0 0 -1px; /* overlap the card's border: ONE surface */
    /* hide the panel once its anchor card scrolled out (popover law) */
    position-try-fallbacks: flip-inline, --jx-wing-block-end, --jx-wing-block-start;
    position-try: flip-inline, --jx-wing-block-end, --jx-wing-block-start;
    position-visibility: anchors-visible;
  }
  /* the scroll+padding ring inside the surface body (jx-surface law:
     the body paints, this ring scrolls) */
  .jx-wing-scroll {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 60vh;
    overflow-y: auto;
    padding: 14px 16px;
  }
  @supports selector(:popover-open) {
    /* block display on the OPEN state only — a base-state display
       override would defeat the UA sheet's closed-popover display:none
       and leave the invisible panel hit-testable (popconfirm.svelte
       law, Codex r3); the body ring owns the flex layout */
    .jx-wing:popover-open {
      display: block;
    }
  }
  /* the wing continues the card surface — when the card's border warms
     on hover, the wing's border follows (one surface, one law) */
  section:hover .jx-wing {
    border-color: var(--primary);
  }
  @supports not (anchor-name: --jx-wing-fallback) {
    /* engines without anchor positioning: never worse — centered */
    .jx-wing {
      position-anchor: auto !important;
      inset-area: none !important;
      position-area: none !important;
      inset: 0;
      margin: auto;
      align-self: center;
      justify-self: center;
    }
  }
</style>

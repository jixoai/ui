<!--
  jixoai navigation menu (registry/files/ui/navigation-menu.svelte).
  The site-nav pattern: a horizontal bar of top-level triggers, each
  with an OPTIONAL panel of links — the part raw popovers don't give
  you is the NAVIGATION contract, so this is an independent thin
  coordinator (batch-4 ruling), not "just popovers":

    top-level focus walking is the bar's: ←/→ move between triggers
    (roving tabindex over triggers, like tabs — a nav bar is walked,
    not hunted); Enter/Space/click opens the panel; Escape closes and
    focus returns to the trigger. While a panel is open, walking swaps
    panels without a close bounce (menubar glide — keyboard-driven).

  CLICK OPEN ONLY (Owner ruling, 2026-08-25 — the terminal-header
  law, realigned here 2026-08-25 after a drift round): the hover path,
  its 150ms intent, its grace timers and its pointer corridor are
  RETIRED. Panels are the registry Popover primitive (native popover=
  auto light dismiss + one-at-a-time, CSS anchor positioning with
  try-fallbacks, and the WAAPI surface-motion entry/exit — the
  animation the raw-div era never had); triggers are BUTTONS, so the
  open/close toggle rides the DECLARATIVE popovertarget wire (the
  primitive's zero-listener path — the invoker association exempts the
  trigger from light dismiss by construction, no click-order race),
  and open state mirrors ONLY through the primitive's onToggle seam.
  terminal-header keeps the imperative dance because ITS triggers are
  links; a nav bar's panel triggers are buttons and take the native
  wire. Panels carry REAL LINKS — navigation-menu moves you through a
  site; actions belong to dropdown-menu. The current section marks its
  trigger aria-current (the page's own truth, passed in — the menu
  never guesses).

  Data-driven: items carry label + href + a panel slot id; panels are
  composed through the `panel` snippet keyed by item id.

  tw4 (2026-08-24): bar/trigger/link paint as token utilities (the
  current + open states are JS-known → conditional strings, preserving
  the hover-beats-aria-current specificity order); the anchored panel
  law lives in the Popover primitive (its css), and this folder's
  navigation-menu.css dissolved with the 2026-08-25 rebuild — the
  consumer residue is panelClass utilities only.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Popover from '$lib/ui/popover/popover.svelte';
  import { cn } from '$lib/utils';

  export interface NavMenuItem {
    id: string;
    label: string;
    /** the section root — shown by plain-link items without panels */
    href?: string;
    /** set on the section's own top-level trigger */
    current?: boolean;
    /** has a panel (renders via the panel snippet) */
    hasPanel?: boolean;
  }

  interface Props {
    items: NavMenuItem[];
    /** nav landmark label */
    label?: string;
    /** panel content per item id (rendered inside the popover) */
    panel?: Snippet<[NavMenuItem]>;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    class?: string;
  }

  let {
    items,
    label = 'site',
    panel,
    variant = 'auto',
    class: className = '',
  }: Props = $props();

  /** the popover primitive's imperative handles — the arrow-walk glide
      only; the click toggle itself is the declarative popovertarget */
  const handles: Record<string, { show(source?: HTMLElement): void; hide(): void } | null> = {};

  /** open state mirrors ONLY the primitive's onToggle seam — the
      native toggle event covers click, light dismiss, Escape and
      one-at-a-time, so aria-expanded never lies */
  let openId = $state('');
  /** the roving tab stop follows arrow focus (initial: current ?? first) */
  let activeId = $state('');

  function onPanelToggle(id: string, open: boolean): void {
    if (open) openId = id;
    else if (openId === id) openId = '';
  }

  /** the bar's own keyboard walk — arrows move between triggers */
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const triggers = [
      ...(barEl?.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="true"]') ?? []),
    ];
    if (triggers.length === 0) return;
    const current = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    event.preventDefault();
    const next =
      triggers[(current + (event.key === 'ArrowRight' ? 1 : -1) + triggers.length) % triggers.length];
    const target = items.find((i) => `jx-navmenu-trigger-${i.id}` === next.id);
    if (target) activeId = target.id;
    next.focus();
    // an open panel follows the walk (menubar glide behavior)
    if (openId !== '' && target && target.id !== openId) {
      handles[openId]?.hide();
      handles[target.id]?.show(next);
    }
  }

  let barEl = $state<HTMLElement | null>(null);

  // one tab stop on the bar: the LAST-FOCUSED trigger, falling back to
  // the current section's trigger, else the first
  const tabStopId = $derived(
    (activeId || items.find((item) => item.current && item.hasPanel)?.id) ??
      items.find((item) => item.hasPanel)?.id ??
      '',
  );

  // the shared trigger/link paint; the current/open color states are
  // conditional strings (mirroring the scoped era's specificity order:
  // open beats current, hover beats current-but-closed)
  const itemPaint =
    'inline-flex items-center px-[0.875rem] py-2 font-nav text-xs uppercase tracking-[0.12em] no-underline cursor-pointer transition-colors duration-150 ease-out focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1';
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -- the
     nav hosts the top-level arrow walk; its triggers are the
     interactive elements -->
<nav
  bind:this={barEl}
  data-jx-navmenu=""
  class={cn('flex flex-wrap items-stretch gap-1', className)}
  aria-label={label}
  onkeydown={handleKeydown}
>
  {#each items as item (item.id)}
    {#if item.hasPanel}
      <Popover
        id="jx-navmenu-{item.id}"
        placement="bottom-start"
        variant={variant}
        panelClass="w-fit max-w-[min(92vw,26rem)]"
        bind:this={handles[item.id]}
        onToggle={(open) => onPanelToggle(item.id, open)}
      >
        {#snippet trigger()}
          <button
            type="button"
            id="jx-navmenu-trigger-{item.id}"
            popovertarget="jx-navmenu-{item.id}"
            aria-haspopup="true"
            aria-expanded={openId === item.id}
            aria-controls="jx-navmenu-{item.id}"
            aria-current={item.current ? 'true' : undefined}
            tabindex={tabStopId === item.id ? 0 : -1}
            class={cn(
              itemPaint,
              openId === item.id
                ? 'text-foreground'
                : item.current
                  ? 'text-primary hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
            )}
            onfocus={() => (activeId = item.id)}
          >
            {item.label}
          </button>
        {/snippet}
        <!-- svelte-ignore a11y_no_static_element_interactions -- Escape
             handling only; the panel's links are the interactive
             elements. The hide() is EXPLICIT: preventDefault on the
             keydown cancels the native close request, so without it
             focus would return over a still-open panel (Codex r1
             blocking #1, browser-reproduced) -->
        <div
          class="flex flex-col"
          data-jx-navmenu-panel-body=""
          onkeydown={(e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              handles[item.id]?.hide();
              document.getElementById(`jx-navmenu-trigger-${item.id}`)?.focus();
            }
          }}
        >
          {#if panel}
            {@render panel(item)}
          {/if}
        </div>
      </Popover>
    {:else if item.href}
      <a
        class={cn(itemPaint, item.current ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
        data-jx-navmenu-link=""
        href={item.href}
        aria-current={item.current ? 'page' : undefined}
      >
        {item.label}
      </a>
    {/if}
  {/each}
</nav>

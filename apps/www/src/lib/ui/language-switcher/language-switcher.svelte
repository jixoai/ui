<!--
  jixoai language switcher (registry/files/ui/language-switcher/language-switcher.svelte).
  Two variants, composed after the openspecui bilingual reference:

    pair — icon + segmented two-locale group (EN / 中文 style): the active
           locale fills with the brand hue; anchored navigation (SSG-safe)
    menu — icon + current-locale button opening a dropdown list for three
           or more locales; same anchor model, closes on select / outside
           click / Escape

  Locales are links, not buttons: each entry carries its own href (e.g.
  the localized path of the current page), so the switcher works on fully
  prerendered sites. Terminal-surface styling matches theme-toggle
  (light border on the dark bezel).

  tw4 (2026-08-24): PURE utility migration, zero css residue — the
  bezel's currentColor color-mix paint rides arbitrary-value utilities,
  and the active-locale states are JS-known, so conditional strings
  carry them.

  popover platform (CR-2, 2026-09-02): the menu rides popover=auto +
  CSS Anchor Positioning beside its trigger (the alert-dialog inline
  pattern) — the retired hand-positioned absolute dropdown needed its
  own outside-click/Escape wiring and sat in the grid-law's gray zone.
  Light dismiss, Escape, and the top layer are the platform's now.
-->
<script lang="ts">
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';

  export interface SwitcherLocale {
    code: string;
    label: string;
    href: string;
  }

  interface Props {
    variant?: 'pair' | 'menu';
    locales: readonly SwitcherLocale[];
    current: string;
    ariaLabel?: string;
  }

  let { variant = 'pair', locales, current, ariaLabel = 'Language' }: Props = $props();

  let open = $state(false);
  let menu = $state<HTMLUListElement | null>(null);
  let activeLabel = $derived(locales.find((l) => l.code === current)?.label ?? current);
  // a per-instance anchor name (CSS anchor positioning namespaces by
  // document — two switchers on one page must not share one anchor)
  const anchor = `--jx-lang-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div data-jx-lang="" class="flex items-center gap-2">
  <!-- glyphs from the shared icons module; sizing/stroke overrides are
       consuming-context CSS (the module bakes 16px / sw 2) -->
  <span class="inline-flex opacity-70 [&_svg]:h-3.5 [&_svg]:w-3.5">{@html icons.languages}</span>

  {#if variant === 'pair'}
    <div
      data-jx-lang-seg=""
      class="inline-flex w-fit max-w-full overflow-hidden border border-[color-mix(in_oklab,currentColor_30%,transparent)] bg-[color-mix(in_oklab,currentColor_6%,transparent)]"
      role="group"
      aria-label={ariaLabel}
    >
      {#each locales.slice(0, 2) as locale (locale.code)}
        <a
          href={locale.href}
          hreflang={locale.code}
          aria-current={locale.code === current ? 'true' : undefined}
          data-jx-lang-item=""
          data-jx-lang-active={locale.code === current ? '' : undefined}
          class={cn(
            'px-2.5 py-1 text-xs font-medium no-underline transition-[color,background-color] duration-150 ease-out',
            locale.code === current
              ? 'bg-primary text-primary-foreground'
              : 'text-[color-mix(in_oklab,currentColor_72%,transparent)] hover:bg-[color-mix(in_oklab,currentColor_12%,transparent)] hover:text-current',
          )}
        >
          {locale.label}
        </a>
      {/each}
    </div>
  {:else}
    <button
      type="button"
      data-jx-lang-btn=""
      class="inline-flex cursor-pointer items-center gap-1.5 border border-[color-mix(in_oklab,currentColor_30%,transparent)] bg-[color-mix(in_oklab,currentColor_6%,transparent)] px-2.5 py-1 text-xs font-medium text-[color-mix(in_oklab,currentColor_72%,transparent)] transition-[color,border-color] duration-150 ease-out hover:border-[color-mix(in_oklab,currentColor_70%,transparent)] hover:text-current"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={ariaLabel}
      style="anchor-name: {anchor}"
      onclick={() => menu?.togglePopover()}
    >
      {activeLabel}
      <span class="inline-flex transition-transform {open ? 'rotate-180' : ''} [&_svg]:h-3 [&_svg]:w-3 [&_svg]:stroke-[2.5]">
        {@html icons.chevronDown}
      </span>
    </button>
    <!-- popover=auto: hidden by the UA until shown — always mounted so
         togglePopover() never races an {#if} render; the toggle event
         is the one truth for `open` (light dismiss included) -->
    <ul
      bind:this={menu}
      data-jx-lang-menu=""
      popover="auto"
      class="m-0 min-w-[9rem] list-none border border-border bg-terminal p-1 text-terminal-foreground shadow"
      style="position-anchor: {anchor}; position-area: block-end; position-try: flip-block; margin: 0.375rem;"
      role="listbox"
      aria-label={ariaLabel}
      ontoggle={(e) => (open = e.newState === 'open')}
    >
      {#each locales as locale (locale.code)}
        <li>
          <a
            href={locale.href}
            hreflang={locale.code}
            role="option"
            aria-selected={locale.code === current ? 'true' : undefined}
            data-jx-lang-menu-item=""
            data-jx-lang-menu-active={locale.code === current ? '' : undefined}
            class={cn(
              'block px-2.5 py-1.5 text-xs no-underline transition-[color,background-color] duration-150 ease-out',
              locale.code === current
                ? 'text-primary'
                : 'text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] hover:bg-terminal-hover hover:text-terminal-foreground',
            )}
            onclick={() => menu?.hidePopover()}
          >
            {locale.label}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

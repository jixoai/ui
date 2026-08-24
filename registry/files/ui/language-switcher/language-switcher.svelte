<!--
  jixoai language switcher (registry/files/ui/language-switcher.svelte).
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
-->
<script lang="ts">
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
  let root = $state<HTMLElement | null>(null);
  let activeLabel = $derived(locales.find((l) => l.code === current)?.label ?? current);
</script>

<div class="jx-lang flex items-center gap-2" bind:this={root}>
  <svg
    class="h-3.5 w-3.5 opacity-70"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>

  {#if variant === 'pair'}
    <div
      class="jx-lang-seg inline-flex w-fit max-w-full overflow-hidden border border-[color-mix(in_oklab,currentColor_30%,transparent)] bg-[color-mix(in_oklab,currentColor_6%,transparent)]"
      role="group"
      aria-label={ariaLabel}
    >
      {#each locales.slice(0, 2) as locale (locale.code)}
        <a
          href={locale.href}
          hreflang={locale.code}
          aria-current={locale.code === current ? 'true' : undefined}
          class={cn(
            'jx-lang-item px-2.5 py-1 text-xs font-medium no-underline transition-[color,background-color] duration-150 ease-out',
            locale.code === current
              ? 'jx-lang-active bg-primary text-primary-foreground'
              : 'text-[color-mix(in_oklab,currentColor_72%,transparent)] hover:bg-[color-mix(in_oklab,currentColor_12%,transparent)] hover:text-current',
          )}
        >
          {locale.label}
        </a>
      {/each}
    </div>
  {:else}
    <div class="relative">
      <button
        type="button"
        class="jx-lang-btn inline-flex cursor-pointer items-center gap-1.5 border border-[color-mix(in_oklab,currentColor_30%,transparent)] bg-[color-mix(in_oklab,currentColor_6%,transparent)] px-2.5 py-1 text-xs font-medium text-[color-mix(in_oklab,currentColor_72%,transparent)] transition-[color,border-color] duration-150 ease-out hover:border-[color-mix(in_oklab,currentColor_70%,transparent)] hover:text-current"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onclick={() => (open = !open)}
        onkeydown={(e) => e.key === 'Escape' && (open = false)}
      >
        {activeLabel}
        <svg
          class="h-3 w-3 transition-transform {open ? 'rotate-180' : ''}"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {#if open}
        <ul
          class="jx-lang-menu absolute right-0 top-[calc(100%+6px)] z-50 m-0 min-w-[9rem] list-none border border-border bg-terminal p-1 text-terminal-foreground shadow"
          role="listbox"
          aria-label={ariaLabel}
        >
          {#each locales as locale (locale.code)}
            <li>
              <a
                href={locale.href}
                hreflang={locale.code}
                role="option"
                aria-selected={locale.code === current ? 'true' : undefined}
                class={cn(
                  'jx-lang-menu-item block px-2.5 py-1.5 text-xs no-underline transition-[color,background-color] duration-150 ease-out',
                  locale.code === current
                    ? 'jx-lang-menu-active text-primary'
                    : 'text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] hover:bg-terminal-hover hover:text-terminal-foreground',
                )}
                onclick={() => (open = false)}
              >
                {locale.label}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<svelte:window
  onclick={(e) => {
    if (open && root && !root.contains(e.target as Node)) open = false;
  }}
/>

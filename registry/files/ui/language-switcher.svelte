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
-->
<script lang="ts">
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
      class="jx-lang-seg"
      role="group"
      aria-label={ariaLabel}
    >
      {#each locales.slice(0, 2) as locale (locale.code)}
        <a
          href={locale.href}
          aria-current={locale.code === current ? 'true' : undefined}
          class="jx-lang-item"
          class:jx-lang-active={locale.code === current}
        >
          {locale.label}
        </a>
      {/each}
    </div>
  {:else}
    <div class="relative">
      <button
        type="button"
        class="jx-lang-btn"
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
        <ul class="jx-lang-menu" role="listbox" aria-label={ariaLabel}>
          {#each locales as locale (locale.code)}
            <li>
              <a
                href={locale.href}
                role="option"
                aria-selected={locale.code === current ? 'true' : undefined}
                class="jx-lang-menu-item"
                class:jx-lang-menu-active={locale.code === current}
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

<style>
  .jx-lang-seg {
    display: inline-flex;
    width: fit-content;
    max-width: 100%;
    overflow: hidden;
    border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
    background: color-mix(in oklab, currentColor 6%, transparent);
  }
  .jx-lang-item {
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    color: color-mix(in oklab, currentColor 72%, transparent);
    text-decoration: none;
    transition: color 150ms ease-out, background-color 150ms ease-out;
  }
  .jx-lang-item:hover {
    color: currentColor;
    background: color-mix(in oklab, currentColor 12%, transparent);
  }
  .jx-lang-active {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  .jx-lang-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
    background: color-mix(in oklab, currentColor 6%, transparent);
    color: color-mix(in oklab, currentColor 72%, transparent);
    cursor: pointer;
    transition: color 150ms ease-out, border-color 150ms ease-out;
  }
  .jx-lang-btn:hover {
    color: currentColor;
    border-color: color-mix(in oklab, currentColor 70%, transparent);
  }
  .jx-lang-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 50;
    min-width: 9rem;
    margin: 0;
    padding: 4px;
    list-style: none;
    background: var(--terminal);
    color: var(--terminal-foreground);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }
  .jx-lang-menu-item {
    display: block;
    padding: 6px 10px;
    font-size: 12px;
    text-decoration: none;
    color: color-mix(in oklab, var(--terminal-foreground) 72%, transparent);
    transition: color 150ms ease-out, background-color 150ms ease-out;
  }
  .jx-lang-menu-item:hover {
    color: var(--terminal-foreground);
    background: var(--terminal-hover);
  }
  .jx-lang-menu-active {
    color: var(--primary);
  }
</style>

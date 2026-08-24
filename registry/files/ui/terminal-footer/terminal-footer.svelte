<!--
  jixoai terminal footer (registry/files/ui/terminal-footer.svelte).
  The ghost wordmark closes the narrative: huge hollow brand word
  (text-stroke recipe, @supports fallback), muted meta row with links that
  transition to brand hue on hover.

  tw4 (2026-08-24): the ghost's stroke paint and the ext-icon law ride
  utilities in the markup (the injected svg sizes through a [&_svg]
  arbitrary variant); ONLY the @supports fallback for engines without
  -webkit-text-stroke stays in terminal-footer.css — D1-exempt residue
  on the unlayered carve-out (it must override the text-transparent
  utility paint when it fires).
-->
<script lang="ts">
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';
  import './terminal-footer.css';

  export interface FooterLink {
    label: string;
    href: string;
  }

  interface Props {
    ghost: string;
    links: FooterLink[];
    copyright?: string;
  }

  let { ghost, links, copyright }: Props = $props();
  const year = new Date().getFullYear();
</script>

<footer class="mx-auto w-full max-w-[90rem] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
  <p
    class={cn(
      'jx-footer-ghost font-nav select-none text-transparent text-[clamp(3rem,11vw,9rem)] leading-[0.9] [-webkit-text-stroke:1px_color-mix(in_oklab,var(--border)_55%,transparent)]',
    )}
    aria-hidden="true"
  >{ghost}</p>
  <div
    class="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[12.5px] text-muted-foreground"
  >
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
      {#each links as link (link.href)}
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer"
          class="transition-colors hover:text-primary"
        >
          {link.label}
          <span
            class="jx-ext inline-flex flex-none w-3 h-3 ms-[0.2em] align-[-0.125em] [&_svg]:w-full [&_svg]:h-full"
            aria-hidden="true"
          >{@html icons.externalLink}</span>
        </a>
      {/each}
    </div>
    <span>{copyright ?? `© ${year}`}</span>
  </div>
</footer>

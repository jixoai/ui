<!--
  jixoai terminal footer (registry/files/ui/terminal-footer.svelte).
  The ghost wordmark closes the narrative: huge hollow brand word
  (text-stroke recipe, @supports fallback), muted meta row with links that
  transition to brand hue on hover.
-->
<script lang="ts">
  import { icons } from '$lib/icons';
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
  <p class="jx-footer-ghost font-nav select-none" aria-hidden="true">{ghost}</p>
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
          <span class="jx-ext" aria-hidden="true">{@html icons.externalLink}</span>
        </a>
      {/each}
    </div>
    <span>{copyright ?? `© ${year}`}</span>
  </div>
</footer>

<style>
  /* shared inline icon set ($lib/icons): 12px beside 12.5px footer text */
  .jx-ext {
    display: inline-flex;
    flex: none;
    width: 0.75rem;
    height: 0.75rem;
    margin-inline-start: 0.2em;
    vertical-align: -0.125em;
  }
  .jx-ext svg {
    width: 100%;
    height: 100%;
  }
  .jx-footer-ghost {
    font-size: clamp(3rem, 11vw, 9rem);
    line-height: 0.9;
    color: transparent;
    -webkit-text-stroke: 1px color-mix(in oklab, var(--border) 55%, transparent);
  }
  @supports not (-webkit-text-stroke: 1px black) {
    .jx-footer-ghost {
      color: color-mix(in oklab, var(--border) 35%, transparent);
    }
  }
</style>

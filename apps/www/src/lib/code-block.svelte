<!--
  Site-internal readonly code surface, now a thin wrapper over the registry
  CodeCard (same-source law): the meta strip rides CodeCard's header snippet
  slot as a LEFT-side terminal tag (prompt icon + nav label — the icon law,
  no text glyphs), highlighting is Shiki through lib/shiki (on-demand
  grammars/themes), and the copy control stays off to keep prose pages
  quiet.
-->
<script lang="ts">
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import { icons } from '$lib/icons';

  interface Props {
    code: string;
    lang?: string;
    meta?: string;
  }

  let { code, lang = 'ts', meta = '' }: Props = $props();
</script>

{#if meta}
  <CodeCard {code} {lang} copyable={false} class="jx-code-block">
    {#snippet header()}
      <span class="prompt flex items-center" aria-hidden="true">{@html icons.arrowRight}</span>
      <span class="font-nav uppercase">{meta}</span>
    {/snippet}
  </CodeCard>
{:else}
  <CodeCard {code} {lang} copyable={false} class="jx-code-block" />
{/if}

<style>
  /* the terminal prompt icon keeps its primary tint inside the card head */
  .prompt {
    color: var(--primary);
  }
  .prompt :global(svg) {
    width: 0.75rem;
    height: 0.75rem;
  }
  /* CodeCard's side slot is right-aligned by default (ml-auto, built for
     the lang label); the meta tag is a LEFT head element — flip it so
     the strip reads from the card's start edge like a filename would */
  :global(.jx-code-block [data-jx-code-card-side]) {
    margin-left: 0;
  }
</style>

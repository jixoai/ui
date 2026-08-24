<!--
  Site-internal readonly code surface, now a thin wrapper over the registry
  CodeCard (same-source law): the meta strip rides CodeCard's header snippet
  slot with the terminal prompt glyph, highlighting is Shiki through
  lib/shiki (on-demand grammars/themes), and the copy control stays off to
  keep prose pages quiet.
-->
<script lang="ts">
  import CodeCard from '$lib/ui/code-card/code-card.svelte';

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
      <span class="prompt" aria-hidden="true">&gt;</span>
      <span>{meta}</span>
    {/snippet}
  </CodeCard>
{:else}
  <CodeCard {code} {lang} copyable={false} class="jx-code-block" />
{/if}

<style>
  /* the terminal prompt glyph keeps its primary tint inside the card head */
  .prompt {
    color: var(--primary);
  }
</style>

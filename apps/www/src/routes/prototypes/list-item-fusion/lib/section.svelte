<!--
  Section — test-rig chrome for the fusion matrix (not a contestant).
  Renders the shared section heading so every strategy variant presents
  the identical matrix skeleton.
-->
<script lang="ts">
  let { title, hint, children }: { title: string; hint?: string; children: Snippet } = $props();
</script>

<section class="p-section" data-section={title.toLowerCase().replaceAll(/\s+/g, '-')}>
  <h2 class="p-section-title">{title}</h2>
  {#if hint}<p class="p-section-hint">{hint}</p>{/if}
  {@render children()}
</section>

<style>
  .p-section {
    display: grid;
    gap: 0.5rem;
    margin-block: 0;
  }
  .p-section-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .p-section-hint {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--muted-foreground);
  }
</style>

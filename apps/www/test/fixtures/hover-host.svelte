<!--
  Test host for the hover-card intent contract: a focusable trigger with
  a rich card behind it.
-->
<script lang="ts">
  import HoverCard from '../../src/lib/ui/hover-card.svelte';
</script>

<HoverCard>
  {#snippet trigger()}
    <a href="/team/gaubee">@gaubee</a>
  {/snippet}
  <div>
    <p><strong>Gaubee</strong></p>
    <p>systems · component grammar</p>
  </div>
</HoverCard>

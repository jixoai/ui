<!--
  PlayHelp — the standardized prose primitive: a full-span footer of
  the PlayFields grid. Not a card, not another panel — muted prose that
  may carry <code> accents.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<p class="jx-play-help">
  {@render children()}
</p>

<!-- float-button blueprint: the plain idiom — a lone fixed corner action
     over muted page context. The serializer clamps position:fixed into
     the stage; the glyph is the shared arrowRight icon rotated upright. -->
<script lang="ts">
  import FloatButton from '$lib/ui/float-button.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
  import { icons } from '$lib/icons';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <Skeleton class="h-4 w-2/3"></Skeleton>
  <Skeleton class="h-3 w-1/2"></Skeleton>
  <Skeleton class="h-3 w-3/5"></Skeleton>
</div>

<FloatButton label="back to top">
  <span class="-rotate-90 inline-flex" aria-hidden="true">{@html icons.arrowRight}</span>
</FloatButton>

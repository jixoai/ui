<!-- blockquote blueprint: the frozen two-rung ladder plus one hue
     injection — the quote surface, the banner's shape. -->
<script lang="ts">
  import Blockquote from '$lib/ui/blockquote/blockquote.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <div class="flex w-full max-w-[520px] flex-col gap-3">
    <Blockquote label="Stevens" cite="Thirteen Ways of Looking, XIII">
      It was evening all afternoon. It was snowing, and it was going to snow.
    </Blockquote>
    <Blockquote variant="tonal" class="jx-hue-info" label="Note">
      The streaming prefix never remounts while chunks arrive.
    </Blockquote>
  </div>
  <div class="flex flex-wrap gap-2">
    <Badge>outline · tonal — frozen</Badge>
    <Badge>no fill / no ghost</Badge>
    <Badge>cite = footer &gt; cite</Badge>
  </div>
</div>

<!-- text blueprint: the mark matrix in one passage — every member is
     the semantic element, one word per form. -->
<script lang="ts">
  import Text, { Strong, Em, Del, Mark, Ins, Sub, Sup } from '$lib/ui/text';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <p class="m-0 max-w-[520px] text-left text-base leading-8">
    <Text>Plain paragraph, <Strong>strong</Strong> at the 600 settle, <Em>stress</Em>,
    <Del>struck</Del>, <Mark>highlighted</Mark>, <Ins>inserted</Ins>, H<Sub>2</Sub>O, and
    x<Sup>2</Sup> — the whole family in one flow.</Text>
  </p>
  <div class="flex flex-wrap gap-2">
    <Badge>8 forms · one vocabulary</Badge>
    <Badge>mark = literal slot (own 'p')</Badge>
    <Badge>face-composing</Badge>
  </div>
</div>

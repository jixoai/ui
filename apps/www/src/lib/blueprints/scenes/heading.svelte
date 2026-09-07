<!-- heading blueprint: the em ladder — level sets the element and the
     size, the ambient scale flows by inheritance. -->
<script lang="ts">
  import Heading from '$lib/ui/heading/heading.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <div class="flex w-full max-w-[520px] flex-col gap-2">
    <Heading level={1}>The document title</Heading>
    <Heading level={2}>The section rung</Heading>
    <Heading level={3}>The subsection</Heading>
    <Heading level={4}>The minor label</Heading>
  </div>
  <div class="flex flex-wrap gap-2">
    <Badge>em ladder · 1.875em → 1em</Badge>
    <Badge>level = the element</Badge>
    <Badge>zero own margins</Badge>
  </div>
</div>

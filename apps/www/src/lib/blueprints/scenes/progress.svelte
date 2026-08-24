<!-- progress blueprint: determinate + indeterminate bars. -->
<script lang="ts">
  import Progress from '$lib/ui/progress/progress.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-8 p-10">
  <Progress label="publishing registry" value={0.7} />
  <Progress label="indexing" />
</div>

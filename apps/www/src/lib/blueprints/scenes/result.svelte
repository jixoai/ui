<!-- result blueprint: the page-level outcome — status glyph in the framed
     tile, uppercase title, description, action row. -->
<script lang="ts">
  import Result from '$lib/ui/result/result.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <div class="w-full max-w-[440px]">
    <Result density="lg"
      status="success"
      title="release shipped"
      description="Registry 77 published to ui.jixoai.com — p95 unchanged, zero dropped builds."
    >
      {#snippet actions()}
        <PressButton variant="outline">view release</PressButton>
        <PressButton variant="primary">share</PressButton>
      {/snippet}
    </Result>
  </div>
</div>

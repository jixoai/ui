<!-- pattern-cta blueprint: the shell-prompt CTA band — lead block,
     the install command on a code card, exactly ONE copy affordance. -->
<script lang="ts">
  import PatternCta from '$lib/ui/pattern-cta/pattern-cta.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <PatternCta
    heading="ship it today"
    summary="one init, every atom, zero runtime dependencies."
    command="npx jixoai-ui init"
    secondaryLabel="read the docs"
    secondaryHref="/docs.html"
  />
</div>

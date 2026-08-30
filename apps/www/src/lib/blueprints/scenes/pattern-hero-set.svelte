<!-- pattern-hero-set blueprint: the terminal-window hero — one
     copyCommand string driving the CTA, the clipboard payload and the
     typed demo. -->
<script lang="ts">
  import PatternHeroSet from '$lib/ui/pattern-hero-set/pattern-hero-set.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <PatternHeroSet
    eyebrow="jixoai-ui"
    summary="the terminal-native component registry — zero runtime deps, one physics."
    copyCommand="npx jixoai-ui init"
    barTitle="~/dev/app"
  />
</div>

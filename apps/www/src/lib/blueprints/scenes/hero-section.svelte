<!-- hero-section blueprint: the Broadside hero at its natural two-column
     width, camera-cropped by the stage. The min-1100px grid breakpoint
     is viewport-driven (the render pass is 1280 wide), so holding the
     hero at ~900px keeps the brand column legible and shows the terminal
     column entering the frame on the right — no scaling tricks (the
     serializer pairs measured rects with computed font sizes, so
     transform/zoom would desync glyph sizes). -->
<script lang="ts">
  import HeroSection from '$lib/ui/hero-section/hero-section.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<div class="h-full w-full overflow-hidden">
  <div class="w-[900px]">
    <HeroSection
      eyebrow="your-app · v0"
      titleLead="Ship "
      titleAccent="it."
      summary="Installs into your repo. The source stays yours."
      badges={['registry', 'copy CTA']}
      copyCommand="npx jixoai-ui init"
    >
      {#snippet secondary()}
        <PressButton variant="outline">overview</PressButton>
      {/snippet}
      {#snippet terminal()}
        <TerminalCard
          barTitle="quick-start — zsh"
          command="npx jixoai-ui init"
          outputs={['theme installed', 'hue applied']}
        />
      {/snippet}
    </HeroSection>
  </div>
</div>

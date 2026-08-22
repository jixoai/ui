<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import BadgeIndicator from '$lib/ui/badge-indicator.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import badgeindicatorSource from '$lib/ui/badge-indicator.svelte?raw';

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/badge-indicator.svelte', content: badgeindicatorSource },
  ];
</script>

<svelte:head>
  <title>BadgeIndicator · jixoai-ui</title>
  <meta name="description" content="antd Badge's live half: the count/dot riding a corner of its child. dot is presence without a number; count caps at 99+; zero hides honestly unless showZero." />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="badge-indicator — the live count/dot overlay" summary="antd Badge's live half: the count/dot riding a corner of its child. dot is presence without a number; count caps at 99+; zero hides honestly unless showZero.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase · batch 2</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="badge-indicator"
      description="badge-indicator — the live count/dot overlay"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/badge-indicator.svelte"
      files={canvasFiles}
    >
      <div class="flex flex-wrap items-center gap-8">
        <BadgeIndicator dot label="2 unread">
          <span class="inline-flex size-8 items-center justify-center border border-border bg-muted font-mono text-[11px]">GB</span>
        </BadgeIndicator>
        <BadgeIndicator count={5}>
          <span class="inline-flex size-8 items-center justify-center border border-border bg-muted font-mono text-[11px]">AL</span>
        </BadgeIndicator>
        <BadgeIndicator count={250} />
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the dot paints brand; counts paint destructive and cap at overflow. Standalone (no child) is an inline chip. count=0 renders NOTHING — zero unread is no badge.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>

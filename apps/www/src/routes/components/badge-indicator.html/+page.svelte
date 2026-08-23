<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import BadgeIndicator from '$lib/ui/badge-indicator.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import badgeindicatorSource from '$lib/ui/badge-indicator.svelte?raw';

  const usage = `<!-- dot = presence without a number; label is the a11y name -->
<BadgeIndicator dot label="2 unread">
  <Avatar name="Grace" />
</BadgeIndicator>

<!-- count caps at 99+ (overflowBound); zero hides honestly -->
<BadgeIndicator count={5}>
  <button type="button">inbox</button>
</BadgeIndicator>

<!-- standalone (no child) is an inline chip -->
<BadgeIndicator count={250} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/badge-indicator.svelte', content: badgeindicatorSource },
    { name: 'src/lib/ui/badge-indicator-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>BadgeIndicator · jixoai-ui</title>
  <meta name="description" content="antd Badge's live half: the count/dot riding a corner of its child. dot is presence without a number; count caps at 99+; zero hides honestly unless showZero. Standalone is an inline chip." />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · antd 裁决"
        title="badge-indicator — the live count/dot overlay"
        summary="antd Badge's live half, split from the static chip (badge.svelte): the count/dot rides a corner of its child. dot is presence without a number — label carries the accessible name; count caps at 99+ and zero hides honestly unless showZero. Standalone (no child) is an inline chip."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">dot · count · standalone</span>
          <span class="pill">99+ overflow cap</span>
          <span class="pill">zero hides honestly</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="badge-indicator"
        description="Three postures: the dot (presence, no number), a capped count, and the standalone chip. The demo children are plain spans — anything with a corner carries the badge."
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

    <div id="badge-indicator-law" data-reveal="" use:reveal>
      <SectionCard
        family="badge-indicator-law"
        headerRegion="badge-indicator-law"
        eyebrow="law"
        title="Presence rules"
        summary="The overlay is a positional wrapper, not a semantic one: the badge rides the child's corner as decoration, and the label/count carries the meaning. Zero is the absence of news — it renders nothing unless showZero says otherwise."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>

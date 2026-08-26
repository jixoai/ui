<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import skeletonSource from '$lib/ui/skeleton/skeleton.svelte?raw';

  const usage = `<!-- geometry is the consumer's; the block is bare -->
<Skeleton class="h-4 w-2/3" />

<!-- a loading card, the common shape -->
<div class="flex items-center gap-3" aria-busy="true">
  <Skeleton class="size-10" />
  <div class="flex flex-col gap-2">
    <Skeleton class="h-3 w-32" />
    <Skeleton class="h-3 w-20" />
  </div>
</div>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/skeleton.svelte', content: skeletonSource },
    { name: 'src/lib/ui/skeleton-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Skeleton · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai skeleton: a loading placeholder block with a terminal brightness pulse — aria-hidden, pure CSS, geometry from the consumer. The loading-region a11y contract belongs to the container."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="skeleton — the placeholder, nothing more"
      summary="A muted block with a terminal brightness pulse. Pure CSS, zero JS, aria-hidden by design: each placeholder is scenery. The loading contract — aria-busy on the container, or a visually-hidden live region — belongs to the region being loaded, never to each block."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">pure CSS</span>
        <span class="pill">aria-hidden scenery</span>
        <span class="pill">reduced-motion freeze</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="skeleton"
      stage="center"
      description="A loading card in the common shape — avatar block, two text lanes. The pulse is a brightness oscillation, not a shimmer sweep."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/skeleton.svelte"
      files={canvasFiles}
    >
      <div class="flex w-full max-w-sm flex-col gap-4" aria-busy="true">
        <div class="flex items-center gap-3">
          <Skeleton class="size-10" />
          <div class="flex flex-col gap-2">
            <Skeleton class="h-3 w-32" />
            <Skeleton class="h-3 w-20" />
          </div>
        </div>
        <Separator />
        <div class="flex flex-col gap-2">
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-11/12" />
          <Skeleton class="h-3 w-3/4" />
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the stage carries <code>aria-busy="true"</code> — that is the contract's home.
            prefers-reduced-motion freezes the pulse into a static block.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="skeleton-base" data-reveal="">
    <SectionCard
      family="skeleton-base"
      headerRegion="skeleton-base"
      eyebrow="NativeHTML 基座"
      title="The a11y split"
      summary="Placeholder blocks are decoration (aria-hidden); the loading STATE is semantics (aria-busy on the container, announced politely once). Mixing the two — live regions per skeleton — is how placeholder UIs end up spamming screen readers."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One bare block — every shape (avatar, lane, card) is your geometry via class or parent layout.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex min-w-52 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">avatar block</span><Skeleton class="size-10" /><span class="text-muted-foreground text-[12.5px]">class="size-10"</span></div>
      <div class="flex min-w-52 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">text lanes</span><div class="flex flex-col gap-2"><Skeleton class="h-3 w-32" /><Skeleton class="h-3 w-20" /></div><span class="text-muted-foreground text-[12.5px]">class="h-3 w-32" and friends</span></div>
      <div class="flex min-w-52 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">full-bleed card</span><div class="flex flex-col gap-2"><Skeleton class="h-3 w-full" /><Skeleton class="h-3 w-3/4" /></div><span class="text-muted-foreground text-[12.5px]">width/aspect from the parent layout</span></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Compose blocks into the loading mirror of your real layout; put aria-busy on the container."><CodeBlock code={usage} lang="svelte" meta="Skeleton usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Placeholder blocks are decoration; the loading STATE is semantics that belongs to the container."><A11yTable keys={[]} aria={[{ name: 'aria-hidden', value: 'true', description: 'Set on every block — placeholder scenery is never announced' }, { name: 'aria-busy', value: '"true"', description: 'The consumer puts it on the loading container — the contract home' }, { name: 'live region', value: 'optional', description: 'A visually-hidden "loading…" region announces politely once, if aria-busy is not enough' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Muted surface plus a 1px inset border token; the pulse is a brightness oscillation, frozen under reduced motion."><div class="flex flex-col gap-6"><DensityDemo><div class="flex items-center gap-3"><Skeleton class="size-10" /><div class="flex flex-col gap-2"><Skeleton class="h-3 w-32" /><Skeleton class="h-3 w-20" /></div></div></DensityDemo><TokenTable tokens={[{ name: 'bg-muted', default: 'muted surface', source: 'color' }, { name: '--border', default: 'inset 1px ring', source: 'color' }, { name: 'jx-skeleton-pulse', default: '1.4s ease-in-out infinite', source: 'component', description: 'Brightness pulse; prefers-reduced-motion freezes it to a static block' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The Props interface adds nothing — a bare block with class passthrough and full attribute spread."><PropsTable props={[{ name: 'class', type: 'string', default: "''", description: 'Class passthrough — width/height/aspect live here (no length API).' }, { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'data-*, id, and the rest pass through untouched; aria-hidden lands after the spread.' }]} /></SectionCard></div>
</div>

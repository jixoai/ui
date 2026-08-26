<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import BadgeIndicator from '$lib/ui/badge-indicator/badge-indicator.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import badgeindicatorSource from '$lib/ui/badge-indicator/badge-indicator.svelte?raw';

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
    <div data-reveal="">
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

    <div data-reveal="">
      <ComponentCanvas
        title="badge-indicator"
        description="Three postures: the dot (presence, no number), a capped count, and the standalone chip. The demo children are plain spans — anything with a corner carries the badge."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/badge-indicator.svelte"
        files={canvasFiles}
        stage="center"
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
          <PlayFields>
            <PlayHelp>
              the dot paints brand; counts paint destructive and cap at overflow. Standalone (no
              child) is an inline chip. count=0 renders NOTHING — zero unread is no badge.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="badge-indicator-law" data-reveal="">
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="BadgeIndicator variants" summary="Three postures — dot, count, standalone — plus the honest zero rule.">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">dot — presence, no number</p>
        <BadgeIndicator dot label="2 unread"><span class="inline-flex size-8 items-center justify-center border border-border bg-muted font-mono text-[11px]">GB</span></BadgeIndicator>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">count — capped at 99+</p>
        <BadgeIndicator count={250}><span class="inline-flex size-8 items-center justify-center border border-border bg-muted font-mono text-[11px]">AL</span></BadgeIndicator>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">standalone chip</p>
        <BadgeIndicator count={5} />
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">showZero</p>
        <BadgeIndicator count={0} showZero />
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Anything with a corner carries the badge; omit children for the standalone chip."><CodeBlock code={usage} lang="svelte" meta="BadgeIndicator usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The overlay is decoration riding the child; the meaning lives in the label/count text."><A11yTable keys={[{ key: '—', action: 'Not focusable — the wrapped child keeps its own interaction' }]} aria={[{ name: 'aria-label', value: 'label | count', description: 'The dot requires a label (its accessible name); counts announce their text.' }, { name: 'role', value: 'img', description: 'On the dot only — presence with no text content of its own.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Fixed micro geometry — the dot (10px) and count chip (18px min) do not ride the density scale."><div class="flex flex-col gap-5"><DensityDemo><div class="flex items-center gap-6"><BadgeIndicator dot label="2 unread"><span class="inline-flex size-8 items-center justify-center border border-border bg-muted font-mono text-[11px]">GB</span></BadgeIndicator><BadgeIndicator count={12}><span class="inline-flex size-8 items-center justify-center border border-border bg-muted font-mono text-[11px]">AL</span></BadgeIndicator><BadgeIndicator count={250} /></div></DensityDemo><TokenTable tokens={[{ name: '--radius', default: 'theme radius', source: 'structural', description: 'The chip corner — the jixoai radius law.' }, { name: 'dot box', default: '10px (w-2.5 h-2.5)', source: 'structural' }, { name: 'count chip', default: '18px min (min-w-[1.125rem])', source: 'structural' }, { name: 'text', default: '10px, fixed', source: 'structural' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Seven props; dot beats count, zero hides honestly."><PropsTable props={[{ name: 'dot', type: 'boolean', default: '—', description: 'The presence idiom — beats count when only presence matters.' }, { name: 'count', type: 'number', default: '—', description: 'The count idiom; hidden at 0 unless showZero.' }, { name: 'overflow', type: 'number', default: '99', description: 'Cap before "n+".' }, { name: 'showZero', type: 'boolean', default: 'false', description: 'Render count=0 instead of hiding.' }, { name: 'children', type: 'Snippet', default: '—', description: 'What the indicator rides on; omitted = standalone chip.' }, { name: 'label', type: 'string', default: "'new activity'", description: 'Accessible name for the dot (required in dot mode).' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the wrapper/standalone element.' }]} /></SectionCard></div>
</div>

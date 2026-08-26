<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { icons } from '$lib/icons';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import badgeSource from '$lib/ui/badge/badge.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Badge from '@ui/badge.svelte';
${close}

<Badge>v1.2.0</Badge>
<Badge variant="fill">new</Badge>
<Badge variant="outline">beta</Badge>
<Badge class="jx-hue-neutral">draft</Badge>
<Badge class="jx-hue-error">failed</Badge>
<Badge shape="pill" class="jx-hue-success">passing</Badge>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/badge/badge.svelte', content: badgeSource },
    { name: 'src/lib/ui/badge-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Badge · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai badge: an inline status chip in the site grammar — Share Tech Mono uppercase micro-label, 1px border, kbd-law geometry, variants inside the prominence ladder with status hues injected through the global tokens."
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
      title="badge — the eyebrow's inline cousin"
      summary="A plain <span> with the site's micro-label voice: font-nav uppercase, tracked, 1px border, kbd-law geometry. Prominence is the variant ladder — fill, tonal (the bare default, brand-tinted), outline — and every status hue injects --jx-tonal through a class utility. There is no rainbow of named tones in this language."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">plain span</span>
        <span class="pill">3 variants</span>
        <span class="pill">hue injection</span>
        <span class="pill">restProps passthrough</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="badge"
      description="The variant ladder plus the hue-injection recipes. The chip composes anywhere a span does — headings, table cells, terminal cards."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/badge/badge.svelte"
      files={canvasFiles}
      stage="center"
    >
      <div class="flex flex-col items-start gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <Badge>v1.2.0</Badge>
          <Badge variant="fill">new</Badge>
          <Badge variant="outline">beta</Badge>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Badge class="jx-hue-neutral">draft</Badge>
          <Badge class="jx-hue-error">failed</Badge>
          <Badge shape="pill" class="jx-hue-success">
            {#snippet slotStart()}{@html icons.check}{/snippet}
            passing
          </Badge>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            badges are stateless display atoms — no playground state to drive. variant, shape and the
            class injection seam are the whole API; everything else is span attributes landing verbatim.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="badge-composition" data-reveal="">
    <SectionCard
      family="badge-composition"
      headerRegion="badge-composition"
      eyebrow="demo"
      title="In composition"
      summary="The chip slots next to titles and inside table cells — the bare tonal reads as brand metadata, the outline as quiet structure, the error injection as failure."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <p class="font-nav text-[15px] tracking-tight">
            deploy pipeline <Badge class="ml-2">running</Badge>
          </p>
          <p class="font-nav text-[15px] tracking-tight">
            release 4.7.0 <Badge class="ml-2 jx-hue-neutral">stable</Badge>
          </p>
          <p class="font-nav text-[15px] tracking-tight">
            canary build <Badge class="ml-2 jx-hue-error">failed</Badge>
          </p>
        </div>
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <div id="badge-law" data-reveal="">
    <SectionCard
      family="badge-law"
      headerRegion="badge-law"
      eyebrow="law"
      title="The variant grammar law"
      summary="Prominence is the ladder: fill speaks loudest, tonal is the default voice, outline draws structure only. Hue never widens the union — statuses inject --jx-tonal (neutral, error, success) through a class utility, and the bare Badge is the brand's primary tint. Anything more is noise the eyebrow class already owns."
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <Badge variant="fill">fill · loudest</Badge>
          <Badge>tonal · the default</Badge>
          <Badge variant="outline">outline · structure</Badge>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Badge class="jx-hue-neutral">neutral · metadata</Badge>
          <Badge class="jx-hue-error">error · failure status</Badge>
          <Badge class="jx-hue-success">success · passing status</Badge>
        </div>
      </div>
    </SectionCard>
  </div>
  <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Badge variants and axes"><div class="flex flex-col items-start gap-3"><div class="flex flex-wrap items-center gap-3"><Badge>default</Badge><Badge variant="fill">fill</Badge><Badge variant="outline">outline</Badge></div><div class="flex flex-wrap items-center gap-3"><Badge class="jx-hue-neutral">neutral</Badge><Badge class="jx-hue-error">error</Badge><Badge class="jx-hue-success">success</Badge></div><div class="flex flex-wrap items-center gap-3"><Badge shape="square">square</Badge><Badge shape="pill">pill</Badge><Badge shape="pill" variant="outline">outline pill</Badge></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'span', value: 'inline status', description: 'Use visible text; do not rely on color alone. Under forced colors the chip degrades to Canvas/CanvasText with the 1px border intact.' }, { name: 'aria-label', value: 'consumer supplied', description: 'Add context when the visible label is abbreviated.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Badge>status</Badge></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-fill', default: 'var(--primary)', source: 'color', description: 'Fill ground + same-hue border.' }, { name: '--jx-fill-ink', default: 'var(--primary-foreground)', source: 'color', description: 'Ink on fill — always injected with --jx-fill.' }, { name: '--jx-tonal', default: 'var(--primary)', source: 'color', description: 'Tonal ground/border/text hue source — the status injection seam: jx-hue-* intent utilities, arbitrary form only outside the closed set.' }, { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source.' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Badge props"><PropsTable props={[{ name: 'variant', type: "'fill' | 'tonal' | 'outline'", default: "'tonal'", description: 'Prominence ladder. Hue comes from the global tokens — never a local override.' }, { name: 'shape', type: "'square' | 'pill'", default: "'square'", description: 'Corner law: --radius (square) or fully round (pill).' }, { name: 'slotStart', type: 'Snippet', description: 'Icon lane before the label; svg sized to the secondary text, inline padding adapts.' }, { name: 'slotEnd', type: 'Snippet', description: 'Icon lane after the label; same adaptive law.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }, { name: 'class', type: 'string', description: 'Consumer classes — also the hue-injection seam, e.g. jx-hue-error (arbitrary form for values outside the closed set).' }]} /></SectionCard></div>
  </div>
</div>

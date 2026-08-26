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
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import badgeSource from '$lib/ui/badge/badge.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Badge from '@ui/badge.svelte';
${close}

<Badge>v1.2.0</Badge>
<Badge tone="primary">new</Badge>
<Badge tone="outline">beta</Badge>
<Badge tone="destructive">failed</Badge>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/badge.svelte', content: badgeSource },
    { name: 'src/lib/ui/badge-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Badge · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai badge: an inline status chip in the site grammar — Share Tech Mono uppercase micro-label, 1px border, radius 0, tones inside the one-brand-hue law."
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
      summary="A plain <span> with the site's micro-label voice: font-nav uppercase, tracked, 1px border, radius 0. Tones stay inside the one-brand-hue law — there is no rainbow of statuses in this language, only muted, brand, quiet, and destructive."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">plain span</span>
        <span class="pill">4 tones</span>
        <span class="pill">restProps passthrough</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="badge"
      description="All four tones. The chip composes anywhere a span does — headings, table cells, terminal cards."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/badge.svelte"
      files={canvasFiles}
      stage="center"
    >
      <div class="flex flex-wrap items-center gap-3">
        <Badge>v1.2.0</Badge>
        <Badge tone="primary">new</Badge>
        <Badge tone="outline">beta</Badge>
        <Badge tone="destructive">failed</Badge>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            badges are stateless display atoms — no playground state to drive. The tone prop is the
            whole API; everything else is span attributes landing verbatim.
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
      summary="The chip slots next to titles and inside table cells — the muted default reads as metadata, destructive marks loss."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <p class="font-nav text-[15px] tracking-tight">
            deploy pipeline <Badge tone="primary" class="ml-2">running</Badge>
          </p>
          <p class="font-nav text-[15px] tracking-tight">
            release 4.7.0 <Badge class="ml-2">stable</Badge>
          </p>
          <p class="font-nav text-[15px] tracking-tight">
            canary build <Badge tone="destructive" class="ml-2">failed</Badge>
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
      title="The one-brand-hue tone law"
      summary="There is no rainbow of statuses in this language: muted reads as metadata, primary as the brand voice, outline as quiet structure, destructive as loss. Four tones cover every status a chip needs to say — anything more is noise the eyebrow class already owns."
    >
      <div class="flex flex-wrap items-center gap-3">
        <Badge>default · metadata</Badge>
        <Badge tone="primary">primary · brand</Badge>
        <Badge tone="outline">outline · structure</Badge>
        <Badge tone="destructive">destructive · loss</Badge>
      </div>
    </SectionCard>
  </div>
  <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Badge tones" summary="Four tones cover metadata, brand emphasis, quiet structure and destructive status."><div class="flex flex-wrap gap-3"><Badge>default</Badge><Badge tone="primary">primary</Badge><Badge tone="outline">outline</Badge><Badge tone="destructive">destructive</Badge></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'span', value: 'inline status', description: 'Use visible text; do not rely on color alone.' }, { name: 'aria-label', value: 'consumer supplied', description: 'Add context when the visible label is abbreviated.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Badge tone="primary">status</Badge></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Badge props"><PropsTable props={[{ name: 'tone', type: "'default' | 'primary' | 'outline' | 'destructive'", default: "'default'", description: 'Selects the status tone.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }, { name: 'class', type: 'string', description: 'Adds consumer classes.' }]} /></SectionCard></div>
  </div>
</div>

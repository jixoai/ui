<!--
  Docs page for pattern-cta (2026-08-30, terminal-patterns).
  Intents:
  1. Pattern summary from the registry catalog (CATALOG lookup, fail-loud).
  2. One live demo: the shell-prompt CTA band — code-card + copy CTA.
  3. Usage CodeBlock shared with the canvas drawer.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import PatternCta from '$lib/ui/pattern-cta/pattern-cta.svelte';

  import patternCtaSource from '$lib/ui/pattern-cta/pattern-cta.svelte?raw';

  const entry = CATALOG.find((candidate) => candidate.name === 'pattern-cta');
  if (!entry) {
    throw new Error('catalog miss: "pattern-cta" has no registry meta — fix registry.json');
  }

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import PatternCta from '@ui/pattern-cta.svelte';
${close}

<PatternCta
  command="npx jixoai-ui add press-button code-card"
  heading="ship it from your terminal"
  secondaryLabel="browse the atoms"
  secondaryHref="/docs/components.html"
/>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/pattern-cta/pattern-cta.svelte', content: patternCtaSource },
    { name: 'src/lib/pattern-cta-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Pattern cta · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui pattern-cta component: the shell-prompt CTA band — the install command rides a code-card, one press-button owns the copy affordance, and the press law stays the button's own."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Layout"
      title="pattern-cta — the shell-prompt band"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">code-card command</span>
        <span class="pill">press-button copy CTA</span>
        <span class="pill">ONE copy affordance</span>
      </div>
    </SectionCard>
  </div>

  <div id="demo" data-reveal="">
    <ComponentCanvas
      title="pattern-cta"
      stage="fill"
      description="The closing band: a lead block beside the command card. The code-card's own copy control is retired (copyable=false) so the band owns exactly ONE copy affordance — the press-button in the card's footer, flipping to the copied surface for 1.4s. Hover grows only the shadow; active presses the body one pixel into the page: the press law, the button's own."
      sourceUrl={registrySourceUrl('pattern-cta')}
      install="pattern-cta"
      files={canvasFiles}
    >
      <PatternCta
        command="npx jixoai-ui add pattern-cta press-button code-card"
        secondaryLabel="browse the atoms"
        secondaryHref="/docs/components.html"
      />
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            press the copy CTA — the command hits the clipboard, the check glyph takes the leading
            lane and the surface flips to <code>copied</code> (tonal + success hue). Hover the
            button: only the hard shadow grows, the body never moves — press physics are
            press-button's contract, verified by its own suite.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="One band, one payload: the command. Everything else has a quiet default."
    >
      <CodeBlock code={usage} lang="svelte" meta="pattern-cta usage" />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="PatternCta props."
    >
      <PropsTable
        props={[
          { name: 'command', type: 'string', default: "'npx jixoai-ui init'", description: 'The shell command the band sells (copy payload + card code).' },
          { name: 'heading', type: 'string', default: "'ship it from your terminal'", description: 'The band heading (an h2 stamped as component chrome).' },
          { name: 'summary', type: 'string', default: 'the install story', description: 'Max-52ch support line under the heading.' },
          { name: 'actionLabel', type: 'string', default: "'copy command'", description: "The copy control's label (aria affordance when not copied)." },
          { name: 'secondaryLabel', type: 'string', default: "''", description: 'An outline escape beside the heading block; renders when set.' },
          { name: 'secondaryHref', type: 'string', default: "'#'", description: 'The outline escape target.' },
          { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the band root.' },
        ]}
      />
    </SectionCard>
  </div>
</div>

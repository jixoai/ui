<!--
  Docs page for pattern-pricing (2026-08-30, terminal-patterns).
  Intents:
  1. Pattern summary from the registry catalog (CATALOG lookup, fail-loud).
  2. One live demo: the comparison matrix (authored thead/tbody) over
     the per-tier install cards.
  3. Composition notes: authoring rows, the recommended-column opt-in.
  4. Usage CodeBlock shared with the canvas drawer.
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
  import PatternPricing from '$lib/ui/pattern-pricing/pattern-pricing.svelte';

  import patternPricingSource from '$lib/ui/pattern-pricing/pattern-pricing.svelte?raw';

  const entry = CATALOG.find((candidate) => candidate.name === 'pattern-pricing');
  if (!entry) {
    throw new Error('catalog miss: "pattern-pricing" has no registry meta — fix registry.json');
  }

  const tiers = [
    { plan: 'solo', command: 'npx jixoai-ui add --tier solo', note: 'per seat / month' },
    { plan: 'team', command: 'npx jixoai-ui add --tier team', recommended: true, note: 'per seat / month' },
    { plan: 'self-host', command: 'npx jixoai-ui add --tier self-host', note: 'flat / year' },
  ];

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import PatternPricing from '@ui/pattern-pricing.svelte';
  import type { PricingTier } from '@ui/pattern-pricing.svelte';
${close}

<PatternPricing caption="plans — feature matrix" tiers={tiers}>
  <thead>
    <tr>
      <th>plan</th>
      <th>price</th>
      <th data-jx-recommended="">seats</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>solo</td><td>$0</td><td data-jx-recommended="">1</td>
    </tr>
  </tbody>
</PatternPricing>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/pattern-pricing/pattern-pricing.svelte', content: patternPricingSource },
    { name: 'src/lib/pattern-pricing-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Pattern pricing · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui pattern-pricing component: the $ plan --compare section — an ASCII-ruled comparison table over the table family, per-tier install-command code-cards, and the recommended tier painted through the brand hue."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Layout"
      title="pattern-pricing — $ plan --compare"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">table family matrix</span>
        <span class="pill">code-card install rows</span>
        <span class="pill">badge plan labels</span>
        <span class="pill">recommended column law</span>
      </div>
    </SectionCard>
  </div>

  <div id="demo" data-reveal="">
    <ComponentCanvas
      title="pattern-pricing"
      stage="fill"
      description="The comparison section: the matrix rides the Table family (container-query laws intact — narrow the stage and the frame folds to card rows), each tier's install command rides a code-card, and the recommended tier is one paint law: brand rules flank the opted-in column and the recommended card takes the border-primary rung."
      sourceUrl={registrySourceUrl('pattern-pricing')}
      install="pattern-pricing"
      files={canvasFiles}
    >
      <PatternPricing {tiers}>
        <thead>
          <tr>
            <th>plan</th>
            <th>price</th>
            <th data-jx-recommended="">seats</th>
            <th>support</th>
            <th>source access</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="plan">solo</td>
            <td data-label="price">$0</td>
            <td data-label="seats" data-jx-recommended="">1</td>
            <td data-label="support">community</td>
            <td data-label="source">fork freely</td>
          </tr>
          <tr>
            <td data-label="plan">team</td>
            <td data-label="price">$12</td>
            <td data-label="seats" data-jx-recommended="">unlimited</td>
            <td data-label="support">priority lane</td>
            <td data-label="source">fork freely</td>
          </tr>
          <tr>
            <td data-label="plan">self-host</td>
            <td data-label="price">$99</td>
            <td data-label="seats" data-jx-recommended="">unlimited</td>
            <td data-label="support">same-day</td>
            <td data-label="source">private registry</td>
          </tr>
        </tbody>
      </PatternPricing>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the matrix is <em>authored content</em> — thead/tbody are yours (the Table contract);
            opt the recommended column in with <code class="text-accent">data-jx-recommended</code>
            on the th AND its td's, and the pattern css paints the brand rules. Press a card's
            copy control: the tier's add command hits the clipboard. Narrow the stage past 30rem —
            the frame folds to card rows with <code>data-label</code> leaders.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="composition" data-reveal="">
    <SectionCard
      family="composition"
      headerRegion="composition"
      eyebrow="composition"
      title="Authoring the matrix"
      summary="Structure is yours, paint is the pattern's: rows stay authored content, the recommended column is a consumer opt-in, and the tier cards are payload."
    >
      <ul class="flex flex-col gap-2 text-[13px] leading-6">
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>the comparison table is the children snippet — author
            <code class="text-accent">thead/tbody/tfoot</code> exactly as the Table docs teach;
            the pattern adds no row machinery</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span><code class="text-accent">data-jx-recommended</code> on the th AND its td's opts a
            column into the brand paint (rules + tinted head); row hover keeps flowing — the
            recommended cells never paint a background over it</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span><code class="text-accent">tiers</code> is value-domain payload: plan label, install
            command, recommended flag, note — code strings, the legal prop category</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>the heading stays OUT of the pattern on purpose — your page owns its h2; the
            pattern opens at the <code>$ plan --compare</code> eyebrow</span></li>
      </ul>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="One section: authored matrix + tier payload. The recommended column is the opt-in, not a prop."
    >
      <CodeBlock code={usage} lang="svelte" meta="pattern-pricing usage" />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="PatternPricing props and the PricingTier payload type."
    >
      <PropsTable
        props={[
          { name: 'tiers', type: 'readonly PricingTier[]', default: '—', description: 'Per-tier install cards: plan, command, recommended?, note?.', required: true },
          { name: 'children', type: 'Snippet', default: '—', description: 'The comparison matrix — author thead/tbody (the Table contract).', required: true },
          { name: 'eyebrow', type: 'string', default: "'$ plan --compare'", description: "The section's mono eyebrow line." },
          { name: 'caption', type: 'string', default: "'plans — feature matrix'", description: 'The Table caption (the matrix\'s visible title).' },
          { name: 'PricingTier.plan', type: 'string', default: '—', description: 'The plan label (badge + aria name of the copy control).', required: true },
          { name: 'PricingTier.command', type: 'string', default: '—', description: 'The copyable install command (the card\'s code payload).', required: true },
          { name: 'PricingTier.recommended', type: 'boolean', default: 'false', description: 'Brand-hue paint on the tier card; pair with the table column opt-in.' },
          { name: 'PricingTier.note', type: 'string', default: '—', description: 'Muted qualifier under the plan label.' },
          { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the section root.' },
        ]}
      />
    </SectionCard>
  </div>
</div>

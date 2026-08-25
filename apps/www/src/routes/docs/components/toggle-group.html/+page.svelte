<!--
  Docs page for the toggle-group family (composition-first-apis,
  2026-08-25).
  Intents:
  1. Hero summary (the one-field press-set contract).
  2. One ComponentCanvas: single + multiple groups composed from
     ToggleGroupItem parts, bound values in the echo footer.
  3. Usage CodeBlock + the antd segmented mapping section.
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import toggleGroupSource from '$lib/ui/toggle-group/toggle-group.svelte?raw';
  import toggleGroupItemSource from '$lib/ui/toggle-group/toggle-group-item.svelte?raw';

  // ToC outline: the live demo band + usage + the antd segmented mapping.

  // Playground protocol: the page owns the snapshots + reset; the echo footer
  // replaces the hand-written "value/values" captions; usage file tracks live.
  const canvasInitial = { single: '', many: [] as string[] };
  let single = $state<string>(canvasInitial.single);
  let many = $state<string[]>(canvasInitial.many);
  function resetCanvas(): void {
    single = canvasInitial.single;
    many = canvasInitial.many;
  }
  const usageLive = $derived(
    `<ToggleGroup name="demo-align" type="single" label="alignment" bind:value={single}>
  <ToggleGroupItem value="left">left</ToggleGroupItem>
  <ToggleGroupItem value="center">center</ToggleGroupItem>
  <ToggleGroupItem value="right">right</ToggleGroupItem>
</ToggleGroup>

<ToggleGroup name="demo-style" type="multiple" label="text style" bind:value={many}>
  <ToggleGroupItem value="bold">bold</ToggleGroupItem>
  <ToggleGroupItem value="italic">italic</ToggleGroupItem>
  <ToggleGroupItem value="underline">underline</ToggleGroupItem>
</ToggleGroup>`,
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import { ToggleGroup, ToggleGroupItem } from '@ui/toggle-group/index';
${close}

<ToggleGroup name="align" type="single" label="alignment" bind:value>
  <ToggleGroupItem value="left">left</ToggleGroupItem>
  <ToggleGroupItem value="center">center</ToggleGroupItem>
  <ToggleGroupItem value="right">right</ToggleGroupItem>
</ToggleGroup>

<ToggleGroup name="style" type="multiple" label="text style" bind:value>
  <ToggleGroupItem value="bold">bold</ToggleGroupItem>
  <ToggleGroupItem value="italic">italic</ToggleGroupItem>
</ToggleGroup>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/toggle-group/toggle-group.svelte', content: toggleGroupSource },
    { name: 'registry/files/ui/toggle-group/toggle-group-item.svelte', content: toggleGroupItemSource },
    { name: 'src/lib/ui/toggle-group-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Toggle group · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toggle-group family: joined buttons submitting as one form field — single picks a value, multiple submits one FormData entry per press through the bridge's multivalue mode; buttons compose as ToggleGroupItem parts carrying their own value."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ElementInternals"
      title="toggle-group — pressed states, one field"
      summary="A row of press-state buttons that submits as ONE form field. single presses one button ('' when none); multiple presses several — the bridge's multivalue mode submits one FormData entry per active value, the checkbox-set contract, never a CSV. The family composes: ToggleGroup owns the value law (bind:value, single|multiple), ToggleGroupItem parts carry their own value — the caller's values ARE the identity, no items[] data and no per-button snippets. role=group + aria-pressed for both modes; arrow-walking is tabs' job, not a toggle set's."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">aria-pressed</span>
        <span class="pill">multivalue bridge</span>
        <span class="pill">FormData multi-entry</span>
      </div>
    </SectionCard>
  </div>

  <div id="tgroup-demo" data-region="tgroup-demo" data-family="tgroup-demo" data-reveal="">
    <ComponentCanvas
      title="toggle-group"
      description="Single swaps; multiple stacks — the bound values surface in the echo footer, one row per mode."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/toggle-group/toggle-group.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetCanvas}
      output={[
        { label: 'single', value: single || '—' },
        { label: 'multiple', value: many.length ? many.join(', ') : '—' },
      ]}
      resolveFileContent={resolveUsage}
    >
      <div class="flex flex-col items-start gap-5">
        <ToggleGroup name="demo-align" type="single" label="alignment" bind:value={single}>
          <ToggleGroupItem value="left">left</ToggleGroupItem>
          <ToggleGroupItem value="center">center</ToggleGroupItem>
          <ToggleGroupItem value="right">right</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup name="demo-style" type="multiple" label="text style" bind:value={many}>
          <ToggleGroupItem value="bold">bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">italic</ToggleGroupItem>
          <ToggleGroupItem value="underline">underline</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            buttons carry Space/Enter natively and Tab walks the row; each item's
            <code class="text-accent">value</code> is its identity (keyed reorders are inert), and
            <code class="text-accent">disabled</code> on an item dims only that button on top of
            any group-level disable.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="tgroup-base" data-reveal="">
    <SectionCard
      family="tgroup-base"
      headerRegion="tgroup-base"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="tgroup-segmented" data-reveal="">
    <SectionCard
      family="tgroup-segmented"
      headerRegion="tgroup-segmented"
      eyebrow="demo"
      title="segmented → toggle-group type=single"
      summary="antd's Segmented maps to the single mode — same one-active-submit contract. The mapping is SEMANTIC, not 1:1 paint: antd's sliding selection indicator and its exact keyboard walk are not imitated; if a future case needs the slide indicator or a strict single tab stop, that becomes a dedicated API upgrade — not a silent divergence."
    >
      <CodeBlock
        code={`<!-- antd: <Segmented options={['daily','weekly','monthly']} /> -->
<ToggleGroup name="range" type="single" label="range">
  <ToggleGroupItem value="daily">daily</ToggleGroupItem>
  <ToggleGroupItem value="weekly">weekly</ToggleGroupItem>
  <ToggleGroupItem value="monthly">monthly</ToggleGroupItem>
</ToggleGroup>`}
        lang="svelte"
        meta="mapping"
      />
    </SectionCard>
  </div>
  </div>
</div>

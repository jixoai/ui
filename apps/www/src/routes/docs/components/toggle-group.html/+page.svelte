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
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
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
    content="The jixoai toggle-group family: a joined segment row of NATIVE radios (single) or checkboxes (multiple) submitting as one form field — single picks a value under one name, multiple submits one FormData entry per press natively; segments compose as ToggleGroupItem parts carrying their own value."
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
      eyebrow="registry:ui · native radio/checkbox"
      title="toggle-group — native segments, one field"
      summary="A joined segment row of NATIVE inputs that submits as ONE form field. single rides label>input[type=radio] under one name — native arrow-walk, one tab stop, native exclusivity (re-press does NOT clear; an explicit none item is the optional-empty pattern). multiple rides checkboxes — every active value submits as its own FormData entry in DOM order (getAll on the server), never a CSV. DOM checked is the uncontrolled truth; bind:value is the projection (change → value, external writes → DOM, form.reset() re-syncs). The jx-form-field bridge is gone — name participates natively (REQUIRED for single: radio grouping is name-scoped). The paint law is the shared Part A .jx-tgroup class (jx-pure.css / @jixoai/jx-native-contract) — the component owns only the Svelte law."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">native radio/checkbox</span>
        <span class="pill">FormData multi-entry</span>
        <span class="pill">.jx-tgroup · Part A</span>
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Toggle group variants" summary="Single replaces the active value; multiple keeps an ordered set of pressed values."><div class="grid gap-4 sm:grid-cols-2"><div class="border border-border p-4"><ToggleGroup name="types-single" type="single" label="alignment"><ToggleGroupItem value="left">left</ToggleGroupItem><ToggleGroupItem value="center">center</ToggleGroupItem></ToggleGroup></div><div class="border border-border p-4"><ToggleGroup name="types-multiple" type="multiple" label="style"><ToggleGroupItem value="bold">bold</ToggleGroupItem><ToggleGroupItem value="italic">italic</ToggleGroupItem></ToggleGroup></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Compose a group from ToggleGroupItem parts; item values become the form payload identity."><CodeBlock code={usage} lang="svelte" meta="Toggle group usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The group is a labelled landmark over real native inputs — the radio semantics (arrow-walk, one tab stop, checked state) come from the platform, not ARIA re-creation."><A11yTable keys={[{ key: 'Tab', action: 'Enter the group once (single) / walk items (multiple)' }, { key: 'Arrow ← → ↑ ↓', action: 'Walk single-mode segments (native radio)' }, { key: 'Space', action: 'Toggle the focused segment' }]} aria={[{ name: 'role', value: 'radiogroup | group', description: 'Names the set as one landmark (single | multiple)' }, { name: 'aria-label', value: 'label', description: 'Provides the group accessible name' }, { name: 'input checked', value: 'native', description: 'The real radio/checkbox state IS the item state' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Group buttons use the shared hit target, inset, and typography tokens."><div class="flex flex-col gap-5"><DensityDemo><ToggleGroup name="density-group" type="single" label="density"><ToggleGroupItem value="one">one</ToggleGroupItem><ToggleGroupItem value="two">two</ToggleGroupItem></ToggleGroup></DensityDemo><TokenTable tokens={[{ name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The root owns value semantics; item parts contribute their string identities."><PropsTable props={[{ name: 'name', type: 'string', default: '—', description: 'Form field name for submitted values.' }, { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'Select one value or a set.' }, { name: 'value', type: 'string | string[]', default: '[]', description: 'Active value(s), bindable.', bindable: true }, { name: 'label', type: 'string', default: 'required', description: 'Accessible group label.', required: true }, { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the whole group.' }, { name: 'onchange', type: '(value) => void', default: '—', description: 'Called after the active value changes.' }, { name: 'children', type: 'Snippet', default: 'required', description: 'ToggleGroupItem parts.', required: true }]} /></SectionCard></div>
</div>

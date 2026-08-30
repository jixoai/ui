<!--
  Docs page for transfer (openspec 2026-08-30-table-grid-toolbar, on top
  of the 2026-08-25 composition-first base).

  docs-demo-standard skeleton: Intro → Install → live demo (the two-panel
  batch mover) → Usage (the ONE h2) → Examples (ability-named recipes:
  one-way moves, batch select-all) → Accessibility → API → Theming → See
  also.

  Composition law: the transfer component ships no oneWay prop and no
  in-panel select-all — both recipes compose the PUBLIC value/onchange
  seam (page-owned state), and both gaps are recorded in the change's
  followups.md, never silently worked around.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Transfer from '$lib/ui/transfer/transfer.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import transferSource from '$lib/ui/transfer/transfer.svelte?raw';

  const options = [
    { value: 'a', label: 'alpha' },
    { value: 'b', label: 'beta' },
    { value: 'c', label: 'gamma' },
    { value: 'keep', label: 'keeper' },
  ];

  // Playground protocol: the page owns the snapshot + reset; echo projects
  // the target list; the drawer's usage file tracks it live.
  const canvasInitial = { value: ['keep'] };
  let value = $state(canvasInitial.value);
  function resetCanvas(): void {
    value = canvasInitial.value;
  }
  const usageLive = $derived(`<Transfer {options} value={[${value.map((v) => JSON.stringify(v)).join(', ')}]} />`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Transfer from '@ui/transfer.svelte';
${close}

const options = [
  { value: 'a', label: 'alpha' },
  { value: 'b', label: 'beta' },
];

<Transfer {options} bind:value />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/transfer.svelte', content: transferSource },
    { name: 'src/lib/ui/transfer-usage.svelte', content: usage },
  ];

  // Material3 types section: plain panels vs titled panels + a disabled row.
  const typesPlain = [
    { value: 'html', label: 'html' },
    { value: 'css', label: 'css' },
    { value: 'js', label: 'js' },
  ];
  const typesTitled = [
    { value: 'draft', label: 'draft post', disabled: true },
    { value: 'review', label: 'in review' },
    { value: 'done', label: 'published' },
  ];
  let typesPlainValue = $state<string[]>([]);
  let typesTitledValue = $state<string[]>(['done']);

  // ---- recipe: one-way moves ---------------------------------------------
  // The component has no oneWay prop — the recipe composes the public
  // onchange seam into a forward-only mover: a next list SHORTER than
  // the committed list is a removal attempt and bounces.
  const oneWayOptions = [
    { value: 'rust', label: 'rust toolchain' },
    { value: 'node', label: 'node 24' },
    { value: 'bun', label: 'bun runtime' },
    { value: 'deno', label: 'deno runtime', disabled: true },
    { value: 'pnpm', label: 'pnpm workspace' },
    { value: 'vite', label: 'vite 8' },
  ];
  const oneWayInitial = { committed: ['node'], rejected: 0 };
  let committed = $state<string[]>(oneWayInitial.committed);
  let rejected = $state(oneWayInitial.rejected);
  function oneWayGuard(next: string[]): void {
    if (next.length >= committed.length) committed = next;
    else rejected += 1;
  }
  function resetOneWay(): void {
    committed = oneWayInitial.committed;
    rejected = oneWayInitial.rejected;
  }

  const oneWayUsage = `<script lang="ts">
  // oneWay, composed: additions commit, removals bounce — the
  // committed list never shrinks. (A native oneWay prop — checkbox-free
  // target panel — is the recorded followup.)
  let committed = $state(['node']);
  let rejected = $state(0);
  function oneWayGuard(next: string[]) {
    if (next.length >= committed.length) committed = next;
    else rejected += 1;
  }
${close}

<Transfer {options} value={committed} onchange={oneWayGuard}
  sourceTitle="available" targetTitle="assigned" />
<p aria-live="polite">rejected removals: {rejected}</p>`;

  // ---- recipe: batch select-all ------------------------------------------
  // No in-panel header checkbox exists — the recipe composes external
  // batch controls over the same value binding; the panel LABELS track
  // the committed state (the "select-all labels" ability).
  const batchOptions = [
    { value: 'read', label: 'read access' },
    { value: 'write', label: 'write access' },
    { value: 'admin', label: 'admin', disabled: true },
    { value: 'audit', label: 'audit log' },
    { value: 'billing', label: 'billing' },
  ];
  const batchInitial = { granted: ['read'] };
  let granted = $state<string[]>(batchInitial.granted);
  const grantLabels = $derived.by(() => {
    const map = new Map(batchOptions.map((option) => [option.value, option.label]));
    return granted.map((value) => map.get(value) ?? value);
  });
  function selectAll(): void {
    granted = batchOptions.filter((option) => !option.disabled).map((option) => option.value);
  }
  function returnAll(): void {
    granted = [];
  }
  function resetBatch(): void {
    granted = batchInitial.granted;
  }

  const batchUsage = `<script lang="ts">
  // batch select-all, composed: one press commits every ENABLED option;
  // the panel labels track the committed list. (An in-header select-all
  // checkbox + selectAllLabels prop is the recorded followup.)
  let granted = $state(['read']);
  const grantedLabels = $derived(
    granted.map((value) => options.find((option) => option.value === value)?.label ?? value));
${close}

<div class="flex flex-wrap gap-2">
  <PressButton variant="outline"
    onclick={() => (granted = options.filter((o) => !o.disabled).map((o) => o.value))}>
    select all → move
  </PressButton>
  <PressButton variant="ghost" onclick={() => (granted = [])}>return all</PressButton>
</div>

<Transfer {options} bind:value={granted}
  sourceTitle="available" targetTitle={'granted · ' + granted.length} />
<p aria-live="polite">granted: {grantedLabels.join(', ') || '—'}</p>`;
</script>

<svelte:head>
  <title>Transfer · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai transfer: the two-panel selector — real fieldsets of real checkboxes per side, middle buttons batch-move checked rows, per-panel search filters; value is the target list and selection clears after each move. Recipes: one-way moves (the committed list never shrinks) and batch select-all over the public value seam."
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
      eyebrow="registry:ui · General"
      title="transfer — two fieldsets and a batch mover"
      summary="The two-panel selector the ruled way: each side is a real fieldset of real checkbox rows — grouping, labeling and toggling all native. The middle buttons batch-move every checked row at once, then the selection clears (checked is a transient moving state, never the value). Per-panel search filters its own list; disabled rows render but never move. value is the TARGET list — what sits on the right is the answer."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">fieldset + checkbox rows</span>
        <span class="pill">batch move · selection clears</span>
        <span class="pill">per-panel search</span>
        <span class="pill">value = target list</span>
        <span class="pill">one-way · select-all recipes</span>
      </div>
    </SectionCard>
  </div>

  <!-- install -->
  <div id="install" data-reveal="">
    <SectionCard
      family="install"
      headerRegion="install"
      eyebrow="install"
      title="Install"
      summary="One zero-dependency item; the recipes below add press-button for the batch controls."
    >
      <CodeBlock code={`npx jixoai-ui add transfer`} lang="sh" meta="install" />
    </SectionCard>
  </div>

  <div id="transfer-demo" data-region="transfer-demo" data-family="transfer-demo" data-reveal="">
    <ComponentCanvas
      title="transfer"
      description="Check rows on either side, then fire the middle mover — every checked row crosses at once and the selection clears. The echo footer shows the target list."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/transfer.svelte"
      files={canvasFiles}
      stage="fill"
      onreset={resetCanvas}
      output={[{ label: 'target', value: value.length ? value.join(', ') : '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="w-full max-w-2xl">
        <Transfer {options} bind:value />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            checking rows on either side arms the middle mover; a move crosses EVERY checked row at
            once and clears the selection. Search filters per panel; disabled rows render but never
            move.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <!-- usage: the ONE h2 -->
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="value is the target list — what sits on the right is the answer; checked is a transient moving state, never the value."><CodeBlock code={usage} lang="svelte" meta="Transfer usage" /></SectionCard></div>

  <!-- examples -->
  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named recipes over the public value/onchange seam — the component ships neither oneWay nor a header select-all, so both are compositions here."
    >
      <p class="m-0 text-[13px] leading-6 text-muted-foreground">
        Both recipes page-own the state machine; the component gaps (a native oneWay with a
        checkbox-free target panel, an in-header select-all with custom labels) are recorded in
        the change's followups.md.
      </p>
    </SectionCard>
  </div>

  <!-- recipe: one-way moves -->
  <div id="transfer-one-way" data-region="transfer-one-way" data-family="transfer-one-way" data-reveal="">
    <ComponentCanvas
      title="with one-way moves"
      description="A provisioning flow that only ever grants: check a runtime on the left, fire the mover, it lands on the right — now check it on the right and fire the return mover: nothing happens, the rejection counter ticks. The committed list never shrinks."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/transfer.svelte"
      files={[
        { name: 'registry/files/ui/transfer.svelte', content: transferSource },
        { name: 'src/lib/ui/transfer-one-way-usage.svelte', content: oneWayUsage, kind: 'usage' },
      ]}
      stage="fill"
      onreset={resetOneWay}
      output={[
        { label: 'granted', value: committed.length ? committed.join(', ') : '—' },
        { label: 'rejected removals', value: rejected },
      ]}
    >
      <div class="flex w-full max-w-2xl flex-col gap-3">
        <Transfer options={oneWayOptions} value={committed} onchange={oneWayGuard} sourceTitle="available" targetTitle="assigned" />
        <p class="m-0 font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
          rejected removals: {rejected}
        </p>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The guard composes the public onchange seam: a next list SHORTER than the committed
            list is a removal attempt and bounces — the prop flows the committed value back, so
            the panels never even flicker. A native oneWay (target rows without checkboxes) is
            the recorded followup.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: batch select-all -->
  <div id="transfer-select-all" data-region="transfer-select-all" data-family="transfer-select-all" data-reveal="">
    <ComponentCanvas
      title="with batch select-all"
      description="One press grants every enabled scope at once — the external batch control writes the whole value, the panel label tracks the committed count, and the readout lists what the labels resolve to. admin is disabled and never crosses."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/transfer.svelte"
      files={[
        { name: 'registry/files/ui/transfer.svelte', content: transferSource },
        { name: 'src/lib/ui/transfer-select-all-usage.svelte', content: batchUsage, kind: 'usage' },
      ]}
      stage="fill"
      onreset={resetBatch}
      output={[
        { label: 'granted', value: granted.length ? granted.join(', ') : '—' },
        { label: 'labels', value: grantLabels.length ? grantLabels.join(' | ') : '—' },
      ]}
    >
      <div class="flex w-full max-w-2xl flex-col gap-3">
        <div class="flex flex-wrap gap-2">
          <PressButton variant="outline" onclick={selectAll}>select all → move</PressButton>
          <PressButton variant="ghost" onclick={returnAll}>return all</PressButton>
        </div>
        <Transfer options={batchOptions} bind:value={granted} sourceTitle="available" targetTitle={`granted · ${granted.length}`} />
        <p class="m-0 font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
          granted: {grantLabels.length ? grantLabels.join(', ') : '—'}
        </p>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            Batch actions collapse "select every row, then move" into one press over the SAME
            public value binding — disabled rows stay behind. The panel title is a plain string
            prop, so it can be a $derived readout. An in-header select-all checkbox (antd's
            selectAllLabels) is the recorded followup.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Transfer variants" summary="Plain source/target panels by default; titled panels rename the fieldsets, and disabled rows render but never move.">
    <div class="grid items-start gap-4 min-[900px]:grid-cols-2">
      <div class="border border-border p-4"><Transfer options={typesPlain} bind:value={typesPlainValue} /></div>
      <div class="border border-border p-4"><Transfer options={typesTitled} bind:value={typesTitledValue} sourceTitle="available" targetTitle="chosen" /></div>
    </div>
  </SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Grouping, labeling and toggling are all native — each panel is a real fieldset of real checkbox rows."><A11yTable keys={[{ key: 'Tab', action: 'Walk the fieldsets, checkbox rows, search lanes and mover buttons' }, { key: 'Space', action: 'Toggle the focused checkbox row (native input)' }]} aria={[{ name: 'fieldset / legend', value: 'native', description: 'Each panel is a real fieldset; the legend shows visible/total counts.' }, { name: 'aria-label (movers)', value: 'move selected to {side}', description: 'Names each middle mover button.' }, { name: 'aria-label (search)', value: 'filter {panel}', description: 'Names each per-panel search lane.' }, { name: 'aria-live', value: 'polite (recipe)', description: 'The one-way rejection counter and granted readout announce without stealing focus.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Rows, movers and search lanes paint through theme colors; the panels stack under a 480px container query."><div class="flex flex-col gap-5"><DensityDemo><Transfer options={typesPlain} bind:value={typesPlainValue} /></DensityDemo><TokenTable tokens={[{ name: '--jx-scrollbar-thin', default: 'stable gutter', source: 'component', description: 'List padding reserves the scrollbar lane when gutters are stable.' }, { name: 'panel surface', default: 'var(--card) + shadow-2xs', source: 'color', description: 'Each fieldset panel.' }, { name: 'hover / focus', default: '--muted / --ring / --primary', source: 'color', description: 'Row hover, search focus outline, mover hover lean.' }, { name: 'stacking law', default: 'max-width 480px', source: 'structural', description: 'Container query: panels stack, movers center between them.' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Row and mover targets inside the density scope.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The target list binds both ways; a name wires the values into FormData through the jx-form-field bridge."><div class="flex flex-col gap-8"><PropsTable props={[{ name: 'options', type: 'TransferOption[]', default: '—', description: 'The full option set; placement derives from value.', required: true }, { name: 'value', type: 'string[]', default: '[]', description: 'Values living on the TARGET side.', bindable: true }, { name: 'name', type: 'string', default: '—', description: 'Form field name — target values submit as multi-entry FormData.' }, { name: 'sourceTitle', type: 'string', default: "'source'", description: 'Source fieldset legend.' }, { name: 'targetTitle', type: 'string', default: "'target'", description: 'Target fieldset legend (the recipes derive it from committed state).' }, { name: 'searchPlaceholder', type: 'string', default: "'filter…'", description: 'Search lane placeholder.' }, { name: 'onchange', type: '(value: string[]) => void', default: '—', description: 'Fires after each batch move with the new target list — the oneWay recipe guards through it.' }, { name: 'class', type: 'string', default: "''", description: 'Extra classes on the root.' }]} /><PropsTable title="TransferOption" props={[{ name: 'value', type: 'string', default: '—', description: 'The submit value.', required: true }, { name: 'label', type: 'string', default: '—', description: 'Row label.', required: true }, { name: 'disabled', type: 'boolean', default: '—', description: 'Row renders but never moves.' }]} /></div></SectionCard></div>

  <div id="see-also" data-reveal="">
    <SectionCard
      family="see-also"
      headerRegion="see-also"
      eyebrow="see also"
      title="See also"
      summary="The families around the two-panel mover."
    >
      <div class="flex flex-wrap gap-3">
        <a class="pill" href="/docs/components/checkbox.html">checkbox — the panel rows</a>
        <a class="pill" href="/docs/components/press-button.html">press-button — the batch controls</a>
        <a class="pill" href="/docs/components/table.html">table — the selection recipe suite</a>
        <a class="pill" href="/docs/components/toggle-group.html">toggle-group — facet selection</a>
      </div>
    </SectionCard>
  </div>
</div>

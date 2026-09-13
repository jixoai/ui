<!-- item-field icon spec fixture (grindstone #17-2): the seven leaf
     adapters twice — bare (icon omitted, the byte-regression lock
     rows) and decorated with a glyph snippet — plus one raw ItemField
     carrying the icon directly. data-icon-row labels each row for the
     spec's queries -->
<script lang="ts">
  import {
    ItemField,
    ItemToggle,
    ItemCheckbox,
    ItemRadio,
    ItemSelect,
    ItemInput,
    ItemSegmented,
    ItemStepper,
  } from '../../src/lib/ui/list-item';

  let toggleOn = $state(false);
  let boxOn = $state(true);
  let pick = $state('md');
  let channel = $state('stable');
  let name = $state('');
  let seg = $state('a');
  let count = $state(4);
</script>

{#snippet glyph()}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M4 12h16" />
  </svg>
{/snippet}

<div data-plain>
  <div data-icon-row="toggle"><ItemToggle id="p-t1" label="Fast builds" bind:checked={toggleOn} /></div>
  <div data-icon-row="checkbox"><ItemCheckbox id="p-c1" label="Beta channel" bind:checked={boxOn} /></div>
  <div data-icon-row="radio"><ItemRadio id="p-r1" name="chan" value="stable" label="Stable" bind:group={channel} /></div>
  <div data-icon-row="select">
    <ItemSelect id="p-s1" label="Density" bind:value={pick}>
      <option value="sm">sm</option>
      <option value="md">md</option>
    </ItemSelect>
  </div>
  <div data-icon-row="input"><ItemInput id="p-i1" label="Project name" bind:value={name} /></div>
  <div data-icon-row="segmented">
    <ItemSegmented id="p-g1" label="Mode" options={[{ value: 'a' }, { value: 'b' }]} bind:value={seg} />
  </div>
  <div data-icon-row="stepper"><ItemStepper id="p-n1" label="Count" bind:value={count} /></div>
  <div data-icon-row="raw">
    <ItemField id="p-f1" label="Custom control" labelMode="text">
      {#snippet control(f)}
        <button type="button" aria-labelledby={f.labelId}>act</button>
      {/snippet}
    </ItemField>
  </div>
</div>

<div data-decorated>
  <div data-icon-row="toggle"><ItemToggle id="d-t1" label="Fast builds" icon={glyph} bind:checked={toggleOn} /></div>
  <div data-icon-row="checkbox"><ItemCheckbox id="d-c1" label="Beta channel" icon={glyph} bind:checked={boxOn} /></div>
  <div data-icon-row="radio"><ItemRadio id="d-r1" name="chan" value="stable" label="Stable" icon={glyph} bind:group={channel} /></div>
  <div data-icon-row="select">
    <ItemSelect id="d-s1" label="Density" icon={glyph} bind:value={pick}>
      <option value="sm">sm</option>
      <option value="md">md</option>
    </ItemSelect>
  </div>
  <div data-icon-row="input"><ItemInput id="d-i1" label="Project name" icon={glyph} bind:value={name} /></div>
  <div data-icon-row="segmented">
    <ItemSegmented id="d-g1" label="Mode" icon={glyph} options={[{ value: 'a' }, { value: 'b' }]} bind:value={seg} />
  </div>
  <div data-icon-row="stepper"><ItemStepper id="d-n1" label="Count" icon={glyph} bind:value={count} /></div>
  <div data-icon-row="raw">
    <ItemField id="d-f1" label="Custom control" labelMode="text" icon={glyph}>
      {#snippet control(f)}
        <button type="button" aria-labelledby={f.labelId}>act</button>
      {/snippet}
    </ItemField>
  </div>
</div>

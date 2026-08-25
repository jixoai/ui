<!-- item-field spec fixture: the five adapters in their common
     shapes (openspec list-item-systemization task 3 gate) — jsdom
     asserts the generated ids land on the NATIVE elements and the
     aria chains are exact -->
<script lang="ts">
  import {
    ItemGroup,
    ItemField,
    ItemToggle,
    ItemCheckbox,
    ItemRadio,
    ItemSelect,
    ItemInput,
  } from '../../src/lib/ui/list-item';

  let toggleOn = $state(false);
  let boxOn = $state(true);
  let pick = $state('md');
  let name = $state('');
</script>

<div>
  <ItemToggle id="t1" label="Fast builds" description="skip typechecking" bind:checked={toggleOn} />
  <ItemCheckbox id="c1" label="Beta channel" error="requires a flag" bind:checked={boxOn} />
  <ItemRadio id="r1" name="channel" value="stable" label="Stable" />
  <ItemRadio id="r2" name="channel" value="beta" label="Beta" />
  <ItemSelect id="s1" label="Density" bind:value={pick}>
    <option value="sm">sm</option>
    <option value="md">md</option>
  </ItemSelect>
  <ItemInput id="i1" label="Project name" description="lowercase" bind:value={name} />
  <ItemField id="f1" label="Custom control" labelMode="text">
    {#snippet control(f)}
      <button type="button" aria-labelledby={f.labelId}>act</button>
    {/snippet}
  </ItemField>
  <ItemGroup label="settings" mode="plain" dividers="auto">
    <ItemToggle id="g1" label="Grouped field" />
  </ItemGroup>
</div>

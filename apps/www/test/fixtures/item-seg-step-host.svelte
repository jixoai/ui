<!-- item-segmented + item-stepper spec fixture (grindstone #17-3):
     the two new adapters in their integrated field rows, plus the
     toggle-group chrome-axis matrix (standalone frame / self field
     frame / integrated bare / explicit override) -->
<script lang="ts">
  import ItemField from '$lib/ui/list-item/item-field.svelte';
  import ItemSegmented from '$lib/ui/list-item/item-segmented.svelte';
  import ItemStepper from '$lib/ui/list-item/item-stepper.svelte';
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';

  let seg = $state('a');
  let stepped = $state(0.1);
  let lastSeg = $state('');
</script>

<div data-testid="integrated">
  <p data-seg>{seg}</p>
  <p data-last-seg>{lastSeg}</p>
  <ItemSegmented
    id="g1"
    label="Mode"
    description="pick one"
    options={[{ value: 'a' }, { value: 'b' }, { value: 'c' }]}
    bind:value={seg}
    onValueChange={(v) => (lastSeg = v)}
  />
  <ItemSegmented
    id="g2"
    label="Hand composed"
    options={[{ value: 'x' }, { value: 'y' }]}
  >
    <ToggleGroupItem value="x">first</ToggleGroupItem>
    <ToggleGroupItem value="y">second</ToggleGroupItem>
  </ItemSegmented>
  <ItemStepper id="n1" label="Count" min={0} max={1} step={0.1} bind:value={stepped} />
  <ItemStepper id="n2" label="Broken" description="a bound" error="out of range" min={2} max={8} />
  <ItemStepper id="n3" label="Locked" disabled min={0} max={4} value={2} />
</div>

<!-- the chrome-axis matrix for the upgraded toggle-group root -->
<div data-testid="standalone">
  <ToggleGroup name="free" label="standalone">
    <ToggleGroupItem value="s1">s1</ToggleGroupItem>
    <ToggleGroupItem value="s2">s2</ToggleGroupItem>
  </ToggleGroup>
</div>

<ItemField label="self field" controlChrome="self">
  {#snippet control()}
    <ToggleGroup name="selfish" label="framed in a self field">
      <ToggleGroupItem value="f1">f1</ToggleGroupItem>
    </ToggleGroup>
  {/snippet}
</ItemField>

<ItemField label="integrated field">
  {#snippet control()}
    <ToggleGroup name="ambient" label="bare by ambient">
      <ToggleGroupItem value="b1">b1</ToggleGroupItem>
    </ToggleGroup>
  {/snippet}
</ItemField>

<ItemField label="override field">
  {#snippet control()}
    <ToggleGroup name="forced" label="explicit beats ambient" chrome="frame">
      <ToggleGroupItem value="o1">o1</ToggleGroupItem>
    </ToggleGroup>
  {/snippet}
</ItemField>

<ItemField label="labelled field" id="lf">
  {#snippet control()}
    <ToggleGroup name="labelled" label="wired to the visible label" aria-labelledby="lf-label">
      <ToggleGroupItem value="l1">l1</ToggleGroupItem>
    </ToggleGroup>
  {/snippet}
</ItemField>

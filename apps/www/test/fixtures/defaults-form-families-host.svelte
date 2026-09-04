<!--
  The form families' Defaults migration host
  (test/fixtures/defaults-form-families-host.svelte,
  context-defaults-economy task 3.1, 2026-09-03).

  One render, three regions, the REAL components (state read back
  through the valued hooks — data-density / data-variant / the
  component's structural hooks — never through internals):
    bare      — no providers: the no-opinion density slots stamp
                NOTHING (fleet law), the literal variant owns resolve
                (surface 'auto', file-input 'drop', descriptions
                borderless)
    scoped    — a density provider 'sm': every family's slot goes
                ambient and stamps sm; the explicit prop still wins
    group     — the input-group provider matrix (inherit-then-provide):
                under a parent provider the group inherits and an addon
                child (NativeSelect — a density consumer) adopts the
                tier; the group's own prop shadows the parent; a
                standalone group stamps nothing
  parentDensity is rerenderable: the spec flips it to pin the provider
  lane's re-resolution (the derived_references_self guard).
-->
<script lang="ts">
  import Input from '$lib/ui/input/input.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import Select from '$lib/ui/select/select.svelte';
  import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
  import Radio from '$lib/ui/radio/radio.svelte';
  import Range from '$lib/ui/range/range.svelte';
  import Textarea from '$lib/ui/textarea/textarea.svelte';
  import Toggle from '$lib/ui/toggle/toggle.svelte';
  import InputOtp from '$lib/ui/input-otp/input-otp.svelte';
  import NumberInput from '$lib/ui/number-input/number-input.svelte';
  import InputGroup from '$lib/ui/input-group';
  import TagsInput from '$lib/ui/tags-input/tags-input.svelte';
  import FileInput from '$lib/ui/file-input/file-input.svelte';
  import ColorPicker from '$lib/ui/color-picker/color-picker.svelte';
  import Descriptions, { DescriptionsItem } from '$lib/ui/descriptions';
  import ToggleGroup, { ToggleGroupItem } from '$lib/ui/toggle-group';
  import DensityProvider from './density-provider-host.svelte';

  const options = [{ value: 'a', label: 'A' }];

  let { parentDensity = 'lg' }: { parentDensity?: 'lg' | 'xs' } = $props();
</script>

<section data-testid="bare">
  <Input label="text" />
  <NativeSelect label="native"><option value="a">A</option></NativeSelect>
  <Select {options} label="rich" />
  <Checkbox label="check" />
  <Radio label="radio" />
  <Range label="range" />
  <Textarea label="bio" />
  <Toggle label="toggle" />
  <InputOtp label="code" />
  <NumberInput label="qty" />
  <TagsInput label="tags" />
  <FileInput label="docs" />
  <ColorPicker label="hue" />
  <Descriptions label="desc">
    <DescriptionsItem term="owner">gaubee</DescriptionsItem>
  </Descriptions>
  <ToggleGroup label="tg" name="tg-bare">
    <ToggleGroupItem value="a">A</ToggleGroupItem>
  </ToggleGroup>
</section>

<section data-testid="scoped">
  <DensityProvider density="sm">
    <Input label="text" />
    <Input label="explicit wins" density="lg" />
    <NativeSelect label="native"><option value="a">A</option></NativeSelect>
    <Select {options} label="rich" />
    <Checkbox label="check" />
    <Radio label="radio" />
    <Range label="range" />
    <Textarea label="bio" />
    <Toggle label="toggle" />
    <InputOtp label="code" />
    <NumberInput label="qty" />
    <TagsInput label="tags" />
    <FileInput label="docs" />
    <ColorPicker label="hue" />
    <Select {options} label="surface own holds" variant="solid" />
    <ToggleGroup label="tg" name="tg-scoped">
      <ToggleGroupItem value="a">A</ToggleGroupItem>
    </ToggleGroup>
  </DensityProvider>
</section>

<section data-testid="group">
  <DensityProvider density={parentDensity}>
    <InputGroup label="inherits">
      <NativeSelect label="inner"><option value="a">A</option></NativeSelect>
    </InputGroup>
    <InputGroup label="shadows" density="xs">
      <NativeSelect label="inner"><option value="a">A</option></NativeSelect>
    </InputGroup>
  </DensityProvider>
  <InputGroup label="standalone">
    <NativeSelect label="inner"><option value="a">A</option></NativeSelect>
  </InputGroup>
</section>

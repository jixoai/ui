<!-- input-group blueprint: the joined field shell — one bezel, addon
     seams, the native input member, a press-button riding the
     inline-end addon lane. -->
<script lang="ts">
  import InputGroup from '$lib/ui/input-group/input-group.svelte';
  import InputGroupAddon from '$lib/ui/input-group/input-group-addon.svelte';
  import InputGroupInput from '$lib/ui/input-group/input-group-input.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack direction="column" align="start" justify="center" gap="20" class={cx(bpA.inputGroupStage)}>
  <InputGroup label="repository url" class={cx(bpA.inputGroupField)}>
    <InputGroupAddon>https://</InputGroupAddon>
    <InputGroupInput name="bp-igroup-site" placeholder="github.com/owner/repo" />
  </InputGroup>
  <InputGroup label="deploy target" class={cx(bpA.inputGroupField)}>
    <InputGroupAddon>--host=</InputGroupAddon>
    <InputGroupInput name="bp-igroup-host" value="production" />
    <InputGroupAddon align="inline-end">
      <PressButton variant="tonal">check</PressButton>
    </InputGroupAddon>
  </InputGroup>
</Stack>

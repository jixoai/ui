<!-- native-form blueprint: the Tier-1 pure-CSS layer — bare markup, no
     component JS. The text box with placeholder, the square color
     swatch, and the native range slider, all styled by the sheet.
     (tailwindless BP-B 2026-09-16: layout utilities → surface atoms;
     the jx-* hooks stay the sheet's own semantic channel.) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
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

  // bare inputs carry no bindable value; set committed values post-mount
  // so the serializer measures the filled state
  let textEl = $state<HTMLInputElement>();
  let colorEl = $state<HTMLInputElement>();
  let rangeEl = $state<HTMLInputElement>();

  onMount(() => {
    textEl?.setAttribute('value', 'press-button');
    if (colorEl) colorEl.value = '#d61f69';
    if (rangeEl) rangeEl.value = '60';
  });
</script>

<Stack direction="column" justify="center" gap="32" class={cx(bpB.nativeFormStage)}>
  <div class="jx-field">
    <label class="jx-label" for="bp-native-form-text">Registry name</label>
    <input id="bp-native-form-text" class="jx-control" bind:this={textEl} placeholder="name" />
  </div>
  <Stack align="end" gap="24" }>
    <label class="jx-color-shell" for="bp-native-form-color">
      <input id="bp-native-form-color" class="jx-color-swatch" type="color" bind:this={colorEl} />
    </label>
    <input
      id="bp-native-form-range"
      class="jx-slider"
      type="range"
      bind:this={rangeEl}
      aria-label="coverage"
    />
  </Stack>
</Stack>

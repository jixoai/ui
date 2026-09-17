<!-- native-select blueprint: the platform picker — a committed value on
     the closed control, and the multiple listbox posture beside it.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

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

  let plan = $state('pro');
</script>

<div class={cx(bpB.nativeSelectStage)}>
  <div class={cx(bpB.nativeSelectGrid)}>
    <NativeSelect id="bp-native-select" label="plan" bind:value={plan}>
      <option value="free">free</option>
      <option value="pro">pro</option>
      <option value="team">team</option>
    </NativeSelect>
    <NativeSelect id="bp-native-multi" label="targets" multiple size={4}>
      <option>origin/main</option>
      <option selected>github/pages</option>
      <option>npm/rc</option>
      <option>jsr/latest</option>
    </NativeSelect>
  </div>
</div>

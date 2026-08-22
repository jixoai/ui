<!-- native-form blueprint: the Tier-1 pure-CSS layer — bare markup, no
     component JS. The text box with placeholder, the square color
     swatch, and the native range slider, all styled by the sheet. -->
<script lang="ts">
  import { onMount } from 'svelte';

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

<div class="flex h-full w-full flex-col justify-center gap-8 p-10">
  <div class="jx-field">
    <label class="jx-label" for="bp-native-form-text">Registry name</label>
    <input id="bp-native-form-text" class="jx-input" bind:this={textEl} placeholder="name" />
  </div>
  <div class="flex items-end gap-6">
    <label class="jx-color-field" for="bp-native-form-color">
      <input id="bp-native-form-color" class="jx-color" type="color" bind:this={colorEl} />
    </label>
    <input
      id="bp-native-form-range"
      class="jx-range"
      type="range"
      bind:this={rangeEl}
      aria-label="coverage"
    />
  </div>
</div>

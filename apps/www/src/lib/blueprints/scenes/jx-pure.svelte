<!-- jx-pure blueprint: the componentless face — ONE wrapper class, bare
     markup, zero JS. The button (press pose), the text lane (placeholder
     law), the square checkbox and the disclosure marker, all painted by
     Part B of the sheet. -->
<script lang="ts">
  import { onMount } from 'svelte';

  // bare inputs carry no bindable value; set committed values post-mount
  // so the serializer measures the filled state
  let textEl = $state<HTMLInputElement>();

  onMount(() => {
    textEl?.setAttribute('value', 'static.html');
  });
</script>

<div class="jx-pure flex h-full w-full flex-col justify-center gap-8 p-10">
  <div>
    <label for="bp-jx-pure-page">page</label><br />
    <input id="bp-jx-pure-page" bind:this={textEl} placeholder="page.html" />
  </div>
  <div class="flex items-center gap-6">
    <button type="button">mount</button>
    <label><input type="checkbox" checked /> scoped</label>
  </div>
</div>

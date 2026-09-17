<!-- jx-pure blueprint: the componentless face — ONE wrapper class, bare
     markup, zero JS. The button (press pose), the text lane (placeholder
     law), the square checkbox and the disclosure marker, all painted by
     Part B of the sheet. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  // bare inputs carry no bindable value; set committed values post-mount
  // so the serializer measures the filled state
  let textEl = $state<HTMLInputElement>();

  // the payload's own join (the separator serialize law)
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

  onMount(() => {
    textEl?.setAttribute('value', 'static.html');
  });
</script>

<div class="jx-pure {cx(bpA.jxPureStage)}">
  <div>
    <label for="bp-jx-pure-page">page</label><br />
    <input id="bp-jx-pure-page" bind:this={textEl} placeholder="page.html" />
  </div>
  <div class={cx(bpA.jxPureRow)}>
    <button type="button">mount</button>
    <label><input type="checkbox" checked /> scoped</label>
  </div>
</div>

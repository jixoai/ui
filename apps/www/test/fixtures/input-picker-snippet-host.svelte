<!--
  input-picker-snippet-host — test fixture (input-picker-bridge.spec.ts).
  Hosts the Input picker bridge in snippet mode with a real Svelte
  snippet (a plain object cannot cross the Snippet boundary).
-->
<script lang="ts">
  import Input from '$lib/ui/input/input.svelte';
  let value = $state('');
  let picked = $state('');
</script>

<Input type="week" id="pb-week-host" bind:value>
  {#snippet picker(ctx)}
    <button
      type="button"
      data-testid="week-pick"
      onclick={() => {
        ctx.commit('2026-W35');
        picked = '2026-W35';
        ctx.close();
      }}
    >
      pick week 35 ({ctx.value})
    </button>
  {/snippet}
</Input>

<p data-testid="picked">{picked}</p>

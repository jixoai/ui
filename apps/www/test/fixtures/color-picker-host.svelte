<!--
  color-picker bind host (native rebase spec, 2026-09-01): wraps the
  component with bind:value + name so the external-write path (the
  $bindable contract) and the FormData lane are exercisable the way a
  consumer drives them. A REAL <form> host (E-4, 2026-09-02) so the
  platform reset path is exercisable; the reset button stays
  type=button (a state setter, never a form reset trigger). The bad
  button drives the E-9 invalid external write (the raw-string
  preserve law) the same consumer way.
-->
<script lang="ts">
  import ColorPicker from '../../src/lib/ui/color-picker/color-picker.svelte';
  import type { Snippet } from 'svelte';

  let value = $state('#007924');
  // the Owner's lane slot (2026-09-02 rebase) — forwarded for the
  // slot-contract tests the same consumer way
  let { lane = undefined }: { lane?: Snippet<[lane: { text: string; open: boolean; disabled: boolean }]> } = $props();
</script>

<form>
  <ColorPicker bind:value name="accent" label="accent" {lane} />
</form>
<button data-testid="bad" type="button" onclick={() => (value = 'not a color')}>bad</button>
<button data-testid="reset" type="button" onclick={() => (value = '#112233')}>reset</button>
<span data-testid="out">{value}</span>

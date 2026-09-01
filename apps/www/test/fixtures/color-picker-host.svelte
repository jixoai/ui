<!--
  color-picker bind host (native rebase spec, 2026-09-01): wraps the
  component with bind:value + name so the external-write path (the
  $bindable contract) and the FormData lane are exercisable the way a
  consumer drives them.
-->
<script lang="ts">
  import ColorPicker from '../../src/lib/ui/color-picker/color-picker.svelte';

  let value = $state('#007924');
</script>

<ColorPicker bind:value name="accent" label="accent" />
<button data-testid="reset" type="button" onclick={() => (value = '#112233')}>reset</button>
<span data-testid="out">{value}</span>

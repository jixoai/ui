<!--
  PlayRange — the standard slider (wraps the registry Range). The value
  readout is the Range's own (label row off — the PlayRow owns naming);
  showValue=false hides it for noise-free rows.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import Range from '$lib/ui/range/range.svelte';

  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    showValue = true,
    onchange,
  }: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
    /** change passthrough (release-replay style consumers) */
    onchange?: (event: Event) => void;
  } = $props();

  const row = getContext<{ rowId: string; label: string }>('jx-play-row');
</script>

<Range bind:value {min} {max} {step} class="jx-play-range" showValue={showValue} label={row?.label ?? 'value'} srLabel {onchange} />

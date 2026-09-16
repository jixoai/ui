<!-- timeline-value spec fixture: a child INSIDE the timeline reading
     the value-contract context — the reui-parity channel consumers
     drive. Renders the current readout + setStep buttons so the spec
     can assert uncontrolled/controlled semantics end to end. -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { TIMELINE_KEY, type TimelineApi } from '../../src/lib/ui/timeline';

  const api = getContext<TimelineApi>(TIMELINE_KEY);
</script>

<div data-testid="tl-driver" data-current={api ? String(api.current) : 'none'}>
  {#if api}
    <button data-testid="tl-set-1" onclick={() => api.setStep(1)}>one</button>
    <button data-testid="tl-set-15" onclick={() => api.setStep(1.5)}>mid</button>
    <button data-testid="tl-set-2" onclick={() => api.setStep(2)}>two</button>
    <button data-testid="tl-set-3" onclick={() => api.setStep(3)}>three</button>
  {/if}
</div>

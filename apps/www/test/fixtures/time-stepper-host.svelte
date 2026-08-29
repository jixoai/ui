<!--
  time-stepper-host.svelte — the canonical CONTROLLED loop for the time
  stepper tests: the host holds the committed "HH:MM" in $state and
  relays oncommit upward (value + oncommit echo, exactly how the Input
  picker bridge consumes the fragment). No other wiring lives here.
-->
<script lang="ts">
  import TimeStepper from '$lib/ui/date-picker/time-stepper.svelte';

  let {
    value: initial = undefined,
    disabled = false,
    oncommit,
  }: {
    value?: string;
    disabled?: boolean;
    oncommit?: (v: string) => void;
  } = $props();

  // initial-only BY INTENT: the host seeds the controlled loop once;
  // afterwards every commit flows through relay (calendar.svelte law)
  // svelte-ignore state_referenced_locally
  let value = $state<string | undefined>(initial);

  function relay(v: string): void {
    value = v; // the echo that makes the component's controlled loop real
    oncommit?.(v);
  }
</script>

<TimeStepper value={value} {disabled} oncommit={relay} idPrefix="tsh" />

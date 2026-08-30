<!--
  date-picker-feedback-host.svelte — the canonical CONTROLLED loop for the
  enhance-picker-feedback date-picker tests (2026-08-30): the host holds
  value / range in $state, relays the bindable commits upward into
  <output> data attributes, and forwards every new prop. Exactly how a
  consumer binds the field.
-->
<script lang="ts">
  import DatePicker, {
    type DatePickerPreset,
    type DatePickerRange,
  } from '$lib/ui/date-picker/date-picker.svelte';

  let {
    value: initialValue,
    range: initialRange,
    mode,
    showTime,
    presets,
    min,
    max,
    isDisabled,
    format,
    label,
    rich = false,
  }: {
    value?: string;
    range?: DatePickerRange;
    mode?: 'single' | 'range';
    showTime?: boolean;
    presets?: DatePickerPreset[];
    min?: string;
    max?: string;
    isDisabled?: (iso: string) => boolean;
    format?: 'iso' | 'locale';
    label?: string;
    /** render the consumer-authored `preset` snippet escape instead of the
        default {label} text — the rich-content path of the lane */
    rich?: boolean;
  } = $props();

  // initial-only BY INTENT: the host seeds the controlled loop once;
  // afterwards every commit flows through the bindable echo
  // svelte-ignore state_referenced_locally
  let value = $state<string | undefined>(initialValue);
  // svelte-ignore state_referenced_locally
  let range = $state<DatePickerRange | undefined>(initialRange);
</script>

<DatePicker
  id="dp"
  bind:value
  bind:range
  {mode}
  {showTime}
  {presets}
  {min}
  {max}
  {isDisabled}
  {format}
  {label}
>
  {#snippet preset(entry)}
    {#if rich}<strong data-rich-label>{entry.label}</strong>{:else}{entry.label}{/if}
  {/snippet}
</DatePicker>

<output data-value={value ?? ''}>{value ?? ''}</output>
<output data-start={range?.start ?? ''}>{range?.start ?? ''}</output>
<output data-end={range?.end ?? ''}>{range?.end ?? ''}</output>

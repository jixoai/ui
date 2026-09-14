<script lang="ts">
  // range.svelte — the native-rebase family, StyleX re-authoring of
  // the SLOT + semantic layer. The native input[type=range] stays the
  // base (platform owns pointer/keyboard/RTL/forms); the law mount
  // rides the carried css file ([data-jx-range] hook, unchanged).
  //
  // OUT OF CORPUS SCOPE (behavior, not styling — recorded): the wheel
  // fine-tune engine, the ruler pointerdown snap, the form-reset sync,
  // the RangeTick multi-scale composition context. The DEFAULT single
  // scale + end tick render (the visual ruler) is kept.
  import * as stylex from '@stylexjs/stylex';

  // class-string composition: 0.19.0 exposes no callable type on the
  // namespace (runtime-only call signature); attrs().class is the typed form
  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;
  import { rangeStyles as s } from './range.stylex';
  import './range.css';

  interface Props {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    error?: string;
    showValue?: boolean;
    ticks?: boolean;
    orientation?: 'horizontal' | 'vertical';
    disabled?: boolean;
    id?: string;
  }

  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    label,
    error,
    showValue = true,
    ticks = false,
    orientation = 'horizontal',
    disabled = false,
    id,
  }: Props = $props();

  const autoId = $props.id();
  const resolvedId = $derived(id ?? autoId);
  const errorId = $derived(`${resolvedId}-error`);
  const invalid = $derived(error != null && error !== '');
  const vertical = $derived(orientation === 'vertical');

  const span = $derived(max - min);
  const tickCount = $derived(span > 0 ? Math.round(span / step) : 0);
  const tickStepPct = $derived(
    tickCount > 0 ? Math.round(((step / span) * 100) * 1e6) / 1e6 : 100,
  );
  const decimals = $derived.by(() => {
    const dec = (n: number): number => {
      const str = String(n);
      const dot = str.indexOf('.');
      return dot === -1 ? 0 : str.length - dot - 1;
    };
    return Math.max(dec(step), dec(min), dec(max));
  });
  const display = $derived(value.toFixed(decimals));
</script>

<div
  class={sx(s.field, vertical && s.fieldVertical)}
  data-density-test="range"
  data-orient={vertical ? 'vertical' : undefined}
>
  {#if label || showValue}
    <div class={sx(s.head)}>
      {#if label}
        <label class={sx(s.label)} for={resolvedId}>{label}</label>
      {/if}
      {#if showValue}
        <span
          class={sx(s.readout, invalid && s.readoutInvalid)}
          data-jx-slider-value
          data-jx-range-value={display}
          >{display}</span
        >
      {/if}
    </div>
  {/if}

  <div class={sx(vertical ? s.bodyVertical : s.bodyHorizontal)} data-jx-range-body>
    <input
      id={resolvedId}
      type="range"
      data-jx-range=""
      {...(vertical ? { orient: 'vertical' } : {})}
      bind:value
      {min}
      {max}
      {step}
      {disabled}
      aria-valuetext={display}
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={invalid ? errorId : undefined}
      class:jx-invalid={invalid}
    />

    {#if ticks && tickCount > 0}
      <div
        class={sx(
          vertical ? s.rulerVertical : s.rulerHorizontal,
          vertical ? s.endTickV : s.endTickH,
        )}
        aria-hidden="true"
        data-jx-slider-ticks=""
        style={`--jx-tick-step: ${tickStepPct}%;`}
      >
        <div class={sx(vertical ? s.tickV : s.tickH)}></div>
      </div>
    {/if}
  </div>

  {#if invalid}
    <p id={errorId} class={sx(s.error)}>
      <span class={sx(s.errorMark)} aria-hidden="true">!</span>{error}
    </p>
  {/if}
</div>

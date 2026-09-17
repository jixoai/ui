<!--
  jixoai progress (registry/files/ui/progress/progress.svelte).
  W3C-first: progress IS the native <progress> element — role, value
  semantics, min/max mapping and the indeterminate state are the
  browser's. Passing no value renders the indeterminate bar natively
  (aria-valuenow omitted by the platform); max defaults to 1 so a 0..1
  fraction works without ceremony, matching how the element itself is
  specified.

  The component adds only the jixoai paint (appearance:none, 1px frame,
  brand fill, terminal stripe for the indeterminate run) and an optional
  label + live value readout — announced politely (role=status) because
  progress changes are exactly the "polite update" case; the bar itself
  stays aria-hidden-free (the native element already exposes values).

  tw4 (2026-08-24): utility-authored — the bar frame, the label/value
  readout, and the indeterminate stripe (arbitrary-value background +
  animate utility, gated on the jx-indeterminate hook) live in the
  markup; ONLY the native ::-webkit/::-moz progress pseudo resets, the
  stripe keyframes, and the reduced-motion kills stay in progress.css
  (D1-exempt residue; the kills override markup utilities, so they
  ride the unlayered :where carve-out).
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (progress.stylex.ts) joined through cx()
  below; the pseudo resets, keyframes, and the UNLAYERED reduced-motion
  kills stay lane-2 in progress.css (unlayered beats the atoms);
  jx-progress-bar / jx-indeterminate stay the css law's hooks.
-->
<script lang="ts">
  import { progressStyles } from './progress.stylex';
  import './progress.css';

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined).
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

  interface Props {
    /** 0..max; omitted ⇒ indeterminate ("activity", not "progress") */
    value?: number;
    /** default 1 (the element's own spec default) */
    max?: number;
    /** visible label above the bar */
    label?: string;
    class?: string;
  }

  let { value, max = 1, label, class: className = '' }: Props = $props();

  const pct = $derived(
    value === undefined || max <= 0 ? null : Math.min(100, Math.max(0, (value / max) * 100)),
  );
</script>

<div data-jx-progress="" class={cx(progressStyles.root, className)}>
  {#if label || pct !== null}
    <div data-jx-progress-head="" class={cx(progressStyles.head)}>
      {#if label}<span data-jx-progress-label="" class={cx(progressStyles.label)}>{label}</span>{/if}
      {#if pct !== null}
        <span data-jx-progress-value="" class={cx(progressStyles.value)} role="status">{Math.round(pct)}%</span>
      {/if}
    </div>
  {/if}
  <progress
    class={cx(
      'jx-progress-bar',
      progressStyles.bar,
      value === undefined && cx('jx-indeterminate', progressStyles.indeterminate),
    )}
    aria-label={label ?? 'progress'}
    {value}
    {max}
  >
    {#if pct !== null}{Math.round(pct)}%{/if}
  </progress>
</div>

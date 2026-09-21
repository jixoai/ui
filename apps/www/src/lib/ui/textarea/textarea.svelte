<!--
  jixoai textarea (registry/files/ui/textarea/textarea.svelte).
  NativeHTML base textarea: the same text-shell law as input.svelte —
  1px var(--border), var(--background) fill, radius 0, hover lifts one
  pixel (shadow-2xs), focus-visible takes the site's inset 1px outline
  law (outline-offset: -1px on the ring token). resize: vertical is the
  ONLY allowed axis (never horizontal — it would break column rhythm).

  Same semantics law: label[for] block (auto id via $props.id()), error
  string → aria-invalid + aria-describedby + "! message" line + dashed
  border. rows defaults to 4; everything else (placeholder, maxlength,
  disabled, name, required…) flows through restProps.

  2026-08-20 · InputGroup slot system (original request: "实现 InputGroup
  槽位体系，升级 Input 和 TextArea 组件"). Six snippet slots — the block
  axis runs INSIDE the shell, the outer pair wraps it:

    outerBlockStart  outside, above — replaces the label row when given
    innerBlockStart  inside the shell, above the textarea (toolbar row,
                     behind a 1px var(--border) hairline)
    innerBlockEnd    inside the shell, below the textarea (status row /
                     count readout, behind its own hairline)
    outerBlockEnd    outside, below — the error line still renders above

  The shell — not the <textarea> — owns border/fill/hover/focus, so slot
  rows never repaint the box law; without inner slots the pixels are
  identical to the old single-<textarea> shell. Inner rows land muted at
  0.75rem; the wrapper is utility-authored now, so override it with a
  plain utility (text-foreground) or an inline style. `count` appends a
  "N / maxLength" readout to inner-block-end (plain N without maxlength).
  `value` is $bindable: bound ⇒ controlled; absent ⇒ the field stays
  purely uncontrolled (Svelte skips undefined writes, so FormData and
  form.reset() keep native behavior); the count mirrors the DOM either
  way.

  tw4 (2026-08-24; mirror law 2026-08-27): the shell/lane laws
  (.jx-control-shell row+hover+focus+disabled+invalid+slotted,
  .jx-field/.jx-label/.jx-error) are CONSUMED from the jx-pure sheet's
  Part A (consume-only law; the shell only adds the column direction as
  an inline utility). The chromeless lane rides the jx-pure sheet's
  element law (:where(.jx-pure) textarea — the placeholder rides
  Part A's --jx-placeholder mix; the class twin retired with
  textarea.css); the hairline rows, count readout and
  outer slots stay inline (one-off wrappers).
  tailwindless one-shot Wave 1b batch A (2026-09-17): the one-off
  wrappers ride the family's stylex ATOMS (textarea.stylex.ts) joined
  through cx() below; the shell adds its column direction as an atom.
-->
<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { CONTROL_CHROME_KEY, type ControlChrome } from '$lib/control-chrome.svelte';
  import type { Snippet } from 'svelte';
  import {
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { TextareaDefaults } from './textarea-defaults.svelte';
  import { textareaStyles } from './textarea.stylex';

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

  interface Props extends Omit<HTMLTextareaAttributes, 'color'> {
    /** field label; renders label[for] above the control.
        skipped when outerBlockStart takes the slot over */
    label?: string;
    /** density policy: explicit, inherited, then default */
    /** density policy: explicit, inherited, then default — the
     *  universal §4 lane (named rungs + the documented small/medium/
     *  large aliases · auto · a coefficient number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query(). CONSUMED by the family (the
     *  native element NEVER receives a size attribute from it — the §1
     *  native collision rule; everything the family does not own still
     *  rides {...rest}) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system —
     *  semantic names · hue degrees · raw values · query(). CONSUMED by
     *  the family (the native attribute never receives it, §1) */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** inner-block-end right side: "N / maxLength" readout */
    count?: boolean;
    /** inside the shell, above the textarea (toolbar row) */
    innerBlockStart?: Snippet;
    /** inside the shell, below the textarea (status row) */
    innerBlockEnd?: Snippet;
    /** outside the shell, above — replaces the label prop when given */
    outerBlockStart?: Snippet;
    /** outside the shell, below — renders below the error line */
    outerBlockEnd?: Snippet;
    /** $bindable; bound ⇒ controlled, absent ⇒ purely uncontrolled */
    value?: string | number;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    'data-density': _callerDensity,
    id = autoId,
    error,
    count = false,
    innerBlockStart,
    innerBlockEnd,
    outerBlockStart,
    outerBlockEnd,
    value = $bindable(),
    rows = 4,
    class: className = '',
    chrome: chromeProp = undefined,
    ...rest
  }: Props = $props();

  // the chrome axis ambient (inline read — see lib/control-chrome.svelte.ts)
  const ambientChrome = getContext<{ chrome?: ControlChrome }>(CONTROL_CHROME_KEY)?.chrome;

  const errorId = $derived(`${id}-error`);
  // the family Defaults is the single read point (context-defaults-
  // economy 3.1): explicit ?? ambient scope per slot, one line, no
  // legacy helper channels
  const d = $derived(
    TextareaDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // ---- controlled / count plumbing --------------------------------------
  // liveValue mirrors the DOM only after real user input — the one piece
  // of state an uncontrolled field ever touches, never written back out.
  const controlled = $derived(value != null);
  let liveValue = $state<string | null>(null);

  const shownValue = $derived(liveValue ?? (controlled ? String(value) : ''));
  const slotted = $derived(Boolean(innerBlockStart || innerBlockEnd || count));
  const maxLen = $derived(typeof rest.maxlength === 'number' && rest.maxlength > 0 ? rest.maxlength : null);
  // code-point counting (expand-form-family passthrough, 2026-08-30):
  // the same law input's count readout uses — surrogate pairs (emoji,
  // ext-B CJK) count as ONE character, never two UTF-16 units. Near the
  // limit (from 90% of the cap) the readout's aria-live flips from off
  // to polite; elsewhere it never chatters per keystroke.
  const shownCount = $derived([...shownValue].length);
  const countNear = $derived(maxLen != null && shownCount >= Math.ceil(maxLen * 0.9));
  const countLabel = $derived(maxLen != null ? `${shownCount} / ${maxLen}` : `${shownCount}`);

  function syncValue(event: Event) {
    const el = event.currentTarget as HTMLTextAreaElement;
    liveValue = el.value;
    if (controlled) value = el.value;
    // forward a caller-supplied input handler from the rest props
    (rest as { oninput?: (event: Event) => void }).oninput?.(event);
  }
</script>

<div
  bind:this={uniRoot}
  class="jx-field"
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={carriers || undefined}>
  {#if outerBlockStart}
    <div data-jx-outer data-jx-outer-start class={cx(textareaStyles.outerStart)}>{@render outerBlockStart()}</div>
  {:else if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <!-- the shell owns the box law; the textarea inside is chromeless.
       Part A's shell law carries the box/hover/focus/disabled/invalid
       paint — the only component-owned geometry is the column direction -->
  <div
    class={cx('jx-html-control-shell', textareaStyles.shellColumn, className)}
    class:jx-slotted={slotted}
    class:jx-invalid={invalid}
    data-chrome={chromeProp ?? ambientChrome ?? 'frame'}
  >
    {#if innerBlockStart}
      <div data-jx-inner data-jx-inner-start class={cx(textareaStyles.inner, textareaStyles.innerStart)}>{@render innerBlockStart()}</div>
    {/if}
    <textarea
      {id}
      {rows}
      {...rest}
      value={controlled ? value : undefined}
      oninput={syncValue}
      data-jx-textarea
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
    ></textarea>
    {#if innerBlockEnd || count}
      <div data-jx-inner data-jx-inner-end class={cx(textareaStyles.inner, textareaStyles.innerEnd)}>
        {#if innerBlockEnd}{@render innerBlockEnd()}{/if}
        {#if count}<span
          data-jx-count
          class={cx(textareaStyles.count)}
          aria-live={countNear ? 'polite' : 'off'}
          aria-atomic="true">{countLabel}</span>{/if}
      </div>
    {/if}
  </div>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
    {#if outerBlockEnd}<div data-jx-outer data-jx-outer-end class={cx(textareaStyles.outerEnd)}>{@render outerBlockEnd()}</div>{/if}
</div>

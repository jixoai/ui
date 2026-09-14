<script lang="ts">
  // press-button.svelte — StyleX re-authoring of the frozen family's
  // core surface: the variant ladder × density × press physics × the
  // loading/flash state machine × square × raised/flat texture axis.
  //
  // OUT OF CORPUS SCOPE (recorded in the ledger): the four opt-in
  // effect loops (shimmer/pulse/rainbow/ripple + press-effect-runtime
  // 557 LOC + the effect keyframes/@property in press-button.css) —
  // attachment-channel runtime, not the styling surface; the design
  // froze this family's corpus carrier as "variant table + density +
  // press-physics".
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import * as stylex from '@stylexjs/stylex';

  // class-string composition: 0.19.0 exposes no callable type on the
  // namespace (runtime-only call signature); attrs().class is the typed form
  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;
  import {
    pressButtonStyles as s,
    pressPoseVars,
    flatPose,
    ghostPose,
    hueVars,
    destructivePair,
    successHue,
  } from './press-button.stylex';
  import Icon from '../icon/icon.svelte';

  export type PressButtonVariant = 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';

  interface Props {
    variant?: PressButtonVariant;
    href?: string;
    loading?: boolean;
    square?: boolean;
    raised?: boolean;
    /** semantic hue pair class (the grammar's one-class injection) */
    hue?: 'destructive' | 'success';
    onclick?: () => void;
    children: Snippet;
    /** the rest lane: arbitrary attributes land on the root verbatim */
    [key: string]: unknown;
  }

  let {
    variant = 'outline',
    href,
    loading = false,
    square = false,
    raised = undefined,
    hue = undefined,
    onclick,
    children,
    ...rest
  }: Props = $props();

  const resolvedRaised = $derived(raised ?? true);
  const flat = $derived(!resolvedRaised && variant !== 'link');

  // ---- the one-shot success flash (the async idiom's second step) ----
  let flashState = $state<'idle' | 'success'>('idle');
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  export function flash(ms = 1200): void {
    if (flashTimer !== undefined) clearTimeout(flashTimer);
    flashState = 'success';
    flashTimer = setTimeout(() => {
      flashState = 'idle';
      flashTimer = undefined;
    }, ms);
  }
  onDestroy(() => {
    if (flashTimer !== undefined) clearTimeout(flashTimer);
  });

  // the loading lock's enforcement seam (click funnel)
  function onButtonClick(): void {
    if (loading) return;
    onclick?.();
  }
  function onAnchorClick(event: MouseEvent): void {
    if (loading) event.preventDefault();
  }

  // ---- the composition: pose classes are createTheme classes riding
  // the SAME element (the [--jx-press-*] setter carriers' idiomatic
  // replacement); ghost's none-trio must NOT meet flat's overrides —
  // exclusive by construction (flat strips the variant pose first) ──
  const variantClass = $derived.by(() => {
    const v: Record<PressButtonVariant, string> = {
      fill: sx(s.frame, s.fill),
      tonal: sx(s.frame, s.tonal),
      outline: sx(s.frame, s.outline),
      ghost: sx(s.frame, s.ghost, ghostPose),
      link: sx(s.link),
    };
    return v[variant];
  });

  const flatPoseClass = $derived(flat ? sx(flatPose) : null);
  const hueClass = $derived(
    hue === 'destructive' ? sx(destructivePair) : hue === 'success' ? sx(successHue) : null,
  );

  // pose var classes must ride the element for the law's var() reads;
  // base vars exist at :root via defineVars defaults
  const poseRoot = $derived(sx(pressPoseVars, hueVars));

  const hostClass = $derived.by(() => {
    const parts = [
      sx(s.base, square ? s.squareBody : s.textBody),
      variantClass,
      poseRoot,
    ];
    if (hueClass) parts.push(hueClass);
    if (flat) parts.push(sx(s.flatHost, s.flatActiveTint));
    if (flatPoseClass) parts.push(flatPoseClass);
    return parts.join(' ');
  });

  const leadingGlyph = $derived(loading ? 'spin' : flashState === 'success' ? 'check' : 'none');
</script>

{#snippet leadingLane()}
  {#if leadingGlyph === 'spin'}
    <span {...stylex.attrs(s.spinnerWrap)} aria-hidden="true" data-jx-press-spin=""
      >[&nbsp;<span {...stylex.attrs(s.spinnerFrames)}>
        <i class={sx(s.spinnerFrame, s.frameVisible)}>/</i>
        <i class={sx(s.spinnerFrame, s.frameHidden, s.delay200)}>—</i>
        <i class={sx(s.spinnerFrame, s.frameHidden, s.delay400)}>\\</i>
        <i class={sx(s.spinnerFrame, s.frameHidden, s.delay600)}>|</i>
      </span>&nbsp;]</span
    >
  {:else if leadingGlyph === 'check'}
    <span {...stylex.attrs(s.checkGlyph)} aria-hidden="true" data-jx-press-check="">
      <Icon name="check" size={14} />
    </span>
  {/if}
{/snippet}

{#if href}
  <a
    {...rest}
    href={href}
    class={hostClass}
    aria-disabled={loading ? 'true' : undefined}
    data-jx-press-state={flashState === 'success' ? 'success' : undefined}
    data-jx-press-button={variant}
    data-jx-press-flat={flat ? '' : undefined}
    data-jx-press-test=""
    onclick={onAnchorClick}
  >
    {@render leadingLane()}
    {@render children()}
  </a>
{:else}
  <button
    {...rest}
    type="button"
    class={hostClass}
    onclick={onButtonClick}
    aria-disabled={loading ? 'true' : undefined}
    data-jx-press-state={flashState === 'success' ? 'success' : undefined}
    data-jx-press-button={variant}
    data-jx-press-flat={flat ? '' : undefined}
    data-jx-press-test=""
  >
    {@render leadingLane()}
    {@render children()}
  </button>
{/if}

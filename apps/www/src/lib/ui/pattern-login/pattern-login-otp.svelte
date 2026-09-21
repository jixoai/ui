<!--
  jixoai pattern-login-otp (registry/files/ui/pattern-login/
  pattern-login-otp.svelte, 2026-08-30, terminal-patterns).
  The second-factor screen of the ssh login story: the joined code
  rides Input-otp (auto-advance, paste distribution, the form-field
  bridge — all the atom's; nothing re-implemented here), the verify
  step is a PressButton, and the card keeps the same frame law as
  pattern-login.svelte (echo header, ascii corners, hairline footer).
  Pair them as two screens: onsignin on the login card swaps to this.

  tailwindless Wave 1 batch 3 (2026-09-17): the paint rides the
  family's shared stylex ATOMS (pattern-login.stylex.ts) joined
  through cx() — the frame law is the same table the login card walks.
-->
<script lang="ts">
  import InputOtp from '$lib/ui/input-otp/input-otp.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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
  import { PatternLoginDefaults } from './pattern-login-defaults.svelte';
  import { loginStyles } from './pattern-login.stylex';
  import './pattern-login.css';

  interface Props {
    /** the host being verified (the hint line echoes it) */
    host?: string;
    /** slot count of the one-time code (default 6) */
    length?: number;
    /** the joined code; bindable (bind:value for controlled flows) */
    value?: string;
    /** one-line context under the slots (where the code was sent) */
    hint?: string;
    /** fires with the joined code on submit */
    onverify?: (code: string) => void;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the composed InputOtp rides
     *  the ambient chain — the composition law) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
  }

  let {
    host = 'jixoai.dev',
    length = 6,
    value = $bindable(''),
    hint = '',
    onverify,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

  // ── the eight-axis surface (W3-D2 — the login family's shared
  // contract; the next screen stamps the same lanes as the card)
  const d = $derived(
    PatternLoginDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    onverify?.(value);
  }

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner, never a
  // raw class={styles.x} interpolation
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
</script>

<section
  data-jx-pattern-login-otp=""
  bind:this={uniRoot}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={`jx-pattern-login ${cx(loginStyles.card)} ${className}`}
  aria-label="terminal two-factor verification"
>
  <header data-jx-pattern-login-echo="" class={cx(loginStyles.band)} aria-hidden="true">
    <p class={cx(loginStyles.echo)}>
      <span class={cx(loginStyles.prompt)}>$</span>
      otp --verify --host {host}
    </p>
  </header>

  <form class={cx(loginStyles.form)} novalidate onsubmit={submit}>
    <InputOtp name="otp" label="one-time code" {length} bind:value={value} />
    {#if hint}
      <p class={cx(loginStyles.hint)}>
        <span class={cx(loginStyles.promptMark)} aria-hidden="true">#</span>
        {hint}
      </p>
    {/if}
    <PressButton type="submit" variant="fill" class={cx(loginStyles.submitOffset)}>verify</PressButton>
  </form>

  <footer data-jx-pattern-login-boot="" class={cx(loginStyles.bandEnd)} aria-hidden="true">
    <p class={cx(loginStyles.bootEcho)}>
      <span class={cx(loginStyles.prompt)}>#</span>
      incomplete codes submit empty — never a partial lie
    </p>
  </footer>
</section>

<!--
  jixoai pattern-login (registry/files/ui/pattern-login/pattern-login.svelte,
  2026-08-30, openspec 2026-08-30-terminal-patterns).
  The `ssh user@host` login card — a composition product, not a new
  primitive: user/host lanes are plain Input (the innerInlineStart slot
  carries the `user@` / `--host=` ssh glyphs), the passphrase rides the
  Input password reveal BY DEFAULT (F1's hard prerequisite — this file
  ships NO pattern-local show/hide fallback; the eye belongs to the
  input shell, outermost end child), and the submit is a PressButton.
  The card header echoes the composed `ssh {user}@{host}` line live
  (decorative — aria-hidden, the labeled fields are the truth), and the
  footer is the bootstrap command: the copyable `npx jixoai-ui init`
  line, the terminal idiom's "magic link" analog.

  Composition-only laws (terminal-patterns delta): no atom prop is
  patched, no atom paint re-implemented here; every behavior lives in
  the atoms this item declares as registryDependencies.

  tw4 → tailwindless Wave 1 batch 3 (2026-09-17): the paint rides the
  family's stylex ATOMS (pattern-login.stylex.ts, shared with the OTP
  screen) joined through cx(); pattern-login.css keeps only the
  D1-exempt residue — the ascii `+` corner brackets no utility can
  generate (pseudo-element content).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '$lib/ui/icon';
  import Input from '$lib/ui/input/input.svelte';
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
    /** the host the card addresses (echo line + host lane placeholder) */
    host?: string;
    /** the user lane; bindable — the echo line mirrors it live */
    user?: string;
    /** the passphrase lane; bindable (the reveal is the input's own) */
    password?: string;
    /** the bootstrap footer command (copy payload, the magic-link analog) */
    command?: string;
    /** fires on submit — the card never navigates on its own */
    onsignin?: () => void;
    /** extra lanes between the passphrase and the submit (the 2FA step
     *  composes here, or ship pattern-login-otp as the next screen) */
    children?: Snippet;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the composed Input lanes
     *  ride the ambient chain — the composition law) */
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
    host = $bindable('jixoai.dev'),
    user = $bindable(''),
    password = $bindable(''),
    command = 'npx jixoai-ui init',
    onsignin,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    children,
    class: className = '',
  }: Props = $props();

  // ── the eight-axis surface (W3-D2 — FIRST-TIME contract, all
  // no-own: a composition product; the size axis scales the card
  // root, the Input/PressButton axis surfaces ride the ambient chain
  // — the whole point of 吃也供)
  const d = $derived(
    PatternLoginDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  let bootCopied = $state(false);
  let bootTimer: ReturnType<typeof setTimeout> | undefined;

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    onsignin?.();
  }

  async function copyBootCommand(): Promise<void> {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // preview servers / embedded contexts without a clipboard grant
      const area = document.createElement('textarea');
      area.value = command;
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    bootCopied = true;
    clearTimeout(bootTimer);
    bootTimer = setTimeout(() => (bootCopied = false), 1400);
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
  data-jx-pattern-login=""
  bind:this={uniRoot}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={`jx-pattern-login ${cx(loginStyles.card)} ${className}`}
  aria-label="terminal login"
>
  <header data-jx-pattern-login-echo="" class={cx(loginStyles.band)} aria-hidden="true">
    <p class={cx(loginStyles.echo)}>
      <span class={cx(loginStyles.prompt)}>$</span>
      ssh {user || 'user'}@{host}
    </p>
  </header>

  <form class={cx(loginStyles.form)} novalidate onsubmit={submit}>
    <Input label="user" name="user" placeholder="operator" autocomplete="username" bind:value={user}>
      {#snippet innerInlineStart()}
        <span class={cx(loginStyles.glyph)} aria-hidden="true">user@</span>
      {/snippet}
    </Input>
    <Input label="host" name="host" placeholder="server.example" autocomplete="url" bind:value={host}>
      {#snippet innerInlineStart()}
        <span class={cx(loginStyles.glyph)} aria-hidden="true">--host=</span>
      {/snippet}
    </Input>
    <!-- the passphrase reveal is the INPUT's contract (default ON, the
         eye is the shell's outermost end child) — this pattern ships no
         local show/hide fallback by law -->
    <Input
      label="passphrase"
      name="password"
      type="password"
      placeholder="••••••••"
      autocomplete="current-password"
      bind:value={password}
    />
    {#if children}
      {@render children()}
    {/if}
    <PressButton type="submit" variant="fill" class={cx(loginStyles.submitOffset)}>connect</PressButton>
  </form>

  <footer
    data-jx-pattern-login-boot=""
    class={cx(loginStyles.bandEnd, loginStyles.bootRow)}
  >
    <code class={cx(loginStyles.commandLine)}>
      <span class={cx(loginStyles.promptMark)} aria-hidden="true">$</span>
      {command}
    </code>
    <PressButton
      variant={bootCopied ? 'tonal' : 'ghost'}
      class={bootCopied ? 'jx-hue-success' : undefined}
      onclick={copyBootCommand}
      ariaLabel={`${bootCopied ? 'copied' : 'copy'} ${command}`}
    >
      {#if bootCopied}
        <span class={cx(loginStyles.iconLane)}><Icon name="check" size={14} strokeWidth={2.5} /></span>
        <span>copied</span>
      {:else}
        <span class={cx(loginStyles.iconLane)}><Icon name="copy" size={14} /></span>
        <span>copy</span>
      {/if}
    </PressButton>
  </footer>
</section>

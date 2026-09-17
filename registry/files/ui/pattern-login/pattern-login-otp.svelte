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
    class?: string;
  }

  let {
    host = 'jixoai.dev',
    length = 6,
    value = $bindable(''),
    hint = '',
    onverify,
    class: className = '',
  }: Props = $props();

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    onverify?.(value);
  }

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner, never a
  // raw class={styles.x} interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        Object.entries(style).flatMap(([key, value]) =>
          key !== '$$css' && typeof value === 'string' ? [value] : [],
        ).join(' '),
      )
      .join(' ');
</script>

<section
  data-jx-pattern-login-otp=""
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

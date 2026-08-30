<!--
  jixoai pattern-login-otp (registry/files/ui/pattern-login/
  pattern-login-otp.svelte, 2026-08-30, terminal-patterns).
  The second-factor screen of the ssh login story: the joined code
  rides Input-otp (auto-advance, paste distribution, the form-field
  bridge — all the atom's; nothing re-implemented here), the verify
  step is a PressButton, and the card keeps the same frame law as
  pattern-login.svelte (echo header, ascii corners, hairline footer).
  Pair them as two screens: onsignin on the login card swaps to this.
-->
<script lang="ts">
  import InputOtp from '$lib/ui/input-otp/input-otp.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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
</script>

<section
  data-jx-pattern-login-otp=""
  class={`jx-pattern-login box-border mx-auto w-full max-w-[26rem] border border-border bg-card rounded-(--radius) [box-shadow:4px_4px_0_0_var(--shadow)] ${className}`}
  aria-label="terminal two-factor verification"
>
  <header data-jx-pattern-login-echo="" class="border-b border-border px-4 py-2.5" aria-hidden="true">
    <p class="m-0 truncate font-nav text-xs tracking-[0.08em] text-muted-foreground">
      <span class="text-primary">$</span>
      otp --verify --host {host}
    </p>
  </header>

  <form class="flex flex-col gap-4 px-4 py-5 sm:px-5" novalidate onsubmit={submit}>
    <InputOtp name="otp" label="one-time code" {length} bind:value={value} />
    {#if hint}
      <p class="m-0 font-nav text-xs tracking-[0.04em] text-muted-foreground">
        <span class="text-primary" aria-hidden="true">#</span>
        {hint}
      </p>
    {/if}
    <PressButton type="submit" variant="fill" class="mt-1">verify</PressButton>
  </form>

  <footer data-jx-pattern-login-boot="" class="border-t border-border px-4 py-2.5" aria-hidden="true">
    <p class="m-0 truncate font-nav text-xs tracking-[0.04em] text-muted-foreground">
      <span class="text-primary">#</span>
      incomplete codes submit empty — never a partial lie
    </p>
  </footer>
</section>

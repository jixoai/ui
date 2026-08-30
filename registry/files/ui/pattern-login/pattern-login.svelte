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

  tw4: paint is token utilities in the markup; pattern-login.css keeps
  only the D1-exempt residue — the ascii `+` corner brackets no utility
  can generate (pseudo-element content).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { icons } from '$lib/icons';
  import Input from '$lib/ui/input/input.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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
    class?: string;
  }

  let {
    host = $bindable('jixoai.dev'),
    user = $bindable(''),
    password = $bindable(''),
    command = 'npx jixoai-ui init',
    onsignin,
    children,
    class: className = '',
  }: Props = $props();

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
</script>

<section
  data-jx-pattern-login=""
  class={`jx-pattern-login box-border mx-auto w-full max-w-[26rem] border border-border bg-card rounded-(--radius) [box-shadow:4px_4px_0_0_var(--shadow)] ${className}`}
  aria-label="terminal login"
>
  <header data-jx-pattern-login-echo="" class="border-b border-border px-4 py-2.5" aria-hidden="true">
    <p class="m-0 truncate font-nav text-xs tracking-[0.08em] text-muted-foreground">
      <span class="text-primary">$</span>
      ssh {user || 'user'}@{host}
    </p>
  </header>

  <form class="flex flex-col gap-4 px-4 py-5 sm:px-5" novalidate onsubmit={submit}>
    <Input label="user" name="user" placeholder="operator" autocomplete="username" bind:value={user}>
      {#snippet innerInlineStart()}
        <span class="font-nav text-muted-foreground" aria-hidden="true">user@</span>
      {/snippet}
    </Input>
    <Input label="host" name="host" placeholder="server.example" autocomplete="url" bind:value={host}>
      {#snippet innerInlineStart()}
        <span class="font-nav text-muted-foreground" aria-hidden="true">--host=</span>
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
    <PressButton type="submit" variant="fill" class="mt-1">connect</PressButton>
  </form>

  <footer
    data-jx-pattern-login-boot=""
    class="flex items-center gap-3 border-t border-border px-4 py-2.5"
  >
    <code class="min-w-0 flex-1 truncate font-nav text-xs tracking-[0.04em] text-muted-foreground">
      <span class="text-primary" aria-hidden="true">$</span>
      {command}
    </code>
    <PressButton
      variant={bootCopied ? 'tonal' : 'ghost'}
      class={bootCopied ? 'jx-hue-success' : undefined}
      onclick={copyBootCommand}
      ariaLabel={`${bootCopied ? 'copied' : 'copy'} ${command}`}
    >
      {#if bootCopied}
        <span class="inline-flex [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:stroke-[2.5]">{@html icons.check}</span>
        <span>copied</span>
      {:else}
        <span class="inline-flex [&_svg]:h-3.5 [&_svg]:w-3.5">{@html icons.copy}</span>
        <span>copy</span>
      {/if}
    </PressButton>
  </footer>
</section>

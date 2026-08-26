<!--
  Copy-command: a registry PressButton that copies the command to the
  clipboard and flips to the success-tonal feedback for 1.6s. Dogfoods
  the variant grammar's status injection (copied = tonal +
  jx-hue-success, the intent utility that succeeded the retired
  `copied` pseudo-variant) instead of inventing a new button.
-->
<script lang="ts">
  import { Check, Copy } from 'lucide-svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';

  interface Props {
    /** Command text to copy. */
    command: string;
    /** Button face; defaults to the command itself. */
    label?: string;
  }

  let { command, label }: Props = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const copy = (): void => {
    clearTimeout(timer);
    void navigator.clipboard?.writeText(command).then(() => {
      copied = true;
      timer = setTimeout(() => (copied = false), 1600);
    });
  };
</script>

<PressButton
  variant={copied ? 'tonal' : 'outline'}
  class={copied ? 'jx-hue-success' : undefined}
  onclick={copy}
  ariaLabel={`copy ${command}`}
>
  {#if copied}
    <Check size={13} strokeWidth={2.25} aria-hidden="true" />
    <span>copied</span>
  {:else}
    <Copy size={13} strokeWidth={2.25} aria-hidden="true" />
    <span class="font-mono text-[12px]">{label ?? command}</span>
  {/if}
</PressButton>

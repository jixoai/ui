<!--
  Copy-icon-button (apps/www/src/lib/copy-icon-button.svelte).

  The icon-only corner twin of copy-command.svelte (2026-08-22, user
  request: the overview cards' copy control moves to the top of the
  card as a bare icon; the command itself lives in the tooltip). Same
  clipboard contract + press physics, sized for a card corner.
-->
<script lang="ts">
  import { Check, Copy } from 'lucide-svelte';
  import Tooltip from '$lib/ui/tooltip.svelte';

  interface Props {
    /** Command text to copy (and to show in the tooltip). */
    command: string;
  }

  let { command }: Props = $props();

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

<Tooltip text={copied ? 'copied' : command} placement="bottom">
  <button
    type="button"
    onclick={copy}
    aria-label={`copy ${command}`}
    class="border-border bg-card hover:bg-muted text-foreground/80 hover:text-foreground shadow-xs
      pointer-events-auto inline-grid size-7 place-items-center border transition-[transform,box-shadow,background-color,color] duration-150
      hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sm
      active:translate-x-px active:translate-y-px active:shadow-none
      motion-reduce:transition-none
      {copied ? 'bg-secondary text-secondary-foreground' : ''}"
  >
    {#if copied}
      <Check size={13} strokeWidth={2.25} aria-hidden="true" />
    {:else}
      <Copy size={13} strokeWidth={2.25} aria-hidden="true" />
    {/if}
  </button>
</Tooltip>

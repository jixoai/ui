<!--
  Copy-icon-button (apps/www/src/lib/copy-icon-button.svelte).

  The icon-only corner twin of copy-command.svelte (2026-08-22, user
  request: the overview cards' copy control moves to the top of the
  card as a bare icon; the command itself lives in the tooltip). Same
  clipboard contract + press physics, sized for a card corner.
-->
<script lang="ts">
  import { icons } from '$lib/icons';
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';

  interface Props {
    /** Command text to copy (and to show in the tooltip). */
    command: string;
  }

  let { command }: Props = $props();

  let copied = $state(false);
  let failed = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const copy = (): void => {
    clearTimeout(timer);
    void navigator.clipboard
      ?.writeText(command)
      .then(() => {
        failed = false;
        copied = true;
        timer = setTimeout(() => (copied = false), 1600);
      })
      .catch(() => {
        // permission denied / document not focused — surface it in the
        // tooltip instead of an unhandled rejection (Codex r1)
        copied = false;
        failed = true;
        timer = setTimeout(() => (failed = false), 1600);
      });
  };
</script>

<Tooltip text={copied ? 'copied' : failed ? 'copy failed — clipboard blocked' : command} placement="bottom">
  <button
    type="button"
    onclick={copy}
    aria-label={`copy ${command}`}
    class="jx-press border-border bg-card hover:bg-muted text-foreground/80 hover:text-foreground
      pointer-events-auto inline-grid size-7 place-items-center border
      {copied ? 'bg-secondary text-secondary-foreground' : ''}
      {failed ? 'border-destructive text-destructive' : ''}"
  >
    {#if copied}
      <span class="inline-flex [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:stroke-[2.25]" aria-hidden="true">{@html icons.check}</span>
    {:else}
      <span class="inline-flex [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:stroke-[2.25]" aria-hidden="true">{@html icons.copy}</span>
    {/if}
  </button>
</Tooltip>

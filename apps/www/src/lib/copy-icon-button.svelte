<!--
  Copy-icon-button (apps/www/src/lib/copy-icon-button.svelte).

  The icon-only corner twin of copy-command.svelte (2026-08-22, user
  request: the overview cards' copy control moves to the top of the
  card as a bare icon; the command itself lives in the tooltip). Same
  clipboard contract + press physics, sized for a card corner.
-->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';
  import { siteChrome } from '$lib/surface/site-chrome.stylex';

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

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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

<Tooltip text={copied ? 'copied' : failed ? 'copy failed — clipboard blocked' : command} placement="bottom">
  <button
    type="button"
    onclick={copy}
    aria-label={`copy ${command}`}
    class={cx(
      'jx-press',
      siteChrome.cibBtn,
      failed ? siteChrome.cibFailed : copied ? siteChrome.cibCopied : siteChrome.cibIdle,
    )}
  >
    {#if copied}
      <Icon name="check" size={13} strokeWidth={2.25} />
    {:else}
      <Icon name="copy" size={13} strokeWidth={2.25} />
    {/if}
  </button>
</Tooltip>

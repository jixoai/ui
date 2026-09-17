<!--
  Copy-command: a registry PressButton that copies the command to the
  clipboard and flips to the success-tonal feedback for 1.6s. Dogfoods
  the variant grammar's status injection (copied = tonal +
  jx-hue-success, the intent utility that succeeded the retired
  `copied` pseudo-variant) instead of inventing a new button.
-->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { siteChrome } from '$lib/surface/site-chrome.stylex';

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

<PressButton
  variant={copied ? 'tonal' : 'outline'}
  class={copied ? 'jx-hue-success' : undefined}
  onclick={copy}
  ariaLabel={`copy ${command}`}
>
  {#if copied}
    <Icon name="check" size={13} strokeWidth={2.25} />
    <span>copied</span>
  {:else}
    <Icon name="copy" size={13} strokeWidth={2.25} />
    <span class={cx(siteChrome.ccLabel)}>{label ?? command}</span>
  {/if}
</PressButton>

<!--
  jixoai pattern-cta (registry/files/ui/pattern-cta/pattern-cta.svelte,
  2026-08-30, openspec 2026-08-30-terminal-patterns).
  The shell-prompt CTA band: a lead block (eyebrow / heading /
  summary / optional outline escape) beside the command card — the
  install command rides CodeCard (bash lane, the card's own copy
  control retired so the band owns ONE copy affordance) and the copy
  action is a PressButton in the card's footer snippet: fill rung,
  copy → check glyph flip, 1.4s copied surface — the terminal idiom's
  answer to "sign up now". Press physics stay the button's own (hover
  grows only the shadow, active presses +1px — verified by the
  press-button suite, never re-implemented here).

  Composition-only laws (terminal-patterns delta): no atom prop is
  patched, no atom paint re-implemented.
-->
<script lang="ts">
  import { icons } from '$lib/icons';
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import './pattern-cta.css';

  interface Props {
    /** the shell command the band sells (copy payload + card code) */
    command?: string;
    /** the band heading (renders an h2 stamped as component chrome) */
    heading?: string;
    /** max-52ch support line under the heading */
    summary?: string;
    /** the copy control's label (aria affordance when not copied) */
    actionLabel?: string;
    /** an outline escape beside the heading block; renders when set */
    secondaryLabel?: string;
    secondaryHref?: string;
    class?: string;
  }

  let {
    command = 'npx jixoai-ui init',
    heading = 'ship it from your terminal',
    summary = 'One command pulls the theme, the tokens and every atom you name into your repo — the source stays yours.',
    actionLabel = 'copy command',
    secondaryLabel = '',
    secondaryHref = '#',
    class: className = '',
  }: Props = $props();

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function copyCommand(): Promise<void> {
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
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1400);
  }
</script>

<section
  data-jx-pattern-cta=""
  class={`jx-pattern-cta box-border grid w-full gap-8 border border-border bg-card px-4 py-8 rounded-(--radius) [box-shadow:4px_4px_0_0_var(--shadow)] min-[820px]:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)] min-[820px]:items-center min-[820px]:px-8 ${className}`}
  aria-label="call to action"
>
  <div class="min-w-0">
    <p class="m-0 font-nav text-[11px] uppercase tracking-[0.24em] text-primary">$ npx jixoai-ui add …</p>
    <h2
      data-jx-cta-title=""
      class="mt-3 max-w-[24ch] text-[clamp(1.6rem,3.2vw,2.4rem)] font-bold leading-[1.2] tracking-[-0.02em] text-balance"
    >
      {heading}
    </h2>
    <p class="mt-3 max-w-[52ch] text-pretty text-[15px] leading-6 text-muted-foreground">
      {summary}
    </p>
    {#if secondaryLabel}
      <PressButton variant="outline" href={secondaryHref} class="mt-6">{secondaryLabel}</PressButton>
    {/if}
  </div>

  <CodeCard lang="bash" code={command} filename="install" copyable={false} class="min-w-0">
    {#snippet footer()}
      <PressButton
        variant={copied ? 'tonal' : 'fill'}
        class={copied ? 'jx-hue-success' : undefined}
        onclick={copyCommand}
        ariaLabel={`${copied ? 'copied' : actionLabel} ${command}`}
      >
        {#if copied}
          <span class="inline-flex [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:stroke-[2.5]">{@html icons.check}</span>
          <span>copied</span>
        {:else}
          <span class="inline-flex [&_svg]:h-3.5 [&_svg]:w-3.5">{@html icons.copy}</span>
          <span>{actionLabel}</span>
        {/if}
      </PressButton>
    {/snippet}
  </CodeCard>
</section>

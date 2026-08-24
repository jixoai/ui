<!--
  jixoai hero section (registry/files/ui/hero-section.svelte).
  The Broadside hero, composed after the openspecui reference: large lead
  type with a primary-colored accent, badge row, a copy-command PRIMARY
  CTA (icon + command, copied feedback) plus a secondary outline slot,
  and the terminal card in the second column when the hero has room
  (min-1100px two-column, bottom-aligned; terminal falls below on
  narrower screens).

  Props:
    eyebrow      tracked label above the title (brand hue)
    titleLead    the title's plain lead
    titleAccent  the title's primary-colored tail
    summary      max-62ch lead paragraph
    badges       uppercase mono badge row
    copyCommand  the command on the primary CTA (copied to clipboard)
    copyLabel    aria affordance ("copy" / language-specific)
    terminal     snippet: the right-column demo (terminal-card)
    secondary?   snippet: extra outline CTAs after the copy button
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import PressButton from '$lib/ui/press-button.svelte';

  interface Props {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    summary: string;
    badges: readonly string[];
    copyCommand: string;
    copyLabel?: string;
    terminal: Snippet;
    secondary?: Snippet;
  }

  let {
    eyebrow,
    titleLead,
    titleAccent,
    summary,
    badges,
    copyCommand,
    copyLabel = 'copy',
    terminal,
    secondary,
  }: Props = $props();

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  const copyCommandToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(copyCommand);
    } catch {
      const area = document.createElement('textarea');
      area.value = copyCommand;
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1400);
  };
</script>

<section class="mx-auto w-full max-w-[90rem] px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8">
  <div
    class="grid min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(25rem,31rem)] min-[1100px]:items-end gap-10 min-[1100px]:gap-14"
  >
    <div class="min-w-0">
      <p class="jx-hero-step font-nav text-primary text-[11px] uppercase tracking-[0.24em]" style="--jx-hero-delay: 0ms">
        {eyebrow}
      </p>
      <h1
        class="jx-hero-step mt-4 text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[1.2] tracking-[-0.02em] text-balance"
        style="--jx-hero-delay: 60ms; --jx-hero-rise: 14px"
      >
        {titleLead}<em class="text-primary not-italic">{titleAccent}</em>
      </h1>
      <p
        class="jx-hero-step text-muted-foreground mt-5 max-w-[62ch] text-pretty text-[15px] leading-6 sm:text-base sm:leading-7"
        style="--jx-hero-delay: 120ms"
      >
        {summary}
      </p>
      <div
        class="jx-hero-step text-muted-foreground font-nav mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.14em]"
        style="--jx-hero-delay: 160ms"
      >
        {#each badges as badge (badge)}
          <span>{badge}</span>
        {/each}
      </div>
      <div class="jx-hero-step mt-8 flex flex-wrap gap-3" style="--jx-hero-delay: 200ms">
        <PressButton
          variant={copied ? 'copied' : 'primary'}
          onclick={copyCommandToClipboard}
          ariaLabel={`${copied ? 'copied' : copyLabel} ${copyCommand}`}
        >
          {#if copied}
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          {:else}
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="12" height="12" rx="0" />
              <path d="M5 15V4a1 1 0 0 1 1-1h10" />
            </svg>
          {/if}
          <span>{copyCommand}</span>
        </PressButton>
        {#if secondary}
          {@render secondary()}
        {/if}
      </div>
    </div>
    <div class="jx-hero-step min-w-0" style="--jx-hero-delay: 260ms; --jx-hero-rise: 12px">
      {@render terminal()}
    </div>
  </div>
</section>

<style>
  /* The hero's entrance is a TIME-based cascade (Owner request,
     2026-08-24 — after the scroll-driven era made above-fold content
     appear without any entrance): the old staggered reveal (0/60/120/
     160/200/260ms, rise 12-14px) reborn as pure CSS. `backwards` holds
     the from-state through each delay; it plays at first paint — no JS,
     no hydration wait. Scroll-driven [data-reveal] is intentionally NOT
     used here: above-fold elements are past their entry range. */
  .jx-hero-step {
    animation: jx-hero-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
    animation-delay: var(--jx-hero-delay, 0ms);
  }
  @keyframes jx-hero-rise {
    from {
      opacity: 0;
      transform: translateY(var(--jx-hero-rise, 10px));
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .jx-hero-step {
      animation: none;
    }
  }
</style>

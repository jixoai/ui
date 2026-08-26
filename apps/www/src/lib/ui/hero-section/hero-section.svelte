<!--
  jixoai hero section (registry/files/ui/hero-section/hero-section.svelte,
  2026-08-25).
  The Broadside hero, composed after the openspecui reference: large lead
  type with a primary-colored accent, badge row, a copy-command PRIMARY
  CTA (icon + command, copied feedback) plus a secondary outline slot,
  and the terminal card in the second column when the hero has room
  (min-1100px two-column, bottom-aligned; terminal falls below on
  narrower screens).

  Composition-first API (composition-first-apis, 2026-08-25) — content
  is authored, not configured:

    eyebrow: string          tracked label above the title (brand hue)
    title?: snippet         the h1 content — the em carries the accent
                             paint (component css :where() rule; plain
                             text also legal)
    summary: string         max-62ch lead paragraph
    badges?: snippet        the badge row content — compose Badge parts
                             (badges: string[] is dead)
    copyCommand: string     the command on the primary CTA (clipboard
                             payload — value-domain data)
    copyLabel?: string      aria affordance of the DEFAULT copy CTA
    copy?: snippet          replaces the default copy CTA wholesale
    terminal: snippet       the right-column demo (terminal-card)
    secondary?: snippet     extra outline CTAs after the copy button

  tw4 (2026-08-24): the entrance cascade rides an animate-* arbitrary
  utility per step (delay through an animation-delay arbitrary
  property); the keyframes + the reduced-motion kill stay in
  hero-section.css (D1-exempt residue). composition-first adds the
  title-em accent rule — caller-authored content, so a :where()
  components-layer descendant rule is the only route (consumer
  utilities still win by the layer law).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import './hero-section.css';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
    eyebrow: string;
    summary: string;
    /** the clipboard payload — the default CTA's label AND copy target */
    copyCommand: string;
    /** aria affordance for the default copy CTA ("copy" / localized) */
    copyLabel?: string;
    /** the h1 content; <em> inside carries the accent paint */
    title?: Snippet;
    /** the badge row content — compose Badge children */
    badges?: Snippet;
    /** replaces the default copy CTA */
    copy?: Snippet;
    terminal: Snippet;
    secondary?: Snippet;
    class?: string;
  }

  let {
    eyebrow,
    summary,
    copyCommand,
    copyLabel = 'copy',
    title,
    badges,
    copy,
    terminal,
    secondary,
    class: className = '',
    ...rest
  }: Props = $props();

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  // one cascade law: the entrance animation + its per-step delay (the
  // rise offset varies per step through --jx-hero-rise)
  const step =
    'jx-hero-step animate-[jx-hero-rise_480ms_cubic-bezier(0.22,1,0.36,1)_backwards] [animation-delay:var(--jx-hero-delay,0ms)]';

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

<section
  class={cn('mx-auto w-full max-w-[90rem] px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8', className)}
  {...rest}
>
  <div
    class="grid min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(25rem,31rem)] min-[1100px]:items-end gap-10 min-[1100px]:gap-14"
  >
    <div class="min-w-0">
      <p class="{step} font-nav text-primary text-[11px] uppercase tracking-[0.24em]" style="--jx-hero-delay: 0ms">
        {eyebrow}
      </p>
      {#if title}
        <h1
          data-jx-hero-title=""
          class="{step} mt-4 text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[1.2] tracking-[-0.02em] text-balance"
          style="--jx-hero-delay: 60ms; --jx-hero-rise: 14px"
        >
          {@render title()}
        </h1>
      {/if}
      <p
        class="{step} text-muted-foreground mt-5 max-w-[62ch] text-pretty text-[15px] leading-6 sm:text-base sm:leading-7"
        style="--jx-hero-delay: 120ms"
      >
        {summary}
      </p>
      {#if badges}
        <div
          class="{step} text-muted-foreground font-nav mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.14em]"
          style="--jx-hero-delay: 160ms"
        >
          {@render badges()}
        </div>
      {/if}
      <div class="{step} mt-8 flex flex-wrap gap-3" style="--jx-hero-delay: 200ms">
        {#if copy}
          {@render copy()}
        {:else}
          <PressButton
            variant={copied ? 'tonal' : 'fill'}
            class={copied ? '[--jx-tonal:var(--success)]' : undefined}
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
        {/if}
        {#if secondary}
          {@render secondary()}
        {/if}
      </div>
    </div>
    <div class="{step} min-w-0" style="--jx-hero-delay: 260ms; --jx-hero-rise: 12px">
      {@render terminal()}
    </div>
  </div>
</section>

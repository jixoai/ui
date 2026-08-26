<!--
  jixoai spin (registry/files/ui/spin/spin.svelte).
  The loading indicator, terminal voice: a bracket cursor cycling
  [ ─ \ | / ] — the platform's oldest spinner, drawn in text.
  role=status + aria-label (polite by construction; loading is never
  an interruption).

  Two postures:
    bare (default)  <Spin label="loading checks" /> — inline glyph
    wrapping        <Spin label><content/></Spin> — the container gets
                    aria-busy, a scrim, and pointer-events blocking
                    (the ruling: never a visual mask with live hit
                    areas beneath — loading and disabled are different
                    states, and the overlay must own both pointers and
                    clearly-presented keyboard state)

  tw4 (2026-08-24): utility-authored — the stacked-frame cycling is
  per-frame visibility + animation utilities in the markup (frame 1
  rests visible, the rest invisible — exactly the reduced-motion
  fallback); ONLY the keyframes and their reduced-motion kill stay in
  spin.css (D1-exempt residue — keyframes are not utilities, and the
  kill overrides the animate utility, so it rides the unlayered
  :where carve-out).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './spin.css';

  interface Props {
    /** announced to assistive tech ("loading checks") */
    label?: string;
    /** wrapping content = container posture with scrim + aria-busy */
    children?: Snippet;
    class?: string;
  }

  let { label = 'loading', children, class: className = '' }: Props = $props();
</script>

{#if children}
  <div data-jx-spin-wrap="" class={cn('relative block', className)} aria-busy="true">
    <div data-jx-spin-live="" class="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] px-3.5 py-2 border border-border bg-popover shadow-xs" role="status" aria-label={label}>
      <span data-jx-spin-cursor="" class="font-mono text-[0.875rem] text-primary" aria-hidden="true">[&nbsp;<span class="jx-spin-frames relative inline-grid w-[1ch] text-center align-bottom"><i class="not-italic row-start-1 col-start-1 visible animate-[jx-spin-frame_800ms_steps(1)_infinite]">/</i><i class="invisible not-italic row-start-1 col-start-1 animate-[jx-spin-frame_800ms_steps(1)_infinite] [animation-delay:200ms]">—</i><i class="invisible not-italic row-start-1 col-start-1 animate-[jx-spin-frame_800ms_steps(1)_infinite] [animation-delay:400ms]">\\</i><i class="invisible not-italic row-start-1 col-start-1 animate-[jx-spin-frame_800ms_steps(1)_infinite] [animation-delay:600ms]">|</i></span>&nbsp;]</span>
    </div>
    <div data-jx-spin-content="" aria-hidden="false">
      {@render children()}
    </div>
    <div data-jx-spin-scrim="" class="absolute inset-0 bg-[color-mix(in_oklab,var(--background)_55%,transparent)]" aria-hidden="true"></div>
  </div>
{:else}
  <span data-jx-spin-inline="" class={cn('inline-flex items-center font-mono text-[0.8125rem] text-primary', className)} role="status" aria-label={label}>
    <span data-jx-spin-cursor="" aria-hidden="true">[&nbsp;<span class="jx-spin-frames relative inline-grid w-[1ch] text-center align-bottom"><i class="not-italic row-start-1 col-start-1 visible animate-[jx-spin-frame_800ms_steps(1)_infinite]">/</i><i class="invisible not-italic row-start-1 col-start-1 animate-[jx-spin-frame_800ms_steps(1)_infinite] [animation-delay:200ms]">—</i><i class="invisible not-italic row-start-1 col-start-1 animate-[jx-spin-frame_800ms_steps(1)_infinite] [animation-delay:400ms]">\\</i><i class="invisible not-italic row-start-1 col-start-1 animate-[jx-spin-frame_800ms_steps(1)_infinite] [animation-delay:600ms]">|</i></span>&nbsp;]</span>
  </span>
{/if}

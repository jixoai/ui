<!--
  jixoai spin (registry/files/ui/spin.svelte).
  The loading indicator, terminal voice: a bracket cursor cycling
  [ ─ \\ | / ] — the platform's oldest spinner, drawn in text.
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
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

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
  <div class="jx-spin-wrap {className}" aria-busy="true">
    <div class="jx-spin-live" role="status" aria-label={label}>
      <span class="jx-spin-cursor" aria-hidden="true">[&nbsp;<span class="jx-spin-frames"><i>/</i><i>—</i><i>\\</i><i>|</i></span>&nbsp;]</span>
    </div>
    <div class="jx-spin-content" aria-hidden="false">
      {@render children()}
    </div>
    <div class="jx-spin-scrim" aria-hidden="true"></div>
  </div>
{:else}
  <span class="jx-spin-inline {className}" role="status" aria-label={label}>
    <span class="jx-spin-cursor" aria-hidden="true">[&nbsp;<span class="jx-spin-frames"><i>/</i><i>—</i><i>\\</i><i>|</i></span>&nbsp;]</span>
  </span>
{/if}

<style>
  .jx-spin-frames {
    display: inline-block;
    width: 1ch;
    text-align: center;
    overflow: hidden;
    vertical-align: bottom;
  }
  .jx-spin-frames i {
    display: none;
    font-style: normal;
  }
  .jx-spin-frames i:nth-child(1) { animation: jx-spin-frame 800ms steps(1) infinite 0ms; display: block; }
  .jx-spin-frames i:nth-child(2) { animation: jx-spin-frame 800ms steps(1) infinite 200ms; display: block; }
  .jx-spin-frames i:nth-child(3) { animation: jx-spin-frame 800ms steps(1) infinite 400ms; display: block; }
  .jx-spin-frames i:nth-child(4) { animation: jx-spin-frame 800ms steps(1) infinite 600ms; display: block; }
  /* only the frame in its active window shows */
  .jx-spin-frames i {
    visibility: hidden;
  }
  @keyframes jx-spin-frame {
    0%,
    24% {
      visibility: visible;
    }
    25%,
    100% {
      visibility: hidden;
    }
  }

  .jx-spin-inline {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--primary);
  }

  .jx-spin-wrap {
    position: relative;
    display: block;
  }
  .jx-spin-live {
    position: absolute;
    inset-inline-start: 50%;
    inset-block-start: 50%;
    translate: -50% -50%;
    z-index: 1;
    padding: 0.5rem 0.875rem;
    border: 1px solid var(--border);
    background: var(--popover);
    box-shadow: var(--shadow-xs);
  }
  .jx-spin-live .jx-spin-cursor {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--primary);
  }
  .jx-spin-scrim {
    position: absolute;
    inset: 0;
    /* the mask OWNS pointers: no ghost clicks through a loading state */
    background: color-mix(in oklab, var(--background) 55%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-spin-frames i:nth-child(n) {
      animation: none;
      visibility: hidden;
    }
    .jx-spin-frames i:nth-child(1) {
      visibility: visible;
    }
  }
</style>

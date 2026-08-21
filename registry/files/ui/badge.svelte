<!--
  jixoai badge (registry/files/ui/badge.svelte).
  The inline status chip of the site grammar: Share Tech Mono uppercase
  micro-label, 1px border, radius 0 — the eyebrow's inline cousin.

  Tones stay inside the one-brand-hue law (no rainbow semantics):
    default     muted block + border        — neutral counts/status
    primary     solid brand block           — the loud one
    outline     border + foreground text    — quiet, on any surface
    destructive solid destructive block     — error/loss only

  A plain <span> so it composes anywhere (inside headings, table cells,
  terminal cards); restProps flow through — data-*, title, aria-* land
  verbatim.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    tone?: 'default' | 'primary' | 'outline' | 'destructive';
  }

  let { tone = 'default', class: className = '', children, ...rest }: Props = $props();
</script>

<span class="jx-badge jx-badge-{tone} {className}" {...rest}>
  {@render children?.()}
</span>

<style>
  .jx-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    box-sizing: border-box;
    max-width: 100%;
    padding: 0.0625rem 0.4375rem;
    border: 1px solid var(--border);
    font-family: var(--font-nav);
    font-size: 11px;
    line-height: 1.5;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    border-radius: var(--radius);
  }

  .jx-badge-default {
    background: var(--muted);
    color: var(--foreground);
  }
  .jx-badge-primary {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--primary-foreground);
  }
  .jx-badge-outline {
    background: transparent;
    color: var(--foreground);
  }
  .jx-badge-destructive {
    background: var(--destructive);
    border-color: var(--destructive);
    color: var(--destructive-foreground);
  }
</style>

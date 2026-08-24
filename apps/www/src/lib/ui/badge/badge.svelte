<!--
  jixoai badge (registry/files/ui/badge.svelte).
  The inline status chip of the site grammar: Share Tech Mono uppercase
  micro-label, 1px border, radius 0 — the eyebrow's inline cousin.

  Tone vocabulary law (shared with alert): semantic tones are exactly
  default / primary / destructive — no near-synonyms. `outline` is NOT a
  semantic tone but a fill variant of default (transparent ground, for
  chips sitting on tinted surfaces); it says nothing different, it just
  draws less.

  A plain <span> so it composes anywhere (inside headings, table cells,
  terminal cards); restProps flow through — data-*, title, aria-* land
  verbatim.

  tw4 (2026-08-24): utility-authored — the chip paint and the tone fills
  are token utilities in the markup (tone rides a deterministic map, so
  no two tone utilities ever collide in the sheet); `jx-badge` and the
  `jx-badge-*` tone hooks stay as semantic hooks only, no css defines
  them.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    tone?: 'default' | 'primary' | 'outline' | 'destructive';
  }

  let { tone = 'default', class: className = '', children, ...rest }: Props = $props();

  const toneUtilities = {
    default: 'bg-muted text-foreground',
    primary: 'bg-primary border-primary text-primary-foreground',
    outline: 'bg-transparent text-foreground',
    destructive: 'bg-destructive border-destructive text-destructive-foreground',
  } as const;
</script>

<span
  class={cn(
    `jx-badge jx-badge-${tone} inline-flex items-center gap-1.5 box-border max-w-full px-[0.4375rem] py-[0.0625rem] border border-border font-nav text-[11px] leading-[1.5] tracking-[0.14em] uppercase whitespace-nowrap rounded-(--radius)`,
    toneUtilities[tone],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</span>

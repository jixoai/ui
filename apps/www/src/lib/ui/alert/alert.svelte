<!--
  jixoai alert (registry/files/ui/alert.svelte).
  The inline notice block: 1px border, hard offset shadow-xs, tone accent
  on the border + title. Not the modal one (that is alert-dialog, a later
  registry item) — this is the in-flow banner for loaded/failed states.

  Live-region semantics are a prop, not a guess:
    assertive={false} (default) → role="status"  polite announcements
    assertive={true}            → role="alert"   immediate (errors,
                                                 destructive tone pairs
                                                 with this)
  Tones stay inside the one-brand-hue law:
    default      border + foreground — plain notice
    primary      brand border/title — the site's emphasis voice (there
                  is no blue "info" in this language)
    destructive  destructive border/title — error/loss only

  Composition: optional `icon` snippet lands inline-start of the title
  (bring your own — lucide, svg, text glyph); children is the body copy.

  tw4 (2026-08-24): utility-authored — the banner paint composes from
  token utilities (layer law: consumer utilities always win); tone maps
  to border/title color utilities per prop. ONLY the passed-through
  icon-glyph normalization (a descendant boundary) stays in alert.css;
  `jx-alert*` classes are semantic hooks, css defines them not.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './alert.css';

  interface Props {
    /** tone drives border + title color */
    tone?: 'default' | 'primary' | 'destructive';
    /** true → role=alert (assertive); false → role=status (polite) */
    assertive?: boolean;
    /** one-line heading; omitted renders a bare body block */
    title?: string;
    /** icon snippet, rendered inline-start of the title */
    icon?: Snippet;
    /** body copy; omit for a title-only notice */
    children?: Snippet;
    class?: string;
  }

  let { tone = 'default', assertive = false, title, icon, children, class: className = '' }: Props =
    $props();

  const toneBorder = {
    default: 'border-border',
    primary: 'border-primary',
    destructive: 'border-destructive',
  } as const;
  const titleColor = {
    default: 'text-foreground',
    primary: 'text-primary',
    destructive: 'text-destructive',
  } as const;
</script>

<div
  class={cn(
    `jx-alert jx-alert-${tone} flex flex-col gap-1.5 box-border border bg-card px-3.5 py-3 shadow-2xs rounded`,
    toneBorder[tone],
    className,
  )}
  role={assertive ? 'alert' : 'status'}
>
  {#if title}
    <p class={cn('jx-alert-title flex items-center gap-2 font-nav text-[0.8125rem] tracking-[0.08em] uppercase', titleColor[tone])}>
      {#if icon}<span class="jx-alert-icon inline-flex">{@render icon()}</span>{/if}{title}
    </p>
  {/if}
  {#if children}
    <div class="jx-alert-body text-[0.8125rem] leading-[1.55] text-muted-foreground">
      {@render children()}
    </div>
  {/if}
</div>

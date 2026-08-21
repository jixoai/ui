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
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

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
</script>

<div class="jx-alert jx-alert-{tone} {className}" role={assertive ? 'alert' : 'status'}>
  {#if title}
    <p class="jx-alert-title">
      {#if icon}<span class="jx-alert-icon">{@render icon()}</span>{/if}{title}
    </p>
  {/if}
  {#if children}
    <div class="jx-alert-body">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .jx-alert {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    box-sizing: border-box;
    padding: 0.75rem 0.875rem;
    border: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-2xs);
    border-radius: var(--radius);
  }
  .jx-alert-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-alert-icon {
    display: inline-flex;
    color: currentColor;
  }
  .jx-alert-icon :global(svg) {
    width: 1em;
    height: 1em;
  }
  .jx-alert-body {
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--muted-foreground);
  }

  .jx-alert-primary {
    border-color: var(--primary);
  }
  .jx-alert-primary .jx-alert-title {
    color: var(--primary);
  }
  .jx-alert-destructive {
    border-color: var(--destructive);
  }
  .jx-alert-destructive .jx-alert-title {
    color: var(--destructive);
  }
</style>

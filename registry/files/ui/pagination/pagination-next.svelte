<!--
  jixoai PaginationNext (registry/files/ui/pagination/pagination-next.svelte,
  2026-08-25).
  The trailing edge control — PaginationPrevious's mirror. href → a
  real link; onclick only → a button; NEITHER → the honest disabled
  span (aria-disabled, not a dead link) at the last page.

  child({ props }) contract per design.md: ANCHOR-form only — the
  child escape renders exclusively on the href branch (the single
  concrete element-kind law, Codex impl-r1 P1-4). The onclick-only
  button and the honest disabled span are not replaceable; the
  disabled span IS the no-affordance answer.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  type Props = HTMLAttributes<HTMLElement> & {
    /** the next page's URL; omit at the last page */
    href?: string;
    /** click-only control (renders a button) */
    onclick?: (event: MouseEvent) => void;
    /** replacement-element escape (ANCHOR form: requires href) */
    child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;
    children?: Snippet;
    class?: string;
  };

  let { href, onclick, child, children, class: className = '', ...rest }: Props = $props();



  const chipPose =
    '[--jx-press-shadow:none] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]';
  const chipBase =
    'inline-flex min-h-[var(--jx-d-ctl-hit)] min-w-[var(--jx-d-ctl-hit)] items-center justify-center box-border border px-[var(--jx-d-ctl-pad)] font-nav text-[length:var(--jx-d-ctl-text)] leading-[var(--jx-d-ctl-line)] no-underline tracking-[0.08em] cursor-pointer focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1';
  const edgeChip = cn(
    'jx-press',
    chipBase,
    chipPose,
    'border-border bg-card text-foreground hover:border-primary hover:text-primary',
  );

  const props = $derived({ class: cn(edgeChip, 'uppercase', className), href, onclick, ...rest });
</script>

{#if child && href !== undefined}
  {@render child({ props })}
{:else if href !== undefined}
  <a data-jx-page-edge="" {...props} href={href}>{#if children}{@render children()}{:else}next ›{/if}</a>
{:else if onclick !== undefined}
  <button type="button" data-jx-page-edge="" {...props} onclick={onclick}>
    {#if children}{@render children()}{:else}next ›{/if}
  </button>
{:else}
  <span
    data-jx-page-edge=""
    data-jx-page-edge-off=""
    class={cn(
      'inline-flex min-h-[var(--jx-d-ctl-hit)] min-w-[var(--jx-d-ctl-hit)] items-center justify-center box-border border border-border bg-card px-[var(--jx-d-ctl-pad)] font-nav text-[length:var(--jx-d-ctl-text)] leading-[var(--jx-d-ctl-line)] uppercase tracking-[0.08em] text-foreground opacity-45 shadow-none cursor-not-allowed',
      className,
    )}
    {...rest}
    aria-disabled="true"
  >
    {#if children}{@render children()}{:else}next ›{/if}
  </span>
{/if}

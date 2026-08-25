<!--
  jixoai PaginationPrevious (registry/files/ui/pagination/pagination-previous.svelte,
  2026-08-25).
  The leading edge control. href → a real link; onclick only → a
  button; NEITHER → the honest disabled span (aria-disabled, not a
  dead link): the consumer who passes nothing at the first page gets
  the closed component's bound behavior verbatim.

  child({ props }) contract per design.md (offered on the interactive
  forms — the disabled span is not replaceable, it IS the no-affordance
  answer).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props {
    /** the previous page's URL; omit at the first page */
    href?: string;
    /** click-only control (renders a button) */
    onclick?: (event: MouseEvent) => void;
    /** replacement-element escape: receives the merged link props */
    child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;
    children?: Snippet;
    class?: string;
  }

  let { href, onclick, child, children, class: className = '' }: Props = $props();

  const chipPose =
    '[--jx-press-shadow:none] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]';
  const chipBase =
    'inline-flex h-[1.875rem] min-w-[1.875rem] items-center justify-center box-border border px-2 font-nav text-xs no-underline tracking-[0.08em] cursor-pointer focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1';
  const edgeChip = cn(
    'jx-press',
    chipBase,
    chipPose,
    'border-border bg-card text-foreground hover:border-primary hover:text-primary',
  );

  const props = $derived({ class: cn(edgeChip, 'uppercase', className), href, onclick });
</script>

{#if child}
  {@render child({ props })}
{:else if href !== undefined}
  <a data-jx-page-edge="" {...props} href={href}>{#if children}{@render children()}{:else}‹ prev{/if}</a>
{:else if onclick !== undefined}
  <button type="button" data-jx-page-edge="" {...props} onclick={onclick}>
    {#if children}{@render children()}{:else}‹ prev{/if}
  </button>
{:else}
  <span
    data-jx-page-edge=""
    data-jx-page-edge-off=""
    class="inline-flex h-[1.875rem] min-w-[1.875rem] items-center justify-center box-border border border-border bg-card px-2 font-nav text-xs uppercase tracking-[0.08em] text-foreground opacity-45 shadow-none cursor-not-allowed"
    aria-disabled="true"
  >
    {#if children}{@render children()}{:else}‹ prev{/if}
  </span>
{/if}

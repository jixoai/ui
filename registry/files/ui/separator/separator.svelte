<!--
  jixoai separator (registry/files/ui/separator/separator.svelte).
  W3C-first: the horizontal separator IS <hr> — native semantics, native
  styling, zero ARIA. Only the vertical posture has no native element, so
  it takes the ARIA route: <div role="separator" aria-orientation>.

  orientation="horizontal" (default) renders <hr> — a thematic break
  between content sections (paragraphs, card blocks).
  orientation="vertical"   renders the ARIA div — a visual divider
  between inline peers (toolbar items, footer columns).

  1px var(--border) both ways; length is the consumer's job (the element
  is display:block horizontal / inline-block vertical — width/height via
  the class prop or the parent's layout).

  tw4 (2026-08-24): pure token utilities, zero css residue.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLHRElement> {
    orientation?: 'horizontal' | 'vertical';
  }

  let { orientation = 'horizontal', class: className = '', ...rest }: Props = $props();
</script>

{#if orientation === 'vertical'}
  <!-- component-owned semantics land AFTER the spread: role/aria here
       are not overridable — the separator contract is the component's -->
  <div
    data-jx-separator-v class={cn('inline-block self-stretch flex-none w-px min-w-px bg-border', className)}
    {...(rest as HTMLAttributes<HTMLDivElement>)}
    role="separator"
    aria-orientation="vertical"
  ></div>
{:else}
  <hr data-jx-separator-h class={cn('flex-none border-0 border-t border-border m-0', className)} {...rest} />
{/if}

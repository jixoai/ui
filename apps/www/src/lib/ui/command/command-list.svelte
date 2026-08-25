<!--
  jixoai command list (registry/files/ui/command/command-list.svelte).
  The listbox half: role=listbox with the deterministic id the input's
  aria-controls points at (derived from the root's $props.id() — the
  wire never depends on render order). Scrolling is contained here
  while the dialog caps the height; the empty state and the groups are
  consumer-authored children whose visibility is pure CSS :has over
  this element (see command.css).
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { COMMAND_KEY, type CommandApi } from './command.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

  const cmd = getContext<CommandApi>(COMMAND_KEY);
</script>

<div
  data-jx-command-list=""
  class={cn(
    'overflow-y-auto overscroll-contain [scrollbar-gutter:stable_both-edges] py-[0.375rem] [padding-inline:max(0.375rem-var(--jx-scrollbar-thin,0px),0px)]',
    className,
  )}
  id={cmd.listId}
  role="listbox"
  aria-label={cmd.label}
  tabindex="-1"
  {...rest}
>
  {@render children()}
</div>

<!--
  jixoai command list (registry/files/ui/command/command-list.svelte).
  The listbox half: role=listbox with the deterministic id the input's
  aria-controls points at (derived from the root's $props.id() — the
  wire never depends on render order). The element REGISTERS itself on
  the context at mount: the root's walk accepts only options whose
  closest listbox is THIS one (a nested palette never leaks — Codex
  impl-r2 P1-1). Scrolling is contained here while the dialog caps the
  height; the empty state and the groups are consumer-authored
  children whose visibility is pure CSS :has over this element (see
  command.css).

  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import { getContext, onDestroy } from 'svelte';
  import { densityRungOf } from '$lib/defaults.svelte';
  import { CommandDefaults } from './command-defaults.svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { commandStyles } from './command.stylex';
  import { COMMAND_KEY, type CommandApi } from './command.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

  const cmd = getContext<CommandApi>(COMMAND_KEY);
  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): the density slot's ambient read lands the root's
  // provided opinion; no opinion resolves undefined → no stamp
  const d = $derived(CommandDefaults.resolve({}));

  let el = $state<HTMLDivElement | null>(null);

  // the own-list registration: the DOM POINTER binds when the
  // element mounts ($effect — the hydrate-time exception for element
  // handles; the field itself is imperative state, never reactive
  // order); onDestroy releases it identity-guarded
  $effect(() => {
    cmd.listEl = el;
  });
  onDestroy(() => {
    if (cmd.listEl === el) cmd.listEl = null;
  });

  // the payload's own join (separator's serialize law)
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div
  bind:this={el}
  data-jx-command-list=""
  data-density={densityRungOf(d.density)}
  class={cn(cx(commandStyles.list), className)}
  {...rest}
  id={cmd.listId}
  role="listbox"
  aria-label={cmd.label}
  tabindex="-1"
>
  {@render children()}
</div>

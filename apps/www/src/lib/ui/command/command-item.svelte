<!--
  jixoai command item (registry/files/ui/command/command-item.svelte).
  The option half — and the SELF-MATCH law's owner (family context
  contract, clause 4): visibility is THIS item's own computation of
  the context predicate against {label, keywords}. No central
  registry, no order dependence, SSR renders it visible; the hidden
  ATTRIBUTE is the visibility channel the walk selector, the group
  self-hide and the empty reveal all key on.

  label is REQUIRED — it is the match text AND the accessible name
  (aria-label whenever authored children exist; when children are
  absent, label IS the content). keywords is extra match text, never
  displayed. hint is a snippet (the kbd glyph is content — compose the
  registry Kbd part). disabled items render but never enter the walk,
  never become activedescendant, never fire onselect (the three
  locks). onselect fires once per selection (Enter or pointer), then
  the palette closes unless the root's closeOnSelect is false.

  The id is $props.id() — stable per instance, and exactly what the
  input's aria-activedescendant points at.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { COMMAND_KEY, type CommandApi } from './command.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** REQUIRED: the match text AND the accessible name */
    label: string;
    /** extra match text (aliases, descriptions); never displayed */
    keywords?: string;
    /** renders but never walks, never activates */
    disabled?: boolean;
    /** fires once on selection (Enter or pointer); disabled never fires */
    onselect?: () => void;
    /** right-aligned hint content — the kbd glyph is authored content
     *  (compose the registry Kbd part), never a string→glyph prop */
    hint?: Snippet;
    /** rendered content; omit and label IS the content */
    children?: Snippet;
    class?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const itemId = $props.id();

  let {
    label,
    keywords,
    disabled = false,
    onselect,
    hint,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  const cmd = getContext<CommandApi>(COMMAND_KEY);

  // SELF-MATCH: the predicate answers inclusion only — filtering
  // hides, never reorders; the authored tree order is the walk order
  const visible = $derived(cmd.matches({ label, keywords }));

  // active implies walkable: disabled options never hold activeId
  const active = $derived(!disabled && cmd.activeId === itemId);

  function fire(): void {
    if (disabled) return;
    if (cmd.closeOnSelect) cmd.close();
    onselect?.();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -- the
     listbox option pattern here is activedescendant-driven: the INPUT
     holds focus and keys; the option's click is a pointer shortcut -->
<div
  {...rest}
  id={itemId}
  role="option"
  aria-selected={active}
  aria-disabled={disabled || undefined}
  aria-label={children ? label : undefined}
  data-jx-command-item=""
  data-jx-command-item-disabled={disabled ? '' : undefined}
  data-jx-command-item-active={active ? '' : undefined}
  hidden={!visible}
  class={cn(
    'flex items-center justify-between gap-3 px-[0.625rem] py-2 text-[0.8125rem] text-foreground',
    disabled
      ? 'cursor-not-allowed opacity-45'
      : active
        ? 'cursor-pointer bg-muted shadow-[inset_2px_0_0_var(--primary)]'
        : 'cursor-pointer',
    className,
  )}
  onclick={fire}
  onpointerenter={() => {
    if (!disabled) cmd.setActive(itemId);
  }}
>
  <span data-jx-command-label="" class="min-w-0 truncate">
    {#if children}{@render children()}{:else}{label}{/if}
  </span>
  {#if hint}
    <span
      data-jx-command-hint=""
      class="flex-none border border-border px-[0.375rem] font-nav text-[0.6875rem] tracking-[0.1em] text-muted-foreground"
    >
      {@render hint()}
    </span>
  {/if}
</div>

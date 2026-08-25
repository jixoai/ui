<!--
  jixoai command input (registry/files/ui/command/command-input.svelte).
  The combobox half: a real <input role=combobox> wired to the root's
  context — it binds the query one-way in (oninput writes back), holds
  the keyboard law (delegated to the root's navigate), and carries the
  IME composition guard: keys arriving while composing are TEXT, not
  commands — the walk and Enter stay inert until compositionend. The
  input HOLDS focus for the whole palette (aria-activedescendant names
  the active option; screen readers announce it).
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { COMMAND_KEY, type CommandApi } from './command.svelte';

  interface Props extends HTMLAttributes<HTMLInputElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();

  const cmd = getContext<CommandApi>(COMMAND_KEY);

  let el = $state<HTMLInputElement | null>(null);
  let composing = false;

  // register with the root's open path (open focuses here) — a plain
  // handle sync, not a registry: no id, no order, last write stands
  $effect(() => {
    cmd.setInput(el);
  });

  function handleKeydown(event: KeyboardEvent): void {
    if (composing) return; // IME guard — composition keys are text
    cmd.navigate(event);
  }
</script>

<input
  bind:this={el}
  data-jx-command-input=""
  class={cn(
    'box-border w-full border-b border-border bg-transparent px-4 py-[0.875rem] font-mono text-[0.9375rem] text-foreground placeholder:text-muted-foreground focus:outline-none',
    className,
  )}
  type="text"
  role="combobox"
  aria-label={cmd.label}
  aria-expanded="true"
  aria-controls={cmd.listId}
  aria-activedescendant={cmd.activeId || undefined}
  aria-autocomplete="list"
  placeholder={cmd.placeholder}
  value={cmd.query}
  oninput={(event) => cmd.setQuery(event.currentTarget.value)}
  onkeydown={handleKeydown}
  oncompositionstart={() => (composing = true)}
  oncompositionend={() => (composing = false)}
  {...rest}
/>

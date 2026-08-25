<!--
  Test host for the composed command family (composition-e.spec.ts,
  2026-08-25). The authored tree order is LOAD-BEARING for the
  byte-stability assertions: a disabled FIRST item (Home/open-anchor
  skip), two groups, keywords, children vs label-only forms, and a
  hint snippet. match/onselect/closeOnSelect/hotkey are test seams.
-->
<script lang="ts">
  import Command, { type CommandMatch } from '../../src/lib/ui/command/command.svelte';
  import CommandInput from '../../src/lib/ui/command/command-input.svelte';
  import CommandList from '../../src/lib/ui/command/command-list.svelte';
  import CommandEmpty from '../../src/lib/ui/command/command-empty.svelte';
  import CommandGroup from '../../src/lib/ui/command/command-group.svelte';
  import CommandItem from '../../src/lib/ui/command/command-item.svelte';

  let {
    match,
    closeOnSelect = true,
    hotkey = false,
    initialOpen = true,
    onselect,
  }: {
    match?: CommandMatch;
    closeOnSelect?: boolean;
    hotkey?: boolean;
    initialOpen?: boolean;
    onselect?: (label: string) => void;
  } = $props();

  // snapshot-seed (fresh mount per render call)
  // svelte-ignore state_referenced_locally
  let open = $state(initialOpen);
</script>

<Command bind:open {match} {closeOnSelect} {hotkey} label="test palette">
  <CommandInput />
  <CommandList>
    <CommandEmpty>no matches</CommandEmpty>
    <CommandGroup heading="actions">
      <CommandItem label="Run the audit" disabled onselect={() => onselect?.('Run the audit')}>
        Run the audit
      </CommandItem>
      <CommandItem label="Deploy site" onselect={() => onselect?.('Deploy site')}>
        Deploy site
        {#snippet hint()}<span data-test-hint>⌘D</span>{/snippet}
      </CommandItem>
      <CommandItem label="Toggle theme" onselect={() => onselect?.('Toggle theme')}>
        Toggle theme
      </CommandItem>
    </CommandGroup>
    <CommandGroup heading="go">
      <CommandItem
        label="Open the registry"
        keywords="components npm json"
        onselect={() => onselect?.('Open the registry')}
      />
      <CommandItem
        label="Open tokens"
        keywords="colors oklch hue"
        onselect={() => onselect?.('Open tokens')}
      />
      <CommandItem
        label="Open GitHub"
        keywords="source repo"
        onselect={() => onselect?.('Open GitHub')}
      />
    </CommandGroup>
  </CommandList>
</Command>

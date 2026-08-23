<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import Command, { type CommandItem } from '$lib/ui/command.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Kbd from '$lib/ui/kbd.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import commandSource from '$lib/ui/command.svelte?raw';

  let open = $state(false);
  let lastAction = $state('');

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { lastAction: '' };
  function resetCanvas(): void {
    lastAction = canvasInitial.lastAction;
  }

  // ToC outline: pairs with the section ids below, in page order.

  const items: CommandItem[] = [
    { id: 'deploy', label: 'Deploy site', group: 'actions', hint: '⌘D' },
    { id: 'theme', label: 'Toggle theme', group: 'actions', hint: '⌘J' },
    { id: 'registry', label: 'Open the registry', group: 'go', keywords: 'components npm json' },
    { id: 'tokens', label: 'Open tokens', group: 'go', keywords: 'colors oklch hue' },
    { id: 'github', label: 'Open GitHub', group: 'go', keywords: 'source repo' },
    { id: 'audit', label: 'Run the audit (soon)', group: 'actions', disabled: true },
  ];

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Command from '@ui/command.svelte';
${close}

<Command {items} onselect={(item) => run(item)} />

<!-- ⌘K is bound by the component; app-owned trigger: -->
<PressButton onclick={() => (open = true)}>open</PressButton>
<Command {items} bind:open hotkey={false} onselect={run} />`;

  const canvasUsage = `<Command {items} onselect={(item) => act(item)} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/command.svelte', content: commandSource },
    { name: 'src/lib/ui/command-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Command · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai command palette: the ⌘K surface on a native dialog — deterministic ranking, aria-activedescendant combobox, IME-safe, one execution path. No fuzzy, no cmdk layer."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ARIA"
      title="command — the ⌘K surface, ruled by design"
      summary="A modal task on a native dialog: showModal gives the focus trap, Escape and the top layer. Ranking is deterministic (exact > startsWith > token > includes > keywords) — no fuzzy, no scoring mystery. The combobox holds focus with aria-activedescendant pointing at the active option; typing IS the filter; no-matches is polite status text, not a fake option. One execution path: onselect fires once, then it closes."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">dialog + showModal</span>
        <span class="pill">aria-activedescendant</span>
        <span class="pill">deterministic ranking</span>
        <span class="pill">IME-safe</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="command"
      description="Press ⌘K (or the button). Type 'open', walk with arrows, Enter to run — the last action surfaces below. The disabled audit item renders but never activates."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/command.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'last action', value: lastAction || '—' }]}
    >
      <div class="flex flex-wrap items-center gap-4">
        <PressButton onclick={() => (open = true)}>open palette</PressButton>
        <span class="text-muted-foreground text-[12.5px]">
          or <Kbd>⌘</Kbd> + <Kbd>K</Kbd> anywhere
        </span>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          keyboard: type to filter, ↑/↓ walk with wrap (skipping disabled), Home/End jump, Enter
          runs and closes, Escape closes with focus restored natively. closeOnSelect={false} keeps
          it open for batch actions; filter prop swaps the whole ranking (pure function).
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <Command
    {items}
    bind:open
    onselect={(item) => (lastAction = item.label.toLowerCase())}
  />

  <div id="command-base" data-reveal="" use:reveal>
    <SectionCard family="command-base" headerRegion="command-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

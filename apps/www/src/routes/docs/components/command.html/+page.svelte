<!--
  Docs page for the command family (composition-first-apis, Batch E,
  2026-08-25).
  Intents:
  1. Hero summary: the composed cmdk-style family — self-matching
     items, predicate-only filtering, CSS :has group/empty laws.
  2. One ComponentCanvas: the live palette (open state + last action
     echo — the playground protocol), hint snippets composed with the
     registry Kbd part.
  3. Usage CodeBlock: the copyable composition sample (the canvas
     drawer shares the same string).
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import Command, {
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
  } from '$lib/ui/command/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import commandSource from '$lib/ui/command/command.svelte?raw';
  import commandCss from '$lib/ui/command/command.css?raw';

  // playground state (P1): the page owns the snapshot
  let open = $state(false);
  let lastAction = $state('');
  const canvasInitial = { open: false, lastAction: '' };
  function resetCanvas(): void {
    open = canvasInitial.open;
    lastAction = canvasInitial.lastAction;
  }

  const run = (action: string): void => {
    lastAction = action;
  };

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Command, {
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
  } from '@ui/command/index';
  import Kbd from '@ui/kbd/kbd.svelte';
${close}

<!-- label = REQUIRED match text + accessible name; the authored tree
     order IS the walk order (the match predicate may only answer
     inclusion); hint is a snippet — the kbd glyph is authored
     content, never a string→glyph prop. -->
<Command bind:open hotkey>
  <CommandInput placeholder="run a command…" />
  <CommandList>
    <CommandEmpty>nothing matched</CommandEmpty>
    <CommandGroup heading="actions">
      <CommandItem label="Deploy site" onselect={() => deploy()}>
        Deploy site
        {#snippet hint()}<Kbd>⌘D</Kbd>{/snippet}
      </CommandItem>
      <CommandItem label="Run the audit" disabled>
        Run the audit
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>

<!-- ⌘K is bound by the component when hotkey; an app-owned trigger: -->
<PressButton onclick={() => (open = true)}>open</PressButton>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/command/command.svelte', content: commandSource },
    { name: 'registry/files/ui/command/command.css', content: commandCss },
    { name: 'src/lib/ui/command-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Command · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai command palette as a composed cmdk-style family: a native dialog shell with SELF-MATCHING CommandItems — the match predicate answers inclusion only, the authored tree order is the walk order, groups and the empty state are pure CSS :has, and hints are authored Kbd snippets."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · ARIA"
        title="command — the composed ⌘K surface"
        summary="A modal task on a native dialog: showModal gives the focus trap, Escape and the top layer. The family is composed cmdk-style — every CommandItem SELF-MATCHES against the context predicate (match may only answer inclusion; authored tree order is the byte-stable walk order), emptied groups and the no-matches state are pure CSS :has, and the combobox holds focus with aria-activedescendant. IME-safe, deterministic default match (equals > startsWith > token > includes > keywords as a boolean disjunction), per-item onselect — one execution path."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">dialog + showModal</span>
          <span class="pill">self-matching items</span>
          <span class="pill">aria-activedescendant</span>
          <span class="pill">CSS :has group/empty</span>
          <span class="pill">IME-safe</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="command"
        stage="center"
        description="Press ⌘K (or the button). Type 'open', walk with arrows, Enter to run — the open state and last action surface below. The disabled audit item renders but never walks, never activates."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/command/command.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[
          { label: 'open', value: String(open) },
          { label: 'last action', value: lastAction || '—' },
        ]}
      >
        <div class="flex flex-wrap items-center gap-4">
          <PressButton onclick={() => (open = true)}>open palette</PressButton>
          <span class="text-muted-foreground text-[12.5px]">
            or <Kbd>⌘</Kbd> + <Kbd>K</Kbd> anywhere
          </span>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              keyboard: type to filter, ↑/↓ walk with wrap (skipping disabled), Home/End jump,
              Enter runs and closes, Escape closes with focus restored natively. the
              <code class="text-accent">match</code> predicate may only answer inclusion —
              authored order is byte-stable under any custom predicate;
              <code class="text-accent">closeOnSelect={'{'}false{'}'}</code> keeps it open
              for batch actions.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <Command bind:open hotkey>
      <CommandInput placeholder="type a command…" />
      <CommandList>
        <CommandEmpty>no matches — try 'open'</CommandEmpty>
        <CommandGroup heading="actions">
          <CommandItem label="Deploy site" onselect={() => run('deploy site')}>
            Deploy site
            {#snippet hint()}<Kbd>⌘D</Kbd>{/snippet}
          </CommandItem>
          <CommandItem label="Toggle theme" onselect={() => run('toggle theme')}>
            Toggle theme
            {#snippet hint()}<Kbd>⌘J</Kbd>{/snippet}
          </CommandItem>
          <CommandItem label="Run the audit (soon)" disabled>
            Run the audit (soon)
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="go">
          <CommandItem
            label="Open the registry"
            keywords="components npm json"
            onselect={() => run('open the registry')}
          />
          <CommandItem
            label="Open tokens"
            keywords="colors oklch hue"
            onselect={() => run('open tokens')}
          />
          <CommandItem
            label="Open GitHub"
            keywords="source repo"
            onselect={() => run('open github')}
          />
        </CommandGroup>
      </CommandList>
    </Command>

    <div id="command-base" data-reveal="">
      <SectionCard family="command-base" headerRegion="command-base" eyebrow="law" title="Usage">
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>

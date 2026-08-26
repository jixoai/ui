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
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Command variants" summary="Use the palette for keyboard-first actions, optional hotkeys, and batch selection."><div class="grid gap-4 sm:grid-cols-2"><div class="border border-border p-4"><Command><CommandInput placeholder="search actions" /><CommandList><CommandGroup heading="actions"><CommandItem label="Open">Open</CommandItem></CommandGroup></CommandList></Command></div><div class="border border-border p-4"><Command closeOnSelect={false}><CommandInput placeholder="batch actions" /><CommandList><CommandGroup heading="batch"><CommandItem label="Queue">Queue</CommandItem></CommandGroup></CommandList></Command></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Compose the dialog root from its input, list, groups, empty state, and items."><CodeBlock code={usage} lang="svelte" meta="Command usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The input owns focus while the active option is announced through aria-activedescendant."><A11yTable keys={[{ key: 'Arrow keys', action: 'Move through visible, enabled options.' }, { key: 'Home / End', action: 'Jump to the first or last option.' }, { key: 'Enter', action: 'Run the active option and close by default.' }, { key: 'Escape', action: 'Close the dialog and restore focus.' }]} aria={[{ name: 'role', value: 'combobox / listbox / option', description: 'Exposes the command palette interaction model.' }, { name: 'aria-activedescendant', value: 'option id', description: 'Announces the active option while input retains focus.' }, { name: 'aria-expanded', value: 'true', description: 'Indicates the open listbox state.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The palette uses shared density tokens for its input, options, and empty state."><div class="flex flex-col gap-5"><DensityDemo scopes={['xs', 'default', 'lg']}><Command><CommandInput placeholder="find" /><CommandList><CommandItem label="Open">Open</CommandItem></CommandList></Command></DensityDemo><TokenTable tokens={[{ name: '--jx-hit', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Root props control lifecycle and matching; item props provide the searchable command contract."><PropsTable title="Command" props={[{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable dialog open state.', bindable: true }, { name: 'hotkey', type: 'boolean', default: 'false', description: 'Opt into ⌘K / Ctrl+K handling.' }, { name: 'match', type: 'CommandMatch', description: 'Visibility-only matching predicate.' }, { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'Close after a successful item selection.' }, { name: 'label', type: 'string', default: "'command palette'", description: 'Accessible dialog and combobox label.' }]} /><div class="mt-5"><PropsTable title="CommandItem" props={[{ name: 'label', type: 'string', required: true, description: 'Match text and accessible name.' }, { name: 'keywords', type: 'string', description: 'Additional match text.' }, { name: 'disabled', type: 'boolean', default: 'false', description: 'Renders but never walks or activates.' }, { name: 'onselect', type: '() => void', description: 'Runs once when selected.' }]} /></div></SectionCard></div>
</div>

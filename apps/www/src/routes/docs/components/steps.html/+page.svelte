<!--
  Docs page for the steps family (composition-first-apis, 2026-08-25).
  Intents:
  1. Hero summary comes from the registry catalog (CATALOG lookup,
     fail-loud on miss — never hand-write registry copy).
  2. One ComponentCanvas: the explicit-parts composition — every
     Indicator/Title/Description/Separator is authored, never
     auto-inserted (the default-parts law).
  3. Playground protocol: the page owns the snapshot + reset; a
     segmented control drives `current`; the done-marker buttons
     navigate back; the drawer's usage file tracks the live state.
  4. Usage CodeBlock: the copyable composition sample (the canvas
     drawer shares the same string, live-tracked).
  5. State-vocabulary gallery (2026-09-01): the nine-word override
     over the derived trio — three composed Steps rows, one per state
     group. The V2-6 pass (2026-09-02) shape-separated the confusable
     pairs (done solid+✓ / pending hollow+⋯ · current solid+number /
     emphasis hollow+halo ! · disabled dashed+reduced / todo hollow)
     and every gallery description below tracks that grammar; the C-6
     ruling (2026-09-02) made each state AT-visible as sr-only text
     (the a11y table carries the row).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import Steps, {
    StepsItem,
    StepsIndicator,
    StepsTitle,
    StepsDescription,
    StepsSeparator,
  } from '$lib/ui/steps/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import stepsSource from '$lib/ui/steps/steps.svelte?raw';
  import stepsItemSource from '$lib/ui/steps/steps-item.svelte?raw';
  import stepsIndicatorSource from '$lib/ui/steps/steps-indicator.svelte?raw';
  import stepsTitleSource from '$lib/ui/steps/steps-title.svelte?raw';
  import stepsDescriptionSource from '$lib/ui/steps/steps-description.svelte?raw';
  import stepsSeparatorSource from '$lib/ui/steps/steps-separator.svelte?raw';
  import stepsCssSource from '$lib/ui/steps/steps.css?raw';
  import stepsIndexSource from '$lib/ui/steps/index.ts?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'steps');
  if (!entry) {
    throw new Error('catalog miss: "steps" has no registry meta — fix registry.json');
  }

  const close = '</' + 'script>';

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import {
    Steps,
    StepsItem,
    StepsIndicator,
    StepsTitle,
    StepsDescription,
    StepsSeparator,
  } from '@ui/steps/index';
${close}

<!-- bind:current (0-based) is the one shared state; each Item carries a
     REQUIRED explicit ordinal — state is pure step-vs-current comparison.
     onclick fires only from the done state and makes the Indicator the
     button (no handler ⇒ inert span, no dead affordance). -->
let current = \$state(1);

<Steps bind:current>
  <StepsItem step={0} label="connect" onclick={() => (current = 0)}>
    <StepsIndicator />
    <StepsTitle>connect</StepsTitle>
    <StepsDescription>link the git origin</StepsDescription>
    <StepsSeparator />
  </StepsItem>
  <StepsItem step={1}>
    <StepsIndicator />
    <StepsTitle>build</StepsTitle>
    <StepsDescription>install + typecheck</StepsDescription>
    <StepsSeparator />
  </StepsItem>
  <StepsItem step={2}>
    <StepsIndicator />
    <StepsTitle>ship</StepsTitle>
    <StepsDescription>promote to production</StepsDescription>
    <StepsSeparator />
  </StepsItem>
</Steps>`;

  // Playground protocol: the page owns the snapshot + reset; the segmented
  // control and the done markers move `current`; the drawer's usage file
  // tracks it live. PlaySegmented is string-typed, so the string option IS
  // the single source (the number is a projection).
  const canvasInitial = '1';
  let currentOption = $state(canvasInitial);
  const current = $derived(Number(currentOption));
  function resetCanvas(): void {
    currentOption = canvasInitial;
  }
  const usageLive = $derived(
    usage.replace('let current = $state(1);', `let current = $state(${current});`),
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const currentOptions = [0, 1, 2].map((value) => ({ value: String(value), label: String(value) }));
  const titles = ['connect', 'audit', 'ship'];
  const descriptions = ['link the git origin', 'typecheck + tests green', 'promote to production'];

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/steps/steps.svelte', content: stepsSource },
    { name: 'registry/files/ui/steps/steps-item.svelte', content: stepsItemSource },
    { name: 'registry/files/ui/steps/steps-indicator.svelte', content: stepsIndicatorSource },
    { name: 'registry/files/ui/steps/steps-title.svelte', content: stepsTitleSource },
    { name: 'registry/files/ui/steps/steps-description.svelte', content: stepsDescriptionSource },
    { name: 'registry/files/ui/steps/steps-separator.svelte', content: stepsSeparatorSource },
    { name: 'registry/files/ui/steps/steps.css', content: stepsCssSource },
    { name: 'registry/files/ui/steps/index.ts', content: stepsIndexSource },
    { name: 'src/lib/ui/steps-usage.svelte', content: usage, kind: 'usage' },
  ];

  // ToC outline: pairs with +page.ts, in page order.
</script>

<svelte:head>
  <title>Steps · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai steps family: bind:current plus explicit step ordinals — the derived trio is pure comparison (done/current/todo), and a nine-word STATE VOCABULARY overrides it for everything the trio cannot say: pending (the form-submitted middle state), success, error, hint, emphasis (the quest-giver !), disabled. The connector rides its own grid lane — never through the labels."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Navigation"
        title="steps — explicit ordinals, compared not registered"
        summary={entry.summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">bind:current · 0-based</span>
          <span class="pill">required <code class="text-accent">step</code> ordinals</span>
          <span class="pill">done marker = the button</span>
          <span class="pill">9-word state vocabulary</span>
          <span class="pill">connector on its own lane</span>
        </div>
      </SectionCard>
    </div>

    <div id="steps-demo" data-region="steps-demo" data-family="steps-demo" data-reveal="">
      <ComponentCanvas
        title="steps"
        stage="center"
        pane="below"
        description="Walk the wizard: click a completed step's check-marker to go back, or drive current from the playground — every Indicator, Title, Description and Separator below is authored, never auto-inserted. The pane rides BELOW the stage on this canvas: a three-column wizard row needs its full width, and the side pane would squeeze each item back into the word-waterfall."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/steps/steps.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[{ label: 'current', value: current }]}
        resolveFileContent={resolveUsage}
      >
        <!-- V2-3 demo layout: the main wizard row spans the FULL stage
             (pane=below bought the width; no max-w cap — the states
             gallery below keeps its compact max-w-2xl) -->
        <div class="w-full">
          <Steps {current}>
            {#each [0, 1, 2] as step (step)}
              <StepsItem {step} label={titles[step]} onclick={() => (currentOption = String(step))}>
                <StepsIndicator />
                <StepsTitle>{titles[step]}</StepsTitle>
                <StepsDescription>{descriptions[step]}</StepsDescription>
                <StepsSeparator />
              </StepsItem>
            {/each}
          </Steps>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="current" hint="0-based ordinal — pure comparison">
              <PlaySegmented bind:value={currentOption} options={currentOptions} />
            </PlayRow>
            <PlayHelp>
              ordinals are caller truth: duplicates paint every match current, gaps paint none —
              nothing to corrupt. The done Indicator only renders as a button when the Item has an
              onclick; future steps stay inert spans, never aria-disabled.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="states" data-reveal="">
      <SectionCard
        family="states"
        headerRegion="states"
        eyebrow="law"
        title="the state vocabulary — nine words for where a step stands"
        summary="The derived trio (done / current / todo) is pure ordinal comparison — it cannot say submitted-but-waiting, it cannot say won or lost, it cannot say look here or closed. The state prop overrides the trio with the missing words. Read it as a wizard form AND as the markers over an NPC's head: ⋯ is the quest in flight, ! is the quest-giver, ✓ is turn-in day, ✕ is the failure state."
      >
        <div class="flex flex-col gap-6">
          <div class="w-full max-w-2xl">
            <Steps current={1}>
              <StepsItem step={0} label="done"><StepsIndicator /><StepsTitle>done</StepsTitle><StepsDescription>step &lt; current · solid fill + ✓ · connector painted primary</StepsDescription><StepsSeparator /></StepsItem>
              <StepsItem step={1}><StepsIndicator /><StepsTitle>current</StepsTitle><StepsDescription>step = current · aria-current=step · solid fill + its number</StepsDescription><StepsSeparator /></StepsItem>
              <StepsItem step={2} state="pending"><StepsIndicator /><StepsTitle>pending</StepsTitle><StepsDescription>the middle state · hollow + the breathing ⋯ · submitted, in flight</StepsDescription><StepsSeparator /></StepsItem>
            </Steps>
          </div>
          <div class="w-full max-w-2xl">
            <Steps current={1}>
              <StepsItem step={0} state="success"><StepsIndicator /><StepsTitle>success</StepsTitle><StepsDescription>the terminal win · ✓ on the success pair</StepsDescription><StepsSeparator /></StepsItem>
              <StepsItem step={1} state="error"><StepsIndicator /><StepsTitle>error</StepsTitle><StepsDescription>the terminal failure · ✕ on the error pair</StepsDescription><StepsSeparator /></StepsItem>
              <StepsItem step={2} state="hint"><StepsIndicator /><StepsTitle>hint</StepsTitle><StepsDescription>informational · i on the info pair</StepsDescription><StepsSeparator /></StepsItem>
            </Steps>
          </div>
          <div class="w-full max-w-2xl">
            <Steps current={1}>
              <StepsItem step={0} state="emphasis"><StepsIndicator /><StepsTitle>emphasis</StepsTitle><StepsDescription>the quest-giver ! · hollow + halo ring · look here</StepsDescription><StepsSeparator /></StepsItem>
              <StepsItem step={1} state="disabled"><StepsIndicator /><StepsTitle>disabled</StepsTitle><StepsDescription>declared out-of-reach · dashed ring, reduced contrast, spoken "unavailable" — unlike todo (the merely unreached)</StepsDescription><StepsSeparator /></StepsItem>
              <StepsItem step={2}><StepsIndicator /><StepsTitle>todo</StepsTitle><StepsDescription>step &gt; current · hollow ring at full contrast · inert</StepsDescription></StepsItem>
            </Steps>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Step states" summary="Each item compares its explicit ordinal with current: completed, current and future are projections of one number. The explicit state prop overrides the comparison when the trio cannot say it."><div class="w-full max-w-2xl"><Steps current={1}><StepsItem step={0}><StepsIndicator /><StepsTitle>done</StepsTitle><StepsSeparator /></StepsItem><StepsItem step={1}><StepsIndicator /><StepsTitle>current</StepsTitle><StepsSeparator /></StepsItem><StepsItem step={2}><StepsIndicator /><StepsTitle>future</StepsTitle></StepsItem></Steps></div></SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard summary="The composition contract in one sample: import the family from the registry barrel (@ui/steps/index — per-part targets exist per file), give every StepsItem its explicit step ordinal, author the parts you want. The Separator self-hides on the last item through the family css — chrome, not authoring." eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'aria-current', value: 'step', description: 'Marks the current step — the derived trio and an explicit state="current" both carry it.' }, { name: 'sr-only status', value: 'per-item state text', description: 'The marker glyphs are aria-hidden chrome, so every item speaks its effective state as text (completed · current step · in progress · unavailable · …) — the vocabulary reaches AT as words.' }, { name: 'button', value: 'completed indicator', description: 'Makes completed steps keyboard actionable only when onclick is supplied; after a go-back click, focus rests on the item (tabindex=-1), never on body.' }]} /></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Steps current={0}><StepsItem step={0}><StepsIndicator /><StepsTitle>step</StepsTitle></StepsItem></Steps></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-icon', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
    <div id="api" data-reveal=""><SectionCard eyebrow="api" title="API" summary="Steps owns current (bindable); StepsItem owns the ordinal and the state vocabulary; the parts stay authored."><PropsTable props={[{ name: 'Steps.current', type: 'number', default: '0', description: '0-based current ordinal.', bindable: true }, { name: 'StepsItem.step', type: 'number', default: '—', description: 'REQUIRED explicit ordinal — compared against current.', required: true }, { name: 'StepsItem.state', type: "'auto' | 'done' | 'current' | 'todo' | 'pending' | 'success' | 'error' | 'hint' | 'emphasis' | 'disabled'", default: "'auto'", description: 'The state vocabulary: auto = the derived trio (pure comparison); the semantic overrides paint the middle state (pending ⋯), the terminals (success ✓ / error ✕), hint (i), emphasis (the quest-giver !) and disabled (dashed ring, spoken "unavailable").' }, { name: 'StepsItem.label', type: 'string', description: 'Accessible name for the done-marker button.' }, { name: 'StepsItem.onclick', type: '(e) => void', description: 'Fires only from the done state — makes the Indicator the button.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }, { name: 'class', type: 'string', description: 'Adds consumer classes.' }]} /></SectionCard></div>
  </div>
</div>

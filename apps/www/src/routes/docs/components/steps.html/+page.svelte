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
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
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
    content="The jixoai steps family (shadcn-vue Stepper anatomy): bind:current plus explicit step ordinals — state is pure comparison. Completed steps are clickable links back (the done Indicator becomes the button), the current step is aria-current=step, future steps are inert spans — never aria-disabled."
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
          <span class="pill">future inert · never aria-disabled</span>
        </div>
      </SectionCard>
    </div>

    <div id="steps-demo" data-region="steps-demo" data-family="steps-demo" data-reveal="">
      <ComponentCanvas
        title="steps"
        stage="center"
        description="Walk the wizard: click a completed step's check-marker to go back, or drive current from the playground — every Indicator, Title, Description and Separator below is authored, never auto-inserted."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/steps/steps.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[{ label: 'current', value: current }]}
        resolveFileContent={resolveUsage}
      >
        <div class="w-full max-w-2xl">
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

    <div id="steps-base" data-reveal="">
      <SectionCard
        family="steps-base"
        headerRegion="steps-base"
        eyebrow="law"
        title="Usage"
        summary="The composition contract in one sample: import the family from the registry barrel (@ui/steps/index — per-part targets exist per file), give every StepsItem its explicit step ordinal, author the parts you want. The Separator self-hides on the last item through the family css — chrome, not authoring."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>

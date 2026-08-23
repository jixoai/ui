<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Steps from '$lib/ui/steps.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import stepsSource from '$lib/ui/steps.svelte?raw';

  // ToC outline: the live demo band + the usage closing section.
  const tocSections = [
    { id: 'steps-demo', label: 'live demo' },
    { id: 'steps-base', label: 'usage' },
  ];

  const steps = [{ title: 'connect' }, { title: 'audit' }, { title: 'ship' }];

  // Playground protocol: the page owns the snapshot + reset; echo projects
  // the current step; the drawer's usage file tracks it live.
  const canvasInitial = { current: 1 };
  let current = $state(canvasInitial.current);
  function resetCanvas(): void {
    current = canvasInitial.current;
  }
  const usageLive = $derived(`<Steps steps={[{ title: 'connect' }, { title: 'audit' }, { title: 'ship' }]}
  current={${current}}
  onstepclick={(i) => (current = i)} />`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Steps from '@ui/steps.svelte';
${close}

<Steps steps={[{ title: 'connect' }, { title: 'audit' }, { title: 'ship' }]}
  current={1} onstepclick={(i) => go(i)} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/steps.svelte', content: stepsSource },
    { name: 'src/lib/ui/steps-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Steps · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai steps: the wizard ol — completed steps are clickable links back (the user already owns that state), the current step is aria-current=step, future steps are inert spans never aria-disabled."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · antd 裁决"
      title="steps — completed steps are links back"
      summary="The wizard ol, ruled the antd-verdict way: an ordered list is already the contract, so the component only paints it. Completed steps render as buttons (the user already owns that state — going back is navigation, not mutation), the current step carries aria-current=step, and future steps stay inert spans — never aria-disabled, because a step you cannot reach yet is not a disabled control, it is a place you have not arrived. The check-marker only renders as a button when onstepclick exists: no handler, no dead affordance."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">clickable completed steps</span>
        <span class="pill">aria-current=step</span>
        <span class="pill">future steps stay inert</span>
        <span class="pill">no dead affordances</span>
      </div>
    </SectionCard>
  </div>

  <div id="steps-demo" data-region="steps-demo" data-family="steps-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="steps"
      description="Walk the wizard: click a completed step's check-marker to go back, or reset and climb again — the current step is the one the marker sits on."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/steps.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'current', value: current }]}
      resolveFileContent={resolveUsage}
    >
      <div class="w-full max-w-2xl">
        <Steps {steps} current={current} onstepclick={(i) => (current = i)} />
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <p class="jx-play-help">
            click the check-marker of a COMPLETED step to go back (it only renders as a button when
            onstepclick exists — no dead affordances); future steps stay inert spans.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="steps-base" data-reveal="" use:reveal>
    <SectionCard
      family="steps-base"
      headerRegion="steps-base"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

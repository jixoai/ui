<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Steps from '$lib/ui/steps.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import stepsSource from '$lib/ui/steps.svelte?raw';

  const steps = [{ title: 'connect' }, { title: 'audit' }, { title: 'ship' }];
  let current = $state(1);

  const close = '</' + 'script>';

  const usage = `<Steps steps={[{ title: 'connect' }, { title: 'audit' }, { title: 'ship' }]}
  current={1} onstepclick={(i) => go(i)} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/steps.svelte', content: stepsSource },
  ];
</script>

<svelte:head>
  <title>Steps · jixoai-ui</title>
  <meta name="description" content="The wizard ol: completed steps are clickable (the user already owns that state), the current step is aria-current=step, future steps are inert — never aria-disa" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="steps — completed steps are links back" summary="The wizard ol: completed steps are clickable (the user already owns that state), the current step is aria-current=step, future steps are inert — never aria-disabled.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="steps"
      description="steps — completed steps are links back"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/steps.svelte"
      files={canvasFiles}
    >
      <div class="w-full max-w-2xl">
        <Steps {steps} current={current} onstepclick={(i) => (current = i)} />
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          click the check-marker of a COMPLETED step to go back (it only renders as a button when onstepclick exists — no dead affordances); future steps stay inert spans.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="steps-base" eyebrow="antd 裁决" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>

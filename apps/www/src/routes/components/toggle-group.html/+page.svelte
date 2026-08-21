<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import ToggleGroup from '$lib/ui/toggle-group.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import toggleGroupSource from '$lib/ui/toggle-group.svelte?raw';

  let single = $state<string>('');
  let many = $state<string[]>([]);

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import ToggleGroup from '@ui/toggle-group.svelte';
${close}

<ToggleGroup name="align" type="single" label="alignment" options={[
  { value: 'left', label: 'left' },
  { value: 'center', label: 'center' },
  { value: 'right', label: 'right' },
]} />

<ToggleGroup name="style" type="multiple" label="text style" options={[…]} />`;

  const canvasUsage = `<ToggleGroup name="align" type="single" label="alignment" {options} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/toggle-group.svelte', content: toggleGroupSource },
    { name: 'src/lib/ui/toggle-group-usage.svelte', content: canvasUsage },
  ];

  const align = [
    { value: 'left', label: 'left' },
    { value: 'center', label: 'center' },
    { value: 'right', label: 'right' },
  ];
  const style = [
    { value: 'bold', label: 'bold' },
    { value: 'italic', label: 'italic' },
    { value: 'underline', label: 'underline' },
  ];
</script>

<svelte:head>
  <title>Toggle group · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toggle group: joined buttons submitting as one form field — single picks a value, multiple submits one FormData entry per press through the bridge's multivalue mode."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ElementInternals"
      title="toggle-group — pressed states, one field"
      summary="A row of press-state buttons that submits as ONE form field. single presses one button ('' when none); multiple presses several — the bridge's multivalue mode submits one FormData entry per active value, the checkbox-set contract, never a CSV. role=group + aria-pressed for both modes; arrow-walking is tabs' job, not a toggle set's."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">aria-pressed</span>
        <span class="pill">multivalue bridge</span>
        <span class="pill">FormData multi-entry</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="toggle-group"
      description="Single swaps; multiple stacks — the bound values surface below each row."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/toggle-group.svelte"
      files={canvasFiles}
    >
      <div class="flex flex-col items-start gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <ToggleGroup name="demo-align" type="single" label="alignment" options={align} bind:value={single} />
          <span class="text-muted-foreground text-[12.5px]">
            value: <code class="text-accent">{single || '—'}</code>
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <ToggleGroup name="demo-style" type="multiple" label="text style" options={style} bind:value={many} />
          <span class="text-muted-foreground text-[12.5px]">
            values: <code class="text-accent">{many.length ? many.join(', ') : '—'}</code>
          </span>
        </div>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          buttons carry Space/Enter natively and Tab walks the row; per-button content composes
          through the item snippet. disabled on an option dims only that button.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="tgroup-base" eyebrow="ElementInternals 桥" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>

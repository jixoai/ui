<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Input from '$lib/ui/input.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import componentCanvasSource from '$lib/ui/component-canvas.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import ComponentCanvas from '@ui/component-canvas.svelte';
  import PressButton from '@ui/press-button.svelte';
  import Select from '@ui/select.svelte';
${close}

let variant = $state<'primary' | 'outline'>('primary');
${close}

<!-- files: flat TreeFile list; paths split on "/" build the tree levels -->
<ComponentCanvas
  title="press-button"
  description="hover lifts, active presses."
  sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/press-button.svelte"
  files={[{ name: 'src/lib/ui/usage.svelte', content: usage }]}
>
  <PressButton {variant}>deploy</PressButton>
  {#snippet playground()}
    <Select label="variant">
      <option value="primary">primary</option>
      <option value="outline">outline</option>
    </Select>
  {/snippet}
</ComponentCanvas>`;

  const files = [
    { name: 'registry/files/ui/component-canvas.svelte', content: componentCanvasSource },
    { name: 'src/lib/ui/component-canvas-usage.svelte', content: usage },
  ];

  // Inner (second-level) canvas: one tiny file for its drawer, a PressButton
  // for its LIVE stage. Recursion demo only — see the markup comment below.
  const innerUsage = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
${close}

<!-- one physics for every variant: hover lifts, active presses -->
<PressButton variant="primary">deploy</PressButton>`;

  const innerFiles = [{ name: 'src/lib/ui/press-button-usage.svelte', content: innerUsage }];

  // Playground: toggles the inner canvas's optional Playground pane.
  let innerPlayground = $state(false);
</script>

<svelte:head>
  <title>component-canvas · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai component-canvas component: the documentation workbench — a LIVE demo stage, an optional Playground controls pane, and a collapsible code drawer combining tree-view with code-card. This page renders it recursively: the LIVE stage holds a simplified second canvas, capped at depth two."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <!-- page head -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Display"
      title="component-canvas — the documentation workbench"
      summary="One bordered surface per component: header (font-nav title, description, Source press button), a LIVE demo stage on the muted tint so components prove themselves on a differently-toned ground, an optional Playground pane of consumer-authored controls, and a collapsible code drawer pairing the tree-view file tree with code-card highlighting. Every component page on this site is one canvas — this one renders the component inside itself."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">LIVE stage · muted tint</span>
        <span class="pill">playground pane</span>
        <span class="pill">tree-view × code-card drawer</span>
        <span class="pill">recursion · depth 2</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the recursive demo -->
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="component-canvas"
      description="The canvas rendering a canvas: the LIVE stage below embeds a simplified second instance. The Playground checkbox toggles the inner pane."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/component-canvas.svelte"
      {files}
    >
      <!-- Recursion demo, capped at depth 2: the inner canvas is simplified —
           its LIVE stage holds only a PressButton (never a third canvas) and
           its code drawer keeps a single tiny file and stays closed in the
           demo. Unbounded nesting would recurse forever, so the composition
           law is: a canvas may showcase a canvas exactly one level down. -->
      <div class="w-full max-w-[38rem]">
        <ComponentCanvas
          title="press-button"
          description="The inner canvas — a simplified instance living in the outer LIVE stage."
          sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/press-button.svelte"
          files={innerFiles}
        >
          <PressButton variant="primary">deploy</PressButton>
          {#if innerPlayground}
            {#snippet playground()}
              <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
                The optional Playground pane — absent by default, present only when the consumer
                authors it. Toggled from the outer canvas controls.
              </p>
            {/snippet}
          {/if}
        </ComponentCanvas>
      </div>
      {#snippet playground()}
        <Input
          type="checkbox"
          label="inner playground pane"
          labelSide="right"
          checked={innerPlayground}
          onchange={(event) => {
            innerPlayground = event.currentTarget.checked;
          }}
        />
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          The pane is a passed snippet: absent when unauthored, so the stage takes the full width —
          exactly the toggle this control flips inside the second-level canvas.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>

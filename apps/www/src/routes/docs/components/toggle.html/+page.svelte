<!--
  toggle — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the toggle block of the pure-CSS
  selectors section + its role in the submitted example form. The
  form.html route remains as the family hub.
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Toggle from '$lib/ui/toggle/toggle.svelte';
  import { CATALOG } from '$lib/catalog';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'toggle')?.summary;
  if (!heroSummary) throw new Error('catalog entry "toggle" is missing — registry.json meta drift');

  // ToC outline: the two demo sections, in page order. The engine pairs
  // these ids with the SectionCard data-family extents + header
  // data-region leaves rendered in this page.

  const usage = `<!-- label reads on the LEFT of the control; checked is $bindable -->
<Toggle label="notifications" bind:checked />

<!-- density controls the rail through the shared control aliases -->
<Toggle label="compact" density="sm" />
<Toggle label="roomy" density="lg" />`;

  // ---- demo state ------------------------------------------------------------
  let notifications = $state(true);

  // ---- form participation demo (from the family example form) ---------------
  // The one controlled field in the example form: bindable checked that
  // still submits a name/value pair into FormData at the end.
  let beta = $state(false);
  let result = $state<{ outputs: string[] } | null>(null);

  function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const outputs: string[] = [];
    for (const [key, value] of data) {
      if (typeof value === 'string' && value !== '') outputs.push(`${key}: ${value}`);
    }
    outputs.push('form submitted ✓');
    result = { outputs };
  }
</script>

<svelte:head>
  <title>Toggle · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toggle component: a checkbox in inline-end posture — label on the left, a rounded rail on the right, a slide instead of a glyph. A visually-hidden checkbox drives the rail through the sibling selector; sizes keep the rail proportional (sm 28×16, md 36×20, lg 44×24); checked is $bindable."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail (2026-08-20): aside precedes main content in the DOM —
       desktop sticky right column, mobile the glass single-row bar pinned
       under the scaffold header (height 0, see toc.css); the content
       column reserves the rail clearance with its mobile top padding -->

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="toggle — checkbox in inline-end posture"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">pure CSS · zero icon deps</span>
        <span class="pill">knob slide · 200ms</span>
        <span class="pill">sm / md / lg rails</span>
        <span class="pill">checked is $bindable</span>
        <span class="pill">label[for] + aria wiring</span>
      </div>
    </SectionCard>
  </div>

  <!-- the selectors, redrawn in pure CSS -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="toggle"
      title="The selector, redrawn in pure CSS"
      summary="A control where the paint deserved its own drawing code — the label reads on the left, the control lands on the right. Zero icon fonts, zero SVG, zero dependencies; the native input underneath keeps form participation, keyboard toggling, and :checked state."
    >
      <div class="flex flex-col gap-5">
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          A visually-hidden checkbox drives a rounded rail through the sibling selector:
          unchecked is a muted rail with a muted-foreground knob; checked slides the knob by
          <code class="text-accent">width − height</code> (16px at md) over a primary rail —
          200ms cubic-bezier(0.22, 1, 0.36, 1). Sizes keep the rail proportional:
          sm 28×16, md 36×20, lg 44×24.
        </p>
        <CardGrid min="220px">
          <div class="demo-cell flex items-center gap-3" data-no-subgrid>
            <Toggle label="xs" name="demo_tg" density="xs" />
          </div>
          <div class="demo-cell flex items-center gap-3" data-no-subgrid>
            <Toggle label="default" name="demo_tg" />
          </div>
          <div class="demo-cell flex items-center gap-3" data-no-subgrid>
            <Toggle label="lg" name="demo_tg" density="lg" checked />
          </div>
          <div class="demo-cell flex items-center gap-3" data-no-subgrid>
            <Toggle label="disabled" name="demo_tg2" disabled />
          </div>
          <div class="demo-cell flex items-center gap-3" data-no-subgrid>
            <Toggle label="notifications" name="demo_tg3" bind:checked={notifications} />
            <span class="text-muted-foreground font-mono text-[12px]">
              checked: {String(notifications)}
            </span>
          </div>
        </CardGrid>
        <CodeBlock code={usage} lang="svelte" meta="Toggle usage" />
      </div>
    </SectionCard>
  </div>

  <!-- in a submitted form (from the family example form) -->
  <div id="in-a-form" data-reveal="">
    <SectionCard
      family="in-a-form"
      headerRegion="in-a-form"
      eyebrow="composition"
      title="In a submitted form"
      summary="The one controlled field shape in the example form: the binding drives UI state live while the underlying checkbox still submits its name/value pair into FormData — checked contributes the value, unchecked contributes nothing."
    >
      <div class="grid gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form class="flex flex-col gap-4" aria-label="beta channel" onsubmit={onSubmit}>
          <Toggle label="join the beta channel" name="beta" value="yes" bind:checked={beta} />
          <span class="text-muted-foreground text-[12.5px]">
            bound checked: <code class="text-accent">{String(beta)}</code> — the value rides into
            FormData as <code class="text-accent">beta=yes</code> only when on
          </span>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <PressButton type="submit" variant="fill">sign up</PressButton>
          </div>
        </form>
        <div>
          {#if result}
            {#key result}
              <TerminalCard
                barTitle="form — zsh"
                command="form.submit"
                outputs={result.outputs}
              />
            {/key}
          {:else}
            <div class="border-border bg-muted/40 text-muted-foreground flex h-full min-h-40 flex-col items-center justify-center gap-2 border p-6 text-center text-[13px]">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">awaiting submit</span>
              <span>flip the toggle and press <code class="text-accent">sign up</code> — the FormData payload prints here</span>
            </div>
          {/if}
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Toggle variants" summary="Choose a density for rail geometry, then bind checked when state must stay in sync."><div class="grid gap-4 sm:grid-cols-3"><div class="border border-border p-4"><Toggle label="off" name="types-off" /></div><div class="border border-border p-4"><Toggle label="on" name="types-on" checked /></div><div class="border border-border p-4"><Toggle label="disabled" name="types-disabled" disabled /></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Use bind:checked for controlled state; a named toggle remains a native checkbox field in forms."><CodeBlock code={usage} lang="svelte" meta="Toggle usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The hidden native checkbox stays keyboard reachable and the visible rail receives the focus indication."><A11yTable keys={[{ key: 'Space', action: 'Toggle the focused switch' }, { key: 'Tab', action: 'Move focus to or past the switch' }]} aria={[{ name: 'role', value: 'checkbox', description: 'Native input semantics are preserved' }, { name: 'aria-checked', value: 'native', description: 'State is exposed by the checkbox input' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The shared density scope controls label rhythm and the proportional rail geometry."><div class="flex flex-col gap-5"><DensityDemo><Toggle label="density sample" name="density-toggle" /></DensityDemo><TokenTable tokens={[{ name: '--jx-toggle-track', default: 'var(--jx-line)', source: 'component' }, { name: '--jx-toggle-width', default: 'calc(var(--jx-toggle-track) * 2)', source: 'component' }, { name: '--jx-toggle-knob', default: 'calc(var(--jx-toggle-track) - var(--jx-unit))', source: 'component' }, { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' }, { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props extend native HTML input attributes; these additions define the toggle contract."><PropsTable props={[{ name: 'checked', type: 'boolean', default: 'false', description: 'Bindable on/off state.', bindable: true }, { name: 'label', type: 'string', default: '—', description: 'Text rendered before the rail.' }, { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction and mutes the control.' }, { name: 'density', type: 'Density', default: 'inherited', description: 'Overrides the inherited density scope.' }, { name: 'name', type: 'string', default: '—', description: 'Form field name passed to the native input.' }]} /></SectionCard></div>
</div>

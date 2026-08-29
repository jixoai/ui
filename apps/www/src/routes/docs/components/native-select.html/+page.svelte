<!--
  native-select — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the NativeSelect demos of the
  select-textarea catalogue + the native-first split story + its role as
  the submitted select in the example form. The form.html route remains
  as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'native-select')?.summary;
  if (!heroSummary) throw new Error('catalog entry "native-select" is missing — registry.json meta drift');

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const usage = `<!-- the simple-scenario select: a real name/value pair in FormData,
     the platform's overlay picker on touch -->
<NativeSelect label="plan" name="plan">
  <option value="free">free</option>
  <option value="pro">pro</option>
</NativeSelect>

<!-- multiple renders the native list-box geometry -->
<NativeSelect label="targets" name="targets" multiple>
  <option value="linux">linux</option>
  <option value="macos">macos</option>
</NativeSelect>`;

  const errorUsage = `<NativeSelect label="plan" error="plan is required">
  <option value="">— choose —</option>
  <option value="free">free</option>
</NativeSelect>

<!-- error wiring, the family law:
  · aria-invalid="true" on the control
  · aria-describedby → the "! message" line
  · border-style: dashed on the shell (monochrome invalid signal —
    the one-hue law has no error red) -->`;

  // ---- bound-value demo state -------------------------------------------------
  let runtimeNative = $state('node');

  // ---- form participation demo (from the family example form) ---------------
  // NativeHTML end to end: the name/value pair is the point — FormData
  // read once at submit, replayed into the terminal card per {#key}.
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
  <title>Native select · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai native-select component: the original native <select> with appearance-none and a self-drawn chevron — the simple-scenario recommendation (real FormData pair, mobile overlay picker). The native-first split against the popover Select, multiple list-box mode, and the family label/error contract."
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
      title="native-select — the platform popup, kept"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">real FormData pair</span>
        <span class="pill">mobile overlay picker</span>
        <span class="pill">appearance-none repaint</span>
        <span class="pill">multiple list-box mode</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- native first -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="native-select"
      title="Native first — the default you should ship"
      summary="A real <select> whose popup list, keyboard, and type-ahead belong to the platform. The repaint touches only the closed control: appearance-none plus an inline SVG chevron, absolutely positioned and pointer-events: none. It rides into FormData with a name/value pair and gets the OS overlay picker on mobile."
    >
      <div class="flex flex-col gap-5">
        <CardGrid min="230px">
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <NativeSelect
              label="runtime — native popup"
              name="cmp_runtime"
              value={runtimeNative}
              onchange={(event) => (runtimeNative = event.currentTarget.value)}
            >
              <option value="node">node</option>
              <option value="bun">bun</option>
              <option value="deno">deno</option>
            </NativeSelect>
            <span class="text-muted-foreground text-[12.5px]">
              platform popup · FormData-ready · bound value:
              <code class="text-accent">{runtimeNative}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <NativeSelect label="disabled" name="demo_select_disabled" disabled>
              <option>frozen</option>
            </NativeSelect>
            <span class="text-muted-foreground text-[12.5px]">
              the whole control freezes — options and all
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <NativeSelect label="multiple (list box)" name="demo_targets" multiple>
              <option value="linux">linux</option>
              <option value="macos">macos</option>
              <option value="windows">windows</option>
            </NativeSelect>
            <span class="text-muted-foreground text-[12.5px]">
              native list-box geometry · ctrl/cmd multi-selects
            </span>
          </div>
        </CardGrid>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          When the native popup can't say what you need — per-option descriptions, a painted
          panel, roving highlight — reach for the rich sibling:
          <a class="text-accent underline decoration-dotted underline-offset-4" href="/docs/components/select.html">select</a>
          builds the same trigger paint on a popover listbox. The split changes nothing
          semantically: both carry <code class="text-accent">label[for]</code> and the family
          error law.
        </p>
        <CodeBlock code={usage} lang="svelte" meta="NativeSelect usage" />
      </div>
    </SectionCard>
  </div>

  <!-- label + error wiring -->
  <div id="error-wiring" data-reveal="">
    <SectionCard
      family="error-wiring"
      headerRegion="error-wiring"
      eyebrow="law"
      title="label + error wiring"
      summary="The error prop is pure semantics: it sets aria-invalid='true', wires aria-describedby to the “! message” line, and dashes the shell border — a monochrome invalid signal, because the one-hue law has no error red."
    >
      <div class="flex flex-col gap-5">
        <NativeSelect label="plan" error="plan is required">
          <option value="">— choose —</option>
          <option value="free">free</option>
        </NativeSelect>
        <CodeBlock code={errorUsage} lang="svelte" meta="error" />
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
      summary="NativeSelect is the select in a submitted form — its name/value pair is the point. Uncontrolled field, native constraint validation (the required bubble belongs to the platform), FormData read once at submit."
    >
      <div class="grid gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form class="flex flex-col gap-4" aria-label="plan" onsubmit={onSubmit}>
          <NativeSelect label="plan" name="plan" required>
            <option value="">— choose a plan —</option>
            <option value="free">free — community</option>
            <option value="pro">pro — dedicated backend</option>
          </NativeSelect>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <PressButton type="submit" variant="fill">sign up</PressButton>
            <span class="text-muted-foreground text-[12.5px]">
              required fields use native validation — try submitting empty
            </span>
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
              <span>choose a plan and press <code class="text-accent">sign up</code> — the FormData payload prints here</span>
            </div>
          {/if}
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<!-- Material3 standard sections (2026-08-26): types / usage / a11y /
     theming / api appended after the demo sections, same wrapper law as
     checkbox.html. -->
<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="NativeSelect variants"
      summary="The single popup select, the multiple list-box posture, the error state, and the disabled field."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="border border-border p-4">
          <NativeSelect label="single" name="types-single">
            <option value="node">node</option>
            <option value="bun">bun</option>
            <option value="deno">deno</option>
          </NativeSelect>
        </div>
        <div class="border border-border p-4">
          <NativeSelect label="multiple (list box)" name="types-multiple" multiple>
            <option value="linux">linux</option>
            <option value="macos">macos</option>
            <option value="windows">windows</option>
          </NativeSelect>
        </div>
        <div class="border border-border p-4">
          <NativeSelect label="error" name="types-error" error="plan is required">
            <option value="">— choose —</option>
            <option value="free">free</option>
          </NativeSelect>
        </div>
        <div class="border border-border p-4">
          <NativeSelect label="disabled" name="types-disabled" disabled>
            <option>frozen</option>
          </NativeSelect>
        </div>
      </div>
    </SectionCard>
  </div>
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Options arrive as <option>/<optgroup> children; the popup, keyboard navigation, and type-ahead stay the platform's."
    >
      <CodeBlock code={usage} lang="svelte" meta="NativeSelect usage" />
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The native select keeps every platform behavior; the component wires the label and the validation message to the control."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the select' },
          { key: '↑ / ↓', action: 'Steps through options in the platform popup' },
          { key: 'type-ahead', action: 'Jumps to the option starting with the typed text' },
          { key: 'Ctrl / Cmd', action: 'Multi-selects rows in the multiple list-box mode' },
        ]}
        aria={[
          { name: 'aria-invalid', value: "'true'", description: 'Set on the native select when the error prop is provided' },
          { name: 'aria-describedby', value: '{id}-error', description: 'Points at the "! message" validation line' },
        ]}
      />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="The closed-control shell, chevron, and label rhythm are density-scope tokens; resize the scope and the whole field follows (the popup stays the platform's)."
    >
      <div class="flex flex-col gap-6">
        <DensityDemo>
          <NativeSelect label="density sample" name="density-native-select">
            <option value="node">node</option>
            <option value="bun">bun</option>
            <option value="deno">deno</option>
          </NativeSelect>
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' },
          ]}
        />
      </div>
    </SectionCard>
  </div>
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Props extend the native HTML select attributes; the entries below are the component-owned additions. Everything else (name, disabled, required, multiple, size…) rides through restProps."
    >
      <PropsTable
        props={[
          { name: 'children', type: 'Snippet', default: '—', description: 'The <option> / <optgroup> list, authored by the caller.', required: true },
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the control.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid, wires aria-describedby, dashes the shell.' },
          { name: 'value', type: 'string | string[]', default: '—', description: 'Bindable; bound ⇒ controlled two-way, absent ⇒ uncontrolled native select.', bindable: true },
          { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: 'inherited', description: 'Overrides the inherited density scope.' },
        ]}
      />
    </SectionCard>
  </div>
</div>

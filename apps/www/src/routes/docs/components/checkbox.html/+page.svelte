<!--
  checkbox — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the checkbox block of the pure-CSS
  selectors section + its role in the submitted example form. The
  form.html route remains as the family hub.
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import { CATALOG } from '$lib/catalog';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'checkbox')?.summary;
  if (!heroSummary) throw new Error('catalog entry "checkbox" is missing — registry.json meta drift');

  // ToC outline: the two demo sections, in page order. The engine pairs
  // these ids with the SectionCard data-family extents + header
  // data-region leaves rendered in this page.

  const usage = `<!-- label on inline-start (default); labelSide flips it -->
<Checkbox label="subscribe" name="subscribe" />
<Checkbox label="select all" name="all" indeterminate />
<Checkbox label="terms" name="consent" labelSide="left" required />

<!-- error wiring: aria-invalid + describedby + dashed border -->
<Checkbox label="consent" error="consent is required" />`;

  // ---- form participation demo (from the family example form) ---------------
  // NativeHTML end to end: uncontrolled checkbox, native constraint
  // validation, FormData read once at submit. The terminal card replays
  // per submit via {#key}.
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
  <title>Checkbox · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai checkbox component: pure-CSS selector — appearance-none + 16px square, :checked fills primary with a clip-path checkmark, :indeterminate morphs to a bar, error wiring (aria-invalid + describedby + dashed shell). The native input keeps form participation, keyboard toggling, and state."
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
      title="checkbox — 16px square, clip-path glyph"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">pure CSS · zero icon deps</span>
        <span class="pill">:checked morph</span>
        <span class="pill">:indeterminate dash</span>
        <span class="pill">labelSide left / right</span>
        <span class="pill">label[for] + aria wiring</span>
      </div>
    </SectionCard>
  </div>

  <!-- the selectors, redrawn in pure CSS -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="checkbox"
      title="The selector, redrawn in pure CSS"
      summary="A control where the paint deserved its own drawing code: the component strips appearance off the native input and draws its glyph with pseudo-elements — a clip-path check on a 45°-rotated box. Zero icon fonts, zero SVG, zero dependencies; the native input underneath keeps form participation, keyboard toggling, and :checked/:indeterminate state."
    >
      <div class="flex flex-col gap-5">
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          :checked fills the primary and grows the white check out of a collapsed polygon
          (150ms ease-out); :indeterminate rotates the same box back to 0° and morphs it into
          a dash — one pseudo-element, six vertices in every state, so CSS interpolates the
          morph. Hover leans the unchecked border toward primary; error dashes the border.
        </p>
        <CardGrid min="200px">
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="unchecked" name="demo_cb" />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="checked" name="demo_cb" checked />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="indeterminate" name="demo_cb" indeterminate />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="label left" name="demo_cb" labelSide="left" />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="disabled" name="demo_cb" disabled />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="error" name="demo_cb" error="consent is required" />
          </div>
        </CardGrid>
        <CodeBlock code={usage} lang="svelte" meta="Checkbox usage" />
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
      summary="Uncontrolled field, native constraint validation (the required bubble belongs to the platform), FormData read once at submit — the checked box contributes its name/value pair, an unchecked one contributes nothing."
    >
      <div class="grid gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form class="flex flex-col gap-4" aria-label="consent" onsubmit={onSubmit}>
          <Checkbox label="I agree to the terminal printing my answers" name="consent" value="yes" required />
          <Checkbox label="join the newsletter" name="news" value="yes" />
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <PressButton type="submit" variant="primary">sign up</PressButton>
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
              <span>check a box and press <code class="text-accent">sign up</code> — the FormData payload prints here</span>
            </div>
          {/if}
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

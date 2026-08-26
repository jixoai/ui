<!--
  textarea — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the textarea half of the
  select-textarea catalogue + the textarea half of the slot system
  (toolbar/count rows) + the error law. The form.html route remains
  as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Textarea from '$lib/ui/textarea/textarea.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'textarea')?.summary;
  if (!heroSummary) throw new Error('catalog entry "textarea" is missing — registry.json meta drift');

  // ToC outline: the three demo sections, in page order. The engine pairs
  // these ids with the SectionCard data-family extents + header
  // data-region leaves rendered in this page.

  const usage = `<Textarea label="notes" rows={5} maxlength={280} />

<!-- rows pass through (default 4); resize locks to the vertical axis;
     every other attribute rides through restProps -->
<Textarea label="bio" rows={3} placeholder="multiline, maxlength rides through…" maxlength={280} />`;

  const slotUsage = `<!-- textarea · 6 slots — inner rows sit behind 1px hairlines -->
<Textarea label="notes" rows={6} maxlength={280} count bind:value={text}>
  {#snippet innerBlockStart()}<span>bold</span><span>italic</span>{/snippet}
  {#snippet innerBlockEnd()}<span>draft</span>{/snippet}
</Textarea>`;

  const errorUsage = `<Textarea label="bio" error="bio is required" rows={2}></Textarea>

<!-- error wiring, the family law:
  · aria-invalid="true" on the control
  · aria-describedby → the "! message" line
  · border-style: dashed on the shell (monochrome invalid signal —
    the one-hue law has no error red) -->`;

  // ---- slot system demo state (controlled textarea) -------------------------
  let notes = $state('spawn a durable shell');
</script>

<svelte:head>
  <title>Textarea · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai textarea component: the same text-shell law as input with resize locked to the vertical axis — rows pass-through (default 4), six slot seams (toolbar and status rows behind 1px hairlines), count for an N / maxLength readout, and the family label/error contract."
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
      title="textarea — the multiline text shell"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">resize: vertical</span>
        <span class="pill">toolbar + status slot rows</span>
        <span class="pill">count readout</span>
        <span class="pill">label[for] + aria wiring</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- base shell -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="textarea"
      title="The shell, unchanged from input"
      summary="Same 1px border, radius 0, hover lift, and inset focus outline as the input shell — only taller. rows passes through verbatim (default 4), maxlength rides through restProps, and resize locks to the vertical axis so the box law survives the drag."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <Textarea
            label="textarea (resize: vertical)"
            name="demo_notes"
            rows={5}
            placeholder="multiline, rows={5}, maxlength rides through restProps…"
            maxlength={280}
          />
          <Textarea
            label="rows 3"
            name="demo_notes3"
            rows={3}
            placeholder="rows passes through verbatim…"
          />
        </div>
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <!-- slot system (textarea half) -->
  <div id="slots" data-reveal="">
    <SectionCard
      family="slots"
      headerRegion="slots"
      eyebrow="textarea"
      title="Slot system — toolbar + status rows"
      summary="textarea adds inner-block-start / inner-block-end behind 1px hairlines for toolbar and status rows, plus count for an N / maxLength readout. The shell owns border, background, hover, and the inset focus outline, so slot content never repaints the box law — and value is $bindable: a bound field turns controlled, an unbound one stays purely uncontrolled (FormData and form.reset untouched)."
    >
      <div class="flex flex-col gap-5">
        <Textarea
          label="notes (toolbar + count)"
          name="slot_notes"
          rows={6}
          maxlength={280}
          count
          bind:value={notes}
        >
          {#snippet innerBlockStart()}
            <span>bold</span>
            <span>italic</span>
            <span>code</span>
            <span>link</span>
          {/snippet}
          {#snippet innerBlockEnd()}<span>draft — autosaves on blur</span>{/snippet}
        </Textarea>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Slot content lands muted at 0.75rem behind the hairline rows; the wrapper is scoped,
          so override it with an important utility
          (<code class="text-accent">text-foreground!</code>) or an inline style. The count
          readout lives in the status row — <code class="text-accent">N / maxLength</code>,
          computed off the bound value, never a second source of truth.
        </p>
        <CodeBlock code={slotUsage} lang="svelte" meta="slots" />
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
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <Textarea label="bio" error="bio is required" rows={2}></Textarea>
          <Textarea label="notes" name="demo_err_notes" rows={2} placeholder="optional…" />
        </div>
        <CodeBlock code={errorUsage} lang="svelte" meta="error" />
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
      title="Textarea variants"
      summary="The plain shell, the toolbar + count posture, the error state, and the disabled field."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="border border-border p-4"><Textarea label="plain" name="types-plain" rows={3} placeholder="multiline…" /></div>
        <div class="border border-border p-4"><Textarea label="count" name="types-count" rows={3} maxlength={280} count placeholder="N / maxLength readout…" /></div>
        <div class="border border-border p-4"><Textarea label="error" name="types-error" rows={2} error="bio is required"></Textarea></div>
        <div class="border border-border p-4"><Textarea label="disabled" name="types-disabled" rows={2} placeholder="not allowed" disabled /></div>
      </div>
    </SectionCard>
  </div>
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="rows and every other native attribute pass through; the component adds the label/error contract, the hairline slot rows, and the count readout."
    >
      <CodeBlock code={usage} lang="svelte" meta="Textarea usage" />
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The native textarea keeps platform semantics; the component wires the label and the validation message to the control."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the textarea' },
          { key: 'any text', action: 'Types into the field' },
          { key: 'drag', action: 'Resize handle, locked to the vertical axis' },
        ]}
        aria={[
          { name: 'aria-invalid', value: "'true'", description: 'Set on the native textarea when the error prop is provided' },
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
      summary="The shell, lane padding, and label/error rhythm are pure density-scope tokens; resize the scope and the whole field stack follows."
    >
      <div class="flex flex-col gap-6">
        <DensityDemo>
          <Textarea label="density sample" name="density-textarea" rows={3} placeholder="Type here..." />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-stack', default: '4 / 4 / 8 / 8px', source: 'density' },
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
      summary="Props extend the native HTML textarea attributes; the entries below are the component-owned additions. Everything else (placeholder, maxlength, disabled, name, required…) rides through restProps."
    >
      <PropsTable
        props={[
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the control.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid, wires aria-describedby, dashes the shell.' },
          { name: 'count', type: 'boolean', default: 'false', description: 'Appends an "N / maxLength" readout to the inner-block-end row.' },
          { name: 'rows', type: 'number', default: '4', description: 'Native rows attribute, passed through verbatim.' },
          { name: 'value', type: 'string | number', default: '—', description: 'Bindable; bound ⇒ controlled, absent ⇒ purely uncontrolled.', bindable: true },
          { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: 'inherited', description: 'Overrides the inherited density scope.' },
          { name: 'innerBlockStart', type: 'Snippet', default: '—', description: 'Inside the shell, above the textarea (toolbar row, behind a hairline).' },
          { name: 'innerBlockEnd', type: 'Snippet', default: '—', description: 'Inside the shell, below the textarea (status row).' },
          { name: 'outerBlockStart', type: 'Snippet', default: '—', description: 'Outside the shell, above — replaces the label row when given.' },
          { name: 'outerBlockEnd', type: 'Snippet', default: '—', description: 'Outside the shell, below — renders below the error line.' },
        ]}
      />
    </SectionCard>
  </div>
</div>

<!--
  textarea — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the textarea half of the
  select-textarea catalogue + the textarea half of the slot system
  (toolbar/count rows) + the error law. The form.html route remains
  as the family hub.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Textarea from '$lib/ui/textarea/textarea.svelte';
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

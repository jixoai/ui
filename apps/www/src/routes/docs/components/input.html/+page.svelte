<!--
  input — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  all-native-types catalogue + the input half of the slot system and
  the error law. The form.html route remains as the family hub.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlaySelect, PlayToggle, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'input')?.summary;
  if (!heroSummary) throw new Error('catalog entry "input" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copy this
  // site runs — one ?raw import (audit P1-A2).
  import inputSource from '$lib/ui/input/input.svelte?raw';

  // ToC outline: the three demo sections, in page order. The engine pairs
  // these ids with the SectionCard data-family extents + header
  // data-region leaves rendered in this page.

  const inputUsage = `<!-- every native type passes through untouched; every other
     attribute rides through restProps (placeholder, min/max, accept…) -->
<Input type="email" label="email" placeholder="you@host.tld" required />
<Input type="password" label="api key" autocomplete="off" />

<!-- clearable adds the × in the inner-inline-end seam; value is $bindable -->
<Input type="search" label="search" clearable bind:value={q} />

<!-- four slot seams; the shell still owns border / hover / focus -->
<Input label="endpoint" placeholder="api.jixoai.com">
  {#snippet innerInlineStart()}<span>https://</span>{/snippet}
  {#snippet innerInlineEnd()}<span class="text-foreground!">/v1/spawn</span>{/snippet}
</Input>

<!-- error wiring: aria-invalid + aria-describedby + dashed shell -->
<Input type="email" label="email" value="not-an-email" error="email is required" />`;

  const inputFiles: TreeFile[] = [
    { name: 'registry/files/ui/input.svelte', content: inputSource },
    { name: 'src/lib/ui/input-usage.svelte', content: inputUsage },
  ];

  const slotUsage = `<!-- input · 4 slots — the shell owns the box law -->
<Input label="endpoint" placeholder="api.jixoai.com">
  {#snippet innerInlineStart()}<span>https://</span>{/snippet}
  {#snippet innerInlineEnd()}<span class="text-foreground!">/v1/spawn</span>{/snippet}
  {#snippet outerBlockEnd()}<span>helper text below the shell</span>{/snippet}
</Input>

<!-- × clears the DOM value, syncs the binding, re-emits input + clear -->
<Input type="search" label="search" clearable bind:value={q} />

<!-- price: both inner seams at once, muted at 0.75rem -->
<Input label="price" placeholder="0.00">
  {#snippet innerInlineStart()}<span>$</span>{/snippet}
  {#snippet innerInlineEnd()}<span>per seat / mo</span>{/snippet}
</Input>`;

  const errorUsage = `<Input
  type="email"
  label="email"
  error="email is required"
/>

<!-- error wiring, the family law:
  · aria-invalid="true" on the control
  · aria-describedby → the "! message" line
  · border-style: dashed on the shell (monochrome invalid signal —
    the one-hue law has no error red) -->`;

  // Tier-1 native form layer: bare markup, zero JS — the class
  // vocabulary lives in Part A of the jx-pure sheet now (registry item
  // `jx-pure`; `native-form` remains a deprecated same-source alias).
  const tier1Usage = `<!-- import once, after the token sheet:
     @import './lib/jixoai.css';
     @import './lib/jx-pure.css'; -->

<label class="jx-label" for="deploy">deploy</label>
<input class="jx-control" id="deploy" type="datetime-local" />

<!-- range: pure-CSS slider — zero-JS fill to the thumb, thick strip + 8px groove, square thumb -->
<input class="jx-slider" type="range" min="0" max="100" value="40" />

<!-- color: the wrapper label opens the picker from the pipette glyph;
     compact 5rem field by default — add jx-color-expand for the row -->
<label class="jx-color-shell">
  <input class="jx-color-swatch" type="color" value="#007924" />
</label>

<!-- companions? the shell wrapper owns the box, the input is chromeless -->
<label class="jx-control-shell jx-slotted">
  <span>https://</span>
  <input class="jx-control-lane" placeholder="api.jixoai.com" />
</label>`;

  // ---- canvas playground state ---------------------------------------------
  // Playground protocol: the canvas carries an initial snapshot + reset
  // (the page owns the state — the canvas only calls back), an echo
  // projection for the read-only footer, and a live usage generator so the
  // code drawer tracks the current prop values instead of lying.
  const canvasInitial = {
    email: '',
    inputType: 'text' as 'text' | 'email' | 'password' | 'search',
    inputClearable: true,
  };
  let canvasEmail = $state(canvasInitial.email);
  let canvasInputType = $state(canvasInitial.inputType);
  let canvasInputClearable = $state(canvasInitial.inputClearable);

  // kit option map: the enum control speaks the typed union directly
  const typeOptions: { value: 'text' | 'email' | 'password' | 'search'; label: string }[] = [
    { value: 'text', label: 'text' },
    { value: 'email', label: 'email' },
    { value: 'password', label: 'password' },
    { value: 'search', label: 'search' },
  ];

  function resetInputCanvas(): void {
    canvasEmail = canvasInitial.email;
    canvasInputType = canvasInitial.inputType;
    canvasInputClearable = canvasInitial.inputClearable;
  }

  // live usage code: generated from the CURRENT playground state so the
  // drawer never shows stale prop values. Free-text values go through q()
  // (a JSON string literal) so input like O'Reilly or a double quote can
  // never break the generated source
  const q = (value: string): string => JSON.stringify(value);
  const inputUsageLive = $derived(`<Input
  type="${canvasInputType}"
  label="endpoint"
  placeholder=${q(canvasInputType === 'password' ? '••••••••' : 'you@host.tld')}${canvasInputClearable ? '\n  clearable' : ''}
  bind:value
/>`);

  // stable named resolver: the getter defers the read so the drawer keeps
  // tracking live playground state (lazy read, evaluated inside the
  // canvas's $derived — not a value snapshot)
  const resolveInputUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? inputUsageLive : file.content;

  // ---- slot system demo state (controlled search field) --------------------
  let search = $state('pty');
</script>

<svelte:head>
  <title>Input · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai input component: every native type passes through untouched — the component owns only label/error wiring, four slot seams, and the bordered shell. Clearable search, the Tier-1 lane repaints for range/color/date/number, and label[for] + aria-invalid + aria-describedby throughout."
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
      title="input — every native type, one shell"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">all native types</span>
        <span class="pill">4 slot seams</span>
        <span class="pill">clearable</span>
        <span class="pill">label[for] + aria wiring</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (audit P1-A2): the workbench — LIVE stage, playground
       pane (reset + echo + live usage code), source tree + GitHub link. -->
  <div data-reveal="">
    <ComponentCanvas
      title="input"
      description="The text-shell base of the NativeHTML family: every native type passes through untouched — the component owns only label/error wiring, four slot seams, and the bordered shell."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/input.svelte"
      files={inputFiles}
      stage="center"
      onreset={resetInputCanvas}
      output={[{ label: 'value', value: canvasEmail || '—' }]}
      resolveFileContent={resolveInputUsage}
    >
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
        <Input
          type={canvasInputType}
          label={`endpoint (${canvasInputType})`}
          placeholder={canvasInputType === 'password' ? '••••••••' : 'you@host.tld'}
          clearable={canvasInputClearable}
          bind:value={canvasEmail}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="type">
            <PlaySelect bind:value={canvasInputType} options={typeOptions} />
          </PlayRow>
          <PlayRow label="clearable">
            <PlayToggle bind:value={canvasInputClearable} />
          </PlayRow>
          <PlayHelp>
            <code>type</code> lands on the element verbatim — switch it and the
            platform control swaps under the same shell.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- all native types -->
  <div id="all-types" data-reveal="">
    <SectionCard
      family="all-types"
      headerRegion="all-types"
      eyebrow="input"
      title="All native types"
      summary="One component, every type the platform ships. Text-like types take the bordered shell; range and color get full Tier-1 native repaints (the pure-CSS slider and the swatch-plus-pipette color field); the date/time/number lanes restyle the platform's own picker indicator and spinners inside the same shell. checkbox and radio split into their own pure-CSS components, and file picking and dates have their professional homes in file-input and date-picker — those native types still pass through here as the bare controls."
    >
      <CardGrid min="230px">
        <div class="demo-cell" data-no-subgrid>
          <Input type="text" label="text" name="demo_text" placeholder="plain text" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="password" label="password" name="demo_password" placeholder="••••••••" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="email" label="email" name="demo_email" placeholder="you@host.tld" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="number" label="number" name="demo_number" placeholder="42" min="0" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="search" label="search" name="demo_search" placeholder="grep…" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="date" label="date" name="demo_date" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="datetime-local" label="datetime-local" name="demo_datetime" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="time" label="time" name="demo_time" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="range" label="range" name="demo_range" min="0" max="100" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="color" label="color" name="demo_color" value="#007924" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="text" label="disabled" name="demo_disabled" placeholder="not allowed" disabled />
        </div>
      </CardGrid>
      <p class="text-muted-foreground mt-4 text-pretty text-[13px] leading-6">
        Tab through the grid: every control is keyboard-reachable with its platform behavior —
        the color swatches, the range arrows, the platform pickers (the calendar indicator is
        repainted through a mask, and clicking it still opens the native picker). checkbox and
        radio live in their own pure-CSS components, file picking and dates have their
        professional controls; everything else is painted by the Tier-1 class vocabulary —
        range tracks and thumbs, color swatches, date/time indicators, number spinners
        (hidden: engines reject custom paint on them — ↑/↓ step natively) and the
        placeholder-vs-value distinction.
      </p>
      <div class="border-border mt-5 border-t pt-5">
        <h3 class="text-[15px] font-bold tracking-tight">Tier 1 — the pure-CSS native layer</h3>
        <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
          Every native lane above is painted by ONE stylesheet —
          <code class="text-accent">jx-pure.css</code> (registry item
          <code class="text-accent">jx-pure</code>, imported once after the token sheet; the
          class vocabulary is its Part A — <code class="text-accent">native-form</code> remains
          a deprecated same-source alias) —
          with a daisyui-style class vocabulary and zero JS. The same classes the components
          consume style bare markup; type in the first field and watch the placeholder read
          clearly lighter than a value:
        </p>
        <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3">
            <label class="jx-label" for="tier1-text">bare text</label>
            <input id="tier1-text" class="jx-control" type="text" placeholder="placeholder reads lighter" />
            <input class="jx-control" type="date" aria-label="bare date" />
            <input class="jx-control" type="number" aria-label="bare number" placeholder="↑/↓ steps" min="0" />
          </div>
          <div class="flex flex-col gap-3">
            <label class="jx-label" for="tier1-range">bare range</label>
            <input id="tier1-range" class="jx-slider" type="range" min="0" max="100" value="40" />
            <div class="flex items-center gap-3">
              <!-- default: compact 5rem field (swatch + pipette zone) -->
              <label class="jx-color-shell">
                <input type="color" class="jx-color-swatch" value="#007924" aria-label="bare color" />
              </label>
              <!-- opt-in: the full-row field -->
              <label class="jx-color-shell jx-color-expand flex-1">
                <input type="color" class="jx-color-swatch" value="#d61f69" aria-label="bare color stretched" />
              </label>
            </div>
            <span class="text-muted-foreground text-[12px]">
              .jx-control · .jx-slider · .jx-color-shell + .jx-color-swatch — compact by default (5rem),
              .jx-color-expand reclaims the full row; the wrapper label opens the picker from
              the pipette zone too
            </span>
          </div>
        </div>
        <div class="mt-4">
          <CodeBlock code={tier1Usage} lang="html" meta="Tier-1 · bare markup" />
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- slot system (input half) -->
  <div id="slots" data-reveal="">
    <SectionCard
      family="slots"
      headerRegion="slots"
      eyebrow="input"
      title="Slot system — the InputGroup posture"
      summary="The shell is a slot host: outer-block-start (takes the label row's place when given), inner-inline-start / inner-inline-end (inside the shell, muted by default, gap-2 seams), and outer-block-end (below the shell — the error line still renders above it). The shell owns border, background, hover, and the inset focus outline, so slot content never repaints the box law — and value is $bindable: a bound field turns controlled, an unbound one stays purely uncontrolled (FormData and form.reset untouched)."
    >
      <div class="flex flex-col gap-5">
        <Input label="endpoint" name="slot_endpoint" placeholder="api.jixoai.com">
          {#snippet innerInlineStart()}<span>https://</span>{/snippet}
          {#snippet innerInlineEnd()}<span class="text-foreground!">/v1/spawn</span>{/snippet}
          {#snippet outerBlockEnd()}<span>outer-block-end — helper text below the shell; an error line would render above it</span>{/snippet}
        </Input>
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <Input
            type="search"
            label="search (clearable)"
            name="slot_search"
            placeholder="grep the registry…"
            clearable
            bind:value={search}
          />
          <Input label="price" name="slot_price" placeholder="0.00">
            {#snippet innerInlineStart()}<span>$</span>{/snippet}
            {#snippet innerInlineEnd()}<span>per seat / mo</span>{/snippet}
          </Input>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Type into the search field: the × only appears when there is something to clear, and
          pressing it empties the DOM value, syncs the binding, and re-emits
          <code class="text-accent">input</code> plus a bubbling
          <code class="text-accent">clear</code> event — uncontrolled FormData flows and controlled
          bindings both stay correct. Slot content lands muted at 0.75rem; the wrapper is scoped,
          so override it with an important utility
          (<code class="text-accent">text-foreground!</code>) or an inline style.
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
          <Input type="email" label="email" value="not-an-email" error="email is required" />
          <Input type="search" label="search" name="demo_err_search" placeholder="grep…" error="a query is required" clearable />
        </div>
        <CodeBlock code={errorUsage} lang="svelte" meta="error" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

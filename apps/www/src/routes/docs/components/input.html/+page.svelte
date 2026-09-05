<!--
  input — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  all-native-types catalogue + the input half of the slot system and
  the error law. The form.html route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { playOutputs, playState } from '$lib/playground';
  import { PlayFields, PlayRow, PlaySelect, PlayToggle, PlayHelp } from '$lib/playground';
  import { registrySourceUrl } from '$lib/registry-source';
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

<!-- count rides the native maxlength; the eye (on by default for
     password) flips only the input type, starting hidden -->
<Input label="bio" count maxlength={20} bind:value={bio} />

<!-- four slot seams; the shell still owns border / hover / focus -->
<Input label="endpoint" placeholder="api.jixoai.com">
  {#snippet innerInlineStart()}<span>https://</span>{/snippet}
  {#snippet innerInlineEnd()}<span class="text-foreground!">/v1/spawn</span>{/snippet}
</Input>

<!-- error wiring: aria-invalid + aria-describedby + dashed shell -->
<Input type="email" label="email" value="not-an-email" error="email is required" />`;

  const inputFiles: TreeFile[] = [
    { name: 'registry/files/ui/input/input.svelte', content: inputSource },
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

<!-- range: pure-CSS slider — zero-JS fill to the thumb, thick strip + thin groove, ringed disc thumb -->
<input class="jx-slider" type="range" min="0" max="100" value="40" />

<!-- color: the wrapper label opens the picker from the pipette glyph;
     compact 7:4 chip by default — add jx-color-expand for the row -->
<label class="jx-color-shell">
  <input class="jx-color-swatch" type="color" value="#007924" />
</label>

<!-- companions? the shell wrapper owns the box, the input is chromeless -->
<label class="jx-control-shell jx-slotted">
  <span>https://</span>
  <input class="jx-control-lane" placeholder="api.jixoai.com" />
</label>`;

  // ---- canvas playground state (canvas-floor-lab 2.1) ---------------------
  // ONE typed state object, page-owned: the kit controls bind into
  // play.current.<key>, reset() restores the documented defaults
  // in place, and playOutputs() feeds the read-only output lane. The
  // canvas only projects — it never holds this state.
  const play = playState({
    email: '',
    inputType: 'text' as 'text' | 'email' | 'password' | 'search',
    inputClearable: true,
  });
  // picker-bridge demo state
  let bridgeDate = $state('');
  let bridgeDatePicked = $state('');
  let bridgeColor = $state('#7c7c7c');
  let bridgeWeek = $state('');
  const pickerBridgeUsage = `<!-- the custom controls are the DEFAULT (number → the −/+ stepper,
     date/datetime-local/week/month/time → embedded Popover-API panels,
     color → Swatches) -->
<Input type="number" bind:value />
<Input type="date" bind:value onselect={(v) => …} />
<Input type="color" bind:value />

<!-- the bare attribute opts back into the platform controls
     (the disabled-attribute philosophy: presence = true) -->
<Input type="date" native-controls />

<!-- override, not the only way: week already ships the embedded panel
     (Calendar day-pick commits the ISO week) — a snippet REPLACES it -->
<Input type="week">
  {#snippet picker(ctx)}
    <MyWeekGrid value={ctx.value} onpick={ctx.commit} />
  {/snippet}
</Input>`;

  // kit option map: the enum control speaks the typed union directly
  const typeOptions: { value: 'text' | 'email' | 'password' | 'search'; label: string }[] = [
    { value: 'text', label: 'text' },
    { value: 'email', label: 'email' },
    { value: 'password', label: 'password' },
    { value: 'search', label: 'search' },
  ];

  // live usage code: generated from the CURRENT playground state so the
  // drawer never shows stale prop values. Free-text values go through q()
  // (a JSON string literal) so input like O'Reilly or a double quote can
  // never break the generated source
  const q = (value: string): string => JSON.stringify(value);
  const inputUsageLive = $derived(`<Input
  type="${play.current.inputType}"
  label="endpoint"
  placeholder=${q(play.current.inputType === 'password' ? '••••••••' : 'you@host.tld')}${play.current.inputClearable ? '\n  clearable' : ''}
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

  // ---- capability demos (expand-form-family F1, 2026-08-30) ----------------
  let counted = $state('');
  let revealDemo = $state('jixo-terminal-Δ key');
  let revealOptOut = $state('');
  let floatingEmpty = $state('');
  let floatingFilled = $state('not-an-email');
  let floatingError = $state('');

  const capabilityUsage = `<!-- count: the "n / max" code-point readout in the hint lane
     (CJK and emoji count as one character); aria-live stays off until
     the value crosses 90% of the maxlength cap, then reads polite -->
<Input label="bio" count maxlength={20} bind:value />

<!-- password reveal: ON by default, but the VALUE starts hidden — the
     eye only flips the input's type between password/text (aria-pressed
     mirrors the state; autocomplete/password managers untouched) -->
<Input type="password" label="api key" bind:value />

<!-- opt out with the bare false -->
<Input type="password" label="api key" reveal={false} />

<!-- end-lane order when the seam fills: snippet > clearable × > eye -->
<Input type="password" label="key" clearable>
  {#snippet innerInlineEnd()}<span class="text-foreground!">owned</span>{/snippet}
</Input>

<!-- floating: the terminal BRACKET — the label rides the shell's top
     border like a fieldset legend (no SaaS in-field morph); the ink
     states are pure CSS (empty muted / focused+filled foreground /
     error destructive) -->
<Input label="email" labelMode="floating" placeholder="you@host.tld" />
<Input label="email" labelMode="floating" error="email is required" />`;
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
        <span class="pill">count · reveal · floating</span>
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
      sourceUrl={registrySourceUrl('input')}
      install="input"
      files={inputFiles}
      stage="center"
      onreset={() => play.reset()}
      output={playOutputs(play.current)}
      resolveFileContent={resolveInputUsage}
    >
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
        <Input
          type={play.current.inputType}
          label={`endpoint (${play.current.inputType})`}
          placeholder={play.current.inputType === 'password' ? '••••••••' : 'you@host.tld'}
          clearable={play.current.inputClearable}
          bind:value={play.current.email}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="type">
            <PlaySelect bind:value={play.current.inputType} options={typeOptions} />
          </PlayRow>
          <PlayRow label="clearable">
            <PlayToggle bind:value={play.current.inputClearable} />
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
      summary="One component, every type the platform ships. Text-like types take the bordered shell; range and color get full Tier-1 native repaints (the pure-CSS slider and the swatch-plus-pipette color field); the date/datetime-local/week/month/time lanes open embedded Popover-API panels behind the repainted ink indicator, and number swaps its platform spinner for the custom −/+ stepper pair (↑/↓ stepping stays). checkbox and radio split into their own pure-CSS components, and file picking and dates have their professional homes in file-input and date-picker — those native types still pass through here as the bare controls."
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
          <Input type="number" label="number (native-controls)" name="demo_number_native" placeholder="42" min="0" nativeControls />
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
          <Input type="week" label="week" name="demo_week" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="month" label="month" name="demo_month" />
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
        the color swatches, the range arrows, the date/time pickers (the calendar indicator is
        repainted through a mask, and clicking it opens the embedded panel — the custom
        controls are the default; pass native-controls for the platform ones). checkbox and
        radio live in their own pure-CSS components, file picking and dates have their
        professional controls; everything else is painted by the Tier-1 class vocabulary —
        range tracks and thumbs, color swatches, date/time indicators and the
        placeholder-vs-value distinction. The number lane splits by layer: bare Tier-1 markup
        keeps the platform spinner (engines reject custom paint on it, and it is the only
        zero-JS stepper there is — the D3 ruling), while the component fields above take over
        with the −/+ stepper pair (hold to accelerate; ↑/↓ stepping stays). week and month are
        platform popups only on Chromium — Firefox ships no control for them at all (the lanes
        degrade to plain text), so there the embedded panel is the only control on the engine.
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
              <!-- opt-in: the full-row field (the class itself re-opens
                   flex participation — no flex-1 utility needed) -->
              <label class="jx-color-shell jx-color-expand">
                <input type="color" class="jx-color-swatch" value="#d61f69" aria-label="bare color stretched" />
              </label>
            </div>
            <span class="text-muted-foreground text-[12px]">
              .jx-control · .jx-slider · .jx-color-shell + .jx-color-swatch — compact 7:4 chip by default,
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

  <!-- count / reveal / floating (expand-form-family F1, 2026-08-30) -->
  <div id="capabilities" data-reveal="">
    <SectionCard
      family="capabilities"
      headerRegion="capabilities"
      eyebrow="input"
      title="count · reveal · floating label"
      summary="Three family capabilities: a code-point character count with a near-limit live region, the password reveal eye (default on — but the value starts hidden), and the floating bracket label that rides the shell's top border like a fieldset legend."
    >
      <div class="flex flex-col gap-6">
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Input
              label="bio (count, maxlength=20)"
              name="cap_count"
              count
              maxlength={20}
              placeholder="type past 18 chars…"
              bind:value={counted}
            />
            <span class="text-muted-foreground text-[12.5px]">
              code-point readout — 你好𠀀👍 counts 4; aria-live flips
              <code class="text-accent">off → polite</code> from 90% of the cap
            </span>
          </div>
          <Input label="bio (plain n without a cap)" name="cap_count_free" count placeholder="no maxlength" />
        </div>
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <Input type="password" label="reveal (default on)" name="cap_reveal" bind:value={revealDemo} autocomplete="off" />
          <Input type="password" label="reveal = false (opt-out)" name="cap_reveal_off" reveal={false} bind:value={revealOptOut} autocomplete="off" />
          <Input type="password" label="clearable + reveal" name="cap_reveal_clear" value="s3cret" clearable autocomplete="off" />
        </div>
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <Input label="floating (empty)" name="cap_float_empty" labelMode="floating" placeholder="you@host.tld" bind:value={floatingEmpty} />
          <Input label="floating (filled)" name="cap_float_filled" labelMode="floating" bind:value={floatingFilled} />
          <Input label="floating (error)" name="cap_float_error" labelMode="floating" error="email is required" bind:value={floatingError} />
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The count readout lives in the hint lane below the shell and counts CODE POINTS —
          surrogate pairs (emoji, ext-B CJK) are one character, never two UTF-16 units — while the
          maxlength clamp itself stays the platform's. The reveal eye mounts by default on
          <code class="text-accent">type="password"</code> but starts HIDDEN (aria-pressed="false"):
          pressing it flips only the input's <code class="text-accent">type</code> between
          password/text, so autocomplete and password-manager behavior are untouched, and it takes
          the outermost end-lane seat (snippet &gt; clearable × &gt; eye, each keeping the
          --jx-hit edge-lane geometry). The floating label is the terminal translation: the label
          NEVER enters the field — it rides the top border as a bracket, and its ink follows the
          lane through pure CSS (empty muted, focused or filled foreground, error destructive).
        </p>
        <CodeBlock code={capabilityUsage} lang="svelte" meta="count · reveal · floating" />
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

  <!-- picker bridge -->
  <div id="picker-bridge" data-reveal="">
    <SectionCard
      family="picker-bridge"
      headerRegion="picker-bridge"
      eyebrow="bridge"
      title="custom picker bridge"
      summary="The native popups cannot be styled — so the swap is the default. date/datetime-local ride the date-picker Calendar (datetime-local adds a time-stepper row, and a day-pick keeps the panel open for the time adjustment), week rides a Calendar day-pick that commits the ISO week, month rides a year-nav + 12-month grid, time rides the custom HH:MM stepper (live commits), and color rides the color-picker Swatches — all through a Popover-API panel; the input stays a real input: native typing, parsing, ARIA and FormData untouched. The bare boolean attribute — native-controls, the disabled-attribute philosophy — opts back into the platform controls (number's platform spinner included), and a picker snippet overrides the default panel for anything else (its ctx carries value, commit and close)."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <Input
            type="date"
            label="date (custom panel — the default)"
            bind:value={bridgeDate}
            onselect={(v) => (bridgeDatePicked = v)}
          />
          <Input
            type="date"
            label="date (native-controls opt-out)"
            name="bridge_native_date"
            nativeControls
          />
        </div>
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <Input
            type="color"
            label="color (custom panel — the default)"
            bind:value={bridgeColor}
          />
          <Input
            type="week"
            label="week (Calendar day-pick → ISO week)"
            bind:value={bridgeWeek}
          />
        </div>
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <Input
            type="month"
            label="month (year-nav + 12-month grid)"
            name="bridge_month"
          />
          <Input
            type="time"
            label="time (HH:MM stepper)"
            name="bridge_time"
          />
        </div>
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <Input
            type="datetime-local"
            label="datetime-local (Calendar + time row)"
            name="bridge_datetime"
          />
          <Input
            type="date"
            label="date (locale=zh-CN)"
            name="bridge_date_zh"
            locale="zh-CN"
          />
        </div>
        <p class="font-mono text-xs text-muted-foreground">
          committed: {bridgeDatePicked || '—'} · swatch: {bridgeColor} · week: {bridgeWeek || '—'}
        </p>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The week panel picks a DAY on the Calendar and commits the ISO week
          (<code class="text-accent">YYYY-Www</code>, the picked week tinted); the month panel
          navigates years and commits <code class="text-accent">YYYY-MM</code> from a 12-month
          grid; the time panel is the custom HH:MM stepper, committing live as the arrows run —
          the cells are slider-grade: the wheel over a group steps its number, press-drag moves
          it vertically (up increases, the cells wear the ns-resize cursor), and an unset value
          still shows the 00:00 digits.
          The datetime-local panel is the Calendar plus a time-stepper row — a day-pick keeps
          the panel open so the time can be adjusted before it closes, and the commit carries
          both halves. The panels' vocabulary — month label, weekday heads, month cells —
          renders through <code class="text-accent">Intl.DateTimeFormat</code>: the page's
          own <code class="text-accent">&lt;html lang&gt;</code> is the default, or pass
          <code class="text-accent">locale</code> per field (the zh-CN sample above renders
          2026年8月 / 周一…). On Firefox week and month have no platform control at all (the lanes
          degrade to plain text), so there the embedded panel is the only control on the
          engine.
        </p>
        <CodeBlock code={pickerBridgeUsage} lang="svelte" meta="picker-bridge" />
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
      title="Input variants"
      summary="One component, four rendering lanes: the text-like shell, the clearable search field, the error state, and the disabled field."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="border border-border p-4"><Input type="text" label="text" name="types-text" placeholder="plain text" /></div>
        <div class="border border-border p-4"><Input type="search" label="search" name="types-search" placeholder="grep…" clearable /></div>
        <div class="border border-border p-4"><Input type="email" label="error" name="types-error" value="not-an-email" error="email is required" /></div>
        <div class="border border-border p-4"><Input type="text" label="disabled" name="types-disabled" placeholder="not allowed" disabled /></div>
      </div>
    </SectionCard>
  </div>
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Every native type and attribute passes through untouched; the component only adds label/error wiring, the four slot seams, and the optional clear button."
    >
      <CodeBlock code={inputUsage} lang="svelte" meta="Input usage" />
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The native input keeps platform semantics; the component wires the label and the validation message to the control."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the input' },
          { key: 'any text', action: 'Types into the field; per-type controls — the −/+ stepper and the embedded panels by default, platform spinners/pickers under native-controls' },
          { key: 'Esc', action: 'Browser-native search-field reset on type="search" when not cleared' },
        ]}
        aria={[
          { name: 'aria-invalid', value: "'true'", description: 'Set on the native input when the error prop is provided' },
          { name: 'aria-describedby', value: '{id}-error', description: 'Points at the "! message" validation line' },
          { name: 'aria-label', value: '"clear value"', description: 'On the clearable × button (type="button")' },
          { name: 'aria-label', value: '"show password" / "hide password"', description: 'On the reveal eye; it swaps with the state' },
          { name: 'aria-pressed', value: 'true/false', description: 'On the reveal eye — starts false (the value is never revealed by default); pressing flips only the input type' },
          { name: 'aria-live', value: "'off' / 'polite'", description: 'On the count readout — off until the value crosses 90% of the maxlength cap, then polite' },
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
      summary="The shell, label, and error rhythm are pure density-scope tokens; resize the scope and the whole field stack follows."
    >
      <div class="flex flex-col gap-6">
        <p class="text-muted-foreground text-[13px] leading-6">
          the shell, label, and error rhythm are pure density-scope tokens — flip the canvas
          stage's density toggle (comfortable / compact) above to re-scope the workbench stage
          alone; the docs chrome and every other canvas keep their seats. The four-copy
          DensityDemo row is retired by that toggle.
        </p>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' },
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
      summary="Props extend the native HTML input attributes; the entries below are the component-owned additions. Everything else (placeholder, name, min/max, accept…) rides through restProps."
    >
      <PropsTable
        props={[
          { name: 'type', type: 'string', default: "'text'", description: 'Any native input type; range/color/hidden switch to their own lanes.' },
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the control.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid, wires aria-describedby, dashes the shell.' },
          { name: 'clearable', type: 'boolean', default: 'false', description: 'Text-like only: adds the × button in the inner-inline-end seam.' },
          { name: 'count', type: 'boolean', default: 'false', description: 'Text-like only: the "n / max" code-point readout in the hint lane below the shell; the cap rides the native maxlength; aria-live flips off → polite from 90% of the cap.' },
          { name: 'reveal', type: 'boolean', default: 'true', description: 'type="password" only: the reveal eye in the end lane (outermost: snippet > clearable × > eye). Starts hidden; pressing flips only the input type between password/text. Pass false to omit.' },
          { name: 'label-mode', type: "'stacked' | 'floating'", default: "'stacked'", description: "floating renders the terminal bracket — the label rides the shell's top border like a fieldset legend (recorded divergence from the SaaS in-field morph); ink states are pure CSS (empty muted / focused+filled foreground / error destructive)." },
          { name: 'native-controls', type: 'boolean', default: 'false', description: 'The bare attribute opts back into the platform controls: number gets its platform spinner back, and date/datetime-local/week/month/time/color open the platform popups instead of the embedded panels.' },
          { name: 'locale', type: 'string', default: 'page <html lang>', description: "BCP 47 locale for the panels' vocabulary — month label, weekday heads, month cells — through Intl.DateTimeFormat (e.g. zh-CN renders 2026年8月 / 周一 / 1月)." },
          { name: 'picker', type: 'Snippet', default: '—', description: 'Replaces the default embedded panel for any picker type (number is not a panel type); its ctx carries value, commit and close.' },
          { name: 'onselect', type: '(value: string) => void', default: '—', description: 'Fires when a custom panel commits a selection (date day-pick, color swatch…).' },
          { name: 'value', type: 'string | number', default: '—', description: 'Bindable; bound ⇒ controlled, absent ⇒ purely uncontrolled.', bindable: true },
          { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' },
          { name: 'innerInlineStart', type: 'Snippet', default: '—', description: 'Inside the shell, left of the lane (prefix icon / unit).' },
          { name: 'innerInlineEnd', type: 'Snippet', default: '—', description: 'Inside the shell, right of the lane (suffix / unit / action).' },
          { name: 'icon', type: 'Snippet', default: 'per-type glyph', description: 'The semantic glyph — overrides the per-type default (url→link, tel→phone, email→mail, search→magnifier). Any text-like type may carry one.' },
          { name: 'iconPosition', type: "'start' | 'end'", default: 'null · ambient', description: 'Pin the semantic glyph to a side. Absent = inherit context: the css leads by default, a list-item trailing end lane rides the trailing edge, and the lane 30rem fold suspends back to leading (the inset-contract suspension precedent).' },
          { name: 'outerBlockStart', type: 'Snippet', default: '—', description: 'Outside the shell, above — replaces the label row when given.' },
          { name: 'outerBlockEnd', type: 'Snippet', default: '—', description: 'Outside the shell, below — renders below the error line.' },
        ]}
      />
    </SectionCard>
  </div>
</div>

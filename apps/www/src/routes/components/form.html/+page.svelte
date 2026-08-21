<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import CardGrid from '$lib/ui/card-grid.svelte';
  import Input from '$lib/ui/input.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Select from '$lib/ui/select.svelte';
  import TerminalCard from '$lib/ui/terminal-card.svelte';
  import Textarea from '$lib/ui/textarea.svelte';
  import { reveal } from '$lib/reveal';

  // A literal closing-script tag inside the module script would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const installUsage = `<script lang="ts">
  import Input from '@ui/input.svelte';
  import Select from '@ui/select.svelte';
  import Textarea from '@ui/textarea.svelte';
${close}

<!-- every native type passes straight through -->
<Input type="email" label="email" placeholder="you@host.tld" required />
<Input type="checkbox" label="subscribe" labelSide="left" />
<Input type="range" label="volume" min="0" max="100" />
<Input type="file" label="avatar" accept="image/*" />

<Select label="plan">
  <option value="free">free</option>
  <option value="pro">pro</option>
</Select>

<Textarea label="notes" rows={5} maxlength={280} />`;

  const errorUsage = `<Input
  type="email"
  label="email"
  error="email is required"
/>

<!-- error wiring, all three components:
  · aria-invalid="true" on the control
  · aria-describedby → the "! message" line
  · border-style: dashed on the shell (monochrome invalid signal —
    the one-hue law has no error red) -->`;

  // ---- full example form -------------------------------------------------
  // NativeHTML end to end: uncontrolled fields, native constraint
  // validation (required bubbles belong to the platform), FormData read
  // once at submit. Terminal card replays per submit via {#key}.
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
  <title>Form components · jixoai/ui</title>
  <meta
    name="description"
    content="input / select / textarea — the jixoai NativeHTML form base: every native input type passes through untouched, checkboxes and ranges keep their native controls with accent-color, and label/error semantics ride on label[for] plus aria-invalid/aria-describedby."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <!-- page head -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui"
      title="input / select / textarea — the NativeHTML base"
      summary="The form family names its components after the elements they are. The native control is the contract: every input type passes through untouched, checkbox/radio/range/color keep their platform controls with accent-color set to the brand primary, and the only repaint is the shell — border, background, the inset focus outline. Buttons are not part of the family; press-button already exists."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">all native types</span>
        <span class="pill">accent-color: var(--primary)</span>
        <span class="pill">label[for] + aria wiring</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- all native types -->
  <div id="all-types" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="all-types"
      eyebrow="input"
      title="All native types"
      summary="One component, every type the platform ships. Text-like types take the bordered shell; checkbox/radio/range keep the native control with accent-color; color keeps the native picker with its height aligned; file hides the native input (still focusable, Enter/Space opens the picker) behind a press-button trigger with a filename echo."
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
          <Input type="range" label="range" name="demo_range" min="0" max="100" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="color" label="color" name="demo_color" value="#007924" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="checkbox" label="checkbox (label right)" name="demo_check" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="radio" label="radio (label left)" name="demo_radio" labelSide="left" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="file" label="file" name="demo_file" accept="image/*,.txt" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Input type="text" label="disabled" name="demo_disabled" placeholder="not allowed" disabled />
        </div>
      </CardGrid>
      <p class="text-muted-foreground mt-4 text-pretty text-[13px] leading-6">
        Tab through the grid: every control is keyboard-reachable with its platform behavior —
        the date picker, the color swatches, the range arrows, the file dialog. Nothing was
        rebuilt to get there; <code class="text-accent">accent-color: var(--primary)</code> is
        the only line of styling the native controls receive.
      </p>
    </SectionCard>
  </div>

  <!-- select + textarea -->
  <div id="select-textarea" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="select-textarea"
      eyebrow="select / textarea"
      title="select + textarea"
      summary="select repaints only its closed state — appearance-none plus an inline SVG chevron, absolutely positioned and pointer-events: none — while the popup list stays the platform's own. textarea is the same text-shell law as input with resize locked to the vertical axis."
    >
      <div class="grid gap-5 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-5">
          <Select label="runtime" name="demo_runtime">
            <option value="node">node</option>
            <option value="bun">bun</option>
            <option value="deno">deno</option>
          </Select>
          <Select label="disabled" name="demo_select_disabled" disabled>
            <option>frozen</option>
          </Select>
        </div>
        <Textarea
          label="textarea (resize: vertical)"
          name="demo_notes"
          rows={5}
          placeholder="multiline, rows={5}, maxlength rides through restProps…"
          maxlength={280}
        />
      </div>

      <div class="border-border mt-5 border-t pt-5">
        <h3 class="text-[15px] font-bold tracking-tight">label + error wiring</h3>
        <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
          The <code class="text-accent">error</code> prop is pure semantics: it sets
          <code class="text-accent">aria-invalid="true"</code>, wires
          <code class="text-accent">aria-describedby</code> to the “! message” line, and dashes
          the shell border — a monochrome invalid signal, because the one-hue law has no error
          red. All three components share the law:
        </p>
        <div class="mt-4 grid gap-5 min-[760px]:grid-cols-3">
          <Input type="email" label="email" value="not-an-email" error="email is required" />
          <Select label="plan" error="plan is required">
            <option value="">— choose —</option>
            <option value="free">free</option>
          </Select>
          <Textarea label="bio" error="bio is required" rows={2}></Textarea>
        </div>
        <div class="mt-4">
          <CodeBlock code={errorUsage} lang="svelte" meta="error" />
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- full example form -->
  <div id="example-form" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="example-form"
      eyebrow="composition"
      title="A full form, NativeHTML end to end"
      summary="Uncontrolled fields, native constraint validation (the required bubbles are the platform's), FormData read once at submit, press-button as the submit control. The result prints into the terminal card — each submit replays it."
    >
      <div class="grid gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form class="flex flex-col gap-4" aria-label="sign up" onsubmit={onSubmit}>
          <div class="grid gap-4 min-[560px]:grid-cols-2">
            <Input type="text" label="name" name="name" placeholder="ada lovelace" required />
            <Input type="email" label="email" name="email" placeholder="ada@analytical.engine" required />
          </div>
          <Select label="plan" name="plan" required>
            <option value="">— choose a plan —</option>
            <option value="free">free — community</option>
            <option value="pro">pro — dedicated backend</option>
          </Select>
          <Textarea label="notes" name="notes" rows={4} placeholder="what will you spawn? (optional)" />
          <Input type="checkbox" label="I agree to the terminal printing my answers" name="consent" value="yes" required />
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
              <span>fill the form and press <code class="text-accent">sign up</code> — the FormData payload prints here</span>
            </div>
          {/if}
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- NativeHTML base explainer -->
  <div id="native-base" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="native-base"
      eyebrow="law"
      title="NativeHTML 基座"
      summary="Why the family is named after the elements: the component adds semantics and paint, never a second control. Three rules carry the whole base."
    >
      <div class="flex flex-col gap-5">
        <ol class="flex flex-col gap-3">
          <li class="flex flex-col gap-1">
            <p class="text-[13.5px] font-semibold">1 · 原生类型透传 — the type prop IS the native type</p>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              No <code class="text-accent">TextField</code>/<code class="text-accent">NumberField</code>
              forks: <code class="text-accent">type</code> lands on the element verbatim
              (text/password/email/number/search/url/tel/date/time/file/hidden…), and every other
              attribute (placeholder, min/max/step, accept, autocomplete…) rides through
              restProps. If the platform grows a new type tomorrow, this component already
              supports it.
            </p>
          </li>
          <li class="flex flex-col gap-1">
            <p class="text-[13.5px] font-semibold">2 · accent-color 策略 — keep the native control</p>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              checkbox / radio / range keep their platform widgets with one line of paint:
              <code class="text-accent">accent-color: var(--primary)</code>. Native keyboard
              toggling, hit targets, and high-contrast modes at zero cost — rebuilding them
              could only lose features. color keeps its picker (height-aligned); file keeps its
              input in the tab order behind a press-button trigger with a filename echo.
            </p>
          </li>
          <li class="flex flex-col gap-1">
            <p class="text-[13.5px] font-semibold">3 · label / error 关联 — label[for] + aria-describedby</p>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              The <code class="text-accent">label</code> prop renders
              <code class="text-accent">label[for]</code> against an auto-generated id
              (<code class="text-accent">$props.id()</code>, override with
              <code class="text-accent">id</code>). The <code class="text-accent">error</code> prop
              renders the “! message” line, links it with
              <code class="text-accent">aria-describedby</code>, sets
              <code class="text-accent">aria-invalid</code>, and dashes the shell border. Screen
              readers announce the error when the control is focused — no extra wiring owed.
            </p>
          </li>
        </ol>
        <CodeBlock code={installUsage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
</div>

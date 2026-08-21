<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import CardGrid from '$lib/ui/card-grid.svelte';
  import Checkbox from '$lib/ui/checkbox.svelte';
  import Input from '$lib/ui/input.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import NumberInput from '$lib/ui/number-input.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import Radio from '$lib/ui/radio.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Select, { type SelectOption } from '$lib/ui/select.svelte';
  import TerminalCard from '$lib/ui/terminal-card.svelte';
  import Textarea from '$lib/ui/textarea.svelte';
  import Toggle from '$lib/ui/toggle.svelte';
  import { reveal } from '$lib/reveal';

  // A literal closing-script tag inside the module script would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // demo state for bindable controls
  let checked = $state(false);
  let notifications = $state(true);
  let beta = $state(false);
  let selectedFramework = $state('svelte');
  let teamSize = $state(5);

  const installUsage = `<script lang="ts">
  import Input from '@ui/input.svelte';
  import Checkbox from '@ui/checkbox.svelte';
  import Radio from '@ui/radio.svelte';
  import Toggle from '@ui/toggle.svelte';
  import NativeSelect from '@ui/native-select.svelte';
  import Select from '@ui/select.svelte';
  import NumberInput from '@ui/number-input.svelte';
  import Textarea from '@ui/textarea.svelte';
${close}

<!-- every native type passes straight through -->
<Input type="email" label="email" placeholder="you@host.tld" required />
<Input type="range" label="volume" min="0" max="100" />
<Input type="file" label="avatar" accept="image/*" />

<!-- pure-CSS selectors (appearance-none + pseudo-element glyphs) -->
<Checkbox label="subscribe" labelSide="left" />
<Checkbox label="select all" indeterminate />
<Radio label="pro" name="plan" />
<Toggle label="notifications" bind:checked />

<!-- the simple-scenario select: a real name/value pair in FormData,
     the platform's overlay picker on touch -->
<NativeSelect label="plan" name="plan">
  <option value="free">free</option>
  <option value="pro">pro</option>
</NativeSelect>

<!-- the rich sibling: descriptions, painted panel, ↑/↓/Enter/Escape -->
<Select label="runtime" bind:value={runtime} options={runtimeOptions} />

<!-- the [- NUM +] stepper: click/hold/type, clamped into min/max -->
<NumberInput label="workers" bind:value={workers} min={1} max={16} />

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

  const selectUsage = `const runtimeOptions: SelectOption[] = [
  { value: 'node', label: 'node', description: 'node-pty backend' },
  { value: 'bun', label: 'bun', description: 'Bun.Terminal, 1.3.13+' },
  { value: 'deno', label: 'deno', description: '@sigma/pty-ffi over FFI' },
  { value: 'wasi', label: 'wasi (not yet)', disabled: true },
];

<Select
  label="runtime"
  placeholder="pick a runtime…"
  bind:value={runtime}
  options={runtimeOptions}
/>`;

  const numberUsage = `<!-- click steps once; hold accelerates (300ms → 100ms/step);
     typing commits on change and clamps into [min, max] -->
<NumberInput label="workers" bind:value={workers} min={1} max={16} />

<!-- decimal steps snap to the step's precision -->
<NumberInput label="timeout (s)" bind:value={timeout} min={0.5} max={5} step={0.5} />`;

  const slotUsage = `<!-- input · 4 slots — the shell owns the box law -->
<Input label="endpoint" placeholder="api.jixoai.com">
  {#snippet innerInlineStart()}<span>https://</span>{/snippet}
  {#snippet innerInlineEnd()}<span class="text-foreground!">/v1/spawn</span>{/snippet}
  {#snippet outerBlockEnd()}<span>helper text below the shell</span>{/snippet}
</Input>

<!-- × clears the DOM value, syncs the binding, re-emits input + clear -->
<Input type="search" label="search" clearable bind:value={q} />

<!-- textarea · 6 slots — inner rows sit behind 1px hairlines -->
<Textarea label="notes" rows={6} maxlength={280} count bind:value={text}>
  {#snippet innerBlockStart()}<span>bold</span><span>italic</span>{/snippet}
  {#snippet innerBlockEnd()}<span>draft</span>{/snippet}
</Textarea>`;

  // ---- select split demo state -------------------------------------------
  let runtime = $state('node');
  let runtimeNative = $state('node');
  let runtimeRtl = $state<string | undefined>(undefined);

  const runtimeOptions: SelectOption[] = [
    { value: 'node', label: 'node', description: 'node-pty backend — ConPTY on windows, forkpty elsewhere' },
    { value: 'bun', label: 'bun', description: 'Bun.Terminal — linux/macos since 1.3.13, windows 1.3.14' },
    { value: 'deno', label: 'deno', description: '@sigma/pty-ffi — FFI over rust portable-pty' },
    { value: 'wasi', label: 'wasi — coming soon', description: 'reserved route, not implemented yet', disabled: true },
  ];

  // ---- number stepper demo state -----------------------------------------
  let workers = $state(4);
  let timeout = $state(1.5);
  let workersRtl = $state(2);

  // ---- slot system demo state (controlled inputs / textareas) ------------
  let search = $state('pty');
  let notes = $state('spawn a durable shell');

  // ---- full example form -------------------------------------------------
  // NativeHTML end to end: uncontrolled fields, native constraint
  // validation (required bubbles belong to the platform), FormData read
  // once at submit. Terminal card replays per submit via {#key}.
  let result = $state<{ outputs: string[] } | null>(null);
  // toggle is the one controlled field in the demo (bindable checked)
  // the stepper is controlled too (bindable value) and submits as workers
  let formWorkers = $state(2);

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
  <title>Form components · jixoai-ui</title>
  <meta
    name="description"
    content="input / native-select / select / number-input / textarea / checkbox / radio / toggle — the jixoai NativeHTML form base: every native input type passes through untouched, the select family splits into NativeSelect (platform popup, FormData-ready) and Select (a popover listbox with descriptions), number-input is the [- NUM +] stepper with press-and-hold acceleration, and label/error semantics ride on label[for] plus aria-invalid/aria-describedby."
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
      summary="The form family names its components after the elements they are. The native control is the contract: every input type passes through untouched, range/color keep their platform controls with accent-color set to the brand primary, and the only repaint is the shell — border, background, the inset focus outline. The selectors redraw their own paint in pure CSS: checkbox, radio, and toggle strip appearance and draw their glyphs with pseudo-elements while the native input keeps every behavior. The select family splits in two — NativeSelect keeps the platform popup, Select builds a popover listbox — and number-input adds the [- NUM +] stepper. Buttons are not part of the family; press-button already exists."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">all native types</span>
        <span class="pill">pure-CSS checkbox / radio / toggle</span>
        <span class="pill">select split: native + popover</span>
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
      summary="One component, every type the platform ships. Text-like types take the bordered shell; range keeps the native slider with accent-color; color keeps the native picker with its height aligned; file hides the native input (still focusable, Enter/Space opens the picker) behind a press-button trigger with a filename echo. checkbox and radio split into their own pure-CSS components — see the next section."
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
          <Checkbox label="checkbox (label right)" name="demo_check" />
        </div>
        <div class="demo-cell" data-no-subgrid>
          <Radio label="radio (label left)" name="demo_radio" labelSide="left" />
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
        the date picker, the color swatches, the range arrows, the file dialog. checkbox and
        radio now live in their own pure-CSS components (next section); the rest of the grid
        keeps <code class="text-accent">accent-color: var(--primary)</code> as the only line of
        styling their native controls receive.
      </p>
    </SectionCard>
  </div>

  <!-- checkbox / radio / toggle: pure-CSS selectors -->
  <div id="selectors" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="selectors"
      eyebrow="checkbox / radio / toggle"
      title="The selectors, redrawn in pure CSS"
      summary="Three controls where the paint deserved its own drawing code: checkbox and radio strip appearance off the native input and draw their glyphs with pseudo-elements — a clip-path check on a 45°-rotated box, a scaled dot — while toggle is a checkbox in inline-end posture: label on the left, a rounded rail on the right, and a slide instead of a glyph. Zero icon fonts, zero SVG, zero dependencies; the native input underneath keeps form participation, keyboard toggling, and :checked/:indeterminate state."
    >
      <div class="flex flex-col gap-6">
        <div>
          <h3 class="text-[15px] font-bold tracking-tight">checkbox — 16px square, clip-path glyph</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
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
        </div>

        <div>
          <h3 class="text-[15px] font-bold tracking-tight">radio — 16px circle, scaled dot</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            :checked turns the border primary and pops an 8px dot from
            <code class="text-accent">scale(0)</code> to
            <code class="text-accent">scale(1)</code> (150ms ease-out). Same-name radios keep
            native arrow-key walking — tab into the group and use the arrows.
          </p>
          <CardGrid min="200px">
            <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
              <Radio label="node" name="demo_rt" checked />
              <Radio label="bun" name="demo_rt" />
              <Radio label="deno" name="demo_rt" />
            </div>
            <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
              <Radio label="label left" name="demo_rt2" labelSide="left" />
              <Radio label="also left" name="demo_rt2" labelSide="left" checked />
            </div>
            <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
              <Radio label="disabled" name="demo_rt3" disabled />
              <Radio label="disabled + checked" name="demo_rt3" checked disabled />
            </div>
          </CardGrid>
        </div>

        <div>
          <h3 class="text-[15px] font-bold tracking-tight">toggle — checkbox in inline-end posture</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            The label reads on the left, the control lands on the right. A visually-hidden
            checkbox drives a rounded rail through the sibling selector: unchecked is a muted
            rail with a muted-foreground knob; checked slides the knob by
            <code class="text-accent">width − height</code> (16px at md) over a primary rail —
            200ms cubic-bezier(0.22, 1, 0.36, 1). Sizes keep the rail proportional:
            sm 28×16, md 36×20, lg 44×24.
          </p>
          <CardGrid min="220px">
            <div class="demo-cell flex items-center gap-3" data-no-subgrid>
              <Toggle label="sm" name="demo_tg" size="sm" />
            </div>
            <div class="demo-cell flex items-center gap-3" data-no-subgrid>
              <Toggle label="md (default)" name="demo_tg" />
            </div>
            <div class="demo-cell flex items-center gap-3" data-no-subgrid>
              <Toggle label="lg" name="demo_tg" size="lg" checked />
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
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- the select split -->
  <div id="select-split" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="select-split"
      eyebrow="select × 2"
      title="One family, two selects — native first"
      summary="NativeSelect is the default you should ship: a real <select> (options as <option> children) whose popup list, keyboard, and type-ahead belong to the platform — it rides into FormData with a name/value pair and gets the OS overlay picker on mobile. Select is the same trigger paint on a <button> opening a popover listbox: per-option descriptions, a painted terminal-bezel panel, roving ↑/↓/Enter highlight with focus restitution — reach for it only when the native popup can't say what you need."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3">
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
          <div class="flex flex-col gap-3">
            <Select
              label="runtime — popover listbox"
              bind:value={runtime}
              options={runtimeOptions}
              placeholder="pick a runtime…"
            />
            <span class="text-muted-foreground text-[12.5px]">
              popover panel · descriptions · bound value: <code class="text-accent">{runtime}</code>
            </span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Open the right one: the panel is <code class="text-accent">popover="auto"</code> wired
          with <code class="text-accent">popovertarget</code>, so light dismiss, Escape, and
          top-layer rendering are the browser's; the JS only drives
          <code class="text-accent">role="listbox"</code> /
          <code class="text-accent">role="option"</code> /
          <code class="text-accent">aria-activedescendant</code>, the ↑/↓/Home/End/Enter
          highlight, and focus restitution to the trigger on every close path. The selected row
          reads <code class="text-accent">--terminal-hover</code> fill with a 2px
          <code class="text-accent">--primary</code> edge on
          <code class="text-accent">border-inline-start</code> — under
          <code class="text-accent">dir="rtl"</code> the edge flips sides by itself.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">label + error wiring, both selects</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            The split changes nothing semantically: <code class="text-accent">label[for]</code>
            binds to the control (the <code class="text-accent">&lt;button&gt;</code> trigger in Select's case), and the
            <code class="text-accent">error</code> prop wires
            <code class="text-accent">aria-invalid</code> +
            <code class="text-accent">aria-describedby</code> + the dashed shell — the same
            monochrome invalid signal as the rest of the family.
          </p>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <NativeSelect label="plan" error="plan is required">
              <option value="">— choose —</option>
              <option value="free">free</option>
            </NativeSelect>
            <Select
              label="plan"
              error="plan is required"
              options={[
                { value: '', label: '— choose —' },
                { value: 'free', label: 'free', description: 'community tier' },
                { value: 'pro', label: 'pro', description: 'dedicated backend' },
              ]}
            />
          </div>
        </div>
        <CodeBlock code={selectUsage} lang="svelte" meta="Select usage" />
      </div>
    </SectionCard>
  </div>

  <!-- number stepper -->
  <div id="number-input" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="number-input"
      eyebrow="number-input"
      title="number-input — the [- NUM +] stepper"
      summary="A segmented control, not a text-field fork: two 28px square buttons (text glyphs in font-nav bold — no icon dependency) around a borderless, centered native number input whose spinners are hidden but whose ↑/↓ stepping survives. Click steps once and clamps into [min, max]; hold accelerates — one step, 300ms, then a step every 100ms until you release. Typing is first-class: the value commits on change and clamps."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <div class="flex flex-col gap-3">
            <NumberInput label="workers" bind:value={workers} min={1} max={16} />
            <span class="text-muted-foreground text-[12.5px]">
              min 1 · max 16 · value: <code class="text-accent">{workers}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <NumberInput label="timeout (s)" bind:value={timeout} min={0.5} max={5} step={0.5} placeholder="0.5" />
            <span class="text-muted-foreground text-[12.5px]">
              step 0.5 · decimal-safe · value: <code class="text-accent">{timeout}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <NumberInput label="disabled" value={3} min={1} max={8} disabled />
            <span class="text-muted-foreground text-[12.5px]">buttons disable in lockstep</span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The row is plain flex with logical properties only, so
          <code class="text-accent">dir="rtl"</code> flips it by itself — minus lands on the
          inline-end, plus on the inline-start, the same swap the select panel's primary edge
          performs. Tab into the input: ↑/↓ step with min/max/step read straight off the
          element — the native behavior, kept.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">RTL — geometry from logical properties</h3>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
              <Select
                label="runtime (rtl)"
                bind:value={runtimeRtl}
                options={runtimeOptions.slice(0, 3)}
                placeholder="pick…"
              />
              <NumberInput label="workers (rtl)" bind:value={workersRtl} min={1} max={16} />
              <span class="text-muted-foreground text-[12px]">
                dir="rtl" on the wrapper — trigger chevron, panel edge line, and [- +] order
                all flipped without a physical property in sight
              </span>
            </div>
            <div class="flex flex-col justify-center gap-2 text-muted-foreground text-[13px] leading-6">
              <p class="text-pretty">
                Nothing in either component branches on direction: the chevron sits in the flex
                flow, the selected-row edge is
                <code class="text-accent">border-inline-start</code>, and the stepper is a flex
                row in DOM order (minus, input, plus). The writing mode does the rest.
              </p>
            </div>
          </div>
        </div>
        <CodeBlock code={numberUsage} lang="svelte" meta="NumberInput usage" />
      </div>
    </SectionCard>
  </div>

  <!-- select + textarea -->
  <div id="select-textarea" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="select-textarea"
      eyebrow="native-select / textarea"
      title="native-select + textarea"
      summary="The select family splits in two. NativeSelect keeps the platform popup and repaints only the closed control — appearance-none plus an inline SVG chevron, absolutely positioned and pointer-events: none; it is the simple-scenario recommendation (real FormData pair, mobile overlay picker). Select builds a popover listbox for when the native popup can't say what you need. textarea is the same text-shell law as input with resize locked to the vertical axis."
    >
      <div class="grid gap-5 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-5">
          <NativeSelect label="runtime" name="demo_runtime">
            <option value="node">node</option>
            <option value="bun">bun</option>
            <option value="deno">deno</option>
          </NativeSelect>
          <NativeSelect label="disabled" name="demo_select_disabled" disabled>
            <option>frozen</option>
          </NativeSelect>
          <NativeSelect label="multiple (list box)" name="demo_targets" multiple>
            <option value="linux">linux</option>
            <option value="macos">macos</option>
            <option value="windows">windows</option>
          </NativeSelect>
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
          <NativeSelect label="plan" error="plan is required">
            <option value="">— choose —</option>
            <option value="free">free</option>
          </NativeSelect>
          <Textarea label="bio" error="bio is required" rows={2}></Textarea>
        </div>
        <div class="mt-4">
          <CodeBlock code={errorUsage} lang="svelte" meta="error" />
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- slot system (InputGroup) -->
  <div id="slots" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="slots"
      eyebrow="input / textarea"
      title="Slot system — the InputGroup posture"
      summary="Both shells are slot hosts now. input gains four slots: outer-block-start (takes the label row's place when given), inner-inline-start / inner-inline-end (inside the shell, muted by default, gap-2 seams), and outer-block-end (below the shell — the error line still renders above it). textarea adds inner-block-start / inner-block-end behind 1px hairlines for toolbar and status rows, plus count for an N / maxLength readout. The shell owns border, background, hover, and the inset focus outline, so slot content never repaints the box law — and value is $bindable: a bound field turns controlled, an unbound one stays purely uncontrolled (FormData and form.reset untouched)."
    >
      <div class="grid gap-5 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-5">
          <Input label="endpoint" name="slot_endpoint" placeholder="api.jixoai.com">
            {#snippet innerInlineStart()}<span>https://</span>{/snippet}
            {#snippet innerInlineEnd()}<span class="text-foreground!">/v1/spawn</span>{/snippet}
            {#snippet outerBlockEnd()}<span>outer-block-end — helper text below the shell; an error line would render above it</span>{/snippet}
          </Input>
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
      </div>
      <p class="text-muted-foreground mt-4 text-pretty text-[13px] leading-6">
        Type into the search field: the × only appears when there is something to clear, and
        pressing it empties the DOM value, syncs the binding, and re-emits
        <code class="text-accent">input</code> plus a bubbling
        <code class="text-accent">clear</code> event — uncontrolled FormData flows and controlled
        bindings both stay correct. Slot content lands muted at 0.75rem; the wrapper is scoped,
        so override it with an important utility
        (<code class="text-accent">text-foreground!</code>) or an inline style.
      </p>
      <div class="mt-5">
        <CodeBlock code={slotUsage} lang="svelte" meta="slots" />
      </div>
    </SectionCard>
  </div>

  <!-- full example form -->
  <div id="example-form" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="example-form"
      eyebrow="composition"
      title="A full form, NativeHTML end to end"
      summary="Uncontrolled fields, native constraint validation (the required bubbles are the platform's), FormData read once at submit, press-button as the submit control. NativeSelect is the select in a submitted form — its name/value pair is the point — and the stepper commits its number under name='workers'. The result prints into the terminal card — each submit replays it."
    >
      <div class="grid gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form class="flex flex-col gap-4" aria-label="sign up" onsubmit={onSubmit}>
          <div class="grid gap-4 min-[560px]:grid-cols-2">
            <Input type="text" label="name" name="name" placeholder="ada lovelace" required />
            <Input type="email" label="email" name="email" placeholder="ada@analytical.engine" required />
          </div>
          <div class="grid gap-4 min-[560px]:grid-cols-2">
            <NativeSelect label="plan" name="plan" required>
              <option value="">— choose a plan —</option>
              <option value="free">free — community</option>
              <option value="pro">pro — dedicated backend</option>
            </NativeSelect>
            <NumberInput label="workers" name="workers" bind:value={formWorkers} min={1} max={8} />
          </div>
          <Textarea label="notes" name="notes" rows={4} placeholder="what will you spawn? (optional)" />
          <Checkbox label="I agree to the terminal printing my answers" name="consent" value="yes" required />
          <Toggle label="join the beta channel" name="beta" value="yes" bind:checked={beta} />
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
            <p class="text-[13.5px] font-semibold">2 · 重绘策略 — keep the input, redraw the paint</p>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              The split happens at the paint, never the control. checkbox / radio / toggle set
              <code class="text-accent">appearance: none</code> and draw their own glyphs with
              pseudo-elements — a clip-path check, a scaled dot, a sliding knob — while the
              native input underneath still owns state, keyboard toggling, and FormData.
              The remaining platform widgets keep their accent-color:
              <code class="text-accent">range</code> keeps the native slider, color keeps its
              picker (height-aligned); file keeps its input in the tab order behind a
              press-button trigger with a filename echo.
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

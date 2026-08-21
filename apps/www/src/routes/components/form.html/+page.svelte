<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import CardGrid from '$lib/ui/card-grid.svelte';
  import Checkbox from '$lib/ui/checkbox.svelte';
  import ColorPicker from '$lib/ui/color-picker.svelte';
  import Combobox, { type ComboboxOption } from '$lib/ui/combobox.svelte';
  import DatePicker, { type DatePickerRange } from '$lib/ui/date-picker.svelte';
  import FileInput from '$lib/ui/file-input.svelte';
  import Input from '$lib/ui/input.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import NumberInput from '$lib/ui/number-input.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import Radio from '$lib/ui/radio.svelte';
  import Range from '$lib/ui/range.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Select, { type SelectOption } from '$lib/ui/select.svelte';
  import TagsInput, { type Tag } from '$lib/ui/tags-input.svelte';
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
  import FileInput from '@ui/file-input.svelte';
  import DatePicker from '@ui/date-picker.svelte';
  import Range from '@ui/range.svelte';
  import ColorPicker from '@ui/color-picker.svelte';
  import Combobox from '@ui/combobox.svelte';
  import TagsInput from '@ui/tags-input.svelte';
${close}

<!-- every native type passes straight through -->
<Input type="email" label="email" placeholder="you@host.tld" required />
<Input type="range" label="volume" min="0" max="100" />

<!-- professional controls: previews/variants, calendar popover -->
<FileInput label="avatar" accept="image/*" bind:files={avatar} />
<DatePicker label="deploy date" bind:value={iso} />

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

<!-- fully custom slider (no input[type=range]) and the oklch picker -->
<Range label="volume" bind:value={volume} min={0} max={100} />
<Range label="gain" bind:value={gain} min={0} max={10} step={0.5} ticks />
<ColorPicker label="brand" bind:value={brandColor} />
<ColorPicker label="accent" bind:value={accentColor} format="oklch" />

<!-- the searchable select: type to filter, ↑/↓/Enter commits, allowCustom -->
<Combobox label="backend" bind:value={backend} options={backends} />

<!-- input × multiselect: Enter/comma/Tab commits chips, Backspace deletes -->
<TagsInput label="stack" bind:tags={stack} suggestions={stackSuggestions} />

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

  const comboboxUsage = `const backends: ComboboxOption[] = [
  { value: 'node-pty', label: 'node-pty', description: 'conpty / forkpty addon' },
  { value: 'bun-terminal', label: 'Bun.Terminal', description: 'linux/macos 1.3.13+, windows 1.3.14' },
  { value: '@sigma/pty-ffi', label: '@sigma/pty-ffi', description: 'deno FFI over rust portable-pty' },
];

<!-- type to filter (label, case-insensitive); ↑/↓ + Enter commits; Escape
     reverts; Tab keeps. No match + allowCustom → the “Use “xxx”” row -->
<Combobox label="backend" bind:value={backend} options={backends} />

<!-- strict: allowCustom={false} reverts stray text on blur -->
<Combobox label="runtime" allowCustom={false} options={backends} />`;

  const tagsUsage = `const stack = $state<Tag[]>([{ value: 'svelte' }]);
const stackSuggestions: Tag[] = [
  { value: 'svelte' }, { value: 'typescript' }, { value: 'node' },
];

<!-- Enter / comma / Tab commits a chip; Backspace on empty deletes the
     last; typing filters the suggestion popover (↑/↓ + Enter) -->
<TagsInput label="stack" bind:tags={stack} suggestions={stackSuggestions} />

<!-- maxTags hides the input at the cap ("N/N tags"); duplicates flash the
     existing chip instead of adding; removable={false} pins a chip -->
<TagsInput label="targets" bind:tags={targets} maxTags={3} />`;

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

  const fileUsage = `const avatar = $state<File[]>([]);
const gallery = $state<File[]>([]);
const uploads = $state<File[]>([]);

<!-- list (default): icon + name + size + remove per row -->
<FileInput label="avatar" accept="image/*" bind:files={avatar} />

<!-- variants: list · cards (thumbnail grid) · compact (summary + expand) -->
<!-- sizes: sm 32px · md 40px · lg 48px rows -->
<FileInput label="gallery" variant="cards" multiple accept="image/*" bind:files={gallery} />
<FileInput label="uploads" variant="compact" multiple size="sm" bind:files={uploads} />

<!-- overflow reports, never truncates: 3 files + maxFiles=2 → error -->
<FileInput label="evidence" multiple maxFiles={2} bind:files={evidence} />`;

  const dateUsage = `const deploy = $state('2026-08-24');
const sprint = $state({ start: '2026-08-10', end: '2026-08-16' });

<!-- single: commits ISO "YYYY-MM-DD" — format only changes the display -->
<DatePicker label="deploy date" bind:value={deploy} />
<DatePicker label="review" format="locale" bind:value={deploy} />

<!-- inclusive bounds; outside days render disabled -->
<DatePicker label="windowed" min="2026-08-01" max="2026-08-31" bind:value={deploy} />

<!-- range: first click anchors, second closes (backwards swaps) -->
<DatePicker label="sprint" mode="range" bind:range={sprint} />`;

  const rangeUsage = `<!-- fully custom: div + pointer events, no input[type=range] -->
<Range label="volume" bind:value={volume} min={0} max={100} />

<!-- decimal steps snap at the step's precision; ticks = one mark per step -->
<Range label="gain" bind:value={gain} min={0} max={10} step={0.5} ticks />

<!-- keyboard: ←→/↑↓ step · Home/End jump · geometry is logical, so
     dir="rtl" mirrors fill, thumb, ticks and arrows with zero branches -->
<div dir="rtl"><Range label="volume (rtl)" bind:value={v} /></div>`;

  const colorUsage = `<!-- value notation follows format; oklch is the conversion hub -->
<ColorPicker label="brand" bind:value={brandColor} />
<ColorPicker label="accent" bind:value={accentColor} format="oklch" />

<!-- trigger surface: swatch + mono value + chevron (either can be hidden) -->
<ColorPicker label="swatch only" bind:value={c} showValue={false} />

<!-- paste any notation into the panel input — invalid pastes revert;
     Eye Dropper appears when window.EyeDropper exists -->
<ColorPicker label="theme hue" bind:value={c} format="hsl" />`;

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

  // ---- combobox demo state -------------------------------------------------
  let backendRoute = $state<string | undefined>('node-pty');
  let backendCustom = $state<string | undefined>(undefined);
  let backendStrict = $state<string | undefined>(undefined);
  let backendRtl = $state<string | undefined>('bun-terminal');

  const backendOptions: ComboboxOption[] = [
    { value: 'node-pty', label: 'node-pty', description: 'conpty / forkpty — the battle-tested addon' },
    { value: 'bun-terminal', label: 'Bun.Terminal', description: 'linux/macos since 1.3.13, windows 1.3.14' },
    { value: '@sigma/pty-ffi', label: '@sigma/pty-ffi', description: 'deno FFI over rust portable-pty' },
    { value: 'termless', label: 'termless', description: 'VT emulator — not a pty host', disabled: true },
  ];

  // ---- tags input demo state -------------------------------------------------
  let stackTags = $state<Tag[]>([{ value: 'svelte' }, { value: 'typescript' }]);
  let targetTags = $state<Tag[]>([{ value: 'node' }, { value: 'bun' }]);
  let pinnedTags = $state<Tag[]>([
    { value: 'owner', removable: false },
    { value: 'release' },
  ]);
  let rtlTags = $state<Tag[]>([{ value: 'svelte' }]);

  const tagSuggestions: Tag[] = [
    { value: 'svelte' },
    { value: 'typescript' },
    { value: 'node' },
    { value: 'bun' },
    { value: 'deno' },
    { value: 'rust' },
    { value: 'ffi' },
    { value: 'conpty' },
    { value: 'websocket' },
  ];

  // ---- number stepper demo state -----------------------------------------
  let workers = $state(4);
  let timeout = $state(1.5);
  let workersRtl = $state(2);

  // ---- file input demo state ----------------------------------------------
  // File[] is the contract; samples are generated client-side (SVG blobs)
  // so the cards/overflow demos have something to show without a picker.
  let avatarFiles = $state<File[]>([]);
  let batchFiles = $state<File[]>([]);
  let cardFiles = $state<File[]>([]);
  let compactFiles = $state<File[]>([]);
  let sizeFiles = $state<File[]>([]);
  let overflowFiles = $state<File[]>([]);
  let errorFiles = $state<File[]>([]);

  function sampleImage(hue: number, name: string): File {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="hsl(${hue} 45% 88%)"/><path d="M0 360 180 130 300 290 390 200 480 360Z" fill="hsl(${hue} 55% 38%)"/><circle cx="370" cy="80" r="34" fill="hsl(${hue} 80% 62%)"/></svg>`;
    return new File([svg], `${name}.svg`, { type: 'image/svg+xml' });
  }
  function sampleText(name: string, kilobytes: number): File {
    return new File([`x`.repeat(1024 * kilobytes)], name, { type: 'text/plain' });
  }
  function loadCardSamples(): void {
    cardFiles = [
      sampleImage(150, 'phosphor-grid'),
      sampleImage(190, 'wave-form'),
      sampleImage(220, 'spawn-diagram'),
    ];
  }
  function loadOverflow(): void {
    overflowFiles = [sampleImage(30, 'one'), sampleImage(60, 'two'), sampleImage(90, 'three')];
  }

  // ---- date picker demo state ----------------------------------------------
  let deployDate = $state('2026-08-24');
  let localeDate = $state<string | undefined>(undefined);
  let windowedDate = $state<string | undefined>(undefined);
  let auditDate = $state<string | undefined>(undefined);
  let sprintRange = $state<DatePickerRange>({ start: '2026-08-10', end: '2026-08-16' });

  // ---- range slider demo state ---------------------------------------------
  let volume = $state(40);
  let gain = $state(6);
  let tolerance = $state(0.35);
  let volumeRtl = $state(70);

  // ---- color picker demo state ----------------------------------------------
  let brandColor = $state('#007924');
  let accentColor = $state('oklch(0.6489 0.237 145)');
  let swatchOnly = $state('#b7d7a8');
  let errorColor = $state('#8a5a2f');

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
    content="input / native-select / select / combobox / tags-input / number-input / textarea / checkbox / radio / toggle / file-input / date-picker / range / color-picker — the jixoai NativeHTML form base: every native input type passes through untouched, the select family splits into NativeSelect (platform popup, FormData-ready) and Select (a popover listbox with descriptions), combobox is the searchable select (input trigger, live label filter, ↑/↓/Enter roving highlight, allowCustom ‘Use “xxx”’ row, blur/Escape resolve-or-revert), tags-input is input × multiselect (flex-wrap chip shell, Enter/comma/Tab commits, Backspace deletes, suggestion popover, maxTags cap, duplicate flash), number-input is the [- NUM +] stepper, file-input is the professional file picker (File[] contract, previews, list/cards/compact variants, maxFiles), date-picker is a zero-dependency calendar popover over hand-rolled Date math, range is the fully custom slider (div + pointer events, square thumb, ticks, rtl), and color-picker is the oklch-hub popover picker (SV pad, hue bar, hex/hsl/oklch, Eye Dropper) — label/error semantics ride on label[for] plus aria-invalid/aria-describedby throughout."
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
      summary="The form family names its components after the elements they are. The native control is the contract: every input type passes through untouched, and the only repaint is the shell — border, background, the inset focus outline. The selectors redraw their own paint in pure CSS: checkbox, radio, and toggle strip appearance and draw their glyphs with pseudo-elements while the native input keeps every behavior. The select family splits in two — NativeSelect keeps the platform popup, Select builds a popover listbox — number-input adds the [- NUM +] stepper, file-input and date-picker own files and dates professionally, and the two controls the platform cannot paint our way split out as full customs: range (the fully custom slider) and color-picker (the oklch-hub popover). Buttons are not part of the family; press-button already exists."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">all native types</span>
        <span class="pill">pure-CSS checkbox / radio / toggle</span>
        <span class="pill">select split: native + popover</span>
        <span class="pill">combobox + tags-input</span>
        <span class="pill">file-input + date-picker</span>
        <span class="pill">custom range + oklch color-picker</span>
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
      summary="One component, every type the platform ships. Text-like types take the bordered shell; range keeps the native slider with accent-color; color keeps the native picker with its height aligned. checkbox and radio split into their own pure-CSS components, and file picking now has its professional home in file-input (below) — type='file' still passes through here as the bare native control."
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
          <Input type="text" label="disabled" name="demo_disabled" placeholder="not allowed" disabled />
        </div>
      </CardGrid>
      <p class="text-muted-foreground mt-4 text-pretty text-[13px] leading-6">
        Tab through the grid: every control is keyboard-reachable with its platform behavior —
        the color swatches, the range arrows, the platform pickers. checkbox and radio live in
        their own pure-CSS components (next section), file picking and dates have their
        professional controls further down; the rest of the grid keeps
        <code class="text-accent">accent-color: var(--primary)</code> as the only line of
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

  <!-- combobox + tags input -->
  <div id="combobox-tags" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="combobox-tags"
      eyebrow="combobox / tags-input"
      title="Combobox + TagsInput — the searchable pair"
      summary="Two high-form members that turn the popup into a conversation. Combobox is the searchable select: the trigger IS an input, typing filters the panel live (label contains, case-insensitive), ↑/↓ ride a roving aria-activedescendant highlight, Enter commits it, Escape reverts, Tab keeps — and when nothing matches, the allowCustom row offers “Use “xxx”” in the primary hue while strict fields revert stray text on blur. TagsInput is input × multiselect: the shell becomes a flex-wrap chip host where Enter / comma / Tab commits a tag, Backspace on empty deletes the last chip, maxTags swaps the input for an “N/N tags” readout, and duplicates flash the existing chip (primary border + shake) instead of adding. Both panels are the same popover=auto terminal bezel as Select — light dismiss, Escape, and top layer are the browser's; focus never leaves the text field."
    >
      <div class="flex flex-col gap-6">
        <div>
          <h3 class="text-[15px] font-bold tracking-tight">combobox — the trigger IS the input</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            Focus one: the text selects itself and the panel opens on the full list with the
            committed row highlighted (the 2px <code class="text-accent">--primary</code> edge);
            typing filters live and auto-highlights the first match. Try
            <code class="text-accent">wasi</code> in the first field — no match, so the
            “Use “wasi”” row appears in primary; press Enter to commit it as a custom value.
            The strict field (<code class="text-accent">allowCustom={'{false}'}</code>) keeps
            its committed label instead.
          </p>
          <CardGrid min="230px">
            <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
              <Combobox label="backend — type to filter" bind:value={backendRoute} options={backendOptions} />
              <span class="text-muted-foreground text-[12.5px]">
                allowCustom (default) · bound value: <code class="text-accent">{backendRoute ?? 'undefined'}</code>
              </span>
            </div>
            <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
              <Combobox
                label="strict — no custom values"
                bind:value={backendStrict}
                options={backendOptions.slice(0, 3)}
                placeholder="Search..."
              />
              <span class="text-muted-foreground text-[12.5px]">
                allowCustom={'{false}'} · blur reverts stray text · value:
                <code class="text-accent">{backendStrict ?? 'undefined'}</code>
              </span>
            </div>
            <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
              <Combobox
                label="custom — try “wasi”"
                bind:value={backendCustom}
                options={backendOptions.slice(0, 3)}
                placeholder="Search or type..."
              />
              <span class="text-muted-foreground text-[12.5px]">
                no match → “Use “xxx”” row · value:
                <code class="text-accent">{backendCustom ?? 'undefined'}</code>
              </span>
            </div>
            <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
              <Combobox label="backend" error="backend is required" options={backendOptions} />
              <span class="text-muted-foreground text-[12.5px]">
                error wiring: aria-invalid + dashed shell
              </span>
            </div>
          </CardGrid>
        </div>

        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">tags-input — chips + suggestion popover</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            Type in the first one: matching suggestions (<code class="text-accent">label</code>
            or <code class="text-accent">value</code> contains, case-insensitive) pop under the
            shell with ↑/↓ + Enter; type <code class="text-accent">svelte</code> again to see the
            duplicate flash on the existing chip. Enter / comma / Tab commits chips directly —
            pasting <code class="text-accent">rust, ffi</code> splits into two — and Backspace on
            an empty input deletes the last removable chip.
          </p>
          <CardGrid min="230px">
            <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
              <TagsInput label="stack — with suggestions" bind:tags={stackTags} suggestions={tagSuggestions} />
              <span class="text-muted-foreground text-[12.5px]">
                bound values: <code class="text-accent">{stackTags.map((t) => t.value).join(', ') || '—'}</code>
              </span>
            </div>
            <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
              <TagsInput label="targets (maxTags 3)" bind:tags={targetTags} suggestions={tagSuggestions} maxTags={3} />
              <span class="text-muted-foreground text-[12.5px]">
                at the cap the input hides · {targetTags.length}/3 tags
              </span>
            </div>
            <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
              <TagsInput label="roles — pinned chip" bind:tags={pinnedTags} suggestions={tagSuggestions} />
              <span class="text-muted-foreground text-[12.5px]">
                removable={'{false}'} hides the × · Backspace skips it
              </span>
            </div>
            <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
              <TagsInput label="labels" error="at least one label is required" suggestions={tagSuggestions} />
              <span class="text-muted-foreground text-[12.5px]">
                error wiring: aria-invalid + dashed shell
              </span>
            </div>
          </CardGrid>
        </div>

        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Both components keep the popover orchestration law of the family:
          <code class="text-accent">popover="auto"</code> panels anchored with CSS Anchor
          Positioning (<code class="text-accent">anchor-size(width)</code>, flip fallbacks,
          viewport-center when the engine lacks it), focus that never enters the panel — the
          roving highlight rides <code class="text-accent">aria-activedescendant</code> +
          <code class="text-accent">aria-owns</code> off the input itself — and geometry from
          logical properties only, so <code class="text-accent">dir="rtl"</code> mirrors the
          chevron, the selected-row edge, and the chip order with zero branches.
        </p>
        <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
          <Combobox label="backend (rtl)" bind:value={backendRtl} options={backendOptions} />
          <TagsInput label="stack (rtl)" bind:tags={rtlTags} suggestions={tagSuggestions} maxTags={4} />
          <span class="text-muted-foreground text-[12px]">
            dir="rtl" — chevron inline-start, panel edge inline-start, chips right-first
          </span>
        </div>
        <CodeBlock code={comboboxUsage} lang="svelte" meta="Combobox usage" />
        <CodeBlock code={tagsUsage} lang="svelte" meta="TagsInput usage" />
      </div>
    </SectionCard>
  </div>

  <!-- number stepper -->
  <div id="number-input" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="number-input"
      eyebrow="number-input"
      title="number-input — the [- NUM +] stepper"
      summary="A segmented control, not a text-field fork: two full-height 28px-wide stepper buttons (text glyphs in font-nav bold — no icon dependency) around a borderless, centered native number input whose spinners are hidden but whose ↑/↓ stepping survives. The row renders at the family's 40px law like every text-like control. Click steps once and clamps into [min, max]; hold accelerates — one step, 300ms, then a step every 100ms until you release. Typing is first-class: the value commits on change and clamps."
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
            <span class="text-muted-foreground text-[12.5px]">
              buttons disable in lockstep · input readonly — frozen but readable
            </span>
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

  <!-- file input -->
  <div id="file-input" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="file-input"
      eyebrow="file-input"
      title="File input — the professional control"
      summary="Files as first-class data, split out of the native lane: File[] is the $bindable contract, and every file carries an id plus — for images — an object-URL preview that is revoked the moment you remove it (or the component unmounts). Three variants: list rows (type glyph + name + size + remove), cards (thumbnail grid, remove on hover), compact (a one-line summary that expands). Three sizes scale the trigger and the rows. The type glyphs are zero-dependency — inline SVG for image/video/audio/pdf/doc, a font-nav &lt;/&gt; for code — and maxFiles reports overflow into the error line without ever truncating the array: the caller decides."
    >
      <div class="flex flex-col gap-6">
        <CardGrid min="230px">
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <FileInput label="avatar (list)" accept="image/*" bind:files={avatarFiles} />
            <span class="text-muted-foreground text-[12.5px]">
              bound File[] · length: <code class="text-accent">{avatarFiles.length}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <FileInput label="attachments (multiple)" multiple bind:files={batchFiles} />
            <div class="flex flex-wrap items-center gap-2">
              <PressButton onclick={() => (batchFiles = [...batchFiles, sampleText(`log-${batchFiles.length + 1}.txt`, 2), sampleImage(140, `shot-${batchFiles.length + 1}`)])}>seed samples</PressButton>
              <span class="text-muted-foreground text-[12.5px]">
                length: <code class="text-accent">{batchFiles.length}</code>
              </span>
            </div>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <FileInput label="gallery (cards)" variant="cards" multiple accept="image/*" bind:files={cardFiles} />
            <div class="flex flex-wrap items-center gap-2">
              <PressButton onclick={loadCardSamples}>load 3 svg samples</PressButton>
              <span class="text-muted-foreground text-[12.5px]">previews via object URLs</span>
            </div>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <FileInput label="uploads (compact)" variant="compact" multiple bind:files={compactFiles} />
            <div class="flex flex-wrap items-center gap-2">
              <PressButton onclick={() => (compactFiles = [sampleText('manifest.json', 1), sampleText('trace.log', 8)])}>seed samples</PressButton>
            </div>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <FileInput label="sizes" size="sm" multiple bind:files={sizeFiles} />
            <FileInput label="md (default)" multiple bind:files={sizeFiles} />
            <FileInput label="lg" size="lg" multiple bind:files={sizeFiles} />
            <div class="flex flex-wrap items-center gap-2">
              <PressButton onclick={() => (sizeFiles = [sampleImage(165, 'bezel'), sampleText('index.ts', 3), sampleText('thesis.pdf', 512)])}>seed mixed kinds</PressButton>
            </div>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <FileInput label="evidence (maxFiles 2)" multiple maxFiles={2} bind:files={overflowFiles} />
            <div class="flex flex-wrap items-center gap-2">
              <PressButton onclick={loadOverflow}>load 3 files</PressButton>
              <span class="text-muted-foreground text-[12.5px]">overflow reports — never truncates</span>
            </div>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <FileInput label="manifest" error="checksum mismatch — re-upload" multiple bind:files={errorFiles} />
            <span class="text-muted-foreground text-[12.5px]">
              the error prop overrides the maxFiles line when both fire
            </span>
          </div>
        </CardGrid>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Choose from the platform picker (the trigger presses; the native input stays
          keyboard-reachable behind it) or seed the samples to see the rows: image files render
          their mountain-and-sun glyph in the brand primary, code files get the font-nav
          <code class="text-accent">&lt;/&gt;</code>, and sizes format B → KB → MB at one
          decimal. Removal revokes the preview URL immediately — no leaks, no dangling blobs.
        </p>
        <CodeBlock code={fileUsage} lang="svelte" meta="FileInput usage" />
      </div>
    </SectionCard>
  </div>

  <!-- date picker -->
  <div id="date-picker" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="date-picker"
      eyebrow="date-picker"
      title="Date picker"
      summary="No native &lt;input type='date'>, no date library: the panel is a Popover API surface — popover='auto' wired with popovertarget, so light dismiss, Escape, one-at-a-time, and top-layer rendering are the browser's — over hand-rolled calendar math (leap years, month lengths, Monday-first grid offsets, strict ISO parse/format/compare). single commits 'YYYY-MM-DD'; range binds a start/end pair with anchor / close / swap-when-backwards semantics and a third click re-anchoring. The grid is one focus stop: ↑↓←→ walk the cursor across month boundaries (the view follows), Enter commits, Escape is native. format changes the display only — the value stays ISO forever."
    >
      <div class="flex flex-col gap-6">
        <CardGrid min="230px">
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker label="deploy date" bind:value={deployDate} />
            <span class="text-muted-foreground text-[12.5px]">
              bound value: <code class="text-accent">{deployDate}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker label="review (locale display)" format="locale" bind:value={localeDate} />
            <span class="text-muted-foreground text-[12.5px]">
              display locale · value: <code class="text-accent">{localeDate ?? 'undefined'}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker
              label="windowed (min/max)"
              min="2026-08-04"
              max="2026-09-16"
              bind:value={windowedDate}
            />
            <span class="text-muted-foreground text-[12.5px]">
              outside days: opacity 0.3 · not-allowed
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker label="sprint (range)" mode="range" bind:range={sprintRange} />
            <span class="text-muted-foreground text-[12.5px]">
              start: <code class="text-accent">{sprintRange.start ?? '—'}</code> ·
              end: <code class="text-accent">{sprintRange.end ?? '—'}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker label="audit date" error="audit date is required" bind:value={auditDate} />
            <span class="text-muted-foreground text-[12.5px]">
              error wiring: aria-invalid + dashed trigger
            </span>
          </div>
        </CardGrid>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Open one and keep typing: the panel is a terminal bezel like the Select dropdown, the
          month label is font-nav uppercase with clamped ←/→ navigation, today reads a
          <code class="text-accent">--primary</code> border, selected days fill primary, and
          range interiors wash at
          <code class="text-accent">color-mix(--primary 14%, transparent)</code>. The trigger is
          the Select trigger's paint — ↑/↓ on it opens the panel, focus restitutes on every
          close path.
        </p>
        <CodeBlock code={dateUsage} lang="svelte" meta="DatePicker usage" />
      </div>
    </SectionCard>
  </div>

  <!-- range slider -->
  <div id="range-slider" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="range-slider"
      eyebrow="range"
      title="Range slider — fully custom"
      summary="No input[type=range] anywhere: a div with Pointer Events — pointerdown jumps and captures, move drags, touch-action none keeps the gesture on touch — over a 4px track (muted, radius 0) with a primary fill from the inline-start edge and a 16×16 SQUARE thumb: white fill, 1px border, primary while pressed, shadow-xs on hover. Keyboard carries the full aria slider contract (role=slider, ←→/↑↓ step, Home/End jump, tabindex 0); ticks draws one 4px mark per step as a repeating gradient; and every offset is logical, so dir=rtl mirrors fill, thumb, ticks and arrow keys with zero direction branches."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <div class="flex flex-col gap-3">
            <Range label="volume" bind:value={volume} min={0} max={100} />
            <span class="text-muted-foreground text-[12.5px]">
              pointerdown jumps · drag captures · value:
              <code class="text-accent">{volume}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <Range label="gain (ticks)" bind:value={gain} min={0} max={10} step={0.5} ticks />
            <span class="text-muted-foreground text-[12.5px]">
              step 0.5 · one mark per step · value: <code class="text-accent">{gain}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <Range label="tolerance" bind:value={tolerance} min={0} max={1} step={0.05} />
            <span class="text-muted-foreground text-[12.5px]">
              decimals snap at the step's precision · value:
              <code class="text-accent">{tolerance.toFixed(2)}</code>
            </span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Tab into a slider and drive it: ←→/↑↓ step by
          <code class="text-accent">step</code>, Home/End jump to the bounds, and the thumb takes
          the family's inset focus law. Double-click anywhere on the track to land there —
          the same jump a single pointerdown already performs. Geometry is entirely logical
          (<code class="text-accent">inset-inline-start</code> fill and thumb,
          <code class="text-accent">:dir(rtl)</code> tick ruler), so the mirrored layout below
          costs the component nothing.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">RTL + error wiring</h3>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
              <Range label="volume (rtl)" bind:value={volumeRtl} min={0} max={100} />
              <Range label="gain (rtl, ticks)" bind:value={gain} min={0} max={10} step={0.5} ticks />
              <span class="text-muted-foreground text-[12px]">
                fill grows from the right, ticks mirror, arrow keys flip — logical properties only
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <Range label="volume" error="volume is required" min={0} max={100} />
              <p class="text-muted-foreground text-pretty text-[13px] leading-6">
                The <code class="text-accent">error</code> prop is the family law on a custom
                control too: <code class="text-accent">aria-invalid</code> +
                <code class="text-accent">aria-describedby</code> ride the role=slider element, the
                readout takes the destructive mark, and the thumb border dashes — the monochrome
                invalid signal, no second hue.
              </p>
            </div>
          </div>
        </div>
        <CodeBlock code={rangeUsage} lang="svelte" meta="Range usage" />
      </div>
    </SectionCard>
  </div>

  <!-- color picker -->
  <div id="color-picker" data-reveal="" use:reveal>
    <SectionCard
      headerRegion="color-picker"
      eyebrow="color-picker"
      title="Color picker"
      summary="The one form member that is a full custom widget, because the native input[type=color] offers none of this: a terminal-bezel popover (native popover=auto + popovertarget — light dismiss, Escape and top layer are the browser's) holding a 200×150 saturation/value pad (pure-hue ground with white→transparent horizontal and black→transparent vertical overlays), a 12px full-spectrum hue bar, a hex/hsl/oklch format switch, a direct value input that parses any notation and reverts invalid pastes, and an Eye Dropper button when window.EyeDropper exists. OKLCH is the conversion hub — the token system's space — so every notation round-trips through one canonical model with zero dependencies (lib/color-utils)."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <div class="flex flex-col gap-3">
            <ColorPicker label="brand (hex)" bind:value={brandColor} />
            <span class="text-muted-foreground text-[12.5px]">
              bound value: <code class="text-accent">{brandColor}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <ColorPicker label="accent (oklch)" bind:value={accentColor} format="oklch" />
            <span class="text-muted-foreground text-[12.5px]">
              notation follows format · value: <code class="text-accent">{accentColor}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <ColorPicker label="swatch only" bind:value={swatchOnly} showValue={false} />
            <span class="text-muted-foreground text-[12.5px]">
              showSwatch / showValue shape the trigger
            </span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Open one and drag: the SV pad maps color space (saturation right, value up) pinned to
          ltr — the trigger, not the map, is what rtl mirrors — and both pad and bar drive through
          Pointer Events with capture. Switching format re-emits the SAME color in the new
          notation; pasting <code class="text-accent">#0f2</code> into an oklch picker parses,
          converts through OKLCH, and commits canonical oklch text. The panel anchors under the
          trigger with CSS Anchor Positioning (flip-block fallback; engines without it get the
          authored viewport-center), and focus restitutes to the trigger on every close path.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">error wiring</h3>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <ColorPicker label="theme hue" error="theme hue is required" bind:value={errorColor} />
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              Same law as every family member: label[for] binds to the trigger (a button is
              labelable), <code class="text-accent">error</code> dashes the trigger border and
              wires <code class="text-accent">aria-invalid</code> +
              <code class="text-accent">aria-describedby</code> to the “! message” line.
            </p>
          </div>
        </div>
        <CodeBlock code={colorUsage} lang="svelte" meta="ColorPicker usage" />
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
              <code class="text-accent">range</code> keeps the native slider and color keeps its
              picker (height-aligned); file and dates have their own professional controls —
              file-input (previews, variants, maxFiles) and date-picker (a zero-dep calendar
              popover) — while their bare native types still pass through this component.
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

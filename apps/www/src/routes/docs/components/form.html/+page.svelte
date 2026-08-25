<!--
  form — the family hub (docs-restructure P0, 2026-08-25).
  The old single page carried 13 components; each now owns a canonical
  page (registry item + catalog entry) and this route demotes itself to
  the hub: the three field-shape guides, a catalog-driven link grid, and
  the NativeHTML law explainer. The historical anchors (#all-types,
  #select-textarea, #example-form) survive on the group headings, so
  every legacy deep link keeps resolving. NOT a registry item itself —
  no prev/next, no inventory membership.
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import OverviewCard from '$lib/overview-card.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { CATALOG, type CatalogEntry } from '$lib/catalog';

  // ToC outline: the three anchor groups + the law, in page order. The
  // ids ARE the legacy anchors of the old single page.

  // A literal closing-script tag inside the code string would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

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

<!-- pure-CSS selectors (appearance-none + pseudo-element glyphs) -->
<Checkbox label="subscribe" labelSide="left" />
<Radio label="pro" name="plan" />
<Toggle label="notifications" bind:checked />

<!-- the select split: NativeSelect (FormData pair) vs Select (popover) -->
<NativeSelect label="plan" name="plan">
  <option value="free">free</option>
</NativeSelect>

<!-- the customs: stepper, files, dates, slider, oklch picker, search -->
<NumberInput label="workers" bind:value={workers} min={1} max={16} />
<Range label="volume" bind:value={volume} min={0} max={100} />`;

  // ---- hub groups: ids are the LEGACY anchors -------------------------------
  // Each group keeps its historical hash resolving onto the heading of
  // its link grid; members are registry names looked up in the catalog.
  interface HubGroup {
    id: string;
    title: string;
    zh: string;
    guide: string;
    members: string[];
  }

  const hubGroups: HubGroup[] = [
    {
      id: 'all-types',
      title: 'Native lanes & full customs',
      guide:
        'The native control is the contract: input passes every native type through untouched (only the shell repaints), number-input adds the [- NUM +] stepper, and the controls the platform cannot paint our way are full customs — range (the pointer-events slider), color-picker (the oklch-hub popover), date-picker (the zero-dep calendar), combobox and tags-input (the searchable pair), and file-input (the professional file picker).',
      members: [
        'input',
        'number-input',
        'range',
        'date-picker',
        'color-picker',
        'combobox',
        'tags-input',
        'file-input',
      ],
    },
    {
      id: 'select-textarea',
      title: 'The select family & the multiline shell',
      guide:
        'The select family splits in two: native-select keeps the platform popup (a real name/value pair in FormData, the OS overlay picker on touch) while select builds a popover listbox with per-option descriptions and roving ↑/↓/Enter highlight — reach for the rich one only when the native popup can\u2019t say what you need. textarea is the same text-shell law as input, taller, resize locked to the vertical axis.',
      members: ['native-select', 'select', 'textarea'],
    },
    {
      id: 'example-form',
      title: 'The pure-CSS selectors',
      guide:
        'Three controls where the paint deserved its own drawing code: checkbox, radio, and toggle strip appearance and draw their glyphs with pseudo-elements — a clip-path check, a scaled dot, a sliding knob — while the native input keeps form participation, keyboard toggling, and :checked/:indeterminate state. Zero icon fonts, zero SVG; compose them into forms with the family\u2019s uncontrolled FormData flow (the old example-form story lives on each child page).',
      members: ['checkbox', 'radio', 'toggle'],
    },
  ];

  // catalog lookup per member name — the hub renders the SAME metadata
  // the overview page and the nav consume (no second copy to drift)
  const byName = new Map(CATALOG.map((entry) => [entry.name, entry]));

  function member(name: string): CatalogEntry {
    const entry = byName.get(name);
    if (!entry) {
      throw new Error(`form hub member "${name}" missing from the catalog — registry.json meta drift`);
    }
    return entry;
  }
</script>

<svelte:head>
  <title>Form family · jixoai-ui</title>
  <meta
    name="description"
    content="Data Entry forms — the family hub. The jixoai NativeHTML form base split into canonical pages: native lanes and full customs (input, number-input, range, date-picker, color-picker, combobox, tags-input, file-input), the select family and textarea (native-select, select), and the pure-CSS selectors (checkbox, radio, toggle). The three family laws: native type passthrough, repaint-never-replace, label[for] + aria wiring."
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
      title="Data Entry forms — the family hub"
      summary="The form family names its components after the elements they are, and each now owns a canonical page. The native control is the contract: every input type passes through untouched, and the only repaint is the shell — border, background, the inset focus outline. The selectors redraw their own paint in pure CSS (checkbox, radio, toggle strip appearance and draw their glyphs with pseudo-elements while the native input keeps every behavior). The select family splits in two — NativeSelect keeps the platform popup, Select builds a popover listbox — and the two controls the platform cannot paint our way split out as full customs: range (the fully custom slider) and color-picker (the oklch-hub popover). This hub keeps the tour; the depth lives one hop away."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">14 canonical pages</span>
        <span class="pill">all native types</span>
        <span class="pill">pure-CSS selectors</span>
        <span class="pill">select split: native + popover</span>
        <span class="pill">custom range + oklch color-picker</span>
        <span class="pill">label[for] + aria wiring</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- hub groups: the id on each heading IS the legacy anchor -->
  {#each hubGroups as group (group.id)}
    <section id={group.id} aria-label={group.title} data-region={group.id}>
      <h2
        class="font-nav flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]"
        data-reveal=""
      >
        {group.title}
        <span class="bg-border h-px flex-1" aria-hidden="true"></span>
      </h2>
      <p class="text-muted-foreground mt-3 max-w-[80ch] text-pretty text-[13px] leading-6" data-reveal="">
        {group.guide}
      </p>
      <!-- min narrower than the overview default: these blurbs are short,
           three-up reads better through the laptop band -->
      <CardGrid class="mt-6" min="260px">
        {#each group.members as name (name)}
          {@const entry = member(name)}
          <!-- the card re-opts into the shared subgrid rows (homepage law);
               CardGrid owns the staggered entrance — no data-reveal here -->
          <OverviewCard
            name={entry.name}
            type={entry.type.replace('registry:', '')}
            summary={entry.summary}
            href={entry.href}
            command="npx jixoai-ui add {entry.name}"
          />
        {/each}
      </CardGrid>
    </section>
  {/each}

  <!-- NativeHTML base explainer -->
  <div id="native-base" data-reveal="">
    <SectionCard
      family="native-base"
      headerRegion="native-base"
      eyebrow="law"
      title="the NativeHTML base"
      summary="Why the family is named after the elements: the component adds semantics and paint, never a second control. Three rules carry the whole base."
    >
      <div class="flex flex-col gap-5">
        <ol class="flex flex-col gap-3">
          <li class="flex flex-col gap-1">
            <p class="text-[13.5px] font-semibold">1 · native type passthrough — the type prop IS the native type</p>
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
            <p class="text-[13.5px] font-semibold">2 · repaint strategy — keep the input, redraw the paint</p>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              The split happens at the paint, never the control. checkbox / radio / toggle set
              <code class="text-accent">appearance: none</code> and draw their own glyphs with
              pseudo-elements — a clip-path check, a scaled dot, a sliding knob — while the
              native input underneath still owns state, keyboard toggling, and FormData.
              The remaining platform widgets are repainted by the Tier-1 class vocabulary (jx-pure Part A):
              <code class="text-accent">range</code> becomes the pure-CSS slider (the zero-JS
              cqw shadow fill, square thumb), color becomes the swatch-plus-pipette field, and
              the date/time/number lanes restyle the platform's own picker indicator and
              spinners; file and dates have their own professional controls —
              file-input (drop zone, thumbnail rows, maxFiles) and date-picker (a zero-dep
              calendar popover) — while their bare native types still pass through this component.
            </p>
          </li>
          <li class="flex flex-col gap-1">
            <p class="text-[13.5px] font-semibold">3 · label / error wiring — label[for] + aria-describedby</p>
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
</div>

<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import ComponentCanvas, { type TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import FileInput from '$lib/ui/file-input/file-input.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import fileInputSource from '$lib/ui/file-input/file-input.svelte?raw';

  // A literal closing-script tag inside a code string would terminate this
  // component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- demo state ---------------------------------------------------------
  let demoFiles = $state<File[]>([]);
  let dropFiles = $state<File[]>([]);
  let gateFiles = $state<File[]>([]);
  let lastRejected = $state<string | undefined>(undefined);
  let multiFiles = $state<File[]>([]);
  let buttonFiles = $state<File[]>([]);
  let disabledFiles = $state<File[]>([]);
  let narrowFiles = $state<File[]>([]);

  function sampleImage(hue: number, name: string): File {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="hsl(${hue} 45% 88%)"/><path d="M0 360 180 130 300 290 390 200 480 360Z" fill="hsl(${hue} 55% 38%)"/><circle cx="370" cy="80" r="34" fill="hsl(${hue} 80% 62%)"/></svg>`;
    return new File([svg], `${name}.svg`, { type: 'image/svg+xml' });
  }
  function sampleText(name: string, kilobytes: number): File {
    return new File([`x`.repeat(1024 * kilobytes)], name, { type: 'text/plain' });
  }

  // an unbroken monster filename — the overflow section's worst case
  const monsterName =
    'jixoai-ui-registry-file-input-screenshot-2026-08-23T14.32.07.481Z-full-res-no-spaces.png';

  function seedMulti(): void {
    multiFiles = [
      sampleImage(150, 'phosphor-grid'),
      sampleText('press-button.svelte', 2),
      sampleText('registry-snapshot.pdf', 512),
      sampleImage(220, 'spawn-diagram'),
    ];
  }

  // ---- canvas playground ---------------------------------------------------
  // Playground protocol: the page owns the snapshot + reset; the echo footer
  // replaces hand-written captions; the usage file tracks live state.
  const canvasInitial = {
    variant: 'drop' as 'drop' | 'button',
    multiple: true,
    disabled: false,
  };
  let canvasVariant = $state(canvasInitial.variant);
  let canvasMultiple = $state(canvasInitial.multiple);
  let canvasDisabled = $state(canvasInitial.disabled);
  function resetCanvas(): void {
    canvasVariant = canvasInitial.variant;
    canvasMultiple = canvasInitial.multiple;
    canvasDisabled = canvasInitial.disabled;
    demoFiles = [];
  }

  // the segmented control speaks the same closed union — no string casting
  const variantOptions: { value: typeof canvasVariant; label: string }[] = [
    { value: 'drop', label: 'drop' },
    { value: 'button', label: 'button' },
  ];

  const usageLive = $derived(`<FileInput
  label="demo"
  variant="${canvasVariant}"${canvasMultiple ? '\n  multiple' : ''}${canvasDisabled ? '\n  disabled' : ''}
  bind:files
/>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // static seed for the drawer copy; resolveUsage swaps in the LIVE usage
  // (lazy read inside the canvas's render — never a stale snapshot)
  const canvasUsage = `<FileInput
  label="demo"
  variant="drop"
  multiple
  bind:files
/>`;

  // ---- the eight axes demos: code shown = code running --------------------
  const universalUsage = `<FileInput label="px number" size={14} density="small" />
<FileInput label="named steps" size="large" radius="medium" />
<FileInput label="query()" density={query({ md: 'default' }, 'small')} multiple />`;

  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/file-input-universal.svelte', content: universalUsage },
  ];

  // the ONE query() case: responsive density through the alias seams —
  // tight guests below 48rem, the default rung at 48rem+. The STRING
  // lane pins BOTH generics (the §6 typing law).
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'default' }, 'small');

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/file-input.svelte', content: fileInputSource },
    { name: 'src/lib/ui/file-input-usage.svelte', content: canvasUsage, kind: 'usage' },
  ];

  const usage = `<script lang="ts">
  import FileInput from '@ui/file-input.svelte';
${close}

<!-- drop (default): dashed zone + rows below; drops that violate accept
     never enter the value — the error line reports, onreject callbacks -->
<FileInput label="avatar" accept="image/*" bind:files={avatar} />

<!-- compact trigger posture; multiple appends, maxFiles only reports -->
<FileInput label="logs" variant="button" multiple maxFiles={5} bind:files={logs} />

<!-- hint overrides the composed "accept: … · max: N" line -->
<FileInput label="evidence" multiple hint="pdf only — 10 MB each" bind:files={evidence} />

<!-- capture rides the rest spread to the native input — the mobile
     platform picker opens its camera face-to-face -->
<FileInput label="photo" accept="image/*" capture="environment" />`;

  // ---- canvas-everywhere sweep (2026-09-08) --------------------------------
  // Usage mirrors for the SectionCard demos below — hand-authored to match
  // each stage's markup (the same-source migration of these strings is the
  // recorded follow-up; they are NOT machinery, just honest mirrors).
  const fileInputDropDemo = `<script lang="ts">
  import FileInput from '@ui/file-input.svelte';
${close}

<div class="grid gap-5 min-[760px]:grid-cols-2">
  <FileInput label="drop zone" multiple bind:files={dropFiles} />
  <FileInput
    label="gate — accept: image/*"
    accept="image/*"
    multiple
    onreject={(rejected) => (lastRejected = rejected.map((f) => f.name).join(', '))}
    bind:files={gateFiles}
  />
</div>`;

  const fileInputRowsDemo = `<script lang="ts">
  import FileInput from '@ui/file-input.svelte';
${close}

<div class="grid gap-5 min-[760px]:grid-cols-3">
  <FileInput label="xs rows" density="xs" multiple bind:files={multiFiles} />
  <FileInput label="default rows" density="default" multiple bind:files={multiFiles} />
  <FileInput label="lg rows" density="lg" multiple bind:files={multiFiles} />
</div>`;

  const fileInputPosturesDemo = `<script lang="ts">
  import FileInput from '@ui/file-input.svelte';
${close}

<div class="grid gap-5 min-[760px]:grid-cols-2">
  <FileInput label="inline (button)" variant="button" multiple bind:files={buttonFiles} />
  <FileInput label="frozen" multiple disabled bind:files={disabledFiles} />
</div>`;

  const fileInputHostDemo = `<script lang="ts">
  import FileInput from '@ui/file-input.svelte';
${close}

<!-- 390px: the iPhone-class viewport the hardening is tested against -->
<div class="w-[390px] max-w-full border-border border p-4">
  <FileInput label="390px host" multiple bind:files={narrowFiles} />
</div>`;

  const fileInputVariantsDemo = `<script lang="ts">
  import FileInput from '@ui/file-input.svelte';
${close}

<div class="grid gap-4 sm:grid-cols-2">
  <div class="flex flex-col gap-3 border border-border p-4">
    <FileInput label="drop zone (default)" multiple />
    <span class="text-muted-foreground text-[12px]">dashed zone · hint composed from the props</span>
  </div>
  <div class="flex flex-col gap-3 border border-border p-4">
    <FileInput label="button trigger" variant="button" multiple />
    <span class="text-muted-foreground text-[12px]">compact inline posture · drop support included</span>
  </div>
  <div class="flex flex-col gap-3 border border-border p-4">
    <FileInput label="accept gate" accept="image/*" multiple />
    <span class="text-muted-foreground text-[12px]">dropped non-images are rejected, never bound</span>
  </div>
  <div class="flex flex-col gap-3 border border-border p-4">
    <FileInput label="error" multiple error="a screenshot is required" />
    <span class="text-muted-foreground text-[12px]">dashed destructive surfaces + the “! message” line</span>
  </div>
</div>`;

  // the measured per-axis rows (task 25 probe: /tmp/vellum-25-fi-probe.mjs
  // output): every consumption claim carries its measurement or grep receipt.
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "LIVE THROUGH THE ALIAS SEAMS — the fleet's deepest adoption. The root aliases the closed control contract (--jx-file-h ← --jx-hit, --jx-file-thumb/--jx-file-icon ← --jx-icon, --jx-file-text ← --jx-text, --jx-file-zone-pad/--jx-file-zone-glyph ← --jx-inset/--jx-icon) and every knob follows. Measured across xs/sm/default/lg: the drop zone's min-height 63 / 72 / 90 / 108px (exactly hit × 2.25); the list rows 28 / 40 / 48px min-height; the thumb box 18 / 22 / 26px (icon + the 2px hairline pair); the file-name voice 11 / 13 / 15px; the scaffold label 10 / 11 / 12 / 14px. THE FIXED EXCEPTION, measured: the zone's uppercase title rides the typed --text-label step and stays 11px at every rung. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE §11 ECHO, NOTHING FOLLOWS — the stamp lands verbatim (measured root inline: --jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem); computed 14px / 18px at the two demo lanes), and every family voice is a var() channel or a typed px step: the knob aliases are px ladders, the zone title the typed 11px label, the hint the 10.5px micro seam. Nothing is em-of-parent. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps the carriers; zero readers in the family (grep receipt). The zone, the trigger and the list are squared by the family box law: borderRadius 0. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-radius-effective; zero readers (grep receipt). borderRadius 0 on the zone, the trigger and the list — the square picker look the redesign kept. Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-color-effective; zero readers in the family (grep receipt). The ink is the typed token set (--jx-foreground/--jx-muted-foreground) plus the raw machines: the drag-over dash turns var(--primary), invalid surfaces var(--destructive). Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE BRIDGE + THE SPLIT — the .dark class lands on the field root and the answer depends on the emission form. TYPED POLE (frozen at :root): the zone's border AND ground — measured inside a .dark scope the border stays oklch(0 0 0) and the ground keeps its light pole, so the zone still reads light while the island is dark. RAW MACHINES (flip): the well sweep's resting/hover shadows (measured flipping to the white-inset dark well), the row hairline var(--border), the drag ink var(--primary), the focus ring, the remove/clear hover ink. A dropped zone in a dark scope keeps its light canvas — the honest drop-target look. light/system/auto ride tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero carrier reads (grep receipt). The shadows the family carries are two trigger laws, not the lane: the press seams (--jx-press-shadow / -hover / -active riding --shadow-2xs/xs/sm + the press pair, typed atoms) and the F-1 well sweep (raw var(--shadow-well) resting, -hover deepening — with the drag-over lift keeping its transient shadow). Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'AXIS SUPPLY-ONLY, KERNELS LIVE — the carrier --jx-motion-effective is unread (grep receipt). The family’s motion rides the sheet kernels: var(--motion-150) ease-out transitions (the zone glyph/title ink crossfade to the primary drag ink, the remove × color+transform, the clear link), the press translate physics, and the prefers-reduced-motion kill over the whole set (its own selector repeated to match the :is() specificity). Number unit: coefficient.',
    },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

</script>

<svelte:head>
  <title>File input · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai file input, redesigned (2026-08-23): a file picker that reads like one — ant-design Upload anatomy with local-picker semantics. The default drop variant paints a dashed 1px zone (upload glyph, CLICK OR DRAG FILES, composed accept/max hint) that turns primary and lifts under a file drag; variant=button is the compact inline trigger. Both are keyboard buttons over a visually hidden native input AND real drop targets, with accept gate-rejection (error line + onreject, rejected files never enter the File[] value). Selected files render as rows in one bordered box: square thumb (image object-URL preview or kind glyph), ellipsized name, size, remove ×. File[] is the $bindable contract; maxFiles reports overflow without truncating; InputGroup law hardening (min-width 0, max-width 100%) keeps 390px hosts safe."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="file-input — a picker that reads like one"
      summary="2026-08-23 redesign: the old trigger was indistinguishable from a button and long filenames broke layouts. The anatomy is borrowed from ant-design Upload with LOCAL-picker semantics — no network, no fake upload progress: a dedicated drop zone (or compact button trigger) plus a selected-file list below, exactly where ant puts it. The zone is a real <button> (Enter/Space open the platform picker) and a real drop target (enter-depth counting, file-drag detection); accept violations are gate-rejected — reported, never entering the value."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">drop zone · button trigger</span>
        <span class="pill">real drag-and-drop</span>
        <span class="pill">accept gate-rejection</span>
        <span class="pill">thumbnail rows + remove</span>
        <span class="pill">390px-safe hardening</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- the demo-standard skeleton: Install then Overview then Usage sit
       ABOVE the demos — Intro → Install → Usage → Examples → API →
       See Also is the page law (docs-eight-axes-mdn task 25) -->
  <div data-reveal="">
    <DocsInstall name="file-input" />
  </div>

  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="Ant's Upload anatomy over LOCAL-picker semantics: an acquisition trigger, an accept gate, and an honest selected-file list — no network, no status theater."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          Two trigger postures over one visually hidden native input: the default
          <code class={cx(rt.inkAccent)}>drop</code> zone (dashed 1px — the dash is reserved for
          drop targets and invalid shells, so the drag-over swap to
          <code class={cx(rt.inkAccent)}>--primary</code> can never read as an error) and the compact
          <code class={cx(rt.inkAccent)}>button</code> trigger. The zone's hint line is composed honestly from the
          field's own contract (<code class={cx(rt.inkAccent)}>accept: image/* · max: 3 files · single file</code>) and a
          <code class={cx(rt.inkAccent)}>hint</code> prop overrides it. The gate is the honesty kernel: the
          platform picker filters by <code class={cx(rt.inkAccent)}>accept</code> itself, but DROPS bypass it — so drops
          are re-checked, and violating files never enter the bound File[]; they surface through
          the error line and the optional <code class={cx(rt.inkAccent)}>onreject</code> callback.
          <code class={cx(rt.inkAccent)}>maxFiles</code> reports overflow without truncating the array.
        </p>
        <p class={cx(rt.para)}>
          ONE accessible control: the visible trigger IS the picker for tabs and assistive tech —
          the native input is clipped, <code class={cx(rt.inkAccent)}>tabindex="-1"</code>,
          <code class={cx(rt.inkAccent)}>aria-hidden</code> (measured: Enter on the trigger reaches the platform
          filechooser; the native input is absent from the tab order). Both postures are real
          drop targets — an enter-depth counter defeats child-element flicker and
          <code class={cx(rt.inkAccent)}>dataTransfer.types</code> is checked so only file drags arm the pose
          (measured: an image and a .txt dropped together on an
          <code class={cx(rt.inkAccent)}>accept="image/*"</code> zone bind the png and reject the txt).
          Selected files render as ant-style rows in one bordered box — square thumb (a live
          object-URL preview for images, revoked on remove, on unmount, AND on external splices of
          the bound array; zero-dependency kind glyphs for everything else) | ellipsized name with
          a title tooltip | size | remove × — with a remove-all tail on multi-file lists.
        </p>
        <p class={cx(rt.para)}>
          The paint: density is this family's deepest axis — the root aliases the closed control
          contract (<code class={cx(rt.inkAccent)}>--jx-file-*</code> seams over the hit/icon/text/inset ladders) and the
          zone, rows, thumbs and voices all step with the rung (measured in the axis table).
          Theme splits by emission form: the zone's typed border and ground freeze at the :root
          pole while the well shadow, the drag ink and the row hairlines flip. The InputGroup
          hardening law applies (min-width 0 on every flex child, max-width 100% shells,
          ellipsized names) — 390px hosts survive unbroken filenames. Geometry is logical-property-only, so
          <code class={cx(rt.inkAccent)}>dir="rtl"</code> mirrors the rows with zero branches. Kinship:
          <code class={cx(rt.inkAccent)}>input</code> (the shell/label/error law),
          <code class={cx(rt.inkAccent)}>input-group</code> (the hardening law),
          <code class={cx(rt.inkAccent)}>press-button</code> (the press poses).
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Bind the File[] value; accept, maxFiles, and hint shape the zone's composed contract line. capture rides the rest spread to the platform picker."
    >
      <CodeBlock code={usage} lang="svelte" meta="FileInput usage" />
    </SectionCard>
  </div>

  <!-- live demo + playground -->
  <div id="fi-demo" data-reveal="">
    <ComponentCanvas
      title="file-input"
      description="The full control, live: pick through the zone, drag files onto it, remove rows. The playground swaps the trigger posture (drop / button), multiple, and disabled — the usage file in the drawer tracks every toggle."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/file-input.svelte"
      files={canvasFiles}
      stage="fill"
      onreset={resetCanvas}
      output={[
        { label: 'variant', value: canvasVariant },
        { label: 'multiple', value: canvasMultiple },
        { label: 'files', value: demoFiles.length },
      ]}
      resolveFileContent={resolveUsage}
    >
      <div class={cx(rt.fiLane)}>
        <FileInput
          label="demo"
          variant={canvasVariant}
          multiple={canvasMultiple}
          disabled={canvasDisabled}
          bind:files={demoFiles}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="variant">
            <PlaySegmented bind:value={canvasVariant} options={variantOptions} />
          </PlayRow>
          <PlayRow label="multiple">
            <PlayToggle bind:value={canvasMultiple} />
          </PlayRow>
          <PlayRow label="disabled">
            <PlayToggle bind:value={canvasDisabled} />
          </PlayRow>
          <PlayHelp>
            drag any file onto the trigger — the dashed border turns primary and the surface
            lifts while the drag hovers. Disabled freezes the trigger, drops and removal.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the drop zone -->
  <div id="fi-drop" data-reveal="">
    <SectionCard
      family="fi-drop"
      headerRegion="fi-drop"
      eyebrow="trigger"
      title="The drop zone — dashed by intent"
      summary="Dashed borders on this site mean two things: invalid shells and drop targets. The zone is the second: 1px dashed var(--border) at rest with the upload glyph, a font-nav CLICK OR DRAG FILES title, and a hint line composed honestly from the field's own contract (accept: image/* · max: 3 files · single file). Under a file drag the dash swaps to var(--primary) and the surface lifts — press physics from the trigger law, magnetism from ant's Dragger; it can never be mistaken for an error, because errors keep the monochrome dash plus the “! message” line."
    >
      <div class={cx(rt.col24)}>
        <ComponentCanvas
          title="file-input · drop zone"
          stage="fill"
          files={[{ name: 'file-input-drop-demo.svelte', content: fileInputDropDemo, kind: 'usage' }]}
        >
          <div class={cx(rt.grid760a)}>
            <div class={cx(rt.col12)}>
              <FileInput label="drop zone" multiple bind:files={dropFiles} />
              <span class={cx(rt.noteSmall)}>
                default variant · hint composed from the props ·
                <code class={cx(rt.inkAccent)}>{dropFiles.length}</code> files bound
              </span>
            </div>
            <div class={cx(rt.col12)}>
              <FileInput
                label="gate — accept: image/*"
                accept="image/*"
                multiple
                onreject={(rejected) => (lastRejected = rejected.map((f) => f.name).join(', '))}
                bind:files={gateFiles}
              />
              <span class={cx(rt.noteSmall)}>
                drag a non-image onto this one — the gate rejects it:
                {#if lastRejected}
                  <code class={cx(rt.inkAccent)}>{lastRejected}</code>
                {:else}
                  nothing rejected yet
                {/if}
              </span>
            </div>
          </div>
        </ComponentCanvas>
        <p class={cx(rt.para)}>
          The platform picker filters by accept on its own; the gate exists for DROPS, which
          bypass it. Rejected files never enter the bound File[] — the honest contract — they
          surface through the family error line (“N dropped files rejected — accept: …”) and the
          optional <code class={cx(rt.inkAccent)}>onreject</code> callback. The zone content itself is
          a snippet (<code class={cx(rt.inkAccent)}>{'{#snippet zone()}'}</code>) when a field needs
          its own illustration.
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- the file list -->
  <div id="fi-list" data-reveal="">
    <SectionCard
      family="fi-list"
      headerRegion="fi-list"
      eyebrow="presentation"
      title="The file list — ant rows, local truth"
      summary="Ant puts the selected files in a list under the trigger; so does this. One bordered box of hairline rows, each row [square thumb | name | size | remove ×]: the thumb is a live object-URL preview for images (revoked the instant the row is removed, the component unmounts, or the bound array is spliced externally) or a zero-dependency kind glyph for everything else — inline SVG for image/video/audio/pdf/doc, a font-nav </> for code. A “remove all” tail closes multi-file lists. There is no uploading/done/status theater: a local picker's rows are the truth, and the only statuses that exist are real (the error line's overflow/rejection reports)."
    >
      <div class={cx(rt.col20)}>
        <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gap8)}>
          <PressButton onclick={seedMulti}>seed 4 mixed files</PressButton>
          <PressButton onclick={() => (multiFiles = [])}>clear binding</PressButton>
          <span class={cx(rt.noteSmall)}>
            bound File[] · length: <code class={cx(rt.inkAccent)}>{multiFiles.length}</code>
          </span>
        </div>
        <ComponentCanvas
          title="file-input · rows"
          stage="fill"
          files={[{ name: 'file-input-rows-demo.svelte', content: fileInputRowsDemo, kind: 'usage' }]}
        >
          <div class={cx(rt.cpGrid760)}>
            <FileInput label="xs rows" density="xs" multiple bind:files={multiFiles} />
            <FileInput label="default rows" density="default" multiple bind:files={multiFiles} />
            <FileInput label="lg rows" density="lg" multiple bind:files={multiFiles} />
          </div>
        </ComponentCanvas>
        <p class={cx(rt.para)}>
          Every row is keyboard-operable: the × carries
          <code class={cx(rt.inkAccent)}>aria-label="remove NAME"</code> and the family's inset focus
          law; removal presses back into the page. The whole control is logical-property-only,
          so <code class={cx(rt.inkAccent)}>dir="rtl"</code> mirrors thumbs, names and buttons with
          zero branches.
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- variants + disabled -->
  <div id="fi-variants" data-reveal="">
    <SectionCard
      family="fi-variants"
      headerRegion="fi-variants"
      eyebrow="postures"
      title="button variant · disabled"
      summary="variant='button' is the compact posture for inline forms and space-tight rows: the same upload glyph and the same list below it, drop support included — the dashed drag-over state lands on the button itself. disabled freezes the whole control honestly: the trigger stops pressing, drops are ignored at the gate, every × goes inert, and the native input carries the disabled attribute for form semantics."
    >
      <ComponentCanvas
        title="file-input · postures"
        stage="fill"
        files={[{ name: 'file-input-postures-demo.svelte', content: fileInputPosturesDemo, kind: 'usage' }]}
      >
        <div class={cx(rt.grid760a)}>
          <div class={cx(rt.col12)}>
            <FileInput label="inline (button)" variant="button" multiple bind:files={buttonFiles} />
            <span class={cx(rt.noteSmall)}>
              compact trigger · drag-over dashes the button · same rows below
            </span>
          </div>
          <div class={cx(rt.col12)}>
            <FileInput label="frozen" multiple disabled bind:files={disabledFiles} />
            <span class={cx(rt.noteSmall)}>
              trigger inert · drops rejected · rows readable, removal locked
            </span>
          </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <!-- narrow hosts -->
  <div id="fi-overflow" data-reveal="">
    <SectionCard
      family="fi-overflow"
      headerRegion="fi-overflow"
      eyebrow="hardening"
      title="Narrow hosts — the InputGroup law"
      summary="The 2026-08-23 width-overflow fix is law, not tuning: min-width: 0 on the root and every flex child, max-width: 100% on the shells, ellipsized names with native title tooltips. An unbroken 100+-character filename in a 390px host ellipsizes inside its row; the size column and the × keep their flex-none footing; the shell never pushes past its host row."
    >
      <div class={cx(rt.col20)}>
        <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gap8)}>
          <PressButton
            onclick={() => (narrowFiles = [sampleImage(165, monsterName), sampleText(monsterName, 3)])}
          >seed monster filenames</PressButton
          >
          <span class={cx(rt.noteSmall)}>
            hover a row's name for the full title tooltip
          </span>
        </div>
        <ComponentCanvas
          title="file-input · 390px host"
          stage="center"
          files={[{ name: 'file-input-host-demo.svelte', content: fileInputHostDemo, kind: 'usage' }]}
        >
          <!-- 390px: the iPhone-class viewport the hardening is tested against;
               max-w-full keeps the demo itself honest on smaller screens -->
          <div class={cx(rt.fiPhone)}>
            <FileInput label="390px host" multiple bind:files={narrowFiles} />
          </div>
        </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

  </div>
</div>

<!-- Material3 standard sections (2026-08-26): types / a11y /
     theming / axes / api appended after the demo sections, same wrapper
     law as checkbox.html; Usage moved above the demos (task 25). -->
<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="FileInput variants"
      summary="The default drop zone, the compact button trigger, the accept-gated field, and the error state."
    >
      <ComponentCanvas
        title="file-input · variants"
        stage="fill"
        files={[{ name: 'file-input-variants-demo.svelte', content: fileInputVariantsDemo, kind: 'usage' }]}
      >
        <div class={cx(rt.gridSm2)}>
          <div class={cx(rt.fiPanel)}>
            <FileInput label="drop zone (default)" multiple />
            <span class={cx(rt.note12)}>dashed zone · hint composed from the props</span>
          </div>
          <div class={cx(rt.fiPanel)}>
            <FileInput label="button trigger" variant="button" multiple />
            <span class={cx(rt.note12)}>compact inline posture · drop support included</span>
          </div>
          <div class={cx(rt.fiPanel)}>
            <FileInput label="accept gate" accept="image/*" multiple />
            <span class={cx(rt.note12)}>dropped non-images are rejected, never bound</span>
          </div>
          <div class={cx(rt.fiPanel)}>
            <FileInput label="error" multiple error="a screenshot is required" />
            <span class={cx(rt.note12)}>dashed destructive surfaces + the “! message” line</span>
          </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="ONE accessible control: the visible trigger is the picker for tabs and assistive tech — the clipped native input drops out of the tab order and the a11y tree (measured: the trigger click reaches the platform filechooser; the native input is tabindex -1 + aria-hidden)."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the visible trigger button (the native input is aria-hidden, tabindex -1)' },
          { key: 'Enter / Space', action: 'Opens the platform file picker (measured — the trigger click requests the filechooser)' },
          { key: 'drag files', action: 'Both variants are real drop targets; accept violations are gate-rejected and never enter the value' },
          { key: '×', action: 'Removes one selected file; “remove all” clears a multi-file list' },
        ]}
        aria={[
          { name: 'aria-label', value: 'label / "choose file(s)"', description: 'On the trigger button — label[for] points at it too' },
          { name: 'aria-describedby', value: '{id}-error', description: 'The error line: prop error, maxFiles overflow, or drop rejection (measured wired after a rejected drop)' },
          { name: 'aria-label (×)', value: '"remove NAME"', description: 'On every list row remove button (type="button")' },
          { name: 'aria-label (list)', value: '"selected files"', description: 'On the selected-file list box' },
          { name: 'input', value: 'type="file", aria-hidden, tabindex -1', description: 'The native element: accepts/multiple/disabled ride it; it owns no accessible role' },
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
      summary="Family-local size knobs alias the closed density contract; resize the scope and the zone, rows, thumbs and voices follow (measured 63 / 72 / 90 / 108px zone ladder). One fixed exception: the zone title stays the typed 11px label at every rung."
    >
      <div class={cx(rt.col24)}>
        <DensityDemo>
          <FileInput label="density sample" />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-file-h', default: 'var(--jx-hit) — 28 / 32 / 40 / 48px (measured)', source: 'density', description: 'The height knob: row min-heights ride it; the zone multiplies ×2.25 — 63 / 72 / 90 / 108px (measured).' },
            { name: '--jx-file-thumb / --jx-file-icon', default: 'var(--jx-icon) — 16 / 18 / 20 / 24px (measured)', source: 'density', description: 'Thumb box = knob + 2px hairline (18 / 22 / 26px measured); the trigger glyph is 0.9× the icon knob.' },
            { name: '--jx-file-text', default: 'var(--jx-text) — 11 / 12 / 13 / 15px (measured)', source: 'density', description: 'The file-name and size voices; the remove × rides --jx-text/--jx-leading directly.' },
            { name: '--jx-file-zone-pad / --jx-file-zone-glyph', default: 'var(--jx-inset) / var(--jx-icon)', source: 'density', description: 'Zone padding and glyph knob.' },
            { name: 'label voice', default: '10 / 11 / 12 / 14px (measured)', source: 'density', description: 'The .jx-label scaffold’s --jx-text-secondary.' },
            { name: 'zone title', default: '11px FIXED at every rung (measured)', source: 'structural', description: 'The uppercase title rides the typed --text-label step — the one density-deaf voice, deliberately a label, not body copy.' },
            { name: '--jx-press-shadow / -hover / -active', default: '--shadow-2xs/xs/sm + press pair', source: 'component', description: 'The press seams on the zone and trigger — press-button physics without importing it.' },
            { name: 'well sweep', default: 'resting --shadow-well · hover -hover', source: 'structural', description: 'The F-1 fillable-surface law over both postures (raw sheet machines — the theme-flipping half).' },
          ]}
        />
      </div>
    </SectionCard>
  </div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive values. MEASURED, not claimed: density is the fleet's deepest adoption (the --jx-file-* alias seams step every knob); size is the §11 echo with nothing following; the theme split freezes the zone's typed canvas while the well/drag machines flip; shape/radius/color/elevation are supply-only."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the density ladder, the size echo, the frozen-zone contrast and the gate
          behavior were measured on this page's served DOM (probe, task 25); the supply-only rows
          carry grep receipts over src/lib/ui/file-input/. The universal demo folds in below,
          with a query() seat: the density lane rides the md viewport key (48rem) — base small
          below, the default rung at 48rem and wider.
        </p>
        <ComponentCanvas title="file-input · universal props" stage="fill" files={universalFiles}>
          <div class={cx(rt.gridSm2)}>
          <div class={cx(rt.panel)}><FileInput label="size 14 · density small" size={14} density="small" multiple /></div>
          <div class={cx(rt.panel)}><FileInput label="size large · radius medium" size="large" density="large" radius="medium" multiple /></div>
          <div class={cx(rt.panel)}><FileInput label="density md→default (query)" density={query<{ md: DensityLane }, DensityLane>({ md: 'default' }, 'small')} multiple /></div>
          </div>
        </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="22 meta rows − 8 ambient axes = 14 family rows; the table below serves the 11 contract rows (class forwards through cn to the root; the synthesized rest spread rides the native input — accept/multiple/disabled/capture are re-declared as props, everything else passes through). The File[] value is the $bindable contract; FileItem adds component-managed identity + previews."
    >
      <PropsTable
        universal
          props={[
          { name: 'files', type: 'File[]', default: '[]', description: 'Selected files; bound ⇒ controlled — removal and drops write back.', bindable: true },
          { name: 'variant', type: "'drop' | 'button'", default: "'drop' · Own default, not ambient", description: 'Dashed drop zone or compact inline trigger; both are buttons AND drop targets. Defaults: literal slot — own ’drop’, not ambient (a presentation mode, no axis).' },
          { name: 'accept', type: 'string', default: '—', description: 'Native accept attribute; dropped files violating it are gate-rejected.' },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow several files; the collection appends instead of replacing.' },
          { name: 'maxFiles', type: 'number', default: '—', description: 'Overflow limit — renders an error, never truncates the array.' },
          { name: 'hint', type: 'string', default: 'composed', description: 'Secondary zone hint; defaults to a composed "accept: … · max: N" line.' },
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the trigger.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: dashed destructive surfaces + the describedby line.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Freezes the trigger, drops, and per-row removal.' },
          { name: 'onreject', type: '(rejected: File[]) => void', default: '—', description: 'Fires with files a DROP brought in that violated accept.' },
          { name: 'zone', type: 'Snippet', default: '—', description: 'Replaces the drop zone\u2019s glyph + title + hint content.' },
        ]}
      />
      <PropsTable
        title="FileItem"
        props={[
          { name: 'file', type: 'File', default: '—', description: 'The native File object, exactly as the platform handed it over.', required: true },
          { name: 'id', type: 'string', default: '—', description: 'Internal management id — stable across re-renders per File identity.', required: true },
          { name: 'previewUrl', type: 'string', default: '—', description: 'Image preview object URL; revoked on remove / unmount / external splice.' },
        ]}
      />
    </SectionCard>
  </div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="file-input" />
  </div>
</div>

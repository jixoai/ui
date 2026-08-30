<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas, { type TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import FileInput from '$lib/ui/file-input/file-input.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import fileInputSource from '$lib/ui/file-input/file-input.svelte?raw';

  // A literal closing-script tag inside a code string would terminate this
  // component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ToC outline: the demo sections below, in page order.

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
<FileInput label="evidence" multiple hint="pdf only — 10 MB each" bind:files={evidence} />`;
</script>

<svelte:head>
  <title>File input · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai file input, redesigned (2026-08-23): a file picker that reads like one — ant-design Upload anatomy with local-picker semantics. The default drop variant paints a dashed 1px zone (upload glyph, CLICK OR DRAG FILES, composed accept/max hint) that turns primary and lifts under a file drag; variant=button is the compact inline trigger. Both are keyboard buttons over a visually hidden native input AND real drop targets, with accept gate-rejection (error line + onreject, rejected files never enter the File[] value). Selected files render as rows in one bordered box: square thumb (image object-URL preview or kind glyph), ellipsized name, size, remove ×. File[] is the $bindable contract; maxFiles reports overflow without truncating; InputGroup law hardening (min-width 0, max-width 100%) keeps 390px hosts safe."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="file-input — a picker that reads like one"
      summary="2026-08-23 redesign: the old trigger was indistinguishable from a button and long filenames broke layouts. The anatomy is borrowed from ant-design Upload with LOCAL-picker semantics — no network, no fake upload progress: a dedicated drop zone (or compact button trigger) plus a selected-file list below, exactly where ant puts it. The zone is a real <button> (Enter/Space open the platform picker) and a real drop target (enter-depth counting, file-drag detection); accept violations are gate-rejected — reported, never entering the value."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">drop zone · button trigger</span>
        <span class="pill">real drag-and-drop</span>
        <span class="pill">accept gate-rejection</span>
        <span class="pill">thumbnail rows + remove</span>
        <span class="pill">390px-safe hardening</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- live demo + playground -->
  <div id="fi-demo" data-region="fi-demo" data-family="fi-demo" data-reveal="">
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
      <div class="flex w-full max-w-md flex-col items-start gap-3">
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
      <div class="flex flex-col gap-6">
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3">
            <FileInput label="drop zone" multiple bind:files={dropFiles} />
            <span class="text-muted-foreground text-[12.5px]">
              default variant · hint composed from the props ·
              <code class="text-accent">{dropFiles.length}</code> files bound
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <FileInput
              label="gate — accept: image/*"
              accept="image/*"
              multiple
              onreject={(rejected) => (lastRejected = rejected.map((f) => f.name).join(', '))}
              bind:files={gateFiles}
            />
            <span class="text-muted-foreground text-[12.5px]">
              drag a non-image onto this one — the gate rejects it:
              {#if lastRejected}
                <code class="text-accent">{lastRejected}</code>
              {:else}
                nothing rejected yet
              {/if}
            </span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The platform picker filters by accept on its own; the gate exists for DROPS, which
          bypass it. Rejected files never enter the bound File[] — the honest contract — they
          surface through the family error line (“N dropped files rejected — accept: …”) and the
          optional <code class="text-accent">onreject</code> callback. The zone content itself is
          a snippet (<code class="text-accent">{'{#snippet zone()}'}</code>) when a field needs
          its own illustration.
        </p>
        <CodeBlock code={usage} lang="svelte" meta="FileInput usage" />
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
      summary="Ant puts the selected files in a list under the trigger; so does this. One bordered box of hairline rows, each row [square thumb | name | size | remove ×]: the thumb is a live object-URL preview for images (revoked the instant the row is removed or the component unmounts) or a zero-dependency kind glyph for everything else — inline SVG for image/video/audio/pdf/doc, a font-nav </> for code. A “remove all” tail closes multi-file lists. There is no uploading/done/status theater: a local picker's rows are the truth, and the only statuses that exist are real (the error line's overflow/rejection reports)."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-2">
          <PressButton onclick={seedMulti}>seed 4 mixed files</PressButton>
          <PressButton onclick={() => (multiFiles = [])}>clear binding</PressButton>
          <span class="text-muted-foreground text-[12.5px]">
            bound File[] · length: <code class="text-accent">{multiFiles.length}</code>
          </span>
        </div>
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <FileInput label="xs rows" density="xs" multiple bind:files={multiFiles} />
          <FileInput label="default rows" density="default" multiple bind:files={multiFiles} />
          <FileInput label="lg rows" density="lg" multiple bind:files={multiFiles} />
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Every row is keyboard-operable: the × carries
          <code class="text-accent">aria-label="remove NAME"</code> and the family's inset focus
          law; removal presses back into the page. The whole control is logical-property-only,
          so <code class="text-accent">dir="rtl"</code> mirrors thumbs, names and buttons with
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
      <div class="grid gap-5 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-3">
          <FileInput label="inline (button)" variant="button" multiple bind:files={buttonFiles} />
          <span class="text-muted-foreground text-[12.5px]">
            compact trigger · drag-over dashes the button · same rows below
          </span>
        </div>
        <div class="flex flex-col gap-3">
          <FileInput label="frozen" multiple disabled bind:files={disabledFiles} />
          <span class="text-muted-foreground text-[12.5px]">
            trigger inert · drops rejected · rows readable, removal locked
          </span>
        </div>
      </div>
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
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-2">
          <PressButton
            onclick={() => (narrowFiles = [sampleImage(165, monsterName), sampleText(monsterName, 3)])}
          >seed monster filenames</PressButton
          >
          <span class="text-muted-foreground text-[12.5px]">
            hover a row's name for the full title tooltip
          </span>
        </div>
        <!-- 390px: the iPhone-class viewport the hardening is tested against;
             max-w-full keeps the demo itself honest on smaller screens -->
        <div class="w-[390px] max-w-full border-border border p-4">
          <FileInput label="390px host" multiple bind:files={narrowFiles} />
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- usage -->
  
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
      title="FileInput variants"
      summary="The default drop zone, the compact button trigger, the accept-gated field, and the error state."
    >
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
      </div>
    </SectionCard>
  </div>
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Bind the File[] value; accept, maxFiles, and hint shape the zone's composed contract line."
    >
      <CodeBlock code={usage} lang="svelte" meta="FileInput usage" />
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="ONE accessible control: the visible trigger is the picker for tabs and assistive tech — the clipped native input drops out of the tab order and the a11y tree."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the visible trigger button (the native input is aria-hidden, tabindex -1)' },
          { key: 'Enter / Space', action: 'Opens the platform file picker' },
          { key: 'drag files', action: 'Both variants are real drop targets; accept violations are gate-rejected' },
          { key: '×', action: 'Removes one selected file; “remove all” clears a multi-file list' },
        ]}
        aria={[
          { name: 'aria-label', value: 'label / "choose file(s)"', description: 'On the trigger button — label[for] points at it too' },
          { name: 'aria-describedby', value: '{id}-error', description: 'The error line: prop error, maxFiles overflow, or drop rejection' },
          { name: 'aria-label (×)', value: '"remove NAME"', description: 'On every list row remove button (type="button")' },
          { name: 'aria-label (list)', value: '"selected files"', description: 'On the selected-file list box' },
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
      summary="Family-local size knobs alias the closed density contract; resize the scope and the zone, rows, and thumbs follow."
    >
      <div class="flex flex-col gap-6">
        <DensityDemo>
          <FileInput label="density sample" />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-file-h', default: 'var(--jx-hit)', source: 'component' },
            { name: '--jx-file-thumb', default: 'var(--jx-icon)', source: 'component' },
            { name: '--jx-file-text', default: 'var(--jx-text)', source: 'component' },
            { name: '--jx-file-zone-pad', default: 'var(--jx-inset)', source: 'component' },
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
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
      summary="Props spread onto the visually hidden native input; the File[] value is the $bindable contract and FileItem adds component-managed identity + previews."
    >
      <PropsTable
        props={[
          { name: 'files', type: 'File[]', default: '[]', description: 'Selected files; bound ⇒ controlled — removal and drops write back.', bindable: true },
          { name: 'variant', type: "'drop' | 'button'", default: "'drop'", description: 'Dashed drop zone or compact inline trigger; both are buttons AND drop targets.' },
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
          { name: 'previewUrl', type: 'string', default: '—', description: 'Image preview object URL; revoked on remove / unmount.' },
        ]}
      />
    </SectionCard>
  </div>
</div>

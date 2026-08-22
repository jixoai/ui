<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas, { type TreeFile } from '$lib/ui/component-canvas.svelte';
  import FileInput from '$lib/ui/file-input.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import Toggle from '$lib/ui/toggle.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import fileInputSource from '$lib/ui/file-input.svelte?raw';

  // A literal closing-script tag inside a code string would terminate this
  // component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ToC outline: the demo sections below, in page order.
  const tocSections = [
    { id: 'fi-demo', label: 'live demo' },
    { id: 'fi-drop', label: 'The drop zone' },
    { id: 'fi-list', label: 'The file list' },
    { id: 'fi-variants', label: 'button variant · disabled' },
    { id: 'fi-overflow', label: 'Narrow hosts' },
    { id: 'fi-usage', label: 'usage' },
  ];

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
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
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
  <div id="fi-demo" data-region="fi-demo" data-family="fi-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="file-input"
      description="The full control, live: pick through the zone, drag files onto it, remove rows. The playground swaps the trigger posture (drop / button), multiple, and disabled — the usage file in the drawer tracks every toggle."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/file-input.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[
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
        <div class="jx-play-fields">
          <div class="jx-play-field">
            <NativeSelect
              label="variant"
              onchange={(event) => {
                canvasVariant = event.currentTarget.value as typeof canvasVariant;
              }}
            >
              <option value="drop">drop</option>
              <option value="button">button</option>
            </NativeSelect>
          </div>
          <div class="jx-play-field">
            <Toggle
              label="multiple"
              bind:checked={canvasMultiple}
            />
          </div>
          <div class="jx-play-field">
            <Toggle
              label="disabled"
              bind:checked={canvasDisabled}
            />
          </div>
          <p class="jx-play-help">
            drag any file onto the trigger — the dashed border turns primary and the surface
            lifts while the drag hovers. Disabled freezes the trigger, drops and removal.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the drop zone -->
  <div id="fi-drop" data-reveal="" use:reveal>
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
  <div id="fi-list" data-reveal="" use:reveal>
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
          <FileInput label="sm rows" size="sm" multiple bind:files={multiFiles} />
          <FileInput label="md rows (default)" multiple bind:files={multiFiles} />
          <FileInput label="lg rows" size="lg" multiple bind:files={multiFiles} />
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
  <div id="fi-variants" data-reveal="" use:reveal>
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
  <div id="fi-overflow" data-reveal="" use:reveal>
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
  <div id="fi-usage" data-reveal="" use:reveal>
    <SectionCard family="fi-usage" headerRegion="fi-usage" eyebrow="composition" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

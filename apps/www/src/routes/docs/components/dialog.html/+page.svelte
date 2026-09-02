<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Dialog from '$lib/ui/dialog/dialog.svelte';
  import DialogHeader from '$lib/ui/dialog/dialog-header.svelte';
  import DialogFooter from '$lib/ui/dialog/dialog-footer.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { playOutputs, playState } from '$lib/playground';
  import { PlayFields, PlayRow, PlayHelp } from '$lib/playground';
  import { registrySourceUrl } from '$lib/registry-source';
  import { icons } from '$lib/icons';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import dialogSource from '$lib/ui/dialog/dialog.svelte?raw';

  let basicOpen = $state(false);
  let formOpen = $state(false);
  // footer-clusters / head / scroll demos (r14-9): one live instance each
  let clusterOpen = $state(false);
  let endOpen = $state(false);
  let headOpen = $state(false);
  let logOpen = $state(false);
  let headQuery = $state('');
  let lastAction = $state<string | null>(null);

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const basicUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

let open = $state(false);
${close}

<PressButton onclick={() => (open = true)}>Open dialog</PressButton>

<Dialog title="Deploy queued" bind:open>
  <p>build #128 is waiting for a runner. The log streams once it picks up.</p>
</Dialog>`;

  const formUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import DialogFooter from '@ui/dialog/dialog-footer.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

let open = $state(false);

const confirm = () => {
  open = false;
  // ...rotate the key
};
${close}

  <Dialog title="Rotate API key" bind:open>
  <p>Minting a new key revokes the current one after 24 hours.</p>
  {#snippet footer()}
    <DialogFooter>
      <PressButton onclick={() => (open = false)}>Cancel</PressButton>
      <PressButton variant="fill" onclick={confirm}>Rotate key</PressButton>
    </DialogFooter>
  {/snippet}
</Dialog>`;

  // footer clusters (r14-9): DialogFooter's children auto-join ONE
  // group — ghost by context, an explicit variant still wins
  const multiUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import DialogFooter from '@ui/dialog/dialog-footer.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

let open = $state(false);
${close}

<Dialog title="Publish release" bind:open>
  <p>v2.4.0 is staged — 14 commits since the last tag.</p>
  {#snippet footer()}
    <DialogFooter>
      <PressButton onclick={() => (open = false)}>Cancel</PressButton>
      <PressButton onclick={saveDraft}>Save draft</PressButton>
      <PressButton variant="fill" onclick={publish}>Publish</PressButton>
    </DialogFooter>
  {/snippet}
</Dialog>`;

  // end: DialogFooter's raw slot — present, it replaces the grouped
  // arrangement
  const endUsage = `<Dialog title="4 assets selected" bind:open>
  <p>crash-report.sites · tokens.json · hero.tape · audit.log</p>
  {#snippet footer()}
    <DialogFooter>
      {#snippet end()}
        <span class="font-mono text-[12px] text-muted-foreground">2.1 MB total</span>
        <PressButton variant="fill" onclick={downloadAll}>Download all</PressButton>
      {/snippet}
    </DialogFooter>
  {/snippet}
</Dialog>`;

  // custom head: DialogHeader wraps the custom content flush; title
  // keeps naming the dialog for AT while its visual row is gone
  const headUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import DialogHeader from '@ui/dialog/dialog-header.svelte';
  import Input from '@ui/input.svelte';
  import { icons } from '$lib/icons';
${close}

let open = $state(false);
let query = $state('');
${close}

<Dialog title="Filter events" bind:open>
  {#snippet head()}
    <DialogHeader>
      <Input class="w-full min-w-0" placeholder="Filter events…" bind:value={query} aria-label="Filter events">
        {#snippet innerInlineStart()}
          <span class="flex-none select-none text-muted-foreground" aria-hidden="true">{@html icons.search}</span>
        {/snippet}
      </Input>
    </DialogHeader>
  {/snippet}
  <!-- the body lists the events filtered by query -->
</Dialog>`;

  // scrolling body: the class prop caps the ring (geometry-only) so the
  // body zone scrolls while head and foot stay pinned
  const scrollUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import DialogFooter from '@ui/dialog/dialog-footer.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

let open = $state(false);
${close}

<Dialog
  title="Event log"
  bind:open
  class="[&_[data-jx-dialog-scroll]]:max-h-[22rem]"
>
  <ol class="flex flex-col gap-1 font-mono text-[12px]">
    {#each lines as line, i}
      <li class="flex gap-3"><span class="text-muted-foreground">{i + 1}</span>{line}</li>
    {/each}
  </ol>
  {#snippet footer()}
    <DialogFooter>
      <PressButton onclick={() => (open = false)}>Close</PressButton>
      <PressButton variant="fill" onclick={exportLog}>Export log</PressButton>
    </DialogFooter>
  {/snippet}
</Dialog>`;

  // the custom-head demo's filterable corpus and the scroll demo's log
  const events = [
    'runner picked up job #128',
    'cache restored in 412ms',
    'artifact uploaded: dist.tape',
    'lint clean — 0 warnings',
    'unit tests 61/61',
    'snapshot written (2.3 KB)',
    'deploy probe: healthy',
    'audit trail sealed',
  ];
  const filtered = $derived(
    headQuery.trim() === ''
      ? events
      : events.filter((e) => e.toLowerCase().includes(headQuery.trim().toLowerCase())),
  );
  const logLines = [
    'boot — kernel 6.9.4-arm64, 4 workers',
    'mount /workspace — 12 GB free',
    'env: node 22, pnpm 9, playwright 1193',
    'restore cache — hit (412ms)',
    'plan: apps/www build + 3 verify jobs',
    'step 1/6 — typecheck',
    'svelte-check 0 errors, 0 warnings',
    'step 2/6 — unit (vitest)',
    'dialog-grid.spec — 12 passed',
    'dialog-ghost-scope.spec — 9 passed',
    'search-client.spec — 14 passed',
    'print-freeze.spec — 34 passed',
    'step 3/6 — mirror gate',
    'mirror manifest — 2 files in sync',
    'step 4/6 — deps closure',
    'registry closure — clean',
    'step 5/6 — build site',
    'vite build — 99 pages, 2 noindex skipped',
    'search corpus — 832 sections indexed',
    'step 6/6 — verify print',
    'chromium 1193 launched',
    'pagedjs preview — 5 pages',
    'line-rhythm probe — nominal',
    'zero-rerun probe — renderId stable',
    'teardown — artifacts kept',
    'done in 214s',
    'publish — registry payload 1.8 MB',
    'cdn purge — 3 edges',
    'probe https://ui.jixoai.dev — 200',
    'probe /r/registry.json — 200',
    'probe /search/corpus.json — 200',
    'smoke: dialog demo opens',
    'smoke: footer clusters render',
    'smoke: custom head filters',
    'smoke: scrolling body pins zones',
    'nightly anchor — queued',
    'sleep until 02:00 UTC',
  ];

  // ---- component canvas (audit P1-A2): LIVE trigger + title playground --
  // ONE typed state object (canvas-floor-lab 2.1): open + title live in
  // play.current; reset() restores the documented defaults (closed,
  // "Deploy queued") with every binding still live.
  const play = playState({ open: false, title: 'Deploy queued' });

  // ToC outline: pairs with the section ids below, in page order.

  const canvasUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

let open = $state(false);
let title = $state('Deploy queued');
${close}

<PressButton onclick={() => (open = true)}>Open dialog</PressButton>

<Dialog {title} bind:open>
  <p>build #128 is waiting for a runner. The log streams once it picks up.</p>
</Dialog>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/dialog/dialog.svelte', content: dialogSource },
    { name: 'src/lib/ui/dialog-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Dialog · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai dialog component: a native <dialog> base — showModal() focus trap, ::backdrop scrim, Escape teardown — plus bindable open state and a 120ms close fade. Zero focus plumbing."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="dialog — the platform owns the hard parts"
      summary="One native <dialog> element, opened with showModal() and closed with close(). Focus trapping, the inert page behind, top-layer rendering above every sticky header, and the Escape key are browser features — the component only binds open state to them and adds a 120ms close fade. Closed dialogs render nothing in the page, with or without JavaScript."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">&lt;dialog&gt; + showModal()</span>
        <span class="pill">focus trap · inert · top layer</span>
        <span class="pill">::backdrop 14% brand</span>
        <span class="pill">Escape → cancel</span>
        <span class="pill">120ms close fade</span>
        <span class="pill">footer buttons auto-group · ghost</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench (audit P1-A2): LIVE trigger + title playground + sources -->
  <div data-reveal="">
    <ComponentCanvas
      title="dialog"
      description="One native <dialog> driven by showModal(): the browser owns the focus trap, Escape, and the top layer — the component adds bindable open state and a 120ms close fade. Retitle it from the Playground; preview the scrim in both stage themes."
      sourceUrl={registrySourceUrl('dialog')}
      install="dialog"
      files={canvasFiles}
      stage="center"
      onreset={() => play.reset()}
      output={playOutputs(play.current)}
    >
      <div class="flex flex-col items-center gap-5">
        <PressButton onclick={() => (play.current.open = true)}>Open dialog</PressButton>
      </div>
      <!-- closed dialogs render nothing — the instance lives right here in
           the stage; showModal() lifts it into the top layer when open -->
      <Dialog title={play.current.title} bind:open={play.current.open}>
        <p>build #128 is waiting for a runner. The log streams once it picks up.</p>
        {#snippet footer()}
          <DialogFooter>
            <PressButton onclick={() => (play.current.open = false)}>Close</PressButton>
          </DialogFooter>
        {/snippet}
      </Dialog>
      {#snippet playground()}
        <PlayFields>
          <!-- free-text prop: the kit has no text control, so the registry
               Input rides the standard row (PlayRow owns the label) -->
          <PlayRow label="title">
            <Input
              placeholder="Deploy queued"
              aria-label="title"
              class="w-40 text-[12.5px]"
              bind:value={play.current.title}
            />
          </PlayRow>
          <PlayHelp>
            the playground edits the <code>title</code> prop live — reopen the
            dialog to read the new heading in the header bar.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- Basic demo -->
  <div id="dialog-basic" data-reveal="">
    <SectionCard
      family="dialog-basic"
      headerRegion="dialog-basic"
      eyebrow="demo"
      title="Basic"
      summary="A PressButton flips a bindable open state; the dialog does the rest. Try the × button, the Escape key, and Tab — focus stays inside the dialog while the page behind is inert."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <PressButton onclick={() => (basicOpen = true)}>Open dialog</PressButton>
          <span class="text-muted-foreground text-[12.5px]">
            state: <code class="text-accent">open = {basicOpen}</code>
          </span>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Every exit — ×, Escape, or setting <code class="text-accent">open = false</code> from
          code — runs the same 120ms opacity fade before the real
          <code class="text-accent">close()</code>. Reduced-motion users get the instant close.
        </p>
        <CodeBlock code={basicUsage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <!-- Form demo -->
  <div id="dialog-form" data-reveal="">
    <SectionCard
      family="dialog-form"
      headerRegion="dialog-form"
      eyebrow="demo"
      title="With a footer — form type"
      summary="The footer snippet is the RAW override of the foot zone — and its standard content is <DialogFooter>: the buttons passed as children auto-join one button-group at the row's inline end, ghost by default through the Dialog's zone scope, an explicit fill still winning for the primary. Cancel drops the dialog; Confirm does its work first, then closes through the same animated path. The form shells inside DISSOLVE (the entity law): the dialog is the one solid object — the inputs ride its ground with the well inset alone, no competing borders or fills; focus still tints, hover still deepens."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <PressButton onclick={() => (formOpen = true)}>Rotate API key…</PressButton>
          <span class="text-muted-foreground text-[12.5px]">
            last action: <code class="text-accent">{lastAction ?? '—'}</code>
          </span>
        </div>
        <CodeBlock code={formUsage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <!-- Footer clusters (r14-9): DialogFooter's button economy -->
  <div id="dialog-footer-clusters" data-reveal="">
    <SectionCard
      family="dialog-footer-clusters"
      headerRegion="dialog-footer-clusters"
      eyebrow="demo"
      title="DialogFooter — the foot zone's button economy"
      summary="The footer snippet overrides the whole foot — and its standard content is the DialogFooter component. Buttons passed as its children auto-join ONE button-group packed at the row's inline end; the ghost default arrives by inheritance from the Dialog's zone scope (Context), so an unprefixed PressButton renders ghost while an explicit variant always wins, and the ghost seams rule the buttons. The cluster OPENS with a vertical separator spanning the zone height — the actions region's boundary line (r14-11). The end slot is the raw escape hatch — present, it replaces the grouped arrangement for non-button content or a fully custom cluster; the opening line stays."
    >
      <div class="flex flex-col gap-8">
        <p class="text-muted-foreground text-[12.5px]">
          last action: <code class="text-accent">{lastAction ?? '—'}</code>
        </p>
        <div class="flex flex-col gap-3">
          <p class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            a · DialogFooter children — three buttons, one auto group
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <PressButton onclick={() => (clusterOpen = true)}>Publish release…</PressButton>
          </div>
          <CodeBlock code={multiUsage} lang="svelte" meta="DialogFooter — one group" />
        </div>
        <div class="flex flex-col gap-3">
          <p class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            b · DialogFooter end — the raw slot, no group
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <PressButton onclick={() => (endOpen = true)}>4 assets selected…</PressButton>
          </div>
          <CodeBlock code={endUsage} lang="svelte" meta="end — raw slot" />
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- Custom head (r14-9): DialogHeader carries the custom content -->
  <div id="dialog-head" data-reveal="">
    <SectionCard
      family="dialog-head"
      headerRegion="dialog-head"
      eyebrow="demo"
      title="DialogHeader — a custom head"
      summary="The head snippet replaces the visible title row, and DialogHeader is its content face: children ride flush, edge-to-edge — the content owns the row's height and padding (an Input shell brings its own), no zone insets intervening. The × close button still rides the head grid's end slot, and title keeps naming the dialog for assistive tech even though its visual row is gone — the search palette composes this same seam."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <PressButton onclick={() => (headOpen = true)}>Filter events…</PressButton>
          <span class="text-muted-foreground text-[12.5px]">
            query: <code class="text-accent">{headQuery.trim() || '—'}</code>
          </span>
        </div>
        <CodeBlock code={headUsage} lang="svelte" meta="custom head" />
      </div>
    </SectionCard>
  </div>

  <!-- Scrolling body (r14): the panel never scrolls, the body zone does -->
  <div id="dialog-scroll" data-reveal="">
    <SectionCard
      family="dialog-scroll"
      headerRegion="dialog-scroll"
      eyebrow="demo"
      title="Scrolling body — head and foot stay pinned"
      summary="The panel itself never scrolls: the scroll ring is a row-ruled grid (head · separator · body · separator · foot) under a height cap, and the body zone is the only scroll environment — its scrollbar rides the zone edge with a stable gutter while the header bar and footer cluster stay pinned. The class prop here caps the ring (a geometry-only override) so the scroll shows even on tall viewports."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <PressButton onclick={() => (logOpen = true)}>Event log ({logLines.length} lines)…</PressButton>
        </div>
        <CodeBlock code={scrollUsage} lang="svelte" meta="scrolling body" />
      </div>
    </SectionCard>
  </div>

  <!-- NativeHTML base -->
  <div id="dialog-base" data-reveal="">
    <SectionCard
      family="dialog-base"
      headerRegion="dialog-base"
      eyebrow="W3C foundation"
      title="What the platform gives, what we add"
      summary="The design rule for this component: every behavior the browser ships is consumed as-is; the component only owns state binding and one motion. Anything beyond that is a named extension direction, not hidden magic."
    >
      <div class="grid gap-4 min-[760px]:grid-cols-2">
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">platform-native, free</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">showModal()</code> — top-layer rendering, focus trap, inert background</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">::backdrop</code> — the scrim pseudo-element;
                <code class="text-accent">--scrim</code>: semi-transparent black in light mode,
                white in dark mode — a scrim dims/lightens, never colors</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>Escape — the <code class="text-accent">cancel</code> event, intercepted only to share the fade</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>closed by default — no-JS page loads never paint dialog content inline</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">form method="dialog"</code> — footer submits close natively (instant, skips the fade)</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">jixoai additions &amp; extensions</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">bind:open</code> — rising edge calls
                <code class="text-accent">showModal()</code>, falling edge runs the teardown</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>close fade — the single motion addition: opacity 120ms on dialog + backdrop, none under reduced motion</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>floating-surface law — the hard offset shadow is a REAL <code class="text-accent">::after</code> layer; <code class="text-accent">@starting-style</code> entry pulls the layers apart, the close fade presses them back; <code class="text-accent">variant="solid | acrylic | auto"</code> paints the surface (acrylic = dual-layer <code class="text-accent">backdrop-filter</code>)</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>× close button — press physics, right of the header bar</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>extension: backdrop-click close; intercepting form submits so they fade too</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<Dialog title="Deploy queued" bind:open={basicOpen}>
  <p>build #128 is waiting for a runner. The log streams once it picks up.</p>
</Dialog>

<Dialog title="Rotate API key" bind:open={formOpen}>
  <div class="flex flex-col gap-3">
    <p>Minting a new key revokes the current one after 24 hours.</p>
    <label class="flex flex-col gap-1.5 text-[12px]">
      <span class="text-muted-foreground">key name</span>
      <Input type="text" value="ci-runner" />
    </label>
  </div>
  {#snippet footer()}
    <DialogFooter>
      <PressButton onclick={() => (formOpen = false)}>Cancel</PressButton>
      <PressButton
        variant="fill"
        onclick={() => {
          lastAction = 'key rotated';
          formOpen = false;
        }}
      >
        Rotate key
      </PressButton>
    </DialogFooter>
  {/snippet}
</Dialog>

<!-- footer clusters demo A: DialogFooter children — three buttons, one
     auto group (ghost by context; the explicit fill wins for primary) -->
<Dialog title="Publish release" bind:open={clusterOpen}>
  <p>v2.4.0 is staged — 14 commits since the last tag, 3 files touched.</p>
  {#snippet footer()}
    <DialogFooter>
      <PressButton onclick={() => (clusterOpen = false)}>Cancel</PressButton>
      <PressButton
        onclick={() => {
          lastAction = 'draft saved';
          clusterOpen = false;
        }}
      >
        Save draft
      </PressButton>
      <PressButton
        variant="fill"
        onclick={() => {
          lastAction = 'published';
          clusterOpen = false;
        }}
      >
        Publish
      </PressButton>
    </DialogFooter>
  {/snippet}
</Dialog>

<!-- demo B: DialogFooter's raw end slot — replaces the grouped
     arrangement entirely -->
<Dialog title="4 assets selected" bind:open={endOpen}>
  <div class="flex flex-col gap-2">
    <p>The bundle for the current audit:</p>
    <ul class="flex flex-col gap-1 font-mono text-[12px] text-muted-foreground">
      <li>crash-report.sites — 812 KB</li>
      <li>tokens.json — 3.1 KB</li>
      <li>hero.tape — 1.2 MB</li>
      <li>audit.log — 96 KB</li>
    </ul>
  </div>
  {#snippet footer()}
    <DialogFooter>
      {#snippet end()}
        <span class="font-mono text-[12px] text-muted-foreground">2.1 MB total</span>
        <PressButton
          variant="fill"
          onclick={() => {
            lastAction = 'download started';
            endOpen = false;
          }}
        >
          Download all
        </PressButton>
      {/snippet}
    </DialogFooter>
  {/snippet}
</Dialog>

<!-- custom head demo: DialogHeader carries the Input flush; title keeps
     the accessible name, the × rides the head grid's end slot -->
<Dialog title="Filter events" bind:open={headOpen}>
  {#snippet head()}
    <DialogHeader>
      <Input
        class="w-full min-w-0"
        placeholder="Filter events…"
        aria-label="Filter events"
        bind:value={headQuery}
      >
        {#snippet innerInlineStart()}
          <span
            class="flex-none select-none text-muted-foreground [&_svg]:h-[16px] [&_svg]:w-[16px]"
            aria-hidden="true">{@html icons.search}</span>
        {/snippet}
      </Input>
    </DialogHeader>
  {/snippet}
  {#if filtered.length === 0}
    <p>No events match “{headQuery.trim()}”.</p>
  {:else}
    <ul class="flex flex-col gap-1">
      {#each filtered as e (e)}
        <li class="flex items-center gap-2.5">
          <span class="size-1 flex-none bg-primary" aria-hidden="true"></span>
          <span class="font-mono text-[12px]">{e}</span>
        </li>
      {/each}
    </ul>
  {/if}
</Dialog>

<!-- scrolling body demo: the ring cap comes from the class prop
     (geometry-only) — head and foot pin, the body zone scrolls -->
<Dialog
  title="Event log"
  bind:open={logOpen}
  class="[&_[data-jx-dialog-scroll]]:max-h-[22rem]"
>
  <ol class="flex flex-col gap-1 font-mono text-[12px]">
    {#each logLines as line, i (line)}
      <li class="flex gap-3">
        <span class="w-6 flex-none text-right text-muted-foreground">{i + 1}</span>
        <span>{line}</span>
      </li>
    {/each}
  </ol>
  {#snippet footer()}
    <DialogFooter>
      <PressButton onclick={() => (logOpen = false)}>Close</PressButton>
      <PressButton
        variant="fill"
        onclick={() => {
          lastAction = 'log exported';
          logOpen = false;
        }}
      >
        Export log
      </PressButton>
    </DialogFooter>
  {/snippet}
</Dialog>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Dialog variants" summary="Title and footer are the two compositional axes; variant paints the surface.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">titled</p>
        <p class="text-[13px] leading-6">The header bar renders when <code class="text-accent">title</code> is given — heading left, × close right.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">chrome-less / footer</p>
        <p class="text-[13px] leading-6">Omit title for a bare body; the <code class="text-accent">footer</code> snippet adds the separator-bounded foot zone — its standard content is <code class="text-accent">DialogFooter</code>, whose buttons auto-join one end-packed group, ghost by default.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">variant</p>
        <p class="text-[13px] leading-6"><code class="text-accent">solid | acrylic | auto</code> (default) — acrylic is a dual-layer backdrop-filter, auto defers to the environment's transparency preference.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Flip bind:open from anywhere — every exit (×, Escape, code) runs the same 120ms fade."><CodeBlock code={basicUsage} lang="svelte" meta="Dialog usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The native dialog element carries the modal contract — role, focus trap, and Escape are the platform's."><A11yTable keys={[{ key: 'Tab', action: 'Cycles inside the dialog — the showModal() focus trap; the page behind is inert' }, { key: 'Escape', action: 'Cancel event, intercepted only to share the animated close' }, { key: 'Enter / Space', action: 'Activate the focused control (× button, footer buttons, form method="dialog" submits)' }]} aria={[{ name: 'aria-label', value: 'title', description: 'On the dialog element — the header heading when given.' }, { name: 'role', value: 'dialog (native)', description: 'The platform element; no ARIA roles to maintain.' }, { name: 'aria-label', value: '"Close"', description: 'On the × button.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The surface rides the shared motion kernel — one animated custom property drives entry, exit, and the scrim."><div class="flex flex-col gap-5"><p class="text-muted-foreground text-[13px] leading-6">the trigger inherits the density scope, the surface inherits through the DOM tree — flip the workbench stage's density toggle (comfortable / compact) to re-scope them together; the scrim reads in both stage themes the same way. The four-copy DensityDemo row is retired by that toggle.</p><TokenTable tokens={[{ name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'Surface-motion progress: blurIn/slide/materials/shadow + backdrop opacity.' }, { name: '--scrim', default: 'black 14% / white 14%', source: 'color', description: '::backdrop — semi-transparent black (light) / white (dark), never a brand tint.' }, { name: '--jx-surface-in-x/y', default: '0px / 6px', source: 'component', description: 'Entry translate offset.' }, { name: 'surface width', default: 'min(92vw, 26rem)', source: 'structural' }, { name: 'close fade', default: '120ms (skipped under reduced motion)', source: 'structural' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Eight props — the platform owns every behavior; the component owns state binding, zone presence, and the zone variant scopes. The footer snippet is the RAW full override of the foot zone; the head/footer content faces are the composition components below."><PropsTable props={[{ name: 'title', type: 'string', default: '—', description: 'Heading of the default title row (rendered through DialogHeader); omit for a chrome-less body. Still names the dialog (aria-label) when a head snippet replaces the visible row.' }, { name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state: true → showModal(), false → animated close.', bindable: true }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface paint; auto defers to the environment’s transparency preference.' }, { name: 'class', type: 'string', default: "''", description: 'Geometry-only utilities appended after the law’s own (a consumer’s anchor/width, a scroll-ring cap); the platform still paints nothing.' }, { name: 'head', type: 'Snippet', default: '—', description: 'Replaces the visible title row — typically a DialogHeader wrapping custom content; the × close still rides the head grid’s end slot.' }, { name: 'children', type: 'Snippet', default: '—', description: 'Dialog body — the only scrollable zone.', required: true }, { name: 'footer', type: 'Snippet', default: '—', description: 'The RAW full override of the foot zone — its standard content is a DialogFooter (buttons auto-joined in one end-packed group, ghost by the zone’s scope).' }, { name: 'cancelGuard', type: '() => boolean', default: '—', description: 'Consulted on the native cancel request (Escape); returning true holds the dialog open (e.g. through an IME composition).' }]} /></SectionCard></div>
  <div id="composition" data-reveal=""><SectionCard family="composition" headerRegion="composition" eyebrow="api" title="DialogHeader · DialogFooter — the zone content faces" summary="The slot architecture belongs to the zones' content, carried by components (r14-9): Dialog renders the zones and writes the ghost variant scopes; these two are what the zones usually show. DialogHeader is also Dialog's internal default — the untitled title row has exactly one source."><PropsTable props={[{ name: 'DialogHeader · title', type: 'string', default: '—', description: 'The default title row (padded chrome bar); yields to children.' }, { name: 'DialogHeader · children', type: 'Snippet', default: '—', description: 'Custom head content, FLUSH edge-to-edge — owns its own geometry (the palette’s Input).' }, { name: 'DialogFooter · children', type: 'Snippet', default: '—', description: 'The action buttons — auto-joined in ONE ButtonGroup packed at inline-end; ghost inherited from the Dialog zone scope, an explicit variant wins; ghost seams rule the buttons.' }, { name: 'DialogFooter · end', type: 'Snippet', default: '—', description: 'Raw inline-end content: present, it replaces the grouped arrangement — the opt-out for non-button content or a custom cluster. The opening line stays.' }, { name: 'DialogFooter · opening line', type: 'structural', default: 'vertical Separator', description: 'The actions region’s boundary — a decorative vertical Separator spanning the zone height, rendered before the cluster on both faces; never on an empty foot.' }, { name: 'DialogFooter · label', type: 'string', default: "'Dialog footer'", description: 'The ButtonGroup’s accessible name.' }]} /></SectionCard></div>
</div>

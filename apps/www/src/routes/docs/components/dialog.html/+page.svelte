<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Dialog from '$lib/ui/dialog/dialog.svelte';
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

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import dialogSource from '$lib/ui/dialog/dialog.svelte?raw';

  let basicOpen = $state(false);
  let formOpen = $state(false);
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
    <PressButton onclick={() => (open = false)}>Cancel</PressButton>
    <PressButton variant="fill" onclick={confirm}>Rotate key</PressButton>
  {/snippet}
</Dialog>`;

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
          <PressButton onclick={() => (play.current.open = false)}>Close</PressButton>
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
      summary="The footer snippet owns the action row (top border, right-aligned). Cancel drops the dialog; Confirm does its work first, then closes through the same animated path."
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
      <input
        type="text"
        value="ci-runner"
        class="border-border bg-transparent px-2.5 py-2 text-[13px] text-foreground"
        style="border: 1px solid var(--border)"
      />
    </label>
  </div>
  {#snippet footer()}
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
        <p class="text-[13px] leading-6">Omit title for a bare body; the <code class="text-accent">footer</code> snippet adds the bordered Cancel/Confirm row.</p>
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
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Five props — the browser owns every behavior; the component owns state binding and one motion."><PropsTable props={[{ name: 'title', type: 'string', default: '—', description: 'Heading in the header bar; omit for a chrome-less body.' }, { name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state: true → showModal(), false → animated close.', bindable: true }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface paint; auto defers to the environment’s transparency preference.' }, { name: 'children', type: 'Snippet', default: '—', description: 'Dialog body.', required: true }, { name: 'footer', type: 'Snippet', default: '—', description: 'Action area (top-border slot) — Cancel / Confirm row.' }]} /></SectionCard></div>
</div>

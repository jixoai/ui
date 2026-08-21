<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import Dialog from '$lib/ui/dialog.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';

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
    <PressButton variant="primary" onclick={confirm}>Rotate key</PressButton>
  {/snippet}
</Dialog>`;
</script>

<svelte:head>
  <title>Dialog · jixoai/ui</title>
  <meta
    name="description"
    content="The jixoai dialog component: a native <dialog> base — showModal() focus trap, ::backdrop scrim, Escape teardown — plus bindable open state and a 120ms close fade. Zero focus plumbing."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
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

  <!-- Basic demo -->
  <div data-reveal="" use:reveal>
    <SectionCard
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
  <div data-reveal="" use:reveal>
    <SectionCard
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
  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="dialog-base"
      eyebrow="NativeHTML 基座"
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
              <span><code class="text-accent">::backdrop</code> — the scrim pseudo-element; tinted
                <code class="text-accent">color-mix(in oklab, var(--primary) 14%, transparent)</code></span></li>
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
              <span>× close button — press physics, right of the header bar</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>extension: entry fade via <code class="text-accent">@starting-style</code></span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>extension: backdrop-click close; intercepting form submits so they fade too</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
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
      variant="primary"
      onclick={() => {
        lastAction = 'key rotated';
        formOpen = false;
      }}
    >
      Rotate key
    </PressButton>
  {/snippet}
</Dialog>

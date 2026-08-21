<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import Popover from '$lib/ui/popover.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';

  let choice = $state<string | null>(null);

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const menuUsage = `<script lang="ts">
  import Popover from '@ui/popover.svelte';
${close}

<!-- menu rows repeat popovertarget to close on select — still zero JS -->
<Popover id="actions" triggerLabel="Actions">
  <div class="flex flex-col">
    <button type="button" class="pop-row" popovertarget="actions">Rename…</button>
    <button type="button" class="pop-row" popovertarget="actions">Archive</button>
  </div>
</Popover>`;

  const cardUsage = String.raw`<Popover id="status" triggerLabel="Registry status">
  <p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">
    registry status
  </p>
  <p>Any content — the snippet is the whole panel body.</p>
</Popover>`;
</script>

<svelte:head>
  <title>Popover · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai popover component: the native Popover API — popover=&quot;auto&quot; light dismiss, a declarative popovertarget trigger, top-layer rendering — in a zero-script component. Anchored placement is the named extension direction."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="popover — declarative, zero script"
      summary="The native Popover API does everything: the panel carries popover=&quot;auto&quot; and the trigger is wired with popovertarget, so light dismiss, Escape, aria-expanded, and top-layer rendering come from the browser. The component ships no JavaScript at all — open this page's view source and check."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">popover="auto"</span>
        <span class="pill">popovertarget trigger</span>
        <span class="pill">light dismiss · Escape</span>
        <span class="pill">top layer</span>
        <span class="pill">0 lines of JS</span>
      </div>
    </SectionCard>
  </div>

  <!-- Menu demo -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="popover-menu"
      eyebrow="demo"
      title="Menu type"
      summary="Action rows inside the children snippet. Each row repeats popovertarget so selecting closes the panel — still no JavaScript on the close path; only the row's own onclick does its work."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <Popover id="demo-menu" triggerLabel="Actions">
            <div class="flex w-52 flex-col">
              <button type="button" class="pop-row" popovertarget="demo-menu"
                onclick={() => (choice = 'renamed')}>Rename…</button>
              <button type="button" class="pop-row" popovertarget="demo-menu"
                onclick={() => (choice = 'link copied')}>Copy link</button>
              <button type="button" class="pop-row" popovertarget="demo-menu"
                onclick={() => (choice = 'duplicated')}>Duplicate</button>
              <button type="button" class="pop-row" popovertarget="demo-menu"
                onclick={() => (choice = 'archived')}>Archive</button>
              <button type="button" class="pop-row pop-row-destructive" popovertarget="demo-menu"
                onclick={() => (choice = 'deleted')}>Delete</button>
            </div>
          </Popover>
          <span class="text-muted-foreground text-[12.5px]">
            last action: <code class="text-accent">{choice ?? '—'}</code>
          </span>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Click anywhere outside, press Escape, or pick a row — three exits, all native. While
          open, the caret flips via <code class="text-accent">:has(+ :popover-open)</code> where
          the engine supports it.
        </p>
        <CodeBlock code={menuUsage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <!-- Card demo -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="popover-card"
      eyebrow="demo"
      title="Card type"
      summary="The children snippet is the whole panel body, so richer content — status facts and a link out — composes with the same one-element base."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <Popover id="demo-card" triggerLabel="Registry status">
            <div class="flex flex-col gap-3">
              <p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">
                registry status
              </p>
              <p class="text-[13px] leading-6">
                Components are served as same-source files from this domain — nothing here is a
                runtime dependency.
              </p>
              <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[12.5px]">
                <dt class="text-muted-foreground">items</dt>
                <dd class="tabular-nums">12</dd>
                <dt class="text-muted-foreground">runtime deps</dt>
                <dd class="tabular-nums">0</dd>
                <dt class="text-muted-foreground">license</dt>
                <dd>MIT</dd>
              </dl>
              <div>
                <PressButton href="/r/registry.json" external>registry.json</PressButton>
              </div>
            </div>
          </Popover>
        </div>
        <CodeBlock code={cardUsage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <!-- NativeHTML base -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="popover-base"
      eyebrow="NativeHTML 基座"
      title="What the platform gives, what we add"
      summary="The component is styling and structure over two native attributes. Everything behavioral is the browser's; the one design decision we own is the placement strategy, and anchoring is left as a named extension direction."
    >
      <div class="grid gap-4 min-[760px]:grid-cols-2">
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">platform-native, free</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">popover="auto"</code> — light dismiss: outside click or focus loss closes; only one auto popover stays open at a time</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">popovertarget=&#123;id&#125;</code> — declarative trigger wiring; Enter/Space toggle, and the browser exposes <code class="text-accent">aria-expanded</code> on the button</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>top layer — the panel renders above sticky headers, transforms, and open dialogs</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>Escape closes natively; focus returns to the trigger</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">::backdrop</code> ships with popovers too — kept transparent so dismissing never dims the page</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">jixoai strategy &amp; extensions</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>zero-script component — markup and styles only, no state, no effects</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>placement v1 — authored centering: <code class="text-accent">inset-area: center</code> with an inset + margin fallback (the UA default centers via <code class="text-accent">margin: auto</code>)</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>extension: anchored placement next to the trigger — CSS Anchor Positioning (<code class="text-accent">anchor-name</code> + <code class="text-accent">position-anchor</code>/<code class="text-accent">inset-area</code>), a future <code class="text-accent">placement</code> prop</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>extension: <code class="text-accent">popover="manual"</code> variant for toast-like panels that ignore light dismiss</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>progressive: open/close transitions via <code class="text-accent">@starting-style</code> + <code class="text-accent">transition-behavior: allow-discrete</code> once the motion law wants them</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>
</div>

<style>
  .pop-row {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 6px 8px;
    text-align: left;
    font-size: 13px;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background-color 150ms ease-out;
  }
  .pop-row:hover {
    background: color-mix(in oklab, currentColor 8%, transparent);
  }
  .pop-row-destructive {
    color: var(--destructive);
  }
  .pop-row-destructive:hover {
    color: var(--destructive-foreground);
    background: var(--destructive);
  }
</style>

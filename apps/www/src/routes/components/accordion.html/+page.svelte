<script lang="ts">
  import Accordion from '$lib/ui/accordion.svelte';
  import AccordionItem from '$lib/ui/accordion-item.svelte';
  import Badge from '$lib/ui/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toggle from '$lib/ui/toggle.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import accordionSource from '$lib/ui/accordion.svelte?raw';
  import accordionItemSource from '$lib/ui/accordion-item.svelte?raw';

  // ToC outline: pairs with the section ids below, in page order.

  // ---- playground state (P1): the page owns the snapshot ----
  const canvasInitial = { exclusive: true, ghost: false, thirdOpen: true };
  let exclusive = $state(canvasInitial.exclusive);
  let ghost = $state(canvasInitial.ghost);
  let thirdOpen = $state(canvasInitial.thirdOpen);
  function resetCanvas(): void {
    exclusive = canvasInitial.exclusive;
    ghost = canvasInitial.ghost;
    thirdOpen = canvasInitial.thirdOpen;
  }

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Accordion from '@ui/accordion.svelte';
  import AccordionItem from '@ui/accordion-item.svelte';
${close}

<Accordion exclusive>
  <AccordionItem>
    {#snippet summary()}Shipping{/snippet}
    Orders leave the warehouse within 48h.
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}Returns{/snippet}
    30 days, no questions — the label is prepaid.
  </AccordionItem>
</Accordion>

<!-- bare item = a one-off disclosure -->
<AccordionItem bind:open>
  {#snippet summary()}Details{/snippet}
  Anything at all.
</AccordionItem>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/accordion.svelte', content: accordionSource },
    { name: 'registry/files/ui/accordion-item.svelte', content: accordionItemSource },
    { name: 'src/lib/ui/accordion-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Accordion · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai accordion: W3C-first — the accordion IS details/summary. Native toggle semantics, keyboard support, SSR state. The group adds border collapse and opt-in exclusive mode; height animation is progressive enhancement."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="accordion — details/summary, no framework"
      summary="The platform already ships the accordion: <details>/<summary> carries the toggle, the disclosure state, the keyboard contract, and open-in-SSR — nothing to hydrate, no ARIA to maintain. The group adds the two things a pile of bare details lacks: one collapsed 1px frame, and opt-in exclusive (radio) behavior."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">native details/summary</span>
        <span class="pill">SSR-stable open state</span>
        <span class="pill">capture-phase exclusive guard</span>
        <span class="pill">height:auto animation</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="accordion"
      description="A three-item FAQ. Flip the exclusive toggle in the playground — opening one item then closes its siblings, through one capture-phase listener; the third item also demonstrates bind:open surviving the guard."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/accordion.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[
        { label: 'exclusive', value: exclusive ? 'on' : 'off' },
        { label: 'ghost', value: ghost ? 'on' : 'off' },
      ]}
    >
      <div class="w-full max-w-xl">
        <Accordion {exclusive} {ghost}>
          <AccordionItem>
            {#snippet summary()}Shipping <Badge class="ml-1">48h</Badge>{/snippet}
            Orders leave the warehouse within 48 hours — tracking lands in your inbox the moment
            the label prints.
          </AccordionItem>
          <AccordionItem>
            {#snippet summary()}Returns{/snippet}
            30 days, no questions asked. The return label is prepaid; refunds post within two
            business days of arrival.
          </AccordionItem>
          <AccordionItem bind:open={thirdOpen}>
            {#snippet summary()}Warranty{/snippet}
            Two years against defects. Repairs run through the same pipeline as returns — one form,
            either outcome.
          </AccordionItem>
        </Accordion>
      </div>
      {#snippet playground()}
        <Toggle bind:checked={exclusive} label="exclusive" />
        <Toggle bind:checked={ghost} label="ghost (antd Collapse)" />
        <Toggle bind:checked={thirdOpen} label="warranty item open (bind)" />
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          exclusive mode is one capture-phase <code class="text-accent">toggle</code> listener on
          the group — it governs even raw <code class="text-accent">&lt;details&gt;</code> you drop
          in, no registration handshake. The summary is a snippet: badges and glyphs compose.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="accordion-base" data-reveal="" use:reveal>
    <SectionCard
      family="accordion-base"
      headerRegion="accordion-base"
      eyebrow="NativeHTML 基座"
      title="What the platform gives, what we add"
      summary="Everything behavioral is the browser's — toggle, keyboard, disclosure semantics, SSR state. The component owns only the frame, the seam, the chevron, the exclusive opt-in, and a progressive height:auto animation (interpolate-size + ::details-content) that degrades to a native snap everywhere else."
    >
      <div class="grid gap-4 min-[760px]:grid-cols-2">
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">platform-native, free</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>toggle + disclosure semantics on <code class="text-accent">details/summary</code></span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>keyboard: Enter/Space on the summary — the browser's own</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>SSR ships the open state in the HTML — no hydration flash</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">jixoai additions</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>collapsed frame: one 1px border, 1px seams between items</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">exclusive</code> — capture-phase guard closes siblings; works on any details children</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">bind:open</code> per item — manual state participates in the same guard</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>chevron rotation + height:auto animation, reduced-motion aware</span></li>
          </ul>
        </div>
      </div>
      <div class="mt-5">
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

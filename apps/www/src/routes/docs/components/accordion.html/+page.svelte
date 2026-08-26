<script lang="ts">
  import Accordion from '$lib/ui/accordion/accordion.svelte';
  import AccordionItem from '$lib/ui/accordion/accordion-item.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import accordionSource from '$lib/ui/accordion/accordion.svelte?raw';
  import accordionItemSource from '$lib/ui/accordion/accordion-item.svelte?raw';

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
  <div data-reveal="">
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

  <div data-reveal="">
    <ComponentCanvas
      title="accordion"
      description="A three-item FAQ. Flip the exclusive toggle in the playground — opening one item then closes its siblings, through one capture-phase listener; the third item also demonstrates bind:open surviving the guard."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/accordion.svelte"
      files={canvasFiles}
      stage="fill"
      onreset={resetCanvas}
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
        <PlayFields>
          <PlayRow label="exclusive">
            <PlayToggle bind:value={exclusive} />
          </PlayRow>
          <PlayRow label="ghost (antd Collapse)">
            <PlayToggle bind:value={ghost} />
          </PlayRow>
          <PlayRow label="warranty item open (bind)">
            <PlayToggle bind:value={thirdOpen} />
          </PlayRow>
          <PlayHelp>
            exclusive mode is one capture-phase <code>toggle</code> listener on the group — it
            governs even raw <code>&lt;details&gt;</code> you drop in, no registration handshake.
            The summary is a snippet: badges and glyphs compose.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="accordion-base" data-reveal="">
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Accordion variants" summary="The group frame, the ghost paint, and the bare one-off disclosure — all the same native details/summary underneath.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">default — framed</p>
        <Accordion>
          <AccordionItem>
            {#snippet summary()}framed{/snippet}
            One collapsed 1px border around the set.
          </AccordionItem>
          <AccordionItem>
            {#snippet summary()}seams{/snippet}
            1px seams between items, not double borders.
          </AccordionItem>
        </Accordion>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">ghost</p>
        <Accordion ghost>
          <AccordionItem>
            {#snippet summary()}ghost{/snippet}
            antd Collapse ghost mapping — frameless, hairline separators only.
          </AccordionItem>
        </Accordion>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">bare item</p>
        <AccordionItem>
          {#snippet summary()}one-off disclosure{/snippet}
          Without the group: a single styled details/summary.
        </AccordionItem>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Wrap items in the group for the collapsed frame and opt-in exclusive mode; use a bare item for a one-off disclosure."><CodeBlock code={usage} lang="svelte" meta="Accordion usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The component adds zero ARIA of its own — the browser maps details/summary to the disclosure pattern, including open state."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus to the summary line' }, { key: 'Enter / Space', action: 'Toggles the focused item open/closed (native summary behavior)' }]} aria={[{ name: 'details / summary', value: 'native semantics', description: 'The platform exposes name, role, and open state; no ARIA attributes are added or needed.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The accordion is utility-authored: the frame, seam, and 13px summary rhythm are fixed literals, so the scopes below leave it unchanged."><div class="flex flex-col gap-5"><DensityDemo><Accordion><AccordionItem>{#snippet summary()}density sample{/snippet}The summary rhythm, chevron, and seam are fixed across xs/sm/default/lg.</AccordionItem></Accordion></DensityDemo><TokenTable tokens={[{ name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-stack', default: '4 / 4 / 8 / 8px', source: 'density' }, { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' }, { name: 'border (frame + seam)', default: '1px', source: 'structural' }, { name: 'summary rhythm', default: '13px, fixed utility', source: 'structural' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Two halves: the group owns the frame and the exclusive guard; the item is a styled details/summary with a snippet summary."><div class="flex flex-col gap-6"><PropsTable title="Accordion (group)" props={[{ name: 'exclusive', type: 'boolean', default: 'false', description: 'Radio behavior: opening one direct child closes its siblings via a capture-phase toggle listener.' }, { name: 'ghost', type: 'boolean', default: 'false', description: "antd Collapse ghost paint — frameless, hairline separators only." }, { name: 'children', type: 'Snippet', default: '—', description: 'AccordionItem (or raw details) children.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the group container.' }]} /><PropsTable title="AccordionItem" props={[{ name: 'open', type: 'boolean', default: 'false', description: 'Disclosure state; bindable (bind:open) for controlled use.', bindable: true }, { name: 'summary', type: 'Snippet', default: '—', description: 'The summary line — plain text or a composed snippet (no interactive elements).' }, { name: 'children', type: 'Snippet', default: '—', description: 'The expanded body.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the details element.' }]} /></div></SectionCard></div>
</div>

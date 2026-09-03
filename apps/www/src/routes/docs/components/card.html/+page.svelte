<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import { icons } from '$lib/icons';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Card from '$lib/ui/card/card.svelte';
  import CardHeader from '$lib/ui/card/card-header.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import cardSource from '$lib/ui/card/card.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Card from '@ui/card.svelte';
  import CardHeader from '@ui/card-header.svelte';
  import CardFooter from '@ui/card-footer.svelte';
${close}

<!-- the bare card: default head face + body; no foot, no action seat -->
<Card title="Deploy hooks.">
  <p>Body content — the only scrollable zone.</p>
</Card>

<!-- the action seat: the inline-end slot dialog's × is designed for -->
<Card title="Session">
  {#snippet actions()}
    <IconButton text="Session options" iconOnly />
  {/snippet}
  <p>Body.</p>
</Card>

<!-- the foot: raw transport, the standard face is CardFooter (start
     seat / auto one ButtonGroup / raw end slot) -->
<Card title="Cart">
  {#snippet foot()}
    <CardFooter label="cart actions">
      {#snippet start()}
        <span>3 items</span>
      {/snippet}
      <PressButton>Clear</PressButton>
      <PressButton variant="fill">Checkout</PressButton>
    </CardFooter>
  {/snippet}
  <p>Line items.</p>
</Card>`;

  const gridUsage = `<CardGrid foot min="220px">
  <Card title="one">
    {#snippet foot()}<CardFooter>{#snippet end()}<span>meta</span>{/snippet}</CardFooter>{/snippet}
    <p>Body fills to the tallest; the foot aligns at the band bottom.</p>
  </Card>
  <Card title="two">
    {#snippet foot()}<CardFooter><PressButton variant="fill">Save</PressButton></CardFooter>{/snippet}
    <p>Second card.</p>
  </Card>
</CardGrid>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/card/card.svelte', content: cardSource },
    { name: 'src/lib/ui/card-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + live usage.
  const canvasInitial = { foot: true, actions: false, scroll: false };
  let showFoot = $state(canvasInitial.foot);
  let showActions = $state(canvasInitial.actions);
  let bodyScrolls = $state(canvasInitial.scroll);
  function resetCanvas(): void {
    showFoot = canvasInitial.foot;
    showActions = canvasInitial.actions;
    bodyScrolls = canvasInitial.scroll;
  }

  // live usage: mirrors the playground state
  const usageLive = $derived(`<Card title="Session"${bodyScrolls ? '' : '\n  scroll={false}'}>${showActions ? '\n  {#snippet actions()}<IconButton text="Session options" iconOnly />{/snippet}' : ''}${showFoot ? `\n  {#snippet foot()}
    <CardFooter label="card actions">
      {#snippet start()}<span>3 items</span>{/snippet}
      <PressButton>Cancel</PressButton>
      <PressButton variant="fill">Save</PressButton>
    </CardFooter>
  {/snippet}` : ''}
  <p>The body zone is the only scroll ring.</p>
</Card>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

{#snippet xGlyph()}
  {@html icons.x}
{/snippet}

{#snippet actionSeat()}
  <IconButton icon={xGlyph} text="Close" iconOnly tip={false} />
{/snippet}

{#snippet footSeat()}
  <CardFooter label="card actions">
    {#snippet start()}
      <span class="text-muted-foreground font-mono text-[12px]">3 items</span>
    {/snippet}
    <PressButton>Cancel</PressButton>
    <PressButton variant="fill">Save</PressButton>
  </CardFooter>
{/snippet}

<svelte:head>
  <title>Card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai card component: the structural surface — the dialog row ruler's static clone with head/body/foot zones, stamped presence, edge-riding separators, the body-only scroll law, and an open inline-end actions slot."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="card — the structural surface"
        summary="The dialog row ruler's static clone: head/body/foot zones with stamped presence, structural separators, the body-only scroll law — and an open inline-end action seat where dialog's × lives. The root owns an inline ruler and the zones rent it via subgrid: passive text enters the content axis (14px by track), interactive clusters ride the card edge flush. Zones place by integer cell lines, so the card is a card-grid tenant unchanged; it is the foundation dialog will sit on."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">head · body · foot</span>
          <span class="pill">inline ruler</span>
          <span class="pill">actions slot</span>
          <span class="pill">scroll law</span>
        </div>
      </SectionCard>
    </div>

    <!-- the demo-standard skeleton (2026-08-30): Intro → Install → Usage
         → Examples → API → See Also is the page law -->
    <div data-reveal="">
      <DocsInstall name="card" />
    </div>

    <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The card keeps the zones and the snippet transports; the content faces are composition — CardHeader for the head, CardFooter for the foot."><CodeBlock code={usage} lang="svelte" meta="Card usage" /></SectionCard></div>

    <div data-reveal="">
      <ComponentCanvas
        title="card"
        description="The structural surface, live: toggle the foot zone, the inline-end action seat, and the body's scroll authority. Presence is stamped on the host (data-sep-head / data-sep-foot); absent zones never render — their rows collapse."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/card/card.svelte"
        {files}
        stage="fill"
        onreset={resetCanvas}
        resolveFileContent={resolveUsage}
      >
        {#snippet children()}
          <div data-doc-demo-scope="headings-ok" class="w-full max-w-md">
            <Card
              title="Session"
              actions={showActions ? actionSeat : undefined}
              foot={showFoot ? footSeat : undefined}
              scroll={bodyScrolls}
            >
              <p class="text-[13px] leading-6">
                The body zone is the only scroll ring{bodyScrolls
                  ? ' — overflow-y: auto with a stable both-edges gutter.'
                  : ' is declared to fit (scroll={false}): the authority and the gutter retire together.'}
              </p>
            </Card>
          </div>
        {/snippet}
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="foot zone">
              <PlayToggle bind:value={showFoot} />
            </PlayRow>
            <PlayRow label="action seat">
              <PlayToggle bind:value={showActions} />
            </PlayRow>
            <PlayRow label="body scrolls">
              <PlayToggle bind:value={bodyScrolls} />
            </PlayRow>
            <PlayHelp>
              The action seat here demos an IconButton — the exact seat dialog's × occupies
              when Dialog is refactored onto Card. No close button ships with the card.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="foot-flexibility" data-reveal="">
      <SectionCard
        family="foot-flexibility"
        headerRegion="foot-flexibility"
        eyebrow="law"
        title="Foot flexibility — both edges are first-class"
        summary="The seats place against the rented inline ruler: text seats (start, end) enter the content axis — their 14px inset is a ruler TRACK, not a utility — while the button cluster spans the end inset to ride the card edge flush (its buttons carry the rhythm internally, dialog's footer economy verbatim)."
      >
        <div class="flex flex-col gap-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <Card title="start + grouped actions">
              {#snippet foot()}
                <CardFooter label="cart actions">
                  {#snippet start()}
                    <span class="text-muted-foreground font-mono text-[12px]">3 items · $42.00</span>
                  {/snippet}
                  <PressButton>Clear</PressButton>
                  <PressButton variant="fill">Checkout</PressButton>
                </CardFooter>
              {/snippet}
              <p class="text-[13px] leading-6">Meta text on the content axis; the cluster rides the edge flush.</p>
            </Card>
            <Card title="raw end slot">
              {#snippet foot()}
                <CardFooter>
                  {#snippet end()}
                    <span class="text-muted-foreground font-mono text-[12px]">auto-saved 2m ago</span>
                  {/snippet}
                </CardFooter>
              {/snippet}
              <p class="text-[13px] leading-6">The end slot replaces the grouped arrangement — a text seat at the content axis, 14px shy of the edge.</p>
            </Card>
          </div>
          <CodeBlock code={usage} lang="svelte" meta="CardFooter slots" />
        </div>
      </SectionCard>
    </div>

    <div id="grid-composition" data-reveal="">
      <SectionCard
        family="grid-composition"
        headerRegion="grid-composition"
        eyebrow="composition"
        title="In a card grid — the foot mode"
        summary="CardGrid's foot prop declares the third shared row: headers align, bodies fill to the tallest, feet align at the band bottoms. The integer cell placement resolves in every wrapped band."
      >
        <div class="flex flex-col gap-5">
          <CardGrid foot min="240px">
            <Card title="usage">
              {#snippet foot()}
                <CardFooter>
                  {#snippet end()}
                    <span class="text-muted-foreground font-mono text-[12px]">npx jixoai-ui add card</span>
                  {/snippet}
                </CardFooter>
              {/snippet}
              <p class="text-[13px] leading-6">One install, three files: the surface, the head face, the foot face.</p>
            </Card>
            <Card title="anatomy">
              {#snippet foot()}
                <CardFooter>
                  <PressButton variant="fill">Save</PressButton>
                </CardFooter>
              {/snippet}
              <p class="text-[13px] leading-6">Head zone, edge-riding separator, the scroll ring, the foot seat.</p>
            </Card>
            <Card title="the longer body">
              {#snippet foot()}
                <CardFooter>
                  {#snippet start()}
                    <span class="text-muted-foreground font-mono text-[12px]">rev 2</span>
                  {/snippet}
                  <PressButton>diff</PressButton>
                </CardFooter>
              {/snippet}
              <p class="text-[13px] leading-6">
                This body is deliberately taller — the other two cards' bodies stretch to match it
                through the shared 1fr row, and every foot lands on the same band bottom line.
              </p>
            </Card>
          </CardGrid>
          <CodeBlock code={gridUsage} lang="svelte" meta="CardGrid foot mode" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Three postures: the bare card, the chrome-less body card, and the full zone trio.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">bare · title + body</span><Card title="Deploy hooks."><p class="text-[13px]">No foot, no action seat — the stamps stay honest.</p></Card></div>
      <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">chrome-less · no head</span><Card><p class="text-[13px]">Neither title nor a head snippet: no head zone, no head separator.</p></Card></div>
      <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">full · head + body + foot</span><Card title="Session">{#snippet foot()}<CardFooter>{#snippet start()}<span class="text-muted-foreground font-mono text-[12px]">3 items</span>{/snippet}<PressButton variant="fill">Save</PressButton></CardFooter>{/snippet}<p class="text-[13px]">The zone trio a card-grid foot band equalizes.</p></Card></div>
    </div>
  </SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The card is a generic section container; the separators are decorative chrome, the zones carry no semantics of their own."><A11yTable keys={[{ key: 'Escape / close', action: 'Not applicable — no close affordance ships; the action seat is the consumer’s own control' }]} aria={[{ name: 'root', value: '<section>', description: 'A generic container; give it an accessible name via its content when the region is navigable' }, { name: 'separators', value: 'aria-hidden', description: 'The structural lines are decorative — hidden from AT' }, { name: 'action seat', value: 'consumer-owned', description: 'Whatever sits in the actions slot keeps its own role, name, and activation behavior' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The inline ruler, verbatim: the root owns five named tracks ([inset] 14px · [start seat] auto · [fill] minmax(10px,1fr) · [end seat] auto · [inset] 14px); head/foot zones rent them via subgrid. Zones paint nothing; no face carries an inline padding utility — tracks paint the axis. The card is not density-scaled."><div class="flex flex-col gap-6"><TokenTable tokens={[{ name: 'text seats (head title, foot start/end)', default: 'content axis (track)', source: 'law', description: 'Passive content ENTERS at card-content lines — 14px from each edge arrives BY TRACK. Foot text carries NO padding-block: it centers against the row and never sizes it.' }, { name: 'edge riders (actions slot, foot cluster)', default: 'flush, span to -1', source: 'law', description: 'The head actions slot is a CORNER (align-self: start, dialog × verbatim). The foot cluster is a CARVED CELL: it fills the band vertically — separator as its top rim, leading seam as its carved left edge; the buttons’ min-h economy is a floor, never a cap (a floating 40px button in a taller band reads as a hole dug out, not a cell cut out). The shared end column is as wide as its widest resident, like a table’s last column.' }, { name: 'body cell', default: 'py-3.5 + inline compensation', source: 'component', description: 'The full-bleed exception: the scroll ring owns its inline geometry — max(0.875rem − probed thin scrollbar, 0), a width tracks cannot see.' }, { name: '--card-foreground', default: 'theme', source: 'color', description: 'Body text at 80% via color-mix.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Card keeps the zones and the snippet transports; CardHeader and CardFooter are the content faces."><div class="flex flex-col gap-8"><PropsTable props={[{ name: 'title', type: 'string', default: '—', description: 'Heading of the default head face (CardHeader). Omit with no head snippet for a chrome-less card.' }, { name: 'head', type: 'Snippet', default: '—', description: 'Raw head override — enters at the content axis (typically wraps CardHeader).' }, { name: 'actions', type: 'Snippet', default: '—', description: 'The inline-end action seat — dialog × position, edge-riding flush. Absent, the slot never renders; no close button ships.' }, { name: 'foot', type: 'Snippet', default: '—', description: 'Raw full override of the foot zone; the standard face is CardFooter.' }, { name: 'scroll', type: 'boolean', default: 'true', description: 'Body scroll authority; false retires it together with the gutter reservation.' }, { name: 'class', type: 'string', default: "''", description: 'Root utilities appended after the law’s own.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The body — the only scrollable zone.', required: true }]} /><PropsTable props={[{ name: 'title', type: 'string', default: '—', description: 'CardHeader: the default title row (h2, py-2.5 — the inline inset is the ruler’s track); yields to children.' }, { name: 'children', type: 'Snippet', default: '—', description: 'CardHeader: custom head content at the content axis — owns its own block geometry.' }]} /><PropsTable props={[{ name: 'start', type: 'Snippet', default: '—', description: 'CardFooter: the inline-start TEXT seat — the content axis.' }, { name: 'end', type: 'Snippet', default: '—', description: 'CardFooter: the inline-end TEXT seat; replaces the grouped arrangement.' }, { name: 'label', type: 'string', default: "'Card footer'", description: 'CardFooter: the ButtonGroup accessible name.' }, { name: 'children', type: 'Snippet', default: '—', description: 'CardFooter: action buttons — the CLUSTER seat: one leadingSeam ButtonGroup riding the card edge flush.' }]} /></div></SectionCard></div>
</div>

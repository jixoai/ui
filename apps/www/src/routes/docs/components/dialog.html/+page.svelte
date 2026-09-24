<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Dialog from '$lib/ui/dialog/dialog.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import CardHeader from '$lib/ui/card/card-header.svelte';
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
  import Icon from '$lib/ui/icon';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { RadiusLane } from '$lib/defaults.svelte';

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
  let fixedOpen = $state(false);
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
  import CardFooter from '@ui/card/card-footer.svelte';
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
    <CardFooter>
      <PressButton onclick={() => (open = false)}>Cancel</PressButton>
      <PressButton variant="fill" onclick={confirm}>Rotate key</PressButton>
    </CardFooter>
  {/snippet}
</Dialog>`;

  // footer clusters (r14-9): CardFooter's children auto-join ONE
  // group — ghost by context, an explicit variant still wins
  const multiUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import CardFooter from '@ui/card/card-footer.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

let open = $state(false);
${close}

<Dialog title="Publish release" bind:open>
  <p>v2.4.0 is staged — 14 commits since the last tag.</p>
  {#snippet footer()}
    <CardFooter>
      <PressButton onclick={() => (open = false)}>Cancel</PressButton>
      <PressButton onclick={saveDraft}>Save draft</PressButton>
      <PressButton variant="fill" onclick={publish}>Publish</PressButton>
    </CardFooter>
  {/snippet}
</Dialog>`;

  // end: CardFooter's raw slot — present, it replaces the grouped
  // arrangement
  const endUsage = `<Dialog title="4 assets selected" bind:open>
  <p>crash-report.sites · tokens.json · hero.tape · audit.log</p>
  {#snippet footer()}
    <!-- CardFooter's seat law: text rides the start seat, buttons
         join the children cluster (the end seat is the RAW text
         override that replaces the cluster) -->
    <CardFooter>
      {#snippet start()}
        <span class="font-mono text-[12px] text-muted-foreground">2.1 MB total</span>
      {/snippet}
      <PressButton variant="fill" onclick={downloadAll}>Download all</PressButton>
    </CardFooter>
  {/snippet}
</Dialog>`;

  // custom head: CardHeader wraps the custom content flush; title
  // keeps naming the dialog for AT while its visual row is gone
  const headUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import CardHeader from '@ui/card/card-header.svelte';
  import Input from '@ui/input.svelte';
  import Icon from '@ui/icon.svelte';
${close}

let open = $state(false);
let query = $state('');
${close}

<Dialog title="Filter events" bind:open>
  {#snippet head()}
    <!-- col-start-1 = the flush escape: the face's column start
         pins to the grid's first line while the x seat keeps its
         own column on the same row -->
    <CardHeader class="col-start-1">
      <Input class="w-full min-w-0" placeholder="Filter events…" bind:value={query} aria-label="Filter events">
        {#snippet innerInlineStart()}
          <span class="flex-none select-none text-muted-foreground" aria-hidden="true"><Icon name="search" /></span>
        {/snippet}
      </Input>
    </CardHeader>
  {/snippet}
  <!-- the body lists the events filtered by query -->
</Dialog>`;

  // scrolling body: the class prop caps the ring (geometry-only) so the
  // body zone scrolls while head and foot stay pinned
  const scrollUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import CardFooter from '@ui/card/card-footer.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

let open = $state(false);
${close}

<Dialog
  title="Event log"
  bind:open
  class="[&_[data-jx-card]]:max-h-[22rem]"
>
  <ol class="flex flex-col gap-1 font-mono text-[12px]">
    {#each lines as line, i}
      <li class="flex gap-3"><span class="text-muted-foreground">{i + 1}</span>{line}</li>
    {/each}
  </ol>
  {#snippet footer()}
    <CardFooter>
      <PressButton onclick={() => (open = false)}>Close</PressButton>
      <PressButton variant="fill" onclick={exportLog}>Export log</PressButton>
    </CardFooter>
  {/snippet}
</Dialog>`;

  // the fixed-body twin: scroll={false} asserts the content fits —
  // sweep usage mirror (canvas-everywhere-demos, 2026-09-08); the
  // same-source resolveRawCode migration is the recorded follow-up.
  const fixedUsage = `<Dialog title="Session pinned" scroll={false} bind:open>
  <p>
    3 rules active · 2 breakpoints · no stack frames. The body declares
    itself a non-scroller — nothing to roll, no gutter to reserve.
  </p>
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
  const play = playState({ open: false as boolean, title: 'Deploy queued' });

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

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<!-- the §7 elevation × surface-ladder ladder (light, shadows lead) -->
<Dialog title="level4 · the modal default" bind:open={u1}>…</Dialog>
<Dialog title="level3 · one rung down" elevation="level3" bind:open={u2}>…</Dialog>
<!-- the number lane: exact dp snaps DOWN to the enclosing rung -->
<Dialog title="6dp · the number lane" elevation={6} bind:open={u3}>…</Dialog>
<!-- the concave rung: inset shadow + the deepest surface -->
<Dialog title="level-1 · the concave" elevation="level-1" bind:open={u4}>…</Dialog>
<!-- the concentric anchor: radius 20 supplies --jx-radius-effective
     through the top layer; children at auto compute max(0px, R − P) -->
<Dialog title="radius 20 · the anchor" radius={20} bind:open={u5}>
  <PressButton radius="auto">auto radius — 6px</PressButton>
</Dialog>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/dialog-universal.svelte', content: universalUsage },
  ];
  let u1 = $state(false);
  let u2 = $state(false);
  let u3 = $state(false);
  let u4 = $state(false);
  let u5 = $state(false);
  let u6 = $state(false);
  let uq = $state(false);

  // the query() seat: responsive radius on the ONE lane that paints
  // through the top layer — below 48rem the anchor is 8px, at md+ it is
  // 20px, and the concentric child rides along (max(0px, R − 14)):
  // 0px below, 6px at md+ (measured, task 112).
  const responsiveRadius = query<{ md: RadiusLane }, RadiusLane>({ md: 20 }, 8);

  const queryUsage = `<script lang="ts">
  import Dialog from '@ui/dialog.svelte';
  import PressButton from '@ui/press-button.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

const responsiveRadius = query({ md: 20 }, 8);
${close}

<Dialog title="Responsive radius" radius={responsiveRadius} bind:open>
  <PressButton radius="auto">auto radius rides the anchor</PressButton>
</Dialog>`;

  // the eight axes on dialog — one row per universal axis, classified
  // against the served family (grep receipts over ui/dialog/, the
  // measured seats below, W-next #17/#18)
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number | query()`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY for the family's own paint — zero --jx-size-effective readers over ui/dialog/ (grep receipt); the carrier stamps the top-layered root (self-carried across the promotion), so composed head/footer snippet content scales while the panel's chrome stays pinned. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED at the platform element — dialog.css paints corner-shape: var(--jx-shape-effective, round) on .jx-dialog (the §14 alias ladder, round by default; the §2 named steps). No number lane.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number | query()`,
      default: `'auto'`,
      description:
        'CONSUMED — THE PAINTING LANE. dialog.css composes border-radius from --jx-radius-consumed (explicit lane: effective × the §14 factor; auto: the §3 concentric calc against the panel\'s OWN ancestors). An explicit lane makes the panel the CONCENTRIC ANCHOR — the carrier stamps --jx-radius-effective on the top-layered root, and children at radius="auto" compute max(0px, R − P) THROUGH the top layer (measured digit-exact: the 20px seat anchors 6px on its child). Number unit: px.',
    },
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number | query()`,
      default: `'auto' · no family own`,
      description:
        "NO OPINION on value (DialogDefaults leaves the slot unparameterized) — a named rung rides the ambient scope channel (the top-layered <dialog> stays a DOM descendant for cascade) and the panel stamps the resolved rung as data-density; auto / number / query lanes omit the stamp (densityRungOf's undefined arm). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — zero --jx-color-effective / hue readers over ui/dialog/ (grep receipt); the panel's ink rides the ambient token sheet, and variant paints the surface (solid | acrylic | auto), not a hue. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE ISLAND STAMP — theme=\"dark\" stamps class:dark on the dialog root: a self-carried dark island THROUGH the top-layer promotion (the <dialog> stays a DOM descendant, so the island re-scopes every token read in the subtree — the card kernel's ground and ink re-derive inside it). The family itself carries zero var-chain theme reads (grep receipt). No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number | query()`,
      default: `'level4' · Own default, not ambient`,
      description:
        "OWN level4 (the modal's historic 8dp z-feel), STAMPED, NOT PAINTED (measured — W-next #18): elevationSurfaceOf composes the level-table pair onto the root style, but no box-shadow / filter / background-image channel paints on the served dialog at settle — level4 / level3 / 6dp / level-1 / dark are visually identical (the seats below teach this measured truth). The number lane is real: exact dp snaps DOWN to the enclosing table rung (6dp IS level3). The wiring decision (wire the shadow reader or retire the rung receipts) is the family owner's.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE FAMILY OWNS THE MOTION, AXIS UNREAD — one 460ms --jx-p WAAPI kernel drives entry, exit, and the scrim (blurIn/slide/materials/shadow; the @starting-style pull-apart; the jx-waapi allow-discrete exit window holds the panel through the whole run), instant under prefers-reduced-motion. Zero --jx-motion-effective readers (grep receipt). Number unit: coefficient.",
    },
  ];
</script>

<svelte:head>
  <title>Dialog · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai dialog component: a native <dialog> base — showModal() focus trap, ::backdrop scrim, Escape teardown — plus bindable open state and the 460ms WAAPI surface timeline. Zero focus plumbing."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>

  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="dialog — the platform owns the hard parts"
      summary="One native <dialog> element, opened with showModal() and closed with close(). Focus trapping, the inert page behind, top-layer rendering above every sticky header, and the Escape key are browser features — the component only binds open state to them and adds the shared WAAPI surface timeline. Closed dialogs render nothing in the page, with or without JavaScript. Since the structural kernel (2026-09-09) the interior is the CARD DIALECT: the head/body/foot bands, separators, inline ruler and narrow reversal all ride the data-jx-card sticker (card.css), the faces are the Card family parts (<CardHeader>, <CardBody>, <CardFooter> — the retired DialogHeader/DialogFooter were their clones), and the × rides the end-action seat the card sources reserved for it. The dialog owns the mechanism only: material, scrim, motion, close contract."
    >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install dialog">
          <TerminalCard
            barTitle="install — dialog"
            command="npx jixoai-ui add dialog"
            outputs={['https://ui.jixoai.com/r/dialog.json']}
          />
        </div>
      {/snippet}

      <div class={cx(rt.wrap12)}>
        <span class="pill">&lt;dialog&gt; + showModal()</span>
        <span class="pill">focus trap · inert · top layer</span>
        <span class="pill">::backdrop 14% brand</span>
        <span class="pill">Escape → cancel</span>
        <span class="pill">460ms WAAPI surface timeline</span>
        <span class="pill">footer buttons auto-group · ghost</span>
      </div>
    </SectionCard>
  </div>

  <!-- install (the archetype's install anchor; chrome — out of the toc) -->

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="One native <dialog>, one motion addition: the platform owns the modal mechanics (top layer, Escape, closed-by-default, the scrim token), the component binds open state and drives the 460ms surface kernel, and the interior is the card dialect — the head/body/foot bands ride the data-jx-card sticker and the Card family faces."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The mechanism split is the component's design rule: everything the browser ships is
          consumed as-is — <code class={cx(rt.inkAccent)}>showModal()</code> lifts the panel into
          the top layer above every sticky header, the <code class={cx(rt.inkAccent)}>cancel</code>
          event carries Escape, <code class={cx(rt.inkAccent)}>form method="dialog"</code> closes
          natively, and a closed dialog renders nothing inline (no-JS loads included). The
          component adds exactly two things: bindable <code class={cx(rt.inkAccent)}>open</code>{' '}
          state (rising edge → showModal(), falling edge → the teardown) and the shared 460ms{' '}
          <code class={cx(rt.inkAccent)}>--jx-p</code> WAAPI kernel — entry, exit, and the scrim
          ride one progress property, instant under reduced motion.
        </p>
        <p class={cx(rt.para)}>
          The interior is not dialog flesh: since the structural kernel the panel grows the CARD
          DIALECT — the interior host stamps <code class={cx(rt.inkAccent)}>data-jx-card</code>{' '}
          and card.css's rule set applies (the five-column inline ruler, three integer bands, the
          footer's narrow reversal), the faces are <code class={cx(rt.inkAccent)}>CardHeader</code>{' '}
          / <code class={cx(rt.inkAccent)}>CardBody</code> /{' '}
          <code class={cx(rt.inkAccent)}>CardFooter</code> (the head band is unconditional — the ×
          contract — the foot band exists iff the footer snippet is passed), and the ghost variant
          scopes are written over both zones. The dialog owns the mechanism only: material
          (variant), scrim, motion, close contract.
        </p>
        <p class={cx(rt.para)}>
          The measured contract on the served page: the surface width is{' '}
          <code class={cx(rt.inkAccent)}>min(92vw, 26rem)</code> (416px at desktop, 368px at a
          400px viewport — responsive, measured); the scrim is achromatic{' '}
          <code class={cx(rt.inkAccent)}>--scrim</code> (black 32% in light, white 10% in dark —
          never a brand tint; the staged demos pin light); the platform focus trap holds for the
          in-dialog cycle but LEAKS every second Tab to the page's skip link (measured per-press
          by two reviewers — the repair is queued, W-next #17); and the elevation axis is OWN
          level4 but STAMPED, NOT PAINTED (W-next #18) — the one axis lane that paints through the
          top layer is radius, the §3 concentric anchor (a 20px seat computes 6px on an auto
          child, digit-exact). Kinship: <code class={cx(rt.inkPrimary)}>system-dialog</code> (the
          non-modal, popover-based cousin), <code class={cx(rt.inkPrimary)}>sheet</code> (the
          edge-anchored twin), <code class={cx(rt.inkPrimary)}>popover</code> (the
          anchor-positioned non-modal surface).
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- workbench (audit P1-A2): LIVE trigger + title playground + sources -->
  <div data-reveal="">
    <ComponentCanvas
      title="dialog"
      description="One native <dialog> driven by showModal(): the browser owns Escape and the top layer — the component adds bindable open state and the shared WAAPI surface timeline. The platform focus trap holds for the in-dialog cycle but LEAKS every second Tab to the page's skip link (measured per-press; the repair is the family's, W-next). Retitle it from the Playground; preview the scrim in both stage themes."
      sourceUrl={registrySourceUrl('dialog')}
      install="dialog"
      files={canvasFiles}
      stage="center"
      onreset={() => play.reset()}
      output={playOutputs(play.current)}
    >
      <div class={cx(rt.col20, rt.itemsCenter)}>
        <PressButton onclick={() => (play.current.open = true)}>Open dialog</PressButton>
      </div>
      <!-- closed dialogs render nothing — the instance lives right here in
           the stage; showModal() lifts it into the top layer when open -->
      <Dialog title={play.current.title} bind:open={play.current.open}>
        <p>build #128 is waiting for a runner. The log streams once it picks up.</p>
        {#snippet footer()}
          <CardFooter>
            <PressButton onclick={() => (play.current.open = false)}>Close</PressButton>
          </CardFooter>
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
              class={cx(rt.dgW40, rt.text125)}
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
      summary="A PressButton flips a bindable open state; the dialog does the rest. Try the × button, the Escape key, and Tab — the in-dialog cycle holds and the page behind is inert, with ONE measured exception: every second Tab reaches the page's skip link (the one page focusable outside the modal's inertness; the next press returns — W-next #17)."
    >
      <div class={cx(rt.col20)}>
        <ComponentCanvas
          title="dialog · basic"
          files={[{ name: 'dialog-basic-demo.svelte', content: basicUsage, kind: 'usage' }]}
          stage="center"
        >
          <div class={cx(rt.rowC16, rt.wrap, rt.justifyCenter)}>
            <PressButton onclick={() => (basicOpen = true)}>Open dialog</PressButton>
            <span class={cx(rt.noteSmall)}>
              state: <code class={cx(rt.inkAccent)}>open = {basicOpen}</code>
            </span>
          </div>
          <!-- closed dialogs render nothing — the instance lives in the
               stage; showModal() lifts it into the top layer when open -->
          <Dialog title="Deploy queued" bind:open={basicOpen}>
            <p>build #128 is waiting for a runner. The log streams once it picks up.</p>
          </Dialog>
        </ComponentCanvas>
        <p class={cx(rt.para)}>
          Every exit — ×, Escape, or setting <code class={cx(rt.inkAccent)}>open = false</code> from
          code — runs the same 460ms surface timeline before the real
          <code class={cx(rt.inkAccent)}>close()</code>. Reduced-motion users get the instant close.
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
      summary="The footer snippet is the RAW override of the foot zone — and its standard content is <CardFooter>: the buttons passed as children auto-join one button-group at the row's inline end, ghost by default through the Dialog's zone scope, an explicit fill still winning for the primary. Cancel drops the dialog; Confirm does its work first, then closes through the same animated path. The form shells inside are engraved WELLS (the entity law, r14-12): the dialog is the one solid object — the inputs keep their crisp hairline edge while their ground dissolves into the panel's surface, the well inset carrying the depth; focus still tints, hover still deepens."
    >
      <div class={cx(rt.col20)}>
        <ComponentCanvas
          title="dialog · form footer"
          files={[{ name: 'dialog-form-demo.svelte', content: formUsage, kind: 'usage' }]}
          stage="center"
        >
          <div class={cx(rt.rowC16, rt.wrap, rt.justifyCenter)}>
            <PressButton onclick={() => (formOpen = true)}>Rotate API key…</PressButton>
            <span class={cx(rt.noteSmall)}>
              last action: <code class={cx(rt.inkAccent)}>{lastAction ?? '—'}</code>
            </span>
          </div>
          <Dialog title="Rotate API key" bind:open={formOpen}>
            <div class={cx(rt.col12)}>
              <p>Minting a new key revokes the current one after 24 hours.</p>
              <label class={cx(rt.flex, rt.col, rt.gap6, rt.text12)}>
                <span class={cx(rt.inkMuted)}>key name</span>
                <Input type="text" value="ci-runner" />
              </label>
            </div>
            {#snippet footer()}
              <CardFooter>
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
              </CardFooter>
            {/snippet}
          </Dialog>
        </ComponentCanvas>
        <CodeBlock code={formUsage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <!-- Footer clusters (r14-9): CardFooter's button economy -->
  <div id="dialog-card-footer-clusters" data-reveal="">
    <SectionCard
      family="dialog-card-footer-clusters"
      headerRegion="dialog-card-footer-clusters"
      eyebrow="demo"
      title="CardFooter — the foot zone's button economy"
      summary="The footer snippet overrides the whole foot — and its standard content is the CardFooter component. Buttons passed as its children auto-join ONE button-group packed at the row's inline end; the ghost default arrives by inheritance from the Dialog's zone scope (Context), so an unprefixed PressButton renders ghost while an explicit variant always wins, and the ghost seams rule the buttons. The cluster OPENS through the group's leadingSeam — the first button's own flush seam pseudo (r14-13), never a sibling element the grid's gap could detach. The end slot is the raw escape hatch — present, it replaces the grouped arrangement entirely, bracket and all."
    >
      <div class={cx(rt.col32)}>
        <p class={cx(rt.noteSmall)}>
          last action: <code class={cx(rt.inkAccent)}>{lastAction ?? '—'}</code>
        </p>
        <ComponentCanvas
          title="dialog · footer clusters"
          files={[
            { name: 'dialog-card-footer-group-demo.svelte', content: multiUsage, kind: 'usage' },
            { name: 'dialog-card-footer-end-demo.svelte', content: endUsage },
          ]}
          stage="center"
        >
          <div class={cx(rt.col16, rt.itemsCenter)}>
            <div class={cx(rt.rowC16, rt.wrap, rt.justifyCenter)}>
              <span class={cx(rt.eyebrow, rt.inkMuted)}>
                a · children — one auto group
              </span>
              <PressButton onclick={() => (clusterOpen = true)}>Publish release…</PressButton>
            </div>
            <div class={cx(rt.rowC16, rt.wrap, rt.justifyCenter)}>
              <span class={cx(rt.eyebrow, rt.inkMuted)}>
                b · end — the raw slot
              </span>
              <PressButton onclick={() => (endOpen = true)}>4 assets selected…</PressButton>
            </div>
          </div>
          <!-- demo A: CardFooter children — three buttons, one auto group
               (ghost by context; the explicit fill wins for primary) -->
          <Dialog title="Publish release" bind:open={clusterOpen}>
            <p>v2.4.0 is staged — 14 commits since the last tag, 3 files touched.</p>
            {#snippet footer()}
              <CardFooter>
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
              </CardFooter>
            {/snippet}
          </Dialog>
          <!-- demo B: CardFooter's raw end slot — replaces the grouped
               arrangement entirely -->
          <Dialog title="4 assets selected" bind:open={endOpen}>
            <div class={cx(rt.col8)}>
              <p>The bundle for the current audit:</p>
              <ul class={cx(rt.note12, rt.flex, rt.col, rt.gap4, rt.fontMono)}>
                <li>crash-report.sites — 812 KB</li>
                <li>tokens.json — 3.1 KB</li>
                <li>hero.tape — 1.2 MB</li>
                <li>audit.log — 96 KB</li>
              </ul>
            </div>
            {#snippet footer()}
              <CardFooter>
                {#snippet end()}
                  <span class={cx(rt.note12, rt.fontMono)}>2.1 MB total</span>
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
              </CardFooter>
            {/snippet}
          </Dialog>
        </ComponentCanvas>
        <div class={cx(rt.col12)}>
          <p class={cx(rt.eyebrow, rt.inkMuted)}>
            a · CardFooter children — three buttons, one auto group
          </p>
          <CodeBlock code={multiUsage} lang="svelte" meta="CardFooter — one group" />
        </div>
        <div class={cx(rt.col12)}>
          <p class={cx(rt.eyebrow, rt.inkMuted)}>
            b · CardFooter end — the raw slot, no group
          </p>
          <CodeBlock code={endUsage} lang="svelte" meta="end — raw slot" />
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- Custom head (r14-9): CardHeader carries the custom content -->
  <div id="dialog-head" data-reveal="">
    <SectionCard
      family="dialog-head"
      headerRegion="dialog-head"
      eyebrow="demo"
      title="CardHeader — a custom head"
      summary="The head snippet replaces the visible title row, and CardHeader is its content face: children ride flush, edge-to-edge — the content owns the row's height and padding (an Input shell brings its own), no zone insets intervening. The × close button still rides the head grid's end slot, and title keeps naming the dialog for assistive tech even though its visual row is gone — the search palette composes this same seam."
    >
      <div class={cx(rt.col20)}>
        <ComponentCanvas
          title="dialog · custom head"
          files={[{ name: 'dialog-head-demo.svelte', content: headUsage, kind: 'usage' }]}
          stage="center"
        >
          <div class={cx(rt.rowC16, rt.wrap, rt.justifyCenter)}>
            <PressButton onclick={() => (headOpen = true)}>Filter events…</PressButton>
            <span class={cx(rt.noteSmall)}>
              query: <code class={cx(rt.inkAccent)}>{headQuery.trim() || '—'}</code>
            </span>
          </div>
          <!-- custom head demo: CardHeader + col-start-1 carries the
               Input flush; title keeps the accessible name, the ×
               keeps its seat on the same row -->
          <Dialog title="Filter events" bind:open={headOpen}>
            {#snippet head()}
              <CardHeader class={cx(rt.dgColStart1)}>
                <Input
                  class={cx(rt.wFull, rt.minW0)}
                  placeholder="Filter events…"
                  aria-label="Filter events"
                  bind:value={headQuery}
                >
                  {#snippet innerInlineStart()}
                    <span
                      class={cx(rt.flexNone, rt.selectNone, rt.inkMuted)}
                      aria-hidden="true"><Icon name="search" /></span>
                  {/snippet}
                </Input>
              </CardHeader>
            {/snippet}
            {#if filtered.length === 0}
              <p>No events match “{headQuery.trim()}”.</p>
            {:else}
              <ul class={cx(rt.flex, rt.col, rt.gap4)}>
                {#each filtered as e (e)}
                  <li class={cx(rt.rowC10)}>
                    <span class={cx(rt.dgDot1, rt.flexNone, rt.bgPrimary)} aria-hidden="true"></span>
                    <span class={cx(rt.fontMono, rt.text12)}>{e}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </Dialog>
        </ComponentCanvas>
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
      summary="The panel itself never scrolls: the scroll ring is a row-ruled grid (head · separator · body · separator · foot) under a height cap, and the body zone is the only scroll environment — its scrollbar rides the zone edge with a stable both-edges gutter while the header bar and footer cluster stay pinned. The scroll itself is DECLARATIVE: scroll={false} asserts the body fits — the scroll authority and the gutter reservation retire together, the content keeps its full width. The class prop here caps the ring (a geometry-only override) so the scroll shows even on tall viewports."
    >
      <div class={cx(rt.col20)}>
        <ComponentCanvas
          title="dialog · scrolling body"
          files={[
            { name: 'dialog-scroll-demo.svelte', content: scrollUsage, kind: 'usage' },
            { name: 'dialog-fixed-demo.svelte', content: fixedUsage },
          ]}
          stage="center"
        >
          <div class={cx(rt.rowC16, rt.wrap, rt.justifyCenter)}>
            <PressButton onclick={() => (logOpen = true)}>Event log ({logLines.length} lines)…</PressButton>
            <PressButton onclick={() => (fixedOpen = true)}>Fixed body (scroll off)…</PressButton>
          </div>
          <!-- scrolling body demo: the ring cap comes from the class prop
               (geometry-only) — head and foot pin, the body zone scrolls -->
          <Dialog title="Event log" bind:open={logOpen} class="dg-clamp">
            <ol class={cx(rt.flex, rt.col, rt.gap4, rt.fontMono, rt.text12)}>
              {#each logLines as line, i (line)}
                <li class={cx(rt.flex, rt.gap12)}>
                  <span class={cx(rt.w24, rt.flexNone, rt.textRight, rt.inkMuted)}>{i + 1}</span>
                  <span>{line}</span>
                </li>
              {/each}
            </ol>
            {#snippet footer()}
              <CardFooter>
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
              </CardFooter>
            {/snippet}
          </Dialog>
          <!-- fixed body demo: scroll={false} asserts the content fits —
               the scroll authority and the both-edges gutter retire together -->
          <Dialog title="Session pinned" scroll={false} bind:open={fixedOpen}>
            <p>
              3 rules active · 2 breakpoints · no stack frames. The body declares
              itself a non-scroller — nothing to roll, no gutter to reserve.
            </p>
          </Dialog>
        </ComponentCanvas>
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
      <div class={cx(rt.grid760b)}>
        <div class={cx(rt.notePanel)}>
          <h3 class={cx(rt.fontNav, rt.mb12, rt.text13, rt.trackTight)}>platform-native, free</h3>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>showModal()</code> — top-layer rendering, focus trap, inert background</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>::backdrop</code> — the scrim pseudo-element;
                <code class={cx(rt.inkAccent)}>--scrim</code>: semi-transparent black in light mode,
                white in dark mode — a scrim dims/lightens, never colors</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>Escape — the <code class={cx(rt.inkAccent)}>cancel</code> event, intercepted only to share the fade</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>closed by default — no-JS page loads never paint dialog content inline</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>form method="dialog"</code> — footer submits close natively (instant, skips the fade)</span></li>
          </ul>
        </div>
        <div class={cx(rt.notePanel)}>
          <h3 class={cx(rt.fontNav, rt.mb12, rt.text13, rt.trackTight)}>jixoai additions &amp; extensions</h3>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>bind:open</code> — rising edge calls
                <code class={cx(rt.inkAccent)}>showModal()</code>, falling edge runs the teardown</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>surface timeline — the single motion addition: the 460ms --jx-p kernel drives entry, exit, and the scrim; instant under reduced motion</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>floating-surface law — the hard offset shadow is a REAL <code class={cx(rt.inkAccent)}>::after</code> layer; <code class={cx(rt.inkAccent)}>@starting-style</code> entry pulls the layers apart, the close fade presses them back; <code class={cx(rt.inkAccent)}>variant="solid | acrylic | auto"</code> paints the surface (acrylic = dual-layer <code class={cx(rt.inkAccent)}>backdrop-filter</code>)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>× close button — press physics, right of the header bar</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>extension: backdrop-click close; intercepting form submits so they fade too</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>
<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Dialog variants" summary="Title and footer are the two compositional axes; variant paints the surface.">
    <div class={cx(rt.dgGridMd3)}>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb8, rt.inkMuted)}>titled</p>
        <p class={cx(rt.body13)}>The header bar renders when <code class={cx(rt.inkAccent)}>title</code> is given — heading left, × close right.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb8, rt.inkMuted)}>chrome-less / footer</p>
        <p class={cx(rt.body13)}>Omit title for a bare body; the <code class={cx(rt.inkAccent)}>footer</code> snippet adds the separator-bounded foot zone — its standard content is <code class={cx(rt.inkAccent)}>CardFooter</code>, whose buttons auto-join one end-packed group, ghost by default.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb8, rt.inkMuted)}>variant</p>
        <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>solid | acrylic | auto</code> (default) — acrylic is a dual-layer backdrop-filter, auto defers to the environment's transparency preference.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Flip bind:open from anywhere — every exit (×, Escape, code) runs the same animated close."><CodeBlock code={basicUsage} lang="svelte" meta="Dialog usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The native dialog element carries the modal contract — role and Escape are the platform's, fully; the platform focus trap holds for the in-dialog cycle but LEAKS every second Tab (measured, per-press receipts by two reviewers: in-dialog tabbable → the page skip link → in-dialog tabbable — the only page focusable that escapes the modal inertness)."><A11yTable keys={[{ key: 'Tab', action: 'Cycles inside the dialog — the showModal() focus trap, WITH A MEASURED LEAK: every second press reaches the page\'s skip link (the one page focusable the modal inertness does not cover; reproduced per-press, two independent runs — the repair is the family\'s, W-next). From the skip link the next press returns to the dialog — the rest of the page IS inert' }, { key: 'Escape', action: 'Cancel event, intercepted only to share the animated close' }, { key: 'Enter / Space', action: 'Activate the focused control (× button, footer buttons, form method="dialog" submits)' }]} aria={[{ name: 'aria-label', value: 'title', description: 'On the dialog element — the header heading when given.' }, { name: 'role', value: 'dialog (native)', description: 'The platform element; no ARIA roles to maintain.' }, { name: 'aria-label', value: '"Close"', description: 'On the × button.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The surface rides the shared motion kernel — one animated custom property drives entry, exit, and the scrim."><div class={cx(rt.col20)}><p class={cx(rt.bodyMuted)}>the trigger inherits the density scope, the surface inherits through the DOM tree — flip the canvas dock's density select (xs / sm / default / lg) to re-scope them together; the scrim reads in both stage themes the same way. The four-copy DensityDemo row is retired by that select.</p><TokenTable tokens={[{ name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'Surface-motion progress: blurIn/slide/materials/shadow + backdrop opacity.' }, { name: '--scrim', default: 'black 32% / white 10%', source: 'color', description: '::backdrop — semi-transparent black (light, hsl(0 0% 0% / 0.32)) / white (dark, hsl(0 0% 100% / 0.1)), never a brand tint; the staged demos pin light, so their scrim stays black under root dark (measured).' }, { name: '--jx-surface-in-x/y', default: '0px / 6px', source: 'component', description: 'Entry translate offset.' }, { name: 'surface width', default: 'min(92vw, 26rem)', source: 'structural' }, { name: 'close fade', default: '120ms (skipped under reduced motion)', source: 'structural' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on dialog"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The elevation axis on this modal is STAMPED, NOT PAINTED (measured): the level carriers stamp the top-layered root (radius proves the channel — the 20px seat anchors the concentric law for everything inside), but the shadow/rung recipe never paints on the served dialog — no box-shadow, filter, or backdrop-filter on any channel at settle, level4/level3/6dp/level-1/dark visually identical. The wiring decision (wire the shadow reader or retire the rung receipts) is the family owner's — W-next. The table classifies all eight axes against the served family; the query() seat rides the radius lane across the 48rem key."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the PORTAL LAW — the top-layer promotion moves PAINT, not DOM, and the axis
          carriers stamp the panel's OWN root either way, so the resolved axes are SELF-CARRIED
          (a trigger ancestor's stamps never span the boundary); the radius channel is the one
          elevation-adjacent lane that PAINTS (the 20px seat → 6px auto child, measured
          digit-exact through the top layer); the elevation rungs are the stamped-not-painted
          class (W-next #18, the walk found zero shadow channels at settle); the theme axis is
          the island stamp (class:dark on the dialog root re-scopes the card kernel's tokens
          inside the subtree — the family itself carries zero var-chain theme reads, grep
          receipt); and LAW #19 held — duplicate ids NONE page-wide (measured on the served
          page). The query() seat below rides the md viewport key (48rem) on the radius lane:
          below it the anchor is 8px (the auto child clamps at max(0px, 8 − 14) = 0px), at md+
          the anchor is 20px and the child steps to 6px — the concentric law moving WITH the
          query.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
      </div>
      <ComponentCanvas title="Dialog · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.wrap12)}>
          <PressButton onclick={() => (u1 = true)}>level4 · default</PressButton>
          <PressButton onclick={() => (u2 = true)}>level3</PressButton>
          <PressButton onclick={() => (u3 = true)}>elevation=&#123;6&#125;</PressButton>
          <PressButton onclick={() => (u4 = true)}>level-1 · concave</PressButton>
          <PressButton onclick={() => (u5 = true)}>radius 20 · concentric</PressButton>
          <PressButton onclick={() => (u6 = true)}>dark · theme axis</PressButton>
          <PressButton onclick={() => (uq = true)}>radius · query()</PressButton>
        </div>
        <Dialog title="level4 · the modal default" variant="solid" bind:open={u1}><p class={cx(rt.text13)}>The own level stamps level4 — the 8dp recipe and the surface-container-high rung are the level TABLE's pairing; on the served surface the shadow does not paint (measured — W-next owns the wiring).</p></Dialog>
        <Dialog title="level3 · one rung down" variant="solid" elevation="level3" bind:open={u2}><p class={cx(rt.text13)}>The level3 stamp pairs 6dp + the surface-container rung in the table — same unpainted truth as level4.</p></Dialog>
        <Dialog title="6dp · the number lane" variant="solid" elevation={6} bind:open={u3}><p class={cx(rt.text13)}>Exact dp snaps down to the enclosing table rung — 6dp IS level3 (the mapping is real; the shadow it names is the unpainted half).</p></Dialog>
        <Dialog title="level-1 · the concave" variant="solid" elevation="level-1" bind:open={u4}><p class={cx(rt.text13)}>The concave rung — the inset 1px recipe over the deepest ladder step; stamped, and like every sibling here the shadow stays unpainted (可填充的凹陷, measured).</p></Dialog>
        <Dialog title="radius 20 · the concentric anchor" radius={20} bind:open={u5}><p class={cx(rt.pb8, rt.text13)}>children at radius="auto" compute max(0px, 20 − 14) = 6px — the §3 law through the top layer, the one elevation-adjacent lane that PAINTS (measured digit-exact).</p><PressButton radius="auto">auto radius</PressButton></Dialog>
        <Dialog title="dark · the theme axis" variant="solid" theme="dark" bind:open={u6}><p class={cx(rt.text13)}>The dark theme axis — the table's rung STEPPING claim is unpainted on the served surface (same W-next decision); the axis itself still stamps the scope.</p></Dialog>
        <!-- the query() seat: responsive radius on the painting lane —
             below 48rem the anchor resolves 8px (auto child clamps to
             0px), at md+ 20px (child 6px); resize across the key and
             reopen to see the concentric pair step together -->
        <Dialog title="Responsive radius · query()" radius={responsiveRadius} bind:open={uq}><p class={cx(rt.text13)}>Resize across 48rem and reopen: below the key the anchor is 8px, at md+ it is 20px — and the child at radius="auto" rides the concentric calc (0px below, 6px at md+).</p><PressButton radius="auto">auto radius rides the anchor</PressButton></Dialog>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Nine props — the platform owns every behavior; the component owns state binding, zone presence, and the zone variant scopes. The footer snippet is the RAW full override of the foot zone; the head/footer content faces are the composition components below."><PropsTable universal props={[{ name: 'title', type: 'string', default: '—', description: 'Heading of the default title row (rendered through CardHeader); omit for a chrome-less body. Still names the dialog (aria-label) when a head snippet replaces the visible row.' }, { name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state: true → showModal(), false → animated close.', bindable: true }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint; auto defers to the environment’s transparency preference. Defaults: literal slot — own ’auto’, ambient when an axis opens.' }, { name: 'class', type: 'string', default: "''", description: 'Geometry-only utilities appended after the law’s own (a consumer’s anchor/width, a scroll-ring cap); the platform still paints nothing.' }, { name: 'scroll', type: 'boolean', default: 'true', description: 'The body zone’s scroll authority (the panel never scrolls). false asserts the body fits — the scroll authority and the stable both-edges gutter reservation retire together.' }, { name: 'head', type: 'Snippet', default: '—', description: 'Replaces the visible title row — typically a CardHeader wrapping custom content; the × close still rides the head grid’s end slot.' }, { name: 'children', type: 'Snippet', default: '—', description: 'Dialog body — the only scrollable zone.', required: true }, { name: 'footer', type: 'Snippet', default: '—', description: 'The RAW full override of the foot zone — its standard content is a CardFooter (buttons auto-joined in one end-packed group, ghost by the zone’s scope).' }, { name: 'cancelGuard', type: '() => boolean', default: '—', description: 'Consulted on the native cancel request (Escape); returning true holds the dialog open (e.g. through an IME composition).' }]} /></SectionCard></div>
  <div id="composition" data-reveal=""><SectionCard family="composition" headerRegion="composition" eyebrow="api" title="CardHeader · CardFooter — the zone content faces" summary="The slot architecture belongs to the zones' content, carried by components (r14-9): Dialog renders the zones and writes the ghost variant scopes; these two are what the zones usually show. CardHeader is also Dialog's internal default — the untitled title row has exactly one source."><PropsTable props={[{ name: 'CardHeader · title', type: 'string', default: '—', description: 'The default title row (padded chrome bar); yields to children.' }, { name: 'CardHeader · children', type: 'Snippet', default: '—', description: 'Custom head content, FLUSH edge-to-edge — owns its own geometry (the palette’s Input).' }, { name: 'CardFooter · children', type: 'Snippet', default: '—', description: 'The action buttons — auto-joined in ONE ButtonGroup packed at inline-end; ghost inherited from the Dialog zone scope, an explicit variant wins; ghost seams rule the buttons.' }, { name: 'CardFooter · end', type: 'Snippet', default: '—', description: 'Raw inline-end content: present, it replaces the grouped arrangement entirely — the opt-out for non-button content or a custom cluster, bracket and all.' }, { name: 'CardFooter · opening line', type: 'structural', default: 'leadingSeam', description: 'The actions region’s boundary — the ButtonGroup’s leadingSeam capability: the first button’s own flush seam pseudo (r14-13), not a sibling element; gone with the group under the end face.' }, { name: 'CardFooter · label', type: 'string', default: "'Dialog footer'", description: 'The ButtonGroup’s accessible name.' }]} /></SectionCard></div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list); chrome — out of
       the toc -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="dialog" />
  </div>
</div>

<style>
  /* the scrolling-body clamp: the dialog's card face caps at 22rem so
     the body zone scrolls while head and foot pin (the [&_[data-jx-card]]
     descendant seam — the page-style lane, the pilot gotcha #4 static law) */
  .dg-clamp :global([data-jx-card]) {
    max-height: 22rem;
  }
</style>

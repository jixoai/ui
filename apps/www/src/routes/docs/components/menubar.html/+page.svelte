<!--
  Docs page for the menubar family (docs-eight-axes-mdn task 31, tier 2).
  Archetype skeleton: hero (h1) / install / overview / live demo / types /
  usage / theming / api / axes / accessibility / see-also — toc == DOM,
  chrome (install, see-also) out of the toc, the api → axes →
  accessibility trio LAST.
  Every axes-row claim is measured on the served DOM or negative-grepped
  over ui/menubar/ + surface-motion.ts (receipts inline).
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import Menubar from '$lib/ui/menubar/menubar.svelte';
  import MenubarItem from '$lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '$lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '$lib/ui/menubar/menubar-panel.svelte';
  import MenubarMenuItem from '$lib/ui/menubar/menubar-menu-item.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import menubarSource from '$lib/ui/menubar/menubar.svelte?raw';
  import menubarCssSource from '$lib/ui/menubar/menubar.css?raw';

  const close = '</' + 'script>';

  // Playground protocol: the page owns the snapshots + reset; the echo
  // footer surfaces the last menu selection.
  const canvasInitial = { last: '—' };
  let last = $state<string>(canvasInitial.last);
  function resetCanvas(): void {
    last = canvasInitial.last;
  }

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import {
    Menubar,
    MenubarItem,
    MenubarTrigger,
    MenubarPanel,
    MenubarMenuItem,
  } from '@ui/menubar/index';
${close}

<Menubar label="app">
  <MenubarItem id="file">
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarPanel>
      <MenubarMenuItem href="/open">Open…</MenubarMenuItem>
      <hr />
      <MenubarMenuItem onselect={() => close()}>Close</MenubarMenuItem>
    </MenubarPanel>
  </MenubarItem>
</Menubar>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/menubar/menubar.svelte', content: menubarSource },
    { name: 'registry/files/ui/menubar/menubar.css', content: menubarCssSource },
    { name: 'src/lib/ui/menubar-usage.svelte', content: usage, kind: 'usage' },
  ];

  // types demo, mirrored by hand for the drawer (the same-source
  // resolveRawCode migration is the recorded follow-up)
  const menubarTypesDemo = `<script lang="ts">
  import {
    Menubar,
    MenubarItem,
    MenubarTrigger,
    MenubarPanel,
    MenubarMenuItem,
  } from '@ui/menubar/index';
${close}

<div class={cx(rt.mbarGrid)}>
  <div class={cx(rt.panel)}><Menubar label="automatic"><MenubarItem id="types-file"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem></Menubar></div>
  <div class={cx(rt.panel)}><Menubar label="solid" variant="solid"><MenubarItem id="types-edit"><MenubarTrigger>Edit</MenubarTrigger><MenubarPanel><MenubarMenuItem>Undo</MenubarMenuItem></MenubarPanel></MenubarItem></Menubar></div>
</div>`;

  const typesFiles: TreeFile[] = [
    { name: 'menubar-types-demo.svelte', content: menubarTypesDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<Menubar label="actions" density="large">…</Menubar>
<Menubar label="rounded" radius="medium">…</Menubar>
<Menubar label="dark" theme="dark">…</Menubar>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/menubar-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 31) — every cell measured on the
  // served DOM (probe) or negative-grepped over ui/menubar/ +
  // surface-motion.ts; receipts live in the rows and the footnote. ──
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED — the bar's geometry rides the density kernel channels, TWO channels deep. Measured across the scope ladder xs/default/lg: trigger min-block-size (--jx-hit) 28/40/48px, voice (--jx-text) 11/13/15px, line (--jx-line) 16/20/24px, inline padding (--jx-inset) 8/12/16px. Ambient (the bar's data-density attr renders null, measured) the channels cascade from the ancestor [data-density] scope; an EXPLICIT lane stamps the rung attr on the bar root and the same global scope selector re-scopes the subtree (measured data-density=lg → 48px/15px/16px in place). The panel mirrors bar.density through the family context. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "ROOT ECHO, NO GEOMETRY FOLLOWS — the §11 stamp moves the bar's own font-size (16px ambient, measured); nothing else scales: the parts' voices are the density kernel's px channels (--jx-text 13px at the default rung) and the family is em-free (grep receipt: the single rem value is the panel's 10rem min-width; zero readers of --jx-size-effective in ui/menubar/). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED BY THE PANEL's corner-shape — menubar.css reads var(--jx-shape-effective, round) on .jx-menubar-panel (the §14 alias ladder; ambient round). The bar chrome itself is square: the bar atoms carry no border-radius at all. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "PANEL-ONLY CONSUMPTION — the bar root stamps --jx-radius-consumed (auto: the §3 concentric calc) and .jx-menubar-panel's border-radius reads it with the auto fallback verbatim. Measured chain, live: ambient 0px; stamping --jx-radius-effective: 12px on the bar re-rendered the open panel at 12px and back to 0px on removal — while the BAR itself never rounds. An explicit lane supplies the same way. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the hue carriers are stamped and unread (grep receipt: zero color-channel readers in ui/menubar/); the family paints the neutral surface and muted-ink voices. Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE SPLIT VOICE (measured per element) — explicit dark rides the .dark class bridge on the bar root. RE-DERIVING through live css chains: the trigger hover pose (--muted) measured oklch(0.2178 0 0) dark, the panel surface (--jx-elevation-level2-surface chain) dark acrylic, the panel ink (--popover-foreground) white — the in-place panel keeps the scope through its top-layer promotion (paint moved, not DOM). FROZEN as :root literal snapshots (stylex defineVars — the family stamps no tokenScope class): the bar card stayed oklch(1 0 0) while --card flipped to 0.3211, and the OPEN pose (--jx-muted) stayed 0.9551 light — a light open band on the dark bar while not hovered. system/auto = tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED, SPLIT BY ROLE — the BAR is chrome: its card shadow is the typed --jx-shadow-2xs (1px 1px 0px measured), not the axis. The PANEL rides the family's own level2 (3dp, the menu rung — the MenubarDefaults own): the bar stamps --jx-elevation-effective: 3 plus the level2 surface/shadow supply vars (style attr measured), and the panel body carries the recipe (rgba(0,0,0,.3) 0 1px 2px + rgba(0,0,0,.15) 0 2px 6px 2px measured). An explicit lane re-supplies the panel. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY AT THE AXIS — --jx-motion-effective has ZERO readers in ui/menubar/ and in surface-motion.ts (grep receipt); the open/close motion is the declarative WAAPI kernel's constant timeline (display/overlay 460ms allow-discrete; every visible property a formula of --jx-p; prefers-reduced-motion handled by media query, not the axis). The pose transitions that DO exist: trigger color/background 150ms ease-out, menu item 100ms (measured computed durations). No hover-open cascade: panels open by click or keys only (grep: no pointer handlers in the family). Number unit: coefficient.",
    },
  ];

  // the ONE query() case: responsive density — a string lane takes both
  // generics; md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small');

  const queryUsage = `<script lang="ts">
  import Menubar from '@ui/menubar/menubar.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (small) applies; at 48rem+ the md case (large)
     wins — 32px hits become 48px, the whole kernel ladder re-rungs -->
<Menubar label="responsive" density={query({ md: 'large' }, 'small')}>…</Menubar>`;

  const queryFiles: TreeFile[] = [
    { name: 'menubar-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

  // ── the API table's EXTRA-lane candidates: the density row carries an
  // axis NAME with the family's ambient-scope contract — its inline
  // literal text is FROZEN by the ambient matrix (route menubar,
  // table 0, density occurrence 1); the measured numbers live in the
  // axes table. ──

</script>

<svelte:head>
  <title>Menubar · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai menubar family: the application menu bar with its own walker — a single roving stop, arrows gliding between top menus, popover=manual role=menu panels anchored by CSS anchor positioning and animated by the shared surface kernel."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass single-row bar under the scaffold header -->

  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · ARIA"
        title="menubar — File, Edit, View, ruled by the platform's gap"
        summary="The application menu bar's top-level contract differs from stacked dropdowns, so it gets its OWN walker: Tab lands on the single roving stop; ←/→ move between triggers — and from an open bar the glide closes the current panel, opens the next, and focuses its first item; ↓/↑/Enter open; Home/End jump; Escape hands focus back to the trigger. The family composes: MenubarItem owns the ONE id, MenubarTrigger and MenubarPanel derive theirs (aria-controls always resolves), the panel registers its imperative handles at init — first registration wins — and the walkers are scoped to the nearest menu so nested dropdown families never leak."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">role=menubar</span>
          <span class="pill">roving glide walking</span>
          <span class="pill">popover=manual panels</span>
          <span class="pill">in-place top-layer promotion</span>
        </div>
      </SectionCard>
    </div>

    <!-- install (the archetype's install anchor; chrome — out of the toc) -->
    <div id="install" data-reveal="">
      <DocsInstall name="menubar" />
    </div>

    <!-- overview -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="A composed family — Item, Trigger, Panel, MenuItem — over one bar-owned walker, in-place top-layer panels, and the shared surface kernel."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            The composition protocol is the family's spine:
            <code class={cx(rt.inkPrimary)}>MenubarItem</code> owns the ONE id (mount-stable by
            contract), Trigger and Panel derive theirs
            (<code class={cx(rt.inkPrimary)}>{'${id}-trigger'}</code> /
            <code class={cx(rt.inkPrimary)}>{'${id}-panel'}</code>) so
            <code class={cx(rt.inkPrimary)}>aria-controls</code> always resolves regardless of
            render order, and the panel registers its imperative show/hide handles at INIT under
            the panel id — first registration wins, a conditionally removed panel leaves no ghost
            handle. Both walkers are scoped with
            <code class={cx(rt.inkPrimary)}>closest('[role=menu]')</code>, so menubar panels AND
            nested dropdown-menu families never leak into the bar walk. Separators stay plain
            <code class={cx(rt.inkPrimary)}>&lt;hr&gt;</code>.
          </p>
          <p class={cx(rt.para)}>
            The panel is a <code class={cx(rt.inkPrimary)}>popover=manual</code>
            <code class={cx(rt.inkPrimary)}>role=menu</code> surface: the family owns dismissal (a
            document pointerdown outside-check plus panel Escape — popover=auto's light dismiss
            raced the trigger click), CSS anchor positioning places it
            (<code class={cx(rt.inkPrimary)}>position-area: bottom span-right</code> with a
            flip-block fallback and anchors-visible scroll hiding; a viewport-center fallback for
            engines without anchoring; a transparent ::backdrop — light dismiss must never dim).
            Motion is the shared surface kernel, ONE instance PER PANEL — a single shared
            animation slot would cancel the outgoing exit during a glide and ghost it at rest —
            anchored to the item's slot span, the live axis. And the promotion is IN PLACE: the
            panel renders inside the item's slot span and the top layer moves paint, not DOM, so
            the bar's stamps inherit down — measured, stamping
            <code class={cx(rt.inkPrimary)}>--jx-radius-effective: 12px</code> on the bar
            re-rendered the open panel at 12px. Body-appended portals would sever exactly that
            inheritance; this family carries none.
          </p>
          <p class={cx(rt.para)}>
            The eight axes split by role (all measured in the axes table below): density is the
            live two-channel ladder; radius is panel-only consumption; elevation splits bar-chrome
            2xs from the panel's own level2 rung; theme is the split voice — live css chains
            re-derive under .dark while the stylex atom snapshots stay frozen light. Kinship:
            <code class={cx(rt.inkPrimary)}>navigation-menu</code> (the declaration-scope sibling
            whose panel promotes to the shared .jx-pop carrier — the menubar keeps its OWN panel
            law instead) and <code class={cx(rt.inkPrimary)}>dropdown-menu</code> (the item walk
            contract, duplicated deliberately so registry items stay independent).
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- live demo (toc section; own drawer) -->
    <div id="live-demo" data-reveal="">
      <ComponentCanvas
        title="menubar"
        description="Tab lands on File. ↓ opens and walks items; → from the open bar glides to Edit and focuses its first item; Escape returns to the trigger; click outside dismisses — the family owns the popover lifecycle. Selections echo in the footer."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/menubar/menubar.svelte"
        files={canvasFiles}
        stage="center"
        onreset={resetCanvas}
        output={[{ label: 'last selection', value: last }]}
      >
        <Menubar label="demo app">
          <MenubarItem id="file">
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarPanel>
              <MenubarMenuItem href="/docs/components.html">Open docs…</MenubarMenuItem>
              <hr />
              <MenubarMenuItem onselect={() => (last = 'File → close')}>Close</MenubarMenuItem>
            </MenubarPanel>
          </MenubarItem>
          <MenubarItem id="edit">
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarPanel>
              <MenubarMenuItem onselect={() => (last = 'Edit → undo')}>Undo</MenubarMenuItem>
              <MenubarMenuItem onselect={() => (last = 'Edit → redo')}>Redo</MenubarMenuItem>
            </MenubarPanel>
          </MenubarItem>
          <MenubarItem id="view">
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarPanel>
              <MenubarMenuItem onselect={() => (last = 'View → commands')}>Commands</MenubarMenuItem>
              <MenubarMenuItem onselect={() => (last = 'View → problems')}>Problems</MenubarMenuItem>
            </MenubarPanel>
          </MenubarItem>
        </Menubar>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the glide is one hop from the trigger: → closes the current panel, opens the next,
              and focus lands INSIDE it (the Item owns the one id; Trigger and Panel derive
              theirs — <code class={cx(rt.inkAccent)}>{'${id}-trigger'}</code> /
              <code class={cx(rt.inkAccent)}>{'${id}-panel'}</code> — and the panel's handles
              register at init under the panel id). From inside a panel the walker is
              ↓/↑/Home/End; Escape hands focus back to the trigger. Separators stay plain
              <code class={cx(rt.inkAccent)}>&lt;hr&gt;</code>.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Compose top-level menus with linked triggers and panels, choosing the floating-surface variant at the root. Measured: auto resolves acrylic — blur(14px) saturate(1) brightness(2) on the surface body — while solid paints flat (backdrop-filter none)."><ComponentCanvas title="menubar · types" stage="fill" files={typesFiles}>
    <div class={cx(rt.mbarGrid)}><div class={cx(rt.panel)}><Menubar label="automatic"><MenubarItem id="types-file"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem></Menubar></div><div class={cx(rt.panel)}><Menubar label="solid" variant="solid"><MenubarItem id="types-edit"><MenubarTrigger>Edit</MenubarTrigger><MenubarPanel><MenubarMenuItem>Undo</MenubarMenuItem></MenubarPanel></MenubarItem></Menubar></div></div>
    </ComponentCanvas></SectionCard></div>

    <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="MenubarItem owns the stable id; Trigger and Panel derive their paired ids from it; the panel's children are MenuItems and plain separators."><CodeBlock code={usage} lang="svelte" meta="Menubar usage" /></SectionCard></div>

    <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The bar and its menu items consume the shared density rhythm (hit 28/40/48px, voice 11/13/15px, inset 8/12/16px across xs/default/lg — measured); the panel's anchor margin rides the family's own --jx-bar-gap (8px, measured — known limit: popover.css's uniform-margin flip does not read it, the anchor offset is fixed) and its surface fill rides the level2 supply."><div class={cx(rt.flex, rt.col, rt.gap20)}><DensityDemo scopes={['xs', 'default', 'lg']}><Menubar label="density"><MenubarItem id="density-file"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem></Menubar></DensityDemo><div class={cx(rt.mt20)}><TokenTable tokens={[{ name: '--jx-bar-gap', default: '8px', source: 'component' }, { name: '--jx-hit', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-elevation-level2-surface', default: 'var(--surface-container-low)', source: 'structural' }]} /></div></div></SectionCard></div>

    <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The generated meta carries 14 props (13 named + the synthesized rest); the hand table’s density row folds into the shared universal section beneath (authored 3, served 2 — label and variant render here; the fold serves the eight axis rows). The universal fold serves the eight axis rows; the family-specific density MEASUREMENTS live in the axes table."><PropsTable universal title="Menubar" props={[{ name: 'label', type: 'string', default: "'menu bar'", description: 'Accessible menubar landmark label.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows. The channels it drives are measured in the axes table (28/40/48px hit, 11/13/15px voice at xs/default/lg).' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint for every panel in the bar. Defaults: literal slot — own ’auto’, ambient when an axis opens. On the surface body: auto resolves acrylic (blur(14px) measured), solid paints flat (backdrop-filter none measured).' }]} /><div class={cx(rt.mt20)}><PropsTable title="MenubarItem / MenubarTrigger / MenubarPanel / MenubarMenuItem" props={[{ name: 'id', type: 'string', description: 'The ONE id, owned by MenubarItem and mount-stable; Trigger and Panel derive theirs from it.' }, { name: 'href', type: 'string', description: 'Renders a navigating menu item when provided (an anchor role=menuitem).' }, { name: 'onselect', type: '(event: MouseEvent) => void', description: 'Runs an action, then the panel closes and focus restores to its trigger.' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on menubar"
      summary="Density is the one live two-channel ladder (kernel geometry measured 28/40/48px hits; an explicit rung attr re-scopes the subtree in place). Radius is PANEL-ONLY consumption — the bar chrome never rounds; the panel's corner rides --jx-radius-consumed with corner-shape beside it. Elevation splits bar-chrome 2xs from the panel's own level2 rung. Theme is the SPLIT VOICE: poses and panel re-derive dark through live chains while the stylex atom snapshots stay frozen light. Size echoes on the bar root only; color and motion supply unread; no hover-open cascade exists to muddy the transitions."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the density ladder (28/40/48px · 11/13/15px · 8/12/16px), the explicit-rung
          re-scope (data-density=lg stamped in place), the radius chain (0 → 12px → 0 on the open
          panel), the theme split (--card flipped 0.3211 while the bar card stayed white; hover
          pose 0.2178 dark; open pose 0.9551 light), the level2 shadow recipe and the variant
          blur split were measured on this page's served DOM (probe, task 31); the supply-only and
          zero-reader rows carry grep receipts over ui/menubar/ and surface-motion.ts. The
          universal demo folds in below, with a query() seat: the density lane rides the md
          viewport key (48rem).
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="menubar · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Menubar label="responsive" density={responsiveDensity}>
                <MenubarItem id="query-file">
                  <MenubarTrigger>File</MenubarTrigger>
                  <MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel>
                </MenubarItem>
              </Menubar>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (small — 32px hits, 12px voice)
                applies; at 48rem and wider the md case wins (large — 48px hits, 15px voice). The
                string lane takes both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="Menubar · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)}>
                <Menubar label="dense" density="large">
                  <MenubarItem id="uni-density"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem>
                </Menubar>
                <p class={cx(rt.note12, rt.inkMuted70)}>density="large" — 48px hits, 15px voice</p>
              </div>
              <div class={cx(rt.panel)}>
                <Menubar label="rounded" radius="medium">
                  <MenubarItem id="uni-radius"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem>
                </Menubar>
                <p class={cx(rt.note12, rt.inkMuted70)}>radius="medium" — open the panel: it rounds, the bar stays square</p>
              </div>
              <div class={cx(rt.panel)}>
                <Menubar label="dark" theme="dark">
                  <MenubarItem id="uni-dark"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem>
                </Menubar>
                <p class={cx(rt.note12, rt.inkMuted70)}>theme="dark" — the split voice: panel re-derives dark, atom chrome stays light</p>
              </div>
              <div class={cx(rt.panel)}>
                <Menubar label="beveled" shape="bevel">
                  <MenubarItem id="uni-shape"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem>
                </Menubar>
                <p class={cx(rt.note12, rt.inkMuted70)}>shape="bevel" — the panel's corner-shape, ambient round elsewhere</p>
              </div>
            </div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The application menu follows the menubar and menu keyboard patterns with a roving top-level tab stop and a one-hop glide; the walkers are scoped so nested menu families never leak."><A11yTable keys={[{ key: 'Tab', action: 'Enters the bar at the single roving stop — the bar trims to one tabbable trigger after mount (measured 0 / -1 / -1).' }, { key: '← / →', action: 'Move between triggers; from an open bar the glide closes the current panel, opens the next, and focuses its first item (measured: focus lands inside the next panel — one hop per press).' }, { key: '↓ / ↑ / Enter', action: 'Open the focused trigger\'s panel and focus its first item.' }, { key: '↓ / ↑ / Home / End in a panel', action: 'Walk the open panel with wrapping — scoped to the nearest menu, so nested families never leak.' }, { key: 'Escape', action: 'Close the panel and return focus to its trigger (measured).' }, { key: 'Click outside', action: 'Dismisses — the family owns the popover lifecycle (popover=manual), so an outside-pointerdown check replaces auto light-dismiss.' }]} aria={[{ name: 'role', value: 'menubar / menu / menuitem', description: 'Exposes the application menu hierarchy; triggers are buttons cast as menuitem.' }, { name: 'aria-controls', value: 'derived panel id', description: 'Pairs each trigger with its panel through the id protocol — always resolves regardless of render order.' }, { name: 'aria-haspopup', value: 'menu', description: 'Identifies triggers that open a menu.' }, { name: 'aria-expanded', value: 'true / false', description: 'Mirrors the open-panel state on the trigger.' }, { name: 'aria-label', value: 'Menubar landmark label', description: 'The label prop names the bar (default "menu bar").' }]} /></SectionCard></div>

    <!-- see-also (chrome — out of the toc) -->
    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="menubar" />
    </div>
  </div>
</div>

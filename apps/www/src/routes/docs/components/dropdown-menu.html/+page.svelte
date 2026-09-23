<!--
  dropdown-menu — docs page (docs-eight-axes-mdn task 10, quill
  2026-09-22; tier 2 over the W3-era page: the demo canvas, playground,
  platform/component split and a11y table survive, the skeleton
  re-orders to the archetype and gains Overview + the per-axis table +
  the generated props table + one real query() case).
  Order: hero → install → overview → usage → live demo → props → the
  eight axes → accessibility → see-also. Baseline skill:
  openspec/changes/docs-eight-axes-mdn/skills/mdn-doc-style.md §2.
  The composed-consumer law cuts both ways: the family CONSUMES
  density/shape/radius/elevation on its own chrome AND stamps carriers
  for its composers (breadcrumb's composed menu, menubar,
  navigation-menu, button-group, the canvas dock's axis bar).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DropdownMenu from '$lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { meta as dropdownMenuMeta } from '$lib/meta/dropdown-menu.meta';
  import { DROPDOWN_MENU_DOCS } from '$lib/ui/props-table/docs/dropdown-menu.docs';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import dropdownMenuSource from '$lib/ui/dropdown-menu/dropdown-menu.svelte?raw';
  import dropdownMenuItemSource from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte?raw';

  // Playground protocol: the page owns the snapshot + reset; the echo footer
  // replaces hand-written "last action" captions.
  const canvasInitial = { lastAction: '' };
  let lastAction = $state(canvasInitial.lastAction);
  function resetCanvas(): void {
    lastAction = canvasInitial.lastAction;
  }
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<DropdownMenu id="actions" triggerLabel="Actions">
  <DropdownMenuItem onclick={rename}>Rename…</DropdownMenuItem>
  <DropdownMenuItem destructive onclick={del}>Delete</DropdownMenuItem>
</DropdownMenu>
<!-- last action: ${q(lastAction || '—')} -->`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import DropdownMenu from '@ui/dropdown-menu.svelte';
  import DropdownMenuItem from '@ui/dropdown-menu-item.svelte';
${close}

<DropdownMenu id="actions" triggerLabel="Actions">
  <DropdownMenuItem onclick={rename}>Rename…</DropdownMenuItem>
  <DropdownMenuItem onclick={duplicate}>Duplicate</DropdownMenuItem>
  <hr />  <!-- separator: the native element already means it -->
  <DropdownMenuItem destructive onclick={del}>Delete</DropdownMenuItem>
</DropdownMenu>`;

  const canvasUsage = `<DropdownMenu id="actions" triggerLabel="Actions">
  <DropdownMenuItem onclick={rename}>Rename…</DropdownMenuItem>
  <DropdownMenuItem destructive onclick={del}>Delete</DropdownMenuItem>
</DropdownMenu>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/dropdown-menu.svelte', content: dropdownMenuSource },
    { name: 'registry/files/ui/dropdown-menu-item.svelte', content: dropdownMenuItemSource },
    { name: 'src/lib/ui/dropdown-menu-usage.svelte', content: canvasUsage },
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

  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- radius: an explicit lane makes the menu the CONCENTRIC
     ANCHOR (effective × the §14 factor); auto consumes the
     broadcast against the panel's own ancestors -->
<DropdownMenu id="r-auto" triggerLabel="radius auto">…</DropdownMenu>
<DropdownMenu id="r-md" triggerLabel="radius medium" radius="medium">…</DropdownMenu>

<!-- elevation: the menu panel's OWN is level2 (3dp, M3's menu rung);
     an explicit level steps the theme's elevation table -->
<DropdownMenu id="e-l4" triggerLabel="level4" elevation="level4">…</DropdownMenu>

<!-- theme: PARTIAL re-theme — the panel (bezel, ink, focus ring,
     destructive pair) flips under .dark; the trigger chrome rides the
     frozen stylex aliases and keeps the page profile -->
<DropdownMenu id="t-dark" triggerLabel="dark island" theme="dark">…</DropdownMenu>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/dropdown-menu-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive density on the menu's hit lanes —
  // the base (large: the touch-size trigger and items) applies below
  // the 40rem viewport; at ≥40rem the sm case wins and both compact.
  // The explicit generics pin the cases AND the base to the lane (the
  // campaign's query() typing law).
  const responsiveDensity = query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large');

  const queryUsage = `<script lang="ts">
  import DropdownMenu from '@ui/dropdown-menu.svelte';
  import DropdownMenuItem from '@ui/dropdown-menu-item.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<DropdownMenu
  id="responsive"
  triggerLabel="responsive menu"
  density={query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')}
>
  <DropdownMenuItem>Rename…</DropdownMenuItem>
</DropdownMenu>`;

  const queryFiles: TreeFile[] = [{ name: 'dropdown-menu-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // ---- the per-axis table (§2.5). Grep receipts: zero --jx-size-effective /
  // --jx-color-effective / --jx-motion-effective readers in ui/dropdown-menu/
  // (the supply rows); the consumed rows name the family's own css.
  const axisRows: PropEntry[] = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-size-effective; no family css reads it (grep receipt: zero readers in ui/dropdown-menu/). The menu's type is the fixed 13px .jx-menu law and the trigger rides the density channels — this stamp moves neither. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED — the panel silhouette: .jx-menu paints corner-shape: var(--jx-shape-effective, round), so a named step re-shapes the bezel live (round default; squircle superellipse where corner-shape is supported). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED both ways (the §3/§14 chain). An explicit lane makes the menu the CONCENTRIC ANCHOR: the root stamps --jx-radius-consumed = --jx-radius-effective × --jx-radius-factor-effective. auto consumes the broadcast against the panel's OWN ancestors — the css fallback is the §3 concentric calc verbatim (max(0px, effective − inset-effective) × factor), so at the root invariants the panel honestly computes 0. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED — the menu's rhythm lanes: trigger and items read --jx-hit (min-block-size), --jx-gap, --jx-inset (padding), --jx-text/--jx-line (type) — the named rung stamps data-density on the anchor AND the panel and the scope block re-bases them in scope. The menu is also a STRUCTURAL PROVIDER: the density lane is inherit-then-provide (the eager-capture law), so items resolve their own stamp through the same contract and composers inherit the menu's scope. The NUMBER lane carries no rung (the input-group narrowing at the legacy edge) — the coefficient rides the carriers and re-bases nothing (the declaring-element law). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers in ui/dropdown-menu/). The menu's ink rides the theme's raw tokens (--popover-foreground, the destructive pair); hue that paints comes from the theme or the jx-hue-* injection. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "PARTIAL re-theme, split by the declaring-selector grep. FLIPS under the panel's .dark (raw tokens): the panel ink (--popover-foreground) and with it the walk highlight (color-mix over currentColor), the focus ring (--ring), the destructive hover pair, the bezel SEAM (--border) — and the bezel FILL, though not through --popover: the own level2 stamp is unconditional, so .jx-surface-body's fill resolves the elevation ladder (--jx-elevation-level2-surface → --surface-container-low: light oklch(0.96), dark oklch(0.185); --popover is only the stamp-less fallback — the discriminator is the dark fill 0.185, not --popover's 0.3211), and the elevation shadow recipes re-declare under .dark as WHITE (hsl(0 0% 100% / .16)). STAYS FROZEN (stylex :root aliases): the trigger chrome (--jx-background/--jx-border/--jx-foreground, hover --jx-muted) — the trigger keeps the page profile while its panel re-themes. light and system stamp nothing — tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'level2' · Own default, not ambient`,
      description:
        "CONSUMED via the §7 pair — the panel's floating surface. The slot's OWN is level2 (3dp, M3's menu rung — the panel's historic z-feel; the census batch C mapping); an explicit level steps the theme's table (level4 = 8dp + surface-container-high) and the number lane snaps DOWN between rungs. The stamp is UNCONDITIONAL — the own default always lands, so the panel fill resolves the ladder (--jx-elevation-level2-surface → --surface-container-low; --popover is only the stamp-less fallback) and the shadow rides the level's recipe. The root stamps the composed --jx-elevation-surface/--jx-elevation-shadow pair onto the panel. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it (grep receipt: zero readers). The panel's real motion is the shared surface-motion kernel (one WAAPI --jx-p number, css formulas) and the caret/item transitions are 150ms/100ms literals with the reduced-motion kill — the axis has no family-local kernel to step. Number unit: coefficient.",
    },
  ];

  // the theme-split receipts (voice by voice, declaring-selector grep)
  const themeSplitTokens = [
    { name: '--jx-elevation-level2-surface', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The panel FILL through the always-on level2 stamp: .jx-surface-body resolves --jx-elevation-level2-surface → --surface-container-low (light oklch(0.96) · dark oklch(0.185)) — --popover is only the stamp-less fallback (dark --popover would be 0.3211).' },
    { name: '--jx-elevation-level2/4-shadow', default: 'FLIPS: black → white recipes', source: 'structural' as const, description: 'The shadow recipes re-declare under .dark as WHITE (hsl(0 0% 100% / .16) — measured rgba(255,255,255,0.16) on the dark island); the light side is the black hsl pair.' },
    { name: '--popover / --border', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The panel bezel SEAM (--border; --popover rides the fill chain only as the stamp-less fallback) — raw reads, re-declared per scope.' },
    { name: '--popover-foreground', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The panel ink (.jx-menu color) — the walk highlight (color-mix over currentColor) follows it.' },
    { name: '--ring', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The item focus ring (the inset 1px law).' },
    { name: '--destructive / --destructive-foreground', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The destructive item\'s hover/walk pair (raw reads in dropdown-menu.css).' },
    { name: '--jx-background / --jx-border / --jx-foreground / --jx-muted', default: 'FROZEN at :root', source: 'structural' as const, description: 'The trigger chrome (the stylex atom: ground, frame, label, hover swap) — keeps the page profile while its panel re-themes.' },
    { name: '--jx-destructive', default: 'FROZEN at :root', source: 'structural' as const, description: 'The destructive item\'s resting label ink (the stylex atom) — only its hover pair flips.' },
    { name: '--jx-press-shadow / -hover / -active', default: 'shadow-xs / -sm / -sm-press', source: 'structural' as const, description: 'The trigger\'s press poses (the lane-2 seams on .jx-menu-trigger).' },
  ];

  // the density consumption lanes (the trigger/item rhythm)
  const densityTokens = [
    { name: '--jx-hit', default: '24 / 28 / 32 / 40 / 48px (2xs → lg)', source: 'density' as const, description: 'Trigger and item min-block-size — the hit lane the named rung re-bases.' },
    { name: '--jx-inset', default: 'rung scale × coefficient', source: 'density' as const, description: 'Item and trigger padding, both axes.' },
    { name: '--jx-gap', default: 'rung scale × coefficient', source: 'density' as const, description: 'Trigger label ↔ caret gap; item internal gap.' },
    { name: '--jx-text / --jx-line', default: '10 / 11 / 12 / 13 / 15px · 14 / 16 / 18 / 20 / 24px (2xs → lg)', source: 'density' as const, description: 'Item type voice (the panel body stays the fixed 13px .jx-menu law).' },
    { name: '--jx-menu-gap / --jx-menu-pad', default: '8px / 4px', source: 'structural' as const, description: 'The panel\'s anchor offset and scroll-ring padding — the family\'s own seams.' },
  ];

</script>

<svelte:head>
  <title>Dropdown menu · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai dropdown menu: the ARIA menu pattern on the popover laws — native popover=auto light dismiss plus the keyboard contract the platform does not ship: item-1 focus on open, wrapping arrows, typeahead, selection restores focus to the trigger."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: the page sections ship as PAGE DATA (+page.ts); the
       scaffold chrome owns the rail -->

  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ARIA"
      title="dropdown menu — the menu the browser never shipped"
      summary="The popover laws carry the surface: popover=auto light dismiss, Escape, top layer, CSS Anchor Positioning. The component adds the menu keyboard contract the platform lacks — opening focuses item 1, arrows/Home/End walk with wrapping, 500ms typeahead jumps by label, and selection closes with focus restored to the trigger."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">role=menu · menuitem</span>
        <span class="pill">typeahead</span>
        <span class="pill">focus restore on Esc/select</span>
        <span class="pill">separators are plain &lt;hr&gt;</span>
      </div>
    </SectionCard>
  </div>

  <div id="install" data-reveal="">
    <DocsInstall name="dropdown-menu" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="Native surface, component contract: the platform owns the panel behavior, the component owns the menu keyboard walk — and the family is a primitive other menus compose."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          The platform owns the surface behavior: <code>popover="auto"</code> gives light dismiss,
          Escape and the top layer; CSS Anchor Positioning places the panel (zero JS geometry,
          flip fallbacks); the panel paints nothing itself — the floating-surface vocabulary
          (bezel fill, seam, scroll ring) carries it, and the slide rides the shared
          surface-motion kernel (one WAAPI <code>--jx-p</code> number).
        </p>
        <p class={cx(rt.measurePara)}>
          The component owns the menu contract: opening focuses the FIRST item, ↑/↓ walk and wrap,
          Home/End jump the ends, a 500ms typeahead jumps by label, and selection closes with focus
          restored to the trigger. Items are whatever the consumer nests — any
          <code>[role=menuitem]</code> joins the walk through DOM delegation scoped to the nearest
          menu (a nested submenu family never leaks), separators are plain <code>&lt;hr&gt;</code>,
          and the walk's highlight is a paint-only <code>data-walk-active</code> that never touches
          a consumer's <code>aria-current</code>.
        </p>
        <p class={cx(rt.measurePara)}>
          The family is a primitive other menus compose — three real composers (import-grep
          receipt): the breadcrumb dropdown (breadcrumb-dropdown.svelte), button-group's overflow
          menu (button-group.svelte) and the component-canvas playground's axis menus
          (canvas-playground.svelte) all mount it. Two siblings deliberately DO NOT: menubar and
          navigation-menu duplicate the menu contract by hand — their headers say so
          ("duplicated deliberately: registry items stay independent, no hidden coupling",
          menubar.svelte; navigation-menu declares itself "an independent thin" navigation
          contract where "actions belong to dropdown-menu") — registry items stay independent.
          The eight axes resolve on both ends — density rides an
          inherit-then-provide provider (the anchor and the panel carry the rung; items resolve
          through the same contract), radius makes the menu the concentric anchor or consumes the
          broadcast protocol (吃也供, supply-and-consume), and the panel's elevation is the
          family's own level2. The axis grammar lives
          on the <a class="pill" href="/docs/universal-props.html">universal props</a> page.
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Compose a trigger with menu items; separators remain native hr elements."><CodeBlock code={usage} lang="svelte" meta="DropdownMenu usage" /></SectionCard></div>

  <div id="dropdown-menu-demo" data-region="dropdown-menu-demo" data-family="dropdown-menu-demo" data-reveal="">
    <ComponentCanvas
      title="dropdown menu"
      description="Open it, then walk with arrows or type a letter ('d' jumps to Duplicate). Selecting runs the action, closes the menu, and hands focus back to the trigger."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/dropdown-menu.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetCanvas}
      output={[{ label: 'last action', value: lastAction || '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class={cx(rt.wrapRow16)}>
        <DropdownMenu id="canvas-actions" triggerLabel="Actions">
          <DropdownMenuItem onclick={() => (lastAction = 'rename')}>Rename…</DropdownMenuItem>
          <DropdownMenuItem onclick={() => (lastAction = 'duplicate')}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem onclick={() => (lastAction = 'copy link')}>Copy link</DropdownMenuItem>
          <hr />
          <DropdownMenuItem destructive onclick={() => (lastAction = 'delete')}>Delete</DropdownMenuItem>
        </DropdownMenu>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            keyboard: ↓/↑ walk and wrap, Home/End jump the ends, <code>d</code>
            typeahead-jumps to Duplicate, Enter selects, Escape closes and focus lands back on the
            trigger. Clicking elsewhere light-dismisses — and focus stays where you clicked.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="Props"
      summary="The root table renders from the GENERATED meta + curation; the eight axis rows split into the shared section beneath (the item is a separate component — its two props ride the hand table below)."
    >
      <PropsTable meta={dropdownMenuMeta} docs={DROPDOWN_MENU_DOCS} />
      <div class={cx(rt.mt20)}>
        <PropsTable
          title="DropdownMenuItem"
          props={[
            { name: 'destructive', type: 'boolean', default: 'false', description: 'Destructive paint (the frozen --jx-destructive label; the raw destructive pair on hover/walk) while preserving menuitem semantics.' },
            { name: 'density', type: `DensityLane | QueryResult<DensityLane>`, default: 'ambient scope', description: 'Explicit override resolved through the same family contract; an item\'s own lane beats the provided tier.' },
            { name: '...rest', type: 'HTMLButtonAttributes', default: 'spread', description: 'Forwarded to the item button (onclick, disabled…); Omit<…, \'color\'> — the §1 native-collision rule.' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on dropdown-menu"
      summary="Four axes paint this family and four supply. CONSUMED: density (the trigger/item rhythm lanes through the data-density scope, with the inherit-then-provide provider), shape (the panel's corner-shape), radius (the §3/§14 chain — explicit anchor or the concentric auto calc), elevation (the §7 pair, the family's own level2). SUPPLY-ONLY with negative-grep receipts: size, color, motion. theme splits — the panel flips under .dark while the trigger chrome stays frozen. The carriers stamp the PANEL (the promoted root is self-carried — the portal law), so every stamp below is greppable on the panel element."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch C row (LANDED 09d64fb0 — the M3
          two-layer elevation recipe through the §12 indirection at light and dark, the number
          lane snapping DOWN between rungs, and the PORTAL ROOT self-carried; openspec/changes/
          explicit-props/research/migration-census.md). The elevation OWN — level2, 3dp, M3's menu
          rung — is that row's historic z-feel mapping. The §1 collision rule: the item extends
          HTMLButtonAttributes Omit&lt;'color'&gt;, the root destructures every axis name — the
          native elements never receive them, and everything else rides the rest spreads.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on dropdown-menu" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="dropdown-menu · the consumed lanes" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>radius auto — the concentric calc against the panel's own ancestors</span>
                <DropdownMenu id="axes-r-auto" triggerLabel="radius auto"><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenu>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>radius="medium" — the menu is the CONCENTRIC ANCHOR</span>
                <DropdownMenu id="axes-r-md" triggerLabel="radius medium" radius="medium"><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenu>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>level2 · own — inspect the panel's --jx-elevation-effective: 3</span>
                <DropdownMenu id="axes-e-own" triggerLabel="level2 · own"><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenu>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>elevation="level4" — the table steps (8dp + surface-container-high)</span>
                <DropdownMenu id="axes-e-l4" triggerLabel="level4" elevation="level4"><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenu>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — the panel flips; the trigger chrome stays frozen</span>
                <DropdownMenu id="axes-t-dark" triggerLabel="dark island" theme="dark"><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenu>
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              Open a panel and read the stamps on the panel element itself — the style attr
              carries the carriers, the radius consumption and the elevation pair (the portal
              law). The dark island's bezel and ink follow the island while its trigger keeps the
              page profile (the theme table's split).
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="dropdown-menu · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <DropdownMenu
                id="axes-query"
                triggerLabel="responsive menu"
                density={responsiveDensity}
              >
                <DropdownMenuItem>Rename…</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
              </DropdownMenu>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 40rem the base applies — the large rung, the
                touch-size trigger and items; at 40rem and wider the sm case wins and both
                compact. Resize across 40rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={densityTokens} />
        </div>
        <div class={cx(rt.mt20)}>
          <TokenTable tokens={themeSplitTokens} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The menu follows the ARIA menu keyboard contract while keeping light dismiss native."><A11yTable keys={[{ key: 'Arrow keys', action: 'Move between menu items and wrap at the ends.' }, { key: 'Home / End', action: 'Jump to the first or last enabled item.' }, { key: 'Enter / Space', action: 'Activate the focused item and close the menu.' }, { key: 'Escape', action: 'Close and restore focus to the trigger.' }]} aria={[{ name: 'role', value: 'menu / menuitem', description: 'Exposes the menu and its actionable items.' }, { name: 'data-walk-active', value: '(paint-only)', description: 'The keyboard walk’s highlight — a visual state attribute on the walked item; it never rewrites aria-current (a static aria-current="page" on a raw item is the author’s semantics and stays).' }]} /></SectionCard></div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="dropdown-menu" />
  </div>
</div>

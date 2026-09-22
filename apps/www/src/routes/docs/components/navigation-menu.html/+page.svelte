<!--
  Docs page for the navigation-menu family (docs-eight-axes-mdn task 22,
  MDN archetype). Tier 2 (the image model): no generated props meta exists
  AND the family keeps the hand `universal` table — the archetype work is
  Install + Overview + the measured axes layer + the duplication contract
  + See Also + the cx predicate. The family itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '$lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '$lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '$lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '$lib/ui/navigation-menu/navigation-menu-link.svelte';
  import NavigationMenuIndicator from '$lib/ui/navigation-menu/navigation-menu-indicator.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import navigationMenuSource from '$lib/ui/navigation-menu/navigation-menu.svelte?raw';
  import navigationMenuPanelSource from '$lib/ui/navigation-menu/navigation-menu-panel.svelte?raw';
  import navigationMenuIndicatorSource from '$lib/ui/navigation-menu/navigation-menu-indicator.svelte?raw';

  const close = '</' + 'script>';

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuPanel,
    NavigationMenuLink,
  } from '@ui/navigation-menu/index';
${close}

<NavigationMenu label="site">
  <NavigationMenuItem>
    <NavigationMenuTrigger>Product</NavigationMenuTrigger>
    <NavigationMenuPanel>
      <!-- real links — navigation-menu MOVES you; actions live in dropdown-menu -->
      <NavigationMenuLink href="/x" current>Overview</NavigationMenuLink>
      …any markup — mega grids compose inside the panel…
    </NavigationMenuPanel>
  </NavigationMenuItem>
  <NavigationMenuLink href="/docs">docs</NavigationMenuLink>
</NavigationMenu>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/navigation-menu/navigation-menu.svelte', content: navigationMenuSource },
    { name: 'registry/files/ui/navigation-menu/navigation-menu-panel.svelte', content: navigationMenuPanelSource },
    {
      name: 'src/lib/ui/navigation-menu-usage.svelte',
      content: usage,
      kind: 'usage',
    },
  ];

  // ---- the shapes demo (trigger panel vs bare link) ----------------------
  const navMenuVariantsDemo = `<script lang="ts">
  import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuPanel,
    NavigationMenuLink,
  } from '@ui/navigation-menu/index';
${close}

<div class="grid gap-4 sm:grid-cols-2">
  <div class="border border-border p-4">
    <NavigationMenu label="grouped">
      <NavigationMenuItem>
        <NavigationMenuTrigger>Product</NavigationMenuTrigger>
        <NavigationMenuPanel>
          <NavigationMenuLink href="/docs">Overview</NavigationMenuLink>
        </NavigationMenuPanel>
      </NavigationMenuItem>
    </NavigationMenu>
  </div>
  <div class="border border-border p-4">
    <NavigationMenu label="direct">
      <NavigationMenuLink href="/docs" current>Docs</NavigationMenuLink>
    </NavigationMenu>
  </div>
</div>`;

  const navMenuVariantsFiles: TreeFile[] = [
    { name: 'navigation-menu-variants-demo.svelte', content: navMenuVariantsDemo, kind: 'usage' },
  ];

  // ---- the indicator demos (the two motion laws) -------------------------
  const navMenuIndicatorDemo = `<script lang="ts">
  import {
    NavigationMenu,
    NavigationMenuIndicator,
    NavigationMenuLink,
  } from '@ui/navigation-menu/index';
${close}

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <span class="text-muted-foreground text-[12px]">motion="navigation" — the page-level default</span>
    <NavigationMenu label="indicator-demo-a">
      <NavigationMenuIndicator />
      <NavigationMenuLink href="/docs/components/navigation-menu.html" current={true}>navigation-menu</NavigationMenuLink>
      <NavigationMenuLink href="/docs/components/tabs.html" current={false}>tabs</NavigationMenuLink>
      <NavigationMenuLink href="/docs/components/breadcrumb.html" current={false}>breadcrumb</NavigationMenuLink>
    </NavigationMenu>
  </div>
  <div class="flex flex-col gap-2">
    <span class="text-muted-foreground text-[12px]">motion="waapi" — no View Transitions, no name</span>
    <NavigationMenu label="indicator-demo-b">
      <NavigationMenuIndicator motion="waapi" />
      <NavigationMenuLink href="/docs/components/tabs.html" current={true}>tabs</NavigationMenuLink>
      <NavigationMenuLink href="/docs/components/range.html" current={false}>range</NavigationMenuLink>
    </NavigationMenu>
  </div>
</div>`;

  const navMenuIndicatorFiles: TreeFile[] = [
    { name: 'navigation-menu-indicator-demo.svelte', content: navMenuIndicatorDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law + the cx
  // predicate: the type guard zeroes the standing svelte-check
  // diagnostic — plain strings pass through whole; stylex objects
  // contribute their string members ($$css dropped)).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the axes section: per-axis rows + probe-tagged demos --------------
  // Grep receipts: zero --jx-color-effective / --jx-motion-effective /
  // --jx-size-effective readers in ui/navigation-menu/ AND popover.css;
  // the family's raw reads are the density kernel lanes (var(--jx-hit)
  // and siblings — plain var() strings in navigation-menu.stylex.ts),
  // the panel's raw --popover surface reads (popover.css), and the
  // carrier reads the promotion keeps (corner-shape + border-radius
  // consume --jx-shape-effective / --jx-radius-consumed in popover.css
  // :37-47 — stamped by the nav ROOT, read through the DOM inheritance
  // a top-layer promotion keeps).
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `ambient scope`,
      description:
        "SUPPLY-ONLY for the entries — the §11 stamp sets the nav root's font-size (measured 16 → 14px) but the entries never inherit it: every entry carries its own type voice (--jx-text from the density kernel, uppercase, tracked) which beats inheritance by declaration. The em-relative letterspacing (0.08em) scales with --jx-text, not the stamp. The one reached surface: the bar's own anonymous flow. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED THROUGH THE PANEL — the carrier is read one promotion away: popover.css declares corner-shape: var(--jx-shape-effective, round) on .jx-pop, and the nav root stamps the carrier; the top layer moves the PAINT, never the DOM, so the declaration site's value rides along. The bar itself paints no corners (the entries are flat ink).",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED THROUGH THE PANEL — the family always stamps --jx-radius-consumed on the root (explicit: radius-effective × the §14 factor; auto: the §3 concentric calc minus the inset), and .jx-pop's border-radius reads exactly that var (popover.css :37-47). Measured: the ambient page resolves the calc to the square 0px the sheet declares; radius='large' on the nav and the OPEN panel's computed radius jumps to the large rung. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED through the kernel lanes, scoped by the honest-opinion law — the entries' hit size, gap, inline padding and type are plain var(--jx-hit/--jx-gap/--jx-inset/--jx-text/--jx-line) reads (raw var() strings: substitution at the consuming element), so the values follow the nearest [data-density] scope. No opinion → the nav stamps NOTHING (no attribute — pinned by density-adoption-menus) and rides the ambient css scope (measured idle bar: 40px hit, 13px type, 12px gap/padding, no attribute anywhere); an explicit rung stamps data-density on the root AND carries the opinion to triggers/panels through the bar context, re-scoping the whole bar (measured sm: 32px hit, 12px type, 8px gap/padding, on both root and trigger). Number unit: coefficient — the carrier lands on the root (--jx-density-coefficient: 1.5, measured) but the kernel lanes are computed at their DECLARING scope, so a bare coefficient re-rungs nothing (measured: the entries hold 40px/13px); it moves only consumers that read the carrier at or below the stamp.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers in ui/navigation-menu/ and popover.css). The bar's ink ladder is the theme token law (idle --jx-muted-foreground → current --jx-primary → open/hover --jx-foreground), not the color axis. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED AS A SPLIT — theme='dark' stamps .dark on the nav root and the family's two surfaces answer DIFFERENTLY (the emission-form mixed law, measured): the PANEL flips live — .jx-pop reads the raw --popover/--popover-foreground tokens, which .dark re-declares for its subtree, and the top-layer promotion keeps DOM inheritance so the floating surface re-schemes with it — while the BAR's ink freezes — the atoms read the typed --jx-foreground/--jx-primary/--jx-muted-foreground aliases, declared once at :root by the stylex theme (no .dark re-declaration), so a scoped dark stamp computes them at :root and the entries keep the ambient light values. The indicator's tonal fill sits on the flipped side (--jx-tonal is re-declared per theme scope in the sheet). Cross-reference: the scheme-observer family (native-scroll-area) flips EVERYTHING by resolving the scope in family state; this family flips exactly what the css cascade reaches.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'level2' · Own default, not ambient`,
      description:
        "CONSUMED THROUGH THE PANEL — the family's OWN (level2, 3dp: the menu rung shared with menubar and dropdown-menu) resolves even when the prop is auto, and the §7 pair (shadow recipe + the PAIRED ladder-rung surface) plus the solid-fill bridge stamp on the nav root; .jx-surface-body's fill and ::after shadow read them through the promotion-kept inheritance. Measured: level2 vs elevation='level3' changes the OPEN panel's surface fill. The NAV itself paints nothing — the bar is chrome, never elevated. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it (grep receipt: zero readers). The real motion laws are platform and kernel: the entries' 150ms ease-out color transitions (the theme sheet's own constant — the recorded --jx-motion-fast promotion candidate), the panel's WAAPI surface motion (one @property number, every visible property a CSS formula), and LAW #14's reduced-motion contract — the indicator JUMPS instead of sliding and the kernel's prefers-reduced-motion guard short-circuits to direct writes. Number unit: coefficient.",
    },
  ];

  const axesUsage = `<NavigationMenu label="axes" density="sm">…</NavigationMenu>
<NavigationMenu label="axes" radius="large" elevation="level3">…</NavigationMenu>

<!-- theme: a split, not a switch — the PANEL re-schemes (raw --popover
     reads under the scoped .dark), the BAR ink freezes (typed aliases
     declared once at :root) -->
<NavigationMenu label="dark island" theme="dark">…</NavigationMenu>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/navigation-menu-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: a responsive density rung — the bar rides the
  // ambient scope on small viewports and states its own lg opinion from
  // md up (md = 48rem, the registered VIEWPORT_SCALE — cite the key).
  const responsiveDensity = query({ md: 'lg' as const }, 'sm' as const);

  const queryUsage = `<script lang="ts">
  import NavigationMenu from '@ui/navigation-menu.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the bar rides the ambient scope stamped 'sm'; from md
     up the bar states its own lg opinion (the honest-opinion stamp:
     data-density lands only because the lane resolved one) -->
<NavigationMenu label="responsive bar" density={query({ md: 'lg' }, 'sm')}>
  …entries…
</NavigationMenu>`;

  const queryFiles: TreeFile[] = [
    { name: 'navigation-menu-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

  // the kernel lanes + the floating-surface channels (mixed TokenTable —
  // the density rows are the entries' raw var() reads, the surface rows
  // the panel's channels)
  const axisTokens = [
    { name: '--jx-hit / --jx-gap / --jx-inset', default: 'density scale ([data-density] scopes)', source: 'density' as const, description: 'The entries\' hit size, gap and inline padding — plain var() reads: substitution at the consuming element, so the nearest stamped scope (ambient, or the bar\'s own honest opinion) answers.' },
    { name: '--jx-text / --jx-line', default: 'density scale × the coefficient', source: 'density' as const, description: 'The entries\' type voice — uppercase, tracked at 0.08em (--jx-track-wide, the recorded nearest-step receipt for the former 0.12em); beats the size stamp by declaration.' },
    { name: '--jx-pop-pad / --jx-pop-pad-inline', default: '12px 14px / 14px', source: 'component' as const, description: 'The panel\'s scroll-ring padding channel — the inline max() subtracts the thin scrollbar so content never re-centers when the bar arrives.' },
    { name: '--jx-radius-consumed', default: 'stamped by the nav root, read by .jx-pop', source: 'component' as const, description: 'The §3/§14 radius consumption: explicit × the corner-shape factor, else the concentric calc minus the inset — the panel corners follow the BAR\'s radius lane across the promotion.' },
    { name: '--jx-surface-solid-fill', default: 'the level2 ladder rung (own)', source: 'structural' as const, description: 'The §7 solid-fill bridge on the nav root — the floating-surface fill channel the panel body and shadow layer read through the promotion-kept inheritance.' },
    { name: '--motion-150 / --motion-ease-out', default: 'theme constants', source: 'structural' as const, description: 'The entries\' color-transition recipe (unlayered :where() — the menubar carve-out law); the recorded --jx-motion-fast promotion candidate.' },
  ];

  // the same-source drawer for the indicator (its engine is the family's
  // deepest part — show the exact copy)
  const indicatorFiles: TreeFile[] = [
    { name: 'registry/files/ui/navigation-menu/navigation-menu-indicator.svelte', content: navigationMenuIndicatorSource },
    { name: 'navigation-menu-indicator-demo.svelte', content: navMenuIndicatorDemo, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Navigation menu · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai navigation-menu family: the site-nav bar as an independent thin coordinator — arrow walking, click-open panels on the Popover primitive's laws (declarative popovertarget wire, CSS anchor positioning, surface motion), mega content composed inside the panels, bare links in-bar, and the optional sliding indicator with its two motion laws."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ARIA"
      title="navigation menu — a bar you WALK, with panels that move"
      summary="The site-nav pattern as an independent thin coordinator: ←/→ walk the top-level triggers (one tab stop, on the current section), click opens a panel, Escape closes and hands focus back. Panels ride the Popover primitive's laws — native popover=auto light dismiss, CSS anchor positioning, and the WAAPI surface-motion entry/exit — through a DECLARATIVE popovertarget wire, and open state mirrors the native toggle seam only, so aria-expanded never lies. Panels carry REAL LINKS — navigation moves you; actions belong to dropdown-menu. Duplicated deliberately: the three menu roots stay independent registry items, no hidden coupling."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">roving walk</span>
        <span class="pill">click open</span>
        <span class="pill">panels = links</span>
        <span class="pill">deliberate duplicate</span>
      </div>
    </SectionCard>
  </div>

  <!-- install + overview (docs-eight-axes-mdn task 22; the theming
       section folds into the measured axes layer, the old types section
       into usage, the prose universal-props section into axes) -->
  <div id="install" data-reveal="">
    <DocsInstall name="navigation-menu" />
  </div>

  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="The composition: an Item that owns the one id, a declarative wire, a panel that is a real popover, and a bar that owns state and behavior — never membership order."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          The family composes in four parts. <code>NavigationMenuItem</code> is the pairing
          unit — the Popover primitive's anchor law made a part: a span that owns the ONE
          id (explicit or <code>$props.id()</code>, mount-stable by contract) and carries
          <code>anchor-name</code> for CSS Anchor Positioning. <code>NavigationMenuTrigger</code>
          is a real <code>button aria-haspopup</code> whose open/close rides the DECLARATIVE
          <code>popovertarget</code> wire — the primitive's zero-listener path; the invoker
          association exempts the trigger from light dismiss by construction, no click-order
          race. <code>NavigationMenuPanel</code> is a native <code>popover="auto"</code>
          surface: light dismiss, Escape, one-at-a-time and the top layer are the browser's;
          CSS anchor positioning places it (<code>position-area: bottom span-right</code> —
          the family's own law is LEFT edges aligned under the item, a measured span-right
          semantics — with flip-block/flip-inline try-fallbacks and
          <code>anchors-visible</code> hiding), and the shared WAAPI surface-motion kernel
          animates entry/exit as one @property number. Bare <code>NavigationMenuLink</code>s
          compose directly in the bar — there is no popover to pair.
        </p>
        <p class={cx(rt.measurePara)}>
          Two state machines are the bar's own. The roving walk: ←/→ moves between triggers
          over a SINGLE tab stop (a nav bar is walked, not hunted) — every trigger renders
          tabbable until the bar trims to one after mount, the current section's trigger
          first; while a panel is open, walking swaps panels without a close bounce (the
          menubar glide, through imperative handles resolved from <code>aria-controls</code>).
          The panel registry: first-wins on BOTH keys (the panel id and the sanitized anchor
          name — <code>foo/bar</code> and <code>foo?bar</code> collide on the anchor while
          carrying distinct DOM ids), registered at init (sync, SSR-executed), unregistered
          identity-guarded, so a conditionally removed panel leaves no ghost handle. The walk
          scope never leaks: triggers inside <code>[popover]</code> panels and nested plain
          navs are excluded from THIS bar's walk. Click-open only (Owner ruling
          2026-08-25): the hover path, its intent delay and its pointer corridor are retired.
        </p>
        <p class={cx(rt.measurePara)}>
          The duplication contract, stated plainly: panels carry REAL LINKS — navigation-menu
          moves you through a site; <strong>actions belong to dropdown-menu</strong>. The three
          menu roots (dropdown-menu, menubar, navigation-menu) are DELIBERATE duplicates:
          registry items stay independent, no hidden coupling — each keeps its own parts,
          context keys and sheets, and the only sharing is fleet-LAW level (the
          density-adoption spec pins all the menu roots under one honest-opinion law: a root
          with no density opinion stamps NOTHING and its subtree rides the ambient css
          scope). The current section is <code>aria-current</code> on a trigger
          (<code>true</code>) or a link (<code>page</code>) — the page's own truth, passed
          in; the menu never guesses. Per-axis below; the shared grammar lives on the
          <a class="pill" href="/docs/universal-props.html">universal props</a> page.
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas: the standard opening — live demo + PLAYGROUND -->
  <div id="navmenu-demo" data-region="navmenu-demo" data-family="navmenu-demo" data-reveal="">
    <ComponentCanvas
      title="navigation menu"
      stage="fill"
      description="Tab to the bar (components is the tab stop — it's the current section), walk with arrows, click a trigger to open its panel, Escape closes."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/navigation-menu/navigation-menu.svelte"
      files={canvasFiles}
    >
      <div data-probe="nsm-main">
        <NavigationMenu label="demo site">
          <NavigationMenuItem>
            <NavigationMenuTrigger>registry</NavigationMenuTrigger>
            <NavigationMenuPanel>
              <div class={cx(rt.nmMega)}>
                {#each ['overview', 'items', 'tokens', 'install'] as slug (slug)}
                  <a class="jx-demo-nav-link" href="/docs/components.html">registry: {slug}</a>
                {/each}
              </div>
            </NavigationMenuPanel>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger current>components</NavigationMenuTrigger>
            <NavigationMenuPanel>
              <div class={cx(rt.nmMega)}>
                {#each ['menubar', 'navigation-menu', 'toggle-group', 'tabs'] as slug (slug)}
                  <a class="jx-demo-nav-link" href="/docs/components.html">{slug}</a>
                {/each}
              </div>
            </NavigationMenuPanel>
          </NavigationMenuItem>
          <NavigationMenuLink href="/docs/components.html">docs</NavigationMenuLink>
        </NavigationMenu>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            plain links compose DIRECTLY in the bar with the current-state paint
            (<code class={cx(rt.inkAccent)}>current</code> on either a trigger or a link); the panel's
            entry/exit runs on the popover primitive's motion kernel (the floating-surface
            timeline), and open state mirrors the native toggle seam only. No Viewport part —
            per-panel CSS anchoring on native popover replaces Radix's shared container.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Keep navigation links in panels; actions belong in dropdown-menu. Grouped entries pair an Item + Trigger + Panel; direct destinations are bare links."
    >
      <div class={cx(rt.col16)}>
        <CodeBlock code={usage} lang="svelte" meta="basic composition" />
        <ComponentCanvas title="navigation menu · the two entry shapes" stage="fill" files={navMenuVariantsFiles}>
          <div class={cx(rt.gridSm2)}>
            <div class={cx(rt.panel)}>
              <NavigationMenu label="grouped">
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                  <NavigationMenuPanel>
                    <NavigationMenuLink href="/docs">Overview</NavigationMenuLink>
                  </NavigationMenuPanel>
                </NavigationMenuItem>
              </NavigationMenu>
            </div>
            <div class={cx(rt.panel)}>
              <NavigationMenu label="direct">
                <NavigationMenuLink href="/docs" current>Docs</NavigationMenuLink>
              </NavigationMenu>
            </div>
          </div>
        </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

  <div id="indicator" data-reveal="">
    <SectionCard
      family="indicator"
      headerRegion="indicator"
      eyebrow="demo"
      title="Indicator — the optional sliding active"
      summary="NavigationMenuIndicator is the indicator technology as an OPTIONAL part (render it as a child of the bar; omit it and nothing changes). TWO motion laws: motion=navigation (default) stamps a view-transition-name — page-level View Transitions morph the indicator across documents (the app owns the transition wiring; the name is inert when no transition runs, and same-document moves still animate) — and motion=waapi is the pure Web Animations path for apps that never use View Transitions: no name, no cost. The engine measures the bar's current entry (aria-current, DOM-delegated — a MutationObserver catches route swaps, including late-mounted entries; ResizeObserver and fonts.ready re-fit quietly) and slides the hug-box between entries; first placement, resizes and reduced-motion JUMP. Entries inside an open panel never steal the bar indicator, and a nested plain nav owns its own current truth."
    >
      <ComponentCanvas title="navigation menu · indicator" stage="fill" files={indicatorFiles}>
        <div class={cx(rt.flex, rt.col, rt.gap16)}>
          <div class={cx(rt.col8)}>
            <span class={cx(rt.inkMuted, rt.text12)}>motion="navigation" — the page-level default</span>
            <NavigationMenu label="indicator-demo-a">
              <NavigationMenuIndicator />
              <NavigationMenuLink href="/docs/components/navigation-menu.html" current={true}>navigation-menu</NavigationMenuLink>
              <NavigationMenuLink href="/docs/components/tabs.html" current={false}>tabs</NavigationMenuLink>
              <NavigationMenuLink href="/docs/components/breadcrumb.html" current={false}>breadcrumb</NavigationMenuLink>
            </NavigationMenu>
          </div>
          <div class={cx(rt.col8)}>
            <span class={cx(rt.inkMuted, rt.text12)}>motion="waapi" — no View Transitions, no name</span>
            <NavigationMenu label="indicator-demo-b">
              <NavigationMenuIndicator motion="waapi" />
              <NavigationMenuLink href="/docs/components/tabs.html" current={true}>tabs</NavigationMenuLink>
              <NavigationMenuLink href="/docs/components/range.html" current={false}>range</NavigationMenuLink>
            </NavigationMenu>
          </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The bar exposes one roving tab stop and keeps every destination a real link; the indicator is decoration (aria-hidden, no tab stop — the part adds nothing focusable)."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Reaches the bar as ONE tab stop (the roving tabindex — the current section\'s trigger first, else the first entry)' },
          { key: '← →', action: 'Move between top-level triggers and wrap; an open panel glides to the next trigger\'s panel without a close bounce' },
          { key: 'Enter / Space', action: 'Open the focused trigger panel (a real button; the declarative popovertarget wire carries click too)' },
          { key: 'Escape', action: 'Close the panel and restore focus to its trigger — the explicit preventDefault-then-hide keeps focus returning over a closed panel, never a still-open one' },
        ]}
        aria={[
          { name: 'aria-current', value: 'true (trigger) / page (link)', description: 'Marks the current section — the page\'s own truth, passed in; the menu never guesses' },
          { name: 'aria-expanded', value: 'boolean', description: 'Mirrors ONLY the panel\'s native toggle seam (:popover-open read live at fire time) — it cannot lie' },
          { name: 'aria-controls', value: 'panel id', description: 'Derived from the Item\'s one id; also the glide\'s trigger→panel resolution' },
          { name: 'aria-label', value: 'label prop', description: 'The nav landmark\'s accessible name (default "site")' },
          { name: 'aria-haspopup', value: '"true"', description: 'Every trigger; also the walk-scope selector — panel content and nested navs never leak into the bar\'s walk' },
          { name: 'indicator', value: 'aria-hidden; not focusable', description: 'The sliding part is a bare decorated span: aria-hidden, no tabindex attribute, therefore no tab stop and no semantics — the plain-span truth both reviewers measured' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes"
      summary="Resolved on the nav root through NavigationMenuDefaults (the single audited contract: the eight universal slots + variant + inset). The universal density slot carries NO own (the honest-opinion law); the family owns elevation level2 — the menu rung. Two axes are consumed one promotion away: the PANEL reads the radius/shape carriers through the DOM inheritance a top-layer promotion keeps."
    >
      <div class={cx(rt.col16)}>
        <PropsTable props={axisRows} title="" />
        <div class={cx(rt.mt20)}>
          <TokenTable tokens={axisTokens} />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="navigation-menu · the measured axes" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)} data-probe="nsm-ambient">
                <span class={cx(rt.eyebrowPrimary)}>ambient (all auto)</span>
                <NavigationMenu label="ambient bar">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>section</NavigationMenuTrigger>
                    <NavigationMenuPanel><a class="jx-demo-nav-link" href="/docs/components.html">entry</a></NavigationMenuPanel>
                  </NavigationMenuItem>
                  <NavigationMenuLink href="/docs/components.html" current>current</NavigationMenuLink>
                </NavigationMenu>
              </div>
              <div class={cx(rt.panel)} data-probe="nsm-sm">
                <span class={cx(rt.eyebrowPrimary)}>density="sm" — the opinionated stamp</span>
                <NavigationMenu label="sm bar" density="sm">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>section</NavigationMenuTrigger>
                    <NavigationMenuPanel><a class="jx-demo-nav-link" href="/docs/components.html">entry</a></NavigationMenuPanel>
                  </NavigationMenuItem>
                  <NavigationMenuLink href="/docs/components.html" current>current</NavigationMenuLink>
                </NavigationMenu>
              </div>
              <div class={cx(rt.panel)} data-probe="nsm-size">
                <span class={cx(rt.eyebrowPrimary)}>size={14} — the root stamp vs the entries' own type</span>
                <NavigationMenu label="size bar" size={14}>
                  <NavigationMenuLink href="/docs/components.html" current>current</NavigationMenuLink>
                </NavigationMenu>
              </div>
              <div class={cx(rt.panel)} data-probe="nsm-coef">
                <span class={cx(rt.eyebrowPrimary)}>density={'{1.5}'} — the coefficient carrier</span>
                <NavigationMenu label="coefficient bar" density={1.5}>
                  <NavigationMenuLink href="/docs/components.html" current>current</NavigationMenuLink>
                </NavigationMenu>
              </div>
              <div class={cx(rt.panel)} data-probe="nsm-dark">
                <span class={cx(rt.eyebrowPrimary)}>theme="dark" — the split (open the panel)</span>
                <NavigationMenu label="dark bar" theme="dark">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>section</NavigationMenuTrigger>
                    <NavigationMenuPanel><a class="jx-demo-nav-link" href="/docs/components.html">entry</a></NavigationMenuPanel>
                  </NavigationMenuItem>
                  <NavigationMenuLink href="/docs/components.html" current>current</NavigationMenuLink>
                </NavigationMenu>
              </div>
              <div class={cx(rt.panel)} data-probe="nsm-radius">
                <span class={cx(rt.eyebrowPrimary)}>radius="large" — read one promotion away</span>
                <NavigationMenu label="radius bar" radius="large">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>section</NavigationMenuTrigger>
                    <NavigationMenuPanel><a class="jx-demo-nav-link" href="/docs/components.html">entry</a></NavigationMenuPanel>
                  </NavigationMenuItem>
                </NavigationMenu>
              </div>
              <div class={cx(rt.panel)} data-probe="nsm-elev">
                <span class={cx(rt.eyebrowPrimary)}>elevation="level3" — the panel surface</span>
                <NavigationMenu label="elevation bar" elevation="level3">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>section</NavigationMenuTrigger>
                    <NavigationMenuPanel><a class="jx-demo-nav-link" href="/docs/components.html">entry</a></NavigationMenuPanel>
                  </NavigationMenuItem>
                </NavigationMenu>
              </div>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
          <ComponentCanvas title="navigation-menu · query()" files={queryFiles}>
            <div data-probe="nsm-query">
              <NavigationMenu label="responsive bar" density={responsiveDensity}>
                <NavigationMenuLink href="/docs/components.html" current>current</NavigationMenuLink>
              </NavigationMenu>
            </div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Five parts + the Defaults contract (NavigationMenuDefaults: the eight universal slots, variant's literal slot with own 'auto', the indicator's open-domain inset slot with own 0, elevation's own level2). The panel declares NO rest spread — its popover/id/toggle wiring is load-bearing family law, the sweep's declared exception."
    >
      <PropsTable
        universal
        title="NavigationMenu"
        props={[
          { name: 'label', type: 'string', default: "'site'", description: 'The nav landmark\'s accessible name.' },
          { name: 'density', type: 'DensityLane | QueryResult', default: 'ambient scope', description: 'The honest-opinion lane: no opinion stamps NOTHING (the subtree rides the ambient css scope); an explicit rung stamps data-density on the root and carries the opinion to triggers/panels through the bar context. No legacy size aliases (spec-pinned).' },
          { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'The floating-surface paint for every panel in the bar (the .jx-surface variants: solid, the 72%-alpha blur acrylic, auto = acrylic unless reduced transparency). Literal slot — own \'auto\', ambient when an axis opens.' },
          { name: 'inset', type: 'number', default: '0', description: 'NavigationMenuIndicator hug inset per edge (px). Open-domain literal slot — own 0; breathing inside the entry is a declared decision, never a guessed constant.' },
          { name: 'size', type: 'SizeLane | QueryResult', default: 'ambient scope', description: 'Universal §1 — root font-size stamp; the entries\' own type voice wins (measured).' },
          { name: 'shape', type: 'ShapeLane | QueryResult', default: "'auto'", description: 'Universal §2 — consumed by the PANEL (corner-shape through the promotion-kept inheritance).' },
          { name: 'radius', type: 'RadiusLane | QueryResult', default: "'auto'", description: 'Universal §3 — the root always stamps --jx-radius-consumed; .jx-pop reads it (measured on the open panel).' },
          { name: 'color', type: 'ColorLane | QueryResult', default: "'auto'", description: 'Universal §5 — supply-only; the ink ladder is the theme token law.' },
          { name: 'theme', type: 'ThemeLane | QueryResult', default: "'auto'", description: 'Universal §6 — the split: panel flips (raw --popover reads), bar ink freezes (typed aliases at :root), indicator fill flips (--jx-tonal re-declared per scope).' },
          { name: 'elevation', type: 'ElevationLane | QueryResult', default: "'level2' · Own default, not ambient", description: 'Universal §7 — the menu rung; the §7 pair + solid-fill bridge feed the panel surface. The bar itself never elevates.' },
          { name: 'motion', type: 'MotionLane | QueryResult', default: "'auto'", description: 'Universal §8 — supply-only; the real motion laws are platform (reduced-motion) and kernel (WAAPI).' },
          { name: 'class / style', type: 'string', default: "''", description: 'Root passthrough — the §11 carriers, the radius/elevation consumption and the caller\'s style compose on the nav root.' },
          { name: 'children', type: 'Snippet', default: '—', required: true, description: 'The bar\'s entries: Item-wrapped trigger+panel pairings and bare links, in any order — the bar owns state and behavior, never membership order.' },
        ]}
      />
      <div class={cx(rt.mt20)}>
        <PropsTable
          title="The parts"
          props={[
            { name: 'NavigationMenuItem', type: 'id?: string', default: '$props.id()', description: 'The pairing unit — owns the ONE id (mount-stable; changing it is dev-warned caller error) and the anchor-name span. Trigger/Panel derive `${id}-trigger` / `${id}-panel`.' },
            { name: 'NavigationMenuTrigger', type: 'current?: boolean', default: 'false', description: 'Real button aria-haspopup; the declarative popovertarget wire; aria-current="true" + the brand color when current; the roving tabindex follows the bar\'s tab stop.' },
            { name: 'NavigationMenuPanel', type: 'children', default: '—', description: 'popover="auto" + CSS anchor positioning + WAAPI surface motion; registers {show, hide} at init under the derived panel id (first-wins); NO rest spread — the popover wiring is load-bearing.' },
            { name: 'NavigationMenuLink', type: 'current?, href, child?', default: 'false', description: 'The bare in-bar link (no Item wrapper); aria-current="page" + brand color when current; child({props}) replaces the element kind — keep {...props} for the link semantics and the data-jx-navmenu-link marker.' },
            { name: 'NavigationMenuIndicator', type: 'motion?, name?, duration?, easing?, inset?', default: "'navigation' · 'jx-nav-indicator' · 240ms", description: 'The optional sliding active: hug-box measured geometry, MutationObserver + ResizeObserver + fonts.ready re-fit, B-1/B-3 interrupt laws; inset resolves through the family Defaults (own 0).' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="navigation-menu" />
  </div>
</div>
</div>

<style>
  .jx-demo-nav-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    text-decoration: none;
    transition: color 150ms ease-out;
  }
  .jx-demo-nav-link:hover {
    color: var(--primary);
  }
  .jx-demo-nav-link:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
</style>

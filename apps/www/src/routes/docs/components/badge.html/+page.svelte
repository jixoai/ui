<!--
  badge — docs page (docs-eight-axes-mdn, tier-2 refactor, 2026-09-22).
  MDN archetype order: H1 → Overview → Live example → Props →
  The eight axes on THIS component → Accessibility → See also.
  The W3-era types/theming/universal card split is replaced by the
  per-axis table + grouped runnable examples + one real query() case.
  Same-source law: every drawer composes from resolveRawCode — the
  shown source IS the running stage (the hand-authored mirror files
  are gone).
-->
<script lang="ts">
  import Badge from '$lib/ui/badge/badge.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Icon from '$lib/ui/icon';
  import { usageFile } from '$lib/canvas-usage';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { meta as badgeMeta } from '$lib/meta/badge.meta';
  import { BADGE_DOCS } from '$lib/ui/props-table/docs/badge.docs';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import badgeSource from '$lib/ui/badge/badge.svelte?raw';

  // The canvas same-source lane: each canvas's usage TreeFile composes
  // from THIS PAGE's own stage markup via resolveRawCode (one source,
  // two surfaces — the hand literal + `const close` dodge stay gone).
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/badge.html/+page';

  const usage = usageFile({ Badge: '@ui/badge', Icon: '@ui/icon' }, resolveRawCode('usage'));
  const usageFiles: TreeFile[] = [
    { name: 'registry/files/ui/badge/badge.svelte', content: badgeSource },
    { name: 'src/lib/ui/badge-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the axes canvas: the query() case pulls the runtime engine — the
  // composed usage file carries the query + DensityLane imports so the
  // drawer stays copy-paste-runnable
  const axesUsage = usageFile(
    {
      Badge: '@ui/badge',
      '{ query }': '@lib/universal-props-query.svelte',
      'type { DensityLane }': '@lib/defaults.svelte',
    },
    resolveRawCode('axes'),
  );
  const axesFiles: TreeFile[] = [
    { name: 'registry/files/ui/badge/badge.svelte', content: badgeSource },
    { name: 'src/lib/ui/badge-axes-usage.svelte', content: axesUsage, kind: 'usage' },
  ];

  // ── the per-axis table (§2.5): what each axis drives on THIS family.
  // Mechanism names are the family's real carriers (badge.svelte stamps
  // through stampCarriersForLanes; the atoms live in badge.stylex.ts /
  // badge.css); named steps/units mirror universal-props.schema.ts;
  // every number below is live-measured on this page (:5244 probe).
  const axisRows: PropEntry[] = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "Stamps --jx-size-effective AND an inline font-size: var(--jx-size-effective, 1rem) on the chip — the inline stamp out-ranks the family's class voice (fontSize: var(--jx-text-secondary)), so the micro-label re-types verbatim: a number in px, a named step through var(--jx-size-*) — 14 / 16 / 18px (measured). The kbd-law box does NOT follow: height and line ride --jx-line-secondary, density's channel, and stay fixed (a 12px → 24px label inside the same 20px box; measured). One axis, two winners — the label is size's, the box is density's.",
    },
    {
      name: 'shape',
      type: `'square' | 'pill' — the family prop`,
      default: `'square'`,
      description:
        "Deliberately ABSENT as an axis: the family-local shape prop ('square' | 'pill', the corner-law silhouette) owns the name and pill is outside ShapeLane — §13 rules no mapping, so the lane is left out (forwarding ambient) rather than renamed (explicit-props migration-census.md, batch B LANDED row; flagged for the W6 Owner dossier). The corner law paints through the shape prop's row above — a documented absence, not a silent gap.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "Stamps --jx-radius-effective (a px number, or a named step through var(--jx-radius-*) — 6 / 8 / 10px, measured). The chip's own corner never reads the carrier: the square corner-law paints var(--jx-radius) — the theme's --radius (0px; 8px where corner-shape is supported; 8px measured here) — and pill paints calc(infinity * 1px). Supply-only: the anchor flows down, and a descendant at radius=\"auto\" computes the concentric max(0px, R − inset) off it.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`,
      default: `'auto'`,
      description:
        "The chip's scale axis. A named rung stamps data-density and re-declares the four kernel channels the atoms read ON the chip — --jx-text-secondary (the label), --jx-line-secondary (the height), --jx-inset, --jx-gap. Measured ladder: label 10 / 11 / 12 / 14px, line 12.5 → 21px (box 14.5 → 23px — line plus the 1px hairlines), insets 8 → 16px, 2xs → lg (small/medium/large alias sm/default/lg). A NUMBER lane stamps only --jx-density-coefficient — the channels declare and substitute at :root/[data-density] scopes, so a chip-level coefficient recomposes nothing (the declaring-element law; measured inert), and a named rung resets the coefficient to 1 (explicit rung = exact rung).",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "Stamps --jx-color-effective (named → var(--jx-color-*); a number = hue degrees through the oklch formula; a raw string passes verbatim). No badge-family css reads the carrier — the chip's paint is inert under the axis (measured same-instant). The real hue seam is the four global slots (--jx-fill / --jx-fill-ink / --jx-tonal / --jx-outline) retargeted by the jx-hue-* classes: inject hue through class, not this prop. Supply-only.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "The one axis that repaints the chip: dark stamps the .dark class bridge, and the four hue slots RE-DECLARE on the .dark scope (jixoai.css's :root, .jx-light, .dark selector list) — tonal and fill re-resolve against the dark profile, brand hue drifted −4° (measured: ground, ink and border all flip). One caveat, measured: the outline rung's ink reads --jx-foreground, a :root stylex token that does NOT re-substitute under a scoped .dark — the ink stays the light black (the W-next semantic-ink gap). system resolves the JS-mutable global; auto inherits the tree.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "Stamps --jx-elevation-effective (level-1…level5 are exact dp; a number snaps down to the enclosing rung). No badge-family css reads the carrier and the chip paints no shadow (measured: box-shadow none) — supply-only.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "Stamps --jx-motion-effective (named steps resolve var(--jx-motion-*); a coefficient verbatim). No badge-family css reads the carrier and the chip runs no transition (measured: transition-duration 0s) — supply-only.",
    },
  ];

  // ToC outline: pairs with the section ids below, in page order.
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Badge · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai badge: an inline status chip in the site grammar — Share Tech Mono uppercase micro-label, 1px hairline border, kbd-law geometry. Prominence is the variant ladder (fill, tonal, outline); hue injects through the four global token slots; seven universal axes resolve on the chip and the eighth is the family's own corner law."
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
      title="badge — the eyebrow's inline cousin"
      summary="A plain <span> with the site's micro-label voice: font-nav uppercase, tracked at 0.14em, a 1px hairline border, kbd-law geometry. Prominence is the variant ladder — fill, tonal (the bare default, brand-tinted), outline — and every status hue injects through the four global token slots, never a variant name. Seven universal axes resolve on the chip; the eighth, shape, is the family's own corner law."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">plain span</span>
        <span class="pill">fill · tonal · outline</span>
        <span class="pill">hue injection</span>
        <span class="pill">7 axes + the corner law</span>
      </div>
    </SectionCard>
  </div>

  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="Inline status metadata — versions, build states, counts — in the site grammar's micro-label voice. A display atom: it marks content, it is never the control."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The chip is a plain <code>&lt;span&gt;</code>: Share Tech Mono uppercase, tracked at
          0.14em, a 1px hairline border, and the kbd-law geometry — height from the secondary
          line, inline insets only, never block padding. It composes anywhere a span does:
          inside headings, table cells, terminal cards.
        </p>
        <p class={cx(rt.para)}>
          The label is the children. Two optional icon lanes — <code>slotStart</code> and
          <code>slotEnd</code> — render a glyph at the secondary text size and halve their
          side's inset so glyph and label stay balanced; an icon-only badge keeps both insets
          symmetric so the glyph centers. Everything else a span carries lands verbatim:
          <code>data-*</code>, <code>title</code>, <code>aria-*</code>.
        </p>
        <p class={cx(rt.para)}>
          Two decisions are the author's. The surface — <code>variant</code>: fill (solid,
          loudest), tonal (the 12% tinted default; a bare badge is the brand tint), or outline
          (structure only). The hue — injection: statuses retarget the four global slots
          (<code>--jx-tonal</code> and friends) through classes like
          <code class="jx-hue-error">jx-hue-error</code>; the variant union never widens for
          hue, and the arbitrary-property class covers anything outside the closed set.
        </p>
        <p class={cx(rt.para)}>
          Seven universal style axes resolve on the same chip — documented per-axis below;
          the shared grammar lives on the
          <a class="pill" href="/docs/universal-props.html">universal props</a> page. The
          eighth axis, shape, is deliberately absent: the family's own
          <code>shape</code> prop (square | pill) owns the name. For an interactive filter
          chip, use <a class="pill" href="/docs/components/chip.html">chip</a> — a badge
          marks content, it is never the control.
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="install" data-reveal="">
    <DocsInstall name="badge" />
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="The variant ladder plus the hue-injection recipes, live: the bare tonal reads as brand metadata, fill as the loudest voice, outline as quiet structure — and each status hue is one class on the same chip. The icon lane composes through slotStart; the drawer shows the exact registry copy this page runs."
    >
      <ComponentCanvas
        id="usage"
        title="badge"
        description="The chip composes anywhere a span does — headings, table cells, terminal cards."
        sourceUrl={registrySourceUrl('badge')}
        install="badge"
        files={usageFiles}
        stage="center"
      >
        <div class={cx(rt.flex, rt.col, rt.itemsStart, rt.gap16)}>
          <div class={cx(rt.wrapRow12)}>
            <Badge>v1.2.0</Badge>
            <Badge variant="fill">new</Badge>
            <Badge variant="outline">beta</Badge>
          </div>
          <div class={cx(rt.wrapRow12)}>
            <Badge class="jx-hue-neutral">draft</Badge>
            <Badge class="jx-hue-error">failed</Badge>
            <Badge shape="pill" class="jx-hue-success">
              {#snippet slotStart()}<Icon name="check" />{/snippet}
              passing
            </Badge>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              badges are stateless display atoms — no playground state to drive. variant,
              shape and the class injection seam are the whole family API; everything else is
              span attributes landing verbatim.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="props"
      title="Props"
      summary="The table renders from the GENERATED meta; the eight universal axis rows split into the shared section beneath the family rows. shape is the family's own corner law, not the §2 axis — the census keeps the name and leaves the axis lane out."
    >
      <PropsTable meta={badgeMeta} docs={BADGE_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on badge"
      summary="Badge resolves seven universal axes through its family Defaults (BadgeDefaults) and stamps the resolved carriers on the chip root; the eighth — shape — is deliberately absent (the census row). What each axis drives HERE differs: density is the chip's scale (four kernel channels re-declare on the rung), theme is the one repainting axis (the hue slots re-declare on the .dark scope), size re-types the label while the kbd-law box stays density's — and three more are supply-only, recorded per axis instead of silently omitted."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />

        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            id="axes"
            title="badge · on the axes"
            description="The consumed lanes, live: density rungs rescale the whole chip (label 10 → 14px, box 14.5 → 23px, measured), an explicit size re-types the label inside the fixed 20px box, the dark island flips the hue slots, and one real query() case steps the rung down at the 40rem viewport (resize the window)."
            files={axesFiles}
            stage="fill"
          >
            <div class={cx(rt.col16, rt.wFull)}>
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)}>
                  <Badge density="2xs">2xs rung — 10px label, 14.5px box (measured)</Badge>
                </div>
                <div class={cx(rt.panel)}>
                  <Badge density="lg">lg rung — 14px label, 23px box (measured)</Badge>
                </div>
                <div class={cx(rt.panel)}>
                  <Badge size={14}>size 14 — the label re-types, the box stays 20px</Badge>
                </div>
                <div class={cx(rt.panel)}>
                  <Badge theme="dark">dark island — the hue slots re-declare</Badge>
                </div>
              </div>
              <div class={cx(rt.panel, rt.wFull)}>
                <Badge density={query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')}>
                  responsive — the lg base below 40rem, the sm rung at 40rem and wider
                </Badge>
              </div>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <p class={cx(rt.para)}>
            The supply-only rows are documented absences, not gaps: the chip's corners read
            the family corner-law (<code>--jx-radius</code>, the theme's radius — or
            <code>calc(infinity * 1px)</code> for pill), its hue seam is the four global
            slots, and it paints no shadow and runs no transition — so radius, color,
            elevation, and motion stamp their carriers for descendants without repainting
            this chip. The fleet classification and the shape-name collision are recorded in
            explicit-props' <code>migration-census.md</code> (batch B LANDED rows).
          </p>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={[
            { name: '--jx-text-secondary', default: '10 / 11 / 12 / 14px (2xs–xs / sm / default / lg)', source: 'density', description: 'The micro-label voice — and the icon lane\'s glyph size (measured rungs).' },
            { name: '--jx-line-secondary', default: '12.5 / 13.5 / 15.95 / 18 / 21px (2xs → lg)', source: 'density', description: 'The kbd-law height source: line-height IS the box (measured rungs).' },
            { name: '--jx-inset', default: '8 / 12 / 16px (2xs–sm / default / lg)', source: 'density', description: 'Inline insets only, never block padding (measured rungs).' },
            { name: '--jx-gap', default: '8 / 12 / 16px (2xs–sm / default / lg)', source: 'density', description: 'The icon gap renders at half (--jx-gap / 2) (measured rungs).' },
            { name: '--jx-fill', default: 'var(--primary)', source: 'color', description: 'Fill ground + same-hue border; re-declares on the .dark scope.' },
            { name: '--jx-fill-ink', default: 'var(--primary-foreground)', source: 'color', description: 'Ink on fill — always injected with --jx-fill.' },
            { name: '--jx-tonal', default: 'var(--primary)', source: 'color', description: 'Tonal ground/border/text hue source — the status injection seam (jx-hue-* intent utilities; arbitrary form outside the closed set).' },
            { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source; re-declares on the .dark scope.' },
            { name: '--jx-foreground', default: 'var(--foreground) at :root', source: 'structural', description: 'The outline rung\'s ink — a stylex token that does NOT re-substitute under a scoped .dark (the W-next semantic-ink gap; measured).' },
            { name: '--jx-radius', default: 'var(--radius) — 0px (8px where corner-shape is supported)', source: 'structural', description: 'The square corner-law; pill paints calc(infinity * 1px).' },
            { name: '--jx-hairline', default: '1px', source: 'structural', description: 'The frame; survives forced colors.' },
            { name: '--track-14', default: '0.14em', source: 'structural', description: 'The micro-label tracking (the promoted step var).' },
          ]} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="A display atom, not a control: nothing to focus, nothing to operate — so the density hit floor that governs the interactive chip does not apply here; density moves the label rhythm only. The status must survive without hue: pair every color injection with wording, and under forced colors every rung degrades to Canvas ground + CanvasText ink with the 1px border intact."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not focusable — an inline display atom, not a control' }]}
        aria={[
          { name: 'span', value: 'inline status', description: 'No role — plain span semantics. Use visible text; do not rely on color alone (hue injection always pairs with wording).' },
          { name: 'aria-label', value: 'consumer supplied', description: 'Add context when the visible label is abbreviated (a bare +1 needs a title or aria-label).' },
          { name: 'data-jx-badge', value: 'variant', description: 'Hook attribute carrying the ladder variant (fill | tonal | outline) for styling and tests.' },
          { name: 'forced colors', value: 'Canvas / CanvasText', description: 'Every rung degrades to Canvas ground, CanvasText ink and border; the 1px frame survives (the atoms\' @media (forced-colors: active) block).' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="badge" />
  </div>
</div>

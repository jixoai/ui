<!--
  Docs page for avatar (docs-eight-axes-mdn round 1, vellum — tier 2).
  Archetype order (skills/mdn-doc-style.md §2): hero, install, overview,
  usage, the live lab (spec-pinned play-state canvas, kept byte-identical
  from the pre-refactor page), the silhouettes corner-law matrix and the
  fallback/tooltip facts (both joined to the canvas same-source lane),
  API from the GENERATED meta + docs curation (the hand table retired),
  the eight axes on THIS component (per-axis table + grouped demos + one
  real query() case), accessibility, see-also.

  Mechanism rows are measurement-first: every axis claim below was probed
  against the SERVED family (box ladder 24/32/40, the number lane through
  the --jx-avatar-md seam, bevel 6/8/10px at the 8px --radius baseline,
  the fallback initials halving, supply-only clone-flips) — radius, shape,
  color, elevation, motion and density are supply-only on this leaf family
  (negative grep receipts in each row); theme lands the .dark bridge and
  paints nothing in the built pipeline (the family's four voices are
  theme-aliased stylex tokens whose emission resolves at :root — the
  semantic-ink re-scope gap, W-next #1 — a documented absence). The §13
  size adoption is the page's headline: the family prop IS the axis.
-->
<script lang="ts">
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Link from '$lib/ui/link/link.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlaySelect, PlayToggle, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { SizeLane } from '$lib/defaults.svelte';
  import { meta as avatarMeta } from '$lib/meta/avatar.meta';
  import { AVATAR_DOCS } from '$lib/ui/props-table/docs/avatar.docs';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import avatarSource from '$lib/ui/avatar/avatar.svelte?raw';

  // The canvas same-source lane: the silhouettes, fallback and axes
  // canvases compose their usage files from THIS PAGE's own stage markup
  // via resolveRawCode (one source, two surfaces). The play-state lab
  // stays a hand file: its stage carries the playground's page state
  // (bind:value on the Input, the {name}/{variant} shorthands — the
  // extractor's documented rejection class, the chip FAQ precedent).
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/avatar.html/+page';

  // ---- live playground state (P1): the page owns the snapshot ----
  type Variant = 'bevel' | 'rounded' | 'squircle';
  const canvasInitial = { name: 'Ada Lovelace', variant: 'bevel' as Variant, tooltip: true };
  let name = $state(canvasInitial.name);
  let variant = $state(canvasInitial.variant);
  let tooltip = $state(canvasInitial.tooltip);
  function resetCanvas(): void {
    name = canvasInitial.name;
    variant = canvasInitial.variant;
    tooltip = canvasInitial.tooltip;
  }

  const close = '</' + 'script>';

  // base sample: the NativeHTML contract (img + fallback), no extras
  const usage = `<script lang="ts">
  import Avatar from '@ui/avatar.svelte';
${close}

<Avatar src="/team/ada.png" name="Ada Lovelace" />
<Avatar name="张伟" />            <!-- initials fallback: 张伟 -->
<Avatar name="Gaubee" size="lg" />`;

  // live usage tracks the playground's name/variant/tooltip; q() keeps
  // free text a legal string literal (quotes, apostrophes, newlines all
  // safe). tooltip stays implicit while on — the default reads cleaner.
  const q = (value: string): string => JSON.stringify(value);
  const canvasUsageLive = $derived(`<script lang="ts">
  import Avatar from '@ui/avatar.svelte';
${close}

<Avatar src="/icon.svg" name=${q(name)} variant=${q(variant)} size="lg" />
<Avatar name=${q(name)} variant=${q(variant)} size="lg"${tooltip ? '' : ' tooltip={false}'} />`);
  const resolveCanvasUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? canvasUsageLive : file.content;

  // the drawer's placeholder is filled at resolve time — the derived is
  // never captured at init (the state_referenced_locally lesson)
  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/avatar.svelte', content: avatarSource },
    { name: 'src/lib/ui/avatar-usage.svelte', content: '', kind: 'usage' },
  ];

  // ---- the silhouettes canvas (the corner-law matrix) --------------------
  const silhouettesUsage = usageFile(
    { Avatar: '@ui/avatar.svelte' },
    resolveRawCode('silhouettes'),
  );
  const silhouettesFiles: TreeFile[] = [
    { name: 'avatar-silhouettes-demo.svelte', content: silhouettesUsage, kind: 'usage' },
  ];

  // ---- the fallback/tooltip canvas ---------------------------------------
  const fallbackUsage = usageFile(
    { Avatar: '@ui/avatar.svelte' },
    resolveRawCode('fallback'),
  );
  const fallbackFiles: TreeFile[] = [
    { name: 'avatar-fallback-demo.svelte', content: fallbackUsage, kind: 'usage' },
  ];

  // ---- the eight-axes canvas (per-axis demos, one query() case) ----------
  const axesUsage = usageFile(
    {
      Avatar: '@ui/avatar.svelte',
      '{ query }': '@lib/universal-props-query.svelte',
      'type { SizeLane }': '@lib/defaults.svelte',
    },
    resolveRawCode('axes'),
  );
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/avatar-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(
        (style): style is string | { readonly [key: string]: string | object } =>
          Boolean(style),
      )
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the per-axis table (docs-eight-axes-mdn §2.5) ----------------------
  // What each universal axis drives on THIS family — the carrier/var
  // names are the family's real ones (avatar.stylex.ts, avatar.css,
  // stampCarriersForLanes); steps and units per universal-props.schema.ts;
  // supply states are measured + grep-receipted, not assumed.

</script>

<svelte:head>
  <title>Avatar · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai avatar: a native <img> — lazy, async-decoded, intrinsic dimensions — with a code-point-wise initials fallback for failed or missing sources. Three silhouettes (bevel, rounded, squircle), halved initials at icon size, and the full name on a tooltip by default. The size prop IS the universal size axis (§13 adoption)."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · NativeHTML"
        title="avatar — an img, honestly"
        summary="The avatar IS an <img>: lazy, async-decoded, intrinsic width/height so layout never shifts. When the source fails or is absent, it swaps to an initials block derived code-point-wise from the name — CJK-safe (张伟 stays 张伟), halved to one code point at icon size so the badge never wraps. Three silhouettes ride one geometry: the bevel radius law (default), a true circle, and the squircle superellipse. Hover any avatar and the full name comes back on a tooltip — on by default, tooltip={false} opts out."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">bevel · rounded · squircle</span>
          <span class="pill">sm halves the initials</span>
          <span class="pill">name tooltip on by default</span>
          <span class="pill">CJK-safe initials</span>
          <span class="pill">size IS the §1 axis</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="avatar" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="An img with a failure posture: the initials fallback, the tooltip that gives the name back, and a size prop that is the universal size axis outright."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            The img element carries loading, decoding, intrinsic sizing, and alt semantics. The one
            thing it lacks is a failure posture — that is the whole component: an onerror swap to an
            initials block derived code-point-wise from <code>name</code>, and nothing else. One
            word → its first two code points (张伟 stays 张伟 — the slicing is code-point-wise);
            several words → the first letters of the first and last; the 24px box keeps only the
            first.
          </p>
          <p class={cx(rt.measurePara)}>
            The silhouette is the family's own <code>variant</code> literal — bevel (the radius
            law), rounded (the circle), squircle (the superellipse) — no collision with the shape
            axis, which is a separate, supply-side lane here. The size prop is the universal size
            axis outright (the §13 adoption): named steps 24 / 32 / 40, the legacy sm/md/lg
            spellings alias onto them, and a number is the box edge in px verbatim. The full name
            rides a tooltip by default — an avatar crops identity to initials, the tooltip gives it
            back; pass <code>alt=""</code> for a decorative avatar beside a visible name. The axis
            grammar lives on the
            <Link href="/docs/universal-props.html" title="the universal props page">universal props page</Link>.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Give it a name; the image is optional — the fallback covers failed or missing sources."
      >
        <CodeBlock code={usage} lang="svelte" meta="Avatar usage" />
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="avatar"
        stage="center"
        description="The left avatar loads a real image; the right one has no source and shows the initials fallback derived live from the playground's name field. Every instance re-corners with the silhouette pick — and at sm the fallback halves to one code point. Hover (or focus) an avatar: the full name rides the default tooltip."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/avatar.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[
          { label: 'name', value: name || '—' },
          { label: 'variant', value: variant },
        ]}
        resolveFileContent={resolveCanvasUsage}
      >
        <div class={cx(rt.avWrapRow20)}>
          <Avatar src="/icon.svg" {name} {variant} size="lg" {tooltip} />
          <Avatar {name} {variant} size="lg" {tooltip} />
          <div class={cx(rt.rowC8)}>
            <Avatar src="/icon.svg" {name} {variant} size="sm" {tooltip} />
            <Avatar {name} {variant} size="sm" {tooltip} />
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <Input label="name" placeholder="Ada Lovelace" bind:value={name} />
            <PlayRow label="variant">
              <PlaySelect
                bind:value={variant}
                options={[
                  { value: 'bevel', label: 'bevel — the radius law' },
                  { value: 'rounded', label: 'rounded — circle' },
                  { value: 'squircle', label: 'squircle — superellipse' },
                ]}
              />
            </PlayRow>
            <PlayRow label="tooltip" hint="full name on hover">
              <PlayToggle bind:value={tooltip} />
            </PlayRow>
            <PlayHelp>
              the initials algorithm: one word → its first two code points (CJK-safe); several words
              → first letters of the first and last; sm keeps only the first. alt defaults to the
              name — pass <code>alt=""</code> for decorative avatars beside a visible name.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="silhouettes" data-reveal="">
    <SectionCard
      family="silhouettes"
      headerRegion="silhouettes"
      eyebrow="corner-shape law"
      title="One geometry, three corners"
      summary="The silhouette is one CSS decision layered on the same box: bevel keeps the jixoai radius law with var(--radius) riding the md baseline and scaled by the same proportion at sm and lg (6 / 8 / 10px — square where corner-shape is unsupported, the §14 factor composing to 0), rounded states corner-shape: round with a 50% radius for a true circle, and squircle states corner-shape: squircle with the same 50% for the superellipse — engines without corner-shape simply round it back to the circle. Nothing degrades ugly."
    >
      <ComponentCanvas id="silhouettes" title="avatar · silhouettes" stage="center" files={silhouettesFiles}>
        <div class={cx(rt.col16)}>
          <div class={cx(rt.wrapRow16)}>
            <Avatar name="张伟" variant="bevel" size="lg" alt="" />
            <Avatar name="JX AoI" variant="bevel" size="md" alt="" />
            <Avatar name="JX AoI" variant="bevel" size="sm" alt="" />
            <code class={cx(rt.inkAccent, rt.text115, rt.lead5)}>corner-shape: bevel + var(--radius) × 0.75 / 1 / 1.25 (6·8·10px)</code>
          </div>
          <div class={cx(rt.wrapRow16)}>
            <Avatar name="张伟" variant="rounded" size="lg" alt="" />
            <Avatar name="JX AoI" variant="rounded" size="md" alt="" />
            <Avatar name="JX AoI" variant="rounded" size="sm" alt="" />
            <code class={cx(rt.inkAccent, rt.text115, rt.lead5)}>corner-shape: round + border-radius: 50%</code>
          </div>
          <div class={cx(rt.wrapRow16)}>
            <Avatar name="张伟" variant="squircle" size="lg" alt="" />
            <Avatar name="JX AoI" variant="squircle" size="md" alt="" />
            <Avatar name="JX AoI" variant="squircle" size="sm" alt="" />
            <code class={cx(rt.inkAccent, rt.text115, rt.lead5)}>corner-shape: squircle + border-radius: 50%</code>
          </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="fallback" data-reveal="">
    <SectionCard
      family="fallback"
      headerRegion="fallback"
      eyebrow="the failure posture"
      title="The initials fallback and the tooltip"
      summary="No source, or a failed one: the img swaps to an initials block — the algorithm is deterministic, code-point-wise, and halves at icon size. The full name rides the default tooltip; alt decides whether the avatar speaks."
    >
      <ComponentCanvas id="fallback" title="avatar · fallback and tooltip" stage="fill" files={fallbackFiles}>
        <div class={cx(rt.gridSm2)}>
          <div class={cx(rt.panel)}>
            <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>the initials algorithm</p>
            <div class={cx(rt.rowC12)}>
              <Avatar name="Ada Lovelace" alt="" />
              <Avatar name="Gaubee" alt="" />
              <Avatar name="张伟" alt="" />
            </div>
            <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>AL · GA · 张伟 — first+last initials, two code points of one word, CJK-safe</p>
          </div>
          <div class={cx(rt.panel)}>
            <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>sm halves the block</p>
            <div class={cx(rt.rowC12)}>
              <Avatar name="Ada Lovelace" size="sm" alt="" />
              <Avatar name="张伟" size="sm" alt="" />
            </div>
            <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>one code point — two full-width glyphs cannot fit 24px, and a badge must never wrap</p>
          </div>
          <div class={cx(rt.panel)}>
            <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>image + tooltip</p>
            <div class={cx(rt.rowC12)}>
              <Avatar src="/icon.svg" name="JX AoI" size="lg" />
              <span class={cx(rt.noteSmall)}>hover or focus — the full name rides the default tooltip</span>
            </div>
          </div>
          <div class={cx(rt.panel)}>
            <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>decorative: alt=&quot;&quot;</p>
            <div class={cx(rt.rowC12)}>
              <Avatar name="JX AoI" alt="" />
              <span class={cx(rt.noteSmall)}>beside a visible name — the fallback block goes aria-hidden, no label</span>
            </div>
          </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="props" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="The table renders from the GENERATED meta; the eight axis props split into the shared Universal props section beneath the family rows (size among them — the §13 adoption means the family prop IS the axis; its story is told in the axes table below)."
    >
      <PropsTable meta={avatarMeta} docs={AVATAR_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on this component"
      summary="What each axis drives HERE — the carrier names are the family's real vars (avatar.stylex.ts, avatar.css, stampCarriersForLanes), steps and units per universal-props.schema.ts, every axis defaulting auto. Size is the headline: the family prop IS the axis (the §13 adoption — the fleet's first). Theme lands the .dark bridge and paints nothing in the built pipeline (a documented absence, the W-next #1 gap). The other six are supply-only: the avatar is a leaf, its css reads none of their carriers, and each row carries the negative-grep receipt."
    >
      <div class={cx(rt.col20, rt.wFull)}>
        <PropsTable props={[
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "CONSUMED — the §13 adoption: this prop IS the axis. Named steps keep the box ladder (small 24 · medium 32 · large 40 — measured), the legacy sm/md/lg spellings alias onto them pre-resolve (AVATAR_SIZE_ALIASES), and a number IS the box edge in px verbatim — the number lane stamps the box var (--jx-avatar-md) the md atom reads, so 48 is a 48px avatar. auto inherits the ambient font-size context (the 32px geometry baseline; a list-item media host may inject its own square through the same seam). The initials voice FOLLOWS the size: at ambient (no explicit lane) the fallback block's fixed control-label step applies (--jx-text-label-lg, 12px — the one true fixed case), but an explicit lane stamps the §11 echo (font-size: var(--jx-size-effective, 1rem)) INLINE on the root, and inline beats the class token — measured 14 / 16 / 18px at small / medium / large, and the box edge verbatim on the number lane (48px initials at size={48}). At 48 the two-letter block overflows its own box (scrollWidth 52 > clientWidth 46 — visibly clipped; 28 clips mildly, 30/26): the sm box's halve-to-one-code-point rule keeps the 24px badge safe, but a large number lane has no such guard — the family-level clip is drift ledger #7 (fixed-paint follow-up; do not scale the block in app code — pass tooltip and a larger box, or halve the name yourself).",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — the rung stamps data-density on the img/fallback root, and nothing reads it: the avatar reads no density channel (the initials voice is the fixed --jx-text-label-lg step AT AMBIENT ONLY — an explicit size lane replaces it through the §11 echo, see the size row; there is no padding, gap or line to re-base — grep receipt: zero channel reads in the family css). The tooltip shell is the body's DOM ANCESTOR, so the rung's scope never re-scopes it either. A coefficient stamps --jx-density-coefficient — no scope block matches the leaf, nothing recomposes. Measured: box and initials unmoved under a stamped lg rung.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective for the concentric chain; the silhouette sheet reads the §14 ALIAS ladder instead (corner-shape: var(--jx-shape-bevel/round/squircle), keyed on the variant), never the carrier (grep receipt: zero --jx-shape-effective reads). The corners are the variant's law (see the silhouettes above), not the axis's. Measured: a stamped carrier leaves the corner.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; the bevel cut composes var(--radius) × the per-shape factor (--jx-radius-factor-bevel: 1 supported / 0 degraded), the site radius token — not the axis carrier (grep receipt: zero --jx-radius-effective reads). Measured: a stamped 24px carrier under the 8px md cut leaves the corner exactly. Documented absence on the avatar itself; the leaf has no nested consumers to broadcast to. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective (named → the §12 var indirection; a number → hue degrees; raw strings pass through, closed at build). The initials ink reads the theme token --jx-muted-foreground directly and nothing in the family css reads the carrier (grep receipt: zero reads). Measured: a stamped cyan carrier leaves the ink. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: 'ambient scope',
      description:
        "LANDS, PAINTS NOTHING — a documented absence. A resolved dark step puts the .dark class bridge on the img/fallback root, and the family's four voices are theme-ALIASED stylex tokens (--jx-border, --jx-card, --jx-muted, --jx-muted-foreground) whose emission resolves at :root — a plain .dark island re-scopes none of them in the built pipeline (the semantic-ink re-scope gap, the drift ledger's W-next #1). Measured: the dark island leaves frame, ground and initials ink at their light values. light and system stamp nothing: they ride tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; the avatar's one edge is the 1px hairline (--jx-hairline) and there is no shadow to step (grep receipt: zero reads, and no shadow property in the family css). Measured: box-shadow unchanged (none) under a stamped level. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; the family declares no transition (the name tooltip's motion belongs to the tooltip family, not the avatar — grep receipt: zero --jx-motion-effective reads and no transition in avatar.css/avatar.stylex.ts). A number is a coefficient: nothing on this leaf steps. Number unit: coefficient.",
    },]} title="" />
        <div class={cx(rt.mt20)}>
          <p class={cx(rt.body13)}>
            Deviations, cited: the six supply-only lanes (density · shape · radius · color ·
            elevation · motion) — the family consumes none of their carriers, per the broadcast
            protocol (吃也供, supply-and-consume; the universal-props concept page owns the term);
            their CARRIERS have no descendant reader in the tree, and the leaf stamps them for
            consumer compositions alone. Size is the exception and reads in TWO places: the §13
            adoption consumes the lane through the family prop (the box vars the atoms read), and
            the §11 echo stamps the root's own font-size inline — the carrier var itself
            (--jx-size-effective) has no descendant css reader. The §13 size
            adoption and the batch-B axis surface are recorded in
            <code class={cx(rt.inkAccent)}>migration-census.md</code>
            (openspec/changes/explicit-props/research, the W3 rows). The theme axis lands its
            bridge and paints nothing — the W-next #1 gap, named per voice in the row above. The
            number-lane initials clip is drift ledger #7 (family-level, the fixed-paint follow-up).
          </p>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            id="axes"
            title="The size axis, live"
            description="The named steps keep the 24/32/40 ladder, the legacy aliases ride the same resolve, the number lane is the box edge in px verbatim (48 and 28), and one real query() case — 40px below the lg viewport rung, 48px at ≥64rem (resize the window). The dark island lands the bridge and paints nothing: every voice stays at its light value — the documented absence."
            stage="fill"
            files={axesFiles}
          >
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)}>
                <div class={cx(rt.rowC12)}>
                  <Avatar name="Ada Lovelace" size="small" alt="" />
                  <Avatar name="Ada Lovelace" size="medium" alt="" />
                  <Avatar name="Ada Lovelace" size="large" alt="" />
                </div>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>named steps · 24 / 32 / 40px (measured)</p>
              </div>
              <div class={cx(rt.panel)}>
                <div class={cx(rt.rowC12)}>
                  <Avatar name="Ada Lovelace" size="sm" alt="" />
                  <Avatar name="Ada Lovelace" size="md" alt="" />
                  <Avatar name="Ada Lovelace" size="lg" alt="" />
                </div>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>legacy aliases · sm/md/lg → small/medium/large, the same boxes</p>
              </div>
              <div class={cx(rt.panel)}>
                <div class={cx(rt.rowC12)}>
                  <Avatar name="Ada Lovelace" size={48} alt="" />
                  <Avatar name="Ada Lovelace" size={28} alt="" />
                </div>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>number lane · the box edge in px verbatim (48 / 28) — the initials follow the edge too (the §11 inline echo beats the fixed label step), and 48 clips its two letters (scrollWidth 52 > clientWidth 46 — drift ledger #7)</p>
              </div>
              <div class={cx(rt.panel)}>
                <Avatar name="Ada Lovelace" size={query<{ lg: number }, number>({ lg: 48 }, 40)} alt="" />
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>query() · 40px below the lg rung, 48px at ≥64rem — resize the window</p>
              </div>
              <div class={cx(rt.panel)}>
                <div class={cx(rt.rowC12)}>
                  <Avatar name="Ada Lovelace" alt="" />
                  <Avatar name="Ada Lovelace" theme="dark" alt="" />
                </div>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>theme dark · the bridge lands, nothing repaints — the documented absence (W-next #1)</p>
              </div>
            </div>
          </ComponentCanvas>
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
      summary="The avatar is content: alt defaults to the name, and the fallback block keeps the same label with role=img. Not interactive — the name tooltip also opens on focus."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not interactive — an image; the name tooltip also opens on focus' }]}
        aria={[
          { name: 'alt', value: 'name (default)', description: 'The avatar is content; pass alt="" for decorative avatars beside a visible name.' },
          { name: 'role', value: 'img', description: 'On the initials fallback block (omitted when decorative).' },
          { name: 'aria-label', value: 'name', description: 'On the fallback block, keeping the label identical to the img path.' },
          { name: 'aria-hidden', value: 'true', description: 'On the fallback block when alt="" marks it decorative.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="avatar" />
  </div>
</div>

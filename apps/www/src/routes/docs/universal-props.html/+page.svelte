<!--
  universal-props — the eight-axis concept page (route FROZEN by
  explicit-props task 4.5). The W3 batch-A minimal slice carried the
  grammar card + the shared table so the registry item's site meta had
  a live route; THIS is the W4 build-out: the three-lane grammar 总纲,
  the per-axis lane table, query() with media vs container keys, the
  carrier law, the §14 degrade tables, and LIVE dogfood examples from
  the migrated fleet (the card concentric anchor, the media-key query
  demo, the docs infra on the axes).

  ZERO new class identities (the tailwindless ratchet): every styled
  surface rides the rt.* stylex route atoms or a family component's
  own law sheet — this page introduces none of its own.
-->
<script lang="ts">
  import { rt } from '$lib/surface/routes.stylex';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import { universalRows } from '$lib/ui/props-table/from-meta';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Card from '$lib/ui/card/card.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { SizeLane } from '$lib/defaults.svelte';
  import { cn } from '$lib/utils';

  // the media-key dogfood: typed at the lane (the object literal alone
  // would infer QueryResult<string> — the generic pins the case values
  // to SizeLane, the type query() itself would infer from context)
  const mediaSize = query<{ sm: SizeLane }>({ sm: 'large' });

  // the section rows straight from the ONE shared source (the frozen
  // UNIVERSAL_AXES artifact — never hand-copied here)
  const rows: PropEntry[] = universalRows();

  // the lane-grammar table (§0): what each of the three lanes means,
  // one row per lane — the axis-specific named steps live in the
  // eight-axis table below (same shared source)
  const laneRows: PropEntry[] = [
    {
      name: 'named',
      type: `'small' | 'medium' | 'large' | …`,
      default: 'per axis',
      description:
        'A theme alias step — resolves through the plugin alias table as var(--jx-<axis>-<alias>), developer-remappable by overriding the var (pure CSS, no resolver runtime). The documented vocabulary per axis lives in the table below.',
    },
    {
      name: 'auto',
      type: `'auto'`,
      default: "'auto'",
      description:
        'RESERVED LITERAL — inherit the resolved ambient context (explicit prop > ambient > the family default). The DEFAULT of every axis; an auto resolution stamps nothing, the context flows. May not be remapped or shadowed.',
    },
    {
      name: '${number}',
      type: 'number',
      default: 'per axis',
      description:
        'RESERVED LITERAL — the exact-value escape. The unit is per axis: px for size/radius, a coefficient for density/motion, dp for elevation, hue degrees for color. shape/theme have no number lane.',
    },
    {
      name: 'query()',
      type: 'QueryResult<T>',
      default: 'base',
      description:
        'The orthogonal wrapper — responsive and container-conditional values on ANY axis, wrapping ANY lane. See the query() section: media keys bare (sm), container keys carry @ (@sm), named containers @sm/card.',
    },
  ];

  // the query() key table (§9): the two scales never collapse
  const queryKeyRows: PropEntry[] = [
    {
      name: 'sm',
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: '—',
      description:
        "MEDIA keys are bare — the viewport vocabulary, xs|sm|md|lg RESERVED for this use. The registered default table: xs 30rem · sm 40rem · md 48rem · lg 64rem (plugin-remappable thresholds).",
    },
    {
      name: '@sm',
      type: "'@3xs' | '@2xs' | '@xs' | '@sm' | '@md' | '@lg' | '@xl'",
      default: '—',
      description:
        'CONTAINER keys carry @ (the Tailwind v4 @container convention) and ride their OWN --container-* scale: @sm = 24rem ≠ viewport sm = 40rem. Resolves against the NEAREST qualifying ancestor container — a component cannot query itself (CSS law).',
    },
    {
      name: '@sm/card',
      type: '`@${scale}/${string}`',
      default: '—',
      description:
        'A NAMED container — size first, then /, then the container name. Contributors of containers stamp container-name + container-type (the §11 supply duty); a missing name never matches and the build warns.',
    },
    {
      name: 'base',
      type: 'T | undefined',
      default: "'auto'",
      description:
        'The unconditional lane rendered at SSR first paint and when no case matches. Semantics: min-width ladder, later keys override at wider matches — blocks emit in REGISTERED-SCALE order (narrow → wide), never raw insertion order.',
    },
  ];

  // the §2/§14 degrade table: what each shape becomes when
  // corner-shape is unsupported (Safari/Firefox today — the degrade
  // path is the MAIN path, a DESIGNED state with receipts)
  const degradeRows: PropEntry[] = [
    { name: 'scoop', type: "'scoop'", default: 'square', description: 'Degrades to square geometry — the radius factor zeroes so the corner actually squares (a non-zero radius under a square corner-shape still rounds).' },
    { name: 'bevel', type: "'bevel'", default: 'square', description: 'Degrades to square geometry (factor 0).' },
    { name: 'notch', type: "'notch'", default: 'square', description: 'Degrades to square geometry (factor 0) — the only safe target (§15.1).' },
    { name: 'squircle', type: "'squircle'", default: 'round', description: 'Degrades to round AND the ×2 law reverses: --jx-radius-factor-squircle steps 2 → 1, the same var, zero branches.' },
    { name: 'round', type: "'round'", default: 'round', description: 'Native border-radius semantics — itself in both worlds, factor 1/1.' },
    { name: 'square', type: "'square'", default: 'square', description: 'Itself; the radius lane is inert by definition (factor 0).' },
  ];

  const queryUsage = `<!-- media keys are BARE; the ladder is narrow → wide, insertion order never matters -->
<Card size={query({ sm: 'large' })}>…</Card>

<!-- container keys carry @; a NAMED container is size/name -->
<PressButton radius={query({ '@sm': 20, '@md/sidebar': 8 })}>…</PressButton>

<!-- any lane wraps: named steps, numbers, and a base -->
<Card radius={query({ sm: 'large' }, 'small')}>…</Card>`;
</script>

<svelte:head>
  <title>universal props — jixoai</title>
  <meta
    name="description"
    content="The jixoai universal props grammar: one law, eight axes — size, shape, radius, density, color, theme, elevation, motion. Every axis takes a named step, auto, an exact number, or query() for responsive and container-conditional values; values resolve to CSS expressions stamped as custom properties, never new classes."
  />
</svelte:head>

<div class={cn(rt.shell)}>
  <div id="grammar" data-reveal="">
    <SectionCard
      family="grammar"
      headerRegion="grammar"
      eyebrow="grammar"
      title="The grammar — one law, eight axes"
      summary="Every component accepts the same eight style axes. Each axis takes a NAMED step (theme aliases, developer-remappable), the reserved literal auto (inherit the ambient context — the default, stamps nothing), an exact NUMBER (the unit is per-axis: px · coefficient · dp · hue), or query() wrapping any lane for responsive and container-conditional values. Values resolve to CSS expressions stamped as custom properties on the component root — never new classes."
    >
      <div class={cn(rt.col20)}>
        <p class={cn(rt.code12)}>size · shape · radius · density · color · theme · elevation · motion</p>
      </div>
    </SectionCard>
  </div>

  <div id="lanes" data-reveal="">
    <SectionCard
      family="lanes"
      headerRegion="lanes"
      eyebrow="lanes"
      title="The three lanes + the wrapper"
      summary={'named | auto | ${number} on every axis, plus the orthogonal query() wrapper — the reserved literals (auto, numbers) can never be remapped or shadowed.'}
    >
      <div class={cn(rt.col20)}>
        <PropsTable props={laneRows} title="" />
      </div>
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes"
      summary="The frozen lane table (the docs vocabulary; the legacy density spellings keep working as aliases)."
    >
      <div class={cn(rt.col20)}>
        <PropsTable props={rows} title="" />
      </div>
    </SectionCard>
  </div>

  <div id="query" data-reveal="">
    <SectionCard
      family="query"
      headerRegion="query"
      eyebrow="query()"
      title="query() — conditional values"
      summary={'query({ [condition]: <lane value> }) wraps ANY lane of ANY axis. Media conditions are bare (sm · md · lg — xs|sm|md|lg are RESERVED for this use); container conditions carry @ (@sm) on their OWN --container-* scale — @sm = 24rem while viewport sm = 40rem, the two never collapse. A NAMED container addresses as @sm/card: size first, then /, then the name (Tailwind v4\'s own order). The ladder is min-width, later keys override at wider matches; the desugarer emits blocks in REGISTERED-SCALE order so authoring order never matters ({lg:\'a\', sm:\'b\'} and {sm:\'b\', lg:\'a\'} compile identically). Containers resolve against the NEAREST qualifying ancestor — a component cannot query itself — and trees that use @ keys need an ancestor with container-type (the broadcast supply duty; the canvas\'s scroll layer is one).'}
    >
      <div class={cn(rt.col20)}>
        <PropsTable props={queryKeyRows} title="" />
        <div class={cn(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="query() usage" />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="resolution" data-reveal="">
    <SectionCard
      family="resolution"
      headerRegion="resolution"
      eyebrow="law"
      title="Resolution, supply & the carrier law — 吃也供"
      summary="An axis resolves explicit prop → ambient context → the family's own default. A component that CONSUMES an axis also SUPPLIES its resolved value downward (the Svelte context carries the INTENT, the CSS custom properties carry the RENDER — two channels of one resolution), so a nested component inherits by default: an inner radius='auto' computes max(0px, R − P) off the ancestor's --jx-radius-effective/--jx-inset-effective (the concentric broadcast; the var() fallbacks are load-bearing). Every resolved value is a CSS EXPRESSION — vars are the degenerate case, calc()/max()/color-mix() the general case — assigned to custom properties on the component root: SSR/zero-JS by construction, zero new class identities, stylex never sees instance values. On native-element wrappers the family consumes size and color — the native input never receives them; everything the family does not own still rides through rest props."
    >
      <div class={cn(rt.col20)}>
        <p class={cn(rt.para)}>
          Every migrated family's docs page carries the live
          <code class={cn(rt.inkAccent)}>Universal props</code> section and demo — the native form
          families (input, native-select, textarea, checkbox, radio, range, color-picker,
          file-input, number-input, cascader, tags-input, input-otp, combobox, input-group,
          date-picker, ghostty-term) carry the surface first, and the component-canvas wires the
          per-axis CONTROLS (enum select · number spinner · query() editor) onto its dock.
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="degrade" data-reveal="">
    <SectionCard
      family="degrade"
      headerRegion="degrade"
      eyebrow="degrade"
      title="The degrade tables — designed states, never silent luck"
      summary="Any new-CSS capability gets a plugin-level @supports verdict, one global treatment, a documented fallback table. corner-shape is the first instance: the verdict stamps VARS, never classes — the ladder ships twice gated by CSS itself, families read the ladder and never the capability. squircle's ×2 law rides the per-shape factor var (--jx-radius-factor-squircle: 2 supported · 1 degraded) so its reversal is automatic; scoop/bevel/notch factor to their degrade target's geometry (square ⇒ factor 0)."
    >
      <div class={cn(rt.col20)}>
        <PropsTable props={degradeRows} title="corner-shape unsupported →" />
        <div class={cn(rt.mt20)}>
          <p class={cn(rt.para)}>
            Existing component-level probes are REGISTERED EXCEPTIONS absorbed through the ladder
            vars (press-effect-runtime, avatar) or filed in the gate's exemption ledger with
            reasons (the squircle percentage boundary) — a degrade is a DESIGNED state with
            receipts.
          </p>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="dogfood" data-reveal="">
    <SectionCard
      family="dogfood"
      headerRegion="dogfood"
      eyebrow="dogfood"
      title="Live — the fleet on the axes"
      summary="The migrated components, live: the card is the §3 concentric ANCHOR (radius 20 + the 14px ruler inset → descendants at auto compute 6px), the media-key query() demo steps the whole card family at the 40rem boundary, and the site's own docs infra (batch D4) rides the axes below."
    >
      <div class={cn(rt.col20)}>
        <div class={cn(rt.gridSm2)}>
          <div class={cn(rt.panel)}>
            <Card title="radius 20 · the concentric anchor" radius={20}>
              <p class={cn(rt.pb8, rt.textVar2)}>children at radius="auto" compute max(0px, 20 − 14) = 6px</p>
              <div class={cn(rt.wrap12)}>
                <PressButton radius="auto">auto radius</PressButton>
                <PressButton radius={4}>explicit 4</PressButton>
              </div>
            </Card>
          </div>
          <div class={cn(rt.panel)}>
            <Card title={'size query({ sm: \'large\' })'} size={mediaSize}>
              <p class={cn(rt.pb8, rt.textVar2)}>below 40rem the base (auto) applies; at ≥40rem the root font-size steps to the large rung — resize the window and watch the WHOLE family follow</p>
              <PressButton variant="fill">parts ride em</PressButton>
            </Card>
          </div>
        </div>
        <div class={cn(rt.mt20)}>
          <Card title="shape squircle · radius 20" shape="squircle" radius={20}>
            <p class={cn(rt.pb8, rt.textVar2)}>the §14 factor doubles the resolved corner — and reverses to ×1 on degrade, the same var</p>
            <PressButton shape="squircle" radius={10}>squircle child</PressButton>
          </Card>
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- W3-D4 (batch D4 — the siteOnly families join): the docs-site's
       own infrastructure demos the axes live — token-table at an
       explicit NUMBER lane, density-demo DOGFOODING the density axis
       (an explicit lane on the demo's own root; the scope boxes keep
       their per-rung stamps — explicit scope > ambient root), and
       this very table at a NAMED step through the alias-ladder var -->
  <div id="site-adoption" data-reveal="">
    <SectionCard
      family="site-adoption"
      headerRegion="site-adoption"
      eyebrow="site"
      title="The site itself — docs infra on the axes"
      summary="The docs infrastructure families (token-table, props-table, a11y-table, density-demo, docs-pager, docs-sections-nav, search-palette) joined the same surface with batch D4 — their universality is site-side only (no registry item), demonstrated here."
    >
      <div class={cn(rt.col20)}>
        <TokenTable
          size={18}
          tokens={[
            { name: '--jx-size-effective', default: '18px (this table)', source: 'component' },
            { name: '--jx-density-coefficient', default: '1 (named rung)', source: 'density' },
          ]}
        />
        <div class={cn(rt.mt20)}><DensityDemo scopes={['xs', 'sm', 'default', 'lg']} density="large"><strong>density-demo</strong> dogfoods the axis — the demo's own chrome at the explicit lane</DensityDemo></div>
        <div class={cn(rt.mt20)}>
          <PropsTable
            size="medium"
            title=""
            props={[
              { name: 'size', type: 'SizeLane | QueryResult<SizeLane>', default: 'auto', description: 'This table renders at the named medium step — var(--jx-size-medium) through the alias ladder, zero inline px.' },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  </div>
</div>

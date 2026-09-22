<!--
  Docs page for hero-section (docs-eight-axes-mdn task 13, quill
  2026-09-22; tier 2 over the composition-first-era page: the full-hero
  canvas, the wide-form pan lane and the slots list survive, the
  skeleton re-orders to the archetype and gains Install + Overview +
  the per-axis table + the generated props table + one real query()
  case; types/theming fold into the axes section). Order: hero →
  install → overview → usage → the hero demo → the wide form → slots →
  props → the eight axes → accessibility → see-also. Baseline skill:
  openspec/changes/docs-eight-axes-mdn/skills/mdn-doc-style.md §2.
  One-h1 law: the page owns exactly one h1 (this hero card); the DEMO
  heroes mint h1s through the family's data-jx-hero-title hook — the
  docs lint's component-owned-title exemption, so no demo needs the
  headings-ok scope (the heading page's law does not transfer: the
  hero's headings are the component under test's own output).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import HeroSection from '$lib/ui/hero-section/hero-section.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import { query } from '$lib/universal-props-query.svelte';
  import type { ThemeLane } from '$lib/defaults.svelte';
  import { meta as heroMeta } from '$lib/meta/hero-section.meta';
  import { HERO_SECTION_DOCS } from '$lib/ui/props-table/docs/hero-section.docs';

  import heroSectionSource from '$lib/ui/hero-section/hero-section.svelte?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'hero-section');
  if (!entry) {
    throw new Error('catalog miss: "hero-section" has no registry meta — fix registry.json');
  }

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import Badge from '@ui/badge.svelte';
  import PressButton from '@ui/press-button.svelte';
  import TerminalCard from '@ui/terminal-card.svelte';
${close}

<HeroSection
  eyebrow="my-app · v1"
  summary="One paragraph of lead context at the 16cm ergonomic measure."
  copyCommand="npx jixoai-ui init --hue 200"
>
  {#snippet title()}Ship terminals anywhere. <em>One hue.</em>{/snippet}
  {#snippet badges()}
    <Badge>OKLCH tokens</Badge>
    <Badge>Svelte 5</Badge>
  {/snippet}
  {#snippet secondary()}
    <PressButton variant="outline" href="/docs.html">Get started</PressButton>
  {/snippet}
  {#snippet terminal()}
    <TerminalCard barTitle="quick-start — zsh"
      command="npx jixoai-ui init --hue 200"
      outputs={['theme installed', 'hue applied']} />
  {/snippet}
</HeroSection>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/hero-section/hero-section.svelte', content: heroSectionSource },
    { name: 'src/lib/ui/hero-section-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the wide-form demo's usage mirror — hand-authored to match the
  // stage markup (same-source migration is the recorded follow-up).
  const heroSectionWideDemo = `<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import Badge from '@ui/badge.svelte';
  import PressButton from '@ui/press-button.svelte';
  import TerminalCard from '@ui/terminal-card.svelte';
${close}

<!-- the row form engages at ≥64rem of the hero's own CONTENT box —
     pan a narrow host sideways to see it (container query, not media) -->
<div class="overflow-x-auto">
  <div class="min-w-[67rem]">
    <HeroSection
      eyebrow="your-app · v0"
      summary="The same composition at full width — the lead keeps its 16cm ergonomic measure."
      copyCommand="npx jixoai-ui init --hue 210"
    >
      {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
      {#snippet badges()}
        <Badge>registry</Badge>
        <Badge>copy CTA</Badge>
        <Badge variant="outline">terminal demo</Badge>
      {/snippet}
      {#snippet secondary()}
        <PressButton variant="outline" href="/docs/components.html">browse components</PressButton>
      {/snippet}
      {#snippet terminal()}
        <TerminalCard
          barTitle="quick-start — zsh"
          command="npx jixoai-ui init --hue 210"
          outputs={['theme installed', 'hue applied · 210']}
        />
      {/snippet}
    </HeroSection>
  </div>
</div>`;
  const wideFiles: TreeFile[] = [
    { name: 'hero-section-wide-demo.svelte', content: heroSectionWideDemo, kind: 'usage' },
  ];

  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- theme: the PARTIAL pole — a dark island flips the ACCENT
     voices (eyebrow --primary-text, title em --primary, both raw var()
     strings); the muted lead/badges freeze on the defineVars alias
     (resolved at the stylex :root scope — the declaring-element law) -->
<HeroSection eyebrow="night-shift · v2" summary="Dark accent, same bones." theme="dark" copyCommand="npx jixoai-ui init">
  {#snippet title()}Same hero. <em>New ink.</em>{/snippet}
</HeroSection>

<!-- density: SUPPLY-ONLY on the hero's own atoms (the cm voices and
     the kernel spacing hold) — the composed children inherit the
     re-based channels. The supply chain is the point. -->
<HeroSection eyebrow="your-app · v0" summary="The sm rung: my atoms hold, my guests breathe tighter." density="sm" copyCommand="npx jixoai-ui init">
  {#snippet title()}Supply-side density.{/snippet}
  {#snippet badges()}
    <Badge>sm rung</Badge>
    <Badge variant="outline">composed child</Badge>
  {/snippet}
</HeroSection>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/hero-section-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive theme on the ink voices. The
  // STRING lane needs BOTH generics (the campaign's typing law — the
  // heading page's query case is the number-lane counterpart).
  const responsiveTheme = query<{ md: ThemeLane }, ThemeLane>({ md: 'dark' }, 'light');

  const queryUsage = `<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { ThemeLane } from '@lib/defaults.svelte';
${close}

<!-- below 48rem the base (light) applies; at 48rem+ the md case
     wins and the accent voices flip -->
<HeroSection
  eyebrow="responsive · v1"
  summary="Light below 48rem; the md case flips the ink voices above it."
  copyCommand="npx jixoai-ui init"
  theme={query<{ md: ThemeLane }, ThemeLane>({ md: 'dark' }, 'light')}
>
  {#snippet title()}Viewport-conditional ink. <em>Same bones.</em>{/snippet}
</HeroSection>`;
  const queryFiles: TreeFile[] = [{ name: 'hero-section-query-demo.svelte', content: queryUsage, kind: 'usage' }];

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

  // ---- the per-axis table (§2.5). Grep receipts: zero effective-carrier
  // readers in ui/hero-section/ (rg '-effective' — zero hits); the only
  // raw theme tokens are --primary (title em), --primary-text (eyebrow)
  // and --muted-foreground (summary/badges alias) — the three .dark
  // voices. The kernel channels the density rung re-bases (--jx-text/
  // --jx-line/--jx-gap/--jx-stack/--jx-media-gutter) are unread: the
  // hero rides the FIXED --text-* micro voices and --space-*/--jx-unit.
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY, MEASURED INERT ON THE PAINT — the §11 stamp sets the section's font-size inline (size={14} moves the section's computed voice to exactly 14px), and NOTHING follows: every hero voice is fixed-scale typography — the title clamp(2.4rem, 6cqi, 4.4rem) is rem-floor/container-fluid/rem-cap, the eyebrow and lead ride the --text-* px steps — none is em-of-parent (the measured contrast to heading's em ladder). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective and --jx-radius-factor-effective; no family css reads them (grep receipt: zero readers, zero corner declarations in ui/hero-section/). The hero draws no boxes. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers, zero border-radius in the family). Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY ON SELF, CONSUMED BY COMPOSITION — the named rung stamps data-density on the section, and the hero's OWN atoms read none of the re-based channels (grep receipt: --jx-text/--jx-line/--jx-gap/--jx-stack/--jx-media-gutter — zero hits; the hero rides the fixed --text-* micro voices and the --space-*/--jx-unit kernel). But the COMPOSED children — Badge parts, the PressButton CTA, the terminal-card — inherit the re-based channels, and the rung scope IS the section (the stamp sits on the root the guests live in — no wrapper paradox). The component's own header names it: the supply chain is the point. Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers). Hue that paints composes from --brand-hue: the eyebrow's --primary-text and the title-em's --primary (both flip per THEME, not per hue lane), and the copied CTA re-tones through the jx-hue-success injection class (pinned by test/hue-injection.spec.ts). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE PARTIAL POLE, SPLIT BY THE DECLARING-SCOPE LAW — measured, and the split runs along the CSS emission form. The two voices written as RAW var() strings flip: the eyebrow's color: var(--primary-text) and the title-em's var(--primary) (hero-section.css) — substitution runs at the consuming element, so the stamped .dark re-substitutes them. The muted voices FREEZE: summary and badges ride tokens['--jx-muted-foreground'], a stylex defineVars member whose alias is declared (and therefore resolved) at the stylex :root theme scope — the section inherits the already-substituted light value, and a scoped .dark cannot re-base it (probe receipt: --muted-foreground flips on the section, --jx-muted-foreground does not). So a dark hero island flips the ACCENT and keeps the page's muted lead ink — a dark hero wants a dark host surface. Geometry, micro-typography and cascade are theme-free regardless (grep receipt: those are the only raw theme tokens in ui/hero-section/). light and system stamp nothing — tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it (grep receipt: zero readers, zero box-shadow in the family). The brand statement is flat. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY ON THE AXIS — the carrier --jx-motion-effective is unread (grep receipt: zero --jx-motion-* reads). The entrance cascade is the family's OWN law, read verbatim from the motion KERNEL: --motion-hero 480ms + --ease-hero cubic-bezier(0.22,1,0.36,1), per-step --jx-hero-delay seams (0/60/120/160/200/260ms) and --jx-hero-rise offsets, fill-mode backwards (plays at first paint, no JS), and the prefers-reduced-motion kill (hero-section.css). Animation, not transition. Number unit: coefficient.",
    },
  ];

  // the family's fixed paint (the fixed-paint TokenTable pattern —
  // no source column: every row is the component's own constant or
  // seam, and the facts live in the Default cells)
  const paintTokens = [
    { name: 'the container tier', default: '@container jx-hero (min-width: 64rem)', description: 'The row form answers the hero\'s OWN content box (the section is the named container): two grid tracks — minmax(0,1fr) beside minmax(10.5cm, 13cm) — end-aligned. Below the tier, or without a terminal snippet, the single column stacks the aside under the lead.' },
    { name: 'the cm measure idiom', default: 'lead 16cm · title 22cm · aside 10.5–13cm', description: 'Centimetres are the ergonomic reading unit (12–20cm single-column at desktop distance); every cap rides min(100%, …) so narrow hosts never overflow.' },
    { name: 'the title clamp', default: 'clamp(2.4rem, 6cqi, 4.4rem)', description: 'rem floor, container-relative fluid (cqi of the hero\'s own box), rem cap — why the size axis\'s font-size stamp finds no em to scale.' },
    { name: '--motion-hero / --ease-hero', default: '480ms · cubic-bezier(0.22, 1, 0.36, 1)', description: 'The entrance cascade\'s kernel presets, read verbatim — the one long rise. The §8 carrier (--jx-motion-effective) is NOT wired here; reduced-motion kills the cascade by media query.' },
    { name: '--jx-hero-delay / --jx-hero-rise', default: '0/60/120/160/200/260ms · 10–14px', description: 'The per-step inline seams: each child\'s delay and rise offset ride its own inline style; the animation atom carries the channel (fill-mode backwards holds the from-state through each delay).' },
    { name: 'the ink voices, by emission form', default: 'raw var() flips · defineVars alias freezes', description: 'Eyebrow (var(--primary-text)) and title-em (var(--primary), the :where rule) are RAW references — substitution at the consuming element, so a .dark island flips them. Summary and badges ride tokens[\'--jx-muted-foreground\'] — a defineVars member resolved at the stylex :root theme scope, inherited already-substituted: frozen under any scoped .dark.' },
    { name: '--jx-shell-w', default: '90rem', description: 'The shell measure (typed token); the viewport padding seams step --space-16/24/32 at 40rem/64rem.' },
  ];

</script>

<svelte:head>
  <title>Hero section · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai hero-section component, composition-first: title and badges arrive as snippets (the em carries the accent paint, Badge parts compose the row), the copy-command CTA stays a default overridable by a copy snippet, and the optional terminal snippet rides the second column at the ≥64rem CONTAINER tier — below it, or without it, the hero stacks and the wide form keeps its whitespace focus. The measure is centimetres (lead 16cm, title 22cm): the ergonomic reading brand."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="hero-section — the Broadside hero, opened"
        summary={entry.summary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">title / badges snippets</span>
          <span class="pill">copy CTA default + override</span>
          <span class="pill">terminal snippet slot</span>
          <span class="pill">staggered reveal</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="hero-section" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="Composition-first: structure and chrome are the component's; content is authored. The hero answers its own box, measures in centimetres, and supplies its lanes to the children it hosts."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            HeroSection renders one section — eyebrow, the <code>h1</code> title, the 16cm lead,
            the badge row, the copy-command CTA and an optional second-column aside — with the
            content authored through snippets: <code>title</code> (any <code>em</code> inside
            carries the accent paint via the <code>:where([data-jx-hero-title]) em</code> rule),
            <code>badges</code> (compose Badge parts), <code>secondary</code>, and
            <code>terminal</code>. The copy CTA is a DEFAULT: hand it
            <code>copyCommand</code> and it renders a press-button that copies its own label;
            provide a <code>copy</code> snippet and the default (and the prop) become unused —
            snippet-conditional, pinned by the interface.
          </p>
          <p class={cx(rt.measurePara)}>
            Two laws make it place-anywhere. The section is a NAMED CONTAINER
            (<code>container: jx-hero</code>), so the row form engages at ≥64rem of the hero's
            own CONTENT — an embedded hero answers its own box, not the viewport. And the
            measures are CENTIMETRES (lead 16cm, title 22cm, aside 10.5–13cm) — the ergonomic
            print-measure idiom, every cap riding <code>min(100%, …)</code>. The entrance is a
            time-based CSS cascade (six steps, 0–260ms, <code>fill-mode: backwards</code> — plays
            at first paint, no JS) with a <code>prefers-reduced-motion</code> kill.
          </p>
          <p class={cx(rt.measurePara)}>
            The eight axes resolve on the section as a FIRST-TIME all-no-own contract (census
            batch D): the hero's cm typography and cascade are its own laws, so six axes
            stamp-and-supply — but the supply is not decorative. Density's re-based channels and
            the other carriers are inherited by the COMPOSED children (Badge parts, the CTA, the
            terminal-card) — the supply chain is the point. Theme is the partial pole with a
            twist the emission form decides: the raw-var accent voices flip under a dark island,
            the defineVars-alias muted lead freezes in place. Per-axis below;
            the shared grammar lives on the
            <a class="pill" href="/docs/universal-props.html">universal props</a> page. A
            composed family: pattern-hero-set mounts it (grep receipt), and the h1 it mints
            carries the <code>data-jx-hero-title</code> hook — the component-owned-title law.
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
        summary="Snippets own content; strings stay payload. The em inside the title snippet carries the accent paint; copyCommand is snippet-conditional."
      >
        <CodeBlock code={usage} lang="svelte" meta="HeroSection usage" />
      </SectionCard>
    </div>

    <div id="demo" data-region="hero-section-demo" data-family="hero-section-demo" data-reveal="">
      <ComponentCanvas
        title="hero-section"
        stage="fill"
        scroll="grow"
        description="A complete composed hero in the stacked (below-tier) form — the docs column cannot offer the 64rem of content the wide tier needs, so this stage shows the terminal card stacked under the lead, rendered in full (the canvas's scroll cap is lifted for this composition demo). The wide form lives below. The title snippet carries its own accent em, the badges snippet composes Badge parts, the default copy CTA flips to its copied surface on press."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/hero-section/hero-section.svelte"
        files={canvasFiles}
      >
        <div class={cx(rt.wFull, rt.frame, rt.bgMuted40)}>
          <HeroSection
            eyebrow="your-app · v0"
            summary="A compact instance with the real composition rules — the copy stays yours, the law stays ours. The CTA copies the init command; the terminal demo composes from the same registry files."
            copyCommand="npx jixoai-ui init --hue 210"
          >
            {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
            {#snippet badges()}
              <Badge>registry</Badge>
              <Badge>copy CTA</Badge>
              <Badge variant="outline">terminal demo</Badge>
            {/snippet}
            {#snippet secondary()}
              <PressButton variant="outline" href="/docs/components.html">
                browse components
              </PressButton>
            {/snippet}
            {#snippet terminal()}
              <TerminalCard
                barTitle="quick-start — zsh"
                command="npx jixoai-ui init --hue 210"
                outputs={['theme installed', 'hue applied · 210']}
              />
            {/snippet}
          </HeroSection>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              press the PRIMARY CTA — the command hits the clipboard and the button flips to its
              <code>copied</code> surface for 1.4s (a press-button underneath, re-toned by the
              jx-hue-success injection). The title's
              <code class={cx(rt.inkAccent)}>em</code> carries the accent paint wherever you put it;
              the badges row is whatever you compose. A <code class={cx(rt.inkAccent)}>copy</code>
              snippet replaces the default CTA wholesale when you need your own.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="wide-form" data-reveal="">
      <SectionCard
        family="wide-form"
        headerRegion="wide-form"
        eyebrow="container tier"
        title="The wide form — 64rem of the hero's own content"
        summary="The row form answers the hero's own box, not the viewport: at ≥64rem of CONTENT the grid takes its second column and the terminal aside bottom-aligns against the lead. This docs column cannot offer that width, so the sample below pans sideways in its own scroll lane — an honest presentation of a container tier the page's column can never reach."
      >
        <div class={cx(rt.col12)}>
          <ComponentCanvas
            title="hero-section · wide form"
            stage="fill"
            scroll="grow"
            files={wideFiles}
          >
            <div
              data-jx-hero-wide-pan=""
              class={cx(rt.oxAuto, rt.frame, rt.bgMuted40)}
            >
              <!-- 67rem floor = the 64rem tier + the section's own px-4
                   insets: the container query reads the section's CONTENT
                   box, so the pan must clear the tier PLUS the section
                   padding for the row form to engage -->
              <div class={cx(rt.hsMinW67)}>
                <HeroSection
                  eyebrow="your-app · v0"
                  summary="The same composition at full width — the lead keeps its 16cm ergonomic measure while the aside column tracks 10.5–13cm beside it."
                  copyCommand="npx jixoai-ui init --hue 210"
                >
                  {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
                  {#snippet badges()}
                    <Badge>registry</Badge>
                    <Badge>copy CTA</Badge>
                    <Badge variant="outline">terminal demo</Badge>
                  {/snippet}
                  {#snippet secondary()}
                    <PressButton variant="outline" href="/docs/components.html">
                      browse components
                    </PressButton>
                  {/snippet}
                  {#snippet terminal()}
                    <TerminalCard
                      barTitle="quick-start — zsh"
                      command="npx jixoai-ui init --hue 210"
                      outputs={['theme installed', 'hue applied · 210']}
                    />
                  {/snippet}
                </HeroSection>
              </div>
            </div>
          </ComponentCanvas>
          <p class={cx(rt.m0, rt.inkMuted, rt.text125, rt.lead5)}>
            pan the lane sideways — its thin scrollbar is the affordance (the site scrollbar law).
            The tier boundary is a CONTAINER query on the hero section itself, so embedding the
            hero in any ≥64rem box takes the row form regardless of the viewport.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="slots" data-reveal="">
      <SectionCard
        family="slots"
        headerRegion="slots"
        eyebrow="composition"
        title="What the snippets own"
        summary="Structure and chrome are the component's; content is authored. Strings survive only where they are payload or plain text — everything that changes WHAT renders is a snippet."
      >
        <div class={cx(rt.col20)}>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>title</code> snippet — the whole h1 content; any
                <code class={cx(rt.inkAccent)}>&lt;em&gt;</code> inside carries the accent paint
                (component css <code>:where()</code> rule — the split-em styling the old
                titleLead/titleAccent props carried)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>badges</code> snippet — compose Badge parts
                (<code class={cx(rt.inkAccent)}>badges: string[]</code> is dead); the row keeps the
                mono uppercase strip layout</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>copyCommand</code> — the payload: the default CTA's
                label AND its clipboard target; pressing it flips the press-button to the
                <code class={cx(rt.inkAccent)}>copied</code> surface for 1.4s</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>copy</code> snippet — replaces the default copy CTA
                (the command string is still yours to use however you render it)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>terminal</code> snippet — usually a terminal-card, and
                OPTIONAL: the hero only owns the column and the bottom alignment
                (<code class={cx(rt.inkAccent)}>@min-[64rem]/jx-hero</code> container-tier grid; without
                the snippet the wide form keeps the right side empty — whitespace is the focus)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>secondary</code> snippet — outline CTAs after the
                copy button; omit it and the row holds the CTA alone</span></li>
          </ul>
        </div>
      </SectionCard>
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
      summary="The table renders from the GENERATED meta + curation; the eight axis rows split into the shared section beneath. 20 meta props − 8 ambient axes = 12 rows; no EXTRA lane — no family prop shares an axis name."
    >
      <PropsTable meta={heroMeta} docs={HERO_SECTION_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on hero-section"
      summary="A FIRST-TIME all-no-own contract (census batch D, W3-D1): the hero's cm typography, kernel spacing and entrance cascade are its own laws, so all eight carriers stamp unread — but the supply is the point, because the hero HOSTS compositions. The guests (Badge parts, the CTA, the terminal-card) inherit the re-based channels. Theme is the one axis that moves the hero's own paint — partially, and the split follows the emission form: raw-var accent voices flip, the defineVars-alias muted lead freezes. The carriers stamp the section root (the promoted root is self-carried), greppable in the raw SSR."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch D row (the long tail —
          openspec/changes/explicit-props/research/migration-census.md); the carriers set is
          pinned by test/docs-ambient-vocabulary.spec.ts (hero-section in expectedCarriers). The
          §1 collision rule: <code>Omit&lt;HTMLAttributes&lt;HTMLElement&gt;, 'title' | 'color'&gt;</code>
          clears both native names at stake — the title snippet and the hue lane — and every
          axis name is the family's own destructured lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on hero-section" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="hero-section · the partial pole and the supply chain" files={axesFiles} stage="fill">
            <div class={cx(rt.col16, rt.wFull)}>
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)} data-probe="hero-light">
                  <span class={cx(rt.note11)}>auto — the ambient profile</span>
                  <HeroSection
                    eyebrow="day-shift · v1"
                    summary="The lead and badges ride the muted voice; the eyebrow and the title em ride the accent."
                    copyCommand="npx jixoai-ui init"
                  >
                    {#snippet title()}Light bones. <em>Accent ink.</em>{/snippet}
                    {#snippet badges()}<Badge>muted voice</Badge>{/snippet}
                  </HeroSection>
                </div>
                <div class={cx(rt.panel)} data-probe="hero-dark">
                  <span class={cx(rt.note11)}>theme="dark" — the accent voices flip; the muted alias freezes (measured)</span>
                  <HeroSection
                    eyebrow="night-shift · v2"
                    summary="The eyebrow and title em flip to the dark accent; my lead ink stays the page's muted voice."
                    copyCommand="npx jixoai-ui init"
                    theme="dark"
                  >
                    {#snippet title()}Dark island. <em>Same bones.</em>{/snippet}
                    {#snippet badges()}<Badge>muted voice</Badge>{/snippet}
                  </HeroSection>
                </div>
              </div>
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)} data-probe="hero-size-auto">
                  <span class={cx(rt.note11)}>size auto — the fixed voices</span>
                  <HeroSection
                    eyebrow="your-app · v0"
                    summary="The title's clamp is rem-floor, cqi-fluid, rem-cap — no em of the section's font-size."
                    copyCommand="npx jixoai-ui init"
                  >
                    {#snippet title()}Fixed-scale type.{/snippet}
                  </HeroSection>
                </div>
                <div class={cx(rt.panel)} data-probe="hero-size-14">
                  <span class={cx(rt.note11)}>size={"{14}"} — the box answered; the type didn't (measured)</span>
                  <HeroSection
                    eyebrow="your-app · v0"
                    summary="The section's computed font-size moves to exactly 14px; the title clamp and the px micro voices hold."
                    copyCommand="npx jixoai-ui init"
                    size={14}
                  >
                    {#snippet title()}The stamp lands; nothing follows.{/snippet}
                  </HeroSection>
                </div>
              </div>
              <div class={cx(rt.panel)} data-probe="hero-density">
                <span class={cx(rt.note11)}>density="sm" — the hero's atoms hold; the composed guests re-base (the supply chain is the point)</span>
                <HeroSection
                  eyebrow="your-app · v0"
                  summary="My own cm voices and kernel spacing hold; the Badge parts and the copy CTA inherit the sm rung's channels."
                  copyCommand="npx jixoai-ui init"
                  density="sm"
                >
                  {#snippet title()}Supply-side density.{/snippet}
                  {#snippet badges()}
                    <Badge>sm rung</Badge>
                    <Badge variant="outline">composed child</Badge>
                  {/snippet}
                </HeroSection>
              </div>
              <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
                The dark panel flips exactly the accent voices — eyebrow and title-em, the two
                rules written as raw var() strings — while the summary's muted ink is byte-frozen:
                it rides the defineVars alias, resolved at the stylex :root scope, so the scoped
                .dark cannot re-substitute it (probe receipt: --muted-foreground flips on the
                section, --jx-muted-foreground does not). The title clamp, the paddings and the
                cascade stay identical throughout. The size pair is the inertness probe: the
                stamped section's computed font-size is exactly 14px, and the title's is unmoved
                — the rem/cqi voices give the stamp nothing to scale. The density panel renders
                data-density="sm" into the raw SSR; the hero's own type is unchanged while the
                composed guests step down (the CTA and the badges inherit the rung's channels —
                measured 13→12px and 12→11px).
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="hero-section · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <HeroSection
                eyebrow="responsive · v1"
                summary="Light below 48rem; the md case flips the ink voices above it. Resize across 48rem."
                copyCommand="npx jixoai-ui init"
                theme={responsiveTheme}
              >
                {#snippet title()}Viewport-conditional ink. <em>Same bones.</em>{/snippet}
                {#snippet badges()}<Badge>md → dark</Badge>{/snippet}
              </HeroSection>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — the ambient light
                profile; at 48rem and wider the md case wins and the accent voices flip. The
                theme lane is a STRING lane: both generics are load-bearing (the heading page's
                query case shows the number-lane bare form).
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={paintTokens} />
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
      summary="Landmark chrome: one h1 through the data-jx-hero-title hook, a real button for the copy CTA (the press-button's hit lane rides the fleet floor — 7U/28px guardrail above the WCAG 2.5.8 AA 24px minimum), decorative SVGs hidden, and the entrance cascade killed under prefers-reduced-motion."
    >
      <A11yTable
        keys={[{ key: 'Tab', action: 'Moves focus through the copy CTA and secondary CTAs in reading order' }, { key: 'Enter / Space', action: 'Activates the copy CTA — command hits the clipboard, surface flips to copied' }]}
        aria={[
          { name: 'aria-label', value: 'copyLabel', description: 'Accessible name for the default copy CTA ("copy" / localized)' },
          { name: 'aria-hidden', value: 'true', description: 'On decorative copy-check SVGs' },
          { name: 'heading structure', value: 'h1', description: 'The title snippet renders inside the h1 via the data-jx-hero-title hook — keep it one per page; skipping levels below it is the caller\'s outline decision' },
          { name: 'prefers-reduced-motion', value: 'cascade kill', description: 'The entrance animation is removed entirely (hero-section.css) — reduced-motion users get the final state at first paint' },
        ]}
      />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="hero-section" />
  </div>
</div>

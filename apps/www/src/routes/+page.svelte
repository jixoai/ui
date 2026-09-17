<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CopyCommand from '$lib/copy-command.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import HeroSection from '$lib/ui/hero-section/hero-section.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Icon from '$lib/ui/icon';
  import { GITHUB_URL } from '$lib/site';
  import { FEATURED_ITEMS, REGISTRY_TOTAL } from '$lib/catalog';

  const initCode = String.raw`# register the @jixoai namespace, install the theme, set the hue
npx jixoai-ui init --hue 330

# add components (delegates to shadcn, re-applies the hue)
npx jixoai-ui add press-button section-card toc`;

  const registryCode = String.raw`{
  "registries": {
    "@jixoai": "https://ui.jixoai.com/r/{name}.json"
  }
}`;

  const why = [
    {
      id: 'one-hue',
      eyebrow: 'Law 01',
      title: 'One-Hue Law',
      body: 'Every color is OKLCH with fixed lightness and chroma; a project\'s whole identity is one CSS variable: --brand-hue. Dark mode drifts it -4°. Two jixoai sites never differ in anything except this number and their content — play with it on the Tokens page.',
    },
    {
      id: 'registry',
      eyebrow: 'Law 02',
      title: 'A shadcn registry, not a package',
      body: 'Components live in your repo after `npx jixoai-ui add` — same-source files, no runtime dependency, no version lock. The registry JSON this site documents is served from /r/ on this very domain.',
    },
    {
      id: 'dogfooded',
      eyebrow: 'Law 03',
      title: 'Dogfooded by this site',
      body: 'This page is built from the exact files the registry ships: the token sheet, the data-reveal + CSS entrance law (scroll-triggered by the theme sheet — static markup, no runtime action), press buttons, section cards, and the Combo ToC on the Components page. If the registry regresses, this site visibly regresses with it.',
    },
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>jixoai-ui — the jixoai design language</title>
  <meta
    name="description"
    content="The jixoai design language as a shadcn registry: terminal / neo-brutalist, mono-first, OKLCH token law with one brand hue per project."
  />
</svelte:head>

<!-- Hero: hero-section + terminal-card (registry items, openspecui composition). -->
<HeroSection
  eyebrow="jixoai-ui · v0.1 · shadcn registry"
  summary="Everything here graduated from production work on unipty and openspecui: an OKLCH token law where a project's entire identity is a single --brand-hue variable, hard offset shadows, a mono-first voice, and components you own after copying them in."
  copyCommand="npx jixoai-ui init --hue 330"
>
  {#snippet title()}The terminal design language of jixoai. <em>One hue per project.</em>{/snippet}
  {#snippet badges()}
    <Badge>OKLCH tokens</Badge>
    <Badge>Svelte 5 first</Badge>
    <Badge>Zero runtime deps</Badge>
    <Badge>MIT</Badge>
  {/snippet}
  {#snippet secondary()}
    <PressButton variant="outline" href="/tokens.html">Get started</PressButton>
    <PressButton variant="outline" href={GITHUB_URL} external>
      GitHub
      <span class={cx(rt.inlineFlex, rt.flexNone, rt.hmMl2, rt.hmAlign)} aria-hidden="true"><Icon name="externalLink" /></span>
    </PressButton>
  {/snippet}
  {#snippet terminal()}
    <TerminalCard
      barTitle="quick-start — zsh"
      command="npx jixoai-ui init --hue 330"
      outputs={[
        'registries["@jixoai"] ✓  jixoai.brandHue: 330 ✓',
        'jixoai-theme installed → src/lib/jixoai.css',
        'try: npx jixoai-ui add toc press-button',
      ]}
    />
  {/snippet}
</HeroSection>

<!-- Why: three law cards. -->
<section class={cx(rt.hmShell)} aria-label="Why this exists">
  <h2 class={cx(rt.hmHeading)} data-reveal="">
    Why
    <span class={cx(rt.grow, rt.hmRule)} aria-hidden="true"></span>
  </h2>
  <CardGrid class={cx(rt.mt24)}>
    {#each why as card (card.id)}
      <SectionCard eyebrow={card.eyebrow} title={card.title}>
        <p class={cx(rt.para)}>{card.body}</p>
      </SectionCard>
    {/each}
  </CardGrid>
</section>

<!-- Install card. -->
<div class={cx(rt.hmShellPt)} data-reveal="">
  <SectionCard
    eyebrow="Install"
    title="Two commands and the design language is yours"
    summary="The CLI extends shadcn's components.json, installs the token sheet, and writes your hue. Components arrive as same-source files in your repo — no package to depend on, nothing to upgrade against your will."
  >
    <div class={cx(rt.col20)}>
      <div class={cx(rt.wrapRow12)}>
        <CopyCommand command="npx jixoai-ui init --hue 330" />
      </div>
      <CodeBlock code={initCode} lang="sh" meta="shell" />
      <CodeBlock code={registryCode} lang="json" meta="components.json" />
      <p class={cx(rt.inkMuted, rt.text13, rt.lead5)}>
        Non-Svelte projects still benefit: <code class={cx(rt.inkAccent)}>jixoai-theme</code> and
        <code class={cx(rt.inkAccent)}>toc-engine</code> are framework-free. Read the full law on the
        <a href="/tokens.html" class={cx(rt.inkPrimary, rt.underline, rt.underlineOffset2)}>tokens page</a> and
        every component live on the
        <!-- docs-restructure D5: the homepage is the brand overview — its main entry is /docs.html -->
        <a href="/docs.html" class={cx(rt.inkPrimary, rt.underline, rt.underlineOffset2)}>docs page</a>.
      </p>
    </div>
  </SectionCard>
</div>

<!-- Catalog table: the curated featured projection (catalog.ts), under a
     REGISTRY-TOTAL heading — the two counts are never equated. -->
<section class={cx(rt.hmShellPt)} data-reveal="">
  <SectionCard
    eyebrow="Catalog"
    title={`${REGISTRY_TOTAL} items, one grammar — registry total`}
    summary={`registry.json advertises ${REGISTRY_TOTAL} items, every one listed on the docs index and served as JSON from this domain. The ${FEATURED_ITEMS.length} rows below are the curated featured tour, not the total.`}
  >
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Type</th>
            <th>What it is</th>
            <th>Copy-ready add</th>
          </tr>
        </thead>
        <tbody>
          {#each FEATURED_ITEMS as item (item.name)}
            <tr>
              <td><span class="pill">{item.name}</span></td>
              <td class="dim">{item.type}</td>
              <td>{item.summary}</td>
              <td>
                <code>npx jixoai-ui add {item.name}</code>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </SectionCard>
</section>

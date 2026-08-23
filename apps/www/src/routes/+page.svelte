<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import CopyCommand from '$lib/copy-command.svelte';
  import CardGrid from '$lib/ui/card-grid.svelte';
  import HeroSection from '$lib/ui/hero-section.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import TerminalCard from '$lib/ui/terminal-card.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { icons } from '$lib/icons';
  import { reveal } from '$lib/reveal';
  import { GITHUB_URL } from '$lib/site';

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
      body: 'This page is built from the exact files the registry ships: the token sheet, the reveal action, press buttons, section cards, and the Combo ToC on the Components page. If the registry regresses, this site visibly regresses with it.',
    },
  ];

  interface CatalogItem {
    name: string;
    type: string;
    blurb: string;
  }

  const catalog: CatalogItem[] = [
    { name: 'jixoai-theme', type: 'registry:theme', blurb: 'The full OKLCH token sheet with the --brand-hue law, hard shadows, radius 0 + bevel upgrade, mono-first fonts.' },
    { name: 'toc-engine', type: 'registry:lib', blurb: 'Framework-free ToC geometry: IoM weights, viewport-top line pick, margin-resolves-downward law, 76px mobile line.' },
    { name: 'reveal', type: 'registry:lib', blurb: 'Scroll-reveal action: static data-reveal hook law, delay/rise staggering, reduced-motion safety.' },
    { name: 'press-button', type: 'registry:ui', blurb: 'The press-law button: hover grows the shadow only, active presses into the page on an anchored shadow. 7 variants + opt-in shimmer / pulse / rainbow / ripple effect loops.' },
    { name: 'section-card', type: 'registry:ui', blurb: 'The content atom: bordered card, eyebrow in brand hue, font-nav title, text-pretty summary, body slot.' },
    { name: 'terminal-header', type: 'registry:ui', blurb: 'Terminal-bar site header: always-dark CRT bezel, nav pills, external links with ↗, theme slot.' },
    { name: 'terminal-footer', type: 'registry:ui', blurb: 'Ghost wordmark footer: huge hollow brand word, muted meta row transitioning to brand hue.' },
    { name: 'theme-toggle', type: 'registry:ui', blurb: 'light / dark / system cycler in Share Tech Mono, paired with the no-flash inline bootstrap.' },
    { name: 'toc', type: 'registry:ui', blurb: 'The Combo ToC: desktop Rule Tracker spine + mobile Terminal Rail glass single-row viewport.' },
    { name: 'terminal-card', type: 'registry:ui', blurb: 'The Broadside hero terminal: traffic-light bar, typed command, line-by-line outputs, 6px hard shadow.' },
    { name: 'hero-section', type: 'registry:ui', blurb: 'The openspecui-composed hero: lead type with primary accent, badges, copy-command CTA, terminal column.' },
    { name: 'website-scaffold', type: 'registry:ui', blurb: 'WebsiteScaffold: presentation-site scaffold — overlay top layer (header + float), immersive hide/reveal, SPA carousel transitions.' },
  ];
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
  titleLead="The terminal design language of jixoai. "
  titleAccent="One hue per project."
  summary="Everything here graduated from production work on unipty and openspecui: an OKLCH token law where a project's entire identity is a single --brand-hue variable, hard offset shadows, a mono-first voice, and components you own after copying them in."
  badges={['OKLCH tokens', 'Svelte 5 first', 'Zero runtime deps', 'MIT']}
  copyCommand="npx jixoai-ui init --hue 330"
>
  {#snippet secondary()}
    <PressButton variant="outline" href="/tokens.html">Get started</PressButton>
    <PressButton variant="outline" href={GITHUB_URL} external>
      GitHub
      <span class="ml-0.5 inline-flex flex-none align-[-0.125em]" aria-hidden="true">{@html icons.externalLink}</span>
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
<section class="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8" aria-label="Why this exists">
  <h2
    class="font-nav flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]"
    data-reveal=""
    use:reveal
  >
    Why
    <span class="bg-border h-px flex-1" aria-hidden="true"></span>
  </h2>
  <CardGrid class="mt-6">
    {#each why as card, index (card.id)}
      <div data-reveal="" use:reveal={{ delay: index * 70, rise: 12 }}>
        <SectionCard
          eyebrow={card.eyebrow}
          title={card.title}
          class="grid grid-rows-subgrid row-span-2"
        >
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">{card.body}</p>
        </SectionCard>
      </div>
    {/each}
  </CardGrid>
</section>

<!-- Install card. -->
<div class="mx-auto w-full max-w-[90rem] px-4 pt-8 sm:px-6 lg:px-8" data-reveal="" use:reveal>
  <SectionCard
    eyebrow="Install"
    title="Two commands and the design language is yours"
    summary="The CLI extends shadcn's components.json, installs the token sheet, and writes your hue. Components arrive as same-source files in your repo — no package to depend on, nothing to upgrade against your will."
  >
    <div class="flex flex-col gap-5">
      <div class="flex flex-wrap items-center gap-3">
        <CopyCommand command="npx jixoai-ui init --hue 330" />
      </div>
      <CodeBlock code={initCode} lang="sh" meta="shell" />
      <CodeBlock code={registryCode} lang="json" meta="components.json" />
      <p class="text-muted-foreground text-[13px] leading-5">
        Non-Svelte projects still benefit: <code class="text-accent">jixoai-theme</code> and
        <code class="text-accent">toc-engine</code> are framework-free. Read the full law on the
        <a href="/tokens.html" class="text-primary underline underline-offset-2">tokens page</a> and
        every component live on the
        <a href="/components.html" class="text-primary underline underline-offset-2"
          >components page</a
        >.
      </p>
    </div>
  </SectionCard>
</div>

<!-- Catalog table: the 9 registry items. -->
<section class="mx-auto w-full max-w-[90rem] px-4 pt-8 sm:px-6 lg:px-8" data-reveal="" use:reveal>
  <SectionCard
    eyebrow="Catalog"
    title="Nine items, one grammar"
    summary="Every item is listed in registry.json and served as JSON from this domain. The add commands below are copy-ready — they resolve through the @jixoai registry URL."
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
          {#each catalog as item (item.name)}
            <tr>
              <td><span class="pill">{item.name}</span></td>
              <td class="dim">{item.type}</td>
              <td>{item.blurb}</td>
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

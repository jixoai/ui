<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import { reveal } from '$lib/reveal';

  const tocSections = [
    { id: 'wiring', label: 'Wiring' },
    { id: 'laws', label: 'The laws' },
  ];

  const viteUsage = `// vite.config.ts — plain vite build sites (one plugin line)
import { sveltekit } from '@sveltejs/kit/vite';
import { llmsTxt } from './vite-plugins/llms-txt.mjs';

export default {
  plugins: [
    sveltekit(),
    llmsTxt({
      distDir: 'dist',
      siteUrl: 'https://myproject.jixoai.com',
      title: 'myproject',
      summary: 'What this site is, for agents.',
    }),
  ],
};`;

  const orchestratorUsage = `// scripts/build.mjs — orchestrated sites call the core directly,
// as the LAST step, on the FINAL output directory:
import { generateLlmsTxt } from './vite-plugins/llms-txt.mjs';

// …vite build, artifact copies, CNAME gating all done…
const report = generateLlmsTxt(distDir, {
  siteUrl: 'https://myproject.jixoai.com',
  title: 'myproject',
  summary: 'What this site is, for agents.',
  exclude: ['404.html'],
  full: { enabled: true, maxBytes: 10_000_000 },
});
console.log('llms-txt:', report.pages, 'pages,', report.files.length, 'files');`;

  const files: TreeFile[] = [
    { name: 'vite-plugins/llms-txt.mjs', content: '/* the installed generator (npx jixoai-ui add llms-txt) */' },
    { name: 'vite.config.ts', content: viteUsage },
    { name: 'scripts/build.mjs', content: orchestratorUsage },
  ];

  // The playground re-renders a tiny sample index from the same config
  // knobs the real generator takes — the shape below is what llms.txt
  // looks like for a two-page site (sample, not the live run).
  let linkStyle = $state<'absolute' | 'root-relative'>('absolute');
  let perPageMarkdown = $state(true);

  const samplePages = [
    { title: 'Home', url: '/' },
    { title: 'Docs — install', url: '/docs/install' },
  ];

  const sampleIndex = $derived(
    [
      '# myproject',
      '',
      '> What this site is, for agents.',
      '',
      '## Docs',
      ...samplePages.map((page) => {
        const suffix = perPageMarkdown ? '.md' : '';
        const base = `${page.url}${suffix}`;
        const link = linkStyle === 'absolute' ? `https://myproject.jixoai.com${base}` : base;
        return `- [${page.title}](${link})`;
      }),
    ].join('\n'),
  );
</script>

<svelte:head>
  <title>llms.txt generator · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai llms-txt build tool: scans the final static dist and emits llms.txt, llms-full.txt and per-page .md mirrors (llmstxt.org proposal v2) — zero dependencies, absolute URLs, atomic idempotent writes, per-locale index splitting for i18n sites."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:file · Docs Tooling"
        title="llms-txt — the AI export pass"
        summary="jixoai sites are AI-friendly by design, so the scaffold ships the export natively: after the final static build, one pass scans the published HTML and writes llms.txt, llms-full.txt and a .md mirror beside every page. No routing takeover — the generator consumes the artifact agents will actually fetch."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">llmstxt.org proposal v2</span>
          <span class="pill">zero deps</span>
          <span class="pill">absolute URLs</span>
          <span class="pill">locale splitting</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="llms-txt"
        description="One deterministic pass over the final dist: extract each page's main content, whitelist-convert it to Markdown, mirror it beside the HTML, and compose the index (plus the single-file llms-full.txt)."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/llms-txt/llms-txt.mjs"
        {files}
      >
        {#snippet children()}
          <SectionCard
            class="w-full max-w-3xl"
            eyebrow="pipeline · no routing takeover"
            title="What one build pass does"
            summary="The generator never touches the routing layer or the source tree — it reads what the site actually published."
          >
            <div class="flex flex-col gap-5">
              <pre class="jx-arch-diagram" aria-label="llms-txt pipeline diagram"><code>final dist/                      outputs (same tree)
├── index.html        ─┐          ├── index.md
├── components/*.html  ├─ extract ├── components/*.md
│    &lt;main&gt; → markdown  │          ├── llms.txt        (index, absolute URLs)
│    strip nav/forms   │          └── llms-full.txt    (cap-guarded)
└── en/… zh/… (i18n)  ─┘              └── en/llms.txt … (locale split)</code></pre>
              <ul class="flex flex-col gap-2 text-[13px] leading-6">
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">content root</strong> — each page's <code class="text-accent">&lt;main&gt;</code> (body fallback); chrome stripped by platform semantics only: nav/forms/scripts, <code class="text-accent">button</code> controls, <code class="text-accent">aria-hidden</code> decoration, <code class="text-accent">inert</code> collapsed panels</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">whitelist converter</strong> — a stack-based tokenizer, not regex chains: headings, lists, tables (colspan degrades instead of lying), fenced code with language detection, entity decoding, and dangerous links dropped</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">agent-first links</strong> — the index links each page's .md mirror by absolute URL; <code class="text-accent">linkStyle: 'root-relative'</code> exists for preview builds</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">machine-readable registry</strong> — this site's own index also points agents at <code class="text-accent">/r/registry.json</code> under an Optional section</span></li>
              </ul>
            </div>
          </SectionCard>
        {/snippet}
        {#snippet playground()}
          <div class="jx-play-fields">
            <div class="jx-play-field">
              <div class="flex flex-wrap gap-2">
                <PressButton onclick={() => (linkStyle = 'absolute')}>linkStyle: absolute</PressButton>
                <PressButton onclick={() => (linkStyle = 'root-relative')}>root-relative</PressButton>
                <PressButton onclick={() => (perPageMarkdown = !perPageMarkdown)}>
                  page .md mirrors: {perPageMarkdown ? 'on' : 'off'}
                </PressButton>
              </div>
            </div>
            <pre class="jx-sample-index" aria-label="sample llms.txt">{sampleIndex}</pre>
            <p class="jx-play-help">
              The index shape the generator composes (sample for a two-page site). Absolute URLs are
              the ecosystem default — relative paths are the most common llms.txt defect because the
              file is read detached from any page.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="wiring" data-reveal="" use:reveal>
      <SectionCard
        family="wiring"
        headerRegion="wiring"
        eyebrow="wiring"
        title="Two shapes, one core"
        summary="generateLlmsTxt(distDir, config) is the only implementation. The vite adapter exists for plain-build sites; orchestrated sites call the core directly as their last step."
      >
        <div class="flex flex-col gap-5">
          <div>
            <p class="mb-3 text-[13px] leading-6">
              Plain <code class="text-accent">vite build</code> sites (the openspecui pattern) use
              the plugin — it runs exactly once, in the SSR build's closeBundle, after SvelteKit's
              adapter has written the final dist:
            </p>
            <CodeBlock code={viteUsage} lang="ts" meta="vite.config.ts" />
          </div>
          <div>
            <p class="mb-3 text-[13px] leading-6">
              Orchestrated sites (the unipty pattern — build scripts that inject artifacts after
              vite) call the core on the <strong class="font-semibold">final</strong> output:
            </p>
            <CodeBlock code={orchestratorUsage} lang="js" meta="scripts/build.mjs" />
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="laws" data-reveal="" use:reveal>
      <SectionCard
        family="laws"
        headerRegion="laws"
        eyebrow="law"
        title="The laws"
        summary="The generator is a guest in your dist: it only touches what it declares, it never guesses, and it fails loudly rather than shipping something subtly wrong."
      >
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><strong class="font-semibold">scan the final artifact</strong> — what agents fetch
              is what got published, not what the source tree promised</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><strong class="font-semibold">declared outputs only</strong> — llms.txt,
              llms-full.txt, and .md mirrors; nothing is deleted, robots.txt and sitemap are never
              touched</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><strong class="font-semibold">hand-written .md is sacred</strong> — every
              generated mirror starts with a provenance marker; a conflicting file aborts the run</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><strong class="font-semibold">byte-deterministic</strong> — same dist in, same
              bytes out; re-runs converge, never duplicate</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><strong class="font-semibold">llms-full.txt is capped</strong> — over
              full.maxBytes the run fails naming the size; no silent truncation</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>
</div>

<style>
  .jx-arch-diagram,
  .jx-sample-index {
    background: color-mix(in oklab, var(--muted) 40%, var(--background));
    border: 1px solid var(--border);
    color: var(--muted-foreground);
    font-size: 11.5px;
    line-height: 1.7;
    margin: 0;
    overflow-x: auto;
    padding: 0.9rem 1rem;
    white-space: pre;
  }

  .jx-sample-index {
    color: var(--foreground);
    font-size: 12px;
  }
</style>

<script lang="ts">
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlaySelect, PlayHelp } from '$lib/playground';
  import type { HighlightBackend } from '$lib/highlight/backend';
  import { shiki } from '$lib/highlight/shiki';
  import { prismjs } from '$lib/highlight/prismjs';
  import { microLighter } from '$lib/highlight/microlighter';
  import { highlightJs } from '$lib/highlight/highlight-js';
  import { sugarHigh } from '$lib/highlight/sugar-high';
  import { treeSitter } from '$lib/highlight/tree-sitter';

  // Same-source law: the code drawer shows the exact registry copies this
  // site runs. `?raw` keeps them byte-identical — embedding component
  // sources (backticks, ${}, closing tags) in template literals by hand
  // would be an escaping minefield.
  import codeCardSource from '$lib/ui/code-card/code-card.svelte?raw';
  import shikiSource from '$lib/shiki.ts?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // Playground: the Selects re-render the LIVE card per Shiki language and
  // theme — each first pick fetches exactly that grammar/theme chunk.
  type DemoLang = 'ts' | 'tsx' | 'js' | 'svelte' | 'html' | 'json' | 'bash' | 'css' | 'markdown';
  type DemoTheme =
    | 'jixoai'
    | 'github-dark'
    | 'github-light'
    | 'vitesse-dark'
    | 'vitesse-light'
    | 'min-dark'
    | 'min-light';

  interface DemoSample {
    filename: string;
    code: string;
  }

  const samples: Record<DemoLang, DemoSample> = {
    ts: {
      filename: 'spawn.ts',
      code: `import { UniPty } from '@unipty/core';
import { createNodePtyBackend } from '@unipty/backend-node-pty';

// readiness happens before Core construction
const backend = await createNodePtyBackend({ runtime: 'node' });
const unipty = new UniPty({ backend });

const pty = unipty.spawn(['bash'], {
  terminal: { cols: 80, rows: 24 },
});

pty.resize(120, 36); // Character-Cell Size`,
    },
    tsx: {
      filename: 'terminal.tsx',
      code: `import { useState } from 'react';

export function Terminal({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="terminal" data-open={open}>
      <header onClick={() => setOpen(!open)}>{title}</header>
    </section>
  );
}`,
    },
    js: {
      filename: 'deploy.js',
      code: `// one fetch, full lifecycle states
export async function deploy(target) {
  const reply = await fetch('/api/deploy', {
    method: 'POST',
    body: JSON.stringify({ target }),
  });

  if (!reply.ok) {
    throw new Error('deploy rejected: ' + reply.status);
  }

  return { queued: true, target };
}`,
    },
    svelte: {
      filename: 'terminal.svelte',
      code: `<script lang="ts">
  import TerminalCard from '@ui/terminal-card.svelte';
${close}

<TerminalCard
  barTitle="quick-start — zsh"
  command="npx jixoai-ui add code-card"
  outputs={['code-card.svelte → src/lib/ui/', 'highlighter: shiki, on-demand']}
/>`,
    },
    html: {
      filename: 'index.html',
      code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>jixoai terminal</title>
    <link rel="stylesheet" href="/jixoai.css" />
  </head>
  <body>
    <header class="site-header">
      <nav aria-label="primary">
        <a href="/">home</a>
        <a href="/docs/components">components</a>
      </nav>
    </header>
  </body>
</html>`,
    },
    json: {
      filename: 'package.json',
      code: `{
  "name": "@jixoai/www",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "sideEffects": false
}`,
    },
    bash: {
      filename: 'install.sh',
      code: `# registry install — shiki rides as code-card's default engine
set -euo pipefail

npx jixoai-ui init --hue 165
npx jixoai-ui add code-card

# other engines are one item away (see the engine matrix below):
# npx jixoai-ui add @jixoai/highlight-tree-sitter

echo "installed: code-card + shiki (the only engine, by default)"`,
    },
    css: {
      filename: 'tokens.css',
      code: `/* the one-hue law: identity is a single variable */
:root {
  --brand-hue: 165;
  --primary: oklch(0.55 0.16 var(--brand-hue));
  --shadow-2xs: 1px 1px 0 0 oklch(0 0 0 / 12%);
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}`,
    },
    markdown: {
      filename: 'README.md',
      code: `# jixoai code-card

Highlighting is **Shiki**, loaded on demand.

\`\`\`ts
import CodeCard from '@ui/code-card.svelte';

const card = { lang: 'ts', theme: 'jixoai' };
\`\`\`

> grammars and themes are separate lazy chunks — the code fence above
> pulls the \`typescript\` grammar the moment it is first highlighted.`,
    },
  };

  let lang = $state<DemoLang>('ts');
  let theme = $state<DemoTheme>('jixoai');
  const sample = $derived(samples[lang]);

  // the playground selects speak the same closed unions — no string casting
  const langOptions: { value: DemoLang; label: string }[] = [
    { value: 'ts', label: 'ts' },
    { value: 'tsx', label: 'tsx' },
    { value: 'js', label: 'js' },
    { value: 'svelte', label: 'svelte' },
    { value: 'html', label: 'html' },
    { value: 'json', label: 'json' },
    { value: 'bash', label: 'bash' },
    { value: 'css', label: 'css' },
    { value: 'markdown', label: 'markdown' },
  ];
  const themeOptions: { value: DemoTheme; label: string }[] = [
    { value: 'jixoai', label: 'jixoai (tokens)' },
    { value: 'github-dark', label: 'github-dark' },
    { value: 'github-light', label: 'github-light' },
    { value: 'vitesse-dark', label: 'vitesse-dark' },
    { value: 'vitesse-light', label: 'vitesse-light' },
    { value: 'min-dark', label: 'min-dark' },
    { value: 'min-light', label: 'min-light' },
  ];

  // ---- the engine matrix (highlight-engine-matrix, 2026-09-06) ----------
  // ids ARE the backend `id` values; shiki is code-card's pinned default,
  // the other five install as their own registry items. Every factory is
  // lazy by law: importing the factory module pulls ZERO engine code —
  // the engines are dynamic imports inside highlight(), fetched at a
  // card's first paint.
  type DemoEngine = 'shiki' | 'prismjs' | 'microlighter' | 'highlightjs' | 'sugar-high' | 'tree-sitter';

  const engineFactories: Record<DemoEngine, () => HighlightBackend> = {
    shiki: () => shiki(),
    prismjs: () => prismjs(),
    microlighter: () => microLighter(),
    highlightjs: () => highlightJs(),
    'sugar-high': () => sugarHigh(),
    'tree-sitter': () => treeSitter(),
  };

  let engine = $state<DemoEngine>('shiki');
  const backend = $derived(engineFactories[engine]());

  const engineOptions: { value: DemoEngine; label: string }[] = [
    { value: 'shiki', label: 'shiki (default)' },
    { value: 'prismjs', label: 'prismjs' },
    { value: 'highlightjs', label: 'highlight.js' },
    { value: 'sugar-high', label: 'sugar-high' },
    { value: 'tree-sitter', label: 'tree-sitter' },
    { value: 'microlighter', label: 'microlighter (range)' },
  ];

  // the drawer's live usage needs the factory name + import path per id
  const engineImports: Record<DemoEngine, { fn: string; path: string }> = {
    shiki: { fn: 'shiki', path: '$lib/highlight/shiki' },
    prismjs: { fn: 'prismjs', path: '$lib/highlight/prismjs' },
    microlighter: { fn: 'microLighter', path: '$lib/highlight/microlighter' },
    highlightjs: { fn: 'highlightJs', path: '$lib/highlight/highlight-js' },
    'sugar-high': { fn: 'sugarHigh', path: '$lib/highlight/sugar-high' },
    'tree-sitter': { fn: 'treeSitter', path: '$lib/highlight/tree-sitter' },
  };
  // prose names for the live card's chrome (footer pill)
  const engineLabels: Record<DemoEngine, string> = {
    shiki: 'Shiki',
    prismjs: 'Prism',
    microlighter: 'MicroLighter',
    highlightjs: 'highlight.js',
    'sugar-high': 'sugar-high',
    'tree-sitter': 'tree-sitter',
  };
  // the head pill keeps the compact idiom
  const engineShort: Record<DemoEngine, string> = {
    shiki: 'shiki',
    prismjs: 'prism',
    microlighter: 'microlighter',
    highlightjs: 'hljs',
    'sugar-high': 'sugar-high',
    'tree-sitter': 'tree-sitter',
  };

  // the comparison table's data — same source of truth as design.md's
  // dependency-closure matrix and each factory's header. Size figures
  // carry their measurement basis: the one published cross-engine
  // benchmark is sugar-high's README, measured on 2.2.2.
  interface EngineRow {
    id: DemoEngine;
    item: string;
    factory: string;
    output: 'markup' | 'range';
    size: string;
    languages: string;
    tailoring: string;
    print: string;
    line: string;
  }

  const engineMatrix: EngineRow[] = [
    {
      id: 'shiki',
      item: '@jixoai/highlight-shiki',
      factory: 'shiki()',
      output: 'markup',
      size: 'shiki/core + the JavaScript regex engine at first paint (no WASM); every grammar and theme its own lazy chunk',
      languages: '13 curated — typescript tsx javascript jsx svelte html css scss json bash markdown yaml vue, plus the alias table',
      tailoring: 'langs subset per instance',
      print: 'spans survive the freeze clone',
      line: 'the default — TextMate accuracy, the zero-download jixoai theme',
    },
    {
      id: 'prismjs',
      item: '@jixoai/highlight-prismjs',
      factory: 'prismjs()',
      output: 'markup',
      size: 'core + one lazy chunk per grammar; themes are global stylesheets — one active per document',
      languages: 'the curated set minus svelte/vue (prismjs 1.30 ships neither): markup css clike js ts jsx tsx json bash markdown yaml scss',
      tailoring: 'langs subset per instance',
      print: 'spans survive the freeze clone',
      line: 'the classic class-based workhorse',
    },
    {
      id: 'highlightjs',
      item: '@jixoai/highlight-highlightjs',
      factory: 'highlightJs()',
      output: 'markup',
      size: 'lib/core — the zero-language kernel — plus exactly the grammars you register: unselected grammars never import or fetch (the runtime-size flagship; lazy chunks of the curated set still emit)',
      languages: 'typescript javascript xml css scss json bash markdown yaml; highlight.js 11 ships no tsx/jsx/svelte/vue module — those reject with a shiki hint',
      tailoring: 'langs subset per instance',
      print: 'spans survive the freeze clone',
      line: 'core + selective registration',
    },
    {
      id: 'sugar-high',
      item: '@jixoai/highlight-sugar-high',
      factory: 'sugarHigh()',
      output: 'markup',
      size: 'one whole bundle — 9.90 KiB min / 4.35 KiB gzip for a TS scene, its README benchmark measured on 2.2.2 (same table: prism 14.63, hljs 29.54)',
      languages: '29 canonical languages; no tsx (typescript covers it only as an input alias) — rejects with a shiki hint',
      tailoring: 'none — the whole bundle IS the minimal form (the minimal-engine exemption)',
      print: 'spans survive the freeze clone',
      line: 'the featherweight',
    },
    {
      id: 'tree-sitter',
      item: '@jixoai/highlight-tree-sitter',
      factory: 'treeSitter()',
      output: 'markup',
      size: 'the wasm core runtime + one wasm per grammar, emitted from npm assets by your bundler (?url) at first paint — the heavyweight',
      languages: 'typescript tsx javascript jsx only (jsx is the javascript grammar’s native dialect)',
      tailoring: 'langs subset · wasmBase / wasmLoader asset channels',
      print: 'spans survive the freeze clone',
      line: 'real syntax trees, query captures',
    },
    {
      id: 'microlighter',
      item: '@jixoai/highlight-microlighter',
      factory: 'microLighter()',
      output: 'range',
      size: 'a ~2 kB engine core (its own size budget) + grammars + one theme sheet, all lazy — the code element keeps its plain text node',
      languages: 'its 37 bundled TextMate grammars (typescript tsx javascript vue html css json bash markdown yaml …)',
      tailoring: 'none — the range model ships no langs gate (engines without the capability are exempt)',
      print: 'ranges do NOT survive the freeze clone — prints plain; pin a markup backend for paper',
      line: 'the range-model proof (CSS Custom Highlight API)',
    },
  ];

  // one item per engine — shiki's line is annotated because code-card
  // already pulls it in as the default (registryDependencies)
  const installCommands = `# code-card ships ONE engine by default: shiki (via @jixoai/highlight-shiki)
npx jixoai-ui add @jixoai/highlight-shiki          # already aboard with code-card
npx jixoai-ui add @jixoai/highlight-prismjs        # + prismjs
npx jixoai-ui add @jixoai/highlight-highlightjs    # + highlight.js
npx jixoai-ui add @jixoai/highlight-sugar-high     # + sugar-high
npx jixoai-ui add @jixoai/highlight-tree-sitter    # + web-tree-sitter + grammar wasm
npx jixoai-ui add @jixoai/highlight-microlighter   # + microlighter`;

  // the three configuration tiers (E3): per-instance prop, consumer-
  // written subtree provider over the zero-dependency seam, kernel
  // plugin (the site form — sites that installed @jixoai/context-plugin)
  const tierOneCode = `<script lang="ts">
  import CodeCard from '@ui/code-card.svelte';
  import { highlightJs } from '@lib/highlight/highlight-js';
${close}

<!-- one prop, one instance: this card registers ts + bash grammars only -->
<CodeCard lang="ts" code={src} backend={highlightJs({ langs: ['ts', 'bash'] })} />`;

  const tierTwoCode = `<script lang="ts">
  // highlight-default.svelte — any subtree root, ~10 lines, yours to own
  import { setContext } from 'svelte';
  import { HIGHLIGHT_KEY } from '$lib/highlight/context-key';
  import { prismjs } from '$lib/highlight/prismjs';

  // every card BELOW this root without a backend prop eats prism
  setContext(HIGHLIGHT_KEY, { backend: prismjs() });
${close}

<slot /> <!-- your subtree -->`;

  const tierThreeCode = `// print-markup-backend.ts — the kernel-plugin form (the shape sites
// that installed @jixoai/context-plugin run; the kernel never rides
// the registry items themselves)
import { definePlugin } from '$lib/context-plugin.svelte';
import { isPrintProjection } from '$lib/medium.svelte';
import { HIGHLIGHT_DEF } from '$lib/highlight/context.svelte';
import { shiki } from '$lib/highlight/shiki';

// print survival: under the print projection, swap the range backend
// for a markup one — spans survive the freeze clone, ranges do not
export const printMarkupBackend = definePlugin({
  name: 'print-markup-backend',
  targets: [HIGHLIGHT_DEF],
  filter: (_def, env) => isPrintProjection(env.medium),
  before: (backend) => (backend.id === 'microlighter' ? shiki() : backend),
});`;

  // playground state (P1): the page owns the snapshot
  const canvasInitial = {
    engine: 'shiki' as DemoEngine,
    lang: 'ts' as DemoLang,
    theme: 'jixoai' as DemoTheme,
  };
  function resetCanvas(): void {
    engine = canvasInitial.engine;
    lang = canvasInitial.lang;
    theme = canvasInitial.theme;
  }

  // live usage: the single sample tracks the playground — engine, lang,
  // theme and the sample filename all ride the current state (values
  // come from closed selects; q() keeps the habit for any free-text
  // prop). The backend import/prop appear only for non-default engines:
  // the shiki default needs zero wiring, and the snippet should say so.
  const q = (value: string): string => JSON.stringify(value);
  const backendImportLine = $derived(
    engine === 'shiki'
      ? ''
      : `  import { ${engineImports[engine].fn} } from '${engineImports[engine].path}';\n`,
  );
  const backendProp = $derived(
    engine === 'shiki' ? '' : ` backend={${engineImports[engine].fn}()}`,
  );
  const usageLive = $derived(`<script lang="ts">
  import CodeCard from '@ui/code-card.svelte';
${backendImportLine}${close}

<!-- the sample is a runtime prop: the engine escapes it, so a literal ${close}
     inside it is inert data — nothing to escape at the template level -->
<CodeCard filename=${q(sample.filename)} lang=${q(lang)} theme=${q(theme)}${backendProp} code={sample}>
  {#snippet header()}
    <span class="pill">${engineShort[engine]} · ${lang}</span>
  {/snippet}
  {#snippet footer()}
    <span>powered by ${engineLabels[engine]}</span>
  {/snippet}
</CodeCard>`);

  const files: TreeFile[] = [
    { name: 'registry/files/ui/code-card.svelte', content: codeCardSource },
    { name: 'registry/files/lib/shiki.ts', content: shikiSource },
    { name: 'src/lib/ui/code-card-usage.svelte', content: '' },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // static usage sample for the standard Usage section (the workbench
  // drawer above tracks its own live copy)
  const usageCode = `<script lang="ts">
  import CodeCard from '@ui/code-card.svelte';
${close}

<!-- the sample is a runtime prop: Shiki escapes it, so a literal ${close}
     inside it is inert data — nothing to escape at the template level -->
<CodeCard filename="spawn.ts" lang="ts" theme="jixoai" code={source}>
  {#snippet header()}
    <span class="pill">node-pty route</span>
  {/snippet}
  {#snippet footer()}
    <span>powered by Shiki</span>
  {/snippet}
</CodeCard>

<!-- fill mode: the parent owes the height; the pre is the only scroller -->
<CodeCard lang="svelte" code={sample} fill minHeight="12rem" />`;

  // ToC outline: pairs with the region ids below, in page order.

  // scroll law demo: a line wider than any column (horizontal) inside a
  // capped body (vertical)
  const scrollSample = `// one rule: the <pre> is the scrollport — Tab stays Tab, long lines scroll
const manifest = {
  route:    'registry/files/ui/code-card.svelte',
  engine:   'shiki/core + JavaScript regex engine (no WASM)',
  langs:    'typescript tsx javascript jsx svelte html css scss json bash markdown yaml vue',
  themes:   'jixoai (zero-download, --tok-*) + github/vitesse/min families',
  fallback: 'prerendered plain text → upgraded after hydration, zero layout shift',
};
// ── a deliberately wide line to force the horizontal lane ────────────────────────────────────────
console.table(Object.entries(manifest).flatMap(([key, value]) => [{ key, value }]));`;
</script>

<svelte:head>
  <title>Code card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai code-card component: a figure + pre/code readonly surface with a filename-tab head, a header/footer snippet, and a compact copy control — highlighted by Shiki through lib/shiki: on-demand grammars and themes (separate lazy chunks, JavaScript regex engine, no WASM) and the zero-download jixoai css-variables theme bound to the --tok-* palette."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Display"
      title="code-card — the readonly code surface, on Shiki"
      summary="A figure + pre/code base with a filename-tab head and a compact copy control, highlighted by Shiki through lib/shiki: grammars and themes are separate lazy chunks fetched exactly when a card first needs them (shiki/core + the JavaScript regex engine — no WASM), and the default jixoai theme is Shiki's own css-variables recipe bound to the --tok-* palette, so token paint rides the design tokens in both themes. Code is always a runtime prop — Shiki escapes it, so samples containing literal script-closing tags are inert data; the pre is the scrollport: horizontal always, vertical when maxHeight caps it."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">based on Shiki</span>
        <span class="pill">engine matrix · six installable backends</span>
        <span class="pill">on-demand grammars · themes</span>
        <span class="pill">zero-download jixoai theme</span>
        <span class="pill">scrollport pre · thin scrollbars</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the full card live, engine + lang + theme switched from the playground -->
  <div id="code-card-workbench" data-region="code-card-workbench" data-reveal="">
    <ComponentCanvas
      title="code-card"
      description="The complete card: filename tab (head left), header snippet (head right, replacing the default lang label), footer snippet (foot left), and the copy control (foot right). The Playground swaps the backend engine, the language and the theme — each first paint fetches exactly that engine's grammar/theme chunks (nothing of an engine joins the page until its card paints)."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/code-card.svelte"
      {files}
      stage="fill"
      onreset={resetCanvas}
      output={[
        { label: 'engine', value: engine },
        { label: 'lang', value: lang },
        { label: 'theme', value: theme },
      ]}
      resolveFileContent={resolveUsage}
    >
      <CodeCard
        filename={sample.filename}
        lang={lang}
        theme={theme}
        code={sample.code}
        {backend}
        class="w-full max-w-[40rem]"
      >
        {#snippet header()}
          <span class="pill">{engineShort[engine]} · {lang}</span>
        {/snippet}
        {#snippet footer()}
          <span class="text-muted-foreground text-[11px] tracking-wide">
            powered by {engineLabels[engine]} · theme: {theme}
          </span>
        {/snippet}
      </CodeCard>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="engine">
            <PlaySelect bind:value={engine} options={engineOptions} />
          </PlayRow>
          <PlayRow label="lang">
            <PlaySelect bind:value={lang} options={langOptions} />
          </PlayRow>
          <PlayRow label="theme">
            <PlaySelect bind:value={theme} options={themeOptions} />
          </PlayRow>
          <PlayHelp>
            shiki is the default backend — no prop needed, no other engine
            downloads. The other five are one registry item away (see
            <a href="#code-card-engines" class="text-accent underline underline-offset-2">the engine matrix</a>
            below); picking one here constructs that backend and hands it to
            the card live. Each engine maps the theme name into its own
            vocabulary, and a lang outside an engine's set rejects by law —
            the card keeps its plain text (try tsx on sugar-high, or svelte
            on anything but shiki). tree-sitter fetches its wasm grammars at
            first paint; microlighter paints zero markup — ranges over the
            plain text. The usage file in the drawer tracks all three picks
            live.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the scroll law -->
  <div id="code-card-scroll-law" data-region="code-card-scroll-law" data-reveal="">
    <ComponentCanvas
      title="scroll law"
      description="The pre is the single scrollport: long lines scroll horizontally (Tab characters stay tabs, never wrapped), maxHeight caps the body into vertical scrolling, scrollbars are thin currentColor lanes with overscroll containment, and the region is keyboard-focusable."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/code-card.svelte"
      files={[{ name: 'scroll-demo.ts', content: scrollSample }]}
      stage="fill"
    >
      <CodeCard
        filename="manifest.ts"
        lang="ts"
        code={scrollSample}
        maxHeight="14rem"
        class="w-full max-w-[40rem]"
      />
    </ComponentCanvas>
  </div>

  <!-- the Shiki contract -->
  <div id="code-card-law" data-reveal="">
    <SectionCard
      family="code-card-law"
      headerRegion="code-card-law"
      eyebrow="law"
      title="Based on Shiki — a facade, not a wrapper"
      summary="lib/shiki adds loading strategy only: a lazy singleton over shiki/core with the JavaScript regex engine, one dynamic import per grammar and theme, and a zero-download default theme from Shiki's css-variables factory. It never re-interprets Shiki output — getHighlighter() hands back the stock HighlighterCore and highlightCode() forwards Shiki's own codeToHtml options (transformers, dual themes, decorations) untouched, so the whole Shiki ecosystem works here as-is."
    >
      <div class="grid gap-4 min-[760px]:grid-cols-2">
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">what the card owns</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>progressive paint: the prerendered sample is escaped plain text; after hydration Shiki upgrades the SAME <code class="text-accent">&lt;code&gt;</code> element — zero layout shift</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>on-demand loading: shiki/core + engine on first highlight; every grammar/theme its own lazy chunk, fetched only when requested</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>named themes ride along — the theme's editor colors from Shiki's pre output apply verbatim to the card's pre</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>scroll law: horizontal always, vertical under <code class="text-accent">maxHeight</code>, thin scrollbars, keyboard-focusable pre</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">what the consumer owes</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>a runtime string — never inlined markup between component tags</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>a Shiki language id for <code class="text-accent">lang</code> (aliases like ts/sh/md resolve in lib/shiki)</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>extra grammars/themes in one line: <code class="text-accent">registerLanguage('python', () =&gt; import('shiki/langs/python.mjs'))</code></span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>nothing else — npm <code class="text-accent">shiki</code> installs with the registry item</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- the engine matrix: six installable engines, one contract -->
  <div id="code-card-engines" data-reveal="">
    <SectionCard
      family="code-card-engines"
      headerRegion="code-card-engines"
      eyebrow="matrix"
      title="The engine matrix — one contract, six installable engines"
      summary="shiki is the pinned default: installing code-card installs shiki and nothing else. Five more engines exist as their own registry items, each a factory returning the same HighlightBackend — markup backends write token spans into the card's code element (the paint survives the print pipeline's freeze clone), microlighter is the range model: zero markup, ranges registered in the CSS Custom Highlight API over the plain text (which is why it prints plain — see the table). Every engine is lazy: importing a factory pulls no engine code; the download happens at a card's first paint."
    >
      <div class="flex flex-col gap-8">
        <!-- the comparison table -->
        <div class="overflow-x-auto border border-border">
          <table class="w-full min-w-[70rem] text-[12.5px]">
            <caption class="sr-only">the six highlight engines compared</caption>
            <thead>
              <tr class="border-b border-border bg-muted/40 text-left">
                <th scope="col" class="px-3 py-2 font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">engine</th>
                <th scope="col" class="px-3 py-2 font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">output</th>
                <th scope="col" class="px-3 py-2 font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">size posture</th>
                <th scope="col" class="px-3 py-2 font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">languages</th>
                <th scope="col" class="px-3 py-2 font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">tailoring</th>
                <th scope="col" class="px-3 py-2 font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">print</th>
                <th scope="col" class="px-3 py-2 font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">in one line</th>
              </tr>
            </thead>
            <tbody>
              {#each engineMatrix as row (row.id)}
                <tr class="border-b border-border align-top {row.id === 'shiki' ? 'bg-primary/5' : ''}">
                  <th scope="row" class="px-3 py-2.5 text-left font-normal">
                    <code class="text-accent">{row.factory}</code>
                    {#if row.id === 'shiki'}<span class="pill ml-1.5">default</span>{/if}
                    <div class="mt-1 text-[11px] text-muted-foreground">{row.item}</div>
                  </th>
                  <td class="px-3 py-2.5">
                    <span class:font-bold={row.output === 'range'} class:text-primary={row.output === 'range'}>{row.output}</span>
                  </td>
                  <td class="px-3 py-2.5 leading-5">{row.size}</td>
                  <td class="px-3 py-2.5 leading-5">{row.languages}</td>
                  <td class="px-3 py-2.5 leading-5">{row.tailoring}</td>
                  <td class="px-3 py-2.5 leading-5">{row.print}</td>
                  <td class="px-3 py-2.5 leading-5">{row.line}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- install + the breaking note -->
        <div class="flex flex-col gap-3">
          <h3 class="font-nav text-[13px] tracking-tight">add an engine — one item per engine</h3>
          <CodeBlock code={installCommands} lang="sh" meta="registry install" />
          <p class="text-[13px] leading-6 text-muted-foreground">
            Each item lands its factory in <code class="text-accent">$lib/highlight/&lt;engine&gt;</code>
            and declares only its own npm dependencies — sibling engines never ride along.
            <strong class="font-semibold text-foreground">microlighter + vite:</strong> its grammar
            loading is runtime-templated inside the package and misses fail silently, so hosts owe
            two lines — dev excludes it from the optimizer, builds emit its
            <code class="text-accent">dist/grammars/*.js</code> next to the engine chunk (this
            site's vite.config.ts is the reference implementation).
            <strong class="font-semibold text-foreground">Breaking (2026-09-06):</strong>
            code-card used to bundle prismjs and microlighter as hard npm dependencies — it does
            not anymore, and nothing is shimmed. If you consumed those factories, add the matching
            item above; the <code class="text-accent">$lib/highlight/&lt;engine&gt;</code> import
            path keeps working for every engine you install, and engines you never install simply
            never download. The full migration table lives in the
            <a href="/docs/registry" class="text-accent underline underline-offset-2">registry docs</a>.
          </p>
        </div>

        <!-- the three configuration tiers -->
        <div class="flex flex-col gap-4">
          <h3 class="font-nav text-[13px] tracking-tight">three configuration tiers</h3>
          <div class="grid gap-4 min-[760px]:grid-cols-2">
            <div class="border border-border bg-muted/40 px-4 py-4">
              <h4 class="font-nav mb-1 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">① per instance — the backend prop</h4>
              <p class="mb-3 text-[12.5px] leading-5">
                Any consumer, any card: pass a factory product. The <code class="text-accent">langs</code>
                subset is the size lever — one instance's gate never narrows another's.
              </p>
              <CodeBlock code={tierOneCode} lang="svelte" meta="per-instance" />
            </div>
            <div class="border border-border bg-muted/40 px-4 py-4">
              <h4 class="font-nav mb-1 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">② subtree default — your ~10-line provider</h4>
              <p class="mb-3 text-[12.5px] leading-5">
                The seam ships with the items (zero dependencies): <code class="text-accent">HIGHLIGHT_KEY</code>.
                Cards without a <code class="text-accent">backend</code> prop eat the nearest
                provider's default — the prop always wins.
              </p>
              <CodeBlock code={tierTwoCode} lang="svelte" meta="subtree default" />
            </div>
          </div>
          <div class="border border-border bg-muted/40 px-4 py-4">
            <h4 class="font-nav mb-1 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">③ kernel plugin — the site form</h4>
            <p class="mb-3 max-w-[60rem] text-[12.5px] leading-5">
              Sites that installed <code class="text-accent">@jixoai/context-plugin</code> can project
              the default through the plugin kernel — here repairing microlighter's one known
              limitation: under the print projection, swap the range backend for a markup one so
              the freeze clone carries real spans. The kernel never rides the registry items;
              this composition is app-side by law.
            </p>
            <CodeBlock code={tierThreeCode} lang="ts" meta="print-gated backend swap" />
          </div>
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Code card variants" summary="Head and foot are compositional; fill turns the card into a pinned-chrome panel.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">bare pre</p>
        <CodeCard lang="ts" code={'const bare = true;'} copyable={false} class="w-full" />
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">filename tab + copy</p>
        <CodeCard filename="hello.ts" lang="ts" code={'export const hello = "world";'} class="w-full" />
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">header/footer snippets</p>
        <CodeCard filename="install.sh" lang="bash" code={'npx jixoai-ui add code-card'} class="w-full">
          {#snippet header()}
            <span class="pill">registry</span>
          {/snippet}
          {#snippet footer()}
            <span class="text-[11px] text-muted-foreground">terminal install</span>
          {/snippet}
        </CodeCard>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Code is always a runtime prop — Shiki escapes it, so samples containing literal closing tags are inert data."><CodeBlock code={usageCode} lang="svelte" meta="CodeCard usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The pre is a labelled, keyboard-focusable scrollport; the copy control is a real button with state feedback."><A11yTable keys={[{ key: 'Tab', action: 'Reaches the scrollport (pre) and the copy control' }, { key: '← / → / ↑ / ↓', action: 'Scroll the focused pre — long lines horizontal, capped bodies vertical' }, { key: 'Enter / Space', action: 'Activate the copy button' }]} aria={[{ name: 'aria-label', value: '"{filename|lang} code sample"', description: 'On the pre — the scrollport is named whether or not a filename tab exists.' }, { name: 'aria-label', value: 'copy {filename|lang} sample', description: 'On the copy button; flips to "copied" for the 1.6s feedback window.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Token paint end to end — the jixoai theme resolves to the --tok-* palette at paint time; the shell rides the --readonly-code-* tints."><div class="flex flex-col gap-5"><DensityDemo><CodeCard filename="density.ts" lang="ts" code={'export const density = "fixed rhythm";'} class="w-full" copyable={false} /></DensityDemo><TokenTable tokens={[{ name: '--tok-token-keyword', default: 'var(--primary)', source: 'color', description: 'Shiki css-variables palette — one markup, both themes.' }, { name: '--tok-token-string', default: 'var(--accent)', source: 'color' }, { name: '--readonly-code-bg', default: 'muted 42% / background', source: 'color', description: 'Body ground tint.' }, { name: '--readonly-code-meta-bg / -fg', default: 'accent mixes', source: 'color', description: 'Head/foot chrome tints.' }, { name: 'body rhythm', default: '13px mono, fixed padding', source: 'structural' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Twelve props; code is the only required one — everything else is composition."><PropsTable props={[{ name: 'code', type: 'string', default: '—', description: 'The sample (runtime prop; the backend escapes it into inert spans).', required: true }, { name: 'backend', type: 'HighlightBackend', default: 'context → shiki()', description: 'Highlight backend instance — shiki() | prismjs() | highlightJs() | sugarHigh() | treeSitter() | microLighter(); see the engine matrix.' }, { name: 'lang', type: 'string', default: "'ts'", description: 'Language id; aliases (ts/sh/md/…) resolve in the active backend’s table.' }, { name: 'theme', type: 'string', default: "'jixoai'", description: 'Theme name in shiki vocabulary; each backend maps it into its own world.' }, { name: 'filename', type: 'string', default: "''", description: 'Filename tab on the head’s left; head renders when it or header exists.' }, { name: 'header', type: 'Snippet', default: '—', description: 'Head-right area; replaces the default lang label.' }, { name: 'footer', type: 'Snippet', default: '—', description: 'Footer-left content.' }, { name: 'copyable', type: 'boolean', default: 'true', description: 'Copy control on the footer bar’s right.' }, { name: 'maxHeight', type: 'string', default: "''", description: 'CSS length capping the body; turns on vertical scrolling.' }, { name: 'fill', type: 'boolean', default: 'false', description: 'Stretch to the container height; the pre becomes the only scroll area.' }, { name: 'minHeight', type: 'string', default: "''", description: 'Floors the card height; pairs with fill so short samples open readable.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the figure.' }]} /></SectionCard></div>
</div>

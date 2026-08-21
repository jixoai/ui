<script lang="ts">
  import CodeCard from '$lib/ui/code-card.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the code drawer shows the exact registry copies this
  // site runs. `?raw` keeps them byte-identical — embedding component
  // sources (backticks, ${}, closing tags) in template literals by hand
  // would be an escaping minefield.
  import codeCardSource from '$lib/ui/code-card.svelte?raw';
  import shikiSource from '$lib/shiki.ts?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import CodeCard from '@ui/code-card.svelte';
${close}

<!-- the sample is a runtime prop: Shiki escapes it, so a literal ${close}
     inside it is inert data — nothing to escape at the template level -->
<CodeCard filename="spawn.ts" lang="ts" code={sample}>
  {#snippet header()}
    <span class="pill">node-pty route</span>
  {/snippet}
  {#snippet footer()}
    <span>powered by Shiki</span>
  {/snippet}
</CodeCard>`;

  const files = [
    { name: 'registry/files/ui/code-card.svelte', content: codeCardSource },
    { name: 'registry/files/lib/shiki.ts', content: shikiSource },
    { name: 'src/lib/ui/code-card-usage.svelte', content: usage },
  ];

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
        <a href="/components">components</a>
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
      code: `# registry install — shiki joins as a normal npm dependency
set -euo pipefail

npx jixoai-ui init --hue 165
npx jixoai-ui add code-card shiki

echo "installed: shiki core + on-demand grammars"`,
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
  <title>code-card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai code-card component: a figure + pre/code readonly surface with a filename-tab head, a header/footer snippet, and a compact copy control — highlighted by Shiki through lib/shiki: on-demand grammars and themes (separate lazy chunks, JavaScript regex engine, no WASM) and the zero-download jixoai css-variables theme bound to the --tok-* palette."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <!-- page head -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Display"
      title="code-card — the readonly code surface, on Shiki"
      summary="A figure + pre/code base with a filename-tab head and a compact copy control, highlighted by Shiki through lib/shiki: grammars and themes are separate lazy chunks fetched exactly when a card first needs them (shiki/core + the JavaScript regex engine — no WASM), and the default jixoai theme is Shiki's own css-variables recipe bound to the --tok-* palette, so token paint rides the design tokens in both themes. Code is always a runtime prop — Shiki escapes it, so samples containing literal script-closing tags are inert data; the pre is the scrollport: horizontal always, vertical when maxHeight caps it."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">based on Shiki</span>
        <span class="pill">on-demand grammars · themes</span>
        <span class="pill">zero-download jixoai theme</span>
        <span class="pill">scrollport pre · thin scrollbars</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the full card live, lang + theme switched from the playground -->
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="code-card"
      description="The complete card: filename tab (head left), header snippet (head right, replacing the default lang label), footer snippet (foot left), and the copy control (foot right). The Playground swaps the Shiki language and the theme — each first pick fetches exactly that grammar/theme chunk."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/code-card.svelte"
      {files}
    >
      <CodeCard
        filename={sample.filename}
        lang={lang}
        theme={theme}
        code={sample.code}
        class="w-full max-w-[40rem]"
      >
        {#snippet header()}
          <span class="pill">shiki · {lang}</span>
        {/snippet}
        {#snippet footer()}
          <span class="text-muted-foreground text-[11px] tracking-wide">
            powered by Shiki · theme: {theme}
          </span>
        {/snippet}
      </CodeCard>
      {#snippet playground()}
        <div class="flex flex-col gap-3">
          <NativeSelect
            label="lang"
            value={lang}
            onchange={(event) => {
              lang = event.currentTarget.value as DemoLang;
            }}
          >
            <option value="ts">ts</option>
            <option value="tsx">tsx</option>
            <option value="js">js</option>
            <option value="svelte">svelte</option>
            <option value="html">html</option>
            <option value="json">json</option>
            <option value="bash">bash</option>
            <option value="css">css</option>
            <option value="markdown">markdown</option>
          </NativeSelect>
          <NativeSelect
            label="theme"
            value={theme}
            onchange={(event) => {
              theme = event.currentTarget.value as DemoTheme;
            }}
          >
            <option value="jixoai">jixoai (tokens)</option>
            <option value="github-dark">github-dark</option>
            <option value="github-light">github-light</option>
            <option value="vitesse-dark">vitesse-dark</option>
            <option value="vitesse-light">vitesse-light</option>
            <option value="min-dark">min-dark</option>
            <option value="min-light">min-light</option>
          </NativeSelect>
        </div>
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          Every pick loads on demand: picking <code class="text-accent">markdown</code> also pulls
          the grammars its fences hint at, and a named theme paints its own editor colors on the
          pre. The jixoai theme downloads nothing — token colors resolve to the
          <code class="text-accent">--tok-*</code> palette at paint time.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the scroll law -->
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="scroll law"
      description="The pre is the single scrollport: long lines scroll horizontally (Tab characters stay tabs, never wrapped), maxHeight caps the body into vertical scrolling, scrollbars are thin currentColor lanes with overscroll containment, and the region is keyboard-focusable."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/code-card.svelte"
      files={[{ name: 'scroll-demo.ts', content: scrollSample }]}
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
  <div data-reveal="" use:reveal>
    <SectionCard
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
</div>

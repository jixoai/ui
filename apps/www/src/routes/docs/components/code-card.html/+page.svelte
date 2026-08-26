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

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { lang: 'ts' as DemoLang, theme: 'jixoai' as DemoTheme };
  function resetCanvas(): void {
    lang = canvasInitial.lang;
    theme = canvasInitial.theme;
  }

  // live usage: the single sample tracks the playground — lang, theme and
  // the sample filename all ride the current state (values come from
  // closed selects; q() keeps the habit for any free-text prop)
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<script lang="ts">
  import CodeCard from '@ui/code-card.svelte';
${close}

<!-- the sample is a runtime prop: Shiki escapes it, so a literal ${close}
     inside it is inert data — nothing to escape at the template level -->
<CodeCard filename=${q(sample.filename)} lang=${q(lang)} theme=${q(theme)} code={sample}>
  {#snippet header()}
    <span class="pill">node-pty route</span>
  {/snippet}
  {#snippet footer()}
    <span>powered by Shiki</span>
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
  <title>code-card · jixoai-ui</title>
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
        <span class="pill">on-demand grammars · themes</span>
        <span class="pill">zero-download jixoai theme</span>
        <span class="pill">scrollport pre · thin scrollbars</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the full card live, lang + theme switched from the playground -->
  <div id="code-card-workbench" data-region="code-card-workbench" data-reveal="">
    <ComponentCanvas
      title="code-card"
      description="The complete card: filename tab (head left), header snippet (head right, replacing the default lang label), footer snippet (foot left), and the copy control (foot right). The Playground swaps the Shiki language and the theme — each first pick fetches exactly that grammar/theme chunk."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/code-card.svelte"
      {files}
      stage="fill"
      onreset={resetCanvas}
      output={[
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
        <PlayFields>
          <PlayRow label="lang">
            <PlaySelect bind:value={lang} options={langOptions} />
          </PlayRow>
          <PlayRow label="theme">
            <PlaySelect bind:value={theme} options={themeOptions} />
          </PlayRow>
          <PlayHelp>
            Every pick loads on demand: picking <code>markdown</code> also
            pulls the grammars its fences hint at, and a named theme paints its own editor colors
            on the pre. The jixoai theme downloads nothing — token colors resolve to the
            <code>--tok-*</code> palette at paint time. The usage file in the
            drawer tracks both picks live.
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
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Ten props; code is the only required one — everything else is composition."><PropsTable props={[{ name: 'code', type: 'string', default: '—', description: 'The sample (runtime prop; Shiki escapes it into inert spans).', required: true }, { name: 'lang', type: 'string', default: "'ts'", description: 'Shiki language id; aliases (ts/sh/md/…) resolve in lib/shiki.' }, { name: 'theme', type: 'string', default: "'jixoai'", description: 'Shiki theme — the css-variables default, or any registered name.' }, { name: 'filename', type: 'string', default: "''", description: 'Filename tab on the head’s left; head renders when it or header exists.' }, { name: 'header', type: 'Snippet', default: '—', description: 'Head-right area; replaces the default lang label.' }, { name: 'footer', type: 'Snippet', default: '—', description: 'Footer-left content.' }, { name: 'copyable', type: 'boolean', default: 'true', description: 'Copy control on the footer bar’s right.' }, { name: 'maxHeight', type: 'string', default: "''", description: 'CSS length capping the body; turns on vertical scrolling.' }, { name: 'fill', type: 'boolean', default: 'false', description: 'Stretch to the container height; the pre becomes the only scroll area.' }, { name: 'minHeight', type: 'string', default: "''", description: 'Floors the card height; pairs with fill so short samples open readable.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the figure.' }]} /></SectionCard></div>
</div>

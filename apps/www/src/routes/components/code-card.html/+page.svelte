<script lang="ts">
  import CodeCard from '$lib/ui/code-card.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Select from '$lib/ui/select.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the code drawer shows the exact registry copies this
  // site runs. `?raw` keeps them byte-identical — embedding component
  // sources (backticks, ${}, closing tags) in template literals by hand
  // would be an escaping minefield.
  import codeCardSource from '$lib/ui/code-card.svelte?raw';
  import highlightSource from '$lib/highlight.ts?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import CodeCard from '@ui/code-card.svelte';
${close}

<!-- the sample is a runtime prop: a literal ${close} inside it is inert
     data — nothing to escape at the template level -->
<CodeCard filename="spawn.ts" lang="ts" code={sample}>
  {#snippet header()}
    <span class="pill">node-pty route</span>
  {/snippet}
  {#snippet footer()}
    <span>zero-dep tokenizer</span>
  {/snippet}
</CodeCard>`;

  const files = [
    { name: 'registry/files/ui/code-card.svelte', content: codeCardSource },
    { name: 'registry/files/lib/highlight.ts', content: highlightSource },
    { name: 'src/lib/ui/code-card-usage.svelte', content: usage },
  ];

  // Playground: the Select re-renders the LIVE card per tokenizer language.
  type DemoLang = 'ts' | 'js' | 'svelte' | 'json' | 'bash' | 'css';
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
  outputs={['code-card.svelte → src/lib/ui/', 'tokenizer: 6 token classes']}
/>`,
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
      code: `# registry install — no network beyond npm
set -euo pipefail

npx jixoai-ui init --hue 165
npx jixoai-ui add code-card highlight

echo "installed: 2 files into src/lib/"`,
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
  };

  let lang = $state<DemoLang>('ts');
  const sample = $derived(samples[lang]);
</script>

<svelte:head>
  <title>code-card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai code-card component: a figure + pre/code readonly surface with a filename-tab head, a header/footer snippet, and a compact copy control — tinted by the zero-dep deterministic tokenizer (lib/highlight) through the --tok-* palette in both themes."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <!-- page head -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Display"
      title="code-card — the readonly code surface"
      summary="A figure + pre/code base with a filename-tab head on the accent-tinted meta strip, and the zero-dep deterministic tokenizer (lib/highlight) tinting comment / string / keyword / number / function / tag through the --tok-* palette — one markup serves both themes. Code is always a runtime prop, so samples containing literal script-closing tags are inert escaped data; horizontal overflow scrolls while Tab characters stay tabs."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">figure + pre/code</span>
        <span class="pill">zero-dep tokenizer · 6 classes</span>
        <span class="pill">runtime-string code prop</span>
        <span class="pill">copy · 1.6s feedback</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the full card live, lang-switched from the playground -->
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="code-card"
      description="The complete card: filename tab (head left), header snippet (head right, replacing the default lang label), footer snippet (foot left), and the copy control (foot right). The Playground Select swaps the tokenizer language."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/code-card.svelte"
      {files}
    >
      <CodeCard
        filename={sample.filename}
        lang={lang}
        code={sample.code}
        class="w-full max-w-[40rem]"
      >
        {#snippet header()}
          <span class="pill">tokenizer · {lang}</span>
        {/snippet}
        {#snippet footer()}
          <span class="text-muted-foreground text-[11px] tracking-wide">
            zero-dep tokenizer · 6 token classes
          </span>
        {/snippet}
      </CodeCard>
      {#snippet playground()}
        <Select
          label="lang"
          value={lang}
          onchange={(event) => {
            lang = event.currentTarget.value as DemoLang;
          }}
        >
          <option value="ts">ts</option>
          <option value="js">js</option>
          <option value="svelte">svelte</option>
          <option value="json">json</option>
          <option value="bash">bash</option>
          <option value="css">css</option>
        </Select>
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          The hint drives the tokenizer vocabulary — comment styles, keywords, tag shapes and
          number rules change per language; the markup never does.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the runtime-prop law -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="code-card-law"
      eyebrow="law"
      title="The code prop is a runtime string"
      summary="Samples are data, never markup: the tokenizer escapes first, so HTML-significant characters — including a literal closing-script tag — cannot terminate the host page or inject tags. Consumers embed samples the same way this page does, as template literals with the closing tag spliced, or hand them straight from ?raw imports like the drawer sources above."
    >
      <div class="grid gap-4 min-[760px]:grid-cols-2">
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">what the card owns</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>escape-first tokenization — <code class="text-accent">highlight(code, lang)</code>, deterministic in/out</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>head renders when <code class="text-accent">filename</code> or <code class="text-accent">header</code> exists; the snippet fully replaces the default lang label</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>foot renders when <code class="text-accent">footer</code> or <code class="text-accent">copyable</code>; copy flips to the <code class="text-accent">copied</code> variant for 1.6s</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">pre</code> keeps its native superpowers: tabs stay tabs, long lines scroll</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">what the consumer owes</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>a runtime string — never inlined markup between component tags</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>spliced closing tags inside page scripts (<code class="text-accent">'&lt;/' + 'script&gt;'</code>) — the page's own tag must not terminate early</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>a tokenizer hint, not a parser: <code class="text-accent">lang</code> picks the vocabulary, aliases resolve in lib/highlight</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>nothing else — no theme plumbing, the --tok-* palette rides the sheet</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>
</div>

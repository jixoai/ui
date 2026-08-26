<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import InlineCode, { INLINE_LANGS, detectInlineLang } from '$lib/ui/inline-code/inline-code.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import inlineCodeSource from '$lib/ui/inline-code/inline-code.svelte?raw';

  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import InlineCode from '@ui/inline-code.svelte';
${close}

<!-- plain forever: it says a token, not code -->
<InlineCode lang="text">--jx-tonal</InlineCode>

<!-- explicit lang: detection is skipped -->
<InlineCode lang="ts">const answer: number = 42</InlineCode>

<!-- auto: the zero-download fingerprint heuristic picks the grammar -->
<InlineCode>npm install @jixoai/ui</InlineCode>

<!-- the ladder: outline is the same geometry with the border doing the work -->
<InlineCode variant="outline">var(--primary)</InlineCode>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/inline-code/inline-code.svelte', content: inlineCodeSource },
    { name: 'src/lib/ui/inline-code-usage.svelte', content: usage },
  ];

  // the honest heuristic, on the record: what the detector answers for
  // representative snippets (pure function, zero downloads)
  const detectionSamples: [label: string, code: string][] = [
    ['css', 'color: var(--jx-tonal)'],
    ['svelte', '{#each list as item (item.id)}{/each}'],
    ['typescript', 'const value: number = 42'],
    ['bash', 'npm install @jixoai/ui'],
    ['json', '{"name": "jixoai", "private": true}'],
    ['plain', 'Ctrl + C'],
  ];
</script>

<svelte:head>
  <title>InlineCode · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai inline code chip: a native <code> in the variant grammar's tonal/outline ladder, mono and untracked, with Shiki tokens as an async enhancement — SSR paints plain text, hydration upgrades it with zero layout shift, and the frame never depends on language detection."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="inline code — the token, framed"
        summary="A native <code> — the element whose entire meaning is 'this is source code' — in the ladder's tonal/outline paint with kbd-law geometry. Mono with untouched case: code is not a label, so the eyebrow voice (uppercase, tracking) never applies. Shiki highlighting is an async enhancement: the server paints plain text, hydration swaps in --tok-* token spans over the same characters, and an unknown language degrades to the plain chip. Inside <pre> the jx-pure reset strips a bare code's frame — long or dynamic code belongs to CodeCard."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;code&gt;</span>
          <span class="pill">async Shiki tokens</span>
          <span class="pill">zero CLS</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="inline-code"
        stage="center"
        description="Plain, explicit, and auto-detected — one component, three language paths, the same frame."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/inline-code/inline-code.svelte"
        files={canvasFiles}
      >
        <div class="flex flex-col gap-3 text-[13.5px]">
          <p>
            Set <InlineCode lang="text">--jx-tonal</InlineCode> to retune any ladder chip.
          </p>
          <p>
            <InlineCode lang="ts">const answer: number = 42</InlineCode> pins the grammar;
            <InlineCode lang="svelte" class="ms-1">{'{#each list as item (item.id)}{/each}'}</InlineCode>
            too.
          </p>
          <p class="text-muted-foreground">
            <InlineCode>npm install @jixoai/ui</InlineCode> and
            <InlineCode class="ms-1">{"{ name: 'jixoai' }"}</InlineCode> were auto-detected — the
            chip renders before the grammar resolves.
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              stateless display atom — the reading pane stays. The chip renders its plain text
              server-side; after hydration the Shiki grammar loads on demand and token spans take
              over the same characters. A failed guess costs color, never the frame.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="inline-code-variants" data-reveal="">
      <SectionCard
        family="inline-code-variants"
        headerRegion="inline-code-variants"
        eyebrow="demo"
        title="The ladder pair"
        summary="Tonal (default) tints the ground 12% and the border 45% from --jx-tonal; outline keeps a transparent ground and lets the 1px --jx-outline border do the work. The default tonal carries a local neutral injection — parity with jx-pure's bare code — and a consumer's own injection replaces it."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-3 text-[13.5px]">
            <InlineCode>tonal · neutral default</InlineCode>
            <InlineCode variant="outline">outline · structural</InlineCode>
            <InlineCode class="jx-hue-success">tonal · injected success</InlineCode>
          </div>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="inline-code-detection" data-reveal="">
      <SectionCard
        family="inline-code-detection"
        headerRegion="inline-code-detection"
        eyebrow="law"
        title="The honest heuristic"
        summary="lang='auto' runs a zero-download regex fingerprint scorer over the snippet — tuned for short inline code, not a general language detector. Weights add up per candidate, the highest score at or above 2 wins, and plain prose stays plain. An explicit lang skips the guesswork entirely; detection is documented, deterministic, and wrong at worst in color."
      >
        <div class="flex flex-col gap-5">
          <table class="w-full max-w-xl text-[12.5px]">
            <caption class="sr-only">what the fingerprint detector answers for representative snippets</caption>
            <tbody>
              {#each detectionSamples as [expected, code] (code)}
                <tr class="border-t border-border">
                  <th scope="row" class="border-b border-border px-2 py-1.5 text-left font-normal text-muted-foreground">{code}</th>
                  <td class="border-b border-border px-2 py-1.5">
                    <InlineCode lang="text">{detectInlineLang(code) || 'plain'}</InlineCode>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
          <div>
            <p class="mb-2 text-[12.5px] text-muted-foreground">
              The candidate set mirrors the grammars registered in lib/shiki (ids + aliases):
            </p>
            <div class="flex max-w-2xl flex-wrap gap-1.5">
              {#each INLINE_LANGS as candidate (candidate)}
                <InlineCode lang="text" variant="outline">{candidate}</InlineCode>
              {/each}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="types" data-reveal="">
      <SectionCard eyebrow="types" title="The three language paths" summary="Plain stays plain forever; an explicit lang is trusted as-is; auto asks the heuristic. All three render the same chip before any JavaScript runs.">
        <div class="flex flex-wrap items-center gap-3 text-[13.5px]">
          <InlineCode lang="text">lang="text"</InlineCode>
          <span class="text-muted-foreground">·</span>
          <InlineCode lang="ts">lang="ts"</InlineCode>
          <span class="text-muted-foreground">·</span>
          <InlineCode>lang="auto" (default)</InlineCode>
        </div>
      </SectionCard>
    </div>
    <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'code', value: 'native element', description: 'Communicates "this is code" without extra ARIA; the text never changes, only its paint.' }, { name: 'token spans', value: 'async, cosmetic', description: 'Highlight spans wrap the same characters SSR rendered — screen readers read the identical text before and after hydration.' }]}/></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><InlineCode lang="ts">const value = 42</InlineCode></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-tonal', default: 'var(--primary); chip injects var(--muted-foreground)', source: 'color', description: 'Tonal ground/border/text hue slot — the design.md §1 recipe.' }, { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source.' }, { name: '--tok-token-keyword', default: 'var(--primary)', source: 'color', description: 'Shiki css-variables palette — the same values code-card.css wires, carried by the chip itself.' }, { name: '--tok-token-string', default: 'var(--accent)', source: 'color' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
    <div id="api" data-reveal=""><SectionCard eyebrow="api" title="InlineCode props"><PropsTable props={[{ name: 'variant', type: "'tonal' | 'outline'", default: "'tonal'", description: 'The ladder paint; the neutral tonal injection rides the default.' }, { name: 'lang', type: 'string', default: "'auto'", description: "'auto' = fingerprint heuristic; an explicit id/alias skips detection; 'text'/'plain' stay plain." }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }, { name: 'class', type: 'string', description: 'Adds consumer classes; jx-hue-* intent utilities retune the tonal slot, and [--tok-token-…:…] injections land here.' }]} /><p class="mt-4 text-[12.5px] text-muted-foreground">Every other attribute (title, data-*, aria-*) flows through to the native &lt;code&gt; element verbatim. Module exports: <InlineCode lang="text" variant="outline">INLINE_LANGS</InlineCode> (the detection candidates) and <InlineCode lang="text" variant="outline">detectInlineLang(code)</InlineCode> (the pure heuristic).</p></SectionCard></div>
  </div>
</div>

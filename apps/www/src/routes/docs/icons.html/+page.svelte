<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import IconTable, { type IconRow } from '$lib/icon-table/icon-table.svelte';
  import { icons } from '$lib/icons';

  // ── the CSS-slot vocabulary (hand data per the design contract:
  //     9 concept slots ⇔ the --jx-icon-* variable faces; the parallel
  //     batches land the sheet bytes, this table stays in sync with the
  //     contract) ────────────────────────────────────────────────────
  //
  // The palette/check `paint` expressions mirror the sheet's own
  // var(--slot, <inline-fallback-uri>) embedding law — palette has no
  // :root line (mask inline fallback only); check IS declared at :root
  // by the vocab sheet (jx-pure.css icon-vocab block), while the
  // combobox.css consumer keeps its inline-fallback embedding, which
  // this row mirrors. The URI bytes below are byte-mirrors of the
  // live sheet values (jx-pure.css icon-vocab block · combobox.css
  // check fallback).

  const CHECK_FALLBACK_URI =
    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M20 6 9 17l-5-5\'/%3E%3C/svg%3E")';

  const PALETTE_FALLBACK_URI =
    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'13.5\' cy=\'6.5\' r=\'.5\' fill=\'%23000\' stroke=\'none\'/%3E%3Ccircle cx=\'17.5\' cy=\'10.5\' r=\'.5\' fill=\'%23000\' stroke=\'none\'/%3E%3Ccircle cx=\'8.5\' cy=\'7.5\' r=\'.5\' fill=\'%23000\' stroke=\'none\'/%3E%3Ccircle cx=\'6.5\' cy=\'12.5\' r=\'.5\' fill=\'%23000\' stroke=\'none\'/%3E%3Cpath d=\'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z\'/%3E%3C/svg%3E")';

  const cssSlotRows: IconRow[] = [
    {
      slot: '--jx-icon-calendar',
      paint: 'var(--jx-icon-calendar)',
      consumer: 'input[type=date] ::-webkit-calendar-picker-indicator',
      technique: 'background-image',
      concept: 'calendar',
    },
    {
      slot: '--jx-icon-calendar-ink',
      paint: 'var(--jx-icon-calendar-ink)',
      consumer: 'UA-shadow pseudos — the dark/light matrix twin',
      technique: 'background-image',
      concept: 'calendar · derived',
    },
    {
      slot: '--jx-icon-clock',
      paint: 'var(--jx-icon-clock)',
      consumer: 'input[type=time] ::-webkit-calendar-picker-indicator',
      technique: 'background-image',
      concept: 'clock',
    },
    {
      slot: '--jx-icon-clock-ink',
      paint: 'var(--jx-icon-clock-ink)',
      consumer: 'UA-shadow pseudos — the dark/light matrix twin',
      technique: 'background-image',
      concept: 'clock · derived',
    },
    {
      slot: '--jx-icon-chevron',
      paint: 'var(--jx-icon-chevron)',
      consumer: 'native select · .jx-color-picker-chevron',
      technique: 'mask + background-image',
      concept: 'chevron',
    },
    {
      slot: '--jx-icon-palette',
      paint: `var(--jx-icon-palette, ${PALETTE_FALLBACK_URI})`,
      consumer: '.jx-color-shell::after — the color input wrapper',
      technique: 'mask',
      concept: 'palette',
    },
    {
      slot: '--jx-icon-clear',
      paint: 'var(--jx-icon-clear)',
      consumer: 'input × button · ::-webkit-search-cancel-button',
      technique: 'mask + background-image',
      concept: 'clear',
    },
    {
      slot: '--jx-icon-mail',
      paint: 'var(--jx-icon-mail)',
      consumer: 'input[type=email] inline-start ornament',
      technique: 'background-image',
      concept: 'mail',
    },
    {
      slot: '--jx-icon-search',
      paint: 'var(--jx-icon-search)',
      consumer: 'input[type=search] inline-start ornament',
      technique: 'background-image',
      concept: 'search',
    },
    {
      slot: '--jx-icon-check',
      paint: `var(--jx-icon-check, ${CHECK_FALLBACK_URI})`,
      consumer: 'combobox selection check (combobox.css)',
      technique: 'mask',
      concept: 'check',
    },
    {
      slot: '--jx-icon-valid-ink',
      paint: 'var(--jx-icon-valid-ink)',
      consumer: "[aria-invalid='false'] state ink",
      technique: 'background-image',
      concept: 'check · derived',
    },
    {
      slot: '--jx-icon-invalid-ink',
      paint: 'var(--jx-icon-invalid-ink)',
      consumer: "[aria-invalid='true'] state ink",
      technique: 'background-image',
      concept: 'invalid · ink-only',
    },
  ];

  // ── the named library walks the icons bag itself (dogfood: a glyph
  //     added to icons.ts appears here with zero edit — the freshness
  //     gate `npm run verify:icons` keeps the bag honest) ────────────
  const namedIcons = Object.entries(icons);

  const namedUsage = `<script lang="ts">
  import { icons } from '@lib/icons';
${'<' + '/script>'}

<!-- decorative by contract (aria-hidden baked in) — sizing is YOUR css -->
<button aria-label="open settings">
  {@html icons.palette}
  settings
</button>`;

  // ── the plugin demo override: the SAME vocabulary face, redefined
  //     locally. The override URI derives from the named library at
  //     runtime (check glyph, width/height stripped — data URIs size
  //     via CSS) and speaks the frozen URI dialect (css-laws
  //     icon-uris.ts · vite-plugin ink.ts): attribute double quotes
  //     normalize to single quotes INSIDE tags only — text content is
  //     never touched — then exactly <, >, # percent-encode. The
  //     url("…") delimiters must stay the ONLY double quotes: a raw
  //     inner quote truncates the value to `url(` in the browser
  //     CSSOM and the repaint silently dies. ────────────────────────
  const toDataUri = (svg: string): string => {
    const body = svg
      .replace(' width="16"', '')
      .replace(' height="16"', '')
      .replace(/<[^<>]*>/g, (tag) =>
        tag.replace(
          /(\s)([^\s"'=<>]+)\s*=\s*"([^"]*)"/g,
          (_m, lead: string, name: string, value: string) => lead + name + "='" + value + "'",
        ),
      )
      .replaceAll('<', '%3C')
      .replaceAll('>', '%3E')
      .replaceAll('#', '%23');
    return `url("data:image/svg+xml,${body}")`;
  };

  // swap the search ornament for the check glyph — a plugin override
  // in miniature, scoped to one wrapper instead of the whole sheet
  const demoOverride = toDataUri(icons.check);

  const SEARCH_PAINT = 'background-color: currentColor; -webkit-mask: var(--jx-icon-search) center / contain no-repeat; mask: var(--jx-icon-search) center / contain no-repeat;';

  // ── plugin section copy ────────────────────────────────────────────
  const providerRows = [
    {
      provider: 'lucideIconProvider()',
      source: "the lucide npm IconNode data — zero I/O, the standard defaults",
      nature: 'stroke · 24×24 grid',
    },
    {
      provider: 'svgIconProvider({ dir })',
      source: 'your .svg files — {slot}.svg per slot, per-slot filename overrides',
      nature: 'file-based · HMR',
    },
    {
      provider: 'fontIconProvider({ font, codepoints })',
      source: 'glyph outlines extracted from any TTF/OTF (WOFF2 decompressed for you)',
      nature: 'fill · font units',
    },
    {
      provider: 'mixinIconProvider(base, { slot: factory })',
      source: 'a base provider plus per-slot overrides — override first, null falls through',
      nature: 'composition',
    },
  ];

  const pluginConfig = `// vite.config.ts — the icons pipeline (this site's own wiring)
import { jixoai } from '@jixoai/vite-plugin';
import { lucideIconProvider } from '@jixoai/vite-plugin/icons';

export default {
  plugins: [
    sveltekit(),
    tailwindcss(),
    ...jixoai({
      icons: {
        provider: lucideIconProvider(), // the zero-I/O lucide defaults
        safety: { mode: 'warn' },       // rejected → the sheet's inline fallback
      },
    }),
  ],
};

/* app.css — the ONLY injection path: a virtual CSS module
   @import 'virtual:jixoai-icons'; */
// JS consumers (the clear slot's {@html} × button):
// import { domIcons } from 'virtual:jixoai-icons?dom';`;

  const derivationDiagram = `override ONE concept slot (e.g. icons: { calendar: mySvg })
        │
        ▼  the serializer re-bakes the whole family from YOUR artwork
@layer theme {
  :root     { --jx-icon-calendar:     url(… your glyph, #000 ink …); }
  :root     { --jx-icon-calendar-ink: url(… your glyph, #000 ink …); }
  .dark     { calendar + calendar-ink re-baked with #fff ink; }
  .jx-light { calendar + calendar-ink re-baked with #000 ink; }
}
── the concept map (9 concepts ⇔ the variable faces) ──────────────
  calendar → calendar + calendar-ink        clock → clock + clock-ink
  check    → check + valid-ink              invalid → invalid-ink (no plain)
  chevron · palette · clear · mail · search → their single plain face
──────────────────────────────────────────────────────────────────
plain + ink + the dark/light matrix re-bake TOGETHER — an overridden
plain beside a stock ink is impossible by construction.`;
</script>

<svelte:head>
  <title>Icons · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai icon system in one page: the named inline icon library (&#123;@html icons.x&#125;, verify:icons freshness gate), the --jx-icon-* CSS vocabulary (mask/currentColor law, ink matrix for UA-shadow pseudos), and the jixoai(&#123; icons &#125;) vite plugin — providers (lucide/svg/font/mixin), concept-slot overrides with derived ink re-baking, the safety checker, and virtual:jixoai-icons."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:lib · icon vocabulary"
        title="icons — one geometry, two faces, one pipeline"
        summary="Every glyph in jixoai ships from a single source: the named inline library for components (&#123;@html icons.x&#125; — decorative by contract, sizing is consumer CSS), and the --jx-icon-* CSS vocabulary the form sheet paints through CSS mask and background-image (one alpha-only URI per glyph, an ink matrix for UA-shadow pseudos that reject author paint). The vite plugin re-bakes that vocabulary from YOUR artwork — override one concept slot and the plain, ink and dark/light variants re-derive together."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">named library — {'{@html icons.x}'}</span>
          <span class="pill">--jx-icon-* vocabulary</span>
          <span class="pill">mask / background-image</span>
          <span class="pill">ink matrix (.dark / .jx-light)</span>
          <span class="pill">concept slots → derived ink</span>
          <span class="pill">virtual:jixoai-icons</span>
          <span class="pill">verify:icons gate</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="icons" />
    </div>

    <div id="vocabulary" data-reveal="">
      <SectionCard
        family="vocabulary"
        headerRegion="vocabulary"
        eyebrow="vocabulary"
        title="The named icon library"
        summary="One shared module so every component renders the SAME geometry instead of private glyphs: SVG strings (not components, not Snippets) consumed with &#123;@html icons.&lt;name&gt;&#125; — 24×24 viewBox, 16px baked, stroke currentColor, aria-hidden baked in (meaning lives in the surrounding text or the control's aria-label; sizing and stroke-weight overrides are consumer CSS). This table walks the icons bag itself — a glyph added to the module appears here with zero edit."
      >
        <div class="flex flex-col gap-5">
          <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" data-named-icon-grid="">
            {#each namedIcons as [name, glyph] (name)}
              <li class="border-border/60 bg-card/40 flex items-center gap-3 border px-3 py-2">
                <span class="glyph-box text-foreground shrink-0" aria-hidden="true">{@html glyph}</span>
                <span class="flex min-w-0 flex-col">
                  <code class="font-mono text-[12.5px] leading-5">icons.{name}</code>
                  <code class="text-muted-foreground font-mono text-[10.5px] leading-4">{'{@html icons.' + name + '}'}</code>
                </span>
              </li>
            {/each}
          </ul>
          <p class="text-muted-foreground text-[13px] leading-6">
            Generated from <code class="text-accent">scripts/gen-icons.mjs</code> (lucide geometry) — the
            <code class="text-accent">npm run verify:icons</code> freshness gate fails the build the moment the
            committed module drifts from the manifest, so the previews above can never lie about the bag.
          </p>
          <CodeBlock code={namedUsage} lang="svelte" meta={'usage — {@html icons.x}'} />
        </div>
      </SectionCard>
    </div>

    <div id="css-slots" data-reveal="">
      <SectionCard
        family="css-slots"
        headerRegion="css-slots"
        eyebrow="css vocabulary"
        title="--jx-icon-* — the mask / currentColor law"
        summary="The componentless face paints its icons as CSS: one alpha-only URI per glyph, declared on the vocabulary sheet (the encoded stroke is an ALPHA SOURCE ONLY). Author-painted rules theme through mask + background-color: currentColor; UA-shadow pseudos that reject author mask paint take the -ink variants, and .dark / .jx-light flip the whole set to white/black ink. The glyph column below consumes the vocabulary face itself — a slot that changes geometry changes here with zero edit."
      >
        <div class="flex flex-col gap-5">
          <IconTable rows={cssSlotRows} />
          <p class="text-muted-foreground text-[13px] leading-6">
            The <code class="text-accent">Overridable</code> column names the plugin CONCEPT slot: covering a
            concept re-bakes every variable it owns (the derived-ink law below). The
            <code class="text-accent">palette</code> variable exists only as an inline mask fallback (no :root
            line — the wrapper paints <code class="text-accent">var(--jx-icon-palette, …)</code>), so its glyph
            column mirrors that same embedding expression.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="plugin" data-reveal="" class="flex flex-col gap-8">
      <SectionCard
        family="plugin"
        headerRegion="plugin"
        eyebrow="plugin"
        title="jixoai(&#123; icons &#125;) — the customization pipeline"
        summary="The vite plugin owns the vocabulary end to end: a provider answers every concept slot with structured artwork, the serializer is the only code that generates CSS, and the safety checker runs before serialization in both modes — no unvalidated SVG ever reaches output. Opt-in with one feature flag; without the icons option the plugin never loads."
      >
        <div class="flex flex-col gap-5">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-border">
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Provider</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Source</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Nature</th>
              </tr>
            </thead>
            <tbody>
              {#each providerRows as row (row.provider)}
                <tr class="border-b border-border/50">
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">{row.provider}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[13px] text-muted-foreground">{row.source}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground whitespace-nowrap">{row.nature}</td>
                </tr>
              {/each}
            </tbody>
          </table>
          <p class="text-muted-foreground text-[13px] leading-6">
            Providers never touch the filesystem — the plugin owns ALL file I/O and hands loaded bytes
            (and HMR watches) through a ProviderContext. <code class="text-accent">safety</code> defaults to
            <code class="text-accent">warn</code>: a rejected icon logs and serves the standard layer's inline
            fallback (warn means don't crash the build, NOT let unvalidated content through); pass
            <code class="text-accent">{`{ mode: 'error' }`}</code> — with optional
            <code class="text-accent">maxBytes</code> (10KB) / <code class="text-accent">maxPathCommands</code>
            (500) limits — to fail instead, e.g. for HTTP-sourced artwork.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        family="plugin"
        region="derivation"
        eyebrow="derived ink"
        title="Concept slots — cover one, re-bake the family"
        summary="The plugin opens slots by CONCEPT, not by variable: covering calendar re-bakes --jx-icon-calendar AND --jx-icon-calendar-ink AND the .dark/.jx-light white/black ink matrix from your artwork in one pass. Mix-and-match (your plain beside the stock ink) is impossible by construction — change once, the whole family follows."
      >
        <div class="flex flex-col gap-5">
          <pre class="jx-derivation-diagram" aria-label="concept slot derivation diagram"><code>{derivationDiagram}</code></pre>
          <CodeBlock code={pluginConfig} lang="ts" meta="vite.config.ts + app.css" />
          <p class="text-muted-foreground text-[13px] leading-6">
            <code class="text-accent">virtual:jixoai-icons</code> is the only injection path: the plugin serves
            it as a virtual CSS module (<code class="text-accent">@layer theme</code> custom properties) for
            your CSS entry, and the explicit <code class="text-accent">virtual:jixoai-icons?dom</code> form
            exports serialized DOM strings for &#123;@html&#125; consumers. Watched sources invalidate the virtual
            module — HMR re-runs the provider with fresh bytes.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        family="plugin"
        region="demo"
        eyebrow="live demo"
        title="One wrapper, one override — a real repaint"
        summary="The vocabulary is plain CSS custom properties, so a scope can re-define one: the right box lives inside a wrapper that redefines --jx-icon-search (a style attribute — the same seam a plugin override writes at sheet scale). Both boxes paint through the identical mask expression; only the variable's value differs. No screenshots, no fakes — the browser repaints the pair live."
      >
        <div class="grid gap-4 sm:grid-cols-2" data-icon-override-demo="">
          <div class="border-border flex flex-col gap-3 border p-4">
            <p class="font-nav text-[11px] uppercase tracking-[0.24em]">default — :root value</p>
            <div class="flex items-center gap-3">
              <span class="demo-glyph size-6" data-icon-demo-default="" aria-hidden="true" style={SEARCH_PAINT}></span>
              <code class="text-muted-foreground font-mono text-[11.5px]">mask: var(--jx-icon-search)</code>
            </div>
          </div>
          <div
            class="border-primary/40 border p-4"
            data-icon-override-scope=""
            style={'--jx-icon-search: ' + demoOverride}
          >
            <p class="font-nav text-[11px] uppercase tracking-[0.24em]">overridden — wrapper scope</p>
            <div class="flex items-center gap-3">
              <span class="demo-glyph size-6" data-icon-demo-override="" aria-hidden="true" style={SEARCH_PAINT}></span>
              <code class="text-muted-foreground font-mono text-[11.5px]">style=&quot;--jx-icon-search: url(…)&quot;</code>
            </div>
          </div>
        </div>
        <p class="text-muted-foreground mt-5 text-[13px] leading-6">
          Dogfood: this very site's slots are served through the
          <code class="text-accent">jixoai(&#123; icons &#125;)</code> pipeline — the default box on the left is
          the plugin path running in production, and the site's build smoke-asserts it renders byte-equal to
          the shipped sheet.
        </p>
      </SectionCard>
    </div>
  </div>
</div>

<style>
  /* the named-library previews: sizing is consumer CSS (icons.ts law) */
  .glyph-box :global(svg) {
    width: 1.375rem;
    height: 1.375rem;
  }

  .demo-glyph {
    display: block;
  }

  .jx-derivation-diagram {
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
</style>

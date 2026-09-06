<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import IconTable, { type IconRow } from '$lib/icon-table/icon-table.svelte';
  import Icon from '$lib/ui/icon';
  import { ICON_NAMES, getIcon } from '$lib/icon-set.gen';

  // ══ SECTION 4 data — the CSS-slot vocabulary (hand data per the
  //     design contract: 9 concept slots ⇔ the --jx-icon-* variable
  //     faces; the palette/check `paint` expressions mirror the
  //     sheet's own var(--slot, <inline-fallback-uri>) embedding law —
  //     palette has no :root line (mask inline fallback only); check
  //     IS declared at :root by the vocab sheet (jx-pure.css
  //     icon-vocab block), while the combobox.css consumer keeps its
  //     inline-fallback embedding, which this row mirrors. The URI
  //     bytes below are byte-mirrors of the live sheet values
  //     (jx-pure.css icon-vocab block · combobox.css check fallback).

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

  // ══ SECTION 3 data — the plugin library face ═════════════════════

  // the overflow sentinel, byte-exact (packages/vite-plugin/src/icons/ids.ts
  // — the fixed named error shared by the build-time resolver and the
  // artifact's runtime LAZY catch; never paraphrased on this page)
  const OVERFLOW_SENTINEL =
    '[jixoai/icon-set] virtual:jixoai-icons/chunk/* imported but no icons library ' +
    'is configured — wire jixoai({ icons: { library } }) in your vite plugins ' +
    '(see the icon-set item docs)';

  const libraryOptions = [
    {
      option: 'includeDefaults',
      def: 'true',
      what: 'the 38 built-in lucide manifest in manifest order; false with no lucide: sources never touches the lucide import at all',
    },
    {
      option: 'presets',
      def: '[]',
      what: "enable icon-library presets — each contributes a prefixed ref form (md:/ph:/rx:) resolving ONE icon from the preset's optional peer package at build time; string shorthand = frozen defaults, object form carries weight/style/fill knobs. A disabled or unknown prefix fails at startup listing the enabled set",
    },
    {
      option: 'icons',
      def: '{}',
      what: 'add + override named sources (same name = override; names match /^[a-z][A-Za-z0-9]*$/); customs pack after the built-ins in config insertion order',
    },
    {
      option: 'maxChunkBytes',
      def: '20480',
      what: 'serialized entry bytes per chunk module (key + payload) — RAW, non-gzip; the greedy packer opens chunk K+1 when the next icon would exceed it',
    },
    {
      option: 'chunking',
      def: "'auto'",
      what: "'auto' = budgeted chunks; 'single' = one chunk, no splitting",
    },
    {
      option: 'inlineFirstChunk',
      def: 'true',
      what: 'chunk 0 rides inline in the artifact so getIcon() answers synchronously; false = the all-lazy escape hatch',
    },
    {
      option: 'optimize',
      def: 'true',
      what: 'svgo after the raw safety check (floatPrecision 3, geometry-preserving — pinned a no-op on lucide); never runs on the slot face',
    },
    {
      option: 'output',
      def: "'src/lib/icon-set.gen.ts'",
      what: 'artifact write target, project-root-relative — ONLY used when write is on',
    },
    {
      option: 'write',
      def: 'false',
      what: 'consumer opt-in; the vite adapter serves virtual chunks and drift-warns instead. In THIS repo the root gen:icons script is the ONLY writer (the single-writer law)',
    },
  ];

  const libraryConfig = `// vite.config.ts — the library face (this site's own wiring, condensed)
import { sveltekit } from '@sveltejs/kit/vite';
import { jixoai } from '@jixoai/vite-plugin';

export default {
  plugins: [
    sveltekit(),
    ...jixoai({
      icons: {
        library: {
          includeDefaults: true,            // the 38 built-ins (default)
          presets: ['material'],            // enable md:/ph:/rx: refs (optional peers)
          icons: {                          // add + override — every source form
            brand: 'lucide:zap',            // a lucide ref — resolved at BUILD time
            logo: { file: 'assets/logo.svg' }, // a .svg file — the plugin owns the I/O
            spark: '<svg xmlns="…">…</svg>',   // an inline literal — RAW safety-checked
            home: 'md:home',                // a preset ref — outlined/400/FILL-0 Material
            glyph: { font: 'brand.woff2', code: 0xE002 }, // a font glyph, extracted
          },
          maxChunkBytes: 20480,             // RAW module bytes per chunk (default)
          chunking: 'auto',                 // 'single' = one chunk, no splitting
          inlineFirstChunk: true,           // chunk 0 inline → sync getIcon (default)
          optimize: true,                   // svgo pass (default)
          write: false,                     // the repo's gen:icons script is the writer
        },
      },
    }),
  ],
};

/* the artifact it generates (default config → the plugin-free tier):
   import { getIcon, loadIcon, preloadIcons, ICON_NAMES, type IconName }
     from '$lib/icon-set.gen'; */`;

  const asyncLaw = `chunk 0 (inline) ── getIcon(name) answers synchronously
                      SSR paints the glyph in the server HTML,
                      hydration matches — ZERO wiring owed

chunks 1+ (lazy) ── loadIcon(name) dynamic-imports
                      virtual:jixoai-icons/chunk/K (cached promise);
                      pending renders the FIXED reserved box:
                      <span data-jx-icon-pending aria-hidden="true"
                        style="display:inline-block;width:16px;height:16px">
                      pending AND rejected render the IDENTICAL span, so
                      hydration never rewrites the box; a failed chunk
                      warns once per chunk per session — the box stays.

preloadIcons(['folderOpen', 'fileVideo'])  // warm lazy chunks ahead of a mount`;

  const modeMatrix = [
    { chunking: "'auto' (default)", inline: 'true (default)', layout: 'budgeted chunks; chunk 0 inline', imports: 'lazy for chunks 1..N; N=0 → zero virtual imports' },
    { chunking: "'auto'", inline: 'false', layout: 'budgeted chunks; all lazy', imports: 'lazy imports for every chunk' },
    { chunking: "'single'", inline: 'true (default)', layout: 'one chunk, fully inline', imports: 'zero virtual imports' },
    { chunking: "'single'", inline: 'false', layout: 'one lazy chunk with everything', imports: 'exactly one lazy import' },
  ];

  // the shipped presets (icon-library-presets, 2026-09-07): research-
  // verified per-icon SVG source packages; lucide stays the built-in
  // default (no preset needed). Each package is an OPTIONAL peer —
  // absence fails loudly with the npm install line (the lucide law).
  const presetRows = [
    {
      id: 'material',
      prefix: 'md:home',
      pkg: '@material-symbols/svg-400',
      license: 'Apache-2.0',
      mapping: 'outlined · weight 400 · FILL 0 (knobs: weight/style/fill)',
    },
    {
      id: 'phosphor',
      prefix: 'ph:atom',
      pkg: '@phosphor-icons/core',
      license: 'MIT',
      mapping: 'assets/regular (knob: weight thin…duotone)',
    },
    {
      id: 'remix',
      prefix: 'rx:system:add-line',
      pkg: 'remixicon',
      license: 'Apache-2.0',
      mapping: 'icons/<Category>/ — the name carries its category prefix',
    },
    {
      id: 'lucide (built-in)',
      prefix: 'lucide:zap',
      pkg: 'lucide',
      license: 'ISC',
      mapping: 'the 38-name manifest + lucide: refs — always wired',
    },
  ];

  const presetConfig = `// enabling a preset: string shorthand = frozen defaults
library: { presets: ['material', 'phosphor', 'remix'] }

// or the object form with the knobs (one weight = ONE peer package)
library: {
  presets: [
    { id: 'material', weight: 400, style: 'rounded', fill: true },
    { id: 'phosphor', weight: 'fill' },
  ],
}

// referencing a prefix you have NOT enabled is a named startup error
// listing the enabled set — "fa:home" fails, teaching the fix`;

  // the prefix compiler (icon-prefix-compiler, 2026-09-07): scanned
  // names + as aliases + the three-tier safety story. NOTE: this site
  // does NOT dogfood the scanner (no presets in its own config — the
  // 38-name artifact stays locked); the snippets are inert text.
  const prefixCompilerSnippet = `<!-- with presets: ['material'] enabled — write prefixed names
     directly, NO library.icons declaration needed -->
<Icon name="md:copy_all" />            <!-- scanned → packs under the canonical -->
<Icon name="md:copy_all as copy2" />   <!-- the as form: alias + canonical, ONE payload -->
<Icon name="copy2" />                  <!-- the alias resolves the SAME icon -->
<Icon name={\`md:\${iconKey}\`} />        <!-- dynamic: NOT scanned — the runtime lane -->`;

  const aliasArtifactSnippet = `// the artifact the compiler generates (sources are NEVER rewritten)
export const ALIASES: Readonly<Record<string, string>> = {
  copy2: 'md:copy_all',   // one table row per alias — never a second payload
};
// CHUNK_0 packs 'md:copy_all' exactly once; lookups deref FIRST, so
// getIcon('md:copy_all'), getIcon('copy2') and even the full literal
// getIcon('md:copy_all as copy2') resolve the SAME packed payload`;

  const scanTiers = [
    {
      tier: 'compile',
      what: 'the prefix',
      how: 'IconName gains a `md:${string}` template member for every ENABLED preset — an "fa:…" name is a type error with no runtime story',
    },
    {
      tier: 'build',
      what: 'the concrete name',
      how: 'the scanner collects the static literal; the preset resolver must answer it or the build fails BY NAME (never a silently blank glyph)',
    },
    {
      tier: 'runtime',
      what: 'dynamic composition',
      how: 'getIcon() returns null, the component renders its reserved box and warns once; loadIcon() names both possible causes',
    },
  ];

  const fontSourceSnippet = `// a font FILE is an icon source — the outline is EXTRACTED at build
// time (opentype.js + the same contain-fit math as the slot face) and
// the artifact stays pure SVG: no font bytes reach the browser
icons: {
  brand:  { font: 'brand.woff2', code: 0xE002 },  // codepoint (cmap)
  logo:   { font: 'brand.woff2', liga: 'md-logo' }, // ligature, best-effort
  legacy: { font: 'old/icon.ttf',  code: 0x41 },    // ttf/otf directly
}
// woff2 decompresses through the same loadSource lane (wawoff2);
// woff1 stays the hard error. A codepoint missing from cmap, a blank
// outline, or an unresolvable ligature fails BY NAME (the miss lists
// the font's resolvable ligatures when the parser exposes them).
// The gen:icons script twin is svg-only: font sources are a
// named vite-plugin-only lane there.`;

  // ══ SECTION 4 plugin data — the SLOT face's pipeline ═════════════

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

  const slotConfig = `// vite.config.ts — this site's own wiring: BOTH faces, one plugin call
import { jixoai } from '@jixoai/vite-plugin';
import { lucideIconProvider } from '@jixoai/vite-plugin/icons';

export default {
  plugins: [
    sveltekit(),
    ...jixoai({
      icons: {
        provider: lucideIconProvider(),    // the SLOT face — --jx-icon-* vocabulary
        safety: { mode: 'warn' },          // shared by both faces
        library: { includeDefaults: true }, // the LIBRARY face — <Icon name>
      },
    }),
  ],
};

/* app.css — the slot face's ONLY injection path: a virtual CSS module
   @import 'virtual:jixoai-icons'; */`;

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

  // ── the plugin demo override: the SAME vocabulary face, redefined
  //     locally. The override URI derives from the generated set at
  //     runtime (the check glyph's {v,n,d} payload rebuilt into an
  //     <svg> — no width/height, data URIs size via CSS) and speaks
  //     the frozen URI dialect (css-laws icon-uris.ts · vite-plugin
  //     ink.ts): attribute double quotes normalize to single quotes
  //     INSIDE tags only — text content is never touched — then
  //     exactly <, >, # percent-encode. The url("…") delimiters must
  //     stay the ONLY double quotes: a raw inner quote truncates the
  //     value to `url(` in the browser CSSOM and the repaint silently
  //     dies. ────────────────────────────────────────────────────────
  const toDataUri = (svg: string): string => {
    const body = svg
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
  const check = getIcon('check');
  const CHECK_SOURCE = check
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${check.v}" fill="${check.n === 'fill' ? 'currentColor' : 'none'}" stroke="${check.n === 'fill' ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${check.d}</svg>`
    : '';
  const demoOverride = toDataUri(CHECK_SOURCE);

  const SEARCH_PAINT = 'background-color: currentColor; -webkit-mask: var(--jx-icon-search) center / contain no-repeat; mask: var(--jx-icon-search) center / contain no-repeat;';
</script>

<svelte:head>
  <title>Icons · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai icon system in one page, two faces: the Icon component over the generated set (&lt;Icon name&gt; — the IconName union makes typos compile errors; size/strokeWidth props; inline core renders synchronously SSR-safe, lazy overflow rides loadIcon into a fixed reserved box with preloadIcons to warm it), and the --jx-icon-* CSS vocabulary the form sheet paints through mask/currentColor with the ink matrix for UA-shadow pseudos. The jixoai(&#123; icons &#125;) vite plugin feeds both: the library face (sources, override, the 20480 RAW chunk budget, chunking single, inlineFirstChunk, optimize, the single-writer law) and the slot face (providers, concept-slot overrides with derived ink re-baking, virtual:jixoai-icons)."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui + registry:lib · the icon system"
        title="icons — one pipeline, two faces, one component"
        summary="Every glyph in jixoai ships from one generator with two consumption faces. The component face: <Icon name> renders the generated set through a closed IconName union — a typo is a compile error, the inline core paints synchronously (SSR-safe), lazy overflow reserves its box and warms through preloadIcons. The slot face: the --jx-icon-* CSS vocabulary the form sheet paints through mask and background-image, with an ink matrix for UA-shadow pseudos that reject author paint. The vite plugin feeds both — jixoai(&#123; icons &#125;) with a library face and a provider face that share nothing but the safety checker."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">&lt;Icon name> · IconName union</span>
          <span class="pill">ICON_NAMES — 38 built-ins</span>
          <span class="pill">inline core · SSR-safe</span>
          <span class="pill">lazy chunks · preloadIcons</span>
          <span class="pill">--jx-icon-* vocabulary</span>
          <span class="pill">virtual:jixoai-icons</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" class="flex flex-col gap-3">
      <DocsInstall name="icon" />
      <DocsInstall name="icon-set" />
    </div>

    <div id="component" data-reveal="">
      <SectionCard
        family="component"
        headerRegion="component"
        eyebrow="component face"
        title="The Icon component — &lt;Icon name=&quot;…&quot; /&gt;"
        summary="The named-glyph renderer every component shares: name is the generated IconName union (a wrong name never ships — it fails the compile), the component owns the whole svg root (currentColor by artwork nature, aria-hidden baked in), and size / strokeWidth are props, never wrapper CSS. The full API table, the interactive playground and the async-paths walkthrough live on the component's own page."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-end gap-x-10 gap-y-5" data-icon-size-demo="">
            {#each [12, 16, 24, 32] as px (px)}
              <div class="flex flex-col items-center gap-2">
                <Icon name="eye" size={px} />
                <code class="text-muted-foreground font-mono text-[11px]">size={px}</code>
              </div>
            {/each}
          </div>
          <a
            class="text-accent w-fit text-[13px] underline underline-offset-2"
            href="/docs/components/icon.html"
          >
            icon — the component page: playground, PropsTable, type-safety &amp; async paths →
          </a>
        </div>
      </SectionCard>
    </div>

    <div id="vocabulary" data-reveal="">
      <SectionCard
        family="vocabulary"
        headerRegion="vocabulary"
        eyebrow="named library"
        title="The named library — ICON_NAMES"
        summary="{ICON_NAMES.length} names, generated. This grid walks ICON_NAMES itself: a glyph added to the library config regenerates icon-set.gen.ts and appears here with ZERO page edit — the grid can never lie about the set. Every cell renders the real component (the same <Icon name> above); the label is the IconName you type."
      >
        <div class="flex flex-col gap-5">
          <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" data-named-icon-grid="">
            {#each ICON_NAMES as name (name)}
              <li
                class="border-border/60 bg-card/40 flex items-center gap-3 border px-3 py-2"
                data-icon-name={name}
              >
                <span class="text-foreground shrink-0"><Icon name={name} size={18} /></span>
                <span class="flex min-w-0 flex-col">
                  <code class="font-mono text-[12.5px] leading-5">{name}</code>
                  <code class="text-muted-foreground font-mono text-[10.5px] leading-4">{'<Icon name="' + name + '" />'}</code>
                </span>
              </li>
            {/each}
          </ul>
          <p class="text-muted-foreground text-[13px] leading-6">
            Generated by the root <code class="text-accent">gen:icons</code> script (the repo's
            single writer — the <code class="text-accent">verify:icons</code> gate fails the build
            the moment the committed artifact drifts from the library config), mirrored byte-identical
            into <code class="text-accent">$lib/icon-set.gen</code>. Names resolve synchronously
            through <code class="text-accent">getIcon()</code> in the inline core; the full union
            rides <code class="text-accent">IconName</code>, the iterable rides
            <code class="text-accent">ICON_NAMES</code>.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="plugin" data-reveal="" class="flex flex-col gap-8">
      <SectionCard
        family="plugin"
        headerRegion="plugin"
        eyebrow="plugin · library face"
        title="jixoai(&#123; icons: &#123; library &#125; &#125;) — the generator's knobs"
        summary="The library face answers what &lt;Icon name&gt; can render. Sources arrive five ways — an inline SVG literal, &#123; file &#125; (the plugin owns ALL file I/O), a lucide: ref resolved at build time so the emitted artifact carries zero lucide references, a preset ref (md:/ph:/rx:) resolving ONE icon from an installed library package, or a font file whose glyph outline is extracted at build time. Same-name entries OVERRIDE built-ins; every icon crosses the raw safety checker before svgo. Without the icons option the plugin never loads; provider and library are independent — either alone is legal."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={libraryConfig} lang="ts" meta="vite.config.ts" />
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-border">
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Option</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Default</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">What it does</th>
              </tr>
            </thead>
            <tbody>
              {#each libraryOptions as row (row.option)}
                <tr class="border-b border-border/50">
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">{row.option}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground whitespace-nowrap">{row.def}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[13px] text-muted-foreground">{row.what}</td>
                </tr>
              {/each}
            </tbody>
          </table>
          <p class="text-muted-foreground text-[13px] leading-6">
            <code class="text-accent">write</code> stays <code class="text-accent">false</code>
            everywhere in this repo: the vite adapter serves the lazy chunks as virtual modules
            (<code class="text-accent">virtual:jixoai-icons/chunk/K</code>) and drift-warns in dev —
            the root <code class="text-accent">gen:icons</code> script is the one writer of the
            canonical artifact (the single-writer law). Consumer apps may opt into
            <code class="text-accent">write: true</code> + their own
            <code class="text-accent">output</code> for dev ergonomics.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        family="plugin"
        region="presets"
        eyebrow="presets"
        title="Installed icon libraries, one ref each"
        summary="library.presets declares the icon libraries you have installed; each preset contributes a prefixed reference form that resolves exactly ONE icon at build time through the same safety→svgo→extract pipeline — no bulk bundling, per-icon nature detection. Every preset package is an optional peer: absent installs fail loudly with the npm install line, and referencing a prefix you have not enabled is a named startup error listing the enabled set."
      >
        <div class="flex flex-col gap-5" data-preset-table="">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-border">
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Preset</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Ref form</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Package (optional peer)</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">License</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Default mapping</th>
              </tr>
            </thead>
            <tbody>
              {#each presetRows as row (row.id)}
                <tr class="border-b border-border/50">
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">{row.id}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">{row.prefix}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground whitespace-nowrap">{row.pkg}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground whitespace-nowrap">{row.license}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[13px] text-muted-foreground">{row.mapping}</td>
                </tr>
              {/each}
            </tbody>
          </table>
          <CodeBlock code={presetConfig} lang="ts" meta="presets: ['material']" />
          <div class="border-border flex flex-col gap-2 border p-4" data-not-shipped-note="">
            <p class="font-nav text-[11px] uppercase tracking-[0.24em]">not shipped — and why</p>
            <p class="text-[13px] leading-6">
              <strong>tabler</strong> and <strong>hugeicons</strong> ship no per-icon SVG source
              package on npm (tabler's SVGs are repo-only; hugeicons is JS data, not files) — a
              preset needs a node-resolvable .svg per icon, so both are out until that changes.
            </p>
            <p class="text-[13px] leading-6">
              <strong>SF Symbols is rejected on licensing</strong>
              <span aria-hidden="true"> — </span>Apple's system-provided image terms restrict the
              glyphs to Apple-platform apps and prohibit SVG export or redistribution. Shipping a
              preset that extracts or redistributes them would breach those terms, so the pipeline
              deliberately offers no SF Symbols lane; use Apple's own APIs on Apple platforms.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        family="plugin"
        region="prefix-compiler"
        eyebrow="the prefix compiler"
        title="md:copy_all — scanned names, as aliases, three tiers of safety"
        summary="Enabling a preset turns on a source scanner: static name=&quot;md:…&quot; literals in your .svelte/.ts/.js/.html files enter the set with ZERO configuration. The scanner has two entries that always agree — an eager project walk at build start (and inside gen:icons, so the committed artifact and the dev server can never diverge) and a dev transform collector whose findings refresh the artifact like a config edit. Unknown prefixes (fa:) are ignored fail-safe: they fail at the TYPE level instead. A ref the preset cannot resolve fails the build by name — never a silently blank glyph."
      >
        <div class="flex flex-col gap-5" data-prefix-compiler-docs="">
          <CodeBlock code={prefixCompilerSnippet} lang="svelte" meta="App.svelte — no declarations" />
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-border">
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Tier</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">What it checks</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">How it fails</th>
              </tr>
            </thead>
            <tbody>
              {#each scanTiers as row (row.tier)}
                <tr class="border-b border-border/50">
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">{row.tier}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[13px] text-muted-foreground whitespace-nowrap">{row.what}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[13px] text-muted-foreground">{row.how}</td>
                </tr>
              {/each}
            </tbody>
          </table>
          <CodeBlock code={aliasArtifactSnippet} lang="ts" meta="the as form — dual keys, one payload" />
          <p class="text-muted-foreground text-[13px] leading-6">
            The <code class="text-accent">as</code> form declares a local alias: 双键并存 — both keys
            coexist forever, your sources are <strong>never rewritten</strong>, and the scanned keys
            ride alongside hand-written ones. The payload packs <strong>once</strong> under the
            canonical <code class="text-accent">md:copy_all</code> key; each alias costs exactly one
            ALIASES-table row in the budget, and ICON_NAMES emits it adjacent to its ref. Collisions
            fail the build by name: an alias shadowing a declared name, two refs claiming one alias,
            or an alias breaking the camelCase law. Dynamic composition
            (<code class="text-accent">{'name={`md:${iconKey}`}'}</code>) is intentionally unscanned
            — it rides the runtime lane above: getIcon() answers null, the component renders its
            reserved box, and loadIcon() explains both possible causes (artifact drift or a
            dynamic/never-scanned name).
          </p>
        </div>
      </SectionCard>

      <SectionCard
        family="plugin"
        region="font-sources"
        eyebrow="font sources"
        title="A font file is an icon source"
        summary="The missing lane from the original icon-direction brief, landed build-time-only: &#123; font, code &#125; extracts the codepoint's glyph outline and &#123; font, liga &#125; tries the ligature lookup (best-effort — opentype.js GSUB coverage is thin). The extracted outline normalizes through the exact contain-fit math the slot face's fontIconProvider uses, enters the artifact as fill-nature artwork, and the runtime stays pure SVG — SSR, print, no-JS and chunking guarantees unchanged."
      >
        <div class="flex flex-col gap-5" data-font-source-docs="">
          <CodeBlock code={fontSourceSnippet} lang="ts" meta="fonts → glyphs, at build time" />
          <p class="text-muted-foreground text-[13px] leading-6">
            The font file joins <code class="text-accent">watchFile</code> like any
            <code class="text-accent">&#123; file &#125;</code> source — an edit re-extracts on the
            next HMR refresh. Codepoint mapping is the primary lane; a ligature the parser cannot
            resolve fails by name, listing the font's resolvable ligatures when the parser exposes
            them (else the glyph-name/cmap hint) — never a silent blank glyph.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        family="plugin"
        region="tiers"
        eyebrow="install tiers"
        title="Two tiers — plugin-free by default"
        summary="The default tier installs and builds standalone: the committed artifact is the default-config output (38 built-ins, one inline chunk, ZERO lazy chunks), so the two registry items carry zero npm dependencies and zero virtual imports. The overflow tier kicks in the moment your config emits lazy chunks — and there the plugin becomes a documented PREREQUISITE, failing with one named build error instead of a silent 404."
      >
        <div class="flex flex-col gap-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="border-border flex flex-col gap-2 border p-4">
              <p class="font-nav text-[11px] uppercase tracking-[0.24em]">default — plugin-free</p>
              <p class="text-[13px] leading-6">
                <code class="text-accent">npx jixoai-ui add icon</code> (pulls
                <code class="text-accent">icon-set</code> + the theme) lands files that build with
                zero npm deps and zero virtual imports — every getIcon() call answers synchronously.
              </p>
            </div>
            <div class="border-primary/40 flex flex-col gap-2 border p-4">
              <p class="font-nav text-[11px] uppercase tracking-[0.24em]">overflow — plugin prerequisite</p>
              <p class="text-[13px] leading-6">
                Past the budget (big libraries, <code class="text-accent">inlineFirstChunk: false</code>)
                the artifact emits lazy imports of
                <code class="text-accent">virtual:jixoai-icons/chunk/*</code> — wiring
                <code class="text-accent">jixoai(&#123; icons: &#123; library &#125; &#125;)</code>
                from <code class="text-accent">@jixoai/vite-plugin</code> becomes REQUIRED.
              </p>
            </div>
          </div>
          <CodeBlock code={OVERFLOW_SENTINEL} lang="text" meta="the named build error (byte-exact — never paraphrase it)" />
          <p class="text-muted-foreground text-[13px] leading-6">
            The sentinel fires from the plugin's resolver when the plugin IS present but the library
            face is not configured, and again at runtime from the artifact's LAZY catch (with the
            original error as <code class="text-accent">cause</code>). Plugin absent entirely:
            vite's generic unresolved-import error is unavoidable — wire the plugin first.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        family="plugin"
        region="semantics"
        eyebrow="async semantics"
        title="Inline core, lazy overflow"
        summary="The default case is synchronous: chunk 0 rides inline in the artifact, so SSR paints core glyphs in the server HTML and hydration matches with zero wiring. Lazy chunks exist only past the budget — they load through cached promises into a FIXED reserved box whose pending and rejected markup are identical (hydration never rewrites it), and preloadIcons warms them ahead of a mount."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={asyncLaw} lang="text" meta="the chunk law" />
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-border">
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">chunking</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">inlineFirstChunk</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Layout</th>
                <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Artifact imports</th>
              </tr>
            </thead>
            <tbody>
              {#each modeMatrix as row (row.chunking + row.inline)}
                <tr class="border-b border-border/50">
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">{row.chunking}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground whitespace-nowrap">{row.inline}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[13px] text-muted-foreground">{row.layout}</td>
                  <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[13px] text-muted-foreground">{row.imports}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>

    <div id="css-slots" data-reveal="" class="flex flex-col gap-8">
      <SectionCard
        family="css-slots"
        headerRegion="css-slots"
        eyebrow="slot face"
        title="--jx-icon-* — the mask / currentColor law"
        summary="The second face paints its icons as CSS, no component: one alpha-only URI per glyph, declared on the vocabulary sheet (the encoded stroke is an ALPHA SOURCE ONLY). Author-painted rules theme through mask + background-color: currentColor; UA-shadow pseudos that reject author mask paint take the -ink variants, and .dark / .jx-light flip the whole set to white/black ink. The glyph column below consumes the vocabulary face itself — a slot that changes geometry changes here with zero edit."
      >
        <div class="flex flex-col gap-5">
          <IconTable rows={cssSlotRows} />
          <p class="text-muted-foreground text-[13px] leading-6">
            The <code class="text-accent">Overridable</code> column names the plugin CONCEPT slot:
            covering a concept re-bakes every variable it owns (the derived-ink law below). The
            <code class="text-accent">palette</code> variable exists only as an inline mask fallback
            (no :root line — the wrapper paints
            <code class="text-accent">var(--jx-icon-palette, …)</code>), so its glyph column mirrors
            that same embedding expression.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        family="css-slots"
        region="pipeline"
        eyebrow="plugin · slot face"
        title="The slot pipeline — providers and concept slots"
        summary="The same jixoai(&#123; icons &#125;) call opens a second, independent face: a provider answers every concept slot with structured artwork, the serializer is the only code that generates CSS, and the safety checker runs before serialization in both modes — no unvalidated SVG ever reaches output. Opt-in with one feature flag; without the icons option the plugin never loads."
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
            (and HMR watches) through a ProviderContext. <code class="text-accent">safety</code>
            defaults to <code class="text-accent">warn</code>: a rejected icon logs and serves the
            standard layer's inline fallback (warn means don't crash the build, NOT let unvalidated
            content through); pass <code class="text-accent">{`{ mode: 'error' }`}</code> — with
            optional <code class="text-accent">maxBytes</code> (10KB) /
            <code class="text-accent">maxPathCommands</code> (500) limits — to fail instead, e.g. for
            HTTP-sourced artwork.
          </p>
          <pre class="jx-derivation-diagram" aria-label="concept slot derivation diagram"><code>{derivationDiagram}</code></pre>
          <CodeBlock code={slotConfig} lang="ts" meta="vite.config.ts + app.css" />
          <p class="text-muted-foreground text-[13px] leading-6">
            <code class="text-accent">virtual:jixoai-icons</code> is the slot face's only injection
            path: the plugin serves it as a virtual CSS module
            (<code class="text-accent">@layer theme</code> custom properties) for your CSS entry.
            Watched sources invalidate the virtual module — HMR re-runs the provider with fresh
            bytes.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        family="css-slots"
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
          Dogfood: this very site runs BOTH faces through the
          <code class="text-accent">jixoai(&#123; icons &#125;)</code> pipeline — the slot face
          paints the default box on the left in production (the site's build smoke-asserts it renders
          byte-equal to the shipped sheet), and the library face generated the very
          <code class="text-accent">icon-set.gen</code> the grid above walks.
        </p>
      </SectionCard>
    </div>
  </div>
</div>

<style>
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

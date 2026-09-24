<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // ToC outline: the composition demo + the native base, in page order.

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import kbdSource from '$lib/ui/kbd/kbd.svelte?raw';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<Kbd>⌘</Kbd> + <Kbd>K</Kbd> opens the palette
<Kbd>Shift</Kbd> + <Kbd>?</Kbd> for shortcuts
<Kbd variant="fill">Enter</Kbd> commits · <Kbd variant="outline">Esc</Kbd> exits`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/kbd.svelte', content: kbdSource },
    { name: 'src/lib/ui/kbd-usage.svelte', content: usage },
  ];

  const close = '</' + 'script>';

  // shortcut rows demo, mirrored by hand for the drawer (the
  // same-source resolveRawCode migration is the recorded follow-up)
  const kbdShortcutRowsDemo = `<script lang="ts">
  import Kbd from '@ui/kbd.svelte';
${close}

<div class={cx(rt.col24)}>
  <div class={cx(rt.flex, rt.wFull, rt.maxWMd, rt.col, rt.gap4, rt.frame)}>
    <button
      type="button"
      class="flex items-center justify-between gap-4 border-b border-border px-3 py-2 text-left text-[13px] hover:bg-muted/50"
    >
      <span>open the command palette</span>
      <span class={cx(rt.flex, rt.gap4)}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
    </button>
    <button
      type="button"
      class="flex items-center justify-between gap-4 border-b border-border px-3 py-2 text-left text-[13px] hover:bg-muted/50"
    >
      <span>toggle the theme</span>
      <span class={cx(rt.flex, rt.gap4)}><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>L</Kbd></span>
    </button>
    <button
      type="button"
      class="flex items-center justify-between gap-4 px-3 py-2 text-left text-[13px] hover:bg-muted/50"
    >
      <span>close this surface</span>
      <Kbd>Esc</Kbd>
    </button>
  </div>
  <table class={cx(rt.wFull, rt.maxWMd, rt.text125)}>
    <caption class={cx(rt.srOnly)}>keyboard bindings and their glyphs</caption>
    <tbody>
      <tr class={cx(rt.tBorder)}>
        <th scope="row" class={cx(rt.bBorder, rt.px8, rt.py6, rt.textLeft, rt.weightNormal, rt.inkMuted)}>search</th>
        <td class={cx(rt.bBorder, rt.px8, rt.py6)}><span class={cx(rt.flex, rt.gap4)}><Kbd>/</Kbd></span></td>
      </tr>
      <tr class={cx(rt.tBorder)}>
        <th scope="row" class={cx(rt.bBorder, rt.px8, rt.py6, rt.textLeft, rt.weightNormal, rt.inkMuted)}>shortcut sheet</th>
        <td class={cx(rt.bBorder, rt.px8, rt.py6)}><span class={cx(rt.flex, rt.gap4)}><Kbd>Shift</Kbd><Kbd>?</Kbd></span></td>
      </tr>
      <tr class={cx(rt.tBorder)}>
        <th scope="row" class={cx(rt.px8, rt.py6, rt.textLeft, rt.weightNormal, rt.inkMuted)}>immediate exit</th>
        <td class={cx(rt.px8, rt.py6)}><Kbd>⌃</Kbd><Kbd>C</Kbd></td>
      </tr>
    </tbody>
  </table>
</div>`;

  const shortcutRowsFiles: TreeFile[] = [
    { name: 'kbd-shortcut-rows-demo.svelte', content: kbdShortcutRowsDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-B) --------------------
  const universalUsage = `<!-- the eight-axis surface on the glyph -->
<Kbd size={14} density="small">⌘</Kbd>
<Kbd size="large" radius="medium">K</Kbd>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/kbd-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 30) — every cell measured or
  // negative-grepped over ui/kbd/ (the family ships no css file at all:
  // stylex atoms + the promotion seam are the whole surface) ──
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED — the glyph's whole voice rides the SECONDARY kernel channels: measured across xs/default/lg — fontSize 10 / 12 / 14px, line-height 13.5 / 18 / 21px, inline padding 8 / 12 / 16px (--jx-gap). The family own is none: no opinion stamps nothing and the ambient scope channel flows (measured data-density null under ambient scope boxes). Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "OWN VOICE, NOT INHERITANCE (the stale-caption falsification): the old page text claimed the chip 'inherits font-size from context — shrinks in table cells and grows in heroes'. Measured FALSE: the kbd renders 12px inside a 13.5px prose context and inside a 13px table row alike — the fontSize atom pins --jx-text-secondary (the density kernel), so the §11 stamp moves the root and the glyph's voice stays put. Context never scales it. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps the carriers; zero readers (grep receipt: the family ships no css file; the atoms read no shape channel). Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'OWN 2px CORNER (measured borderRadius: 2px at every lane) — the corner rides the promotion seam var(--kbd-radius, 2px), NOT the axis carrier; an explicit radius lane supplies through the carriers for composed descendants only. Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the axis carrier is unread (grep receipt). Semantic hue injects from OUTSIDE via jx-hue-* utilities (the tonal ladder re-tints because its mix reads --jx-tonal → primary); never as a variant name. Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE BRIDGE, RE-DERIVING — measured under a scoped .dark: the tonal ladder FLIPS with the scope (background mix 0.6489-family → 0.7044-family, ink follows the scope's primary) because the tonal voices read the --jx-tonal → primary STREAM, which re-resolves per element — unlike the frozen-pole families whose typed tokens carry literal values. The engrave shadow keeps its literal inset pair. system/auto ride tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "OWN ENGRAVE TIER, AXIS UNREAD — the glyph's shadow is the elevation grammar's ENGRAVE token (--jx-shadow-engrave, the measured inset pair), not an axis lane; the --jx-elevation-effective carrier is unread (grep receipt). A glyph incised into the plane, not lifted off it. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-motion-effective; zero readers and ZERO transition declarations in the family (grep receipt: the static glyph has nothing to animate). Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 14);

  const queryUsage = `<script lang="ts">
  import Kbd from '@ui/kbd.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (14px) applies; at 48rem+ the md case (18px)
     wins — the §11 echo the root stamps (the glyph's own voice stays
     the secondary kernel channel) -->
<Kbd size={query({ md: 18 }, 14)}>⌘</Kbd>`;

  const queryFiles: TreeFile[] = [
    { name: 'kbd-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Kbd · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai kbd: the native keyboard-input glyph on the variant ladder — tonal (primary) by default, fill and outline beside it — no key parsing, no platform detection, compose by hand."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="kbd — the element, chipped"
        summary="A native <kbd> — the element whose entire meaning is 'this is keyboard input' — on the grammar's variant ladder: tonal (12%/45% primary tint) by default, fill and outline beside it, over the engraved geometry (1px border + the --shadow-engrave inset, mono). Deliberately no key-parsing and no platform detection (⌘/Ctrl string opinions belong to the caller); keys compose by hand."
      >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install kbd">
          <TerminalCard
            barTitle="install — kbd"
            command="npx jixoai-ui add kbd"
            outputs={['https://ui.jixoai.com/r/kbd.json']}
          />
        </div>
      {/snippet}

        <div class={cx(rt.wrap12)}>
          <span class="pill">native &lt;kbd&gt;</span>
          <span class="pill">zero parsing</span>
          <span class="pill">variant ladder · tonal default</span>
        </div>
      </SectionCard>
    </div>

    <!-- ② install (the archetype's install anchor) -->

    <!-- ③ overview (docs-eight-axes-mdn task 30, tier 2) -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="The native <kbd> element, chipped: zero parsing opinions, an own engraved voice, and a paint ladder that re-derives with the scope."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            The semantics are the platform's: a native
            <code class={cx(rt.inkPrimary)}>&lt;kbd&gt;</code> means "keyboard input" to assistive
            tech with zero added ARIA — combinations compose by hand
            (<code class={cx(rt.inkPrimary)}>&lt;kbd&gt;⌘&lt;/kbd&gt; + &lt;kbd&gt;K&lt;/kbd&gt;</code>),
            and the + separators are prose. The family deliberately ships NO key-parsing and NO
            platform detection (⌘/Ctrl string opinions belong to the caller); title and data-*
            flow through rest props.
          </p>
          <p class={cx(rt.para)}>
            The voice is the family's OWN, not the context's — measured 12px inside a 13.5px
            prose run and a 13px table row alike, because the atom pins the
            <code class={cx(rt.inkPrimary)}>--jx-text-secondary</code> density kernel (the stale
            "inherits font-size" caption is falsified and corrected in the axes table). The
            geometry is the engraving: 1px hairline frame, the own 2px corner (promotion seam),
            and the <code class={cx(rt.inkPrimary)}>--shadow-engrave</code> inset pair — a glyph
            incised into the plane, not lifted off it. Density is the live ladder (10/12/14px
            voice, 8/12/16px padding measured).
          </p>
          <p class={cx(rt.para)}>
            The ladder is tonal (primary tint) by default, fill and outline beside it — a rung is
            the SOLE border-color source, and semantic hue injects from outside via jx-hue-*
            utilities, never as a variant name. Under a scoped .dark the tonal voices re-derive
            with the scope's primary (the token stream resolves per element — measured), while
            the engrave keeps its literal inset pair. Kinship:
            <code class={cx(rt.inkPrimary)}>chip</code> and
            <code class={cx(rt.inkPrimary)}>press-button</code> (the byte-aligned variant map).
          </p>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
    <ComponentCanvas
      title="kbd"
      stage="center"
      description="Shortcut rows in prose, tables, menus — the glyph carries its OWN voice: the --jx-text-secondary kernel (12px at the default rung), density-governed, not inherited from the context."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/kbd.svelte"
        files={canvasFiles}
      >
        <div class={cx(rt.col12, rt.text135)}>
          <p><Kbd>⌘</Kbd> + <Kbd>K</Kbd> opens the palette</p>
          <p><Kbd>Shift</Kbd> + <Kbd>?</Kbd> for shortcuts</p>
          <p class={cx(rt.inkMuted)}>
            <Kbd>Esc</Kbd> closes any surface on this site — dialogs, menus, sheets share the law.
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              any kbd attribute passes through (title, data-*); the chip carries its OWN
              density-kernel voice (--jx-text-secondary) — 12px in the 13.5px prose context and
              the 13px menu button alike, so the context never resizes it. Static glyph, so the
              playground stays a reading pane.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="shortcut-rows" data-reveal="">
      <SectionCard
        family="shortcut-rows"
        headerRegion="shortcut-rows"
        eyebrow="demo"
        title="Shortcut rows"
        summary="The glyph's natural habitats: menu items that hint their accelerator, tables of bindings, and prose. Every instance below is the same component voicing its own density-kernel tone — the context does not resize it (the falsified-inheritance note in the axes table is the receipt)."
      >
        <ComponentCanvas title="kbd · shortcut rows" stage="fill" files={shortcutRowsFiles}>
          <div class={cx(rt.col24)}>
          <div class={cx(rt.flex, rt.wFull, rt.maxWMd, rt.col, rt.gap4, rt.frame)}>
            <button
              type="button"
              class={cx(rt.kbRow, rt.bBorder)}
            >
              <span>open the command palette</span>
              <span class={cx(rt.flex, rt.gap4)}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
            </button>
            <button
              type="button"
              class={cx(rt.kbRow, rt.bBorder)}
            >
              <span>toggle the theme</span>
              <span class={cx(rt.flex, rt.gap4)}><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>L</Kbd></span>
            </button>
            <button
              type="button"
              class={cx(rt.kbRow)}
            >
              <span>close this surface</span>
              <Kbd>Esc</Kbd>
            </button>
          </div>
          <table class={cx(rt.wFull, rt.maxWMd, rt.text125)}>
            <caption class={cx(rt.srOnly)}>keyboard bindings and their glyphs</caption>
            <tbody>
              <tr class={cx(rt.tBorder)}>
                <th scope="row" class={cx(rt.bBorder, rt.px8, rt.py6, rt.textLeft, rt.weightNormal, rt.inkMuted)}>search</th>
                <td class={cx(rt.bBorder, rt.px8, rt.py6)}><span class={cx(rt.flex, rt.gap4)}><Kbd>/</Kbd></span></td>
              </tr>
              <tr class={cx(rt.tBorder)}>
                <th scope="row" class={cx(rt.bBorder, rt.px8, rt.py6, rt.textLeft, rt.weightNormal, rt.inkMuted)}>shortcut sheet</th>
                <td class={cx(rt.bBorder, rt.px8, rt.py6)}><span class={cx(rt.flex, rt.gap4)}><Kbd>Shift</Kbd><Kbd>?</Kbd></span></td>
              </tr>
              <tr class={cx(rt.tBorder)}>
                <th scope="row" class={cx(rt.px8, rt.py6, rt.textLeft, rt.weightNormal, rt.inkMuted)}>immediate exit</th>
                <td class={cx(rt.px8, rt.py6)}><Kbd>⌃</Kbd><Kbd>C</Kbd></td>
              </tr>
            </tbody>
          </table>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Keyboard glyphs" summary="Kbd is a native semantic element; compose one key or a chord from several instances."><div class={cx(rt.col12)}><div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gap8)}><Kbd>⌘</Kbd><span>+</span><Kbd>K</Kbd><span class={cx(rt.inkMuted)}>or</span><Kbd>Shift</Kbd><Kbd>?</Kbd></div><div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gap8, rt.text125)}><span class={cx(rt.kbW14, rt.flexNone, rt.inkMuted)}>tonal</span><Kbd>⌘</Kbd><Kbd>K</Kbd><span class={cx(rt.kbW14, rt.flexNone, rt.inkMuted)}>outline</span><Kbd variant="outline">Shift</Kbd><Kbd variant="outline">?</Kbd><span class={cx(rt.kbW14, rt.flexNone, rt.inkMuted)}>fill</span><Kbd variant="fill">Enter</Kbd></div></div></SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage" summary="The platform gives the semantics: <kbd> means keyboard input to assistive tech with zero ARIA. We add only the ladder paint — 1px border, the engrave inset, mono — and nothing else."><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Kbd>K</Kbd></DensityDemo><div class={cx(rt.mt20)}><TokenTable tokens={[{ name: '--jx-tonal', default: 'var(--primary)', source: 'component' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
      <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Kbd props" summary="The generated meta carries 13 props (12 named + the synthesized rest); the hand table's density row folds into the shared universal section beneath (its text is the frozen ambient-scope vocabulary, pinned by the ambient matrix, task 30) — variant and class render here; the family-specific density MEASUREMENTS live in the axes table."><PropsTable universal props={[{ name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows. The channels it drives are measured in the axes table (10/12/14px voice, 8/12/16px padding at xs/default/lg).' }, { name: 'variant', type: "'fill' | 'tonal' | 'outline'", default: "'tonal' · Own default, not ambient", description: 'Paint-ladder rung; tonal (primary) is the default. Own default, not ambient (the glyph is outside the paint zone’s frozen availability table). Semantic hue injects via jx-hue-* classes, never as a variant name.' }, { name: 'class', type: 'string', description: 'Adds consumer classes.' }]} /></SectionCard></div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on kbd"
      summary="Density is the one consumed ladder — the glyph's whole voice rides the SECONDARY kernel channels (measured 10/12/14px, 8/12/16px padding). Size is the §11 echo with a built-in falsification: the kbd renders 12px inside any context (the stale inheritance caption corrected here). The corner is the own 2px promotion seam; the shadow the own engrave tier; shape/color/elevation/motion stamp-and-supply; the tonal ladder is the RE-DERIVING theme voice (flips with the scope's primary, measured)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the density ladder (voice/line/padding), the own-voice
          falsification (12px in 13.5px and 13px contexts), the 2px corner and
          the scoped-.dark re-derivation were measured on this page's served
          DOM (probe, task 30); the supply-only rows carry grep receipts over
          ui/kbd/ (a family with NO css file — atoms + the promotion seam are
          the whole surface). The universal demo folds in below, with a
          query() seat: the size lane rides the md viewport key (48rem).
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="kbd · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Kbd size={responsiveSize}>⌘</Kbd>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — the
                root stamp reads 14px; at 48rem and wider the md case wins —
                18px. The number lane goes bare (results infer); string lanes
                take both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
      <ComponentCanvas title="Kbd · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><Kbd size={14} density="small">⌘</Kbd> <Kbd size={14} density="small">K</Kbd></div>
        <div class={cx(rt.panel)}><Kbd size="large" radius="medium" density="large">shift</Kbd></div>
        <div class={cx(rt.panel)}><Kbd shape="squircle" radius={6}>squircle</Kbd></div>
        <div class={cx(rt.panel)}><Kbd radius="auto">auto</Kbd></div>
        </div>
      </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility" summary="The semantics are the element's own: a native kbd announces keyboard input with zero added ARIA — the cost of compose-by-hand is that each key is its own announcement."><A11yTable keys={[{ key: '—', action: 'Non-interactive by contract — a glyph, never a control; it takes no focus and no keys' }]} aria={[{ name: 'kbd', value: 'native element', description: 'Communicates keyboard input to assistive tech with zero added ARIA — no role, no state.' }, { name: 'combination reading', value: 'key + key (prose)', description: 'Each key is its own kbd and the + is literal text — screen readers announce the keys as text in reading order; the separator is the author\u2019s word.' }, { name: 'rest props', value: 'title / data-* / global ARIA', description: 'Flow through to the element verbatim — a title tooltip or an aria-label override is the consumer\u2019s call.' }]} /></SectionCard></div>
      <!-- see-also -->
    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="kbd" />
    </div>
  </div>
</div>

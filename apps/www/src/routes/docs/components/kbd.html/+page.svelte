<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
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
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
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
        <div class={cx(rt.wrap12)}>
          <span class="pill">native &lt;kbd&gt;</span>
          <span class="pill">zero parsing</span>
          <span class="pill">variant ladder · tonal default</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
    <ComponentCanvas
      title="kbd"
      stage="center"
      description="Shortcut rows in prose, tables, menus — the glyph reads at body size (0.75em, inherits the context)."
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
              any kbd attribute passes through (title, data-*); the chip inherits font-size from
              context — it shrinks in table cells and grows in heroes. Static glyph, so the
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
        summary="The glyph's natural habitats: menu items that hint their accelerator, tables of bindings, and prose. Every instance below is the same component reading its size from the context."
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
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'kbd', value: 'native element', description: 'Communicates keyboard input without extra ARIA.' }]} /></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Kbd>K</Kbd></DensityDemo><div class={cx(rt.mt20)}><TokenTable tokens={[{ name: '--jx-tonal', default: 'var(--primary)', source: 'variant grammar' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
    <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The engraved glyph keeps its own 2px corner; an explicit radius lane supplies through the carriers for descendants."
    >
      <ComponentCanvas title="Kbd · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><Kbd size={14} density="small">⌘</Kbd> <Kbd size={14} density="small">K</Kbd></div>
        <div class={cx(rt.panel)}><Kbd size="large" radius="medium" density="large">shift</Kbd></div>
        <div class={cx(rt.panel)}><Kbd shape="squircle" radius={6}>squircle</Kbd></div>
        <div class={cx(rt.panel)}><Kbd radius="auto">auto</Kbd></div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Kbd props"><PropsTable props={[{ name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }, { name: 'variant', type: "'fill' | 'tonal' | 'outline'", default: "'tonal' · Own default, not ambient", description: 'Paint-ladder rung; tonal (primary) is the default. Own default, not ambient (the glyph is outside the paint zone\'s frozen availability table). Semantic hue injects via jx-hue-* classes, never as a variant name.' }, { name: 'class', type: 'string', description: 'Adds consumer classes.' }]} /></SectionCard></div>
  </div>
</div>

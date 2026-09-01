<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
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
</script>

<svelte:head>
  <title>Kbd · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai kbd: the native keyboard-input glyph on the variant ladder — tonal (primary) by default, fill and outline beside it — no key parsing, no platform detection, compose by hand."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="kbd — the element, chipped"
        summary="A native <kbd> — the element whose entire meaning is 'this is keyboard input' — on the grammar's variant ladder: tonal (12%/45% primary tint) by default, fill and outline beside it, over the engraved geometry (1px border + the --shadow-engrave inset, mono). Deliberately no key-parsing and no platform detection (⌘/Ctrl string opinions belong to the caller); keys compose by hand."
      >
        <div class="flex flex-wrap gap-3">
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
        <div class="flex flex-col gap-3 text-[13.5px]">
          <p><Kbd>⌘</Kbd> + <Kbd>K</Kbd> opens the palette</p>
          <p><Kbd>Shift</Kbd> + <Kbd>?</Kbd> for shortcuts</p>
          <p class="text-muted-foreground">
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
        <div class="flex flex-col gap-6">
          <div class="flex w-full max-w-md flex-col gap-1 border border-border">
            <button
              type="button"
              class="flex items-center justify-between gap-4 border-b border-border px-3 py-2 text-left text-[13px] hover:bg-muted/50"
            >
              <span>open the command palette</span>
              <span class="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
            </button>
            <button
              type="button"
              class="flex items-center justify-between gap-4 border-b border-border px-3 py-2 text-left text-[13px] hover:bg-muted/50"
            >
              <span>toggle the theme</span>
              <span class="flex gap-1"><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>L</Kbd></span>
            </button>
            <button
              type="button"
              class="flex items-center justify-between gap-4 px-3 py-2 text-left text-[13px] hover:bg-muted/50"
            >
              <span>close this surface</span>
              <Kbd>Esc</Kbd>
            </button>
          </div>
          <table class="w-full max-w-md text-[12.5px]">
            <caption class="sr-only">keyboard bindings and their glyphs</caption>
            <tbody>
              <tr class="border-t border-border">
                <th scope="row" class="border-b border-border px-2 py-1.5 text-left font-normal text-muted-foreground">search</th>
                <td class="border-b border-border px-2 py-1.5"><span class="flex gap-1"><Kbd>/</Kbd></span></td>
              </tr>
              <tr class="border-t border-border">
                <th scope="row" class="border-b border-border px-2 py-1.5 text-left font-normal text-muted-foreground">shortcut sheet</th>
                <td class="border-b border-border px-2 py-1.5"><span class="flex gap-1"><Kbd>Shift</Kbd><Kbd>?</Kbd></span></td>
              </tr>
              <tr class="border-t border-border">
                <th scope="row" class="px-2 py-1.5 text-left font-normal text-muted-foreground">immediate exit</th>
                <td class="px-2 py-1.5"><Kbd>⌃</Kbd><Kbd>C</Kbd></td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>

    <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Keyboard glyphs" summary="Kbd is a native semantic element; compose one key or a chord from several instances."><div class="flex flex-col gap-3"><div class="flex flex-wrap items-center gap-2"><Kbd>⌘</Kbd><span>+</span><Kbd>K</Kbd><span class="text-muted-foreground">or</span><Kbd>Shift</Kbd><Kbd>?</Kbd></div><div class="flex flex-wrap items-center gap-2 text-[12.5px]"><span class="w-14 flex-none text-muted-foreground">tonal</span><Kbd>⌘</Kbd><Kbd>K</Kbd><span class="w-14 flex-none text-muted-foreground">outline</span><Kbd variant="outline">Shift</Kbd><Kbd variant="outline">?</Kbd><span class="w-14 flex-none text-muted-foreground">fill</span><Kbd variant="fill">Enter</Kbd></div></div></SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage" summary="The platform gives the semantics: <kbd> means keyboard input to assistive tech with zero ARIA. We add only the ladder paint — 1px border, the engrave inset, mono — and nothing else."><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'kbd', value: 'native element', description: 'Communicates keyboard input without extra ARIA.' }]} /></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Kbd>K</Kbd></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-tonal', default: 'var(--primary)', source: 'variant grammar' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
    <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Kbd props"><PropsTable props={[{ name: 'density', type: 'Density', description: 'Overrides inherited density.' }, { name: 'variant', type: "'fill' | 'tonal' | 'outline'", description: 'Paint-ladder rung; tonal (primary) is the default. Semantic hue injects via jx-hue-* classes, never as a variant name.' }, { name: 'class', type: 'string', description: 'Adds consumer classes.' }]} /></SectionCard></div>
  </div>
</div>

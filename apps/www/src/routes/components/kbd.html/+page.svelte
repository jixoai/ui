<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Kbd from '$lib/ui/kbd.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';

  // ToC outline: the composition demo + the native base, in page order.

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import kbdSource from '$lib/ui/kbd.svelte?raw';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<Kbd>⌘</Kbd> + <Kbd>K</Kbd> opens the palette
<Kbd>Shift</Kbd> + <Kbd>?</Kbd> for shortcuts`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/kbd.svelte', content: kbdSource },
    { name: 'src/lib/ui/kbd-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Kbd · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai kbd: the native keyboard-input glyph with the jixoai chip paint — no key parsing, no platform detection, compose by hand."
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
        summary="A native <kbd> — the element whose entire meaning is 'this is keyboard input' — with the jixoai chip paint: 1px border, shadow-2xs lift, mono. Deliberately no key-parsing and no platform detection (⌘/Ctrl string opinions belong to the caller); keys compose by hand."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;kbd&gt;</span>
          <span class="pill">zero parsing</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="kbd"
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
          <div class="jx-play-fields">
            <p class="jx-play-help">
              any kbd attribute passes through (title, data-*); the chip inherits font-size from
              context — it shrinks in table cells and grows in heroes. Static glyph, so the
              playground stays a reading pane.
            </p>
          </div>
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

    <div id="kbd-base" data-reveal="">
      <SectionCard
        family="kbd-base"
        headerRegion="kbd-base"
        eyebrow="NativeHTML 基座"
        title="Usage"
        summary="The platform gives the semantics: <kbd> means keyboard input to assistive tech with zero ARIA. We add only the chip paint — 1px border, shadow-2xs, mono — and nothing else."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>

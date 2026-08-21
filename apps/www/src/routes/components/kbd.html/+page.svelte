<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Kbd from '$lib/ui/kbd.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import kbdSource from '$lib/ui/kbd.svelte?raw';

  const usage = `<Kbd>⌘</Kbd> + <Kbd>K</Kbd> opens the palette
<Kbd>Shift</Kbd> + <Kbd>?</Kbd> for shortcuts`;

  const canvasUsage = `<p><Kbd>⌘</Kbd> + <Kbd>K</Kbd> opens the palette</p>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/kbd.svelte', content: kbdSource },
    { name: 'src/lib/ui/kbd-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Kbd · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai kbd: the native keyboard-input glyph with the jixoai chip paint — no key parsing, no platform detection, compose by hand."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="kbd — the element, chipped"
      summary="A native <kbd> — the element whose entire meaning is 'this is keyboard input' — with the jixoai chip paint: 1px border, shadow-2xs lift, mono. Deliberately no key-parsing and no platform detection (⌘/Ctrl string opinions belong to the caller); keys compose by hand."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">native &lt;kbd&gt;</span>
        <span class="pill">zero parsing</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
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
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          any kbd attribute passes through (title, data-*); the chip inherits font-size from
          context — it shrinks in table cells and grows in heroes.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="kbd-base" eyebrow="NativeHTML 基座" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>

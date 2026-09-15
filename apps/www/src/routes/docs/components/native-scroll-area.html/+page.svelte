<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import NativeScrollArea from '$lib/ui/native-scroll-area/native-scroll-area.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import nativeScrollAreaSource from '$lib/ui/native-scroll-area/native-scroll-area.svelte?raw';
  import nativeScrollAreaCssSource from '$lib/ui/native-scroll-area/native-scroll-area.css?raw';
  import capabilitySource from '$lib/scroll-area-kit/native-capability.css?raw';

  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ---- canvas playground (the standard opening) ---------------------------
  type OrientationOpt = 'vertical' | 'horizontal';
  type WidthOpt = 'auto' | 'thin' | 'none';
  const canvasInitial = {
    orientation: 'vertical' as OrientationOpt,
    width: 'thin' as WidthOpt,
  };
  let canvasOrientation = $state(canvasInitial.orientation);
  let canvasWidth = $state(canvasInitial.width);

  function resetNativeCanvas(): void {
    canvasOrientation = canvasInitial.orientation;
    canvasWidth = canvasInitial.width;
  }

  const canvasUsage = $derived(
    [
      '<NativeScrollArea',
      '  label="config demo"',
      `  orientation="${canvasOrientation}"`,
      `  scrollbarWidth="${canvasWidth}"`,
      '  class="h-40"',
      '>',
      '  …scrolling content…',
      '</NativeScrollArea>',
    ]
      .flat()
      .join('\n'),
  );

  const resolveNativeUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/native-scroll-area/native-scroll-area.svelte', content: nativeScrollAreaSource },
    { name: 'registry/files/ui/native-scroll-area/native-scroll-area.css', content: nativeScrollAreaCssSource },
    { name: 'registry/files/lib/scroll-area-kit/native-capability.css', content: capabilitySource },
    // initial snapshot only — resolveNativeUsage serves the live state
    { name: 'src/lib/ui/native-scroll-area-usage.svelte', content: canvasUsage },
  ];

  // ---- usage snippets ----
  const close = '</' + 'script>';
  const basicUsage = `<script lang="ts">
  import NativeScrollArea from '@ui/native-scroll-area.svelte';
${close}

<!-- the platform scrollbar under the theme's scrollbar-token law -->
<NativeScrollArea class="h-72" label="release notes">
  {#each notes as note (note.id)}
    <article>…</article>
  {/each}
</NativeScrollArea>`;

  const tierUsage = `<!-- the width tiers: thin (default, the theme law) | auto | none -->
<NativeScrollArea scrollbarWidth="none" class="h-56" label="clip lane">
  <!-- still fully scrollable — keyboard, wheel, touch — just no visible bar -->
</NativeScrollArea>`;

  const kitUsage = `import { resolveThemeScope } from '@lib/scroll-area-kit/core';
import '$lib/scroll-area-kit/native-capability.css';

// the capability styles are a kit part consumed ONLY by this sibling;
// the styled component (scroll-area) consumes the hand-drawn adapter
// instead — the siblings share the core, never each other's halves.`;
</script>

<svelte:head>
  <title>Native scroll area · jixoai-ui</title>
  <meta
    name="description"
    content="The scroll-area family's platform sibling: zero drawn chrome — the platform scrollbar under the scrollbar-token law with the packaged capability styles (stable gutter, stage-scoped color-scheme, width tiers, overscroll containment). No custom scrollbar ARIA: the platform bar IS the accessibility contract."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · scroll-area family"
      title="native-scroll-area — the platform path, packaged best practices"
      summary="The 2026-09-15 family rework (Owner ruling): the styled component hand-draws always; this sibling ships the platform scrollbar under the site's scrollbar-token law — zero drawn chrome, zero custom scrollbar ARIA (the platform bar IS the accessibility contract) — with the native best practices packaged as capability styles from the shared scroll-area-kit kernel."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">zero drawn chrome</span>
        <span class="pill">stable gutter</span>
        <span class="pill">stage-scoped color-scheme</span>
        <span class="pill">scrollbar-width tiers</span>
        <span class="pill">overscroll containment</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas: the standard opening — live demo + PLAYGROUND -->
  <div data-reveal="">
    <ComponentCanvas
      title="native-scroll-area"
      description="the platform scrollbar, the theme's currentColor token law, and the packaged capability styles — flip the stage theme in the dock head and watch the bar follow the stage scope, not just the OS."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/native-scroll-area/native-scroll-area.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetNativeCanvas}
      output={[
        { label: 'orientation', value: canvasOrientation },
        { label: 'scrollbarWidth', value: canvasWidth },
      ]}
      resolveFileContent={resolveNativeUsage}
    >
      <div class="flex w-full max-w-md flex-col gap-3">
        <NativeScrollArea
          label="config demo"
          orientation={canvasOrientation}
          scrollbarWidth={canvasWidth}
          class="h-40"
        >
          <ol class="flex flex-col gap-2">
            {#each Array(12) as _, i (i)}
              <li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">
                item {i + 1} — the platform bar, themed by tokens
              </li>
            {/each}
          </ol>
        </NativeScrollArea>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="orientation">
            <PlaySegmented
              bind:value={canvasOrientation}
              options={[
                { value: 'vertical', label: 'vertical' },
                { value: 'horizontal', label: 'horizontal' },
              ]}
            />
          </PlayRow>
          <PlayRow label="scrollbarWidth">
            <PlaySegmented
              bind:value={canvasWidth}
              options={[
                { value: 'thin', label: 'thin' },
                { value: 'auto', label: 'auto' },
                { value: 'none', label: 'none' },
              ]}
            />
          </PlayRow>
          <PlayHelp>
            the width tiers dial the platform bar only — thin is the theme's global law,
            auto restores the platform-wide bar, none hides it (content still scrolls).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="capabilities" data-reveal="">
    <SectionCard
      family="capabilities"
      headerRegion="capabilities"
      eyebrow="capabilities"
      title="The packaged best practices"
      summary="Four capabilities ship as the kit's native-capability.css — consumed by this sibling only."
    >
      <div class="flex flex-col gap-3">
        <ComponentCanvas
          title="native-scroll-area · capability law"
          stage="fill"
          files={[{ name: 'registry/files/lib/scroll-area-kit/native-capability.css', content: capabilitySource }]}
        >
          <div class="grid gap-4 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-3 border border-border p-4">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">scrollbar-gutter: stable</span>
              <p class="m-0 text-[12.5px] leading-6 text-muted-foreground">
                overflow arriving never shifts layout — the gutter is reserved on vertical-capable
                axes (a horizontal-only port never grows a block-axis bar; stable would reserve
                dead space forever, the scrollbar law's carve-out).
              </p>
              <NativeScrollArea class="h-36" label="gutter demo">
                <ol class="flex flex-col gap-2">
                  {#each Array(10) as _, i (i)}<li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">row {i + 1}</li>{/each}
                </ol>
              </NativeScrollArea>
            </div>
            <div class="flex flex-col gap-3 border border-border p-4">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">scoped color-scheme</span>
              <p class="m-0 text-[12.5px] leading-6 text-muted-foreground">
                the bar follows the STAGE scope, not just the OS: the nearest
                <code class="text-accent">[data-theme]</code>/<code class="text-accent">.dark</code>/<code class="text-accent">.jx-light</code>
                resolves live (a class+attribute observer on the ancestor chain) — flip the stage theme
                in this canvas's dock head and the bar re-schemes without a re-mount.
              </p>
              <NativeScrollArea class="h-36" label="scheme demo">
                <ol class="flex flex-col gap-2">
                  {#each Array(10) as _, i (i)}<li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">row {i + 1}</li>{/each}
                </ol>
              </NativeScrollArea>
            </div>
            <div class="flex flex-col gap-3 border border-border p-4">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">scrollbar-width tiers</span>
              <p class="m-0 text-[12.5px] leading-6 text-muted-foreground">
                <code class="text-accent">auto | thin | none</code> — thin is the theme's global law
                (the default, no channel at all); the tiers are the consumer's dial.
              </p>
              <div class="grid grid-cols-3 gap-2">
                <NativeScrollArea scrollbarWidth="auto" class="h-28" label="auto tier"><div class="w-40 whitespace-nowrap py-1 text-[12px]">{#each Array(6) as _, i (i)}<p class="m-0 py-0.5">row {i + 1}</p>{/each}</div></NativeScrollArea>
                <NativeScrollArea scrollbarWidth="thin" class="h-28" label="thin tier"><div class="w-40 whitespace-nowrap py-1 text-[12px]">{#each Array(6) as _, i (i)}<p class="m-0 py-0.5">row {i + 1}</p>{/each}</div></NativeScrollArea>
                <NativeScrollArea scrollbarWidth="none" class="h-28" label="none tier"><div class="w-40 whitespace-nowrap py-1 text-[12px]">{#each Array(6) as _, i (i)}<p class="m-0 py-0.5">row {i + 1}</p>{/each}</div></NativeScrollArea>
              </div>
            </div>
            <div class="flex flex-col gap-3 border border-border p-4">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">overscroll containment</span>
              <p class="m-0 text-[12.5px] leading-6 text-muted-foreground">
                a boxed region's momentum stops at its edge —
                <code class="text-accent">overscroll-behavior: contain</code>, the family's standing
                posture; the scroll chaining stays inside by explicit choice.
              </p>
              <NativeScrollArea class="h-28" label="containment demo">
                <div class="w-40 whitespace-nowrap py-1 text-[12px]">{#each Array(6) as _, i (i)}<p class="m-0 py-0.5">row {i + 1}</p>{/each}</div>
              </NativeScrollArea>
            </div>
          </div>
        </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Give it a height and a label; the platform does the rest under the token law."><div class="flex flex-col gap-4"><CodeBlock code={basicUsage} lang="svelte" meta="basic" /><CodeBlock code={tierUsage} lang="svelte" meta="width tiers" /><CodeBlock code={kitUsage} lang="ts" meta="kit boundary" /></div></SectionCard></div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The platform scrollbar IS the accessibility contract — no custom scrollbar ARIA mounts anywhere inside (probe-asserted absent)."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus onto the scrollable region' }, { key: '↑ ↓ ← → / Home / End / PgUp / PgDn', action: 'Native scrollport scrolling once the region is focused' }, { key: 'platform bar', action: 'The OS scrollbar remains directly operable — dragging, clicking, its own keyboard path' }]} aria={[{ name: 'aria-label', value: 'label prop', description: 'Accessible name for the region (default "scrollable content")' }, { name: 'role', value: 'region', description: 'Plus tabindex=0 — the WAI scrollable-region pattern; the ONLY a11y surface here' }, { name: 'role="scrollbar"', value: 'ABSENT', description: 'No drawn thumb exists — a scrollbar role on a nonexistent thumb would be a violation, not a feature (the Gate-1 r1 ruling; probe-asserted)' }]} /></SectionCard></div>

  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The theme's global scrollbar-token law paints the bar (currentColor family); the scoped scheme follows the stage."><div class="flex flex-col gap-6"><DensityDemo><NativeScrollArea class="h-36" label="density sample"><ol class="flex flex-col gap-2">{#each Array(10) as _, i (i)}<li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">item {i + 1}</li>{/each}</ol></NativeScrollArea></DensityDemo><TokenTable tokens={[{ name: '--scrollbar-thumb / -hover / -active', default: 'currentColor steps', source: 'theme', description: 'The global token law — this component never overrides scrollbar-color' }, { name: 'color-scheme', default: 'stage-scoped', source: 'component', description: 'data-scheme resolved from the nearest theme scope; absent = the OS answers' }] } /></div></SectionCard></div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the NativeScrollArea Props interface; getViewport()/scrollTo() are the imperative exports."><PropsTable props={[{ name: 'orientation', type: "'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'Which axes scroll: overflow-y/x mapping.' }, { name: 'scrollbarWidth', type: "'auto' | 'thin' | 'none'", default: "'thin'", description: 'The scrollbar-width tier — thin rides the theme\u2019s global law (no channel at all).' }, { name: 'label', type: 'string', default: "'scrollable content'", description: 'a11y name for the region.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough.' }, { name: 'style', type: 'string', default: '—', description: 'Style passthrough.' }, { name: 'onscroll', type: '(event: ViewportScrollEvent) => void', default: '—', description: 'Scroll callback from the viewport.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The scrolling content.', required: true }, { name: 'getViewport()', type: '() => HTMLDivElement | null', default: 'export', description: 'The scrollport element — the family\u2019s ToC pairing works here too.' }]} /></SectionCard></div>
  </div>
</div>

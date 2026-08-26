<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle/theme-toggle.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import themeToggleSource from '$lib/ui/theme-toggle/theme-toggle.svelte?raw';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';

  // ToC outline: the no-flash bootstrap demo + the closing contract law.

  // Same-source law for the bootstrap half: the exact app.html this site
  // ships (the inline script is the other writer of the same storage key).
  import appHtml from '../../../../app.html?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: head/tail halves so the drawer's live overlay and
  // the usage stay ONE template (no second copy)
  const usageHead = `<script lang="ts">
  import ThemeToggle from '@ui/theme-toggle.svelte';
${close}

<!-- pair with the no-flash inline bootstrap in app.html (localStorage
     "theme" light|dark|system, .dark class, colorScheme, html.js) -->`;
  const usageTail = `
<ThemeToggle variant="compact" />
<ThemeToggle variant="icon" />
<ThemeToggle variant="text" />`;
  const usage = `${usageHead}
<ThemeToggle variant="full" />${usageTail}`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/theme-toggle.svelte', content: themeToggleSource },
    { name: 'src/lib/ui/theme-toggle-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + echo projection + live usage
  type Variant = 'full' | 'compact' | 'icon' | 'text';
  const canvasInitial = { variant: 'full' as Variant };
  let variant = $state(canvasInitial.variant);
  function resetCanvas(): void {
    variant = canvasInitial.variant;
  }
  const variantOptions: { value: Variant; label: string }[] = [
    { value: 'full', label: 'full' },
    { value: 'compact', label: 'compact' },
    { value: 'icon', label: 'icon' },
    { value: 'text', label: 'text' },
  ];
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`${usageHead}
<ThemeToggle variant=${q(variant)} />${usageTail}`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Theme toggle · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai theme-toggle component: light / dark / system in four variants — full segmented selector, compact, icon, and text — driving the shared theme contract with inline SVG icons and zero dependencies."
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
        title="theme-toggle — light / dark / system, four densities"
        summary="One shared theme contract (localStorage “theme”, the .dark class, colorScheme on the root), four ways to reach it. full is the segmented selector that sets a mode directly; compact, icon, and text are cycling buttons walking light → dark → system. Icons are inline SVG — no icon-library dependency — and the chrome adapts to its container through currentColor."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">4 variants</span>
          <span class="pill">full sets · rest cycle</span>
          <span class="pill">inline SVG icons</span>
          <span class="pill">no-flash bootstrap pairing</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="theme-toggle"
        description="light / dark / system in four variants. All of them below control the same live theme — click any one and the whole site re-themes. The playground drives the lower instance."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/theme-toggle.svelte"
        {files}
        stage="center"
        onreset={resetCanvas}
        output={[{ label: 'variant', value: variant }]}
        resolveFileContent={resolveUsage}
      >
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>full</span>
              <ThemeToggle variant="full" />
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>compact</span>
              <ThemeToggle variant="compact" />
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>icon</span>
              <ThemeToggle variant="icon" />
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>text</span>
              <ThemeToggle variant="text" />
            </label>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <ThemeToggle {variant} />
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="variant">
              <PlaySegmented bind:value={variant} options={variantOptions} />
            </PlayRow>
            <PlayHelp>
              every instance above writes the same storage key — the site re-themes live. full
              <em>sets</em> a mode directly; compact, icon, and text
              <em>cycle</em> light → dark → system. Each carries its mode in
              <code>aria-label</code> or
              <code>aria-pressed</code>.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="no-flash" data-reveal="">
      <SectionCard
        family="no-flash"
        headerRegion="no-flash"
        eyebrow="demo"
        title="The no-flash bootstrap"
        summary="The toggle is only the visible half. This exact inline script runs in app.html before first paint: it reads localStorage, resolves system through prefers-color-scheme, and applies the .dark class + colorScheme on the root — so prerendered loads never flash the wrong theme. The toggle writes the same key and re-applies through the same path."
      >
        <CodeBlock code={appHtml} lang="html" meta="src/app.html" />
      </SectionCard>
    </div>

    <div id="theme-contract" data-reveal="">
      <SectionCard
        family="theme-contract"
        headerRegion="theme-contract"
        eyebrow="law"
        title="The shared theme contract"
        summary="One key, one apply function, two writers. Bootstrap and toggle both go through it, so there is no second source of truth to drift."
      >
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>storage key <code class="text-accent">"theme"</code>:
              <code class="text-accent">light | dark | system</code>; absent means system</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>application = <code class="text-accent">.dark</code> class +
              <code class="text-accent">colorScheme</code> on the document root — one function, used by
              bootstrap and toggle alike</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">system</code> follows
              <code class="text-accent">prefers-color-scheme</code> live: the media listener stays
              attached while system is current</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>full exposes <code class="text-accent">hideLabels</code> for an icons-only segmented
              row; every variant carries its mode in <code class="text-accent">aria-label</code> or
              <code class="text-accent">aria-pressed</code></span></li>
      </ul>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Four variants, two behaviors: full sets a mode directly; the rest cycle light → dark → system.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">full · sets</span><ThemeToggle variant="full" /><span class="text-muted-foreground text-[12.5px]">segmented group — one click, one mode</span></div>
      <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">compact · cycles</span><ThemeToggle variant="compact" /><span class="text-muted-foreground text-[12.5px]">the default cycling button</span></div>
      <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">icon · cycles</span><ThemeToggle variant="icon" /><span class="text-muted-foreground text-[12.5px]">icon only — aria-label carries the mode</span></div>
      <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">text · cycles</span><ThemeToggle variant="text" /><span class="text-muted-foreground text-[12.5px]">the word alone</span></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Pair with the no-flash inline bootstrap in app.html — both write the same storage key."><CodeBlock code={usage} lang="svelte" meta="ThemeToggle usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="full is a labeled group with pressed state per option; the cycling buttons name their current mode."><A11yTable keys={[{ key: 'Tab', action: 'Reaches the toggle (one stop: the group or the cycling button)' }, { key: 'Enter / Space', action: 'Sets the focused mode (full) or advances light → dark → system (cycling)' }]} aria={[{ name: 'role', value: 'group', description: 'The full variant group, aria-label "Color theme"' }, { name: 'aria-pressed', value: 'boolean', description: 'On each full-variant option — the current mode reads pressed' }, { name: 'aria-label', value: '"theme: {mode}"', description: 'On the cycling variants; icon-only relies on it entirely' }, { name: 'aria-hidden', value: 'true', description: 'On the decorative inline SVG icons' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The toggle re-themes the page rather than being themed: chrome speaks currentColor, zero tokens of its own."><div class="flex flex-col gap-6"><DensityDemo><ThemeToggle variant="compact" /></DensityDemo><TokenTable tokens={[{ name: 'currentColor', default: 'inherited', source: 'color', description: 'Icons and chrome track the surrounding text color' }, { name: 'storage key', default: '"theme": light | dark | system', source: 'structural', description: '.dark class + colorScheme on the root, applied by one shared function' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the ThemeToggle Props interface — a variant and one full-only modifier."><PropsTable props={[{ name: 'variant', type: "'full' | 'compact' | 'icon' | 'text'", default: "'compact'", description: 'full sets a mode directly; the others cycle light → dark → system.' }, { name: 'hideLabels', type: 'boolean', default: 'false', description: 'full variant only: hide the text labels, show icons alone.' }]} /></SectionCard></div>
</div>

<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle.svelte';
  import themeToggleSource from '$lib/ui/theme-toggle.svelte?raw';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import ThemeToggle from '@ui/theme-toggle.svelte';
${close}

<!-- pair with the no-flash inline bootstrap in app.html (localStorage
     "theme" light|dark|system, .dark class, colorScheme, html.js) -->
<ThemeToggle variant="full" />
<ThemeToggle variant="compact" />
<ThemeToggle variant="icon" />
<ThemeToggle variant="text" />`;

  const files: TreeFile[] = [
    { name: 'src/lib/ui/theme-toggle.svelte', content: themeToggleSource },
    { name: 'src/lib/ui/theme-toggle-usage.svelte', content: usage },
  ];

  type Variant = 'full' | 'compact' | 'icon' | 'text';
  let variant = $state<Variant>('full');
</script>

<svelte:head>
  <title>Theme toggle · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai theme-toggle component: light / dark / system in four variants — full segmented selector, compact, icon, and text — driving the shared theme contract with inline SVG icons and zero dependencies."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Interactive"
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

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="theme-toggle"
      description="light / dark / system in four variants. All of them below control the same live theme — click any one and the whole site re-themes."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/theme-toggle.svelte"
      {files}
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
        <NativeSelect
          label="variant"
          onchange={(event) => {
            variant = event.currentTarget.value as Variant;
          }}
        >
          <option value="full">full</option>
          <option value="compact">compact</option>
          <option value="icon">icon</option>
          <option value="text">text</option>
        </NativeSelect>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      eyebrow="contract"
      title="The shared theme contract"
      summary="The toggle is only the visible half. The no-flash inline bootstrap in app.html reads localStorage before first paint, so prerendered loads never flash the wrong theme; the toggle writes the same key and re-applies through the same path."
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

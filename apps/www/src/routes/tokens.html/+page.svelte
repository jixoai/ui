<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { currentHue, playing, resumeHue, setHueManually, toggleHuePlay } from '$lib/hue-runtime';

  /* ---------------------------------------------------------------------
   * Hue lab: the runtime drives --brand-hue (time-of-day seed, 24h wall-clock cycle);
   * the slider here writes manually (pausing the cycle). The CSS code
   * block and every swatch below bind to the LIVE hue — not a hardcoded
   * number.
   * ------------------------------------------------------------------- */
  let hue = $state(0);
  let isPlaying = $state(true);
  currentHue.subscribe((v) => (hue = v));
  playing.subscribe((v) => (isPlaying = v));

  // Same-source law: the drawer shows the exact runtime this site runs.
  import hueRuntimeSource from '$lib/hue-runtime?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ToC outline: the four page regions, in page order.

  // Playground protocol (P1): the "reset" of a global runtime is handing
  // control back to the wall clock (resume runs the 2s cubic-out toward
  // the time-of-day hue; a cruising runtime is already there).
  function resetHueLab(): void {
    if (!isPlaying) resumeHue();
  }

  const hueLawCode = $derived(
    String.raw`:root {
  --brand-hue: ${Math.round(hue)}; /* runs free: 24h wall-clock, 4min/deg */

  --primary: oklch(0.6489 0.237 var(--brand-hue));
  --ring: var(--primary);
  --chart-1: var(--primary);
}
.dark {
  /* perceptual compensation: the hue drifts -4° toward dark */
  --primary: oklch(0.7044 0.1872 calc(var(--brand-hue) - 4));
}`,
  );

  const hueUsage = `<script lang="ts">
  import { currentHue, playing, setHueManually, toggleHuePlay } from '$lib/hue-runtime';
${close}

<!-- one variable is the whole identity: the slider writes (auto-pauses),
     the toggle resumes toward the wall-clock hue (2s cubic-out) -->
let hue = $state(0);
let isPlaying = $state(true);
currentHue.subscribe((v) => (hue = v));
playing.subscribe((v) => (isPlaying = v));

<label for="hue-slider">--brand-hue</label>
<input
  id="hue-slider"
  type="range" min="0" max="359" step="1"
  value={Math.round(hue)}
  oninput={(e) => setHueManually(e.currentTarget.valueAsNumber)}
/>
<button type="button" onclick={toggleHuePlay}>
  {isPlaying ? '❚❚ pause' : '▶ play'}
</button>`;

  const hueFiles: TreeFile[] = [
    { name: 'apps/www/src/lib/hue-runtime.ts', content: hueRuntimeSource },
    { name: 'src/lib/tokens/hue-usage.svelte', content: hueUsage },
  ];

  /* Palette data — literal values from lib/jixoai.css. Displayed in the
   * CURRENT theme (no dual panels: switch the site theme to compare). */
  interface TokenEntry {
    name: string;
    value: string;
  }

  const neutrals: TokenEntry[] = [
    { name: '--background', value: 'oklch(1 0 0) / oklch(0 0 0)' },
    { name: '--foreground', value: 'oklch(0 0 0) / oklch(1 0 0)' },
    { name: '--card', value: 'oklch(1 0 0) / oklch(0.3211 0 0)' },
    { name: '--muted', value: 'oklch(0.9551 0 0) / oklch(0.2178 0 0)' },
    { name: '--muted-foreground', value: 'oklch(0.3211 0 0) / oklch(0.8452 0 0)' },
    { name: '--border', value: 'oklch(0 0 0) / oklch(1 0 0)' },
    { name: '--destructive', value: 'oklch(0 0 0) / oklch(1 0 0)' },
  ];

  const brand: TokenEntry[] = [
    { name: '--primary', value: 'oklch(0.6489 0.237 var(--brand-hue))' },
    { name: '--primary-foreground', value: 'oklch(1 0 0) / oklch(0 0 0)' },
    { name: '--secondary', value: 'oklch(0.968 0.211 109.7692)' },
    { name: '--secondary-foreground', value: 'oklch(0 0 0)' },
    { name: '--accent', value: 'oklch(0.5635 0.2408 260.8178)' },
    { name: '--accent-foreground', value: 'oklch(1 0 0) / oklch(0 0 0)' },
  ];

  const terminal: TokenEntry[] = [
    { name: '--terminal', value: 'oklch(0.2 0 0)' },
    { name: '--terminal-foreground', value: 'oklch(1 0 0)' },
    { name: '--terminal-hover', value: 'mix(fg 14% → terminal)' },
    { name: '--terminal-muted', value: 'mix(fg 8% → terminal)' },
  ];

  const charts: TokenEntry[] = [
    { name: '--chart-1', value: 'var(--primary)' },
    { name: '--chart-2', value: 'var(--secondary)' },
    { name: '--chart-3', value: 'var(--accent)' },
    { name: '--chart-4', value: 'oklch(0.7323 0.2492 142.4953)' },
    { name: '--chart-5', value: 'oklch(0.5931 0.2726 328.3634)' },
  ];

  const groups: { id: string; label: string; entries: TokenEntry[] }[] = [
    { id: 'neutral', label: 'Neutrals (achromatic by law)', entries: neutrals },
    { id: 'brand', label: 'Brand & functional (fixed hues)', entries: brand },
    { id: 'terminal-tokens', label: 'Terminal surfaces (always dark)', entries: terminal },
    { id: 'charts', label: 'Charts', entries: charts },
  ];
</script>

<svelte:head>
  <title>Tokens · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai token law: OKLCH colors with the brand hue running free (24h wall-clock, 4min/deg), dark -4° drift, hard offset shadows, radius 0 with bevel upgrade, and terminal surfaces. The hue lab runs the live runtime from its workbench."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
  <!-- Page head. -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="Tokens"
      title="One variable is the whole identity"
      summary="Colors are OKLCH with fixed lightness and chroma shared across every jixoai site; only --brand-hue varies. On this site it runs free — seeded from the time of day and one full day = one full 360° turn (4 minutes per degree). Use the palette popover in the header (or the slider below) to take manual control."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">--brand-hue: <span class="tabular-nums text-primary">{Math.round(hue)}°</span> live</span>
        <span class="pill">OKLCH · fixed L/C law</span>
        <span class="pill">dark drift −4°</span>
        <span class="pill">radius 0 + bevel upgrade</span>
      </div>
    </SectionCard>
  </div>

  <!-- Hue lab: the interactive One-Hue Law demo, as the workbench — the
       stage proves the tokens (swatches, press physics, the LIVE css law),
       the playground holds the runtime controls. -->
  <div id="hue-lab" data-region="hue-lab" data-reveal="">
    <ComponentCanvas
      title="hue runtime"
      description="The runtime seeds --brand-hue from the time of day (one full day = one full 360° turn) and the hue always equals the wall-clock position (4min/deg). The slider writes manually — pausing the cycle; the play/pause toggle resumes from wherever the hue is. Every swatch and the CSS law below bind to the LIVE hue."
      sourceUrl="https://github.com/jixoai/ui/blob/main/apps/www/src/lib/hue-runtime.ts"
      files={hueFiles}
      stage="start"
      onreset={resetHueLab}
      echo={[
        { label: '--brand-hue', value: `${Math.round(hue)}°` },
        { label: 'cycle', value: isPlaying ? 'auto · wall-clock' : 'paused · manual' },
      ]}
    >
      <div class="flex w-full flex-col items-start gap-6">
        <!-- live swatches in the CURRENT theme -->
        <div class="grid w-full gap-4 min-[760px]:grid-cols-2">
          <div class="border border-border">
            <div class="swatch-chip" style="background: var(--primary)"></div>
            <p class="px-3 py-2 text-[11.5px]">--primary (current theme)</p>
          </div>
          <div class="bg-terminal border border-border">
            <div class="flex h-[2.6rem] items-center px-3">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">
                jixoai-ui
              </span>
            </div>
            <p class="text-terminal-foreground/70 px-3 py-2 text-[11.5px]">header brand eyebrow</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <PressButton variant="primary">primary button</PressButton>
          <PressButton variant="outline">outline button</PressButton>
          <span class="text-muted-foreground text-[12.5px]">
            press physics follow the hue automatically — no second variable
          </span>
        </div>

        <div class="w-full">
          <CodeBlock code={hueLawCode} lang="css" meta="lib/jixoai.css" />
        </div>
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <div class="jx-play-field">
            <div class="flex flex-wrap items-baseline justify-between gap-3">
              <label class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground" for="hue-slider">
                --brand-hue
              </label>
              <div class="flex items-center gap-3">
                <output for="hue-slider" class="font-nav text-primary text-[13px] tabular-nums">
                  {Math.round(hue)}°
                </output>
                <button
                  type="button"
                  class="border border-border px-2 py-0.5 text-[10px] font-nav transition-colors hover:bg-muted"
                  onclick={toggleHuePlay}
                  aria-label={isPlaying ? 'Pause auto-cycle' : 'Resume auto-cycle'}
                >
                  {isPlaying ? '❚❚ pause' : '▶ play'}
                </button>
              </div>
            </div>
            <input
              id="hue-slider"
              class="hue-slider"
              type="range"
              min="0"
              max="359"
              step="1"
              value={Math.round(hue)}
              oninput={(event) => setHueManually(event.currentTarget.valueAsNumber)}
            />
          </div>
          <p class="jx-play-help">
            0 = jixoai red · 27 = openspecui · 165 = unipty 幽绿 · this site: time-of-day → 24h
            wall-clock (4min/deg). Any manual write pauses the cycle; reset hands control back to
            the wall clock (2s cubic-out resume, instant under prefers-reduced-motion).
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- Full palette in the current theme. -->
  <div id="palette" data-reveal="">
    <SectionCard
      family="palette"
      headerRegion="palette"
      eyebrow="Palette"
      title="The full sheet, current theme"
      summary="Values are literal from the registry token sheet (light / dark where they differ). Switch the site theme (header toggle or palette popover) to compare the other mode — no dual panels here."
    >
      <div class="flex flex-col gap-6">
        {#each groups as group (group.id)}
          <div class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">{group.label}</h3>
            <dl class="grid grid-cols-1 gap-2 min-[560px]:grid-cols-2 min-[860px]:grid-cols-3">
              {#each group.entries as entry (entry.name)}
                <div class="swatch border border-border">
                  <div class="swatch-chip" style:background={`var(${entry.name})`}></div>
                  <div class="flex flex-col gap-0.5 px-2 py-1.5">
                    <dt>{entry.name}</dt>
                    <dd class="text-muted-foreground">{entry.value}</dd>
                  </div>
                </div>
              {/each}
            </dl>
          </div>
        {/each}
      </div>
    </SectionCard>
  </div>

  <!-- Semantics: the non-negotiable laws with live samples. -->
  <div id="semantics" data-reveal="">
    <SectionCard
      family="semantics"
      headerRegion="semantics"
      eyebrow="Semantics"
      title="Rules that look negotiable but are not"
      summary="Neutrals stay pure achromatic (no warm/cool grays), shadows stay hard (zero blur, tiny soft layer only at md+), radius stays 0 except the bevel upgrade and small status pills, and the terminal bar is dark in BOTH themes — it reads as a CRT bezel, not a themed surface."
    >
      <div class="flex flex-col gap-7">
        <div class="grid gap-4 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-2.5">
            <h3 class="text-[15px] font-bold tracking-tight">Hard offset shadows</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              The shadow IS the affordance. Dark mode inverts the shadow color — including the
              small tiers — or press buttons lose their lift on the pure-black canvas.
            </p>
            <div class="flex flex-wrap items-center gap-5 border border-border bg-card p-5">
              {#each [['2xs', 'shadow-2xs'], ['xs', 'shadow-xs'], ['sm', 'shadow-sm'], ['md', 'shadow-md']] as [label, shadow] (label)}
                <div class="flex flex-col items-center gap-2">
                  <div class="border border-border bg-card size-12 {shadow}"></div>
                  <span class="text-muted-foreground text-[10.5px]">{label}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="flex flex-col gap-2.5">
            <h3 class="text-[15px] font-bold tracking-tight">Radius law</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              --radius is 0px; where CSS supports it, corner-shape: bevel upgrades it to 8px.
              rounded-full is reserved exclusively for small status dots and pills.
            </p>
            <div class="flex flex-wrap items-center gap-5 border border-border bg-card p-5">
              <div class="border border-border bg-card size-12"></div>
              <span class="text-muted-foreground text-[10.5px]">radius 0 (bevel where supported)</span>
              <span class="pill">pill</span>
              <span class="text-muted-foreground text-[10.5px]">the only rounded-full</span>
            </div>
          </div>
        </div>
        <div class="grid gap-4 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-2.5">
            <h3 class="text-[15px] font-bold tracking-tight">Glass material</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              .jx-glass: translucent surface + real backdrop blur (14px, saturation 1.35), drawn
              with an outline instead of a border so the box line never shifts layout. The mobile
              ToC rail is made of this.
            </p>
            <div class="relative overflow-hidden border border-border bg-card p-6">
              <div
                class="absolute inset-0 flex items-center justify-center gap-3"
                aria-hidden="true"
              >
                {#each ['#d945d1', '#f5e13a', '#3d7bff'] as color (color)}
                  <span class="size-10" style:background={color}></span>
                {/each}
              </div>
              <div class="jx-glass relative flex items-center border p-4">
                <span class="text-[12.5px]">.jx-glass over brand primaries</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2.5">
            <h3 class="text-[15px] font-bold tracking-tight">Beyond sRGB on purpose</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              Several chroma values intentionally exceed the sRGB gamut (secondary renders as pure
              #ffff00 after clipping). The neon clip IS the brutalist look. An HSL formulation was
              tried and rejected: sRGB HSL lightness is hue-dependent and distorts perceived
              weight; OKLCH keeps it perceptual.
            </p>
            <div class="flex flex-wrap items-center gap-5 border border-border bg-card p-5">
              <span class="border border-border size-12" style="background: var(--secondary)"></span>
              <span class="border border-border size-12" style="background: var(--accent)"></span>
              <span class="border border-border size-12" style="background: var(--chart-4)"></span>
              <span class="text-muted-foreground text-[10.5px]">secondary · accent · chart-4</span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- Owner decision pending: primary contrast (recorded 2026-08-22,
       four decision requests unanswered; this note states MEASURED
       FACTS + the three options — it is not itself a decision) -->
  <div id="primary-contrast" data-reveal="">
    <SectionCard
      family="primary-contrast"
      headerRegion="primary-contrast"
      eyebrow="Owner 决策待定"
      title="primary contrast — measured, decision pending"
      summary="MEASURED: the primary button's white foreground reads 2.4–3.5:1 across the hue rotation (3.11:1 at gold) and .text-primary links on the light surface read 2.55:1 — both below WCAG AA 4.5:1. Structural cause: --primary L≈0.65 under a pure-white --primary-foreground. The Owner has been asked to choose; until then the current values stand unchanged."
    >
      <div class="flex flex-col gap-3 text-[13px] leading-6">
        <div class="border border-border bg-muted/40 px-4 py-3">
          <p><strong>A · foreground to near-black</strong> (recommended): <code>--primary-foreground: oklch(0.15 0 0)</code> — ≈8:1 at every hue, one token, brutalist-consistent.</p>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-3">
          <p><strong>B · raise the base lightness</strong>: <code>--primary: oklch(0.78 0.16 var(--brand-hue))</code> — white text reaches 4.5:1, brand color lightens.</p>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-3">
          <p><strong>C · keep as-is</strong>: accept the terminal white-on-hue voice as a deliberate trade-off (below AA) — this note then becomes the recorded decision.</p>
        </div>
        <p class="text-muted-foreground text-[12.5px]">
          Whichever is chosen, the change lands in registry/files/theme/jixoai.css and takes effect
          site-wide; regression = 205-test suite + both builds + a contrast re-measure.
        </p>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';
  import { BRAND_HUE } from '$lib/site';

  /* ---------------------------------------------------------------------
   * Hue lab: one slider, the whole brand. Setting --brand-hue on the root
   * re-derives every primary-tinted token on the page (and in the mode-
   * scoped palette panels below) live — the One-Hue Law made tangible.
   * ------------------------------------------------------------------- */
  let hue = $state(BRAND_HUE);

  const setHue = (value: number): void => {
    hue = value;
    document.documentElement.style.setProperty('--brand-hue', String(value));
  };
  const resetHue = (): void => setHue(BRAND_HUE);

  const hueLawCode = String.raw`:root {
  --brand-hue: 330; /* the ONLY per-project value */

  --primary: oklch(0.6489 0.237 var(--brand-hue));
  --ring: var(--primary);
  --chart-1: var(--primary);
}
.dark {
  /* perceptual compensation: the hue drifts -4° toward dark */
  --primary: oklch(0.7044 0.1872 calc(var(--brand-hue) - 4));
}`;

  /* Palette data — literal values mirrored from lib/jixoai.css (the file
   * this site copied from the registry). Panels re-scope the tokens so the
   * light palette stays light even when the page theme is dark. */
  interface TokenEntry {
    name: string;
    light: string;
    dark: string;
  }

  const neutrals: TokenEntry[] = [
    { name: '--background', light: 'oklch(1 0 0)', dark: 'oklch(0 0 0)' },
    { name: '--foreground', light: 'oklch(0 0 0)', dark: 'oklch(1 0 0)' },
    { name: '--card', light: 'oklch(1 0 0)', dark: 'oklch(0.3211 0 0)' },
    { name: '--muted', light: 'oklch(0.9551 0 0)', dark: 'oklch(0.2178 0 0)' },
    { name: '--muted-foreground', light: 'oklch(0.3211 0 0)', dark: 'oklch(0.8452 0 0)' },
    { name: '--border', light: 'oklch(0 0 0)', dark: 'oklch(1 0 0)' },
    { name: '--destructive', light: 'oklch(0 0 0)', dark: 'oklch(1 0 0)' },
  ];

  const brand: TokenEntry[] = [
    {
      name: '--primary',
      light: 'oklch(0.6489 0.237 var(--brand-hue))',
      dark: 'oklch(0.7044 0.1872 calc(var(--brand-hue) - 4))',
    },
    { name: '--primary-foreground', light: 'oklch(1 0 0)', dark: 'oklch(0 0 0)' },
    {
      name: '--secondary',
      light: 'oklch(0.968 0.211 109.7692)',
      dark: 'oklch(0.9691 0.2005 109.6228)',
    },
    { name: '--secondary-foreground', light: 'oklch(0 0 0)', dark: 'oklch(0 0 0)' },
    {
      name: '--accent',
      light: 'oklch(0.5635 0.2408 260.8178)',
      dark: 'oklch(0.6755 0.1765 252.2592)',
    },
    { name: '--accent-foreground', light: 'oklch(1 0 0)', dark: 'oklch(0 0 0)' },
  ];

  const terminal: TokenEntry[] = [
    { name: '--terminal', light: 'oklch(0.2 0 0)', dark: 'oklch(0.2 0 0)' },
    { name: '--terminal-foreground', light: 'oklch(1 0 0)', dark: 'oklch(1 0 0)' },
    {
      name: '--terminal-hover',
      light: 'mix(terminal-fg 14% → terminal)',
      dark: 'mix(terminal-fg 14% → terminal)',
    },
    {
      name: '--terminal-muted',
      light: 'mix(terminal-fg 8% → terminal)',
      dark: 'mix(terminal-fg 8% → terminal)',
    },
  ];

  const charts: TokenEntry[] = [
    { name: '--chart-1', light: 'var(--primary)', dark: 'var(--primary)' },
    { name: '--chart-2', light: 'var(--secondary)', dark: 'var(--secondary)' },
    { name: '--chart-3', light: 'var(--accent)', dark: 'var(--accent)' },
    { name: '--chart-4', light: 'oklch(0.7323 0.2492 142.4953)', dark: 'oklch(0.7395 0.2268 142.8504)' },
    { name: '--chart-5', light: 'oklch(0.5931 0.2726 328.3634)', dark: 'oklch(0.6131 0.2458 328.0714)' },
  ];

  const groups: { id: string; label: string; entries: TokenEntry[] }[] = [
    { id: 'neutral', label: 'Neutrals (achromatic by law)', entries: neutrals },
    { id: 'brand', label: 'Brand & functional (fixed hues)', entries: brand },
    { id: 'terminal-tokens', label: 'Terminal surfaces (always dark)', entries: terminal },
    { id: 'charts', label: 'Charts', entries: charts },
  ];
</script>

<svelte:head>
  <title>Tokens · jixoai/ui</title>
  <meta
    name="description"
    content="The jixoai token law: OKLCH colors with one brand hue per project, dark -4° drift, hard offset shadows, radius 0 with bevel upgrade, and terminal surfaces. Interactive hue lab included."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <!-- Page head. -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="Tokens"
      title="One variable is the whole identity"
      summary="Colors are OKLCH with fixed lightness and chroma shared across every jixoai site; only --brand-hue varies per project (this one: 330, pink-purple). Neutrals are pure achromatic, shadows are hard offsets, radius is 0 — and the neon clip beyond sRGB is intentional, so nobody fixes it."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">--brand-hue: 330</span>
        <span class="pill">OKLCH · fixed L/C law</span>
        <span class="pill">dark drift −4°</span>
        <span class="pill">radius 0 + bevel upgrade</span>
      </div>
    </SectionCard>
  </div>

  <!-- Hue lab: the interactive One-Hue Law demo. -->
  <div data-reveal="" use:reveal>
    <SectionCard
      eyebrow="Hue lab"
      title="Drag one number, rebrand everything"
      summary="The slider writes --brand-hue on the page root. Watch the primary swatches, the button, the header-brand chip, and every node on this site re-derive — that is the entire per-project theming surface of the design language."
    >
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-baseline justify-between gap-3">
            <label class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground" for="hue-slider">
              --brand-hue
            </label>
            <output
              for="hue-slider"
              class="font-nav text-primary text-[13px] tabular-nums"
            >
              {hue}
            </output>
          </div>
          <input
            id="hue-slider"
            class="hue-slider"
            type="range"
            min="0"
            max="359"
            step="1"
            value={hue}
            oninput={(event) => setHue(event.currentTarget.valueAsNumber)}
          />
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-muted-foreground text-[12.5px] leading-5">
              0 = jixoai red · 27 = openspecui · 165 = unipty 幽绿 · 330 = this site
            </p>
            <PressButton variant="outline" onclick={resetHue}>reset 330</PressButton>
          </div>
        </div>

        <div class="grid gap-4 min-[760px]:grid-cols-3">
          <!-- light primary -->
          <div class="token-scope-light border border-border">
            <div class="swatch-chip" style="background: var(--primary)"></div>
            <p class="px-3 py-2 text-[11.5px]">light --primary</p>
          </div>
          <!-- dark primary (the -4° drift) -->
          <div class="token-scope-dark border border-border">
            <div class="swatch-chip" style="background: var(--primary)"></div>
            <p class="px-3 py-2 text-[11.5px]">dark --primary (hue − 4°)</p>
          </div>
          <!-- header-brand chip on the terminal bezel -->
          <div class="bg-terminal border border-border">
            <div class="flex h-[2.6rem] items-center px-3">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">
                jixoai/ui
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

        <CodeBlock code={hueLawCode} lang="css" meta="lib/jixoai.css" />
      </div>
    </SectionCard>
  </div>

  <!-- Full palette: light and dark panels side by side. -->
  <div data-reveal="" use:reveal>
    <SectionCard
      eyebrow="Palette"
      title="The full sheet, both modes"
      summary="Values are literal from the registry token sheet. Each panel re-scopes the tokens so the light palette renders light even while the page theme is dark — and the primary chips keep following the slider above."
    >
      <div class="flex flex-col gap-6">
        {#each groups as group (group.id)}
          <div class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">{group.label}</h3>
            <div class="grid gap-4 min-[940px]:grid-cols-2">
              {#each [null, 'dark'] as mode (mode ?? 'light')}
                <div
                  class="border border-border {mode === 'dark'
                    ? 'token-scope-dark'
                    : 'token-scope-light'}"
                >
                  <p class="border-b border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]">
                    {mode === 'dark' ? '.dark' : ':root (light)'}
                  </p>
                  <dl class="grid grid-cols-2 gap-2 p-3 min-[560px]:grid-cols-3">
                    {#each group.entries as entry (entry.name)}
                      <div class="swatch">
                        <div class="swatch-chip" style:background={`var(${entry.name})`}></div>
                        <div class="flex flex-col gap-0.5 px-2 py-1.5">
                          <dt>{entry.name}</dt>
                          <dd>{mode === 'dark' ? entry.dark : entry.light}</dd>
                        </div>
                      </div>
                    {/each}
                  </dl>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </SectionCard>
  </div>

  <!-- Semantics: the non-negotiable laws with live samples. -->
  <div data-reveal="" use:reveal>
    <SectionCard
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
</div>

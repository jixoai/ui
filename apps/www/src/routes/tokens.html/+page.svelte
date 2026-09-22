<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  // the glass demo rides the SHARED stamp channel — the law sheet must
  // be loaded for the paint (glass-effect design §6)
  import '$lib/ui/glass/glass.css';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { currentHue, playing, resumeHue, setHueManually, toggleHuePlay } from '$lib/hue-runtime.svelte';
  // site-only token-lab surfaces (tw4 P2.2): swatches + scope panels + hue slider
  import '$lib/site/token-lab.css';
  import { TokenTable } from '$lib/ui/token-table';
  import { DensityDemo } from '$lib/ui/density-demo';
  import Item from '$lib/ui/list-item/item.svelte';
  import ItemMedia from '$lib/ui/list-item/item-media.svelte';
  import ItemContent from '$lib/ui/list-item/item-content.svelte';
  import ItemTitle from '$lib/ui/list-item/item-title.svelte';
  import ItemDescription from '$lib/ui/list-item/item-description.svelte';

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
  import hueRuntimeSource from '$lib/hue-runtime.svelte?raw';

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
  import { currentHue, playing, setHueManually, toggleHuePlay } from '$lib/hue-runtime.svelte';
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
    { name: 'apps/www/src/lib/hue-runtime.svelte.ts', content: hueRuntimeSource },
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
    { name: '--primary-foreground', value: 'oklch(0 0 0) / oklch(0 0 0)' },
    { name: '--primary-text', value: 'oklch(0.55 0.12 var(--brand-hue)) / var(--primary)' },
    // W6-r3: --secondary/--accent carry their own dark lift (L up, C
    // down, hue nudged) — the sheet's own convention ("light / dark
    // where they differ") applies; the single-value labels read as
    // contradictions against the live swatch in dark
    { name: '--secondary', value: 'oklch(0.968 0.211 109.7692) / oklch(0.9691 0.2005 109.6228)' },
    { name: '--secondary-foreground', value: 'oklch(0 0 0)' },
    { name: '--accent', value: 'oklch(0.5635 0.2408 260.8178) / oklch(0.6755 0.1765 252.2592)' },
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
</script>

<svelte:head>
  <title>Tokens · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai token law: OKLCH colors with the brand hue running free (24h wall-clock, 4min/deg), dark -4° drift, hard offset shadows, radius 0 with bevel upgrade, and terminal surfaces. The hue lab runs the live runtime from its workbench."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class={cx(rt.shellCol)}>
  <!-- Page head. -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="Tokens"
      title="One variable is the whole identity"
      summary="Colors are OKLCH with fixed lightness and chroma shared across every jixoai site; only --brand-hue varies. On this site it runs free — seeded from the time of day and one full day = one full 360° turn (4 minutes per degree). Use the palette popover in the header (or the slider below) to take manual control."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">--brand-hue: <span class={cx(rt.tabular, rt.inkPrimary)}>{Math.round(hue)}°</span> live</span>
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
      sourceUrl="https://github.com/jixoai/ui/blob/main/apps/www/src/lib/hue-runtime.svelte.ts"
      files={hueFiles}
      stage="start"
      onreset={resetHueLab}
      output={[
        { label: '--brand-hue', value: `${Math.round(hue)}°` },
        { label: 'cycle', value: isPlaying ? 'auto · wall-clock' : 'paused · manual' },
      ]}
    >
      <div class={cx(rt.col24, rt.wFull, rt.itemsStart)}>
        <!-- live swatches in the CURRENT theme -->
        <div class={cx(rt.grid760b, rt.wFull)}>
          <div class={cx(rt.frame)}>
            <div class="swatch-chip" style="background: var(--primary)"></div>
            <p class={cx(rt.px12, rt.py8, rt.text115)}>--primary (current theme)</p>
          </div>
          <div class={cx(rt.frame, rt.bgTerminal)}>
            <div class={cx(rt.tkRow)}>
              <span class={cx(rt.eyebrowPrimary)}>
                jixoai-ui
              </span>
            </div>
            <p class={cx(rt.inkTermFg70, rt.px12, rt.py8, rt.text115)}>header brand eyebrow</p>
          </div>
        </div>

        <div class={cx(rt.rowC12, rt.wrap)}>
          <PressButton variant="fill">fill button</PressButton>
          <PressButton variant="outline">outline button</PressButton>
          <span class={cx(rt.noteSmall)}>
            press physics follow the hue automatically — no second variable
          </span>
        </div>

        <div class={cx(rt.wFull)}>
          <CodeBlock code={hueLawCode} lang="css" meta="lib/jixoai.css" />
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <div class={cx(rt.col8)}>
            <div class={cx(rt.wrap12, rt.itemsBaseline, rt.justifyBetween)}>
              <label class={cx(rt.eyebrow, rt.inkMuted)} for="hue-slider">
                --brand-hue
              </label>
              <div class={cx(rt.rowC12)}>
                <output for="hue-slider" class={cx(rt.fontNav, rt.inkPrimary, rt.text13, rt.tabular)}>
                  {Math.round(hue)}°
                </output>
                <button
                  type="button"
                  class={cx(rt.tkChip)}
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
          <PlayHelp>
            0 = jixoai red · 27 = openspecui · 165 = unipty jade green · this site: time-of-day → 24h
            wall-clock (4min/deg). Any manual write pauses the cycle; reset hands control back to
            the wall clock (2s cubic-out resume, instant under prefers-reduced-motion).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>


  <!-- Density kernel: the design scale. -->
  <div id="density-kernel" data-reveal="">
    <SectionCard
      family="density-kernel"
      headerRegion="density-kernel"
      eyebrow="Design Scale"
      title="The density kernel"
      summary="One ruler, five densities (2xs: the opt-in pro-tool rung). Every dimension is an equation from --jx-unit (4px) and --jx-text-base (13px) — no hand-picked values. Components consume the inherited --jx-* tokens; [data-density] scopes switch all values simultaneously. Context injection (Kotlin Compose-inspired): providers set the scope, every child inherits."
    >
      <div class={cx(rt.col32)}>
        <div class={cx(rt.col12)}>
          <h3 class={cx(rt.title15)}>Five densities, live</h3>
          <p class={cx(rt.para)}>
            The same component at every density — text, spacing, hit targets, and media all scale
            from the ruler. No per-size branches in component CSS.
          </p>
          <DensityDemo scopes={['2xs', 'xs', 'sm', 'default', 'lg']}>
            <Item>
              <ItemMedia variant="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>The density row</ItemTitle>
                <ItemDescription>text · line · media scale from the ruler</ItemDescription>
              </ItemContent>
            </Item>
          </DensityDemo>
        </div>

        <div class={cx(rt.col12)}>
          <h3 class={cx(rt.title15)}>The five-row table</h3>
          <p class={cx(rt.para)}>
            All dimensions computed at the 16px root, columns in ladder order 2xs / xs /
            sm / default / lg. These are the RESOLVED values the kernel gate asserts in
            real Chromium. Two honest footnotes at 2xs: its hit is the ONE scoped floor
            (6U = 24px, the WCAG 2.5.8 AA minimum, inside [data-density='2xs'] only), and
            its secondary text degenerates to the primary size (the 0.625rem floor binds).
          </p>
          <TokenTable
            tokens={[
              { name: '--jx-text', default: '10 / 11 / 12 / 13 / 15px', source: 'density' },
              { name: '--jx-line', default: '14 / 16 / 18 / 20 / 24px', source: 'density' },
              { name: '--jx-gap', default: '8 / 8 / 8 / 12 / 16px', source: 'density' },
              { name: '--jx-stack', default: '4 / 4 / 4 / 8 / 8px', source: 'density' },
              { name: '--jx-inset', default: '8 / 8 / 8 / 12 / 16px', source: 'density' },
              { name: '--jx-row-min', default: '24 / 28 / 32 / 40 / 48px', source: 'density' },
              { name: '--jx-hit', default: '24 / 28 / 32 / 40 / 48px', source: 'density' },
              { name: '--jx-icon', default: '14 / 16 / 18 / 20 / 24px', source: 'density' },
              { name: '--jx-image', default: '28 / 32 / 36 / 40 / 48px', source: 'density' },
              { name: '--jx-text-secondary', default: '10 / 10 / 11 / 12 / 14px', source: 'density' },
              { name: '--jx-unit', default: '0.25rem (4px)', source: 'structural' },
              { name: '--jx-text-base', default: '0.8125rem (13px)', source: 'structural' },
            ]}
          />
        </div>

        <div class={cx(rt.col12)}>
          <h3 class={cx(rt.title15)}>Component supplement tokens</h3>
          <p class={cx(rt.para)}>
            Components ADD tokens the global set doesn't cover — toggle geometry, slider rails,
            textarea heights. These are owned by their component and documented on each
            component's page.
          </p>
          <TokenTable
            tokens={[
              { name: '--jx-toggle-track', default: 'var(--jx-line)', source: 'component' },
              { name: '--jx-toggle-width', default: 'calc(var(--jx-toggle-track) * 2)', source: 'component' },
              { name: '--jx-toggle-knob', default: 'calc(var(--jx-toggle-track) - var(--jx-unit))', source: 'component' },
              { name: '--jx-toggle-knob-border', default: '1px', source: 'component' },
              { name: '--jx-toggle-knob-border-color', default: 'var(--primary)', source: 'component' },
              { name: '--jx-slider-track', default: 'max(var(--jx-unit), calc(var(--jx-line) / 2))', source: 'component' },
              { name: '--jx-textarea-min', default: 'max(var(--jx-hit), calc(var(--jx-line) * 3 + ...))', source: 'component' },
              { name: '--jx-color-lane', default: 'max(var(--jx-hit), calc(var(--jx-icon) + ...))', source: 'component' },
            ]}
          />
        </div>

        <div class={cx(rt.col12)}>
          <h3 class={cx(rt.title15)}>Usage</h3>
          <CodeBlock
            code={`<!-- Scope switch: one attribute, every child inherits -->
<div data-density="sm">
  <MyComponent />  <!-- resolves to sm values -->
</div>

<!-- Svelte context: the provider pattern -->
<ItemGroup density="sm">
  <Item><!-- inherits sm from the group --></Item>
</ItemGroup>

<!-- Component supplement: override what the global doesn't cover -->
<style>
  .my-widget {
    min-height: var(--jx-hit);
    padding: var(--jx-stack) var(--jx-inset);
    font-size: var(--jx-text);
  }
</style>`}
            lang="svelte"
            meta="density usage"
          />
        </div>
      </div>
    </SectionCard>
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
      <div class={cx(rt.col24)}>
        {#each groups as group (group.id)}
          <div class={cx(rt.col12)}>
            <h3 class={cx(rt.title15)}>{group.label}</h3>
            <dl class={cx(rt.tkSwatchGrid)}>
              {#each group.entries as entry (entry.name)}
                <div class={cx('swatch', rt.frame)}>
                  <div class="swatch-chip" style:background={`var(${entry.name})`}></div>
                  <div class={cx(rt.flex, rt.col, rt.gap2, rt.px8, rt.py6)}>
                    <dt>{entry.name}</dt>
                    <dd class={cx(rt.inkMuted)}>{entry.value}</dd>
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
      <div class={cx(rt.col28)}>
        <div class={cx(rt.grid760b)}>
          <div class={cx(rt.col10)}>
            <h3 class={cx(rt.title15)}>Hard offset shadows</h3>
            <p class={cx(rt.para)}>
              The shadow IS the affordance. Dark mode inverts the shadow color — including the
              small tiers — or press buttons lose their lift on the pure-black canvas.
            </p>
            <div class={cx(rt.wrapRow20, rt.frame, rt.bgCard, rt.p20)}>
              {#each [['2xs', rt.shadow2xs], ['xs', rt.shadowXs], ['sm', rt.shadowSm], ['md', rt.shadowMd]] as [label, shadow] (label)}
                <div class={cx(rt.flex, rt.col, rt.itemsCenter, rt.gap8)}>
                  <div class={cx(rt.frame, rt.bgCard, rt.tkSize12, shadow)}></div>
                  <span class={cx(rt.inkMuted, rt.text105)}>{label}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class={cx(rt.col10)}>
            <h3 class={cx(rt.title15)}>Radius law</h3>
            <p class={cx(rt.para)}>
              --radius is 0px; where CSS supports it, corner-shape: bevel upgrades it to 8px.
              rounded-full is reserved exclusively for small status dots and pills.
            </p>
            <div class={cx(rt.wrapRow20, rt.frame, rt.bgCard, rt.p20)}>
              <div class={cx(rt.frame, rt.bgCard, rt.tkSize12)}></div>
              <span class={cx(rt.inkMuted, rt.text105)}>radius 0 (bevel where supported)</span>
              <span class="pill">pill</span>
              <span class={cx(rt.inkMuted, rt.text105)}>the only rounded-full</span>
            </div>
          </div>
        </div>
        <div class={cx(rt.grid760b)}>
          <div class={cx(rt.col10)}>
            <h3 class={cx(rt.title15)}>Glass material</h3>
            <p class={cx(rt.para)}>
              The glass effect: translucent surface + real backdrop blur (14px, saturation 1.35),
              painted by the shared glass law sheet off the <code>data-jx-effect="blur"</code> stamp
              and tuned through <code>--jx-glass-*</code> vars. Drawn with an outline instead of a
              border so the box line never shifts layout. The mobile ToC rail is made of this.
              (forced-colors: this demo page is exempt from the consumer Canvas map by declaration.)
            </p>
            <div class={cx(rt.relative, rt.overflowHidden, rt.frame, rt.bgCard, rt.p24)}>
              <div
                class={cx(rt.absolute, rt.inset0, rt.flex, rt.itemsCenter, rt.justifyCenter, rt.gap12)}
                aria-hidden="true"
              >
                {#each ['#d945d1', '#f5e13a', '#3d7bff'] as color (color)}
                  <span class={cx(rt.tkSize10)} style:background={color}></span>
                {/each}
              </div>
              <div data-jx-effect="blur" class={cx(rt.relative, rt.flex, rt.itemsCenter, rt.frameW, rt.p16)}>
                <span class={cx(rt.text125)}>the blur effect over brand primaries</span>
              </div>
            </div>
          </div>
          <div class={cx(rt.col10)}>
            <h3 class={cx(rt.title15)}>Beyond sRGB on purpose</h3>
            <p class={cx(rt.para)}>
              Several chroma values intentionally exceed the sRGB gamut (secondary renders as pure
              #ffff00 after clipping). The neon clip IS the brutalist look. An HSL formulation was
              tried and rejected: sRGB HSL lightness is hue-dependent and distorts perceived
              weight; OKLCH keeps it perceptual.
            </p>
            <div class={cx(rt.wrapRow20, rt.frame, rt.bgCard, rt.p20)}>
              <span class={cx(rt.frame, rt.tkSize12)} style="background: var(--secondary)"></span>
              <span class={cx(rt.frame, rt.tkSize12)} style="background: var(--accent)"></span>
              <span class={cx(rt.frame, rt.tkSize12)} style="background: var(--chart-4)"></span>
              <span class={cx(rt.inkMuted, rt.text105)}>secondary · accent · chart-4</span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>

  </div>
</div>

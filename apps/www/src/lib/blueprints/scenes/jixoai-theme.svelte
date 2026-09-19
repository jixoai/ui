<!-- jixoai-theme blueprint: the token sheet as swatches — the one-hue
     law (a project's identity is a single --brand-hue; primary, ring and
     chart-1 all derive from it) over the surfaces family, every swatch
     painted from the live CSS variables the sheet installs. -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Grid from '$lib/ui/grid';

  const hueSamples: { hue: string; css: string }[] = [
    { hue: '210', css: 'oklch(0.6489 0.237 210)' },
    { hue: '109', css: 'oklch(0.6489 0.237 109)' },
    { hue: '260', css: 'oklch(0.6489 0.237 260)' },
  ];
  const tokens: { name: string; css: string }[] = [
    { name: 'primary', css: 'var(--primary)' },
    { name: 'secondary', css: 'var(--secondary)' },
    { name: 'accent', css: 'var(--accent)' },
    { name: 'muted', css: 'var(--muted)' },
    { name: 'border', css: 'var(--border)' },
    { name: 'card', css: 'var(--card)' },
  ];

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

<div class={cx(bpA.jixoaiThemeStage)}>
  <div class={cx(bpA.jixoaiThemeRow)}>
    <span class={cx(bpA.jixoaiThemeRowLabel)}
      >--brand-hue</span
    >
    <div class={cx(bpA.jixoaiThemeSwatches)}>
      {#each hueSamples as sample (sample.hue)}
        <div class={cx(bpA.jixoaiThemeSwatch)}>
          <div class={cx(bpA.jixoaiThemeChip)} style="background: {sample.css}"></div>
          <span class={cx(bpA.jixoaiThemeChipLabel)}>{sample.hue}</span>
        </div>
      {/each}
    </div>
  </div>
  <div class={cx(bpA.jixoaiThemeRow)}>
    <span class={cx(bpA.jixoaiThemeRowLabel)}
      >tokens</span
    >
    <Grid cols={6} gap="12" class={cx(bpA.jixoaiThemeGrid)}>
      {#each tokens as token (token.name)}
        <div>
          <div class={cx(bpA.jixoaiThemeChip)} style="background: {token.css}"></div>
          <span class={cx(bpA.jixoaiThemeChipLabel)}>{token.name}</span>
        </div>
      {/each}
    </Grid>
  </div>
  <div class={cx(bpA.jixoaiThemeRow)}>
    <span class={cx(bpA.jixoaiThemeRowLabel)}
      >the law</span
    >
    <p class={cx(bpA.jixoaiThemeLaw)}>
      one hue is the whole identity — OKLCH everywhere, radius 0, hard offset shadows; the sheet
      is plain CSS variables, nothing to hydrate.
    </p>
  </div>
</div>

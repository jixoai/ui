<!-- boot-splash blueprint (the FOUC round, 2026-09-19): the frozen
     boot window — the mask at manual reveal (open, never dismissed),
     exactly the bytes the served HTML carries: hardcoded grounds, the
     SMIL arc spinner, the monospace voice. The stage box carries a
     transform so the layer's position:fixed resolves against IT (the
     CSS containment law: a transformed ancestor is the containing
     block for fixed descendants) — the iconic full-bleed card, without
     veiling the whole gallery page. -->
<script lang="ts">
  import BootSplash from '$lib/ui/boot-splash';
  import Stack from '$lib/ui/stack';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<Stack direction="column" justify="center" gap="12" class={cx(bpA.bootSplashStage)}>
  <!-- the transform box: fixed resolves here, overflow clips the
       inset-0 layer into the card -->
  <div class={cx(bpA.bootSplashFrame)}>
    <BootSplash
      revealOn="manual"
      title="your-app"
      subtitle="the terminal design language"
      description="loading the style sheet…"
      exit="blur-out"
    />
  </div>
  <Stack gap="8" align="center" wrap class={cx(bpA.bootSplashNotes)}>
    <span class={cx(bpA.bootSplashChip)}>zero css files</span>
    <span class={cx(bpA.bootSplashChip)}>head-inline keyframes</span>
    <span class={cx(bpA.bootSplashChip)}>SMIL spinner default</span>
    <span class={cx(bpA.bootSplashChip)}>opacity-out · blur-out</span>
  </Stack>
</Stack>

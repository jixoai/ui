<!--
  P0.1 folder-css contract probe (tw4-css-modularization, 2026-08-24;
  tailwindless W4, 2026-09-19): the layer-law arm (#6) rides stylex
  atoms now — the TW utility pool died with the engine. Scratch
  artifact — NOT a registry item, NOT part of the mirror set; kept
  because the verify script is a permanent guard.

  What it exercises (the D2 folder-css contract):
  1. css loaded by RELATIVE side-effect import from this file;
  2. css contains ONLY standard CSS: @layer components + :where(),
     a pseudo-element build, an @container block, token custom props;
  3. NO @utility (forbidden in folder css — no engine context);
  4. a stylex ATOM must BEAT the :where() rule (layer law) — the
     verify script reloads with ?pad=32&ink=primary and this
     component applies the atoms param-driven (browser-side only,
     effects never run SSR);
  5. the sheet must load EXACTLY once even when also imported by the
     host route (duplicate-import probe).
-->
<script lang="ts">
  import './folder-css-probe.css';
  import { probeStyles } from './folder-css-probe.stylex';

  // the layer-law arm's inputs: read once per load (non-reactive
  // input, so the effect settles)
  let pad32 = $state(false);
  let inkPrimary = $state(false);
  $effect(() => {
    const p = new URLSearchParams(window.location.search);
    pad32 = p.get('pad') === '32';
    inkPrimary = p.get('ink') === 'primary';
  });

  // the component's local join (the separator serialize law): plain
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

<div class={cx('jx-probe', pad32 && probeStyles.pad32)} data-probe="root">
  <p class={cx('jx-probe-lane', inkPrimary && probeStyles.inkPrimary)} data-probe="lane">lane text</p>
  <div class="jx-probe-frame" data-probe="frame">
    <div class="jx-probe-box" data-probe="box">box</div>
  </div>
</div>

<!--
  P0.1 folder-css contract probe (tw4-css-modularization, 2026-08-24).
  Scratch artifact — NOT a registry item, NOT part of the mirror set;
  deleted after the P0 evidence lands in design.md D2 (or kept only if
  the verify script becomes a permanent guard).

  What it exercises (the D2 folder-css contract):
  1. css loaded by RELATIVE side-effect import from this file;
  2. css contains ONLY standard CSS: @layer components + :where(),
     a pseudo-element build, an @container block, token custom props;
  3. NO @utility (forbidden in folder css — no Tailwind context);
  4. a consumer utility must BEAT the :where() rule (layer law) —
     the verify script toggles utilities that the route statically
     references (Tailwind only generates scanned classes);
  5. the sheet must load EXACTLY once even when also imported by the
     host route (duplicate-import probe).
-->
<script lang="ts">
  import './folder-css-probe.css';
</script>

<div class="jx-probe" data-probe="root">
  <p class="jx-probe-lane" data-probe="lane">lane text</p>
  <div class="jx-probe-frame" data-probe="frame">
    <div class="jx-probe-box" data-probe="box">box</div>
  </div>
</div>

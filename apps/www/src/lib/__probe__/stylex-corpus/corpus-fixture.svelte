<!--
  stylex-corpus fixture (apps/www/src/lib/__probe__/stylex-corpus/
  corpus-fixture.svelte).

  stylex-kernel-phase0 P0.6: the corpus dogfood is a BUILD fixture,
  not a shipped page (design §6 — no production component switches
  paint; phase 1 owns the real <item>.stylex.ts authoring in place).
  This component exists for ONE reason: keep the 9 dogfood modules
  (8 research families + the demo chrome) in the real www build graph
  so the engine's transform collects their atoms into the emitted CSS
  — collection happens at TRANSFORM time, and every export object is
  referenced below so no tree-shaker can drop a module. It renders
  nothing visible: a single hidden marker whose attribute counts the
  compiled atom tables (zero paint, zero runtime beyond one
  Object.keys pass at init).
-->

<script lang="ts">
  import { codeCardStyles } from './code-card.stylex';
  import { iconStyles } from './icon.stylex';
  import { popoverStyles } from './popover.stylex';
  import { pressButtonStyles } from './press-button.stylex';
  import { proseStyles } from './prose.stylex';
  import { rangeStyles } from './range.stylex';
  import { separatorStyles } from './separator.stylex';
  import { switchStyles } from './switch.stylex';
  import { demo } from './demo.stylex';

  // the compiled class tables are plain objects (debug:true) — the
  // count is the retention evidence; every family is referenced
  const tables = [
    ['code-card', codeCardStyles],
    ['icon', iconStyles],
    ['popover', popoverStyles],
    ['press-button', pressButtonStyles],
    ['prose', proseStyles],
    ['range', rangeStyles],
    ['separator', separatorStyles],
    ['switch', switchStyles],
    ['demo', demo],
  ] as const;

  const atomCount = tables.reduce((n, [, t]) => n + Object.keys(t).length, 0);
</script>

<div hidden data-stylex-corpus="{tables.length} modules · {atomCount} atoms"></div>

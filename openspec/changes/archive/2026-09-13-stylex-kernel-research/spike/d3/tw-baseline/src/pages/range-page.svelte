<script lang="ts">
  import Range from '../ui/range/index.ts';

  let v1 = $state(40);
  let v2 = $state(70);
</script>

<h1 class="text-lg font-semibold mb-2">range — law mount × tick ruler × error law</h1>
<p class="text-muted-foreground mb-4 max-w-prose">
  The TW form: the generated range law mount rides the theme sheet; scaffolding via token
  utilities. Bind, tick ruler, error ring.
</p>

<section class="mb-4" data-range-section="basic">
  <h2 class="mb-2">basic bind</h2>
  <Range bind:value={v1} label="volume" min={0} max={100} step={5} id="rng-basic" />
</section>

<section class="mb-4" data-range-section="ticks">
  <h2 class="mb-2">the tick ruler</h2>
  <Range bind:value={v2} label="gain" min={0} max={100} step={10} ticks id="rng-ticks" />
</section>

<section class="mb-4" data-range-section="error">
  <h2 class="mb-2">the error law (dashed-ring thumb)</h2>
  <Range bind:value={v2} label="invalid" min={0} max={100} step={10} error="out of range" id="rng-err" />
</section>

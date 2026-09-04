<!--
  list-item fusion prototype (2026-09-05, single-prototype edition).
  Owner ruling: build ONE refined surface first; variants only after
  it earns them. Isolated per the prototype skill — nothing in
  production imports from here; this page imports production
  components to stage them. The fusion laws live in ./lib/fusion.css.
-->
<script lang="ts">
  import Fusion from './lib/fusion.svelte';
</script>

<main class="p-stage">
  <Fusion />
</main>

<style>
  .p-stage {
    max-width: 60rem;
    margin-inline: auto;
    padding: 2.5rem 1.25rem 4rem;
  }
</style>

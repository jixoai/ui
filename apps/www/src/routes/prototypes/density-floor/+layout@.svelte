<!--
  prototype layout escape (2026-08-29): the density-floor prototype page
  needs the production css chain (app.css) but NOT the site chrome
  (scaffold nav / terminal footer) — a bare surface so the comparison
  isn't visually anchored to the site's own density. Deleted together
  with the prototype on pick.
-->
<script lang="ts">
  import '../../../app.css';
  let { children } = $props();
</script>

{@render children()}

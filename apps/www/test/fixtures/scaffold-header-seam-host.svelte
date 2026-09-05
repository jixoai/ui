<!--
  website-scaffold header-seam host (2026-09-05): mounts the scaffold
  with the minimal chrome so the spec can pin WHERE the RO's measured
  --jx-header-h correction lands (.jx-shell, the var's declaring scope
  — a host-level write is shadowed by .jx-shell's own re-declaration,
  the toc-flush bug).
-->
<script lang="ts">
  import WebsiteScaffold from '../../src/lib/ui/website-scaffold/website-scaffold.svelte';
</script>

<WebsiteScaffold>
  {#snippet header()}
    <div data-band>header</div>
  {/snippet}
  <main>body</main>
</WebsiteScaffold>

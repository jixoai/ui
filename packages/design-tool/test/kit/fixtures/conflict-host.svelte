<!--
  prototype-kit test fixture: two frames sharing one id inside one
  canvas — the dev warning path; both render, the first is the anchor.
-->
<script lang="ts">
  import PrototypeCanvas, { PrototypePage } from '../../../../../registry/files/ui/prototype-kit';
</script>

<PrototypeCanvas prototype="welcome" gridCols={1}>
  <PrototypePage id="dup" ref="./pages/first.svelte" width={100} height={50} />
  <PrototypePage id="dup" ref="./pages/second.svelte" width={100} height={50} />
</PrototypeCanvas>

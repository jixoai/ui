<!--
  prototype-kit test fixture: nested canvas WITHOUT its own prototype
  prop — the inner frames must inherit the outer name through context.
-->
<script lang="ts">
  import PrototypeCanvas, { PrototypePage } from '../../../../../registry/files/ui/prototype-kit';
</script>

<PrototypeCanvas prototype="inherited-outer" gridCols={1}>
  <PrototypeCanvas gridCols={1}>
    <PrototypePage id="inherited-p" ref="./pages/x.svelte" width={100} height={50} />
  </PrototypeCanvas>
</PrototypeCanvas>

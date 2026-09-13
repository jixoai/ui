<!--
  prototype-kit test fixture: nested canvases — the inner canvas
  OVERRIDES the prototype name; frames in each scope build URLs from
  their nearest canvas.
-->
<script lang="ts">
  import PrototypeCanvas, { PrototypePage } from '../../../../../registry/files/ui/prototype-kit';
</script>

<PrototypeCanvas prototype="outer" gridCols={2}>
  <PrototypePage id="outer-p" ref="./pages/outer.svelte" width={200} height={100} />
  <PrototypeCanvas prototype="inner" gridCols={1}>
    <PrototypePage id="inner-p" ref="./pages/inner.svelte" width={120} height={80} />
  </PrototypeCanvas>
</PrototypeCanvas>

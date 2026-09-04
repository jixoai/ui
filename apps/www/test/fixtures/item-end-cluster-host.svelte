<!--
  ItemEndClusterHost — B6 boundary fixture: a joined control cluster
  (three buttons) inside the end lane. The lane's contract is
  gap/align/wrap ONLY — it never injects separators, margins or
  radius into the cluster's children (ButtonGroup owns its own seams;
  this fixture uses bare buttons so the law is proven WITHOUT
  depending on the button-group implementation).
-->
<script lang="ts">
  import { ItemGroup, Item, ItemContent, ItemTitle, ItemEnd } from '$lib/ui/list-item';
</script>

<ItemGroup label="cluster host">
  <Item>
    <ItemContent><ItemTitle>cluster row</ItemTitle></ItemContent>
    <ItemEnd wrap="never">
      <button type="button" data-probe="a">Acknowledge</button>
      <button type="button" data-probe="b">Snooze</button>
      <button type="button" data-probe="c">Escalate</button>
    </ItemEnd>
  </Item>
</ItemGroup>

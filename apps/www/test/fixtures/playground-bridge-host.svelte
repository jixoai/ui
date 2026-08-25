<!-- task 4 bridge fixture: PlayRow on ItemField + the leaf controls -->
<script lang="ts">
  import { PlayFields, PlayRow, PlayToggle, PlaySelect } from '../../src/lib/playground';
  let on = $state(false);
  let mode = $state('a');
</script>

<PlayFields>
  <PlayRow label="autoplay" hint="runs on mount">
    <PlayToggle bind:value={on} />
  </PlayRow>
  <PlayRow label="mode">
    <PlaySelect options={[{ value: 'a', label: 'a' }, { value: 'b', label: 'b' }]} bind:value={mode} />
  </PlayRow>
</PlayFields>

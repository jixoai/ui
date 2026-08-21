<!--
  Test host for the avatar failure-recovery contract: the button flips
  src from a broken URL to a fresh one so a test can observe the
  failure state resetting across the prop change.
-->
<script lang="ts">
  import Avatar from '../../src/lib/ui/avatar.svelte';

  let src = $state('/missing.png');

  const swap = (): void => {
    src = '/fresh.png';
  };
</script>

<button type="button" onclick={swap}>swap</button>
<Avatar {src} name="Ada Lovelace" />

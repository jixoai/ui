<!-- textarea blueprint: the slotted shell — toolbar row above a filled
     value, draft status + "N / maxLength" count below the hairlines. -->
<script lang="ts">
  import Textarea from '$lib/ui/textarea.svelte';

  let notes = $state('Publish the form family: nineteen controls, one box law, zero dependencies.');
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <div class="w-full max-w-[480px]">
    <Textarea id="bp-textarea" label="release notes" rows={6} maxlength={280} count bind:value={notes}>
      {#snippet innerBlockStart()}<span>bold</span><span>italic</span><span>code</span>{/snippet}
      {#snippet innerBlockEnd()}<span>draft</span>{/snippet}
    </Textarea>
  </div>
</div>

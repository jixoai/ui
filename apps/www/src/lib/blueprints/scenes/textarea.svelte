<!-- textarea blueprint: the slotted shell — toolbar row above a filled
     value, draft status + "N / maxLength" count below the hairlines.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Textarea from '$lib/ui/textarea/textarea.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  let notes = $state('Publish the form family: nineteen controls, one box law, zero dependencies.');
</script>

<div class={cx(bpB.textareaStage)}>
  <div class={cx(bpB.textareaCard)}>
    <Textarea id="bp-textarea" label="release notes" rows={6} maxlength={280} count bind:value={notes}>
      {#snippet innerBlockStart()}<span>bold</span><span>italic</span><span>code</span>{/snippet}
      {#snippet innerBlockEnd()}<span>draft</span>{/snippet}
    </Textarea>
  </div>
</div>

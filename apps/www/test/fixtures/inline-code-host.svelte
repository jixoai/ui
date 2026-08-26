<!--
  Test host for the InlineCode children contract: text, lang, variant and
  a consumer class are reactive so a test drives every language path
  through real markup children (the snippet a consumer authors), not
  synthetic props.
-->
<script lang="ts">
  import InlineCode from '../../src/lib/ui/inline-code/inline-code.svelte';

  let {
    text = 'const value: number = 42',
    lang = 'ts',
    variant = undefined,
    consumerClass = '',
  }: {
    text?: string;
    lang?: string;
    variant?: 'tonal' | 'outline';
    consumerClass?: string;
  } = $props();
</script>

<InlineCode {lang} {variant} class={consumerClass || undefined}>{text}</InlineCode>

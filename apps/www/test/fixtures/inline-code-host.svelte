<!--
  Test host for the InlineCode contracts: text, lang, variant, the
  six modifier props (mods) and a consumer class are reactive so a
  test drives every path through real markup children (the snippet a
  consumer authors), not synthetic props. backend exercises the
  engine seam's PROP lane; contextBackend provides HIGHLIGHT_KEY at
  this subtree root (the app-layer wiring shape, the code-card
  backend-host precedent) so the CONTEXT lane is observable too.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import InlineCode from '../../src/lib/ui/inline-code/inline-code.svelte';
  import { HIGHLIGHT_KEY, type HighlightContextValue } from '../../src/lib/highlight/context-key';
  import type { HighlightBackend } from '../../src/lib/highlight/backend';
  import type { TextStyleProps } from '../../src/lib/text-style.svelte';

  let {
    text = 'const value: number = 42',
    lang = 'ts',
    variant = undefined,
    consumerClass = '',
    backend = undefined,
    contextBackend = undefined,
    mods = undefined,
  }: {
    text?: string;
    lang?: string;
    variant?: 'fused' | 'tonal' | 'outline';
    consumerClass?: string;
    backend?: HighlightBackend;
    contextBackend?: HighlightBackend;
    mods?: TextStyleProps;
  } = $props();

  // the app-layer provider shape: setContext at this subtree root,
  // init-time capture (the provide-time coordinate law). The ignore
  // comment below quiets the "reference it inside a closure" warning
  // this test host deliberately declines.
  // svelte-ignore state_referenced_locally
  if (contextBackend !== undefined) {
    // svelte-ignore state_referenced_locally
    setContext(HIGHLIGHT_KEY, { backend: contextBackend } satisfies HighlightContextValue);
  }

  // an empty spread is a no-op — absent mods pass nothing through
  // svelte-ignore state_referenced_locally
  const styleMods = mods ?? {};
</script>

<InlineCode {lang} {variant} {backend} {...styleMods} class={consumerClass || undefined}>{text}</InlineCode>

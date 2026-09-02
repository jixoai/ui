<!--
  Test host for the CodeCard backend contract (highlight-backend-pluggable,
  2026-09-02): creates the highlight default-backend context at THIS subtree
  root (the app-layer wiring shape — a page or any subtree), optionally under
  a plugin root (the kernel endorsement), renders one card WITHOUT a backend
  prop (eats the context default), one WITH an explicit prop (prop beats
  context), and exposes the context's set() through buttons so the live
  runtime switch is observable.
-->
<script lang="ts">
  import CodeCard from '../../src/lib/ui/code-card/code-card.svelte';
  import { createHighlightContext } from '../../src/lib/highlight/context.svelte';
  import { microLighter } from '../../src/lib/highlight/microlighter';
  import { prismjs } from '../../src/lib/highlight/prismjs';
  import { shiki } from '../../src/lib/highlight/shiki';
  import type { HighlightBackend } from '../../src/lib/highlight/backend';
  import { provideContextPlugins, type UnknownPlugin } from '../../src/lib/context-plugin.svelte';

  let {
    initial,
    plugins = [],
  }: { initial?: HighlightBackend; plugins?: UnknownPlugin[] } = $props();

  // the print layer's coordinate law, mirrored: plugin root FIRST (its
  // scope is what the context instance captures), context second.
  // Init-time capture of the props is the point (provide-time capture
  // coordinate) — the svelte-ignore silences the "reference it inside
  // a closure" warning this test host deliberately declines.
  // svelte-ignore state_referenced_locally
  if (plugins.length > 0) provideContextPlugins(plugins);
  // svelte-ignore state_referenced_locally
  const highlight = createHighlightContext(initial);

  const toMicrolighter = (): void => {
    highlight.set(microLighter());
  };
  const toPrism = (): void => {
    highlight.set(prismjs());
  };
  const toShiki = (): void => {
    highlight.set(shiki());
  };
</script>

<button type="button" onclick={toMicrolighter}>microlighter</button>
<button type="button" onclick={toPrism}>prism</button>
<button type="button" onclick={toShiki}>shiki</button>

<CodeCard code="const value: number = 42;" lang="ts" filename="context-default.ts" />
<CodeCard code="const value: number = 42;" lang="ts" filename="prop-override.ts" backend={shiki()} />

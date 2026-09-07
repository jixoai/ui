<!--
  Test host for the HIGHLIGHT_DETECT_DEF plugin projection
  (highlight-lang-detector D8.2): plugin root FIRST (the scope the
  context instance captures), createHighlightDetectContext second —
  the backend host's coordinate law mirrored for the detect seam.
-->
<script lang="ts">
  import CodeCard from '../../src/lib/ui/code-card/code-card.svelte';
  import { createHighlightDetectContext } from '../../src/lib/highlight/context.svelte';
  import { provideContextPlugins, type UnknownPlugin } from '../../src/lib/context-plugin.svelte';
  import type { HighlightBackend } from '../../src/lib/highlight/backend';

  let {
    plugins = [],
    backend,
  }: { plugins?: UnknownPlugin[]; backend?: HighlightBackend } = $props();

  // svelte-ignore state_referenced_locally
  if (plugins.length > 0) provideContextPlugins(plugins);
  // svelte-ignore state_referenced_locally
  createHighlightDetectContext();
</script>

<CodeCard code="def f(): pass" lang="auto" filename="script.py" {backend} />

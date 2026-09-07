<!--
  HighlightDetectDefault (registry/files/ui/highlight-detect-default/
  highlight-detect-default.svelte, highlight-lang-detector, 2026-09-07).
  The DLD context provider as a CHILDREN WRAPPER — the frozen D2.2 form
  ①, whose implementation IS form ② (one setContext at init). Wrapping
  a subtree makes defaultLangDetector() (the four-layer waterfall:
  filename → shebang → structure → betlang) the detection default for
  every <CodeCard lang="auto"> inside it; the langDetector prop and the
  backend's own detector keep their ring priority (prop → context →
  backend). Svelte context propagates DOWNWARD ONLY — sibling subtrees
  outside the wrapper are untouched, and nested wrappers take the
  nearest (the scope law). ~10 lines on purpose: this component adds
  wiring, not behavior.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { HIGHLIGHT_DETECT_KEY } from '$lib/highlight/context-key';
  import { defaultLangDetector } from '$lib/highlight/default-detector';

  let { children }: { children: Snippet } = $props();

  setContext(HIGHLIGHT_DETECT_KEY, { detector: defaultLangDetector() });
</script>

{@render children()}

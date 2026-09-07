<!--
  Test host for the CodeCard AUTO_LANG chain (highlight-lang-detector,
  2026-09-07): provides the HIGHLIGHT_DETECT_KEY context at this subtree
  root — the { detector } adapter shape, the second orthogonal seam — and
  renders one card whose lang/filename/backend/langDetector props are all
  caller-controlled. The ring under test is chosen by what the caller
  passes (and what it deliberately omits).
-->
<script lang="ts">
  import CodeCard from '../../src/lib/ui/code-card/code-card.svelte';
  import { setContext } from 'svelte';
  import {
    HIGHLIGHT_DETECT_KEY,
    type HighlightDetectContextValue,
  } from '../../src/lib/highlight/context-key';
  import type { LanguageDetector } from '../../src/lib/highlight/lang-detector';
  import type { HighlightBackend } from '../../src/lib/highlight/backend';

  let {
    detector,
    lang = 'auto',
    filename = '',
    code = 'const value: number = 42;',
    backend,
    langDetector,
  }: {
    detector?: LanguageDetector;
    lang?: string;
    filename?: string;
    code?: string;
    backend?: HighlightBackend;
    langDetector?: LanguageDetector;
  } = $props();

  // init-time capture is the point (the context seam's provide-time
  // coordinate, mirroring the backend host's deliberate pattern)
  // svelte-ignore state_referenced_locally
  setContext(HIGHLIGHT_DETECT_KEY, { detector } satisfies HighlightDetectContextValue);
</script>

<CodeCard {code} {lang} {filename} {backend} {langDetector} />

<!--
  jixoai math inline (registry/files/ui/math-inline/math-inline.svelte).
  The inline math surface: ONE native <span> carrying real KaTeX markup
  rendered SYNCHRONOUSLY — the isomorphic-small SSR lane (the
  load-bearing ruling): the engine is small and sync, so prerender bakes
  the markup itself; no plain-text floor, no hydration work, no flash.
  No chrome, no controls; the span inherits prose currentColor — light/
  dark inverts with ZERO re-render (katex paints in currentColor; the
  engine css + fonts ride the $lib/katex import).

  role="math" sits on this span and only here: the span contains nothing
  but the formula output (no controls inside to flatten), and katex's
  hidden MathML is the screen-reader path — NO aria-label default (it
  would shadow the MathML); a consumer-provided aria-* rides rest and
  lands.

  Rest-attributes contract: {...rest} spreads FIRST, the component's own
  data-jx-math-inline/role stamps AFTER (Svelte later-wins) — consumer
  data-testid/title/aria-*/handlers pass through untouched while the
  component's semantic fields cannot be overridden by a same-named
  consumer attribute; class merges through the destructured class prop
  (never a className prop in Svelte).

  No css file (the folder-css law requires one only when a law needs
  it): katex css arrives via $lib/katex; this surface owns no paint.

  Intent (2026-09-06, Owner): "引入开箱即用的 KaTeX/Mermaid 渲染组件".
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { KatexOptions } from 'katex';
  import { cn } from '$lib/utils';
  import { renderTex } from '$lib/katex';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    /** TeX source (runtime string, rendered synchronously in inline mode). */
    tex: string;
    /** KaTeX macros — merged per key over the site-level registerMacros table. */
    macros?: KatexOptions['macros'];
    /** KaTeX strict mode passthrough (boolean | 'ignore'|'warn'|'error' | handler). */
    strict?: KatexOptions['strict'];
    /** KaTeX trust passthrough (boolean | handler). */
    trust?: KatexOptions['trust'];
  }

  let {
    tex,
    macros,
    strict,
    trust,
    class: className = '',
    ...rest
  }: Props = $props();

  /**
   * SYNC RENDER (the lane ruling): the markup IS the paint — prerender
   * bakes real katex output, a tex prop change re-derives live. The
   * facade default throwOnError:false paints invalid TeX in place (the
   * katex-error run in var(--error), katex's own output); a
   * caller-forced throw (e.g. a throwing macro function) is caught
   * here — errors never escape a component boundary — degrading to the
   * escaped raw source + one console.warn.
   */
  const rendered = $derived.by(() => {
    try {
      return renderTex(tex, { displayMode: false, macros, strict, trust });
    } catch (error) {
      console.warn('[jixoai/math-inline] KaTeX render failed; painting raw source:', error);
      return escapeSource(tex);
    }
  });

  /** minimal HTML escaping for the raw-source fallback paint */
  function escapeSource(source: string): string {
    return source
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
</script>

<span {...rest} data-jx-math-inline="" role="math" class={cn(className)}>{@html rendered}</span>

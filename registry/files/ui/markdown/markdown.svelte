<!--
  jixoai markdown root (registry/files/ui/markdown/markdown.svelte).

  2026-09-06 · markdown-streaming (original request: "2026-09-06 用户：
  推出 markdown 渲染组件，支持流式渲染，AST 映射内部组件").

  Orthogonal intents:
  1. root scope — one <div class="jx-pure" data-jx-markdown> mounting the
     Tier-0 face by CLASS (the face's own consumption law: imported
     ONCE from the site css — app.css here, the documented site-css
     import for registry consumers — and mounted on any DOM; never a
     forked copy of the face laws, never a second component-level
     import: the import duplicated the whole sheet into this chunk on
     the site build and broke the B-face budget). cn() merges the
     consumer class, rest props pass through untouched.
  2. parse binding — ONE adapter per component instance (createMarkdownParser
     owns the md instance + stream cache; the keyed-block state machine is
     its law, design §2.1/§2.2), re-derived per (source, streaming)
     snapshot: the component is a pure function of its props (the SSR
     snapshot law, §2.3).
  3. keyed blocks — {#each (block.key)} is the L1–L4 memoization seam:
     prefix keys freeze, the streaming tail keeps its :tail key, remounts
     stay bounded to one per semantic event.
  4. streaming stamp — data-jx-markdown-streaming is boolean-presence on
     the root and the cursor <span> trails the LAST block while streaming
     (markdown.css owns the blink law); both vanish the moment it stops.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { createMarkdownParser, type MarkdownComponents } from './parse';
  import MarkdownNode from './markdown-node.svelte';
  import './markdown.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Markdown source — a value-domain payload (the code-card precedent). */
    source: string;
    /** Opt-in streaming face: cursor + tail-key semantics (default: a static, final document). */
    streaming?: boolean;
    /** Per-node-type renderer overrides — trusted application code (design §3.3). */
    components?: MarkdownComponents;
  }

  let {
    source,
    streaming = false,
    components,
    class: className = '',
    style,
    children,
    ...rest
  }: Props = $props();

  // one adapter per INSTANCE — the streaming cache is component state,
  // never module state (two <Markdown> must never share a stream)
  const parser = createMarkdownParser();
  const parsed = $derived(parser(source, streaming));
</script>

<div
  class={cn('jx-pure', className)}
  data-jx-markdown
  data-jx-markdown-streaming={streaming ? '' : undefined}
  {style}
  {...rest}
>
  {#each parsed.blocks as block (block.key)}
    <MarkdownNode node={block.node} {components} />
  {/each}
  {#if streaming}
    <span data-jx-markdown-cursor aria-hidden="true"></span>
  {/if}
</div>

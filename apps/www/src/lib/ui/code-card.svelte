<!--
  jixoai code card (registry/files/ui/code-card.svelte).
  Readonly code surface generalized from the www CodeBlock: <figure> +
  <pre><code> base, optional filename-tab head (font-nav on the accent-tinted
  meta strip), zero-dep deterministic tokenizer (lib/highlight.ts), horizontal
  overflow with Tab characters preserved (pre native), and a footer bar with
  a compact copy control (press-button physics + `copied` variant feedback).

  `code` is a runtime prop, never markup-inlined text: the tokenizer escapes
  first, so a sample containing a literal closing-script tag is inert data
  and cannot terminate the host page's script — consumers owe no
  template-level escaping.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { highlight } from '$lib/highlight';

  interface Props {
    /** Code sample (runtime string; HTML-significant characters are escaped). */
    code: string;
    /** Tokenizer language hint (ts/js/svelte/css/bash/json + aliases). Not a parser. */
    lang?: string;
    /** Filename tab on the head's left. The head renders when filename or header exists. */
    filename?: string;
    /** Custom head-right area; fully replaces the default lang label (filename stays left). */
    header?: Snippet;
    /** Custom footer content on the footer bar's left. */
    footer?: Snippet;
    /** Copy control on the footer bar's right (press physics, copied feedback). */
    copyable?: boolean;
    class?: string;
  }

  let {
    code,
    lang = 'ts',
    filename = '',
    header,
    footer,
    copyable = true,
    class: className = '',
  }: Props = $props();

  const html = $derived(highlight(code, lang));

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  const copyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // preview servers / embedded contexts without a clipboard grant
      const area = document.createElement('textarea');
      area.value = code;
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1600);
  };
</script>

<figure class={`jx-code-card ${className}`}>
  {#if filename || header}
    <figcaption class="jx-code-card-head">
      {#if filename}
        <span class="jx-code-card-file">{filename}</span>
      {/if}
      <span class="jx-code-card-side">
        {#if header}
          {@render header()}
        {:else}
          <span class="jx-code-card-lang">{lang}</span>
        {/if}
      </span>
    </figcaption>
  {/if}
  <pre data-lang={lang}><code>{@html html}</code></pre>
  {#if footer || copyable}
    <div class="jx-code-card-foot">
      <span class="jx-code-card-foot-side">
        {#if footer}
          {@render footer()}
        {/if}
      </span>
      {#if copyable}
        <button
          type="button"
          class="jx-code-card-copy"
          class:copied
          onclick={copyCode}
          aria-label={copied ? 'copied' : `copy ${filename || lang} sample`}
        >
          {#if copied}
            <svg
              class="jx-code-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>copied</span>
          {:else}
            <svg
              class="jx-code-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="12" height="12" rx="0" />
              <path d="M5 15V4a1 1 0 0 1 1-1h10" />
            </svg>
            <span>copy</span>
          {/if}
        </button>
      {/if}
    </div>
  {/if}
</figure>

<style>
  /* readonly-code law (design-tokens.md supplements): the scoped token
     definitions mirror the documented values so the card is self-sufficient
     with only the jixoai-theme sheet installed. */
  .jx-code-card {
    --readonly-code-bg: color-mix(in oklab, var(--muted) 42%, var(--background));
    --readonly-code-border: color-mix(in oklab, var(--border) 18%, transparent);
    --readonly-code-meta-bg: color-mix(in oklab, var(--accent) 12%, var(--background));
    --readonly-code-meta-fg: color-mix(in oklab, var(--accent) 58%, var(--foreground));

    /* tokenizer palette: primary family + muted */
    --tok-comment: color-mix(in oklab, var(--foreground) 44%, transparent);
    --tok-string: var(--accent);
    --tok-keyword: var(--primary);
    --tok-number: color-mix(in oklab, var(--secondary) 78%, var(--foreground));
    --tok-function: color-mix(in oklab, var(--primary) 62%, var(--foreground));
    --tok-tag: var(--muted-foreground);

    background: var(--readonly-code-bg);
    border: 1px solid var(--readonly-code-border);
    margin: 0;
  }
  :global(.dark) .jx-code-card {
    --readonly-code-bg: color-mix(in oklab, var(--muted) 78%, var(--background));
    --readonly-code-meta-bg: color-mix(in oklab, var(--accent) 18%, var(--background));
    --readonly-code-meta-fg: color-mix(in oklab, var(--accent) 60%, oklch(1 0 0));

    /* dark: brighter primary family */
    --tok-comment: color-mix(in oklab, var(--foreground) 55%, transparent);
    --tok-number: var(--secondary);
    --tok-function: color-mix(in oklab, var(--primary) 58%, oklch(1 0 0));
    --tok-tag: var(--muted-foreground);
  }

  /* the pre keeps its native superpowers: Tab characters stay tabs, long
     lines scroll horizontally instead of wrapping */
  .jx-code-card pre {
    font-size: 12.5px;
    line-height: 1.6;
    margin: 0;
    overflow-x: auto;
    padding: 0.875rem;
    tab-size: 4;
  }

  .jx-code-card :global(.tok-comment) {
    color: var(--tok-comment);
  }
  .jx-code-card :global(.tok-string) {
    color: var(--tok-string);
  }
  .jx-code-card :global(.tok-keyword) {
    color: var(--tok-keyword);
  }
  .jx-code-card :global(.tok-number) {
    color: var(--tok-number);
  }
  .jx-code-card :global(.tok-function) {
    color: var(--tok-function);
  }
  .jx-code-card :global(.tok-tag) {
    color: var(--tok-tag);
  }

  /* head: hairline divider + font-nav filename tab on the meta tint */
  .jx-code-card-head {
    align-items: center;
    background: var(--readonly-code-meta-bg);
    border-bottom: 1px solid var(--readonly-code-border);
    color: var(--readonly-code-meta-fg);
    display: flex;
    font-size: 11px;
    gap: 0.75rem;
    letter-spacing: 0.08em;
    min-width: 0;
    padding: 0.32rem 0.75rem;
  }
  .jx-code-card-file {
    font-family: var(--font-nav);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-code-card-side {
    align-items: center;
    display: flex;
    margin-left: auto;
    min-width: 0;
  }
  .jx-code-card-lang {
    letter-spacing: 0.14em;
    opacity: 0.75;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* foot: hairline divider; custom content left, copy control right */
  .jx-code-card-foot {
    align-items: center;
    border-top: 1px solid var(--readonly-code-border);
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    min-height: 2.1rem;
    padding: 0.3rem 0.5rem 0.3rem 0.75rem;
  }
  .jx-code-card-foot-side {
    align-items: center;
    display: flex;
    min-width: 0;
  }

  /* compact copy control: the press-button grammar (shadow lift on hover,
     press on active) at card scale — press-button ships no size prop, so the
     same vocabulary is scoped here */
  .jx-code-card-copy {
    align-items: center;
    background: var(--background);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-2xs);
    color: var(--foreground);
    cursor: pointer;
    display: inline-flex;
    font-size: 11px;
    font-weight: 500;
    gap: 0.4rem;
    letter-spacing: 0.04em;
    padding: 0.25rem 0.6rem;
    transition:
      transform 150ms ease,
      box-shadow 150ms ease,
      background-color 150ms ease;
    white-space: nowrap;
  }
  .jx-code-card-copy:hover {
    background: var(--muted);
    box-shadow: var(--shadow-xs);
    transform: translate(-1px, -1px);
  }
  .jx-code-card-copy:active {
    box-shadow: none;
    transform: translate(1px, 1px);
  }
  .jx-code-card-copy.copied {
    background: var(--secondary);
    color: var(--secondary-foreground);
  }
  .jx-code-card-copy:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .jx-code-card-icon {
    height: 12px;
    width: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-code-card-copy {
      transition: none;
    }
  }
</style>

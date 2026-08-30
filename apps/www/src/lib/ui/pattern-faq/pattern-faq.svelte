<!--
  jixoai pattern-faq (registry/files/ui/pattern-faq/pattern-faq.svelte,
  2026-08-30, openspec 2026-08-30-terminal-patterns).
  The man-page FAQ: `{command}({section})` head, a NAME row with the
  print-style dotted leader, then the questions ride the Accordion
  family (details/summary — exclusive by default, FAQ reads better
  one-open; consumer authors AccordionItem children or bare
  <details>), closing on a SEE ALSO line. Nothing here re-implements
  disclosure — the accordion owns semantics, keyboard and SSR state;
  the pattern owns only the man framing.

  Composition-only laws (terminal-patterns delta): no atom prop is
  patched, no atom paint re-implemented; seeAlso stays a snippet so
  links compose as content.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { icons } from '$lib/icons';
  import Accordion from '$lib/ui/accordion/accordion.svelte';
  import './pattern-faq.css';

  interface Props {
    /** the man page's command name (head line) */
    command?: string;
    /** the man section number (7 = miscellany — the honest FAQ home) */
    section?: string;
    /** the NAME row's one-line description */
    summary?: string;
    /** one open at a time (default true — FAQ reads better exclusive) */
    exclusive?: boolean;
    /** the SEE ALSO footer content — compose links here */
    seeAlso?: Snippet;
    /** the questions: AccordionItem children (or bare <details>) */
    children: Snippet;
    class?: string;
  }

  let {
    command = 'jixoai-ui-faq',
    section = '7',
    summary = 'frequently asked questions, answered in the open',
    exclusive = true,
    seeAlso,
    children,
    class: className = '',
  }: Props = $props();
</script>

<article
  data-jx-pattern-faq=""
  class={`mx-auto w-full max-w-[52rem] ${className}`}
  aria-label={`${command}(${section}) — frequently asked questions`}
>
  <header class="border-b border-border pb-4">
    <p class="m-0 flex items-center gap-2 font-nav text-sm tracking-[0.06em]">
      <span class="inline-flex text-muted-foreground [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">{@html icons.fileText}</span>
      <strong class="text-foreground">{command}</strong>
      <span class="text-muted-foreground">({section})</span>
    </p>
    <p data-jx-pattern-faq-name="" class="jx-man-row m-0 mt-3">
      <span class="jx-man-label font-nav text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">NAME</span>
      <span class="jx-man-leader" aria-hidden="true"></span>
      <span class="min-w-0 text-[13px] leading-5 text-muted-foreground">{summary}</span>
    </p>
  </header>

  <div class="mt-5">
    <Accordion {exclusive}>
      {@render children()}
    </Accordion>
  </div>

  <footer class="mt-5 border-t border-border pt-4">
    <p data-jx-pattern-faq-see-also="" class="jx-man-row m-0">
      <span class="jx-man-label font-nav text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">SEE ALSO</span>
      <span class="jx-man-leader" aria-hidden="true"></span>
      <span class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-[13px] leading-5">
        {#if seeAlso}
          {@render seeAlso()}
        {:else}
          <span class="text-muted-foreground">jixoai-ui(1), patterns(7)</span>
        {/if}
      </span>
    </p>
  </footer>
</article>

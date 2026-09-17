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

  tailwindless one-shot W1 (2026-09-17): the framing paint rides the
  pattern's stylex atoms (pattern-faq.stylex.ts); the man LABEL voice
  (NAME / SEE ALSO) is the :where(.jx-man-label) semantic rule in
  pattern-faq.css (font-bold has no weight token — the tl-eyebrow
  composite precedent).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '$lib/ui/icon';
  import Accordion from '$lib/ui/accordion/accordion.svelte';
  import { patternFaqStyles } from './pattern-faq.stylex';
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

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        Object.entries(style).flatMap(([key, value]) =>
          key !== '$$css' && typeof value === 'string' ? [value] : [],
        ).join(' '),
      )
      .join(' ');
</script>

<article
  data-jx-pattern-faq=""
  class={`${cx(patternFaqStyles.shell)} ${className}`}
  aria-label={`${command}(${section}) — frequently asked questions`}
>
  <header class={cx(patternFaqStyles.header)}>
    <p class={cx(patternFaqStyles.commandRow)}>
      <span class={cx(patternFaqStyles.commandIcon)} aria-hidden="true"><Icon name="fileText" /></span>
      <strong class={cx(patternFaqStyles.commandName)}>{command}</strong>
      <span class={cx(patternFaqStyles.commandSection)}>({section})</span>
    </p>
    <p data-jx-pattern-faq-name="" class="jx-man-row {cx(patternFaqStyles.nameRow)}">
      <span class="jx-man-label">NAME</span>
      <span class="jx-man-leader" aria-hidden="true"></span>
      <span class={cx(patternFaqStyles.summary)}>{summary}</span>
    </p>
  </header>

  <div class={cx(patternFaqStyles.questions)}>
    <Accordion {exclusive}>
      {@render children()}
    </Accordion>
  </div>

  <footer class={cx(patternFaqStyles.footer)}>
    <p data-jx-pattern-faq-see-also="" class="jx-man-row {cx(patternFaqStyles.seeAlsoRow)}">
      <span class="jx-man-label">SEE ALSO</span>
      <span class="jx-man-leader" aria-hidden="true"></span>
      <span class={cx(patternFaqStyles.seeAlsoContent)}>
        {#if seeAlso}
          {@render seeAlso()}
        {:else}
          <span class={cx(patternFaqStyles.seeAlsoDefault)}>jixoai-ui(1), patterns(7)</span>
        {/if}
      </span>
    </p>
  </footer>
</article>

<!--
  Docs-install (apps/www/src/lib/docs-install.svelte, docs-demo-standard
  task 3.2 + 5.2): the skeleton's Install section, page-owned chrome.

  One component, both copy affordances, zero per-page copy:
    - the CLI command   `npx jixoai-ui add <name>`   (copy-command law)
    - the registry URL  `https://ui.jixoai.com/r/<item>.json` — the
      direct `shadcn add` path for non-CLI consumers (copy-icon-button
      law; the tooltip carries the full URL)

  `<item>` (effect-attachments Lane H, 2026-09-10) names the registry
  item backing the URL line and defaults to `name`: plain item pages
  pass only `name`; the scoped group form passes the MEMBER
  (`name="effects/glass" item="glass"` — the command is scoped, the
  URL stays the item's). `item={null}` omits the URL line — group ids
  (`add effects`) have no item payload to link.

  The section root carries data-doc-install — the skeleton lint's
  Install marker — and MUST render the command text verbatim inside
  the section (the lint greps `npx jixoai-ui add <name>`).

  TERMINAL SHELL (Owner walkthrough, 2026-09-24): the command rides a
  TerminalCard — the family's own traffic-light bar IS the window
  chrome (terminal-header is a standalone family; the card carries
  its bar in-piece), dark bezel per the bezel law, the command typed
  once on hydration (prerender/no-JS shows the settled terminal, so
  the lint's verbatim grep stays true) and the registry URL as the
  terminal's output line. The copy affordances sit in a slim row under
  the card.
-->
<script lang="ts">
  import CopyCommand from '$lib/copy-command.svelte';
  import CopyIconButton from '$lib/copy-icon-button.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import { siteChrome } from '$lib/surface/site-chrome.stylex';

  interface Props {
    /** the install argument: item name, group id, or group/name — the command */
    name: string;
    /** registry item backing the URL line (defaults to `name`; null omits the line) */
    item?: string | null;
  }

  let { name, item = name }: Props = $props();

  const command = `npx jixoai-ui add ${name}`;
  const registryUrl = item === null ? null : `https://ui.jixoai.com/r/${item}.json`;
  const outputs = registryUrl ? [registryUrl] : [];

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<section
  data-doc-install=""
  class={cx(siteChrome.diRoot)}
  aria-label="install {name}"
>
  <TerminalCard barTitle={`install — ${name}`} {command} {outputs} />
  <div class={cx(siteChrome.diActions)}>
    <span class={cx(siteChrome.diAuto)}>
      <CopyIconButton {command} />
    </span>
    <CopyCommand {command} label="copy command" />
  </div>
</section>

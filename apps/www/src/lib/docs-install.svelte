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
-->
<script lang="ts">
  import CopyCommand from '$lib/copy-command.svelte';
  import CopyIconButton from '$lib/copy-icon-button.svelte';

  interface Props {
    /** the install argument: item name, group id, or group/name — the command */
    name: string;
    /** registry item backing the URL line (defaults to `name`; null omits the line) */
    item?: string | null;
  }

  let { name, item = name }: Props = $props();

  const command = `npx jixoai-ui add ${name}`;
  const registryUrl = item === null ? null : `https://ui.jixoai.com/r/${item}.json`;
</script>

<section
  data-doc-install=""
  class="border-border bg-card/40 flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
  aria-label="install {name}"
>
  <div class="flex min-w-0 flex-col gap-1">
    <p class="text-primary font-nav text-[11px] uppercase tracking-[0.24em]">install</p>
    <p class="text-muted-foreground text-[12.5px] leading-5">
      <code class="text-accent font-mono">{command}</code>
      {#if registryUrl}
        — or point <code class="text-accent font-mono">shadcn add</code> at the item URL:
        <code class="text-accent font-mono break-all">{registryUrl}</code>
      {/if}
    </p>
  </div>
  <div class="flex shrink-0 items-center gap-2">
    <span class="pointer-events-auto">
      <CopyIconButton {command} />
    </span>
    <CopyCommand {command} label="copy command" />
  </div>
</section>

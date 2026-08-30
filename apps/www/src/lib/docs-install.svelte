<!--
  Docs-install (apps/www/src/lib/docs-install.svelte, docs-demo-standard
  task 3.2 + 5.2): the skeleton's Install section, page-owned chrome.

  One component, both copy affordances, zero per-page copy:
    - the CLI command   `npx jixoai-ui add <name>`   (copy-command law)
    - the registry URL  `https://ui.jixoai.com/r/<name>.json` — the
      direct `shadcn add` path for non-CLI consumers (copy-icon-button
      law; the tooltip carries the full URL)

  The section root carries data-doc-install — the skeleton lint's
  Install marker — and MUST render the command text verbatim inside
  the section (the lint greps `npx jixoai-ui add <name>`).
-->
<script lang="ts">
  import CopyCommand from '$lib/copy-command.svelte';
  import CopyIconButton from '$lib/copy-icon-button.svelte';

  interface Props {
    /** registry item name (the install argument) */
    name: string;
  }

  let { name }: Props = $props();

  const command = `npx jixoai-ui add ${name}`;
  const registryUrl = `https://ui.jixoai.com/r/${name}.json`;
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
      — or point <code class="text-accent font-mono">shadcn add</code> at the item URL:
      <code class="text-accent font-mono break-all">{registryUrl}</code>
    </p>
  </div>
  <div class="flex shrink-0 items-center gap-2">
    <span class="pointer-events-auto">
      <CopyIconButton {command} />
    </span>
    <CopyCommand {command} label="copy command" />
  </div>
</section>

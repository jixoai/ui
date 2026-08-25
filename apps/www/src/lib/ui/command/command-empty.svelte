<!--
  jixoai command empty (registry/files/ui/command/command-empty.svelte).
  The no-matches state: role=status (polite) — it is a STATE, not an
  option, so it never joins the walk. Statically rendered inside
  CommandList and revealed purely by CSS: the list's
  :not(:has([role=option]:not([hidden]))) inverse flips it visible
  (command.css; :has-less engines keep it visible — the documented
  degraded fallback). Default text 'no matches'; author children for
  anything richer.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children?: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<div
  data-jx-command-empty=""
  class={cn('px-[0.625rem] py-5 text-center text-[0.8125rem] text-muted-foreground', className)}
  role="status"
  {...rest}
>
  {#if children}{@render children()}{:else}no matches{/if}
</div>

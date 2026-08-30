<!--
  Docs-see-also (apps/www/src/lib/docs-see-also.svelte, docs-demo-standard
  task 5.2): the skeleton's closing section — related component links.

  DATA, not hand lists: the links derive from the docs-route-model's
  reading chain (componentContext(name).related — same-group neighbors,
  nearest first, design D7). The section root carries data-doc-see-also
  (the skeleton lint's marker) and must hold ≥1 link to another
  /docs/components/*.html page.
-->
<script lang="ts">
  import { componentContext } from '$lib/docs-route-model';

  interface Props {
    /** registry item name whose related components are listed */
    name: string;
  }

  let { name }: Props = $props();

  const related = $derived(componentContext(name)?.related ?? []);
</script>

<section data-doc-see-also="" aria-label="see also">
  <h2 class="font-nav text-balance text-[1.05rem] tracking-tight leading-tight sm:text-[1.22rem]">See Also</h2>
  {#if related.length > 0}
    <ul class="mt-3 flex flex-wrap gap-2">
      {#each related as item (item.entry.name)}
        <li>
          <a
            href={item.entry.href}
            class="border-border bg-card/40 hover:border-primary hover:text-primary inline-flex items-baseline gap-2 border px-3 py-1.5 text-[13px] transition-colors"
          >
            <span class="font-mono">{item.entry.name}</span>
            <span class="text-muted-foreground text-[11px]">{item.groupLabel}</span>
          </a>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-muted-foreground mt-3 text-[13px]">No same-group neighbors yet.</p>
  {/if}
</section>

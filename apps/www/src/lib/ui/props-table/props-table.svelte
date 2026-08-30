<!--
  jixoai PropsTable — the API reference table (Material3 API section).
  Four columns: Property | Type | Default | Description.

  Sources (docs-demo-standard 4.1): EITHER the single source of truth —
  the component's GENERATED meta (`meta` + the `docs` curation layer,
  see from-meta.ts) — OR the legacy hand-written `props` array kept as
  a fallback so unmigrated pages render unchanged. The table element
  carries data-doc-props-table: the skeleton lint's API-section marker.
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import { propsFromMeta, type PropsDocs } from './from-meta';
  import type { ComponentMeta } from '$lib/schema/ir';

  export interface PropEntry {
    name: string;
    type: string;
    default?: string;
    description: string;
    required?: boolean;
    bindable?: boolean;
  }

  interface Props {
    /** legacy hand-written rows (fallback; unmigrated pages) */
    props?: PropEntry[];
    /** the GENERATED meta — the single source of truth */
    meta?: ComponentMeta;
    /** docs curation layered over the meta (prose, flags, corrections) */
    docs?: PropsDocs;
    title?: string;
    class?: string;
  }

  let { props, meta, docs, title = 'Properties', class: className = '' }: Props = $props();

  // meta wins when both are given (the migration's direction); neither
  // is a dev-mode bug, named loudly instead of rendering an empty table
  let rows: PropEntry[] = $derived(
    meta ? propsFromMeta(meta, docs) : (props ?? []),
  );
  if (!meta && !props) {
    console.warn('[PropsTable] neither `meta` nor `props` given — empty table');
  }
</script>

<!-- data-jx-props-table-scroll: the print-projection markup contract
     (paged-doc-family, 2026-08-30) — the audited unlayered whitelist
     flattens this wrapper's overflow under print/sim so wide API
     tables flow instead of clipping. Component-owned stamp: pages
     never hand-write it (source-guarded). -->
<div data-jx-props-table-scroll="" class={cn('w-full overflow-x-auto', className)}>
  {#if title}
    <h4 class="font-nav mb-[var(--jx-stack)] text-[length:var(--jx-text)] font-medium">{title}</h4>
  {/if}
  <table data-doc-props-table="" class="w-full border-collapse text-left">
    <thead>
      <tr class="border-b border-border">
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Property</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Type</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Default</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Description</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as prop (prop.name)}
        <tr class="border-b border-border/50">
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">
            {prop.name}
            {#if prop.required}<span class="text-primary">*</span>{/if}
            {#if prop.bindable}<code class="text-muted-foreground text-[0.65rem] ml-1">bind</code>{/if}
          </td>
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground">
            {prop.type}
          </td>
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground">
            {prop.default ?? '—'}
          </td>
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text)]">
            {prop.description}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

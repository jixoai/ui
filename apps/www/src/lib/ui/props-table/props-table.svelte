<!--
  jixoai PropsTable — the API reference table (Material3 API section).
  Four columns: Property | Type | Default | Description.
-->
<script lang="ts">
  import { cn } from '$lib/utils';

  export interface PropEntry {
    name: string;
    type: string;
    default?: string;
    description: string;
    required?: boolean;
    bindable?: boolean;
  }

  interface Props {
    props: PropEntry[];
    title?: string;
    class?: string;
  }

  let { props, title = 'Properties', class: className = '' }: Props = $props();
</script>

<div class={cn('w-full overflow-x-auto', className)}>
  {#if title}
    <h4 class="font-nav mb-[var(--jx-stack)] text-[length:var(--jx-text)] font-medium">{title}</h4>
  {/if}
  <table class="w-full border-collapse text-left">
    <thead>
      <tr class="border-b border-border">
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Property</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Type</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Default</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Description</th>
      </tr>
    </thead>
    <tbody>
      {#each props as prop (prop.name)}
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

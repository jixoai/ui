<!--
  jixoai A11yTable — the keyboard/ARIA reference table.
-->
<script lang="ts">
  import { cn } from '$lib/utils';

  export interface KeyEntry {
    key: string;
    action: string;
  }

  interface Props {
    keys?: KeyEntry[];
    aria?: { name: string; value: string; description: string }[];
    class?: string;
  }

  let { keys = [], aria = [], class: className = '' }: Props = $props();
</script>

<div class={cn('flex flex-col gap-[var(--jx-gap)]', className)}>
  {#if keys.length > 0}
    <div>
      <h4 class="font-nav mb-[var(--jx-stack)] text-[length:var(--jx-text)] font-medium">Keyboard</h4>
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="border-b border-border">
            <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Key</th>
            <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each keys as entry (entry.key)}
            <tr class="border-b border-border/50">
              <td class="py-[var(--jx-stack)] px-[var(--jx-inset)]">
                <kbd class="border border-border bg-muted px-[calc(var(--jx-inset)/2)] py-[calc(var(--jx-stack)/3)] font-mono text-[length:var(--jx-text)]">{entry.key}</kbd>
              </td>
              <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text)]">{entry.action}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  {#if aria.length > 0}
    <div>
      <h4 class="font-nav mb-[var(--jx-stack)] text-[length:var(--jx-text)] font-medium">ARIA</h4>
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="border-b border-border">
            <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Attribute</th>
            <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Value</th>
            <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Description</th>
          </tr>
        </thead>
        <tbody>
          {#each aria as entry (entry.name)}
            <tr class="border-b border-border/50">
              <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)]">{entry.name}</td>
              <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground">{entry.value}</td>
              <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text)]">{entry.description}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!--
  jixoai A11yTable — the keyboard/ARIA reference table.

  tailwindless one-shot W1 (2026-09-17): paint rides the table's own
  stylex atoms (a11y-table.stylex.ts — the density channels flow as
  plain var() strings); the heading's 500 weight rides the
  .jx-a11y-heading lane-2 rule (a11y-table.css).
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import { a11yTableStyles } from './a11y-table.stylex';
  import './a11y-table.css';

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

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div class={cn(cx(a11yTableStyles.root), className)}>
  {#if keys.length > 0}
    <div>
      <h4 class="jx-a11y-heading {cx(a11yTableStyles.heading)}">Keyboard</h4>
      <table class={cx(a11yTableStyles.table)}>
        <thead>
          <tr class={cx(a11yTableStyles.headRow)}>
            <th class={cx(a11yTableStyles.headCell)}>Key</th>
            <th class={cx(a11yTableStyles.headCell)}>Action</th>
          </tr>
        </thead>
        <tbody>
          <!-- site-polish F10: the key is NAME+INDEX — a component
               legitimately documents the SAME attribute on several
               elements (dialog's two aria-label rows), and a keyed each
               over the bare name threw each_key_duplicate on hydration,
               collapsing whole pages to their last sections (the
               "gutted dialog/sheet" misdiagnosis) -->
          {#each keys as entry, i (entry.key + ':' + i)}
            <tr class={cx(a11yTableStyles.bodyRow)}>
              <td class={cx(a11yTableStyles.cell)}>
                <kbd class={cx(a11yTableStyles.kbd)}>{entry.key}</kbd>
              </td>
              <td class={cx(a11yTableStyles.cell)}>{entry.action}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  {#if aria.length > 0}
    <div>
      <h4 class="jx-a11y-heading {cx(a11yTableStyles.heading)}">ARIA</h4>
      <table class={cx(a11yTableStyles.table)}>
        <thead>
          <tr class={cx(a11yTableStyles.headRow)}>
            <th class={cx(a11yTableStyles.headCell)}>Attribute</th>
            <th class={cx(a11yTableStyles.headCell)}>Value</th>
            <th class={cx(a11yTableStyles.headCell)}>Description</th>
          </tr>
        </thead>
        <tbody>
          {#each aria as entry, i (entry.name + ':' + i)}
            <tr class={cx(a11yTableStyles.bodyRow)}>
              <td class={cx(a11yTableStyles.cellMono)}>{entry.name}</td>
              <td class={cx(a11yTableStyles.cellMonoSecondary)}>{entry.value}</td>
              <td class={cx(a11yTableStyles.cell)}>{entry.description}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

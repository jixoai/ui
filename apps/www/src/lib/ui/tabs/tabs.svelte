<!--
  jixoai tabs — the ROOT half (registry/files/ui/tabs.svelte).
  WAI-ARIA APG tabs pattern, composition-first: this component owns ONLY
  the shared state (the selected value) and hands it to the family
  through context — the tablist, triggers and panels can be laid out
  anywhere in the subtree (sidebar + panel grid, inline docs switches…):

    <Tabs bind:value>
      <TabsList>                       ← keyboard + roving tabindex
        <TabsTrigger value="a">A</TabsTrigger>
      </TabsList>
      <TabsContent value="a">…</TabsContent>
    </Tabs>

  value is $bindable; '' means nothing selected (SSR-honest — like the
  wider ecosystem, the initial selection is an explicit decision, not a
  hydration-time guess). Automatic activation: focus moving across
  triggers selects them (terminal immediacy; the manual-activation
  variant can arrive later as a prop if a use case shows up).
-->
<script lang="ts" module>
  /** context surface the family shares (import type where needed) */
  export interface TabsApi {
    readonly uid: string;
    readonly selected: string;
    /** the tab stop: last-focused trigger, falling back to the selected
     *  one — manual activation keeps roving tabindex on the FOCUSED
     *  trigger, not the selected one (APG contract) */
    readonly tabStop: string;
    setTabStop(value: string): void;
    select(value: string): void;
    /** 'automatic': arrows select as they focus · 'manual': Enter/Space */
    readonly activation: 'automatic' | 'manual';
  }

  /** context key — registered on the global symbol registry so the
   *  family files stay independent registry items */
  export const TABS_KEY = Symbol.for('jx-tabs');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';

  interface Props {
    /** the active tab value; bindable (bind:value) — '' = none selected.
     *  The bound value is the authority: pointing it at a disabled or
     *  absent tab keeps that value verbatim (caller's decision). */
    value?: string;
    /** fires on every selection change (bound or not) */
    onchange?: (value: string) => void;
    /** automatic: focus moves select (default, terminal immediacy).
     *  manual: arrows move focus only — Enter/Space commit. */
    activation?: 'automatic' | 'manual';
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    value = $bindable(''),
    onchange,
    activation = 'automatic',
    children,
  }: Props = $props();

  // '' = "nothing focused yet" → the selected trigger is the tab stop
  let focused = $state('');

  setContext<TabsApi>(TABS_KEY, {
    uid: autoId,
    get activation() {
      return activation;
    },
    get selected() {
      return value;
    },
    get tabStop() {
      return focused || value;
    },    setTabStop(next: string) {
      focused = next;
    },
    select(next: string) {
      if (next === value) return;
      value = next;
      onchange?.(next);
    },
  });
</script>

{@render children()}

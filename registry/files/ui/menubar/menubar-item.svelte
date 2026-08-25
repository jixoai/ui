<!--
  jixoai menubar item (registry/files/ui/menubar/menubar-item.svelte).
  The pairing unit of the family (Radix Menubar.Menu mapping): a li
  hosting the anchor slot span. It owns the ONE id — an explicit `id`
  prop, else the component's $props.id() — and exposes {id, anchorName,
  slotEl} through item context; Trigger and Panel derive their ids from
  it (`${id}-trigger` / `${id}-panel`) and the panel registers its
  imperative handles under the derived PANEL id (the ID/handle
  protocol: aria-controls always resolves, the wire never depends on
  render order).

  The anchor slot span carries anchor-name for CSS Anchor Positioning
  and feeds the per-panel motion kernel's live axis. The panel renders
  inside the span as a closed popover (display:none until open, top
  layer once open) — it contributes no box, so the span's geometry IS
  the trigger's.

  The id is IMMUTABLE after mount (changing it is caller error —
  dev-mode console warn; the protocol's stability is what aria-controls
  and the anchor name are built on).
  (props-discipline sweep, 2026-08-25)
-->
<script module lang="ts">
  /** the item's context surface: the ONE id + its derived anchor */
  export interface MenubarItemApi {
    readonly id: string;
    /** `--jx-menubar-<sanitized-id>` (chars outside [a-z0-9-] collapse) */
    readonly anchorName: string;
    /** the anchor slot span — the kernel's live anchor axis */
    readonly slotEl: HTMLElement | null;
  }

  /** context key — global symbol registry (independent registry items) */
  export const MENUBAR_ITEM_KEY = Symbol.for('jx-menubar-item');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    /** the ONE id: Trigger/Panel derive theirs from it. Mount-stable. */
    id?: string;
    class?: string;
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let { id = autoId, class: className = '', children, ...rest }: Props = $props();

  const dev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

  // $derived keeps the anchor name truthful if the id ever flips —
  // though the id is mount-stable by contract (warned below)
  const anchorName = $derived(`--jx-menubar-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

  let lastId: string | undefined;
  $effect(() => {
    if (lastId !== undefined && id !== lastId && dev) {
      console.warn(
        'jxoai menubar: MenubarItem id is mount-stable by contract — changing it is caller error',
      );
    }
    lastId = id;
  });

  let slotEl = $state<HTMLElement | null>(null);

  setContext<MenubarItemApi>(MENUBAR_ITEM_KEY, {
    get id() {
      return id;
    },
    get anchorName() {
      return anchorName;
    },
    get slotEl() {
      return slotEl;
    },
  });
</script>

<li data-jx-menubar-item="" class={cn(className)} {...rest} role="none">
  <span
    data-jx-menubar-slot=""
    class="inline-flex"
    style="anchor-name: {anchorName}"
    bind:this={slotEl}
  >
    {@render children()}
  </span>
</li>

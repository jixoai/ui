<!--
  jixoai ItemField (registry/files/ui/list-item/item-field.svelte).
  The settings-row scaffold (openspec list-item-systemization design
  §3): Item > ItemContent(label/description/error) + ItemEnd(control).
  Owns ONLY the field wiring — generated label/control/description/
  error ids and the describedby chain; the control stays whatever
  existing component the caller composes through the typed snippet.

  labelMode law: 'for' (default) renders <label for={controlId}> —
  click-to-activate for free, no row handlers; 'text' renders a span
  and the control MUST consume aria-labelledby={labelId} (the mode
  for non-labelable controls). Never a second <label> ELEMENT around
  the control — siblings only.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import Item from './item.svelte';
  import ItemContent from './item-content.svelte';
  import ItemEnd from './item-end.svelte';
  // the field lane law (design §5): a field's control lane NEVER splits
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';
  import './item.css';

  /** the wiring contract every control snippet receives */
  export interface ItemFieldContext {
    readonly controlId: string;
    readonly labelId: string;
    readonly descriptionId: string | undefined;
    readonly errorId: string | undefined;
    readonly describedBy: string | undefined;
  }

  interface Props {
    /** the control's name — becomes the field's accessible name */
    label: string;
    /** optional one-line muted qualifier under the label */
    description?: string;
    /** error text → the control's aria-invalid + describedby chain */
    error?: string;
    /** becomes controlId; auto-generated when omitted */
    id?: string;
    /** 'for' (labelable controls) | 'text' (aria-labelledby wiring) */
    labelMode?: 'for' | 'text';
    variant?: ItemVariant;
    /** DENSITY override: omitted = nearest provider, then 'default' */
    density?: Density;
    layout?: ItemLayout;
    class?: string;
    control: Snippet<[ItemFieldContext]>;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    description,
    error,
    id,
    labelMode = 'for',
    variant = 'auto',
    density,
    layout = 'auto',
    class: className = '',
    control,
  }: Props = $props();

  const controlId = $derived(id ?? autoId);
  const labelId = $derived(`${controlId}-label`);
  const descriptionId = $derived(description ? `${controlId}-description` : undefined);
  const errorId = $derived(error ? `${controlId}-error` : undefined);
  const describedBy = $derived(
    [descriptionId, errorId].filter((part) => part !== undefined).join(' ') || undefined,
  );
  const field: ItemFieldContext = $derived({
    controlId,
    labelId,
    descriptionId,
    errorId,
    describedBy,
  });
</script>

<Item {variant} {density} {layout} class={cn('jx-item-field', className)} data-item-field={labelMode}>
  <ItemContent>
    {#if labelMode === 'for'}
      <label class="jx-item-field-label" id={labelId} for={controlId}>{label}</label>
    {:else}
      <span class="jx-item-field-label" id={labelId}>{label}</span>
    {/if}
    {#if description}
      <span class="jx-item-field-description" id={descriptionId}>{description}</span>
    {/if}
    {#if error}
      <span class="jx-item-field-error" id={errorId}>{error}</span>
    {/if}
  </ItemContent>
  <ItemEnd wrap="never">
    {@render control(field)}
  </ItemEnd>
</Item>

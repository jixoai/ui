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

  icon slot (grindstone #17-2, 2026-09-13): an optional decorative
  glyph rendered INLINE-START OF THE LABEL ELEMENT — the alert family's
  "icon snippet lands inline-start of the title" law, moved into the
  row. Zero grid-face change: the glyph lives INSIDE the content lane's
  label, so the presence matrix's four top-level bits and the subgrid
  rulers are untouched (that is why the label lane, not the media
  track, is the home — a media-track icon would pay the avatar-width
  gutter under subgrid). bring-your-own Snippet (lucide/svg/text glyph
  — the registry keeps zero icon dependency); aria-hidden by contract:
  the accessible name is ALWAYS the label's alone. The four-branch
  flat chain below keeps the icon-less branches byte-identical to the
  pre-slot DOM (one if-chain anchor, no per-branch anchors).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import Item from './item.svelte';
  import ItemContent from './item-content.svelte';
  import ItemEnd from './item-end.svelte';
  import type { ItemEndFit, ItemEndInset } from './item-end.svelte';
  // the field lane law (design §5): a field's control lane NEVER splits
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';
  import { ListItemDefaults } from './list-item-defaults.svelte';
  import { setContext } from 'svelte';
  import { CONTROL_CHROME_KEY, type ControlChrome } from '$lib/control-chrome.svelte';
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
    /** decorative glyph inline-start of the label (bring your own
     *  snippet — lucide/svg/text glyph); aria-hidden — the accessible
     *  name stays the label's alone (grindstone #17-2) */
    icon?: Snippet;
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
    /** the declared end-lane width ladder (size contract 2026-09-05):
     *  a fitted field lane relaxes its never-split stance and joins the
     *  narrow fold — number/select/text-class controls declare it */
    fit?: ItemEndFit;
    /** the trailing-inset contract (2026-09-05 r2): 'auto' | number |
     *  boolean — forwarded to the end lane verbatim */
    inset?: ItemEndInset;
    /** control integration (B5, 2026-09-05): the outline field row IS
     *  the frame owner, so 'integrated' is the default — in-row shells
     *  dissolve; 'self' opts out */
    controlChrome?: 'integrated' | 'self';
    class?: string;
    control: Snippet<[ItemFieldContext]>;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    icon,
    description,
    error,
    id,
    labelMode = 'for',
    variant,
    density,
    layout = 'auto',
    fit,
    inset,
    controlChrome = 'integrated',
    class: className = '',
    control,
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4, the X2-11 restate shape): the scaffold resolves the
  // ambient policy once and hands Item the RESOLVED values
  const d = $derived(ListItemDefaults.resolve({ variant, density }));

  // the integration ambient (B5 pivot, Owner 2026-09-05: upgrade the
  // component, never invade styles): a frame-owning field row declares
  // its in-row controls bare; each control's OWN sheet paints the bare
  // state — this row never reaches into another family's css
  setContext(CONTROL_CHROME_KEY, {
    get chrome() {
      return controlChrome === 'integrated' ? ('bare' as ControlChrome) : undefined;
    },
  });

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

<Item variant={d.variant} density={d.density} {layout} class={cn('jx-item-field', className)} data-item-field={labelMode} data-control-chrome={controlChrome}>
  <ItemContent>
    {#if labelMode === 'for' && icon}
      <label class="jx-item-field-label" id={labelId} for={controlId}><span class="jx-item-field-icon" aria-hidden="true">{@render icon()}</span>{label}</label>
    {:else if labelMode === 'for'}
      <label class="jx-item-field-label" id={labelId} for={controlId}>{label}</label>
    {:else if icon}
      <span class="jx-item-field-label" id={labelId}><span class="jx-item-field-icon" aria-hidden="true">{@render icon()}</span>{label}</span>
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
  <!-- the field lane law (design §5): a field's control lane NEVER
       splits — UNLESS it declares a size ladder, which is exactly the
       declaration that it MAY fold (the size contract's one carve-out) -->
  <ItemEnd wrap={fit ? 'auto' : 'never'} {fit} {inset}>
    {@render control(field)}
  </ItemEnd>
</Item>

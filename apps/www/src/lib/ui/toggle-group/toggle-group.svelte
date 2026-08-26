<!--
  jixoai toggle group — the ROOT half
  (registry/files/ui/toggle-group/toggle-group.svelte).
  The joined-button set: a row of press-state buttons that submits as
  ONE form field. The group is not a single native control — exactly
  the case the jx-form-field bridge exists for:

    type="single"   one active button; the form receives its value
                    (or '' when none pressed)
    type="multiple" several active buttons; the form receives every
                    active value (FormData multi-entry, like a fieldset
                    of checkboxes)

  ARIA: role=group + aria-pressed buttons for BOTH modes — the valid,
  simple contract (arrow-key segmented walking is tabs' job, not a
  toggle set's). The single/multiple difference lives in the form
  payload and the press behavior, not in mismatched roles.

  Buttons are real <button aria-pressed> (the toolbar-toggle voice):
  Space/Enter toggle natively, Tab walks the row (a group is not a
  focus trap — arrows belong to tablists and menus, this is a simple
  control set). disabled dims the whole set; jx-reset clears it.

  Composition-first (2026-08-25, composition-first-apis): the root
  owns STATE + the value law only — the buttons are ToggleGroupItem
  parts reading the group context (isActive/toggle). items data and
  the per-button snippet die with the closed API; ordinal state never
  exists (the caller's values ARE the identity).

  tw4 (2026-08-24): static paint + hover/disabled states ride token
  utilities on the Item part; ONLY the focus-visible ring stays in
  toggle-group.css — D1-exempt residue on the unlayered :where()
  carve-out (the toggle/Part A precedent).
  (props-discipline sweep, 2026-08-25)
-->
<script module lang="ts">
  /** the group's context surface: the value law, nothing else */
  export interface ToggleGroupApi {
    readonly type: 'single' | 'multiple';
    /** group-level disable (prop + form/fieldset bridge propagation) */
    readonly disabled: boolean;
    isActive(value: string): boolean;
    toggle(value: string): void;
  }

  /** context key — global symbol registry (independent registry items) */
  export const TOGGLE_GROUP_KEY = Symbol.for('jx-toggle-group');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';
  import '$lib/form-field';
  import './toggle-group.css';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
    /** form field name — the pressed value(s) submit under this name */
    name?: string;
    /** one value (single) or many (multiple) */
    type?: 'single' | 'multiple';
    /** active value(s); bindable (bind:value) for controlled use */
    value?: string | string[];
    disabled?: boolean;
    density?: Density;
    'data-density'?: string;
    /** group landmark label — announced to assistive tech */
    label: string;
    class?: string;
    onchange?: (value: string | string[]) => void;
    children: Snippet;
  }

  let {
    name,
    type = 'single',
    value = $bindable<string | string[]>([]),
    disabled = false,
    density,
    'data-density': _callerDensity,
    label,
    class: className = '',
    onchange,
    children,
    ...rest
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, inheritedDensity));

  /** form/fieldset disable propagation (the bridge's jx-disabled) */
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  const activeValues = $derived(
    type === 'single'
      ? typeof value === 'string' && value !== ''
        ? [value]
        : []
      : Array.isArray(value)
        ? value
        : [],
  );

  function toggle(next: string): void {
    if (type === 'single') {
      const single = activeValues.includes(next) ? '' : next;
      value = single;
      onchange?.(single);
      return;
    }
    const multi = activeValues.includes(next)
      ? activeValues.filter((v) => v !== next)
      : [...activeValues, next];
    value = multi;
    onchange?.(multi);
  }

  setContext<ToggleGroupApi>(TOGGLE_GROUP_KEY, {
    get type() {
      return type;
    },
    get disabled() {
      return isDisabled;
    },
    isActive: (candidate) => activeValues.includes(candidate),
    toggle,
  });

  /** the bridge payload: single → one entry ('' when none); multiple →
   *  newline-joined, with multivalue so the bridge submits one FormData
   *  entry per active value (checkbox-set semantics) */
  const formValue = $derived(
    type === 'single' ? (activeValues[0] ?? '') : activeValues.join('\n'),
  );
</script>

<jx-form-field
  aria-hidden="true"
  {name}
  value={formValue}
  multivalue={type === 'multiple' || undefined}
  disabled={isDisabled || undefined}
  onjx-disabled={(e: CustomEvent<boolean>) => (formDisabled = e.detail)}
  onjx-reset={() => ((value = type === 'single' ? '' : []), undefined)}
></jx-form-field>

<div
  data-jx-tgroup
  data-density={resolvedDensity}
  class={cn(
    'inline-flex w-fit flex-wrap rounded-(--radius) border border-border bg-card shadow-2xs',
    className,
  )}
  {...rest}
  role="group"
  aria-label={label}
>
  {@render children()}
</div>

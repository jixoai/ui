<!--
  jixoai input group — the ROOT half (registry/files/ui/input-group/
  input-group.svelte, OpenSpec 2026-08-30-expand-form-family F2).

  The joined field shell — the Origin UI "Input with X" family over
  the input's shared shell law: ONE 1px var(--border) bezel, the
  var(--background) fill, hover lift, the site's inset focus ring and
  the invalid dashed border ride the SAME paint as .jx-html-control-
  shell (the state machines live in input-group.css keyed on the
  data-jx-igroup hook — the Tier-2 vocabulary stays consumed-only,
  never redefined here). The group is a composition frame, not a
  closed composite:

    <InputGroup label="repository url">
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput name="site" bind:value />
      <InputGroupAddon align="inline-end">
        <PressButton variant="tonal">check</PressButton>
      </InputGroupAddon>
    </InputGroup>

  The seams are the ADDONS' hairlines (one 1px var(--border) rule per
  addon edge, input-group.css) — the shell carries ONE border, the
  addons carry ONE seam each, the lane stays chromeless: no double
  borders by construction.

  ONE disabled propagation rule (the disabled-attribute philosophy):
  `disabled` on the ROOT disables the whole group — the
  InputGroupInput renders native `disabled` and every InputGroupAddon
  renders `inert` (the platform's containment: descendant buttons,
  selects, links lose activation AND focus — no per-child chasing,
  aria-disabled theater, or pointer-event patches). Per-part disabling
  (the input's own `disabled`, or `disabled` on a button the consumer
  placed inside an addon) stays per-part — the group never interferes.
  A native fieldset disable inherits into the input through the
  platform, as always.

  A11y: the root is role=group (the consumer may override the role
  through the rest props — an explicitly labeled toolbar is THEIR
  explicit contract, never this component's default); name it with
  `label` (aria-label) or pass aria-labelledby through the rest props —
  a nameless group is announced as nothing. The inner input keeps its
  native semantics; label[for] wiring belongs to the consumer's field
  composition (the group adds no label row of its own — wrap it in a
  .jx-field composition or the ItemField adapter when a visible label
  is needed).

  Density: `density` resolves explicit ?? inherited ?? default and is
  PROVIDED to the subtree (Svelte context), so a PressButton or
  NativeSelect placed inside an addon adopts the group's density tier.

  Value: InputGroupInput implements the house value law verbatim —
  `value` is $bindable; bound ⇒ controlled, absent ⇒ purely uncontrolled
  (FormData / form.reset() untouched).
-->
<script module lang="ts">
  /** the group's context surface: the ONE propagation switch */
  export interface InputGroupApi {
    /** root-level disable — addons go inert, the lane goes disabled */
    readonly disabled: boolean;
  }

  /** context key — global symbol registry (independent registry items) */
  export const INPUT_GROUP_KEY = Symbol.for('jx-input-group');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { getDensityContext, provideDensity, resolveDensity, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import './input-group.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** accessible group name (aria-label). Pass aria-labelledby
        through the rest props instead when an external label owns
        the name — a nameless group is announced as nothing */
    label?: string;
    /** the ONE propagation rule: root disable ⇒ the lane renders
        native disabled AND every addon renders inert */
    disabled?: boolean;
    /** density policy: explicit, inherited, then default — provided
        to the subtree so addon children adopt the tier */
    density?: Density;
    'data-density'?: string;
    /** the group landmark role. The law is group; an explicit
        consumer override (labeled toolbar) is honored, never default */
    role?: string;
    class?: string;
    children: Snippet;
  }

  let {
    label,
    disabled = false,
    density,
    'data-density': _callerDensity,
    role = 'group',
    class: className = '',
    'aria-label': ariaLabel,
    children,
    ...rest
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity = $derived(resolveDensity(density, inheritedDensity));
  provideDensity(() => resolvedDensity);

  setContext<InputGroupApi>(INPUT_GROUP_KEY, {
    get disabled() {
      return disabled;
    },
  });
</script>

<div
  {...rest}
  {role}
  data-jx-igroup
  data-density={resolvedDensity}
  aria-label={ariaLabel ?? label}
  class={cn(
    'flex items-stretch w-full max-w-full min-h-[var(--jx-hit)] border border-border rounded-none bg-background transition-[box-shadow] duration-150 ease-out',
    className,
  )}
>
  {@render children()}
</div>

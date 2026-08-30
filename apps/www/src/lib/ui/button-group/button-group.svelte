<!--
  jixoai button group — the ROOT half (registry/files/ui/button-group/
  button-group.svelte, OpenSpec 2026-08-30-expand-form-family F2).

  The shadcn Button Group counterpart, native to this registry's laws:
  an orientation/justify LAYOUT container that joins press-buttons
  (and icon-buttons) edge-to-edge over the hairline seam law. The
  container owns NOTHING but the layout and the seam — the buttons
  keep their own paint (variant ladder, press physics, density tier):
  the group paints no bezel of its own, so a joined row of outline
  buttons reads as ONE control with 1px seams instead of a 2px double
  border between neighbors (adjacent children collapse their borders
  via a -1px margin — button-group.css).

    <ButtonGroup label="export actions">
      <PressButton variant="outline">copy</PressButton>
      <ButtonGroupDivider />
      <PressButton variant="outline">move</PressButton>
      <PressButton variant="outline">delete</PressButton>
    </ButtonGroup>

  ROLE LAW: the root is role=group — this is a grouping of RELATED
  ACTIONS, not a toolbar (toolbars are roving-tabindex collections of
  controls; every button here keeps its own tab stop, the platform's).
  Name it: `label` (aria-label) or aria-labelledby through the rest
  props — a nameless group is announced as nothing. The role is
  consumer-overridable through the rest props (an explicitly labeled
  toolbar is the consumer's explicit contract; this component never
  stamps toolbar by itself).

  THE toggle-group BOUNDARY (recorded law, see the docs page): the
  moment the children express SELECTION — a pressed state, an active
  value — this is the wrong component. Segmented selection is
  toggle-group's law (native radios/checkboxes, one form field). A
  button group is action-only: press, effect, navigate.

  Orientation: horizontal (default) or vertical; `justify` places the
  joined cluster on the main axis (start | center | end). Density is
  PROVIDED to the subtree, so the joined buttons adopt the group's
  tier without per-button props.

  Nesting composes naturally: a nested ButtonGroup is ONE child for
  the outer seam (child-scope selectors — the seams only collapse
  DIRECT children), so [primary cluster] | [secondary cluster] joins
  without the inner seams leaking outward.
-->
<script module lang="ts">
  /** the group's context surface: the seam/divider geometry switch */
  export interface ButtonGroupApi {
    readonly orientation: 'horizontal' | 'vertical';
  }

  /** context key — global symbol registry (independent registry items) */
  export const BUTTON_GROUP_KEY = Symbol.for('jx-button-group');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { getDensityContext, provideDensity, resolveDensity, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import './button-group.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the join axis: horizontal (default) | vertical */
    orientation?: 'horizontal' | 'vertical';
    /** cluster placement on the main axis */
    justify?: 'start' | 'center' | 'end';
    /** accessible group name (aria-label). Pass aria-labelledby
        through the rest props instead when an external label owns
        the name — a nameless group is announced as nothing */
    label?: string;
    /** density policy: explicit, inherited, then default — provided
        to the subtree so the joined buttons adopt the tier */
    density?: Density;
    'data-density'?: string;
    /** the group role — the law. An explicit consumer override
        (labeled toolbar) is honored, never defaulted */
    role?: string;
    class?: string;
    children: Snippet;
  }

  let {
    orientation = 'horizontal',
    justify = 'start',
    label,
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

  setContext<ButtonGroupApi>(BUTTON_GROUP_KEY, {
    get orientation() {
      return orientation;
    },
  });

  const justifyClass = $derived(
    justify === 'center' ? 'justify-center' : justify === 'end' ? 'justify-end' : 'justify-start',
  );
</script>

<div
  {...rest}
  {role}
  data-jx-btngroup={orientation}
  data-density={resolvedDensity}
  aria-label={ariaLabel ?? label}
  class={cn(
    'inline-flex max-w-full',
    orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-row items-stretch',
    justifyClass,
    className,
  )}
>
  {@render children()}
</div>

<!--
  jixoai button bar (registry/files/ui/button-bar/button-bar.svelte,
  OpenSpec 2026-09-08-button-bar).

  原始需求（Owner 2026-09-08）："新一种 buttonBar 的组件，它的特性是
  可以包含 button 或者 buttonGroup。这些 button、ButtonGroup 不会出现
  冗余的 border 样式，全部默认都是 raised=false+ghost 的样式。最终的
  效果和 DialogFooter 这种组件类似。它支持横向也支持纵向，但目前主要
  支持单个。和 ButtonGroup 的主要差别是，它是单行/单列。本身是一个
  flex 布局，因此可以自由排布左右居中。"

  THE FREE-FLOATING ACTION LANE: a single row/column flex container
  whose members are INDEPENDENT buttons (PressButton / IconButton) and
  joined clusters (ButtonGroup), separated by gap — never
  edge-to-edge, never border-collapsed. The structural boundary
  against ButtonGroup (the JOINED cluster: -1px seam collapse, the
  one cluster shadow, the overflow machines) is membership itself:

    <ButtonBar label="card actions">
      <PressButton>copy</PressButton>
      <ButtonGroup label="publish">
        <PressButton>draft</PressButton>
        <PressButton>publish</PressButton>
      </ButtonGroup>
    </ButtonBar>

  The lane exists to DEFAULT the subtree — the DialogFooter posture
  generalized off the dialog:

    PAINT ZONE (own ghost): the bar provides PAINT_ZONE_KEY with
    `variant ?? enclosing ?? 'ghost'` (inherit-then-provide, the
    ButtonGroup maneuver) — member buttons without their own variant
    render GHOST: no border color, no wash, the quietest interactive
    chrome rung. "不会出现冗余的 border" is the ghost rung itself
    (border-geometry preserved, color transparent), not a new border
    law — and the lane paints NOTHING of its own (no bezel, no
    background). A nested ButtonGroup inherits the variant (its
    ghost seam policy follows, the borderless row's seam); an
    explicit prop at any level always wins (the stamped-attribute
    law's consumer face).

    PHYSICS ZONE (own flat): the bar provides PRESS_TEXTURE_KEY with
    `raised ?? enclosing ?? false` (the ButtonVariantScope shape,
    own flipped) — member buttons ride the FLAT texture by default:
    no rest/hover shadow, the engrave-tier inset press, the body
    never moves. A nested ButtonGroup's root cluster shadow goes
    dark through the same key (`clusterRaised` resolves through the
    bar's flat texture): one control, one shadow — and the lane
    casts none. `raised={true}` on the bar (or any child) restores
    the convex law.

  SINGLE LANE, NO MACHINES: orientation horizontal (default) or
  vertical — one row or one column, never both. No wrap, no
  collapse, no measurement ever runs (those are the joined cluster's
  overflow contracts); a lane that outgrows its container is the
  scroll container's business. justify places the members on the
  main axis (start | center | end | between; own default 'end' —
  the inline-end-actions posture of the footers this lane
  generalizes; 'between' is the left-note-right-actions footer
  shape, legal only where members are free-floating). Cross axis:
  horizontal centers, vertical stretches (the one-column action
  list, ButtonGroup's vertical law).

  ZERO CSS: the whole layout is utilities (flex / gap / justify /
  items against the jixoai theme sheet) — no button-bar.css exists
  (tw4 utility-first law). `data-jx-btnbar={orientation}` is the
  css-less semantic hook (tests and docs query the attribute; no
  css-defined selector shadows it).

  ROLE LAW: role=group — a named grouping of related actions, not a
  toolbar (every member keeps its own tab stop). Name it: `label`
  (aria-label) or aria-labelledby through the rest props.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext, setContext } from 'svelte';
  import {
    getDensityContext,
    provideDensity,
    resolveDensity,
    type Density,
  } from '$lib/density.svelte';
  import { getPaintZone, providePaintZone } from '$lib/paint.svelte';
  import { PRESS_TEXTURE_KEY, type PressTextureApi } from '../press-button/press-button.svelte';
  import { cn } from '$lib/utils';
  import { ButtonBarDefaults, type ButtonBarVariant } from './button-bar-defaults.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the lane axis: horizontal (default, one row) | vertical (one column) */
    orientation?: 'horizontal' | 'vertical';
    /** member placement on the main axis. Own default 'end' — the
     *  inline-end-actions posture of the footers this lane generalizes;
     *  'between' is the left-note-right-actions footer shape */
    justify?: 'start' | 'center' | 'end' | 'between';
    /** accessible group name (aria-label). Pass aria-labelledby
        through the rest props instead when an external label owns
        the name — a nameless group is announced as nothing */
    label?: string;
    /** the LANE variant: adopted by every member button that passes
     *  no variant of its own (explicit always wins). Own 'ghost' —
     *  the lane's reason to exist. TYPED as the family's four-value
     *  slot union (ButtonBarVariant, slot-values-first): link is
     *  PressButton's interaction exception and fused is outside the
     *  button families' ladder — a lane varianting to either is a
     *  compile error, never a silent runtime fallback */
    variant?: ButtonBarVariant;
    /** the LANE physics default: members ride raised={false} (the
     *  flat texture — no rest/hover shadow, the engrave inset press)
     *  and a nested cluster casts no shadow of its own. Explicit
     *  ?? the enclosing texture zone ?? the lane's own flat */
    raised?: boolean;
    /** density policy: explicit, inherited, then default — provided
        to the subtree so the lane's members adopt the tier */
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
    justify = 'end',
    label,
    variant,
    raised,
    density,
    'data-density': _callerDensity,
    role = 'group',
    class: className = '',
    'aria-label': ariaLabel,
    children,
    ...rest
  }: Props = $props();

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // the CAPTURE is eager (the ButtonGroup law): getDensityContext()
  // rides the $derived.by argument subtree, evaluated BEFORE this
  // bar's own provideDensity write — it captures the PARENT's context
  // object, so the chain terminates and never self-references
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(density, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // ---- the paint lane: inherit-then-provide, OWN ghost --------------
  // the OWN is load-bearing (the bar's identity): a bar that sets no
  // variant still writes ghost — members fall to the lane's rung, not
  // their own outline. The eager capture (argument subtree, before the
  // own providePaintZone write below) carries the PARENT zone; a
  // parent variant flip re-derives every member in the same frame
  const effectiveVariant = $derived.by(
    ((enclosing) => () => variant ?? enclosing?.variant ?? 'ghost')(getPaintZone()),
  );
  providePaintZone(() => effectiveVariant);

  // ---- the physics lane: inherit-then-provide, OWN flat -------------
  // the ButtonVariantScope shape with the own flipped to false: the
  // lane's members ride the engrave-tier flat press and a nested
  // ButtonGroup resolves clusterRaised=false through this key (the
  // lane casts no shadow — one control, one shadow, and the lane is
  // not one control). The eager getContext runs before the write; the
  // getter re-runs with reactive raised/enclosing reads
  const enclosingTexture = getContext<PressTextureApi | undefined>(PRESS_TEXTURE_KEY);
  setContext<PressTextureApi>(PRESS_TEXTURE_KEY, {
    get raised() {
      return raised ?? enclosingTexture?.raised ?? false;
    },
  });

  // the family Defaults (the auditable ambient face): density flows
  // through the contract (the group's own lane above carries the
  // provided value); the variant slot is declaration-first — the
  // component's effectiveVariant owns 'ghost' at runtime, the slot's
  // own 'ghost' is the frozen-availability mirror of that (both sides
  // annotated, the button-group precedent)
  const d = $derived(ButtonBarDefaults.resolve({ density }));

  const justifyClass = $derived(
    justify === 'center'
      ? 'justify-center'
      : justify === 'end'
        ? 'justify-end'
        : justify === 'between'
          ? 'justify-between'
          : 'justify-start',
  );
</script>

<div
  {...rest}
  {role}
  data-jx-btnbar={orientation}
  data-density={d.density}
  aria-label={ariaLabel ?? label}
  class={cn(
    'flex gap-2.5',
    // cross axis: the row centers its members' bands; the column
    // stretches them full-width (the one-column action list)
    orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-row items-center',
    justifyClass,
    className,
  )}
>
  {@render children()}
</div>

<!--
  jixoai button group — the ROOT half (registry/files/ui/button-group/
  button-group.svelte, OpenSpec 2026-08-30-expand-form-family F2;
  r13 upgrade: context variant pass-down, on-demand separators, grid
  layout, overflow wrap/collapse).

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

  GROUP CONTEXT (r13, Owner acceptance): the group configures its
  children through BUTTON_GROUP_KEY, so one prop styles the whole
  joined row — `variant="ghost"` on the group is adopted by every
  child button that does not pass its own (PressButton resolves
  `explicit ?? group ?? 'outline'`: an EXPLICIT child prop always
  wins — the stamped-attribute law's consumer face). The ladder
  itself is never touched; context selects rungs, never mints one.

  THE SEPARATOR POLICY (ghost's seam): bordered rungs have the -1px
  seam law (their collapsed borders ARE the hairline), but ghost
  paints no border — the seam law has nothing to collapse. `separator`
  (explicit, or ON by default when the group's variant resolves to
  ghost) paints a 1px line in every collapsed seam slot, carrying the
  SEPARATOR INK LAW (separator/separator.css, 2026-09-01: a separator
  paints no color — the backdrop's own contrast ghost): the ::before
  pseudo is a decorative carrier (the position-for-transient-ink
  exemption list's category), aria-invisible by construction. DIVIDER
  vs SEPARATOR ruling: ButtonGroupDivider is the group's SEMANTIC
  boundary between consumer-authored clusters (role=separator, real
  element, announced); the separator is the DECORATIVE seam between
  adjacent joined buttons (pseudo, policy-driven, invisible to AT).
  Both coexist: dividers between clusters, separators between buttons
  within a cluster.

  GRID, not flex (r13, Owner law — the 2D nature is accepted): the
  container is `inline-grid`. THE FLOW LAW (Codex B1 rework, pinned
  empirically on Chromium): without an explicit template, auto-flow
  ROW fills the ONE implicit column and grows ROWS (a vertical
  stack); auto-flow COLUMN fills the one implicit row and grows
  COLUMNS (the horizontal single line). So HORIZONTAL groups ride
  grid-auto-flow:column + auto columns (exactly the task's original
  wording — an earlier "row-major" reading was backwards and stacked
  every horizontal group vertically), VERTICAL groups ride the
  default row flow + auto rows. The wrap state swaps the horizontal
  flow to row + per-item stamped cells (below). The -1px seam
  margins carry into grid: an auto track sizes to its item's
  MARGIN-BOX contribution, so each -1px margin overlaps the neighbor
  by exactly 1px with flush group edges — the same law, the same
  selectors, no flex. The DIVIDER is the one geometry the flex era
  could afford and grid cannot: its old -1px/-1px pair made its
  margin-box NEGATIVE (a 1px element overlapping both neighbors),
  which auto tracks clamp to a ZERO-WIDTH track (the audit's
  `72.8px 0px` readout) — the grid-era divider owns a REAL 1px
  track with flush junction edges (button-group.css; the boundary
  reads border·line·border, heavier than the 1px intra-cluster seam
  — a boundary should). justify places the track cluster on the
  main axis (justify-content inline-axis for horizontal, the
  content-* utilities pack the row tracks' block axis for vertical
  — the same cluster-placement semantics flex had). Item-level
  justify-self is deliberately unused: tracks are content-sized and
  items fill them, so group-level packing is the whole alignment
  story. A nested ButtonGroup is ONE grid item for the outer seam
  (child-scoped selectors), so cluster joins never leak the inner
  seams outward.

  OVERFLOW (r13, horizontal only — a vertical stack overflows its
  block axis, which is the scroll container's business, not a
  button group's): when the joined row outgrows its available inline
  space (the container is max-w-full), the measured overflow state
  machine (ResizeObserver, hydration-time — the family-context DOM-
  derived AUTO exception) resolves one of two consumer modes:

    overflow="wrap" (default)  the row re-breaks into measured rows:
      each item is stamped with its greedy grid cell (gridRow/
      gridColumn inline placement — CSS cannot express per-row
      packing; the PLACEMENT is inline style, all PAINT rides the
      data-jx-* stamps) and data-jx-row-start (row leads drop the
      -1px seam + seam pseudo: they have no inline-start neighbor).
      Rows read row-major (DOM order = visual order — grid-auto-flow
      stays row; dense would backfill holes with LATER items and can
      visually reorder, which the DOM-order integrity law forbids).
    overflow="collapse"        overflow tail buttons fold into a
      DropdownMenu behind an icon-only IconButton trigger (⋯,
      popovertarget invoker — the platform path, zero component
      listeners). Hidden buttons keep their real DOM (display:none
      — out of the a11y tree and tab order, listeners intact); each
      menu entry is a DropdownMenuItem whose activation CLICKS the
      hidden button (the consumer's handler fires on the real
      element). The menu rides dropdown-menu's own keyboard contract
      (arrows/typeahead/Enter/Escape, focus returns to the trigger
      on selection or Escape; Tab light-dismisses — no focus trap).

  HYSTERESIS: overflow states and the collapse count are pure
  functions of the measured available width, but boundary resize
  jitter must not flap: entering overflow is strict (needs >
  available), LEAVING requires HYST margin (available - needs ≥
  HYST), and the collapse count grows only with the same margin.
  The measuring pass is atomic (reset stamps → read → restamp in
  one task, under the transient data-jx-measuring stamp that lays
  everything out — no intermediate paint). Static/no-JS path: no
  measurement ever runs, every button stays inline and visible —
  SSR renders the complete single row.

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
-->
<script module lang="ts">
  import type { PressButtonVariant } from '$lib/ui/press-button/press-button.svelte';

  /** the group's context surface: the seam/divider geometry switch +
   *  the r13 policy pass-down (variant adoption + separator policy) */
  export interface ButtonGroupApi {
    readonly orientation: 'horizontal' | 'vertical';
    /** the group-configured variant — children without an EXPLICIT
     *  variant adopt it (press-button resolves explicit ?? group ??
     *  its own default; the ladder itself is untouched) */
    readonly variant: PressButtonVariant | undefined;
    /** the separator policy as resolved on the group (explicit prop,
     *  or on by default under a ghost group) */
    readonly separator: boolean;
  }

  /** context key — global symbol registry (independent registry items) */
  export const BUTTON_GROUP_KEY = Symbol.for('jx-button-group');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { getDensityContext, provideDensity, resolveDensity, type Density } from '$lib/density.svelte';
  import { icons } from '$lib/icons';
  import DropdownMenu from '$lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
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
    /** the GROUP variant: adopted by every child button that passes
        no variant of its own (explicit child prop always wins). No
        ladder is minted — context selects a press-button rung */
    variant?: PressButtonVariant;
    /** the separator policy: a 1px separator in every collapsed seam
        slot (ghost's seam — bordered rungs already read through the
        -1px law). Explicit true/false; DEFAULT on when the group's
        variant is ghost (the borderless row has no other seam) */
    separator?: boolean;
    /** what happens when the joined row overflows its available
        inline space (horizontal groups only): wrap (default) breaks
        measured rows; collapse folds the overflow tail into a
        DropdownMenu behind the ⋯ trigger */
    overflow?: 'wrap' | 'collapse';
    /** accessible name of the collapse trigger (aria-label + tooltip) */
    moreLabel?: string;
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

  // $props.id() must live in its own top-level initializer (compiler law)
  const menuId = $props.id();

  let {
    orientation = 'horizontal',
    justify = 'start',
    label,
    variant,
    separator,
    overflow: overflowMode = 'wrap',
    moreLabel = 'more actions',
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

  // the separator policy: explicit prop, else the ghost default —
  // the borderless row has no seam to collapse, so the separator IS
  // its seam. Keys off the GROUP's variant prop (per-child explicit
  // variants may still override paint; the seam policy stays uniform)
  const separatorOn = $derived(separator ?? variant === 'ghost');

  setContext<ButtonGroupApi>(BUTTON_GROUP_KEY, {
    get orientation() {
      return orientation;
    },
    get variant() {
      return variant;
    },
    get separator() {
      return separatorOn;
    },
  });

  const justifyClass = $derived(
    orientation === 'vertical'
      ? justify === 'center'
        ? 'content-center'
        : justify === 'end'
          ? 'content-end'
          : 'content-start'
      : justify === 'center'
        ? 'justify-center'
        : justify === 'end'
          ? 'justify-end'
          : 'justify-start',
  );

  // ── THE OVERFLOW STATE MACHINE (r13) ─────────────────────────────────
  // measured, horizontal-only, hydration-time (the DOM-derived AUTO
  // exception to the SSR-complete family law: the static row IS the
  // complete SSR output; measurement only ever RE-breaks it). States:
  //   none      single row, no stamps (the static default)
  //   wrap      measured greedy rows (per-item cell placement)
  //   collapse  tail hidden into the menu, k buttons stay inline
  // Hysteresis: enter strict (needs > avail), leave with margin.
  const HYST = 8;
  /** a folded menu entry — either a real hidden control (label +
   *  element; activation clicks the REAL button) or a carried
   *  divider (rendered as the menu's plain hr) */
  interface FoldedEntry {
    readonly divider: boolean;
    readonly label: string;
    readonly el: HTMLElement | undefined;
  }

  let groupEl = $state<HTMLDivElement | null>(null);
  let moreEl = $state<HTMLElement | null>(null);
  let folded = $state<FoldedEntry[]>([]);
  // persistent across measures: the state + the last inline count
  // (hysteresis) + the last measured width (the RO re-entry guard)
  let ovState: 'none' | 'wrap' | 'collapse' = 'none';
  let inlineCount = Number.MAX_SAFE_INTEGER;
  let lastAvail = -1;

  /** re-run the overflow measurement by hand — the dynamic-children
   *  seam: ResizeObserver sees box changes, not a consumer swapping
   *  children at a constant width. Exported through bind:this */
  export function remeasure(): void {
    if (groupEl) measure(groupEl);
  }

  function measure(el: HTMLElement): void {
    const kids = [...el.children].filter(
      (c): c is HTMLElement =>
        c instanceof HTMLElement && !c.hasAttribute('popover') && c !== moreEl,
    );
    if (kids.length === 0) {
      el.removeAttribute('data-jx-overflow');
      folded = [];
      ovState = 'none';
      return;
    }
    // 1) the measuring pose: everything visible, single line, seams
    // collapsed — the transient stamp suspends the display flips, the
    // cleared placement lets each item report its NATURAL line width
    el.setAttribute('data-jx-measuring', '');
    el.removeAttribute('data-jx-overflow');
    for (const kid of kids) {
      // longhands, not the shorthand: jsdom's CSSOM does not clear
      // grid-row/grid-column through grid-area=''
      kid.style.gridRow = '';
      kid.style.gridColumn = '';
      kid.removeAttribute('data-jx-row-start');
      kid.removeAttribute('data-jx-overflow-hidden');
    }
    // MARGIN-BOX, measured (Codex nB2): the -1px seam margins are
    // the seam law's, the divider's flush junction edges are the
    // divider law's, the trigger's own -1px seam belongs to the
    // trigger — the arithmetic never re-derives any of them, it
    // READS them, so the formulas and the layout engine cannot drift
    // apart (jsdom computes 0 margins: the css sheet never loads
    // there, and the math degrades to plain width sums)
    const box = (elm: HTMLElement): number => {
      const w = elm.getBoundingClientRect().width;
      const cs = getComputedStyle(elm);
      return w + (parseFloat(cs.marginInlineStart) || 0) + (parseFloat(cs.marginInlineEnd) || 0);
    };
    const boxes = kids.map(box);
    const avail = el.getBoundingClientRect().width;
    const moreBox = moreEl ? box(moreEl) : 0;
    // 2) resolve — pure functions of (boxes, avail) with the
    // hysteresis margins on the transitions
    const natural = boxes.reduce((a, b) => a + b, 0);
    if (lastAvail === avail && ovState === 'none' && natural <= avail + 0.5) {
      el.removeAttribute('data-jx-measuring');
      return; // the RO re-entry guard: same box, same line — idempotent
    }
    lastAvail = avail;
    if (ovState === 'none') {
      if (natural > avail + 0.5) ovState = overflowMode === 'collapse' ? 'collapse' : 'wrap';
    } else if (avail - natural >= HYST) {
      ovState = 'none'; // leave only with margin — resize jitter cannot flap
    }
    // 3) apply
    if (ovState === 'wrap') {
      el.setAttribute('data-jx-overflow', 'wrap');
      // greedy rows over margin-boxes; row leads reset the seam.
      // A divider that would OPEN a row stays on the previous row's
      // tail instead — it separates clusters, and a cluster boundary
      // at a row edge is a dangling 1px tick, not a lead
      const rows: number[][] = [[]];
      let acc = 0;
      kids.forEach((kid, i) => {
        const row = rows[rows.length - 1];
        const divider = kid.hasAttribute('data-jx-btngroup-divider');
        if (row.length > 0 && acc + boxes[i] > avail + 0.5) {
          if (divider) {
            row.push(i); // the boundary closes the previous cluster
            return;
          }
          rows.push([]);
          acc = 0;
        }
        acc += boxes[i];
        rows[rows.length - 1].push(i);
      });
      rows.forEach((row, r) =>
        row.forEach((i, c) => {
          kids[i].style.gridRow = `${r + 1}`;
          kids[i].style.gridColumn = `${c + 1}`;
          if (c === 0) kids[i].setAttribute('data-jx-row-start', '');
        }),
      );
      folded = [];
    } else if (ovState === 'collapse') {
      // the largest k with prefix margin-boxes + the trigger's own
      // margin-box ≤ avail; k ≥ 1 (a group reduced to only ⋯ loses
      // its identity — it overflows instead). Growth is gated by HYST.
      const needed = (k: number): number =>
        boxes.slice(0, k).reduce((a, b) => a + b, 0) + moreBox;
      let k = Math.min(inlineCount, kids.length);
      while (k < kids.length && needed(k + 1) + HYST <= avail) k++;
      while (k > 1 && needed(k) > avail) k--;
      inlineCount = k;
      if (k >= kids.length) {
        // everything fits inline after all — the trigger never shows
        ovState = 'none';
        folded = [];
      } else {
        el.setAttribute('data-jx-overflow', 'collapse');
        // divider-aware folding: a divider with a hidden inline-start
        // neighbor is a dangling seam — it folds with it
        let prevHidden = false;
        const entries: FoldedEntry[] = [];
        kids.forEach((kid, i) => {
          const isDivider = kid.hasAttribute('data-jx-btngroup-divider');
          const hide = isDivider ? prevHidden : i >= k;
          if (hide) kid.setAttribute('data-jx-overflow-hidden', 'true');
          if (!isDivider) prevHidden = i >= k;
          if (i >= k) {
            entries.push(
              isDivider
                ? { divider: true, label: '', el: undefined }
                : {
                    divider: false,
                    label:
                      kid.getAttribute('aria-label') ??
                      kid.textContent?.trim() ??
                      'action',
                    el: kid,
                  },
            );
          }
        });
        // a leading/trailing folded divider has nothing to separate
        while (entries.length > 0 && entries[0].divider) entries.shift();
        while (entries.length > 0 && entries[entries.length - 1].divider) entries.pop();
        folded = entries;
      }
    } else {
      el.removeAttribute('data-jx-overflow');
      folded = [];
      inlineCount = Number.MAX_SAFE_INTEGER;
    }
    el.removeAttribute('data-jx-measuring');
  }

  $effect(() => {
    // orientation/mode are read here: flips re-run the whole machine
    if (!groupEl || orientation !== 'horizontal') return;
    if (typeof ResizeObserver === 'undefined') return; // static path: the line stays
    const el = groupEl;
    const ro = new ResizeObserver(() => measure(el));
    ro.observe(el);
    measure(el);
    return () => ro.disconnect();
  });

  // the trigger names its panel for AT (aria-haspopup describes the
  // popovertarget's menu — the composer owns this glue; the menu root
  // adopts the button for aria-expanded + focus restoration itself)
  $effect(() => {
    moreEl?.querySelector('button[popovertarget]')?.setAttribute('aria-haspopup', 'menu');
  });

  /** selection clicks the hidden REAL button — one microtask later,
   *  so the menu's own close-and-restore (the selection contract:
   *  focus back to the trigger) settles first. The platform
   *  light-dismisses auto popovers on POINTERDOWN, never on a
   *  synthetic click, so ordering the proxied click after the close
   *  keeps the two paths disjoint in every engine */
  function activate(entry: FoldedEntry): void {
    const el = entry.el;
    if (el) queueMicrotask(() => el.click());
  }
</script>

<div
  {...rest}
  {role}
  data-jx-btngroup={orientation}
  data-jx-separator={separatorOn ? '' : undefined}
  data-density={resolvedDensity}
  aria-label={ariaLabel ?? label}
  bind:this={groupEl}
  class={cn(
    'inline-grid max-w-full',
    // the flow law (see header): no-template flow COLUMN grows the
    // one implicit ROW with columns (the horizontal line); flow row
    // (the default) grows the one implicit COLUMN with rows (the
    // vertical stack) — pinned on Chromium, see the r13 rework probe
    orientation === 'vertical' ? 'grid-flow-row auto-rows-auto items-stretch' : 'grid-flow-col auto-cols-auto items-stretch',
    justifyClass,
    className,
  )}
>
  {@render children()}
  {#if overflowMode === 'collapse'}
    <!-- the收纳 trigger: hidden until the collapse state stamps it
         visible (button-group.css); an icon-only IconButton carrying
         the native popovertarget invoker — the group context reaches
         it too, so a ghost group gets a ghost ⋯ -->
    <span bind:this={moreEl} data-jx-btngroup-more class="inline-flex">
      <DropdownMenu id={menuId} placement="bottom-end">
        {#snippet trigger()}
          <IconButton iconOnly text={moreLabel} popovertarget={menuId}>
            {#snippet icon()}{@html icons.ellipsis}{/snippet}
          </IconButton>
        {/snippet}
        {#each folded as entry, i (i)}
          {#if entry.divider}
            <hr />
          {:else if entry.el}
            <DropdownMenuItem onclick={() => activate(entry)}>{entry.label}</DropdownMenuItem>
          {/if}
        {/each}
      </DropdownMenu>
    </span>
  {/if}
</div>

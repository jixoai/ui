<!--
  jixoai canvas playground dock (registry/files/ui/component-canvas/
  canvas-playground.svelte — canvas-playground-dock, 2026-09-08; head
  standardized to the unified chrome the same day, Owner amendment;
  THE EIGHT-AXIS BAR 2026-09-21, the Owner's post-acceptance directive:
  「把这八轴的控制，挂到 playground 这个 bar 上…每一个对应一个
  icon-button（有些基于 menu 能力来提供替代 select）」).

  The floating, collapsible, horizontally draggable controls panel that
  replaced the canvas's permanent Playground aside lane (the Owner
  reform ruling): absolute over the stage-row's top-right corner (the
  scroll layer's sibling, never scrolling with stage content), mounting
  EXPANDED and collapsing to its head chip on toggle. The canvas passes
  everything through — the dock never reads context itself. The dock
  mounts on EVERY canvas: the head is the EIGHT-AXIS BAR (the Owner
  directive) — [drag grip, the eight axis controls in one scrollable
  ButtonGroup, chevron?] — the chrome row every demo ships; without
  body content (no playground snippet, no schema, no output) there is
  no chevron and no expansion, the chrome row stands alone.

  - HEAD, THE EIGHT AXES (one control per axis, the Owner's wording):
    · theme — the EXISTING icon-button (sun/moon cycle, aria-pressed
      carrying state) driving the PAGE-OWNED stage bindable — its
      freedom-to-consume IS the Owner's law (「是否遵守是它的自由」);
      no system step (the bindable's type stays 'light'|'dark').
    · size · shape · radius · density · color · elevation · motion —
      one icon-button + DropdownMenu EACH (the family's own menu, the
      popover law respected), entries `auto` + the axis grammar's
      NAMED STEPS (the UNIVERSAL vocabulary — the legacy xs/sm/
      default/lg select RETIRED with this bar; the rung aliases stay
      legal underneath, the dock just speaks the axis grammar now;
      2xs stays reachable through the demo pages' own inspectors).
      Every item shows a check glyph for the current value; `auto`
      is the default and stamps NOTHING (the supply-not-force law).
    · THE SINGLE TRUTH (W7-r2, the vision round's desync MAJOR): the
      bar's lane record and the panel's axis rows are ONE state — a
      bar write carries the panel's own axis-enum row along (the
      record the page's stage drivers read never contradicts the
      bar), a panel write mirrors into the bar's record, and the
      panel's selects DISPLAY the canvas's resolved lane
      (consumer-explicit ?? bar-lane — the same getter-fielded record
      the carriers ride, handed down as `resolvedLanes`). A set axis
      also carries its button into the run's view (`nearest`, a
      no-op when visible) and paints the BRAND INK (component-
      canvas.css — the first round's foreground-on-ghost ink was a
      no-op, ghost already paints foreground).
    · THE RUN: the eight controls ride ONE ButtonGroup with
      overflow="scroll" (the family's own scroll capability — the
      Owner: 「bar 可能会很长，所以可以考虑使用 ButtonGroup 的可
      滚动性来提供支持」), so the long bar SCROLLS horizontally
      instead of wrapping; under the head's ghost zone the group's
      separator policy paints the whisper seams BETWEEN the cells
      (the seamed-toolbar idiom, r7-r11, carried by the family's own
      law now). The run owns its own gestures — a pan inside it
      never arms the dock drag (see onHeadPointerDown).
    · THE SIZE (the Owner: 「这个 bar 的尺寸可以缩小一些」): the
      joined row rides density xs (the dock foot's own compact
      chrome scale) and the head's glyphs step 12→11 — the band one
      notch down, coherently, the whisper seams and legibility kept.
  - POSE: a grid-area 1/1 sibling of the scroll layer inside the
    stage-row's ONE-CELL GRID HOST (the Owner stacking law — grid
    supplies stacking, position is for transient ink), z-index above,
    place-self start/end with var(--jx-gap) margins off the host's
    top-right, width clamp(240px, 30cqi, 300px), translate
    var(--jx-dock-x) for the drag — the residue sheet owns the rule
    ([data-jx-canvas-dock]); the dock box is a bordered
    surface card with internal scroll (a capped, guttered scroll region
    under the head; the output foot stays pinned).
  - DRAG: the head ROW is the grab bar. Disambiguation design: pointer
    down anywhere on the head ARMS a possible drag; setPointerCapture
    fires only once the pointer crosses the 4px threshold — so a plain
    tap never captures and the head's buttons keep their native
    behavior — and after a real drag one capture-phase click swallow on
    the head makes the drag click-proof (<4px = click, ≥4px =
    reposition, never both). ONE carve since the eight-axis bar: a
    pointer down inside the ButtonGroup's scroll host returns early —
    the pannable run owns its gesture, the drag surface is the head
    AROUND it (grip, gaps, bands). Position is transient per canvas
    instance; the clamp keeps the box inside the host stage-row
    (measured at drag start; the PURE clampDockX in the module script
    carries the math — the toast-swipe precedent). touch-action none +
    grab/grabbing cursors on the head, pan-x re-enabled on the run
    (component-canvas.css); drag is decorative and pointer-only — every
    function stays keyboard-reachable without it.
  - COMPOSITION (the Owner's core ask): the expanded body is ONE
    <ItemGroup mode="plain" controlChrome="integrated" density="sm"> —
    the dock card is the sole surface owner (B5: in-row control shells
    dissolve; the row adapters migrated from the old pane keep their
    ids/data hooks but drop the outline variant — rows resolve auto and
    yield their chrome to the group). The consumer `playground` snippet
    takes precedence (rendered inside the same ItemGroup); schema rows
    render otherwise; the read-only output dl rides the foot (never a
    live region).
-->
<script module lang="ts">
  /**
   * The horizontal drag clamp, PURE for unit testing (the toast-swipe
   * precedent): keeps the dock's box inside the host stage-row. `min`
   * and `max` are the translate-domain window measured at drag start
   * (max = 0 at the mounted right-aligned pose; min = how far left the
   * box may travel before its left edge would pass the host's inset).
   * Degenerate bounds (min > max — a host narrower than the dock plus
   * both insets) pin at max, the mounted pose, so the dock never
   * escapes the host's inline end.
   */
  export function clampDockX(proposed: number, min: number, max: number): number {
    if (min > max) return max;
    return Math.min(Math.max(proposed, min), max);
  }

  /**
   * THE EIGHT-AXIS BAR's lane record (the Owner directive, 2026-09-21):
   * the SEVEN non-theme axes the dock's head controls speak — each one
   * `auto` (the default — stamps nothing, the ambient keeps flowing)
   * or a NAMED STEP of the axis grammar (the universal vocabulary; the
   * legacy rung spellings stay legal UNDERNEATH — the dock speaks the
   * grammar, the aliases resolve in the lanes' own normalization).
   * These literal unions are SUBSETS of the universal Lane types, so
   * the record feeds `laneOf` → resolve/stamp/provide without a cast.
   * The state is DOCK-OWNED (never a page prop): the canvas binds it,
   * resolves it UNDER the consumer's explicit lanes and supplies it on
   * its workbench root — SUPPLY, never force (any stage component
   * receives the lanes as AMBIENT and may consume or ignore them).
   */
  export interface CanvasAxisLanes {
    readonly size: 'auto' | 'small' | 'medium' | 'large';
    readonly shape: 'auto' | 'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle';
    readonly radius: 'auto' | 'small' | 'medium' | 'large';
    readonly density: 'auto' | 'small' | 'medium' | 'large';
    readonly color: 'auto' | 'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info';
    readonly elevation:
      | 'auto'
      | 'level-1'
      | 'level0'
      | 'level1'
      | 'level2'
      | 'level3'
      | 'level4'
      | 'level5';
    readonly motion: 'auto' | 'reduced' | 'subtle' | 'normal' | 'expressive';
  }

  /** the seven non-theme axis names, §0 order */
  export type CanvasAxisName = keyof CanvasAxisLanes;

  /**
   * The canvas's RESOLVED lane record — the SAME getter-fielded object
   * the carriers ride (`consumer-explicit ?? bar-lane`, computed in
   * component-canvas.svelte and handed down here). The properties are
   * GETTERS over the canvas's reactive state (never a value snapshot —
   * the provider-snapshot law): a $derived in this file that READS one
   * re-resolves in the same frame the bar flips (the same signal
   * mechanism provideUniversalLanes rides). The panel's axis selects
   * READ it — the bar and the panel display ONE truth (the vision
   * round's bar/panel desync MAJOR: a bar-path set left the panel's
   * SIZE select reading 'auto' while the stage rendered large). The
   * value type is unknown on purpose: the canvas's own explicit lane
   * may be any Lane spelling (px, query()…); the panel only ever
   * DISPLAYS members of its own option list.
   */
  export interface ResolvedAxisLanes {
    readonly [K in CanvasAxisName]: unknown;
  }

  /** the all-`auto` seed — read-only by construction (writers REASSIGN,
   *  never mutate: `axes = { ...axes, [axis]: value }`) */
  export const CANVAS_AXIS_LANES: Readonly<CanvasAxisLanes> = Object.freeze({
    size: 'auto',
    shape: 'auto',
    radius: 'auto',
    density: 'auto',
    color: 'auto',
    elevation: 'auto',
    motion: 'auto',
  });
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ItemGroup, ItemToggle, ItemSelect, ItemInput, ItemSegmented, ItemStepper } from '$lib/ui/list-item';
  import { parseQuerySource } from '$lib/universal-props-query.svelte';
  import Icon from '$lib/ui/icon';
  import ButtonGroup, { ramp } from '$lib/ui/button-group';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import DropdownMenu from '$lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
  import { cn } from '$lib/utils';
  import { canvasStyles } from '$lib/surface/component-canvas.stylex';
  import { stackStyles } from '$lib/ui/stack';
  import { gridStyles } from '$lib/ui/grid';
  import { animateGridDisclosure } from '$lib/disclosure-motion';
  import type { ControlRow, PlayOutput } from './canvas-schema.svelte';

  interface Props {
    /** aria context only — names the dock's controls region. */
    title: string;
    /** Stage preview theme — PAGE-OWNED (bindable chain through the canvas). */
    theme?: 'light' | 'dark';
    /**
     * The eight-axis bar's lane record — DOCK-OWNED axis grammar state
     * (all-`auto` seed; the theme axis rides its own button above).
     * The canvas binds this, resolves the seven lanes UNDER its
     * consumer's explicit props and supplies them on the workbench
     * root — SUPPLY, never force (the Owner directive: whether a
     * stage component obeys is its own freedom).
     */
    axes?: CanvasAxisLanes;
    /**
     * The RESOLVED lane getters (consumer-explicit ?? bar-lane) — the
     * record the canvas's own carriers ride, handed down so the panel's
     * axis selects display the lane the STAGE actually rides (the
     * bar/panel single-truth fix, W7-r2). Optional and inert when
     * absent (a hand-mounted dock without a canvas root falls back to
     * the record's own value).
     */
    resolvedLanes?: ResolvedAxisLanes;
    /** Consumer-authored controls (escape-hatch precedence over rows). */
    playground?: Snippet;
    /** Schema-lowered rows (the kernel's controlsFor output). */
    rows?: ControlRow[];
    /** Reset fallback: the schema-defaults record rows came from. */
    schemaDefaults?: Record<string, unknown>;
    /** Schema state machine — $bindable; initialized from schemaDefaults. */
    values?: Record<string, unknown>;
    /** Schema-mode change seam (the page owns value semantics). */
    onvalue?: (key: string, value: unknown) => void;
    /** Page-owned reset: shown (body foot) and called when present. */
    onreset?: () => void;
    /** Read-only state projection rows at the dock's foot. */
    output?: readonly PlayOutput[];
    class?: string;
  }

  let {
    title,
    theme = $bindable('light'),
    axes = $bindable({ ...CANVAS_AXIS_LANES }),
    resolvedLanes,
    playground,
    rows,
    schemaDefaults,
    values = $bindable(),
    onvalue,
    onreset,
    output,
    class: className = '',
  }: Props = $props();

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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

  // ---- the eight-axis bar (the Owner directive, 2026-09-21) ---------
  // One axis = ONE icon-button; the seven non-theme axes open the
  // family's own DropdownMenu carrying `auto` + the named steps. The
  // glyphs are the SCANNED library vocabulary (the artifact's chunk
  // law: every name below is a literal the scanner collects from THIS
  // markup — dynamic composition would pack nothing).
  const AXIS_CONTROLS: {
    readonly [K in CanvasAxisName]: {
      readonly axis: K;
      readonly label: string;
      readonly values: readonly CanvasAxisLanes[K][];
    };
  } = {
    size: { axis: 'size', label: 'Size', values: ['auto', 'small', 'medium', 'large'] },
    shape: {
      axis: 'shape',
      label: 'Shape',
      values: ['auto', 'round', 'scoop', 'bevel', 'notch', 'square', 'squircle'],
    },
    radius: { axis: 'radius', label: 'Radius', values: ['auto', 'small', 'medium', 'large'] },
    density: { axis: 'density', label: 'Density', values: ['auto', 'small', 'medium', 'large'] },
    color: {
      axis: 'color',
      label: 'Color',
      values: ['auto', 'primary', 'secondary', 'error', 'warn', 'success', 'info'],
    },
    elevation: {
      axis: 'elevation',
      label: 'Elevation',
      values: ['auto', 'level-1', 'level0', 'level1', 'level2', 'level3', 'level4', 'level5'],
    },
    motion: {
      axis: 'motion',
      label: 'Motion',
      values: ['auto', 'reduced', 'subtle', 'normal', 'expressive'],
    },
  };

  /** one axis flips — the ONE primitive both paths funnel through
   *  (W7-r2, the bar/panel single-truth law). The record REASSIGNS,
   *  never mutates — the bound canvas root re-resolves in the same
   *  frame. MIRROR (the bar path): the panel's own axis-enum row for
   *  this axis carries along — the record the page's stage drivers
   *  read must never contradict the bar (a panel-written explicit
   *  lane would otherwise BEAT the bar's fresh pick on the stage
   *  while the bar's ink claimed it) — written only when the row's
   *  own options carry the value (an off-enum write would blank the
   *  native select). The panel path passes mirror=false: it JUST
   *  wrote the record itself.
   *  THE SET-BUTTON SCROLL (the set-indicator/scroll finding): a set
   *  whose button sits scrolled out of the 28px head is invisible —
   *  the run carries the set button into view with `nearest` (a NO-OP
   *  when already visible; smooth honors the reduced-motion
   *  preference), so the set-ink lands in view from EITHER path */
  function setAxis<K extends CanvasAxisName>(
    axis: K,
    value: CanvasAxisLanes[K],
    mirror = true,
  ): void {
    const next = { ...axes };
    next[axis] = value;
    axes = next;
    if (mirror && typeof value === 'string') {
      const row = rows?.find((r) => r.axis === axis && r.control === 'axis-enum');
      if (row && (row.values ?? []).includes(value)) setValue(row.key, value);
    }
    queueMicrotask(() => {
      // optional-chained on purpose: jsdom ships no scrollIntoView and
      // no matchMedia layouts — the scroll is a chrome nicety, never a
      // contract (the hand-drawn/disclosure-motion guards' precedent)
      const btn = dockEl?.querySelector(`[data-jx-canvas-axis="${axis}"]`);
      btn?.scrollIntoView?.({
        inline: 'nearest',
        block: 'nearest',
        behavior:
          typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
      });
    });
  }

  // deterministic aria wiring, derived from the title the same way the
  // canvas derives its ids (server and client agree; the canvas-level
  // explicit id override caveat applies here too — distinct titles slug
  // apart, collision-prone titles collide)
  const dockId = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const bodyId = `jx-canvas-${dockId}-dock-body`;

  // the body gate: the chevron + the collapse region exist ONLY when
  // there is body content (playground snippet, schema rows, or output);
  // a chrome-only dock never expands
  const hasBody = $derived(Boolean(playground || schemaDefaults !== undefined || output?.length));

  // 默认展开 (the Owner ruling): the dock mounts expanded; one click
  // collapses it to the head chip (the body goes inert)
  let open = $state(true);
  let collapseEl = $state<HTMLElement | null>(null);

  // the 0fr→1fr motion rides the rAF lane (lib/disclosure-motion —
  // the Chrome 146 clock-freeze receipt: fr-transitions inside
  // scroll-revealed sections randomly freeze at currentTime 0
  // forever; the classes keep the semantic endpoints, this lane
  // interpolates inline and clears at rest). First run (mount) is
  // the resting state — no entrance frames
  let prevOpen: boolean | undefined;
  // $effect.pre: measure the OLD endpoint BEFORE the class flip —
  // with the css transition retired, the class change is instant,
  // and the post-update effect would read the FINAL state as the
  // motion's start; the .pre lane sees the pre-flip track, then the
  // frames' inline interpolation takes over past the flip
  $effect.pre(() => {
    const state = open;
    const el = collapseEl;
    if (prevOpen === undefined || !el) {
      prevOpen = state;
      return;
    }
    animateGridDisclosure(el, state);
    prevOpen = state;
  });

  // ---- schema state machine (migrated from the canvas, 2026-09-08) ----
  // values initialize from the schema's defaults when the page binds
  // none (a bound page object always wins — including a bound
  // undefined, the documented way to say "canvas, own my values").
  // one-shot by design: schema identity is a mount-time contract, not
  // reactive state the dock tracks
  // svelte-ignore state_referenced_locally
  if (values === undefined && rows !== undefined) values = { ...(schemaDefaults ?? {}) };

  function setValue(key: string, value: unknown): void {
    values = values === undefined ? { [key]: value } : { ...values, [key]: value };
    onvalue?.(key, value);
  }

  /** The reset fallback: restore schema defaults (onreset replaces this). */
  function resetValues(): void {
    if (schemaDefaults === undefined) return;
    const previous = values ?? {};
    const next = { ...schemaDefaults };
    values = next;
    // the seam stays complete across a reset: the page's onvalue mapping
    // (e.g. effect-name → builder) re-runs for every key it settles
    for (const key of Object.keys(next)) {
      if (previous[key] !== next[key]) onvalue?.(key, next[key]);
    }
  }

  const rowValue = (row: ControlRow): unknown => values?.[row.key] ?? row.default;

  // ── the axis control trio (explicit-props W4 4.2) ──────────────────
  // One axis = ONE lane with up to three controls: the enum row (auto
  // + named steps + the `number`/`query()` MODE steps) is the switch;
  // the `:number` stepper and the `:query` source editor render only
  // in their mode. Values ride the SAME key namespace the page reads
  // through the onvalue seam: values[<axis>] is the mode/named lane,
  // values['<axis>:number'] the exact number, values['<axis>:query']
  // the raw query() source (parsed page-side via parseQuerySource).
  const axisMode = (row: ControlRow): string => {
    const mode = values?.[row.axis ?? ''];
    return typeof mode === 'string' ? mode : 'auto';
  };
  const axisNumberRow = (row: ControlRow): ControlRow | undefined =>
    rows?.find((r) => r.axis === row.axis && r.control === 'axis-number');

  // ── THE BAR/PANEL SINGLE TRUTH (W7-r2, the desync MAJOR) ───────────
  // The panel's axis selects display ONE truth with the bar: the
  // record's OWN non-`auto` mode wins (the panel's number/query()
  // vocabulary is its own), else the canvas's RESOLVED lane — the same
  // getter the carriers ride (consumer-explicit ?? bar-lane) — when it
  // names one of the row's own options; otherwise the record's value.
  // A bar-path set therefore lands in the panel's select, and a
  // consumer-owned seat reads honestly (a resolved lane outside this
  // row's options — px, query() — keeps the record's own display)
  const axisDisplay = (row: ControlRow): string => {
    const own = values?.[row.key];
    if (typeof own === 'string' && own !== 'auto') return own;
    const resolved = row.axis !== undefined ? resolvedLanes?.[row.axis] : undefined;
    if (typeof resolved === 'string' && (row.values ?? []).includes(resolved)) return resolved;
    return typeof own === 'string' ? own : String(row.default ?? 'auto');
  };

  /** the axis-number row's controlled value (typeof-narrowed, zero casts) */
  const axisNumberOf = (row: ControlRow): number | undefined => {
    const current = values?.[row.key];
    if (typeof current === 'number') return current;
    return typeof row.default === 'number' ? row.default : undefined;
  };

  /** entering number mode seeds the stepper once (never a 0px root).
   *  THE BAR CARRIES ALONG (W7-r2, the single-truth write path): a
   *  panel write on an axis the bar speaks mirrors into the bar's own
   *  record (mirror=false below — the record write already happened
   *  here) — a named step lands the bar button's set-ink and the
   *  ambient supply in the same frame; `auto`/number/query() clear
   *  the bar lane (the bar has no number mode — an honest bar shows
   *  no stale set). The one cast is membership-checked (the
   *  axis-controls.svelte precedent) */
  function onAxisModeChange(row: ControlRow, mode: string): void {
    setValue(row.key, mode);
    if (row.axis !== undefined && row.axis in CANVAS_AXIS_LANES) {
      const axis = row.axis as CanvasAxisName;
      const known = AXIS_CONTROLS[axis].values as readonly string[];
      setAxis(axis, (known.includes(mode) ? mode : 'auto') as CanvasAxisLanes[CanvasAxisName], false);
    }
    if (mode === 'number' && typeof values?.[`${row.key}:number`] !== 'number') {
      const sibling = axisNumberRow(row);
      setValue(`${row.key}:number`, typeof sibling?.default === 'number' ? sibling.default : 1);
    }
  }

  /** query-editor validation state: keys whose source last failed to parse */
  let invalidQueryKeys = $state<ReadonlySet<string>>(new Set());

  function onQuerySourceInput(row: ControlRow, text: string): void {
    setValue(row.key, text);
    const next = new Set(invalidQueryKeys);
    if (text.trim() === '') next.delete(row.key);
    else {
      try {
        parseQuerySource(text);
        next.delete(row.key);
      } catch (error) {
        void error;
        next.add(row.key);
      }
    }
    invalidQueryKeys = next;
  }

  // the unit folds into the label (the adapter convention — ItemStepper
  // carries no unit lane; the studio panel's labelOf does the same)
  const rowLabel = (row: ControlRow): string => (row.unit ? `${row.label} (${row.unit})` : row.label);

  // the ItemField id seed: deterministic + canvas-scoped so two canvases
  // on one page never collide (label/description ids derive from it)
  const ctlId = (key: string): string => `jx-canvas-${dockId}-ctl-${key}`;

  function formatOutput(value: PlayOutput['value']): string {
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value)) {
      const text = value.map(String).join(', ');
      return text.length > 40 ? text.slice(0, 40) + '…' : text || '[]';
    }
    const text = String(value);
    return text.length > 60 ? text.slice(0, 60) + '…' : text || '—';
  }

  // ---- drag (the head row doubles as the grab bar) ----------------------
  // <4px total displacement on release = a click (the buttons' native
  // behavior — no capture was set, nothing to undo); ≥4px = a drag:
  // capture on threshold-cross, reposition clamped to the host, swallow
  // the trailing click. See the header comment for the full contract.
  const DRAG_THRESHOLD_PX = 4;
  let dockX = $state(0);
  let dragging = $state(false);
  let armedPointerId: number | null = null;
  let dragStartClientX = 0;
  let dragBaseX = 0;
  let dragMinX = 0;
  let dragMaxX = 0;
  let swallowClick = false;
  let dockEl: HTMLElement;
  let headEl: HTMLElement;

  function onHeadPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // THE EIGHT-AXIS RUN OWNS ITS GESTURES (the Owner directive's
    // scrollable bar): a pointer down inside the ButtonGroup's scroll
    // host (the run + its veil layer + chevron chips) never arms the
    // dock drag — the bar pans itself (touch-action pan-x re-enabled
    // on the run in component-canvas.css); the drag surface is the
    // head AROUND it: the grip, the breathing gaps, the bands
    if (event.target instanceof Element && event.target.closest('[data-jx-btngroup-host]')) {
      return;
    }
    armedPointerId = event.pointerId;
    dragStartClientX = event.clientX;
    dragBaseX = dockX;
    // measure the clamp window at press: the host is the stage-row (the
    // one-cell grid host, found by its attribute — NOT offsetParent:
    // the dock is a static grid item now, so its offsetParent is
    // whichever ancestor happens to be positioned, not the host); the
    // gap keeps the box off both host edges (≈ --jx-gap on each side)
    const host = dockEl?.closest('[data-jx-canvas-stage-row]') as HTMLElement | null;
    if (dockEl && host) {
      const hostRect = host.getBoundingClientRect();
      const box = dockEl.getBoundingClientRect();
      const left0 = box.left - dockX; // the un-translated left edge
      const inset = hostRect.right - left0 - box.width; // ≈ --jx-gap
      dragMinX = hostRect.left + inset - left0;
      dragMaxX = hostRect.right - inset - box.width - left0;
    } else {
      dragMinX = 0;
      dragMaxX = 0;
    }
  }

  function onHeadPointerMove(event: PointerEvent): void {
    if (armedPointerId === null || event.pointerId !== armedPointerId) return;
    const dx = event.clientX - dragStartClientX;
    if (!dragging && Math.abs(dx) >= DRAG_THRESHOLD_PX) {
      dragging = true;
      headEl?.setPointerCapture?.(event.pointerId);
    }
    if (dragging) dockX = clampDockX(dragBaseX + dx, dragMinX, dragMaxX);
  }

  function endHeadDrag(event: PointerEvent): void {
    if (armedPointerId === null || event.pointerId !== armedPointerId) return;
    if (dragging) {
      swallowClick = true;
      dragging = false;
    }
    armedPointerId = null;
  }

  function onHeadClickCapture(event: MouseEvent): void {
    if (swallowClick) {
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions -- the
     head row is the decorative drag bar: pointer handlers only reposition
     the dock (capture on 4px threshold, never hijacking clicks); the
     toggle and reset buttons inside carry every actual function -->
{#snippet resetGlyph()}
  <Icon name="rotateCcw" size={12} />
{/snippet}
{#snippet themeGlyph()}
  <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={11} />
{/snippet}
{#snippet chevronGlyph()}
  <span
    class={cn('jx-canvas-chevron', cx(stackStyles.baseInline), !open ? cx(canvasStyles.chevronRight) : '')}
    aria-hidden="true"
  >
    <Icon name="chevronDown" size={11} />
  </span>
{/snippet}
<!-- THE SEVEN GLYPHS — LITERAL names only (the artifact's chunk law:
     the scanner collects exactly these from this markup; a composed
     dynamic name would pack nothing and render the reserved box).
     Semantics: type = the §1 root font-size; shapes = corner geometry;
     squircle = corner magnitude; rows-3 = the §4 spacing rhythm;
     palette = the §5 hue axis; layers = the §7 stacked planes; gauge
     = the §8 intensity dial -->
{#snippet sizeGlyph()}
  <Icon name="type" size={11} />
{/snippet}
{#snippet shapeGlyph()}
  <Icon name="lucide:shapes" size={11} />
{/snippet}
{#snippet radiusGlyph()}
  <Icon name="lucide:squircle" size={11} />
{/snippet}
{#snippet densityGlyph()}
  <Icon name="lucide:rows3" size={11} />
{/snippet}
{#snippet colorGlyph()}
  <Icon name="palette" size={11} />
{/snippet}
{#snippet elevationGlyph()}
  <Icon name="lucide:layers" size={11} />
{/snippet}
{#snippet motionGlyph()}
  <Icon name="lucide:gauge" size={11} />
{/snippet}
<!-- ONE SHARED FACE for the seven menu axes (the generic keeps the
     axis↔values pair correlated for setAxis's keyed write): an
     icon-only ghost IconButton carrying the native popovertarget
     invoker (the platform path, the ButtonGroup overflow trigger's
     own idiom), the family's DropdownMenu with `auto` + the named
     steps, and a check glyph on the current value — `auto` (the
     default) stamps NOTHING -->
{#snippet axisControl<K extends CanvasAxisName>(
  ax: { readonly axis: K; readonly label: string; readonly values: readonly CanvasAxisLanes[K][] },
  glyph: Snippet,
)}
  {@const axisMenuId = `jx-canvas-${dockId}-axis-${ax.axis}`}
  <DropdownMenu id={axisMenuId} placement="bottom-end">
    {#snippet trigger()}
      <IconButton
        icon={glyph}
        text={ax.label}
        iconOnly
        tip={false}
        title={ax.label}
        aria-haspopup="menu"
        popovertarget={axisMenuId}
        data-jx-canvas-axis={ax.axis}
        data-axis-auto={axes[ax.axis] === 'auto' || undefined}
      />
    {/snippet}
    {#each ax.values as value (value)}
      <DropdownMenuItem
        data-axis-value={value}
        data-axis-current={axes[ax.axis] === value || undefined}
        onclick={() => setAxis(ax.axis, value)}
      >
        <span data-jx-canvas-axis-check data-on={axes[ax.axis] === value || undefined} aria-hidden="true">
          <Icon name="check" size={12} />
        </span>
        <span>{value}</span>
      </DropdownMenuItem>
    {/each}
  </DropdownMenu>
{/snippet}

<aside
  data-jx-canvas-dock
  bind:this={dockEl}
  style:--jx-dock-x={`${dockX}px`}
  class={cn(cx(canvasStyles.dock), className)}
  aria-label={`Controls for ${title}`}
>
  <!-- THE HEAD IS A CARVED BAND TOO (carved-action-band round 2, the
       Owner ruling 2026-09-09: "把它改成 foot 的样式…一开始 button bar
       那种风格"): the chrome row is the same law as the foot — the
       zone (ghost + flat) quiets every control (no redundant borders,
       the ButtonBar spirit), controls FILL the band vertically
       (items-stretch, no py padding floating them in whitespace), the
       band rides the dock's top edge and the body's border-t below is
       its rim. aria-pressed/expanded/controls ride the REST LANE onto
       the IconButton roots; the density select is the one non-press
       cell — a borderless ghost select stretched to the band -->
  <div
    data-jx-canvas-dock-head
    data-dragging={dragging || undefined}
    class={cx(stackStyles.base, stackStyles.alignStretch, stackStyles.justifyBetween, stackStyles.gap8)}
    bind:this={headEl}
    onpointerdown={onHeadPointerDown}
    onpointermove={onHeadPointerMove}
    onpointerup={endHeadDrag}
    onpointercancel={endHeadDrag}
    onclickcapture={onHeadClickCapture}
  >
    <ButtonVariantScope variant="ghost" raised={false}>
      <!-- THE EIGHT-AXIS CLUSTER: [grip, the scrollable axis run] — the
           standard row on EVERY canvas demo (the Owner directive
           2026-09-21 replaces the retired theme+select pair) -->
      <div class={cx(stackStyles.base, stackStyles.alignStretch)}>
        <span
          class={cx(canvasStyles.grip)}
          aria-hidden="true"
          data-jx-canvas-dock-grip
        >
          <Icon name="gripVertical" size={11} />
        </span>
        <!-- THE TOOLBAR SEAMS (Owner r7, the actual ask all along: "icon、
             button、select 之间的分割线"): vertical Separator instances
             frame the scrollable run — the run's OWN whisper seams
             (between the eight controls) ride the ButtonGroup's ghost
             separator policy, the same ink law, the family's carrier.
             THE GHOST (Owner r9: "这种分割线本身只是一个视觉辅助" — a
             visual aid should whisper, not paint): the seams ride the
             default fused ink, zero color tokens — on this uniform
             near-white acrylic the subtraction shifts only a few
             255ths (measured r8: no pixel below 235), a whisper; the
             Owner accepted the subtlety as the point -->
        <Separator orientation="vertical" aria-hidden="true" />
        <!-- THE AXIS RUN (the Owner: 「这个 bar 可能会很长，所以可以考
             虑使用 ButtonGroup 的可滚动性来提供支持」): the EIGHT axis
             controls — the theme cycle button + the seven menu axes —
             ride ONE ButtonGroup at overflow="scroll" (the family's
             own scroll capability: the root becomes the scroll run,
             hidden scrollbar, proximity snap, ramped edges), so the
             long bar SCROLLS horizontally instead of wrapping. THE
             SIZE (「这个 bar 的尺寸可以缩小一些」): density xs — the
             dock foot's own compact chrome scale — one notch down,
             coherently (glyphs 12→11 with it, the seams and the
             legibility kept). Under the head's ghost zone the group
             inherits ghost: the borderless row's seams ARE the
             policy's own. THE FULL RAMP (W7-r2, the chip-collision
             MINOR): the cheap posture ramp({ blur: false }) let the
             frosted chip SLICE the cutoff glyph mid-shape at rest —
             an opaque square over a hard edge reads as collision, not
             scroll. The full builder (opacity + blur + translate, the
             family's own ramp capabilities, default magnitudes) melts
             the crossing member toward the edge so the cutoff reads
             as scroll-fade under the frost -->
        <ButtonGroup
          label="Stage axes"
          overflow="scroll"
          scrollEffect={ramp()}
          density="xs"
          data-jx-canvas-dock-axes
        >
          <IconButton
            icon={themeGlyph}
            text="Toggle theme"
            iconOnly
            tip={false}
            title="Toggle theme"
            aria-pressed={theme === 'dark'}
            data-jx-canvas-theme-toggle
            onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}
            class="jx-canvas-dock-theme"
          />
          {@render axisControl(AXIS_CONTROLS.size, sizeGlyph)}
          {@render axisControl(AXIS_CONTROLS.shape, shapeGlyph)}
          {@render axisControl(AXIS_CONTROLS.radius, radiusGlyph)}
          {@render axisControl(AXIS_CONTROLS.density, densityGlyph)}
          {@render axisControl(AXIS_CONTROLS.color, colorGlyph)}
          {@render axisControl(AXIS_CONTROLS.elevation, elevationGlyph)}
          {@render axisControl(AXIS_CONTROLS.motion, motionGlyph)}
        </ButtonGroup>
        <!-- the breathing gap is BRACKETED (Owner r11): a seam closes
             the left cluster too — the elastic space sits BETWEEN two
             whisper lines, the whole bar one seamed toolbar -->
        <Separator orientation="vertical" aria-hidden="true" />
      </div>
      {#if hasBody}
        <!-- the collapse chevron: only when the dock HAS a body — its
             own right-hand group with a seam hugging its left edge
             (Owner r10: the run↔toggle boundary is a cell boundary
             like any other; the elastic breathing sits between the
             run and THIS group's seam). density xs joins the bar's
             compact scale -->
        <div class={cx(stackStyles.base, stackStyles.alignStretch)}>
          <Separator orientation="vertical" aria-hidden="true" />
          <IconButton
            icon={chevronGlyph}
            text="Playground"
            iconOnly
            tip={false}
            title="Playground"
            density="xs"
            aria-expanded={open}
            aria-controls={bodyId}
            data-jx-canvas-dock-toggle
            onclick={() => (open = !open)}
            class="jx-canvas-dock-toggle"
          />
        </div>
      {/if}
    </ButtonVariantScope>
  </div>

  {#if hasBody}
  <!-- THE HEAD BAR'S OWN RIM (Owner r6: the line belongs to the head —
       "我说的是头部这个可拖动的 bar"): a solid Separator riding as the
       head's direct sibling — Dialog's head-band edge separator in the
       dock's dialect. Moved OUT of the clip (the first attempt rode the
       clip's very top edge inside overflow-hidden — one environment
       rendered it, another didn't); a shrink-0 sibling of the animated
       collapse is immune to the clip's paint and the flex squeeze, and
       hides with the collapsed body -->
  <div class={cn(cx(canvasStyles.rimWrap), !open ? cx(canvasStyles.rimWrapHidden) : '')}>
    <Separator variant="solid" aria-hidden="true" />
  </div>
  <div
    bind:this={collapseEl}
    class={cn(
      'jx-canvas-dock-collapse',
      cx(gridStyles.base, gridStyles.rowsCollapse),
      open && cx(gridStyles.rowsOpen),
    )}
    id={bodyId}
    data-open={open || undefined}
    inert={!open || undefined}
  >
    <!-- the clip is a FLEX COLUMN (the Owner acceptance's compression
         catch): when the dock's stage-height bound squeezes the
         collapse, the SCROLLER absorbs (flex + min-block 0 in the css)
         and the pinned bar keeps its full height — a plain block clip
         let the content overflow and cut the bar to half a button -->
    <div data-jx-canvas-dock-clip class={cx(canvasStyles.dockClip)}>
      <!-- the internal scroll surface: capped block size + guttered thin
           scrollbar (the old pane's containment law, dock-sized); the
           output foot below stays pinned -->
      <div data-jx-canvas-dock-scroll class={cx(canvasStyles.dockScroll)}>
        <ItemGroup mode="plain" controlChrome="integrated" density="sm" data-jx-canvas-dock-group>
          {#if playground}
            <!-- escape-hatch precedence: the snippet renders and the schema
                 rows are NOT duplicated beside it -->
            {@render playground()}
          {:else}
            <!-- the unified row grammar (2026-09-04, migrated 2026-09-08):
                 the same ItemField scaffold the play kit's play-row bridges
                 onto — variant auto now, so the rows yield their chrome to
                 the dock's group (B5). data-jx-canvas-row wraps each row as
                 display:contents — the DOM contract the tests key on,
                 without touching the family API -->
            {#each rows ?? [] as row (row.key)}
              <div data-jx-canvas-row data-jx-canvas-control={row.control} class={cx(canvasStyles.rowScope)}>
                {#if row.control === 'toggle'}
                  <ItemToggle
                    id={ctlId(row.key)}
                    label={row.label}
                    description={row.description}
                    checked={Boolean(rowValue(row))}
                    onchange={(event) => setValue(row.key, event.currentTarget.checked)}
                    data-jx-canvas-toggle
                  />
                {:else if row.control === 'select'}
                  <ItemSelect
                    id={ctlId(row.key)}
                    label={row.label}
                    description={row.description}
                    value={String(rowValue(row) ?? '')}
                    onchange={(event) => setValue(row.key, event.currentTarget.value)}
                    data-jx-canvas-select
                  >
                    {#each row.values ?? [] as option (option)}
                      <option value={option}>{option}</option>
                    {/each}
                  </ItemSelect>
                {:else if row.control === 'text'}
                  <ItemInput
                    id={ctlId(row.key)}
                    label={row.label}
                    description={row.description}
                    value={String(rowValue(row) ?? '')}
                    oninput={(event) => setValue(row.key, event.currentTarget.value)}
                    data-jx-canvas-text
                  />
                {:else if row.control === 'slider'}
                  <ItemInput
                    id={ctlId(row.key)}
                    label={row.label}
                    description={row.description}
                    type="range"
                    min={row.minimum}
                    max={row.maximum}
                    step={row.step}
                    value={Number(rowValue(row) ?? row.minimum ?? 0)}
                    oninput={(event) => setValue(row.key, Number(event.currentTarget.value))}
                    data-jx-canvas-slider
                  />
                {:else if row.control === 'stepper'}
                  <!-- grindstone #17-3: the stepper trio retired INTO
                       ItemStepper (ItemField + NumberInput) — hold
                       acceleration, min/max clamp and step snap are the
                       control's own; direct typing + native ↑/↓ are
                       first-class upgrades. THE BIND IS THE STEP CHANNEL
                       (NumberInput fires change on typing alone — the
                       button steps write through bind:value into the
                       schema values); onchange keeps the onvalue seam
                       alive for typing commits. data-jx-canvas-stepper
                       rides the rest lane onto the native input (the
                       dock's DOM contract anchor) -->
                  <ItemStepper
                    id={ctlId(row.key)}
                    label={rowLabel(row)}
                    description={row.description}
                    bind:value={values[row.key]}
                    min={row.minimum}
                    max={row.maximum}
                    step={row.step}
                    onchange={(event) => {
                      const n = event.currentTarget.valueAsNumber;
                      if (Number.isFinite(n)) setValue(row.key, n);
                    }}
                    data-jx-canvas-stepper
                  />
                {:else if row.control === 'axis-enum'}
                  <!-- the axis lane switch (W4): auto + named steps +
                       the number/query() modes; the select drives the
                       lane key itself — data-jx-canvas-axis-select is
                       the probe's DOM anchor. The DISPLAYED value is
                       the bar/panel SINGLE TRUTH (W7-r2): the record's
                       own mode, else the canvas's resolved lane (see
                       axisDisplay) — a bar-path set reads here too -->
                  <ItemSelect
                    id={ctlId(row.key)}
                    label={rowLabel(row)}
                    description={row.description}
                    value={axisDisplay(row)}
                    onchange={(event) => onAxisModeChange(row, event.currentTarget.value)}
                    data-jx-canvas-axis-select
                  >
                    {#each row.values ?? [] as option (option)}
                      <option value={option}>{option}</option>
                    {/each}
                  </ItemSelect>
                {:else if row.control === 'axis-number'}
                  <!-- the exact-number lane — VISIBLE ONLY in number
                       mode (the enum row owns the switch); the
                       controlled form (the slider row's idiom): value
                       in, onchange commits through setValue — the
                       stepper writes values['<axis>:number'] -->
                  {#if axisMode(row) === 'number'}
                    <ItemStepper
                      id={ctlId(row.key)}
                      label={rowLabel(row)}
                      description={row.description}
                      value={axisNumberOf(row)}
                      min={row.minimum}
                      max={row.maximum}
                      step={row.step}
                      onchange={(event) => {
                        const num = event.currentTarget.valueAsNumber;
                        if (Number.isFinite(num)) setValue(row.key, num);
                      }}
                      data-jx-canvas-axis-number
                    />
                  {/if}
                {:else if row.control === 'query-editor'}
                  <!-- the query() source editor — VISIBLE ONLY in
                       query() mode; mono text in the block lane, the
                       parse verdict rides the family's error channel -->
                  {#if axisMode(row) === 'query()'}
                    <ItemInput
                      id={ctlId(row.key)}
                      label={rowLabel(row)}
                      description={'e.g. { sm: \'large\', \'@sm/card\': 20 } — media keys bare, container keys carry @'}
                      value={String(values?.[row.key] ?? '')}
                      oninput={(event) => onQuerySourceInput(row, event.currentTarget.value)}
                      error={invalidQueryKeys.has(row.key) ? 'not a valid query() object literal' : undefined}
                      data-jx-canvas-axis-query
                    />
                  {/if}
                {:else}
                  <!-- grindstone #17-3: the aria-pressed button row
                       retired INTO ItemSegmented (ItemField + ToggleGroup
                       single) — native radios own the arrow-walk and the
                       single tab stop the buttons could never claim;
                       the segment's identity is the radio's VALUE.
                       data-jx-canvas-seg rides the rest lane onto the
                       radiogroup root (the dock's DOM contract anchor) -->
                  <ItemSegmented
                    id={ctlId(row.key)}
                    label={row.label}
                    description={row.description}
                    options={(row.values ?? []).map((option) => ({ value: option }))}
                    value={String(rowValue(row) ?? '')}
                    onValueChange={(option) => setValue(row.key, option)}
                    data-jx-canvas-seg
                  />
                {/if}
              </div>
            {/each}
          {/if}
        </ItemGroup>
        {#if output?.length}
          <!-- the output projection (D4, migrated): read-only rows in the
               item rhythm; dl semantics kept, never a live region -->
          <dl class={cn('jx-canvas-output', cx(canvasStyles.output))}>
            {#each output as item, index (`${item.label}-${index}`)}
              <div
                data-jx-canvas-output-row
                class={cx(canvasStyles.outputRow)}
              >
                <dt class={cx(canvasStyles.outputLabel)}>{item.label}</dt>
                <!-- VALUE ink = text-foreground (V1-4/V2-9, 2026-09-02):
                     the old --accent-foreground pick was a token-category
                     error — that token is the ink meant to sit ON an
                     accent FILL (white in light, black in dark), so on
                     the neutral pane it rendered near-invisible in BOTH
                     themes (249-on-249 light, black-on-black dark) -->
                <dd class={cx(canvasStyles.outputValue)}>{formatOutput(item.value)}</dd>
              </div>
            {/each}
          </dl>
        {/if}
      </div>
      {#if onreset || rows}
        <!-- the pinned reset bar — THE CARVED ACTION BAND
             (carved-action-band, 2026-09-09): not a footer, the same
             law. PINNED OUTSIDE THE SCROLLER (the vision acceptance's
             D catch): the scroll region reserves a stable thin-scrollbar
             gutter even when idle, so a bar INSIDE it could never bleed
             to the dock's edge — out here the clip hands it the dock's
             full width for free. The rim border-t spans the dock, the
             band rides the dock's bottom edge, and CardFooter's
             standalone mirror carves the reset IconButton into the
             corner cell — it FILLS the band vertically (the rim is its
             top edge, the leadingSeam its carved left edge). THE
             ACTION-BAND ZONE (ghost + flat): the IconButton renders
             quiet with zero paint props; density xs keeps the dock's
             compact chrome scale. Page-owned onreset wins; schema mode
             falls back to schema defaults -->
        <ButtonVariantScope variant="ghost" raised={false}>
          <div data-jx-canvas-dock-foot class={cx(stackStyles.base, stackStyles.column)}>
            <!-- the rim: a Separator instance at SOLID ink (the
                 ghost's blind spot on the dock's uniform ground) -->
            <Separator variant="solid" aria-hidden="true" />
            <CardFooter label="Playground actions">
              <!-- the stamp rides the REST LANE (floating-flesh-sweep:
                   press-button/icon-button pass attributes through now —
                   the wrapper era retired) -->
              <IconButton
                icon={resetGlyph}
                text="Reset playground"
                iconOnly
                tip={false}
                density="xs"
                data-jx-canvas-reset
                onclick={() => (onreset ? onreset() : resetValues())}
                class="jx-canvas-reset"
              />
            </CardFooter>
          </div>
        </ButtonVariantScope>
      {/if}
    </div>
  </div>
  {/if}
</aside>

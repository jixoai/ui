<!--
  jixoai canvas playground dock (registry/files/ui/component-canvas/
  canvas-playground.svelte — canvas-playground-dock, 2026-09-08; head
  standardized to the unified chrome the same day, Owner amendment).

  The floating, collapsible, horizontally draggable controls panel that
  replaced the canvas's permanent Playground aside lane (the Owner
  reform ruling): absolute over the stage-row's top-right corner (the
  scroll layer's sibling, never scrolling with stage content), mounting
  EXPANDED and collapsing to its head chip on toggle. The canvas passes
  everything through — the dock never reads context itself. The dock
  mounts on EVERY canvas: the head is the UNIFIED CHROME STANDARD
  (Owner ruling, mid-flight amendment) — [drag grip, theme icon button,
  density select, chevron?] — the chrome row every demo ships; without
  body content (no playground snippet, no schema, no output) there is
  no chevron and no expansion, the chrome row stands alone.

  - HEAD: [grip icon (decorative, aria-hidden — the drag affordance),
    ONE icon button flipping theme light↔dark (sun/moon swap,
    aria-pressed carries state), a compact native select with the
    REPO-STANDARD Density vocabulary xs/sm/default/lg stamped onto the
    stage DIRECTLY (data-density, no mapping), and — only when the dock
    HAS a body — the collapse chevron (aria-expanded + aria-controls;
    collapsed points →, expanded points ↓]. The reset moved OUT of the
    head (exactly four elements, no fifth): the icon-only reset rides
    the body's foot row next to the output dl.
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
    tap never captures and the head's buttons/select keep their native
    behavior — and after a real drag one capture-phase click swallow on
    the head makes the drag click-proof (<4px = click, ≥4px =
    reposition, never both). Position is transient per canvas instance;
    the clamp keeps the box inside the host stage-row (measured at drag
    start; the PURE clampDockX in the module script carries the math —
    the toast-swipe precedent). touch-action none + grab/grabbing
    cursors on the head; drag is decorative and pointer-only — every
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
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ItemGroup, ItemField, ItemToggle, ItemSelect, ItemInput } from '$lib/ui/list-item';
  import type { ItemFieldContext } from '$lib/ui/list-item';
  import type { Density } from '$lib/density.svelte';
  import { ComponentCanvasDefaults } from './component-canvas-defaults.svelte';
  import Icon from '$lib/ui/icon';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
  import { cn } from '$lib/utils';
  import type { ControlRow, PlayOutput } from './canvas-schema.svelte';

  interface Props {
    /** aria context only — names the dock's controls region. */
    title: string;
    /** Stage preview theme — PAGE-OWNED (bindable chain through the canvas). */
    theme?: 'light' | 'dark';
    /** Stage density — PAGE-OWNED; the REPO-STANDARD Density union. */
    density?: Density;
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
    density = $bindable('default'),
    playground,
    rows,
    schemaDefaults,
    values = $bindable(),
    onvalue,
    onreset,
    output,
    class: className = '',
  }: Props = $props();

  // the single read point (A3): the destructure default keeps the
  // explicit lane permanently hot — the ambient zone never rides the
  // stage (the stage-boundary posture, see the Defaults header)
  const dDensity = $derived(ComponentCanvasDefaults.resolve({ density }).density);

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

  function stepValue(row: ControlRow, direction: 1 | -1): void {
    let next = Number(rowValue(row));
    if (!Number.isFinite(next)) next = row.minimum ?? 0;
    if (row.minimum !== undefined) next = Math.max(row.minimum, next);
    if (row.maximum !== undefined) next = Math.min(row.maximum, next);
    next += row.step * direction;
    if (row.minimum !== undefined) next = Math.max(row.minimum, next);
    if (row.maximum !== undefined) next = Math.min(row.maximum, next);
    setValue(row.key, next);
  }

  const stepText = (row: ControlRow): string => {
    const n = Number(rowValue(row));
    return Number.isFinite(n) ? String(n) : String(row.minimum ?? 0);
  };

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

<aside
  data-jx-canvas-dock
  bind:this={dockEl}
  style:--jx-dock-x={`${dockX}px`}
  class={cn(
    'flex flex-col min-w-0 border border-border shadow-xs text-foreground',
    className,
  )}
  aria-label={`Controls for ${title}`}
>
  <div
    data-jx-canvas-dock-head
    data-dragging={dragging || undefined}
    class="jx-canvas-dock-head flex items-center justify-between gap-2 px-2 py-[0.35rem]"
    bind:this={headEl}
    onpointerdown={onHeadPointerDown}
    onpointermove={onHeadPointerMove}
    onpointerup={endHeadDrag}
    onpointercancel={endHeadDrag}
    onclickcapture={onHeadClickCapture}
  >
    <!-- the chrome cluster: [grip, theme, size] — the standard row on
         EVERY canvas demo (Owner amendment 2026-09-08) -->
    <div class="flex items-center gap-[0.35rem]">
      <span
        class="jx-canvas-dock-grip inline-flex items-center text-muted-foreground"
        aria-hidden="true"
        data-jx-canvas-dock-grip
      >
        <Icon name="gripVertical" size={12} />
      </span>
      <button
        type="button"
        data-jx-canvas-theme-toggle
        class="jx-press jx-canvas-dock-theme inline-flex size-[calc(var(--jx-hit)+2px)] items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]"
        aria-label="Toggle theme"
        aria-pressed={theme === 'dark'}
        title="Toggle theme"
        onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={12} />
      </button>
      <!-- the size toggle: a compact native select with the
           REPO-STANDARD Density vocabulary, stamped onto the stage
           DIRECTLY (no comfortable/compact mapping — the amendment) -->
      <select
        data-jx-canvas-density-select
        class="jx-canvas-dock-density border border-border bg-background text-foreground cursor-pointer font-nav text-[10px] tracking-[0.14em] uppercase h-[calc(var(--jx-hit)+2px)] px-[0.4rem]"
        aria-label="Density"
        title="Density"
        value={dDensity}
        onchange={(event) => (density = event.currentTarget.value as Density)}
      >
        <option value="xs">xs</option>
        <option value="sm">sm</option>
        <option value="default">default</option>
        <option value="lg">lg</option>
      </select>
    </div>
    {#if hasBody}
      <!-- the collapse chevron: only when the dock HAS a body -->
      <button
        type="button"
        data-jx-canvas-dock-toggle
        class="jx-press jx-canvas-dock-toggle inline-flex size-[calc(var(--jx-hit)+2px)] items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]"
        aria-expanded={open}
        aria-controls={bodyId}
        aria-label="Playground"
        title="Playground"
        onclick={() => (open = !open)}
      >
        <span
          class="jx-canvas-chevron inline-flex transition-transform duration-150 ease-out"
          class:-rotate-90={!open}
          aria-hidden="true"
        >
          <Icon name="chevronDown" size={12} />
        </span>
      </button>
    {/if}
  </div>

  {#if hasBody}
  <div
    class={cn(
      'jx-canvas-dock-collapse grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
      open && 'grid-rows-[1fr] border-t border-border',
    )}
    id={bodyId}
    data-open={open || undefined}
    inert={!open || undefined}
  >
    <div data-jx-canvas-dock-clip class="min-h-0 overflow-hidden">
      <!-- the internal scroll surface: capped block size + guttered thin
           scrollbar (the old pane's containment law, dock-sized); the
           output foot below stays pinned -->
      <div data-jx-canvas-dock-scroll class="jx-canvas-dock-scroll px-2 pb-2 pt-[0.4rem]">
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
              <div data-jx-canvas-row data-jx-canvas-control={row.control} class="contents">
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
                  <ItemField id={ctlId(row.key)} labelMode="text" label={row.label} description={row.description}>
                    {#snippet control(field: ItemFieldContext)}
                      <div
                        class="jx-canvas-stepper"
                        role="group"
                        aria-labelledby={field.labelId}
                        aria-describedby={field.describedBy}
                        data-jx-canvas-stepper
                      >
                        <button
                          type="button"
                          class="jx-press jx-canvas-step-btn"
                          data-jx-canvas-step="dec"
                          aria-label={`Decrease ${row.label}`}
                          onclick={() => stepValue(row, -1)}
                        >−</button>
                        <span class="jx-canvas-step-value" data-jx-canvas-stepper-value>{stepText(row)}{row.unit ? ` ${row.unit}` : ''}</span>
                        <button
                          type="button"
                          class="jx-press jx-canvas-step-btn"
                          data-jx-canvas-step="inc"
                          aria-label={`Increase ${row.label}`}
                          onclick={() => stepValue(row, 1)}
                        >+</button>
                      </div>
                    {/snippet}
                  </ItemField>
                {:else}
                  <ItemField id={ctlId(row.key)} labelMode="text" label={row.label} description={row.description}>
                    {#snippet control(field: ItemFieldContext)}
                      <div
                        class="jx-canvas-seg"
                        role="group"
                        aria-labelledby={field.labelId}
                        aria-describedby={field.describedBy}
                        data-jx-canvas-seg
                      >
                        {#each row.values ?? [] as option (option)}
                          <button
                            type="button"
                            class="jx-press jx-canvas-seg-btn"
                            data-jx-canvas-seg-option={option}
                            aria-pressed={String(rowValue(row)) === option}
                            onclick={() => setValue(row.key, option)}
                          >{option}</button>
                        {/each}
                      </div>
                    {/snippet}
                  </ItemField>
                {/if}
              </div>
            {/each}
          {/if}
        </ItemGroup>
        {#if output?.length}
          <!-- the output projection (D4, migrated): read-only rows in the
               item rhythm; dl semantics kept, never a live region -->
          <dl class="jx-canvas-output m-0 mt-[0.85rem] flex flex-col gap-[0.25rem]">
            {#each output as item, index (`${item.label}-${index}`)}
              <div
                data-jx-canvas-output-row
                class="grid items-baseline gap-[0.6rem] grid-cols-[minmax(5.5rem,auto)_minmax(0,1fr)] bg-[color-mix(in_oklab,var(--muted)_30%,transparent)] border border-[color-mix(in_oklab,var(--border)_60%,transparent)] px-[0.5rem] py-[0.28rem]"
              >
                <dt class="text-muted-foreground font-nav text-[10px] tracking-[0.14em] uppercase">{item.label}</dt>
                <!-- VALUE ink = text-foreground (V1-4/V2-9, 2026-09-02):
                     the old --accent-foreground pick was a token-category
                     error — that token is the ink meant to sit ON an
                     accent FILL (white in light, black in dark), so on
                     the neutral pane it rendered near-invisible in BOTH
                     themes (249-on-249 light, black-on-black dark) -->
                <dd class="text-foreground font-mono text-[11.5px] m-0 min-w-0 [overflow-wrap:anywhere]">{formatOutput(item.value)}</dd>
              </div>
            {/each}
          </dl>
        {/if}
        {#if onreset || rows}
          <!-- the reset foot (the amendment, card-surface-kernel
               2026-09-09): the head keeps exactly its four chrome
               elements, so the icon-only reset rides the body's foot
               row next to the output dl. THE ACTION-BAND ZONE (ghost +
               flat): the IconButton renders quiet with zero paint
               props — the hand-drawn border/bg and the three
               shadow-suppression vars are gone (the zone writes them
               all); density xs keeps the dock's compact chrome scale.
               Page-owned onreset wins; schema mode falls back to
               schema defaults -->
          <ButtonVariantScope variant="ghost" raised={false}>
            <div data-jx-canvas-dock-foot class="flex justify-end mt-[0.5rem]">
              <!-- the semantic stamp rides a wrapper (IconButton passes
                   no rest attrs); the focus-visible css anchor stays on
                   the button itself (.jx-canvas-reset) -->
              <span data-jx-canvas-reset class="inline-flex">
                <IconButton
                  icon={resetGlyph}
                  text="Reset playground"
                  iconOnly
                  tip={false}
                  density="xs"
                  onclick={() => (onreset ? onreset() : resetValues())}
                  class="jx-canvas-reset"
                />
              </span>
            </div>
          </ButtonVariantScope>
        {/if}
      </div>
    </div>
  </div>
  {/if}
</aside>

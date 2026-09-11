<!--
  @jixoai/ui-design (studio) — the property panel (design-studio-r2 T8).

  Orthogonal intents (2):
    1. RENDER — the selected usage's component schema (the T7 meta
       endpoint, x-ui conventions) as controls: enum → segmented
       (≤5) / select, boolean → checkbox, number → stepper, string →
       text input; x-ui.label/icon/i18n decorate the row (icon = a
       tiny lucide inline-SVG map with a monogram fallback). The
       dry-run prop-edit seeds the CURRENT literals at the usage —
       schema defaults only fill unset rows.
    2. EDIT — code-first (design.md §4): a control change POSTs the
       usage {file, component, usageIndex, prop, value} to the
       CAS-arbitrated prop-edit endpoint; success expects HMR to carry
       it into the frame (the T0d assumption) with a frame-refresh
       CustomEvent as the fallback path; non-representable props
       (bound / non-literal) render read-only with "edit in code";
       an agent turn locks the whole panel (chat streaming state).
       Failure notices are TRANSIENT (r3 T1/ID5): every show arms the
       6s self-dismiss (notice.ts) and valid actions clear them.

  Selection contract: B's DesignSelection (selection.ts) — the panel
  is a pure CONSUMER. instanceCount > 1 honestly labels the shared
  usage; edits always land on the usage site. The edit target arrives
  as selectionFile (a primitive the shell resolves) — the panel keeps
  NO object dependency, so poll churn upstream cannot re-seed it
  (#12 T0 layer 2; equivalence.ts).

  Original need: Owner 2026-09-11 (design-studio-r2 T8; VD1/VD1e).
  No host imports; self-contained scoped CSS. Svelte 5 runes.
-->
<script module lang="ts">
  import { createNoticeDismissal } from './notice.ts';
  import { seedSignature, seedTargetOf } from './equivalence.ts';
  import type { DesignSelection } from './selection.ts';

  /** the meta endpoint's payload (the T7 contract) */
  export interface MetaPayload {
    readonly item?: string;
    readonly source?: string;
    readonly schema?: {
      readonly properties?: Record<string, PropSchemaNode>;
      readonly required?: readonly string[];
    };
    readonly warnings?: readonly string[];
  }

  export interface PropSchemaNode {
    readonly type?: 'string' | 'boolean' | 'number';
    readonly enum?: readonly string[];
    readonly minimum?: number;
    readonly maximum?: number;
    readonly default?: string | number | boolean;
    readonly 'x-ui'?: {
      readonly control?: 'segmented' | 'select' | 'toggle' | 'stepper' | 'slider' | 'text' | 'none';
      readonly label?: string;
      readonly description?: string;
      readonly unit?: string;
      readonly icon?: string;
      readonly i18n?: string;
    };
  }

  export type RowValue = string | number | boolean | undefined;

  /** the rendered control row (the kind default, overridable by x-ui.control) */
  export interface ControlRow {
    readonly prop: string;
    readonly kind: 'segmented' | 'select' | 'toggle' | 'stepper' | 'text' | 'readonly';
    readonly label: string;
    readonly description: string;
    readonly icon: string | undefined;
    readonly i18n: string | undefined;
    readonly options: readonly string[];
    readonly minimum: number | undefined;
    readonly maximum: number | undefined;
    readonly unit: string | undefined;
    readonly value: RowValue;
    readonly representable: boolean;
  }

  /** enum ≤5 → segmented, else select (the schema2form convention, simplified for v0) */
  function kindOf(node: PropSchemaNode): ControlRow['kind'] {
    if (node['x-ui']?.control !== undefined && node['x-ui'].control !== 'toggle') {
      return node['x-ui'].control === 'slider' ? 'stepper' : node['x-ui'].control;
    }
    if (node.enum !== undefined) return node.enum.length <= 5 ? 'segmented' : 'select';
    if (node.type === 'boolean') return 'toggle';
    if (node.type === 'number') return 'stepper';
    if (node.type === 'string') return 'text';
    return 'readonly';
  }

  export function rowsFor(meta: MetaPayload, values: Record<string, { representable: boolean; value?: RowValue }>): ControlRow[] {
    const rows: ControlRow[] = [];
    for (const [prop, node] of Object.entries(meta.schema?.properties ?? {})) {
      if (node['x-ui']?.control === 'none') continue; // panel-excluded (snippet/opaque/opt-out)
      const dry = values[prop] ?? { representable: true };
      const kind = dry.representable ? kindOf(node) : 'readonly';
      rows.push({
        prop,
        kind,
        label: node['x-ui']?.label ?? prop,
        description: node['x-ui']?.description ?? '',
        icon: node['x-ui']?.icon,
        i18n: node['x-ui']?.i18n,
        options: node.enum ?? [],
        minimum: node.minimum,
        maximum: node.maximum,
        unit: node['x-ui']?.unit,
        value: dry.representable ? (dry.value ?? node.default) : undefined,
        representable: dry.representable,
      });
    }
    return rows;
  }

  /**
   * The lucide inline mini-map (r2 x-ui.icon): a handful of common
   * names at 12px; anything else degrades to a two-letter monogram.
   * Zero dependencies — raw path data, stroke = currentColor.
   */
  const ICON_PATHS: Record<string, string> = {
    layers: 'M12 2 2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
    type: 'M4 7V4h16v3 M9 20h6 M12 4v16',
    hash: 'M4 9h16 M4 15h16 M10 3 8 21 M16 3l-2 18',
    toggle: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
    power: 'M12 2v10 M18.4 6.6a9 9 0 1 1-12.77.04',
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    columns: 'M3 3h18v18H3z M12 3v18',
    rows: 'M3 3h18v18H3z M3 12h18',
    gap: 'M12 3v6 M12 15v6 M8 6l4-3 4 3 M8 18l4 3 4-3',
    wrap: 'M3 6h18 M3 12h13a3 3 0 1 1 0 6h-4 M9 15l-3 3 3 3',
    align: 'M12 3v18 M6 8l-3 3 3 3 M18 8l3 3-3 3',
    direction: 'M12 3v18 M8 7l4-4 4 4 M8 17l4 4 4-4',
  };

  export function iconPathsOf(name: string | undefined): string[] | null {
    if (name === undefined) return null;
    const paths = ICON_PATHS[name];
    return paths === undefined ? null : paths.split(' ');
  }

  export function monogramOf(label: string): string {
    const letters = label.replaceAll(/[^a-zA-Z]/g, '');
    return letters.slice(0, 2).toLowerCase();
  }
</script>

<script lang="ts">
  let {
    selection = null,
    selectionFile = null,
    locked = false,
    metaUrlBase = '/__design__/api/meta',
    propEditUrl = '/__design__/api/prop-edit',
  }: {
    selection?: DesignSelection | null;
    /** the shell-resolved edit target (selection frameId → source file)
     *  — a PRIMITIVE (#12 T0 layer 2): the last object dependency this
     *  panel had (frameFiles table) is gone; the seed effect depends on
     *  primitives only, so poll churn upstream cannot re-seed it */
    selectionFile?: string | null;
    locked?: boolean;
    metaUrlBase?: string;
    propEditUrl?: string;
  } = $props();

  let meta: MetaPayload | null = $state(null);
  let metaError: string | null = $state(null);
  let usageValues: Record<string, { representable: boolean; value?: RowValue }> = $state({});
  let originallyUnset: Set<string> = $state(new Set());
  let usageShared = $state(false);
  let file: string | null = $state(null);
  let notice: string | null = $state(null);
  let saving = false;

  // ID5 (r3 T1): transient failure notices self-dismiss after 6s —
  // they hung until the next selection in r2, reading as a permanent
  // panel state. Valid actions (a new commit, a selection change)
  // clear them explicitly via clearNotice; this timer is the floor.
  const noticeDismissal = createNoticeDismissal(() => {
    notice = null;
  });

  function showNotice(message: string): void {
    notice = message;
    noticeDismissal.schedule();
  }

  function clearNotice(): void {
    notice = null;
    noticeDismissal.cancel();
  }

  // teardown: a pending dismissal never fires after unmount
  $effect(() => () => noticeDismissal.cancel());

  const rows = $derived(meta === null ? [] : rowsFor(meta, usageValues));
  const shareCount = $derived(selection?.instanceCount ?? 1);

  // #12 T0 layer 2 — the seed effect's no-op guards (non-reactive,
  // never rendered): lastSeed makes an identity-only re-run provably
  // side-effect-free; seedGeneration drops a STALE async seed landing
  // after a newer selection switched the target
  let lastSeed: string | null = null;
  let seedGeneration = 0;

  $effect(() => {
    // primitive deps ONLY (#12 T0 layer 2 + r2 P2-1): the seed's whole
    // world is the four primitives inside seedTargetOf (selection keys
    // + the shell-resolved selectionFile). An identity-only change —
    // the tree recreating the selection OBJECT after a panel write, a
    // manifest poll re-deriving upstream — hits the seedSignature
    // guard and becomes a no-op: no reset, no refetch, no flicker.
    const current = seedTargetOf(selection, selectionFile);
    const seed = current === null ? null : seedSignature(current);
    if (seed === lastSeed) return;
    lastSeed = seed;
    const generation = ++seedGeneration;
    meta = null;
    metaError = null;
    usageValues = {};
    usageShared = false;
    clearNotice();
    if (current === null) return;
    file = current.file;
    void (async () => {
      try {
        const response = await fetch(`${metaUrlBase}/${current.component}.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`meta HTTP ${response.status}`);
        if (generation !== seedGeneration) return; // superseded mid-fetch
        meta = (await response.json()) as MetaPayload;
        // seed the usage's current literals (dry-run — no write)
        if (current.file !== null) {
          const propNames = Object.keys(meta.schema?.properties ?? {});
          const dryResponse = await fetch(propEditUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: current.file, component: current.component, usageIndex: current.usageIndex, dryRun: true, props: propNames }),
          });
          if (dryResponse.ok) {
            if (generation !== seedGeneration) return; // superseded mid-seed
            const dryBody = (await dryResponse.json()) as { ok?: boolean; values?: Record<string, { representable: boolean; value?: RowValue }>; shared?: boolean };
            if (dryBody.ok === true && dryBody.values !== undefined) {
              usageValues = dryBody.values;
              // P2-2: remember which props were ABSENT at seed — an
              // uncheck on those must REMOVE (null), not write false
              originallyUnset = new Set(
                Object.entries(dryBody.values)
                  .filter(([, v]) => v.representable === true && v.value === undefined)
                  .map(([name]) => name),
              );
            }
            if (dryBody.shared === true) usageShared = true;
          }
        }
      } catch (cause) {
        if (generation === seedGeneration) {
          metaError = cause instanceof Error ? cause.message : String(cause);
        }
      }
    })();
  });

  async function commitProp(prop: string, value: RowValue): Promise<void> {
    const current = selection;
    if (current === null || file === null || value === undefined || locked || saving) return;
    // boolean uncheck on an originally-absent prop → REMOVE (null) so
    // the source returns to its seed state instead of gaining
    // raised={false} residue (P2-2, vision r2 catch)
    if (value === false && originallyUnset.has(prop)) value = null;
    saving = true;
    clearNotice();
    try {
      const response = await fetch(propEditUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, component: current.component, usageIndex: current.usageIndex, prop, value }),
      });
      const body = (await response.json()) as { ok?: boolean; reason?: string; message?: string };
      if (response.ok && body.ok === true) {
        usageValues = value === null
          ? { ...usageValues, [prop]: { representable: true } }
          : { ...usageValues, [prop]: { representable: true, value } };
        // HMR fallback path (pre-built): the shell listens and reloads
        // the owning frame when HMR does not carry the edit in
        window.dispatchEvent(new CustomEvent('jx-design:panel-edited', { detail: { frameId: current.frameId, file } }));
      } else if (response.status === 409) {
        showNotice('concurrent write detected — edit abandoned, retry');
      } else if (body.reason === 'non-representable') {
        usageValues = { ...usageValues, [prop]: { representable: false } };
        showNotice(`"${prop}" is bound or non-literal — edit in code`);
      } else {
        showNotice(body.message ?? `edit failed (${body.reason ?? response.status})`);
      }
    } catch (cause) {
      showNotice(cause instanceof Error ? cause.message : String(cause));
    } finally {
      saving = false;
    }
  }

  function step(row: ControlRow, delta: number): void {
    const current = typeof row.value === 'number' ? row.value : row.minimum ?? 0;
    let next = current + delta;
    if (row.minimum !== undefined) next = Math.max(row.minimum, next);
    if (row.maximum !== undefined) next = Math.min(row.maximum, next);
    void commitProp(row.prop, next);
  }

  function onTextSubmit(row: ControlRow, event: SubmitEvent): void {
    event.preventDefault();
    const input = (event.currentTarget as HTMLFormElement).elements.namedItem(row.prop) as HTMLInputElement | null;
    if (input !== null) void commitProp(row.prop, input.value);
  }
</script>

<section class="panel" class:panel-locked={locked}>
  <header class="panel-head">
    <span class="panel-title">props</span>
    {#if selection !== null}
      <span class="panel-target" title={file ?? 'frame file unresolved'}>{selection.component} #{selection.usageIndex}</span>
    {/if}
  </header>

  {#if selection === null}
    <!-- W3 (r3 T1): the empty panel is the flow guide — the canvas
         picker path AND the tree fallback, nested frames named -->
    <p class="panel-hint">no selection — click a component in the canvas, or pick a component node from the tree on the left (components inside nested frames need the tree)</p>
  {:else if metaError !== null}
    <p class="panel-error">meta failed: {metaError}</p>
  {:else if meta === null}
    <p class="panel-hint">loading {selection.component}…</p>
  {:else}
    {#if locked}
      <p class="panel-lock">agent turn in progress — panel is read-only</p>
    {/if}
    {#if notice !== null}
      <p class="panel-notice">{notice}</p>
    {/if}
    {#if shareCount > 1}
      <p class="panel-share">{shareCount} instances share this usage — edits land once, at the usage site</p>
    {:else if usageShared}
      <p class="panel-share">loop usage — instances share this usage; edits land at the usage site</p>
    {/if}
    {#if file === null}
      <!-- ID7 (r3 T1): persistent STATE, not a transient notice — no
           auto-dismiss; it names the cause and two ways out -->
      <p class="panel-notice">frame file unresolved for "{selection.frameId ?? 'canvas'}" — this frame declares no source ref in the manifest, so there is no file to edit. Pick a component on the canvas document or a tree node under a frame with a resolved ref, or check the frame's ref in canvas.svelte — the panel stays read-only.</p>
    {/if}

    <div class="panel-rows">
      {#each rows as row (row.prop)}
        <div class="row" class:row-readonly={!row.representable}>
          <span class="row-label" title="{row.description}{row.i18n !== undefined ? ` · i18n: ${row.i18n}` : ''}">
            {#if iconPathsOf(row.icon) !== null}
              <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                {#each iconPathsOf(row.icon) ?? [] as d (d)}
                  <path {d} />
                {/each}
              </svg>
            {:else if row.icon !== undefined}
              <span class="row-mono">{monogramOf(row.icon)}</span>
            {/if}
            {row.label}{row.unit !== undefined ? ` (${row.unit})` : ''}
          </span>

          {#if row.kind === 'segmented'}
            <span class="seg">
              {#each row.options as option (option)}
                <button
                  type="button"
                  class:seg-on={row.value === option}
                  disabled={locked || file === null}
                  onclick={() => void commitProp(row.prop, option)}
                >{option}</button>
              {/each}
            </span>
          {:else if row.kind === 'select'}
            <select disabled={locked || file === null} value={String(row.value ?? '')} onchange={(event) => void commitProp(row.prop, event.currentTarget.value)}>
              {#each row.options as option (option)}
                <option value={option}>{option}</option>
              {/each}
            </select>
          {:else if row.kind === 'toggle'}
            <input
              type="checkbox"
              checked={row.value === true}
              disabled={locked || file === null}
              onchange={(event) => void commitProp(row.prop, event.currentTarget.checked)}
            />
          {:else if row.kind === 'stepper'}
            <span class="stepper">
              <button type="button" disabled={locked || file === null} onclick={() => step(row, -1)}>−</button>
              <span class="stepper-value">{row.value ?? '—'}</span>
              <button type="button" disabled={locked || file === null} onclick={() => step(row, 1)}>+</button>
            </span>
          {:else if row.kind === 'text'}
            <form class="text-form" onsubmit={(event) => onTextSubmit(row, event)}>
              <input name={row.prop} type="text" value={typeof row.value === 'string' ? row.value : ''} disabled={locked || file === null} />
            </form>
          {:else}
            <span class="row-locked">edit in code</span>
          {/if}
        </div>
      {/each}
      {#if rows.length === 0}
        <p class="panel-hint">no panel-renderable props for {selection.component}</p>
      {/if}
    </div>
  {/if}
</section>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 0.75rem;
    color: #e8e4dd;
    background: #0d0c0b;
  }
  .panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid #262320;
  }
  .panel-title {
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.6875rem;
    color: #b9b2a6;
  }
  .panel-target {
    color: #a9c4a9;
    font-size: 0.6875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .panel-hint,
  .panel-error,
  .panel-notice,
  .panel-lock,
  .panel-share {
    margin: 0.5rem 0.75rem;
    line-height: 1.5;
    color: #8d8578;
  }
  .panel-error { color: #e08585; }
  .panel-notice { color: #d9b46a; }
  .panel-lock,
  .panel-share {
    color: #d9cdb8;
    background: #1b1917;
    border: 1px solid #262320;
    border-radius: 3px;
    padding: 0.375rem 0.5rem;
  }
  .panel-rows {
    flex: 1;
    overflow-y: auto;
    padding: 0.375rem 0.75rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .row-readonly .row-label { opacity: 0.55; }
  .row-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #b9b2a6;
    font-size: 0.6875rem;
  }
  .row-icon {
    width: 0.75rem;
    height: 0.75rem;
    flex: none;
  }
  .row-mono {
    font-size: 0.5625rem;
    text-transform: uppercase;
    border: 1px solid #3a352f;
    border-radius: 2px;
    padding: 0 0.1875rem;
    color: #6f6759;
  }
  .row-locked {
    color: #6f6759;
    font-size: 0.6875rem;
  }
  .seg {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.125rem;
  }
  .seg button {
    all: unset;
    cursor: pointer;
    padding: 0.1875rem 0.5rem;
    border-radius: 3px;
    border: 1px solid #262320;
    color: #8d8578;
    font-size: 0.6875rem;
  }
  .seg button:hover:not(:disabled) { color: #e8e4dd; }
  .seg button.seg-on {
    background: #262320;
    border-color: #4a443c;
    color: #f5f1e8;
  }
  .seg button:disabled { opacity: 0.4; cursor: default; }
  select,
  .text-form input {
    background: #161412;
    color: #e8e4dd;
    border: 1px solid #262320;
    border-radius: 3px;
    padding: 0.1875rem 0.375rem;
    font: inherit;
    font-size: 0.6875rem;
    width: 100%;
    box-sizing: border-box;
  }
  select:disabled,
  .text-form input:disabled { opacity: 0.4; }
  .stepper {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }
  .stepper button {
    all: unset;
    cursor: pointer;
    width: 1.25rem;
    height: 1.25rem;
    display: grid;
    place-items: center;
    border: 1px solid #262320;
    border-radius: 3px;
    color: #b9b2a6;
  }
  .stepper button:hover:not(:disabled) { color: #e8e4dd; }
  .stepper button:disabled { opacity: 0.4; cursor: default; }
  .stepper-value {
    min-width: 2.5rem;
    text-align: center;
    color: #d9cdb8;
  }
  .panel-locked .panel-rows { opacity: 0.6; }
</style>

<!--
  @jixoai/ui-design (studio) — the property panel (design-studio-r2
  T8, RENDER layer rebuilt by r3 T3).

  Orthogonal intents (2):
    1. RENDER — the selected usage's component schema (the T7 meta
       endpoint, x-ui conventions) as controls on the LIST-ITEM
       family (r3 T3, the dogfooding rebuild — rebuild-plan §2.2,
       dock precedent canvas-playground.svelte): rows ride ItemGroup
       mode="plain" density="sm" (the panel owns the surface);
       boolean → ItemToggle, enum ≤5 → segmented (ItemField control
       snippet), enum >5 → ItemSelect, number → stepper (ItemField
       control snippet), string → ItemInput; non-representable rows
       keep the read-only "edit in code" lane. Notices ride `alert`
       (transient failures keep the 6s self-dismiss, ID5), the
       unresolved-frame state is a PERSISTENT alert (ID7), the
       no-selection and no-props states ride `empty` (W3 flow
       guidance), the head's rim is `separator`. x-ui.label/unit/
       description/i18n decorate the rows; the lucide icon mini-map
       stays DORMANT (the family's field rows expose no leading icon
       slot — grindstone ledger, rebuild-plan §6.1).
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

  Dogfooding main path (rebuild-plan §2.1): the panel imports the
  host's REAL components through the #jixoai/ alias (the design
  server's itemAliasBase) — the studio is the library's first
  consumer; the section carries the theme's own .dark scope so the
  family's tokens paint against the studio's dark chrome.

  Original need: Owner 2026-09-11 (design-studio-r2 T8; VD1/VD1e);
  rebuild 2026-09-12 (design-studio-r3 T3, issues #10/#13).
  Svelte 5 runes.
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

  /** the row's label string for the family fields (label + unit paren) */
  export function labelOf(row: ControlRow): string {
    return row.unit === undefined ? row.label : `${row.label} (${row.unit})`;
  }

  /** the row's description line — x-ui.description, the i18n key folded
   *  in (the family's label element has no title slot for a tooltip) */
  export function descriptionOf(row: ControlRow): string | undefined {
    if (row.description === '') return row.i18n === undefined ? undefined : `i18n: ${row.i18n}`;
    return row.i18n === undefined ? row.description : `${row.description} · i18n: ${row.i18n}`;
  }
</script>

<script lang="ts">
  // the dogfooding main path (r3 T3): the host's REAL components via
  // the design server's #jixoai/ alias — the dock precedent's family
  // grammar (canvas-playground.svelte L447-559) carried into the panel
  import Alert from '#jixoai/alert';
  import Empty from '#jixoai/empty';
  import Separator from '#jixoai/separator';
  import { ItemField, ItemGroup, ItemInput, ItemSelect, ItemToggle } from '#jixoai/list-item';
  import type { ItemFieldContext } from '#jixoai/list-item';

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

  // the text rows' commit trigger (the old form-submit, now the
  // Input's Enter): the CURRENT field value is the edit's payload
  function onTextEnter(row: ControlRow, event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    void commitProp(row.prop, event.currentTarget.value);
  }
</script>

<!-- the document-level .dark scope (studio-entry, #23) carries the
     family's tokens now — the panel's own local scope retired with it
     (one source: the whole studio paints the dark token set) -->
<section class="panel" class:panel-locked={locked}>
  <header class="panel-head">
    <span class="panel-title">props</span>
    {#if selection !== null}
      <span class="panel-target" title={file ?? 'frame file unresolved'}>{selection.component} #{selection.usageIndex}</span>
    {/if}
  </header>
  <!-- the head's own rim (the dock precedent's anatomy: a solid
       Separator riding as the head's direct sibling) -->
  <Separator variant="solid" aria-hidden="true" />

  {#if selection === null}
    <!-- W3 (r3 T1): the empty panel is the flow guide — the canvas
         picker path AND the tree fallback, nested frames named -->
    <div class="panel-body">
      <Empty title="no selection" description="click a component in the canvas, or pick a component node from the tree on the left (components inside nested frames need the tree)" />
    </div>
  {:else if metaError !== null}
    <div class="panel-body">
      <Alert variant="tonal" assertive title="meta failed" class="jx-hue-error">{metaError}</Alert>
    </div>
  {:else if meta === null}
    <div class="panel-body">
      <p class="panel-hint">loading {selection.component}…</p>
    </div>
  {:else}
    <div class="panel-body">
      {#if locked}
        <Alert title="agent turn in progress — panel is read-only"></Alert>
      {/if}
      {#if notice !== null}
        <!-- transient (ID5): the 6s self-dismiss owns WHEN it leaves;
             the alert is only the surface (no dismiss affordance of
             its own — grindstone ledger) -->
        <Alert variant="tonal" class="jx-hue-error">{notice}</Alert>
      {/if}
      {#if shareCount > 1}
        <p class="panel-hint">{shareCount} instances share this usage — edits land once, at the usage site</p>
      {:else if usageShared}
        <p class="panel-hint">loop usage — instances share this usage; edits land at the usage site</p>
      {/if}
      {#if file === null}
        <!-- ID7 (r3 T1): persistent STATE, not a transient notice — no
             auto-dismiss; it names the cause and two ways out -->
        <Alert variant="tonal" title="frame file unresolved" class="jx-hue-error">
          no source ref for "{selection.frameId ?? 'canvas'}" in the manifest, so there is no file to edit. Pick a component on the canvas document or a tree node under a frame with a resolved ref, or check the frame's ref in canvas.svelte — the panel stays read-only.
        </Alert>
      {/if}

      {#if rows.length === 0}
        <Empty title="no panel props" description={`no panel-renderable props for ${selection.component}`} />
      {:else}
        <div class="panel-rows">
          <!-- the dock precedent's row grammar: plain mode (the panel
               owns the surface), sm density, the family's field
               adapters per kind; every control honors the lock -->
          <ItemGroup mode="plain" controlChrome="integrated" density="sm">
            {#each rows as row (row.prop)}
              {#if row.kind === 'toggle'}
                <ItemToggle
                  id={`prop-${row.prop}`}
                  label={labelOf(row)}
                  description={descriptionOf(row)}
                  checked={row.value === true}
                  disabled={locked || file === null}
                  onchange={(event) => void commitProp(row.prop, event.currentTarget.checked)}
                />
              {:else if row.kind === 'select'}
                <ItemSelect
                  id={`prop-${row.prop}`}
                  label={labelOf(row)}
                  description={descriptionOf(row)}
                  value={String(row.value ?? '')}
                  disabled={locked || file === null}
                  onchange={(event) => void commitProp(row.prop, event.currentTarget.value)}
                >
                  {#each row.options as option (option)}
                    <option value={option}>{option}</option>
                  {/each}
                </ItemSelect>
              {:else if row.kind === 'text'}
                <ItemInput
                  id={`prop-${row.prop}`}
                  label={labelOf(row)}
                  description={descriptionOf(row)}
                  value={typeof row.value === 'string' ? row.value : ''}
                  disabled={locked || file === null}
                  onkeydown={(event) => onTextEnter(row, event)}
                />
              {:else if row.kind === 'stepper'}
                <ItemField id={`prop-${row.prop}`} labelMode="text" label={labelOf(row)} description={descriptionOf(row)}>
                  {#snippet control(field: ItemFieldContext)}
                    <div class="stepper" role="group" aria-labelledby={field.labelId} aria-describedby={field.describedBy}>
                      <button
                        type="button"
                        class="stepper-btn"
                        aria-label={`Decrease ${row.label}`}
                        disabled={locked || file === null}
                        onclick={() => step(row, -1)}
                      >−</button>
                      <span class="stepper-value">{row.value ?? '—'}</span>
                      <button
                        type="button"
                        class="stepper-btn"
                        aria-label={`Increase ${row.label}`}
                        disabled={locked || file === null}
                        onclick={() => step(row, 1)}
                      >+</button>
                    </div>
                  {/snippet}
                </ItemField>
              {:else if row.kind === 'segmented'}
                <ItemField id={`prop-${row.prop}`} labelMode="text" label={labelOf(row)} description={descriptionOf(row)}>
                  {#snippet control(field: ItemFieldContext)}
                    <div class="seg" role="group" aria-labelledby={field.labelId} aria-describedby={field.describedBy}>
                      {#each row.options as option (option)}
                        <button
                          type="button"
                          class="seg-btn"
                          aria-pressed={row.value === option}
                          disabled={locked || file === null}
                          onclick={() => void commitProp(row.prop, option)}
                        >{option}</button>
                      {/each}
                    </div>
                  {/snippet}
                </ItemField>
              {:else}
                <!-- the unrepresentable row: read-only in the family's
                     own row rhythm (ItemField), the value lane saying
                     why — edits belong to the code -->
                <ItemField id={`prop-${row.prop}`} labelMode="text" label={labelOf(row)} description={descriptionOf(row)}>
                  {#snippet control(field: ItemFieldContext)}
                    <span class="row-readonly" id={field.controlId}>edit in code</span>
                  {/snippet}
                </ItemField>
              {/if}
            {/each}
          </ItemGroup>
        </div>
      {/if}
    </div>
  {/if}
</section>

<style>
  /* r3 T3: the panel's residual CSS is LAYOUT SKELETON ONLY (the
     grid/flex anatomy, the head's spacing, the scroller) plus the
     segmented/stepper snippet chrome the dock precedent authors on
     tokens too (component-canvas.css) — every control's paint is the
     family's own; colors resolve through the theme tokens the .dark
     scope provides */
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
  .panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem 0.75rem;
  }
  .panel-hint {
    margin: 0;
    line-height: 1.5;
    color: #8d8578;
  }
  .panel-rows {
    display: flex;
    flex-direction: column;
  }
  .row-readonly {
    color: #8d8578;
    font-size: 0.6875rem;
    white-space: nowrap;
  }
  /* the segmented idiom (ItemField control snippet) — the dock
     precedent's token-driven chrome, verbatim grammar */
  .seg {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 1px;
  }
  .seg-btn {
    min-block-size: var(--jx-hit, 1.375rem);
    min-inline-size: 1.75rem;
    padding-inline: 0.5rem;
    border: 0;
    background: var(--background);
    color: var(--muted-foreground);
    font-family: var(--font-mono, ui-monospace);
    font-size: 11px;
    cursor: pointer;
  }
  .seg-btn:hover:not(:disabled) {
    color: var(--foreground);
    background: color-mix(in oklab, var(--muted) 55%, transparent);
  }
  .seg-btn[aria-pressed='true'] {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  /* the stepper idiom (ItemField control snippet) — same source */
  .stepper {
    display: inline-flex;
    align-items: stretch;
  }
  .stepper-btn {
    min-block-size: var(--jx-hit, 1.375rem);
    min-inline-size: 1.6rem;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    font-family: var(--font-mono, ui-monospace);
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
  }
  .stepper-btn:hover:not(:disabled) {
    color: var(--foreground);
    background: color-mix(in oklab, var(--muted) 55%, transparent);
  }
  .stepper-value {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--jx-hit, 1.375rem);
    padding-inline: 0.55rem;
    color: var(--foreground);
    font-family: var(--font-mono, ui-monospace);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .seg-btn:disabled,
  .stepper-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .seg-btn:focus-visible,
  .stepper-btn:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .panel-locked .panel-body { opacity: 0.6; }
</style>

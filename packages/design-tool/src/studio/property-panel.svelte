<!--
  @jixoai/ui-design (studio) — the property panel (design-studio-r2
  T8, r3 T3 rebuild; EDIT intent migrated to the collab op lane by
  collab-protocol M7a, 2026-09-15).

  Orthogonal intents (2):
    1. RENDER — the selected usage's component schema (the T7 meta
       endpoint, x-ui conventions) as controls on the LIST-ITEM
       family (r3 T3, the dogfooding rebuild): rows ride ItemGroup
       mode="plain" density="sm" (the panel owns the surface);
       boolean → ItemToggle, enum ≤5 → ItemSegmented, enum >5 →
       ItemSelect, number → ItemStepper, string → ItemInput;
       non-representable rows keep the read-only "edit in code" lane.
       Notices ride `alert` (transient failures self-dismiss through
       the component's own dismiss="auto"); the unresolved-frame and
       awaiting-ingest states are PERSISTENT alerts; the head's rim
       is `separator`. x-ui.label/unit/description/i18n decorate the
       rows; the lucide icon mini-map is LIVE: every row kind renders
       its leading glyph through the family's icon snippet lane.
    2. EDIT — the op lane (M7a): a control change writes the row's
       DESIRED buffer text into the PanelCollabClient (the browser-
       side LoroDoc mirror + pending overlay — panel-collab.ts) and
       the debounced fragment commits ride POST
       /__design__/api/collab/admit as §4 text-op envelopes through
       the workspace admission gate; canonical projections reach the
       .svelte file server-side (atomic write-back → HMR). Component
       addressing is ID-FIRST (the /usage resolution — native `id`,
       never usageIndex); a usage without an id parks the panel
       read-only (the awaiting-ingest defense). Same-buffer overlap
       409s raise the INLINE CONFLICT CARD (§6): 旧值 → 你的 / Agent
       的, 「用我的」 withdraws the human's interleaved fragments via
       the undo face then re-asserts, 「用 Agent 的」 accepts canonical;
       the conflicted row suspends until the choice lands. The SSE
       client decorative lock is RETIRED with this migration — the
       admission gate is the authority; concurrent agent turns
       auto-merge or conflict-card, never blanket-disable.
       MATERIALIZE (design-studio-acceptance-fixes §3, 2026-09-16): a
       bare-boolean or absent prop's FIRST change rides the composite
       /__design__/api/collab/materialize endpoint (one atomic
       tree-update + buffer-seed transaction server-side), then the
       panel RE-SEEDS (/usage + seed) — the prop becomes an ordinary
       buffer and later changes take the admit channel (unchecking a
       materialized boolean is a true→false replace, never a removal);
       expression props stay readonly ("edit in code") on the /usage
       skipped evidence, never guesswork.

  PRESENCE (presence-visuals 2.3, 2026-09-17; presence-liveness
  P3/P4, 2026-09-17): the panel becomes a presence surface BOTH ways.
  DOWN: remote players' panel foci (presenceFoci — field-addressed,
  optional selection {start,end}) light the matching row with a
  box-shadow ring stack (one 2px layer per player) + name chips, and
  a selection renders a player-colored caret bar at its end (the
  zero-width span mirror math — remote-caret.ts) plus, on a range
  (start≠end), the selection highlight rects; the shell's overlay
  outline retires with this change; these in-row renderings are the
  only presentation. UP: any local input/textarea focus/select/
  input/keyup caret change throttle-reports onPresenceAttention
  ({kind:'panel', field, digest ≤40 chars, selection}) with
  selectionchange as the MAIN event (rAF-coalesced) over the
  delegated fallback family, and leaving the panel reports null.
  LIVE INPUT (P3): every typing event on a text surface admits
  through the op lane's 300ms debounce window — Enter is an
  accelerator, never the only commit path. The EDIT intent above is
  untouched — presence only reads events and writes inert
  decorations.

  Selection contract: B's DesignSelection (selection.ts) — the panel
  is a pure CONSUMER; the shell resolves selectionFile (a primitive).

  Original need: Owner 2026-09-11 (design-studio-r2 T8; VD1/VD1e);
  rebuild 2026-09-12 (design-studio-r3 T3); op lane 2026-09-15
  (collab-protocol M7a). Svelte 5 runes.
-->
<script module lang="ts">
  import { seedSignature, seedTargetOf } from './equivalence.ts';
  import type { DesignSelection } from './selection.ts';
  import { parsePropLiteral, renderPropLiteral, type PropValue } from './panel-collab.ts';

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

  /**
   * The not-yet-editable classification (design-studio-acceptance-fixes
   * §3): `bare-bool` — the usage carries `disabled` bare (materializes
   * to `disabled={true}`); `absent` — the schema knows the prop, the
   * usage never wrote it (materializes to ` <prop>=<literal>`). Both
   * ride the composite /materialize endpoint on their FIRST change;
   * expression props keep the readonly "edit in code" lane (binding
   * runtime state — the edit semantics are not the panel's to invent).
   */
  export type MaterializeLane = 'bare-bool' | 'absent';

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
    /** present on materializable rows — the first change rides /materialize */
    readonly materialize?: MaterializeLane;
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

  /** the per-prop edit surface: buffer value | materialization lane | readonly */
  export interface PropSurface {
    readonly representable: boolean;
    readonly value?: RowValue;
    readonly materialize?: MaterializeLane;
  }

  export function rowsFor(meta: MetaPayload, values: Record<string, PropSurface>): ControlRow[] {
    const rows: ControlRow[] = [];
    for (const [prop, node] of Object.entries(meta.schema?.properties ?? {})) {
      if (node['x-ui']?.control === 'none') continue; // panel-excluded (snippet/opaque/opt-out)
      const dry = values[prop] ?? { representable: false }; // no surface = not in the protocol's reach
      const kind: ControlRow['kind'] = dry.representable
        ? kindOf(node)
        : dry.materialize === undefined
          ? 'readonly'
          : dry.materialize === 'bare-bool'
            ? 'toggle' // a bare boolean IS a boolean — the schema's say-so is a courtesy here
            : kindOf(node);
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
        value: dry.representable || dry.materialize !== undefined ? (dry.value ?? node.default) : undefined,
        representable: dry.representable,
        ...(dry.materialize !== undefined ? { materialize: dry.materialize } : {}),
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

  /* ── slot text (the t-<n> buffer rows — issue #38's lane, M7a's buffers) */

  /** one slot-text row sourced from a `t-<n>` buffer */
  export interface SlotTextSpan {
    /** the buffer NAME (t-<n>) — the commit target */
    readonly buffer: string;
    readonly text: string;
  }

  /**
   * The text row's label — an honest POSITION fact under the content
   * API (the Owner ruling: no meta.ts semantic names for free slot
   * composition). One significant fragment reads as the slot itself
   * (「默认内容」); once a boundary splits the slot, each run gets its
   * positional 1-based fragment number.
   */
  export function slotTextLabel(index: number, count: number): string {
    return count <= 1 ? '默认内容' : `默认内容 · 片段 ${index + 1}`;
  }

  /** the row's description line — x-ui.description, the i18n key folded in */
  export function descriptionOf(row: ControlRow): string | undefined {
    if (row.description === '') return row.i18n === undefined ? undefined : `i18n: ${row.i18n}`;
    return row.i18n === undefined ? row.description : `${row.description} · i18n: ${row.i18n}`;
  }

  /** the buffer-ordinal of a t-<n> name (sorting key) */
  export function slotOrdinal(buffer: string): number {
    const match = /^t-(\d+)$/.exec(buffer);
    return match === null ? Number.MAX_SAFE_INTEGER : Number(match[1]);
  }

  /* ── presence-visuals 2.3: the attention report vocabulary ─────────── */

  /** the panel's presence attention payload — the store's PanelCaretFocus
   *  shape verbatim (attention {kind:'panel'} + the optional selection:
   *  equal ends are a collapsed caret, a range is a selection
   *  highlight — presence-liveness P4) */
  export interface PanelAttentionFocus {
    readonly kind: 'panel';
    readonly field: string;
    readonly digest: string;
    readonly selection?: { readonly start: number; readonly end: number };
  }

  /** the digest leak law: the current value truncated to 40 chars with
   *  an honest ellipsis — the remote side sees a hint, never the whole
   *  buffer */
  export const ATTENTION_DIGEST_MAX = 40;

  export function digestOfValue(value: string): string {
    return value.length > ATTENTION_DIGEST_MAX ? `${value.slice(0, ATTENTION_DIGEST_MAX)}…` : value;
  }

  /** caret/selection moves stream — the UP lane collapses to one send
   *  per window (leading fire + trailing flush of the LAST payload);
   *  32ms is the P7 caret-report budget (~30 sends/second ceiling) */
  export const ATTENTION_REPORT_THROTTLE_MS = 32;

  /** live typing admits through the op lane at this debounce
   *  (presence-liveness P3): every input event re-arms one 300ms
   *  window per buffer — Enter is an accelerator, never the only
   *  commit path */
  export const LIVE_INPUT_DEBOUNCE_MS = 300;

  /** the reportable field vocabulary: control ids the panel itself
   *  addresses rows by — family auto-ids (segmented radios, readonly
   *  spans) are NOT presence fields, they never report */
  export function isReportableFieldId(id: string): boolean {
    return id.startsWith('prop-') || id.startsWith('slot-text-');
  }
</script>

<script lang="ts">
  // the dogfooding main path (r3 T3): the host's REAL components via
  // the design server's #jixoai/ alias — the dock precedent's family
  // grammar carried into the panel
  import Alert from '#jixoai/alert';
  import Empty from '#jixoai/empty';
  import Separator from '#jixoai/separator';
  import { ItemField, ItemGroup, ItemInput, ItemSegmented, ItemSelect, ItemStepper, ItemToggle } from '#jixoai/list-item';
  import type { ItemFieldContext } from '#jixoai/list-item';
  import { onDestroy } from 'svelte';
  import { PanelCollabClient, fetchTransport, type PanelCollabSnapshot, type PanelUsageInfo } from './panel-collab.ts';
  import { playerHueCss } from './presence-visuals.ts';
  import { measureCaretMetrics, measureSelectionMetrics, selectionRects, trackFieldSelection } from './remote-caret.ts';

  /** one remote player's panel focus (presence-visuals 2.3 — the shell
   *  resolves attention frames into this list; the panel only consumes).
   *  `selection` carries the remote caret/range (P4): equal ends are a
   *  collapsed caret bar, a range adds the selection highlight */
  interface RemotePanelFocus {
    readonly playerId: string;
    readonly name: string;
    readonly colorHue: number;
    readonly field: string;
    readonly selection?: { readonly start: number; readonly end: number };
  }

  let {
    selection = null,
    selectionFile = null,
    metaUrlBase = '/__design__/api/meta',
    collabUrl = '/__design__/api/collab',
    presencePlayerId = null,
    presenceFoci = [],
    onPresenceAttention = undefined,
    collabTail = 0,
  }: {
    selection?: DesignSelection | null;
    /** the shell-resolved edit target (selection frameId → source file)
     *  — a PRIMITIVE (#12 T0 layer 2): the seed effect depends on
     *  primitives only, so poll churn upstream cannot re-seed it */
    selectionFile?: string | null;
    metaUrlBase?: string;
    /** the collab op lane base (M7a) — usage/admit/sync/undo */
    collabUrl?: string;
    /** the live presence identity (collab-presence §3): feeds the
     *  client's sessionHint so edits attribute to this Player */
    presencePlayerId?: string | null;
    /** remote panel foci (presence-visuals 2.3): each entry lights the
     *  row its field addresses; a selection renders the caret bar and,
     *  on a range, the highlight. Empty/absent = today's panel,
     *  byte-identical */
    presenceFoci?: readonly RemotePanelFocus[];
    /** the UP report lane (presence-visuals 2.3): local caret/focus
     *  changes throttle-flush here as {kind:'panel', field, digest,
     *  selection}; null = the local player left the panel */
    onPresenceAttention?: (focus: PanelAttentionFocus | null) => void;
    /** the journal-tail counter (presence-liveness P3): the shell bumps
     *  this PRIMITIVE on every journal-tail frame so the mirror pulls
     *  the canonical increment IMMEDIATELY (the 4s poll alone cannot
     *  mirror a peer's live-typed admit in the 600ms budget) */
    collabTail?: number;
  } = $props();

  // the presence hint rides whatever client is live (seeded or pending)
  let pendingPresencePlayerId: string | null = null;
  $effect(() => {
    const playerId = presencePlayerId ?? null;
    pendingPresencePlayerId = playerId;
    if (client !== null) client.setPresenceHint(playerId);
  });

  let meta: MetaPayload | null = $state(null);
  let metaError: string | null = $state(null);
  let usageState: PanelCollabSnapshot | null = $state(null);
  let notice: string | null = $state(null);
  /** the usage's non-buffer props (§3 evidence: bare-bool vs expression) */
  let usageSkipped: readonly { name: string; why: string }[] = $state([]);
  /** the live client (non-reactive; its snapshot drives usageState) */
  let client: PanelCollabClient | null = null;

  // ID5 + grindstone #17-1: the transient-notice SCHEDULER is retired —
  // the alert component owns the 6s clock; a new message remounts the
  // keyed alert (a fresh clock), a valid action nulls it.
  const file = $derived(seedTargetOf(selection, selectionFile)?.file ?? null);
  const shareCount = $derived(selection?.instanceCount ?? 1);
  const propValues = $derived.by(() => {
    const values: Record<string, PropSurface> = {};
    const skippedByName = new Map(usageSkipped.map((skip) => [skip.name, skip.why]));
    for (const [prop, node] of Object.entries(meta?.schema?.properties ?? {})) {
      const buffer = (usageState?.buffers ?? []).find((candidate) => candidate.buffer === prop && candidate.how !== 'template-text');
      if (buffer !== undefined) {
        const parsed = parsePropLiteral(buffer.text, buffer.how === 'prop-quoted' ? 'prop-quoted' : 'prop-expr');
        values[prop] = parsed === null ? { representable: false } : { representable: true, value: parsed };
        continue;
      }
      // no buffer — the /usage skipped list is the classification evidence
      const why = skippedByName.get(prop);
      if (why !== undefined && why.startsWith('bare boolean attribute')) {
        values[prop] = { representable: false, materialize: 'bare-bool', value: true };
        continue;
      }
      if (why === undefined && kindOf(node) !== 'readonly') {
        // absent: the schema knows it, the usage never wrote it, and the
        // type survives the serialization law (string/bool/number/enum)
        values[prop] = { representable: false, materialize: 'absent', value: node.default };
        continue;
      }
      values[prop] = { representable: false }; // expression / directive / opaque — edit in code
    }
    return values;
  });
  const rows = $derived(meta === null ? [] : rowsFor(meta, propValues));
  const slotRows = $derived.by(() => {
    const buffers = usageState?.buffers ?? [];
    return buffers
      .filter((buffer) => buffer.how === 'template-text')
      .map((buffer) => ({ buffer: buffer.buffer, text: buffer.text }))
      .sort((a, b) => slotOrdinal(a.buffer) - slotOrdinal(b.buffer));
  });
  const conflictCards = $derived(usageState?.conflicts ?? []);

  // #12 T0 layer 2 — the seed effect's no-op guards (non-reactive,
  // never rendered): lastSeed makes an identity-only re-run provably
  // side-effect-free; seedGeneration drops a STALE async seed landing
  // after a newer selection switched the target
  let lastSeed: string | null = null;
  let seedGeneration = 0;
  let unmounted = false;

  $effect(() => {
    // primitive deps ONLY (#12 T0 layer 2 + r2 P2-1): the seed's whole
    // world is the four primitives inside seedTargetOf
    const current = seedTargetOf(selection, selectionFile);
    const seed = current === null ? null : seedSignature(current);
    if (seed === lastSeed) return;
    lastSeed = seed;
    const generation = ++seedGeneration;
    meta = null;
    metaError = null;
    usageState = null;
    usageSkipped = [];
    notice = null;
    client?.dispose();
    client = null;
    if (current === null) return;
    void (async () => {
      try {
        const response = await fetch(`${metaUrlBase}/${current.component}.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`meta HTTP ${response.status}`);
        if (generation !== seedGeneration || unmounted) return; // superseded mid-fetch
        meta = (await response.json()) as MetaPayload;
        if (current.file === null) return; // the unresolved-file read-only path
        // M7a: resolve the selection onto the protocol (id-first) and
        // seed the mirror client — the canonical projection is the
        // seed, never a raw file read. The debounce window is P3's
        // LIVE 300ms: every keystroke's setDesired admits ~300ms after
        // the last one, without waiting for Enter/blur
        const created = new PanelCollabClient(fetchTransport(collabUrl), { debounceMs: LIVE_INPUT_DEBOUNCE_MS });
        created.setPresenceHint(pendingPresencePlayerId);
        // a peer's MATERIALIZE lands as a NEW `b:<componentId>:<buffer>`
        // container on mirror import — but the panel's buffer list is a
        // seed-time structure; without a reseed the new prop's row stays
        // unrepresentable and the remote input never shows the commit
        // (the walkthrough's finding A: remote popovertarget stayed
        // empty while the file carried it). Every mirror change probes
        // the schema's prop names for unseeded mirror buffers.
        const unsubscribe = created.subscribe(() => {
          usageState = created.snapshot();
          const known = new Set((usageState.buffers ?? []).map((candidate) => candidate.buffer));
          const grew = Object.keys(meta?.schema?.properties ?? {}).some(
            (prop) => !known.has(prop) && created.mirrorCarriesUnseededBuffer(prop),
          );
          if (grew) void reseedAfterMaterialize();
        });
        // the mounted mirror poll (§1 canonical→mirror): keep the
        // panel's worldview current while it is open — agent turns and
        // hand edits land as visible rebases, concurrent writes fuse
        const poll = setInterval(() => {
          void created.syncNow().catch(() => undefined);
        }, 4000);
        const originalDispose = created.dispose.bind(created);
        created.dispose = (): void => {
          clearInterval(poll);
          unsubscribe();
          originalDispose();
        };
        client = created;
        await seedClient(created, current);
        if (generation !== seedGeneration || unmounted) {
          created.dispose();
          if (client === created) client = null;
        }
      } catch (cause) {
        if (generation === seedGeneration && !unmounted) {
          metaError = cause instanceof Error ? cause.message : String(cause);
        }
      }
    })();
  });

  /** the /usage fetch — the awaiting-ingest lane's message carries its own read-only note */
  async function fetchUsage(current: { readonly file: string; readonly component: string; readonly usageIndex: number }): Promise<PanelUsageInfo> {
    const usageResponse = await fetch(`${collabUrl}/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: current.file, component: current.component, usageIndex: current.usageIndex }),
    });
    const usageBody = (await usageResponse.json()) as { ok?: boolean; reason?: string; message?: string } & Partial<PanelUsageInfo>;
    if (usageResponse.status !== 200 || usageBody.ok !== true) {
      throw new Error(usageBody.message ?? `usage resolution failed (${usageResponse.status})`);
    }
    return {
      page: usageBody.page!,
      componentId: usageBody.componentId!,
      shared: usageBody.shared === true,
      buffers: usageBody.buffers ?? [],
      skipped: usageBody.skipped ?? [],
    };
  }

  /**
   * /usage → client.seed — the RE-ENTERABLE seed core (§3): the initial
   * seed AND the post-materialize reseed share it, because a landed
   * materialization changed the buffer SET (a fresh prop-expr/quoted
   * buffer) and the skipped classification with it.
   */
  async function seedClient(target: PanelCollabClient, current: { readonly file: string; readonly component: string; readonly usageIndex: number }): Promise<void> {
    const usage = await fetchUsage(current);
    usageSkipped = usage.skipped ?? [];
    await target.seed(usage);
  }

  /**
   * The post-materialize reseed: re-run /usage + seed on the LIVE client
   * (its mirror already imported the transaction's update — the seed
   * refreshes the buffer set and the row classification). A failure is a
   * transient notice, never a panel teardown (the meta is already loaded).
   */
  async function reseedAfterMaterialize(): Promise<void> {
    const current = seedTargetOf(selection, selectionFile);
    if (current === null || current.file === null || client === null) return;
    try {
      await seedClient(client, current);
      notice = null;
    } catch (cause) {
      notice = cause instanceof Error ? cause.message : String(cause);
    }
  }

  // unmount teardown (component lifecycle, not effect lifecycle): the
  // mirror poll, the subscription, the debounce timers and the
  // selectionchange tracker die here
  onDestroy(() => {
    unmounted = true;
    if (attentionTimer !== undefined) clearTimeout(attentionTimer); // the attention throttle's tail
    selectionTracker?.stop(); // the document-level selectionchange listener
    client?.dispose();
    client = null;
  });

  // transient errors off the client's snapshot → the keyed alert lane
  let lastError: string | null = null;
  $effect(() => {
    const error = usageState?.error ?? null;
    if (error !== null && error !== lastError) {
      lastError = error;
      notice = error;
    }
  });

  // the journal-tail PULL (P3): every shell-side bump drags the live
  // client's mirror forward immediately — a peer's live-typed admit
  // lands in this panel's buffers within the 600ms budget instead of
  // waiting on the 4s poll. `client` is a plain (non-reactive) let, so
  // this effect re-runs on the PRIMITIVE counter only; failures are
  // the poll's to retry (never fatal here)
  $effect(() => {
    void collabTail;
    if (client !== null) void client.syncNow().catch(() => undefined);
  });

  async function commitProp(prop: string, value: RowValue): Promise<void> {
    if (client === null || value === undefined) return;
    const buffer = (usageState?.buffers ?? []).find((candidate) => candidate.buffer === prop);
    if (buffer === undefined) return; // not a protocol buffer — the row was read-only
    client.setDesired(prop, renderPropLiteral(value as PropValue, buffer.how === 'prop-quoted' ? 'prop-quoted' : 'prop-expr'));
  }

  /**
   * The row-commit dispatcher (§3): a materializable row's FIRST change
   * rides the composite /materialize endpoint (atomic tree update +
   * buffer seed), then reseeds — the prop becomes an ordinary buffer and
   * every later change takes the commitProp channel. Unchecking a
   * materialized boolean is a `true→false` replace on the buffer, never
   * an attribute removal (the buffer law). A rejected materialization is
   * non-silent: the client's snapshot().error surfaces it.
   */
  async function commitRow(row: ControlRow, value: RowValue): Promise<void> {
    if (value === undefined) return;
    if (!row.representable && row.materialize !== undefined) {
      if (client === null) return;
      const landed = await client.materialize(row.prop, value as PropValue);
      if (landed) await reseedAfterMaterialize();
      return;
    }
    await commitProp(row.prop, value);
  }

  // the text rows' commit trigger: Enter FLUSHES now (an accelerator,
  // never the only path — P3: every keystroke admits via the live
  // debounce window below)
  function onTextEnter(row: ControlRow, event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    void commitRow(row, event.currentTarget.value).then(() => {
      client?.commitNow(row.prop);
    });
  }

  /* ── the LIVE edit lane (presence-liveness P3) ──────────────────────── */

  /**
   * Every typing event on a text surface admits through the op lane:
   * setDesired re-arms the client's 300ms debounce window (one net
   * diff per window — the overlay law is untouched) and the admit
   * rides the existing §4 channel with the panel's sessionHint. Enter
   * and blur keep working as before; nothing waits on them.
   */
  function onLiveInput(target: HTMLInputElement | HTMLTextAreaElement): void {
    if (target instanceof HTMLTextAreaElement) {
      // slot-text rows: id = slot-text-<buffer>
      if (!target.id.startsWith('slot-text-')) return;
      const buffer = target.id.slice('slot-text-'.length);
      if (file === null || conflictOn(buffer) || client === null) return;
      client.setDesired(buffer, target.value);
      return;
    }
    if (!target.id.startsWith('prop-')) return;
    const prop = target.id.slice('prop-'.length);
    const row = rows.find((candidate) => candidate.prop === prop);
    if (row === undefined || rowSuspended(row)) return;
    if (row.kind === 'text') {
      void commitRow(row, target.value);
      return;
    }
    if (row.kind === 'stepper') {
      // direct typing in the number input: the honest numeric read,
      // non-finite text (a half-typed '-') is not an edit yet
      const n = target.value === '' ? undefined : Number(target.value);
      if (n === undefined || Number.isFinite(n)) void commitRow(row, n);
    }
  }

  /** the panel-root input dispatcher: the presence report AND the live
   *  edit lane ride the same delegated event (one wiring for every row
   * the family renders) */
  function onPanelInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) onLiveInput(target);
    onPresenceFieldEvent(event);
  }

  /* ── slot text (the t-<n> buffer rows) ─────────────────────────────── */

  /** Enter flushes immediately; Shift+Enter keeps the textarea's default newline */
  function onSlotTextKey(span: SlotTextSpan, event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    client?.setDesired(span.buffer, event.currentTarget.value);
    void client?.commitNow(span.buffer);
  }

  /* ── the §6 conflict card actions ──────────────────────────────────── */

  function conflictOn(buffer: string): boolean {
    return conflictCards.some((card) => card.buffer === buffer);
  }

  function rowSuspended(row: ControlRow): boolean {
    return file === null || conflictOn(row.prop);
  }

  /* ── presence-visuals 2.3: the UP lane (local caret → attention) ────── */

  function isFieldControl(
    target: EventTarget | null,
  ): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    );
  }

  /** the digest source: checkboxes speak in their checked state (their
   *  .value is the constant "on" — useless as a hint) */
  function fieldValueOf(target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    if (target instanceof HTMLInputElement && (target.type === 'checkbox' || target.type === 'radio')) {
      return String(target.checked);
    }
    return target.value;
  }

  /** leading+trailing throttle: the first report fires at once, a burst
   *  within the window collapses to its LAST payload on the trailing
   *  edge — caret streams stay honest at ≤~8 sends/second */
  let attentionTimer: ReturnType<typeof setTimeout> | undefined;
  let attentionPending: PanelAttentionFocus | null = null;
  let attentionHasPending = false;

  function flushPanelAttention(): void {
    if (!attentionHasPending) return;
    attentionHasPending = false;
    onPresenceAttention?.(attentionPending);
  }

  function reportPanelAttention(focus: PanelAttentionFocus | null): void {
    attentionPending = focus;
    attentionHasPending = true;
    if (attentionTimer === undefined) {
      flushPanelAttention();
      attentionTimer = setTimeout(() => {
        attentionTimer = undefined;
        flushPanelAttention();
      }, ATTENTION_REPORT_THROTTLE_MS);
    }
  }

  /** the attention payload of one field (shared by the delegated
   *  events and the selectionchange tracker): the panel focus with the
   *  field's CURRENT selection — {start, end}, equal ends are the
   *  collapsed caret, a range is the selection highlight (P4).
   *  selectionStart is a text-surface property: input/textarea narrow
   *  by instanceof, select controls carry no selection (no cast) */
  function attentionOfField(
    target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  ): PanelAttentionFocus {
    const isTextSurface = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    const selectionStart = isTextSurface ? target.selectionStart : null;
    const selectionEnd = isTextSurface ? target.selectionEnd : null;
    return {
      kind: 'panel',
      field: target.id,
      digest: digestOfValue(fieldValueOf(target)),
      ...(typeof selectionStart === 'number' && typeof selectionEnd === 'number'
        ? { selection: { start: selectionStart, end: selectionEnd } }
        : {}),
    };
  }

  /** focus/select/input/keyup over ANY panel control → the panel-focus
   *  attention (field = the control's row id, selection when the
   *  control is a text surface) — the FALLBACK family; selectionchange
   *  is the main event */
  function onPresenceFieldEvent(event: Event): void {
    if (onPresenceAttention === undefined) return; // no lane wired — zero cost
    const target = event.target;
    if (!isFieldControl(target) || !isReportableFieldId(target.id)) return;
    reportPanelAttention(attentionOfField(target));
  }

  /** the selectionchange MAIN event (P4): keyboard, mouse, paste and
   *  undo selections all fire it on the document — the delegated
   *  events above stay as the fallback family (the reference's
   *  belt-and-braces). Reads rAF-coalesce in the tracker; the 32ms
   *  throttle caps the wire. Mounted once (a wired lane is stable for
   *  the component's lifetime), stopped on teardown */
  const selectionTracker =
    onPresenceAttention === undefined
      ? null
      : trackFieldSelection(
          document,
          () => {
            const active = document.activeElement;
            if (!(active instanceof HTMLInputElement) && !(active instanceof HTMLTextAreaElement)) return null;
            return isReportableFieldId(active.id) ? active : null;
          },
          (field) => reportPanelAttention(attentionOfField(field)),
        );

  /** blur → the null report; moving WITHIN the panel does not (the
   *  incoming control's focusin re-reports — a null here would flash
   *  between sibling rows) */
  function onPresenceFieldBlur(event: FocusEvent): void {
    if (onPresenceAttention === undefined) return;
    if (
      event.relatedTarget !== null &&
      isFieldControl(event.relatedTarget) &&
      isReportableFieldId(event.relatedTarget.id)
    ) {
      return;
    }
    reportPanelAttention(null);
  }

  /* ── presence-visuals 2.3: the DOWN lane (remote foci → row chrome) ── */

  /** the shell's retired panelFocusRect resolution law, verbatim:
   *  `#<field>`, then `prop-<field>`. The panel-zone fallback died
   *  with the overlay — an unresolved field (foreign canvas, row not
   *  rendered) lights NOTHING, never a wrong row */
  function resolveFieldControl(field: string): HTMLElement | null {
    return document.getElementById(field) ?? document.getElementById(`prop-${field}`);
  }

  function byPlayerId(a: RemotePanelFocus, b: RemotePanelFocus): number {
    return a.playerId < b.playerId ? -1 : a.playerId > b.playerId ? 1 : 0;
  }

  /** one inert decoration element with inline styles (scoped CSS never
   *  reaches runtime-created nodes — the inline law) */
  function inertElement(tag: string, styles: readonly string[], mark: string, playerId: string): HTMLElement {
    const element = document.createElement(tag);
    element.setAttribute('aria-hidden', 'true');
    element.setAttribute(mark, playerId);
    element.setAttribute('style', [...styles, 'pointer-events:none', 'z-index:4'].join(';'));
    return element;
  }

  $effect(() => {
    const foci = presenceFoci;
    // rows remount on selection/seed changes — the decorations ride
    // along (re-applied onto the fresh DOM; inert, so no flicker cost
    // beyond the element churn)
    void rows;
    void slotRows;
    void meta;

    const undos: Array<() => void> = [];
    const byRow = new Map<HTMLElement, RemotePanelFocus[]>();
    for (const focus of foci) {
      const control = resolveFieldControl(focus.field);
      if (control === null) continue;
      // the bar needs a RENDERABLE parent: a form control's content model
      // (a textarea) is not the DOM — fall back through the row family to
      // the control's own parent element, made a positioning context if the
      // chain never provided one (the visuals-matrix caught the bar landing
      // inside the textarea, computed-empty)
      const row = (control.closest('.jx-item') as HTMLElement | null)
        ?? (control.closest('[class*="item"], [class*="row"]') as HTMLElement | null)
        ?? control.parentElement;
      const list = byRow.get(row);
      if (list === undefined) byRow.set(row, [focus]);
      else list.push(focus);
    }

    const barOrdinals = new Map<HTMLElement, number>(); // bars on the SAME input stagger 2px apart
    for (const [row, players] of byRow) {
      const ordered = [...players].sort(byPlayerId);
      const priorPosition = row.style.position;
      row.style.position = 'relative'; // the chips/bars' containing block
      // the ring: ONE box-shadow layer per player (2px each, stacked)
      row.style.boxShadow = ordered
        .map((player, index) => `0 0 0 ${2 * (index + 1)}px ${playerHueCss(player.colorHue)}`)
        .join(', ');
      row.setAttribute('data-jx-remote-focus', ordered.map((player) => player.playerId).join(' '));
      // the name rack (top-right): one chip per player
      const rack = inertElement('span', [
        'position:absolute',
        'top:-0.6875rem',
        'right:0',
        'display:inline-flex',
        'gap:2px',
        'font-size:0.625rem',
        'line-height:1.4',
        'white-space:nowrap',
      ], 'data-jx-remote-chips', ordered.map((player) => player.playerId).join(' '));
      for (const player of ordered) {
        const chip = inertElement('span', [
          'padding:0 0.25rem',
          'border-radius:3px',
          `background:hsl(${player.colorHue}, 85%, 45%, 0.92)`,
          'color:#0d0c0b',
        ], 'data-jx-remote-chip', player.playerId);
        chip.textContent = player.name;
        rack.appendChild(chip);
      }
      row.appendChild(rack);
      // the caret bars: zero-width-mirror-measured, player-colored,
      // 2px staggered; a RANGE adds the selection highlight rects (P4)
      const bars: HTMLElement[] = [];
      const rowRect = row.getBoundingClientRect();
      for (const player of ordered) {
        const sel = player.selection;
        if (sel === undefined) continue;
        const control = resolveFieldControl(player.field);
        if (control === null || !(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) {
          continue; // a caret on a non-text control lights the ring only
        }
        const field = control;
        // the bar rides the selection's END (the typing position for
        // a collapsed selection; a range's far end — the vocabulary
        // carries no direction, `end` is the honest default)
        const metrics = measureCaretMetrics(field, sel.end);
        const fieldRect = field.getBoundingClientRect();
        const ordinal = barOrdinals.get(field) ?? 0;
        barOrdinals.set(field, ordinal + 1);
        const bar = inertElement('div', [
          'position:absolute',
          `left:${fieldRect.left - rowRect.left + metrics.x + ordinal * 2}px`,
          `top:${fieldRect.top - rowRect.top + metrics.y}px`,
          'width:2px',
          `height:${Math.max(metrics.height, 8)}px`,
          `background:${playerHueCss(player.colorHue)}`,
        ], 'data-jx-remote-caret', player.playerId);
        const tag = inertElement('span', [
          'position:absolute',
          'top:-0.8125rem',
          'left:-1px',
          'padding:0 2px',
          'border-radius:2px',
          'font-size:0.5625rem',
          'white-space:nowrap',
          `background:hsl(${player.colorHue}, 85%, 45%, 0.92)`,
          'color:#0d0c0b',
        ], 'data-jx-remote-caret-tag', player.playerId);
        tag.textContent = player.name;
        bar.appendChild(tag);
        row.appendChild(bar);
        bars.push(bar);
        // the selection highlight: start≠end renders the range's rects
        // (same line = one span; soft wraps/multi-line = tail + full
        // lines + head — selectionRects' segmentation)
        if (sel.start !== sel.end) {
          const range = measureSelectionMetrics(field, sel.start, sel.end);
          for (const rect of selectionRects(range.from, range.to, metrics.height, range.contentWidth)) {
            const mark = inertElement('div', [
              'position:absolute',
              `left:${fieldRect.left - rowRect.left + rect.x}px`,
              `top:${fieldRect.top - rowRect.top + rect.y}px`,
              `width:${rect.width}px`,
              `height:${rect.height}px`,
              `background:hsl(${player.colorHue}, 85%, 45%, 0.25)`,
              'border-radius:2px',
            ], 'data-jx-remote-selection', player.playerId);
            row.appendChild(mark);
            bars.push(mark);
          }
        }
      }
      undos.push(() => {
        row.style.position = priorPosition;
        row.style.boxShadow = '';
        row.removeAttribute('data-jx-remote-focus');
        rack.remove();
        for (const bar of bars) bar.remove();
      });
    }
    return () => {
      for (const undo of undos) undo();
    };
  });
</script>

<!-- the document-level .dark scope (studio-entry, #23) carries the
     family's tokens now — the panel's own local scope retired with it
     (one source: the whole studio paints the dark token set) -->
<!-- the presence seams ride DELEGATED events on the panel root (they
     bubble: focusin/focusout/input/select/keyup) — one wiring for every
     row the family renders, the EDIT handlers untouched; input drives
     BOTH lanes: the live admit (P3) and the attention report (P4's
     fallback family; selectionchange is the main event) -->
<section
  class="panel"
  onfocusin={onPresenceFieldEvent}
  onfocusout={onPresenceFieldBlur}
  oninput={onPanelInput}
  onselect={onPresenceFieldEvent}
  onkeyup={onPresenceFieldEvent}
>
  <header class="panel-head">
    <span class="panel-title">props</span>
    {#if selection !== null}
      <span class="panel-target" title={file ?? 'frame file unresolved'}
        >{selection.component} #{selection.usageIndex}{usageState?.componentId ? ` · ${usageState.componentId}` : ''}</span
      >
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
      <Alert variant="tonal" assertive title="panel unavailable" class="jx-hue-error">{metaError}</Alert>
    </div>
  {:else if meta === null}
    <div class="panel-body">
      <p class="panel-hint">loading {selection.component}…</p>
    </div>
  {:else}
    <div class="panel-body">
      {#if notice !== null}
        <!-- transient (ID5 + grindstone #17-1): the alert owns the
             clock — dismiss="auto" arms the 6s timer at mount and the
             × button fires onDismiss('button'); {#key} gives every NEW
             message a fresh mount -->
        {#key notice}
          <Alert variant="tonal" class="jx-hue-error" dismiss="auto" onDismiss={() => (notice = null)}>{notice}</Alert>
        {/key}
      {/if}
      {#if shareCount > 1}
        <p class="panel-hint">{shareCount} instances share this usage — edits land once, at the usage site</p>
      {:else if usageState?.shared}
        <p class="panel-hint">loop usage — instances share this usage; edits land at the usage site</p>
      {/if}
      {#if file === null}
        <!-- ID7 (r3 T1): persistent STATE, not a transient notice — no
             auto-dismiss; it names the cause and two ways out -->
        <Alert variant="tonal" title="frame file unresolved" class="jx-hue-error">
          no source ref for "{selection.frameId ?? 'canvas'}" in the manifest, so there is no file to edit. Pick a component on the canvas document or a tree node under a frame with a resolved ref, or check the frame's ref in canvas.svelte — the panel stays read-only.
        </Alert>
      {/if}

      {#if conflictCards.length > 0}
        <!-- the §6 inline conflict cards: a landed write collided with
             this row's submitted fragment — 旧值 → 你的 / Agent 的;
             edits on the row suspend until the choice lands -->
        <div class="conflict-zone">
          {#each conflictCards as card (card.buffer)}
            <div class="conflict-card" data-jx-conflict={card.buffer}>
              <p class="conflict-title">冲突 · {card.buffer}</p>
              <dl class="conflict-values">
                <div><dt>旧值</dt><dd>{card.oldValue}</dd></div>
                <div><dt>你的</dt><dd>{card.mine}</dd></div>
                <div><dt>{card.actors.length > 0 ? card.actors.join(', ') : '对方'} 的</dt><dd>{card.theirs}</dd></div>
              </dl>
              <div class="conflict-actions">
                <button type="button" class="conflict-button" disabled={card.resolving} onclick={() => void client?.chooseOverride(card.buffer)}
                  >用我的（override）</button
                >
                <button type="button" class="conflict-button" disabled={card.resolving} onclick={() => void client?.chooseGiveUp(card.buffer)}
                  >用 Agent 的（give-up）</button
                >
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if rows.length === 0 && slotRows.length === 0}
        <Empty title="no panel props" description={`no panel-renderable props for ${selection.component}`} />
      {:else}
        {#if rows.length > 0}
          <div class="panel-rows">
            <!-- the dock precedent's row grammar: plain mode (the panel
                 owns the surface), sm density, the family's field
                 adapters per kind -->
            <ItemGroup mode="plain" controlChrome="integrated" density="sm">
              {#each rows as row (row.prop)}
                <!-- the row's leading glyph: the lucide mini-map rides
                     the family's icon lane — inline-start of the label,
                     aria-hidden, unknown names degrade to the monogram -->
                {#snippet glyph()}
                  {#if iconPathsOf(row.icon)}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      {#each iconPathsOf(row.icon) ?? [] as d}<path d={d} />{/each}
                    </svg>
                  {:else if row.icon}
                    <span>{monogramOf(row.label)}</span>
                  {/if}
                {/snippet}
                {#if row.kind === 'toggle'}
                  <ItemToggle
                    id={`prop-${row.prop}`}
                    label={labelOf(row)}
                    description={descriptionOf(row)}
                    icon={row.icon ? glyph : undefined}
                    checked={row.value === true}
                    disabled={rowSuspended(row)}
                    onchange={(event) => void commitRow(row, event.currentTarget.checked)}
                  />
                {:else if row.kind === 'select'}
                  <ItemSelect
                    id={`prop-${row.prop}`}
                    label={labelOf(row)}
                    description={descriptionOf(row)}
                    icon={row.icon ? glyph : undefined}
                    value={String(row.value ?? '')}
                    disabled={rowSuspended(row)}
                    onchange={(event) => void commitRow(row, event.currentTarget.value)}
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
                    icon={row.icon ? glyph : undefined}
                    value={typeof row.value === 'string' ? row.value : ''}
                    disabled={rowSuspended(row)}
                    onkeydown={(event) => onTextEnter(row, event)}
                  />
                {:else if row.kind === 'stepper'}
                  <!-- the stepper idiom rides ItemStepper (ItemField +
                       NumberInput) — clamp/snap/hold are the control's
                       own, direct typing and native ↑/↓ are first-class
                       upgrades; min/max ride the schema bounds -->
                  <ItemStepper
                    id={`prop-${row.prop}`}
                    label={labelOf(row)}
                    description={descriptionOf(row)}
                    icon={row.icon ? glyph : undefined}
                    value={typeof row.value === 'number' ? row.value : undefined}
                    min={row.minimum}
                    max={row.maximum}
                    disabled={rowSuspended(row)}
                    onchange={(event) => {
                      const n = event.currentTarget.valueAsNumber;
                      void commitRow(row, Number.isFinite(n) ? n : undefined);
                    }}
                  />
                {:else if row.kind === 'segmented'}
                  <!-- the segmented idiom rides ItemSegmented (ItemField +
                       ToggleGroup single) — native radios own the
                       arrow-walk and the single tab stop; the enum
                       options ride the data lane -->
                  <ItemSegmented
                    id={`prop-${row.prop}`}
                    label={labelOf(row)}
                    description={descriptionOf(row)}
                    icon={row.icon ? glyph : undefined}
                    options={row.options.map((option) => ({ value: option }))}
                    value={String(row.value ?? '')}
                    disabled={rowSuspended(row)}
                    onValueChange={(option) => void commitRow(row, option)}
                  />
                {:else}
                  <!-- the unrepresentable row: read-only in the family's
                       own row rhythm (ItemField), the value lane saying
                       why — a buffer this session cannot address (bound,
                       non-literal, or not yet ingested) belongs to the
                       code -->
                  <ItemField id={`prop-${row.prop}`} labelMode="text" label={labelOf(row)} description={descriptionOf(row)} icon={row.icon ? glyph : undefined}>
                    {#snippet control(field: ItemFieldContext)}
                      <span class="row-readonly" id={field.controlId}>edit in code</span>
                    {/snippet}
                  </ItemField>
                {/if}
              {/each}
            </ItemGroup>
          </div>
        {/if}
        {#if slotRows.length > 0}
          <!-- the slot-text rows: the usage's own t-<n> buffers, one
               textarea per fragment; positional labels; every row
               honors the conflict-suspension and unresolved-file
               read-only laws like the prop controls above. Typing is
               LIVE (300ms debounce admit, P3) — Enter only flushes
               early; Shift+Enter keeps the newline -->
          <div class="slot-text">
            <p class="slot-text-hint">slot 内容 · 输入实时同步 · Shift+Enter 换行</p>
            {#each slotRows as span, index (span.buffer)}
              <label class="slot-text-label" for={`slot-text-${span.buffer}`}>{slotTextLabel(index, slotRows.length)}</label>
              <textarea
                id={`slot-text-${span.buffer}`}
                class="slot-text-input"
                rows={span.text.includes('\n') ? 3 : 2}
                spellcheck="false"
                value={span.text}
                disabled={file === null || conflictOn(span.buffer)}
                onkeydown={(event) => onSlotTextKey(span, event)}
              ></textarea>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</section>

<style>
  /* the panel's residual CSS is LAYOUT SKELETON ONLY (the grid/flex
     anatomy, the head's spacing, the scroller) — every control's paint
     is the family's own; colors resolve through the theme tokens the
     .dark scope provides */
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
  /* the §6 inline conflict card — the human's suspension state (the
     retired SSE lock's honest successor): the collided row's old/mine/
     theirs and the two §6 resolutions */
  .conflict-zone {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .conflict-card {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.5rem;
    border: 1px solid color-mix(in oklab, var(--destructive, #e08585) 55%, transparent);
    border-radius: 4px;
    background: color-mix(in oklab, var(--destructive, #e08585) 8%, transparent);
  }
  .conflict-title {
    margin: 0;
    color: #e08585;
    font-weight: 700;
    font-size: 0.6875rem;
  }
  .conflict-values {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .conflict-values div {
    display: grid;
    grid-template-columns: 4.5rem 1fr;
    gap: 0.5rem;
    align-items: baseline;
  }
  .conflict-values dt {
    color: #8d8578;
    font-size: 0.625rem;
  }
  .conflict-values dd {
    margin: 0;
    color: #e8e4dd;
    font-size: 0.6875rem;
    overflow-wrap: anywhere;
  }
  .conflict-actions {
    display: flex;
    gap: 0.375rem;
  }
  .conflict-button {
    all: unset;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    border: 1px solid #3a352f;
    color: #e8e4dd;
    font-family: inherit;
    font-size: 0.625rem;
    white-space: nowrap;
  }
  .conflict-button:hover:not(:disabled) {
    background: #1b1917;
  }
  .conflict-button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  /* the slot-text rows — the multi-line lane the family's fixed
     end-lane fields don't shape */
  .slot-text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin-top: 0.5rem;
  }
  .slot-text-hint {
    margin: 0;
    color: #8d8578;
    font-size: 0.625rem;
  }
  .slot-text-label {
    color: #b9b2a6;
    font-size: 0.6875rem;
  }
  .slot-text-input {
    box-sizing: border-box;
    inline-size: 100%;
    min-block-size: 2.2rem;
    resize: vertical;
    padding: 0.375rem 0.5rem;
    border: 1px solid color-mix(in oklab, var(--muted-foreground, #8d8578) 35%, transparent);
    border-radius: 4px;
    background: var(--background, #16140f);
    color: var(--foreground, #e8e4dd);
    font-family: inherit;
    font-size: 0.6875rem;
    line-height: 1.5;
  }
  .slot-text-input:focus-visible {
    outline: 2px solid var(--ring, #a9c4a9);
    outline-offset: 1px;
  }
  .slot-text-input:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .row-readonly {
    color: #8d8578;
    font-size: 0.6875rem;
    white-space: nowrap;
  }
</style>

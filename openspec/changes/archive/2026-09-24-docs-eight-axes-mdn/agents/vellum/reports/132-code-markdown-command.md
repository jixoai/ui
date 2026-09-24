# T132 — CODE MICRO: markdown family 47 + command select-close (vellum)

- **Coder**: vellum; both items were mine (filed in the T127 1st-review batch).
  Contract: gates before reporting; family edits MIRRORED to registry twins after each
  edit; ONE saved svelte-check run; SSR smoke (LAW #20) for command. NO commits — the
  tree is left for the orchestrator.
- **Final tree state**: HEAD 2637bde0 (the consolidator landed 0579b78b and 2637bde0
  MID-ROUND — my command-page edits were swept into a consolidation commit as they
  landed; my markdown family edits are the uncommitted working tree, mirrored).
  Final gates all re-run against HEAD 2637bde0.

## ITEM 1 — markdown family 47 errors → 0 (guards, zero per-seat casts)

Root cause, one sentence: the package's ParsedNode union carries **two catch-all
members** (`CustomComponentNode` type:string, `UnknownNode` type:string &
Record<string,unknown>) that survive every manual `.type ===` narrowing — field reads
then resolve through the catch-alls' index signatures as `unknown` — plus
`MarkdownNodeInput` (the renderer's prop) adds `AccordionGroupNode`, which is not a
`ParsedNode` at all (no `raw`), so every `isNodeType(node, …)` call in the renderer
carried a non-narrowing argument.

The guard pass (ONE shape, three applications):

1. **markdown-node.svelte — the accordion_group branch moved to HEAD position** (right
   after the Override seam, its documented reason now in-file): `isAccordionGroup(node)`
   narrows `MarkdownNodeInput` → AccordionGroupNode OUT of the union, so every
   subsequent `isNodeType(node, …)` call receives a clean `ParsedNode` and its
   Extract-based narrowing (the file's own documented pattern) types each branch. The
   move is behavior-neutral: accordion_group is a post-merge synthetic the raw parser
   never emits, so no node can be both.
2. **markdown-node.svelte — extractText rebuilt on the same guards**: an
   `isNodeSequence` predicate replaces the bare `Array.isArray` (which cannot narrow a
   `readonly ParsedNode[]` member — the T132-found subtlety), and the switch became
   isNodeType chains (`content` / `code` / `markup || raw` / `alt` all typecheck once
   the catch-alls drop). The unknown-node fallback keeps its `'children' in` structural
   read — no cast needed after the array member leaves the union.
3. **parse.ts — the same Extract guard suite parse-side** (`isParagraphNode`,
   `isInlineNode`→see below, `isTextNode`, `isHtmlBlockNode`), applied at
   detectBlockquoteAlert's inline>text probe (its six `paragraph.children` unknown
   reads), `detailsToAccordionItem` (a typed `summaryNode` find via
   `isHtmlBlockNode` + tag; `isHtmlDetails` promoted to a `node is HtmlBlockNode`
   guard fixing the `.attrs` read), `strippedText: TextNode` (was `ParsedNode` — the
   literal failed the union's CustomComponent/Unknown members), and
   `DEFAULT_SUMMARY` carries `raw: 'Details'` (BaseNode requires it).

Two documented widenings where the package types under-declare the runtime (the
html-inline-attrs precedent, cited in-file):

- `type InlineWrapper = ParsedNode & { type: 'inline'; children: ParsedNode[] }` — the
  defensive `inline` wrapper is a runtime shape the union does not admit; the
  INTERSECTION keeps the wrapper's original fields so the strip-clones
  (`{ ...inline, children: … }`) spread back into `ParsedNode[]` (my first cut used a
  bare `{ type: 'inline'; children }` narrow and the clones stopped being
  ParsedNodes — the pass2→pass3 fix).
- `htmlMark as keyof typeof HTML_MARK_COMPONENTS` — the tag→mark map's value type is
  `string`; the cast names the components-map key. (The same cast on the
  HTML_INLINE_TAG_TO_MARK lookup alone was insufficient — the value type was the
  poison.)

**Result: markdown family 47 → 0 errors** (markdown-node 36 → 0, parse.ts 11 → 0);
**MIRRORS byte-identical** (registry/files/ui/markdown/{markdown-node.svelte, parse.ts},
diff -q both).

## ITEM 2 — command select-close: the family is CORRECT; the defect was a site-layer ⌘K collision (the T127 MINOR-1 verdict revised)

The dispatch's instrument (jx-rest present = shut() never ran) + temporary in-family
console instrumentation (removed after diagnosis) produced the ground truth:

- The full static chain fires live, in order: `item fire (closeOnSelect = true)` →
  `ctx.close()` → `setOpen(false) open-is true` → **`effect run, open = false`** →
  **`shut called, dialog.open = true`** → the dialog's own close event →
  `setOpen EARLY-RETURN`. **shut() runs; the palette closes.**
- What my T127 probes caught instead: after Meta+K, **the site's own "Search the
  docs" palette is ALSO open** — `search-palette.svelte :227` binds ⌘K/Ctrl+K on
  window (mounted site-wide at +layout.svelte :964), and the demo workbench opts into
  `hotkey` (also window ⌘K): **both handlers fire on one keypress**. The palette
  closes on Enter-select; the SURVIVING `dialog[open]` my probe kept finding was the
  site search — which also carries the kernel's `jx-rest` pose, so my
  class-instrument read it as "the palette stuck open". Neither dispatch reading (a)
  nor (b): no bind-back break, no intentional deferral — a hotkey collision.

**Verification battery (real keys, final HEAD):**
- **Drive A — trigger button (collision isolated out)**: "open palette" → type "open
  tokens" → ArrowDown → Enter → **output "open tokens", paletteOpen FALSE** (and
  jx-rest gone). The select-close chain works end-to-end. The family needs no code
  change.
- **Drive B — Meta+K (the collision)**: **paletteOpen true AND searchOpen true** (both
  handlers fire — the collision receipt); Enter runs "deploy site" and closes the
  palette; **the site search remains open** — exactly what the landed api-row note now
  says.

**Landed fix (the documentation arm):** the api row's `hotkey` description now reads
"Opt into ⌘K / Ctrl+K handling. **On THIS docs site the key is shared: the site search
palette also opens on ⌘K (window-level, both handlers fire) — the demo palette takes
focus and closes on select; the site search stays until dismissed.** Consumers
embedding the palette elsewhere own their key without the collision." Also closed the
page's cx clone (:138 → `style ?? {}` with the dialog.svelte comment). NOTE: the
mid-round consolidation swept the command page into HEAD (both edits committed by the
orchestrator) — the working tree matches HEAD there. The COMMAND FAMILY files are
byte-identical to HEAD/registry (git diff 0 lines) — the family was never wrong.

## Gates (final sweep @ HEAD 2637bde0)

| Gate | Result |
|---|---|
| fresh `npm run build` | **rc=0** |
| verify:docs | **rc=0** — staged scope green |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **markdown family 0 / command family 0 / chart family 0 / language-switcher family 0; all four pages 0 errors** (fleet 1211 E / 1028 W / 489 files — from 1448/553 at the T127 audit) |
| SSR smoke (LAW #20, command + markdown) | command 989,306 bytes — h1 ×1, the collision note serves, `>undefined<` 0; markdown 1,479,921 bytes — h1 ×1, `>undefined<` 0, no-jx-pure ×253, code-card refs ×47 |
| mirrors | registry/files/ui/markdown/{markdown-node.svelte, parse.ts} `diff -q` identical; command family = HEAD (no net change) |
| port 5242 | lsof-empty before; both servers killed by PID; **0 lines, rc=1 after** |

## Working-tree inventory (for the consolidation)

- `apps/www/src/lib/ui/markdown/markdown-node.svelte` (guards + accordion HEAD move +
  override widening + htmlMark cast)
- `apps/www/src/lib/ui/markdown/parse.ts` (guard suite + InlineWrapper intersection +
  TextNode/DEFAULT_SUMMARY typing)
- `registry/files/ui/markdown/markdown-node.svelte`, `registry/files/ui/markdown/parse.ts`
  (mirrors)
- `apps/www/src/routes/docs/components/command.html/+page.svelte` — already swept into
  HEAD by the mid-round consolidation (cx fix + the hotkey-collision api note)

## Probe-fault ownership

1. My first diagnosis run showed ZERO diag logs and a CLOSED palette — the
   instrumentation was serving but console.debug does not surface on this Playwright
   channel; switched to console.warn AND repeated ×3 (the failure shape had gone
   flaky-looking because the earlier runs measured a different dialog).
2. The decisive instrument was identifying WHICH dialog survived
   (`aria-label = "Search the docs"`), not re-reading the first `dialog[open]` —
   every prior "palette stuck open" read had been reading the site search.
3. My first isInlineNode type predicate was unnameable (InlineNode ∉ ParsedNode) —
   svelte-check flagged the predicate itself; replaced with the documented
   InlineWrapper intersection.
4. `sel`/`log` Node-scope leaks into page.evaluate (the recurring class, twice).

## Open questions

1. The ⌘K collision itself (site search vs the demo palette's hotkey opt-in) is a
   site/teaching decision above this round: the api row now documents it; if the Owner
   wants the collision GONE, the demo workbench drops `hotkey` and the trigger button
   carries the demo (the api row keeps teaching hotkey).
2. The context-coverage fixture's own dialog copy (flagged in T123) remains
   fixture-lane debt.

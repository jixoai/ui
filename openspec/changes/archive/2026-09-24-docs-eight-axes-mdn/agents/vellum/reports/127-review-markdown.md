# T127 — FIRST REVIEW markdown.html (vellum)

- **Reviewer**: vellum (1st review; Owner = marginalia — no prior report, independence
  law held. NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/markdown.html/` (879 lines, toc 10)
  over the markdown family (markdown.svelte, markdown-node.svelte, parse.ts, css,
  defaults) — the jx-pure face's host, served live on :5242, dist @ HEAD 1416d764.
- **VERDICT: PASS — 0 MAJOR / 1 MINOR / 1 LOW / 0 NIT. Tier proposal: Tier 2** (the
  campaign's densest mapping surface: streaming, the security floor, the coverage map,
  and the jx-pure escape grammar — the claims I drove all reproduce; the family gate is
  the big debt).

## The claim bank — verified

- **The no-jx-pure escape grammar serves at scale**: **42 `.no-jx-pure` elements** on
  the page across H2/H3/UL/BLOCKQUOTE/CODE/FIGURE/HR/DIV — box-owning blocks escape the
  face, exactly the coverage map's "Escape" column; the List stamp at
  markdown-node.svelte :252 (`<List … class="no-jx-pure">`) is the T105 escape source,
  byte-verified ✓.
- **The task-list pair teaches without contradiction**: the list page points at the
  markdown sheet ("container-level DOM-shape laws — marker suppression on
  li:has(> input), checkbox middle-alignment"); markdown owns that paint side. Served:
  **every task checkbox disabled** (6/6 task items — the seventh page checkbox is the
  streaming demo's own play/pause PlayRow control, not a task item), **task lis compute
  list-style none** (the marker suppression) while prose lis keep their channels —
  "static disabled inputs — presentation, not controls" ✓ at the served layer.
- **Code → CodeCard, tables → the registry Table**: **16 code-card instances** and
  **4 `div[data-kind="table"]` wrappers** in the served demos ✓ (the map's first two
  rows).
- **The security floor**: **zero `{@html}` mounts in the family** (the two grep hits
  are comments saying so); the html-equivalence seat teaches "everything outside the
  frozen tag table stays escaped literal text — hrefs re-validate on both syntax
  paths" — source-verified (parse.ts :103/:160).
- **The streaming seat is live**: `#markdown-streaming` serves a pause/reset interval
  feed ("A live chunk feed: an interval appends…") — the keyed-block memoization seam
  is source-real (markdown.svelte :175 `{#each parsed.blocks as block (block.key)}` —
  the L1–L4 keys are content keys; the node-level eachs key by index, the append-only
  T99-safe shape, with the block key carrying identity).
- **GitHub alerts**: the alerts seat renders the detection (blockquote → alert) ✓.

## LOW 1 — LAW #19: the PlayRow label id `jx-play-row-1-label` is minted twice

The page's canvases carry **two elements with id `jx-play-row-1-label`** (the canvas
playground rows' label id is positional — row-1 per canvas — not instance-scoped). The
id-association layer is polluted: a `for`/`aria-labelledby` resolve against the first
match, so the second canvas's row-1 loses its label association. No task/item content
is affected (the rows render visible text), and LAW #19's broader census is otherwise
clean — this is one positional-id shape. Fix: instance-scope the id
(`$props.id()`-prefix, the fleet's standard). Fleet note: every page hosting TWO+
PlayRow-bearing canvases has this class — the census shape is `ids.filter(x =>
/row-\d+-label/)`.

## MINOR 1 — the page gate is red: 1 cx clone; the family gate carries 47 errors

- +page.svelte :436 — the cx overload clone.
- **markdown-node.svelte ×36**: the ParsedNode union never narrows — "Property 'type'
  does not exist on type `ParsedNode | readonly ParsedNode[]`" and siblings at every
  renderer branch (the node-type discrimination needs one type-guard/discrminated-union
  pass; 36 seats close with it).
- **parse.ts ×11**: "'paragraph.children' is of type 'unknown'" — the parser's generic
  inference (one annotation cluster).
Runtime is exercised clean (the demos render, the streaming feed runs) — typing debt,
but 47 errors is the campaign's largest family gate; the union redesign is the fix
shape, not per-seat casts.

## Standard battery

- **toc == DOM == rail 10/10**, zero dangling; h1 ×1.
- **LAW #18**: the block each keys `(block.key)` ✓; the node eachs key by index —
  append-only safe, consistent with the T99 disposition (no content-collision keys).
- **LAW #19**: one duplicate pair (LOW 1); the DensityDemo-style seats clean.
- **T94**: the task inputs are real DOM checkboxes painted by the face — the disabled
  state is attribute-carried; no pseudo pair.
- **RENDERED table = claim surface**: the coverage map is a hand-authored table —
  cross-checked against the served parts (code-cards, table wraps, the escapes) ✓.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 1416d764) | **GREEN rc=0** |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page RED — 1 error** (cx clone); **family RED — 47 errors** (MINOR 1) |

## Process evidence

- Port **5242**: wrapper + listener 76511; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. The streaming feed state died with the probe browser.
- Probe faults owned: (1) my first task census counted the streaming demo's play/pause
  PlayRow checkbox as a task item (an enabled box "contradicting" the disabled-inputs
  claim) — the li-context re-read dissolved it (the box is the demo's own control, the
  claim is about task items); (2) deep-section reads needed scroll-mount (two probes
  re-run); (3) a `sel`/`log` Node-scope leak into page.evaluate (the recurring class).
- Artifacts: /tmp/t127/{probe-d.mjs,probe-e.mjs,probe-f.mjs,probe-g.mjs,d.json,e.json,
  scheck.log,lsof-after.txt}.

## Open questions

1. The markdown-node union narrowing (36 seats): one type-guard pass closes the class —
   the family owner's shape call (guard vs per-seat casts; casts at 36 seats would be
   the wrong shape).
2. The PlayRow positional-id class (LOW 1): one fix in the canvas component scopes it
   fleet-wide — every two-canvas page inherits the cleanup.

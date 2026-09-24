# T137 — SECOND REVIEW mermaid.html (vellum)

- **Reviewer**: vellum (2nd review; quill's 129a 1st-review report opened FIRST; landed
  items verified at byte + served layers; headline receipts re-derived; fresh axis.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/mermaid.html/` over the mermaid
  family + the mermaid engine, served live on :5242, dist @ HEAD ef520d44 (the floor
  rev, fresh build).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier ruling: Tier 2** (her
  proposal; the deepest live-claim surface held through my independent re-derives).

## Her findings — both lanes closed

1. **LOW-1 (cx clone, page :266 + family :377) — CLOSED**: both sites serve
   `Object.entries(style ?? {})` (the family's documented fix shape); svelte-check:
   **page 0 / family 0 errors**.
2. **The :86 MermaidConfig module-export mismatch — CLOSED by the alias-export**:
   mermaid.svelte :84-86 now imports `type MermaidConfig` from `$lib/mermaid-engine`,
   and the engine carries **`export type { MermaidConfigBase as MermaidConfig }`**
   (engine :75) — the alias lands the type where the renderer's consumers read it.
3. NIT-1 (the hand-authored canvas mirrors' same-source migration follow-up) — stands
   as recorded; the mirrors matched the live seats in my passes too.

## Her headline receipts — re-derived

- **The render-id collision contract, EXPANDED**: the progressive-scroll census
  (the lazy engine renders per-viewport — my first jump-to-bottom read caught one svg;
  owned below) finds **11 instance-root svgs with distinct id bases**:
  `deploy-flow-mmd-0-0` (the named workbench seat) + `jx-mermaid-1-0` …
  `jx-mermaid-8-0` + `axes-mmd-10-0` + `steps-mmd-11-0` — zero collisions at more than
  twice her instance count.
- **Zoom is a pure transform — across THREE seats**: two zoom-in presses put
  **matrix(1.5, 0, 0, 1.5, 0, 0)** on the wrapper ancestor (identity → 1.5 = +0.25 × 2)
  with the svg's outerHTML byte-length STABLE on every seat (deploy-flow 21,951;
  axes 12,408; steps 10,913) — no engine call, no re-render, measured per-seat
  (the zoom buttons live per-seat; my cross-seat read fault is owned below).
- **The error floor, all three halves**: the invalid seat computes
  `data-state="error"`, the **role="status" strip reads "render error
  [jixoai/mermaid-engine] render failed: No diagram type de…"**, and the source floor
  `pre` still carries "this is not a diagram…" ✓.
- **The a11y ladder**: **12/12 role=img viewports named** (role=img rides the DIV
  wrapper, not the svg — the honest hook) ✓.

## Fresh axis (beyond her report)

- The render-id census at ELEVEN instances (her six) — the collision contract scales;
  the id grammar (`<slug>-mmd-<idx>-0` named / `jx-mermaid-<idx>-0` default) held at
  every seat including the two custom-slug examples (axes/steps).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD ef520d44, fresh build) | **GREEN rc=0** |
| verify:docs-universal (batch) | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page 0 / family 0 errors** (LOW-1 + the :86 mismatch closed) |

## Process evidence

- Port **5242**: wrapper (/tmp/t137-wrapper.pid) + listener 66309; after gates killed
  BOTH by PID; `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY
  after**. Siblings untouched.
- NO commits, NO pushes.
- Probe faults owned: (1) the lazy engine renders per-viewport — my jump-to-bottom
  census caught ONE svg; the progressive-step scroll (700px steps, 450ms) mounts all
  seats (the T137-found lazy-per-viewport discipline); (2) my first zoom read compared
  the FIRST zoom button against the LAST mmd svg — cross-seat garbage (length changed
  because they were different nodes); the per-seat walk (button → 10 ancestor levels →
  its own mmd svg) is the receipt; (3) role=img lives on the DIV wrapper, not the svg.
- Artifacts: /tmp/t137/{probe-mer-pag.mjs,probe-mer2.mjs,probe-zoom.mjs,probe-zoom2.mjs,
  probe-zoom3.mjs,mp.json,mer2.json,gate-docs.log,gate-universal.log,scheck.log,
  lsof-after.txt}.

## Open questions

1. None. Closes clean at Tier 2.

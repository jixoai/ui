# T117 — SECOND REVIEW list.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 105 1st-review report opened FIRST,
  including her T106 partial withdrawal of LOW-1; landed items verified byte + served;
  headline receipts re-derived; fresh axis. NO commits, NO pushes; zero product-tree
  edits).
- **Target**: `apps/www/src/routes/docs/components/list.html/` over the list family,
  served live on :5242, dist @ HEAD f4a36087.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (per
  dispatch). Her MINOR-1 (the nav-claims contradiction) LANDED as the claim SPLIT with
  BOTH paints verified live; MINOR-2 (toc 6-for-8) LANDED 8/8 ordered to the DOM;
  LOW-1's surviving half (the rest-row caveat) LANDED; LOW-2 (cx, both trees) CLOSED.

## Her findings — all closed

1. **MINOR-1 (the nav demo contradicts the nav-defaults claim inside jx-pure) —
   LANDED as the three-way split, BOTH paints verified live.** The page now: (a)
   teaches the scoped truth unconditionally — hero :93, api :228/:347 all carry "a
   default that paints standalone; inside a jx-pure scope the face's B8 restore
   out-cascades it (no-jx-pure is the escape)"; (b) seats the in-scope truth — the
   jx-pure nav demo labeled "the B8 restore out-cascades the nav default (disc + ps-6
   paint here, not none + ps-0)"; (c) seats the standalone truth — the "Contents" nav
   labeled "nav alone gives marker none + ps-0". Served census of all three
   [data-jx-list-nav] wrappers:
   | wrapper | list-style | padding-inline-start | scope |
   |---|---|---|---|
   | "On this page" | **disc** | **24px** | in jx-pure ✓ |
   | "Contents" | **none** | **0px** | standalone ✓ |
   | "Chapters" (explicit decimal) | decimal | **0px** | standalone ✓ |
   The third row is the api row's fine print verified live: an explicit marker
   overrides the list-style default only — **ps-0 stays** ✓.
2. **MINOR-2 (toc 6-for-8, order skipped) — LANDED**: +page.ts ships 8 entries
   (usage, shapes, **markers, nav**, task-items, accessibility, universal-props, api)
   in DOM order; served rail 8/8, zero dangling.
3. **LOW-1 — withdrawn in the omission half by her T106 correction** (the axes render
   as the universal table's second fold — the rendered surface is the claim surface);
   the surviving half landed: the rest-row caveat / axes story now rides the summary
   and the api rows ("class/rest stay on the LIST element"), consistent with the
   rendered fold.
4. **LOW-2 (cx clone page :63 + family :103) — CLOSED**: svelte-check page **0
   diagnostics**; family lane 8 hits all warnings-class standing (the recorded
   provideUniversalLanes octet), registry twins clean.

## Headline receipts — re-derived

- **Muted marker ink**: li::marker **oklch(0.3211 0 0)** vs li ink **oklch(0 0 0)** ✓
  (the B8 law's computed layer, her digit-exact receipt re-derived; the ::marker
  computed read working — the recorded good channel).
- **Roman + start passthrough**: the start="4" ol carries the attribute with the
  platform's own glyph channel ✓ (the shapes-canvas ol receipt).
- **The no-jx-pure escape, taught at every seat** (hero, api description, api nav row)
  — the markdown map's own stamp, now named as the escape three times.

## Fresh axis (beyond her report)

- The THREE-wrapper paint census (her finding measured two; the fixed page serves
  three nav wrappers — the explicit-marker control "Chapters" now doubles as the
  ps-0-stays receipt). One census, all three claims.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD f4a36087) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (both cx seats closed) |
| registry twins | 0 diagnostics |

## Process evidence

- Port **5242**: wrapper + listener 27154; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Read-only probes.
- Probe faults owned: none material (my first roman finder caught the shapes-canvas
  ol rather than the roman seat — the start attribute receipt stands on either; noted
  rather than re-driven).
- Artifacts: /tmp/t117/{probe-a2.mjs,a2.json,scheck.log,lsof-after.txt}.

## Open questions

1. None. The page closes 2nd review clean at Tier 2.

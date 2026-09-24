# scribe task 10 — props-table hardening test + breadcrumb consolidated fix

Agent: scribe · 2026-09-22 · main dir, no commits, port 5243.
Part A files: `apps/www/test/props-table-meta-drift.spec.ts`,
`apps/www/test/props-table-render.spec.ts`.
Part B files: `apps/www/src/routes/docs/components/breadcrumb.html/+page.svelte`
(+page.ts untouched), `apps/www/test/canvas-same-source.spec.ts` (breadcrumb
joins the PILOTS + 4 snapshots).

## Part A — the extra-lane hardening pins (my badge MINOR-1)

The contract ("propsFromMeta spreads docs.extra by reference; PropsTable's
identity branch keeps them") was comment-only. Two pins, one per layer:

1. **Identity (node-level, meta-drift spec)** — new describe "the extra
   lane — the reference-identity contract": for all FIVE extra-bearing
   curations (badge, chip, component-canvas, popover, text),
   `propsFromMeta(meta, docs)`'s tail entries must be the SAME OBJECTS
   (`toBe`) as the `docs.extra` members, plus a load-bearing test pinning
   that badge/chip's extra `shape` shadows `UNIVERSAL_AXIS_NAMES` (the
   identity branch is the only thing keeping those rows alive).
2. **Render-count (jsdom, render spec)** — chip through the REAL
   component: family table = 12 rows, exactly ONE `shape` row (the extra
   with the `'square' | 'pill'` corner-law union, NOT the meta twin, NOT
   the §2 lane text), universal section = the eight axis rows verbatim.
   Rows typed as `HTMLTableRowElement` (no new `.cells` diagnostics).

**Premise proved by mutation, not assumed:** with
`propsFromMeta` temporarily cloned (`(docs.extra ?? []).map((e) => ({
...e }))`), the five identity tests FAIL loudly ("must be the SAME OBJECT
that went in"); restored, all green. Solo run: **43/43 → after the typing
fix 38/38** (meta-drift 34, render 4, composition 5 in the trio).

## Part B — breadcrumb consolidated fix (per finding)

0. **Finding 8 FIRST — my own deterministic probe before any theme
   prose** (/tmp/scribe-10-themeprobe*.mjs, steady-state reads with the
   100ms item transition ridden out). Verdict:
   - FROZEN (stylex layer): trail link ink `--jx-muted-foreground`
     oklch(0.3211 0 0) unchanged; current-page ink `--jx-foreground`
     oklch(0 0 0) unchanged.
   - FLIPS (raw layer): chevron border 0.3211→0.8452; focus outline
     (--hairline/--ring); the WHOLE composed menu — panel ground
     (white→dark), panel border, panel/item ink, you-are-here ink
     (0→1) AND you-are-here ground (0.9551→0.2178). The popover panel
     is a DOM descendant of the nav (`nav.contains(panel)` true) — the
     island's tokens inherit into it.
   - **marginalia's observation resolved as a probe artifact**: the
     "oklab 0.9551 both configs" freeze was a synchronous read during
     the `.jx-menu-item` 100ms background transition — at t≈0 the
     interpolated value IS the light mix (my own first probe reproduced
     the artifact identically; probe 4 with a 250ms wait shows the full
     flip, and the light-again pass restores every value).
1. **BLOCKER — full re-theme claims → THE SPLIT, both levels.** Theme
   row rewritten (stylex-frozen trail inks named; raw layer named:
   chevron, focus outline, the entire menu incl. the you-are-here
   paint); the theme demo caption (:641) now says the split; the axes
   summary's "only theme is live" replaced with the per-level split.
   The `--jx-muted-foreground` TokenTable row (which wrongly claimed
   the chevron border too) split into stylex-frozen vs raw rows.
2. **MAJOR-2 — one mechanism both sides.** The fold drawer's
   `text-muted-foreground` hand mirror is GONE (same-source below);
   the stage's `cx(rt.inkMuted)` is now the single source — SSR shows
   `inkMuted` ×2 (stage + extracted drawer byte-identical) and the
   utility class only survives inside a quoted css-laws comment in a
   source drawer (not page markup).
3. **MINOR-1 — same-source conversion.** All four canvases now carry
   ids (`demo`, `fold`, `dropdown`, `axes`) and compose their drawers
   via `usageFile` + `resolveRawCode`; the hand-mirrored literals
   (incl. the `${close}` dodges for them) are deleted; the axes drawer
   carries the `query`/`DensityLane` imports (the badge pattern), so
   its query sample is copy-paste-runnable — which also fixes the
   missing import block. Breadcrumb joined canvas PILOTS; snapshots
   written once with `-u`, then **69/69 green without it**.
   Self-containment fallout fixed honestly: the eight-page trail's
   `{#each folded}` and the `items={peerPages}` / `density=
   {responsiveDensity}` stage references were bare identifiers the F4
   guard rejects — inlined as literals (the drawer files are now fully
   copy-paste-runnable); the `folded`/`peerPages`/`responsiveDensity`
   consts removed.
4. **MINOR-4 — query() two-generic form** at the stage, the caption and
   (via extraction) the drawer:
   `query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')`.
5. **MINOR-5 — the "ambient read until the engine resolves" promise
   replaced by the mechanism**: the SSR base resolves onto the rung
   stamp (data-density="sm" on the nav) and THE NAV'S SCOPE BLOCK
   re-declares the five channels the menu reads; at ≥64rem the engine
   re-resolves and the scope re-stamps.
6. **NITs**: density row now names FIVE menu channels (`--jx-hit /
   --jx-line / --jx-inset / --jx-text / --jx-gap`, grep receipt:
   dropdown-menu.css `.jx-menu-trigger,.jx-menu-item`) + the named-rung
   resets-the-coefficient clause; "the generated Universal section" →
   "the shared Universal props section" (this page's tables are hand
   rows + the `universal` flag, no meta); the PROVIDER-SNAPSHOT
   sentence moved out of the axes summary wall into the census
   paragraph.
7. **RULING applied**: See also stays OUT of the toc (+page.ts has no
   see-also row; nothing changed).
8. Covered by 0 above.

## Gates

| gate | result | evidence |
|---|---|---|
| dev smoke :5243 | 200 after fixes | 13/13 SSR receipts: theme split prose, split caption, two-generic query (entity-escaped form — the badge lesson), gap channel named, PROVIDER-SNAPSHOT in the census paragraph, old claims gone; 0 listeners before start, 0 after PID+wrapper kill |
| theme probe | steady-state 3-pass (light → dark → light-again) | /tmp/scribe-10-themeprobe4.log — every frozen/flip verdict reproducible both directions |
| canvas-same-source solo | **69/69** (snapshots -u once, then green) | breadcrumb :: demo/fold/dropdown/axes all extracted; the F4 self-containment guard enforced (bare-identifier stages rejected and fixed) |
| props-table specs solo | **43/43** (38/38 final after typing fix) | mutation test: clone ⇒ 5 identity FAILs; restore ⇒ green |
| verify:tailwindless | receipt UNMOVED | files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 |
| verify:docs-universal (fresh build, exit 0) | **110/110** (110 markers) | breadcrumb marker ×1 |
| verify:docs | ✓ staged scope green | breadcrumb out of inScope; no new backlog |
| openspec validate --strict | valid | no spec edits, zero deletions |
| page-scoped svelte-check | zero NEW error classes on my files | breadcrumb page: the fleet cx-idiom error only (pre-existing since task 2); meta-drift: the same 2 pre-existing diagnostics (columns shifted); render-spec: my chip test adds ZERO (typed HTMLTableRowElement); workspace total moves with concurrent agents' unrelated files |

## Processes

- Dev server `node scripts/dev.mjs --port 5243` (lsof empty before),
  killed by listener PID + wrapper PID; `listeners=0 wrappers=0`
  receipt. Build AFTER the kill (exit 0).
- Scratch /tmp only: scribe-10-dev.log, -ssr.html, -themeprobe{,2,3,4}.mjs/.log,
  -build.log, -svelte-check.log, from-meta.bak (mutation-test backup,
  restored). Repo writes: the four files above + this report +
  experience.md.
- Concurrent-tree note: avatar + dropdown-menu page work and the
  ambient-vocabulary matrix are other agents' concurrent files —
  present in the shared gates, untouched by me. The canvas-same-source
  file also carries avatar's join (shared file, both agents' lines).
- Tooling scars recorded in experience.md: python heredocs mangle
  backtick escapes (my snapshot stubs shipped `\`` pairs and broke the
  spec parse — fixed line-wise; use the Edit tool or chr()-built
  strings for backtick templates).

## Verdict

Part A: DONE — the contract is now pinned at both layers, mutation-proven.
Part B: DONE — all 8 ledger items closed (7 code/prose, 1 ruling
no-op), the theme story now states the measured split per voice and per
level, and breadcrumb is a same-source pilot page. No deviations from
the consolidated ledger; finding 8's answer (menu flips; the freeze was
a transition-frame artifact) is documented with the probe log as
receipt.

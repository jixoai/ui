# TASK 14 — REVIEW avatar (1st of 2)

- **Reviewer**: scribe (first reviewer; reviewer #2 = marginalia, after — no independence constraint)
- **Target**: vellum's page integrated at `e2412594` — `docs(avatar): tier-2 archetype repair (vellum task 9)`
- **Scope re-derived independently**: page (`apps/www/src/routes/docs/components/avatar.html/+page.svelte`, 523 lines) + curation (`apps/www/src/lib/ui/props-table/docs/avatar.docs.ts`) + the 3 canvas-same-source PILOTS blocks
- **Method**: source read, raw-SSR byte parse, built-CSS grep, live computed probes (playwright-core + system Chrome headless, /tmp scripts), solo specs
- **VERDICT: PASS** (findings below are family-code hygiene, pre-existing, non-gating)

## Claim-by-claim verification

### 1. FALSE density token rows deleted — TRUE
`rg -n -- "--jx-icon|--jx-inset" apps/www/src/lib/ui/avatar/` → **zero hits**. The old page's FALSE claim is gone from the integrated page; density row now carries the negative-grep receipt posture.

### 2. Theme four-voices-frozen documented absence (W-next #1) — TRUE
Built CSS (`apps/www/dist/_app/immutable/assets/0.*.css`):
- `--jx-border` declares exactly twice — line 6665 under `:root, .xbpgcew` (6646) and line 6769 under `.x13ei35y.x13ei35y, .x13ei35y.x13ei35y:root` (6768). Same dual-pole shape for `--jx-card`, `--jx-muted`, `--jx-muted-foreground`.
- Exactly one `.dark` occurrence in the whole file; **no theme voice ever declares under plain `.dark`** (rg for `.dark{...--jx-border|--jx-card|--jx-muted` → none).
- Live probe: flipping the theme axis lands the `.dark` bridge class on the second root and **nothing repaints** — box 32 / radius 8px / ink `oklch(0.3211 0 0)` / ground `oklch(0.9551 0 0)` identical light vs dark. Single-evaluate cross-instant read, no transition-frame artifact.
The page's axes-section summary states precisely this ("Theme lands the .dark bridge and paints nothing in the built pipeline (a documented absence, the W-next #1 gap)").

### 3. Numbers — TRUE
| Claim | Receipt |
|---|---|
| Box ladder 24/32/40 (named steps) | live probe PASS |
| Legacy aliases resolve to same boxes | live probe PASS |
| Number lane 48/28 verbatim (`--jx-avatar-md` seam, avatar.svelte:227) | live probe PASS |
| Bevel cuts 6/8/10 at the 8px baseline (0.75×/1×/1.25×) | canvas captions + stylex source |
| Circle/squircle 50% | canvas + source |
| Initials halve at sm (张伟 keeps 张) | fallback canvas |
| Radius 24px carrier → 8px md corner unmoved | live probe: 8px → 8px → 8px under `--jx-radius-effective: 24px` |
| Cyan carrier leaves initials ink | live probe PASS |
| lg rung → box 32 unmoved | live probe PASS |

8/8 probes green (`/tmp/scribe-14-probe3.log`, probe4). One probe-hygiene note (mine, not the page's): the radius check's first run stamped the **sm** avatar (6px cut) — still proved inertness (6px→6px) but not the 8px wording; corrected to the md avatar for the exact claim.

### 4. EXTRA arithmetic — TRUE
- `avatar.meta.ts`: **17** props (src, name, alt, size, variant, tooltip, density, shape, radius, color, theme, elevation, motion, class, onerror, style, rest).
- Raw SSR (byte parse of `:5243/docs/components/avatar.html`): family table (API ▸ Properties) = **9** rows (src, name*, alt, variant, tooltip, class, onerror, style, rest); Universal props section = **8** rows; the third 4-col table on the page is the page's OWN axes mechanism table under `#axes` (8 rows) — not a duplicate universal table. 17 − 8 = 9 exact.
- **No extra lane**: `avatar.docs.ts` has `overrides` only, no `extra:` key — and the comment says why (silhouette vocabulary is `variant`; no chip/badge `shape` casualty).
- **`size` deliberately not curated**: SSR confirms `size` absent from the family table, present only in the universal section; the docs.ts comment cites the badge dead-text lesson verbatim.

### 5. query() two-generic form — TRUE
Page: `size={query<{ lg: number }, number>({ lg: 48 }, 40)}`. Live probe: 48 wide → narrow viewport → 40 narrow → wide → 48. Flip both directions.

### 6. Tier-2 audit — TRUE
- Old page (via `git show <pre-e2412594>`): 334 lines, hand API table, dead `#theming` toc anchor, 1 FALSE `--jx-icon` claim.
- New page: archetype order (overview → usage → silhouettes → fallback → props → axes → accessibility → see-also); anchor sweep on raw SSR: 8 unique `#` links, **0 dead**, `#theming` gone; props tables **0 empty cells**; headers exactly `Property | Type | Default | Description`.
- PILOTS: avatar's 3 blocks pinned in `apps/www/test/canvas-same-source.spec.ts:387/:414/:451` (silhouettes/fallback/axes inline snapshots) — solo run **75/75 green**.
- Play-state lab kept hand by the **documented rejection class** (+page.svelte:45-50: playground page-state bind + `{name}`/`{variant}` shorthands — chip FAQ precedent).

## Findings (severity-tagged)

1. **[MEDIUM · family-code, pre-existing, out of review scope]** `avatar.svelte:249:7` svelte-check **Error** — `onerror={handleError}` not assignable to Svelte's `EventHandler<Event, Element>`. Provenance: last touched at `4a96996f` (W3 batch B), before vellum's page commit. No runtime failure (all probes/specs green). Family owner should fix the handler signature.
2. **[MEDIUM · family-code, pre-existing]** `avatar.svelte:191:28` svelte-check **Error** — `Object.entries(style)` receives `{...} | undefined`; needs a guard or non-optional type. Same provenance.
3. **[LOW · Warn]** `avatar.svelte:146` — `provideUniversalLanes({ density, ... })` triggers svelte-check's non-reactive-capture warning. Runtime probes show the number-lane seam works; worth the family owner confirming the broadcast intentionally pins initial values.
4. **[INFO]** svelte-check is not a campaign green gate; workspace baseline is 1623 errors (markdown/test/blueprints dominate). Avatar's 2 errors are a rounding error against it — still worth cleaning, but they do not gate this review.
5. **[NIT · mine]** Probe locator lesson repeated: `[data-jx-avatar]` index addressing must target the md specimen for the 8px claims (see §3 note).

## Gate receipts

| Gate | Result |
|---|---|
| `verify:docs-universal` | GREEN: 110/110 (exit 0) |
| `verify:tailwindless` | GREEN — files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (exit 0) |
| `verify:docs` | skeleton lint all docs pages pass, staged scope green (exit 0) |
| canvas-same-source solo | 75/75 (exit 0) |
| props-table-meta-drift solo | 34/34 (exit 0) |
| Live probes | 8/8 PASS (tokens/theme/numbers/query/inertness) |
| Raw SSR | 9+8 arithmetic, toc 7/7, 0 dead anchors, 0 empty cells |
| svelte-check | 1623 workspace baseline (pre-existing noise); avatar: 2 Error + 1 Warn — see findings |

## Process evidence

- Port **5243**: `lsof -ti :5243` before = `23834` → killed by PID → after = **empty**; background dev-server task exited 143 (SIGTERM, my kill). Unrelated listeners (5242, other projects) untouched.
- **No commits, no pushes** — working tree diff contains only other scribes' in-flight files (vellum hero-section, marginalia report); zero avatar edits by me.
- Probe scripts: `/tmp/scribe-14-probe3.mjs`/`probe4.mjs`, log `/tmp/scribe-14-probe3.log`; SSR capture `/tmp/scribe-14-ssr.html` (1,092,358 bytes); gate logs `/tmp/scribe-14-{canvas,drift,universal,twind,docs,scheck}.log`.
- Images/truth discipline: theme reads were single-evaluate cross-instant; radius inertness used the real carrier path (inline `--jx-radius-effective` stamp on the live element), re-checked before/during/after.

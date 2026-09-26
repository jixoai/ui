# Report 9 — avatar, CODE (vellum, docs-eight-axes-mdn)

agent: vellum · 2026-09-22 · route
`apps/www/src/routes/docs/components/avatar.html/` (+ curation
`apps/www/src/lib/ui/props-table/docs/avatar.docs.ts`, new) · family
untouched · NO commits, NO push · port 5242 recycled (below).

## Tier: 2 优化重构

The old page had real bones — the spec-pinned play-state lab, the
silhouettes matrix with corner laws, an honest a11y table, and the §13
adoption noted — but: a hand-written API table (the W3-era shape this
campaign retires), a stale toc (dead #theming anchor, no axes row), a
theming section carrying FALSE density token rows (`--jx-icon` /
`--jx-inset` "density" — the avatar reads neither; grep receipt below), no
per-axis table, no query() case, no install/see-also. Tier 2: restructure
to the archetype, generated API, receipts-bearing axes table; keep every
real fact (the lab stays byte-identical, the silhouettes matrix and
fallback algorithm survive in full).

## Diff list

- `+page.svelte` — full archetype restructure. New: DocsInstall,
  Overview/Usage sections, API via `<PropsTable meta={avatarMeta}
  docs={AVATAR_DOCS} />`, the eight-axes section (per-axis table + grouped
  demos + one query() case), DocsSeeAlso, route-shell split
  (rt.shell/rt.shellFlush). Kept: the lab (playground state, live usage
  overlay via resolveFileContent — now resolving at call time, killing the
  old `state_referenced_locally` warning), the silhouettes matrix and the
  fallback/tooltip facts (both joined to the same-source lane).
- `+page.ts` — toc rebuilt to the DOM: overview → usage → silhouettes →
  fallback → props → axes → accessibility (the dead `theming` anchor and
  the pre-archetype labels are gone).
- `avatar.docs.ts` (new) — curation: prose overrides for src, name, alt,
  variant, tooltip, class, onerror, style, rest. NO extra lane: no
  family-local prop shares an axis name (the silhouette vocabulary is
  `variant`); `size` is axis-named BY ADOPTION (the §13 story renders in
  the universal section + the axes table — an override for a filtered row
  is dead text, the badge lesson). `rest` kept visible: the native-img
  passthrough is a real story.
- `test/canvas-same-source.spec.ts` — avatar joins PILOTS; three inline
  snapshots (silhouettes / fallback / axes) filled with `vitest -u` and
  green on re-run. The play-state lab stays a hand file BY DESIGN (its
  stage binds page state — the F4 rejection class, the chip-FAQ
  precedent), documented in the page source.
- `test/fixtures/docs-ambient-vocabulary.matrix.json` — RE-PIN with
  evidence (the route's own frozen governance): avatar's 2 stale table[0]
  hand-table entries (size ambient-scope, variant own-bevel) retired with
  the hand table; 2 new scope entries pin the axes table at table[1] (the
  meta table holds index slot 0) for the spec's tracked props (size,
  density). Net matrix 36 → 36. The spec's AXIS_PROPS only tracks
  density/variant/tone/material/size — the other six axes are
  unpinnable there by construction. My axis rows' default cells moved
  "'auto'" → 'ambient scope' (semantically identical: no-own, inherit the
  ambient; the only cell text the checker can express) — the one
  convention divergence from the chip/accordion axes tables, forced by the
  route's frozen matrix, noted for the reviewer.

## The axis story (all measured or grep-receipted)

- **size — CONSUMED, the §13 adoption (the page's headline)**: the family
  prop IS the axis. Named steps small 24 · medium 32 · large 40 (measured);
  legacy sm/md/lg alias pre-resolve (AVATAR_SIZE_ALIASES); a number IS the
  box edge in px verbatim — measured 48 and 28 boxes; the number lane
  stamps `--jx-avatar-md`, the context seam the md atom reads (measured:
  the seam responds to the injected var). The initials voice stays the
  fixed `--jx-text-label-lg` step; the sm box halves the block to one code
  point (measured: "A" / "张").
- **density · shape · radius · color · elevation · motion — SUPPLY-ONLY,
  each with the negative-grep receipt** (the chip-review form): zero reads
  of their carriers in avatar.{svelte,stylex.ts,css}. Density: no density
  channel anywhere in the family css, and the tooltip shell is the body's
  DOM ANCESTOR so the rung's scope never re-scopes it (measured: box
  unmoved under a stamped lg rung). Shape: the silhouette sheet reads the
  §14 ALIAS ladder (`--jx-shape-bevel/round/squircle`) keyed on the
  variant, never `--jx-shape-effective`. Radius: the bevel cut composes
  `var(--radius) × --jx-radius-factor-bevel` — measured 6/8/10px at the
  8px baseline; a stamped 24px carrier leaves the corner. Color: initials
  ink reads `--jx-muted-foreground` directly — measured a stamped cyan
  carrier leaves the ink. Elevation: the one edge is the 1px hairline, no
  shadow — measured unchanged under a stamped level. Motion: no transition
  in the family (the tooltip's motion is the tooltip family's).
- **theme — LANDS, PAINTS NOTHING (documented absence, the THEME-SPLIT
  law)**: `class:dark` lands on the img/fallback root; the family's four
  voices (`--jx-border`, `--jx-card`, `--jx-muted`,
  `--jx-muted-foreground`) are theme-aliased stylex tokens whose emission
  resolves at `:root, .xbpgcew` (dist-walk receipt) — a plain .dark island
  re-scopes none of them in the built pipeline (W-next #1). Measured
  stable-state: frame border/ink identical under the dark island. The
  census/D5 and drift-ledger wording carried in the row.
- **query() case**: `size={query<{ lg: number }, number>({ lg: 48 }, 40)}`
  — the two-generic form even on a number lane, INLINE in the extracted
  stage; measured 16px↔14px… for avatar: 48px at ≥64rem ↔ 40px base, both
  directions (probe), SSR carrier stamps resolve.
- **吃也供 ruling**: first mention in the deviations paragraph carries the
  gloss ("the broadcast protocol (吃也供, supply-and-consume; …)").

## Receipts (gate tails)

| gate | result | tail |
|---|---|---|
| affected specs solo BEFORE edit | exit 0 | docs-structure + docs-ambient-vocabulary + defaults-w4-content + batch1-components all green pre-change |
| affected specs solo AFTER | avatar scope green | docs-ambient-vocabulary `-t avatar`: **4/4 PASS**; docs-structure solo: **12/12**; defaults-w4/batch1 unaffected (family untouched). 3 failures in the FULL ambient file are **dropdown-menu table drift = a sibling's in-flight round** (their dropdown-menu.html/.ts + docs file mid-edit in the shared tree) — pre-existed my matrix edit, isolated to their route |
| `verify:tailwindless` | exit 0 | `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim` |
| `verify:docs-universal` | exit 0 | `GREEN: 110/110 … (110 markers)` (stale-dist caveat below) |
| `verify:docs` | exit 0 | `✓ all docs pages pass the skeleton lint (staged scope green)` |
| canvas-same-source (avatar joined) | 63/63 | `✓ avatar.html :: silhouettes / fallback / axes` — snapshots filled with `-u`, re-run green |
| svelte-check (page-scoped delta) | clean | baseline: 1 cx error + 1 `state_referenced_locally` warning → after: **exactly 1 cx error (140:28, the fleet idiom debt), warning GONE** |
| raw SSR ground truth | ✓ | family table **9 rows** (17 meta − 8 axis-named; rest visible with prose), universal 8 rows, axes 8 rows; universal marker ×1; toc ids ×1; Usage H2 ×1; install + see-also; variant own-default cell renders; 吃也供 gloss renders |

## Process evidence + flags for the orchestrator

- Port :5242 empty before (lsof exit 1); wrapper PID **29561** (log
  /tmp/vellum-9-av-vite.log); killed by PID; `lsof -ti :5242` → empty
  (exit 1); wrapper dead; no orphan grandchild.
- Probes (fresh runs): /tmp/vellum-9-av-measure.mjs (family ladder on the
  old page), -verify2.mjs / -final.mjs (new page), -cssom2.mjs,
  -xcheck.mjs (cross-family token checks), -diag3.mjs. SSR:
  /tmp/vellum-9-av-ssr.html → -ssr2.html. Gate logs:
  /tmp/vellum-9-av-{specs-before,specs-after,tw,univ,docs,scheck,canvas-u,amb*.log}.
- **FLAG 1 — the tree-wide build is broken (NOT by this task)**:
  `npm run build` fails at the SSR phase with the list-item ItemEnd
  contract throw ("inset must be a non-negative px value", item-end.svelte)
  — reproduced with my three avatar files removed (build fails identically
  without them), so it pre-exists in the shared tree (sibling in-flight
  work; list-item family itself unchanged since 3e8c38ec). Consequence: the
  dist gates ran on the pre-existing dist (docs-universal's avatar entry
  tested the OLD dist page); the avatar-relevant marker truth was verified
  live instead (universal ×1 in raw SSR on the dev page). The build needs
  the owning sibling's fix before the next fresh-dist gate round.
- **FLAG 2 — dev-CSSOM token handling is injection-unstable (kernel
  observation)**: transiently, the dev pipeline inlines token chains
  (raw `var(--border)` live at the element → a `.dark` island FLIPPED the
  avatar border mid-injection), then stabilizes to the built semantics
  (frozen at :root). Both the stable dev state and the dist emission agree
  with the fleet law; the transient state can make theme probes (and dev
  dark-mode previews) LIE. Probe law update banked: double-read theme
  claims across a settle gap and gate readiness on the subsystem under
  test. Owner/Kernel may want the dev runtime's inline-vs-layer behavior
  looked at — dev previews of token-aliased families are not to be
  trusted mid-injection.
- Working tree carries sibling in-flight work (dropdown-menu round, my
  breadcrumb-fix integration residue); untouched. My footprint: exactly
  the four files in the diff list.

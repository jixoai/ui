# Report 6 — quill CODE of cascader (task 6)

- agent: quill · date: 2026-09-22 · route:
  `apps/www/src/routes/docs/components/cascader.html/+page.svelte` (+page.ts) ·
  new curation: `apps/www/src/lib/ui/props-table/docs/cascader.docs.ts`
- census row: batch A native-collision family (16, LANDED 6bb88ae0) — the
  page documents the adoption the family already carries (first-ever
  `CascaderDefaults.resolve` wiring, all eight no-own slots)
- baseline before edits: verify:tailwindless GREEN (receipt verbatim below) ·
  verify:docs-universal 110/110 · verify:docs staged green · affected specs
  solo 346/346 (4 files) · svelte-check 1645 ERRORS / 1031 WARNINGS

## Tier: 3 完全重构 — justified

The page predated the archetype: a tw4-era "Density and tokens" section
whose TokenTable carried the retired `--jx-hit` lane and density values
(`--jx-text 11/12/13/15px`) that this family's fixed paint contradicts; a
hand-written props table with no axis surface at all; no install section, no
see-also, no per-axis table, no query() case; section order ≠ §2. Rewrite
from the archetype; the OLD page's real information survived — the path law
(complete joins / partial submits `''` / truncation / disabled semantics),
the playground wiring (path echo, reset, live usage file), the a11y table
rows, the demo tree, the meta description.

## Changes

1. `+page.svelte` — archetype order: hero → DocsInstall → Overview (purpose,
   parts incl. the jx-form-field bridge, the honest-path law) → Usage → the
   live demo canvas (playground intact) → Props (`<PropsTable meta={cascaderMeta}
   docs={CASCADER_DOCS} />` — generated main table + auto universal section) →
   **The eight axes on cascader** (per-axis table + fixed-paint TokenTable +
   runnable stamps + one real query() case) → Accessibility (+ measured
   hit-floor note) → DocsSeeAlso.
2. `+page.ts` — ToC re-derived to DOM order; survivor ids kept
   (`usage`/`api`/`accessibility`/`cascader-demo`) because
   legacy-doc-routes.json maps `/components/cascader.html` → here with
   `preserveHash: true`; inbound `cascader.html#` grep: zero.
3. `cascader.docs.ts` (NEW) — the docs curation: prose for the eight family
   props; `required` on options and `bindable` + default `'[]'` on value
   asserted per from-meta.ts's documented ceilings (the extractor never emits
   them). No EXTRA lane needed: no family-local prop shadows an axis name
   (cascader's eight ARE the lanes; grep receipt in the axis citation).

## The axis story (grep receipts → page claims)

Receipts before prose: `grep -e "--jx-*-effective" apps/www/src/lib/ui/cascader/`
→ **zero consumers** (only `tokens['--jx-radius']` = `var(--radius)`,
tokens.stylex.ts:109); family channel reads are fixed constants
(`--space-6/--space-10/--jx-unit/--jx-text-base/--text-label-lg/--track-10`
in cascader.stylex.ts, `var(--ring)` in cascader.css:11); `--jx-text-base` is
the ruler's T_base constant, explicitly not the rung-scoped `--jx-text`
(jixoai.css:1234, 440); the stylex aliases declare at `:root` + theme-scope
classes only (built CSS: `:root, .xbpgcew`), never under a plain `.dark`;
`--ring: var(--primary)` re-declares in BOTH theme voices (jixoai.css:77,294).
So: **seven stamp-and-supply-only rows + theme with ONE consumed voice** (the
:focus outline; the face stays site-themed). 吃也供 gloss at first prose
mention (axes summary), ruled form.

## Receipts — SSR grep (curl :5241, served markup)

| claim (page) | SSR receipt | verdict |
|---|---|---|
| "auto — ambient scope, stamps nothing (no data-density, no style attr)" | ambient root: no `data-density`, no `style` | TRUE |
| density="small" → `data-density="sm"` + `--jx-density-coefficient: 1` (alias-normalized rung) | root 4: `data-density="sm" style="--jx-density-coefficient: 1"` | TRUE |
| size=24 → carrier in the root's style attr | root 6: `style="--jx-size-effective: 24px; font-size: var(--jx-size-effective, 1rem)"` | TRUE |
| theme="dark" → `.dark` stamps the root | root 8: `class="… dark"` | TRUE |
| query() → SSR paints the base rung | root 10: `data-density="sm"` + coefficient 1 | TRUE |
| code shown = code running | axesUsage strings byte-match the five panels (incl. the typed query form) | TRUE |

## Receipts — the ONE probe (axis honesty, /tmp/quill-6-axis-probe.mjs, 10/10 TRUE)

| # | claim | probe | result |
|---|---|---|---|
| P1 | select face fixed: 13px on ambient / sm / size-24 panels | computed font-size | 13px ×3 — TRUE |
| P2 | label face fixed: 12px everywhere | computed font-size | 12px — TRUE |
| P3 | **disagreement core**: size=24 moves the stamp, not the paint | root 24px AND select 13px on the SAME panel | TRUE (a coinciding number would have hidden the false claim) |
| P4 | theme split, face half | select background byte-identical ambient vs dark | `oklch(1 0 0)` === `oklch(1 0 0)` — TRUE |
| P4 | theme split, ring half | focused outlineColor ambient vs dark | `oklch(0.6489 0.237 142)` vs `oklch(0.7044 0.1872 138)` — differs by exactly the −4° drift — TRUE |
| P5 | query() flips at the lg viewport rung | data-density at 900px vs 1440px | `"sm"` → `"lg"` — TRUE |
| P6 | hit surface density-invariant | select offsetHeight ambient / sm / lg | 35px === 35px === 35px — TRUE (the a11y note's measured number) |

## Gates (log-file + $? discipline; all my own runs)

| gate | result | evidence |
|---|---|---|
| dev-smoke :5241 | PASS | SSR 200 / 936,888 B; universal marker ×1; H1 renders; all greps above |
| `npm run build` | exit 0 | fresh dist for the built-dist gates (no sibling build in flight, `pgrep` clean) |
| `verify:docs-universal` | GREEN 110/110 | "110/110 component pages render the shared universal section (110 markers)" (/tmp/quill-6-du-final.log) |
| `verify:tailwindless` | GREEN, receipt UNMOVED | "files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim" (/tmp/quill-6-tl-final.log) |
| `verify:docs` | GREEN | "✓ all docs pages pass the skeleton lint (staged scope green)" (/tmp/quill-6-vd-final.log) |
| affected specs solo | 346/346, before AND after | docs-structure + docs-ambient-vocabulary + batch6-antd2-components (the family test) + defaults-form-families (the CascaderDefaults test) (/tmp/quill-6-specs-baseline.log, -final.log) |
| scoped svelte-check | 1645 → **1644** ERRORS (−1) / 1031 WARNINGS | the −1 IS the fix: the bare `query({ lg: 'large' }, 'small')` shipped a real `QueryResult<string>` error (384:60, first run) — fixed to the BOTH-generics form; cascader.html now carries exactly ONE error, the pre-existing cx-idiom overload (97:28 — byte-identical code at the old page's line 89; anchor carries the same idiom error at 67:28) (/tmp/quill-6-sc.log, -sc2.log) |

## Process receipt

Dev server: wrapper PID 60381 (`npm run dev -- --port 5241 --strictPort` →
/tmp/quill-6-dev.log), vite listener PID 60411 (lsof :5241). Killed by PID
after gates; `ps -p` → both gone; `lsof -i :5241 -sTCP:LISTEN` → empty
(exit 1); no vite leftover on 5241 (remaining matches are siblings' ports /
host tooling, untouched). Probe script + SSR captures + all gate logs live in
/tmp only. Working tree carries siblings' in-flight files (BOARD.md,
assignment.json, scribe/vellum experience, blockquote/+page.ts from my own
task 3) — untouched by this task; my diff is the three files listed above. No
commits, no push. Measurement-only verification — no visual judgment entered
any verdict.

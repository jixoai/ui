# Report 1 — anchor (CODE, round 1)

- agent: scribe · date: 2026-09-22 · target:
  `apps/www/src/routes/docs/components/anchor.html/+page.svelte` + `+page.ts`
- family: `apps/www/src/lib/ui/anchor/` (anchor.svelte, anchor-item.svelte,
  anchor-defaults.svelte.ts, anchor.stylex.ts) — UNTOUCHED
- baseline skill: `openspec/changes/docs-eight-axes-mdn/skills/mdn-doc-style.md`

## Tier: 2 优化重构

The bones were good — the live demo canvas (THIS PAGE is the demo), the
sticky aside rail, the same-source drawer files, and the route-local style
zone all survive. But the page was W3-era: the eight axes were documented by
one uniform demo card; the hero summary was a five-sentence wall; the same
usage CodeBlock rendered twice (#anchor-usage and #usage); PropsTable sat
last; there was no Overview, no Install, no See-also, no per-axis table, and
no real `query()` case. Tier 2 scope: restructure to the §2 archetype order,
cut redundancy, fill the gaps, rewrite §1-violating prose. Tier 3 not
warranted — nothing needed inventing from scratch.

## What changed

New section order (satisfies §2 AND the docs-structure skeleton's monotonic
six: intro < install < usage < examples < api < see-also):

1. **Hero H1** — summary cut to one sentence, MDN tone; pills kept.
2. **DocsInstall** (`data-doc-install`) — added; was missing.
3. **Overview** (new, id=overview) — 3 short paragraphs: composition
   (nav landmark + AnchorItem parts), the DOM-delegated pick (targets from
   the root's own DOM, MutationObserver re-derivation, offset 96), the two
   reversible leases + the shared `@lib/scroll-spy`; links out to the
   universal-props concept page. The old "Types" card folded in here.
4. **Usage** — the ONE usage sample (duplicate removed).
5. **Live example canvas** — kept (anchor-what / anchor-pick / anchor-vs-toc
   + the sticky aside + filler depth), prose tightened to §1.
6. **Props** (id=props, moved up per §2.4) — Anchor table (`universal` kept
   — the generated shared section renders here; `data-jx-props-table-universal`
   ×1) + AnchorItem table. The hand-written `density` row deleted: it was
   dead weight (filtered into the generated section anyway). Added `...rest`
   rows for both parts.
7. **The eight axes on anchor** (id=anchor-axes) — replaces the W3-era
   uniform demo card:
   - per-axis table (PropsTable machinery, 8 rows): axis · mechanism HERE ·
     default · what it drives (named steps + number unit per
     `universal-props.schema.ts`);
   - census citation paragraph (W3 close D5: anchor one of the 13 sweep
     holes; declaration-only density posture retired; no §13 renames);
   - TokenTable moved from the old Theming card — defaults rewritten
     honestly as "rung scale × coefficient" (the old px literals
     "28/32/40/48" were rung-value claims the CSS contradicts — the rung
     values are `calc` equations over `--jx-unit`, not fixed px);
   - runnable demos (code shown = code running, verified in SSR):
     density auto/small/large, theme="dark", and ONE real
     `query({ lg: 'large' }, 'small')` case on density with the SSR-base
     note.
8. **Accessibility** — kept A11yTable; focus-ride lease made explicit
   ("the spy never steals focus", tabindex=-1 restored on blur).
9. **See also** — DocsSeeAlso added; renders steps/menubar/navigation-menu/
   breadcrumb links (verified in built HTML).

`+page.ts`: ToC data re-ordered to DOM order; dropped ids that no longer
exist (anchor-usage, types, theming, api). No inbound `anchor.html#*` deep
links existed (checked), so nothing breaks.

### Axis-mechanism findings (the per-axis table's evidence base)

Real carriers, read from `stampCarriers` (defaults.svelte.ts) +
`anchor.stylex.ts`:

- **density** — the only style axis the family's paint consumes: named
  lane → `densityRungOf` stamps `data-density="sm|default|lg"` on the nav
  (small/medium/large normalize via DENSITY_NAMED_ALIASES), which re-scopes
  `--jx-stack` / `--jx-hit` / `--jx-inset` / `--jx-text` / `--jx-line`;
  number lane → `--jx-density-coefficient`. Verified in SSR output
  (`data-density="sm"` / `"lg"` + `--jx-density-coefficient: 1`).
- **theme** — the other consumed axis: resolved dark → `class:dark` on the
  nav (SSR: `class="… dark"`), the §11 class bridge; never a style var.
- **size** — stamps `--jx-size-effective` + root font-size, but the labels
  read `--jx-text`/`--jx-line` (density channels), NOT em — so size does
  NOT rescale the rail. Documented as an honest callout ("scale the rail
  with density"); the carrier still supplies downward to nested consumers.
- **shape / radius / color / elevation / motion** — stamp-and-supply only:
  the rail paints no corners, no shadow, reads the semantic ink tokens
  directly (not `--jx-color-effective`), and its only transition is the
  fixed `--motion-150`/`--motion-ease-out` fade (no motion-kernel
  consumption). All five documented as documented absences — none invented,
  none silently omitted.

## Gates (log-file + $? discipline)

| gate | baseline | after | evidence |
|---|---|---|---|
| dev-smoke :5243 | — | PASS | vite PID 99454, `GET /docs/components/anchor.html` → 200 (939 KB SSR); markers probed: universal ×1, install ×1, see-also ×1, `npx jixoai-ui add anchor`, all six demo rails stamped exactly as their shown code |
| `verify:tailwindless` | GREEN | GREEN | receipt UNMOVED verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` (/tmp/scribe-anchor-tl-after.log) |
| `verify:docs-universal` | 110/110 | 110/110 | rebuilt dist first; anchor.html fresh (Sep 22 21:37) and carries the marker (/tmp/scribe-anchor-du-after.log) |
| `verify:docs` | green | green | hard lint + staged skeleton pass; see-also slice verified to hold component links |
| scoped svelte-check | n/a | see note | **svelte-check is not installed** in apps/www (no bin, no devDep). Scoped compile delta covered by: vite dev SSR render (200 + content probes) + full `npm run build` exit 0. Flag for the orchestrator: the skill §4 gate names svelte-check; the repo doesn't ship it. |

Processes: vite dev on :5243 started as PID 99454, killed by that PID
(`ps -p` → gone), `lsof -i :5243 -sTCP:LISTEN` → empty (exit 1);
`pgrep -f "vite dev --port 5243"` → empty. No orphans.

Working-tree footprint: exactly the two anchor files. (Working tree also
shows marginalia's accordion page edit and quill's untracked
blockquote.docs.ts — sibling in-flight work, not touched.)

## Learnings

- The eight axes are NOT uniformly real on a no-own family: "carries all
  eight lanes" (census) ≠ "consumes eight axes". The honest per-axis table
  splits consumed (density, theme) from stamp-and-supply-only (the other
  six) — that split IS the page's axis story, and it is verifiable in SSR
  markup (grep the nav attrs), not a matter of taste.
- DensityDemo was the wrong demo vehicle for the density axis: the anchor
  root stamps its own rung, so the rails demonstrate the axis directly.
- The old Theming card's TokenTable px defaults were unverifiable against
  the CSS (rung values are calc equations over --jx-unit); replaced with
  the honest form instead of copying numbers forward.
- Setup cost worth reusing: one SSR curl gives per-axis ground truth
  (`data-density`, the `dark` class, carrier styles) — cheaper and harder
  than visual judgement for "did the lane stamp".

## Follow-ups flagged for reviewers

1. The size-axis claim ("labels do not follow size; scale with density") —
   verify it matches the Owner's intent for §1; if size SHOULD rescale the
   rail, that is a family change (labels would need em), not a docs fix.
2. The axes demos' rails all target canvas fragments (#anchor-what /
   #anchor-pick / #anchor-vs-toc); several rails on one page each run
   their own scoped spy — intended (closest('nav') scoping), worth a
   reviewer glance.
3. svelte-check absence (gate mismatch, campaign-wide, not anchor-specific).

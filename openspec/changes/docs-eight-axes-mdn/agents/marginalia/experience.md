# marginalia — experience log

## Techniques (mine)
- **Per-axis honesty protocol (accordion, round 1; badge round 2)**: before writing any
  per-axis row, derive TWO facts from source and keep them separate:
  (a) what the family STAMPS (read the root's carrier join —
  `stampCarriersForLanes` + the class/attr bridges), (b) what the family
  CONSUMES (grep the family css/stylex for each carrier var). A lane with
  (a) but no (b) is broadcast-only — document it as supply, never demo it
  as a visual change. density+theme were the only painter lanes on
  accordion; radius is anchor-only (frame keeps `var(--radius)`).
  Badge adds the third fact: (c) the CASCADE WINNER when a stamp and a
  family rule compete (size's inline font-size beats the class voice —
  the label re-types; the box stays density's). Stamp+consume+winner.
- **Demo selection by visibility**: only demo lanes whose effect is
  CSS-provable on the family (density named rungs via the `data-density`
  scope swap; theme via the `.dark` class bridge; radius via the Card's
  §3 consumption calc). The query() demo rides density because media-key
  resolution flips a VISIBLE rung attr. Badge corollary: do NOT demo a
  lane whose effect is invisible (elevation/motion) — row it, don't
  stage it; and never let one demo carry two axes (the old badge page's
  `size={14} density="small"` conflated exactly the two lanes my table
  needed to separate).
- **Custom-property substitution timing**: `var()` inside a custom
  property substitutes at the DECLARING element. `--jx-text` is declared
  only in `:root`/`[data-density]` scope blocks, so a bare
  `--jx-density-coefficient` stamp matches no block and recomposes
  nothing on a family that declares no channels of its own. Named rungs
  make the scope block match the family root → recomposition there. This
  decides which density lane is demoable. Badge re-confirmed it and
  added the theme half: the hue slots' `:root, .jx-light, .dark` selector
  list makes the SCOPED .dark a co-declarer for exactly those four slots —
  which is why theme repaints tonal/fill but the outline ink (a :root
  stylex token) lags.
- **Skeleton lint as a hard gate**: every docs page needs exactly ONE
  `Usage` H2 (hard), plus Install/See-Also markers for the staged
  skeleton. Verify with `npm run verify:docs` after ANY page
  restructure — the H2 lives in SectionCard `title`, so retitling
  sections can silently delete the Usage H2. Badge addition: mount
  DocsInstall/DocsSeeAlso and REMOVE the route's backlog entry from
  scripts/docs-skeleton-scope.json in the same task (evidence-based
  re-pin) — the printed backlog list is data-driven from that file.
- **`query<{ Axis }, Axis>({ … }, base)` — BOTH generic args**: the
  single-arg form ships a real svelte-check error (B defaults undefined;
  the scribe-review law). Inline compound expressions in canvas children
  are extractor-safe INCLUDING generics (the F4 guard only flags
  sole-identifier refs; badge's
  `query<{ sm: DensityLane }, DensityLane>(…)` extracted and passed the
  same-source spec). The drawer then needs `'type { DensityLane }'` in
  the usageFile imports record.
- **Same-instant paint comparison (badge, NEW)**: the docs site rotates
  `--brand-hue` on a wall-clock runtime — cross-instant color comparisons
  produce confident false readings (my color-axis "paint mover" lasted
  one probe section before pass 1b killed it). Any probe asserting paint
  equality/difference must read both elements inside ONE evaluate.

## Learned from vellum (task 3 learning assignment — alert review)
- **The technique, extracted:** the axis-honesty probe — after coding OR
  reviewing a per-axis table, run a computed-style probe that asserts
  EACH row's claim (carrier strings in the style attr, computed
  font/corner/hit values, attr stamps, query() resolution across a
  viewport flip AND BACK, marker/row counts). Locator-by-title → one
  `evaluate` returning all facts → boolean checks. 17/17 beats
  "looks right", and review-side it converts "the table is plausible"
  into "the table is measured".
- **The meta-lesson behind vellum's three wrong source-read claims**
  (the family's own scaling comment; the rung table missing 2xs;
  query()'s min-width direction): prose AND tables lie — even
  generated-looking ones. Only live measurement is a receipt. A page
  that documents a number without "(measured)" is an unverified claim.
- **Applied in review 3 (alert):** my OWN probe on :5244 re-measured
  vellum's claims instead of trusting its 17/17 — rung pair 48/24,
  the FULL TokenTable ladder 24/28/32/40/48 (2xs/xs/sm/default/lg),
  concentric 20→6px with the banner's own corner at 8px, .dark
  bridge + an actual repaint delta, query() direction both ways —
  and added my declaring-element lens as the second lens: a bare
  `--jx-density-coefficient: 3` on the banner moves NOTHING (hit
  stays 40) while `data-density="lg"` re-declares --jx-hit (48).
  That lens found the one honesty gap vellum's probe couldn't see
  (its probe tested what the page DEMOS; mine tested what the page
  IMPLIES — see report 3, finding 2).
- **Process laws adopted from vellum's mistakes list:** kill the vite
  grandchild by its own PID + `lsof -i :port` receipt (applied this
  task — port 5244 left empty, no orphan); dist mtime must postdate
  the reviewed commit before trusting dist-based gates; `rg -n` only.

## Highlights found in others' pages
- **vellum's alert (review 3): measured-value annotations** — the
  TokenTable's `--jx-hit` row says `24 / 28 / 32 / 40 / 48px (2xs →
  lg)` and ends "(measured rungs)": the annotation is a contract that
  the number was live-verified, and it's how the old page's
  missing-2xs lie got caught. Adopt on accordion's token rows.
- **vellum's alert (review 3): the corrected-truth documentation
  pattern** — the size row documents what measurement showed AGAINST
  the family source's own comment ("the ambient reference … the
  fixed voices stay") instead of transcribing the comment. My
  declaring-element work on accordion reached the same posture from
  the CSS side; vellum's version pairs it with the probe receipt.
- **vellum's alert (review 3): PropsTable `title=""` custom rows** —
  the per-axis table rides the existing PropsTable with `title=""`
  (h4 suppressed) so the page keeps exactly ONE
  `data-jx-props-table-universal` marker with zero new machinery.
  Cleaner than any hand table; use for the next page's per-axis
  table.
- **quill's blockquote (review 2): the meta+docs curation lane** — API table
  renders from the GENERATED meta, union-text corrections + display defaults
  live in a `*.docs.ts` curation whose header carries the evidence for every
  override. Kills the stale-default drift class structurally (the old hand
  table shipped ruleSize '1' against the source's own 4). Accordion has NO
  generated meta yet — when the extractor covers it, migrate my hand-written
  API props literals (accordion page line 468) to `<PropsTable meta docs>`.
- **quill's query() drawer discipline** — inline compound expression in the
  canvas children (extractor-guard-compliant) + the `'{ query }'` binding in
  usageFile's imports record → the drawer is copy-paste-runnable AND one
  source with the live demo. My accordion keeps a hand-composed `queryDemo`
  template string beside the live demo — two sources that can drift. I
  commit to rehoming my query demo through `resolveRawCode('query')` +
  `usageFile` (deleting the hand literal).
- **quill's axes-summary honesty index** — "Three axes are consumed… five
  are supply-only — recorded per axis instead of silently omitted": the
  split counts up front, before the rows. Commit to adding the same index
  sentence to my accordion axes summary.

## Review-derived law (round 2, from quill's size row)
- **A carrier stamp has CASCADE WEIGHT, not just var supply** — the §11
  size stamp is `--jx-size-effective` AND `font-size: var(…)` INLINE
  (defaults.svelte.ts:575); a style attribute beats any layered/em-based
  family voice. Before documenting "the family's em voice rescales with
  the axis", check whether an explicit stamp CLOBBERS that voice (it does
  on blockquote: 0.875em rides only at auto; explicit size replaces it).
  The consumption grep alone is not enough — check the winner of the
  cascade between the stamp and the family rule.

## Mistakes to avoid
- **`rg -rn` is the replace trap** — hit it THREE times this session despite
  the law in context (third time: a reflexive bare `rg -rn ""` mid-investigation
  produced a 114MB log). `-r` = `--replace`; output mangles matches to the letter
  `n`. Recursive+line is plain `rg -n "pattern"`. Banned reflex: NEVER type
  `rg -rn` at all — even reading it back as "recursive" is the failure.
- **Don't trust W3-era demo copy**: the old universal card demoed
  `size={18}` with "the whole disclosure set scales" — contradicted by
  the family CSS. Trust computed CSS facts over shipped prose. Badge
  added the inverse: don't trust MY OWN prose either — my "2xs … 18px
  box" caption was bad arithmetic (line 12.5 + 2×1px hairlines = 14.5)
  and the probe caught it before review did. "(measured)" annotations
  are a contract the probe must enforce row by row.
- **Retitling sections can break lints**: removing the Usage H2 hard-
    failed docs-structure. Run the structure lint immediately after
    restructure, before polish.
- **A missing canvas `id` fails at runtime with the extractor's named
  error** ("no canvas with id X — the page ids are: […]") — name every
  ComponentCanvas that resolveRawCode reads BEFORE first render; the
  error message names the fix, so read it instead of guessing.

## Upgrades applied back to my pages
- (accordion IS the first page; the techniques above ARE the upgrade —
  apply the per-axis honesty protocol to badge/figure/card when their
  turns come)
- Badge (task 4) DISCHARGED three of my logged upgrade commitments on
  its own page — the accordion copies stay DEFERRED until its two
  in-flight reviews land:
  - quill's meta+docs curation lane → badge is now
    `<PropsTable meta={badgeMeta} docs={BADGE_DOCS} />` with
    badge.docs.ts (badge.meta.ts existed, so the migration landed with
    the rewrite; accordion has no generated meta yet — still waiting).
  - quill's query() drawer discipline → the query case is an inline
    compound expression in the canvas children + the `'type { DensityLane }'`
    and `'{ query }'` bindings in usageFile's imports record; my
    accordion hand-composed `queryDemo` template is still the two-sources
    debt to rehome later.
  - quill's axes-summary honesty index → badge's axes summary opens with
    the consumed/re-typing/supply-only counts; accordion's summary still
    owes the same sentence.

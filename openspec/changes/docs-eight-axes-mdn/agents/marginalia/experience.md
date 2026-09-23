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

## Task 5 (accordion fix round, 2026-09-22) — learnings
- **The F4 rejection classes are a positive selection tool, not just errors.** A
  canvas whose stage carries page-state ({exclusive}/{ghost} shorthand identifiers)
  CANNOT take an id — that's the documented registry/density-2xs class. The honest
  fix for vellum's FAQ-drawer drift was therefore two-sided: label the hand mirror
  by its file name (`accordion-faq.svelte`) + regenerate its CONTENT from the
  stage's copy, and say in a comment WHICH surface is which. Don't force an id onto
  a state-bearing stage and don't leave the mirror pretending to be the other
  surface.
- **The theme-split grep is source-level, no dist needed**: one look per voice at
  its declaring selector list — raw shadcn tokens re-declared under plain `.dark`
  (jixoai.css:269 block) flip at a component `.dark`; `tokens.stylex.ts`'s
  `stylex.defineVars` map (:207) is the frozen layer by construction (the ledger's
  `:root, .xbpgcew` emission). My fix-round probe then confirmed vellum's B1 values
  byte-for-byte in ONE evaluate (summary ink === card ground === oklch(1 0 0) — the
  white-on-white receipt as a passing assertion).
- **svelte-check delta attribution under a shared tree**: sibling tasks run
  concurrently and move the workspace total (this round: my −1 cancelled by the
  cascader task's +1). The honest ledger is the per-page by-file diff
  (`grep "^/Users.*svelte:" log | sort | uniq -c` on both runs), plus git-status
  attribution for the sibling's files. Page-local count is the machine-verifiable
  contract; never quote the workspace total as your delta.
- **Joining the same-source lane means joining the PILOTS**: ids + resolveRawCode
  without a PILOTS entry leaves the drawers ungated — that's how badge (my task 4)
  escaped the drift gate. Accordion joined this round (5 snapshots, `-u` once then
  green); badge flagged for the orchestrator.
- **Probe locator law for stylex pages**: `rt.panel`/`rt.mt20` are hashed in the
  DOM — locate by text content + `.parentElement`, never by utility class name; and
  code samples in SSR carry escaped `<` (`query&lt;{ sm: DensityLane }…`), so
  drawer-parity checks must match the escaped form. Three false FAILs this round
  were exactly these two; the page was clean.
- **Discharged on accordion**: quill's query() drawer discipline (inline compound +
  imports record — the two-sources debt DELETED, not deferred) and quill's
  axes-summary honesty index ("The split, counted: …"). Still deferred: meta+docs
  curation (accordion has no generated meta — extractor coverage is the
  batch-close item).

## Task 6 (badge fix round, 2026-09-22) — learnings
- **A filter over a COMPOSED array eats the appended lane too.** The universal
  split (`UNIVERSAL_AXIS_NAMES`) filters `propsFromMeta(meta, docs)` — which is
  meta rows PLUS `docs.extra` — by name. So the extra lane (the documented
  rescue path) silently re-collides for any extra row sharing an axis name.
  The general lesson: when a "rescue lane" appends into an array that a
  downstream filter sweeps by predicate, the rescue needs an exemption AT THE
  FILTER (here: reference identity against `new Set(docs?.extra)`), not just
  in the curation's intent. Fixed in props-table.svelte; chip's rescue — dead
  since 1783878f — revived as a side effect.
- **The prescription-vs-outcome gap**: vellum's review prescribed the right
  curation move and my task text demanded "verify by SSR row-parse (the row
  must RENDER)" — that one clause is what converted a would-be second dead
  rescue into a component fix. Reviewers verify by reading source; coders
  must verify by rendering. Any "row renders / doesn't render" claim needs an
  SSR table-parse receipt, the same way "(measured)" needs a probe receipt.
- **Probing unregistered custom properties**: `getComputedStyle().getPropertyValue`
  on an unregistered custom property does NOT give you the resolved px —
  bind the channel inline (`el.style.fontSize = 'var(--jx-text-secondary)'`)
  on a probe element inside the `[data-density]` scope, then read the
  computed font-size. That's how the five-rung text ladder got its real
  values (2xs 10 / xs 10 / sm 11 / default 12 / lg 14 — the source calc
  `max(0.625rem, T_rung − 1px)` confirmed live).
- **Shared-tree gate noise → attribute, don't retry-blind**: this round's
  reds (tailwindless parse error, checkbox placeholder snapshot,
  component-canvas ambient-vocabulary row) were all parallel agents'
  mid-flight files. `git status` + the failing test's own filesystem reads
  attribute every one. Retry only after attribution says the flake isn't
  structural; never `-u` over another agent's placeholder snapshot.

## Task 7 (breadcrumb review round, 2026-09-22) — learnings
- **The menu's ink is TWO voices, and the panel-level read lies.** My probe
  read the popover panel's `color` (the `.jx-menu` CSS rule's raw
  `--popover-foreground` — flips under `.dark`) and nearly reported "the
  composed menu re-themes". The ITEM ink rides a frozen stylex voice
  (dropdown-menu.stylex.ts:43) — my own probe's `itemColor` stayed BLACK
  under the dark toggle, corroborating vellum's dist grep only after I
  re-read my own payload. Law: for composed consumers, probe at the level
  the READER sees (the item), not the level the CSS rule lives at (the
  panel); one element's computed color is not a subtree's theme story.
- **"Complete" needs a denominator.** Vellum called breadcrumb's toc
  complete (8/8 ids in DOM — true, toc↔DOM 1:1); I called it incomplete
  (See also missing vs the badge/alert cohort — also true). The cohort was
  SPLIT (anchor/blockquote omit it too), so both claims were true under
  different denominators. The residue that survives every denominator: the
  DocsSeeAlso wrapper carries no id anywhere in the no-entry half —
  unreachable from the rail is a DOM fact, not a convention. State the
  denominator, then check what's invariant across all of them.
- **Casing conventions: check the nearest sibling before filing a NIT.** My
  toc-label-case nit died in one grep — anchor's toc uses the same
  lowercase demo-label pattern. Sibling-first, cohort-second, self-last.
- **Read my own probe payload twice before writing the claim.** The
  itemColor-black-in-dark was IN my first menu probe's output and I
  almost filed the menu as re-themeing because the panel flipped. The
  consolidation law works only if the pre-cross-read report records the
  raw measurements, not the narrative — the payload kept me honest.
- **The independence law pays twice**: writing findings first forced me to
  derive the theme split empirically (my BLOCKER), catch the gap channel
  and the "generated" wording miss that vellum lacks; the cross-read then
  killed two of my weak findings (casing, toc denominator) and upgraded my
  query() inference with vellum's scribe-self-reported error receipt.
  Divergence isn't failure — two reviewers with different denominators is
  the redundancy that catches the un-provable-by-one-check claims.

## Task 8 (checkbox review round, 2026-09-22) — learnings
- **A loose regex can false-PASS the exact thing you're checking.** My SSR
  check for "the wrapped-contrast wrapper carries the stamps" matched an
  unrelated axes-canvas div and printed PASS, while the actual contrast
  cell carried nothing (quill's MAJOR-1, confirmed by re-grepping MY OWN
  capture post-cross-read). Law: an existence probe must anchor on the
  element's identity (its name attr / its section), never on a shape
  pattern any div could satisfy; and after a cross-read reveals a false
  PASS, re-grep your own capture before conceding — the evidence was
  already in hand, the query was wrong.
- **Verify the DECLARATION, not just the read.** I confirmed
  `var(--corner-shape, bevel)` reads existed and let "the site's token"
  slide; quill grepped for the declaration — none exists, the fallback
  always wins. Symmetric law to consumed-vs-supply: a "reads token X"
  claim needs X's declaring line, or the honest wording is
  "undeclared seam, fallback wins".
- **The co-stamped coefficient is LIVE at the rung scope** (setting 3 on
  a real lg wrapper → box 24→72px): the kernel's pin at 1 is what makes
  "explicit rung = exact rung" true. The number lane is inert only
  because no scope block matches it. When documenting a two-half stamp
  story, probe whether the halves INTERACT at the declaring scope —
  mutually-exclusive-looking stories are often coupled there.
- **Positive-control discipline held**: every inertness claim got a
  movement control on the same harness (rung attr → 24/48; stripped →
  20/40 unmoved under a 1.5→3 sweep). The control is what makes the
  inert receipt meaningful, and what let me hand quill's 3b receipt a
  DOM-level half.

## Task 9 (cascader review round, 2026-09-22) — learnings
- **BANKED — the co-stamp law, now with a two-page receipt**: named-rung
  wrappers stamp `data-density="…"` AND `--jx-density-coefficient: 1`,
  and the pin is LOAD-BEARING — the coefficient is live at the rung's
  declaring scope (checkbox probe: 3× on a real lg wrapper → box
  24→72px). The number lane alone is inert only because no scope block
  matches it. Cascader's density row carries the same omission as
  checkbox's (the caption names the co-stamp; the row doesn't) — when
  the cascader fix round lands, add the one-clause pin mention. Model
  wording: "the rung's wrapper co-stamps the coefficient pinned at 1 —
  the pin is what keeps the rung exact; the number lane alone, with no
  rung scope, is the inert case."
- **TokenTable is Token | Default | Source — `description` never
  renders, and `structural` maps to an empty source label.** Every page
  writing token descriptions into that field is writing unreachable
  prose; all-structural tables (cascader's fixed-paint receipt table)
  render a visibly blank column. Check the COMPONENT's render contract
  before trusting a curation field — the type accepting a field is not
  the component rendering it (the props-curation cousin of 策展覆盖≠渲染).
- **Entity-encoding is asymmetric in SSR text**: `query&lt;{ … }` — the
  opening `<` entity-encodes, the closing `>` stays raw. Byte-greps for
  generic-including text must encode only what the serializer encodes;
  my first grep demanded `&gt;` and false-FAILED a claim that was
  served correctly (the inverse of the checkbox false-PASS: both
  directions of grep sloppiness bite).
- **The −4° hue drift is the invariant, not the absolute hue**: the
  wall-clock brand-hue rotation means ring/fill hue readings differ per
  instant (quill 142→138, me 190→186). Any probe asserting a drift
  claims the DELTA inside one evaluate, never absolute values across
  instants — third time this law paid (color axis, theme split, ring).

## Task 10 (chip review round, 2026-09-22) — learnings
- **A micro-fix review re-runs the RECEIPTS, not the whole audit.** The
  chip round: verify the corrected ladder in served bytes (new string
  present, old string ×0), re-run the negative greps the new receipt
  rows cite, re-parse the regression surface (the 12-row EXTRA-lane
  table), and live-measure only the numbers the fix touched plus the
  flip probes. Full re-derivation of unchanged claims would burn the
  budget without adding information — the prior review's PASS stands
  unless the fix's blast radius touches it.
- **Run the cited grep before accepting a receipt-form row.** The
  radius/color rows now SAY "grep receipt: zero readers" — the form is
  only honest if the grep reproduces; mine did (0 hits, all four
  carriers). A receipt claim is itself a claim: re-derive it, cheaply.
- **Read the prior reviewer's adjudications with their evidence, not
  just their findings.** I flagged chip's bare `query({ md: 16 }, 14)`
  as a consistency deviation; vellum had already adjudicated it
  compliant with a type-check receipt (the §6 ruling governs explicit
  lists; both params infer here). The consolidation deferred to the
  better evidence — a NIT that a prior receipt disproves should die,
  not survive as style disagreement.

## Task 11 (component-canvas review round, 2026-09-22) — learnings
- **The W-next #3 dead-column law now has a third instance and a shape**:
  TokenTable renders Token | Default | Source only; `description` never
  renders, and `structural` source maps to an empty label — so
  all-structural receipt tables (cascader's fixed-paint table,
  component-canvas's fixed-voice table) show a visibly blank column and
  write their evidence into the void. The reviewing posture that works:
  confirm the RENDERED cells are honest at their granularity, confirm
  the dead prose matches source (the css receipt), and file the
  instance under the already-ruled component debt instead of demanding
  a per-page fix the component owns.
- **Documenting-consumer pages flip the grep direction.** component-canvas
  legitimately READS `-effective` carriers (its specimens + §3 anchor
  pins are the demo), so a fleet-wide "zero effective readers" grep
  would false-accuse. Scope consumed-vs-supply greps to the family's
  own paint files (css + the family stylex) and treat the docs page's
  carrier stamps as the instrument, not the claim.
- **A table-arity receipt catches rescue arithmetic**: family rows =
  meta props − split axis lanes − name-filtered seats + extra re-adds
  (component-canvas: 27 − 6 − 2 + 2 = 21, parsed exactly). The arithmetic
  turns "the rescue renders" into "the rescue renders and nothing else
  moved" — the same upgrade quill's 11→12 chip count made; do it on
  every EXTRA-lane page.
- **TRANSITION-FRAME (LAW #14) closed my task-7 observation**: the
  cascader menu's you-are-here paint "not flipping" under the dark
  toggle was the 100ms background/color transition's start frame —
  synchronous computed reads return it. Post-law probe discipline: for
  any transition-bearing claim, await > duration before the after-read
  (or assert the start frame deliberately). My probe's bytes were
  honest; the frame was the lie.

## Task 12 (breadcrumb re-verify round, 2026-09-22) — learnings
- **LAW #14 executed end-to-end on my own overturned finding**: with the
  250ms await, the you-are-here background read 0.9551 → **0.2178** —
  scribe's deterministic number, now reproduced under my own probe. The
  trail stylex inks stayed frozen at 0.3211 in the same evaluate. A
  re-verify that overturns your own observation is the strongest
  closure there is: the law predicted both the original artifact (start
  frame) and the steady-state truth, and both predictions landed.
- **Re-verify economics**: per-finding verification targets the DIFF
  (each finding's claimed fix, checked in served bytes + live), plus a
  spot-check quota over the prior review's receipts (3 of 5 here) and
  the three gates. Everything else inherits from the prior PASS table
  unless the fix's blast radius touches it. The full re-derivation
  instinct is how reviews balloon; the diff-targeted instinct is how
  they close.
- **Gate reds under a shared tree get one attributed retry**: the
  tailwindless RED listed 30 violations all on one sibling's mid-write
  page (`empty.html`) — attribution by reading the violation paths, one
  timed retry, GREEN with the receipt verbatim. The retry is justified
  by the attribution, not hope.

## Task 13 (date-picker review round, 2026-09-22) — learnings
- **Assert polar invariants, not raw oklch strings.** My hue regex
  returned null on `oklch(0.7044 0.1872 calc(256 - 4))` — the kernel
  composes hue as calc() under the wall-clock rotation, so a naive
  `oklch(L C H)` parse dies exactly on the interesting tokens. The
  stable assertions are L and C (0.7044/0.1872 dark vs 0.6489/0.237
  light) plus the −4 offset read from the raw string; the absolute hue
  is wall-clock noise. Vellum had banked this lesson a round earlier —
  reading sibling experience files before probing would have saved the
  miss.
- **One cell, two formulas is the sharpest THEME-SPLIT receipt shape.**
  Reading `--primary` (raw, flips) and `--jx-primary` (alias, frozen) on
  the SAME element removes every confound — no sibling matching, no
  cross-element comparison. The measured pair (dark formula vs light
  form at one node) is the strongest possible evidence for the split
  rows; prefer same-element dual-token reads over two-element
  comparisons wherever a split claim exists.
- **Min-height lanes: measure the floor, cite the floor.** The rendered
  box overshoots its min-height whenever content is taller (my probe:
  58/70px rendered over 40/48px floors) — a row that says "the box
  steps" is directionally true but the exact claim is the floor.
  Quote the min-heights; say "floor" if floor is what the law sets.

## Task 14 (checkbox re-verify round, 2026-09-22) — learnings
- **A co-stamp law's full lifecycle, observed**: task 8 discovery (the
  pin is live at the declaring scope, ×3 = 24→72px) → task 12 banked →
  task 14 the fix round quotes my probe number AT THE CLAIM SITE and
  puts the wording in the rendered Default cell (respecting W-next #3's
  dead-description ruling). The lesson: when a finding lands a probe
  NUMBER, the fix can cite the number — reviewer-provided evidence
  becomes page content, the strongest fix class.
- **An id-less canvas can be the honest posture**: the form canvas stays
  outside the same-source lane because its payload is page state
  (F4-rejected for extraction) — with the rationale IN THE REVIEW
  RECORD. Partial same-source coverage is acceptable when each gap is
  either declared (chip's mirrors) or reasoned (checkbox's form canvas);
  it was the UNdeclared drift that was the MAJOR.
- **Count-check greps must model the compiled/runtime form**: my
  "stage+drawer ×2" expectation for `cx(rt.col16)` failed because the
  stage COMPILES the call into hashed classes — only the drawer's code
  text carries the literal. The same discipline as the asymmetric
  entity-encoding: model what the served artifact actually contains
  (attribute markup compiles; code-view text encodes) before counting.

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

## Task 15 — dropdown-menu review (2026-09-22)
- **Anchor-name targeting beats label-text search on demo-heavy pages**:
  the level4 demo trigger is labeled "Open" and four UNRELATED buttons
  carry the text "level4" — my label-based probe clicked a wrong button,
  found the still-open level2 panel, and read two DIFFERENT panels as one
  identical stamp (a false "level4 demos level2" almost formed). Target
  `[data-jx-menu-trigger]` / `span.jx-menu-anchor[anchor-name: …]`, never
  `button` by text, when a page ships many demo buttons. Corollary: an
  open popover found by `:popover-open` may be a PREVIOUS step's panel —
  close or re-scope between opens, and sanity-check the panel's
  `position-anchor` matches the intended demo.
- **The [popover] platform element paints nothing BY DESIGN**
  (jixoai.css `.jx-surface { background: none; border: none }`) — bezel
  fill, seam and box-shadow live on the `.jx-surface-body` child
  (`var(--jx-elevation-surface, var(--jx-surface-solid-fill,
  var(--popover)))` + `var(--jx-elevation-shadow, none)`). Any
  theme-split or elevation probe that reads the popover root gets
  rgba(0,0,0,0)/none and may mis-conclude "unthemed".
- **A family that stamps its own elevation ladder never resolves the
  --popover fallback**: dropdown-menu's own level2 default always emits
  the stamp, so the panel fill rides `--jx-elevation-level2-surface` →
  `--surface-container-low` (0.96 light / 0.185 dark), NOT --popover
  (dark --popover = 0.3211, kept above the ladder by design). Theme rows
  that attribute the fill to "--popover raw read" are mechanism-wrong
  even when the flip outcome is right — the measured dark fill value
  (0.185 ≠ 0.3211) is the discriminator. Also: the elevation shadow
  recipes re-declare under `.dark` as WHITE recipes (hsl(0 0% 100%/.16))
  — a visible flip easy to omit from a FLIPS enumeration.
- **grep pitfall (recurring family)**: `grep -o "--jx-hit" *.svelte`
  parses the pattern as a FLAG → silent 0 hits that look like zero-reader
  receipts. Use `grep -o -e "--jx-hit"` (or `--`). My first zero-reader
  sweep was all-invalid; only the `-e` re-run produced real receipts.
- **Composer claims die by import grep**: "menubar panels and
  navigation-menu mount dropdown-menu" was false at every layer
  (component import, demo nesting) — menubar's own header documents
  deliberate duplication ("registry items stay independent, no hidden
  coupling") and navigation-menu's says "actions belong to
  dropdown-menu". When a page names composers, run the import grep per
  name; sibling-family headers often state the true relationship.

## Task 16 — avatar review (2026-09-22)
- **Inline beats class: the §11 carrier echo kills "fixed voice" claims.**
  `stampCarriers` (defaults.svelte.ts:570-576) emits `font-size:
  var(--jx-size-effective, 1rem)` INLINE on any family root with an
  explicit size lane — an inline declaration overrides the family's
  stylex `fontSize` atom. So an avatar's initials measure 14/16/18px at
  the named steps and the BOX EDGE (48px/28px) on the number lane, while
  the page claimed a fixed 12px label-lg step "at every size". Only the
  AMBIENT path (no explicit lane → no stamp → class wins) holds a fixed
  voice. Rule: before crediting any "fixed step/voice" row, read the
  family's carrier-stamp helper AND measure the EXPLICIT lanes — ambient
  alone lies.
- **Measure overflow, don't infer it**: the 48 avatar renders "AL" at
  48px font in a 46px content box — scrollWidth 52 > clientWidth 46,
  clipped (the meta's "never overflows" falsified on the number lane).
  `scrollWidth > clientWidth` on the live element is the receipt;
  visual inspection of a headless screenshot would not have caught a
  6px clip reliably.
- **Carrier-stamp comments are not reads**: avatar.svelte:87 mentions
  `--jx-size-effective` in a doc comment — a naive grep counts it and
  breaks a zero-reader receipt. Grep hits need their context classified
  (comment vs declaration vs read) before they enter a receipt.
- **Caption-anchored probe locators must anchor on the text PREFIX**: a
  canvas's description paragraph ("…one real query() case…") contains the
  caption word too; `find(p => text.includes('query()'))` matched the
  description, walked up to the grid, and returned the FIRST panel's
  avatar — a wrong-element read that looked plausible (24px). Anchor on
  `text.trim().startsWith(caption)` or the full caption string.

## Task 17 — empty review (2026-09-22)
- **The emission-form law's live receipt**: the typed intermediates emit
  at `:root, .xbpgcew` inside `@layer components.stylex.priority1` with
  var(--raw) values — scan `document.styleSheets` (walk nested
  cssRules, guard CORS) rather than the SSR bytes: in dev the stylex
  emission is NOT in the served HTML, only in the runtime stylesheet.
  A substring search for `jx-border` (no colon) finds it; my first scan
  searched `'--jx-border:'` with a length-based early break and
  returned an empty array that looked like "no emission".
- **Clone-stamp probes must not mutate the control variable**: testing
  the density NUMBER lane by cloning the sm figure and REMOVING its
  data-density measured the rung removal (sm → ambient: 16→24px pad),
  not the coefficient. The correct control is the AMBIENT figure (no
  rung attribute) + the coefficient stamp — byte-identical before/after
  is then the inertness receipt. My first attempt produced a false
  "densityInert: false" that a careless read would have filed as a
  page finding.
- **A leaf family can be echo-safe**: the §11 size echo lands on
  empty's root too, but every visible text descendant sets its own
  font-size atom (term/zero inherit the art's var(--jx-text)), so
  SUPPLY-ONLY stays true in effect — unlike avatar, where the fallback
  had no font-size of its own. "Does the echo change anything visible?"
  is a per-family question; the answer is in the descendant atoms, not
  the stamp.

## Task 18 — dropdown-menu re-verify (2026-09-22)
- **Filter-pattern self-exclusion**: `grep … | grep -v "dropdown-menu/"` to
  exclude the family's own dir also excluded every HIT (the import string
  itself contains `dropdown-menu/`) — a sweep that silently returned zero
  and looked like "no importers". Rule: exclusion patterns must never
  share substrings with the sought pattern; scope by directory instead.
- **Anchor-name inventory BEFORE probing**: pulling every
  `anchor-name: --jx-menu-*` from the SSR first (`-t-dark`, not the
  guessed `-theme-dark`) turned the dark-island probe from a miss into a
  one-shot. Guessing name shapes from page prose is the residual failure
  mode; the SSR is the name registry.
- **Quoting discipline for pages that quote source headers**: quill's fix
  quotes menubar/navigation-menu headers — every quoted fragment
  ("duplicated deliberately…", "an independent thin coordinator",
  "actions belong to dropdown-menu") was grep-verified real before the
  re-verify PASS. A fabricated quote would have been a new MAJOR on the
  fix commit itself.

## Task 19 — avatar re-verify (2026-09-22)
- **The re-verify benchmark is your own probe log**: vellum's reworded
  rows quoted my task-16 numbers (12/14/16/18/48/28, 52/46, 30/26) and
  every one reproduced on the current tree. Filing exact numbers (not
  "clipped") in a review is what makes the fix machine-checkable — the
  re-verify becomes a diff against your own log.
- **Entity-encoding asymmetry strikes in both directions**: "52 > 46"
  serves with a RAW `>` (only `<` is encoded) — a `&gt;`-form grep
  returns 0 and looks like the fix didn't land. When a byte check
  fails, try the raw form before concluding absence.
- **svelte-check page-scope**: `npx svelte-check --workspace apps/www
  --output machine` from the REPO ROOT; filter diagnostics by path
  fragment ("avatar.html" for the docs page — "avatar" alone catches
  the family component's pre-existing warnings). Fleet totals (1622/
  1623) drift on a shared tree; page-scoped zero is the only stable
  receipt.
- **"Zero diagnostics" claims decompose**: page zero ✓ while the family
  component keeps its 2 documented pre-existing errors — both true,
  different scopes. A fix claim of "page zero" is satisfied even when
  `grep avatar` hits the family file; scope the grep to the page path.

## Task 20 — button-group review (2026-09-22)
- **Provider families move the measurement target**: the group stamps,
  the COMPOSED buttons consume — so the density ladder is read off the
  BUTTONS (height/font), not the wrapper; and a channel is "read" if any
  composed consumer reads it (press-button's paddingInline var(--jx-inset)
  is a density channel of the GROUP's row). Enumerating "the lanes the
  joined buttons read" requires sweeping the consumers' atom tables, not
  the family's own files — my third channel-list miss caught (dropdown
  size echo, avatar voice, button-group inset) all share the shape: the
  enumeration lived in one file while the reads lived in another.
- **Stamp-the-rung-attribute to reach undemoed rungs**: a page demos only
  default+lg; the xs/sm rungs measure fine by setting data-density on a
  live clone (the attribute IS the mechanism the named stamp writes).
  Same for the number lane (coefficient inline) — but always on a clone,
  never the pinned specimen.
- **W7 scroll verdicts are JS-stamped strings** (data-jx-scroll-state=
  "start-closed") — read the stamp first, then the chrome displays;
  chevron chips are aria-label'd ("Scroll actions backward/forward"),
  not class-found. Overflow numbers are viewport-relative — always pair
  scrollWidth/clientWidth with the viewport you measured at.
- **Dead CSS detection**: a class count in the SERVED CSS is not a DOM
  count — .jx-btngroup-veil-layer appeared ×2 in the page bytes (the
  stylesheet text) and ×0 as elements. Grep the stylesheet AND query the
  DOM separately; the difference IS the dead-rule receipt.

## Task 21 — image review (2026-09-22)
- **Snippet-vs-default branches have DIFFERENT failure surfaces**: image's
  `{#if failed && fallback}{@render fallback()}` renders consumer markup
  BARE — no data-jx-image-broken panel, no data-density stamp. A query()
  demo that provides a fallback snippet cannot demonstrate "the broken
  panel's stamp moves" (measured: data-density null at both viewports).
  When a caption names an element, check the demo's chosen branch renders
  that element.
- **PROBE-READINESS loop**: a fallback-slot probe cannot scroll to its
  own slot text before the slot exists (the span renders only after the
  swap). Anchor on the always-present canvas title (or warm the whole
  page by scrolling every img into view first), wait for the swap, then
  locate. My probe2 crashed on exactly this; probe5 landed the receipt.
- **The 110-gate counts the hand lane too**: PropsTable's bare `universal`
  directive emits the same data-jx-props-table-universal marker as a
  meta-driven table — docs-universal GREEN 110/110 includes hand-table
  pages. Hand tables can be honest: match rows to the real interface and
  render axis rows from the shared schema.
- **Fixed-paint TokenTable pattern**: rows with no source column (every
  fact in the Default cell) sidestep the W-next #3 structural-label gap —
  image's paintTokens are the model.

## Task 22 — color-picker review (2026-09-22)
- **Regex blind spots on generated meta — twice**: `[a-zA-Z][a-zA-Z0-9]*`
  misses hyphenated keys ('data-density', 'aria-invalid') AND a naive
  `{`-depth matcher truncates on braces inside strings. A string-aware
  matcher plus a hyphen-inclusive key regex turned "21 entries, no
  hidden" into "24 entries, the quoted trio present once" — which
  falsified the recorded "27 meta − 3 citation dupes" head while
  CONFIRMING its result (24 − 8 − 4 = 12). Arithmetic chains in review
  notes must be re-derived from the artifact, not re-quoted; the result
  being true does not make the intermediate counts real.
- **Component roots nest**: color-picker's `.jx-field` class appears on
  the stamped root AND inner wrappers — classify candidates by
  `hasField` before reading, or getComputedStyle(null) crashes the
  evaluate. Same family, two elements, two different claims: the well
  floor + shadow live on the inner trigger span, the carrier stamp +
  data-density on the outer root — read the css selectors to learn which
  element owns which claim before probing.
- **Wall-clock hue, handled end to end**: the caret flip was asserted as
  the dark formula's L/C signature (0.7044/0.1872 — stable) + the −4°
  drift (357→353 measured in one evaluate), never absolute hue. The
  page prose was checked numeric-free the same way. The pairing of
  "prose claims no absolute hue" + "probe asserts signature+drift" is
  the reusable pattern for every --primary-flipping surface.

## Task 23 — carousel CODE (2026-09-22)
- **CODE tasks want the probes BEFORE and AFTER**: probing the served
  family on the OLD page first fixed the axis story while it was still
  cheap (the density token rows were falsifiable — --jx-icon/--jx-hit
  documented, zero reads — and the theme story turned out FROZEN, the
  opposite of button-group's raw-shadow FOLLOWS). The emission-form grep
  + a clone probe decided it: typed intermediates freeze, raw tokens
  follow — two families, one shadow token apart, opposite verdicts.
- **The ambient matrix only covers the tasksUniverse** (the env-debt-
  cleanup batches A/B): a page outside those 23 routes needs NO matrix
  re-pin for its hand axes table — carousel's density/size rows are
  invisible to candidateKeys. Check AXIS_PROPS ({density, variant, tone,
  material, size}) AND tasksUniverse membership before hand-wringing
  about pins.
- **A transient 500 is a compile-in-progress; a persistent one is
  real**: the first fetch after a big rewrite raced the compiler. The
  second 500 was real (dropped PlayFields import) — svelte-check named
  it in one run. Triage order: refetch → svelte-check → dev log.
- **PILOTS -u flow**: add the route to PILOTS + two it-blocks with EMPTY
  toMatchInlineSnapshot(), run vitest -u once (snapshots fill), then a
  clean run to prove stability. The extractor keeps cx(rt.…)/inline
  styles verbatim — static stages with rt atoms extract fine.

## Task 24 — hero-section ADJUDICATION (2026-09-22)
- **PROBE MEDIUM IS PART OF THE CLAIM**: the same page, two instruments,
  opposite verdicts — raw SSR showed the §9.1 unconditional light base
  (no .dark anywhere in the section tag), the hydrated probe flipped
  both directions (dark 0.7044 0.1872 ↔ light 0.55 0.12, tracking
  matchMedia). vellum's MAJOR was a true observation from a blind
  instrument. LAW #16: flip claims require hydrated probes; every probe
  report names its medium. An adjudicator runs BOTH instruments before
  ruling — the disagreement itself was the diagnosis.
- **The wall-clock hue showed up inside a single adjudication**: the
  caret/accent hue read 27 → 56 → 57 across three reads two resize-cycles
  apart — absolute hue never survives even one probe session. L/C
  signatures + class state + drift only, every time.
- **Carousel authored (task 23, same session)**: probe-before/after on
  CODE tasks; the frozen-pole-vs-follows verdict is decided by the
  emission-form grep (typed intermediate freezes, raw token follows) —
  one shadow token apart gave two families opposite theme verdicts.

## Task 25 — descriptions 2nd review (2026-09-22)
- **CSS-Nesting stylesheet-walk trap**: every CSSStyleRule exposes `.cssRules` (nested-rules list, usually empty), so a `if (r.cssRules) { walk(...); continue; }` census silently skips scanning EVERY style rule — census returned {} against a fully-painted page. Walk must recurse AND scan each rule's own cssText/style. Also: `document.styleSheets` excludes `adoptedStyleSheets` — walk both.
- **Wrong-element border read**: the dd "flipped" black→white under .dark — but the dd has border-bottom-WIDTH 0; the real edge is the CELL div's `cellBordered` (frozen via --jx-border). The white was the universal `* { border-color: var(--border) }` canvas reset on a 0px border. Read the box model BEFORE reading colors: a 0px edge has no paint to falsify anything.
- **Control-variable rule for clone stamps**: stamping coefficient 3 on a clone that KEPT data-density="default" measured 36/39/36 (named-rung × coefficient DOES scale) and nearly falsified the inertness claim. The real number-lane state (coefficient WITHOUT a rung attribute) is inert. Never mutate the control variable mid-experiment.
- **Demo rigs need container-type**: a @container law fires against the nearest ancestor CONTAINER — a wrapper div with only `max-width` is invisible to it, and as a flex item its min-width:auto floor pins it to the content's min-content, so the "drag to fold" demo painted nothing while its output chip claimed the fold. When reviewing interactive demos, drive the REAL control (PlayRange setter + input event) and compare the chip against the paint.
- **BOARD shorthand vs page anchors**: "#see-both" in the dispatch/BOARD was shorthand for the #install+#see-also restore; grep the SSR for the literal anchor before treating a BOARD phrase as a page claim.
- **Custom-property freeze mechanism (pinned)**: var() inside a custom-property value substitutes at the DECLARING element's computed value; descendants inherit the resolved literal → typed aliases freeze under .dark islands; direct raw reads at the element flip. Census receipt: aliases at `:root,.xbpgcew` + the doubled stylex theme class only.

## Task 26 — code-card 1st review (2026-09-22)
- **`:where()` token stacks arbitrate by ORDER, not by intent**: base/dark/jx-light token re-declaration blocks all zero-specificity in one layer — the LAST matching block paints. A page-level stage class (jx-light canvas) silently routes the re-flip; a wrapped `.dark` probe on that stage measures the re-flip path, not the dark block. Lift the stage (and restore!) to measure the clean scope before attributing formulas to a re-declaration block. Two-media receipts or the attribution is guesswork.
- **Custom-property computed values resolve var() at the DECLARING element** — the receipt shows `--tok-token-keyword` computed to `oklch(0.7044 0.1872 calc(40 - 4))` with the −4° drift arithmetic live inside the computed value. Computed custom props are resolved literals, not token streams.
- **Client-highlighted pages have empty SSR pres**: shiki span counts are hydrated-DOM receipts — name the medium (LAW #16 extends to "served" wording, not just viewport flips).
- **Gaps-only review form**: audit by integration diff (what the commit touched vs left) + confirm the canon sections untouched; the toc vs section count can legitimately differ (toc 10 + install + see-also = 12 sections) — reconcile before flagging.

## Task 27 — badge-indicator authored (2026-09-22)
- **The §11 echo follows the ROOT boundary, not the component boundary**: the same axis (size) is inert on a wrapped chip (mirror on the wrap, typed atom wins) and LIVE on the standalone chip (the chip IS the root — inline mirror beats the class atom, the avatar-echo precedence). My own demo panel falsified my first draft's unconditional "nothing follows" — measured 18px where the row promised 10px. Every "nothing follows" claim is posture-conditional whenever the component has a root-split (children vs standalone).
- **Probe self-contamination**: measuring the "outside" baseline AFTER an earlier mutation in the same evaluate reads the mutated state (my lg-stamped chip WAS the baseline). Reset state before the baseline read, or take the baseline FIRST.
- **`:where([data-density='lg'])` rung scopes re-base kernel channels on ANY matching element** — a bare div with the attribute is a live scope; the channels move for the element and its descendants. That is the wrap-scope composition mechanism, measurable without a tenant.
- **Shared-tree attribution discipline**: other agents' in-flight edits live in the same worktree — a failing gate names its route; stash MY files, re-run, and the attribution receipt is the still-failing clean tree. Never eat or hand off an unattributed red.
- **resolveRawCode gate**: the PILOTS lane requires ≥1 `resolveRawCode('<id>')` call per pilot page naming a REAL canvas id — a canvas without an `id` prop extracts as `undefined` (the -u run will happily snapshot `undefined`); give every authored canvas an id and wire one drawer through usageFile/resolveRawCode.

## Task 28 — link 2nd review (2026-09-22)
- **Toc order ≠ DOM order is invisible to a section-list check**: every toc id existed and every label was real — only the BYTE POSITIONS revealed the inversion (accessibility rendered between detection and axes while the toc put it last). Order receipts need positions, not membership. `indexOf` on `id="x"` can false-match code samples; sanity-check the 60 chars before the hit.
- **A review-log paraphrase can misstate a contract**: `rel="noopener external"` in a receipt vs the served `rel="noreferrer"` + `data-jx-link="external"` — quote served attributes verbatim in probes; paraphrases belong to no report.
- **The frozen-pole receipt form is now canonical**: co-resident islands + read BOTH `--raw` (flips, formula arithmetic visible in the computed value) and `--jx-alias` (byte-identical) on the SAME elements — the substitution-site story proves itself in one evaluate.
- **Snippet-type diagnostics are their own class**: an inline `const arrowGlyph = …` infers a Snippet-brand identity that fails the prop's imported `Snippet` type — unlike cx-debt it's not a narrowing gap; the fix is annotating the const with the imported type. Zero runtime effect either way.

## Task 29 — card-grid re-verify (2026-09-22)
- **Re-verify protocol worked as designed**: my ladder/bridge derivations (and the drawer finding) were filed before reading vellum's fix report; the cross-check then only had to reconcile deltas. The unrecorded delta (theme canvas reusing the axes usage file) is exactly what independence buys.
- **Query-flip receipts need per-width FRESH LOADS plus a resize sweep**: a resize-only sweep can mislead if the locator drifts between specimens; fresh loads pin the first-paint medium (LAW #16), the resize sweep proves reactivity, and the exact-key straddle (768/767) proves the cited key. Anchor query specimens by their UNIQUE TENANT TEXT, not positional `.pop()` or stylex-hashed classes (`rt.maxWXl` compiles to a hash — the literal never exists in the DOM).
- **New additions need their own drawers**: a second canvas reusing another canvas's files const silently violates code-shown-equals-code-running — the swap law applies to additions, not just rewrites. Give every new canvas its own usage file or an id + resolveRawCode.
- **`await fn` vs `await fn()`**: awaiting the function object returns it (JSON.stringify → undefined) — the silent empty-evaluate. Same family: duplicate helper declarations across script edits compile-fail loudly; keep one sleep helper per script.

## Task 30 — navigation-menu 2nd review (2026-09-23)
- **`:top-layer *` is not a selector** — the top-layer pseudo-class has no universal form; assert via `el.matches(':popover-open')` (and let the popover attribute carry the open-state proof).
- **Popover receipts await the computed `transitionDuration`** (the WAAPI/kernel entry ran 0.46s — a 700ms settle clears LAW #14) and read the promoted element IN PLACE: DOM-parent checks prove "paint moves, DOM doesn't" without any top-layer enumeration.
- **Raw-vs-typed theme pairs read best on the SAME element**: `--foreground`/`--popover` flip while the typed ink freezes — one evaluate, two scopes, no hue reads (the neutral-token signal quill's red-herring correction demands). Different reviewers may quote different raw voices (--foreground vs --muted-foreground vs the surface element) — all are the same flip class; reconcile by naming the token, not by arguing values.
- **"Probe-asserted" receipts must reproduce literally**: the a11y table claimed `tabindex -1`; the DOM carries no tabindex at all. When a reviewer's probe says null, the record says -1, and the intent ("not focusable") is true anyway — the fix is to make the DOM match the record (or vice versa), never to let the citation stand unreproduced.
- **Menu-family spec coverage split across reviewers**: reconcile the file LIST (5 vs 6 solos) in the cross-read — combined coverage is the receipt, not either run alone.

## Task 31 — file-input 1st review (2026-09-23)
- **Drop-gate dispatch target = the dashed TRIGGER BUTTON**: the native input and its wrappers carry no handlers; the trigger button (aria-label "drop zone") is the drop surface. Enumerate dashed elements with visible rects (>120×40) — the input's computed border-style can read dashed via clip styling and false-anchors the walk-up. Exclusion receipts must exclude `<code>` subtrees — the usage drawers contain "rejected"/filename strings that false-positive any text scan.
- **Thumb box vs thumb img**: the thumb atom is knob + 2px hairline (18/22/26) while the inner img is the knob (16/20/24) — measure the box the claim names. Same class of error as the dd-edge-vs-cell: the claim's element boundary decides the number.
- **Rejected-file receipts split three ways**: value-honesty (the txt never in files), the onreject callback (the page's note renders the names), and the error line + aria-describedby (the "!N dropped file rejected" notice wired to the trigger). All three measured; the "!"+count textContent concatenation is an a11y-announcement nit worth one character.
- **Served-rows-first arithmetic**: enumerate the api table's first-column names from raw SSR before any meta count — the meta includes quoted safety-net twins ('data-density') that inflate naive counts (23 vs vellum's 22), and the `universal` directive folds axis rows out of the hand table.

## Task 32 — input-otp 1st review (2026-09-23)
- **OTP distribution has NO paste handler**: paste works NATIVELY (the browser lands multi-char in the focused slot's value) and the INPUT handler distributes the overflow — synthetic ClipboardEvents correctly no-op. The testable contract is the overflow path: setter + input event with multi-char text. Same for the first-empty fallback: it fires on focusin with an OUTSIDE relatedTarget — blur-then-focus (relatedTarget null) skips the redirect, which is the correct reading of `container.contains(prior)`.
- **`:top-layer *`, `:where()` zero-specificity stacks, max() tie arithmetic**: when a claim says a leg "wins", resolve BOTH legs to computed px — default/lg slot boxes are exact TIES (40=40, 48=48); "wins at the top" would overstate. The careful served row claimed only what reproduces.
- **Provenance narration belongs in ONE seat**: the falsification story appeared in both a row description and a section summary — consolidate to the section-level note; rows teach mechanisms.
- **Canary greps need context**: the falsified template text legitimately survives as a REFUTATION QUOTE — a hit is a finding only when it is not inside an explicit refutation.
- **`.jx-error` scaffold concatenates "!" into the message** ("!code expired", "!1 dropped file rejected") — fleet-level scaffold fix, two family receipts now.

## Task 33 — popconfirm 1st review (2026-09-23)
- **data-reveal pages hide their rig until scrolled**: [data-probe] panels were absent from the DOM entirely (not just invisible) — a scroll-reveal pass over every [data-reveal] section before ANY selector work is mandatory on these pages. The symptom is "no trigger" everywhere, which reads like a page defect but is probe neglect.
- **Anchor overlay-family probes by the popovertarget VALUE** (the panel id), not guessed wrapper names — the trigger button and the promoted panel both carry the id, making the open/close loop target-exact even inside anonymous stylex wrappers.
- **The surface fill paints on the inner `.jx-surface-body`**, not the `[popover]` element (which stays transparent for the UA sheet) — and the shadow rides a sibling `.jx-surface-shadow` layer. Read the painted element, not the container.
- **The claimed-prop clobber signature**: a component that OWNS an attribute as a prop (popovertarget on PressButton) drops imperative setAttribute values on every re-render, while non-claimed siblings (aria-controls) survive. The fix class: pass the value through the owner's first-class prop — never fight the reconciliation.
- **Dark-surface alpha receipts**: the popconfirm dark surface is 0.185 at the SAME 0.72 alpha as light — a paraphrased "77%" didn't reproduce; quote the computed string verbatim.

## Task 34 — boot-splash CODE, tier 2 (2026-09-23)
- **The dead-replay defect class: a canvas with NO rendered instance** — the workbench flipped state and showed an output chip while no `<BootSplash>` existed in its tree at all; the one-way `open={wire}` in the drawer code was the second lie. Fix pattern: render the component UNCONDITIONALLY (it renders nothing while closed), wire `bind:open`, and prove the loop with the bind-back chip (`open false` after the internal dismissal). A state chip is not a mount receipt.
- **Splash screens are the one surface where "unread tokens" is a FEATURE**: the zero-css law means density/shape/radius/color/elevation are carrier-only BY DESIGN (grep receipts: zero kernel reads), theme's grounds answer the HOST (prefers-color-scheme + ancestor `.dark`) because a pre-paint head block cannot hear props (LAW #16: name the medium — served bytes vs hydrated probe), and the exit runs on the family's OWN duration channel with the reduced-motion kill.
- **Controlled theme pairs on one stage**: prop-alone (theme="dark", no host class) vs host-bridge (ancestor `.dark`, no prop) — both instances measured in one evaluate; the confounded single demo (prop + ancestor together) proves nothing about which voice the grounds heard.
- **`el.closest('.dark')` matches the ELEMENT ITSELF**: the theme prop's own `dark` class made the prop-alone layer report `underAncestorDark: true`; ancestor checks must start at `el.parentElement`. Same boundary-discipline family as dd-edge-vs-cell and thumb-box-vs-img.
- **Svelte template attributes do not process `\"` escapes** — an escaped quote TERMINATES the attribute (parse error "Expected token ="); use single quotes inside double-quoted attributes.
- **Clock receipts on the splash economy**: fonts-path replay = 350ms floor + 350ms exit + animationend latency (797ms measured vs ~700 nominal — name the latency, don't hide it); reduced-motion on the auto path keeps the floor (531ms) and skips the exit; exit=none = floor only (430ms); manual holds indefinitely (no cap in manual mode — bind:open is yours) and its dismiss runs the same exit (454ms).
- **svelte-check scoping**: `--workspace <dir>` does NOT scope the run (it checked 622 files); the page-scoped receipt is the full run filtered by path. Family warnings (8× state_referenced_locally on provideUniversalLanes) are fleet-pattern pre-existing debt, separate from page diagnostics.

## Task 35 — popconfirm 2nd review, self-continuation (2026-09-23)
- **Reproduce-don't-trust applies to your OWN prior PASS**: re-deriving my own task-33 claims on the current tree still caught a targeting error this pass — the override keep-button lives in the OVERRIDE panel (merge-pc), not the default-rendering demo (pc-demo); my first sweep aimed at pc-demo and no-op'd silently (`keep?.click()` with a null find). A self-continuation review must rebuild the probes from scratch and make the targeting explicit in the record, or the receipt chain rots.
- **Optional-chained clicks hide probe bugs**: `keep?.click()` on a not-found button is a silent no-op that looks like a "panel didn't close" finding — enumerate the panel's buttons (text + popovertarget) BEFORE the click so the anatomy is in the receipt and a null find is visible.
- **Drift audits go path-by-path AND through the type sources**: `git diff <base>..HEAD -- '*popconfirm*' '*press-button*'` cleared the page/family, but the diagnostics claim also needed defaults.svelte.ts / props-table / blueprints cleared — shared type drift can move a file's diagnostics without the file changing.
- **The a11y labelledby-drop claim is now measured**: the override panel (content snippet) carries aria-labelledby: null + role: dialog — one more "table said it, probe proves it" conversion.
- **Sibling-noise attribution needs the uncommitted set too**: git log cleared commits, but `git status --short` naming the in-flight files (input-otp.css, number-input.css) is what proves the keyed noise belongs to others.

## Task 36 — number-input 1st review (2026-09-23)
- **LAW #14 is a three-time winner**: vellum's frozen-theme read, my own bare-strip read (border-color serialized oklab(0 0 0) MID-transition — a value that exists nowhere in any rule), and the hold-clock plateau all resolve the same way — read transitionDuration FIRST, settle past it, then trust computed values. A computed color that matches no rule in the sheet is a transition-interpolation signature.
- **The universal fold silently rewrites hand-table shape**: `universal` folds axis-NAMED hand rows (density) into the shared section with GENERIC text — the family's custom row vocabulary is dropped. Enumerate SERVED rows and quote the served cell text before accepting any "the hand table serves N rows, row X's text is…" summary; authored shape ≠ served shape. The popconfirm fold rule (consumed-axis row must re-appear in the axes seat) is the satisfaction check.
- **Meta brace-count beats eyeballing**: "22 entries" vs measured 21 — parse the meta object (indent-keyed walk or json-with-trailing-comma-strip) and count named props + rest explicitly.
- **Shared-binding demos bounce component semantics**: empty→undefined at the component becomes min at the demo seat because the PlayRange slider coerces undefined→min and writes back through the shared binding. When a live demo contradicts source, check for a SECOND writer on the same state before flagging the component.
- **Vocabulary-grep must cover BOTH sides of the same-source seam**: the page purged the falsified claims, but the family header comment (shipped verbatim in the drawer via ?raw) still taught "28px-wide steppers" and "CONSUMED" for supply-only axes — grep page AND family comments; the drawer makes family comments consumer-visible docs.
- **Token-truth vs pixel-truth**: a "destructive border" computing to oklch(0 0 0) is CORRECT in a monochrome system (--destructive: oklch(0 0 0) light / oklch(1 0 0) dark) — verify the token chain (--jx-destructive → --destructive) before calling a color claim false.

## Task 37 — reference 1st review (2026-09-23)
- **A demo can name a posture its rig cannot reach**: the "unnumbered section" specimen sat INSIDE the numbered domain, and undeclared descendants number by structure — it rendered "§ 1.2" while the page taught the bare-title fallback. Family-true ≠ demo-exhibited; verify each taught posture against its own specimen's domain membership (sections register targets ANYWHERE via the route registry, but numbers need a domain — the exact inverse of the Figure rig rule).
- **`span` as a fallback selector grabs the wrong element in numbered contexts**: SectionCard renders `<span data-jx-number>` badges — a posture-exact selector (`p a[data-ref-to]`, or the `??(`-text span) is mandatory near numbering machinery. The tell was an impossible computed value (19.52px nowhere in the design).
- **Count the served instances, not the dispatched number**: "5 prerendered edge claims" was stale at 11 (the page grew post-integration) — the CONTRACT (every SSR reference claims its edge pre-settle) was the verifiable part; always restate the measured count alongside the contract check.
- **The frozen-mechanism attribution has a deterministic form**: when a family ships NO css at all, "nothing-declares" is the whole story (no rule for a bridge to activate); "nothing-reads" only earns its keep when declarations exist without var readers. Attribute the mechanism that would STILL hold if the other were violated.
- **Fleet-wide svelte-check parsing**: svelte-check output associates diagnostics with the most recent `/Users/…` path line — walk lines with a cursor (path → following Error/Warn) instead of grep -B context windows, which smear across neighbors at 60KB scale.

## Task 38 — press-button 1st review (2026-09-23)
- **Pointer-state probes need ENGAGEMENT RECEIPTS**: a pressed-state read without `el.matches(':active')` is unfalsifiable — my first ghost read showed translate none with no way to tell "the law is wrong" from "the down never landed". Always pair the pose read with the pseudo-class engagement flag, and keep the hover leg SEPARATE from the down (a pressAt helper that moves AND downs collapses hover into active).
- **The press moves via the `translate` PROPERTY** (individual transform), not `transform` — read both; the transition-property list is the tell (translate, box-shadow, background-color, border-color, color).
- **Absolute hue digits don't reproduce across the site's hue runtime** (wall-clock rotation, documented at jixoai.css :32-45): the fill re-tint quoted 47→43, measured 129→125 — L/C identical, hue +82. Receipts in hue-ful tokens should quote the L/C signature + the shift, or name the runtime state.
- **A claimed prop's unset-path clobber is the reconciliation law working, not a bug to fix family-side**: the two receipts compose (explicit path = the contract works; unset path = the non-contract fails) — the resolution is documentation at both seats, not post-write attribute reconciliation. Ledger closure form: "claimed-prop components must expose the wiring as a prop".
- **DIV+H2 same-id pairs are the scaffold's toc-anchor pattern** — a real-DOM duplicate-id scan MUST be attributed against a second page before it becomes a finding (popconfirm showed the identical overview/see-also pairs).
- **Sibling-noise attribution can drift DURING a task**: the in-flight set at start (prototype-flex) differed from the set at gate time (prototype-grid + sheet) — re-run git status at gate time and key the failures to the CURRENT tree (the ambient sheet|1|variant|1 failures were quill's, solo-reproduced, zero press-button failures).

## Task 39 — progress 1st review (2026-09-23)
- **A single capture after the set has a latency blindspot**: screenshots taken ≥200ms after a state change see only settled bars, so a live tween reads as "inert" — the falsification instrument is a BURST (9 clip captures across ~600ms) tracing the fill edge's monotone ease-out. "Two settled frames" and "no transition" are different claims; only the burst separates them.
- **The discriminator upgrade**: before concluding "the css rule is dead", INJECT a stronger version of the same rule (3s linear !important on the pseudo) — if the tween stretches, the channel is live and the original rule governs; if unchanged, the tween is engine-side. One injection separates "dead rule" from "engine smoothing" — progress's fill turned out to be BOTH (authored 200ms live + engine smoothing that persists under reduced-motion).
- **Engine-side motion is invisible to reduced-motion kills**: the visible fill tween persisted under prefers-reduced-motion even though the unlayered css kill won the cascade — css cannot suppress what the engine animates. An a11y claim of "killed outright" needs the burst receipt, not the stylesheet.
- **Pseudo-element computed reads can lie by FALLBACK**: getComputedStyle(el, '::-webkit-progress-value') may return the ELEMENT's styles for properties the pseudo doesn't expose — vellum's "dead rule" artifact and my frame-flagged scan were both instrument artifacts; the fill color match (scan for the known fill RGB) is the unambiguous form.
- **Meta arithmetic is per-family**: progress stores 12 named entries and NO rest key (a rest-less component) against a summary claiming "11 named + the synthesized rest" — count the stored keys before accepting any "N entries (a named + rest)" sentence.

## Task 40 — scroll-virtual 1st review (2026-09-23)
- **Virtual-list probes must be LIST-SCOPED**: a page with several virtualized canvases puts three `[data-jx-sv-row]` populations in one document — unscoped index scans report false duplicate keys. Scope to the demo region; uniqueness is a within-list contract.
- **Forwarding stamps land on the COMPOSED ROOT, one level above the role=region viewport**: read stamps by walking ancestors from a row (data-density / .dark / the thumb var), not off the region — the viewport only carries what is painted on it (the thumb var).
- **LAW #19's guard has a measurable signature**: the twin-case heading (title slug == wrapper id) ends up ID-LESS (adoption without stamp), while non-matching titles stamp their own slugs — "no duplicate ids" plus "id-less twin-case h2" is the pair of receipts that proves the guard ran, rather than the collision never existing.
- **The served ToC can disagree with +page.ts both ways**: entries the file lacks (DOM-derived adoption) and entries the file carries that resolve to nothing (stale ids). Receipt the SERVED toc anchors against the DOM, and check the load-data file for dead-data drift — a toc file whose ids don't exist is a misleading artifact even when nothing consumes it.
- **Sibling-noise attribution drifts within a task**: the ambient sheet keys from task 38 were gone this pass — vellum's in-flight matrix re-pin carried them. Re-run git status AND the failing-key names at gate time; yesterday's attribution is not today's.

## Task 42 — sheet 1st review (2026-09-23)
- **The docs scroller is .jx-shell-body with scroll-behavior: smooth** — programmatic scrollTop reads bounce to 0 unless you ride out the smooth animation (~800ms), and window.scrollTo does NOTHING on this layout (window max scroll 0; the shell-body is the only scroller). Any wheel-chain or scroll-position probe must identify the real scroller first, then wait past the smooth ride.
- **Programmatic el.click() never moves focus** — a focus-restore receipt needs a real input click (page.click); the native dialog restores to the pre-open focused element, which under el.click() is whatever had focus before (the skip link), falsely reading as "no restore".
- **The backdrop wheel is swallowed by the top layer** (event propagates to the shell scroller's listeners — the scroll default does not chain): scrollTop pinned through ±wheel. This contradicts the chaining receipt from the CODE pass — the reconciling variable is unmeasured (likely her wheel point hit the panel's scroll cell at its overscroll boundary); both runs are real, the coordinates differ.
- **Concordance discipline that worked**: fix the findings in the filed report FIRST, then read the coder's report, then append the addendum — the discordance (her chained wheel vs my pinned scroller) stays a measured disagreement with both runs described, not a negotiated conclusion.

## Task 44 — prototype-grid 1st review (2026-09-23)
- **Computed grid-template-columns IS the honest instrument for fr tracks** — Chromium resolves fr/minmax to px per track in the computed value, so coercion claims (number → repeat(N, minmax(0,1fr))) are verifiable to the third decimal without screenshots. The claimed integers (240/180/361) were the roundings of 240.328/180.25/360.5 — receipt the unrounded computed string and note the rounding.
- **A no-blowout guarantee is probe-able by injection**: set a child's min-width to an absurd value; the minmax(0,1fr) form keeps the tracks and overflows the container — one evaluate separates the guarantee from the marketing.
- **Container width is part of every track claim**: her [240×3] and my [240.328×3] agree only because we both sat at the 1400 viewport — name the container/viewport width beside the resolved px, or a future re-measure reads as drift.
- **The full-concordance case is worth stating plainly**: every CODE-pass number reproduced to the rounding — when a coder's probes are that honest, the review's value shifts to ADDITIONS (live no-blowout injection, areas geometry, omission-transparency stamp receipts) rather than corrections. Say which kind of review it was.

## Task 46 — skeleton 1st review (2026-09-23)
- **The rAF opacity sampler is a one-evaluate instrument**: seed window.__samples, run requestAnimationFrame pushes for ~1.65s (past one full 1.4s cycle), then read — min/max over 100 samples pins the oMin/oMax envelope exactly, and the timing function falls out of the sample spacing. For skeleton pulses it doubles as the shimmer disproof: background-image computes to none, so there is no gradient to sweep — brightness-only is provable by absence.
- **The reveal pass must ride the real scroller**: on the docs layout .jx-shell-body is the only scroller (window max scroll 0) — window.scrollTo reveal passes are silent no-ops and deep lazy canvases stay unmounted, reading as missing demos. Task 42's lesson, re-confirmed; scan scrollHeight/clientHeight first to name the scroller.
- **Dead-utility sweeps: the DOM query, not the SSR regex** — class="h-3 w-32" inside drawer code text matches any attribute regex (25 false hits); querySelectorAll('.h-3') over the live DOM counts real elements only. The re-hosting receipt is zero elements, not zero strings.
- **Full-concordance reviews are the coder's grade**: when every CODE-pass number reproduces (skeleton: envelope, freeze, merge, geometry to the pixel), say so plainly and shift the review's value to additions — the absent instruments (no-gradient proof, shells census, scroller note), not corrections.

## Task 48 — stack 1st review (2026-09-23)
- **Rem-of-document-root is provable by mutation, not assertion**: set html font-size 16→32→16px and read the same elements — gaps doubled (8→16px), the px size stamp never moved (18px), and the page restored exactly. One evaluate replaces a paragraph of token-chain argument; always re-read after restoring.
- **Count attributes, not strings, in SSR greps**: `data-jx-stack` appeared 19× in SSR but only 17 were attributes — the other 2 were prose mentions in law/TokenTable text. Live querySelectorAll is the reconciling instrument.
- **Markers have element forms, not just text forms**: the universal marker is `h4[data-jx-props-table-universal]` — an exact-text search for "universal" finds nothing. Query the attribute before concluding absence.
- **Demonstrated ≠ documented**: the stack page stages gap="8" beside size={18} (non-scaling visible) but never says gaps stay rem-of-document-root; "one number moves the whole stack" reads as more than voice. When a dispatch claims "the page's documented X", grep the page for the statement, not just the demo.

## Task 51 — progress re-verify (2026-09-23)
- **The falsifier is the re-verify instrument**: having broken the "inert fill" claim with the burst instrument, re-running THAT instrument (not a new one) is what makes the re-verify probative — my runs landed mid-tween at the same times as the coder's independent re-measure (20-56ms vs her 32-53ms), which is agreement, not coincidence.
- **Settle is a tolerance, not a time**: "settles by 82-99ms" and "settles by ~155-221ms" were both true — decelerating curves spend their tail below any fixed tolerance. State the settle criterion whenever re-deriving a tween, or concordant instruments read as discordant.
- **The discriminator's slope is instrument-attributed**: under a 3s-linear injection both my runs read an effective span of ~4.1-4.5s (linear, slope-consistent) against the authored 3s — capture-latency attribution and engine tail are candidate explainers. The qualitative proof (injection dominates the paint; channel live) survives the numeric gap; soften "≈3s"-style claims or add CDP capture timestamps.
- **Computed style on ::-webkit-progress-value is blind twice over**: it reads 0s/ease for the transition (authored 200ms AND injected 3s) and the TRACK color for the fill's background — the pseudo's computed read never witnesses its own live channel. Pixels are the only witness; the page now teaches exactly this.
- **Old-claim censuses need referent care**: one "killed outright" string survived the fix — inside the NEW sentence with the correct referent (the css transition is killed; the tween persists). Grep hits adjudicate by reading the sentence, not by counting strings.

## Task 52 — prototype-flex 2nd review (2026-09-23)
- **Byte-identical reverts live at the computed layer, not the attribute layer**: Svelte's style:directives go through the CSSOM, which re-serializes flex-direction+flex-wrap as the flex-flow shorthand (and collapses to `flex-flow: row` on revert). Compare getComputedStyle for the byte claim; disclose the attribute serialization as equivalent-form, or a true PASS reads as a mismatch.
- **A self-proving typecheck fixture needs an inclusion proof**: 0 diagnostics on the fixture path means the boundary holds ONLY if the fixture was provably in the run — read the COMPLETED line's file count (2495 → 2496 with mine) before claiming the receipt. Then delete and re-run the gate clean.
- **Predicate/file-name drift kills mirrors silently**: the rig's drawer-tracking resolver matched `rig.svelte` while the file was named `usage.svelte` since integration — the coder's "mirrors the live rig state" receipt was never true, two reviewers (self included, until the open-drawer capture) read past it. Open the drawer and capture the rendered string before believing any tracking claim.
- **The playground snippet's surface is the DOCK, not the drawer**: component-canvas renders consumer playground snippets in the collapsible canvas-playground dock; "drawer-only" phrasing (landed review note) names the adjacent collapsible. Check the component's architecture comment before naming surfaces in doctrine sentences.

## Task 55 — prototype-waterfall 2nd review (2026-09-23)
- **Seat-census audits need a text-census backstop**: the correction "landed in all five seats" while a sixth location carried the falsified sentence — the reviewer's seat list and the coder's fix both enumerated seats by memory. Grep the falsified phrase family across the served SSR and count hits; the DOM is the seat ledger.
- **Two-direction rem experiments land digit-exact when the mechanism is CSS-native**: stamp 18px → floor 224px; root 16→20px → floor 280px (14rem × root) — both reproduced to the pixel on the first run. Element-level stamps move the voice; rem lengths read the document root. The same law as stack's gaps (task 48) — it is now measured on three families.
- **Quantify phrasing NITs when the mechanism is probeable**: "settles by the first animation frame" was made true-shaped by scribe's phrasing pass, but the stale-read (same task: 16px) vs settled-read (next frame: 24px) pair turns the phrasing into a receipt. One evaluate with a Promise-wrapped rAF.
- **Lazy snippets still serve claims**: the playground PlayHelp claiming "the usage file mirrors the live control state" is only VISIBLE when the dock opens, but it is served text teaching a mechanism the dormant resolver cannot honor — visibility is not the bar for truth.

## Task 57 — prototype-waterfall re-verify (2026-09-23)
- **Drive through the framework's protocol path, not synthetic events, when a receipt must land**: the manual native-setter + dispatchEvent pattern silently failed to update Svelte state this session (same pattern worked two tasks ago); Playwright selectOption/fill landed every pick. When a drive receipt matters, prefer the protocol API — and when a drive silently no-ops, the drawer's initial-picks render is still half-evidence (live template vs static constant), but never claim tracking from it.
- **A mirror fix turns one lie into one truth with the same edit**: renaming the resolver's match target made the drawer track the rig AND made the served PlayHelp sentence true — one-line fixes that repair a mechanism repair every sentence that describes it. Verify both the mechanism and the sentence.
- **Old-claim censuses are the re-verify's first gate**: the seat that was the single SSR hit last pass is the first thing to recount this pass — 1 → 0 is the cheapest possible proof the fix landed where it mattered.

## Task 58 — system-dialog 1st review (2026-09-23)
- **Auto-scrolled clicks invalidate pre-click rects**: locator.click scrolls the target into view; a trigger rect captured before the click is stale by the scroll delta. Measure the anchor and the anchored panel in ONE evaluate, after the click settles — a "-301px gap" was my instrument, not the page.
- **Synthetic-event drives are flaky across sessions; the protocol path is not**: the same native-setter drive that worked in task 55 silently no-oped in 57 and 58's first attempt; Playwright's selectOption/fill lands every time. Receipt-critical drives go through the protocol API.
- **Body-level censuses need a layer map**: component canvases keep body-level layers (one held 407KB including the page's composed dialog), so "hosts on body" over-counts unless the load-time census separates the permanent layers from the interaction-mounted hosts. Census at load, then again after the interaction.
- **The width-atom loss is stylesheet-level, not specificity**: the stylex source declares min(24rem,…) but NO served rule carries it — walk document.styleSheets for the declaration before calling a loss "an override". And it is not one number: 544.5 fit-content, 1440 stretch, 370 content-fit — the loss has forms.
- **A token row that states a falsified measure is worse than no disclosure**: the dispatch expected a loss disclosure; the page instead asserts the measure as true in its TokenTable. When a dispatched disclosure is missing, census what the page says instead — the active false claim sets the severity.

## Task 61 — separator 1st review (2026-09-23)
- **Fixed-position fixtures are backdrop ROOTS**: wrapping a backdrop-filter element in a position:fixed fixture isolates the backdrop sampling — the filter reads nothing and the strip equals its ground. Test backdrop physics in the page's real flow (locator-scrolled, element-rect-anchored clips), never in synthetic wrappers.
- **The alias-freeze mechanism splits by read site**: under root-level dark, --jx-border re-derived AT :root (html read oklch(1 0 0)) while the strip's inherited value and painted fill held oklch(0 0 0) — a var can re-derive at its declaring element and still never reach the consumer. When a token-mechanism claim says "re-derives", read the var AND the paint, at both sites; they diverge exactly where the mechanism lives.
- **Shell layouts ship multiple scrollers**: the shellFlush second column has its own scroll range, so .jx-shell-body is not the universal scroller — find the box's actual scrolling ancestor (walk for scrollHeight > clientHeight) or use locator scrollIntoViewIfNeeded, then anchor clips by element rect.
- **The strip-row guess is the junk-frame generator**: locate the 1px strip by its element rect (element → clip → fixed row offset), never by scanning for "the row with the most contrast" — borders and edges win that scan.

## Task 63 — scroll-area 2nd review (2026-09-23)
- **Module-level id counters break the warm-reload law**: a module-scope `let nextViewportId` increments per SSR request, so consecutive fetches hash differently (ids 89-121 → 122+) even when every other byte matches. Diff-isolate before calling warm-reload green, and prefer $props.id() — per-instance stable AND SSR-stable.
- **Census at the list depth, not the wrapper**: [data-jx-scroll-content] wraps the list container wraps the items — a children.length read at the wrapper reads 1/1/1 and mis-prices LAW #18. Descend to the branching node.
- **A colored 30%-alpha chrome is a free paint-probe**: the thumb's computed backgroundColor (oklab form) tracks currentColor exactly — the frozen-ink watch reads at the element's computed usage, no pixels needed, and both directions (bare-island no-move, recolor move) fit in one evaluate.
- **Integration of review corrections needs the compile gate**: the separator MINOR's fix text (an apostrophe in a single-quoted svelte string) shipped as a js_parse_error and 500'd the page — corrections are code; run the page or the suite before considering them landed.

## Task 65 — spin 2nd review / the adjudication (2026-09-23)
- **The var-vs-paint split adjudicated across two families**: spin's ink and separator's fill behave IDENTICALLY at the element (computed var + painted color hold the light value through html.dark) while the html-level alias re-derives on both — the root-pinned-alias record is FLEET-WIDE frozen, no carve-out. Scribe's "FLIP" was the html-level var read; the two-read protocol (html var vs element computed) is now the standing instrument.
- **The declaring rule may live outside document.styleSheets**: a stylex theme's custom-property declarations (likely adoptedStyleSheets, possibly @property inherits:false) were invisible to my sheet walk — when a computed var contradicts inheritance theory, suspect the enumeration, not the physics.
- **Chrome has no .paused on SVGSVGElement — use animationsPaused()**: the boolean accessor is implemented; the getCurrentTime-delta clock is the equivalent instrument when it isn't. Both agree: RM freezes the SMIL clock to delta 0 and resumes it.
- **Consecutive-fetch hashes are a drift census**: spin.html's SSR differs across requests ONLY in hydration-comment hashes and svg gradient ids (svgInstanceSeq) — the SSR face of the hydration_html_changed LOW. Diff-isolate the drift before judging warm-reload; the drift itself is a finding (module counters vs per-render stability).
- **The adjudication target's own history matters**: the "measured flip" claim traced to an html-level read — an instrument gap, not a page defect. Severity rides the CLAIM's wording (copy correction), while the underlying defect (frozen ink on dark grounds) goes to the family ledger.

## Task 69 — table 2nd review (2026-09-23)
- **A landed row can be verified from its own numbers**: the corrected radius row quoted its three lanes; re-deriving the lanes at the specimens (12/10/8 + the stamp-presence rule) is the whole verification — the row that landed carries its own test.
- **Playground id counters restart per PlayFields instance**: two canvases = two row-1 labels = an aria-labelledby collision with a real AT cost (the second control announces the first's label). The W-next ledger item's cost is at the accessibility layer, not just hygiene.
- **Mid-reveal reads lie**: a computed font-size read during a reveal transform returned 11px where the settled value is 12px — anchor computed-read probes after the reveal pass completes, and re-read anomalies once before filing them.
- **Read overflow at the actual scroll container**: the table's scrollWidth equaled its clientWidth because the FIGURE is the scroller — measure scrollW against the frame width (646 > 560), not the table against itself.

## T72 (tags-input 2nd) — the two-read protocol pays off a third time; grep substring artifacts decode

- **The alias-class adjudication must be measured, not reconciled on paper.** The dispatch expected tags-input's --jx-muted to classify slot-block (the reconciliation said so); the two-read protocol showed the chip paint HOLDING under root html.dark AND under a scoped .dark island, with the html-level var flipping — root-pinned alias (tokens.stylex :69 '--jx-muted': 'var(--muted)'), third HOLD data point. A var() custom-property declaration substitutes at its declaring element; no mid-tree class can re-derive it. Fleet FLIP slots (tabs, system-dialog) should each get the two-read before the record accepts them.
- **Synthetic clipboard events are a second silent no-op class** (after task 63's selectOption): ClipboardEvent('paste') with a hand-built DataTransfer did nothing; grantPermissions + navigator.clipboard.writeText + real Meta+V delivered. Receipt only after the real drive.
- **Byte-census "oddities" can be my own grep substring artifacts**: `id=""` ×6 were tails of `data-no-subgrid=""`; `id="true"` ×2 were tails of `aria-invalid="true"`. Decode with wider context BEFORE promoting a census anomaly to a finding; the live-DOM re-census (101 ids, zero twins) is the ground truth.
- **data-density stamps on the wrapper, the shell paints the var**: reading the attr on the paint element returns null and can look like a missing stamp. Find the stamp site in source (:460 wrapper / :560 panel here) before concluding.
- Flash windows: assert presence DURING the window and absence after window+margin in one probe (350ms after a 300ms window) — two probes risk different chip sets between runs.

## T72 CORRECTION (post-concordance) — the T72 lesson above was wrong and is superseded

- My first T72 adjudication ("tags-input --jx-muted is root-pinned-frozen, third HOLD data point, fleet line slot falsified") was a **single-sample artifact**: the first chip sits inside a `data-theme="light"` demo stage that re-voices the token family. The concordance reads (scribe 66, vellum 43 both measured root-dark chip FLIP) caught the contradiction; the ancestor-walk probe settled it: **14/22 chips flip under root html.dark, 8 hold — every hold has a data-theme="light" pinning ancestor**. The declaring rule is `:root, .xbpgcew { --jx-muted: var(--muted) }` and it is LIVE — a :root-level var() reference re-substitutes when root dark flips the site token, and the recomputed value inherits down.
- **The correct three-tier model**: (1) root dark flips alias consumers (live); (2) mid-tree .dark islands CANNOT flip them (the alias substitutes above the island — islands stay concordant); (3) data-theme stages locally pin. "Frozen unless pinned", not "frozen by :root".
- **Concordance contradiction is a probe alarm, not a turf fight**: when my measurement contradicts two independent prior receipts, suspect MY sample site first. Single-element theme reads are not adjudications — census ALL instances of the pattern, then walk ancestors to the pin site.
- **Fleet consequence flagged to the orchestrator**: separator/spin HOLD slots (incl. my own task-65 "fleet-wide frozen" correction) may be stage pins too — re-adjudicate with the pin-finder (probe6/7 pattern) before the fleet record freezes again.

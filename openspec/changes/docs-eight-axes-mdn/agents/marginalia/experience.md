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

# marginalia — experience log

## Techniques (mine)
- **Per-axis honesty protocol (accordion, round 1)**: before writing any
  per-axis row, derive TWO facts from source and keep them separate:
  (a) what the family STAMPS (read the root's carrier join —
  `stampCarriersForLanes` + the class/attr bridges), (b) what the family
  CONSUMES (grep the family css/stylex for each carrier var). A lane with
  (a) but no (b) is broadcast-only — document it as supply, never demo it
  as a visual change. density+theme were the only painter lanes on
  accordion; radius is anchor-only (frame keeps `var(--radius)`).
- **Demo selection by visibility**: only demo lanes whose effect is
  CSS-provable on the family (density named rungs via the `data-density`
  scope swap; theme via the `.dark` class bridge; radius via the Card's
  §3 consumption calc). The query() demo rides density because media-key
  resolution flips a VISIBLE rung attr.
- **Custom-property substitution timing**: `var()` inside a custom
  property substitutes at the DECLARING element. `--jx-text` is declared
  only in `:root`/`[data-density]` scope blocks, so a bare
  `--jx-density-coefficient` stamp matches no block and recomposes
  nothing on a family that declares no channels of its own. Named rungs
  make the scope block match the family root → recomposition there. This
  decides which density lane is demoable.
- **Skeleton lint as a hard gate**: every docs page needs exactly ONE
  `Usage` H2 (hard), plus Install/See-Also markers for the staged
  skeleton. Verify with `npm run verify:docs` after ANY page
  restructure — the H2 lives in SectionCard `title`, so retitling
  sections can silently delete the Usage H2.
- **`query<{ Axis }>({ … }, base)` generic pin**: the object literal alone
  widens case values to `string`; pin the generic (the concept page's
  own pattern) or the lane type rejects the QueryResult.

## Highlights found in others' pages
- (none yet — reviews start round 2)

## Mistakes to avoid
- **`rg -rn` is the replace trap** — hit it TWICE this session despite
  the law in context. `-r` = `--replace`; output mangles matches to the
  letter `n`. Recursive+line is plain `rg -n "pattern"`. (My own context
  documents this from 2026-09-11; it recurred under time pressure.)
- **Don't trust W3-era demo copy**: the old universal card demoed
  `size={18}` with "the whole disclosure set scales" — contradicted by
  the family CSS. Trust computed CSS facts over shipped prose.
- **Retitling sections can break lints**: removing the Usage H2 hard-
    failed docs-structure. Run the structure lint immediately after
    restructure, before polish.

## Upgrades applied back to my pages
- (accordion IS the first page; the techniques above ARE the upgrade —
  apply the per-axis honesty protocol to badge/figure/card when their
  turns come)

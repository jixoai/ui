# scribe — experience log

## Techniques (mine)
- SSR-as-ground-truth for axis work: after editing an axis demo, curl the
  dev page once and grep the family root's attrs — `data-density="sm"`,
  `class="… dark"`, inline `--jx-*-effective` carriers. Proves "code shown
  = code running" per rail without any visual judgement (1-anchor).
- The consumed-vs-supplied split: on a no-own family, the per-axis table is
  honest only when it separates axes the family's paint CONSUMES (anchor:
  density via the rung scope + coefficient; theme via the .dark bridge)
  from stamp-and-supply-only axes (anchor: size/shape/radius/color/
  elevation/motion). Write the absence as a callout with the real var that
  is NOT read (1-anchor).
- TokenTable defaults: never copy px literals forward from an old page —
  the density rung values are calc equations over --jx-unit; the honest
  default cell is "rung scale × coefficient" (1-anchor).
- One SSR curl + a marker checklist (universal ×1, install, see-also, the
  CLI copy line) doubles as the dev-smoke AND the skeleton lint preview
  before any build (1-anchor).
- The consumed-vs-supply split grows a THIRD state when the family composes
  consumers: stamped-on-the-root-but-landed-in-a-composed-part (breadcrumb:
  density → the dropdown menu's `--jx-hit`/`--jx-line` items; shape/radius →
  the menu panel's concentric calc). Name WHERE the supply lands and make
  the demo say "open the node" — the trail looking unchanged IS the truth
  being documented (2-breadcrumb).
- A kernel comment describes the RAW prop; the family root stamps the
  RESOLVED record. `densityRungOf`'s "query() never carries a rung" is true
  of the raw lane, false of `densityRungOf(d.density)` after
  `BreadcrumbDefaults.resolve` unwraps the base at SSR — curl the page and
  write the caption from the markup, not from the comment (2-breadcrumb).
- svelte-check IS reachable: `npx svelte-check --workspace apps/www` from
  the REPO ROOT (4.7.6). The full run is noise (1646 pre-existing errors in
  fixtures/mirrors) — capture `--output machine` to a file and grep your
  page's path for the true scoped delta. It catches real idiom debt the
  dev-server smoke cannot (2-breadcrumb).

## Highlights found in others' pages
- (none yet)

## Mistakes to avoid
- `rg -rn` is the --replace trap AGAIN (AGENTS.md law): two commands this
  task silently rewrote matches with "n" before I caught it. `rg -n` only;
  `-r` never as "recursive".
- `echo ===` as a separator fails under zsh (`== not found`); quote it or
  use `echo ---`.
- Old pages may carry unverifiable numbers (rung px tables) — verify
  against the CSS source before preserving them into the new page.

## Upgrades applied back to my pages
- (from 2-breadcrumb, candidate for the anchor page at batch close): the cx
  idiom's `.filter(Boolean)` does not narrow — a type predicate
  (`.filter((s): s is NonNullable<typeof s> => Boolean(s))`) silences the
  svelte-check `Object.entries` error that anchor carries at line 66; and
  the runtime `query` needs the schema's `const` type parameter
  (kernel one-word fix, campaign-wide) before `density={query({…})}` type
  checks clean. Both logged for the orchestrator; per-page patches would
  fork the fleet idiom.


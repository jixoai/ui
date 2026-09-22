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
- (none yet — batch continues)


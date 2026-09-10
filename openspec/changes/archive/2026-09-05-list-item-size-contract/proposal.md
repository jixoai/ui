# list-item-size-contract — the declared responsive width ladder (codex r1 B1+B2+B3)

> Naming ruling during implementation: the stamp is `data-fit` / prop `fit`
> (ItemEndFit) — the family's kernel law BANS `[data-size=` in item.css
> (density owns the size axis; the existing source guard caught the first
> draft), and `fit` is codex B3's own vocabulary.

> Owner ruling 2026-09-05 (r3): folding must be WIDTH-driven and DECLARED
> at composition time, the way responsive dev declares md:/lg: — never
> measured at runtime, never guessed per control type. Sources: the
> fusion prototype round (`/prototypes/list-item-fusion`) + codex review
> r1 blockers B1–B3 (`.agents/documents/2026-09-05-list-item-fusion/`).

## What Changes

1. **ItemEnd size API (B2)** — `fit?: 'md' | 'lg' | 'full'`, a typed
   prop the component stamps as `data-fit` (never a rest-transferred
   attribute). `fit` + `wrap="never"` are mutually exclusive — a
   runtime guard throws (the toggle-group name-guard precedent); the
   lane never sizes by `:first-child` guesses: the LANE carries the
   ladder (`--jx-item-end-w`), platform controls fill it.
2. **The ladder (B2)** — md 10rem → 7rem → stack+100%; lg 16rem → 11rem
   → stack+100%; full 100% at every tier. Tiers ride the family's own
   `@container jx-items` (44rem mid step-down, 30rem narrow fold).
3. **Field rows join the contract (B3)** — ItemField + the five
   adapters accept `fit`; a fitted field lane relaxes its forced
   `wrap="never"` to `wrap="auto"` + the `data-fit` stamp. The prototype's
   DOM-nature inference (input:not([type=checkbox])…) RETIRES — the
   capability is declared, never sniffed.
4. **Subgrid narrow fold extension (B1)** — the subgrid 30rem branch
   folds end lanes carrying `data-fit` the same way it folds
   after/actions lanes today, per ruler, keeping
   `grid-template-columns: subgrid` (areas-only rewrite, header/footer
   combos intact — the 16-combination presence matrix is untouched).

## Impact

- `registry/files/ui/list-item/` — item-end.svelte (+fit API/guard/
  stamp), item-field.svelte (+fit, conditional wrap), the five
  adapters (+fit passthrough), index.ts (+ItemEndFit), item.css
  (+size contract block, narrow-tier selector extension).
- Mirror `apps/www/src/lib/ui/list-item/` byte-identical.
- Prototype `/prototypes/list-item-fusion` swaps its rest-attrs for
  the real API (the live proof surface).
- Tests: `test/list-item-size-contract.spec.ts` (stamps, guard,
  adapter forwarding, field-lane relaxation).

## B5 (landed in the same change): control integration

- ItemGroup grows `controlChrome?: 'integrated' | 'self'` — opt-in on
  default mode only; muted (slab) and plain (host-owned) force 'self'
  (the group never owns a frame it doesn't paint).
- ItemField defaults 'integrated' (its outline row IS the frame owner);
  'self' opts out. The stamp rides `data-control-chrome`.
- The sheet dissolves in-row shells — background, border AND the well
  shadow with its hover lift — via specificity EARNED with a compound
  chain (no !important, deliberately not :where); the state machine
  stays legible: focus-visible ring is outline-based (survives), and
  focus/invalid/disabled re-assert border color. Tags ride the real
  root hook `data-jx-tags-wrap`; InputGroup stays OUT (addon seam is
  internal structure).

## B6 (list-item half): the cluster boundary

- The prototype's Action section grows joined clusters (3-button and
  2-button+icon ButtonGroups) in wrap="never" end lanes.
- `list-item-end-cluster.spec.ts` pins the lane's contract: gap/align/
  wrap ONLY — children render verbatim (no injected separator nodes,
  no style/margin/radius reach-into), proven with bare buttons so the
  law is independent of button-group's implementation; source-pinned:
  item.css matches zero btngroup/button-group internals.
- The seam/radius POLICY inside a joined group belongs to button-group
  (a parallel workstream owns that component) — the boundary is
  recorded here, the group-side policy is out of this change.

## Out of scope
- Non-subgrid fallback behavior (stays the broader fold it is today).

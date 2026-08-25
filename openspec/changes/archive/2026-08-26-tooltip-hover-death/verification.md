# verification — tooltip hover death

## Reproduction (before the fix)

- Docs page, first hover after load: tip flashes ~230 ms (the entry
  arc), dies at the A→B seam. Computed-style timeline:

      +120ms  open  op=0.87  filter=blur(56px)   ← visible, entering
      +220ms  open  op=1     filter=blur(13px)
      +260ms  open  op=1     filter=blur(100px)  ← the seam: invisible
      +900ms  open  op=1     filter=blur(100px)  ← rest: invisible smear

- Pixel truth (the lesson): tip-center pixels EQUALLED the page
  background — every earlier "PASS" that read only `:popover-open` +
  `opacity` had verified an invisible panel. All later gates read
  computed filter AND pixels.

## After the fix

- Filter timeline: `blur(56px) → blur(6.7px) → none` at the seam,
  `none` through rest; pixel Δ=153 vs page (tip 51,51,51 / page
  0,0,0), dark-theme headed screenshot on record.
- Materials: body α=0.72 glass, shadow α=0.32 veil, shadow separated
  (6px) in BOTH motion modes; theme switch while resting re-flows
  (oklch(1 0 0/.72) → oklch(0.3211 0/.72)) — no stale pins.
- Interaction regressions (Chromium + WebKit, headed): cold first-hover
  12/12 alive; resting ON the tip keeps it open; leaving both surfaces
  closes; cross-gap during the entry window (60/150 ms) stays open;
  early-leave-to-nowhere closes. Event stream purified to
  `A.enter → P.toggle`.
- jsdom: real sibling-switch order test + touch-liftoff regression;
  batch2 Tooltip section green; full suite green at each landing.
- ::backdrop hypothesis (Owner-raised) disproven by experiment on both
  engines: `elementFromPoint` at far corners returns page elements;
  a static hover with the panel opening away fires zero leaves.

## Codex review loop (gpt-5.6-terra, xhigh)

| round | verdict | outcome |
|-------|---------|---------|
| r2 | 4/10 | order-race theory disproven; registry drift; policy conflict — all adopted |
| r3 | 7/10 | touch stuck-open risk + jsdom order — adopted |
| r5 | 8.0/10 | materials read at p=0 — adopted (r6) |
| r6 | 9.0/10 | rest pins violate formula ownership — adopted (r7) |
| r7 | **9.5/10, Approve, no blockers** | closed |

Rulings cited: r22 (flush), r25 (reactive style pins), r30 (filter
none where blur would be zero).

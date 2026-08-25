# popover anchor gap — margin semantics through --jx-pop-gap

## Why

Owner report (2026-08-26): "Popover 可以控制与锚点的间距吗？" — a gap
law existed once (f147f5f, 8px shadow clearance), was removed by the
r22 flush ruling (2e1949a, "the adaptive shadow falls outward, no gap
law needed"), and consumers since hand-hacked margins
(terminal-header's scoped `2px 0 0`). The Owner ALSO perceived "一点
偏移" — geometry probes (ZCode + Codex, independent) showed NO true
misalignment (edges match at 0px); the feeling is the flush
composition: border-on-border seam, the trigger's own press shadow
swallowed, outward-only shadow.

## What

- `.jx-pop { margin: var(--jx-pop-gap, 0px) }` — default 0 keeps the
  r22 flush law; the custom property carries a FULL margin shorthand.
- `gap?: number | string` prop: number → N px (uniform ring — also
  insets the inline alignment edges); string → 1–4 value CSS margin
  shorthand, gapping ONLY the side facing the anchor while inline
  edges stay flush (the Owner's four-directional design, which
  collapsed the original uniform-vs-candidate slice split: directional
  margin achieves candidate precision with plain CSS).
- Trust boundary (Codex): strict length grammar + Number.isFinite;
  invalid input dropped with a dev warning — no declaration smuggling.
- @supports fallback hardened: joint capability check (anchor-name +
  position-anchor + position-area + position-try-fallbacks), resets
  both inset-area and position-area; @supports proves syntax only.
- Documented limits: position-try flips do NOT mirror element margins
  (empirically pinned — a flipped state hugs flush again);
  placement="center" + tryFallbacks writes margin:auto which overrides
  the gap.
- Playground: PlayRange slider 0–16 (the Owner's input-range request)
  + anchored-side/uniform mode; side mode auto-writes the facing edge
  from the live nine-grid cell.

## Verification highlights

- Chromium geometry matrix 5/5: default flush+aligned; side 8px →
  gapBelow=8 & alignRight=0; uniform 8px → both=8; forced flip lands
  above; flipped hugs flush (the documented limit, as declared).
- Slider e2e (real pointer): 10/16 → `--jx-pop-gap: 10px 0 0 0` →
  gapBelow=10, alignRight=0.
- Contract tests 5/5 (default/number/shorthand/malformed lengths +
  NaN/Infinity); full suite 487/487; mirror GREEN.

## Discovered, out of scope (pre-existing, on HEAD)

WebKit 26 mispositions the popover demo (~32/25px): the inline
`position-area` does not apply there while CSSOM `setProperty` does
(tooltip's static style unaffected — suspected Svelte reactive-style
write path). Codex confirmed pre-existing at the code level; its env
could not independently reproduce. Fix direction: runtime stylesheet
injection (the nine-grid precedent). Follow-up recommended.

## Codex

Co-review 7.0 (plan revisions adopted) → impl 8.0 (validator blocker)
→ **9.5/10 confirmed** after the fix.

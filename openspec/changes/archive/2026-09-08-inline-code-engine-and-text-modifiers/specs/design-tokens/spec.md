## MODIFIED Requirements

### Requirement: the subtraction ink law (Owner ruling, 2026-09-01)

Masks, shades, veils and darkening overlays SHALL NOT add ink: no
dark `background`, no black `box-shadow` over content. They SHALL
subtract color instead — `backdrop-filter` (e.g. `contrast(0.5)`)
pulls the backdrop toward middle tones: near-white darkens, near-black
lightens, so light/dark themes are mutual inverses with ZERO color
tokens. Geometry and range are expressed by mask gradients
(backdrop-filter only paints where the element draws); progressive
falloff uses the progressive-blur ladder; blend-mode `difference` is
the sanctioned technique for fade-style separators. MODAL SCRIMS are
the named additive exception and ride the `--scrim` token family
(dialog ::backdrop, the tour spotlight, the spin busy-scrim) — a
scrim dims/lightens, never colors, and a hand-mixed background tint
in a scrim's place is retired practice. State-carrying lines
(timeline done segments, step connectors) and signal layers (toast
pulse/sweep) may paint additive ink because subtraction cannot
express state — that boundary is part of this law. The separator's
OWN `solid` variant joins the exception list (Owner amendment,
2026-09-08): subtraction stays the DEFAULT ink — `fused` (the
renamed default, the contrast ghost), the shaped masks, and the
blend fade all keep it — and `solid` is the plain-fill escape
(`background: var(--border)`, `backdrop-filter: none`) for grounds
where the ghost's exact-mid blind spot or a patterned backdrop
defeats subtraction; it rides the `--border` token, never a raw
color. The known limit:
an additive `background` cutout reads wrong on non-flat backdrops;
mask-based cutouts are the long-term direction.

#### Scenario: an edge veil darkens the content under it

- GIVEN a scroll-edge veil (tabs scrollEffect shadow)
- WHEN it paints over content near the run's edge
- THEN it desaturates via backdrop contrast — a black gradient or
  darkening background under it violates the law

#### Scenario: a separator needs to read on any backdrop

- GIVEN the separator's default ink
- WHEN it renders on light, dark, or mid-tone surfaces
- THEN the contrast ghost self-adapts (no per-theme color token); a
  border-color literal as separator ink is retired practice

#### Scenario: the solid escape

- GIVEN `<Separator variant="solid">`
- WHEN it renders
- THEN it paints `var(--border)` with the ghost filter OFF (a token,
  not a raw color); every other variant still paints zero ink of
  its own

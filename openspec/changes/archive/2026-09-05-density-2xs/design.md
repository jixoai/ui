# design — density-2xs (the fifth rung)

> Extends design-language-kernel appendix A (2026-08-26) and the
> hit-floor ruling (2026-08-29). Grammar-first: every 2xs number is an
> EQUATION from the ruler, same as the four existing rungs; nothing is
> hand-picked. The philosophy: an extreme-compactness standard for
> professional software with high-density OPERATION areas — inspector
> panels, data grids, tool palettes (IDE layers panels, Figma property
> panels) — where the audience is a professional non-touch pointer user
> and the trade (smaller text, tighter rows) is deliberate.

## 1. The scale row (尺尺 derivation — §1 style, extended)

Computed contract at the 16px root, FIVE rungs now (2xs prepended):

| density | text T | line L | inline gap G | stack gap S | inset B | row min | hit min | icon | image |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2xs | 10px | 14px | 8px | 4px | 8px | 24px | 24px* | 14px | 28px |
| xs | 11px | 16px | 8px | 4px | 8px | 28px | 28px | 16px | 32px |
| sm | 12px | 18px | 8px | 4px | 8px | 32px | 32px | 18px | 36px |
| default | 13px | 20px | 12px | 8px | 12px | 40px | 40px | 20px | 40px |
| lg | 15px | 24px | 16px | 8px | 16px | 48px | 48px | 24px | 48px |

(*) 24px INSIDE the `[data-density='2xs']` scope (the scoped floor,
§3); a :root-context read of `--jx-density-hit-min-2xs` resolves
against the :root 7U guardrail (28px). The existing four rungs' hit
column is `max(rowMin, 7U)` per the 2026-08-29 ruling — 28/32/40/48
(the verifier's 44/44/44 expectations were stale leftovers of the
retired 11U touch clamp; this change repairs them).

```text
T_2xs       = T_base − 3·U/4            → 10px (pro-tool body size; the
                                          9px absolute floor stays
                                          UNSHIPPED — one more −U/4 step
                                          exists on paper only)
L_2xs       = T_2xs × calc(14/10)       → 14px (line 14: text 10; the
                                          xs precedent of an integer
                                          line over a fractional leading)
G_2xs       = U × inlineFactor(2)       → 8px
S_2xs       = U × stackFactor(1)        → 4px
B_2xs       = G_2xs                     → 8px  (THE balance invariant)
contentGap_2xs = max(U/2, S_2xs/2)      → max(2, 2) = 2px
rowMin_2xs  = max(L_2xs + 2·S_2xs, U × rowFloor(6))
            = max(14 + 8, 24) = 24px   (rowFloor 6 — U·6 = 24px, exactly
                                          the WCAG 2.5.8 AA pointer-target
                                          minimum the kernel cites)
hitMin_2xs  = max(rowMin_2xs, hitFloor) → 24px inside the scope (§3 —
                                          the scoped floor is 6U = 24px,
                                          the WCAG 2.5.8 AA minimum)
mediaIcon_2xs   = L_2xs                 → 14px (an icon sits IN one line)
mediaImage_2xs  = 2·L_2xs               → 28px (two lines; the seam is
                                          NEVER in the object)
secondaryText_2xs = max(0.625rem, T_2xs − U/4)
                                    = max(10, 9) = 10px — DEGENERATE:
                                    collapses to the primary size; at 2xs
                                    the secondary-role distinction hits
                                    its 0.625rem floor and dies (documented
                                    honestly: differentiate by muted ink /
                                    leading, never by size, at this rung)
secondaryLeading = 1.5 → secondaryLine_2xs = 15px
```

### Rulings inside the row

- **inline-factor stays 2 (G = B = 8px), NOT 1.** The xs/sm optical
  floor holds one more step down: text needs its gutter — a 4px inline
  gap under 10px text makes every control's label touch its edge. The
  B_d = G_d invariant means the inset cannot shrink without hurting
  EVERY control's breathing at once. The compactness at 2xs comes from
  TEXT (10px) and BLOCK (S=4, rows 24) — not from the inline axis.
- **row-floor 6 (24px), not the arithmetic 22.** The row is pinned AT
  the WCAG 2.5.8 AA 24px lane floor rather than one step under it:
  `max(14 + 8, 24)` resolves to the floor side. Rows are the primary
  read surface in the operation areas 2xs serves; going to 22px would
  put row heights under the AA minimum with zero hit benefit (hit is
  separately floored at 24 anyway).
- **9px stays unshipped.** The grammar can express one more step; the
  change ships only 10px. If a future owner wants 9px it is a new
  ruling, not a parameter tweak.

## 2. Token sheet + scope block (appendix A extension)

The `:root` density block in the canonical theme sheet (and its
byte-identical mirror) gains, in the existing equation-per-line
grammar: `--jx-density-text-2xs`, `--jx-density-leading-2xs:
calc(14 / 10)`, `--jx-density-inline-factor-2xs: 2`,
`--jx-density-stack-factor-2xs: 1`, `--jx-density-row-floor-2xs: 6`,
and every derived row (`line`, `inline-gap`, `media-gutter`, `end-gap`,
`stack-gap`, `inline-inset`, `content-gap`, `row-min`, `hit-min`,
`media-icon`, `media-image`, `secondary-text`, `secondary-line`).

A new `:where([data-density='2xs'])` scope block maps the inherited
`--jx-*` aliases exactly like the four existing blocks (toggle/slider/
textarea/color-lane supplements included), placed with the other
ladder scopes and BEFORE the chrome scope (chrome stays pinned after
every density scope at :where()'s zero specificity).

## 3. The scoped hit floor — the ONE scoped floor ruling

The kernel's :root guardrail is `--jx-hit-floor: 7U` (28px, WCAG
2.5.8 AA's floor + one step). At 2xs the row is 24px; the :root
guardrail would bind ABOVE the row and silently re-inflate every hit
lane to 28px — defeating the rung. The 2xs scope therefore
REDECLARES, inside `[data-density='2xs']`:

```css
--jx-hit-floor: calc(var(--jx-unit) * 6); /* 24px — WCAG 2.5.8 AA,
                                             the pro-pointer stance */
```

- **Why legal here and only here**: the pro-density stance is that a
  2xs subtree is BY CONSTRUCTION a professional non-touch pointer
  surface (the adoption law, §4) — the modality is declared by the
  developer stamping the scope, the same opt-in semantics the hit-floor
  ruling (2026-09-04 §1 rejected-alternative note) established for the
  28px guardrail: density is a pure visual contract, no runtime
  pointer branching. 24px is still WCAG 2.5.8 AA (minimum); it merely
  drops the +4px comfort margin the other rungs keep.
- **The cascade mechanics (the canvas-bug law)**: custom properties
  substitute their `var()` at the DECLARING element — a `:root`-only
  `--jx-density-hit-min-2xs: max(rowMin, var(--jx-hit-floor))` hands
  every descendant the root-substituted value (28px) and the scoped
  floor would do nothing. The scope block therefore ALSO redeclares
  `--jx-density-hit-min-2xs` (same max() equation) after the scoped
  floor, so the substitution re-runs against 6U inside the scope —
  the theme-scoped precedent (variant-grammar 2026-09-04). Inside the
  scope: 24px. At :root context: the :root declaration still exists
  per the grammar and reads 28px (against the :root guardrail).
- **This is the only place a floor is scoped rather than global.**
  The :root guardrail stays 7U for every other scope and every
  unpinned read; nothing about xs/sm/default/lg changes.

## 4. The adoption law (normative)

`2xs` is OPT-IN ONLY:

- FOR: professional non-touch high-density operation surfaces —
  inspector panels, property rows, data grids, tool palettes, layers
  lists. The audience operates a pointer with pixel precision for
  hours; information density IS the feature.
- NEVER: general marketing/docs UI, prose surfaces, mobile/touch
  surfaces, auth/checkout flows.
- NOT the default anywhere: `DEFAULT_DENSITY` stays 'default'; no
  family's local fallback becomes 2xs in this change; the canvas
  stage's comfortable/compact axis (semantic comfort, not the raw
  ladder) does NOT grow a 2xs stop.
- `xs` KEEPS its role (dense non-touch metadata surfaces); `2xs` goes
  further (operation surfaces). A product can use both: an xs nav
  rail beside a 2xs inspector.

## 5. The context channel

`Density = 'lg' | 'default' | 'sm' | 'xs' | '2xs'` (both trees).
Pure union widening: resolution law, plugin chain, slot semantics,
no-stamp fleet law — all untouched; a '2xs' opinion is just an
opinion. `DEFAULT_DENSITY` unchanged.

## 6. Migration

NONE — additive. No existing token, alias, scope, component or page
changes its computed values (the verifier's stale 44/44/44 hit rows
are repaired to the values the sheet has computed since 2026-08-29:
28/32/40/48). Consumers widen automatically via the imported type.

## 7. Acceptance

- `node scripts/verify-density-kernel.mjs` ALL GREEN, now with the
  2xs row asserted in real Chromium (text 10, line 14, G 8, S 4,
  inset 8, rowMin 24, hit 24, icon 14, image 28, contentGap 2,
  secondaryText 10, secondaryLine 15) plus the scoped-floor
  invariants (hit == rowMin == 24 inside the scope; the scope's
  `--jx-hit-floor` computes 6U).
- `vitest run test/density-context.spec.ts
  test/density-adoption-form-text.spec.ts` GREEN.
- `/docs/density-2xs.html` (the acceptance page): the five-rung table
  rendered FROM live CSS vars inside per-rung scopes (cannot rot), a
  pro-tool inspector scene at 2xs beside the same scene at default,
  the adoption-law note, nav line in the sections rail.

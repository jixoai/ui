# Gate-1 r5 verdict — visual-g1 (Codex, gpt-5.6-terra xhigh), 2026-09-15

**PASS — 8.5/10** (worked 24m 00s; trajectory 5.8 → 6.8 → 7.3 → 7.9 →
8.5). Blockers: none.

Confirmed by independent programmatic re-verification:

- openspec validate --strict and git diff --check pass.
- Mermaid MODIFIED requirement: the 6 living scenarios byte-equal, plus
  3 new backdrop scenarios.
- css-architecture delta: title + 4 scenarios preserved; changes
  confined to the two timeline exemption retirements.
- Connector sampling protocol verbatim-identical (normalized) across
  delta/design/tasks — every-edge selection, 1/4·1/2·3/4 centerline
  points, normal 2px-past-edge, 3×3 device-pixel mean.
- W4 uses the real `scrollbar?: ScrollbarVariant` API with the
  three-part statically-assertable acceptance (Props snapshot +
  native/overlay scan + two-directional planted fixture).
- W1/W3/W5 contracts (attribute flip, grid/SVG spine, aria-hidden,
  animation='scroll', dual position-area/inset-area emission,
  mirror/payload dual invariants, buildId/no-bump gates) all closed.

Residual non-blocking (folded into the implementation briefs):

1. W4 — freeze the COMPLETE Props allowlist in the snapshot; axis
   capabilities like orientation are NOT mode-shaped fields.
2. W1 — the reparent trigger is explicit: attribute observation cannot
   see a host changing parents; the effect must rebind/re-walk on
   reparent (or document the boundary).
3. W2 — fix device-pixel rounding, the normal direction for CURVED
   connectors, and the ground-patch overlap rule when the patch falls
   on a node or an adjacent connector.
4. W5 — the NEW items' css files (native-scroll-area, scroll-area-kit)
   enter the migration ledger too; the 5.2 static path list must not
   miss new files.

This verdict is the DOCUMENT gate. Implementation, browser-visual,
build, and clean-consumer receipts remain Gate-2's business.

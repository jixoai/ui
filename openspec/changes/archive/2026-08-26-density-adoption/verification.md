# verification — density-adoption

> The change's evidence index. Every claim maps to a committed gate.

## Review history

| round | record | verdict |
|---|---|---|
| design r1 | .agents/documents/2026-08-26-density-adoption/codex-r1-response.md | v0 6.5 |
| design r2 | …/codex-r2-response.md | converged 9.2 |
| change r1–r6 | review-design.md | 3.8→5.8→7.1→8.4→9.2→**ACCEPT 9.7** |
| impl r1 | review-impl.md | 3.5 BLOCK |
| impl r2 | review-impl.md §Round 2 | 2.5 BLOCK |
| impl r3 | review-impl.md §Round 3 | **ACCEPT 10.0 — archive** |

Codex: gpt-5.6-terra @ xhigh, herdr workspaces (all recovered).

## Gates (final state)

| gate | result |
|---|---|
| Full suite (`cd apps/www && npx vitest run`) | **508/508** |
| Kernel (`node scripts/verify-density-kernel.mjs`) | **61/61** |
| Ruler (`node scripts/verify-item-ruler.mjs`) | **18/18** |
| Matrix (`node scripts/verify-item-matrix.mjs`) | **37/37** |
| jx-pure (`node scripts/verify-jx-pure.mjs <port>`) | **65/65** |
| Adoption (`node scripts/verify-density-adoption.mjs --packet all`) | **66/66** |
| Mirror manifest | green (297 pairs) |
| `openspec validate --strict` | valid |

## Implementation chain

`17ef509` baseline greens → `582141e` K0 substrate (resolver fallback +
ctl interface + list-item rename + optical token + inset prose) →
`3c7767b` F jx-pure v2 (breaking renames, no aliases, range size
classes die, 11 consumers swept, derived pill + island 44px) →
`e2f55e0` A–E merged (five concurrent Codex packet agents, ~190
files; tabs derived_references_self fixed; two stale expectations
migrated; mirrors resynced) → `476167d` impl-r1 remediation
(verifier v2 rewrite, jx-pure residuals, HuePopover ctl) →
`8a8a1a4` verifier v2.2 hardened (brace-matching, calc(var),
exception selector+property, utility fallback, C row) →
`10cfb0b` registry cleaned (238 utility-family densityOwned entries
removed — browser phase is their verification).

## The verifier evolution (recorded for the audit trail)

v1 (28/28) was VACUOUSLY green — regex blind to :where() blocks,
browser phase ran only K0. v2 found 238 real registry mismatches
(packet agents had listed CSS selectors for utility-styled
components). v2.2 hardened with brace-matching extraction,
calc(var()) closed-token check, and exception property matching.
The registry cleanup (10cfb0b) removed those 238 entries — utility
families are verified by the browser phase + jsdom suites (the
correct contract for the utility-first law). The final 66/66 is
honest: every row gets stamps + USED values + physical lanes +
scope-resize in real Chromium.

## Owner visual acceptance (the standing human gate)

Five screenshots: `.agents/documents/2026-08-26-density-adoption/
owner-{ladder,form,boolean,table,menus}.png`. The density ladder
measures exactly 15/13/12/11px across four scopes on the built site.

## Residuals

- Pre-existing anchor/pagination svelte-check TS circularity (sibling
  component imports — confirmed at stash baseline, not a change
  regression; vitest unaffected).
- Pre-existing Svelte a11y warnings (radio aria-invalid, etc.).
- The 5 concurrent packet agents' reports are in
  `.agents/documents/2026-08-26-density-adoption/packets/`.

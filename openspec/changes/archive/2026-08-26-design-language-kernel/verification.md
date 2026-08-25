# verification — design-language-kernel

> The change's evidence index. Every claim maps to a committed gate or
> a review record in this directory.

## Review history

| round | record | verdict |
|---|---|---|
| design r1 | .agents/documents/2026-08-26-design-kernel/codex-r1-response.md | v0 scored 6.0 — hard critique + full counter-proposal |
| design r2 | …/codex-r2-response.md | converged **9.2** |
| change r1–r4 | review-design.md | 4.8 BLOCK (8 blockers) → 7.8 → 8.0 → **ACCEPT 9.4** |
| impl r1 | review-impl.md | BLOCK 4.5 — nine blockers (field-lane floor, truncate API, ItemSize alias, duplicate import, blueprint typing, wrong-ruler docs scene, incomplete gates ×3) |
| impl r2 | review-impl.md §Round 2 | 8.8 — nine remediated; sole closeout: stale manifest |
| impl r3 | review-impl.md §Round 3 | **ACCEPT 9.5 — archive** |

Codex: gpt-5.6-terra @ xhigh, herdr workspaces (released after each phase).

## Probes that shaped the design (pre-implementation evidence)

`.agents/documents/2026-08-26-design-kernel/subgrid-probe-evidence.md`
— two real-Chromium probes (7 checks + 7/7) validating: shared-ruler
alignment across rows, absent-media track retention, header span,
MIXED auto/never narrow rows under the areas-only law, density scope
inheritance, gutters-as-tracks.

## Gates by packet (commits 744fbec → 240834f)

1. **P0** — registry item `density` (registry:lib) + list-item dep
   edge + engines meta; payload/manifest regenerated (89 registry
   files).
2. **P2 theme pair** — appendix A verbatim, mirrors byte-identical;
   `node scripts/verify-density-kernel.mjs --table-only` **47/47**
   (the four-row table computed exactly, incl. media==2·line).
3. **P3 context** — density.svelte.ts both trees; jsdom suite 4/4
   (resolution law, provider stamps + shadowing + explicit-wins,
   getter reactivity via rerender, no-pixels policy guard).
4. **P4 migration** — focused vitest 21/21; full suite 492/492;
   `verify-density-kernel.mjs` **49/49** (table + inheritance + the
   §7 no-literal-branch grep); `verify-item-ruler.mjs` **14/14**
   (3/5 explicit tracks, alignment, no-media retention, span law,
   mixed narrow, the checkbox fixture); `verify-item-matrix.mjs`
   **33/33** (standalone/fallback retained).
5. **P5b** — build:site 7/7 self-checks; blueprint build committed
   (density.svg + list-item.svg).
6. **P6** — docs: media groups declare the ruler; the density-ladder
   section; built-site walkthrough **20/20** in real Chromium (all
   sections, ladder computes 15/13/12/11px, 40px derived media track,
   content-x identity, checkbox control BESIDE label, stamps, no
   data-size, zero errors); 4 Owner screenshots in
   `.agents/documents/2026-08-26-design-kernel/owner-*.png`.

## The concurrent-agent incident (recorded for the audit trail)

Every vite build was broken by the OTHER agent's in-flight
popover.css (`@supports not (A) or not (B)` — lightningcss cannot
parse compound negations; base HEAD verified clean; both kernel css
files pass lightningcss individually). At the Owner's go-ahead the
condition was rewritten to the De Morgan-equivalent
`not((A) and (B))` — identical JOINT-check semantics, mirrored, their
remaining WIP untouched (240834f).

## Residuals

- The radio `aria-invalid` compiler warning (pre-existing,
  design-required state) — unchanged from the previous change.
- `lg` adoption: kernel + list-item API + one blueprint/docs proof
  row only; broad menu/form adoption is the FOLLOW-UP
  density-adoption change (the wave boundary).
- OWNER VISUAL ACCEPTANCE is the standing human handoff — the four
  screenshots (owner-*.png) are the deliverable for it; automated
  geometry does not substitute.
- Bounded follow-ups recorded by impl-r2: inset prose vs derived
  calc alignment; layout="media" grouped posture; the declared
  --jx-d-icon-optical-inline token not yet consumed; §7 scanner
  wording scope. All non-blocking, for the density-adoption wave.

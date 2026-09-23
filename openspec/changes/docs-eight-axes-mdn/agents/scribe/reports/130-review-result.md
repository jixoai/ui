# TASK 130 — result (docs page) — 1st eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 1 MINOR / 0 LOW / 1 NIT — Tier 2 proposed.**
Owner = marginalia; independent 1st audit. Dist = 2b06c0d5 (fresh build rc=0). Port 5243
mine; killed after probes, lsof post rc=1, siblings untouched.

## Delivery-shape taxonomy: SELF-STAMP (own-element, flat content)

The outcome panel stamps its own carriers on the root when axes resolve; status paints
through semantic-hue atom groups (module-scope pure lookup). The family is the thin
surface the hero claims: glyph + title + description + actions, no routing logic.

## Findings

**MINOR 1 — the page-scoped gate is red: 1 page + 3 family diagnostics.** Page :57 — the
cx `Object.entries` overload (the `?? {}` one-liner). Family result.svelte: :105 — the
same cx class; **:132/:138 — `Record<Props['status'], string>` fails the key constraint**
(`Props['status']` is optional so the type carries `undefined`, which does not satisfy
`string | number | symbol`) — the fix is `Record<NonNullable<Props['status']>, string>`
on the two lookup tables (iconBorder/glyphColor). Mechanical. (Saved-run receipt:
/tmp/g130-scheck.txt.)

**NIT 1 — the warning status has no rendered seat.** success and error render in three
seats each and info rides the DensityDemo — but `warning` appears only in the API union
and the pill; the page teaches four outcomes and paints three. One
`<Result status="warning" title="…">` in the types canvas completes the claim surface.

## Verified-true (receipts against my armed suspicions)

- **The status hues are SEMANTIC, token-equal at the paint** (the brand-hue wall-clock
  rule: assert token equality, never literal digits):
  - success glyph color == `oklch(0.6489 0.237 195)` == the served `--primary` token —
    **the brand voice, no green** ✓ (the PlayHelp's claim verified against the token, not
    a hue guess);
  - error glyph == `oklch(0 0 0)` == the served `--destructive` token (destructive IS
    black at this theme vintage — the claim is "error paints destructive", and it does);
  - info glyph == neutral (`--border`/inherited ink) ✓ — warning shares the neutral rung
    by the same lookup.
- **The outcome glyphs are text, not color alone**: ✓ / ✕ / ! / i render as real glyph
  elements — the a11y table's "status is communicated with text" is structurally true.
- **The actions snippet composes** native PressButtons (anchor and button variants both
  rendered) — keyboard-reachable recovery actions as taught.
- **"empty is not result"** is a positioning statement, consistently taught (hero + meta +
  PlayHelp) — no falsifiable seat, no contradiction.
- Structure: toc 6 == DOM 6 == rail; **LAW #19: 49 ids, zero duplicates**; h1 ×1; 0
  undefined; the API table carries the universal marker, title required, status default
  'info' — matching the family Props.
- The DensityDemo seat renders the info panel across xs/default/lg scopes; the TokenTable
  rows are the kernel lanes (--jx-gap/--jx-stack/--jx-inset/--jx-icon/--jx-text/--jx-line,
  all "density scale") — consistent with the all-no-own supply posture (no own tokens).

## Standard battery + gates

- SSR 200 (402,592 bytes) · verify:docs **rc=0** · docs-universal **110/110**.
- Probe-fault ownership: my first glyph-hue read matched title elements (all black —
  inherited text ink) instead of the glyph elements; the exact-glyph-text finder
  (✓/✕/i, visible-only) is the receipt. The warning seat absence was confirmed against
  both the served bytes and the live DOM before filing.
- Artifacts: /tmp/g130-{pl,pb-prose,final,final2}.mjs + /tmp/g130-*.log (batch-shared).

## Open questions for the code round

1. The archetype gaps (no install/overview/see-also; no axis table — the universal
   section is a two-seat demo).
2. The warning seat (NIT 1) plus optionally a description-less + icon-snippet seat would
   cover every prop in the API table's own union.

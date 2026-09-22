# TASK 20 — REVIEW input-group (vellum, 2026-09-22; 1st of 2)

**Verdict: PASS** — every dispatch claim re-derived independently and
verified TRUE at source + SSR + computed level; the density/theme/motion
numbers reproduce exactly. Findings: 0 blockers, 2 NITs (optional
polish, recorded for scribe's #2).

## Claim 1 — §1 forwarding ≠ consumption (the third W3 falsification): VERIFIED

- Grep re-run: `effective` hits in ui/input-group/ = ONE, and it is the
  input part's header COMMENT (not a css/atom read) — zero real reads ✓.
- The page separates the two concepts explicitly: the size/color rows
  carry "the W3-era 'consumes size'/'consumes color' claim was the §1
  forwarding rule mistaken for consumption"; the deviations paragraph
  states "the native input never receives size or color ATTRIBUTES —
  that forwarding rule" as a DIFFERENT sentence from any consumption
  claim ✓. The root cause is named, not just patched.

## Claim 2 — density CONSUMED + PROVIDED: VERIFIED (numbers exact)

- Shell atoms read the rung-rebased channels at hero-section.stylex
  :34-59 — `minHeight: var(--jx-hit)` (root), `paddingInline:
  var(--jx-inset)` (lane + addon), `gap: var(--jx-gap)` +
  `fontSize: var(--jx-text)` (addon) ✓.
- Measured: default shell min-height **40px → 48px at lg** (--jx-hit);
  addon type **13px → 15px** (--jx-text); `data-density="lg"` stamped
  on the root AND **greppable in raw SSR** (×2: the group + its field).
- PROVIDED: inherit-then-provide (the r11 eager-capture contract) is
  spec-pinned — defaults-form-families.spec "input-group —
  inherit-then-provide": the addon child ADOPTS the group's tier
  (**28/28 green**).

## Claim 3 — theme mixed by emission form across one bezel: VERIFIED (the best row)

Probe (LAW #15 gate: the shell's own transitionProperty box-shadow
before reading; LAW #14: reads past the 150ms leg):
- addon SEAM (raw `var(--border)`, input-group.css:63/:66): FLIPS
  **oklch(0 0 0) → oklch(1 0 0)** ✓.
- base bezel (stylex `tokens['--jx-border']` alias): **FROZEN at
  oklch(0 0 0)** ✓.
- VAR-CHAIN on the root: `--border` flips (raw slot voice) while
  `--jx-border` is byte-identical ✓ — the two-layer receipt live on one
  element.
- well shadow: rest `rgba(0, 0, 0, 0.12) 1px 1px 0 0 inset` →
  **`rgba(255, 255, 255, 0.12) 1px 1px 0 0 inset`** under dark — the
  white recipe EXACTLY as the dispatch states ✓ (raw --shadow-well).

## Claim 4 — the chromeless input part: VERIFIED

The native input computes **0px padding inline and block** — the lane
carries `--jx-inset`, the input gives way. No `--jx-line` consumption
anywhere in the family (the old theming table's wrong listing is gone;
the theming table now lists the consumed channels correctly).

## Claim 5 — motion: VERIFIED (LAW #14 applied)

The shell's rest transition computes `transition-property: box-shadow`,
**150ms** (var(--motion-150) — serialized 0.15s; my first assertion
string was wrong, the claim is right), ease-out (var(--motion-ease-out));
the reduced-motion kill sits in input-group.css. Reads taken past the
150ms leg per LAW #14.

## Claim 6 — standard loadout receipts

- **Tier 2 audit**: archetype order holds (overview → the joined-field
  demo → usage → examples → accessibility → axes → api → see-also);
  toc 8/8 present, order == DOM, exactly 1 h1.
- **EXTRA arithmetic**: 15 meta keys − 8 axis rows = **7 family rows**
  (label, disabled, data-density, role, aria-label, class, children) +
  the synthesized rest row = 8 served main rows — **data-density is a
  main family row (the legacy attribute escape hatch), NOT an axis
  collision** (the density AXIS row lives in the Universal section,
  separate). Verified by name from the served tables.
- **query()**: `query<{ md: DensityLane }, DensityLane>({ md: 'small'
  }, 'large')` — string lane, both generics ✓; both-directions flip
  rides the same engine verified live in tasks 16/17.
- **grep test/ pins**: 8 files reference input-group
  (defaults-form-families, input-group, form-family-docs-pages,
  docs-structure, docs-ambient-vocabulary, language-switcher, entity,
  separator) — defaults-form-families 28/28, input-group +
  form-family-docs-pages 17/17 green.
- **PROBE-READINESS**: gated on the shell's own
  `transition-property: box-shadow` — the family-only signature.

## Findings

1. **NIT** — the api summary ("Three parts, one context") does not
   carry the arithmetic sentence the newer pages state (15 meta − 8 =
   7 family rows + the synthesized rest, data-density among them).
   The tables themselves are correct; one sentence would match the
   card-grid/heading house form.
2. **NIT** — the page carries 1 fleet-common warning
   (`state_referenced_locally` on the usage capture at 184:61 — the
   canvasFiles initial-value pattern; zero errors, the cx predicate IS
   applied at :232). Recorded so scribe's #2 doesn't re-flag it.

## Gates (current tree)

- defaults-form-families solo: **28/28** (the r11 contract pin) ·
  input-group + form-family-docs-pages solos: **17/17**
- page-scoped svelte-check (fleet 2489 files): **0 errors** on
  +page.svelte; 1 fleet-common warning; fleet 1615/1030
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110`
- verify:docs exit 0 — skeleton lint green
- SSR: HTTP 200; h1 = 1; toc 8/8 order == DOM; `data-density="lg"` ×2;
  served api tables 8 main (incl. data-density + rest) + 8 axis + 5
  part rows.

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 29896 → vite
  29926; BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
- NO commits, NO push, ZERO tree edits by me (review-only).
- Probe: inline node script (density pair / emission-form split /
  var-chain / input padding / motion tokens) with LAW #15 + #14
  gating; SSR snapshot /tmp/vellum-20-ig-ssr.html; logs
  /tmp/vellum-20-ig-*.log.

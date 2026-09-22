# Task 13 — hero-section (CODE) · quill · 2026-09-22

**Verdict: LANDED (working tree; no commits per brief).** Tier 2 rewrite of the
hero-section docs page to the MDN archetype + new curation file. The family
source is UNTOUCHED (the hue-injection byte-identical mirror pin holds —
`cmp` verified).

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/hero-section.html/+page.svelte` | tier-2 rewrite: + Install, + Overview, + generated meta+curation Props, + the eight axes (per-axis table + measured demos + query case + fixed-paint TokenTable), + See Also; hero canvas / wide-form pan / slots list / a11y kept; types+theming folded into axes |
| `apps/www/src/routes/docs/components/hero-section.html/+page.ts` | ToC: +overview, +demo, +axes; survivors kept (wide-form/slots/usage/accessibility/api); types/theming folded |
| `apps/www/src/lib/ui/props-table/docs/hero-section.docs.ts` | NEW curation: 12 overrides (incl. the snippet-conditional copyCommand law and the Omit<'title' \| 'color'> collision note) — no EXTRA lane |

## Test pins found BEFORE first edit (the loadout that mattered)

- `test/hue-injection.spec.ts:155` — the family source must contain
  `'jx-hue-success'` (the copied-CTA injection class) → docs-only task, family untouched.
- `test/hue-injection.spec.ts:158-166` — the family is a BYTE-IDENTICAL mirror
  pair with the registry → any family edit would need a double write; none made.
- `test/docs-ambient-vocabulary.spec.ts:355` — hero-section in expectedCarriers.
- `test/docs-structure.spec.ts:239` — route in the page manifest.
- `test/terminal-patterns.spec.ts` + `pattern-hero-host.svelte` —
  pattern-hero-set composes the hero (the composer receipt for Overview).

## The measurement story (probe r1 DISPROVED the brief's hypothesis)

r1 failed one assertion — **the summary did not flip** under a dark island,
contradicting my "three ink voices" hypothesis. r2/r3 re-derived from the var
chain and found the real law, which is BETTER than the hypothesis:

**THEME = THE PARTIAL POLE, SPLIT BY THE DECLARING-SCOPE LAW (emission form decides):**
- **Flip (2 voices)**: eyebrow `color: 'var(--primary-text)'` and title-em
  `var(--primary)` (hero-section.css:32) — both written as RAW var() strings,
  so substitution runs at the CONSUMING element; the stamped `.dark`
  re-substitutes them (measured: `oklch(0.55 0.12 …)` → `oklch(0.7044 0.1872 …)`).
- **Freeze (the muted voices)**: summary and badges ride
  `tokens['--jx-muted-foreground']` — a stylex `defineVars` member
  (tokens.stylex.ts:207) whose alias is declared at the stylex **:root theme
  scope**; the section inherits the already-substituted light value, and a
  scoped `.dark` cannot re-base it.
- **Var-chain receipt (probe)**: on the section element itself,
  `--muted-foreground` flips `oklch(0.3211 0 0)` → `oklch(0.8452 0 0)` while
  `--jx-muted-foreground` is byte-identical in both panels — the freeze is the
  ALIAS's declaring scope, not the slot block.
- Composition guidance now in the page: a dark hero island flips the accent and
  keeps the page's muted lead ink — a dark hero wants a dark host surface.

**SIZE = MEASURED INERT ON THE PAINT (the heading contrast case)**: the §11
stamp lands (`--jx-size-effective: 14px; font-size: var(--jx-size-effective,
1rem)` verbatim in the raw SSR) and the section's computed font-size moves to
exactly 14px — but NOTHING follows: the title clamp is
`clamp(2.4rem, 6cqi, 4.4rem)` (rem floor / container-fluid / rem cap) and the
micro voices ride the fixed `--text-*` px steps; none is em-of-parent.
Control: the auto panel's section computes 16px (stamp detectable), the title
is byte-identical across the pair.

**DENSITY = SUPPLY-ONLY ON SELF, CONSUMED BY COMPOSITION (measured)**: the
hero's own atoms read none of the rung-re-based channels (grep receipt:
`--jx-text/--jx-line/--jx-gap/--jx-stack/--jx-media-gutter` — zero hits; the
hero rides the fixed `--text-*` micro voices + `--space-*/--jx-unit` kernel),
and the probe confirms the own-summary holds at 16px — while the GUESTS
inherit: composed CTA (press-button reads `var(--jx-text)`) 13→12px, composed
Badge 12→11px at `density="sm"`. The rung scope IS the section (the stamp sits
on the root the guests live in — no wrapper paradox), `data-density="sm"`
greppable in the raw SSR. The component header's own words: the supply chain
is the point.

**COLOR / SHAPE / RADIUS / ELEVATION / MOTION = supply-only** (zero
`-effective` readers family-wide; zero corner/shadow declarations). Motion's
cascade is the family's OWN law: `--motion-hero` 480ms + `--ease-hero` kernel
presets read verbatim, per-step `--jx-hero-delay`/`--jx-hero-rise` inline
seams, `fill-mode: backwards`, `prefers-reduced-motion` kill (LAW #14:
animation, not transition).

## EXTRA arithmetic

Meta = 20 props; 8 ambient axes → generated Universal section; main table =
**12 rows** (eyebrow, summary, copyCommand, copyLabel, title, badges, copy,
terminal, secondary, class, style, rest), all curated, no EXTRA lane. SSR
parse confirms: 12 main rows + 8 generated axis rows + 8 per-axis table rows +
the TokenTable (source column dropped — fixed-paint fold).

## One-h1 law

The page owns exactly one h1 (the hero SectionCard). The DEMO heroes mint h1s
through the family's `data-jx-hero-title` hook — the docs lint's
component-owned-title exemption (verify-docs-structure.mjs `demoScopeHeadings`)
— so unlike the heading page, no `data-doc-demo-scope="headings-ok"` is
needed: the hero's headings ARE the component under test's own output.

## Gates

| Gate | Result |
|---|---|
| test pins grep (before first edit) | 4 files + 1 fixture found; all honored |
| affected specs solo BEFORE | **405/405** (baseline moved from 402 — same-day truth recorded) |
| svelte-check (page-scoped, after) | hero-section.html exactly 1 error — the standing cx idiom at 183:28 (count-neutral); hero-section.docs.ts clean |
| dev-smoke :5241 | 200; killed by PID; `lsof :5241` empty before AND after |
| SSR raw bytes | size stamp + `data-density="sm"` + `data-jx-hero-title` ×14 + 12/8/8 table rows all verbatim |
| probe | PASS r3 (r1's failure = the discovery) |
| build | exit 0 |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| affected specs solo AFTER | **405/405** = before |
| family mirror | untouched; `cmp` byte-identical |

No commits made. Report file: `agents/quill/reports/13-hero-section.md`.

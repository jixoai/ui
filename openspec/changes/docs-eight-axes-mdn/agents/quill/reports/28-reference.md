# Task 28 — CODE reference · quill · 2026-09-23

**Verdict: LANDED (working tree; no commits). Tier 2 优化重构** — the
skeleton (151 lines) carried a law-grade resolution-matrix demo and an
a11y table, but had NO install, NO overview, NO law section, NO postures,
NO see-also, NO ToC file at all (+page.ts did not exist), NO measured
axes, and the old universal-props prose. Tier 1 would leave the archetype
layers absent; tier 3 would rewrite a 196-line family that is complete
and spec-pinned. The family is untouched.

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/reference.html/+page.svelte` | + Install, + Overview (the target-self-description grammar, the two-state edge machine, the inheritance pole), + law section (the edge-emission state machine, 5 rows), + types postures (numbered-domain wrapped), + axes (8 rows + 4-panel rig + query case + contrast TokenTable), api completed (2 contract rows + universal), a11y upgraded (the harvester edge + the children contract), + SeeAlso, typed cx predicate |
| `apps/www/src/routes/docs/components/reference.html/+page.ts` | NEW — the skeleton shipped no ToC file: 8 entries, toc == DOM, install + see-also OUT |

No matrix re-pin owed: reference is in neither the ambient matrix nor the
tasksUniverse bijection (verified pre-write).

## Tier justification (gap analysis)

Skeleton inventory: hero (law-grade), the resolution matrix (law-grade —
kept nearly verbatim, given an id + data attrs), usage, a11y table (thin —
upgraded), universal-props prose (folded), api 2 rows (kept + universal).
Missing archetype layers: install, overview, law-notes, postures, axes,
see-also, ToC. Tier 2: add the layers, fold the prose, keep the carried
sections; family untouched.

## The measurement story (probe PASS; medium: headless Chromium, settled state = hydration + two rAFs + margin)

- **Size = CONSUMED THROUGH INHERITANCE — the kbd contrast's other pole,
  measured in two contexts**: the ambient reference computes **13.5px in a
  13.5px prose context** (inherited); the size={18} reference computes
  **18px inside a 16px context** — the §11 stamp lands ON the anchor and
  the label inherits from it. The family declares no fontSize anywhere
  (no atoms file, no css file — the whole surface is the promotion-seam
  style + the preflight's `a { color: inherit }` law).
- **Density = STAMP-ONLY, scope-carrier**: density="small" lands
  data-density="sm" on the root while the anchor's own voice stays the
  context's (16px, unchanged — the anchor reads no kernel channel). The
  stamp matters for what the children escape hatch carries. No opinion →
  no attribute (measured null on the ambient lane).
- **Theme = BRIDGE-ONLY, measured**: class:dark lands on the root;
  NOTHING consumes it. The injected `.dark` island moved neither ink nor
  ground (color oklch(0 0 0) before AND inside) — the preflight's
  color: inherit chains from OUTSIDE the scope. A citation is
  deliberately cascade-passive.
- **The state machine, live**: resolved references carry href + data-ref-to
  ("Eq (1.1)" / "§ 1.1" / bare-title postures all resolve); the
  settled-missing instance degrades to the loud span "??(eq-never)" with
  the edge RELEASED (no data-ref-to, not an anchor) — the SSR bytes carry
  the fallback anchors' edge claims (5 × data-ref-to prerendered) exactly
  per the two-pass harvester contract.
- **The children escape hatch**: the postures demo renders Eq (1.1) beside
  上式 — same href, same edge, label replaced.
- **query()**: size={query({ md: 18 }, 13.5)} → 18px at 1280px (md = 48rem
  cited; number lane bare).
- **Supply-only**: shape/radius/color/elevation/motion — zero carrier
  readers (grep receipt: the family ships no css; the only style-adjacent
  surface is the carrier stamp itself).

## The rig-authoring discovery (the numbered-domain requirement)

My first rig wrapped each panel in `NumberingProvider + Figure + Reference`
— the references DEGRADED to ??(eq-ax-a) spans: a Figure only registers a
referenceable target inside a NUMBERING DOMAIN, and the domain is created
by a numbered SectionCard, not by NumberingProvider alone (NumberingProvider
supplies the document-level target registry; the numbered Section creates
the counting domain that assigns numbers and completes registration). The
old universal-props demo had the same latent shape (provider + figure, no
numbered section) — its references would have degraded the same way.
Fixed by wrapping every rig panel and the postures demo in
`SectionCard numbering="decimal"`; post-fix, all rig references resolve.

## Vocabulary sweep

The page's claims were swept for the kbd law: no "inherits"/"shrinks"/
"grows" claims exist EXCEPT the deliberate inheritance teaching (size row,
Overview paragraph 3, contrast pair) — which is the measured truth for
THIS family (the opposite pole of kbd's own voice, both documented as the
contrast pair).

## Gates (final state, after the LAST write)

| Gate | Result |
|---|---|
| svelte-check | reference.html page: **0 diagnostics** (two caught pre-gates: the raw-brace attribute parse error, the missing TokenTable import, and the `${close}` dodge for the query snippet) |
| dev-SSR + probe :5241 | h1 ×1, marker ×1, toc == DOM (8 + chrome out), 5 prerendered data-ref-to edge claims in the SSR bytes, all postures resolve, settled-missing span served; server + wrapper killed by PID; `lsof :5241` EMPTY before AND after |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| docs-ambient-vocabulary solo | **284/284** (reference is outside the bijection universe) |

## Open questions

1. **The bare-Figure degrade**: a Figure outside every numbering domain
   renders (with its own bare-fallback law per figure.svelte's doc) but is
   not a referenceable target — references to it degrade to
   settled-missing. The family docs call this "bare use is not legal
   reference target"; the page's law table covers the reference side. If
   the fleet ever wants bare-id figures referenceable, that's R4 (the
   living-spec record already defers Entry targets to R4).
2. **The `rest`-less interface**: reference takes exactly to/children + the
   eight axes — no class, no rest spread (the sweep's declared exception
   class). A consumer needing a class wraps or uses the children hatch.
   Stated in the api summary; flag if the fleet wants class forwarded.

No commits made. Report file: `agents/quill/reports/28-reference.md`.

# TASK 18 — REVIEW inline-code (2nd of 2, scribe) — co-signed closure

- **Reviewer**: scribe · 2026-09-22 · findings filed BEFORE the cross-read of vellum's 1st review (`agents/vellum/reports/18-review-inline-code.md`), then consolidated
- **Target**: quill's page integrated at `6c812e41` — tier-3 by pin density (the triple-pinned hand table survives; archetype gaps only)
- **VERDICT: PASS — co-signed closure; inline-code becomes page #17**, with the co-signed one-line toc fix riding (see finding 1)

## Extra duty 1 — pin-density tier-3 as process: VERIFIED

- **Integration diff** (`git diff 6c812e41^ 6c812e41`, page files): the page change is the cx `.filter(Boolean)` → type-predicate line, DocsInstall/DocsSeeAlso imports, and the install/overview/see-also section additions; `+page.ts` is the toc rewrite. **Zero table-row touches** (grep over the diff for row-bearing lines: 0). Gaps-only shape exact.
- **Pin (a) — variant invariant** (docs-ambient-vocabulary.spec:452): source read (`axisRowsOf(pageSource('inline-code'))` filtered to variant — exactly 1, default contains 'ambient zone') AND served bytes (SSR hand-table variant row: `'fused' | 'tonal' | 'outline'` / `'fused' · ambient zone`) ✓. Spec executed: **283/283 solo, exit 0**.
- **Pin (b) — matrix exemption** (:559): `if (route === 'inline-code' && c.prop === 'variant') continue; // exempt: invariant-locked` at source; the 283-run includes the bijection ✓.
- **Pin (c) — variant-grammar registry-path listing**: `variant-grammar.html/+page.svelte:89` — `InlineCode: '@ui/inline-code'` in the usage map ✓.
- **inline-code.spec.ts: 22/22**, exit 0.

## Extra duty 2 — kinship naming: shape-agnostic greps, exact

- **The shared edge**: `import { HIGHLIGHT_KEY, type HighlightContextValue } from '$lib/highlight/context-key'` at inline-code.svelte:237 AND code-card.svelte:89 — same two symbols, same module; both are `getContext` consumers (:330 / :223). The provider creator (`createHighlightContext`, context.svelte.ts:91 setContext) is mounted on the inline-code DOCS PAGE (page :93-98: `setContext(HIGHLIGHT_KEY, { backend: microLighter() })` — a demo backend) and never by code-card's page.
- **The chip is a leaf**: zero highlight-edge references in ui/chip/ (its two "Highlight" grep hits are the focus-ring token name); zero component imports. Its docs-page mounts are many (variant-grammar, effects, prose…), its blueprint scene (scenes/chip.svelte) is the demo mount — the dispatch's "sole mounters = blueprint scenes" phrasing is loose, the leaf fact is grep-true.
- **Law-kinship ≠ composition** holds in both directions: neither family mounts the other; the edge is a module-level symbol share.

## Extra duty 3 — family recipes measured (live probes)

| Recipe | Page claim | Measured |
|---|---|---|
| fused | transparent bg + backdrop contrast(0.85) + 1px transparent border | `rgba(0,0,0,0)` + `contrast(0.85)` + 1px `rgba(0,0,0,0)` ✓ |
| tonal | oklab 12%/45% | bg `oklab(0.3211 0 0 / 0.12)`, border `oklab(0.3211 0 0 / 0.45)` ✓ |
| outline | 1px structural | 1px `oklch(0 0 0)` ✓ |
| zero markup | highlighted chip children = [comment, text, comment] | found verbatim on the `tonal · injected success` chip — childTypes **[8, 3, 8]**; ONE text node carries the code; the engine adds zero elements ✓ |
| density radius ladder | --jx-chip-radius 2/2/2/4/8 | **2/2/2/4/8px** across 2xs/xs/sm/default/lg ✓ |
| padding formula | padding-inline = radius + fontSize×(lineHeight−1)/2; 7 = 4 + 12×(1.5−1)/2 | default **7px** ✓ and the formula holds at EVERY rung: 3.25 / 3.75 / 4.475 / 7 / 11.5 ✓ |
| size={18} | stamp, type steps 18, padding holds 7 | stamp verbatim `--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)`; type **18px**; padding **7px** (the calc reads the modifier, not the axis stamp — the non-collision measured) ✓ |

## Extra duty 4 — vellum's MINOR: re-derived TRUE before the cross-read

Served anchor list: 12 entries (`#overview` … `#api`) — **no `#universal-props`**, while the DOM section exists at +page.svelte:562 (between theming :561 and api :577, the carriers-JOIN summary + the size={18} demo). The one section a reader can't reach from the rail is the campaign's headline deliverable. Per the button-group precedent, the co-signed one-liner rides this closure: `{ id: 'universal-props', label: 'The eight axes' }` after `theming` in +page.ts.

## Standard loadout

- **Archetype/SSR byte order**: hero → install → overview → variants → engine → detection → geometry → modifiers → types → usage → accessibility → theming → universal-props → api → see-also; toc (11 ids) all present, 0 dead, relative order == DOM order; install/see-also correctly unlisted.
- **One h1** (hero, :263) — SSR count 1.
- **query absence**: the single `query()` string on the page is universal-section PROSE (the axis grammar vocabulary); no query-typed prop, no query() call — consistent with a stateless native-code family (density via the ambient scope).
- **svelte-check**: 0 errors on +page.svelte (workspace 1616, sibling churn; fleet floor is not this page's).
- **Raw-SSR tables**: 5 tables, 0 empty cells; hand table 10 rows (variant…class; density correctly living in the universal 8, whose cells are `'auto' · ambient scope`).

## Findings (severity-tagged)

1. **[MINOR — vellum's, independently re-derived TRUE, co-signed]** toc omits `#universal-props`. One line, specified above. Rides the closure.
2. **[NOTE — receipt attribution]** the [8,3,8] comment nodes are the page author's own Svelte markup comments flanking the chip text (found on the hue-injected specimen), not engine or stylex artifacts — vellum's report attributes them to "stylex dev markers"; the receipt (one text node carries the code; zero element nodes) is identical either way. Recorded for the next auditor.
3. **[NOTE — dispatch phrasing]** "chip: sole mounters = blueprint scenes" is loose — the chip's docs-page mounts are many; the precise leaf claim is "zero component imports + zero highlight-edge references" (grep-true) and the blueprint scene is the demo mount. Kinship naming suggested for the BOARD entry.

No blockers. No additional findings beyond vellum's MINOR + two notes — the two reviews converged independently on every measured claim.

## Gate receipts

| Gate | Result |
|---|---|
| inline-code.spec.ts | 22/22 (exit 0) |
| docs-ambient-vocabulary solo (pins a+b+bijection) | 283/283 (exit 0) |
| verify:tailwindless | GREEN — `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red` (exit 0) |
| verify:docs-universal | GREEN: 110/110 (exit 0) |
| verify:docs | skeleton lint staged scope green (exit 0) |
| svelte-check | page 0 errors (workspace 1616, sibling churn baseline) |
| Live probes | recipes ×3, zero-markup [8,3,8], ladder 2/2/2/4/8, padding formula ×5 rungs, size stamp — all PASS |
| Raw SSR | 200; 1 h1; toc 12 anchors 0 dead (universal-props gap = finding 1); 5 tables 0 empty |

## Process evidence

- Port **5243**: lsof empty before; PID `45542` killed → lsof **empty**, no ps residue, background task exit 143 (my SIGTERM). **No commits, no pushes.**
- Independence law held: findings + the MINOR re-derivation completed before the cross-read; the two reviews converged without contact.
- Artifacts: probes `/tmp/scribe-18-probe{1,2}.mjs` + `/tmp/scribe-18-probe1.log`; SSR `/tmp/scribe-18-ssr.html`; gate logs `/tmp/scribe-18-{icspec,av,scheck}.log`.

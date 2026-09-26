# Task 15 — image (CODE) · quill · 2026-09-22

**Verdict: LANDED (working tree; no commits).** Tier 2 rewrite of the image
docs page to the MDN archetype. Family source untouched (both mirrors
`cmp`-identical — the stylex header's mirror law holds, though no test pins
it here).

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/image.html/+page.svelte` | tier-2 rewrite: + Install, + Overview, + the per-axis table + measured demos + query case + fixed-paint TokenTable, + See Also, expanded hand props table (9 rows); hero canvas / no-CLS law / fallback demos / a11y kept |
| `apps/www/src/routes/docs/components/image.html/+page.ts` | ToC: +overview, +image-demo, +axes; survivors kept (usage/image-law/accessibility/api); types/theming folded |

Sibling in-flight file observed untouched: `props-table/docs/color-picker.docs.ts`
(untracked, another agent's).

## Pre-flight decision: NO meta generation (a pinned-truth boundary)

image has **no `image.meta.ts`**, and `image` is **NOT in the
docs-ambient-vocabulary carriers bijection set** (96 families, spec :355).
Generating the meta would add image to the extractor's carriers set and FAIL
the "exactly the known carriers" bijection. Decision: keep the hand PropsTable
with the `universal` directive (the marker the docs-universal gate counts —
110/110 held). Recorded as a fleet follow-up: generate image.meta.ts AND
expand expectedCarriers in the same change (the vocabulary decision belongs to
the fleet, not a docs task). No curation file — those attach to meta-driven
tables.

## Test pins found BEFORE first edit

`test/batch6-antd2-components.spec.ts:180-199` — the family lifecycle:
required intrinsic dims render verbatim + loading=lazy + decoding=async; a
failing src renders `[data-jx-image-broken]` and removes the img; alt="" stays
decorative through failure; src-change recovery. Docs-only task honored —
family untouched.

## The measurement story

- **Greps**: zero `-effective` readers in ui/image/; zero raw sheet tokens
  (every panel voice is a `tokens['--jx-…']` defineVars alias); zero
  corner/shadow/transition declarations; the panel padding rides the kernel
  `--space-24` step (not a density-rebased channel).
- **Composer hypothesis DISPROVEN both directions** (shape-agnostic greps):
  image imports nothing but the icon (no avatar/skeleton composition — the
  header's "on avatar's proven laws" is a LAW KINSHIP, not a composition), and
  only the blueprint scene mounts it — a leaf, like empty/heading.
- **Theme = the frozen pole, the PURE emission-form case (probe PASS)**: light
  and dark broken panels compute BYTE-IDENTICAL faces (bg oklch(0.9551 0 0),
  border oklch(0 0 0), ink oklch(0.3211), padding 24px). Var-chain receipt on
  the panel element: `--muted` FLIPS under the stamped .dark (oklch(0.9551) →
  oklch(0.2178)) while `--jx-muted` (the defineVars alias, resolved at the
  stylex :root scope) is identical both sides — the atom reads the alias, so
  the face never re-substitutes. The third independent proof of the
  substitution-site law (vellum's empty, my hero, now image — image is the
  pure case: zero raw-var voices, so nothing flips at all).
- **Size = measured inert (the second heading-contrast case)**: the stamped
  img computes font-size exactly 14px (control 16px — stamp detectable) while
  the rendered box stays the attributes' 96×96 — pixels have no em voice.
- **The merge law, SSR/live receipt**: the broken panel's style attr carries
  the intrinsic dims joined (`width: 96px; height: 96px;`) — with axis lanes
  the carriers join ahead of them; the axis surface survives failure.
- **Lazy-load probe lesson**: off-screen `loading="lazy"` images never fire
  onerror — the probe must scroll the failure panels into view and wait for
  the swap (SSR renders every demo as an img root; the broken panel exists
  only post-hydration).
- **query() case**: responsive density on the failure surface (both generics,
  string lane) — what the breakpoint moves is the stamp on the broken panel
  plus the COMPOSED slot content's inherited channels (supply-only-on-self).

## EXTRA arithmetic

No meta → no synthesized rest row (vellum's lesson noted; the hand table
serves rest explicitly: 9 content rows — alt, width, height, src, fallback,
onerror, class, style, ...rest — + 8 universal rows rendered from the shared
schema via the `universal` directive + 8 per-axis rows. SSR parse confirms
9+1(alt in a11y table)+16 rows and exactly 1 `data-jx-props-table-universal`
marker).

## Gates

| Gate | Result |
|---|---|
| test pins grep (before first edit) | batch6 lifecycle pin found; docs-only honored |
| affected specs solo BEFORE | **405/405** |
| svelte-check (page-scoped, after) | image.html exactly 1 error — the standing cx idiom at 127:28 (count-neutral; the old page carried the same idiom) |
| dev-smoke :5241 | 200; PID 67743 killed; `lsof :5241` empty before AND after |
| SSR raw bytes | 11 img roots, size stamp `--jx-size-effective: 14px` verbatim, 9 content rows + 16 axis rows, 1 universal marker |
| probe | PASS (theme byte-identity + var chain; size 14px/96×96; merge dims) |
| build | exit 0 (site + registry + llms.txt coexist) |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| affected specs solo AFTER | **405/405** = before |
| family mirrors | untouched; `cmp` identical |

No commits made. Report file: `agents/quill/reports/15-image.md`.

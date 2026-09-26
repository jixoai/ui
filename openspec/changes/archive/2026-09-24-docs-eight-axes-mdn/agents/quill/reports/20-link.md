# Task 20 — link (CODE) · quill · 2026-09-22

**Verdict: LANDED (working tree; no commits).** Tier 2: the skeleton already
carried Install + the lanes/icon/detection craft sections; the archetype work
was Overview, the measured axes layer, the meta-driven props table, and the
retirement of the W3-era movement-implying demo panels. Family untouched —
four mirrors `cmp`-identical.

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/link.html/+page.svelte` | + Overview; universal-props → **the eight axes** (per-axis table + measured demos + query case + fixed-paint TokenTable); props table → generated meta + curation (7 rows); the FALSE-implying W3 panels retired ("external · primary", "radius medium"); the cx predicate applied |
| `apps/www/src/routes/docs/components/link.html/+page.ts` | ToC: +overview, +icon, +axes; DOM-order faithful; universal-props folded |
| `apps/www/src/lib/ui/props-table/docs/link.docs.ts` | NEW curation: 7 rows (href's external contract, the tri-state icon law, the #4 seam on style, the post-spread separator law on rest) |

## Test pins found BEFORE first edit

`reading-content-family.spec.ts:326-377` — the link runtime lock: the valued
hook `data-jx-link={external|internal}`; the external pair
target=_blank/rel=noreferrer landed only on detected externals; the tri-state
icon (undefined = default glyph IFF external, null = off, snippet = custom;
internal never carries the lane); the inline-core SSR-painted glyph at
`width="0.8em"` (the no-font-size kinship). `variant-grammar.spec:41` — the
page's registry paths must exist. `canvas-same-source.spec` — the page is in
the PILOTS list. Family untouched.

## The measurement story (probe PASS)

- **Size = CONSUMED through the em voices, measured**: the stamp sets the
  anchor's font-size — the label text inherits it (the anchor atom declares
  NO font-size of its own) — and the 0.8em external glyph rescales:
  **stamped 14px anchor → 11.1875px computed glyph** (0.8 × 14; the control
  sits at the ambient 16px). The underline offset does NOT follow: it is the
  fixed 4px optical calibration (the measured contrast inside one element).
- **Theme = the frozen pole's pure-alias case, measured**: light and dark
  islands compute **byte-identical ink** oklch(0.6489 0.237 160) — the ink is
  `tokens['--jx-primary']`, a defineVars member resolved at the stylex :root
  theme scope. Var-chain receipt on the anchor: `--primary` FLIPS
  (oklch(0.6489 0.237 160) → oklch(0.7044 0.1872 calc(160 − 4)) — the live
  −4° dark drift again) while `--jx-primary` is identical. The one platform
  exception: forced-colors swaps the ink to LinkText by media query — the
  axis is not involved.
- **The craft geometry, measured**: rest = no underline, hover = underline,
  `text-underline-offset: 4px` throughout; the icon lane = 0.2em
  inline-start gap + vertical-align −0.125em, the promotion seam
  `--link-icon-gap` owning the whole label-to-glyph distance.
- **The external pair, live**: data-jx-link="external" + target=_blank +
  rel=noreferrer + glyph lane on the external; internal → hook "internal",
  no target/rel, no lane.
- **Leaf, precisely**: the ONE component edge is markdown-node (prose links
  map to it — the promotion's whole point); the family imports nothing but
  the icon. "Everything imports NOTHING" was false — one edge, named.

## EXTRA arithmetic

Committed meta: **15 raw entries, zero duplicates** (href, title, icon,
children, class, style, rest + 8 axes). Rendered account:
**15 − 8 axes = 7 main rows**, all curated — no EXTRA lane (fontSize
deliberately does not exist on this family; the modifier lives on the text
family). Rest-row note: the synthesized rest row IS served by the meta table
and curated (the post-spread separator law named). SSR parse confirms the
rows and the universal marker.

## Gates

| Gate | Result |
|---|---|
| svelte-check | link page: **1 diagnostic — the PRE-EXISTING arrowGlyph snippet-type quirk** (byte-identical markup on HEAD; the svelte-check "two unrelated Snippet types" duplication on the `Snippet \| null` prop). docs.ts 0 |
| dev-smoke :5241 | 200 (after fixing my own `close is not defined` — the queryUsage I added used the splice const the raw-code lane never needed); PID 84813 killed; `lsof :5241` empty before AND after |
| probe | PASS (all four stories above; one sub-pixel tolerance fix — computed 11.1875px vs the nominal 11.2) |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| build | exit 0, no prerender 500s |
| affected specs solo (5 files) | **440/440** |

No commits made. Report file: `agents/quill/reports/20-link.md`.

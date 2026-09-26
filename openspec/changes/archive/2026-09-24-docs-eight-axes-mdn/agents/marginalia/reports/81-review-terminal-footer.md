# TASK 81 — SECOND REVIEW terminal-footer.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (2nd of 2; quill's page — vellum's 1st was PASS 0M/1m/2L/1N,
  the MINOR + LOWs landed at be928d80. Independence law held: quill's 67 and vellum's
  75 were opened only AFTER the findings below were fixed; the concordance addendum
  follows at the end)
- **Target**: `apps/www/src/routes/docs/components/terminal-footer.html/` over the
  terminal-footer family (svelte 156 / stylex 72 / css 57 / column 52 / defaults 42),
  served live on :5244.
- **Method**: source reads (the metaRow atoms :33-60, the css lanes :34-57, the
  Omit-'color' Props :55, rest-spread :103/:147), headless Chromium over dev SSR :5244
  with viewport-resize clamps, a staged-vs-body-level theme drive, a real-hover ramp
  sample under an injected 2s token, SSR payload parse, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT new. All three landed items
  re-derived on my own instruments; the host layer, ghost clamp, hover triad, density
  paint-invariance, and the EXTRA verdict all stand.

## The landed MINOR — the size row's FREE TEXT ONLY: re-derived ✓

The seat is the query `size={query({ md: 18 }, 13)}` (source :178):

| viewport | host font-size (the §1 stamp) | metaRow | links | © line | titles |
|---|---|---|---|---|---|
| 1440 (stamp 18) | **18px** | **12.5px** | **12.5px** | **12.5px** | **11px** |
| 600 (stamp 13) | **13px** | **12.5px** | **12.5px** | **12.5px** | **11px** |

The rendered text is CONSTANT at 12.5/12.5/11 across both stamps — the metaRow atom's
fixed `--jx-text-small` / `--jx-text-label` steps (stylex :41/:60; the family's own
comment pins the digits: "12.5px IS --jx-text-small; 11px IS --jx-text-label"). The
host stamp moves (18px → 13px) and nothing rendered follows it — the landed row's
"FREE TEXT ONLY" teaching is true, and I add the 13px cross-check to the 18px receipt
(the row's "the earlier 30px receipt was the root font-size itself" note is consistent
with the host-only movement I measured).

## The landed LOWs — both re-derived ✓

1. **The frozen-ink clause (alias-theme law aligned)**: the staged theming footer
   under root html.dark keeps the light ink — meta/link **oklch(0.3211 0 0)**, ghost
   stroke **oklab(0 0 0 / 0.55)** (both pinned by the stage). The SAME footer cloned
   to body level under root dark: meta ink **oklch(0.8452 0 0)** (the dark
   muted-foreground — the clone receipt verbatim) and ghost stroke **oklab(1 0 0 /
   0.55)** (white tint). Location decides; the clause's island-true /
   root-dark-re-derives split is exactly what the tree shows. Note the two-chain
   contrast on one element group: the ghost stroke reads `var(--border)` DIRECTLY (a
   site token — re-derives with the scope) while the meta ink reads the
   `--jx-muted-foreground` :root alias (frozen under any mid-tree scope) — the
   alias-theme law's tier boundary visible inside one footer.
2. **The pin site named**: the theme row (:148) names
   `div[data-theme="light"].jx-light`; the live census finds **4 such stage divs, 3
   holding footers** — the served demos stay light-stroked under page-dark exactly as
   the row teaches.

## The HOST LAYER, ghost clamp, hover triad, density invariance — all stand

- **Host layer**: the hosts are real `<footer>` elements (census: 9, all
  `tag: "footer"`, one staged); the theme row's HOST-DECIDES split (no theme literal —
  `theme="dark"` only stamps the class; the paint follows the tree) is source-true
  (no shell literal in the family) and live-true (the C census above).
- **Ghost clamp, digit-exact**: `.jx-footer-ghost` font-size **140.8px @1280** (11vw
  under the cap) and **144px @1600** (the 9rem cap) — the TokenTable's two numbers,
  both re-derived at the exact viewports.
- **Hover triad**: authored `color 0.15s ease-out` on column links (the css's
  `--motion-150`/`--motion-ease-out` seam); injecting `--motion-150: 2s` moves the
  computed duration to **2s**; a real hover mid-ramp samples
  **oklab(0.498 −0.115 −0.056)** — between the muted start and the brand hue (the
  ramp is live, not a snap); under emulated reduced motion the transition **survives**
  (`color 2s` still computed) — RM-preserved, as billed.
- **Density paint-invariant**: across the DensityDemo rungs 2xs/xs/sm/default/lg the
  footer paint is identical — ghost 144px, meta 12.5px, padding-block-start 32px,
  max-width 1440px at every rung. (Instrument note: my first pass compared footer
  HEIGHTS page-wide and got 442/267/290 — container-width wrapping in 203px rail
  cells, not density paint; the paint metrics are the invariant receipt.)
- **EXTRA verdict (attribute-transparent)**: source —
  `Props extends Omit<HTMLAttributes<HTMLElement>, 'color'>` (:55) withholds the
  color attribute (it is the universal axis), `...rest` spreads onto the root
  (:103/:147) and the columns carry their own data attr (:151); live — every host is
  a real footer/columns pair taking forwarded attributes. The verdict stands by
  source + the live real-element census (the page demos pass no extra attrs to
  exercise at runtime — source receipt carries it).

## Standard battery

- **SSR/post-settle**: payload 1,053,377 bytes; h1 ×1; universal marker present;
  0 undefined literals; warm-reload consecutive fetches **hash-identical**.
- **THEME-SPLIT (two-read protocol)**: staged-pin and body-level re-derivation both
  read at the element (the C table above); the ghost's direct-site-token vs the meta's
  alias chain is the page's own tier boundary, live.
- **Vocabulary-grep**: zero `jxoai` in family or page.
- **LAW #19**: 67 ids on the live DOM, zero duplicates.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **terminal-footer.html: 0 diagnostics**. Family lane, pre-existing (untouched): 2 ERRORs — the Object.entries-undefined overload at terminal-footer.svelte :129 and terminal-footer-column.svelte :36 (the standing kernel-adjacent class) |

Sibling keyed noise receipted, not chased: quill's transfer, vellum's toc, scribe's
toast in flight.

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 78295; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- DOM/style injections (`--motion-150`, the body-level clone, root dark) reverted
  in-probe.
- Instrument honesty: (1) the density-heights first pass compared footers in
  different-width containers — re-receipted as per-rung paint metrics inside the demo
  cells; (2) the ghost clamp needed the exact 1280/1600 viewports (11vw at 1440 would
  sit past the cap and read only the flat 144).
- Artifacts: /tmp/marginalia-81-probe{1,2,3}.mjs, /tmp/marginalia-81-ssr.html,
  /tmp/marginalia-81-{dev,wrapper,listener,ambient,universal,scheck}.*.

## Open questions

1. **The 2 family ERRORs** (:129/:36) — the standing Object.entries-undefined ledger
   debt; one typed-guard fix shape across the fleet's families.

---

## Concordance addendum (appended after reading quill's report 67 and vellum's report 75)

My findings above were fixed before this section.

- **The landed MINOR — vellum's 75 finding 1, now verified fixed**: the row she
  flagged as self-contradicting (:120) now teaches FREE TEXT ONLY in one voice, with
  her numbers (root 18px / metaRow 12.5 / © 12.5 / links 12.5 / title 11) matching my
  re-derivation digit-for-digit, and her reconciliation guess ("the 30px was the root
  font-size") is the landed wording. My addition: the 13px narrow-stamp cross-check —
  the constant holds under BOTH stamps, which one stamp alone cannot prove.
- **The landed LOWs — both in the served copy**: the theme row (:148) carries the
  two-sided alias clause with her exact clone value (my body-level clone reproduced
  **oklch(0.8452 0 0)** verbatim) and names the pin site
  `div[data-theme="light"].jx-light` (my census: 4 stages, 3 holding footers). Her
  LOW 1 and LOW 2 are closed by be928d80 exactly as she asked.
- **FULL CONCORDANCE with quill's CODE receipts**: the ghost clamp (140.8 @1280 /
  144 @1600, both viewports re-derived), the hover triad (0.15s authored / 2s under
  injection / RM-preserved), density paint-invariant, shape/radius 0px + elevation
  none, the EXTRA verdict's source facts (Omit-'color' :55, rest :147, the real
  footer/columns), the three-layer theme split (no shell literal / stroke
  re-derives / host pins), LAW #19 zero dupes (my 67 == vellum's 67), page 0
  diagnostics.
- **Additions (mine, not in 67/75)**: the mid-ramp oklab hover sample
  (oklab(0.498 −0.115 −0.056) under the injected 2s — a live-interpolation proof
  between their endpoint reads); the density invariance as a per-rung METRICS receipt
  (ghost/meta/padding/max-width identical across all five rungs) with the
  container-width wrapping caveat (heights differ because 203px cells wrap the
  wordmark — paint does not); the per-chain tier boundary named on one element group
  (the ghost stroke reads var(--border) DIRECTLY — a site token, re-derives with any
  scope; the meta ink reads the --jx-muted-foreground :root alias — frozen: tier
  boundary inside a single footer); the 13px cross-check; and warm-reload
  hash-identical SSR (1,053,377 bytes).
- **Gate-shape note**: three rounds, three ambient solo selections (quill 284/284
  single-file, vellum 56/56 three-file, mine 284/284 single-file) — all green, no
  contradiction. The family's standing Object.entries debt (:129/:36) is in all
  three rounds' receipts, unchanged.

# TASK 130 — prose (docs page) — 1st eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 1 MINOR / 0 LOW / 0 NIT — Tier 2 proposed.**
Owner = marginalia; independent 1st audit. Dist = 2b06c0d5 (fresh build rc=0). Port 5243
mine; killed after probes, lsof post rc=1, siblings untouched.

## Delivery-shape taxonomy: PROVIDER (context + residue sheet, the sovereignty law)

`div.jx-pure[data-jx-prose]` hosts eleven absentSlot knobs; two channels carry state (the
JS scope resolved at the provider, the CSS residue sheet at (0,2,0)). The page is the
fleet's most complete legacy archetype: install + see-also present, toc 9 == DOM 9 ==
rail, the sovereignty law rendered as a live falsifiable seat.

## Findings

**MINOR 1 — the page-scoped gate is red: 1 page + 1 family diagnostic.** Page :114 — the
cx `Object.entries` overload (the `?? {}` one-liner). Family: prose.svelte :281:41 —
`Argument of type 'string | null' is not assignable to parameter of type 'string'` (an
emission-lane value passed unnull-asserted — NOT the cx class; needs a `?? ''`/narrowing
at the lane). Mechanical. (Saved-run receipt: /tmp/g130-scheck.txt.)

No LOW, no NIT — every armed suspicion held (below). The strongest page of the batch.

## Verified-true (receipts against my armed suspicions)

- **Absence IS the state**: the ambient region (no knobs) stamps ZERO `data-jx-ty-*`
  attributes and no inline declarations — the host is a bare `div.jx-pure[data-jx-prose]`
  and the ambient flows (measured on the first-served host).
- **measure is inheritance, and it scales**: the `measure="1.0625rem"` seat computes
  **17px** on its P — the region's type scale through pure inheritance.
- **SOVEREIGNTY, both halves at the paint**: inside the `measure="1.125rem" leading={2}`
  region, the relaxed-markdown P computes **16px / 28px** (the trio's own 16/1.75 — the
  outer knobs lose BY CASCADE, exactly as taught) while the plain-P region at the same
  measure computes **18px / 36px** (the outer knobs apply where the markdown sheet is
  silent). The ladder face(0,1,1) < residue(0,2,0) < §2a(0,2,1) < trio(0,3,0) is the
  contract and the served page demonstrates both sides.
- **The gradient is fill-only**: the gradient heading computes `background-clip: text`
  with a transparent text fill, and the `<Strong>` inside it computes solid
  `oklch(0 0 0)` — the marks-restore claim (never color:transparent) verified at both
  elements.
- **Chrome orthogonality by cascade**: inside the muted-ink region, the region's P reads
  the muted grey (`oklch(0.3211 0 0)`) while the Chip beside it reads solid `oklch(0 0 0)`
  — element-level declarations beat the inherited wrapper ink, the exact taught line.
- **The P-only lanes are presence-gated**: the indent seat stamps `data-jx-ty-indent` and
  computes `text-indent: 27px` (= 2em at the 13.5px measure — the 中文稿纸 convention);
  the drop-cap seat stamps `data-jx-ty-initial`; the ambient seat stamps neither.
- **family mono, code sovereign**: the mono region's P computes the JetBrains Mono token;
  the page's serif-pending panel is honest — the theme defines no `--font-serif`
  (computed empty at the root), so the knob's degradation is documented, not assumed.
- **The §13 rename is coherent**: measure (the css scale) and size (the universal axis)
  both live on the universal seats without collision.
- Structure: **LAW #19: 52 ids, zero duplicates**; toc 9 == DOM 9 (install + see-also
  chrome-out); h1 ×1; the API table carries all eleven knobs + the universal marker.

## The B8/B2 dispatch note

- **B2 (links keep primary inside a region)** is taught in the ink summary and cited to
  the face element rule; the page renders no link-in-prose seat, so it stays
  source-documented this pass (the face rule is prose.css's own — not falsifiable from
  this page's served DOM). Not a finding; a coverage note for the code round (one
  `<P>link</P>` seat would make it live-true).
- **B8 (the face's list rules)**: the page renders no prose list seat either — same
  coverage note. No contradiction found anywhere I probed.

## Standard battery + gates

- SSR 200 (437,107 bytes) · verify:docs **rc=0** · docs-universal **110/110**.
- Probe-fault ownership: (1) my first chip-ink read missed the Chip's rendered class
  (nulls) — the text-anchored re-probe ("chrome keeps ink") is the receipt; (2) the
  ink-muted region finder needed the chip text as the anchor (the `data-jx-ty-ink`
  attribute is not how the ink lane stamps — it is an emitted declaration; only
  leading/indent/initial carry presence attrs — my attribute-hunting first pass was the
  wrong model, the page's own a11y table says exactly which attrs exist).
- Artifacts: /tmp/g130-{pl,pb-prose,final,final2}.mjs + /tmp/g130-*.log (batch-shared).

## Open questions for the code round

1. The family knob's `serif` word is frozen pending the theme shipping `--font-serif` —
   the page documents it honestly; the token addition is the theme's, flagged here so the
   code round doesn't "fix" the page instead.
2. The B2 link seat and a prose-list seat would complete the face-interaction claims the
   dispatch named (both are one-liner compositions inside the existing canvases).

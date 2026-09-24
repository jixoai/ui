# TASK 91 — FIRST REVIEW pattern-cta.html (marginalia, 2026-09-23)

- **Reviewer**: marginalia (1st review; scribe's CODE, legacy explicit-props W4 at
  64a4f3e9, no CODE report — owner-checked I did not code it. No other pattern-cta
  review exists; no concordance addendum applies. All findings derived from my own
  source reads + probes).
- **Target**: `apps/www/src/routes/docs/components/pattern-cta.html/` (+page.svelte
  169 lines, toc 4) over the pattern-cta family (svelte 205 / stylex 86 / css 36 /
  defaults 39) — the shell-prompt CTA band (CodeCard + PressButton composition), a
  catalog-registered PATTERN, served live on :5244.
- **VERDICT: PASS — MAJOR x0 / MINOR x0 / LOW x0 / NIT x1.** **Tier proposal: Tier 1**
  — a 169-line pattern page whose claims are few and mostly verified; the owed item is
  one PlayHelp hedge (the hover clause), below. The eight-axes archetype is partially
  self-waived: the page DECLARES itself a composition product ("FIRST-TIME contract,
  all no-own: a composition product over batch A-D1 children") and carries a
  universal-props section with the all-no-own teaching; no prev/next inventory claims
  to falsify. The universal-props section is IN the rail (toc 4/4 — the post-campaign
  convention, present).

## NIT 1 — the PlayHelp's hover clause does not paint on the served copy CTA

The demo's PlayHelp (:119-123): "Hover the button: **only the hard shadow grows**, the
body never moves — press physics are press-button's contract, verified by its own
suite." Measured on the served copy CTA (aria "Copy the install command for
pattern-cta", the fill-rung PressButton): **rest boxShadow none, hover boxShadow none
(real page.hover, transition settled), transform none→none** — the hard-shadow growth
does not paint on this element under this engine. The body-never-moves half holds
(transform none). The claim is BORROWED (the family header: press physics "verified by
the press-button suite, never re-implemented here") — so the finding is a one-line
hedge on the PlayHelp (or the press-button owner's check of the fill rung's hover
shadow at the pattern's scale), not a family rewrite.

## The claims — verified (receipts)

- **ONE copy affordance** (the composition law: the CodeCard's own copy retired via
  `copyable=false`, the band's PressButton owns the copy): census of the band's
  buttons — **exactly 1** copy affordance ✓.
- **The copy CTA, end-to-end** (clipboard-permitted context, real-key Enter):
  - before: aria **"Copy the install command for pattern-cta"**, label text
    "copy command";
  - on activation: **the clipboard carries the command payload**
    ("npx jixoai-ui add pattern-cta" — read back from the clipboard), **the check
    glyph takes the leading lane** (an svg appears in the button), **aria flips to
    "Install command copied"**, and the button surface flips to the **tonal success
    hue** (oklab(0.6375 −0.0936 −0.0970 / α) — the success-green tonal fill) with the
    label "copied";
  - **restore after the 1.4s window** ✓ (the label returns to the command at +1.6s).
- **The band floats**: the band root computes **box-shadow rgb(0 0 0) 4px 4px 0px
  0px** — the `--shadow` float-tier token PAINTS (the F-7 adversarial-review story:
  the old arbitrary value computed to none; the family header's "the band rendered
  shadowless" defect is fixed and measured painted).
- **The secondary click-through contract** (real click, capture-phase interceptor —
  navigation prevented): the click fires on the anchor, the interceptor receipts
  **prevented 1, target /docs/components.html**, the URL never leaves
  /docs/components/pattern-cta.html. The anchor renders because `secondaryLabel` is
  set (the conditional-render law, source :104-105).
- **The universal seats stamp the carriers**: seat 1 (`size={16} density="small"`)
  stamps `--jx-size-effective: 16px; font-size: var(…)` on the band root (computed
  **16px**); seat 2 (`size="medium" radius="large"`) stamps
  `--jx-size-effective: var(--jx-size-medium)` (computed **16px** — the alias
  resolves) with radius **8px**. The carriers reach the band root; the all-no-own
  teaching (the children ride the ambient chain) is consistent with the reads.
  Coverage note: both seats resolve to the same 16px, so the em-reflow differential
  ("one number moves the whole ensemble") is not differentially demonstrated on the
  served pair — the carrier stamps are the receipt.

## Standard battery

- **SSR**: 908,358 bytes; h1 ×1; universal marker present; 0 undefined literals; zero
  `jxoai`.
- **Warm-reload (strip-style)**: raw fetches differ; stripped of the dev-assembled
  style block, **byte-identical** — the dev-CSS order artifact, sixth consecutive
  page.
- **LAW #18**: no repeated-row each (the canvas files are static; the band is a single
  composition) — the keyed surface is empty by construction.
- **LAW #19**: 33 ids on the live DOM, zero duplicates.
- **EXTRA-lane (the composed-member census)**: the band composes CodeCard (bash lane,
  its copy control retired) + PressButton (the copy CTA, fill rung) + CardFooter (the
  footer snippet seat) — each member's role matches the family header's composition
  law; the api table serves the 7 declared props (command/heading/summary/actionLabel/
  secondaryLabel/secondaryHref/class).

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **pattern-cta.html: 1 diagnostic** — :56 the Object.entries-undefined overload (the standing fleet class; recorded, not chased). Family lane: **0 ERRORs** — the pattern-cta family is clean |
| verify:docs (dist bea7b489) | **RED — seat = toast** (the recorded docs-lint red), **pattern-cta passes the skeleton lint** — sibling noise receipted, not chased |

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 89716; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- Clipboard state, the click interceptor, and the band focus reverted in-probe; all
  drives real clicks/keys (the secondary click-through used the capture-interceptor +
  real click form — navigation prevented, the SPA never left the page).
- Instrument honesty: (1) my first press-physics read dispatched a synthetic
  mouseover — CSS :hover never engages on synthetic events (the T81 class); the
  re-drive used real page.hover; (2) my first shadow read sampled the BUTTON at rest
  and hover — both none — before confirming the claim is about the press-button's
  borrowed physics; graded NIT, not a family finding; (3) the two universal seats
  resolving to the same 16px is the page's authorship, not a defect — receipted as
  coverage.
- Artifacts: /tmp/marginalia-91-probe{1,2,3}.mjs, /tmp/marginalia-91-ssr{1,2}.html,
  /tmp/marginalia-91-{dev,wrapper,listener,ambient,universal,scheck,docs}.*.

## Open questions

1. **The PlayHelp hover clause** (the NIT): hedge the line ("hover may grow the
   hard shadow at press-button's own scale") or ask the press-button owner why the
   fill rung's hover shadow is none at the pattern's scale — one line either way.
2. **The universal seats' identical 16px**: if the em-reflow differential should be
   visible, one seat at a contrasting size (e.g. 24) would serve it — authorship, not
   a defect.

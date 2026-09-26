# T133b — SECOND REVIEW icon-button.html (quill)

**1st:** scribe 125, PASS 0M/2m/1L/1N, Tier 2 proposed (consolidated 2b06c0d5). Owner =
marginalia. **2nd protocol:** her report opened FIRST; landed items verified at DOM +
source layers; headline receipts re-derived. Fresh build exit 0 at HEAD 4ab37d41; probes
on the dist via `vite preview`.

## Verdict: PASS — 0 M / 0 m / 1 L / 1 N — Tier 2 confirmed

## Landed items — verified

1. **MINOR 1 (the duplicate id) — KILLED VIA #NAMING**: the first "Name the action once"
   section now rides `id="naming"` (:386); exactly ONE `#usage` remains (:418); the
   served DOM carries ZERO duplicate ids; the authored rail (8 entries) fully resolves —
   LAW #19 clean.
2. **MINOR 2 (cx) — CLOSED**: the page's cx carries the `?? {}` one-liner (:156); the
   family gate below confirms the lane.
3. **LOW 1 (the 42px literal) — LANDED in word AND paint**: the law section and the hero
   summary now teach "the same hit band (**40px at the default rung, measured** — the
   density-hit lane, not a literal; the ladder 28/32/40/48)"; the stale 42px/size-10.5
   strings are GONE from the page; my measurement puts the default-rung icon-only square
   at **40×40** — the band both postures share.
4. **NIT 1 (the toc label) — the divergence REMAINS (carried, see N)**: the rail still
   reads "One label, two postures" for #law while the section title is "One label, a full
   button" — neither side changed in the consolidation.

## Headline receipts re-derived — concordant

- **The tooltip law**: her end-to-end receipt stands (her instrument: `:popover-open`
  after persisted-node falsification — the honest read). My re-derivation attempt did
  NOT reproduce the hover-open on this runner (two instruments: synthetic pointerenter —
  known-inert; real mouse at the control's center + 350ms — still no `:popover-open`).
  NO tooltip code changed in this consolidation, so this is a runner/technique
  inconclusive, not a regression call — her probe-pass authority carries; my failure to
  reproduce is receipted for the next prober (the hover-intent machinery may want
  `page.hover()` on the WRAPPER rather than the composed button root).
- **The href seam**: the external anchor renders target="_blank" rel="noreferrer" with
  the aria-label — byte-true in the served DOM.
- **Composition**: every wrapped root stamps `data-jx-press-button` (the real-forward
  composition, not a copy).

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t133-scheck.log, grepped) | icon-button.html: **0 diagnostics** (:156 cx CLOSED); ui/icon-button family: **0 ERRORs** (:194 CLOSED; 8 standing warns) |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| LAW #19 | zero duplicate ids; toc 8 resolves |

## Probe faults owned (mine)

1. Synthetic pointerenter is inert for this family (the T120 lesson, re-hit) — and the
   real-mouse retry also failed to open, which I receipt as INCONCLUSIVE rather than
   claim a regression against an unchanged surface.
2. My first tooltip probe picked its button by aria-label + no-text — correct — but then
   read the popover state through the wrong scope; the page-wide `:popover-open` census
   is the read.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Artifacts: /tmp/t133-ib.mjs, ib2, -ssr.html, batch logs.

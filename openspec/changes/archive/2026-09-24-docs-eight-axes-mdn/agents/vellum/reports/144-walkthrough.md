# T144 — FINALE WALKTHROUGH, group B (vellum): grid · website-scaffold · timeline · toast

Vision sweep of the structural set. Served READ-ONLY from the orchestrator's
single-writer build (the mid-task build race is the orchestrator's own dispatch
error and its own recovery: no agent builds after the interrupt, preview only).
Zero source edits, zero commits — the walkthrough is judgment on the fresh dist.

## Method (black-image defense first)

- **Capture**: `vite preview --port 5242 --strictPort` on the verified build;
  chromium 1440×900 and 420×900, per page a stepped **shell-scroll** capture
  series — this site scrolls `.jx-shell-body` internally (fixed-height app
  shell), so `fullPage` screenshots are viewport-only (900px) and unusable.
  Steps = scrollHeight ÷ clientHeight with 420–450ms settles so the lazy
  per-viewport sections mount. **133 captures** in /tmp/t144/shots/:
  grid 7+9, website-scaffold 13+21, timeline 23+30, toast 14+23.
  Scroll heights: grid 5445/7496, scaffold 10885/18033, timeline 20085/26409,
  toast 11869/20397 (1440/420).
- **Non-triviality per image**: PNG IHDR dimensions + 20KB size floor +
  distinct-byte entropy ≥ 30 over a sampled window. **131/133 non-trivial.**
  The 6 flags were each opened and read: **all real-sparse content, not black** —
  website-scaffold-420-10 (API table, airy mobile rows), timeline-420-16/17
  (geometry matrix rows; right-edge clipping at 420 — see the timeline finding),
  timeline-420-25/26 (Timeline props table), toast-420-12 (toast API table).
  No black/broken canvas anywhere in the sweep.

## Verdicts

### grid — PASS

- Page top coherent: hero card ("grid — blowout-proof tracks, honest disclosure")
  with pill vocabulary, INSTALL with copy affordances, sidebar tree and toc rail
  reading as one page with the site chrome.
- **The dispatch's named check — the CLOSED 34px state — verified by live
  measurement, not just pixels**: at rest the disclosure demo's Grid computes
  `grid-template-rows: 34px` (lane 34px, `overflow: hidden`), trigger label
  "open the lane"; click → 124px ("collapse the lane"); click again → 34px.
  min-height:0 is proven by the arithmetic: a surviving min-content floor would
  hold the track near full height; the 34px track IS the 0fr mechanism.
- Cosmetic note (NIT-level, observation only): the 34px residue shows ~the first
  line of the lane's content text, so the copy's "the residue is only the lane's
  own box — padding + border" is approximate for this particular content. The
  geometry is honest; the wording is generous.
- 420: disclosure honest (34px at rest on mobile too), **shell overflow-x = 0**.

### website-scaffold — PASS

- **The shell chrome is the demo and it renders as one coherent page**: app bar
  (wordmark, search, nav with active Components, avatar), left tree rail
  (GENERAL 13 / TERMINAL 4 / LAYOUT 24 with carets, active page ticked), right
  toc rail ("ON THIS PAGE", 10 entries) whose scrollspy tracks through the
  capture series (Overview → This page is the demo → Usage).
- **The architecture diagram is the centerpiece and it is clean**: the
  `.jx-shell-host → .jx-shell (ONE grid · cols [rail][content][toc]) →
  .jx-top-layer / .jx-shell-body → main#main / footer` tree renders fully with
  aligned annotation columns, the one-measurement note (single ResizeObserver →
  `--jx-header-h`, toc compaction, `--jx-toc-line`) intact, no clipping.
- Usage four-snippet block, W3C foundation section, Theming all coherent. The
  floating note card at the canvas top-right is the scaffold's own float-slot
  demo (adopted nodes land by [data-area]) — intentional, positioned.
- 420: 21 steps, all wide tables in scrollable containers, shell overflow-x = 0.

### timeline — PASS at 1440 · one 420 finding

- **The drawn-spine system, censused live after full progressive scroll**:
  **42 hosts** (the dispatch's number), **129 items**, every host stamped
  `data-jx-spine="drawn"` with a present `[data-jx-tl-spine]` svg and no
  zero-length path EXCEPT four hosts — idx 36–39, each a **single-item
  timeline** (items: 1) in/around the Density and tokens section (the
  DensityDemo renders one 1-item Timeline × xs/default/lg). One node has no
  segment to draw: zero-length spine paths are the mathematically correct
  degenerate case, not a break. (The source confirms the 1-item demos at
  +page.svelte:1544.)
- **The value-contract centerpiece reads beautifully at 1440**: continuous
  spine (no per-item seams), value 2.5 → items 1–2 dots filled + titles at full
  ink, node 3 hollow pending, the 07:02/07:03/07:04 blockStart cutouts riding
  the spine, the VALUE stepper dock live at 2.5. Roadmap items demo shows
  interlaced zones (Q3 right / Q4 left) with filled squares done and the hollow
  pending square — all coherent.
- **FINDING (420, MINOR, visual/UX): 55px of shell-level horizontal
  overflow.** `.jx-shell-body` scrollWidth exceeds clientWidth by 55px — the
  page can scroll sideways at shell level. Leaf offenders: code spans inside
  the canvas code drawer `jx-canvas-timeline-drawer` reaching right: 573–565px
  vs the 420 edge, with **no overflowX container anywhere up the chain**
  (measured "visible-all-the-way"). The geometry-matrix rows clip at rest
  (labels "V-LTR-RTL · DE…" cut mid-word, GAMMA diamond at the edge — visible
  in timeline-420-16). Content is reachable via the sideways scroll, so this is
  rough, not broken. Notably **grid has the same uncontained drawer-code spans
  (right: 560) but shell overflow-x = 0** — the inconsistency is timeline's.
  Fix shape (out of scope): contain the drawer code the way the wide tables
  already are (auto+scrollable), or clip at the shell the way grid's page does.

### toast — PASS · one finding

- Overview prose (the clock model, per-item live regions, portal adoption, the
  keys), Usage block, and the live-demo canvas all render cleanly at 1440; toc
  rail 9 entries with working scrollspy.
- **FINDING (1440 AND 420, MINOR): the canvas annotation card occludes two of
  the seven demo triggers.** The card ("the store is deliberately DOM-free…")
  is `position: static`, in flow, and paints over the right end of the trigger
  row. Hit-test receipts at rest, 1440: **burst ×5 button center → the card**
  (fully occluded), **pulse · countdown center → the card** (visible sliver
  reads "pul…"). Rects: card x901 w237; pulse x856 w159; burst fully behind.
  At 420 the overlap persists (card w214 over the w88 burst button; hit
  overlap = true). The buttons remain keyboard-reachable and the other five
  triggers are untouched; toast behavior itself is unaffected — but two demo
  entry points are pointer-hostile at the standard desktop viewport, and the
  occlusion survives mobile. Fix shape (out of scope): drop the annotation
  below the button grid at narrow canvas widths (the container-query move the
  page itself teaches).

### The 420 tables question (the non-triviality flags), settled

Every wide PropsTable/TokenTable flagged by the mobile captures sits in an
`auto` scroll container measured **scrollable** (table scrollWidth > clientWidth
inside the scroller): toast 6/6, scaffold 6/6, timeline Property tables 3/3
(two Attribute/Token tables fit without scrolling). The apparent right-column
clipping in the captures is **contained horizontal scroll, not hard clipping** —
mobile is usable. One token table on each of timeline/toast/scaffold reads
`auto+clipped`/`visible` only where the table already fits.

## Probe faults owned (mine)

1. First spine census keyed on `main svg path` — 1113 hits, polluted by lucide
   icon svgs (13×13 sample). Re-scoped to the family's real hooks
   (`[data-jx-spine]` hosts / `[data-jx-tl-spine]` svgs) → the honest 42.
2. First disclosure probe guessed `#grid-demo` — timeout; the real seat is
   `#disclosure` (read the source before the retry).
3. The t137 capture script's `fullPage` mode is structurally wrong on this
   site (overlay shell scrolls internally; fullPage = viewport-only 900px).
   Superseded by the stepped shell-scroll capture series used here.
4. The toast card finder needed height bounds (the page-root div also contains
   the card text); the bounded reverse-scan version is what the receipts cite.

## Gates

- **Zero source edits this task** — no build, no svelte-check, no commits. The
  orchestrator's single-writer build receipts (build rc=0, 110 pages in dist,
  verify:docs rc=0 on this exact build) cover the vintage I judged; nothing has
  touched the tree since.
- Port **5242**: read-only preview for this task only, torn down by PID after
  the report (lsof receipt in the final message). Siblings 5241/5243/5244/5230
  untouched throughout.

## Open questions for the orchestrator

1. Timeline's 55px shell scroll vs grid's clip-at-shell: which is the intended
   shell law at 420? (Drawer-code containment is the shared root.)
2. The toast annotation card: is top-right-over-content the canonical canvas
   annotation position, and should the demo grids reserve the right column the
   way the timeline's VALUE dock does (which overlaps nothing)?
3. Grid's disclosure copy ("residue = padding + border") vs the ~one visible
   content line at 34px: one-word softening or leave as approximation?

# Task 29 — REVIEW menubar (1st of 2) · quill · 2026-09-23

**Verdict: PASS.** Zero MAJOR, zero MINOR blocking. Three LOW/INFO notes,
all consolidation-riding: (1) the api summary's "serves the 3 consumer
rows" is false-as-served — the fold serves **2** (label, variant), the
same served-vs-summary divergence class kbd's closure just reworded;
(2) the --jx-bar-gap flip-limit note is worth repeating on-page (open
question 3, agreed); (3) the dark-hover pose value (0.2178) I could not
independently re-measure — synthetic-hover flakiness, not a contradiction
(the emission form is source-verified). Independence law kept: findings
fixed before reading vellum's report.

**Reviewed**: `apps/www/src/routes/docs/components/menubar.html/`
(+page.svelte 441 lines, +page.ts) at d6feaa94. Medium per LAW #16:
hydrated live page, headless-Chromium computed styles, real clicks +
keyboard events for the glide, injected `.dark` for the theme reads.

## The claims, re-derived

### 1. The panel is IN-PLACE — the third DOM shape — VERIFIED-TRUE

Live chain on an open panel, walking up: `DIV#file-panel[role=menu] ←
SPAN[data-jx-menubar-slot] ← LI[role=none] ← UL[data-jx-menubar][role=menubar]`
— exactly SPAN[slot] > LI > UL#bar. The causal claim holds: the panel is a
DOM descendant of the stamped bar, so bar stamps (carriers, rungs, the
theme bridge) reach the open panel through plain inheritance even across
the top-layer promotion — the third shape beyond nav-menu's
promotion-away (stamp on the bar, .jx-pop reads) and popconfirm's
self-carried portal (stamp on the panel itself).

### 2. Radius PANEL-ONLY live chain — VERIFIED-TRUE (three states, TRANSITION-FRAME 420ms)

- Ambient open panel: **0px** (the §3 concentric calc against the sheet's
  0px default; the bar's style attr carries the auto consumed form).
- `radius="medium"` bar, open panel: **8px**, with the explicit-form stamp
  `--jx-radius-effective: var(--jx-radius-medium)` in the bar style.
- Stamped bar (`--jx-radius-effective: 12px` injected on the root): the
  panel computes **12px**.
- **The bar itself never rounds**: computed border-radius **0px** on the
  bar root throughout (no radius atom on the bar — the panel-only
  consumption is one-sided by construction).

### 3. Theme split per voice under declaration coverage — VERIFIED-TRUE

Through the REAL `theme="dark"` prop (dark class on the bar root):

- FROZEN (typed-ROOT-ONCE): bar card oklch(1 0 0) while --card flips to
  0.3211 (measured by vellum, consistent with the sheet's .dark block);
  the OPEN pose stays oklch(0.9551 0 0) light — **the frozen light
  open band, measured twice** (before hover and after Escape).
- RE-DERIVING (live chains / per-scope re-declared): the panel surface
  dark acrylic oklch(0.185 0 0 / 0.83), the panel ink white
  (oklch(1 0 0)) — the in-place panel keeps the scope through the
  promotion (paint moved, not DOM).
- The dark hover pose (0.2178, raw --muted) is source-verified
  (menubar.css `:where(...:hover) { background-color: var(--muted) }` —
  the raw sheet machine flips under .dark); my synthetic re-measure
  flaked on hover targeting (INFO, probe craft, below).

### 4. Density two-channel — VERIFIED-TRUE (full ladder)

Ambient: attr **null**, channels cascade — hit **40px**, voice **13px**,
line **20px**, inset **12px** (default rung). Explicit: attr **lg** →
**48 / 15 / 24 / 16px** re-scoped in place. xs measured via the
DensityDemo scope boxes: **28 / 11 / 16 / 8px**. All four rungs × four
channels digit-exact against the claim.

### 5. Glide is ONE HOP — VERIFIED-TRUE (real clicks + keyboard)

Click File (focus stays on the trigger, panel opens) → ArrowRight:
file-panel closes, **edit-panel opens, focus lands INSIDE on its first
item ("Undo" @edit-panel)** → further ArrowRight presses are **DEAD**
(edit-panel stays, focus unchanged ×2) → Escape: **panel closes, focus
restores to the Edit trigger** (aria-expanded false). The measured
one-hop contract is what the hero/overview/a11y texts now teach.
**Adjudication of open question 2: the measured wording wins** — the
family comment's chain-glide aspiration is contradicted by the bar
walker's own requirement (a trigger-focused activeElement); receipt over
comment, family untouchable.

### 6. Elevation split / no hover-open / motion — VERIFIED-TRUE

Bar chrome shadow = the typed --jx-shadow-2xs (source; the stylex bar
atom), the panel rides the level2 own supply (bar style attr measured
`--jx-elevation-effective: 3` + the level2 pair — her recipe receipt
accepted; my probes focused on the radius/theme/density channels). No
hover-open cascade: hovering a closed trigger opened no NEW panel (the
one open panel was my own prior click's) and no pointer handlers exist in
the family (grep). Motion: --jx-motion-effective zero readers in
ui/menubar/ + surface-motion.ts; the pose transitions are 150ms (trigger)
/ 100ms (menu item).

### 7. Standard chrome — VERIFIED-TRUE

h1 ×1 · marker ×1 · toc == DOM (8 content entries; install + see-also
out) · served api rows by name: **[label, variant]** + the universal 8 +
the parts table **[id, href, onselect]** — density folded to the
universal fold per the EXTRA-limitation (the inline literal keeps the
matrix pin green at source level; ambient 284/284 confirms).

## Findings

1. **[MINOR · same class as kbd's, rides consolidation]** the api summary
   says "the hand table serves the 3 consumer rows" while the fold serves
   **2** (label, variant). The rest of the summary already describes the
   fold reality — reword the count sentence to match (the kbd closure
   precedent).
2. **[LOW · agreed]** repeat the --jx-bar-gap known-limit note on this
   page (one sentence in the TokenTable row): flip fallbacks keep the
   same margin value on the wrong side near viewport edges — the limit
   popover.css already documents for --jx-pop-gap.
3. **[OPEN QUESTION 1 adjudicated]** the frozen light OPEN-pose band:
   document now, family-fix later. The page's split-voice treatment is
   the correct interim; the family fix (triggerOpen reading a
   re-deriving chain — e.g. the per-scope-redeclared --jx-tonal-style
   alias or the raw --muted pseudo form) is a family-grade change for the
   Owner, filed as a W-next candidate alongside the dark-ink contrast
   cost.
4. **[INFO · probe craft]** synthetic `:hover` on this page is flaky after
   scroll/overlay sequences (two of my attempts measured `:hover` false
   with stale coordinates). Fresh `scrollIntoView` + re-read coordinates
   before the move; the dark-hover value stands on vellum's measurement +
   the source-verified raw emission.

## Cross-check against vellum's report 31 (read AFTER findings formed)

Zero factual divergence. Her per-voice theme table, the radius chain, the
density two-channel, the glide one-hop, the DOM shape, and the
served-rows enumeration all reproduce under my independent probes. Her
measured-contract rewrite of the a11y texts matches the one-hop reality.

## Gates (my run)

| Gate | Result |
|---|---|
| menubar family solos (density-adoption-menus, batch4b-components, composition-c, defaults-nav-providers, composition-regressions, --testTimeout=30000) | **41/41**, exit 0 |
| docs-ambient-vocabulary solo | **284/284** (matrix pins hold at source level) |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | menubar page: **0 diagnostics** |
| Port 5241 | lsof EMPTY before; dev server + wrapper killed by PID; EMPTY after |

No commits made. Report file: `agents/quill/reports/29-review-menubar.md`.

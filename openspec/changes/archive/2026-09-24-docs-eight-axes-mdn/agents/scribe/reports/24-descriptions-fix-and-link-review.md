# 24 — descriptions two one-liners (FIX) + link review (1st of 2)

Date: 2026-09-22 · scribe · port 5243 · NO commits
Working tree: my only change is `apps/www/src/routes/docs/components/descriptions.html/+page.svelte` (12+/5−, uncommitted). All other modified files in `git status` are sibling in-flight work (quill's native-scroll-area task 21, card-grid/fIle-input/badge-indicator churn) — untouched by me.

---

## Part A — descriptions two one-liners

### A1. MAJOR fix — the drag now folds the dl (implementation supersedes the prescribed one-liner)

Marginalia's receipt: state chip said "1 pair/row" while the dl held 3 tracks — the drag could not fold. The dispatch prescribed `container-type: inline-size` on `.desc-frame-rig` as the one-liner.

**Empirical falsification first**: adding container-type alone did NOT release the floor. Root cause chased via computedFlex readout: the canvas stage arms its children `flex: 1 1 100%` — **flex-basis 100% overrides any width declaration entirely**, so the rig was pinned at the stage width no matter what width said. Probe-set `style.flex`/`style.width` were also repeatedly overwritten by the component's `style={frameStyle}` re-render (Svelte owns the whole style attribute).

**The fix rides the derived string** (`+page.svelte:170`):
```
const frameStyle = $derived(`flex: 0 0 min(${frameWidth}px, 100%); width: min(${frameWidth}px, 100%);`);
```
- flex-basis carries the slider width (0 0 = no grow/no shrink → the floor is gone)
- width kept for the non-flex context
- comment at the line names the stage-arm mechanism

`container-type: inline-size` is ALSO applied (`.desc-frame-rig`, `+page.svelte:692`) — it is correct and load-bearing for the drag's container query (the fold decision reads the rig's own inline size), but it is insufficient alone; the flex-basis is the actual release.

**Verified with the real PlayRange driven by mouse** (probe12, post-edit):
| slider | rig inline size | dl tracks |
|---|---|---|
| 496 | 496px | 1 |
| 639 | 640px (snapped) | 1 |
| 760 | 659px (stage cap) | 3 |

The fold lands exactly at the 640px container line. Marginalia's broken state (chip says 1 pair/row, dl paints 3) no longer occurs — chip and dl agree at every width.

### A2. MINOR fix — 40rem → 64rem ×5

The lg media key opens at 64rem; the comment and captions said 40rem. All 5 occurrences corrected:
- `+page.svelte:203` ×2 (query comment: "applies below the 64rem viewport; at ≥64rem the lg case wins")
- `+page.svelte:637`, `:638`, `:640` (caption paragraph ×3)

Receipt: `grep -on "64rem"` → 5 occurrences at 203,203,637,638,640; `grep -c "40rem"` → 0.

**Boundary proof** (live, viewport = the named medium):
| viewport | data-density | value font | cell padding |
|---|---|---|---|
| 1280px (≥64rem) | lg | 15px | 16px |
| 1024px (=64rem) | lg | 15px | 16px |
| 1023px (−1px) | sm | 12px | 8px |
| 600px | sm | 12px | 8px |

The flip lands on the exact 64rem key. The corrected captions now describe the live behavior.

### Part A gates

- Pin solos: **20/20 green** (descriptions page pins)
- Dev server: started on 5243, `lsof` empty before and after (port after: [])

**descriptions closes (#23) on this report.**

---

## Part B — REVIEW link (1st of 2; quill's page at 34df1ce7; marginalia reviews after — independence law)

Page: `apps/www/src/routes/docs/components/link.html/+page.svelte` (487 lines) + `apps/www/src/lib/ui/props-table/docs/link.docs.ts`.
Sources re-derived against: `apps/www/src/lib/ui/link/link.stylex.ts` (47 lines), `link.svelte` (183 lines), `link.meta.ts` (15 props), `markdown-node.svelte`.

### Per-claim verdict table

| # | Dispatch claim | Verdict | Receipts |
|---|---|---|---|
| 1 | Size consumed through em voices | **verified TRUE** | Atom has NO font-size (link.stylex.ts — negative-grepped); page stamps `size={14}` (:426-427) → anchor computed 14px → svg glyph `0.8em` computes **11.1875px** live (control, unstamped: 16px → glyph 12.8px lane). Underline offset stays the FIXED `4px` (`textUnderlineOffset: '4px'` in the atom) at both sizes — px literal, does not scale with the em voice. query() bare form `size={query({ md: 18 }, 14)}` (:110) stamps responsively (responsive specimen :455). |
| 2 | Theme frozen-pole pure-alias | **verified TRUE** | Co-resident light/dark specimens in ONE evaluate (:434-435 `theme="dark"`): ink **byte-identical** `oklch(0.6489 0.237 H)` both islands (H wall-clock — never quoted, L/C signature stable). Var-chain on the anchor: `--primary` **flips** between islands (formula-recomputed, drift visible) while `--jx-primary` **identical** — the declaring-element law: the atom reads the token frozen at the :root pole, the alias is pure. `@media (forced-colors: active) { color: LinkText }` present in link.stylex.ts — the platform exception, media-gated, not a theme arm. |
| 3 | Craft geometry | **verified TRUE** | Rest: `textDecorationLine` none → hover underline (atom `:hover` arm); offset **4px** computed at rest AND hover (fixed optical calibration). Icon lane: seam `marginInlineStart: var(--link-icon-gap, 0.2em)` → **2.8px** at 14px stamp; baseline shift `verticalAlign: -0.125em` → **−1.75px**. External pair live: `rel="noopener external"` + target computed on the external href specimen; icon=arrowGlyph pair renders (page :335). |
| 4 | Corrected leaf claim | **verified TRUE** | `rg "from.*link"` over ui/: the ONE component edge is `apps/www/src/lib/ui/markdown/markdown-node.svelte:64` (`import Link from '../link/link.svelte'`). code-card.svelte imports the HIGHLIGHT_KEY (token edge, :89/:223), not the component. Page prose states the corrected claim; blueprints scene covers the render path. |
| 5 | EXTRA 15−0−8=7 | **verified TRUE** | meta = 15 props, zero quoted dups; 8 universal axes all consumed (page axes block); 15−0−8 = **7** family rows (href, title, icon, children, class, style, rest + hand-summaries) — all curated in link.docs.ts, **no EXTRA lane served**. The synthesized rest row IS served AND curated (`link.docs.ts:42`). Hand API table :577 (10 rows, density filtered to universal). |

### Standard pass

- Tier 2 audit: archetype order h1 → summary → sections → api → nav; toc present and ordered.
- W3-era movement-implying panels: **0 served** (negative-grep).
- Page diagnostics: **exactly 1** — the `arrowGlyph` snippet-type error at `+page.svelte:335`. Byte-identical on HEAD (pre-existing): **not quill's debt**. Weighed: [NOTE] severity — a typing-lint on the inline snippet's inferred type, zero runtime effect (the pair renders and is a verified receipt above). Worth a upstream-style typing pass someday; not a closure blocker.
- Spec pins: link-related solos **348/348** + **73/73** green.

### Findings (severity-tagged)

- **[NOTE]** arrowGlyph snippet-type diagnostic at :335 — 1 diagnostic, byte-identical on HEAD, zero runtime effect. Not quill's debt; weigh-and-note.
- **[NONE]** otherwise — no MAJOR, no MINOR. All five claims re-derived TRUE from source + raw-SSR bytes + live computed probes.

### Part B gates

- Solos: 348/348, 73/73 green; pin solos (Part A) 20/20 green.
- tailwindless verify: green (receipt verbatim in the run log).
- docs build: green.
- docs-universal: **RED 109/110** — `native-scroll-area.html: marker missing (page count 110)`. **Sibling churn, not mine**: quill's task-21 native-scroll-area edits are in-flight in the same working tree (`git status` shows the page modified + untracked `+page.ts`; the manifest predicts the red while the page is mid-rewrite). Every other marker present (109/110). Re-run after quill lands.

### Verdict

**PASS** — link (1st of 2). marginalia holds reviewer #2 per the independence law.

---

## Environment discipline

- Port 5243: `lsof` empty before start and after kill (final: `port after: []`); server killed by PID each cycle.
- NO commits, NO pushes — descriptions fix sits uncommitted for the orchestrator.

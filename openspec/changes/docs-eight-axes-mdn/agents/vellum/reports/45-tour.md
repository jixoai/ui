# T45 — CODE tour.html (vellum)

**Tier: B (archetype restructure + the sequenced-overlay battery).** The family (tour-v2,
batch-3/4 reviewed) needed the MDN archetype and the watch-item instruments: focus law on
real navigation, the lease receipts, anchored placement, dismissal paths, step-move timing,
and the theme split's island-vs-hole twist.

## Structure (toc == DOM, LAW #19)

hero (h1 ×1) → #install (**hand SectionCard → DocsInstall**, chrome OUT) → **#overview (new)**
→ **#live-demo (was `#tour-workbench`)** → #usage → #examples → #tour-non-modal →
#tour-placement → #tour-placement-table → #tour-indicators → #tour-card → #types → #theming →
#api → #universal-props → **#accessibility (moved last — trio closes the rail)** → #see-also
(**hand card → DocsSeeAlso**, chrome OUT). **toc: 14 entries == DOM == SSR rail** (was: 14
outline-era entries with install/see-also IN the rail, accessibility mid-rail, universal-props
missing). Stale TokenTable row fixed: the hole tint was still documented as
`color-mix(in oklab, var(--background) 55%, transparent)` — the CR-2 P1-1 scrim fix made it
`var(--scrim)`; rows added for `--jx-radius-consumed` and the level2 own. div balance 0,
h1 ×1, cards balanced. **LAW #19: 90 ids page-wide, duplicates NONE (probe).**

New: #overview (three paragraphs — lease/spotlight, non-modal/focus/skip law, portal+axes+keys)
and the measured `axisRows` 8-row table + receipts paragraph in #universal-props, plus a third
seat (`theme="dark" elevation="level4"`). One code fix: the page cx `.filter(Boolean)` union
diagnostic (same pre-existing shape as toast's — HEAD:250) hardened with the type predicate;
0 page diagnostics after.

## Delivery shape: SELF-CARRIED LOGICAL PROMOTION (taxonomy)

popover="manual" is a LOGICAL top-layer promotion — the panel is NOT reparented (no ScaffoldFloat
adoption like toast; it renders where mounted), and the carriers (data-density, class:dark, the
elevation pair, the radius composition) stamp the CARD root itself (self-carried across the
promotion, the batch C portal law). The twist the probe adds: **the hole is the panel's SIBLING**
and keeps the ROOT scope — a theme island on the card never reaches the spotlight.

## Measurements (probe on 5242, chrome, real clicks/keys where focus matters)

**Focus law (triple-weight lens, real navigation).** Open → `document.activeElement` = the Next
button (`data-jx-tour-next`); every step change re-lands it (after ArrowRight the focused button
reads "Finish" on the last step); Escape restores the invoker ("start the tour" BUTTON), Skip
restores the invoker. NOTE: the restore only measured correctly with REAL clicks — programmatic
`el.click()` never focuses the invoker, so `invokerFocus.el` captured BODY (probe1 artifact,
owned below).

**Announcements per step.** The dialog carries `role="dialog"` + `aria-label={step.title}` — the
label flips with the step (Target A → Target B → …) and the landing focus re-announcement is the
AT vector; the "1 / n" counter is `aria-hidden="true"`; recipe dots aria-hidden with a named
`role="group"` ("tour progress"). Non-modal receipts: `popover="manual"`, `aria-modal="false"`,
body/documentElement overflow `visible/visible` (no clamp), tint `pointer-events: none`.

**The lease (reversible anchor-name).** Before: target A `style.anchor-name` = "" (prior null).
During step 1: `--jx-tour-s25` (per-instance name derived from `$props.id()`) with prior ""
saved in `dataset.jxTourPriorAnchor`. Advance: A restored to "" AND the dataset key deleted, B
leased with the same instance name. Back: A re-leased. Escape: B restored, key cleaned. Verbatim
per the contract, measured on every transition.

**Anchor placement (zero geometry JS).** Default bottom placement: panel top − target bottom =
**12px** exactly (the `--jx-tour-gap` margin term), left edges aligned (0px delta). Page-level
override recipes: card-above gap 18px, card-beside gap 16px (the 12px margin term composed with
each wrapper's own spacing; the override expressions apply cleanly — card above/beside the
leased target, edges aligned).

**scrollIntoView.** The non-modal recipe's step-2 target lives inside a 12rem scrollbox:
`scrollTop` 0 → **236** on entering the step (the `scrollIntoView({block:'nearest'})` lease
behavior), no scroll clamp anywhere.

**Step-move timing.** 3 runs: the card reaches the new anchor position in **1 frame** (the
sampled top+left composite identical from the first post-click frame) — step transitions are
pure CSS anchor repositioning, zero JS animation, exactly as the source claims.

**Open motion — the first-open/reopen split (measured).** Fresh page, FIRST open: computed
`--jx-p` tweens 0.109 → 0.217 → 0.253 → … → 0.652 (linear, the kernel's 460ms window) — the
WAAPI entry plays. After ANY close, reopen: `--jx-p` = **1.000 flat** from the first sample —
the exit never lands `lastP = 0` (the recorded `{#if}` unmount-vs-460ms gap, tour.svelte:32-36),
so `play(1)` starts at 1 = "nothing to animate" and the card snaps in. Deterministic across all
runs; the family header documents the gap — my measurement quantifies its consequence (flagged
below for the owner). RM: the kernel's reduced-motion branch jumps `--jx-p` straight to the
target (source receipt; both measured opens settle ≤2 frames).

**Dismissal paths ×3.** Skip click → panel gone, invoker focus restored; Escape key → same;
Finish (last step, button label flips Next → Finish) → `onfinish(index)` fired — the workbench
canvas output reads **"finished at step 1"** (the last index of the 2-step tour). Back honesty:
`disabled` at step 0; ArrowLeft/ArrowRight/Enter keyboard parity measured (Enter advanced,
ArrowLeft returned, Escape finished).

**THEME-SPLIT (island vs hole).** The `theme="dark"` seat: card root carries `class:dark` +
`--jx-elevation-effective: 8` + the level4 pair (own level2 overridden by the seat) — the panel
ground re-derives IN the island (oklch(0.245 0 0), the level4 dark rung via the jx-surface fill
chain head) while the title ink stays :root-frozen black (oklch(0 0 0)) — **3.54:1, fails AA
normal** (same drift pattern as toast's #14, island-only; root-level dark re-derives the inks
white). The HOLE (sibling, root scope): anchored form = transparent fill + one 100vmax
`rgba(0,0,0,0.32)` box-shadow = the LIGHT scrim — the spotlight always follows the page theme,
never the card's island. Light-root card contrast for reference: 19.33:1.

**Radius — DRIFT CONFIRMED (probe-settled).** The card root stamps
`--jx-radius-consumed: calc(10px * 1)` (explicit lane: `--jx-radius-effective` 10px × the
§14 factor) — and the computed border-radius of the panel AND the surface body is **0px**: no
rule in tour.css or the surface chain reads the stamp (every other consumer family carries its
own reader — popconfirm.css, float-button.css, card.css, menubar/tooltip/dropdown-menu/
system-dialog/terminal-card css). The tour card renders square by consequence; flagged for the
owner (missing reader rule vs vestigial stamp — their call). The auto form (concentric
`max(0px, R − P)`) is what the default card carries (probe inline-style receipt).

**Density/size seats.** `density="small"` → `data-density="sm"` on the card root (self-carried),
but the card's own voices stay static (title 13px = `--jx-text-base`, no coefficient readers in
the card paint — grep) — the usage string's "one number moves the walkthrough card" is true only
of the panel's own font-size (18px carrier measured), NOT the default card's text; the seat copy
in `universalUsage` remains illustrative for size-on-composed-content. `size`/`shape`/`color`/
`motion`-effective: zero readers over ui/tour/ (grep receipts); elevation consumed via the
SHARED surface law (jixoai.css .jx-surface-body reads the pair — the family stamps, the sheet
reads).

**KEYED-EACH.** The tour renders ONE card — there is no step-list DOM (the LAW #18 surface is
empty by construction); the only keyed each on the page is the indicator dots (`(i)`, unique by
construction — grep receipt).

## Gates

- `verify:tailwindless` rc=0 — VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42`.
- `verify:docs` rc=0 · `verify:docs-universal` rc=0 (**110/110**).
- page-scoped svelte-check: **0 diagnostics on tour.html/+page.(svelte|ts)** after the cx
  hardening (fleet rc=1 = pre-existing debt elsewhere — untouched files).
- Ambient solo (apps/www, `npx vitest run` three files): batch2-components + docs-structure +
  docs-nav-filter = **3 files, 56/56, exit 0** (vitest's teardown "close timed out" note;
  exit 0).

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 98327 + listener 98362 (/tmp/t45-*.pid);
  killed BOTH by PID; lsof AFTER: empty, **rc=1**.
- NO commits, NO pushes. Probe DOM injections (reduced-motion emulation) reset in-probe; all
  tour closes in-probe went through the real Skip control (a document-dispatched Escape never
  reaches the panel's onkeydown — probe1 fault, owned below).
- Sibling keyed noise: svelte-check fleet + gates cross-checked — the one tour.html diagnostic
  was my page's pre-existing cx, fixed; no sibling file touched (quill's terminal-footer,
  marginalia's spin, scribe's tags-input left alone).

## Probe faults owned

1. **Programmatic clicks don't focus** — the invoker-restore receipts first read BODY because
   `el.click()` never moves focus; `invokerFocus.el` had captured BODY at open. Re-measured with
   real Playwright clicks → the restore lands on the invoker button. Focus claims need focus-
   real interactions, not synthetic activation.
2. **Cleanup Escape dispatched on `document` never fires the panel handler** (the keydown
   listener is ON the panel; a document-dispatched event doesn't propagate INTO it). Run 2 of
   the step-move battery then clicked Next on an already-finished tour → zero-rect samples.
   Cleanup switched to the real Skip control.
3. **openMotion sampled the wrong channels** — opacity/translate of `.jx-surface-body`; the
   kernel animates the registered `--jx-p` on the PANEL (fill/border/blur derive from it).
   First read: "no motion, settles 13ms" — wrong. Re-read on the right channel found the
   first-open tween AND the reopen snap.
4. **A bogus balance assert nearly masked a real pass** — `count("<Tour")` counts template-
   literal copies inside usage strings; the read-back assert "failed" while the file was
   correct. Sanity asserts must count real markup, not substrings that appear in embedded
   code samples.
5. **Stale-copy catch**: the theming TokenTable documented the retired hand-mixed tint
   (background 55%) — fixed to `var(--scrim)` per the CR-2 P1-1 ruling.

## Open questions / drift flags for the orchestrator

1. **Drift flag #15 — `--jx-radius-consumed` stamped, never read (tour).** The card root
   composes the §3/§14 stamp (tour.svelte:226-230) but tour.css/the surface chain has no
   reader; computed radius 0px with a large radius stamped. Every sibling consumer family
   carries the reader rule in its own css. Owner's call: add the reader rule (one rule, the
   popconfirm pattern) or drop the stamp as vestigial.
2. **The recorded `{#if}` exit gap is deterministic on reopen, not a race** — after any close,
   subsequent opens snap in at `--jx-p = 1` (measured flat across runs; first open on a fresh
   page tweens the full 460ms). The family header calls it a race; the measured behavior is
   "first open animates, every reopen doesn't". If the entry motion matters, rewiring the
   render guard (the family's own recorded future change) is the fix; if not, the gap doc
   could state the reopen consequence plainly.
3. **Theme-island ink drift (#14 family pattern, tour flavor)** — frozen :root title ink on
   the island's re-derived dark rung = 3.54:1 (island-only; root dark is fine). Same candidate
   fix shape as toast's flag (stamp the ink pair under class:dark or re-declare in the
   theme-scope list).
4. **`universalUsage`'s "one number moves the walkthrough card"** is size-on-the-panel-root
   (measured 18px) while the default card's own text stays token-static — the copy is
   defensible (composed snippet content DOES scale) but worth a precision pass if the next
   reviewer reads it as "the card's type rescales".

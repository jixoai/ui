# T120b — SECOND REVIEW statistic.html (quill)

**1st:** marginalia 111, PASS 0M/0m/2L/1N, Tier 2 proposed (consolidated 97f5b6cc).
Owner = scribe. **2nd protocol:** her report opened FIRST; all three landed items
verified at DOM + source layers; headline receipts re-derived with my own instruments;
fresh axis = the pause/resume arithmetic (the toast freeze law's cousin). Probes served
from the fresh dist via `vite preview` (HEAD **33b28d8d**, build exit 0).

## Verdict: PASS — 0 M / 0 m / 0 L / 0 N — Tier 2 confirmed (all three findings landed)

## Landed items — verified

1. **LOW-1 (radius stamped-never-consumed) — LANDED in the universal summary**: the
   served #universal-props text reads "**Radius is STAMPED, NEVER CONSUMED (measured,
   task 111)**: the readout is flat text with no corner geometry to round — the family
   reads no --jx-radius-* var (the color-picker #19 class); the demo lane teaches the
   stamp, the paint stays honest about it" — the T104 class taught by name, in the
   summary, served.
2. **LOW-2 (the sr-only aria-live region) — LANDED, SERVED**: the live demo now carries
   the recipe's node — `<p class={cx(rt.srOnly)} aria-live="polite">{finished ? 'window
   closed' : ''}</p>` (+page.svelte:295-298, the source comment names the intent) — and
   the served DOM has the `.sr-only [aria-live="polite"]` node inside the countdown
   section. Not just the drawer string any more.
3. **NIT-1 (the class row) — LANDED**: the API table now serves 7 named rows —
   title*, value*, trend, prefix, suffix, density (ambient-scope wording), **class**
   ("Forwarded to the readout root; consumer classes land last").

## Her receipts re-derived — concordant, with one digit made environment-honest

- **Trend voices — the LAW holds, the hue digit is per-load**: the up glyph's L/C is
  EXACTLY `0.6489 0.237` == `--jx-primary` (brand voice), the down glyph paints
  **oklch(0 0 0)** (destructive/black, the T106 resolution). One refinement my repeated
  reads surfaced: the brand hue itself is **per-load variable** — my runs read the root
  var at hue 189, then 179, and the glyph tracking it exactly (her dist read 346). The
  stable claim is "up = the brand primary voice" (L/C identity, exact); the hue digit is
  environment-and-load dependent and should not be quoted as a constant in future
  receipts.
- **The countdown, live**: ticks at the ~1s cadence with distinct digits; the value's
  width is **identical across different digits** (tabular-nums face confirmed on the
  num atom); **pause freezes** (held across 1.5s, the interval cleared).
- **The precision matrix**: one raw 1234.5 through the digit segments → **1,234.50 /
  1,235 / 1,234.500** at 2/0/3 — her exact triple, re-derived on the dist.
- **The density trio**: **24 / 30 / 36px** at xs/default/lg — measured on the num atom
  (`fontSize: calc(var(--jx-line) * 1.5)`, and the per-rung `--jx-line` calcs re-derive
  in the seat scope: the arithmetic lands 16×1.5/20×1.5/24×1.5). My first read measured
  the value WRAPPER (no font-size — 16px flat) and looked like a density-flat
  regression; the num atom is the carrier. Probe fault, owned.

## FRESH AXIS — the pause/resume arithmetic (the dispatch's suggestion, GREEN)

Her battery covered cadence + pause freeze; mine covers the RESUME: pause at a known
remaining (frozen value read), resume via the start control, sample the next tick —
the value continues from the frozen remaining with **exactly a −1s step** (continuity,
no reset to the full window, no double-step). The toast freeze law's cousin holds: the
page-owned tick state survives a pause/resume cycle without losing or duplicating a
second.

## Gates (batch-shared, per the ONE-svelte-check rule)

| Gate | Result |
|---|---|
| svelte-check (ONE run, saved /tmp/t120-scheck.log, grepped) | statistic.html + +page.ts: **0 diagnostics** — her :177 page cx clone CLOSED. ui/statistic family: **0 ERRORs** (her :116 component twin CLOSED too), 8 standing W3-D3 warns (:99) |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once) |
| Fresh build | exit 0 at 33b28d8d; probes on the dist via vite preview |

## Probe faults owned (all mine)

1. **The wrapper vs the num atom**: my density read measured `[data-jx-stat-value]`
   (the flex wrapper — no font-size, 16px flat) and looked like a density-flat
   regression; the 1.5× line rides `[data-jx-stat-num]`. The family source's atom table
   settled it; 24/30/36 measured at the num.
2. **The class-hook selector**: `[class*="jx-stat"]` matched nothing (stylex hashes) —
   the family's css-less `data-jx-stat*` hooks are the selectors.
3. **Segmented-control lag**: my first precision pass read one render behind the clicks
   (null + shifted values); 600ms settles read the exact triple.
4. **The resume control**: there is no resume button — **start resumes** after pause;
   my first pass invented a pause-double-toggle shape and measured nothing.

## Process

Port **5241** (preview/district seat): rc=1 before → fresh dist served → after gates
killed by PID + wrapper → `lsof -ti :5241` **0 lines, EMPTY**, zero Chrome orphans.
Sibling ports untouched. NO commits, NO product-tree edits. Artifacts:
/tmp/t120-a.mjs (a/a2), b, b2, dens/dens2/dens3, diag, -ssr fetches, -build/-prev/
-scheck/-docs/-universal logs.

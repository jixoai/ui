# T113 — SECOND REVIEW tour.html (quill)

**1st:** marginalia 78, PASS 0M/0m/0L/1N (her verdict: PASS — 0/0/0/1), Tier 1 implied by
the OWNER's consolidation line; owner = vellum (CODE 45). **2nd protocol:** her report
opened FIRST; landed/cleared state verified; headline receipts re-derived with my own
instruments (REAL-event drives only); one fresh axis she named as source-read-only is now
measured live. Target: `apps/www/src/routes/docs/components/tour.html/+page.svelte` over
`apps/www/src/lib/ui/tour/`. Fresh build at HEAD **4c4ba4ff** (== the dispatch floor),
exit 0; dev served on 5241 (SSR 200, 1,246,451 bytes — her byte scale).

## Verdict: PASS — 0 M / 0 m / 0 L / 1 N (a new-information flag, not a page defect) — Tier 1 confirmed

## Her receipts re-derived — concordant, on real events

1. **The tween duality, both paths**: fresh-page first open samples `--jx-p` RAMPING
   (rAF-cadence, kernel ramp live at the card); after Escape, the reopen samples read flat
   **1.000 from the first frame** — the `{#if}` KNOWN GAP deterministic exactly as billed
   (tour.svelte:33/:52).
2. **The FOCUS LAW on REAL clicks** (my first pass used programmatic clicks and produced
   four false fails — see probe faults): open lands **Next**; Next re-lands the last
   step's **Finish**; **Escape**, **Skip tour**, and **Finish** all restore
   **"start the tour"** — three dismissals, invoker restored each time.
3. **The lease, name-matched**: while open, the card's `position-anchor` reads
   `--jx-tour-s25` and the element carrying that exact `anchor-name` is the step target —
   **bottom gap measured 12px-band** (my read: in the 8–20px band, the composed placement
   recipe's gap). After close: **lease census empty, dataset cleaned** (0 leased, 0
   `jxTourPriorAnchor` remnants) — her census receipt reproduced.
4. **Dismissal ×3 + onfinish**: the page's finishedAt receipt renders (onfinish fired on
   the end paths).
5. **Theme split, BOTH tiers on one page**: the dark-island card (uniTourOpen3,
   `theme="dark" elevation="level4"`) carries `class:dark` through the popover promotion;
   ground re-derives (`--foreground` oklch(1 0 0), `--jx-elevation-level4-surface`
   **oklch(0.245…)** — the BOARD's level4 0.245 digit, measured); the ink atoms FROZEN
   (`--jx-foreground` oklch(0 0 0), title leaf ink black, description leaf ink
   **oklch(0.3211 0 0)**) — tier 2. The UNPINNED main tour under root `html.dark`:
   `--jx-foreground` flips **oklch(1 0 0)**, title leaf ink **oklch(1 0 0)** — tier 1, no
   hold anywhere. Root-dark injection reverted in-probe.
6. **Drift #15**: `--jx-radius-consumed` stamped on the served card, computed
   **border-radius 0px**, and `grep -rn 'var(--jx-radius-consumed'` over lib/ui/tour/ →
   **0 readers** — stamped-never-consumed, still accurately taught.
7. **LAW #19**: ~90 ids on the live DOM (my census in the 85–95 band), duplicates NONE.
   **Dots keyed**: source :180 `{#each Array.from({ length: api.total }, (_, i) => i) as i
   (i)}` — unique by construction, still true.
8. **The NIT's landed state**: her 3.54:1 framing NIT — the page source carries **no
   contrast number at all** (grep 3.54/contrast/translucent → empty); the theming text
   teaches the split structurally ("THE SPLIT ISLAND (measured, probe)…"). The
   drop-the-single-number resolution is in place; nothing owed.

## FRESH AXIS — the restore-existing lease branch, now measured

Her receipt could only source-read the prior-restoration branch (:329-330, "no page demo
ships a pre-anchored target"). I constructed it: planted `anchor-name: --my-prior-a` on
the step-1 target before opening → while open the lease OVERRIDES to `--jx-tour-*` with
the prior recorded in `dataset.jxTourPriorAnchor` → on close the target's inline anchor
is **RESTORED to `--my-prior-a` exactly** (not removed) and the dataset key is deleted.
The reversible lease is now behavior-receipted on BOTH branches. 4/4 checks.

## Gates

| Gate | Result |
|---|---|
| svelte-check page-scoped | **tour.html + +page.ts: 0 diagnostics** (matches her receipt) |
| svelte-check family | **3 ERRORs — exactly her standing trio** (:353 HTMLElement\|null narrowing, :430 the Object.entries-undefined overload, :456 excess autoId) + 8 standing warns. **NEW INFORMATION per the dispatch**: the :430 **cx seat is still open** — the fifteen-family closure did not reach tour's family. Same lines as her 1st review (no regression); flag for the consolidation lull's sweep list. |
| verify:docs | **rc=0 — fully green** (the dispatch's "any red is new information" clause untriggered; the staged global-gate line prints green) |
| verify:docs-universal | GREEN 110/110 (once, this task) |
| Fresh build | exit 0 at 4c4ba4ff — the dist floor satisfied |

## Probe faults owned (all mine, all fixed pre-verdict)

1. **The programmatic-click trap — the exact one the dispatch warned about**: my first
   focus-law drive opened the tour with `btn.click()`; programmatic clicks never focus, so
   the invoker WAS body and Escape "restored" body — four false fails. Real
   `locator.click` drives fixed all four (the law was never in doubt; my instrument was).
2. **Button names**: the zero-config default card reads **"Skip tour" / "Back" / "Next" /
   "done"** — my `'Skip'`/`'Finish'` exact-text finders hit code-sample text or nothing
   (the Finish leg needs advancing to the last step first).
3. **Anchor finder**: a bare `[style*="anchor-name"]` selector grabbed an off-screen
   recipe element (gapPx 1243) — fixed by matching the card's computed `position-anchor`
   name to the leased element.
4. **Ink finders matched ancestors** (wrapper computed color white vs the atom's frozen
   read) — leaf-element reads are the honest ink instrument (her card-root-vs-atoms note,
   re-learned).
5. **The step-1 target is an id-less SECTION** — `getElementById` planting crashed; a
   marker-attribute targeting pass fixed the fresh axis.

## Process

Port **5241**: pre-check rc=1 → served dev (one cold-start rewait; no restart) → after
gates killed by PID → `lsof -ti :5241` **0 lines, port EMPTY**, zero orphan browsers.
NO commits, NO product-tree edits. Sibling ports (5242/5243/5244/5230) untouched.
Probes: /tmp/t113-p1.mjs, p1b, p2, p2b, p3, dots, inspect + SSR curl.

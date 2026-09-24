# TASK 16 — REVIEW heading, 2nd pass (vellum, 2026-09-22)

**Verdict: PASS — CLOSURE DECLARED** (heading becomes page #14). The
rare self-confirmation case, executed as a re-verify-grade pass on the
CURRENT tree (post avatar-fix commits 2c185457 + a53703e2, which do not
touch heading — verified: 54750f68 is still heading's last commit).
Every task-14 claim re-derived fresh; my task-14 MINOR (the cx
predicate) is STILL OPEN on the page and is re-flagged for quill's next
micro-pass — non-blocking per the dispatch.

## Central claims — fresh receipts (16/16 probe PASS)

1. **Inline-stamp mechanism, three levels**:
   - SOURCE: `defaults.svelte.ts:575` (inside stampCarriers, reached via
     stampCarriersForLanes :800) pushes BOTH
     `'--jx-size-effective: ${value}'` and
     `'font-size: var(--jx-size-effective, 1rem)'`; auto spreads nothing.
   - SSR BYTES: 183 stamp occurrences page-wide, verbatim
     `--jx-size-effective: <n>px; font-size: var(--jx-size-effective, 1rem)`;
     the auto h3 carries NO style attr.
   - COMPUTED (LAW #15 gate — fontWeight 700 before reading): see 2.
2. **Replacement numbers**: auto h3 **20px** (1.25 × 16 ambient, no
   stamp); size={14} → **exactly 14px**, leading seam **17.5px** =
   1.25 × 14; size="large" → **18px** (--jx-size-large), leading 22.5px.
   The ladder intact at auto: h2 24 / h4 18 / h5=h6 16px.
3. **Partial theme pole**: dark island — ink **oklch(0 0 0) → oklch(1 0
   0)** via the seam's --foreground fallback; fontSize (20px), weight
   (700), leading (25px) BYTE-IDENTICAL to the light panel. The prose
   escape hatch re-verified at prose.css:97
   (`[data-jx-ty-ink='gradient'] :is([data-jx-text='p'],
   [data-jx-heading])`).
4. **Zero-reads greps (fresh)**: ZERO `-effective` reads and ZERO
   kernel-channel reads in ui/heading/; the only raw token is
   `var(--foreground)` ×2 (the seam fallback, both layers).
5. **14 − 8 = 6 counting the synthesized rest row** — served tables
   re-counted: family rows `level, id, style, children, class, rest` (6)
   + Universal section `size, shape, radius, density, color, theme,
   elevation, motion` (8).
6. **FALSE panels ×0**: "primary ink" and "radius medium" absent from
   the served SSR.
7. **One-h1 law + ladder 2–6**: exactly 1 `<h1>` (the hero);
   data-jx-heading hooks = 2–6 only; `data-doc-demo-scope="headings-ok"`
   ×4.
8. **query() both directions**: number lane bare compiles; flip
   **14px @600 ↔ 18px @1440** across the 48rem key — re-measured.

## Findings carried forward

1. **MINOR (carried, non-blocking)** — `heading.html/+page.svelte:122:28`:
   the page-local `cx` still uses `.filter(Boolean)` without a type
   predicate — the fleet cx-idiom error (1 error; the page's only
   diagnostic). The avatar fix (2c185457) demonstrated the one-line
   predicate fix and retired the identical error there. **Flagged for
   quill's next micro-pass** per the dispatch; it does not gate this
   closure (pre-existing at integration, counted in the 1622 baseline,
   zero runtime effect).
2. No new findings: nothing on the page drifted since 54750f68, and the
   avatar-fix commits did not perturb it.

## Gates (current tree)

- probe **16/16 PASS** · ambient solo **284/284**
- svelte-check (fleet 2486 files): **1622 errors / 1030 warnings**;
  heading page = exactly 1 error (finding 1), 0 warnings
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110`
- verify:docs exit 0 — skeleton lint green (staged scope)

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 70058 → vite
  70088; BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
- NO commits, NO push, ZERO tree edits (re-verify; the only in-flight
  working-tree files are a sibling's image.html task).
- Probe /tmp/vellum-14-heading-probe.mjs re-run (LAW #15 gate); SSR
  snapshot /tmp/vellum-16-heading-ssr.html; logs
  /tmp/vellum-16-heading-*.log.

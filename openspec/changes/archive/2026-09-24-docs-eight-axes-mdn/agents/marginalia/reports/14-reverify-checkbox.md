# Report 14 — RE-VERIFY `checkbox` (marginalia, 2026-09-22)

Reviewer: marginalia (re-verify of my own task-8 NEEDS-WORK; scribe's
consolidated fix integrated at 7848cfe2 — working tree byte-identical
for the checkbox route, curation, and the two edited specs, git
verified). Evidence: current source, raw SSR bytes (1,165,091 B,
HTTP 200), live probes, solo spec runs (canvas-same-source + the
props-table trio).

## Verdict: PASS — ALL SEVEN FINDINGS VERIFIED FIXED

**Checkbox CLOSES (next page number in the ledger — #9/#10 per the
board's counting).** My in-a-form drawer MAJOR is fixed at the root
(the drawer now teaches the real atoms), quill's contrast-cell MAJOR is
fixed with real stamps and a real 24-vs-20 box step, and the co-stamp
law I banked in task 8 is now IN the page — with the ×3 probe number
cited — in both the density row and the VISIBLE TokenTable default
cell.

## Per-finding verdict table

| # | finding | fix claimed | re-verification | verdict |
|---|---|---|---|---|
| 1 | quill MAJOR — the wrapped-contrast cell carried no stamps while the prose promised them | cell passes `density="lg"`; copy updated | Source: `<Checkbox … name="wrapped-contrast" density="lg" />` (:643). SSR: the cell's wrapper renders `data-density="lg"` + `style="--jx-density-coefficient: 1"`. Live: contrast box **24px** vs the bare twins **20px** — the visual contrast is real. The bare-section prose (:616-619) now says "The wrapped contrast cell passes the same density="lg" and shows where the stamps land". | **FIXED** |
| 2 | my MAJOR — the in-a-form drawer was a stale tailwind mirror | rewritten to the stage's real atoms + cx/rt imports; form canvas stays id-less (F4-rejected payload), states/query/bare id'd, PILOTS 1→4 | Drawer sample (:116-153) carries `import { rt } from '@lib/surface/routes.stylex'`, the cx joiner, and `cx(rt.col16)` / `cx(rt.wrapRow12, rt.pt4)` / `cx(rt.inkMuted, rt.text125)` — the exact atoms the stage runs (stage :160-165). Served: `cx(rt.col16)` in the drawer code view (entity-encoded form); `flex flex-col` / `text-[12.5px]` / `text-muted-foreground` ×0 in checkbox content (the one tmf hit is date-picker's inlined css kernel comment — site bundle, not this page). Copy-paste-runnable: yes. The form canvas stays id-less with the payload-page-state rationale; `states`/`query`/`bare` took ids (aria slugs jx-canvas-{states,query,bare,axes} ×4 each in SSR) + resolveRawCode — PILOTS 1→4. | **FIXED** |
| 3 | my NIT — the co-stamp story incomplete (the pin is load-bearing) | density row names BOTH stamps + pin activity + ×3 number, in the VISIBLE default cell | Density row (:235): "stamps the data-density scope … AND co-stamps --jx-density-coefficient: 1 on the same root — an ACTIVE pin, not a formality: every channel composes base × coefficient inside the scope … (an outer ×3 wrapper moves a pin-less box 24 → 72px; the pin holds the rung exact)". The TokenTable coefficient row's DEFAULT cell (rendered — W-next #3 respected): "1 at :root; re-pinned to 1 by every named rung (an active pin inside the scope: it stops outer coefficients at the boundary)". Both served (byte counts ≥1 each). My task-8 ×3 receipt is now page text. | **FIXED** |
| 4 | unreachable density override | retired + drift-spec snapshot edits | checkbox.docs.ts: the "Explicit override of the ambient density scope" description serves ×0 and is gone from the curation; the drift spec's LEGACY row follows AXIS_ROWS and the ambient matrix drops `density: ['description']` — the props-table trio solos green (below), so the snapshot edits carry no regression. | **FIXED** |
| 5 | corner-shape wording | reword in row + prose | Shape row (:221) and the supply-only prose (:568) both read "an undeclared customization seam whose bevel fallback wins today; the shape axis never bridges it" — served ×2. Matches quill's original receipt (the token is declared nowhere). | **FIXED** |
| 6 | drawer names drifted (task-alpha/beta) | bare-plain/bare-inert throughout | `task-alpha`/`task-beta` ×0 in source and served; the bare drawer composes from resolveRawCode('bare') so the names are the stage's. | **FIXED** |
| — | (vellum PASS context) | — | The task-8 measured-TRUE set (EXTRA-lane 12-row table, supply receipts) untouched by the fix round — family table re-parsed clean this run. | — |

## Original verified-TRUEs — spot-checks (all hold)

1. **Number-lane carrier-strip posture**: task 8's proof (rung attr
   stripped → coefficient sweep byte-unmoved; restored → steps) — the
   fixed page's density row now TELLS that story with my ×3 number, and
   the co-stamp probe (24→72 pin-less) is cited at the claim site.
2. **The 4-ladder grid**: sm box 18px and lg box 24px re-measured on the
   axes panels; the ladders' 2xs→lg values were receipted in task 8 and
   the fixed TokenTable/rows carry them unchanged.
3. **The full-flip pole**: the real dark-island checkbox fill follows
   the dark profile (dark island present, fill oklab 0.7044… vs the
   light checked box oklab 0.6489…) — checkbox remains the full-flip
   pole, unchanged by the fix round.

## Gates (my run, this task)

- Solo: `canvas-same-source` + `props-table-meta-drift` +
  `props-table-render` + `props-table-print-hook` → **4 files, 112/112,
  exit 0** (the canvas spec now 75 tests — checkbox's 4 blocks green;
  the drift-spec snapshot edits pass within — no regression from
  finding 4's spec edits).
- `verify:docs-universal` → exit 0, `GREEN: 110/110`.
- `verify:tailwindless` → exit 0, receipt verbatim: `files=2
  identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6}
  forms=42 — bound verbatim`.
- Dev smoke HTTP 200, bytes 1,165,091.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244`; lsof → 0 lines
  BEFORE. Kill-by-PID: listener PID **2000** killed; post-kill lsof →
  0 lines; pgrep → empty.
- Probe/scratch: /tmp only (`marginalia-14-dev.log`,
  `marginalia-14-cb-ssr.html`, `marginalia-14-solo.log`,
  `marginalia-14-univ.log`, `marginalia-14-tw.log`). Repo-side writes:
  this report + experience.md. NO commits, NO push.

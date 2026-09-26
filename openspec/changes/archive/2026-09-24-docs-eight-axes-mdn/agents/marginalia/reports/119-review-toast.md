# TASK 119 — SECOND REVIEW toast (marginalia, 2026-09-24)

- **Reviewer**: marginalia (2nd of 2; scribe's 1st = task 71, consolidated at 4c4ba4ff —
  opened and read FIRST per protocol; her receipts re-derived with my own instruments,
  not trusted)
- **Target**: vellum's page — `apps/www/src/routes/docs/components/toast.html/`
  (+page.svelte 512 lines + +page.ts) over the toast family. Vintage: **HEAD = dist =
  f4a36087** (the dispatch reference exactly — the tree has not moved since).
- **Method**: source reads (page, +page.ts, viewport queue/expiry/chip machinery
  :279/:332/:346/:692/:731-735/:947-954, toast-store.ts setVisible :444-501), headless
  Chromium over dev :5244 (five-stage behavioral probe), served-DOM + dist-byte order
  receipts, the gates.
- **VERDICT: PASS** — **0 MAJOR / 0 MINOR / 0 LOW / 0 NIT**. Tier proposal: **tier 2
  CONFIRMED** — the second review converges with scribe on every claim; zero new defects.

## The three landed items — all VERIFIED

1. **(a) Live-demo below Usage — VERIFIED at four layers.** Data: +page.ts toc is
   overview → usage → live-demo → types → stacking → theming → api → universal-props →
   accessibility. Source: `#usage` (+page.svelte:339) precedes `#live-demo` (:344), with
   the consolidation comment (:341-343) naming the docs-lint contract. Served DOM: H2
   order [Overview, Usage, Toast variants, The stack…, Density and tokens, API, The
   eight axes on toast, Accessibility, See Also], **no Examples heading**,
   `#usage.compareDocumentPosition(#live-demo) & FOLLOWING` true. Dist bytes
   (f4a36087): `id="usage"` at byte 25414 < `id="live-demo"` at 28176, first
   `data-jx-canvas` after usage, the string "Examples" absent.
2. **(b) The family's three type errors closed and mirrored — VERIFIED.** Page-scoped
   svelte-check: **toast.html page seats = 0**; the toast family **Error seats = 0**
   (the old dialog:52 + viewport:225 joiners and :878/:885 ternaries are gone from the
   tree). Family remainder: 8 Warns, all the fleet-wide provideUniversalLanes/
   state_referenced_locally noise at viewport :207 — counted separately per standing
   rule. (Fleet backdrop this run: 1490 errors / 1028 warnings / 568 files.)
3. **(c) W-next #7 digit reconciliation is LEDGER-ONLY — VERIFIED.** `rg -n
   "2\.81|1\.17|contrast"` over +page.svelte → **rc=1, zero hits**. The page claims the
   theme split structurally (frozen popover aliases vs re-derived surface/tonal) and
   quotes no contrast digit anywhere; scribe's 1.17:1 correction stays in the ledger
   only, exactly as dispatched.

## Scribe's receipts — re-derived with my own instruments (all confirm)

1. **Per-item live regions, content AT insertion** (pre-armed MutationObserver, installed
   before any push): the polite push inserted a **role=status card carrying title
   "Deployed" + description "build 698c" AT the mutation record**; the assertive push
   inserted **role=alert "Build failed"**; exactly **ONE [role=alert] on the page**, the
   polite card still role=status. Burst census: visible titles [#2,#3,#4,#5], the chip
   reads **"+3 queued"** (`data-jx-toast-queued="3"`, **aria-hidden="true"**) —
   arithmetic 7 live − 4 rendered = 3 holds; queued "Deployed #1" absent from the DOM.
2. **The timing battery, push-exact**: capture-phase click mark → removal on the polite
   push: **5240 / 5275ms** (scribe's instrument 5245; the claim family 5224-5227 —
   consistent, and my dev runs agree with her preview runs). Insert delta 6 / 12ms
   (content at insert). The leaving ghost first paints at +5024 / +5064 and the card
   unmounts **216 / 211ms** later — EXIT_MS 220 measured in the wild, twice.
3. **FIFO promote on real clicks, hover-expand first**: burst ×5 → hover the stack →
   click "Deployed #2"'s × (a real Playwright pointer click, post-expand hit-test) →
   visible titles **[#1, #3, #4, #5]**, chip retracted — byte-identical to scribe's
   corrected receipt.
4. **Density 13 → 15 → 12**: default-stack description computes **13px** with **no
   data-density at auto** (the no-opinion law, lane attr null); the lg island
   (**data-density="lg"**) computes **15px**; the query seat flips **lg/15px → sm/12px**
   across the 48rem resize — and the named-rung island holds 15px/lg as the control
   (a named rung does not ride the viewport query).

## Fresh axis — the queue-expiry-arms-at-first-visibility law, END-TO-END

Burst ×5 on a fresh load, then NO interaction — pure observation, 40ms transition
sampling (store-grounded: a viewport-owned push lands un-armed, setVisible arms at
first visibility — toast-store.ts :444-501):

| t (ms) | cards | titles | chip |
|---|---|---|---|
| 140 | 4 | #2 #3 #4 #5 | 1 |
| 5041 | **5** | #1 #2 #3 #4 #5 | — (retracted) |
| 5241 | 4 | #1 #3 #4 #5 | — |
| 5281 | 1 | **#1** | — |
| 8000 | 1 | #1 (still alive) | — |
| 10281 | 0 | — | — |

Reading: the four visible clocks expire at ~5.0s and paint their 220ms exit snapshots —
the t=5041 row catches the promotion moment with **five cards mounted** (the queued #1
entering the DOM while the four ghosts still paint; the 5→4→1 cascade IS the snapshot
window observed without a dedicated ghost poller). The promoted oldest (#1, FIFO) was
**still alive at t=8000** — far past the ~5.25s at which it would have silently expired
under arm-at-push — and unmounts at **10281 = promotion + exactly 5000ms** of its OWN
window (plus its own snapshot to 10281−5024≈2×). The queued toast never expires unseen;
the chip arithmetic and retraction ride the same transitions. **Law verified
end-to-end.**

## Standard battery

- SSR/post-settle duality: payload served; the page hydrates clean post-boot (no
  undefined/null leakage observed in any census).
- Vocabulary: no `jxoai` misspellings introduced (page + family greps clean).
- KEYED-each: the stack each keys `item.id` (monotonic counter — the FIFO reshuffles in
  stages C/D exercise element identity; no duplication artifacts).
- LAW #19: the ids in play (three stacks + dialog names jx-toast-<id>) all derive from
  the per-store counter; no duplicate-id signal in any census.
- EXTRA lane: the meta-generated viewport table, the promise/push API tables, the
  variant ladder, and the stack-dialect canvas all served and driven across stages.

## Gates

- **verify:docs rc=0** — "all docs pages pass the skeleton lint (staged scope green)";
  only the recorded [backlog] fleet entries remain. The scribe-T71 red is dead; the
  landed order fix holds.
- **verify:docs-universal rc=0 — 110/110.**
- **Dist vintage f4a36087 = HEAD = dispatch reference — no rebuild performed
  deliberately**: quill (5241) and scribe (5243) were both serving `vite preview` off
  the shared dist at gate time; a rebuild would have swapped the ground under two live
  sibling probes. Gating against the existing aligned vintage is exact here precisely
  because HEAD has not moved.
- **svelte-check**: toast.html page 0 diagnostics; the family 0 Error seats (8 fleet
  Warns at viewport :207, counted separately).

## Findings

**NONE** — no MAJOR, no MINOR, no LOW, no NIT. The page and family survive the second
review clean; every scribe claim re-derived TRUE; the fresh axis passed on the first
clean run.

One piece of **port hygiene for the orchestrator (not a page finding)**: an unexpected
`vite dev --port 5245 --strictPort` (node PID 80536, started 15:29 today) is listening
— not in this task's sibling roster (quill 5241, vellum 5242, scribe 5243, Owner 5230).
I did not touch it; whoever owns it should collect it.

## Tier proposal

**Tier 2 CONFIRMED** — archetype-complete with the fleet's heaviest behavioral battery;
both reviews converge at zero defects. No re-tier.

## Probe-fault ownership

1. **BootSplash interception killed my first A/B run**: the FOUC mask
   (+layout.svelte BootSplash, fonts.ready + 4s cap) breathes its jx-logo-breath
   rainbow in the top layer and intercepted Playwright pointer events on cold loads —
   two 30s click-timeouts burned. Fix: wait `document.fonts.ready` + 9s settle; rerun
   clean. Harness timing against the scaffold's boot chrome, not a toast defect.
2. **A transient `rg -rn` slip** (the -r/--replace trap) on one grep this session —
   self-caught; the corrective `rg -n -g` form produced the real hits.
3. Stage C's promote timestamp (5281) is the ghosts-CLEARED moment (4→1); the true
   promotion-into-DOM moment is the 4→5 transition at 5041 (ghosts still mounted). Both
   reported; the law's arithmetic holds from either anchor.

## Process evidence

- Port **5244** mine: lsof empty before (rc=1, pre-checked at session start); dev
  server started from apps/www (wrapper PID 20155 + listener 20220); killed BOTH by
  PID; final `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1**. No orphans.
  Sibling ports 5230/5241/5242/5243 (and the stray 5245) untouched.
- **NO commits, NO pushes; zero product-tree edits.** The probe mutated only in-page
  state (pushes, hovers, a viewport resize in-context, all in disposable browser
  contexts).
- Independence: vellum's report 44 NOT read; scribe's 71 read first and treated as
  claims — every headline receipt re-derived on my own instruments.
- Artifacts: /tmp/marginalia-119-probe.mjs (C/D/E), /tmp/marginalia-119-probeAB.mjs
  (A/B rerun), /tmp/marginalia-119-probe-result.json, /tmp/marginalia-119-{docs,univ,
  sc}.log, /tmp/marginalia-119-wrapper.txt.

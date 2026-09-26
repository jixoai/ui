# TASK 126 — LULL: the W-next #19 fleet sweep (marginalia, 2026-09-24)

- **The law under sweep**: jixoai.css :1182-1208 — `[data-reveal]` runs
  `animation: jx-reveal-rise both` on `animation-timeline: view()`. Scroll-driven +
  fill `both` = the animation is applied at EVERY scroll position forever, so
  `transform` stays in the animated property set and computes as a matrix (≠ `none`)
  even at rest — a PERMANENT containing block for position:fixed descendants. Only
  `animation: none` (the reduced-motion path) frees it. Measured live this task:
  the hosting section computed `matrix(1, 0, 0, 1, 0, 10.1642)` (non-identity — the
  view() progress at that scroll offset) with the reveal injected, vs `none` without.
- **Method**: source sweep (component classification → real-import usage grep →
  per-host wrapper check) + a live fleet probe over dev :5244 (fixed-element census
  with per-element `[data-reveal]`-ancestor reads, the constant-across-scroll rect
  test, and the injected-reveal hijack demonstration).
- **Vintages**: probe vintage = dev source = **HEAD 1416d764** (current tree; HEAD
  moved past the dispatch's bc118af1 mid-flight — vellum's dialog 2nd). verify:docs
  run against the existing dist (Sep 24 01:32 build) — **rc=0, staged scope green**.
- **VERDICT: the fleet is CLEAN — zero hits.** The float-button page's fix is
  complete on every live fab; every other fixed-idiom family is structurally immune
  (top-layer platform elements or float-plane adoption). One NIT-grade near-miss
  documented (NIT-1) + one nuance for the next prober (NIT-2). No fixes owed.

## The host census (page · fixed consumer · verdict)

| page | fixed consumer | mechanism | lives under a [data-reveal] host? | verdict |
|---|---|---|---|---|
| float-button.html | plain fab ("back to top", no-reveal canvas wrapper) | INLINE fixed | **NO** (census: revealAncestor false) | CLEAN (the fix, holding) |
| float-button.html | menu-idiom fab + its jx-fab-menu | INLINE fixed | **NO** (#menu-idiom carries no reveal) | CLEAN (the fix, holding) |
| float-button.html | universal-props "Compose · level3 default" fab | INLINE fixed | **NO** (#universal-props no reveal, :347-348 comment) | CLEAN (the fix, holding) |
| float-button.html | 16 canvas axis menus (jx-menu) + 3 chrome popovers | popover=auto (top layer) | n/a (closed → unrendered) | IMMUNE (platform) |
| tour.html | .jx-tour step card + the hole | popover=manual (top layer) + anchor-positioned | markup inside canvas sections; OPEN state is top-layer | IMMUNE (platform; live-verified) |
| system-dialog.html | [data-jx-sysdlg] anchored panel | popover=manual (top layer) | **YES — revealAncestor TRUE** (section "axes") | IMMUNE (platform; live-verified moved=0 while open) |
| tags-input.html, form.html | .jx-tags-panel suggestion list | popover=auto (top layer) | markup inside revealed sections (section s2-panel on tags-input) | IMMUNE (platform class; drive didn't open — see probe faults) |
| toast.html | ToastViewport standalone fixed corners (pos* atoms, toast.stylex :42-50) | ADOPTS the float plane on docs pages | n/a — stack parent chain: jx-float-slot → jx-top-layer → jx-shell, computed position **static** | IMMUNE (adoption; T119 receipt re-confirmed live) |

Everything else in the broad `position:fixed` grep (popover/tooltip/select/dropdown/
menubar/combobox/date-picker/color-picker/hover-card/input's jx-picker-panel/
popconfirm/tags-input) is the same popover-platform class — the fixed element is the
PLATFORM panel, top-layer while open, display:none while closed. No inline fixed
renderer exists in the fleet besides float-button.

## The exemplar probe receipt (float-button.html)

Fixed-element census: 28 fixed elements on the page; **every one reads
`revealAncestor: false`** — the three no-reveal seats (the plain-idiom canvas
wrapper, :214 `#menu-idiom`, :347-348 `#universal-props`) hold, and the copy-only
revealed sections host no fabs. The scroll test (rect-across-scroll on the
menu-idiom "quick actions" fab): **moved 0** — free, viewport-anchored.

**The law demonstrated live on the same seat** (in-probe injection, reverted after):

| state | #menu-idiom computed transform | fab rect across scroll |
|---|---|---|
| baseline (the landed page) | `none` | **moved 0** (free) |
| `data-reveal` injected | `matrix(1, 0, 0, 1, 0, 10.1642)` | **moved −282.6** (HIJACKED — rides the content) |
| opacity-only animation override | `none` | **moved 0** (free) |
| `animation: none` override | `none` | moved 0 (free — the RM path) |
| reverted to baseline | `none` | moved 0 (clean) |

The injection receipt is the strongest form of the law: the page's own fix shape
(removing data-reveal from the hosting section only) is exactly what separates the
two rows, and the hijack reproduces on demand.

**The top-layer contrast pair (system-dialog.html)**: the anchored panel's markup
sits INSIDE a revealed section (revealAncestor **true**, section "axes") — the
near-miss geometry — yet while open it measured **moved 0** across the same scroll:
popover=manual promotes it to the top layer, whose containing block is the viewport;
no transformed ancestor can hijack it. Same mechanism class: tour (verified open:
`popover="manual"`, `:popover-open` true), tags-input panel (`popover="auto"`).

## The Owner's open question — ANSWERED

**An opacity-only reveal avoids the containing block.** Measured both ways on one
seat (#menu-idiom + its live fab): swapping the animation to an opacity-only
keyframe (`@keyframes jx-op-only { from { opacity: 0 } }`) while keeping
`animation-timeline: view()` + fill `both` → the section's computed transform
returns to **`none`** (opacity is not a containing-block trigger) and the fixed fab
stays viewport-anchored (moved 0). The systemic option is therefore real: an
opacity-only reveal variant would free EVERY section fleet-wide without losing the
entrance. The trade the Owner gets for free from the same measurement: opacity-only
loses the translateY rise (the visual motion), and `animation: none` (the current RM
path) is still the zero-cost escape hatch. The in-campaign per-section fix shape
stays valid where the motion matters (the float-button page chose it three times).

## Per-hit fix list

**NONE — zero hits.** No section hosting a live fixed-idiom element carries
data-reveal anywhere in the docs fleet. The float-button page's three no-reveal
seats are the complete fix and they hold. Nothing for the orchestrator to land from
the sweep itself.

## Findings

1. **[NIT-1 — the near-miss worth one ledger line]** system-dialog.html's anchored
   panel (and the tags panels on tags-input/form) sit in revealed sections and are
   saved ONLY by their popover platform class. If a future refactor ever drops the
   popover attribute (or renders a non-popover fixed helper inline), those sections
   silently become W-next #19 hits. The float-button page already documents its law
   in comments (:99, :177-179, :346) — the sysdlg/tags pages carry no such marker.
   One comment line at each platform-fixed demo ("this panel is fixed — safe only
   while popover-top-layer; no reveal constraint today") would arm the next editor.
   Report-only; not a defect.
2. **[NIT-2 — a prober's trap, ledger not page]** The constant-across-scroll rect
   test is ONLY decisive for plain fixed elements (the fabs). For
   anchor-positioned platform panels (the tour card: `top: anchor(bottom)`) the
   rect MOVES with scroll by design — the anchor tracks its target. My tour
   measurement read moved −270 and is NOT a hijack: `:popover-open` membership is
   the immunity receipt for that class, the motion is the anchor working. The tour
   card also reads revealAncestor false (its canvas wrapper), so no ambiguity
   remains for its own verdict.

## Probe-fault ownership

1. **The scroll-apply read is unreliable** — my `nudgeScroll` read
   `.jx-shell-body.scrollTop` delta and reported `applied: 0` on stages where the
   fab demonstrably moved −282.6 (the scroll clearly applied through the real
   scroll root). The MOVED deltas are the receipt; the applied telemetry is junk
   and was not used for any verdict. (T108's "the shell scrolls .jx-shell-body"
   may be page-dependent or my selector raced the shell's mounting.)
2. **Stage D (sysdlg) first drive measured a CLOSED panel** (`:popover-open` false —
   the click raced the bind:open render); probe2 re-drove it with a popover-open
   locator and got the true receipt. The first read (moved 0 on a display:none
   panel) is void.
3. **The tags-input panel never opened** in my drive (typing "a" produced no open
   suggestion popover — filter-dependent). Its verdict rides the platform class
   (popover="auto") + the sysdlg exemplar of the identical mechanism, not a live
   open measurement. Recorded honestly in the census.
4. One dev-server start died to the cwd reset ("vite: command not found", wrapper
   69975) — killed, restarted from apps/www. No orphan left.

## Gate + process evidence

- **verify:docs rc=0** — "all docs pages pass the skeleton lint (staged scope
  green)" against the existing dist (01:32 build; no rebuild — quill 5241 active,
  scribe 5243 now also listening; dist vintage predates HEAD 1416d764, noted, and
  irrelevant to the sweep whose probes ran against dev source = HEAD).
- Port **5244** mine: started (wrapper 70239, listener 70281), **killed BOTH by
  PID**; final lsof → **empty, rc=1**. No orphans. Sibling ports untouched
  (quill 5241, scribe 5243, Owner 5230; 5245 stayed empty; the unrelated python3
  on 5246 again noted, not touched).
- **NO commits, NO pushes; zero product-tree edits.** All law demonstrations were
  in-page injections (setAttribute + a <style> tag), fully reverted in-probe
  (restored row measured before context close).
- Artifacts: /tmp/marginalia-126-probe.mjs (census + experiment + fleet),
  /tmp/marginalia-126-probe2.mjs (fixed sysdlg/tags drives),
  /tmp/marginalia-126-{docs,dev}.log, /tmp/marginalia-126-wrapper.txt.

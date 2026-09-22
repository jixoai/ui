# Task 26 — REVIEW file-input (2nd of 2) · quill · 2026-09-23

**Verdict: PASS on the page (consolidation proceeds) — with ONE MAJOR
family-grade finding routed to the Owner: the drop-accept gate leaks as
served under my synthetic-drop protocol (7 reproductions across fresh page
loads and three drop compositions), contradicting the page's
"gate-rejected — they never enter the value" sentence AND reviewer #1's
mixed-drop receipt. The divergence between her run and mine is unresolved
after four isolation probes and needs the Owner's trusted-event
adjudication before the gate sentence is treated as fleet law.**

**Reviewed**: `apps/www/src/routes/docs/components/file-input.html/`
(+page.svelte 755 lines, +page.ts) at the post-115f365b state. Independence
law kept — my findings (including the leak) were fixed before opening
marginalia's report 31. Medium per LAW #16: hydrated live page in headless
Chromium, computed styles + injected `.dark` islands + synthetic
`DataTransfer` drops (untrusted events — the caveat that matters here).

## The claims, re-derived

### 1. Density ladder digit-exact — VERIFIED-TRUE (the served computed ladder)

- **Zones: 63 / 72 / 90 / 108px** computed `min-height` at xs / sm /
  default / lg — the ×2.25 lane over `--jx-file-h` measured digit-exact on
  the four labelled instances.
- **`--jx-file-h` carries the row digits verbatim**: the token's `max()`
  branches read 0.25rem×7 / ×8 / ×10 / ×12 = **28 / 32 / 40 / 48px** (the
  row min-heights; no rows are served unbound, so the row ELEMENTS ride
  the same knob — source + token digits, not an element measure in my run).
- **Thumb ladder resolved**: `--jx-icon` = 16 / 18 / 20 / 24px (the calc
  compositions resolve digit-exact: e.g. xs = (13px − 2px) × 16/11 = 16);
  BOX = knob + 2px hairline (source `calc(var(--jx-file-thumb) + 2px)`) →
  18 / 20 / 22 / 26. Inner img = the knob (16 / 20 / 24 at sm/default/lg —
  no image previews are served unbound; marginalia's box-vs-img
  distinction accepted from her measurement + the source split).
- **Names 11 / 12 / 13 / 15px** (--jx-file-text = --jx-text ladder, bases
  resolved from the icon calcs) and **labels 10 / 11 / 12 / 14px** (the
  scaffold's --jx-text-secondary) — both measured per rung instance
  (default label 12px measured directly this run).
- **Zone-title 11px FIXED** at xs / sm / default / lg — the typed
  --text-label step, the one density-deaf voice, exactly as the TokenTable
  teaches it.

### 2. Theme split — VERIFIED-TRUE, digit-exact

My `.dark` island around the served drop zone, before/inside:

```
border:  oklch(0 0 0)        → oklch(0 0 0)            (TYPED-FROZEN)
ground:  oklch(1 0 0)        → oklch(1 0 0)            (TYPED-FROZEN)
raw --border: oklch(0 0 0)   → oklch(1 0 0)            (RAW-FLIPS)
well:    rgba(0,0,0,0.12)    → rgba(255,255,255,0.12)  1px 1px 0 0 inset (RAW-FLIPS)
```

The two-sided split is exactly as the page teaches: the typed
border/ground pair freezes at the :root substitution while the raw sheet
machines (--border, --shadow-well :161→:339) flip to the white-inset dark
sweep. Emission forms grepped (typed tokens vs the raw --shadow-well
machines).

### 3. Drag/accept/ARIA end-to-end — PARTIAL: the gate LEAKS (MAJOR, family-grade)

**Verified-TRUE**: the png drop binds as `li.jx-file-row` ("pic.png" with
its size voice); the native input carries `tabindex="-1"` +
`aria-hidden="true"`; the REAL filechooser fires on the trigger click;
the describedby wiring exists (`{id}-error`, set when invalid).

**FALSIFIED as served (7 reproductions: fresh loads × three compositions —
txt-only, png-then-txt, png+txt mixed)**: a `text/plain` file dropped on
the gated zone (accept="image/*") **enters the value as a row with NO
rejection UI** — `.jx-error` never renders, and in the mixed composition
**duplicates append** (notes.txt twice). The compiled family code carries
the gate (`commit` filters through `matchesAccept`; the served transform
verified by fetching the dev module), and isolation probes prove the entry
flows through the drop-event chain (a capture-phase stopPropagation on the
trigger blocks the entry entirely) — so the leak sits BETWEEN the event
and the gate: either the served `matchesAccept` accepts against a falsy
`accept` at runtime (the rendered input attribute says otherwise) or there
is a second, ungated write path I could not isolate. Mechanism UNRESOLVED.

**Why this diverges from reviewer #1**: marginalia's mixed-drop receipt
(png binds + txt rejected + the error line renders) is exactly what the
compiled source predicts — my txt-only and mixed runs on the same tree do
not reproduce her rejection half. Candidate causes: hydration-timing
windows on this 755-line page, untrusted-event fidelity in Chromium, or a
real race in the family's drop wiring. **The Owner should adjudicate with
a trusted-event probe (CDP Input.dispatchDragEvent) or a manual drop; the
page's gate sentences ("gate-rejected — they never enter the value") stay
flagged until then.** Repro recipe in the process section.

### 4. marginalia's 2 LOWs — my independent judgment

**(a) The "!1 dropped file rejected" fusion — DOWNGRADED TO NO-ACTION
(measured).** The error mark span is `aria-hidden="true"`
(source :589, measured on the served line), and the accessible-description
computation excludes aria-hidden descendants: my tree-walk approximation
of the announced text reads **"1 dropped file rejected — accept:
image/*"** — clean, no fused "!" (the fusion exists only in DOM
textContent, which is the VISUAL text, where the "!" is the intended
mark). The announced text is honest without a fix. If the scaffold ever
wants the mark announced, that is a design choice, not an accessibility
bug.

**(b) The public `id` prop missing from the hand table — AGREE, one curated
row owed.** Source-verified real and load-bearing: `id?: string` ("wired
into label[for] / error[id]; auto-generated when omitted", :104-105),
`label[for]={id}` (:520), `errorId = ${id}-error` driving the describedby
wiring (:215/:225). A consumer wiring a custom label NEEDS this knob, and
label/error (its siblings in the wiring trio) both serve as rows. Rides
the closure consolidation as she proposed.

### 5. Standard chrome — VERIFIED-TRUE

toc 12/12, order == DOM (probe-enumerated; see-also out as designed) ·
h1 ×1 · universal marker ×1 · **meta 23 keys** (22 named + the quoted
`'data-density'` safety-net twin + `rest`) · served rows enumerated by
name: **11 hand contract rows** (files, variant, accept, multiple,
maxFiles, hint, label, error, disabled, onreject, zone) + **8 universal** +
**3-row FileItem** (file, id, previewUrl) · supply-only greps: zero
--jx-size/shape/radius/color/elevation/motion-effective readers in the
family. The api summary's arithmetic sentence is honest as served
("22 meta rows − 8 ambient axes = 14 family rows; the table below serves
the 11 contract rows" — the id/class/rest/'data-density' seats ride the
wiring notes and conventions, exactly as reviewer #1 described).

**Id anchors**: not flagged (deferred to closure by ledger, per the brief).

## Cross-check against marginalia's report 31 (read AFTER findings formed)

Her claims 1/2/5 reproduce digit-exact under my independent probes; her
LOW (b) stands; her LOW (a) I downgrade on measurement (the mark is
aria-hidden — the announcement is clean). Her claim-3 rejection receipt is
the one divergence: on the same tree, my txt-only and mixed drops leak
where her mixed drop gated. Both receipts are reported verbatim in the two
review files; the Owner adjudicates.

## Gates (my run)

| Gate | Result |
|---|---|
| file-input family solos (defaults-form-families, density-adoption-form-text, hover-stability, --testTimeout=30000) | **34/34**, exit 0 |
| docs-ambient-vocabulary solo | **284/284** (vellum's kbd noise cleared — zero sibling keys) |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | file-input page: **0 diagnostics** |
| Port 5241 | lsof EMPTY before; dev server + wrapper killed by PID; EMPTY after |

## Process evidence (the repro recipe for the Owner)

```
page.goto file-input.html → #fi-drop → the gated input (accept="image/*")
  → root = input.closest('[data-density]') → trigger = root.querySelector('button')
const dt = new DataTransfer();
dt.items.add(new File(['hello'], 'notes.txt', { type: 'text/plain' }));
trigger.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
→ observed: li.jx-file-row "notes.txt" rendered, .jx-error ABSENT (7/7)
```

Isolation probes: capture-phase stopPropagation on the trigger blocks the
entry (the entry flows through the drop chain); the capture log shows one
untrusted event on the zone button with the file in dataTransfer; the
dev-served compiled module carries the gated commit. All probes deleted
after the run.

No commits made. Report file: `agents/quill/reports/26-review-file-input.md`.

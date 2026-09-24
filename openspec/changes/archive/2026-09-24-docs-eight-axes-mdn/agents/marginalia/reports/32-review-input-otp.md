# TASK 32 — REVIEW input-otp (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (1st reviewer; reviewer #2 after me — independence law: vellum's report 29 read only AFTER my findings were fixed; disclosed exposure noted below)
- **Target**: vellum's page integrated at `7bf5a57c` — `input-otp.html/+page.svelte` (476 lines) + `+page.ts` + the hand `universal` table (no meta)
- **Method**: source reads (family svelte/stylex/css + the paste/focus handlers), live computed probes (rung stages, a `.dark` island wrap with real focus, setter+input-event behavior chains, keyboard fallback entry), SSR raw-byte parse + served-row enumeration, the otp spec set + ambient + docs-universal + fleet svelte-check
- **VERDICT: PASS** — all five dispatched claims verified TRUE (several digit-exact against the page's own TokenTable); findings: 1 LOW (recurring .jx-error scaffold class) + 2 INFO + the three adjudications delivered. Nothing blocks reviewer #2.

## The five claims — verified TRUE

1. **Slot geometry as the density contract — VERIFIED, digit-exact with the calc boxes read.** Slot min box = `max(var(--jx-hit), calc(var(--jx-line) * 2))` measured **32 / 36 / 40 / 48px** across xs/sm/default/lg (minWidth == minHeight at every rung). The calc boxes resolve: xs `max(28, 16×2) = 32`, sm `max(32, 18×2) = 36`, default `max(40, 20×2) = 40`, lg `max(48, 24×2) = 48` — the channel receipts (hit floor: 0.25rem×7 → ×8 → ×10 → ×12; line: 11×16/11 → 12×1.5 → 13×20/13 → 15×1.6). **The boxes say what the ladder says.** Winner nuance: line×2 STRICTLY wins at xs/sm; **default/lg are exact TIES** (40=40, 48=48) — the served row only claims the xs/sm wins, which is the careful phrasing; any "hit wins at the top" narration would overstate (the dispatch's framing did; the page's did not). Cell voice --jx-text **11/12/13/15px** ✓; rhythm --jx-gap **8/8/12/16px** ✓ (default rung measured 12px).
2. **The copied-template purge — VERIFIED.** The only "CONSUMES size and color" occurrence in the served bytes is the axes summary's **refutation quotation** ("the pre-29 'CONSUMES size and color' text is falsified here"). Size = the §11 echo served with the verbatim stamp receipt; color = SUPPLY-ONLY with zero readers (grep). Canary sweep: no other template claims survive (the density row's "CONSUMED" is the live-true consumption).
3. **Theme dual-voice split — VERIFIED on one element.** Under the injected `.dark` island (then removed): slot border **oklch(0 0 0)** + ground **oklch(1 0 0)** — the typed pole frozen (light paper in a dark island) — while the RAW machines flip: `--ring` computes **oklch(0.7044 0.1872 calc(100 - 4))** (the dark ring with the −4° drift calc live) and the FOCUSED slot's outline paints **oklch(0.7044 0.1872 96)** — the flip measured on the same border/ground element that stayed frozen. The complete-state focus ink rides var(--primary) (light-side complete focus measured oklch(0.6489 0.237 …); the dark-side flip follows the same raw form the ring demonstrated). The value text never re-themes. Emission forms per voice: typed frame/ground vs raw ring/complete-ink — exactly as the row states.
4. **Per-slot a11y + behavior chain — VERIFIED live.** `role="group"` + `aria-labelledby` from the label prop; `autocomplete="one-time-code"` on the **FIRST slot only** (slot 2: null); `inputmode="numeric"`; **auto-advance** (type "7" → focus moves to slot 1); **multi-char distribution** — type "7", then multi-char "3456" into slot 1 → slots read **7-3-4-5-6** with focus at the last filled (the dispatch's exact sequence); the joined value surfaces (the form bridge: full code submits, partial submits empty). **Empty-slot first-step fallback**: re-entry from OUTSIDE (real relatedTarget) redirects to the first empty slot — measured landed = 2 after filling 2. **Error wiring**: `aria-invalid="true"` + `aria-describedby="s10-error"` → the described element reads "!code expired — resend". No separate paste handler exists — distribution IS the input handler's overflow path (native paste lands multi-char, the handler distributes; my synthetic `ClipboardEvent` was correctly ignored — the overflow path is the testable contract).
5. **EXTRA served-first — VERIFIED.** Served rows enumerated by name from raw SSR: the root hand table serves **name, length, value, numeric, label, error, disabled, density** (density rides the EXTRA channel — vellum's `docs={{ extra: [apiDensityRow] }}` — so the consumed axis is NOT silently folded); the shared universal section carries the 8 axes; the axes table carries the 8 measured per-axis rows — three seats, three distinct prose purposes, no silent fold. 7 tables / 136 cells / **0 empty**; marker ×1; **toc 8/8 present, order == DOM** (my first order-read said FALSE — my own guessed id order was wrong; the real toc is monotonic); h1 = 1.

## The three open questions — adjudicated

**(a) The size row's inline self-correction provenance — CONSOLIDATE, don't carry twice.** The falsification narration currently appears in BOTH the size row (:102) and the axes summary (:408). The correction itself must stay; the provenance belongs in ONE seat — recommend keeping the axes summary's historical note (it is the section-level story) and slimming the row to the mechanism ("the slot voice is --jx-text and the slot box is the hit/line lane — nothing follows"). Precedent: carousel carries its falsified-rows provenance in the deviations paragraph, not per-row.

**(b) Overview naming the single-hidden-input alternative — YES, add it.** The Overview already teaches the ElementInternals one-value bridge; one sentence naming the alternative model (ONE hidden input + a mirrored digit display — the vanilla-dev pattern) and why this fleet chose slots (per-slot `autocomplete="one-time-code"` SMS autofill needs real inputs; backstep/arrow/distribution semantics come free from native inputs instead of value juggling) completes the a11y-model education the page is already committed to. Rides consolidation.

**(c) api rung-id vs axes alias ladder — BOTH-AS-TRUE, plus a cross-reference.** They answer different questions: the api row documents what a consumer may PASS (rung ids); the axes row documents what the family DOES with it (the max() box over the hit/line channels). Unifying would lose one of the two truths. Fix: one cross-reference phrase in the api row ("the consumed ladder lives in the axes table"). Rides consolidation.

## Findings (severity-tagged)

1. **[LOW · recurring .jx-error scaffold class]** The error text concatenates the "!" mark into the message: **"!code expired — resend"** (and file-input's "!1 dropped file rejected") — the .jx-error scaffold's "!" runs into the message in the accessible text. This is now confirmed on TWO families — it is a SCAFFOLD fix (jx-pure's .jx-error), not per-page. Rides to the scaffold owner with both receipts.
2. **[INFO · tie nuance]** default/lg slot boxes are exact ties (40=40, 48=48) — the "winner reversal" is really "line wins low, ties high". The served row's phrasing already avoids overclaiming; recorded so reviewer #2 reads the boxes, not the narrative.
3. **[INFO · double narration]** The falsification provenance appears twice (row + summary) — consolidate per adjudication (a).
4. **[NONE]** otherwise — no MAJOR, no MINOR on the dispatched claims.

## Gates

| Gate | Result |
|---|---|
| OTP spec set solos (batch4-components, defaults-form-families, density-adoption-form-text, docs-ambient-vocabulary, docs-structure) | **340/340, exit 0** (ambient 284/284 included) |
| verify:docs-universal | exit 0 — GREEN 110/110 |
| svelte-check (fleet) | input-otp page **0 diagnostics** (fleet 1595 errors — the shared tree's set) |
| Raw SSR | 1,146,730-byte snapshot; toc 8/8 order==DOM; h1 1; marker 1; 0 empty / 136; install/see-also ids present |
| Live probes | slot ladder 32/36/40/48 + calc boxes; voices 11/12/13/15; gap 12px (default); theme two-voice on one element (frozen 0 0 0/1 0 0 + flipped ring 0.7044); behavior chain (auto-advance, 73456 distribution, complete ink, fallback re-entry, error wiring) |

## Process evidence

- Port **5244**: lsof **EMPTY before** (rc=1); my wrapper → vite; killed by PID at session end → **EMPTY after** (rc=1); background exit 143 = my SIGTERM.
- **NO commits, NO pushes, zero product-tree edits** (review-only). Siblings in flight (scribe's combobox review, vellum's kbd files, quill's ghostty-term review) untouched; no keyed noise encountered.
- Independence: my probes and findings were complete before reading vellum's report 29; the cross-read reconciles digit-exact on every number. Disclosure: one delta — her report does not record that default/lg are exact TIES (the "winner" language is hers only at xs/sm, which is correct); the tie nuance is this review's addition.
- Artifacts: probes `/tmp/marginalia-32-probe{1..6}.mjs`; SSR `/tmp/marginalia-32-ssr.html`; gate logs `/tmp/marginalia-32-{otpspecs,universal,scheck,dev}.log`.
- Probe craft banked: the OTP distribution contract is the INPUT handler's overflow path (there is no paste listener — synthetic ClipboardEvents correctly no-op); the empty-slot fallback fires on focusin with an OUTSIDE relatedTarget (blur-then-focus leaves relatedTarget null and skips the redirect); Playwright actionability may time out on canvas-stage slots — programmatic focus + setter/input events are the reliable behavior-chain path.

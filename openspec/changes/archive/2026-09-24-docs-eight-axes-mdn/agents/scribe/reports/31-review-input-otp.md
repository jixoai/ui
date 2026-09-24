# 31 — REVIEW input-otp (2nd of 2; scribe)

Date: 2026-09-23 · scribe · port 5243 · NO commits
Target: vellum's page at `7bf5a57c` — `input-otp.html/+page.svelte` (476 lines) + `+page.ts` + the family (input-otp.svelte 303 lines, stylex, css). Reviewer #1 = marginalia (PASS) — independence law held: findings formed from source + probes BEFORE reading her report 32. Medium (LAW #16): Chromium headless 1440×1000; REAL keyboard/clipboard events for behavior; IN-PLACE island for the dark scope.

## Per-claim verdicts (all verified TRUE)

### 1. Slot geometry with the TIE nuance — VERIFIED, digit-exact

`minWidth === minHeight` at every rung: **32 / 36 / 40 / 48px** (xs/sm/default/lg). The calc boxes: xs `max(28, 16×2)` → 32; sm `max(32, 18×2)` → 36 — **line×2 strictly wins**; default `max(40, 20×2)` → 40 and lg `max(48, 24×2)` → 48 — **exact ties**. The served row's phrasing claims only the xs/sm wins — it does NOT overstate (verified against the row text, :95). Cell voices `--jx-text` **11/12/13/15px** (calc forms read: 0.8125rem −2px / −1px / ×1 / +2px); rhythm `--jx-gap` **8/8/12/16px**.

### 2. Template purge + the §11 echo — VERIFIED

- The served bytes carry "CONSUMES size and color" **exactly once** — inside the size row's refutation quotation (:102). Zero surviving template claims (canary sweep clean).
- Size = the §11 echo: universal-panel roots **18px (large) / 14px (size 14) / 18px (query md)** with the inline mirror verbatim, while the slots hold the density-governed voice **13 / 12 / 15px** — nothing follows (the panel voices differ from the stamps by rung, not by stamp). Query flip: 14px @600 → 18px @1440.
- Color supply-only: zero readers (grep). The voices are typed tokens (slot ink/paper, caret, complete border --jx-primary, invalid --jx-destructive).

### 3. Theme dual-voice — VERIFIED (in-place island, three-mechanisms test applied)

Inside the in-place `.dark` island: slot border **oklch(0 0 0)** and ground **oklch(1 0 0)** hold (the TYPED aliases — mechanism: alias-freeze at the :root declaration, the genuine article here, unlike ghostty's canvas), while `--ring` computes **`oklch(0.7044 0.1872 calc(110 - 4))`** (the dark ring with the −4° drift arithmetic inside the calc — hue base is the wall clock, the −4 is the invariant) and the **FOCUSED slot's outline paints the flipped voice** (`oklch(0.7044 0.1872 …)`, 1px). The COMPLETE-state brand border also held the frozen light pole under the island (measured `oklch(0.6489 0.237 …)` inside `.dark`). The value never re-themes (user data, no theme coupling). Three mechanisms, three probes: alias-freeze (border/ground), raw re-declaration (ring/outline), no channel (value).

### 4. Behavior chain — VERIFIED with real events

- `role="group"` + accessible name via **`aria-label`** (`label ?? 'one-time code'`) — see finding 2 (the dispatch said aria-labelledby; the served mechanism is aria-label).
- `autocomplete="one-time-code"` on the **FIRST slot only** (slots 2-6: null); `inputmode="numeric"` ✓.
- **Auto-advance + distribution**: real-typing "73456" into slot 0 distributes **7/3/4/5/6** across slots 0-4; **REAL paste** (clipboard "951" + ControlOrMeta+V) distributes **9/5/1** into slots 0-2 with focus on slot 3. The advance lands on the CONTINUATION slot (`min(index + n, slots − 1)`) — see finding 3.
- **Re-entry**: after filling 3 slots, Tab into the group from before it lands on **slot 3 = the first EMPTY slot** (the `handleFocusIn` redirect).
- **Error wiring**: `aria-invalid="true"` + `aria-describedby="…-error"` on every slot; the described line reads **"!code expired — resend"** in textContent but the "!" span is **aria-hidden** → the **announced text is "code expired — resend"** (the a11y-announcement law applied — see finding 4).

### 5. EXTRA + chrome — VERIFIED

Served api enumerated by name: **8 authored-family rows** (name, length, value bind, numeric, label, error, disabled, **density via the EXTRA reference identity** — `docs={{ extra: [apiDensityRow] }}` keeps the consumed axis from the silent fold) + the **8-row universal section** = 16 rows. Marker ×1; h1 ×1; toc 8/8 ids (overview, otp-demo, types, usage, theming, api, universal-props, accessibility) == DOM order; `id="install"` + `id="see-also"` shipped.

## Findings (severity-tagged)

1. **[MAJOR · measured-must-reproduce, routed to orchestrator]** The error state's **dashed destructive border does not reproduce**: the error slots compute **`borderStyle: solid`** (border color the base black — indistinguishable from resting in light), while the types caption teaches "dashed destructive border on every slot" (:338) and the family atom `invalidBorder = { borderColor: --jx-destructive, borderStyle: 'dashed' }` (stylex.ts:66-70) intends it. Forensics (twice: cold AND settled-warm runs): the state-border classes (filledBorder/invalidBorder hashes) carry **NO CSS rules in the served document** — zero rules containing "dashed" anywhere — while the completeBorder atom's rule DOES inject (the complete brand border painted live in my typed-flow probe). Root cause smells **plugin/emission-side** (the labs vite-plugin's stylex dev transform selectively skipping these atoms), not page-side: the a11y state flows (`data-jx-otp-invalid`, aria-invalid ✓). Routed with the file-input family-grade precedent. Note: dev-served medium; a production build may emit differently — untested here.
2. **[NOTE · brief precision]** The dispatch's "role=group + aria-labelledby" — the served group name rides **`aria-label`** (label ?? 'one-time code'; aria-labelledby absent), plus the visible `<label for="{id}-0">` on the first slot. The page's own a11y table words it correctly ("aria-label fallback: 'one-time code'"). Page right; brief imprecise.
3. **[NOTE · advance wording]** The dispatch's and marginalia's "focus at last filled" — the advance lands on the **CONTINUATION slot** (`min(index + n, slots − 1)`): after "73456" focus sits on slot 5, one past the last filled (slot 4), ready for the 6th digit. Correct UX; the wording rounds it wrong. Mechanism receipt: source :194-196.
4. **[DOWNGRADE · marginalia's LOW refuted by the announcement law]** Her LOW ("the '!' runs into the message in the accessible text") read textContent. The "!" span carries **aria-hidden="true"** (:301) — the measured announced text is **"code expired — resend"** without the mark. The scaffold fix she routes is unnecessary on the announced-text evidence; if the visual "!"-concatenation bothers anyone, that is a markup-spacing nit, not an a11y defect.
5. **[NONE]** on the dispatched claims 1-6 otherwise — all verified TRUE.

## marginalia's adjudications — CONCUR ×3 (ridings confirmed)

- **(a) Consolidate the falsification provenance to one seat** — CONCUR: keep the axes summary's historical note, slim the size row to the mechanism. Carousel precedent applies.
- **(b) Overview names the single-hidden-input alternative — YES**: one sentence (ONE hidden input + mirrored digit display vs real slots) completes the a11y-model education; the whys are real (per-slot `autocomplete="one-time-code"` SMS autofill needs real inputs; backstep/arrow/distribution come free from native inputs).
- **(c) api rung-id vs axes alias ladder both-as-true + cross-reference** — CONCUR: pass-vs-do are different questions; one cross-reference phrase in the api row preserves both.

## Gates

| Gate | Result |
|---|---|
| OTP-pinning solos (batch4-components 12, density-adoption-form-text 4, defaults-form-families 28, docs-structure 12) | **56/56 green** |
| docs-ambient-vocabulary | **284/284 green** (one earlier 2-fail read was transient — solo re-run clean) |
| verify:docs-universal | **GREEN 110/110, exit 0** |
| svelte-check (page-scoped) | **input-otp.html: 0 diagnostics** (route dir clean) |
| (incidental whole-suite run, empty glob) | 3201/3213 — the 12 reds all contention-class, green on solo re-runs (form-family, search-corpus verified solo) |

## Environment discipline

- Port 5243: `lsof` EMPTY before (rc=1); background-wrapper dev server killed by PID after each cycle → **EMPTY after** (`port after: []`).
- **NO commits, NO pushes.** Zero product-tree edits (review-only). Siblings in flight untouched: marginalia's popconfirm review, vellum's menubar CODE, quill's file-input review.
- Artifacts: `/tmp/scribe-31-probe{1..10}.mjs`, `/tmp/scribe-31-ssr.html`, `/tmp/scribe-31-check.txt`, `/tmp/scribe-31-dev*.log`.

## Verdict

**PASS** — input-otp (2nd of 2), on the dispatched claims: geometry with the tie nuance verified digit-exact, the purge clean, the theme dual-voice measured with all three mechanisms named, the behavior chain green end-to-end on real events, the EXTRA/chrome spine intact, and all three adjudications concurred. The one MAJOR (dashed-border non-reproduction) is routed to the orchestrator with the plugin/emission suspicion — it is family/plugin-grade, not page-grade, per the file-input precedent.

# 32 — REVIEW kbd (2nd of 2; scribe — re-verify after the orchestrator fix)

Date: 2026-09-23 · scribe · port 5243 · NO commits
Target: vellum's kbd page, fix landed at `36b2b0e4` (quill's 1st = NEEDS-WORK: the falsified inheritance caption survived in two surfaces). Independence law held: my findings (including the vocabulary-grep purge verification and all fresh re-derivations) were formed before reading quill's report 27. Medium (LAW #16): Chromium headless 1440×1000, settled-page reads, IN-PLACE island for the dark scope.

## The fix verification (the blocking MINOR)

**Vocabulary-grep sweep** (quill's law: grep the VOCABULARY — "inherit*/from context/shrinks/grows/ambient" — not one string): every remaining mention on the served page is one of three legitimate forms —
1. the **refutation quotation/reference**: the size row's "Measured FALSE: the old page text claimed the chip 'inherits font-size from context — shrinks in table cells and grows in heroes'" (:127), the Overview's "the stale 'inherits font-size' caption is falsified and corrected in the axes table" (:252), the shortcut-rows summary's "the falsified-inheritance note in the axes table is the receipt" (:305);
2. the **own-voice assertion**: PlayHelp ("the chip carries its OWN density-kernel voice (--jx-text-secondary) — 12px in the 13.5px prose context and the 13px menu button alike, so the context never resizes it" — the former :300 survivor, now the own-voice truth), the workbench description (:275), the Overview paragraph 2;
3. the **theme row's tree-inheritance mechanism** (:155 "system/auto ride tree inheritance") — a different, true mechanism.

**Zero surviving falsified-caption claims.** The blocking MINOR's fix is verified landed in both surfaces.

**The dead const**: `apiDensityRow` — 0 occurrences (quill's NIT: deleted). The api summary (:357) now states the fold reality — and the SERVED table matches it exactly: **table 1 = `variant`, `class` (2 rows); the density row folded into the shared 8-row universal section beneath** (SSR-enumerated).

## Fresh re-derivation of the standing claims (all verified TRUE)

1. **Own-voice measurement**: kbd computes **12px** in all three served contexts — prose **13.5px**, menu button **13px**, table row **12.5px** — the context never scales it ✓.
2. **Density ladder** (DensityDemo xs/default/lg boxes): fontSize **10/12/14px**, line-height **13.5/18/21px**, paddingInline **8/12/16px** — digit-exact; **`data-density` ABSENT on the kbd at every rung** (the ambient two-channel finding: the attr stays absent, the kernel channels cascade from the ancestor scope box).
3. **Typed-STREAM flip**: in-place `.dark` island around a tonal kbd — tonal bg/border re-derive to the **0.7044-family** (oklab 12%/45% mixes), ink follows the scope's primary, and `--jx-tonal` at the element reads **`oklch(0.7044 0.1872 calc(118 - 4))`** — the −4° drift arithmetic live in the re-declared stream. The engrave literal inset pair **held unchanged** (black/white insets, byte-consistent before/inside).
4. **Radius 2px own corner via the promotion seam**: computed borderRadius **2px on every instance** — including `radius="medium"` (carrier --jx-radius-effective **8px** stamped) and `shape="squircle"` (**squircle** stamped) demos — stamped-but-ignored, verified live.
5. **Engrave literal pair / zero transitions / no css file**: computed boxShadow = the literal inset pair at every lane; the family ships no css file (dir listing); zero transition declarations (source read).
6. **Native `<kbd>` zero ARIA**: the element carries data-jx-kbd/data-density/class/style only — the element is the semantics.

## quill's three adjudications — CONCUR ×3

1. **Declaration-coverage taxonomy — CONCUR, verified on my probe**: kbd's `--jx-tonal` is typed-REDECLARED (re-derives per scope — my island measured the 0.7044-family flip with the drift calc live) vs combobox's typed-ROOT-ONCE (frozen — my task-29/31 receipts). The coverage cut (not the value-shape cut) is the correct law; the two families are the named contrast pair.
2. **[variant, class] api table + fold-honest summary — CONCUR**: served matches the reworded summary exactly (2 rows + the 8-row fold; density's measurements live in the axes table).
3. **Falsification provenance one seat — CONCUR**: the axes summary carries history; the row/PlayHelp/Overview carry mechanism. Verified in the served text.

## Findings (severity-tagged)

1. **[NOTE · precision]** The stamped instances compute **14/18px** (the §11 inline mirror re-voices the kbd — root==glyph for this family, inline-over-atom), while the size row's "the glyph's voice stays put" is true of the KERNEL channel value (`--jx-text-secondary` constant), not the rendered glyph. The context-inheritance half of the row is solidly TRUE (P1). Two frames compressed into one sentence — precision note for the ledger, no action required.
2. **[NOTE · probe craft]** My first battery ran against a COLD dev compile and read empty `--jx-*` vars / 16px fallbacks — the settled-page law (double-200 + long settle + a sanity token read before trusting negatives) re-earned on my own probes. All filed receipts are from the settled pass.
3. **[NONE]** otherwise — no MAJOR/MINOR on the re-verify scope.

## Gates

| Gate | Result |
|---|---|
| defaults-kbd-badge-chip solo | **10/10 green** |
| docs-ambient-vocabulary solo | **284/284 green** (kbd's two matrix pins hold) |
| verify:docs-universal | **GREEN 110/110, exit 0** |
| svelte-check (page-scoped) | **kbd.html: 0 diagnostics** (route dir clean) |
| SSR | 1,043,700 B; h1 ×1; marker ×1; api served = variant/class + the 8-row fold; toc 8/8 ids |

## Environment discipline

- Port 5243: `lsof` EMPTY before (rc=1); background-wrapper dev server killed by PID at session end → **EMPTY after** (`port after: []`).
- **NO commits, NO pushes.** Zero product-tree edits (review-only). Siblings in flight untouched: vellum's press-button CODE, quill's menubar review, marginalia's popconfirm review.
- Artifacts: `/tmp/scribe-32-probe{1,2}.mjs`, `/tmp/scribe-32-ssr.html`, `/tmp/scribe-32-check.txt`, `/tmp/scribe-32-dev.log`.

## Verdict

**PASS** — kbd (2nd of 2). The NEEDS-WORK fix is verified landed in both surfaces with the vocabulary sweep clean; every standing claim re-derived TRUE on the settled tree; the declaration-coverage taxonomy verified live on the REDECLARED side; all three adjudications concurred.

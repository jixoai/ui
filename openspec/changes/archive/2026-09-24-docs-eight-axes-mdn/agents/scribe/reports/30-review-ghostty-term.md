# 30 — REVIEW ghostty-term (2nd of 2; scribe)

Date: 2026-09-23 · scribe · port 5243 · NO commits
Target: vellum's page at `197bf895` — `ghostty-term.html/+page.svelte` (1135 lines) + `+page.ts` + the family (`ghostty-term.svelte` 1676 lines, stylex, css, defaults, vt-deps.ts). Reviewer #1 = quill (PASS) — independence law held: findings formed from source + probes BEFORE reading his report; the SHADOWED SLOT attribution was derived independently first, as dispatched. Medium (LAW #16): Chromium headless 1440×1000; canvas ground sampled via offscreen `drawImage` + `getImageData`; dark scope via IN-PLACE island wrap; wasm-boot waits ~8s.

## Per-claim verdicts (all verified TRUE)

### 1. The live misfold fix — VERIFIED (enumerated by name)

Served api contract table = **11 rows, in the dispatched order**: cols, rows, auto, fontSize, wasmUrl, **theme**, onData, onResize, **density**, class, children — density and theme riding `docs.extra` at reference identity (the same objects passed in `props` and `docs={{ extra: [apiDensityRow, apiThemeRow] }}`, :1018). The fold's **8-row universal section beneath** (size, shape, radius, density, color, theme, elevation, motion); the Handle table (write, reset, resizeTo, snapshot) follows. Marker `data-jx-props-table-universal` ×1; h1 ×1; **meta 27 props verified by enumeration** (26 named + `rest`).

### 2. THE SHADOWED SLOT — VERIFIED, with my independent attribution: NO-OBSERVER (a refinement of "boot-time snapshot")

- **Source contract**: `ghosttyTermThemeSlot = absentSlot<GhosttyTermTheme>()` (defaults file) — own undefined, absence meaningful; the knob-by-knob fallback `d.theme?.background ?? token('--terminal')` at `ghostty-term.svelte:542`. 'light'/'dark'/'system' have no seat.
- **The measured split reproduces exactly** (no-theme density terminal, in-place island):
  - baseline light: canvas pixel **rgb(240,240,240)** = oklch(0.9551 0 0); raw and typed `--terminal` both 0.9551;
  - inside `.dark`: raw `--terminal` **flips to oklch(0.2 0 0)**, typed `--jx-terminal` **stays 0.9551** (the css root layer), and the **canvas pixel stays rgb(240,240,240)** — the ground holds while the scope's own raw token reads dark. Claim reproduced.
- **MY ATTRIBUTION — no-observer, not alias-freeze, not a strict boot snapshot**: the fallback reads the RAW `--terminal` (not the typed alias — :542), via live `getComputedStyle` at effect-run time; the shell-color effect's dependency list (:956-966) contains ONLY the theme-object prop fields (+ phase/ctx); the family has no scope MutationObserver (its only observer is the sizing ResizeObserver). Scope flips are therefore invisible to the reactive graph: the last-resolved light value keeps painting. It is not alias-freeze — the raw token genuinely flips and the css ROOT layer freezes via the typed alias (a different layer, behind the opaque canvas). It is not strictly boot-locked either — any theme-prop change re-runs the effect and re-probes the CURRENT scope live (a theme edit inside a dark scope would snap the token knob dark).
- **The shadow itself demonstrated**: the workbench terminal (explicit `theme={{ background: '#161616', … }}` preset) paints rgb(22,22,22) in BOTH scopes — the explicit knob shadows the token sheet, by design.

### 3. Density consumed — VERIFIED (ladder arithmetic at the token level)

The three demo terminals stamp `data-density` **sm / default / lg**; the kernel ladder resolves exactly: sm `--jx-text` = (0.8125rem − 1px) = **12px** × **1.5** → line **18px**; default 0.8125rem = **13px** × **20/13** → **20px**; lg (0.8125rem + 2px) = **15px** × **1.6** → **24px** — the dispatched arithmetic verbatim (calc strings read from the roots). The consumption path is source-real: `probeTokenPx` (:508-517) resolves the calc through an in-tree element's used font-size and feeds `measureCell` → `cell.h = round(size × leading)`. The workbench (unstamped) root carries `data-density="default"` — the own-'default' always-concrete contract, attr always present.

### 4. Size echo + falsified face — VERIFIED

Three served instances with the inline §11 mirror verbatim: query root **18px** (1440) → **13px** (600, below 48rem), `size={13}` → **13px**, `size="large"` → **18px**. The ERROR FACE (all three reach `state="error"` on the invalid wasmUrl) computes **13px at all three** — the fixed `--jx-text-base` voice (0.8125rem) — nothing follows the stamp, the heading-contrast proof.

### 5. Supply-only + box-shadow — VERIFIED

Zero carrier reads (`--jx-shape/radius/color/elevation/motion-effective`) across `ui/ghostty-term/` **and vt-deps.ts** (grep). Zero box-shadow in the family — the demo window's float shadow is the PAGE chrome (`--shadow-md` on the demo shell), as the elevation row states.

### 6. The three KEEP adjudications — CONCUR ×3 (independent)

1. **Fold's generic theme row — KEEP**: the 8-row fold is the fleet's shared universal reference; the page's local truth (the SHADOWED cell + the EXTRA theme row) rides above it. Same authored-vs-served pattern as combobox #30 and native-scroll-area #26.
2. **SHADOWED type cell — KEEP, with the precision refinement**: "SHADOWED — the shell-theme OBJECT, not the axis enum" IS the family contract (absentSlot, meta `theme: { kind: opaque, ambient: own }`). The description's mechanism sentence ("every painted voice is a TYPED token (--jx-terminal…)") is exact for the css root and imprecise for the canvas (raw read + no-observer cache) — see finding 1. The measured outcome stands either way; wording is author's discretion.
3. **Kinship pair (ghostty-term ↔ terminal-card, render-side sibling) — KEEP**: named in the overview; zero import edges between them (grep) — vocabulary-level kinship, honestly stated.

## Findings (severity-tagged)

1. **[MINOR · precision, concurred with quill + one refinement]** The theme row's "every painted voice is a TYPED token (--jx-terminal, --jx-terminal-foreground, …)" is exact for the CSS surface (root bg/ink, focus outline — the typed aliases, measured frozen) but imprecise for the CANVAS shell: the wasm's shell colors resolve from the RAW `token('--terminal')`/`'--terminal-foreground'` (:542-543), read live at effect-run time. The hold-the-pole behavior is real but its mechanism is **no-observer**: scope flips are neither observed (no MutationObserver on class/data-theme) nor tracked (getComputedStyle is not reactive), so the cached value paints until a theme-prop change re-probes the current scope. Refinement of quill's "boot-time snapshot / never re-resolves": re-resolution DOES occur on prop-driven effect re-runs — the lock is on SCOPE observation, not on time. Suggested wording (mine): "the surface atom is a typed :root token; the canvas shell probes the raw shell tokens live but unobserved — a scope flip moves neither, and any prop-driven re-run re-probes the then-current scope." Author's discretion; claim-as-served reproduces.
2. **[NONE]** otherwise — no MAJOR; all other claims byte-exact.

## Gates

| Gate | Result |
|---|---|
| ghostty-term + ghostty-vt solos | **86/86 green** |
| terminal-patterns solo | **34/34 green** |
| vt probe family (scrollbar-probe, cursor-probe, title-timing, osc-probe, defaults-w4-content, mouse-probe, selection-probe, title-prop) | **60/60 green** — 180/180 across the family's spec surface |
| docs-ambient-vocabulary | **284/284 green** (the kbd-keyed reds from task 29 resolved — vellum's kbd re-pin landed; zero noise this round) |
| verify:docs-universal | **GREEN 110/110, exit 0** |
| svelte-check (page-scoped) | **ghostty-term.html: 0 diagnostics** (route dir clean) |

## Environment discipline

- Port 5243: `lsof` EMPTY before (rc=1); background-wrapper dev server killed by PID after each cycle → **EMPTY after** (`port after: []`).
- **NO commits, NO pushes.** Zero product-tree edits (review-only). Siblings in flight untouched: vellum's kbd files, marginalia's input-otp review, quill's file-input review; no keyed noise encountered this round.
- Artifacts: `/tmp/scribe-30-probe{1..4}.mjs`, `/tmp/scribe-30-ssr.html`, `/tmp/scribe-30-check.txt`, `/tmp/scribe-30-dev*.log`.

## Verdict

**PASS** — ghostty-term (2nd of 2). The live misfold fix holds by enumeration; the shadowed slot's contract (absentSlot + knob shadowing) is demonstrated live on both branches (explicit theme wins everywhere; token fallback holds the last-probed pole across scope flips); the density ladder is consumed arithmetic; the size echo's nothing-follows proof is the fixed error face; and the supply-only greps are clean. The one MINOR is a wording precision the author may take at discretion — my independent attribution and quill's agree on the observable and on the fix direction.

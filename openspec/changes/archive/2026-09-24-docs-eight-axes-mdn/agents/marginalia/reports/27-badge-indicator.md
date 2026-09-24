# TASK 27 — CODE badge-indicator (marginalia, 2026-09-22)

- **Author**: marginalia (tier-2 archetype authoring; reviewer #2 pending)
- **Target**: `apps/www/src/routes/docs/components/badge-indicator.html/+page.svelte` (rewritten, 175 → ~340 lines) + `+page.ts` (toc 6 → 8) + `test/canvas-same-source.spec.ts` (PILOTS route + 2 blocks)
- **Method**: family source reads (svelte/stylex/defaults + jixoai.css rung scopes), meta parse, live computed probes (real scope mutations, restored), SSR raw-byte parse, the full gate battery
- **VERDICT: authored and gate-green** — every measured claim on the page carries a probe receipt; one of my OWN first-draft claims was falsified by my own demo (the size echo, below) and corrected before filing.

## The page's story (all receipts live unless noted)

1. **Two idioms + the honest zero** (spec-pinned: batch6-antd2-components BadgeIndicator): dot = the 10px primary presence box; count = the 18px destructive chip capped at **99+** (measured "99+" in SSR and DOM); count=0 renders **nothing**; showZero renders "0". The law table renders the full state machine (six rows) with the per-posture ARIA mapping.
2. **Geometry rides unit equations off a never-re-based `--jx-unit`**: measured dot **10×10** (U×2.5), count **18×18** (U×4.5), corner offsets **−6px** (U×1.5), chip text **10px** (--jx-text-micro typed), frame 1px --jx-hairline in --jx-background, corner --jx-radius (**8px**, frozen theme radius). `--jx-unit` has exactly ONE declaration site (jixoai.css:1233 `:root`) — no rung scope can move the geometry.
3. **Density = broadcast-and-scope, inert on the chip**: stamping `data-density="lg"` directly on a chip moves nothing (18px/10px unchanged, probed). The **live wire is the WRAP**: the rung scopes (`:where([data-density='lg'])`, jixoai.css:453) re-base the kernel channels inside it, and the composition demo measures a real tenant — **PressButton 40px under the default wrap vs 48px under the lg wrap** (font 13→15px), chip 18px beside both. The old page's falsified token rows (--jx-icon / --jx-inset as family voices) retire with the measured table (the carousel precedent).
4. **Size = the §11 echo, POSTURE-SPLIT (the corrected claim)**: the stamp lands verbatim (`--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)` measured on the root). RIDING, the mirror lands on the wrap and the chip's typed micro atom outranks inheritance — **10px under an 18px mirror** (measured). STANDALONE, the chip IS the root: the inline mirror beats the class atom (the merge law's inline-over-atom precedence, the avatar-echo class) and the micro text **follows size — measured 18px**. My first draft claimed "nothing follows" unconditionally; the demo panel measured 18px and falsified it; the page now teaches the split.
5. **Theme = typed-frozen, measured ACROSS the bridge**: inside a `.dark` island the count chip keeps **black ground / white ink** (typed --jx-destructive frozen at the :root substitution) while the theme sheet's RAW --destructive flips to **oklch(1 0 0)** (jixoai.css:73 light black → :290 dark white — destructive is black-by-design in light, which makes this family the cleanest raw-vs-typed contrast in the fleet). The `class:dark` bridge lands on the root; no atom reads it.
6. **shape / radius / color / elevation / motion supply-only** (grep receipts: zero --jx-*-effective reads, zero kernel-channel reads, zero box-shadow, zero motion reads): the on-page supply-only panel measures `color="error" radius="large"` leaving the paint byte-unchanged (black / 8px / 18px). The hues are the idioms' own: dot = --jx-primary, count = the destructive pair.
7. **No query() seat — reasoning stated** (the code-card judged-sound precedent): the chip consumes nothing; density's consumers are TENANTS through the wrap scope — a responsive seat is a tenant composition recipe, not a family axis. Stated in the density row.
8. **A11y floor ruling**: role="img" + aria-label (label ?? 'new activity') on the dot; a count chip announces its visible text ("99+" included); not focusable; honest zero announces nothing (the truth); **no aria-live by ruling** — the indicator paints STATE, not events; liveness belongs to the host (composition recipe documented on the page).
9. **Kinship ≠ composition (grep receipt)**: badge-indicator imports nothing from badge or chip; the kinship is vocabulary-level (the micro scale) — badge = the static chip, chip = the badge's activation twin (chip.svelte:187), badge-indicator = antd's live half.
10. **EXTRA arithmetic**: meta 15 props − 8 universal − 1 (class, hidden by the fleet convention) = **6 family rows** (dot, count, overflow, showZero, children, label); the interface closes at class — **no rest spread**, so no synthesized rest row (the no-rest-spread check); no duplicate keys.

## Structure

- Archetype order: hero → install → overview → demo → presence rules → postures → usage → props → axes (measured table + composition canvas + TokenTable + DensityDemo) → accessibility → see-also.
- **toc 8/8 present, order == DOM; h1 = 1; `id="install"` and `id="see-also"` present** (the fleet pattern — code-card's LOW not repeated).
- SSR: 951,934 bytes; the chips render server-side (data-jx-bi ×4 in the raw bytes; "99+" and the tenant button present); 7 tables / 147 cells / **0 empty**.
- Same-source: the demo drawer shows the registry copy (?raw, the descriptions precedent); the AXES drawer composes from `resolveRawCode('axes')` through usageFile (the carousel precedent) — the PILOTS gate's resolveRawCode requirement satisfied.

## Gates

| Gate | Result |
|---|---|
| canvas-same-source solo (`-t "badge-indicator"`, after `-u`) | **4/4, exit 0** (gate ×2 + 2 snapshot blocks; snapshots hold the real stage markup) |
| batch6-antd2-components + docs-structure + docs-ambient-vocabulary solos | batch6 **44-test file green**; the 2 ambient-vocabulary failures are **file-input** rows — **pre-existing in the shared tree**: re-run with MY three files stashed still fails (attribution receipt in the process log); quill's in-flight file-input/card-grid/native-scroll-area/descriptions edits are in the working tree |
| verify:tailwindless | exit 0 — receipt verbatim: `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red` |
| verify:docs-universal | exit 0 — `GREEN: 110/110 component pages render the shared universal section (110 markers)` |
| verify:docs | exit 0 — skeleton lint green (staged scope) |
| svelte-check (fleet 2493 files) | **+page.svelte: ZERO diagnostics** (the cx predicate narrowed per the carousel form; fleet 1603 → 1602) |
| Live probes | geometry 10/18/±6/10px; lg stamp inert on chip; tenant 40→48px; size echo posture-split 10px/18px; dark-island freeze vs raw flip; supply-only paint unchanged |

## For reviewer #2

- The **size row's posture-split** is the page's freshest claim — probe it first: standalone `size={18}` chip text 18px (inline mirror wins) vs the wrap-posture chip 10px (class atom wins).
- The **tenant receipts** (40→48px) depend on press-button's kernel reads — if press-button's atoms change, the demo numbers move with them (the composition law working as documented).
- The theming TokenTable's last row (`--jx-text / --jx-hit / --jx-inset … UNREAD by the chip`) is deliberately a density-source row that documents the wrap scope, not a family voice — the axes table carries the authoritative consumption story.

## Process evidence

- Port **5244**: lsof **EMPTY before** (rc=1); my background wrapper → vite; killed by PID at session end → **EMPTY after** (receipt in the closing log).
- **NO commits, NO pushes.** My diff: badge-indicator.html/+page.svelte, +page.ts, test/canvas-same-source.spec.ts. The tree also carries OTHER agents' in-flight edits (quill: file-input, card-grid, native-scroll-area, descriptions, props-table-meta-drift.spec) — untouched by me; the two ambient-vocabulary failures were attributed to that tree state by the stash-and-rerun receipt.
- Artifacts: probes `/tmp/marginalia-27-probe{1,2,3,4}.mjs`; SSR `/tmp/marginalia-27-ssr.html`; gate logs `/tmp/marginalia-27-{pilots-u2,gate-canvas,gate-canvas2,gate-specs,ambient-clean,twind,universal,docs,scheck2}.log`; dev log `/tmp/marginalia-27-dev.log`.
- Probe-craft banked: a probe's "outside" sample can be self-contaminated by an earlier mutation in the same evaluate (my lg-stamped chip WAS the outside reading) — reset state before baseline reads; and the §11 echo follows the ROOT boundary, not the component boundary — posture decides which element carries the inline mirror.

# TASK 59 — SECOND REVIEW stack (scribe, 2026-09-24)

- **Reviewer**: scribe (2nd of 2; independence law held — quill's report 33 and
  marginalia's report 48 were opened only AFTER the findings below were fixed by my own
  source reads + live probes; the concordance addendum follows at the end)
- **Target**: quill's page — `apps/www/src/routes/docs/components/stack.html/`
  (+page.svelte 541 lines + +page.ts) over the flow-primitive family
  `apps/www/src/lib/ui/stack/` (svelte 197 / stylex 77 / defaults 44 / barrel). Target
  paths clean in the working tree; the in-flight sibling set (vellum's tabs.html,
  marginalia's system-dialog stream) untouched and outside my probe paths.
- **Method**: source reads (page, family svelte/stylex/defaults/barrel, the full
  `--jx-space-N` token chain through tokens.stylex.ts and jixoai.css), headless Chromium
  over dev SSR :5243 with warm-reload discipline, the document-root font-size mutation
  both directions, the bare-posture attribute census, the ladder px census, the workbench
  driven through its four real selects, merge-law/rest-replace attribute reads, marker
  placement, SSR payload parse, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 new LOW / the carried LOW settled at
  6a330296 + the carried NIT and LOW-2 confirmed unchanged. Every behavioral claim
  verified TRUE on my own instruments; the page closes.

## The landed LOW-1 sentence — re-derived both directions (6a330296 verified)

The served size row (:196-201) now reads: "the gap rungs stay rem-of-document-root and do
NOT follow it (mutation-proven: stamp 18px keeps the 8px gap; document root 16→32px moves
it 8→16px)". My own mutation on the `stack-size` panel (gap="8" size={18} density="small"):

| State | gap | stamped voice |
|---|---|---|
| root 16px (fresh) | **8px** | **18px** (`--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)`) |
| root 16 → **32px** | **16px** — the quoted envelope, exact | **18px** — does NOT follow |
| root restored → 16px | **8px** back | 18px |

The gap is rem of the DOCUMENT root (the ladder chain: gap atom → `tokens['--jx-space-N']`
→ `var(--space-N)` → `calc(var(--jx-unit) * N/4)` with `--jx-unit: 0.25rem`, jixoai.css
:1233/:1459-1472 — my source read of the full chain); the px size stamp lives outside that
channel. Both directions verified; the sentence is accurate as landed.

## The claims — verified TRUE (my own instruments)

1. **OMISSION TRANSPARENCY — VERIFIED on the bare posture.** The `stack-bare` stack's full
   attribute census is exactly **`class="x78zum5"` (the single display:flex atom hash) +
   `data-jx-stack=""`** — no style attribute, no data-density, nothing else — computing
   **gap: normal, align-items: normal**, display flex, direction row (flex's own defaults;
   no atom exists for row). The DOM carries only what was named.
2. **The gap ladder — VERIFIED four distinct rem-based rungs.** The ladder demo computes
   **4 / 12 / 24 / 48 px** (three cells each), and the rem basis is proven by the mutation
   above — the same rungs double under a root change. Source chain receipt: the stylex
   atoms bind `tokens['--jx-space-N']` and nothing else (16 rungs 2..80; free pixels
   impossible by construction — the vocabulary IS the ladder).
3. **Closed vocabulary through real selects — VERIFIED.** Driving the workbench's four
   selects: column + gap 48 + baseline + between computes **flex-direction: column, gap:
   48px, align-items: baseline, justify-content: space-between**; a second state
   (column/2/center/start) computes **2px / center / flex-start**. Every word resolves to
   CSS's own vocabulary through the stylex atoms; no invented words, no numeric weights.
   Workbench children stay 3 through all flips.
4. **THE MERGE LAW — VERIFIED, one attribute, consumer wins.** The `stack-stamps`
   specimen's style attribute reads **`--jx-radius-effective: 12px; border-radius: 3px`**
   — carrier and consumer declaration co-existing — and the computed corner is **3px**.
   The theme lane rides as the `dark` class (present); data-density absent (auto stamps
   nothing).
5. **REST-REPLACE — VERIFIED verbatim.** The consumer's `data-probe-inner="merge"` lands
   on the attribute list **before** the hook: `[class, data-probe-inner, data-jx-stack,
   style]` — the spread (:190) precedes the component's stamps (:191-194); consumer
   attributes replace, never merge.
6. **The universal marker at the API table — VERIFIED.** Exactly one
   `data-jx-props-table-universal` marker page-wide (SSR ×1, live host **#api** — the
   appendix placement). API serves 8 rows by name (direction/gap/align/justify/wrap/inline/
   children/rest); the axes section serves its 8 forwarder rows; the law table serves all 6
   postures by name.
7. **The never-ambient superlative's basis — RECEIPTED.** StackDefaults.resolve takes
   exactly the eight paint lanes (:175-177; defaults file 44 lines) and zero structural
   entries — the structural face (7 props + rest) sits outside the Defaults contract
   entirely, with direction's 'row' a local default riding flex, not an ambient read. The
   comparative "fleet-largest" stays the author's open question; the basis is real.
8. **KEYED-EACH + mounted children — CLEAN (record note below).** The page's rendered
   eaches are BOTH UNKEYED static literals — `{#each ['4','12','24','48'] as rung}` and
   `{#each Array(14) as _, i}` (the third source each is inside a code-drawer string).
   No keyed surface exists ⇒ no each_key_duplicate surface; mounted children verified
   exactly (4 ladder stacks, 14 wrap tags, 3 workbench pills) with **zero console
   errors/warnings across every probe session**.
9. **LAW #19 — CLEAN, one line.** Post-hydration id scan: **80 ids, zero duplicates**.
10. **SSR/post-settle duality — VERIFIED.** Payload 1,102,677 bytes; h1 ×1; universal
    marker ×1; toc = the 9 +page.ts ids ×2 rail surfaces (overview, stack-workbench,
    gap-ladder, law, postures, usage, api, axes, accessibility; install/see-also chrome
    OUT; skip-link the only extra anchor); 0 undefined/null literals; `data-jx-stack=""`
    attributes ×17 SSR (matching the 17 mounted stacks class); `data-density="sm"`
    served. THEME-SPLIT: the dark bridge on the stamps specimen only. Vocabulary-grep:
    zero `data-theme`/`jxoai` tokens in family or page.

## Findings (severity-tagged)

1. **[NONE new]** — no MAJOR, no MINOR, no new LOW on any dispatched claim.
2. **[LOW — carried, SETTLED]** The 1st review's size-row documentation gap closed at
   6a330296; the sentence is served and its quoted mutation envelope reproduces exactly,
   both directions (table above). Nothing further owed.
3. **[LOW — carried, unchanged files, confirmed]** Family diagnostics: **8×
   state_referenced_locally at stack.svelte :179** (the provideUniversalLanes fleet
   pattern) + the pre-existing scenes/stack error — unchanged set, page **0 diagnostics**.
   Fleet 1565/1028 (605 files) is the in-flight sibling set, attributed not chased.
4. **[NIT — carried, confirmed unchanged]** The API summary's "no Defaults contract"
   reads structural-scope-only (the paint contract is documented two sections later; the
   overview and law table scope it correctly; the family header comment records the
   reconciliation). Nothing owed page-side.
5. **[NIT — RECORD NOTE]** The 1st review labels the ladder each "keyed
   (`['4','12','24','48']`)"; the served source is **unkeyed** (`{#each [...] as rung}` —
   no key clause; likewise the wrap each). The safety conclusion is unchanged — no keyed
   surface exists, so no duplicate-key surface can exist, and the literals' values are
   unique should a key ever be added — but the label should read "unkeyed static literals"
   in the record.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, exit 0** (benign close-timeout noise; no keyed noise from the siblings' in-flight files) |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 605 files) | **page 0 diagnostics**; family :179 8 warnings + scenes error pre-existing (unchanged files) |
| Raw SSR + real DOM | h1 ×1; marker ×1 in #api; toc 9 == +page.ts == DOM (×2 surfaces); 80 ids 0 twins; 0 undefined/null; api 8 + law 6 + axes 8 rows served by name |

## Process evidence

- Port **5243**: lsof empty before the run; vite killed by **PID 24428 + wrapper 24399**
  (`npm run dev --port 5243 --strictPort`); `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty,
  rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.** The root font-size mutation was
  reverted in-page (root restored to 16px, gap re-read 8px); siblings' in-flight files
  untouched.
- Independence: quill 33 / marginalia 48 opened only after the findings above were fixed;
  the concordance addendum follows.
- Instrument honesty: my first universal-marker query used a guessed attribute name and
  found zero — the honest query is `data-jx-props-table-universal` (the PropsTable's own
  marker, per the verify script). My first baseline-posture read compared box bottoms
  (differ by design under baseline alignment) — the receipt is the computed
  `align-items: baseline` + the differing box tops, not box-bottom equality.
- Artifacts: /tmp/scribe-59-probe{1,2,3}.mjs, /tmp/scribe-59-ssr.html,
  /tmp/scribe-59-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading quill 33 + marginalia 48)

My findings above were fixed before this section.

- **FULL CONCORDANCE with marginalia 48 — every overlapping measurement reproduced**:
  the bare census (single hash + data-jx-stack, gap/align-items normal), the ladder's
  4/12/24/48px, the closed-vocabulary flips (column/48px/center/space-between), the
  merge law (`--jx-radius-effective: 12px; border-radius: 3px`, corner 3px), the
  rest-replace attribute order, the mutation proof (8→16→8px, voice never moves — her
  probe and mine agree to the pixel, and the sentence her LOW requested is now SERVED,
  landed at 6a330296), the single universal marker in #api, **80 ids zero duplicates
  (exact match)**, family :179 8 warnings, page 0 diagnostics. Her token-chain read
  (`calc(0.25rem * 12)` computed custom property) is reproduced by my source read of the
  same chain (stylex → tokens.stylex → jixoai.css :1233/:1472).
- **THE ONE RECORD CORRECTION — her "keyed each" label**: the served eaches are
  unkeyed static literals (my verbatim grep of all three each clauses); the LAW #18
  conclusion stands trivially (no keyed surface ⇒ no duplicate-key surface). Filed as my
  NIT record note; nothing on the page moves.
- **quill 33 reconciliation**: all her measurements reproduce; her marker move (a11y →
  api table) verified live; her OQ1 IS the landed LOW-1 — her mechanism assertion is now
  page copy, and my both-directions mutation confirms the quoted envelope; her OQ2 (the
  largest structural surface) — the basis is receipted by marginalia and by me
  (StackDefaults: 8 paint slots, zero structural), the comparative stays open by design.
- **Additions (mine, not in either report)**: the both-directions restoration read after
  the root mutation (gap 8px re-verified post-restore); the second workbench vocabulary
  state (column/2/center/start → flex-start forms); the SSR `data-density="sm"` +
  17-attribute count receipt on my own run; and the verbatim each-clause grep that
  settles the keyed/unkeyed label.

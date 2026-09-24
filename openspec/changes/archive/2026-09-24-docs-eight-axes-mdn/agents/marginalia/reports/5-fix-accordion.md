# Report 5 — accordion, FIX round (both reviews consolidated, one pass)

agent: marginalia · date 2026-09-22 · main dir, NO commits, NO push
page: `apps/www/src/routes/docs/components/accordion.html/+page.svelte` + `+page.ts`
spec: `apps/www/test/canvas-same-source.spec.ts` (accordion joins the drift gate)
inputs: vellum `3-review-accordion.md` (B1 · M1 · M2 · m1 · m2 · n1 · n2) + scribe
`4-review-accordion.md` (M1–M5 · m1 · m2 · n1–n3) — read fully, consolidated into
ONE fix round; overlapping upgrade commitments landed with them.

## Per-finding fixes

### vellum B1 + scribe's theme corollary — theme is a PARTIAL re-theme, per voice

All three false claim sites rewritten to the theme-split law (§6; ledger W-next #1/#2):

- **theme row** (`axisRows`): now opens "A PARTIAL re-theme on this family, measured
  (the theme-split law)" and names both halves. Flipping half (raw tokens, re-declared
  under plain `.dark`, jixoai.css:269-294): summary ink `--foreground`
  (accordion-item.css:19), hover `--primary-text` (:23), focus ring `--ring` (:27),
  item seam `--border` (accordion.css:16). Frozen half (the stylex defineVars layer,
  tokens.stylex.ts:207 — emitted at `:root, .xbpgcew` + theme classes, never plain
  `.dark`): card ground `--jx-card`, frame border `--jx-border`, body ink
  `--jx-muted-foreground` (accordion.stylex.ts group/body). Closes: documented per
  voice until the protocol pass.
- **deviations paragraph**: "density is the only full repainter; theme is a partial
  one — the raw-token voices flip (summary ink, focus ring, seam), the stylex voices
  stay (the W-next #1 gap, named per voice in the row above)" — the old "density and
  theme are the only lanes that repaint the accordion itself" is gone.
- **theme demo KEPT and recaptioned** (vellum's primary option; the ledger's
  per-voice split is exactly what a live island shows): item body now reads "the
  summary ink flips to the dark profile; the card ground stays light", and the canvas
  gained a `description` that says the quiet part: "the summary ink is now white —
  the unreadable line IS the documented gap". The demo no longer captions a broken
  state as success; it receipts the gap.
- **Live receipt (one evaluate, my same-instant law)** on :5244: summary ink
  `oklch(1 0 0)` (flipped) === card ground `oklch(1 0 0)` (stayed) — the
  white-on-white receipt as a passing assertion; frame border `oklch(0 0 0)`, body
  ink `oklch(0.3211 0 0)` — byte-matching vellum's B1 probe values.

### vellum M1 + scribe M1 — TOC rebuilt to the DOM

`+page.ts` now ships `accordion-base/Overview · usage/Usage · types/Postures ·
api/Props · universal-props/The eight axes · accessibility/Accessibility` (quill's
r2 comment form: "Order follows the page DOM"). Dead `#theming` gone; the axes
section reachable; labels current. Probe: every rendered toc `href="#…"` resolves to
an existing `id="…"` in the same document; `>Postures<`, `>Props<`,
`>The eight axes<` all in SSR.

### vellum M2 + scribe m2 — the four drifted mirrors single-sourced; the drift class killed

- **postures, density, theme, concentric, query** canvases got `id`s; their drawers
  now compose via `usageFile(imports, resolveRawCode(id))` — the hand literals
  (`posturesDemo`/`densityDemo`/`themeDemo`/`concentricDemo`/`queryDemo`) are
  DELETED. Explanatory comments moved INTO the stage children (extraction is a
  byte-slice, both surfaces carry them — the density canvas's "explicit rungs"
  comment and postures' three comments are in the pinned snapshots).
- **Copy fixed on the one source**: density panels read "The lg rung — 15px summary
  text." / "The sm rung — 12px summary text." on BOTH surfaces (vellum's preferred
  copy; `T_base` no longer exists anywhere on the page — scribe nit 10 dies with the
  string). The concentric stage carries the FULL sentence incl. "(native-details
  content is in flow; no portal boundary)". The query stage keeps its "Resize the
  window and watch the summary step." sentence — now in the drawer too.
- **The FAQ drawer** (`canvasFiles`) no longer presents the minimal 2-item usage as
  the live sample's source: its third file is `src/lib/ui/accordion-faq.svelte`, a
  hand mirror of the STAGE (3 items, the Badge summary, `exclusive`, a `bind:open`
  item with local `$state`; page-only `cx(rt.ml4)` dropped). The hand mirror is
  forced here: the stage carries playground page-state (`{exclusive}`/`{ghost}`
  shorthand identifiers) — the F4 self-containment guard's documented rejection
  class (registry/density-2xs precedent) — so the canvas deliberately takes no id.
  The minimal install example stays where it belongs: the Usage section's CodeBlock.
  Both vellum options applied at once: regenerate-from-stage (in spirit) AND clear
  labeling (the file name says faq, the comment says which surface is which).
- **The ratchet** (vellum follow-up #2): accordion JOINS the drift gate —
  `canvas-same-source.spec.ts` PILOTS grew by `components/accordion.html` with five
  inline snapshots (`vitest -u` once, then green without). Editing a stage now fails
  the snapshot until reviewed; a hand mirror can never silently return.

### scribe M2 — elevation row: the invented consumption removed

New text: "Stamps --jx-elevation-effective (a number is exact dp). The frame carries
no shadow and no consumer in the tree reads the carrier (grep receipt: zero hits;
the Card's shadow is the fixed token --jx-shadow-2xs and never reads the lane).
Supply-only (documented absence)." The "Card at level2 lifts" fiction is gone, and
the correction names the actual Card mechanism scribe cited.

### scribe M3 + vellum n2 — size row rewritten per the derivation

New text keeps the TRUE stamp sentence, drops the measured-false em tail: "Stamps
--jx-size-effective plus an inline font-size on the group root (a px number). The
inline stamp reaches only unstyled flow directly under the frame — the summary and
body re-anchor on the density channels (var(--jx-text)), and Card/PressButton voices
are token-anchored: no consumer in the tree reads the carrier (grep receipt; the
kernel's own stamp emitter is the only other hit). Supply-only for the disclosure's
anatomy (documented absence)."

### scribe M4 — motion row: same supply-only form

"…keeps its fixed recipe (--motion-200 / --motion-ease-nav, killed under
prefers-reduced-motion) and no family or fleet component reads the carrier (grep
receipt: zero hits in lib/ui — the tree's only reader is the component-canvas demo
page). Supply-only (documented absence)."

### scribe finding 5 (the coordinator's ALSO) — query() BOTH-args, and the drawer teaches it

The `viewportDensity` one-generic const is DELETED. The call is inline in the stage
(the badge idiom, extractor-safe including generics):
`density={query<{ sm: DensityLane }, DensityLane>({ sm: 'default' }, 'small')}` —
and because the drawer composes from the stage, the usage file teaches the SAME
two-arg form with the `'{ query }'` + `'type { DensityLane }'` imports record. The
comment above the composition states the §6 typing law why. Machine-verified below:
the page's svelte-check count dropped by exactly the one error this shipped.

### scribe m2 + vellum m2 — "supply-only" everywhere; §6 gloss supplied

`broadcast-only` (the coined lane label): ZERO hits remain (probe-asserted). The
deviations paragraph's first mention now writes "the broadcast protocol (吃也供,
supply-and-consume; the universal-props concept page owns the term)" — vellum's m2
form, anchor page punctuation. "Broadcast" survives only inside that glossed proper
noun. shape/color rows reworded from "broadcasts to nested consumers" to "supplies
real nested consumers" (with the positive grep facts named in-row: Card
`corner-shape: var(--jx-shape-effective, round)` + factor; PressButton
`--jx-fill`/`--jx-tonal` on `var(--jx-color-effective, var(--primary))`).

### scribe m1 — density's inert number lane made explicit

The density row now ends the lane's number half with: "inert on this family: the
scope blocks substitute at their declaring element, so the coefficient alone
repaints nothing; only a named rung's attr re-anchors --jx-text on the frame" —
my substitution-timing derivation, promoted from experience log to page text.

### vellum m1 + scribe n3 — density type cell = the schema union

Now verbatim `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg'
| 'auto' | number` (universal-props.schema.ts:71; blockquote :109's form). The type
column is the reference again.

### vellum n1 — a11y density-invariance note

Accessibility summary gained: "The summary's hit height is density-invariant: 11px
padding-block at default, sm, and lg alike (measured) — density moves the text, not
the target." Probe receipt: padding-top 11px on all three rungs, one evaluate.

### Upgrade commitments landed with the overlap

- **quill's axes-summary honesty index**: the axes SectionCard summary now opens its
  second half with "The split, counted: density is the one full repainter; theme is
  a partial painter (the row names which voices flip and which stay); radius is
  anchor-only; shape and color supply real nested consumers; size, elevation, and
  motion are supply-only with no reader in the tree — recorded per axis instead of
  silently omitted."
- **quill's query() drawer discipline**: discharged (see finding 5 above) — the
  two-sources debt is gone, not deferred.
- **meta+docs curation lane**: still deferred — accordion has no generated meta
  (unchanged from round 1; extractor coverage is the orchestrator's batch-close item).

## Grep receipts (run THIS task, current tree)

- `rg -n -F "var(--jx-elevation-effective" apps/www/src registry/files` → **0 hits**.
- `rg -n -F "var(--jx-motion-effective" …` → **2 hits, both the component-canvas
  demo page** (`component-canvas.html/+page.svelte:228,249`); zero in `lib/ui/`.
- `rg -n -F "var(--jx-size-effective" …` → 3 hits, all the kernel's own stamp
  emitter (`defaults.svelte.ts:575`, both trees) + badge's DOC PROSE; zero component
  readers.
- positive: shape → `card.css:104` (corner-shape) + `:109` (factor in radius calc),
  also list-item/popconfirm/float-button/system-dialog; color →
  `press-button.css:91,93`.
- family consumption: `rg -n -- "-effective" apps/www/src/lib/ui/accordion/` → 0 hits.
- theme split: `jixoai.css:269` `.dark` re-declares `--foreground`(:271)
  `--primary-text`(:283) `--border`(:292) `--ring`(:294); `tokens.stylex.ts:207` is
  `stylex.defineVars(tokenMap)` — the frozen layer per ledger #2.

## Gates (all re-run this round, on the fixed tree)

- **dev-smoke :5244**: page `HTTP:200 bytes:1165896`; probe
  `/tmp/marginalia-5-acc-probe.mjs` → **48/48** (34 SSR checks: toc anchors/labels,
  dead-anchor sweep, every honest-copy string, drawer-parity strings, marker ×1,
  install/see-also; + 14 browser checks: the one-evaluate theme island, density
  15px/12px + rung attrs + 11px hit invariance, query() 13px ↔ 12px ↔ 13px with
  `data-density` default ↔ sm ↔ default).
- **verify:docs-universal**: exit 0 — `GREEN: 110/110 … (110 markers)`.
- **verify:tailwindless**: exit 0 — receipt UNMOVED verbatim:
  `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42
  — bound verbatim`.
- **verify:docs**: exit 0 — `✓ all docs pages pass the skeleton lint (staged scope
  green)`; accordion zero backlog lines.
- **svelte-check** (repo root, `npx svelte-check --workspace apps/www`): BEFORE
  (pre-edit) the accordion page had exactly 2 errors — `:256:73 Argument of type
  '"small"' is not assignable to parameter of type 'undefined'` + `:290:28` (the
  page-family `cx` idiom). AFTER: exactly 1 — the `cx` idiom, now `:262:28` (same
  pre-existing family debt, shifted by line drift). **Page delta = −1, the query()
  error, machine-verified.** Workspace total 1645 → 1645: my −1 is cancelled by +1
  from the concurrent cascader task in the shared tree (`cascader.html/+page.svelte
  +348 lines, new :384:60` — git-status attribution, not my file).
- **affected specs solo**: `vitest run test/docs-structure.spec.ts
  test/canvas-same-source.spec.ts test/docs-ambient-vocabulary.spec.ts
  test/docs-nav-filter.spec.ts` → **371 passed (371)**; canvas-same-source alone
  51/51 (5 new accordion snapshots, `-u` once then green without).
- **openspec**: `openspec validate docs-eight-axes-mdn --strict` → `Change
  'docs-eight-axes-mdn' is valid` (exit 0).
- **build** (apps/www): `BUILD_EXIT:0` before the dist-based gates.

## Process evidence (the recycle law)

- Dev server: `npm run dev -- --port 5244 --strictPort` (apps/www), wrapper PID
  **50971** (`/tmp/marginalia-5-dev.pid`). Reclaim: children pkill'd + wrapper
  killed; `lsof -i :5244 -sTCP:LISTEN` → **0 lines**; `ps -p 50971` gone;
  `pgrep -f "vite dev.*5244"` → empty. No orphans of mine. (Other sessions'
  servers on :5230/:5241 were already flagged by scribe — untouched.)
- Scratch artifacts, /tmp only: `marginalia-5-acc-probe.mjs`,
  `marginalia-5-ssr.html`, `marginalia-5-dev.{log,pid}`,
  `marginalia-5-scheck-{before,after}.log`, `marginalia-5-{build,univ,tw,docs,
  spec-u,spec-green,specs}.log`.
- Repo-side writes: the two page files, the spec, this report, experience.md.
  Family, kernel, schema, concept page untouched. NO commits, NO push.
- Self-caught this round (both fixed before any gate ran): (1) my first `+page.ts`
  edit dropped the `//` off one comment line — parse-checked immediately and
  repaired; (2) the first probe write corrupted a few JS lines with HTML entities —
  rewrote the file and read it back before running. The write-then-parse-check law
  (AGENTS.md 批量脚本编辑) caught both.
- Probe-side false FAILs, for the record: stylex class names are hashed in the DOM
  (`rt.panel` is not `.panel`), and HTML serializers escape `<` in code samples —
  three probe assertions were locator/escaping bugs, fixed, then 48/48. The theme
  values were read in ONE evaluate per my own cross-instant law.

## For the orchestrator

1. **badge is not in the canvas-same-source PILOTS** despite shipping
   `id="usage"`/`id="axes"` + resolveRawCode in task 4 — its drawers are ungated by
   the drift gate. One-line PILOTS entry + two snapshots closes it (my miss that
   task; flagged, not fixed — outside this task's file set).
2. The concurrent cascader task's +1 svelte-check error (new `:384:60`) cancels my
   −1 in the workspace total; the per-page ledger is the honest one.
3. Scribe's family-code flag stands (accordion.svelte's init-time
   `provideUniversalLanes` snapshot) — next to my round-1 follow-up #1.

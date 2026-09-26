# T147-R1 — FIRST REVIEW toggle (scribe, 2026-09-24)

- **Target**: `apps/www/src/routes/docs/components/toggle.html/` (+page.svelte,
  +page.ts toc) over marginalia's owner round (agents/marginalia/reports/147-toggle.md),
  plus the registry.json toggle description. Family source untouched by the round
  (git status: no registry/files changes — mirror law n/a). Vintage: working tree
  at HEAD 61d810ed, her edits uncommitted; **my fresh build rc=0 (dist Sep 24
  06:58)**, sole build writer (orchestrator-confirmed, no other previews alive).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT. Tier 1 CONFIRMED** (skeleton
  halves + copy truing + site metadata; no structural or mechanism work — her tier
  call is right).

## Verified TRUE with digits (my own instruments, served DOM @1440 on dist 06:58)

1. **The fusion V2 DOM, censused**: **19/19** checkbox inputs carry
   `role="switch"` + the `jx-html-switch` class; **sr-only variants: 0**; no
   track/knob spans anywhere (the served input sits bare in its slot; component
   source: "No label wrapper, no track/knob spans" — input[role=switch] with the
   ::before knob). The a11y table teaches `role: switch` and the served table
   agrees (the retired `value="checkbox"` string: 0 hits).
2. **The label stacks ABOVE** — sibling `label[for]` wired (`htmlFor === id`),
   display block, **labelBottom 2131 < inputTop 2134** (3px gap), **same left
   edge**, DOM label-first. "label on the left" is gone from the served bytes
   (0 hits).
3. **Rung geometry, digit-exact at all four rungs**: xs **32×16**, sm **36×18**
   (driven live through the playground), default **40×20**, lg **48×24** —
   `width = 2 × track` in the served var shape (`--jx-toggle-width: calc(…track… * 2)`);
   the track calc chains resolve per rung (xs `(13−2)×16/11 = 16px` … lg
   `(13+2)×1.6 = 24px`), and `--jx-line` reads as the same chain as the track —
   track IS `--jx-line`. **The default rung stamps NO data-density**
   (`getAttribute → null`) — absence IS the state.
4. **The slide law, live**: real click on the default demo toggle — ::before
   transform `matrix(1,0,0,1,0,0)` → `matrix(1,0,0,1,20,0)`: **translateX
   20px = width − track** at the default rung, digit-exact.
5. **The knob flip, token-equality**: knob bg `oklch(1 0 0)` unchecked →
   `oklch(0 0 0)` checked; the page's computed `--primary-foreground` is
   `oklch(0% 0 0)` — **equality, not hue-guessing**; the checked rail paints
   `oklab(0.6489 …)` ≈ `--primary oklch(.6489 .237 48)`. Transition
   **0.2s cubic-bezier(0.22, 1, 0.36, 1) ×3** computed on ::before — the 200ms
   curve claim survived the fusion, digit-exact.
6. **Retired copy verified gone from the SERVED payload** (476,890 bytes,
   my census): "visually-hidden" 0 · "sibling selector" 0 · "28×16" 0 ·
   "36×20" 0 · "44×24" 0 · "label on the left" 0 · a11y `value="checkbox"` 0.
   New vocabulary served: "32×16"/"36×18"/"40×20"/"48×24" ×3 each,
   "width − track" ×3, "primary-foreground" ×3, "jx-html-switch" ×23.
   The one retired survivor is LOW-1 below.
7. **Skeleton + toc**: served DOM order `[install, usage, demo, in-a-form,
   types, accessibility, theming, universal-props, api, see-also]` — Install
   and See Also served, Usage before the demos, the old duplicate #usage
   removed. The toc (NAV container) carries **exactly the 9 +page.ts entries,
   all resolving**. LAW #19: **82 ids, zero duplicates** (matches her count).
8. **The FormData contract, live**: flipped the form toggle (real click) and
   submitted — the TerminalCard prints **"beta: yes / form submitted ✓"**;
   `demo_tg` never appears (see Adjudication-2).
9. **The registry edit flows end-to-end**: CATALOG derives the hero summary
   from registry.json at build — the served hero now reads "painted as a
   switch — ONE element, the input IS the rounded rail (…jx-html-switch…)".

## Findings

1. **[LOW — a tenth seat survived the fusion truing: the usage snippet still
   teaches the retired posture.]** The `usage` string (+page.svelte :38)
   opens `<!-- label reads on the LEFT of the control; checked is $bindable -->`
   and renders in **two served seats** (the Usage CodeBlock and the canvas
   drawer's toggle-usage.svelte copy — both code samples in the served HTML).
   The page's own trued paragraph 300px below says "The label renders as a
   sibling `label[for]` **above** the control", and my geometry receipt says
   the same — the comment contradicts both and resurrects the exact phrase the
   registry description retired ("label reads on the LEFT"). She retired nine
   seats; this one is inside a code string her diff never touched. Fix shape:
   "label reads inline-start of the control" (the component's own comment
   wording) or "above the control". Copy-only; verification = the census
   dropping `reads on the LEFT` to 0.
2. **[NIT — the playground's middle segment is labeled 'md' in a page whose
   every other seat speaks 'default'.]** PlaySegmented options are
   `sm→'sm'`, `default→'md'`, `lg→'lg'` (:275-282; served labels + my drive:
   clicking 'md' stamps `data-density="default"`, 40×20). The lane vocabulary
   everywhere else on the page is xs/sm/default/lg — the demo paragraph, the
   DensityDemo chips/stamps (censused: xs/sm/default/lg), the TokenTable hit
   scale. The adjacent comment's "the rail trio this page documents" is also
   off (the demo cells document xs/default/lg). Softening fact: the generated
   usage output prints the VALUE (and omits default), so the code never lies —
   only the button label drifts. Fix shape: relabel 'default', or offer the
   four rungs to match the page's own measured sentence.

## Adjudication of her two family-ledger notes (both left to me)

1. **Playground density shorthand (sm/md/lg)** — adjudicated above: the label
   drift is real but cosmetic (legal values, honest code output); filed as
   NIT-1 rather than a vocabulary violation. The DensityDemo in theming shows
   the correct full vocabulary, so the playground is the lone outlier seat.
2. **`demo_tg` ×3 in the demo CardGrid** — **ACCEPTABLE AS SHIPPED, no change
   required.** The FormData concern is counterfactual: the trio has NO form
   ancestor (the page's only form is #in-a-form with `name="beta"`), so
   FormData never sees them — my submit receipt shows the terminal printing
   ONLY "beta: yes / form submitted ✓". Names-not-ids: no LAW #19 interaction
   (82/0). The form-teaching seat already demonstrates the correct distinct-name
   pattern where it matters. Optional hygiene only: `demo_tg_xs/_default/_lg`.

## Out-of-scope verification (the registry.json + payload question)

- **registry.json diff = exactly ONE hunk**: the toggle item description
  (old inline-end-posture copy → the V2 copy). No other entries touched.
- **public/r regeneration, the mechanism pinned**: root `public/r/toggle.json`
  is TRACKED and currently STALE in the working tree (mtime Sep 23 05:55,
  carries the old description) — because the vite `npm run build` does NOT
  touch public/r. The regenerator is the DEPLOY pipeline:
  `scripts/build-site.mjs` step "5/8 building registry JSON → public/r/" runs
  `shadcn build` from the repo root, which emits public/r/*.json from
  registry.json; `verify-shadcn-add-universal.mjs` likewise rebuilds its own
  payloads (it cannot go stale-false). Her claim "the built copy under public/r
  regenerates with the build" is TRUE at the deploy layer she meant; the
  working-tree staleness is expected between rounds and content-consistent
  with HEAD's registry.json. One precision note for her record: "the build"
  there means build-site.mjs, not the vite build her gate record cites.

## Gate record

- **Fresh build rc=0** (my own, dist Sep 24 06:58, sole writer; port 5243
  free before). **verify:docs rc=0** from the repo root — staged scope green;
  the 6 "toggle" strings in the log are theme-toggle/toggle-group BACKLOG
  entries (different pages) — zero lint mentions of the toggle page itself,
  independently reproduced. **Page 200** on `vite preview --port 5243`.
- **No svelte-check** — per this dispatch (Owner single-run rule; the round is
  copy + skeleton, family untouched; her round ran none either).
- NO commits, NO pushes, NO fixes — findings land by the orchestrator.
- Teardown: preview killed by PID after the report; lsof receipt below.

## Probe-fault ownership

1. verify:docs first run died "Missing script" — I ran it from apps/www; the
   gate lives at the repo root. Re-run from root passed (rc=0 above).
2. My toc probe selected `aside a[href^=#]` → zero links; the toc renders in a
   NAV. The 9-link receipt is from the corrected selector.
3. My rung finder keyed `input[data-density="default"]` and got MISSING — the
   default rung stamps NO data-density (absence-is-state, now a receipt in
   its own right). Re-keyed on the cell's label text.
4. My first form-terminal read swept all of #in-a-form and caught the canvas
   drawer's source string; the targeted read got the real terminal lines.
5. An "unlabeled input" false alarm: my census checked label[for] only — the
   19th input (the playground PlayToggle, id s10) is named via
   `aria-labelledby="jx-play-row-s8-label"`. All 19 named; no a11y finding.
6. My first served-bytes census broke on shell interpolation of the 477KB
   HTML; redone from a file — all counts above are from the file-based census.

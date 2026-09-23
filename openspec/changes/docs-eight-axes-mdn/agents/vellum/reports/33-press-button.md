# TASK 33 — CODE press-button (vellum)

Tier 2 (优化重构). Gates green. NO commits — files touched:
- `apps/www/src/routes/docs/components/press-button.html/+page.svelte` (+ `+page.ts`)
- `apps/www/src/routes/docs/components/number-input.html/+page.svelte` (step 0: error-state
  copy re-trued after the integrator's family-side cascade fix)

## Step 0 — number-input copy re-truing (the dispatch's flag)

Measured the integrated fix on the served DOM: the error specimen now computes
`border-style: dashed` + destructive border color (the unlayered attribute carve-out
`.jx-num[data-jx-num-invalid]` wins the cascade; light `--destructive` IS
oklch(0 0 0) in this theme, so black = destructive). The task-32 footnote
("authored-but-solid, atom-order cascade") was replaced with the re-trued receipt.
The api error row had claimed only the wiring — still true, left as-is.

## Tier decision — gap analysis

Tier 2, not 1: the 810-line page carried high-value machinery (schema-driven dock,
zone/anchors/async demos, the law list) but violated the archetype structurally — a
DUPLICATE `id="usage"` (invalid DOM, two sections), toc ≠ DOM (async missing from
toc, order drifted), no install/overview/see-also, no measured axes table, no
query() seat, no popovertarget/disabled api rows, and THREE spots teaching the
RETIRED external law ("hrefs not starting with / open a new tab") against the
family's codified #5 regex. Tier 2, not 3: the dock/demos are kept and re-anchored.

## What changed

1. **Structural**: added `#install`/`#overview` (press-law prose, law-notes folded)/
   `#see-also`; gave the dock canvas `#live-demo`; DELETED the duplicate `#usage`;
   reordered to install > overview > live-demo > zone > anchors > async > law >
   types > usage > theming > api > universal-props > accessibility > see-also
   (trio LAST; splice done with assert-and-read-back — the script CAUGHT my own
   wrong trio order on the first pass and I corrected before proceeding).
2. **Axes table**: 8 measured/grepped rows + receipts footnote + query() seat +
   square/flat specimens added to the universal canvas.
3. **W-next #5 truth on the page**: `popovertarget` row added to the api table
   (declared, forwarded on the button form, verified live: click opens AND toggles
   the target panel; anchors drop it by platform law; composers own aria-haspopup).
   `disabled` row added (native inert pose; anchor form maps to the loading
   contract; measured: NO authored disabled face — full paint at opacity 1).
4. **Stale external-law copy fixed in 3 places** (#anchors summary, #law bullet,
   usage drawer comment) to the #5 law: only an absolute http(s) URL is external
   (measured: `#section` → isExternal false; `/docs/components.html` → no target;
   `https://…` → `_blank` + noreferrer).
5. **A11y table rebuilt**: forced-colors per-rung receipts (link → LinkText MEASURED
   via forced-colors emulation), the disabled-paint honesty row, the popovertarget/
   haspopup composer note, the 24px floor row.
6. **Theming**: DensityDemo full 5-rung ladder (2xs→lg) added; token defaults
   corrected to the measured 5-rung values (--jx-hit 24/28/32/40/48, --jx-text
   10/11/12/13/15, --jx-inset 8/8/8/12/16).
7. **Two pre-existing latent TS errors fixed** (the page was written before the
   fleet laws): the cx `.filter(Boolean)` predicate and an undefined-call in the
   dock's onCanvasValue seam. Fleet error count dropped 1593 → 1589.

## Measurements (probe receipts, served DOM at 5242)

- **Press ladder (fill, light)**: rest `rgb(0,0,0) 1px 1px 0px 0px + white 0 0 0 1px`
  (xs); hover `2px 2px` (sm) with the body static; active `translate: 1px 1px` with
  the shadow back to the 1px anchored pair. 150ms ease-out on all pose properties.
- **Ghost none-trio**: shadow none at rest AND active while the press VECTOR remains
  (measured translate 1px 1px on an active ghost); hover bg = the 12% tonal mix.
- **Flat pose**: rest/hover shadow none, active = the engrave INSET (black 1px 1px
  inset + white −1px −1px inset — the carved light model) with translate NONE.
- **Hit geometry**: 40×40px at default; square pose measured 40.0×40.0; full ladder
  24/28/32/40/48px hits, 10/11/12/13/15px voices, 8/8/8/12/16px insets; ambient
  data-density null; the 2xs stamp = **exactly the WCAG 2.5.8 24px minimum**.
- **Radius wiring live**: the dock's concentric seat (radius-effective 20px, inset
  0.875rem) drives the button to 6px computed = max(0, 20−14); explicit radius
  medium → 8px; radius 10 + squircle → **20px superellipse(2)** (the §14 ×2 law);
  bare concentric → 0px.
- **Theme split WITHIN the ladder**: under .dark the fill re-tints to the drifted
  dark primary (oklch(0.6489 0.237 47) → oklch(0.7044 0.1872 43)) and outline's
  frame flips white, but outline/ghost LABEL INK stays oklch(0 0 0) — the
  foreground atom is a defineVars :root literal the dark scope does not re-declare.
- **Forced colors (emulated)**: link → `rgb(0,0,159)` (LinkText ✓ the law's
  citation), fill → ButtonFace bg + ButtonText ink/border.
- **popovertarget**: synthetic pair — attribute forwarded, click opens, click
  toggles closed. **External #5**: three href shapes measured as above.
- **Loading/flash**: aria-disabled=true (no disabled attr), spinner glyph present,
  jx-press class retained; after settle `data-jx-press-state="success"` + ✓ glyph.
- **Injection**: destructive = fill + jx-pair-destructive (black bg/white ink);
  success tonal = the 12% mix.
- **Cascade-kill check (the dispatch lead)**: the ladder map is collision-free by
  construction — frame contributes geometry only, every rung owns its three paint
  channels, and all STATE paint (poses, ghost/flat, injection) rides css seams or
  unlayered utilities, never conditional atoms on base-atom properties. No
  press-button instance of the number-input bug exists.
- **Grep receipts**: --jx-size-effective/--jx-motion-effective/--jx-elevation-effective
  zero readers in ui/press-button/; --jx-color-effective consumed ×3, shape ×1,
  radius ×6.

## Gates

- `verify:tailwindless` — ✓ GREEN, receipt VERBATIM: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42`.
- `verify:docs` — ✓ "all docs pages pass the skeleton lint (staged scope green)".
- `verify:docs-universal` — ✓ "GREEN: 110/110 component pages render the shared
  universal section (110 markers)".
- svelte-check page-scoped — ✓ ZERO diagnostics on
  `routes/docs/components/press-button.html/*` AND `number-input.html/*` (fleet
  1589, down 4 from my two latent-error fixes; the rest is the pre-existing
  lib-wide baseline).
- Specs post-edit, one run: **10 files / 506 passed** (ambient 284 + button-group,
  button-group-overflow, defaults-buttons, canvas-same-source,
  component-canvas-floor, carved-action-band, context-coverage, docs-nav-filter,
  docs-structure). Baselines BEFORE edits: same suites 506/506.

## Matrix

No pins exist for press-button in docs-ambient-vocabulary.matrix.json — no re-pin.
The api PropsTable stays universal/tableIndex 0; the density row keeps the
'ambient scope' vocabulary (density folds into the universal fold at runtime).

## Port discipline

lsof :5242 rc=1 before; vite wrapper 58847 / listener 58879 captured to
/tmp/vellum-33-vite.pid; killed by PID at teardown; lsof rc=1 and
`pgrep -lf "vite --port 5242"` empty after. Probes in /tmp (vellum-33-*).
NO commits. Siblings (scribe's kbd review, quill's menubar review, marginalia's
popconfirm review) untouched.

## Open questions for the reviewers

1. **No authored disabled face**: a disabled press-button keeps full paint
   (measured opacity 1, full fill) — the platform gives disabled buttons no visual
   mute in this theme. Is an authored disabled face wanted family-side, or is the
   docs honesty row (now shipped) the settled treatment?
2. **The frozen outline/ghost label ink under .dark**: dark-mode outline/ghost
   buttons keep oklch(0 0 0) ink on a dark canvas (the defineVars foreground
   literal is not re-declared by the dark scope). Same family of seam as the
   menubar open-pose finding. Family fix (add --jx-foreground to the dark
   re-declaration or stamp tokenScope) vs docs-only honesty — the page currently
   documents the split as measured.
3. **`square` docstring drift**: the family comment says "size-10.5 (42px) frame"
   but the atom is `min-width: var(--jx-hit)` (40px at default, measured). Family
   comment is stale — flag for the next family-touch task (docs page cites the
   measured hit-channel value only).
4. **W-next #5 disposition**: popovertarget is NOT dropped — declared, forwarded,
   live-verified on this page. If the W-next entry was written against an older
   revision, it can close; if it targets something deeper (e.g. the docs omission I
   just fixed), the new api row + overview paragraph close the docs side.

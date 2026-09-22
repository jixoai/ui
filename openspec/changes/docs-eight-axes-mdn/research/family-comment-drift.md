# Family-comment drift ledger (orchestrator-maintained; post-campaign cleanup batch)

Found by the campaign's doc work — family SOURCE comments contradicting code/CSS.
Doc pages must document the CODE's truth and cite the census; these comments get
fixed in one cleanup batch AFTER the campaign (family files are out of doc scope).

1. blockquote `ruleSize` doc-comment says own `1`; code owns `4` (quill, task 1).
2. blockquote `blockquote.stylex.ts` header calls `--jx-space-14` MISSING; it exists (quill, task 1).
3. accordion `accordion-defaults.svelte.ts` (+ `size` prop comment) claims "a number moves summary + body"; the family CSS reads rem vars — size paints nothing there (marginalia, task 1).
4. alert family comment claims "size moves title/body"; the atoms are rem-anchored — only the root font-size moves (vellum, task 1: live-measured, source-read wrong).
5. anchor.svelte JSDoc claims size moves what density actually moves — the wrong artifact vs the rem-based channels (quill review of anchor; page fixed by scribe, family comment left).
6. checkbox.svelte `size` comment claims "CONSUMED by the family" — live-probed FALSE: the number lane is inert through the real carrier path (box/lane/label byte-identical at coefficient 1.5; channels declared at :root + rung scopes, substitution runs at the declaring element) — ledger #3/#4/#5 class (scribe, task 8: source-read wrong, measurement-first overturned it).

6. avatar.svelte:249 `onerror={handleError}` EventHandler typing error + :191 `Object.entries(style)` undefined-guard miss (both W3 batch B @4a96996f, pre-page; no runtime failure; scribe's avatar review) + :146 provideUniversalLanes non-reactive capture warning (probe says the number-lane seam works; owner to confirm deliberate).

## W-next protocol findings (escalated to Owner at campaign close)
1. SEMANTIC-INK DARK GAP (both anchor reviewers, independently measured): a plain `.dark` on a component root flips the RAW token layer but never re-substitutes the `--jx-*` semantic inks (declared only at :root + stylex theme scopes) — the same :root-substitution disease W6 fixed for fill/tonal/outline in press-button.css, never fleet-wide for semantic ink. Pages must document theme as supply-side until the protocol pass.
2. THEME-SPLIT REFINEMENT (vellum's alert re-probe, 11/11 ×2): the .dark gap is NOT binary. Vars declared in jixoai.css's `:root,.jx-light,.dark` slot blocks DO re-theme at a component .dark (alert's --jx-tonal measured flip); the frozen layer is precisely the stylex defineVars emission (`:root, .xbpgcew` + theme classes — never plain .dark). PAGE LAW: one grep (which selector list declares each voice) decides the wording — name WHICH voices flip vs stay, per family.
3. TOKENTABLE DEAD TEXT COLUMN (marginalia's cascader review, SSR-proven): TokenTable accepts a `description` per row but never renders it, and `sourceLabel('structural')` returns '' — every fixed-paint table shows an empty Source cell. Pages must put facts in the Default column (badge's ladder does); the component gains a real description column or drops the dead field in the W-next pass.
4. DEV CSSOM TRANSIENT INFIDELITY (vellum's avatar task, observed twice): mid-injection dev CSSOM inlines raw chains — a `.dark` island transiently flipped a `--jx-*` border, then stabilized to the built frozen semantics. Stable dev + dist agree; TRANSIENT states can make theme probes and dev dark previews lie. Kernel/dev-runtime investigation for the W-next pass.

# Family-comment drift ledger (orchestrator-maintained; post-campaign cleanup batch)

Found by the campaign's doc work — family SOURCE comments contradicting code/CSS.
Doc pages must document the CODE's truth and cite the census; these comments get
fixed in one cleanup batch AFTER the campaign (family files are out of doc scope).

1. blockquote `ruleSize` doc-comment says own `1`; code owns `4` (quill, task 1).
2. blockquote `blockquote.stylex.ts` header calls `--jx-space-14` MISSING; it exists (quill, task 1).
3. accordion `accordion-defaults.svelte.ts` (+ `size` prop comment) claims "a number moves summary + body"; the family CSS reads rem vars — size paints nothing there (marginalia, task 1).

# Review r1 — Codex (gpt-5.6-terra, xhigh), 2026-09-06

VERDICT: **NEEDS_CHANGES** — 10 blockers, 10 questions, 10 suggestions
(full text: /tmp/markdown-doc-review-verdict.md, archived below in the
change record at archive time). Dispositions:

| # | Blocker | Disposition |
| --- | --- | --- |
| B1 | append-only contract unclosed (replace/shorten/rollback/switch) | adapter state machine idle→streaming→final + non-append detection → fresh md instance, deterministic reset, fixtures (design §2.1, tasks 1.2/1.4) |
| B2 | tail type transitions vs L2/L3 conflict | tail key gains type discriminator `${index}:${type}:tail`; laws reworded to govern the KEYED ITEM, not inner subtrees (design §2.2) |
| B3 | SSR/hydration proof insufficient | the snapshot law: pure function of (source, streaming), same props ⇒ same parse ⇒ same keys; real renderToHtml-vs-mount test (design §2.3, tasks 2.5) |
| B4 | security doesn't cover override seam | override = trusted application code (react-markdown model), documented boundary + default-map negative tests (design §3.3) |
| B5 | registryDependencies closure imprecise | direct-import graph table; transitive needs resolve through the dependency items themselves; clean-consumer probe proves closure (design §5, tasks 3.1/3.4) |
| B6 | tasks missing mirror-manifest/prerender/catalog/docs fixtures | tasks 3.2/3.6 added explicitly |
| B7 | search-corpus delta has no implementation task | tasks §5: harvester kind registry + marker-over-heuristic + fixture + baseline regen |
| B8 | table wrapper DOM contract unspecified | div[data-kind=table] harvest carrier, semantically neutral, no paint; div>figure valid (design §3.4) |
| B9 | CSS header + hook naming laws not locked | markdown.css standard header comment; data-jx-markdown-streaming stamp (hook-law arbitrates); tasks 2.4/3.5 |
| B10 | dependency evidence + factory defaults | factory defaults enumerated and ALL overridden explicitly (probe-verified); version policy + bump-rerun guard (design §1.1, tasks 1.5) |

Questions 1–10 dispositions folded into design §§2–5 (append-reset,
type-keyed tail, streaming default false = static doc + snapshot law,
override trust boundary, wrapper decision, linkify deliberate, full
vocabulary table + unknown-node text-only rule, data: images omitted,
direct-edge declaration, full docs page this change).

# Review r2 — Codex (gpt-5.6-terra, xhigh), 2026-09-06

VERDICT: **NEEDS_CHANGES** — 2 still-blocked + 6 new issues.
Dispositions (all applied):

| # | finding | disposition |
| --- | --- | --- |
| B2' | raw-only hash misses reference-definition child mutations; "exactly once" overclaim | digest = fnv1a over canonical node serialization (children recursive); L3 reworded to bounded remounts (one per semantic event, ≤2 total) — design §2.2, delta, tasks 1.3/1.4 |
| B10' | package module-global registerMarkdownPlugin not isolated | creation-time guard: instance's stamped global-count ≠ 0 → clearRegisteredMarkdownPlugins() + recreate; plugins out of contract — design §1.1, delta |
| N1 | `table` kind already exists (spec + KIND_TABLE fallback) | delta rewritten as declared-marker precedence; no enum/schema edit; tasks §5 corrected |
| N2 | data: image policy too broad (bitmap data URLs ARE allowed by sanitizer) | policy: sanitizer's own allowlist — bitmap data URLs render, SVG/other → img omitted — design §3.2/§4 |
| N3 | definition_list (native dl) vs tasks "degradation"; second checkbox variant unaddressed | both checkbox variants → disabled native input; definition_list native mapping in tasks 2.2 |
| N4 | apps/www package.json/lockfile not a task | tasks 3.0 added (dep rides the same commit, clean-checkout asserted) |
| N5 | proposal "zero innerHTML anywhere" vs override trust boundary | proposal wording qualified to the DEFAULT renderer |
| N6 | hook name left to verify arbitration | `data-jx-markdown-streaming` frozen at spec level (delta), fixture in tasks |

# Review r3 — Codex (gpt-5.6-terra, xhigh), 2026-09-06

VERDICT: **NEEDS_CHANGES** — 2 still-blocked + 2 new (12 items verified
closed). Dispositions (all applied):

| # | finding | disposition |
| --- | --- | --- |
| B2''a | fence scenario "exactly once" contradicts L2/L3 (fence-close while tail = NO remount) | scenario rewritten to bounded key transition; L2 explicitly covers fence-close-while-tail; fixture added (tasks 1.4) |
| B2''b | canonical serialization not implementable; field enumeration unmaintainable | digest = fnv1a36(stableStringify(node)): key-sorted recursive canonical JSON, undefined dropped, sourceMap excluded — unknown/future fields covered BY CONSTRUCTION; versioned digest-v1 + golden fixtures (design §2.2, tasks 1.3/1.4) |
| B10'' | clear+recreate harms process-shared state; private-field dependency | REVERSED to trusted-process-boundary ruling (Codex's own option 3): never mutate the global registry; detection-only dev warn (optional-chained, non-contractual); creation-time-only application = existing instances immune (dist-verified); negative test |
| N1' | "EVERY axis" overclaim; enableFixIndentedCodeBlock/breaks unpinned | pinned-axes TABLE (9 axes incl. breaks:false, fixIndentedCodeBlock:true, customHtmlTags:none) + out-of-contract ruling for the rest; vocabulary matrix catches drift (design §1.1) |
| N2' | streaming default + idle→final branch unfrozen | streaming defaults FALSE; final = !streaming per parse (static first parse = final semantics); false→true restart on extending source resumes same instance; fixtures for all three initial modes (design §2.1, tasks 1.2/1.4) |

# Review r4 — Codex (gpt-5.6-terra, xhigh), 2026-09-06

VERDICT: **NEEDS_CHANGES** — r3 blockers ALL CLOSED; 4 new consistency
issues. Dispositions (all applied):

| # | finding | disposition |
| --- | --- | --- |
| N1 | proposal "ONLY the trailing block" contradicts the L1 reference-definition exception | proposal reworded: trailing-only + the digest exception named inline |
| N2 | pinned table missed streamTailLocalPostBlockRules (factory force-true, streaming-relevant); maxNesting/chunk axes unaccounted | streamTailLocalPostBlockRules pinned `true` explicit + cache/tail fixture; "accounted-but-unpinned" section disposes maxNesting (default 20, vocabulary-fixture-bounded) and perf strategies (output-neutral by parser contract, golden digests catch drift) — design §1.1 |
| N3 | ambient plugin suspends URL security too (probe: validateLink override → javascript: hrefs in link nodes) | suspension declared TOTAL (vocabulary + parser-level URL security; renderer laws always stand) in design §1.1/§4, proposal, delta; negative test asserts the warn text states both suspensions |
| N4 | digest hash end not normative (width/encoding/wraparound/base/sourceMap recursion) | fnv1a36 fully specified: FNV-1a 32-bit (basis 2166136261, prime 16777619), UTF-8 bytes, mod 2³² unsigned (>>>0), lowercase base-36; sourceMap excluded RECURSIVELY; public vectors (empty/paragraph/table) — design §2.2, tasks 1.4 |

# Review r5 — Codex (gpt-5.6-terra, xhigh), 2026-09-06

VERDICT: **NEEDS_CHANGES** — r4 items ALL closed; ONE new factual issue.
Disposition (applied):

| # | finding | disposition |
| --- | --- | --- |
| N1' | maxNesting stated as default 20 — the installed markdown-it-ts dist's runtime default is 100 (probe-verified after review) | moved from accounted-unpinned INTO the pinned table: `maxNesting: 100` explicit pin + deep-nesting fixture (design §1.1, tasks 1.4); subagent A briefed mid-flight |

# Review r6 — Codex (gpt-5.6-terra, xhigh), 2026-09-06

VERDICT: **APPROVE** — the change docs gate is PASSED (6 rounds:
r1 10 blockers → r2 2+6 → r3 2+2 → r4 0+4 → r5 0+1 → r6 APPROVE).
Implementation proceeds under these frozen contracts.

# Integration amendment (2026-09-07, post-r6 APPROVE)

One implementation-driven deviation, recorded honestly for the final
review: the r6-approved root form mounted `.jx-pure` AND imported
`$lib/jx-pure.css`. On the site build that import emitted a SECOND
full copy of the face (entry chunk 243 `:where(.jx-pure)` rules +
component chunk 232) and failed the B-face budget gate (13090 → 14056
vs threshold 13745). Amendment: the import is removed; the face rides
its OWN consumption law (class mount + one site-css import — app.css
on www, the documented site-css import for registry consumers;
@jixoai/jx-pure stays the declared dependency that installs the
sheet, the same structured-prerequisite shape as @jixoai/jixoai-theme).
design.md §3.4/§5 and the spec delta carry the amended wording.

# Final review — Codex md-final-reviewer (gpt-5.6-terra, xhigh), 2026-09-07

**SCORE 9.0/10 — BLOCKERS: NONE.** Both post-r6 deviations ruled JUST
(face import removal: necessary, B-face 13368/13745 after; verify-deps
prerequisite extension: consistent with the script's own documented
rule). Deductions were verification-depth only. Minors disposition:

| # | minor | disposition |
| --- | --- | --- |
| 1 | SSR test was source-guard only | REAL renderToHtml pair: node-env markdown-ssr.spec.ts (server frames via svelte/server) + client mount running the SAME assertMarkdownDocShape (test/helpers/markdown-doc-shape.ts) — one assertion path, two runtimes; setup.ts gained an environment gate (jsdom polyfills skip in node env) |
| 2 | no markdown harvest fixture | test/search-corpus.spec.ts grows the declared-marker describe: REAL component mount → div[data-kind=table] harvests ONCE (inner <table> never double-counts), fence → code {lang:ts} through CodeCard's marker chain |
| 3 | security matrix incomplete | probe-verified variants locked: scheme casings/whitespace/data:, protocol-relative (this lib DEMOTES them — stricter than markdown-it default), newline-broken scheme (no executable href ever), unclosed tags, html comments |
| 4 | markdown.css stale comment | fixed + mirror + manifest |
| 5 | workspace pollution (69 SVG rewrites + lockfile drift) | reverted; probe-family test failures baseline-matched against the main checkout (38 identical pre-existing, ghostty wasm environment) |
| 6 | hook-law pre-existing debt / shadcn-add re-run timeout | upstream debts in followups.md; the official verify:all run carries the shadcn-add proof (6 cases GREEN) |

Final state: verify:all GREEN end-to-end; suite 2217 passed / 38
pre-existing probe failures (main-baseline identical).

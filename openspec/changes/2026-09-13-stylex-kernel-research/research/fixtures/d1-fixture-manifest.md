# D1 fixture manifest — mechanically decidable, StyleX-install-free

> Frozen at design time (2026-09-13, Gate-1 r3). Every row: id / setup
> / probe / PASS criterion / media state / mode. A row FAILS only on
> its stated criterion; limitations (runtimes unavailable) are recorded
> as LIMITATION, never as pass. No numeric value is decided at
> execution time.

## Version pin set (npm registry, queried 2026-09-13)

| package | pinned |
|---|---|
| svelte | 5.57.0 |
| @sveltejs/kit | 2.70.3 |
| vite | 8.3.0 |
| @stylexjs/stylex | 0.19.0 |
| @stylexjs/unplugin | 0.19.0 |
| @stylexjs/babel-plugin | 0.19.0 |
| tailwindcss (coexist side) | 4.3.3 |
| @tailwindcss/vite (coexist side) | 4.3.3 |

The D1 verdict is scoped to EXACTLY this set. Any version bump (even
patch) re-opens D1 with a ledger entry. Spikes' package.json pins are
copies of this table; `npm ls` output is part of the spike receipt.

## Fixtures

| id | setup | probe | PASS | media | mode |
|---|---|---|---|---|---|
| D1-01 | spike/minimal dev server | wait ≤2s for `style[data-stylex]`; read probe el computed bg | style tag EXISTS ∧ computed bg == authored value | screen | dev |
| D1-02 | D1-01 + websocket attached | edit one stylex.create value (file write) | computed style updates ≤3s ∧ `performance.getEntriesByType('navigation').length === 1` (no full reload) | screen | dev |
| D1-03 | FRESH NAVIGATION per measurement (not the D1-01 page — an already-waited page would MISS the insertion event): observer installed via `addInitScript` BEFORE document parsing (dev); prod uses resource timing. style-ready is DEFINED: prod = max(responseEnd) over the page's render-blocking `<link rel=stylesheet>` entries; dev = performance.now() at the MutationObserver insertion of `style[data-stylex]` | style-ready timestamp vs FCP (= paint entry startTime). style_ready missing/never observed ⇒ FAIL | PASS ⟺ style_ready ≤ FCP_start. If style_ready > FCP_start: gap ≤ 100ms → SOFT-FAIL (counts as FAIL, flagged for Owner overrule via ledger); gap > 100ms → hard FAIL. Records kept regardless: navigationStart, observer-install ts, insertion ts, FCP startTime, resource timing, probe's settled computed bg | screen | dev+prod |
| D1-04 | spike/ssg `vite build` output HTML | grep prerendered HTML for the class constant extracted from built CSS | class attr present in HTML == compiled constant (string equal) | screen | prod |
| D1-05 | built page, JS ON | probe el computed style ∧ ∃ `<link rel=stylesheet>` whose bytes contain the class rule | computed == authored ∧ link rule exists | screen | prod |
| D1-06 | dev AND prod loads with hydration | capture console | ZERO messages matching /hydrat\|mismatch/i ∧ `data-style-src` attrs present after hydrate | screen | dev+prod |
| D1-07 | built page, `javascriptEnabled:false` | probe el computed style (stylesheet-only render) | computed == authored | screen | prod,no-JS |
| D1-08 | component whose style value derives from `$state` | toggle state; read computed width + inline-style presence | computed width follows BOTH states; whether via class swap or inline style recorded; zero console errors | screen | dev+prod |
| D1-09 | :hover el + keyframes el | force :hover; read animationName + currentTime twice 100ms apart | hover computed change ∧ animationName set ∧ currentTime advances; dev value == prod value | screen | dev+prod |
| D1-10 | root toggleable `.dark` + `[data-density]` | flip both; read token-derived color + spacing | color follows dark token ∧ spacing follows density rung in the SAME frame batch | screen | dev+prod |
| D1-11 | three emulations | reduced-motion: animationName→none; forced-colors: the D2-12 FROZEN pair (appearance: auto + background-image: none on the real Part C selectors, jx-pure.css:2255-2269), parity with the TW-only control build; print: the D2-04 print-whitelist probe passes | all three PASS against their stated criteria | rm/fc/print | prod |
| D1-12 | tsc/svelte-check on a deliberately bogus token ref (typo'd var key) | compile exit code | compile FAILS naming the token (typo = compile error); valid file compiles clean | — | build |
| D1-13 | full matrix on Chromium; smoke subset {D1-01,D1-04,D1-05,D1-09} on WebKit + Firefox | run subset | Chromium: all green. WebKit/Firefox: subset green or LIMITATION row with the runtime error verbatim | screen | dev+prod |

## Failure semantics

Any mandatory row failing ⇒ D1 FAIL (no aggregation, no averaging).
A LIMITATION row does not fail D1 but MUST appear in decision.md's
missing-data flags (design §4 missing-data rule counts it).

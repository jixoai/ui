# Design: the StyleX kernel research program

> Orthogonal intents: (1) concretize the Owner's perf/redundancy
> complaints into measurable claims; (2) pre-register the decision
> framework BEFORE evidence lands (bias control); (3) define the
> research lanes, spikes, and orchestration; (4) fix the evidence
> standard every finding must meet. Owner input 2026-09-13: "彻底放弃
> 对 Tailwind CSS 的依赖，改成用 stylex……不排除开发者自己搭配
> Tailwind……我们自己的内核和 stylex 做集成".

## §1 Problem statement, concretized

### 1.1 The performance claim to test

"Tailwind 对整个 CSS 的渲染性能带来很大的困难" decomposes into four
falsifiable sub-claims (R2 measures each; R5 re-measures under StyleX):

| # | sub-claim | measurable proxy |
|---|---|---|
| P1 | one monolithic render-blocking sheet | built CSS bytes + rule count per origin; whether ALL pages load ALL css |
| P2 | sheet content is mostly irrelevant to any given page | per-page USED-selector ratio (devtools coverage-style sampling on representative pages) |
| P3 | dev-loop cost (TW4 scanning/generate) | dev cold-start + HMR timings, www scale |
| P4 | style-recalc/dynamic-class cost | rule count × mutation surface (heuristic; honest label: proxy only) |

The NULL HYPOTHESIS must be priced equally: the same four proxies under
"stay on TW4 + targeted fixes" (sheet splitting per route family,
pruning the docs-page utility surface from the kernel sheet, etc.).
An engine swap is only justified if the gap the swap closes is real
AND not closable in place.

### 1.2 The redundancy claim (already evidenced by the R0 census)

Three token channels + one deliberate dual supply:

```
            intent: "primary color at density sm"
  ┌──────────────────────────────────────────────────────────┐
  │ (a) TW4 @theme inline → text-primary / bg-muted utilities │
  │ (b) context → --jx-text/--jx-inset vars → arbitrary-value │
  │     utilities  px-[var(--jx-inset)]  (press-button:449)   │
  │ (c) css-laws vocab  .jx-html-* / Tier-2 unlayered aliases │
  │ (d) icon dual supply: virtual:jixoai-icons.css ≡ jx-pure  │
  │     icon-vocab slot (byte-identical, by construction)     │
  └──────────────────────────────────────────────────────────┘
```

The research question is NOT "can StyleX express our tokens" but
"which channels COLLAPSE". A design that keeps (b)+(c) untouched and
adds StyleX as channel (e) fails the motivation outright.

### 1.3 The kernel boundary (research scope)

IN: `registry/files/ui/**` (106 ui items, 94 TW-bearing files,
2191 utility tokens), `registry/files/lib/**` (context-plugin,
defaults axes, utils/cn), the theme sheet authoring surface
(jixoai.css `@theme` region), `packages/vite-plugin` (as a
distribution vehicle to STUDY), registry.json metadata edges.

OUT: www docs routes (site surface, 13k+ tokens — stays Tailwind and
doubles as the coexistence proof), `packages/css-laws` generated
sheets (pure CSS, cascade-contract only — studied, not changed),
betlang-wasm, cli/, the alpha-track inline-style lane
(layout-family law is a separate posture by design).

## §2 Research questions

- **RQ1 Toolchain feasibility** — StyleX WITHOUT React in Svelte 5 +
  Vite 8 + SvelteKit adapter-static: which transform path compiles
  `stylex.create()` in .ts/.svelte context (babel-plugin via which
  vite integration; unplugin wrappers; what the Svelte compiler
  tolerates); dev-mode style injection; PROD css delivery for SSG
  (runtime injection vs prerender-time extraction vs static bundle);
  class-name determinism when the SAME source is compiled by the
  kernel build and by a consumer build.
- **RQ2 Cascade & the override law** — consumer TW utilities MUST beat
  kernel StyleX paint; the three css-architecture exceptions (Tier-2
  unlayered, state-machine carve-out, surface-kernel override) must
  keep their semantics; StyleX insertion/layer options vs TW4's
  `@layer theme, base, components, utilities`; print whitelist and
  forced-colors behavior under the new engine.
- **RQ3 Theming & context fusion** — StyleX `defineVars`/`createTheme`
  vs the OKLCH var sheet: can stylex values reference existing custom
  properties (`var(--primary)` legality); `.dark` scope, `[data-density]`
  scopes, runtime hue (`--brand-hue` written at runtime); does the
  fusion SHRINK the channel count (1.2) — the acceptance bar.
- **RQ4 Distribution model** — shadcn-add consumers copy SOURCE.
  Today's prereq: TW4 + @tailwindcss/vite + entry css
  (check-tw4-prereq). Tomorrow's prereq under each candidate
  architecture (A: consumer runs StyleX toolchain directly; B:
  @jixoai/ui-vite-plugin absorbs the transform; C: kernel ships
  pre-compiled css + plain class strings). Install weight, config
  surface, failure modes for each; registry.json dependency edges
  (utils item, theme item) under each.
- **RQ5 Performance evidence** — R2 baselines vs spike measurements:
  critical CSS per representative page, total shipped CSS, dev-loop
  timings, FOUC behavior in dev and SSG output. Includes the null
  hypothesis (1.1).
- **RQ6 Migration scope & cost** — per-family census (variant tables,
  cn() call sites, arbitrary-value carriers, forced-colors branches,
  WAAPI/floating-surface/print couplings); effort model; the blast
  radius on verify gates (tw4-prereq, hook-law, context-coverage,
  mirror, standards).
- **RQ7 Alternatives** — the slot is "compile-time, (near-)zero
  runtime, Svelte-5-native, atomic, Tailwind-coexistent". Rank:
  null-hypothesis (TW4 + fixes), UnoCSS, Panda CSS, vanilla-extract,
  PigmentCSS, Linaria, style9. Only depth on the top 2 fallbacks —
  enough to know what we'd do if StyleX fails a hard gate.

## §3 Method per lane

- **L1 external intel** (general-purpose subagent, web): StyleX
  state-of-art dossier; 10 fixed question areas (versions/maintenance,
  framework-agnosticism boundary, Vite path, Svelte precedents,
  SSR/SSG, theming, cascade/layers, performance data, capability
  gaps: keyframes/pseudos/container-queries/variants/RTL/TS,
  production adoption). Evidence standard: every claim a URL; unknown
  = "未查到", never silence.
- **L2 repo baseline** (general-purpose subagent, local): P1–P4
  measurements on a real www build (main checkout, process-reclaim
  discipline); sheet attribution by origin (TW utilities vs jixoai.css
  vs jx-pure.css vs folder css vs site modules); per-page used-ratio
  sampling on 3 representative pages; dev cold-start/HMR timings; R6
  census tables. Output: numbers + reproduction commands, committed
  as `baseline.md`.
- **L3 spike lab** (general-purpose subagent, local): three committed
  scratch projects under `spike/` (pinned manifests, NO node_modules,
  NO dist committed):
  - `spike/minimal` — Svelte 5 + Vite 8 + StyleX, no React. Prove:
    transform path, dev injection, prod output shape, TS types.
  - `spike/coexist` — TW4 + StyleX one app; the override-law probes:
    (i) consumer TW utility beats kernel stylex paint; (ii) unlayered
    Tier-2 vocabulary still wins; (iii) state-machine carve-out
    semantics; (iv) print whitelist wins under print media. Each probe
    = a real-browser check (computed styles), screenshot optional,
    numbers mandatory.
  - `spike/ssg` — SvelteKit adapter-static + StyleX: the prod CSS
    delivery path that RQ1 names; measure delivered bytes per page.
  - Stretch (only if L1 names a viable path): a 3-component kernel
    excerpt (press-button's variant table, one css-law face, one
    context-driven density consumer) re-authored in StyleX inside the
    spike — the ergonomics reality-check.
- **L4 synthesis** (main agent): decision matrix, GO/NO-GO, report,
  follow-up-change blueprint if GO.

## §4 Decision framework (pre-registered)

HARD GATES — any fail ⇒ NO-GO for StyleX (the fallback ranking from
RQ7 takes over):

- **D1 feasibility**: spike/minimal + spike/ssg produce correct
  styling in Svelte 5 + Vite 8 + adapter-static with a toolchain a
  consumer can install from npm TODAY (no forked StyleX).
- **D2 override law**: spike/coexist passes ALL four probes (i)–(iv).
- **D3 distribution**: the consumer prereq under the chosen
  architecture is not heavier than today's TW4 prereq (install
  surface, config lines, build-time cost — L1+L3 evidence).

SCORED (0–5 each, weights noted in the final matrix):

- **D4 measured perf**: critical-CSS bytes per page, total sheet,
  dev-loop time — vs BOTH baseline and null-hypothesis pricing (w×3).
- **D5 authoring ergonomics**: variants, pseudos, keyframes, container
  queries, conditional/dynamic values, TS experience, debug class
  names (w×2).
- **D6 ecosystem risk**: StyleX maintenance health, Svelte-support
  ownership (if WE own the adapter, that's debt we pay — price it)
  (w×2).
- **D7 migration cost**: R6 census × risk register (w×1).

NO-GO outputs: the fallback recommendation + what WOULD have to change
for a revisit. GO outputs: follow-up change blueprint + channel-
collapse design.

## §5 Orchestration (remix)

```
Main (ZCode)          L1 intel (web)      L2 baseline (local)   L3 spike (local)
  │ change docs ─────────────────────────────────────────────────────▶ Codex
  │ ◀── gate 1: change-doc review (herdr, async callback) ────────────┘
  ├─ launch L1 (already in flight at doc time), L2, L3 ──▶ subagents
  │        (L2 ∥ L3 parallel; L1 informs L3's transform choice)
  ├─ integrate; cross-check subagent claims vs diffs/artifacts
  │ ◀── gate 2: dossier review (herdr, async callback) ─────────────▶ Codex
  ├─ iterate until score/verdict stable
  └─ archive + blueprint + commit
```

Subagent feedback protocol applies: every subagent reports friction
with its brief; the orchestrator cross-checks claims against artifacts
before accepting (the vision-hallucination law: no judgment from
unreadable evidence; every probe result is a computed-style number).

## §6 Risks & biases (declared upfront)

- **React-shaped evidence**: StyleX docs/benchmarks assume React.
  Every claim must be re-grounded in OUR Svelte spike, never quoted
  from React benchmarks as proof.
- **Hype asymmetry**: atomic-CSS marketing numbers vs our ACTUAL sheet
  composition (much of our sheet is laws/tokens, not utilities — the
  swap only moves the utility slice; 1.1 attribution decides how big
  that slice is).
- **Sunk-cost drift**: the pre-registered gates (§4) bind; criteria
  are not renegotiated after evidence arrives. Amendments require a
  logged reason in the decision doc.
- **Spike naivety**: a 3-file spike proving "it works" ≠ 106-item
  kernel reality; D5/D7 price the gap explicitly.
- **Cognitive bias check**: the Owner WANTS StyleX; the research owes
  the null hypothesis equal rigor, or the decision is theater.

## §7 Evidence standard

1. External facts: URL + quote ≤ 2 lines, dated.
2. Repo numbers: command + full output line, reproducible from repo
   root.
3. Spike results: computed-style assertions (getComputedStyle), pixel
   screenshots only as secondary corroboration; every screenshot
   preceded by a non-triviality check (the black-image law).
4. Unknowns are WRITTEN as unknowns; inference chains are labeled.

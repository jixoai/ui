# TASK 37 — REVIEW reference (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (1st reviewer; reviewer #2 after — independence law held: quill's
  report 28 NOT read; every receipt derived from the page + family source + live probes)
- **Target**: quill's page integrated at `6ab74431` — `reference.html/+page.svelte` (425 lines)
  + the NEW `+page.ts` (8-entry toc) + the family (`reference/reference.svelte` 197 lines,
  `reference-defaults.svelte.ts`, `index.ts`). Zero drift since integration: no commits and no
  uncommitted changes touch any reference path (the tree's in-flight set — scroll-virtual,
  progress — belongs to siblings; untouched).
- **Method**: source reads (page, family, defaults, SectionCard's numbering/registration
  block), vocabulary/channel greps, live probes (settled hydration, real .dark island
  injection with restore, breakpoint-disciplined query()), SSR byte parse, console-warn
  capture, family solos + ambient + docs-universal + fleet svelte-check.
- **VERDICT: PASS (1 MINOR + 2 LOW, no MAJOR)** — the inheritance pole verified digit-exact in
  both contexts, stamps and the edge machine verified live, the mechanism attribution TRUE;
  one demo posture doesn't reproduce (the bare-title fallback), one dispatched count is stale.

## The claims — verified

1. **The inheritance pole — VERIFIED in both contexts, digit-exact.** Ambient: the reference
   anchor computes **13.5px inside a 13.5px prose context** (`rt.text135`), carries NO style
   stamp at all (density auto → `carriers` empty → `rootStyle` undefined — the "auto stamps
   nothing" law at the byte level), and its color equals the context's (`a { color: inherit }`
   — the preflight law). Stamped: the `size={18}` anchor computes **18px inside a 16px
   context** with the §11 stamp verbatim on the root (`--jx-size-effective: 18px; font-size:
   var(--jx-size-effective, 1rem)`). Grep receipt holds: the family declares NO fontSize
   anywhere (the only hits are doc comments) and ships NO css/atoms file (3 files in the
   family dir).
2. **Density = STAMP-ONLY — VERIFIED.** `density="small"` lands **`data-density="sm"`** on the
   root + the `--jx-density-coefficient: 1` carrier; the anchor's voice stays the context's
   (**16px unchanged** — reads no kernel channel). The stamp's scope matters only for what
   children hatch — exactly the page's row text.
3. **Theme = BRIDGE-ONLY, mechanism attribution TRUE.** Injected a real `.dark` island around
   a live reference (restored after): computed color **oklch(0 0 0) both sides**, ground
   transparent both sides — the island moved nothing. The attribution is right and is the
   FROZEN-FAMILY mechanism "nothing-declares" (the family ships no css at all, so the
   class:dark bridge has no rule to activate; "nothing-reads" is the trivially-true supply
   counterpart — zero var readers). The bridge itself lands (source :189/:193 carry
   `class:dark`); the preflight's `a { color: inherit }` chains from OUTSIDE any scope.
   Cascade-passive by contract, verified.
4. **The edge machine — VERIFIED live, one dispatched count STALE.** Resolved anchors carry
   `href="#id"` + `data-ref-to`; the matrix labels reproduce **"Eq (1.1)"** (figure) and
   **"§ 1.1"** (numbered section) — the bare-title form does NOT reproduce (see the MINOR).
   The settled-missing instance degrades to the loud **`<span>??(eq-never)</span>`** with
   href **null** and data-ref-to **null** (edge RELEASED), and the console.warn fired after
   settle for both missing ids (eq-nope, eq-never — not dev-gated). SSR: the dispatched "5
   prerendered data-ref-to edge claims" is stale — measured **11** (demo 4 + postures 2 +
   axes 4 + query 1), each rendering the `??(to)` fallback anchor with its edge claim
   (11 `??(` fallbacks in the served bytes, zero resolved labels in SSR — the whole static
   pass is pre-settle, exactly the two-pass harvester contract). The contract holds; the
   count outgrew the claim.
5. **The numbered-domain rig — VERIFIED with one posture gap.** Every reference in the rig
   resolves post-fix (the only ?? renderers are the two deliberately-missing ids, loudly). The
   rig's shape (NumberingProvider → numbered SectionCard → Figures/Sections/References) is
   the working registration shape. The gap: the demo's THIRD posture — the "unnumbered"
   section — actually renders **"§ 1.2"**, because an undeclared SectionCard inside a numbered
   domain JOINS it and numbers by structure (SectionCard :236-254). Attribution below.
6. **Supply-only — VERIFIED.** Zero carrier readers in the family (no css surface exists —
   dir listing + grep); the anchor's ink is the preflight's `a { color: inherit }` (measured:
   anchor color == parent p color in every panel); `size={query({md:18}, 13.5)}` → **18px at
   1440**, **13.5px at 700** (below the 48rem key), fresh-load pin at 700 → 13.5px, resize
   back → 18px. Breakpoint discipline satisfied both directions.
7. **Chrome/structure — VERIFIED**: toc **8/8** served order==DOM (overview, reference-demo,
   law, types, usage, api, axes, accessibility; install/see-also out); h1 ×1; universal marker
   ×1; install/see-also markers present; 0 literal undefined/null text nodes.

## quill's two open questions — adjudicated

**(a) Bare-Figure degrade — page-side honesty: ACCEPTED, with one optional line.** The page
defines the referenceable set positively (api row: "referenceable targets are numbered Figures
and Sections"), demos the loud missing posture, and the failure mode is VISIBLE by design (the
?? marker renders in production — the system's own feedback teaches the author). The living
spec carries the R4 deferral. Optional upgrade for reviewer #2: one sentence in the law or
types section — "a Figure outside any numbering domain renders but registers no target; its
references degrade loudly" — would document the exact authoring trap the rig discovery
exposed. Not blocking.

**(b) The rest-less interface (no class, no rest spread) — ACCEPTED as the declared exception.**
Grounds: the two-state DOM contract is P1-3 FROZEN (native fragment anchor or loud span); the
inheritance-pole story DEPENDS on the anchor declaring nothing — a class lane would
reintroduce a paint surface the family deliberately lacks; the children escape hatch covers
the authoring-voice need; a citation never needs target/rel/download. Cost ledgered: consumers
cannot forward aria-label/aria-describedby or data-* — if a real need emerges, class
forwarding is the lowest-risk first step, rest last. Flag-level, no change requested.

## Findings (severity-tagged)

1. **[MINOR — a taught posture its own demo can't show]** The demo's third posture is named
   "unnumbered" (`sec-unnumbered`, titled "Notation") but renders **"§ 1.2"**: an undeclared
   SectionCard inside a numbered domain JOINS the domain and numbers by structure
   (SectionCard :236-254: "an undeclared descendant inside the domain subtree numbers by
   structure"). The bare-title fallback is FAMILY-TRUE (reference.svelte :148: `number === null
   ? target.title()`; numbering :331 "unnumbered context yields null (never invents a
   number)") but is only reachable OUTSIDE every domain — while a SectionCard with an id
   registers its target ANYWHERE (the Section/Figure asymmetry: sections register via the
   route registry regardless of domain; numbers need the domain). The overview + law table
   teach the posture; the demo's rig cannot exhibit it. Fix: move the specimen outside the
   numbered domain (or relabel the row). Reviewer #2: chase whether the page wants the
   outside-domain specimen or a reworded row.
2. **[LOW — stale dispatched count]** "SSR bytes carry 5 prerendered data-ref-to edge claims":
   measured **11** (the page grew past the count — postures/axes/query canvases each added
   claims). The harvester contract itself verified for all 11. Not a page defect; recorded so
   reviewer #2 measures 11 and isn't sent hunting for 5.
3. **[LOW — pre-existing spec debt]** `test/reference.spec.ts:65:27` — implicit-any on a
   `filter((c) => …)` callback in quill's spec helper (one-line type fix, family/spec lane).
   The file is unchanged since integration; pre-existing.
4. **[INFO]** scenes/reference.svelte 4× Object.entries overload errors (the fleet's
   blueprint-scene class) + family :115 8× state_referenced_locally warns (the fleet-wide
   provideUniversalLanes pattern) — pre-existing, unchanged files. Page: **0 diagnostics**.
5. **[NONE]** otherwise — no MAJOR on any dispatched claim.

## Gates

| Gate | Result |
|---|---|
| reference family solos (reference.spec + figure-numbering.spec) + ambient + canvas-same-source | **396/396, exit 0** (ambient 284/284 included) |
| ambient re-pin | **NOT owed — verified**: zero "reference" keys in docs-ambient-vocabulary.matrix.json (reference is outside the bijection universe) |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 618 files) | **page 0 diagnostics**; family/scene/spec debt pre-existing (unchanged files) |
| Raw SSR | toc 8/8 order==DOM; h1 1; markers present; **11** prerendered edge claims, 11 ??( fallbacks, 0 resolved labels in SSR; 0 undefined/null literals |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite (PID 95527 + wrapper killed by PID);
  **port after: []**.
- **NO commits, NO pushes; zero product-tree edits.** The .dark island and the attribute
  probes were injected and RESTORED inside the live DOM only; sibling files (scroll-virtual,
  progress) untouched.
- Independence: quill's report 28 not read. Probe craft note: my first panel sweep grabbed
  SectionCard's number-badge span (a bare `span` selector) — re-probed with posture-exact
  selectors (`p a[data-ref-to]` / the `??(`-text span); the wrong-element read is the same
  boundary-discipline class as dd-edge-vs-cell, caught by the impossible numbers (19.52px).
- Artifacts: /tmp/marginalia-37-probe{1,2}.mjs, /tmp/marginalia-37-ssr.html,
  /tmp/marginalia-37-{specs,scheck,dev}.log.

# The MDN doc-style baseline skill — the shared law of this change

> Every agent (coder and reviewer alike) develops and reviews AGAINST THIS
> DOCUMENT. It defines "MDN 文档风格" for this repository. When a page and
> this document disagree, this document wins; when this document is silent,
> follow the strongest existing page and record the question in your folder.

## 1. What MDN style IS (the definition)

MDN's documentation reads like a **well-organized reference written by an
engineer for engineers under time pressure**: the reader can find the one
fact they need in seconds, understand a complete working example without
reading prose, and trust that every sentence is load-bearing. Concretely:

- **Structure is predictable.** The same page archetype, in the same order,
  for every component — readers navigate by muscle memory.
- **Examples are first-class and always runnable.** The code shown is the
  code running; every example has a task-oriented heading ("Set an exact
  radius in pixels", not "Example 2").
- **Prose is short, declarative, and complete.** Present tense, active
  voice, second person for instructions ("Pass `radius=\"auto\"` to…").
  No marketing language, no personality, no hedging. One idea per
  paragraph; terms defined on first use; the same thing always called by
  the same name (the change's vocabulary: axis · lane · named step ·
  `auto` · carrier · ambient · rung).
- **Reference material lives in tables.** Enumerable facts (props, named
  steps, units, deviations) are tables — never buried in paragraphs.
- **Callouts are earned.** Notes/warnings are rare and carry real
  consequences ("Setting elevation on the ghost variant has no effect
  because…"), never trivia.
- **Honesty over completeness.** A documented absence ("the shape axis is
  deliberately absent — the family's `shape` prop owns the name; §13
  rules no mapping") is MDN-grade. A silent gap is not.

## 2. The page archetype (every component page, in this order)

1. **H1 + one-sentence description** — what it is and when to reach for it
   (≤ 2 lines).
2. **Overview** — 2–4 short paragraphs: purpose, composition (parts),
   the behaviors that matter. Link out for depth; never re-tell.
3. **Live example early** — the page's primary demo near the top, with
   its source shown. Readers see the component before reading about it.
4. **Props** — the auto-generated PropsTable section (NEVER hand-copied;
   the universal section renders from the one shared source).
5. **The eight axes on THIS component** — the heart of this refactor:
   - A per-axis table: axis · what it drives HERE (the carrier → the
     visual channel, named in the family's real css/vars) · named steps ·
     number lane (unit + practical bounds) · default;
   - Grouped live mini-examples where they earn their keep (one demo may
     cover two axes; do NOT force eight demos);
   - Deviations honestly documented with the census citation (e.g.
     badge's absent shape axis; scroll-area's split radius lane);
   - The `query()` form shown ONCE per page with a real, working
     responsive or container-conditional case.
6. **Accessibility** — semantics/roles the family carries, keyboard
     behavior, focus treatment, the density/hit-floor note where
     relevant.
7. **See also** — related components, the universal-props concept page,
   the census where a deviation is referenced.

Existing page infrastructure (SectionCard, the code-sample components,
the reveal blocks, the canvas dock) is the delivery vehicle — work WITHIN
it; do not invent new page machinery.

## 3. The three refactor tiers (the coder decides; the reviewer checks)

| tier | when | scope |
|---|---|---|
| **1 简单重构** | the page already fits the archetype | per-axis table + examples (§2.5), check every example runs, polish wording to §1; touch nothing else |
| **2 优化重构** | redundancy, gaps, or style drift — but the bones are good | tier-1 scope + restructure to the archetype order, cut redundancy, fill gaps, rewrite prose that violates §1 |
| **3 完全重构** | repair costs more than rewrite | full rewrite from the archetype; the OLD page's real information (usage facts, honest quirks) must survive into the new one; justify tier 3 in your report — the reviewer may veto to tier 2 |

## 4. Hard laws (violations fail review)

- **Zero new class identities** — the tailwindless ratchet pins
  `zones{routes:1}`; pages use the existing stylex/cx idiom only.
- **The PropsTable universal section is generated, never hand-written.**
- **Every code sample shown is the code running** — no stale snippets.
- **The universal-props section marker stays** (`data-jx-props-table-universal`;
  verify:docs-universal must hold at 110/110).
- **Deviation text must match the census** — never invent an axis
  behavior; cite `migration-census.md`'s LANDED rows.
- English prose (the site's docs language), en-US spelling.
- Gates after every task: the page renders (dev-server smoke or the
  capture harness), `npm run verify:docs-universal`, the affected specs
  (re-pin only with evidence, zero deletions), scoped svelte-check delta,
  `npm run test:types` clean at batch close.

## 5. Review checklist (the reviewer's law)

1. Tier judgment: was the chosen tier right? (Tier 3 without
   justification → veto.)
2. Archetype conformance: §2 order and presence.
3. Per-axis table: mechanism names real (carrier/vars exist in the
   family's source), steps/units correct vs `universal-props.schema.ts`,
   deviations cited vs census.
4. Examples run and match their shown source; headings task-oriented.
5. Prose: §1 rules — flag walls of text, marketing tone, undefined terms,
   inconsistent vocabulary.
6. Hard laws: zero new classes, generated sections intact, marker
   present.
7. **Highlights**: record what this page does BETTER than your own work
   in `experience.md` — then upgrade your own pages (the learning loop).

## 6. Orchestrator rulings (campaign-wide)

- **吃也供 in English prose**: the broadcast protocol's Chinese name is a
  design proper noun. On first mention per page write "the broadcast
  protocol (吃也供, supply-and-consume)"; thereafter "the broadcast
  protocol" — never raw Chinese mid-English-prose without the gloss.
  (Ruling from quill's anchor review NIT, 5 pages affected — fix pages
  as you touch them; a sweep is NOT a separate task.)

- **The query() typing law** (scribe's accordion review, campaign-wide): with
  explicit type args ALWAYS pass BOTH — `query<{ sm: DensityLane }, DensityLane>({…}, 'large')`;
  the single-arg form disables B's inference (defaults undefined) and ships a
  real svelte-check error.
- **The grep-receipt law**: any broadcast/supply claim ("axis X broadcasts to
  nested consumers") requires a named-consumer grep receipt before it is
  written — "zero readers tree-wide" is a grep result, never a vocabulary
  analogy.
- **The theme-split disclosure law** (vellum's alert re-probe): theme rows name WHICH voices flip — grep the declaring selector list per voice (jixoai.css slot blocks `:root,.jx-light,.dark` re-theme; the stylex defineVars layer stays frozen). "Partial re-theme, measured" with the two halves named.

# Proposal — docs-eight-axes-mdn (the Owner-directed doc-page refactor)

## Why

The explicit-props system landed (115/115 families, gates, bar), but the
Owner's audit holds: **only a minority of the 110 component doc pages
truly integrate the eight axes** — W3 gave every page ONE pasted
universal-demo card (a uniform summary + one usage snippet); that is
form, not per-component documentation. The Owner directs a full
doc-page refactor to MDN style, executed by multiple vision subagents
under an explicit org, with tiered effort per page and cross-review
learning loops.

## What changes

- Every one of the 110 `docs/components/*.html` pages refactored into
  the MDN archetype defined in `skills/mdn-doc-style.md` (the baseline
  skill — the orchestrator's definition of MDN style), with real
  per-component eight-axis documentation (per-axis table: mechanism ·
  steps · number lane · default · honest deviations with census
  citations; grouped runnable examples; one real query() case).
- Tiered execution per page (the coder decides, the reviewer checks):
  1 简单重构 / 2 优化重构 / 3 完全重构 (justified, vetoable).
- A four-agent org (quill · vellum · scribe · marginalia — vision
  subagents) with seeded-random batches (27/26/30/27, seed 20260922),
  TWO reviews per page by other agents, experience logs, orchestrator
  scheduling (one task at a time, coding/review/learning interleaved).
  Full policy: `org.md`.
- Gates preserved and extended: verify:docs-universal 110/110,
  tailwindless ratchet unmoved (zero new class identities in routes),
  suite green, per-page render smoke; change-level: vision walkthrough
  + Codex final review + Owner acceptance.

## Non-goals

- No component-source changes (doc pages only; page infra untouched).
- No new page machinery; no pushing; publish waits for the Owner.

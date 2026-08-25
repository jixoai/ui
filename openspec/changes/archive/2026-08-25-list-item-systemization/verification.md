# verification — list-item-systemization

> The change's evidence index. Every claim maps to a committed gate or
> a review record in this directory.

## Review history

| round | record | verdict |
|---|---|---|
| design r1 | review-design.md | BLOCK 5.0 — six contract gaps |
| design r2 | review-design.md §Round 2 | 7.5 — N1–N3 |
| design r3 | review-design.md §Round 3 | **ACCEPT 9.2** |
| impl r1 | review-impl.md | BLOCK 6.1 — seven blockers |
| impl r2 | review-impl.md §Round 2 | 7.8 — B8–B14 precision pass |
| impl r3 | review-impl.md §Round 3 | **ACCEPT 9.3** — archive |

Codex sessions: gpt-5.6-terra @ xhigh, herdr workspaces (recovered).

## Gates by task (commits bdaa4e1 → bb43022)

1. **Prelude** (bdaa4e1) — id-reaches-title fixture; focused 7/7;
   mirrors byte-identical.
2. **Family core** (e735f6e) — structure + css source guards; native
   ul/li + stamped chrome fixtures; full suite 455/455; payload +
   manifest regen.
3. **ItemField + adapters** (2389e9b) — jsdom 5/5 (ids on native
   elements, chains, invalid, modes, group inheritance); real-browser
   keyboard smoke 7/7 (Space / label-for click / radio arrows /
   select+input native keys / live stamps) — run ad-hoc against a
   throwaway dev server, superseded as COMMITTED evidence by the
   matrix gate + the jsdom DOM/ARIA locks (noted residual below).
4. **PlayRow bridge** (b5b51b4) — every aria-labelledby resolves to a
   real label node; full suite 471/471.
5. **Docs rebuild** (b80c2eb) — real-Chromium walkthrough 19/19 (all
   sections, link purity, native DOM, the 19rem end-wrap +
   wrap=never geometry proofs) — ad-hoc; the geometry halves are
   permanently locked by the matrix gate.
6. **Matrix gate** (dc70d5f → 4630fe0 → bb43022) —
   `node scripts/verify-item-matrix.mjs`: **33/33** — all 16 wide +
   8 narrow combos on BOTH computed columns and areas, both
   divider-adjacent edges, 38% vs full-strength, selected inset
   edge, wrap=never, Tab focus-visible ring; jsdom combo-count guard
   (16/16/24) + no-bare-selector guard.
7. **Registry closure** (1808331 → 4630fe0) —
   `node scripts/verify-shadcn-add.mjs` ALL GREEN: combined consumer
   AND an ISOLATED list-item-only consumer (21 files, no separator,
   every dependency target exactly once tree-wide, vite build);
   `node scripts/build-site.mjs` 7/7 self-checks; mirror parity.

## Final state

- Full suite **479/479** (37 files); matrix **33/33**; install
  closure ALL GREEN; filtered svelte-check **0 errors** on every
  list-item/radio/input/toc/fixture path (the workspace's remaining
  diagnostics belong to the concurrent agent's in-flight edits and
  the pre-existing jx-pure spec header, both verified independent of
  this change).
- Living specs merged: component-authoring (the Item family system
  requirement) + css-architecture (stamped-attribute painting).

## Residuals (recorded, not blockers)

- Svelte's `aria-invalid`-on-radio compiler warning: kept — the
  design requires the invalid state on the native radio; revisit only
  with a semantically equivalent wrapper.
- The five-control browser keyboard walkthrough and the docs-page
  walkthrough ran as ad-hoc evidence (transcripts summarized in the
  commit messages); their invariants live on as committed locks
  (jsdom DOM/ARIA + the matrix gate). A future change may formalize
  them as scripts if the ad-hoc pattern recurs.
- Recorded debts unchanged elsewhere: docs-restructure #16
  (svelte.config entries single-source), PAGE_STANDARDS §4.2 toc
  note — both pre-existing, untouched by this change.

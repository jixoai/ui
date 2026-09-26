# T127 — FIRST REVIEW language-switcher.html (vellum)

- **Reviewer**: vellum (1st review; Owner = marginalia — no prior report, independence
  law held. NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/language-switcher.html/` (273 lines,
  toc 8) over the language-switcher family (svelte 1 file + css/stylex/defaults), served
  live on :5242, dist @ HEAD 1416d764.
- **VERDICT: PASS — 0 MAJOR / 1 MINOR / 1 LOW / 0 NIT. Tier proposal: Tier 1** (a small,
  honest surface: the claims are structural — anchors not buttons, SSG-safe, disclosure
  semantics — and every one I drove reproduced; the owed items are one stale law bullet
  and the standing gate class).

## The claim bank — verified

- **Anchors, not buttons (the href law)**: the served locales are real `<a>` elements
  carrying **href + aria-current="page" on the current locale** ("EN"/"English" current;
  中文/简体中文/日本語/Deutsch not) — navigation, not state mutation, exactly the law
  section's thesis; the demo hrefs point back at the demo anchor (the locales-are-data
  shape).
- **pair · menu split**: the pair variant renders two locale links; the menu variant
  renders **four** (3+ locales → menu) ✓.
- **The menu semantics (the a11y section's honesty-pass model) — DOM-true**: the
  trigger is a **BUTTON aria-label "Language" with a bare aria-expanded disclosure (NO
  aria-haspopup)**, and the open panel is a **NAV landmark (aria-label "Language") of
  plain anchors — zero role="option", zero aria-selected, zero haspopup=listbox**
  anywhere on the served surface ✓.
- **Outside click + Escape close**: outside mousedown flips aria-expanded → false ✓;
  Escape closes ✓.
- **Bezel-born styling**: the switcher carries no density tokens of its own (the
  TokenTable's two rows are currentColor + terminal tokens — consistent with the
  family css read).

## LOW 1 — the law section's second bullet teaches the pre-honesty-pass vocabulary the rest of the page retired

The law section (:224–226) still lists: "menu semantics: `aria-haspopup="listbox"` on
the trigger, `role="option"` + `aria-selected` on entries". The served DOM carries
**none of those** (the trigger is a bare disclosure; the entries are plain anchors with
aria-current), and the page's OWN accessibility section (:256) teaches the opposite —
"no listbox/option fiction (honesty pass, 2026-09-02) … a bare disclosure, no haspopup
(the panel is navigation, not a select)". The page contradicts itself at one bullet;
the DOM sides with the a11y section. Fix: reword the bullet to the disclosure/nav/
aria-current truth (or delete the bullet — the a11y table already carries it).

## MINOR 1 — the page gate is red: 1 cx clone (:118); family 1 (:138)

The standing Object.entries-undefined class on +page.svelte and its family twin — the
per-page predicate closes both; the shared-util wave remains the real fix.

## Standard battery

- **toc == DOM == rail 8/8**, zero dangling; h1 ×1; duplicate ids 0.
- **LAW #18**: no repeated-row each (the locales are authored data); **LAW #19**: the
  DensityDemo seat clones clean.
- **T94**: no pseudo-state paint pairs (the switcher paints by aria-current/data
  attributes).
- **EXTRA-lane**: the api table serves the declared surface (locales, current, variant,
  ariaLabel, class + axes) — no gap against the interface I read.
- No Intl on this page — the locales-are-data design means the T104 picker-bridge
  instrument never applies (receipted as a design boundary, not a gap).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 1416d764) | **GREEN rc=0** |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page RED — 1 error** (MINOR 1); family 1 error (the twin) |

## Process evidence

- Port **5242**: wrapper + listener 76511; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Menu open/close state died with the probe browser.
- Probe faults owned: my first menu-open drive clicked the first [aria-haspopup] on the
  page — the canvas dock's menu, not the switcher's (the language trigger carries NO
  haspopup — which is itself the finding's receipt); re-located by aria-expanded within
  #types.
- Artifacts: /tmp/t127/{probe-d.mjs,probe-e.mjs,d.json,e.json,scheck.log,
  lsof-after.txt}.

## Open questions

1. The stale law bullet (LOW 1): one-line reword — the owner's text pass.

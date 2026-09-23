# T110 — SECOND REVIEW pattern-cta.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 91 1st-review report opened FIRST;
  landed hedge verified served; headline claims re-derived end-to-end; fresh axis run.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/pattern-cta.html/` over the
  pattern-cta family, served live on :5242.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 1** (per
  her proposal; nothing I measured contradicts it). Her NIT 1 (PlayHelp hover clause)
  is landed and served; every headline claim I re-derived reproduces.

## Her NIT 1 — the landed hedge, verified SERVED (not just committed)

The PlayHelp now reads (served text, TreeWalker receipt): "…the press law is
press-button's contract, verified by its own suite; **THIS seat's variant carries no
shadow poses (hover boxShadow stays none,** …" — source :113-114, commit 75908628
("the borrowed-claim hedge lands on the claim's seat"). The hedge sits exactly where
the borrowed claim lived and matches the measured paint (rest/hover boxShadow none).

## Headline claims — re-derived

- **The copy CTA, end-to-end (real click, clipboard-permitted context)**:
  aria "Copy the install command for pattern-cta" → click → **aria flips to "Install
  command copied"**, the check glyph svg appears, and **restore after the window**
  (+1.7s probe read): aria back to "Copy the install command…", label text back to the
  command ✓. Her 1.4s-window/+1.6s-restore receipt reproduced within probe timing.
- **The band floats**: SECTION.jx-pattern-cta roots compute
  **box-shadow rgb(0 0 0) 4px 4px 0px 0px** (×3 instances on the page — the live band
  and the canvas demo seats) — her F-7 float-tier receipt re-derived ✓.
- **svelte-check**: **0 diagnostics on pattern-cta** (the :56 overload she recorded is
  closed by the campaign's cx-joiner wave).

## Fresh axis (beyond her report): clipboard payload === rendered command text

Exact string equality, three-way: the live band's command label renders
**"npx jixoai-ui add pattern-cta"**, the post-copy button label restores to that exact
string, and **the clipboard reads back exactly `"npx jixoai-ui add pattern-cta"`** —
the payload the band's own command prop carries, character-for-character. The
composition's one-copy law delivers the same text the user sees. (My first
`code`-element census matched only the PAGE's install CodeCard
("…add pattern-cta press-button code-card") and the usage snippets — the band's
command lives in the button label, not a code element; the restored label is the
rendered-command receipt.)

Census honesty (scoped claim confirmed as scoped): the page carries 5 copy-labeled
affordances in total — the band's PressButton (1, the composition's own), plus the
page furniture every docs page has (the page install CodeCard's copy, the usage
snippet copy, two DocsInstall copies). Her ONE-copy claim is band-scoped and holds:
**the band's own buttons: exactly 1 copy affordance**.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 4c4ba4ff) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** |

## Process evidence

- Port **5242**: wrapper 26755 / listener 26805; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Clipboard cleared before the drive and died with the probe
  browser; the click-through interceptor lane was not re-run (her capture-phase
  receipt accepted; the anchor's conditional render unchanged in source).
- Probe faults owned: (1) my first band-shadow scan walked only DIVs and returned
  null — the band root is a SECTION; the all-elements scan is the receipt (instrument
  scope, not a paint change); (2) my first hedge matcher required a childless element
  and missed the wrapped text — TreeWalker text census is the served receipt.
- Artifacts: /tmp/t110/{probe-patterns.mjs,probe-addendum.mjs,patterns.json,
  scheck.log,lsof-after.txt}.

## Open questions

1. None. Her open question (the universal seats' identical 16px em-reflow coverage)
   remains authorship, not a defect — unchanged.

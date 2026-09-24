# TASK 125 — icon-button (docs page) — 1st eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 2 MINOR / 1 LOW / 1 NIT — Tier 2 proposed.**
Owner = marginalia; independent 1st audit. Dist = 79d7adde (fresh build rc=0). Port 5243
mine; killed after probes, lsof post rc=1, no orphans.

## Delivery-shape taxonomy: SELF-STAMP + composition (the press-button forward)

One control, two shells: the Tooltip wraps the control only in icon-only. The rendered
root is a REAL press-button (composition, not a copy) — measured `data-jx-press-button`
stamped on every wrapped root, `data-jx-press-flat` joining on raised={false}. IconButton's
own cx (:194) joins the family atoms; the icon snippet is wrapped decorative.

## Findings

**MINOR 1 — LAW #19: the page carries TWO `id="usage"` divs.** :386 ("Name the action
once") and :418 (family="usage", title "Usage") — live-DOM census `dups=["usage"]`. The
toc's single "Usage" entry resolves to the EARLIER twin (the one-liner section), and the
second Usage section is unrailable. Fix shape: rename the first to a distinct id (e.g.
`usage-contract`) or fold the two sections; keep exactly one `#usage` for the rail.

**MINOR 2 — the page-scoped gate is red (2 page + 1 family diagnostics), fleet-standard.**
Page :156 — the cx `Object.entries` overload (the `?? {}` one-liner). Family:
icon-button.svelte :194 — the same class. Mechanical, zero behavior change. (Saved-run
receipt: /tmp/g125-scheck.txt.)

**LOW 1 — the law section's "42px band (size-10.5)" is a stale literal against the
family's own annotated truth.** The page teaches "the icon-only square rides the same
42px band as a text button (size-10.5)". Measured at default density: text posture
**40px**, icon-only **40px** — and press-button.svelte's own square-pose doc says it
exactly: "the rendered square rides the density hit channel (**40.0px measured at default
— not a literal**)". The page's TokenTable row (`--jx-hit 28 / 32 / 40 / 48px`) is the
honest one (measured xs 28, default 40, lg 48). Fix shape: teach the hit channel in the
law section (the family's own phrasing) and drop the 42px/size-10.5 literal — the
width-token-truism class (a receipt citing a literal the paint does not carry).

**NIT 1 — the toc label and the section title diverge**: the rail says "One label, two
postures"; the section (:321) is titled "One label, a full button". One of them should
win.

## Verified-true (receipts against my armed suspicions)

- **The tooltip law, end-to-end on the popover channel** (`:popover-open`, the honest
  instrument after my first existence-based reads were falsified by persisted nodes —
  owned below): hover opens NOW (open at 150ms, no hover-intent delay ✓); pointer leave
  closes within the taught grace (open at +50ms inside the 100ms grace, CLOSED at +400ms ✓);
  keyboard focus opens instantly ✓; **Escape closes** ✓. The 100ms close-only-when-neither-
  surface clause matches tooltip.svelte's documented law.
- **The href seam**: the external anchor renders `<a href="https://github.com/jixoai/ui"
  target="_blank" rel="noreferrer" aria-label="open github">` — the page's auto-new-tab +
  noreferrer teaching byte-true, and role=link per the a11y table.
- **One label, two postures**: icon-only buttons carry `aria-label` = the text prop; the
  text posture renders the label visibly with no aria-label; the glyph wrapper is
  aria-hidden — the single-source contract holds in the served DOM.
- **Composition receipts**: variants/effects chain into the wrapped press-button root
  (`data-jx-press-button` on every instance; the flat square carries the flat hook);
  the page's `{@attach pressEffect(shimmer({speed:4000}))}` demo composes clean.
- **IconButton's contract teaching matches the family shape** (the dispatch's T112
  follow-up): the API table's `icon: Snippet (required)` matches icon-button.svelte's
  `icon: Snippet` — the dialog page's `as unknown as Snippet` cast was consumer-side only;
  the family is unchanged and the page teaches the current shape.
- Structure: toc 8 == 8 unique sections (the duplicate id aside, MINOR 1); h1 ×1; 0
  undefined; the DensityDemo seat + the TokenTable's density lanes (--jx-hit/--jx-text/
  --jx-line/--jx-gap/--jx-inset) are the consumed-kernel rows, measured at the paint
  (28/40/48 rungs digit-exact; sm instrument-missed, see ownership).

## Standard battery + gates

- SSR 200 (508,267 bytes) · verify:docs **rc=0** · docs-universal **110/110** · ONE saved
  svelte-check (MINOR 2's receipt).
- Probe-fault ownership: (1) my first tooltip reads tested node EXISTENCE — closed
  popovers persist in the DOM, so "open" read true forever; the `:popover-open` re-probe is
  the receipt; (2) my first icon-only height read filtered by textContent — icon-only
  buttons have no text and were excluded (null); the aria-label filter is the receipt;
  (3) the sm-rung height read caught a non-demo button (22.5px) — the rung is settled by
  the TokenTable's own 32 plus the xs/default/lg measurements, not by my smeared selector;
  (4) a sloppy double-launch line crashed one probe run before any read — owned.
- Artifacts: /tmp/g125-{tt,ib,ib2,li,li2,li3,li4,li5}.mjs + logs (shared batch artifacts).

## Open questions for the code round

1. The archetype gaps (like theme-toggle): no #install/#overview/#see-also; the universal
   section renders seats but no axis table.
2. The density TokenTable's four-rung ladder (28/32/40/48) vs press-button's five-rung
   fleet ladder (24/28/32/40/48, the T39 record): icon-button may genuinely expose four
   rungs to consumers — the code round should name the mapping (which rung dropped and
   why) so the next prober doesn't read the missing 24 as an error.

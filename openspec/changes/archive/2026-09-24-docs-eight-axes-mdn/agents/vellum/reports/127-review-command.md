# T127 — FIRST REVIEW command.html (vellum)

- **Reviewer**: vellum (1st review; Owner = marginalia — no prior report, independence
  law held. NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/command.html/` (274 lines, toc 6) over
  the command family (command/input/list/group/item/empty, css, stylex, defaults), served
  live on :5242, dist @ HEAD 1416d764.
- **VERDICT: PASS — 0 MAJOR / 2 MINOR / 0 LOW / 0 NIT. Tier proposal: Tier 2** (the
  keyboard contract is real and the ARIA chain holds on real keys; the select-close
  defect below is narrow but user-visible, and the gate carries the standing class).

## The claim bank — verified on real keys

- **⌘K real hotkey**: Meta+K opens the dialog and **focus moves to the combobox input**
  (activeElement === the combobox, aria-expanded "true") ✓.
- **The combobox ARIA chain (the T30 precedent)**: aria-activedescendant serves and
  tracks; typing "open" filters to the three visible matches and **the active pointer
  jumps to the FIRST VISIBLE match** (s9 "Open the registry"); **ArrowDown walks only
  visible, enabled options** (s9 → s10 "Open tokens" → s11 "Open GitHub"; the six
  mounted options' rect-visibility census matches the walk set exactly) — the a11y
  table's rows digit-true.
- **Disabled items render but never walk, never activate**: "Run the audit (soon)"
  serves with aria-disabled "true" and is excluded from the walk set ✓.
- **The empty state paints**: typing "zzzz" surfaces "no matches — try 'open'"
  (rect-visible) — the pure-CSS :has empty/group law painting ✓; re-typing a match
  re-hides it.
- **Escape closes** the dialog ✓.

## MINOR 1 — Enter-select runs the action but the palette does not close (the api's closeOnSelect default is falsified on the served default config)

The api row: closeOnSelect default **true** — "Close after a successful item
selection"; command.svelte :50 teaches "fires once, then the palette closes";
command-item :106 runs `if (cmd.closeOnSelect) cmd.close()`. Measured on the page's own
workbench (`<Command bind:open hotkey>` — no closeOnSelect, the default): filter to a
match, walk to a visible enabled option, **Enter — the item RUNS (the canvas output
shows "open github") but the dialog remains [open] and visually present (height 70,
class `jx-rest` = the settled pose) at +1.6s and +2.5s**. Escape closes from that
state. So: action fires, close does not — the closeOnSelect promise fails on the
default config. Two readings for the owner: (a) the item-select close path is broken
when `open` is consumer-bound (bind:open deferring/breaking cmd.close()'s bind-back
while the Escape/cancel path works), or (b) close() intentionally defers to bound-open
consumers — in which case the api row and the :50 law need the exception documented.
Either way the served default contradicts the taught contract. The closeOnSelect={false}
batch seat is unaffected by this reading (it teaches its own keep-open truth).

## MINOR 2 — the page gate is red: 1 cx clone (:138); family 5 (one per file)

+page.svelte :138 the Object.entries-undefined clone; the family carries the same seat
in **all five files** (command :468, command-input :55, command-group :45, command-item
:85, command-empty :39) — the whole family is pre-consolidation vintage. The per-page
predicate closes the page seat; the family wants the shared-util wave.

## Standard battery

- **toc == DOM == rail 6/6**, zero dangling; h1 ×1.
- **LAW #18/19**: no repeated-row each on the page (the palette items are authored
  parts); duplicate ids 0; the DensityDemo seat clones clean.
- **T94**: the family's state paint keys on data attributes + :has — no pseudo pair.
- **EXTRA-lane**: the api tables serve the root five (open bindable, hotkey, match,
  closeOnSelect, label) + CommandItem four (label required, keywords, disabled,
  onselect) — internally honest against the interfaces I read.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 1416d764) | **GREEN rc=0** |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page RED — 1 error** (MINOR 2); family 5 errors (all the cx class) |

## Process evidence

- Port **5242**: wrapper + listener 76511; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Palette state died with the probe browser.
- Probe faults owned: (1) my first empty-state visibility check used offsetParent —
  null inside top-layer dialogs; rect-based visibility is the instrument (the T98
  stylex-hash lesson's sibling); (2) an intermediate drive typed into a never-verified
  dialog (the reads described a closed dialog's DOM) — the per-step verification form
  (open? focused? visible?) is now in the receipt chain; (3) waitForSelector on
  [role=combobox] defaults to visible — the six attached comboboxes include five
  display:none dialog inputs; `state: 'attached'` + explicit scoping.
- Artifacts: /tmp/t127/{probe-chart-cmd.mjs,probe-c.mjs,probe-c2.mjs,probe-c3.mjs,
  cc.json,scheck.log,lsof-after.txt}.

## Open questions

1. The select-close path (MINOR 1): family-owner decision between the broken-close
   reading and the bind:open exception reading — the receipts distinguish the behavior,
   not the intent.

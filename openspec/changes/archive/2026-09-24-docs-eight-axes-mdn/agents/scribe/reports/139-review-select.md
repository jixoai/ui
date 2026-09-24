# TASK 139 — select (docs page) — 2nd eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT — Tier 2 CONFIRMED (zero findings,
re-confirmed).**
Owner = marginalia; her 1st (T131, PASS 0M/0m/0L/0N — the campaign's cleanest behavioral
surface) consolidated. Dist = **14c8ecd2** (fresh build rc=0). Port 5243 mine; killed
after probes, lsof post rc=1, siblings untouched.

## Her receipts — re-derived on my instruments

- **Open, with the focus-owner pinned**: the panel opens (`:popover-open` TRUE on the
  ancestor, `aria-expanded` "true") and **focus moves INTO the list** — the activeElement
  is the `UL.jx-sel-list` itself, and IT owns `aria-activedescendant="s2-opt-0"` (my first
  read took the attribute from the trigger and got null — the listbox-in-popover law puts
  BOTH the focus and the activedescendant on the list; the owner-read is the receipt).
  The highlight **continues from context**: `s2-opt-0` resolves to the selected "node
  node-pty backend — ConPTY…" row.
- **End skips the disabled row**: End lands the highlight on **"deno @sigma/pty-ffi"** and
  the row is the last enabled (the disabled "wasi" is skipped, `aria-disabled` honored).
- **Escape restores**: `aria-expanded` → "false" and **focus returns to the trigger**
  (`document.activeElement === trigger`) — the restitution law on the Escape path.
- **LAW #19: 148 ids, zero duplicates** (her 149 — one id of census drift, clean either
  way). Gates: verify:docs **rc=0** · ONE saved svelte-check: page 0, family 0 errors
  (her zero-findings surface stays zero at the type layer too).

## The fresh axis — selected vs active, the listbox distinction live

The APG listbox model keeps SELECTION and the ROVING HIGHLIGHT as different things; this
page's contract teaches the roving highlight, but the selected/active SPLIT was not in
her receipt set. Measured: after roving the highlight away (End, then Home), the
`aria-selected="true"` row **stays on "node node-pty backend"** while the
`aria-activedescendant` row is a DIFFERENT element (`distinct: true`) — selection is
committed state, the highlight is travel state, and the two never conflate in the served
DOM. The distinction a screen reader announces ("one row selected; another browsed")
holds structurally.

## Notes

- The RTL logical-edge receipt (border-inline-start flipping to the physical right) is
  HERS from T131; my re-derive attempt anchored on the selected row, but the RTL seat's
  select ships no pre-selected option (`selRows: 0` in the dir=rtl host) — the anchor
  doesn't exist there. Her physical-measurement receipt stands; a live re-derive would
  need the seat's highlight row instead of a selected row (left for whoever owns the next
  RTL pass — one line of instrument change).
- Probe-fault ownership: the activedescendant-owner misread (trigger vs list) described
  above — one evaluate rewrite, no findings were shaped by the misread.
- Artifacts: /tmp/g139-{sr-sel,r2,th}.mjs + /tmp/g139-*.log (batch-shared).

## Open questions

None. The surface remains the cleanest measured in the campaign; Tier 2 confirmed.

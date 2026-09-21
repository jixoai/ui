# The two fixtures (design §17.4 — status per §18: the card extract is
# DONE as a machine-readable file; the --check loading is W4's task 4.6)

## Fixture N — a normal family: `card`

The pre-merge generated zone lives as RAW BYTES in the committed
machine-readable file **`research/card-generated-zone.json`** — 740
bytes, NO trailing newline (the extraction boundary is FROZEN: the
object between `defineComponentMeta(\n` and `\n);`, marker-exclusive;
Codex r7 B3 — file, byte count, and 4.6's compare logic all bind this
boundary). Valid JSON, 7 props, 4 hooks; NOT a reformatted copy.

The W4 merge's ONLY delta: `"universal": UNIVERSAL_AXES` (the eight rows
verbatim from design §17). Assertions (4.6's frozen expectations):

- the eight rows equal `UNIVERSAL_AXES` member-for-member;
- `props`/`hooks` stay byte-equal to the extract above (the injection is
  ADDITIVE — it may not perturb existing fields);
- hand-authored annotations may override an axis row's `label`/
  `description` (curation) but may NOT drop or reorder rows.

## Fixture E — an exempt family (the SHAPE contract; no live exemption
## exists at W0 — the ledger opens empty by design)

```jsonc
// universal-props.inventory.json
"exemptions": [
  { "family": "<name>", "reason": "<e.g. pass-through container: renders no styled surface of its own>" }
]
```

Gate expectations for an exempt family: its meta carries NO `universal`
block; the drift gate accepts the absence IFF the ledger entry exists;
absent block + absent ledger entry = failure
(`<family>: universal block missing and no exemption entry`).

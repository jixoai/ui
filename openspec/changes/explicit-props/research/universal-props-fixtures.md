# The two frozen fixtures (design §17.4 — the W4 drift-gate expectations)

## Fixture N — a normal family: `card`

The generator's merged output for `card` (after W4's merge step):

```jsonc
{
  "source": "registry/files/ui/card/card.svelte",
  "props": { /* …card's own Props verbatim, unchanged by the merge… */ },
  "hooks":  [ /* …card's data-jx-* hooks verbatim… */ ],
  "universal": [ /* === UNIVERSAL_AXES, the eight rows verbatim, order fixed */ ]
}
```

Assertions (the `--check` gate's frozen expectations for this fixture):
- the eight rows equal `UNIVERSAL_AXES` member-for-member (axis, label,
  description, namedSteps, numberUnit, rawLane);
- `props`/`hooks` are byte-equal to the pre-merge generated zone (the
  injection is ADDITIVE — it may not perturb existing fields);
- hand-authored annotations may override `label`/`description` of an axis
  row (curation) but may NOT drop or reorder rows.

## Fixture E — an exempt family (shape contract)

No live exemption exists at W0 (the ledger opens empty). The frozen SHAPE,
for the first family that legitimately claims it:

```jsonc
// universal-props.inventory.json
"exemptions": [
  { "family": "<name>", "reason": "<e.g. pass-through container: renders no styled surface of its own>" }
]
```

Gate expectations for an exempt family: its meta carries NO `universal`
block; the drift gate accepts its absence IFF the ledger entry exists;
absent block + absent ledger entry = failure (`<family>: universal block
missing and no exemption entry`).

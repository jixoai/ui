# collab-protocol — panel materialization delta

## ADDED Requirements

### Requirement: the panel materializes bare-boolean and absent props through one atomic transaction

The studio SHALL provide a `materialize` admission endpoint that
turns a bare-boolean attribute (`disabled`) or an absent schema prop
(`popoverTarget`) into a real literal buffer: within one serialized
exclusive section it re-bakes the page scaffold (a tree update — the
new hole joined by the component's updated skip ledger), inserts the
buffer text on the transaction fork, passes the Svelte compile gate
on the candidate, and only then commits and projects the file
atomically. A failed gate SHALL leave file, canonical state, and
journal untouched. The endpoint SHALL be idempotent per opId
(success and rejection receipts replay). Expression props
(`loading={starting}`) SHALL stay readonly ("edit in code") — they
bind runtime state, and their edit semantics are not in the
vocabulary. The compile gate's hole vocabulary SHALL cover every
`how` the scaffold can produce (`prop-expr` included).

#### Scenario: checking DISABLED on a bare-boolean seed

- GIVEN a press-button seeded with a bare `disabled` attribute
- WHEN the panel toggles DISABLED
- THEN the file gains `disabled={true}` (an editable prop-expr
  buffer), the compile gate passed on the candidate, and the panel
  row becomes an ordinary toggle

#### Scenario: an opId retry replays the first outcome

- GIVEN a materialize commit under opId O
- WHEN the client retries O
- THEN the original receipt replays (byte-equal) with no new commit

#### Scenario: a compile failure leaves nothing behind

- GIVEN a materialize whose baked source fails the Svelte compile
- WHEN it is admitted
- THEN the transaction rolls back with zero effect on file,
  canonical state, and journal, and the rejection is replayable

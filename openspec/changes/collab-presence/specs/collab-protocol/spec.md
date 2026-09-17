# collab-protocol — presence delta

## ADDED Requirements

### Requirement: a centralized presence gateway with token identity and never-reused player colors

The design server SHALL host a WebSocket presence endpoint
(`/__design__/ws`) alongside the HTTP admission lane — ops NEVER ride
the socket (admission authority is unchanged); the socket carries
presence (join/leave/cursor/attention), a journal-append notification,
and liveness only. Connections authenticate by token: a first visit is
issued one; a reconnect presenting it resumes the same Player (same
id, same color). The workspace presence ledger (`.jx-collab/
presence.json`, schema fail-stop, rebuilt loudly when corrupt) SHALL
assign each new Player the next ordinal n with `hue = (73 * n) % 360`
— the counter only ever increments; leaving and rejoining without a
token takes a NEW ordinal; ordinals are never reused. AI players
register the same way (the server registers the dsh lane's Player); an
AI without a virtual mouse shows no cursor — its attention is its last
admitted op.

#### Scenario: two humans, one canvas

- GIVEN two browsers on the same design server
- WHEN both connect
- THEN each sees both Players in the list with distinct hues
  (73°, 146°, …), the online count, and the other's cursor moving on
  the canvas; a panel edit by one lands on the other via
  journal-tail → sync, with the editor's panel-focus outline and a
  digest naming the component (`a4 · raised=false→true`)

#### Scenario: reconnect keeps the color, a fresh join never reuses one

- GIVEN a Player who left
- WHEN the same token reconnects, then a token-less newcomer joins
- THEN the reconnector resumes the same ordinal and hue, the newcomer
  takes counter+1, and no hue is ever reused

#### Scenario: the socket dies, the editing lives

- GIVEN a connected Player
- WHEN the presence socket is severed
- THEN the remote indicators fade and the list shows the offline
  state, while every edit lane (HTTP admission, projection write-back,
  HMR) is unaffected

#### Scenario: an AI's attention rides its ops

- GIVEN a registered AI player without a virtual mouse
- WHEN its op is admitted
- THEN the observers' canvas shows the AI's ghost ring on the op's
  target component (resolved by the protocol componentId across
  documents), and no cursor exists for it until it registers a virtual
  mouse

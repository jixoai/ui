# design-studio-shell — presence indicators delta

## ADDED Requirements

### Requirement: three remote indicators, one family, per-player colors

The studio SHALL render remote Players through three indicators of one
visual family (the picker ring's overlay/glide grammar, per-player
persistent elements, `pointer-events: none`):

1. the MOUSE indicator — a colored dot with the Player's name tag,
   riding the surface the pointer is on (canvas overlay or shell
   overlay), 60ms-linear tracking against a ~50ms report stream;
2. the CANVAS-FOCUS indicator — a 1px player-hued ring at 0.55
   opacity with a `<name> · <componentId>` badge on the attended
   component (resolved by native id across documents; unresolvable ids
   fade out — never a wrong-element ring);
3. the PANEL-FOCUS indicator — a 2px player-hued outline on the
   operated field's row (falling back to the panel zone) with the
   player's name tag and the edit digest.

Every indicator SHALL ride the attending player's hue
(`hsl(hue, 85%, 45%)` chrome family), transition with the shared
240ms classic curve, appear/disappear by opacity (elements are not
rebuilt), and retire fully when the roster empties or the socket
drops. The Player chips list SHALL keep offline rows in a dimmed
state (offline is not absent) and mark AI players distinctly.

#### Scenario: hover one indicator family across surfaces

- GIVEN a remote player moving from the canvas into the props panel
- THEN their cursor glides across the canvas overlay, and their panel
  edit lights the field outline in the same hue with the digest naming
  the component

#### Scenario: an offline player

- GIVEN a remote player whose socket dropped
- THEN their indicators fade out and remove, their chip dims (the row
  stays), and the online count decrements

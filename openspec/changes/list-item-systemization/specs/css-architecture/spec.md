# css-architecture — delta

## ADDED Requirements

### Requirement: stamped-attribute painting (presence-matrix families)

Component families whose geometry or chrome depends on slot presence
or group policy SHALL resolve that state in the component (typed
context, deterministic for SSR, reactive thereafter) and stamp it as
data attributes on the DOM. Family css paints the stamped attributes;
it MUST NOT infer chrome or layout from arbitrary descendant context.
Group-owned paint SHALL target the group frame element, the inner
`<ul>` (for adjacency-owned properties such as dividers), and
direct-child row wrappers only. Presence-driven GRID templates SHALL
be expressed as exhaustive self-contained combinations — every
media/end/header/footer combo declares BOTH `grid-template-columns`
AND `grid-template-areas` — so no cascade path can mint implicit
tracks; top-level presence bits stay minimal (trailing metadata/
controls/glyphs live inside one lane slot, not as additional bits).

#### Scenario: chrome is inspectable without a computed style

- GIVEN a grouped Item resolved as chrome-less
- THEN `data-item-chrome` on the row root reads `"none"` in the SSR
  HTML, and the browser paints exactly that resolution

#### Scenario: no implicit tracks at any presence combination

- GIVEN a browser fixture rendering all sixteen wide media × end ×
  header × footer combinations
- WHEN each row's computed grid is read
- THEN both `grid-template-columns` and `grid-template-areas` match
  the authored template exactly — zero implicit tracks, no ghost
  columns
- GIVEN a row with an end lane inside a group at or below the 30rem
  container width with `wrap="auto"`
- THEN the end lane occupies its own full row area; with
  `wrap="never"` the lanes never split

#### Scenario: consumer overrides still win

- GIVEN family rules written as `:where()` inside `@layer components`
- WHEN a consumer applies a utility class to a row or group
- THEN the utility overrides the family paint per the layer law

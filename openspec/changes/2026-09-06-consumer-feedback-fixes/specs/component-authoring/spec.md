# component-authoring — delta

## ADDED Requirements

### Requirement: mode vocabulary is a localization payload (theme-toggle)

The theme-toggle's user-facing strings — the three mode labels and the
full variant's group accessible name — SHALL be localizable through ONE
optional `labels` prop (`{ light, dark, system, groupAriaLabel? }`, the
type exported beside the component). Absent, the prop SHALL resolve to
the English literals shipped to date (byte-identical render, aria, and
storage behavior); present, every rendered label and the group's
`aria-label` localize while the internal value domain
(`light | dark | system`) and the localStorage `theme` contract stay
untouched. Labels are presentation vocabulary (a localization payload),
never structure — this is not a composition-first exception.

#### Scenario: a bilingual site localizes the toggle

- GIVEN a zh page mounting `<ThemeToggle variant="full" labels={{ light: '浅色', dark: '深色', system: '系统', groupAriaLabel: '配色主题' }} />`
- THEN the segmented options render the zh labels and the group's
  aria-label reads 配色主题
- AND clicking 系统 still writes `theme=system` to localStorage (the
  value domain is never localized)

#### Scenario: the prop stays inert by default

- GIVEN a mount with no `labels`
- THEN the rendered labels are exactly `light` / `dark` / `system` and
  the group aria-label is `Color theme` — no observable difference from
  the pre-prop component

### Requirement: the locale switch owns its persistence contract (language-switcher)

The language-switcher SHALL persist the consumer's locale choice
itself: every locale anchor click (pair and menu variants) writes the
target locale's code to localStorage under the key `lang`, wrapped in
try/catch (storage may be unavailable — private mode, quota; the
failure is silent and navigation proceeds). The write is the
COMPONENT's half of a two-party contract: a site's language-negotiation
bootstrap reads the same `lang` key server- or boot-side; the key name
is the frozen seam and is documented in the component header.
Navigation SHALL stay a pure anchor navigation (href + hreflang per
entry) — persistence rides the click, never a click-prevention or
client routing takeover, so prerendered/SSG sites keep working.

#### Scenario: a locale link persists the choice

- GIVEN a menu-variant switcher with a `ja` entry
- WHEN the entry's anchor is clicked
- THEN `localStorage.getItem('lang')` returns `'ja'`
- AND the browser still follows the anchor's href (no preventDefault)

#### Scenario: hostile storage never breaks the switch

- GIVEN a consumer where `localStorage.setItem` throws
- WHEN a locale anchor is clicked
- THEN the error is swallowed and navigation proceeds

### Requirement: hero-section's copy payload is snippet-conditional

hero-section's `copyCommand` (the clipboard payload of the DEFAULT copy
CTA) SHALL be required exactly when that default CTA renders: when the
consumer provides a `#copy` snippet that replaces the default CTA
wholesale, `copyCommand` SHALL be optional (absent → unused). The
Props type encodes the condition; the header, registry docs, and docs
page state it. This is the composition-first payload rule made precise
for the one prop whose consumer only exists when its snippet escape is
not taken.

#### Scenario: a hero with a bespoke CTA

- GIVEN `<HeroSection eyebrow=… summary=…>{#snippet copy()}…{/snippet}</HeroSection>` with no `copyCommand`
- THEN the component type-checks and the bespoke snippet renders in
  place of the default copy button

#### Scenario: the default CTA still demands its payload

- GIVEN a hero without a `#copy` snippet
- THEN omitting `copyCommand` fails type checking (and the default CTA
  renders the command as label + clipboard payload when provided)

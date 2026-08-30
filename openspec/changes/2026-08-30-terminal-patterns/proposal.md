# Proposal: terminal-patterns — the brutalist pattern playground

## Why

The section-level market is enormous and completely unclaimed in the
terminal idiom: shadcnblocks alone ships Hero(275) / Feature(313) /
Pricing(96) / FAQ(26) / Auth (login/signup/2FA/passkey/magic-link);
reui ships 520 pro blocks; shadcn official ships numbered blocks
(login-03, dashboard-01). Zero competitors do terminal/brutalist
patterns. jixoai-ui already owns the atoms (press-button, terminal-card,
ghostty-term, code-card, section-card, input-otp, combobox, card-grid)
— patterns are the composition product that turns the registry into a
"style solution" and markets the components.

## What Changes

New registry items `pattern-<name>` under the EXISTING
`registry/files/ui/` area (flat item dirs — the folder law applies
unchanged, no new registry area; `type: registry:ui`, composed ONLY
of existing items — no new primitives):

- **pattern-login**: `ssh user@host`-style login card (user/host
  fields over plain `input` + the `innerInlineStart` slot; password
  reveal rides F's input `reveal` — a HARD F1 prerequisite, no
  pattern-local fallback), OTP-second-factor variant
  riding input-otp for 2FA, bootstrap-command footer: the copyable
  `npx jixoai-ui init` line as the "magic link" analog.
- **pattern-pricing**: `$ plan --compare` framing — ASCII-ruled
  comparison table (table family) + per-plan install-command cards
  (code-card) + a highlighted "recommended" tier via brand hue.
- **pattern-hero-set**: three hero-section variants — terminal-window
  hero (terminal-card left, lead type right), ascii-art headline hero,
  badge-marquee hero (CSS marquee, reduced-motion static row).
- **pattern-faq**: man-page styled FAQ (NAME/SYNOPSIS-style headers,
  details/summary accordion family).
- **pattern-cta**: shell-prompt CTA band (`$ npx jixoai-ui add …`
  copy-command + press-button).

Each pattern is a folder per item (folder law), a docs section
`/docs/patterns.html` with live demos + copy-ready add commands, and
cross-links from the homepage.

## Layering

- `registry/files/ui/pattern-*/**` (five new flat item dirs; the
  existing folder law applies — no new registry area, no mirror-sync
  change).
- registry.json (five new items — integrator applies, LAST in batch
  order A → F → G → H) + build + mirrors.
- FIVE canonical docs routes `/docs/components/pattern-<name>.html`
  (the same contract as every registry:ui item) +
  `/docs/patterns.html` as a GALLERY linking them only + homepage
  featured row (lands on A's derived catalog structure) +
  Docs-dropdown entry (reuses C's layout edit).
- Each pattern's DIRECT atom closure is declared in its task section
  and mirrored by its `registryDependencies` (verify:deps compares
  target-resolved imports to those edges).
- Component files of existing items: UNTOUCHED (composition only).

## Sequencing

H is LAST in the batch: it depends on A (homepage structure), F
(password reveal / input slots for pattern-login), C (layout +
skeleton lint), and the integrator's final registry.json application.

## Risks

- Patterns are demo-heavy; keep each item <300 lines sourced, reuse
  atoms — if a pattern needs a new prop on an atom, that prop change
  belongs to its own family change, not here (record as followup).
- Marquee motion must respect the reduced-motion law (static row).

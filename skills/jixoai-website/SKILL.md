---
name: jixoai-website
description: Build or restyle any jixoai project website (unipty, openspecui, future projects) in the shared jixoai visual identity — terminal/neo-brutalist mono-first design with SvelteKit + Tailwind v4. Use whenever the user asks to create, redesign, restyle, or improve a project website, landing page, docs site, or compatibility/evidence page for any jixoai-labs project, or mentions "jixoai website style", "官网", or asks for a site matching openspecui's look.
---

# jixoai Website Style

All jixoai project websites share ONE identity: a terminal / neo-brutalist,
mono-first design derived from the reference implementation at
`../openspecui/packages/website` (sibling repo, read it as ground truth for
anything this skill doesn't spell out). **The only per-project variable is
the brand hue.** Everything else — tech stack, token architecture, layout
patterns, motion language — is shared law.

## The One-Hue Law

Colors are defined in **OKLCH**, mirroring the reference configuration's
lightness/chroma exactly; a project's identity is one CSS variable:
`--brand-hue` (an oklch hue in degrees, live inside `oklch()` via
`var()`/`calc()`). Two jixoai sites must never differ in anything except
this hue (and content). An HSL formulation was tried and rejected on
2026-08-20 — sRGB HSL S/L is hue-dependent and distorts perceived weight;
do not reintroduce it.

| Project | Brand hue (oklch) | Dark drift (−4°) | Rendered light primary | Icon hex |
| ------- | ----------------- | ---------------- | ---------------------- | -------- |
| openspecui | `27` | `23` | its red | its own |
| unipty | `165` | `161` | `#007924` 幽绿 (phosphor green) | `#007924` |

Setting a project's identity means setting one CSS variable; never fork
the palette per project. Functional colors (secondary, accent, chart
colors, diff add/del, neutrals) keep the reference's FIXED oklch values
across projects so the brand hue stays meaningful.

## Workflow

0. **Bootstrap from the official registry** (preferred over hand-copying):
   `npx jixoai-ui init --hue <project hue>` in the site package — registers
   the `@jixoai` namespace in components.json, installs `jixoai-theme` (the
   token sheet of design-tokens.md, published verbatim from this repo) and
   applies the brand hue. Components come the same way:
   `npx jixoai-ui add toc` / `press-button` / `section-card` /
   `terminal-header` / `terminal-footer` / `theme-toggle`. The registry at
   <https://ui.jixoai.com> is the canonical source; this skill's references
   remain the law when the registry lags or a project needs bespoke pieces.
1. Read `references/design-tokens.md` — the full token sheet template and
   the hue derivation rules (what `jixoai-theme` installs).
2. Read `references/tech-stack.md` — the required stack, then adapt the
   deployment target to the project (reference deploys to Cloudflare
   Pages; unipty deploys to GitHub Pages via workflow). Content pipelines
   vary per project (e.g. unipty's site consumes an immutable release
   catalog artifact) — keep those seams, restyle around them.
3. Read `references/layout-patterns.md` — header terminal bar, hero
   SectionCard, press buttons, ghost footer wordmark. Reuse the component
   composition, not the content.
4. Read `references/motion.md` — scroll reveal, press physics, and the
   reduced-motion law. Motion is restrained: two patterns total.
5. Implement, then run the verification checklist below.

## Sub-agent feedback protocol

When a sub-agent implements this skill, it MUST end its report with a
friction log: every point where the skill was unclear, incomplete,
contradictory, or impractical for the target project, and how the agent
resolved each one. The orchestrator treats this log as evidence, not
truth — cross-checks it against the actual diff — and feeds real friction
back into this skill before the next sub-agent run.

## Verification checklist

- [ ] `--brand-hue` is the only color difference from the reference; no
      hardcoded per-project colors outside the token sheet and non-CSS
      brand assets (favicon, `theme-color`), which carry the project's
      icon hex.
- [ ] Dark mode: pure black background, inverted borders/shadows, brighter
      primary; no-flash theme bootstrap before first paint.
- [ ] Fonts are locally hosted via `@fontsource` packages (no Google Fonts
      network fetch); JetBrains Mono everywhere, Share Tech Mono for nav
      accents.
- [ ] Every interactive element uses press physics (lift on hover, press
      on active); links in body text get underline/color transitions only.
- [ ] `prefers-reduced-motion: reduce` disables reveal and press motion.
- [ ] Static build output works from a file/preview server; no server
      runtime required (adapter-static or equivalent).
- [ ] Project-specific seams preserved (e.g. byte-identical catalog copy,
      static checks, CNAME production gate) — restyle never breaks them.
- [ ] `pnpm build` and the project's site checks pass.

## What varies per project

- Brand hue (one variable), site content, copy language(s), deployment
  target, and content pipelines. Nothing else. When a "necessary"
  divergence appears, first check whether the reference solved it (it
  usually did), then — if truly new — keep the divergence minimal and
  document it in the site package NOTES.

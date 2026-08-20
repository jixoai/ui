# Layout patterns — jixoai website

The reference composition is a single-page narrative ("Broadside Log"):
terminal-bar header → hero card → feature/section cards → ghost footer
wordmark. Pages inside a site reuse the same card grammar.

## Shell

```
┌───────────────────────────────────────────────┐
│ header: terminal bar (always dark, mono)      │  border-b
│   brand (hue, uppercase, tracking 0.24em)     │
│   nav pills · external links ↗ · theme toggle │
├───────────────────────────────────────────────┤
│ main: max-w-[90rem], px-4 sm:px-6 lg:px-8     │
│   section cards in a vertical narrative       │
├───────────────────────────────────────────────┤
│ footer: giant ghost wordmark + meta links     │
└───────────────────────────────────────────────┘
```

## Header — terminal bar

`bg-terminal text-terminal-foreground border-b border-border`. Left: brand
name in `font-nav text-primary text-[11px] uppercase tracking-[0.24em]`,
site domain + subtitle beneath in `text-xs`. Right: nav as pills —
active = `bg-terminal-hover`, idle = 70% fg with hover to full; external
links get a `↗` suffix. Theme switcher at the far right.

## SectionCard — the content atom

One component carries every section:

- Container: `border border-border bg-card shadow-sm`, header block with
  `border-b` and `px-4 py-3`.
- `eyebrow`: `font-nav text-primary text-[11px] uppercase
  tracking-[0.24em]` — the section label in brand hue.
- `title`: `font-nav text-balance`, `tone="hero"` uses
  `text-[clamp(1.58rem,2.55vw,2.7rem)] max-w-[24ch]` (h1), regular tone
  ~`1.05–1.22rem` (h2).
- `summary`: `text-pretty text-[13–14px] max-w-[62ch]`, hero tone uses
  `text-foreground/78`, default uses `text-muted-foreground`.
- Body slot below the header.

## PressButton — the interactive atom

Two variants, one physics (see motion.md):

```
base:    inline-flex items-center gap-2.5 border border-border px-3.5 py-2.5
         text-sm font-medium shadow-xs
primary: bg-primary text-primary-foreground
outline: bg-background hover:bg-muted
copied:  bg-secondary text-secondary-foreground   (feedback state)
```

Never style links/buttons any other way in prose contexts.

## Footer — ghost wordmark

The project wordmark rendered huge and hollow (reference recipe):
`font-size: clamp(3rem, 11vw, 9rem); line-height: 0.9; color: transparent;
-webkit-text-stroke: 1px color-mix(in oklab, var(--color-border) 55%,
transparent)`, with an `@supports not (-webkit-text-stroke: 1px black)`
fallback of `color: color-mix(in oklab, var(--color-border) 35%,
transparent)`. Class `.footer-ghost`, `aria-hidden`, `select-none`. Below
it: muted meta row (12.5px) with external links that transition to
`text-primary` on hover. The ghost closes the narrative — always the last
element.

## Page grammar

- The home hero is the open Broadside hero of the reference (no card
  chrome): eyebrow (project name), h1 title (what it is, one line),
  summary (why it exists), CTA row of PressButtons (Get started → docs,
  GitHub ↗). The SectionCard `tone="hero"` variant is for inner-page
  heads, not the home hero.
- Then 2–5 feature/section cards; each = eyebrow + h2 + summary + content
  (code block, table, or grid).
- Code blocks: `readonly-code` surfaces — muted bg, hairline border,
  shiki dual-theme text. Meta strip (filename) uses accent tints.
- Tables (e.g. compatibility matrices): full-width, `text-[12.5px]`,
  bordered rows, header row on `bg-muted`; state chips are small pills
  (the only rounded-full elements).

## Density and rhythm

- Body text 13–14px; meta/labels 11–12.5px. The identity is dense and
  technical — do not inflate to airy marketing scale.
- Vertical gaps: `gap-2.5` inside card headers, `py-3/4` card padding,
  sections separated by ~`mt-6/8`.
- `text-balance` on headings, `text-pretty` on summaries.

# Design tokens — jixoai website identity

The token architecture is shadcn-style CSS custom properties mapped into
Tailwind v4 via `@theme inline`. Colors are **OKLCH**, mirroring the
reference configuration (`openspecui/packages/web/src/index.css`) exactly;
a project's identity is ONE number: `--brand-hue` (oklch hue degrees),
substituted into the primary ramp. CSS accepts `var()`/`calc()` inside
`oklch()`, so the hue stays a live variable.

> Decision record (2026-08-20): an HSL formulation (`--brand-hue` with
> per-mode S/L profiles) was tried and rejected — sRGB HSL saturation and
> lightness are hue-dependent (the same S/L renders darker and louder on
> cool hues) and cannot equalize perceived weight. OKLCH keeps lightness
> and chroma perceptual, which is why the reference uses it.

## The color configuration (shared across jixoai sites)

Lightness/chroma below are the openspecui configuration and are SHARED
LAW; only the primary hue varies per project.

| Token | Light | Dark |
| ----- | ----- | ---- |
| `--primary` | `oklch(0.6489 0.237 var(--brand-hue))` | `oklch(0.7044 0.1872 calc(var(--brand-hue) - 4))` |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(0 0 0)` |
| `--secondary` | `oklch(0.968 0.211 109.7692)` | `oklch(0.9691 0.2005 109.6228)` |
| `--secondary-foreground` | `oklch(0 0 0)` | `oklch(0 0 0)` |
| `--accent` | `oklch(0.5635 0.2408 260.8178)` | `oklch(0.6755 0.1765 252.2592)` |
| `--accent-foreground` | `oklch(1 0 0)` | `oklch(0 0 0)` |
| `--chart-4` | `oklch(0.7323 0.2492 142.4953)` | `oklch(0.7395 0.2268 142.8504)` |
| `--chart-5` | `oklch(0.5931 0.2726 328.3634)` | `oklch(0.6131 0.2458 328.0714)` |
| `--ring`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring` | `var(--primary)` | `var(--primary)` |
| `--chart-2` / `--chart-3` | secondary / accent | secondary / accent |
| `--background` | `oklch(1 0 0)` | `oklch(0 0 0)` |
| `--foreground` | `oklch(0 0 0)` | `oklch(1 0 0)` |
| `--terminal` | `oklch(0.2 0 0)` (both modes — the CRT bezel) | |
| `--card` / `--popover` | `oklch(1 0 0)` | `oklch(0.3211 0 0)` |
| `--muted` | `oklch(0.9551 0 0)` | `oklch(0.2178 0 0)` |
| `--muted-foreground` | `oklch(0.3211 0 0)` | `oklch(0.8452 0 0)` |
| `--destructive` (+fg) | black / white | white / black |
| `--border` / `--input` | `oklch(0 0 0)` | `oklch(1 0 0)` |
| `--terminal-hover` / `--terminal-muted` | `color-mix(in oklab, var(--terminal-foreground) 14%/8%, var(--terminal))` (both modes) | |

Notes:

- The primary hue drifts **−4° in dark mode** (openspecui: 27 → 23), a
  perceptual compensation; mirror the delta, not the absolute hue.
- These chroma values are intentionally beyond the sRGB gamut in places
  (openspecui's secondary renders as pure `#ffff00`); browsers clip at
  display time and that neon clip IS the brutalist look. Do not "fix" it.
- Foreground-on-color follows lightness: white on the light-mode primary
  and accent, black on their dark-mode counterparts and on secondary
  (very light) in both modes.

## Project hue registry

| Project | `--brand-hue` | Dark drift | Rendered light primary | Icon hex |
| ------- | ------------- | ---------- | ---------------------- | -------- |
| openspecui | `27` | `23` | its red | its own |
| unipty | `165` | `161` | `#007924` (幽绿 phosphor green) | `#007924` |

## Full token sheet template

Copy this as the site's token core (Tailwind v4 CSS-first). Neutrals are
pure black/white — the brutalist contrast is intentional; do not soften
them with grays except where `--muted` is defined.

```css
@import '@fontsource-variable/jetbrains-mono';
@import '@fontsource/share-tech-mono';
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --brand-hue: 165;

  --background: oklch(1 0 0);
  --foreground: oklch(0 0 0);
  --terminal: oklch(0.2 0 0);
  --terminal-foreground: oklch(1 0 0);
  --terminal-hover: color-mix(in oklab, var(--terminal-foreground) 14%, var(--terminal));
  --terminal-muted: color-mix(in oklab, var(--terminal-foreground) 8%, var(--terminal));
  --card: oklch(1 0 0);
  --card-foreground: oklch(0 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0 0 0);
  --primary: oklch(0.6489 0.237 var(--brand-hue));
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.968 0.211 109.7692);
  --secondary-foreground: oklch(0 0 0);
  --muted: oklch(0.9551 0 0);
  --muted-foreground: oklch(0.3211 0 0);
  --accent: oklch(0.5635 0.2408 260.8178);
  --accent-foreground: oklch(1 0 0);
  --destructive: oklch(0 0 0);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0 0 0);
  --input: oklch(0 0 0);
  --ring: var(--primary);
  --chart-1: var(--primary);
  --chart-2: var(--secondary);
  --chart-3: var(--accent);
  --chart-4: oklch(0.7323 0.2492 142.4953);
  --chart-5: oklch(0.5931 0.2726 328.3634);

  /* typography: mono is the site voice, not an afterthought */
  --font-sans: 'JetBrains Mono Variable', 'JetBrains Mono', SFMono-Regular,
    Menlo, Consolas, 'Liberation Mono', monospace;
  --font-mono: var(--font-sans);
  --font-nav: 'Share Tech Mono', 'JetBrains Mono Variable', monospace;

  /* sharp corners; bevel upgrade only where CSS supports it */
  --radius: 0px;
  @supports (corner-shape: bevel) {
    --radius: 8px;
  }

  /* hard offset shadows — no blur, no softness */
  --shadow-color: hsl(0 0% 0%);
  --shadow-2xs: 1px 1px 0px 0px hsl(0 0% 0% / 0.5);
  --shadow-xs: 2px 2px 0px 0px hsl(0 0% 0% / 0.5);
  --shadow-sm: 2px 2px 0px 0px hsl(0 0% 0% / 1), 1px 1px 0px 1px hsl(0 0% 100% / 0.5);
  --shadow: 4px 4px 0px 0px hsl(0 0% 0% / 1);
  --shadow-md: 4px 4px 0px 0px hsl(0 0% 0% / 1), 4px 2px 4px -1px hsl(0 0% 100% / 1);
}

.dark {
  --background: oklch(0 0 0);
  --foreground: oklch(1 0 0);
  --terminal: oklch(0.2 0 0);
  --terminal-foreground: oklch(1 0 0);
  --terminal-hover: color-mix(in oklab, var(--terminal-foreground) 14%, var(--terminal));
  --terminal-muted: color-mix(in oklab, var(--terminal-foreground) 8%, var(--terminal));
  --card: oklch(0.3211 0 0);
  --card-foreground: oklch(1 0 0);
  --popover: oklch(0.3211 0 0);
  --popover-foreground: oklch(1 0 0);
  /* the primary hue drifts -4° toward dark, mirroring the reference */
  --primary: oklch(0.7044 0.1872 calc(var(--brand-hue) - 4));
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.9691 0.2005 109.6228);
  --secondary-foreground: oklch(0 0 0);
  --muted: oklch(0.2178 0 0);
  --muted-foreground: oklch(0.8452 0 0);
  --accent: oklch(0.6755 0.1765 252.2592);
  --accent-foreground: oklch(0 0 0);
  --destructive: oklch(1 0 0);
  --destructive-foreground: oklch(0 0 0);
  --border: oklch(1 0 0);
  --input: oklch(1 0 0);
  --ring: var(--primary);
  --chart-1: var(--primary);
  --chart-2: var(--secondary);
  --chart-3: var(--accent);
  --chart-4: oklch(0.7395 0.2268 142.8504);
  --chart-5: oklch(0.6131 0.2458 328.0714);

  /* dark mode inverts the shadow color — including the small tiers, or
     press buttons lose their lift on the pure-black canvas */
  --shadow-color: hsl(0 0% 100%);
  --shadow-2xs: 4px 4px 0px 0px hsl(0 0% 100% / 0.5);
  --shadow-xs: 4px 4px 0px 0px hsl(0 0% 100% / 0.5);
  --shadow-sm: 4px 4px 0px 0px hsl(0 0% 100% / 1), 4px 1px 2px -1px hsl(0 0% 0% / 1);
  --shadow: 4px 4px 0px 0px hsl(0 0% 100% / 1);
  --shadow-md: 4px 4px 0px 0px hsl(0 0% 100% / 1), 4px 2px 4px -1px hsl(0 0% 0% / 1);
}

/* Map EVERY token into Tailwind utilities, mirroring the reference
   (@color-* for surfaces incl. ring/popover/input/destructive/chart-*,
   --font-*, --radius). An unmapped token silently yields dead utilities. */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-terminal: var(--terminal);
  --color-terminal-foreground: var(--terminal-foreground);
  --color-terminal-hover: var(--terminal-hover);
  --color-terminal-muted: var(--terminal-muted);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-nav: var(--font-nav);
  --radius-*: initial;
  --radius: var(--radius);
}
```

The two `@fontsource` imports correspond to devDependencies
`@fontsource-variable/jetbrains-mono` and `@fontsource/share-tech-mono`.

## Code blocks

Readonly code surfaces use tinted mixes (kept from the reference):

```css
:root {
  --readonly-code-bg: color-mix(in oklab, var(--muted) 42%, var(--background));
  --readonly-code-border: color-mix(in oklab, var(--border) 18%, transparent);
  --readonly-code-meta-bg: color-mix(in oklab, var(--accent) 12%, var(--background));
  --readonly-code-meta-fg: color-mix(in oklab, var(--accent) 58%, var(--foreground));
}
.dark {
  --readonly-code-bg: color-mix(in oklab, var(--muted) 78%, var(--background));
  --readonly-code-meta-bg: color-mix(in oklab, var(--accent) 18%, var(--background));
  --readonly-code-meta-fg: color-mix(in oklab, var(--accent) 60%, oklch(1 0 0));
}
```

Diff accents are semantic and fixed: add = oklch hue 151, del = oklch hue
22 (see the reference `--readonly-code-add-*`/`--readonly-code-del-*`
mixes); they are never brand-tinted.

## Rules that look negotiable but are not

- Neutrals are pure achromatic oklch (`0`, `0.2`, `0.3211`, `0.9551`, `1`);
  never introduce warm/cool grays.
- Shadows are hard offsets with 0 blur; the only soft component is the
  tiny secondary layer in `md+`.
- Radius stays 0 (bevel-upgrade exception only). Rounded-full is allowed
  exclusively for small status dots/pills, never for cards or buttons.
- The terminal bar (`--terminal` surfaces) is always dark in both themes —
  it reads as a CRT bezel, not a themed surface.
- Do not re-tune the shared L/C configuration per project; a project
  changes ONLY `--brand-hue` (and the icon/theme-color hex derived from
  it). Non-CSS brand assets (favicon, `theme-color`) carry the rendered
  hex of the light primary (unipty: `#007924`).

/**
 * tokens.stylex.ts — the TYPED mirror of the jixoai theme sheet
 * (stylex-kernel phase 0, P0.3; openspec/changes/2026-09-14-
 * stylex-kernel-phase0 design §2).
 *
 * Intents (orthogonal count: 1):
 *   - give kernel StyleX atoms TYPED access to the theme table:
 *     `tokens['--jx-primary']` is a compile-time-checked VarGroup
 *     member (a typo'd key is a type error naming the key — the
 *     D1-12-proven surface), while the VALUES stay verbatim
 *     `var(--primary)` references to the EXISTING sheet. The sheet
 *     (registry/files/theme/jixoai.css, item `jixoai-theme`) remains
 *     the SINGLE source of truth (R4 channel collapse: no fourth
 *     channel) — this module RE-MAPS, never re-computes.
 *
 * Law notes:
 *   - Key namespace: every stylex key is `--jx-<sheet-name>`. It must
 *     NEVER equal the sheet name it references (a self-referential
 *     custom property is a cycle) — which is exactly why the sheet's
 *     own `--jx-*` kernel channels (the scrollbar widths and the
 *     engrave shades) are NOT wrapped here: their consumed form stays
 *     the plain `var()` string in folder css per the placement law.
 *   - Dark / density / hue keep working unchanged: they stamp
 *     attributes and custom properties through the existing runtime
 *     channels; these vars resolve against whatever the sheet's
 *     cascade currently says (design §2 — atoms consume the vars, so
 *     scopes cascade through the DOM).
 *   - F11 (compiled-output shipping): this SOURCE module is compiled
 *     by OUR build only (@jixoai/ui-vite-plugin's stylex feature);
 *     the registry's compiled payload ships plain strings + css —
 *     consumers of any item never owe a @stylexjs/* package.
 *   - Named keys (not hashed) keep the emitted custom-property names
 *     stable across builds and paths (the L3c path-dependent-hash
 *     anomaly never touches the token layer).
 *
 * Owner original demand: the stylex-kernel blueprint phase 0 (F11
 * edition), 2026-09-14; compiled-legality of verbatim var() values:
 * research L1 §6 + D2-08/09/10 (archive/2026-09-13-stylex-kernel-
 * research).
 */

import * as stylex from '@stylexjs/stylex';

/**
 * The typed theme table. 111 members (60 + the site voice scale's
 * 19 + the Wave 1 scale extension's 31 + W1b's 1, tailwindless one-shot),
 * order mirroring the sheet's own declaration order
 * (auditability); the doc comment inside each group names the
 * sheet law it mirrors.
 */
export const tokens = stylex.defineVars({
  // the ONE per-project value (sheet: --brand-hue; hue drifts -4° dark)
  '--jx-brand-hue': 'var(--brand-hue)',

  // surfaces + foregrounds (the shadcn-shaped semantic core)
  '--jx-background': 'var(--background)',
  '--jx-foreground': 'var(--foreground)',
  '--jx-card': 'var(--card)',
  '--jx-card-foreground': 'var(--card-foreground)',
  '--jx-popover': 'var(--popover)',
  '--jx-popover-foreground': 'var(--popover-foreground)',
  '--jx-primary': 'var(--primary)',
  '--jx-primary-foreground': 'var(--primary-foreground)',
  // primary-tinted surfaces' ink (W1: terminal-header/hero/cta
  // demanded typed access; the sheet owned the value since r1)
  '--jx-primary-text': 'var(--primary-text)',
  '--jx-secondary': 'var(--secondary)',
  '--jx-secondary-foreground': 'var(--secondary-foreground)',
  '--jx-muted': 'var(--muted)',
  '--jx-muted-foreground': 'var(--muted-foreground)',
  '--jx-accent': 'var(--accent)',
  '--jx-accent-foreground': 'var(--accent-foreground)',
  '--jx-destructive': 'var(--destructive)',
  '--jx-destructive-foreground': 'var(--destructive-foreground)',
  '--jx-border': 'var(--border)',
  '--jx-input': 'var(--input)',
  '--jx-ring': 'var(--ring)',

  // the terminal surface family (the bar is always dark)
  '--jx-terminal': 'var(--terminal)',
  '--jx-terminal-foreground': 'var(--terminal-foreground)',
  '--jx-terminal-hover': 'var(--terminal-hover)',
  '--jx-terminal-muted': 'var(--terminal-muted)',

  // semantic state palette (D5: --destructive stays the monochrome
  // inversion pair; error is the red semantic)
  '--jx-success': 'var(--success)',
  '--jx-success-foreground': 'var(--success-foreground)',
  '--jx-warning': 'var(--warning)',
  '--jx-warning-foreground': 'var(--warning-foreground)',
  '--jx-info': 'var(--info)',
  '--jx-info-foreground': 'var(--info-foreground)',
  '--jx-error': 'var(--error)',
  '--jx-error-foreground': 'var(--error-foreground)',

  // chart rides the semantic palette (D5 harmony audit)
  '--jx-chart-1': 'var(--chart-1)',
  '--jx-chart-2': 'var(--chart-2)',
  '--jx-chart-3': 'var(--chart-3)',
  '--jx-chart-4': 'var(--chart-4)',
  '--jx-chart-5': 'var(--chart-5)',

  // mono-first fonts (font-mono === font-sans in the sheet)
  '--jx-font-sans': 'var(--font-sans)',
  '--jx-font-mono': 'var(--font-mono)',
  '--jx-font-nav': 'var(--font-nav)',

  // radius 0 with the bevel upgrade (@supports corner-shape)
  '--jx-radius': 'var(--radius)',

  // the hard-offset shadow ladder (shadow-lg removed: dead rung F-10)
  '--jx-shadow-color': 'var(--shadow-color)',
  '--jx-shadow-2xs': 'var(--shadow-2xs)',
  '--jx-shadow-xs': 'var(--shadow-xs)',
  '--jx-shadow-sm': 'var(--shadow-sm)',
  '--jx-shadow': 'var(--shadow)',
  '--jx-shadow-md': 'var(--shadow-md)',
  // press poses: each hover pose minus the 1px press vector (the
  // .jx-press law — the shadow paint stays anchored)
  '--jx-shadow-xs-press': 'var(--shadow-xs-press)',
  '--jx-shadow-sm-press': 'var(--shadow-sm-press)',
  '--jx-shadow-md-press': 'var(--shadow-md-press)',
  // engrave/well/paper: the inset-tier shadows (values live in the
  // sheet; the seam NAMES --jx-engrave-* stay folder-css channels)
  '--jx-shadow-engrave': 'var(--shadow-engrave)',
  '--jx-shadow-well': 'var(--shadow-well)',
  '--jx-shadow-well-hover': 'var(--shadow-well-hover)',
  '--jx-shadow-paper': 'var(--shadow-paper)',

  // floating-surface + dialog laws
  '--jx-scrim': 'var(--scrim)',
  '--jx-surface-shadow': 'var(--surface-shadow)',

  // the scrollbar palette (INK law; widths stay kernel channels)
  '--jx-scrollbar-track': 'var(--scrollbar-track)',
  '--jx-scrollbar-thumb': 'var(--scrollbar-thumb)',
  '--jx-scrollbar-thumb-hover': 'var(--scrollbar-thumb-hover)',
  '--jx-scrollbar-thumb-active': 'var(--scrollbar-thumb-active)',

  // the site voice scale (tailwindless-site P0, 2026-09-17): the
  // pilot's promoted steps — fixed micro-typography, page measures,
  // the space ladder, the hairline. Sheet names carry no jx prefix
  // precisely so these typed keys can exist (the cycle law above);
  // 13px body text stays --jx-text-base, a kernel channel the map
  // must never wrap.
  '--jx-text-micro': 'var(--text-micro)',
  '--jx-text-label': 'var(--text-label)',
  '--jx-text-label-lg': 'var(--text-label-lg)',
  '--jx-text-small': 'var(--text-small)',
  // the Wave 1 scale extension (tailwindless one-shot, 2026-09-17):
  // the four migration batches' cross-family demand — sm/body text
  // steps, the tracking/weight/leading/motion ladders, three space
  // rungs. Order mirrors the sheet's own voice-scale section.
  '--jx-text-sm': 'var(--text-sm)',
  '--jx-text-body-lg': 'var(--text-body-lg)',
  '--jx-text-body-xl': 'var(--text-body-xl)',
  '--jx-track-label': 'var(--track-label)',
  '--jx-track-wide': 'var(--track-wide)',
  '--jx-track-tight': 'var(--track-tight)',
  '--jx-track-04': 'var(--track-04)',
  '--jx-track-06': 'var(--track-06)',
  '--jx-track-10': 'var(--track-10)',
  '--jx-track-12': 'var(--track-12)',
  '--jx-track-14': 'var(--track-14)',
  '--jx-track-18': 'var(--track-18)',
  '--jx-track-20': 'var(--track-20)',
  '--jx-weight-medium': 'var(--weight-medium)',
  '--jx-weight-semibold': 'var(--weight-semibold)',
  '--jx-weight-bold': 'var(--weight-bold)',
  '--jx-leading-none': 'var(--leading-none)',
  '--jx-leading-12': 'var(--leading-12)',
  '--jx-leading-tight': 'var(--leading-tight)',
  '--jx-leading-14': 'var(--leading-14)',
  '--jx-leading-145': 'var(--leading-145)',
  '--jx-leading-15': 'var(--leading-15)',
  '--jx-leading-155': 'var(--leading-155)',
  '--jx-leading-16': 'var(--leading-16)',
  '--jx-motion-100': 'var(--motion-100)',
  '--jx-motion-150': 'var(--motion-150)',
  '--jx-motion-200': 'var(--motion-200)',
  '--jx-motion-hero': 'var(--motion-hero)',
  '--jx-motion-ease-out': 'var(--motion-ease-out)',
  '--jx-motion-ease-nav': 'var(--motion-ease-nav)',
  '--jx-shell-w': 'var(--shell-w)',
  '--jx-stage-w': 'var(--stage-w)',
  '--jx-space-2': 'var(--space-2)',
  '--jx-space-4': 'var(--space-4)',
  '--jx-space-6': 'var(--space-6)',
  '--jx-space-8': 'var(--space-8)',
  '--jx-space-10': 'var(--space-10)',
  '--jx-space-12': 'var(--space-12)',
  '--jx-space-14': 'var(--space-14)',
  '--jx-space-16': 'var(--space-16)',
  '--jx-space-18': 'var(--space-18)',
  '--jx-space-20': 'var(--space-20)',
  '--jx-space-24': 'var(--space-24)',
  '--jx-space-32': 'var(--space-32)',
  '--jx-space-40': 'var(--space-40)',
  '--jx-hairline': 'var(--hairline)',
});

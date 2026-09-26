// native-select.stylex.ts — the native-select family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the markup's utility residue as the old file
// spelled it — the chevron wrap's positioning frame (the inline SVG
// chevron absolutely positions against this relative block) and the
// select's color-scheme pair (scheme-light dark:scheme-dark — the
// dark-strategy-dependent variant whose discriminator belongs to the
// consumer's context, native-select.svelte's tw4 note). The
// .jx-field/.jx-label/.jx-error scaffolding, .jx-select-wrap and
// .jx-html-select stay CONSUMED from the jx-pure sheet (Tier-2
// consume-only law) as static hook strings.
//
// Law mapping: the scheme pair rides the combobox precedent verbatim
// — colorScheme: light with the prefers-color-scheme: dark media pose
// inside the atom (the media variant IS atom-expressible; the option
// popup keeps its native rendering following the site theme). The
// wrap's frame is structural (position/display/width law); w-full +
// max-w-full is the field's measure contract. B5 control chrome law
// (data-chrome / data-self-inset stamps) is FROZEN — untouched here.
//
// Mirror law: this file is byte-identical in
// registry/files/ui/native-select/ and apps/www/src/lib/ui/native-select/
// (cmp); the tokens import '../../tokens.stylex' resolves in BOTH
// trees (separator's divergence note #1).

import * as stylex from '@stylexjs/stylex';

export const nativeSelectStyles = stylex.create({
  // ── the chevron wrap: the closed control's positioning frame ─────
  wrap: {
    position: 'relative',
    display: 'block',
    width: '100%',
    maxWidth: '100%',
  },
  // ── the select's scheme pair (combobox verbatim) ─────────────────
  // light at rest, dark under the OS dark strategy — the option popup
  // follows the site theme through the UA's own channel
  control: {
    colorScheme: 'light',
    '@media (prefers-color-scheme: dark)': {
      colorScheme: 'dark',
    },
  },
});

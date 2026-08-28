# @jixoai/ui-plugin

The jixoai UI plugin — unified SVG icon providers + vite integration.

## Install

```bash
npm install @jixoai/ui-plugin
```

Peer dependencies: `vite` (any v5-v8). Optional: `opentype.js` (for
font-based icons), `wawoff2` (for WOFF2 font decompression).

## Quick start

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { tailwindcss } from '@tailwindcss/vite';
import { jxUI, lucideIconProvider } from '@jixoai/ui-plugin';

export default {
  plugins: [
    sveltekit(),
    tailwindcss(),
    jxUI({ icons: lucideIconProvider() }),
  ],
};
```

Then in your CSS entry (after the jixoai theme):

```css
@import 'tailwindcss';
@import '@jixoai/jixoai-theme';
@import 'virtual:@jixoai/ui-plugin/icons';  /* ← the plugin's virtual module */
```

## Icon providers

All providers output the same thing: SVG data URIs as CSS custom
properties (`--jx-icon-{slot}`). One interface, zero consumption modes.

### lucideIconProvider (default)

```typescript
import { lucideIconProvider } from '@jixoai/ui-plugin';

jxUI({ icons: lucideIconProvider() })
```

Zero I/O — embeds lucide SVG paths for calendar, clock, chevron,
pipette, and clear (×) icons.

### svgIconProvider

```typescript
import { svgIconProvider } from '@jixoai/ui-plugin';

jxUI({
  icons: svgIconProvider({ dir: './src/icons' }),
})
```

Reads `{dir}/{slot-name}.svg` files. Optional `slots` overrides filenames:

```typescript
svgIconProvider({
  dir: './src/icons',
  slots: { chevron: 'arrow-down.svg' },  // custom filename for one slot
})
```

### fontIconProvider

```typescript
import { fontIconProvider } from '@jixoai/ui-plugin';

jxUI({
  icons: fontIconProvider({
    fontPath: './src/fonts/my-icons.woff2',  // or .ttf, .otf
    symbols: {
      calendar: 0xe901,  // unicode codepoints in your font
      clock: 0xe902,
      chevron: 0xe903,
    },
  }),
})
```

Extracts glyph outlines at build time via opentype.js and converts
them to SVG paths. WOFF2 files are automatically decompressed.
Requires `opentype.js` and `wawoff2` as optional dependencies.

### mixinIconProvider

```typescript
import { mixinIconProvider, lucideIconProvider, svgIconProvider } from '@jixoai/ui-plugin';

jxUI({
  icons: mixinIconProvider(
    lucideIconProvider(),  // base: all slots use lucide defaults
    {
      chevron: svgIconProvider({ dir: './src/chevrons' }),  // override one slot
    },
  ),
})
```

Override → base → null fallthrough. Override factories are created
once at build start.

## Icon slots

| Slot | Consumer | Technique |
|---|---|---|
| `calendar` | `jx-html-input ::-webkit-calendar-picker-indicator` | background-image |
| `clock` | `jx-html-input[type=time]` indicator | background-image |
| `chevron` | `jx-html-select` (native select) | background-image |
| `pipette` | `.jx-color-shell::after` (wrapper) | mask |
| `clear` | `jx-html-clear .jx-clear-glyph` | mask |

## Safety checker

```typescript
jxUI({
  icons: lucideIconProvider(),
  safety: { mode: 'error', maxBytes: 5120 },  // strict mode
})
```

Default: warn mode (logs + rejects unsafe SVG, falls back to lucide
defaults). Error mode: fails the build.

## How it works

```
Provider (Factory)                    Vite Plugin
┌──────────────────────┐             ┌─────────────────────┐
│ svgIconProvider      │             │ jxUI()              │
│ lucideIconProvider   │──(SvgAsset)─▶│ • reads font/svg    │
│ fontIconProvider     │             │ • WOFF2 decompress  │
│ mixinIconProvider    │             │ • HMR watching      │
└──────────────────────┘             │ • safety checking   │
                                     └───────┬─────────────┘
                                             │ serializeIcon()
                                             ▼
                                   ┌─────────────────────┐
                                   │ Virtual CSS Module  │
                                   │ @layer theme {      │
                                   │   :root {           │
                                   │     --jx-icon-*:    │
                                   │       url("data:")  │
                                   │   }                 │
                                   │ }                   │
                                   └─────────────────────┘
```

The plugin is OPTIONAL — without it, the jx-html standard layer's
inline lucide SVG fallbacks serve as defaults.

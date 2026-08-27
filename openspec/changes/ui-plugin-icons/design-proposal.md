# @jixoai/ui-plugin — icon provider architecture (design proposal)

> 2026-08-27, Owner directive: icons computed from files (not hardcoded
> data URIs); a general UI plugin package (vite + tailwind); provider
> pattern for icon customization (SVG / woff2 / mixin).

## 1. The problem

The jx-html standard layer hardcodes icon data URIs inline. Consumers
cannot customize the calendar/clock/chevron/pipette/clear icons without
editing CSS. The select chevron's CSS gradients misalign (Owner-reported).
The date/time picker indicators were lost in the V2 surgery (restored
as stopgap in 5b896a5).

## 2. The architecture

```
@jixoai/ui-plugin/
├── vite-plugin.ts               ← vite integration (build-time icon processing)
├── tailwind-plugin.ts           ← TW4 integration (registers @utility)
├── icon-providers/
│   ├── types.ts                 ← IconProvider interface + IconSlot
│   ├── svg.ts                   ← svgIconProvider: SVG file paths → data URIs
│   ├── lucide.ts                ← lucideIconProvider: embeds lucide SVG paths
│   ├── woff2.ts                 ← woff2IconProvider: font file + codepoints
│   └── mixin.ts                 ← mixinIconProvider(base, overrides)
└── index.ts
```

### 2.1 The IconProvider interface

```typescript
/** named icon slots in the standard layer */
type IconSlot =
  | 'calendar'    // date/datetime/month/week picker indicator
  | 'clock'       // time picker indicator
  | 'chevron'     // select dropdown arrow
  | 'pipette'     // color picker indicator
  | 'clear'       // input clear button (×)
  ; // extensible: future slots join this union

interface IconProvider {
  /** slot → CSS value for --jx-icon-{slot} (url() or content string) */
  getIcon(slot: IconSlot): string | null;
  /** additional global CSS (@font-face for woff2, etc.) */
  getGlobalCSS?(): string;
  /** the consumption mode: 'background-image' | 'font-content' */
  readonly mode: 'background-image' | 'font-content';
}
```

### 2.2 The providers

**svgIconProvider** — reads SVG files from a directory:
```typescript
svgIconProvider({ dir: './icons/' })
// → scans {dir}/*.svg → generates --jx-icon-{name}: url("data:image/svg+xml,...")
// also supports .webp → emitted as asset → url("/assets/...")
```

**lucideIconProvider** — embeds lucide SVG paths (the current defaults):
```typescript
lucideIconProvider()
// → uses the lucide-static package's SVG strings, selects the icons
//   matching the known slots, generates data URIs
// the CURRENT jx-html icons are already lucide (verified: calendar/
// clock/pipette/chevron-down/x paths match) — this is a drop-in default
```

**woff2IconProvider** — font-based icons:
```typescript
woff2IconProvider({
  fontPath: './my-icons.woff2',     // the font file
  family: 'my-icons',               // font-family name
  symbols: { calendar: '\e901', clock: '\e902', ... },
})
// → generates:
//   @font-face { font-family: 'my-icons'; src: url(woff2) ... }
//   --jx-icon-font: 'my-icons'
//   --jx-icon-calendar: '\e901'  (content value, not url)
// mode: 'font-content'
```

**mixinIconProvider** — compose with overrides:
```typescript
mixinIconProvider(lucideIconProvider(), {
  chevron: svgIconProvider({ dir: './my-chevrons/' }),
})
// → base = lucide; the chevron slot overridden with custom SVGs
// falls through: if the override returns null for a slot, the base
// provider's value is used
```

### 2.3 The vite plugin

```typescript
// vite.config.ts
import { jxUI, lucideIconProvider } from '@jixoai/ui-plugin';

export default {
  plugins: [
    sveltekit(),
    tailwindcss(),
    jxUI({
      icons: lucideIconProvider(),  // or woff2IconProvider({...}), or mixin
    }),
  ],
};
```

The plugin at build start:
1. Calls `provider.getIcon(slot)` for each known slot
2. Generates CSS custom properties: `--jx-icon-{slot}: {value}`
3. Calls `provider.getGlobalCSS()` (woff2 font-face, etc.)
4. Injects the generated CSS into the module graph (a virtual module
   that the entry CSS imports, or appended to the TW4 plugin's context)
5. For font-content mode: also generates the content-based rules

### 2.4 The standard layer integration

The jx-html utilities reference icon slots via custom properties:

```css
@utility jx-html-input {
  ...
  &::-webkit-calendar-picker-indicator {
    background-image: var(--jx-icon-calendar, /* fallback data URI */);
    background-size: contain;
    background-repeat: no-repeat;
  }
}

@utility jx-html-select {
  ...
  background-image: var(--jx-icon-chevron, /* fallback data URI */);
  background-position: right var(--jx-inset) center;
  background-size: var(--jx-icon);
  background-repeat: no-repeat;
}
```

For font-content mode, the plugin generates additional rules:
```css
[class*='jx-html-'] {
  --jx-icon-font: var(--jx-icon-font, 'my-icons');
}
.jx-html-input::-webkit-calendar-picker-indicator {
  background-image: none;
  font-family: var(--jx-icon-font);
  content: var(--jx-icon-calendar);
}
```

### 2.5 The select chevron fix

The CSS gradient chevron (two linear-gradients forming triangles) is
REPLACED by the `--jx-icon-chevron` slot (lucide chevron-down SVG).
This fixes the alignment issues AND unifies the icon system. The
stopgap is already in place (5b896a5) with a data URI fallback; the
plugin makes it configurable.

## 3. Fallback chain

1. Consumer's provider returns a value for the slot → use it
2. mixinIconProvider: override → base → fallback
3. No provider (plugin not installed): the standard layer's inline
   fallback data URIs (lucide) serve as the default

This means the plugin is OPTIONAL — the standard layer works without
it (with hardcoded lucide defaults), but the plugin enables
customization.

## 4. Questions for Codex

1. The virtual module approach vs injecting into jixoai.css: which is
   more robust for TW4's @import chain?
2. For woff2 mode: how do we handle the `content` property on UA
   pseudo-elements (::-webkit-calendar-picker-indicator doesn't support
   `content` — we may need background-image + a ::before overlay for
   font icons)?
3. Should the plugin also handle icon SIZING (--jx-icon per density)?
4. Package structure: monorepo sub-package or standalone?
5. The tailwind-plugin.ts — what TW4-specific features does it need
   beyond what the vite plugin provides? (The owner said this package
   exposes "vite-plugin/tailwind-plugin" — what's the TW4 plugin's
   scope beyond icons?)

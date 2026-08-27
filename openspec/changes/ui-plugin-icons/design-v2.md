# @jixoai/ui-plugin — unified SVG icon architecture (design v2)

> Owner ruling 2026-08-27: font files are a SOURCE for SVG extraction,
> not a separate consumption mode. All providers output SVG data URIs.
> One mode, zero exceptions.

## 1. The unified architecture

```
IconProvider (interface — always returns SVG)
├── svgIconProvider      ← reads .svg files from a directory
├── lucideIconProvider   ← embeds lucide SVG paths (built-in defaults)
├── fontIconProvider     ← extracts glyphs from ANY font as SVG
│   ├── .woff2           ← opentype.js parses
│   ├── .ttf / .otf      ← opentype.js parses
│   └── symbols: { slot → codepoint } mapping
└── mixinIconProvider    ← composes: base + per-slot overrides
```

ALL providers output: `--jx-icon-{slot}: url("data:image/svg+xml,...")`
The standard layer consumes: `background-image: var(--jx-icon-{slot})`

## 2. The fontIconProvider

```typescript
fontIconProvider({
  fontPath: './my-icons.woff2',     // any format opentype.js reads
  symbols: {
    calendar: 0xe901,               // codepoint in the font
    clock: 0xe902,
    chevron: 0xe903,
    // ... any slot mapped to any codepoint
  },
  viewBox: '0 0 24 24',             // normalize all glyphs to this
})
```

**Build-time pipeline** (inside the vite plugin):
1. Parse the font file → opentype.js gives us the font object
2. For each `(slot, codepoint)` pair:
   - `font.glyphs.get(codepoint)` → the glyph
   - `glyph.getPath(0, 0, fontSize)` → SVG path commands
   - Scale/normalize from font units to the target viewBox
   - Wrap: `<svg viewBox="0 0 24 24"><path d="{pathData}" fill="currentColor"/></svg>`
   - Encode as data URI
3. Output: `--jx-icon-calendar: url("data:image/svg+xml,...")`

**Why this works**:
- Filled glyph outlines are valid SVG paths — they render as
  background-images just like stroked lucide icons
- The viewBox normalization ensures consistent sizing across all
  icon sources (hand-drawn SVG, lucide, font glyphs)
- opentype.js runs in Node (build-time), not the browser — zero
  runtime cost
- Supports woff2, ttf, otf, and any format opentype.js handles

## 3. The IconProvider interface (simplified — no mode)

```typescript
interface IconProvider {
  /** slot → SVG data URI for --jx-icon-{slot} */
  getIcon(slot: IconSlot): string | null;  // returns url("data:...") or null
  /** additional CSS (rare — most providers return null) */
  getGlobalCSS?(): string;
}
```

No `mode` field. No font-content rules. No @font-face. One interface,
one output type.

## 4. The vite plugin

```typescript
// vite.config.ts
import { jxUI, lucideIconProvider } from '@jixoai/ui-plugin';

export default {
  plugins: [
    sveltekit(),
    tailwindcss(),
    jxUI({ icons: lucideIconProvider() }),  // or fontIconProvider({...})
  ],
};
```

The plugin:
1. At build start: calls `provider.getIcon(slot)` for each known slot
2. Generates a virtual CSS module: `--jx-icon-calendar: url(...); ...`
3. Injects into the vite module graph (virtual entry imported by
   the consumer's CSS entry, or auto-injected alongside jixoai.css)
4. Falls through: provider returns null → standard layer's inline
   fallback data URIs serve (lucide defaults)

**The plugin is OPTIONAL** — without it, the standard layer's inline
lucide data URIs are the defaults.

## 5. Slot-to-consumer matrix

| Slot | Standard layer consumer | Chromium | Firefox | Notes |
|---|---|---|---|---|
| calendar | jx-html-input ::-webkit-calendar-picker-indicator | ✓ | native fallback | date/month/week/datetime |
| clock | jx-html-input[type=time] indicator | ✓ | native fallback | time picker |
| chevron | jx-html-select background-image | ✓ | ✓ (as bg-image) | select dropdown |
| pipette | jx-html-color ::after mask | ✓ | ✓ | color picker (currently face-side) |
| clear | jx-html-input (× button component) | ✓ | ✓ | component-side (SVG injected via {@html}) |

## 6. Security & validation (Codex P1 items)

- SVGs are sanitized: no external references, no scripts, viewBox
  validated, deterministic encoding
- getIcon() returns structured values internally; the serializer
  generates the CSS string (no raw CSS injection from user files)
- Font paths extracted via opentype.js are inherently safe (path
  commands only, no arbitrary XML)

## 7. Package structure

```
packages/ui-plugin/           ← monorepo sub-package
  package.json                ← @jixoai/ui-plugin, peer/optional deps
  src/
    providers/
      types.ts                ← IconProvider + IconSlot
      svg.ts                  ← svgIconProvider
      lucide.ts               ← lucideIconProvider (inline defaults)
      font.ts                 ← fontIconProvider (opentype.js based)
      mixin.ts                ← mixinIconProvider
    vite-plugin.ts            ← the vite integration
    index.ts
  test/
    providers/                ← unit tests
    fixtures/                 ← sample SVGs + font files
```

## 8. Codex's four frozen principles (v2)

1. **Virtual CSS entry** (not jixoai.css injection)
2. **Per-slot capability** (but now trivially unified — all SVG)
3. **Theme owns sizing** — plugin provides artwork only; --jx-icon
   stays a density alias in jixoai.css
4. **Vite owns assets** — the plugin handles file I/O, virtual
   modules, HMR; no direct file access from providers

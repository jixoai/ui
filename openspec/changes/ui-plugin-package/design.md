# design — @jixoai/ui-plugin (frozen architecture)

> Codex review rounds r0-r2 integrated. The five P0 items from the
> icon architecture review are addressed below.

## 1. The unified architecture

```
IconProvider (always returns SvgAsset — structured, not raw CSS)
├── svgIconProvider      ← reads .svg files from a directory
├── lucideIconProvider   ← embeds lucide SVG paths (defaults)
├── fontIconProvider     ← extracts glyphs from ANY font as SVG
│   ├── .woff2 / .ttf / .otf  ← opentype.js parses (build-time)
│   └── symbols: { slot → codepoint } mapping
└── mixinIconProvider    ← composes: base + per-slot overrides

Serializer (the ONLY code that generates CSS):
  SvgAsset → url("data:image/svg+xml,...") custom property

Vite plugin (the ONLY file I/O + asset handler):
  virtual CSS module → consumer's entry imports it explicitly
```

## 2. The SvgAsset interface (structured — no raw CSS from providers)

```typescript
/** a validated SVG icon, ready for serialization */
interface SvgAsset {
  /** the SVG element tree (whitelist-validated) */
  readonly svg: string;           // the complete <svg>...</svg> string
  /** the viewBox it was normalized to */
  readonly viewBox: { width: number; height: number };
  /** whether the artwork is fill-based (font glyphs) or stroke-based (lucide) */
  readonly nature: 'fill' | 'stroke';
  /** source metadata for the safety checker */
  readonly source: {
    readonly kind: 'file' | 'inline' | 'font-glyph';
    readonly path?: string;        // for file sources
    readonly codepoint?: number;   // for font-glyph sources
  };
}

interface IconProvider {
  /** slot → structured SVG asset (or null = "not my slot") */
  getIcon(slot: IconSlot): SvgAsset | null;
}
```

## 3. The serializer (single CSS generation point)

```typescript
/** serializer output modes */
type SerializeMode = 'css-var' | 'dom-string';

/** the ONLY function that turns SvgAsset → consumable output */
function serializeIcon(asset: SvgAsset, mode: SerializeMode = 'css-var'): string {
  // validates the SVG against the safety checker
  // mode 'css-var': encodes as data URI → url("data:image/svg+xml,...")
  // mode 'dom-string': returns the sanitized SVG string for {@html} injection
  //   (the clear slot's × button uses this mode — DOM injection, not CSS)
}
```

**DOM safety contract** (for the 'dom-string' mode used by the clear slot):
- The safety checker runs BEFORE serialization in BOTH modes — no
  unvalidated SVG ever reaches output
- In 'error' mode: a failed check blocks the build
- In 'warn' mode (default): a failed check logs a warning AND the
  SVG is **rejected** (not silently passed through) — the inline
  lucide fallback serves instead. Warning mode means "don't crash the
  build", NOT "let unvalidated content through"
- Without the plugin: the standard layer's inline lucide SVGs serve
  (they are pre-validated, baked into the source)

**CSS wrapping**: the vite plugin generates the virtual CSS module with:
```css
@layer theme {
  :root {
    --jx-icon-calendar: url("data:image/svg+xml,...");
    --jx-icon-clock: url("data:image/svg+xml,...");
    ...
  }
}
```
The `@layer theme` + `:root` wrapper ensures the custom properties
participate in the cascade correctly (they can be overridden by
consumer :root rules at equal or later specificity).

## 4. The slot registry (extensible, versioned)

```typescript
type IconSlot =
  | 'calendar'    // date/datetime/month/week picker indicator
  | 'clock'       // time picker indicator
  | 'chevron'     // select dropdown arrow
  | 'pipette'     // color picker indicator
  | 'clear'       // input clear button (×)
  ;

/** per-consumer capability (a slot may have multiple consumers with different techniques) */
interface ConsumerCapability {
  readonly consumer: string;        // e.g. 'jx-html-input ::-webkit-calendar-picker-indicator'
  readonly technique: 'background-image' | 'mask' | 'inline-svg';
  readonly browsers: 'chromium' | 'firefox' | 'webkit' | 'all';
  readonly notes?: string;
}

interface SlotDefinition {
  readonly slot: IconSlot;
  readonly consumers: readonly ConsumerCapability[];
}

/** the CONCRETE registry — iterable at build time (the vite plugin walks this) */
const SLOT_REGISTRY: Readonly<Record<IconSlot, SlotDefinition>> = {
  calendar: { slot: 'calendar', consumers: [
    { consumer: 'jx-html-input ::-webkit-calendar-picker-indicator', technique: 'background-image', browsers: 'chromium', notes: 'Firefox/WebKit fall back to native indicator' },
  ]},
  clock: { slot: 'clock', consumers: [
    { consumer: 'jx-html-input[type=time] ::-webkit-calendar-picker-indicator', technique: 'background-image', browsers: 'chromium', notes: 'same as calendar' },
  ]},
  chevron: { slot: 'chevron', consumers: [
    { consumer: 'jx-html-select (native select)', technique: 'background-image', browsers: 'all', notes: 'replaces CSS gradients (alignment fix)' },
    // composite components (select.svelte, date-picker, combobox) render their own
    // inline SVG chevrons — out of scope for the FIRST plugin release; they join
    // via future slot consumers once their DOM contracts are isomorphism-gated
  ]},
  pipette: { slot: 'pipette', consumers: [
    { consumer: 'jx-html-color ::after', technique: 'mask', browsers: 'all' },
  ]},
  clear: { slot: 'clear', consumers: [
    { consumer: 'input component × button', technique: 'inline-svg', browsers: 'all', notes: 'the component injects via {@html}; the provider exports a raw SVG string for DOM injection (NOT a data URI — the serializer has a DOM-safe mode)' },
  ]},
} as const;

/** all registered slot names (for iteration) */
const SLOT_NAMES = Object.keys(SLOT_REGISTRY) as IconSlot[];
```

### The capability matrix

| Slot | Consumer | Technique | Chromium | Firefox | WebKit | Notes |
|---|---|---|---|---|---|---|
| calendar | jx-html-input ::-webkit-calendar-picker-indicator | background-image | ✓ | native fallback | native fallback | FF has no equivalent pseudo |
| clock | jx-html-input[type=time] indicator | background-image | ✓ | native fallback | native fallback | same |
| chevron | jx-html-select background-image | background-image | ✓ | ✓ | ✓ | replaces CSS gradients (fixes alignment) |
| pipette | jx-html-color ::after | mask | ✓ | ✓ | ✓ | currently face-side; moves to standard layer |
| clear | component-side (× button) | inline-svg | ✓ | ✓ | ✓ | component uses {@html icons.x}; slot provides the SVG string |

## 5. The safety checker (configurable, default warn)

```typescript
interface SafetyCheckerConfig {
  /** 'warn' = log issues, don't block (default for local files) */
  /** 'error' = fail the build (opt-in, for HTTP-sourced icons) */
  mode: 'warn' | 'error';
  /** max SVG byte size (default: 10KB per icon) */
  maxBytes?: number;
  /** max path command count (default: 500) */
  maxPathCommands?: number;
  /** allowed elements (if empty, no element check) */
  allowedElements?: string[];
  /** disallowed elements (always checked) */
  disallowedElements?: string[]; // default: script, foreignObject, use
}

/** built-in checker; consumers can replace with their own */
function createSafetyChecker(config: SafetyCheckerConfig): SafetyChecker;
```

**Owner ruling on safety**: the built-in checker defaults to warning
mode — SVG complexity causes false positives with aggressive
whitelists. Error mode is opt-in (for HTTP-sourced icons). Local
build-pipeline files are trusted by default.

## 6. The fontIconProvider (font-to-SVG extraction)

**SourceDescriptor** — the vite plugin's contract with providers (the
plugin reads files; providers only receive loaded data):

```typescript
/** what the vite plugin passes to a provider factory */
interface SourceDescriptor {
  /** raw file bytes (already loaded by the plugin — providers never do I/O) */
  readonly data: Uint8Array;
  /** the resolved file path (for metadata/logging, NOT for reading) */
  readonly path: string;
  /** the mime type (image/svg+xml, font/woff2, etc.) */
  readonly mimeType: string;
}

fontIconProvider({
  /** received from the vite plugin at build start */
  source: SourceDescriptor;
  symbols: { [slot in IconSlot]?: number };  // slot → unicode codepoint
  viewBox: { width: number; height: number }; // normalize to this (default 24×24)
})
```

**Pipeline** (build-time, in the vite plugin):
1. The vite plugin reads the font file bytes (providers never touch the filesystem)
2. **WOFF2 decompression**: the plugin decompresses WOFF2 to TTF bytes
   using `wawoff2` (a WASM Brotli decompressor) BEFORE parsing —
   opentype.js does NOT handle WOFF2 internally. For TTF/OTF: pass
   bytes directly.
3. opentype.js parses the decompressed font → `font.charToGlyph(char)`
   for the Unicode codepoint (NOT glyph index — the charToGlyph API
   does the cmap lookup)
4. `glyph.getPath(0, 0, fontSize)` → SVG path commands
5. Scale/normalize from font units (unitsPerEm) to the target viewBox
6. Wrap: `<svg viewBox="0 0 W H"><path d="{pathData}" fill="currentColor"/></svg>`
7. Return as SvgAsset with `nature: 'fill'`

**Font format contract** (the frozen boundary):
- `ctx.loadSource(path)` AUTO-DETECTS the font format from the magic bytes:
  - TTF/OTF: returns SourceDescriptor with raw bytes (mimeType: 'font/ttf')
  - WOFF2: runs `wawoff2.decompress(buffer)` → returns SourceDescriptor
    with DECOMPRESSED TTF bytes (mimeType: 'font/ttf', path unchanged
    for metadata, the decompression is transparent to the provider)
- Providers ALWAYS receive parseable TTF/OTF bytes in
  `SourceDescriptor.data` — they call `opentype.parse(data)` directly,
  with ZERO format-detection or decompression logic
- The decompressor (`wawoff2`) is a plugin-level optional dependency;
  if absent and a WOFF2 file is loaded, loadSource throws with a clear
  error ("install wawoff2 or convert to TTF")
- Unicode cmap lookup: `font.charToGlyph(String.fromCodePoint(codepoint))`
- Glyph positioning: the font's own advance width + bounding box,
  normalized to the viewBox

## 7. The vite plugin

```typescript
// consumer's vite.config.ts
import { jxUI, lucideIconProvider } from '@jixoai/ui-plugin';

export default {
  plugins: [
    sveltekit(),
    tailwindcss(),
    jxUI({ icons: lucideIconProvider() }),
  ],
};
```

**The plugin**:
1. Resolves the provider's font/svg file references → reads bytes (the ONLY file I/O)
2. Calls `provider.getIcon(slot)` for each registered slot
3. Serializes: `serializeIcon(asset)` → CSS custom property values
4. Generates a virtual CSS module: `--jx-icon-calendar: url(...); ...`
5. The consumer's CSS entry imports it: `@import 'virtual:@jixoai/ui-plugin/icons';`
6. HMR: file changes → re-extract → update virtual module

**The virtual import is the ONLY injection path** (Codex frozen principle #1). No auto-injection alongside jixoai.css.

## 8. The mixinIconProvider

```typescript
// mixinIconProvider composes FACTORIES (all async, like the providers they create):
mixinIconProvider(
  lucideIconProvider(),  // base: IconProviderFactory
  {
    chevron: svgIconProvider({ dir: './my-chevrons/' }),  // override factory for one slot
  },
)  // → IconProviderFactory (the vite plugin awaits it)
```

For each slot: the override provider's `getIcon(slot)` is called first;
if it returns null, the base provider's result is used; if both return
null, the standard layer's inline fallback serves.

## 9. Package structure

```
packages/ui-plugin/
  package.json              ← @jixoai/ui-plugin
  tsconfig.json
  src/
    types.ts                ← IconSlot, SvgAsset, IconProvider, SlotDefinition
    serializer.ts            ← serializeIcon() — the ONLY CSS generation
    safety.ts                ← createSafetyChecker()
    providers/
      svg.ts                ← svgIconProvider
      lucide.ts             ← lucideIconProvider (inline defaults)
      font.ts               ← fontIconProvider (opentype.js)
      mixin.ts              ← mixinIconProvider
    vite-plugin.ts          ← jxUI() — the vite integration
    index.ts                ← public API
  test/
    providers/              ← unit tests per provider
    fixtures/
      icons/                ← sample SVG files
      fonts/                ← sample woff2/ttf files
    serializer.test.ts
    safety.test.ts
    vite-plugin.test.ts     ← integration test
```

**Dependencies**:
- `opentype.js` — peer/optional (only needed for fontIconProvider)
- `vite` — peer (the plugin type)
- No lucide-static dependency — the lucide SVG paths are embedded inline (5 icons, ~2KB)

## 10. Standard layer integration

The jx-html utilities reference icon slots with inline lucide fallbacks:

```css
@utility jx-html-input {
  ...
  &::-webkit-calendar-picker-indicator {
    background-image: var(--jx-icon-calendar,
      url("data:image/svg+xml,...")  /* lucide calendar fallback */
    );
  }
}

@utility jx-html-select {
  ...
  background-image: var(--jx-icon-chevron,
    url("data:image/svg+xml,...")  /* lucide chevron-down fallback */
  );
}
```

Without the plugin: fallbacks serve (lucide defaults).
With the plugin: custom properties override the fallbacks.

## 10a. Ink variants (face-only, declared)

The `--jx-icon-calendar-ink` / `--jx-icon-clock-ink` /
`--jx-icon-valid-ink` / `--jx-icon-invalid-ink` variables in
jx-pure.css are FACE-ONLY (they serve UA-shadow pseudos that reject
author mask paint — the path-(c) ink fallback with .dark/.jx-light
flips). They are NOT part of the slot registry and are NOT
overridable by the plugin. If a future need arises, they join the
registry via a versioned addition.

## 10b. Override priority (face variables vs plugin virtual CSS)

The face (jx-pure.css) currently declares icon custom properties on
unlayered `:root`. The plugin generates `@layer theme { :root { ... } }`.
Unlayered declarations ALWAYS beat layered ones — the plugin's vars
would be silently overridden.

**Integration requirement**: during P4.2 (standard layer integration),
the face's icon custom properties MUST move into `@layer theme` so the
cascade ordering is: `@layer theme` (face defaults) → `@layer theme`
(plugin virtual CSS, later in import order wins at equal specificity)
→ consumer `:root` overrides (unlayered, always win).

This is a P4 task, not a P2/P3 blocker — the plugin and providers
work correctly in isolation; the override takes effect once the face
variables are layered during integration.

## 11. Frozen principles (Codex r0-r2, binding)

1. **Virtual CSS entry is the ONLY injection path** (no auto-inject)
2. **Per-slot capability matrix maintained** (UA/background/mask/inline are different surfaces)
3. **Theme owns sizing** — provider only artwork; --jx-icon stays a density alias
4. **Vite owns ALL file I/O** — providers receive loaded bytes, not paths

import { Plugin } from "vite";

//#region src/types.d.ts

/**
 * @jixoai/ui-plugin — core types (P1.2)
 *
 * The unified icon architecture: providers return structured SvgAsset
 * objects; the serializer is the only code that generates CSS; the
 * vite plugin reads files and passes SourceDescriptor data to
 * providers (providers never do filesystem I/O).
 */
/** named icon slots in the standard layer (extensible via versioned additions) */
type IconSlot = 'calendar' | 'clock' | 'chevron' | 'pipette' | 'clear';
/** per-consumer capability — a slot may have multiple consumers with different techniques */
interface ConsumerCapability {
  /** which element/rule consumes the icon */
  readonly consumer: string;
  /** how the icon is painted */
  readonly technique: 'background-image' | 'mask' | 'inline-svg';
  /** browser support */
  readonly browsers: 'chromium' | 'firefox' | 'webkit' | 'all';
  /** support notes */
  readonly notes?: string;
}
interface SlotDefinition {
  readonly slot: IconSlot;
  readonly consumers: readonly ConsumerCapability[];
}
/** the CONCRETE registry — iterable at build time (the vite plugin walks this) */
declare const SLOT_REGISTRY: Readonly<Record<IconSlot, SlotDefinition>>;
/** all registered slot names (for iteration) */
declare const SLOT_NAMES: IconSlot[];
/** a validated SVG icon, ready for serialization */
interface SvgAsset {
  /** the complete <svg>...</svg> string (safety-checked) */
  readonly svg: string;
  /** the viewBox it was normalized to */
  readonly viewBox: {
    readonly width: number;
    readonly height: number;
  };
  /** whether the artwork is fill-based (font glyphs) or stroke-based (lucide) */
  readonly nature: 'fill' | 'stroke';
  /** source metadata for the safety checker */
  readonly source: {
    readonly kind: 'file' | 'inline' | 'font-glyph';
    readonly path?: string;
    readonly codepoint?: number;
  };
}
/** what the vite plugin passes to a provider factory (the plugin does ALL file I/O) */
interface SourceDescriptor {
  /** raw file bytes (already loaded by the plugin — providers never do I/O) */
  readonly data: Uint8Array;
  /** the resolved file path (for metadata/logging, NOT for reading) */
  readonly path: string;
  /** the mime type AFTER normalization (image/svg+xml, font/ttf;
   * WOFF2 is transparently decompressed by loadSource — never font/woff2) */
  readonly mimeType: string;
}
/** what the vite plugin passes to a provider factory — the ONLY path to file I/O */
interface ProviderContext {
  /** load a file by path → SourceDescriptor (the plugin's I/O) */
  loadSource(path: string): Promise<SourceDescriptor>;
  /** register a file for HMR watching */
  watchFile(path: string, onChange: () => void): void;
}
/** a provider factory — async (font parsing is async); the vite plugin calls it at build start */
type IconProviderFactory = (context: ProviderContext) => Promise<IconProvider>;
/** the unified provider interface — all providers return SvgAsset (sync after factory init) */
interface IconProvider {
  /** slot → structured SVG asset (or null = "not my slot") */
  getIcon(slot: IconSlot): SvgAsset | null;
}
/** serializer output modes */
type SerializeMode = 'css-var' | 'dom-string';
interface SafetyCheckerConfig {
  /** 'warn' = log issues, don't block (default for local files) */
  /** 'error' = fail the build (opt-in, for HTTP-sourced icons) */
  mode: 'warn' | 'error';
  /** max SVG byte size (default: 10KB per icon) */
  maxBytes?: number;
  /** max path command count (default: 500) */
  maxPathCommands?: number;
  /** disallowed elements (always checked) */
  disallowedElements?: string[];
}
/** a safety issue found by the checker */
interface SafetyIssue {
  readonly severity: 'warning' | 'error';
  readonly message: string;
  readonly slot?: IconSlot;
  readonly source?: string;
}
/** the result of a safety check */
interface SafetyResult {
  readonly issues: readonly SafetyIssue[];
  readonly passed: boolean;
}
/** the safety checker interface */
interface SafetyChecker {
  check(svg: string, source?: string): SafetyResult;
}
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region src/providers/svg.d.ts
/** options for {@link svgIconProvider} */
interface SvgIconProviderOptions {
  /** directory containing the .svg files (resolved via ctx.loadSource) */
  readonly dir: string;
  /**
   * Per-slot filename overrides. When provided, the provider serves
   * ONLY the listed slots (each loading `{dir}/{filename}`) — this is
   * how a mixin override scopes itself to one slot. When omitted, all
   * registered slots are served with their default `{slot}.svg`
   * filenames.
   */
  readonly slots?: Partial<Record<IconSlot, string>>;
}
/**
 * A file-based icon provider backed by .svg files in one directory.
 *
 * @example
 * ```ts
 * // full directory: all five slots, default filenames
 * svgIconProvider({ dir: './src/assets/icons' })
 *
 * // scoped override (mixin): only the chevron slot, custom filename
 * svgIconProvider({ dir: './src/assets/icons', slots: { chevron: 'down.svg' } })
 * ```
 */
declare function svgIconProvider(options: SvgIconProviderOptions): IconProviderFactory;
//# sourceMappingURL=svg.d.ts.map
//#endregion
//#region src/providers/lucide.d.ts
/**
 * The default icon provider: every registered slot serves embedded
 * lucide artwork, source kind 'inline', nature 'stroke'.
 *
 * @example
 * ```ts
 * jxUI({ icons: lucideIconProvider() })
 * ```
 */
declare function lucideIconProvider(): IconProviderFactory;
//# sourceMappingURL=lucide.d.ts.map
//#endregion
//#region src/providers/font.d.ts
interface FontIconProviderOptions {
  /** font file path — resolved + read by the vite plugin (never by us) */
  readonly fontPath: string;
  /** slot → Unicode codepoint mapping (cmap lookup, NOT glyph index) */
  readonly symbols: { readonly [slot in IconSlot]?: number };
  /** target viewBox (default 24×24, the lucide convention) */
  readonly viewBox?: {
    readonly width: number;
    readonly height: number;
  };
}
/**
 * Build an IconProviderFactory that extracts font glyphs as SVG paths.
 * The vite plugin awaits the factory at build start; the returned
 * provider answers getIcon() synchronously from the pre-built cache.
 */
declare function fontIconProvider(options: FontIconProviderOptions): IconProviderFactory;
//# sourceMappingURL=font.d.ts.map
//#endregion
//#region src/providers/mixin.d.ts
/** per-slot override factories — omitted slots always use the base provider */
type IconProviderOverrides = { readonly [K in IconSlot]?: IconProviderFactory };
/**
 * Compose provider factories: `mixinIconProvider(base, { chevron: customChevrons })`
 * answers every slot from `base` except where an override provides one.
 */
declare function mixinIconProvider(base: IconProviderFactory, overrides: IconProviderOverrides): IconProviderFactory;
//# sourceMappingURL=mixin.d.ts.map

//#endregion
//#region src/serializer.d.ts
/**
 * Serialize a structured SVG asset into its consumable form.
 *
 * @param asset   the SvgAsset to serialize
 * @param mode    'css-var' (default) → CSS custom property value;
 *                'dom-string' → raw SVG string for {@html} injection
 * @param checker optional safety checker; when omitted the asset is
 *                serialized UNCHECKED (trusted local build-pipeline
 *                files — design.md §5)
 * @returns the serialized string, or null when a warn-mode check
 *          rejected the asset (the caller falls back)
 * @throws when an error-mode check fails (opt-in, HTTP-sourced icons)
 */
declare function serializeIcon(asset: SvgAsset, mode?: SerializeMode, checker?: SafetyChecker): string | null;
/**
 * Walk every registered slot and serialize whatever the lookup supplies.
 * SLOT_NAMES (derived from SLOT_REGISTRY in types.ts) is consumed here —
 * the slot registry is defined exactly once, in types.ts.
 *
 * Slots the provider does not serve — or whose asset fails a warn-mode
 * check — are omitted from the result, so the standard layer's inline
 * fallbacks serve for them.
 *
 * @param getIcon  a slot → SvgAsset lookup (an IconProvider's getIcon)
 * @param mode     passed through to serializeIcon
 * @param checker  passed through to serializeIcon
 * @throws when an error-mode check fails (propagates — the build fails)
 */
declare function serializeAllSlots(getIcon: (slot: IconSlot) => SvgAsset | null, mode?: SerializeMode, checker?: SafetyChecker): Partial<Record<IconSlot, string>>;
//# sourceMappingURL=serializer.d.ts.map
//#endregion
//#region src/safety.d.ts
/**
 * Create the built-in SVG safety checker.
 *
 * @param config `mode` is required ('warn' logs + lets the serializer
 *               reject; 'error' lets the serializer throw). `maxBytes`
 *               (default 10240), `maxPathCommands` (default 500) and
 *               `disallowedElements` (default script/foreignObject/use)
 *               override the built-in limits.
 */
declare function createSafetyChecker(config: SafetyCheckerConfig): SafetyChecker;
//# sourceMappingURL=safety.d.ts.map

//#endregion
//#region src/vite-plugin.d.ts
/** jxUI() plugin options */
interface JxUIPluginOptions {
  /** the icon provider factory — awaited at build start with a ProviderContext */
  readonly icons: IconProviderFactory;
}
/**
 * create the @jixoai/ui-plugin vite plugin.
 *
 * ```ts
 * // vite.config.ts
 * import { jxUI, lucideIconProvider } from '@jixoai/ui-plugin';
 * export default { plugins: [sveltekit(), tailwindcss(), jxUI({ icons: lucideIconProvider() })] };
 * ```
 */
declare function jxUI(options: JxUIPluginOptions): Plugin;
//# sourceMappingURL=vite-plugin.d.ts.map

//#endregion
export { type ConsumerCapability, type FontIconProviderOptions, type IconProvider, type IconProviderFactory, type IconProviderOverrides, type IconSlot, type JxUIPluginOptions, type ProviderContext, SLOT_NAMES, SLOT_REGISTRY, type SafetyChecker, type SafetyCheckerConfig, type SafetyIssue, type SafetyResult, type SerializeMode, type SlotDefinition, type SourceDescriptor, type SvgAsset, type SvgIconProviderOptions, createSafetyChecker, fontIconProvider, jxUI, lucideIconProvider, mixinIconProvider, serializeAllSlots, serializeIcon, svgIconProvider };
//# sourceMappingURL=index-BIHI9CBt.d.ts.map
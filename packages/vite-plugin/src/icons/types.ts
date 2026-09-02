/**
 * @jixoai/vite-plugin (icons) — core types (P1.2)
 *
 * The unified icon architecture: providers return structured SvgAsset
 * objects; the serializer is the only code that generates CSS; the
 * vite plugin reads files and passes SourceDescriptor data to
 * providers (providers never do filesystem I/O).
 */

// ── Icon slots ─────────────────────────────────────────────────────

/** named icon slots in the standard layer (extensible via versioned additions) */
export type IconSlot =
  | 'calendar'
  | 'clock'
  | 'chevron'
  | 'palette'
  | 'clear'
  | 'mail'
  | 'search'
  | 'check'
  | 'invalid'
  ;

/** per-consumer capability — a slot may have multiple consumers with different techniques */
export interface ConsumerCapability {
  /** which element/rule consumes the icon */
  readonly consumer: string;
  /** how the icon is painted */
  readonly technique: 'background-image' | 'mask' | 'inline-svg';
  /** browser support */
  readonly browsers: 'chromium' | 'firefox' | 'webkit' | 'all';
  /** support notes */
  readonly notes?: string;
}

export interface SlotDefinition {
  readonly slot: IconSlot;
  readonly consumers: readonly ConsumerCapability[];
  /**
   * does the slot write a plain `--jx-icon-<slot>` line? `invalid` is
   * ink-only — the vocabulary declares no plain invalid variable, so
   * covering the concept bakes ONLY its derived ink (icons-docs §1).
   */
  readonly plain: boolean;
  /**
   * does the slot join the `.dark`/`.jx-light` ink matrix? `palette`
   * paints through a mask + currentColor background (theme-agnostic —
   * the sheet declares no palette lines to flip); everything else the
   * vocabulary serves flips, because black data-URI ink vanishes on
   * the dark token sheet.
   */
  readonly flipsInDark: boolean;
}

/** the CONCRETE registry — iterable at build time (the vite plugin walks this) */
export const SLOT_REGISTRY: Readonly<Record<IconSlot, SlotDefinition>> = {
  calendar: {
    slot: 'calendar',
    plain: true,
    flipsInDark: true,
    consumers: [
      {
        consumer: 'jx-html-input ::-webkit-calendar-picker-indicator',
        technique: 'background-image',
        browsers: 'chromium',
        notes: 'Firefox/WebKit fall back to native indicator',
      },
    ],
  },
  clock: {
    slot: 'clock',
    plain: true,
    flipsInDark: true,
    consumers: [
      {
        consumer: 'jx-html-input[type=time] ::-webkit-calendar-picker-indicator',
        technique: 'background-image',
        browsers: 'chromium',
        notes: 'same as calendar',
      },
    ],
  },
  chevron: {
    slot: 'chevron',
    plain: true,
    flipsInDark: true,
    consumers: [
      {
        consumer: 'jx-html-select (native select)',
        technique: 'background-image',
        browsers: 'all',
        notes: 'replaces CSS gradients (alignment fix)',
      },
    ],
  },
  palette: {
    slot: 'palette',
    plain: true,
    flipsInDark: false,
    consumers: [
      {
        consumer: '.jx-color-shell::after mask reading --jx-icon-palette',
        technique: 'mask',
        browsers: 'all',
        notes: 'wrapper paints it (input[type=color] is a replaced element); currentColor themes it — no ink flip',
      },
    ],
  },
  clear: {
    slot: 'clear',
    plain: true,
    flipsInDark: true,
    consumers: [
      {
        consumer: 'input component × button',
        technique: 'mask',
        browsers: 'all',
        notes: 'CSS mask on .jx-clear-glyph reading --jx-icon-clear',
      },
      {
        consumer:
          "input/control/control-lane [type=search] ::-webkit-search-cancel-button",
        technique: 'background-image',
        browsers: 'chromium',
        notes: 'the UA cancel ornament repaints as the suffix-icon standard (2026-08-29); Firefox renders no cancel ornament',
      },
    ],
  },
  mail: {
    slot: 'mail',
    plain: true,
    flipsInDark: true,
    consumers: [
      {
        consumer: "jx-html-input[type=email] / jx-html-control-lane[type=email] background-image",
        technique: 'background-image',
        browsers: 'all',
        notes: 'Envelope icon at inline-start',
      },
    ],
  },
  search: {
    slot: 'search',
    plain: true,
    flipsInDark: true,
    consumers: [
      {
        consumer: "jx-html-input[type=search] / jx-html-control-lane[type=search] background-image",
        technique: 'background-image',
        browsers: 'all',
        notes: 'Magnifier icon at inline-start',
      },
    ],
  },
  check: {
    slot: 'check',
    plain: true,
    flipsInDark: true,
    consumers: [
      {
        consumer: '.jx-combobox-check mask reading --jx-icon-check',
        technique: 'mask',
        browsers: 'all',
        notes: 'combobox selected-row indicator, painted var(--primary) (ICON-2, 2026-09-02)',
      },
    ],
  },
  invalid: {
    slot: 'invalid',
    plain: false,
    flipsInDark: true,
    consumers: [
      {
        consumer: "input/textarea[aria-invalid='true'] background-image reading --jx-icon-invalid-ink",
        technique: 'background-image',
        browsers: 'all',
        notes: 'ink quartet (css-laws icon-vocab INK_QUARTET) — ink-only concept: no plain variable',
      },
    ],
  },
} as const;

/** all registered slot names (for iteration) */
export const SLOT_NAMES = Object.keys(SLOT_REGISTRY) as IconSlot[];

// ── SvgAsset ───────────────────────────────────────────────────────

/** a validated SVG icon, ready for serialization */
export interface SvgAsset {
  /** the complete <svg>...</svg> string (safety-checked) */
  readonly svg: string;
  /** the viewBox it was normalized to */
  readonly viewBox: { readonly width: number; readonly height: number };
  /** whether the artwork is fill-based (font glyphs) or stroke-based (lucide) */
  readonly nature: 'fill' | 'stroke';
  /** source metadata for the safety checker */
  readonly source: {
    readonly kind: 'file' | 'inline' | 'font-glyph';
    readonly path?: string;
    readonly codepoint?: number;
  };
}

// ── SourceDescriptor ───────────────────────────────────────────────

/** what the vite plugin passes to a provider factory (the plugin does ALL file I/O) */
export interface SourceDescriptor {
  /** raw file bytes (already loaded by the plugin — providers never do I/O) */
  readonly data: Uint8Array;
  /** the resolved file path (for metadata/logging, NOT for reading) */
  readonly path: string;
  /** the mime type AFTER normalization (image/svg+xml, font/ttf;
   * WOFF2 is transparently decompressed by loadSource — never font/woff2) */
  readonly mimeType: string;
}

// ── Provider lifecycle ─────────────────────────────────────────────

/** what the vite plugin passes to a provider factory — the ONLY path to file I/O */
export interface ProviderContext {
  /** load a file by path → SourceDescriptor (the plugin's I/O) */
  loadSource(path: string): Promise<SourceDescriptor>;
  /** register a file for HMR watching */
  watchFile(path: string, onChange: () => void): void;
}

/** a provider factory — async (font parsing is async); the vite plugin calls it at build start */
export type IconProviderFactory = (context: ProviderContext) => Promise<IconProvider>;

// ── IconProvider ───────────────────────────────────────────────────

/** the unified provider interface — all providers return SvgAsset (sync after factory init) */
export interface IconProvider {
  /** slot → structured SVG asset (or null = "not my slot") */
  getIcon(slot: IconSlot): SvgAsset | null;
}

// ── Serializer ─────────────────────────────────────────────────────

/** serializer output modes */
export type SerializeMode = 'css-var' | 'dom-string';

// ── Safety ─────────────────────────────────────────────────────────

export interface SafetyCheckerConfig {
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
export interface SafetyIssue {
  readonly severity: 'warning' | 'error';
  readonly message: string;
  readonly slot?: IconSlot;
  readonly source?: string;
}

/** the result of a safety check */
export interface SafetyResult {
  readonly issues: readonly SafetyIssue[];
  readonly passed: boolean;
}

/** the safety checker interface */
export interface SafetyChecker {
  check(svg: string, source?: string): SafetyResult;
}

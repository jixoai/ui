/**
 * jixoai PrintPageConfig (lib/print/page-config.ts, print-pipeline,
 * 2026-08-30) — the CONSTRAINED GRAMMAR for @page authoring.
 *
 * Design law (design.md «PrintPageConfig 受限语法»): structured values
 * + a validator; the compiler REFUSES bare string concatenation —
 * every value that reaches CSS has been parsed into this module's
 * domain first. Invalid input is rejected with a named error and NO
 * @page rule is emitted for it (the verifier scenario: margin
 * { top: -1 } → validator rejects, no output).
 *
 * The compiled text is fed to the paged.js kernel as its own
 * stylesheet object ({ url: cssText }) — never injected into the
 * document's own sheets.
 */

/** physical units the grammar accepts */
export type LengthUnit = 'mm' | 'cm' | 'in';

/** a structured size: numbers + one shared unit */
export interface StructuredSize {
  readonly width: number;
  readonly length: number;
  readonly unit: LengthUnit;
}

/** named paper sizes (the paged.js sizes table's two common entries) */
export type NamedSize = 'A4' | 'Letter';

export type PageSize = NamedSize | StructuredSize;

/** four-sided margin: numbers + one shared unit */
export interface StructuredMargin {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
  readonly unit: LengthUnit;
}

export type Marks = 'crop' | 'cross' | 'both';

/**
 * A margin-box content token: the two counters, or the NAME of a
 * string-set the content CSS defines (e.g. `chapterTitle`). The enum
 * lives here so the compiler never interpolates raw strings.
 */
export type HeaderFooterToken = 'counter(page)' | 'counter(pages)' | `string:${string}`;

/** which margin box (the css-page-3 subset the kernel compiles) */
export type MarginBoxSlot =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface PrintPageConfig {
  readonly size?: PageSize;
  readonly margin?: StructuredMargin;
  readonly marks?: Marks;
  readonly header?: Partial<Record<MarginBoxSlot, HeaderFooterToken>>;
  readonly footer?: Partial<Record<MarginBoxSlot, HeaderFooterToken>>;
}

// ---- validation -----------------------------------------------------------

export class PageConfigError extends Error {
  constructor(message: string) {
    super(`[print/page-config] ${message}`);
    this.name = 'PageConfigError';
  }
}

const UNITS: readonly LengthUnit[] = ['mm', 'cm', 'in'];
const MARKS: readonly Marks[] = ['crop', 'cross', 'both'];
const SIZES: readonly NamedSize[] = ['A4', 'Letter'];
const BOX_SLOTS: readonly MarginBoxSlot[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];
const TOKEN_RE = /^(counter\(page\)|counter\(pages\)|string:[A-Za-z][A-Za-z0-9_-]*)$/;

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

function expectUnit(value: unknown, where: string): LengthUnit {
  if (typeof value !== 'string' || !UNITS.includes(value as LengthUnit)) {
    throw new PageConfigError(`${where}: unknown unit ${JSON.stringify(value)} (mm | cm | in)`);
  }
  return value as LengthUnit;
}

function parseSize(value: unknown): PageSize | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') {
    if (!SIZES.includes(value as NamedSize)) {
      throw new PageConfigError(`size: unknown named size ${JSON.stringify(value)} (A4 | Letter)`);
    }
    return value as NamedSize;
  }
  if (typeof value !== 'object' || value === null) {
    throw new PageConfigError('size: expected a named size or { width, length, unit }');
  }
  const { width, length, unit } = value as Record<string, unknown>;
  if (!isFiniteNumber(width) || (width as number) <= 0) {
    throw new PageConfigError(`size.width: expected a positive finite number, got ${JSON.stringify(width)}`);
  }
  if (!isFiniteNumber(length) || (length as number) <= 0) {
    throw new PageConfigError(`size.length: expected a positive finite number, got ${JSON.stringify(length)}`);
  }
  return { width, length, unit: expectUnit(unit, 'size.unit') };
}

function parseMargin(value: unknown): StructuredMargin | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'object' || value === null) {
    throw new PageConfigError('margin: expected { top, right, bottom, left, unit }');
  }
  const { top, right, bottom, left, unit } = value as Record<string, unknown>;
  for (const [side, v] of Object.entries({ top, right, bottom, left })) {
    if (!isFiniteNumber(v) || (v as number) < 0) {
      throw new PageConfigError(
        `margin.${side}: expected a non-negative finite number, got ${JSON.stringify(v)}`,
      );
    }
  }
  return { top, right, bottom, left, unit: expectUnit(unit, 'margin.unit') };
}

function parseMarks(value: unknown): Marks | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !MARKS.includes(value as Marks)) {
    throw new PageConfigError(`marks: unknown value ${JSON.stringify(value)} (crop | cross | both)`);
  }
  return value as Marks;
}

function parseBoxes(
  value: unknown,
  where: 'header' | 'footer',
): Partial<Record<MarginBoxSlot, HeaderFooterToken>> | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'object' || value === null) {
    throw new PageConfigError(`${where}: expected a margin-box map`);
  }
  const out: Partial<Record<MarginBoxSlot, HeaderFooterToken>> = {};
  for (const [slot, token] of Object.entries(value as Record<string, unknown>)) {
    if (!BOX_SLOTS.includes(slot as MarginBoxSlot)) {
      throw new PageConfigError(`${where}.${slot}: not a compilable margin box (${BOX_SLOTS.join(' | ')})`);
    }
    if (typeof token !== 'string' || !TOKEN_RE.test(token)) {
      throw new PageConfigError(
        `${where}.${slot}: invalid token ${JSON.stringify(token)} — 'counter(page)' | 'counter(pages)' | 'string:<name>'`,
      );
    }
    out[slot as MarginBoxSlot] = token as HeaderFooterToken;
  }
  return out;
}

/**
 * Parse + validate unknown input into a PrintPageConfig. Throws
 * PageConfigError on the FIRST invalid value (the caller decides
 * fail-loud vs diagnostic); returns a fresh frozen object.
 */
export function parsePageConfig(input: unknown): PrintPageConfig {
  if (input === undefined) return {};
  if (typeof input !== 'object' || input === null) {
    throw new PageConfigError('config: expected an object');
  }
  const raw = input as Record<string, unknown>;
  const config: PrintPageConfig = {
    size: parseSize(raw.size),
    margin: parseMargin(raw.margin),
    marks: parseMarks(raw.marks),
    header: parseBoxes(raw.header, 'header'),
    footer: parseBoxes(raw.footer, 'footer'),
  };
  return Object.freeze(config);
}

// ---- compilation ----------------------------------------------------------

/** resolved physical dimensions (mm) — the table paged.js itself uses */
export const NAMED_SIZE_MM: Record<NamedSize, { width: number; length: number }> = {
  A4: { width: 210, length: 297 },
  Letter: { width: 215.9, length: 279.4 },
};

const UNIT_TO_MM: Record<LengthUnit, number> = { mm: 1, cm: 10, in: 25.4 };

const round3 = (n: number): number => Math.round(n * 1000) / 1000;

/** the sheet dimensions in mm (headers/footers need no math, this is diagnostics) */
export function sheetMm(size: PageSize | undefined): { width: number; length: number } {
  const s = size ?? 'A4';
  if (typeof s === 'string') return NAMED_SIZE_MM[s];
  return {
    width: round3(s.width * UNIT_TO_MM[s.unit]),
    length: round3(s.length * UNIT_TO_MM[s.unit]),
  };
}

/** one token → its margin-box content declaration */
function tokenContent(token: HeaderFooterToken): string {
  if (token === 'counter(page)') return 'counter(page)';
  if (token === 'counter(pages)') return 'counter(pages)';
  // string:<name> → the css-page-3 string-set read (first value on page)
  return `string(${token.slice('string:'.length)}, first)`;
}

/**
 * Compile the validated config into the @page stylesheet text fed to
 * the kernel. Structured output only — every byte passed through the
 * validators above.
 */
export function compilePageCss(config: PrintPageConfig): string {
  const lines: string[] = [];
  const decls: string[] = [];

  if (config.size !== undefined) {
    decls.push(
      typeof config.size === 'string'
        ? `size: ${config.size};`
        : `size: ${config.size.width}${config.size.unit} ${config.size.length}${config.size.unit};`,
    );
  }
  if (config.marks !== undefined) {
    // marks imply the kernel's default 6mm bleed (its own law — we only speak marks)
    decls.push(`marks: ${config.marks === 'both' ? 'crop cross' : config.marks};`);
  }
  if (config.margin !== undefined) {
    const m = config.margin;
    decls.push(
      `margin: ${m.top}${m.unit} ${m.right}${m.unit} ${m.bottom}${m.unit} ${m.left}${m.unit};`,
    );
  }

  lines.push('@page {');
  lines.push(...decls.map((d) => `  ${d}`));
  lines.push('}');

  const emitBoxes = (
    boxes: Partial<Record<MarginBoxSlot, HeaderFooterToken>> | undefined,
  ): void => {
    if (!boxes) return;
    for (const slot of BOX_SLOTS) {
      const token = boxes[slot];
      if (token === undefined) continue;
      lines.push(`@page {\n  @${slot} {\n    content: ${tokenContent(token)};\n  }\n}`);
    }
  };
  emitBoxes(config.header);
  emitBoxes(config.footer);

  return lines.join('\n');
}

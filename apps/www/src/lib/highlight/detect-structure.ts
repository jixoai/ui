/**
 * DLD layer 3 — the structural probes (lib/highlight/detect-structure.ts,
 * highlight-lang-detector, 2026-09-07).
 *
 * A line-by-line implementation of design D3.2's FROZEN pseudocode —
 * normalize → guard_Markdown → P_JSON → P_SVG → P_XML → P_HTML →
 * P_YAML → P_TOML → P_INI → null. Two laws tower over the probes:
 *
 *   - the Markdown guard outranks every declaration: any fence
 *     (`^ {0,3}` + three-or-more backticks/tildes — indented, opening
 *     or closing, CRLF tails included) or ≥2 ATX heading lines makes
 *     the whole layer abstain (a single `# comment` line must NOT — it
 *     would assassinate commented TOML/YAML/INI; the density threshold
 *     is the bias: rather fall through to L4 than misdeclare);
 *   - this layer NEVER fingerprints programming languages — Rust/Go/
 *     Kotlin/Swift samples are the fixed negative matrix and must
 *     penetrate to L4.
 *
 * Normalization (frozen): strip the UTF-8 BOM, body = text.trim(),
 * L1 = first non-empty line (trim-start'ed), H = body's first 512
 * characters, lines = the non-empty lines (CR tails dropped so CRLF
 * samples behave like LF ones), n = lines.length. The YAML front-matter
 * rule and the TOML-before-INI order are the boundary spec locks.
 */

import type { DetectResult } from './lang-detector';

/** the fence shape: 0-3 leading spaces, 3+ backticks or tildes */
const FENCE = /^ {0,3}(?:`{3,}|~{3,})/;
/** the ATX heading shape: 0-3 leading spaces, 1-6 hashes, space, content */
const HEADING = /^ {0,3}#{1,6}\s+\S/;
/** `key:` / `key: value` — the YAML key-colon shape */
const KEY_COLON = /^\s*[A-Za-z_][\w.-]*:(\s|$)/;
/** a TOML section header: the WHOLE line is [name] (no spaces in name) */
const TOML_SECTION = /^\[[A-Za-z0-9_.$-]+\]$/;
/** TOML assignment: spaces on BOTH sides of `=` */
const TOML_ASSIGN = /^[A-Za-z_][\w.-]*\s=\s\S/;
/** an INI section header: whole line [name], spaces allowed, tail \s* ok */
const INI_SECTION = /^\[[A-Za-z0-9_.$ -]+\]\s*$/;
/** INI assignment: `=` with NO space on its left */
const INI_ASSIGN = /^[A-Za-z_][\w.-]*=[^=]/;
/** a markdown list item */
const LIST_ITEM = /^[-*+]\s/;

/**
 * Layer 3 — the high-certainty structural answer, or null ("no opinion";
 * the waterfall continues to the statistical layer). The result carries
 * source 'structure' by construction.
 */
export function detectByStructure(code: string): DetectResult | null {
  // normalize (frozen): BOM strip, trim, first non-empty line, 512-char
  // head window, non-empty lines with CR tails dropped
  const body = (code.charCodeAt(0) === 0xfeff ? code.slice(1) : code).trim();
  if (body === '') return null;
  const rawLines = body.split('\n').map((line) => line.replace(/\r$/, ''));
  const lines = rawLines.filter((line) => line !== '');
  const n = lines.length;
  const first = lines[0].replace(/^\s+/, '');
  const head = body.slice(0, 512);

  // guard_Markdown — exists-check only (closing fences count), then
  // heading DENSITY (≥2): outranks every probe below. The per-line scan
  // IS the pseudocode's /m body check, with CR tails already dropped.
  let headings = 0;
  for (const line of rawLines) {
    if (FENCE.test(line)) return null;
    if (HEADING.test(line)) headings += 1;
  }
  if (headings >= 2) return null;

  // P_JSON — the hard evidence: the whole body parses
  if (isJson(body)) return { lang: 'json', source: 'structure' };

  // P_SVG — an <svg root line, or the <?xml…?><svg combination in the
  // head window (SVG before XML: the declaration alone means XML)
  if (/^<svg[\s>]/.test(first)) return { lang: 'svg', source: 'structure' };
  if (/^<\?xml[^>]*\?>\s*<svg[\s>]/.test(head)) {
    return { lang: 'svg', source: 'structure' };
  }

  // P_XML — the declaration prefix, case-SENSITIVE (the XML spec's own)
  if (first.startsWith('<?xml')) return { lang: 'xml', source: 'structure' };

  // P_HTML — the doctype, case-INsensitive
  if (/^<!doctype\s+html/i.test(first)) return { lang: 'html', source: 'structure' };

  // P_YAML — leading ---, key-colon density ≥60% over non-separator
  // lines, and the front-matter boundary: content after a SECOND ---
  // carrying any markdown marker (fence / ≥1 heading / list item) is a
  // markdown context — abstain; marker-free multi-doc stays YAML
  if (n >= 3 && lines[0] === '---') {
    const separatorIndexes = lines
      .map((line, index) => (line === '---' ? index : -1))
      .filter((index) => index !== -1);
    const secondSeparator = separatorIndexes[1];
    if (secondSeparator !== undefined) {
      for (const line of lines.slice(secondSeparator + 1)) {
        if (
          FENCE.test(line) ||
          HEADING.test(line) ||
          LIST_ITEM.test(line)
        ) {
          return null; // markdown front-matter — no yaml opinion
        }
      }
    }
    const candidates = lines.filter((line) => line !== '---');
    if (candidates.length > 0) {
      const keyed = candidates.filter((line) => KEY_COLON.test(line)).length;
      if (keyed / candidates.length >= 0.6) {
        return { lang: 'yaml', source: 'structure' };
      }
    }
  }

  // P_TOML — a section line + ≥2 spaced assignments (spaced `=` is
  // TOML's strong marker, so TOML answers before INI)
  const hasTomlSection = lines.some((line) => TOML_SECTION.test(line));
  if (
    n >= 3 &&
    lines[0] !== '---' &&
    hasTomlSection &&
    countMatches(lines, TOML_ASSIGN) >= 2
  ) {
    return { lang: 'toml', source: 'structure' };
  }

  // P_INI — a section line + ≥2 unspaced assignments
  if (
    n >= 3 &&
    lines.some((line) => INI_SECTION.test(line)) &&
    countMatches(lines, INI_ASSIGN) >= 2
  ) {
    return { lang: 'ini', source: 'structure' };
  }

  return null;
}

function countMatches(lines: readonly string[], pattern: RegExp): number {
  let count = 0;
  for (const line of lines) if (pattern.test(line)) count += 1;
  return count;
}

/**
 * The JSON hard evidence — a successful whole-body parse. JSON.parse
 * also accepts scalars ("123", "true"): that is the frozen pseudocode's
 * position, not a heuristic to tighten here.
 */
function isJson(body: string): boolean {
  try {
    JSON.parse(body);
    return true;
  } catch {
    return false;
  }
}

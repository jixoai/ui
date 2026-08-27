/**
 * @jixoai/ui-plugin — the safety checker (P3.2)
 *
 * The built-in SVG safety validator: byte size, path command count and
 * disallowed elements. Default mode is WARN (owner ruling, design.md §5):
 * local build-pipeline files are trusted by default; error mode is
 * opt-in (for HTTP-sourced icons).
 *
 * The checker is a PURE validator — it reports structured SafetyIssue
 * objects and never mutates the SVG. What a failed check MEANS is the
 * serializer's decision (design.md §3): warn → reject + inline fallback,
 * error → throw.
 */

import type {
  SafetyChecker,
  SafetyCheckerConfig,
  SafetyIssue,
  SafetyResult,
} from './types.js';

/** default max SVG byte size — 10KB per icon (design.md §5) */
const DEFAULT_MAX_BYTES = 10 * 1024;

/** default max path command count (design.md §5) */
const DEFAULT_MAX_PATH_COMMANDS = 500;

/** default disallowed elements (design.md §5: script, foreignObject, use) */
const DEFAULT_DISALLOWED_ELEMENTS: readonly string[] = [
  'script',
  'foreignObject',
  'use',
];

/**
 * matches the `d="…"` / `d='…'` attribute of any `<path>` element.
 * `[^>]?` keeps the scan inside a single tag (d cannot contain `>`).
 */
const PATH_D_ATTRIBUTE = /<path\b[^>]*?\bd\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

/**
 * path command letters — M/L/C/Q/A/Z per the contract, plus H/V/S/T
 * (the remaining valid path commands, upper and lower case). 'e' is
 * deliberately excluded: it appears in scientific-notation numbers
 * (e.g. `1e3`), never as a command.
 */
const PATH_COMMAND_LETTERS = /[mlhvcsqtaz]/gi;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * an opening-tag pattern for one element name — `\b` prevents prefix
 * false positives (`<use>` must not match `<user>`); case-insensitive
 * so `<SCRIPT>` and `<foreignobject>` are caught too.
 */
function openingTagPattern(elementName: string): RegExp {
  return new RegExp(`<\\s*${escapeRegExp(elementName)}\\b`, 'i');
}

/** count path command letters across every <path> element's d attribute */
function countPathCommands(svg: string): number {
  let count = 0;
  for (const match of svg.matchAll(PATH_D_ATTRIBUTE)) {
    const data = match[1] ?? match[2] ?? '';
    count += (data.match(PATH_COMMAND_LETTERS) ?? []).length;
  }
  return count;
}

/**
 * Create the built-in SVG safety checker.
 *
 * @param config `mode` is required ('warn' logs + lets the serializer
 *               reject; 'error' lets the serializer throw). `maxBytes`
 *               (default 10240), `maxPathCommands` (default 500) and
 *               `disallowedElements` (default script/foreignObject/use)
 *               override the built-in limits.
 */
export function createSafetyChecker(
  config: SafetyCheckerConfig,
): SafetyChecker {
  // `mode` is required by SafetyCheckerConfig; the runtime fallback keeps
  // plain-JS callers on the documented default (warn — design.md §5)
  const mode: 'warn' | 'error' = config.mode ?? 'warn';
  const maxBytes = config.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxPathCommands =
    config.maxPathCommands ?? DEFAULT_MAX_PATH_COMMANDS;
  const disallowedElements =
    config.disallowedElements ?? DEFAULT_DISALLOWED_ELEMENTS;
  const elementPatterns = disallowedElements.map((name) => ({
    name,
    pattern: openingTagPattern(name),
  }));
  const encoder = new TextEncoder();

  return {
    check(svg: string, source?: string): SafetyResult {
      const severity: SafetyIssue['severity'] =
        mode === 'error' ? 'error' : 'warning';
      const issues: SafetyIssue[] = [];

      const byteLength = encoder.encode(svg).length;
      if (byteLength > maxBytes) {
        issues.push({
          severity,
          message: `SVG byte size ${byteLength} exceeds the limit of ${maxBytes} bytes`,
          source,
        });
      }

      const commandCount = countPathCommands(svg);
      if (commandCount > maxPathCommands) {
        issues.push({
          severity,
          message: `SVG path command count ${commandCount} exceeds the limit of ${maxPathCommands}`,
          source,
        });
      }

      for (const { name, pattern } of elementPatterns) {
        if (pattern.test(svg)) {
          issues.push({
            severity,
            message: `disallowed element <${name}> found in SVG`,
            source,
          });
        }
      }

      return { issues, passed: issues.length === 0 };
    },
  };
}

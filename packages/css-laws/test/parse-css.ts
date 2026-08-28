/**
 * test-only mini CSS parser — an INDEPENDENT reader of generated CSS.
 * The single-sourcing tests must not trust the serializer's own data
 * structures (that was the r1 tautology); they parse the emitted TEXT.
 *
 * Handles: nested @media/@supports preludes, brace depth, quoted
 * strings and url(...) payloads. Data-URI values contain no raw
 * braces/semicolons (they are %-encoded), so brace/semicolon
 * tracking is sufficient.
 */
export interface ParsedRule {
  /** the @media/@supports prelude stack, outermost first */
  readonly preludes: readonly string[];
  /** the rule's selector (everything before the block, trimmed) */
  readonly selector: string;
  /** sorted declaration lines, e.g. ['border: 1px solid var(--border)', ...] */
  readonly declarations: readonly string[];
}

export function parseCSS(css: string): ParsedRule[] {
  const rules: ParsedRule[] = [];
  const preludes: string[] = [];
  let i = 0;

  const skipWhitespaceAndComments = () => {
    while (i < css.length) {
      const ch = css[i];
      if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') {
        i++;
        continue;
      }
      if (ch === '/' && css[i + 1] === '*') {
        const close = css.indexOf('*/', i + 2);
        i = close === -1 ? css.length : close + 2;
        continue;
      }
      break;
    }
  };

  while (i < css.length) {
    skipWhitespaceAndComments();
    if (i >= css.length) break;
    if (css[i] === '}') {
      // closing an @media/@supports block
      preludes.pop();
      i++;
      continue;
    }
    // read the prelude up to '{' (selector or at-rule condition)
    let prelude = '';
    let quote: string | null = null;
    while (i < css.length) {
      const ch = css[i];
      if (quote) {
        prelude += ch;
        if (ch === quote) quote = null;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        prelude += ch;
        i++;
        continue;
      }
      if (ch === '{') break;
      prelude += ch;
      i++;
    }
    if (i >= css.length) break;
    prelude = prelude.trim();
    i++; // consume '{'

    if (prelude.startsWith('@media') || prelude.startsWith('@supports')) {
      preludes.push(prelude);
      continue;
    }

    // a style rule: read declarations up to matching '}'
    const decls: string[] = [];
    let cur = '';
    let depth = 0;
    quote = null;
    while (i < css.length) {
      const ch = css[i];
      if (quote) {
        cur += ch;
        if (ch === quote) quote = null;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        cur += ch;
        i++;
        continue;
      }
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ';' && depth === 0) {
        const line = cur.trim();
        if (line) decls.push(line);
        cur = '';
        i++;
        continue;
      }
      if (ch === '}') {
        const line = cur.trim();
        if (line) decls.push(line);
        break;
      }
      cur += ch;
      i++;
    }
    i++; // consume '}'
    rules.push({
      preludes: [...preludes],
      selector: prelude,
      declarations: [...decls].sort(),
    });
  }

  return rules;
}

/**
 * the projection-invariant fingerprint of a rule: the prelude stack
 * plus the sorted declaration lines. Two projections of the same law
 * must produce the SAME multiset of fingerprints (selectors differ by
 * design; declarations must not).
 */
export function fingerprint(rule: ParsedRule): string {
  return [rule.preludes.join(' |> '), ...rule.declarations].join('\n');
}

export function fingerprintMultiset(css: string): string[] {
  return parseCSS(css)
    .map(fingerprint)
    .sort();
}

/** top-level comma parts of a selector (parens/quotes respected) */
export function selectorParts(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = '';
  for (const ch of selector) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur.trim());
  return parts.filter(Boolean);
}

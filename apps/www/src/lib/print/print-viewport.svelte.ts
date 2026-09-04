/**
 * print-viewport — the viewport→page re-scope channel
 * (print-determinism, Owner grilling 2026-09-04: Q1 改辖域 / Q4 封禁
 * 兜底 / Q5 全局遍历零白名单).
 *
 * THE LAW (print-pipeline spec): the print face is a pure function of
 * the document + printConfig — NEVER of the window. paged.js fragments
 * in the live window, so every WIDTH-feature media query would bake
 * window state into the DOM (the Owner's narrow-vs-wide print bug,
 * reproduced by scripts/probe-print-diff.mjs on accordion.html).
 *
 * The channel re-scopes: while the print POSE is up (the pages mount —
 * the standby preview included, a preview that differs from print is
 * meaningless; Owner Q5 ruling, bound to the artifact's lifecycle —
 * PrintDoc the WRAPPER is long-lived on every docs page and must not
 * drag the web face's responsiveness away), every reachable sheet's
 * width-feature queries are re-pointed at the page content area:
 *
 *   @media (width>=48rem) { … }                       ← disabled
 *   @container jx-print-viewport (width>=48rem) { … } ← synthesized,
 *                                                      same cascade layer
 *
 * The transform matches query SYNTAX (min-width/max-width/width +
 * orientation + aspect-ratio — the container-evaluable family),
 * NEVER breakpoint names: theme-standard, private, or hand-written
 * breakpoints re-scope identically, zero enumeration.
 *
 * Non-width features (hover, forced-colors, prefers-*) stay as outer
 * @media compounds. Media TYPES keep their print semantics: a pure
 * `print` (or any non-width) query is not the channel's business and
 * is never touched; `screen`-typed width queries die in the pose —
 * exactly their fate in a real print render, which is what makes the
 * standby preview honest.
 *
 * DEGRADATION (Owner Q4): anything un-expressible (height-family
 * features — inline-size containment cannot evaluate them; device-
 * width; negated queries; screen-typed width queries) is DISABLED for
 * the pose + logged LOUDLY (the original condition + first selector,
 * counted in the report). The user's print gesture is NEVER blocked.
 *
 * RESTORE: arm() returns disarm; every `not all` stamp is lifted, the
 * synthetic style leaves, the residue is zero (the pipeline's existing
 * zero-residue law absorbs this unit — verify-print asserts it).
 */

/** the container name the page content area carries in the pose */
export const PRINT_VIEWPORT_CONTAINER = 'jx-print-viewport';

/** the synthetic style's probe handle (residue assertions key on it) */
export const VIEWPORT_RESCOPE_STYLE_ATTR = 'data-jx-print-viewport-rescope';

export interface PrintViewportReport {
  /** queries re-scoped to the page container */
  rescopeCount: number;
  /** declarations carrying viewport units (vw/vh/…) overridden with
   *  container-query units (cqw/cqh/…) for the pose — the fluid
   *  typography family (`text-[clamp(…,2.55vw,…)]`) rides no media
   *  query, so the re-scope must reach the declaration layer too */
  unitOverrideCount: number;
  /** un-expressible queries disabled with a loud warning */
  fallbackCount: number;
  /** sheets whose rules could not be read (cross-origin, no CORS) */
  crossOriginCount: number;
  /** wall-clock cost of the arm pass, ms (a one-time pose cost) */
  durationMs: number;
}

/** container-evaluable feature names (the inline-size family) */
const CONTAINER_FEATURES = new Set([
  'min-width',
  'max-width',
  'width',
  'min-inline-size',
  'max-inline-size',
  'inline-size',
  'orientation',
  'aspect-ratio',
]);
/** never re-scoped, disabled loudly (inline-size containment cannot
 * evaluate block-axis features; device-* is not a container feature) */
const BANNED_FEATURES = new Set([
  'min-height',
  'max-height',
  'height',
  'min-block-size',
  'max-block-size',
  'block-size',
  'min-device-width',
  'max-device-width',
  'device-width',
]);

/** does this media text carry a width-family/height-family feature?
 * (the cheap walk-time probe that decides collect-vs-recurse — the
 * exact partition happens per rule afterwards) */
const WIDTHISH = /(?:min-|max-)?(?:device-)?(?:width|inline-size|block-size|height)\s*[:<>=]/i;

/** invert a width token's comparison (the `not` face of a width
 * query: `not (width >= V)` ≡ `(width < V)`) — the tw4 `max-*`
 * variants compile exactly as `not all and (width >= V)` */
const negateWidthToken = (token: string): string | undefined => {
  let m = /^\(\s*width\s*>=\s*(.+?)\s*\)$/i.exec(token);
  if (m) return `(width < ${m[1]})`;
  m = /^\(\s*width\s*>\s*(.+?)\s*\)$/i.exec(token);
  if (m) return `(width <= ${m[1]})`;
  m = /^\(\s*width\s*<=\s*(.+?)\s*\)$/i.exec(token);
  if (m) return `(width > ${m[1]})`;
  m = /^\(\s*width\s*<\s*(.+?)\s*\)$/i.exec(token);
  if (m) return `(width >= ${m[1]})`;
  m = /^\(\s*min-width\s*:\s*(.+?)\s*\)$/i.exec(token);
  if (m) return `(width < ${m[1]})`;
  m = /^\(\s*max-width\s*:\s*(.+?)\s*\)$/i.exec(token);
  if (m) return `(width > ${m[1]})`;
  return undefined; // shape we do not invert conservatively
};

const featureName = (token: string): string | undefined => {
  const inner = token.replace(/^\(\s*/, '').replace(/\s*\)$/, '');
  const name = inner.split(/[:<>=\s]/)[0]?.toLowerCase();
  return name || undefined;
};

/** split a query's `and`-conjunction into feature tokens (media types
 * like `screen`/`print` carry no parens and pass through as-is) */
const splitQuery = (query: string): string[] =>
  query.split(/\s+and\s+/i).map((t) => t.trim()).filter(Boolean);

interface Collected {
  /** ancestor chain entries (`@layer utilities`, `@media print`, …) */
  chain: string[];
  rule: CSSMediaRule;
}

/** a style rule whose declarations carry viewport units */
interface UnitRule {
  chain: string[];
  rule: CSSStyleRule;
}

/** viewport-unit → container-unit (the page area is the viewport of
 *  the print face; vmin/vmax approximate to the inline axis — the
 *  paper is portrait-dominant and the block axis has no honest
 *  container answer under inline-size containment) */
const UNIT_MAP: Record<string, string> = { vw: 'cqw', vh: 'cqh', vmin: 'cqi', vmax: 'cqi' };
/** detection is stateless; the global twin only ever runs on .replace */
const UNIT_DETECT = /-?\d*\.?\d+(?:vw|vh|vmin|vmax)\b/;
const UNIT_GLOBAL = /(-?\d*\.?\d+)(vw|vh|vmin|vmax)\b/g;
const toContainerUnits = (text: string): string =>
  text.replace(UNIT_GLOBAL, (_, num: string, unit: string) => num + UNIT_MAP[unit]);

const is = (rule: CSSRule, ctor: string): boolean =>
  typeof (globalThis as Record<string, unknown>)[ctor] === 'function' &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rule instanceof (globalThis as any)[ctor];

/**
 * Arm the channel. Idempotence is the CALLER's law (the pipeline arms
 * once per pose, consecutive sims included); the returned disarm
 * restores everything it touched.
 */
export function armPrintViewport(): { report: PrintViewportReport; disarm: () => void } {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const collected: Collected[] = [];
  const unitRules: UnitRule[] = [];
  const crossOrigin: string[] = [];

  const visitRules = (rules: CSSRuleList, chain: string[]): void => {
    for (const rule of rules) {
      if (is(rule, 'CSSMediaRule')) {
        const media = rule as CSSMediaRule;
        if (WIDTHISH.test(media.media.mediaText)) {
          // a width-family query: collected whole (nested content
          // serializes with it — never double-processed)
          collected.push({ chain, rule: media });
        } else {
          // a non-width wrapper (print / hover / …): its children may
          // still carry width queries or viewport units — recurse,
          // keeping the wrapper on the chain so synthesis preserves it
          visitRules(media.cssRules, [...chain, `@media ${media.media.mediaText}`]);
        }
      } else if (is(rule, 'CSSLayerBlockRule')) {
        const layer = rule as CSSLayerBlockRule;
        visitRules(layer.cssRules, [...chain, `@layer ${layer.name}`]);
      } else if (is(rule, 'CSSSupportsRule')) {
        const supports = rule as CSSSupportsRule;
        visitRules(supports.cssRules, [...chain, `@supports ${supports.conditionText}`]);
      } else if (is(rule, 'CSSContainerRule')) {
        const container = rule as CSSContainerRule;
        visitRules(container.cssRules, [...chain, container.cssText.split('{')[0].trim()]);
      } else if (is(rule, 'CSSImportRule')) {
        const imported = (rule as CSSImportRule).styleSheet;
        if (imported) visitSheet(imported, chain);
      } else if (is(rule, 'CSSStyleRule')) {
        // the DECLARATION layer: viewport units ride no media query
        // (the fluid typography family) — collect for pose overrides
        const style = rule as CSSStyleRule;
        if (UNIT_DETECT.test(style.style.cssText)) {
          unitRules.push({ chain, rule: style });
        }
      }
    }
  };
  const visitSheet = (sheet: CSSStyleSheet, chain: string[]): void => {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      crossOrigin.push(sheet.href ?? 'adopted sheet');
      return;
    }
    visitRules(rules, chain);
  };

  for (const sheet of document.styleSheets) visitSheet(sheet as CSSStyleSheet, []);
  if (Array.isArray(document.adoptedStyleSheets)) {
    for (const sheet of document.adoptedStyleSheets) visitSheet(sheet, []);
  }

  const touched: CSSMediaRule[] = [];
  const synthesized: string[] = [];
  let rescopeCount = 0;
  let fallbackCount = 0;

  for (const { chain, rule } of collected) {
    const queries = rule.media.mediaText.split(',');
    const containerParts: string[] = [];
    const outerParts: string[] = [];
    let expressible = true;
    for (const raw of queries) {
      const q = raw.trim().replace(/^only\s+/i, '');
      if (!q) continue;
      // the tw4 max- inversion: `not all and (width >= V)` (and the
      // level-4 `not (width >= V)`) is a width query like any other —
      // invert the comparison and re-scope it, never fall back on it
      const negated = /^not\s+(?:all\s+and\s+)?\((.+)\)$/i.exec(q);
      if (negated && /^not\b/i.test(q)) {
        const inner = `(${negated[1].trim()})`;
        const name = featureName(inner);
        if (name !== undefined && CONTAINER_FEATURES.has(name)) {
          const inverted = negateWidthToken(inner);
          if (inverted) {
            containerParts.push(inverted);
            continue;
          }
        }
        expressible = false; // a negation we cannot invert conservatively
        break;
      }
      if (/^not\b/i.test(q)) {
        expressible = false; // negated query — conservative fallback
        break;
      }
      const tokens = splitQuery(q);
      const widthTokens: string[] = [];
      const otherTokens: string[] = [];
      let banned = false;
      let typed = false;
      for (const token of tokens) {
        if (!token.startsWith('(')) {
          typed = true; // a media TYPE (`screen` / `print` / …)
          otherTokens.push(token);
          continue;
        }
        const name = featureName(token);
        if (name === undefined) {
          otherTokens.push(token);
          continue;
        }
        if (CONTAINER_FEATURES.has(name)) widthTokens.push(token);
        else if (BANNED_FEATURES.has(name)) banned = true;
        else otherTokens.push(token);
      }
      if (banned) {
        expressible = false; // window-derived but inexpressible
        break;
      }
      if (widthTokens.length === 0) {
        outerParts.push(q); // not the channel's business (pure non-width)
        continue;
      }
      if (typed) {
        // a typed width query (`screen and (min-width…)`) — its
        // real-print fate is to die; the pose honors that loudly
        expressible = false;
        break;
      }
      containerParts.push(widthTokens.join(' and '));
      if (otherTokens.length) outerParts.push(otherTokens.join(' and '));
    }
    if (!expressible) {
      const original = rule.media.mediaText.replace(/,?\s*not all\s*$/, '');
      rule.media.appendMedium('not all');
      touched.push(rule);
      fallbackCount++;
      console.warn(
        `[print-viewport] un-expressible query disabled for the print pose: @media ${original} — first selector: ${
          rule.cssRules[0]?.cssText?.slice(0, 90) ?? '(empty)'
        }`,
      );
      continue;
    }
    if (containerParts.length === 0) continue; // pure non-width rule: untouched

    const inner = toContainerUnits([...rule.cssRules].map((r) => r.cssText).join('\n'));
    let chunk = `@container ${PRINT_VIEWPORT_CONTAINER} ${containerParts.join(', ')} {\n${inner}\n}`;
    if (outerParts.length) chunk = `@media ${outerParts.join(', ')} {\n${chunk}\n}`;
    for (const wrapper of [...chain].reverse()) chunk = `${wrapper} {\n${chunk}\n}`;
    synthesized.push(chunk);
    rule.media.appendMedium('not all');
    touched.push(rule);
    rescopeCount++;
  }

  // ── the DECLARATION re-scope: viewport units → container units ──
  // the original rules stay untouched (the synthetic sheet exists
  // only during the pose — the web face never sees it); appended at
  // the same layer, later source order wins inside the pose
  let unitOverrideCount = 0;
  for (const { chain, rule } of unitRules) {
    const overridden = toContainerUnits(rule.style.cssText);
    if (overridden === rule.style.cssText) continue; // detection raced a parse quirk
    let chunk = `${rule.selectorText} { ${overridden} }`;
    for (const wrapper of [...chain].reverse()) chunk = `${wrapper} {\n${chunk}\n}`;
    synthesized.push(chunk);
    unitOverrideCount++;
  }

  // the container declaration rides the same synthetic unit (the page
  // content area is the viewport of the print face; probe-validated:
  // inline-size containment does not disturb paged.js fragmentation)
  const report: PrintViewportReport = {
    rescopeCount,
    unitOverrideCount,
    fallbackCount,
    crossOriginCount: crossOrigin.length,
    durationMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0,
  };
  const style = document.createElement('style');
  style.setAttribute(VIEWPORT_RESCOPE_STYLE_ATTR, '');
  // the report rides the element (data-*): the probe surface needs no
  // window global, the differential gate can read the counts
  style.dataset.report = JSON.stringify(report);
  style.textContent = `.pagedjs_area { container-type: inline-size; container-name: ${PRINT_VIEWPORT_CONTAINER}; }\n${synthesized.join('\n')}`;
  document.head.appendChild(style);

  for (const href of crossOrigin) {
    console.warn(
      `[print-viewport] stylesheet not readable (cross-origin, no CORS): ${href} — its media queries are outside the channel`,
    );
  }

  let disarmed = false;
  const disarm = (): void => {
    if (disarmed) return;
    disarmed = true;
    for (const rule of touched) rule.media.deleteMedium('not all');
    style.remove();
  };
  return { report, disarm };
}

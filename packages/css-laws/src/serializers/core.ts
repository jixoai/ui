/**
 * The serializer — the ONLY code that turns ComponentLaw objects into CSS.
 *
 * Three output modes, one declaration source:
 *   'utility': .{className} rules          → jixoai.css @layer components slot
 *   'face':    {elementSelector} rules     → jx-pure.css Part B (inside the sheet's @layer components)
 *   'alias':   .{alias} rules per alias    → jx-pure.css Part A (unlayered)
 *
 * Cascade contract (css-architecture placement law):
 *   utility/face sit in @layer components — consumer utilities win;
 *   alias rides unlayered — the Tier-2 vocabulary wins by design.
 *
 * Selector laws:
 *   - comma parts are expanded so EVERY part carries the full anchor
 *     (utility: '.cls:checked, .cls:indeterminate'; face: each part
 *     gets its own ':where(.jx-pure) ' scope prefix — a comma inside
 *     elementSelector can never let a part escape the scope)
 *   - rules with zero effective declarations are SKIPPED everywhere
 *     (base, pseudo, state, subtree, @media, @supports — no empty
 *     braces ever reach the output)
 */
import type {
  ComponentLaw,
  Declarations,
  SerializeOptions,
  SerializedCSS,
} from '../types';

// ── declaration serializer ──────────────────────────────────────────

function decl(d: Declarations, indent: string = '  '): string {
  return Object.entries(d)
    .filter(([, v]) => v !== undefined)
    .map(([prop, val]) => `${indent}${prop}: ${val};`)
    .join('\n');
}

function hasDeclarations(d: Declarations | undefined): boolean {
  if (!d) return false;
  return Object.values(d).some((v) => v !== undefined);
}

// ── selector builders ───────────────────────────────────────────────

/**
 * comma-split that respects nesting: commas inside (), [], and quoted
 * strings do NOT split (':where([multiple], [size])' and
 * ':not(.a, .b *)' are ONE selector, not two).
 */
function splitTopLevelCommas(sel: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = '';
  for (const ch of sel) {
    if (quote) {
      cur += ch;
      if (ch === quote && !cur.endsWith('\\' + quote)) quote = null;
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
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** normalize an elementSelector into its comma-expanded parts */
function elementParts(law: ComponentLaw): string[] {
  const sel = law.application.elementSelector;
  if (!sel) return [];
  const list = Array.isArray(sel) ? sel : [sel];
  return list.flatMap((s) => splitTopLevelCommas(s));
}

/**
 * the anchor selectors for a law in the given format — the strings
 * every suffix hangs off. utility: ['.cls']; face: scoped element
 * parts; alias: one per application.aliases class.
 */
function anchors(law: ComponentLaw, opts: SerializeOptions): string[] {
  if (opts.format === 'utility') return [`.${law.application.className}`];
  if (opts.format === 'alias') return (law.application.aliases ?? []).map((a) => `.${a}`);
  // face
  const scope = law.application.scoped ? ':where(.jx-pure) ' : '';
  return elementParts(law).map((p) => `${scope}${p}`);
}

/**
 * suffix-attach with comma safety: the suffix itself may contain
 * commas (':checked, :indeterminate'); EVERY part is prefixed with
 * EVERY anchor.
 */
function buildSelector(law: ComponentLaw, opts: SerializeOptions, suffix = ''): string {
  // an empty suffix ('' = the base rule) must survive the comma
  // splitter's Boolean filter — only non-empty suffixes get split
  const suffixParts = suffix ? splitTopLevelCommas(suffix) : [''];
  return anchors(law, opts)
    .flatMap((anchor) => suffixParts.map((s) => `${anchor}${s}`))
    .join(', ');
}

/** subtree selectors attach the relative selector AFTER the anchor */
function buildSubtreeSelector(law: ComponentLaw, opts: SerializeOptions, sub: string, suffix = ''): string {
  const rel = sub.startsWith('>') ? sub : ` ${sub}`;
  return buildSelector(law, opts, `${rel}${suffix}`);
}

// ── rule emitters ───────────────────────────────────────────────────

interface Rule {
  selector: string;
  declarations: Declarations;
}

function collectBaseRules(law: ComponentLaw, opts: SerializeOptions): Rule[] {
  // custom properties ride the base rule
  const baseDecl: Record<string, string | number> = {};
  if (law.customProperties) Object.assign(baseDecl, law.customProperties);
  Object.assign(baseDecl, law.base);
  return hasDeclarations(baseDecl) ? [{ selector: buildSelector(law, opts), declarations: baseDecl }] : [];
}

function collectPseudoRules(law: ComponentLaw, opts: SerializeOptions): Rule[] {
  const rules: Rule[] = [];
  if (!law.pseudos) return rules;

  for (const [pseudoName, build] of Object.entries(law.pseudos)) {
    const pseudo = `::${pseudoName}`;
    if (hasDeclarations(build.declarations)) {
      rules.push({
        selector: buildSelector(law, opts, pseudo),
        declarations: build.declarations,
      });
    }
    // pseudo states (e.g., :checked::before)
    if (build.states) {
      for (const [stateName, stateDecl] of Object.entries(build.states)) {
        if (!hasDeclarations(stateDecl)) continue;
        rules.push({
          selector: buildSelector(law, opts, `:${stateName}${pseudo}`),
          declarations: stateDecl,
        });
      }
    }
  }
  return rules;
}

function collectSubtreeRules(law: ComponentLaw, opts: SerializeOptions): Rule[] {
  const rules: Rule[] = [];
  for (const sub of law.subtrees ?? []) {
    if (hasDeclarations(sub.declarations)) {
      rules.push({
        selector: buildSubtreeSelector(law, opts, sub.selector),
        declarations: sub.declarations,
      });
    }
    for (const [pseudoName, build] of Object.entries(sub.pseudos ?? {})) {
      const pseudo = `::${pseudoName}`;
      if (hasDeclarations(build.declarations)) {
        rules.push({
          selector: buildSubtreeSelector(law, opts, sub.selector, pseudo),
          declarations: build.declarations,
        });
      }
      for (const [stateName, stateDecl] of Object.entries(build.states ?? {})) {
        if (!hasDeclarations(stateDecl)) continue;
        rules.push({
          selector: buildSubtreeSelector(law, opts, sub.selector, `:${stateName}${pseudo}`),
          declarations: stateDecl,
        });
      }
    }
    for (const st of sub.states ?? []) {
      if (!hasDeclarations(st.declarations)) continue;
      rules.push({
        selector: buildSubtreeSelector(law, opts, sub.selector, st.selector),
        declarations: st.declarations,
      });
    }
  }
  return rules;
}

// ── media/supports emitters ────────────────────────────────────────

function emitMedia(law: ComponentLaw, opts: SerializeOptions, indent: string): string {
  const blocks = (law.media ?? [])
    .map((m) => {
      const innerRules = m.rules
        .filter((r) => hasDeclarations(r.declarations))
        .map((r) => {
          const sel = buildSelector(law, opts, r.selector);
          if (!sel) return ''; // no anchors in this format → no rule
          return `${indent}  ${sel} {\n${decl(r.declarations, `${indent}    `)}\n${indent}  }`;
        })
        .filter(Boolean);
      if (!innerRules.length) return '';
      return `${indent}@media ${m.query} {\n${innerRules.join('\n')}\n${indent}}`;
    })
    .filter(Boolean);
  return blocks.join('\n');
}

function emitSupports(law: ComponentLaw, opts: SerializeOptions, indent: string): string {
  const blocks = (law.supports ?? [])
    .map((s) => {
      const parts: string[] = [];
      if (hasDeclarations(s.declarations)) {
        const sel = buildSelector(law, opts);
        if (sel) {
          parts.push(
            `${indent}  ${sel} {\n${decl(s.declarations!, `${indent}    `)}\n${indent}  }`,
          );
        }
      }
      const stateRules = (s.states ?? [])
        .filter((r) => hasDeclarations(r.declarations))
        .map((r) => {
          const sel = buildSelector(law, opts, r.selector);
          if (!sel) return ''; // no anchors in this format → no rule
          return `${indent}  ${sel} {\n${decl(r.declarations, `${indent}    `)}\n${indent}  }`;
        })
        .filter(Boolean)
        .join('\n');
      if (stateRules) parts.push(stateRules);
      if (!parts.length) return '';
      return `${indent}@supports ${s.condition} {\n${parts.join('\n')}\n${indent}}`;
    })
    .filter(Boolean);
  return blocks.join('\n');
}

// ── the main serializer ──────────────────────────────────────────────

/**
 * section emission orders — see the ORDER note on StateRule. Source
 * order decides equal-specificity cascades; an explicit rule order
 * above 500 lands after the @supports gates (the select listbox
 * override is the standing case).
 */
const ORDER = {
  base: 0,
  pseudo: 100,
  subtree: 200,
  state: 300,
  media: 400,
  supports: 500,
} as const;

export function serializeLaw(
  law: ComponentLaw,
  opts: SerializeOptions,
): SerializedCSS {
  const indent = opts.indent ?? '  ';

  const pseudoRules = collectPseudoRules(law, opts);
  const subtreeRules = collectSubtreeRules(law, opts);

  const blocks: { order: number; text: string }[] = [];
  const push = (order: number, r: Rule) => {
    if (r.selector === '') return; // no anchors in this format → no rule
    blocks.push({ order, text: ruleText(r, indent) });
  };

  collectBaseRules(law, opts).forEach((r, i) => push(ORDER.base + i, r));
  pseudoRules.forEach((r, i) => push(ORDER.pseudo + i, r));
  subtreeRules.forEach((r, i) => push(ORDER.subtree + i, r));
  (law.states ?? [])
    .filter((s) => hasDeclarations(s.declarations))
    .forEach((s) =>
      push(s.order ?? ORDER.state, {
        selector: buildSelector(law, opts, s.selector),
        declarations: s.declarations,
      }),
    );
  if (law.media?.length) {
    const t = emitMedia(law, opts, indent);
    if (t) blocks.push({ order: ORDER.media, text: t });
  }
  if (law.supports?.length) {
    const t = emitSupports(law, opts, indent);
    if (t) blocks.push({ order: ORDER.supports, text: t });
  }

  const css = blocks
    .filter((b) => b.text)
    .sort((a, b) => a.order - b.order) // Array.sort is stable
    .map((b) => b.text)
    .join('\n\n');

  return { css, lawName: law.name };
}

function ruleText(r: Rule, indent: string): string {
  return `${r.selector} {\n${decl(r.declarations, indent)}\n}`;
}

// ── collection serializer ───────────────────────────────────────────

export function serializeCollection(
  collection: { laws: readonly ComponentLaw[] },
  opts: SerializeOptions,
): string {
  return collection.laws
    .map((law) => serializeLaw(law, opts).css)
    .filter(Boolean)
    .join('\n\n');
}

export type { Rule };

/**
 * The serializer — the ONLY code that turns ComponentLaw objects into CSS.
 *
 * Two output modes:
 *   'utility': generates .{className} { ... } rules (for jixoai.css)
 *   'face': generates {elementSelector} { ... } rules (for jx-pure.css)
 *
 * Both modes produce byte-identical declarations — single-sourcing by construction.
 */
import type {
  ComponentLaw,
  Declarations,
  PseudoBuild,
  StateRule,
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

function num(el: string, i: number): string {
  return `${el}-${i + 1}`;
}

// ── selector builders ───────────────────────────────────────────────

function buildSelector(law: ComponentLaw, opts: SerializeOptions, ...suffixes: string[]): string {
  const parts = suffixes.filter(Boolean);
  const suffix = parts.join('');

  // utility mode: .className + suffix, expanding comma-separated selectors
  // (":checked, :indeterminate" → ".cls:checked, .cls:indeterminate")
  if (opts.format === 'utility') {
    const cls = `.${law.application.className}`;
    return suffix.includes(',')
      ? suffix.split(',').map((s) => `${cls}${s.trim()}`).join(', ')
      : `${cls}${suffix}`;
  }

  // face mode: :where(.jx-pure) element + suffix, same comma expansion
  const scope = law.application.scoped ? ':where(.jx-pure) ' : '';
  const base = law.application.elementSelector ?? '';
  const prefix = `${scope}${base}`;
  return suffix.includes(',')
    ? suffix.split(',').map((s) => `${prefix}${s.trim()}`).join(', ')
    : `${prefix}${suffix}`;
}

// ── rule emitters ───────────────────────────────────────────────────

interface Rule {
  selector: string;
  declarations: Declarations;
}

function collectBaseRules(law: ComponentLaw, opts: SerializeOptions): Rule[] {
  const rules: Rule[] = [];

  // custom properties go on the base rule
  const baseDecl: Record<string, string | number> = {};
  if (law.customProperties) {
    Object.assign(baseDecl, law.customProperties);
  }
  Object.assign(baseDecl, law.base);
  rules.push({ selector: buildSelector(law, opts), declarations: baseDecl });

  return rules;
}

function collectPseudoRules(law: ComponentLaw, opts: SerializeOptions): Rule[] {
  const rules: Rule[] = [];
  if (!law.pseudos) return rules;

  for (const [pseudoName, build] of Object.entries(law.pseudos)) {
    const pseudo = `::${pseudoName}`;
    rules.push({
      selector: buildSelector(law, opts, pseudo),
      declarations: build.declarations,
    });

    // pseudo states (e.g., :checked::before)
    if (build.states) {
      for (const [stateName, stateDecl] of Object.entries(build.states)) {
        rules.push({
          selector: buildSelector(law, opts, `:${stateName}`, pseudo),
          declarations: stateDecl,
        });
      }
    }
  }

  return rules;
}

function collectStateRules(law: ComponentLaw, opts: SerializeOptions): Rule[] {
  if (!law.states) return [];
  return law.states.map((state) => ({
    selector: buildSelector(law, opts, state.selector),
    declarations: state.declarations,
  }));
}

// ── media/supports emitters ────────────────────────────────────────

function emitMedia(law: ComponentLaw, opts: SerializeOptions, indent: string): string {
  if (!law.media?.length) return '';
  const blocks = law.media.map((m) => {
    const innerRules = m.rules
      .map((r) => `${indent}  ${buildSelector(law, opts, r.selector)} {\n${decl(r.declarations, `${indent}    `)}\n${indent}  }`)
      .join('\n');
    return `${indent}@media ${m.query} {\n${innerRules}\n${indent}}`;
  });
  return blocks.join('\n');
}

function emitSupports(law: ComponentLaw, opts: SerializeOptions, indent: string): string {
  if (!law.supports?.length) return '';
  const blocks = law.supports.map((s) => {
    const base = `${indent}  ${buildSelector(law, opts)} {\n${decl(s.declarations, `${indent}    `)}\n${indent}  }`;
    const stateRules = (s.states ?? [])
      .map((r) => `${indent}  ${buildSelector(law, opts, r.selector)} {\n${decl(r.declarations, `${indent}    `)}\n${indent}  }`)
      .join('\n');
    const inner = [base, stateRules].filter(Boolean).join('\n');
    return `${indent}@supports ${s.condition} {\n${inner}\n${indent}}`;
  });
  return blocks.join('\n');
}

// ── the main serializer ──────────────────────────────────────────────

export function serializeLaw(
  law: ComponentLaw,
  opts: SerializeOptions,
): SerializedCSS {
  const indent = opts.indent ?? '  ';
  const rules = [
    ...collectBaseRules(law, opts),
    ...collectPseudoRules(law, opts),
    ...collectStateRules(law, opts),
  ];

  const ruleBlocks = rules.map((r) => `${r.selector} {\n${decl(r.declarations, indent)}\n}`);
  const mediaBlock = emitMedia(law, opts, indent);
  const supportsBlock = emitSupports(law, opts, indent);

  const css = [ruleBlocks.join('\n\n'), mediaBlock, supportsBlock]
    .filter(Boolean)
    .join('\n\n');

  return { css, lawName: law.name };
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

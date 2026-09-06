/**
 * The pluggable highlight backend contract (lib/highlight/backend.ts,
 * highlight-backend-pluggable, 2026-09-02; per-engine item split
 * highlight-engine-matrix, 2026-09-06).
 *
 * Owner requirement (r9 acceptance, printing §3): "配置默认使用的高亮库：
 * Shiki、Prism.js、Micro-lighter … 不需要编译，只是一个默认的值，利用
 * context 技术，一样可以在运行中配置 <CodeCard backend={shiki() |
 * prismjs() | microLighter()} />" — a pure RUNTIME value, zero build
 * steps. This file is the value's type — and, since the engine-matrix
 * split, the CORE item's whole surface: every engine factory
 * value-imports the two helpers below, so the @jixoai/highlight edge
 * stays live for items whose only type-level need is the interface
 * (verify-deps skips `import type`).
 *
 * THE MODEL — one interface must host two fundamentally different output
 * models:
 *
 *   markup backends (shiki, prismjs, highlight.js, sugar-high,
 *   tree-sitter)
 *     the backend owns el's children: it swaps the plain text for token
 *     spans (el.innerHTML). The markup survives DOM cloning — the print
 *     pipeline's freeze clone carries it over verbatim.
 *
 *   range backends (microlighter)
 *     zero markup: token ranges are registered in the GLOBAL
 *     CSS.highlights registry over el's text node, painted by
 *     ::highlight() rules from a data-syntax-theme scoped stylesheet.
 *     el keeps its plain text (copyable, editable). KNOWN LIMITATION
 *     (accepted, not hacked around): the ranges registry does NOT
 *     survive DOM cloning — under the print pipeline's freeze the
 *     microlighter card degrades to plain text (theme CSS cannot bring
 *     ranges back). Apps that must print highlighted code should pin a
 *     markup backend; the context seam (HIGHLIGHT_DEF) is exactly where
 *     a print-gated plugin could do that app-side.
 *
 * THEME SEMANTICS are per-backend by design: the CodeCard `theme` prop
 * keeps shiki vocabulary ('jixoai', 'github-dark', …); each backend
 * maps it into its own world (prism → its stock theme stylesheet ids,
 * microlighter → its data-syntax-theme ids). See each factory.
 */

/** What a backend paints: the <code> element of a code surface. */
export interface HighlightBackend {
  /** stable identity: 'shiki' | 'prismjs' | 'microlighter' | custom */
  readonly id: string;
  /**
   * Paint `code` into `el`. The card's contract: el currently holds the
   * plain (escaped-by-textContent) sample; the backend replaces its
   * content or registers ranges over it and resolves when the paint is
   * done. Rejections leave the card's plain-text fallback standing.
   */
  highlight(
    el: HTMLElement,
    code: string,
    opts: { lang?: string; theme?: string },
  ): Promise<void>;
}

/**
 * The lang a paint requested — every factory repeats this normalization,
 * so it lives with the contract (the card's `lang` prop is optional with
 * a 'ts' default). Value-level on purpose: engine factories import it to
 * keep their @jixoai/highlight edge real for verify-deps.
 */
export function requestedLang(opts: { lang?: string }): string {
  return opts.lang ?? 'ts';
}

/**
 * Alias canonicalization — `aliases[lang] ?? lang` over the CALLING
 * engine's own alias table (each engine's canonical ids differ, so the
 * table stays per-factory and this stays generic).
 */
export function canonicalLang(
  aliases: Record<string, string>,
  lang: string,
): string {
  return aliases[lang] ?? lang;
}

/**
 * Apply a `a:b;c:d` declaration list to an element property-by-property
 * (NOT cssText — a wholesale write would wipe the host's own inline
 * laws like the card pre's max-height). Used by markup backends to
 * carry their engine's editor colors onto the surrounding <pre>.
 */
export function applyDeclarations(el: HTMLElement, declarations: string): void {
  const list = declarations.trim();
  if (list === '') return;
  for (const declaration of list.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon <= 0) continue;
    const name = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    if (name !== '' && value !== '') el.style.setProperty(name, value);
  }
}

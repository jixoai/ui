/**
 * jixoai canvas usage composer (registry/files/lib/canvas-usage.ts,
 * typography-context-and-parts Lane D, 2026-09-08).
 *
 * The page-side half of the canvas same-source law (design §7): the
 * per-page virtual module `virtual:jixoai-canvas/<route-rel>/+page`
 * hands the page its own <ComponentCanvas> children markup through
 * `resolveRawCode(id)`; THIS helper composes that raw markup into a
 * runnable usage FILE (the drawer's `kind:'usage'` TreeFile AND the
 * page's Usage CodeBlock feed from the same composed string — one
 * source, two surfaces).
 *
 *   const usage = usageFile({ Blockquote: '@ui/blockquote' }, resolveRawCode('rungs'));
 *   // <script lang="ts">
 *   // import Blockquote from '@ui/blockquote';
 *   // </script>
 *   //
 *   // <Blockquote>…the extracted canvas markup…</Blockquote>
 *
 * The `imports` record maps the import BINDING CLAUSE to its source —
 * a plain identifier key emits a default import (`Blockquote`), a
 * brace key emits the named form (`'{ Link }': '@ui/link'` →
 * `import { Link } from '@ui/link';`). `opts.script` carries extra
 * script lines (page-state consts) between the imports and the close
 * tag.
 *
 * The `</script>` close tag is built by CONCATENATION on purpose: a
 * literal close tag inside a template literal in a .svelte script
 * would terminate the PAGE's own script tag (the `const close` dodge
 * every migrated page carried) — in this .ts module the literal is
 * harmless, and the concatenation is the single legal home for it.
 */

/** the one legal home of the literal-closing-tag dodge (see header) */
const CLOSE_SCRIPT = '</' + 'script>';

/** the import-binding clause → source map (see header for the forms) */
export type UsageImports = Record<string, string>;

/** extra script lines (page-state consts) between imports and close tag */
export interface UsageFileOptions {
  readonly script?: string;
}

/**
 * Compose a runnable usage file from the extracted canvas markup.
 * Deterministic and pure — same inputs, same bytes (the drawer and
 * the Usage CodeBlock share one string).
 */
export function usageFile(
  imports: UsageImports,
  body: string,
  options: UsageFileOptions = {},
): string {
  const lines: string[] = ['<script lang="ts">'];
  for (const [binding, source] of Object.entries(imports)) {
    lines.push(`import ${binding} from '${source}';`);
  }
  if (options.script !== undefined && options.script.length > 0) {
    lines.push(options.script);
  }
  lines.push(CLOSE_SCRIPT);
  // one blank line between the script block and the markup — the
  // hand-authored samples' own shape, kept byte-stable
  return `${lines.join('\n')}\n\n${body}`;
}

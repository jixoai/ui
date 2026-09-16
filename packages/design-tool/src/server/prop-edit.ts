/**
 * @jixoai/ui-design (server) — the §3 serialization authority
 * (collab-protocol; the r2 T8 prop-edit file-CAS lane was RETIRED by
 * M7a, 2026-09-15 — the panel edits ride the collab op lane through
 * `collab-api.ts`, and this module keeps only the two serializers the
 * projection bridge (`collab/bridge.ts`) reuses by §3's frozen law
 * 「序列化桥沿用 transform.ts/prop-edit.ts 的既有机器」).
 *
 * Orthogonal intents (2):
 *   1. PROP LITERALS — `renderValue`: canonical source rendering of a
 *      prop literal (string → JSON-quoted, number/boolean → braced).
 *      The quoted-string prop law is `renderValue(value).slice(1, -1)`
 *      — byte-identical to JSON string escaping minus the outer
 *      quotes (entities are NOT re-escaped for props).
 *   2. TEMPLATE TEXT — `serializeTemplateText` (issue #38 B3): escape
 *      IN ORDER `&` `<` `>` `{` `}` so an edited value can never
 *      re-open an entity, a tag, an expression or a comment boundary
 *      in the template. Quotes are NOT escaped (a text node carries
 *      them literally); multi-line values keep their raw newlines.
 *
 * The deleted lane (usageIndex locate, magic-string rewrite, CAS
 * arbitration, dry-run seeding, the `/__design__/api/prop-edit`
 * middleware — 2026-09-11 → 2026-09-15) lived at the panel's old
 * file-write world; its stamp-space locate law migrated to
 * `collab-api.ts` (`importTableOf` + the stamp transform's own
 * numbering), where it resolves selections onto id-first addressing.
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T8); lane retired
 * 2026-09-15 (collab-protocol M7a).
 */

/** a prop literal's JS value (the panel vocabulary) */
export type EditValue = string | number | boolean;

/**
 * canonical source rendering: string → quoted, number/boolean → braced.
 *
 * Consumed by the projection bridge (`collab/bridge.ts`): the
 * quoted-string prop law is `renderValue(value).slice(1, -1)`.
 */
export function renderValue(value: EditValue): string {
  if (typeof value === 'string') return JSON.stringify(value);
  return `{${String(value)}}`;
}

/**
 * The Svelte text-context serializer (the B3 write contract): escape
 * IN ORDER `&` `<` `>` `{` `}` so an edited value can never re-open an
 * entity, a tag, an expression or a comment boundary in the template.
 */
export function serializeTemplateText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;');
}

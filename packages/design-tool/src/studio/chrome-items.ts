/**
 * @jixoai/ui-design (studio) — the dogfooding inventory (r3 P1,
 * rebuild-plan §2.3).
 *
 * Orthogonal intent (1): STUDIO_CHROME_ITEMS names every registry
 * item the studio's chrome imports through the #jixoai/ alias — it
 * doubles as the DOGFOODING COVERAGE LIST (§6.2): each rebuild slice
 * appends the items it actually consumed, so the list is an auditable
 * footprint of "the studio as the library's first consumer", never
 * an aspiration. The startup/probe check (a later slice) compares a
 * host's installed tree against this list and reports a missing item
 * as a version error ("host jixoai-ui too old — studio needs ≥X")
 * instead of a silent hang (risk R1).
 *
 * Pure data, browser- and node-safe (no svelte imports).
 * Original need: Owner 2026-09-12 (design-studio-r3 T3, issue #10).
 */

/**
 * The registry items the studio chrome consumes today:
 * - list-item (T3): the property panel's row family — ItemGroup /
 *   ItemField / ItemToggle / ItemSelect / ItemInput
 *   (T4): the component-tree rows (grouped, nested per branch) and
 *   the navigator's canvas/frame rows (standalone chrome-none)
 * - separator (T3): the panel head's rim
 *   (T4): the nav's canvases/tree section divide
 * - alert (T3): panel notices (transient edit failures + the
 *   persistent unresolved-frame state)
 * - empty (T3): the panel's no-selection / no-props flow guidance,
 *   and (T5) the guide index's filtered-to-nothing state
 *   (T4): the tree's no-stamped-components state + the navigator's
 *   no-prototypes state
 * - accordion (T5): the guide's component-index groups (ghost set)
 * - badge (T5): the chat's agent-model line + tool-event labels
 *   (T4): the navigator's updates drift badge (jx-hue-warning)
 * - chip (T5): the chat's removable selection-context chip
 * - input (T5): the guide's search field
 * - press-button (T5): the chat's send button — loading pose = the
 *   streaming 加载锁 (ID2)
 * - textarea (T5): the chat's draft composer
 *
 * T4 (tree, navigator) appends its items here.
 */
export const STUDIO_CHROME_ITEMS: readonly string[] = [
  'list-item',
  'separator',
  'alert',
  'empty',
  'accordion',
  'badge',
  'chip',
  'input',
  'press-button',
  'textarea',
] as const;

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
 *   (grindstone #17-3, 2026-09-13): + ItemSegmented / ItemStepper —
 *   the panel's hand-written seg/stepper chrome retired into the
 *   adapters; every field row renders its x-ui.icon glyph through
 *   the icon snippet lane (#17-2)
 *   (T4): the navigator's canvas rows (standalone chrome-none; the
 *   frame rows merged into the unified tree, r3 #20)
 * - tree-view (r3 #20): the unified canvas tree — pages + components
 *   in ONE registry ARIA tree (the former list-item stamp-tree skin
 *   retired with the merge)
 * - separator (T3): the panel head's rim
 *   (T4): the nav's canvases/tree section divide
 * - alert (T3): panel notices (transient edit failures + the
 *   persistent unresolved-frame state)
 *   (grindstone #17-1, 2026-09-13): the transient pose rides the
 *   component's own dismiss="auto" — the notice.ts scheduler retired
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
 * - icon + spin (#35, 2026-09-12): the tree caret's glyphs — the
 *   loading page folder's chevron swaps for a Spin (the caret
 *   snippet extension, component/tree-view-caret); the native
 *   chevron look rides Icon
 *
 * - dialog + native-select + card (walkthrough-r4 style lane,
 *   2026-09-21): the settings panel's chrome — the dsh-routes overlay
 *   rides the registry Dialog surface, its forms ride NativeSelect,
 *   and the footer bar rides CardFooter; the panel's hand-written
 *   dialog/buttons/selects chrome retired with the restyle
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
  'tree-view',
  'icon',
  'spin',
  'dialog',
  'native-select',
  'card',
] as const;

/**
 * The command match contract, lib-side home (context-defaults-economy
 * r10/A5, 2026-09-03): the match payload + the frozen match type moved
 * OUT of ui/command/command.svelte so lib/search/nav-filter.ts (and
 * any future lib consumer) reaches them without a lib→ui reverse
 * dependency — the import-graph law the verify:context gate asserts.
 * ui/command re-exports from here (ui→lib is the legal direction);
 * the type surface is unchanged for every existing consumer.
 */

/** the match payload: label is REQUIRED — match text + accessible name */
export interface CommandMatchItem {
  label: string;
  /** extra match text (descriptions, aliases); never displayed */
  keywords?: string;
}

/** the frozen match contract (composition-first-apis): a pure
 *  inclusion predicate — it may only answer visible/hidden, never
 *  reorder. Authored tree order is the walk order. */
export type CommandMatch = (item: CommandMatchItem, query: string) => boolean;

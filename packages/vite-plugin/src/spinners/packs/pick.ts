/**
 * @jixoai/ui-vite-plugin (spinners packs) — the pack channel pick
 * helper (spinner-channel-api design §3).
 *
 * `pick` is a FILTER, not an ordering: the pack record's key order
 * wins (deterministic packing) and duplicate picks dedupe silently.
 * The set is enumerable, so an unknown pick or an EMPTY pick is a
 * named error — "no silent no-ops" is the design's own law applied
 * to the empty set.
 */

export function pickPackEntries<T>(
  pack: string,
  record: Readonly<Record<string, T>>,
  pick: readonly string[] | undefined,
): Readonly<Record<string, T>> {
  if (pick === undefined) {
    return record;
  }
  if (pick.length === 0) {
    throw new Error(
      `[jixoai-spinners] the ${pack} channel's pick is empty — an empty channel is a ` +
        'silent no-op and is refused (omit the option for the whole pack)',
    );
  }
  const wanted = new Set(pick);
  const unknown = [...wanted].filter((name) => !Object.hasOwn(record, name));
  if (unknown.length > 0) {
    throw new Error(
      `[jixoai-spinners] the ${pack} channel's pick names unknown loaders: ` +
        `${unknown.join(', ')} — picks are channel-RELATIVE names (the pack record's ` +
        'keys, no prefix)',
    );
  }
  const out: Record<string, T> = {};
  for (const name of Object.keys(record)) {
    if (wanted.has(name)) {
      out[name] = record[name]!;
    }
  }
  return out;
}

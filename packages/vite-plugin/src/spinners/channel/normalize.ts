/**
 * @jixoai/ui-vite-plugin (spinners channels) — config-time
 * normalization (spinner-channel-api design §1; the
 * normalizeIconChannels law carried over).
 *
 * `spinners.channels` entries are channel INSTANCES (built by
 * defineSpinnerChannel, the shipped pack factories, or hand-forged
 * literals). Normalization (1) RE-RUNS every factory check so a
 * smuggled literal fails by name — the icons diff-r1 m1 lesson,
 * mirrored — and (2) enforces the SET-level uniqueness law: ONE
 * entry per id and ONE channel per prefix. Two channels sharing a
 * `myco:` namespace would silently last-win the merge map (a
 * configuration lie); normalization refuses it.
 */

import type { SpinnerChannel } from './types.js';
import { CHANNEL_ID_PATTERN, CHANNEL_PREFIX_PATTERN } from './types.js';
import { SPINNER_NAME_PATTERN } from '../grammar.js';

/** is the value a plausibly-shaped channel instance? (the smuggle gate) */
function isSpinnerChannel(value: unknown): value is SpinnerChannel {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { prefix?: unknown }).prefix === 'string' &&
    typeof (value as { spinners?: unknown }).spinners === 'object' &&
    (value as { spinners?: unknown }).spinners !== null
  );
}

/** the named grammar error for a hand-forged entry (the factory's twin) */
function grammarErrorOf(channel: SpinnerChannel): Error | null {
  if (!CHANNEL_PREFIX_PATTERN.test(channel.prefix)) {
    return new Error(
      `[jixoai-spinners] the channel "${channel.id}" prefix "${channel.prefix}" is illegal — ` +
        'prefixes must match /^[a-z][a-z0-9]*$/',
    );
  }
  if (!CHANNEL_ID_PATTERN.test(channel.id)) {
    return new Error(
      `[jixoai-spinners] the channel id ${JSON.stringify(channel.id)} is illegal — ids must ` +
        'match /^[a-z][a-z0-9-]*$/',
    );
  }
  const names = Object.keys(channel.spinners ?? {});
  if (names.length === 0) {
    return new Error(
      `[jixoai-spinners] the channel "${channel.id}" carries an empty spinners record — ` +
        'an empty channel is a silent no-op and is refused',
    );
  }
  for (const name of names) {
    if (!SPINNER_NAME_PATTERN.test(name)) {
      return new Error(
        `[jixoai-spinners] the channel "${channel.id}" spinner name "${name}" is illegal — ` +
        'channel-RELATIVE names must match /^[a-z0-9][a-z0-9-]*$/',
      );
    }
  }
  const { peerPackage, defaultsNote } = channel as { peerPackage?: unknown; defaultsNote?: unknown };
  if (peerPackage !== undefined && typeof peerPackage !== 'string') {
    return new Error(
      `[jixoai-spinners] the channel "${channel.id}" peerPackage must be a string when present`,
    );
  }
  if (defaultsNote !== undefined && typeof defaultsNote !== 'string') {
    return new Error(
      `[jixoai-spinners] the channel "${channel.id}" defaultsNote must be a string when present`,
    );
  }
  return null;
}

/**
 * Validate the registered channel SET. Returns the instances
 * untouched (idempotent — re-normalizing a normalized config is a
 * no-op, the icons law; the vite adapter normalizes at config time
 * and resolveSpinnerInputs normalizes again inside).
 *
 * @throws named errors: a non-channel entry, a re-run factory check
 *         (the smuggle gate), a duplicate id, or a duplicate prefix
 */
export function normalizeSpinnerChannels(
  channels: readonly unknown[],
): readonly SpinnerChannel[] {
  const byId = new Map<string, SpinnerChannel>();
  const byPrefix = new Map<string, SpinnerChannel>();
  for (const entry of channels) {
    if (!isSpinnerChannel(entry)) {
      throw new Error(
        '[jixoai-spinners] spinners.channels accepts SpinnerChannel instances — build them ' +
        'with defineSpinnerChannel(spec) (the factory validates shape + grammar) or a ' +
        'shipped pack factory (magecdn({ pick? }) / sam({ pick? }))',
      );
    }
    const grammar = grammarErrorOf(entry);
    if (grammar !== null) {
      throw grammar;
    }
    const idOwner = byId.get(entry.id);
    if (idOwner !== undefined) {
      throw new Error(
        `[jixoai-spinners] two channels share the id "${entry.id}" — one entry per id; ` +
        `the first was registered with prefix "${idOwner.prefix}", the second with ` +
        `"${entry.prefix}"`,
      );
    }
    const prefixOwner = byPrefix.get(entry.prefix);
    if (prefixOwner !== undefined) {
      throw new Error(
        `[jixoai-spinners] two channels share the prefix "${entry.prefix}:" — one channel ` +
        `per prefix ("${prefixOwner.id}" and "${entry.id}"); two namespaces folding into ` +
        'one would silently last-win the merge map',
      );
    }
    byId.set(entry.id, entry);
    byPrefix.set(entry.prefix, entry);
  }
  return channels as readonly SpinnerChannel[];
}

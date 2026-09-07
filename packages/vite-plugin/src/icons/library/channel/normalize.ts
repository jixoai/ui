/**
 * @jixoai/ui-vite-plugin (icons library channels) — config-time
 * normalization + the enabled-prefix law (A1/A3, openspec
 * icon-channel-api design §0/§1; the icon-library-presets uniqueness
 * law carried verbatim).
 *
 * Intents:
 * 1. normalizeIconChannels: `library.channels` entries are already
 *    channel INSTANCES (built by defineIconChannel / the shipped
 *    factories / a hand-forged object) — normalization validates each
 *    entry's shape + grammar (the factory's checks re-run, so smuggled
 *    literals fail by name too) and enforces the SET-level uniqueness
 *    law: ONE entry per id and ONE channel per prefix, both failing
 *    with named errors. Two channels sharing `myco:` would silently
 *    last-win the resolve map (a configuration lie), so normalization
 *    refuses it.
 * 2. enabledChannelPrefixes: the one law every prefix-reading site
 *    shares — enabled = `lucide` (the default-registered channel) ∪
 *    the registered channels' prefixes. The scanner's collection set,
 *    the template-union emission, and the config-face prefix law all
 *    read THIS function's output (no lucide special cases anywhere
 *    else).
 * 3. assertRefPrefixesEnabled (the config-face law): every ref-shaped
 *    string source must speak an ENABLED prefix — an unknown `fa:home`
 *    fails at config validation naming the reference and the enabled
 *    set, never as a confused inline literal deep inside
 *    safety/optimize (the spec scenario).
 */

import type { IconSource } from '../types.js';
import type { IconChannel } from './types.js';
import { CHANNEL_ID_PATTERN, CHANNEL_PREFIX_PATTERN } from './types.js';
import { lucideChannel } from './lucide.js';

/** is the value a plausibly-shaped channel instance? (the smuggle gate) */
function isIconChannel(value: unknown): value is IconChannel {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { prefix?: unknown }).prefix === 'string' &&
    typeof (value as { resolver?: unknown }).resolver === 'object' &&
    (value as { resolver?: unknown }).resolver !== null
  );
}

/** the named grammar error for a hand-forged entry (the factory's twin) */
function grammarErrorOf(channel: IconChannel): Error | null {
  if (!CHANNEL_PREFIX_PATTERN.test(channel.prefix)) {
    return new Error(
      `[jixoai-icons] the channel "${channel.id}" prefix "${channel.prefix}" is illegal — ` +
        'prefixes must match /^[a-z][a-z0-9]*$/',
    );
  }
  if (channel.prefix === 'lucide') {
    return new Error(
      '[jixoai-icons] the channel prefix "lucide" is reserved — lucide is the ' +
        'default-registered channel; pick a different prefix',
    );
  }
  if (!CHANNEL_ID_PATTERN.test(channel.id)) {
    return new Error(
      `[jixoai-icons] the channel id "${channel.id}" is illegal — ids must match ` +
        '/^[a-z][a-z0-9-]*$/',
    );
  }
  if (channel.id === 'lucide') {
    return new Error(
      '[jixoai-icons] the channel id "lucide" is reserved — the default-registered ' +
        'channel owns it; pick a different id',
    );
  }
  const resolver = channel.resolver as { kind?: unknown; resolveFile?: unknown };
  if (resolver.kind === 'file') {
    if (typeof resolver.resolveFile !== 'function') {
      return new Error(
        `[jixoai-icons] the channel "${channel.id}" resolver is file-kind but carries ` +
          'no resolveFile(ref) function — build channels through defineIconChannel',
      );
    }
    return null;
  }
  if (resolver.kind === 'lucide') {
    return new Error(
      `[jixoai-icons] the channel "${channel.id}" claims the reserved lucide resolver ` +
        'kind — only the plugin-internal …/icons/lucide instance may; build your own ' +
        'channel through defineIconChannel (file-backed in v1)',
    );
  }
  return new Error(
    `[jixoai-icons] the channel "${channel.id}" resolver kind ${JSON.stringify(resolver.kind)} ` +
      "is not one of 'file' | 'lucide' — build channels through defineIconChannel",
  );
}

/**
 * Normalize the `library.channels` option into VALIDATED channel
 * instances (set-level uniqueness enforced here — the factory cannot
 * know the registered set). Absent → `[]` (only `lucide:` stays
 * enabled). Already-normalized instances pass through untouched
 * (idempotence — the vite adapter normalizes twice).
 *
 * @throws the named grammar/uniqueness errors
 */
export function normalizeIconChannels(
  channels: readonly IconChannel[] | undefined,
): readonly IconChannel[] {
  if (channels === undefined) return [];
  const enabled: IconChannel[] = [];
  // ONE entry per id and ONE channel per prefix — a duplicate either
  // way is a named config error naming both entries
  const ownerOfId = new Map<string, string>();
  const ownerOfPrefix = new Map<string, string>();
  const describe = (channel: IconChannel): string =>
    `"${channel.id}" (${channel.prefix}:)`;
  for (const entry of channels) {
    if (!isIconChannel(entry)) {
      throw new Error(
        '[jixoai-icons] library.channels entries must be channel instances — build ' +
          'them through defineIconChannel (…/icons/channel) or the shipped factories ' +
          '(…/icons/md, …/icons/ph, …/icons/rx); lucide needs NO channel (it is the ' +
          'default-registered one)',
      );
    }
    const grammar = grammarErrorOf(entry);
    if (grammar !== null) throw grammar;
    const idOwner = ownerOfId.get(entry.id);
    if (idOwner !== undefined) {
      throw new Error(
        `[jixoai-icons] library.channels declares the id "${entry.id}" twice ` +
          `(${idOwner} and ${describe(entry)}) — one entry per channel id; merge the ` +
          'knobs into one channel',
      );
    }
    const prefixOwner = ownerOfPrefix.get(entry.prefix);
    if (prefixOwner !== undefined) {
      throw new Error(
        `[jixoai-icons] library.channels gives the prefix "${entry.prefix}:" to two ` +
          `channels (${prefixOwner} and ${describe(entry)}) — each prefix names exactly ` +
          'one channel',
      );
    }
    ownerOfId.set(entry.id, describe(entry));
    ownerOfPrefix.set(entry.prefix, describe(entry));
    enabled.push(entry);
  }
  return enabled;
}

/**
 * the enabled-prefix law's one source: `lucide` ∪ the registered
 * channels' prefixes (deduped). The scanner's collection set, the
 * template-union emission, and the config-face law all read THIS.
 */
export function enabledChannelPrefixes(channels: readonly IconChannel[]): readonly string[] {
  return [...new Set([lucideChannel.prefix, ...channels.map((channel) => channel.prefix)])];
}

/** a ref-shaped string: `word:…` with an ascii-letter-led word prefix */
const REF_PREFIX = /^([a-z][a-z0-9-]*):/;

/**
 * the enabled-prefix law (config validation): every ref-shaped string
 * source must speak `lucide:` or an ENABLED channel prefix. Anything
 * else fails at startup naming the reference and the enabled set.
 *
 * @throws the named disabled/unknown-prefix error
 */
export function assertRefPrefixesEnabled(
  icons: Readonly<Record<string, IconSource>>,
  channels: readonly IconChannel[],
): void {
  const enabledPrefixes = enabledChannelPrefixes(channels);
  for (const [name, source] of Object.entries(icons)) {
    if (typeof source !== 'string') continue;
    const match = REF_PREFIX.exec(source);
    if (match === null) continue;
    const prefix = match[1]!;
    if (!enabledPrefixes.includes(prefix)) {
      throw new Error(
        `[jixoai-icons] library icon "${name}" references "${source}" — the ` +
          `prefix "${prefix}:" is neither lucide: nor an enabled channel. Enabled ` +
          `prefixes: ${enabledPrefixes.map((x) => `${x}:`).join(', ')}; register a ` +
          'matching channel through library.channels (defineIconChannel from ' +
          '@jixoai/ui-vite-plugin/icons/channel, or the shipped …/icons/md · …/icons/ph ' +
          '· …/icons/rx factories) or fix the reference',
      );
    }
  }
}

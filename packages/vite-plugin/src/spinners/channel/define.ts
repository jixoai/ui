/**
 * @jixoai/ui-vite-plugin (spinners channels) — the public factory
 * (spinner-channel-api design §1; the defineIconChannel law carried
 * over: everything checkable at a one-argument factory fails there,
 * with named teaching errors).
 *
 * SET-level uniqueness (one entry per id, ONE channel per prefix)
 * lives in normalizeSpinnerChannels at config time — the factory
 * cannot know the registered set (the icons codex r1 B1 split,
 * verbatim).
 */

import type { DefineSpinnerChannelSpec, SpinnerChannel } from './types.js';
import { CHANNEL_ID_PATTERN, CHANNEL_PREFIX_PATTERN } from './types.js';
import { SPINNER_NAME_PATTERN } from '../grammar.js';

/**
 * Define ONE spinner channel — the public base. The returned
 * instance registers through `spinners.channels: SpinnerChannel[]`;
 * its entries then join the artifact as `prefix:name` keys, crossing
 * the same RAW safety + structural validation pipeline a flat
 * entry does.
 *
 * @throws a named, teaching error for grammar violations (bad
 *         prefix, bad id, illegal channel-relative names, an empty
 *         spinner record — no silent no-ops)
 */
export function defineSpinnerChannel(spec: DefineSpinnerChannelSpec): SpinnerChannel {
  if (typeof spec !== 'object' || spec === null) {
    throw new Error(
      '[jixoai-spinners] defineSpinnerChannel expects a channel spec object ' +
        '({ id, prefix, spinners, peerPackage?, defaultsNote? })',
    );
  }
  if (typeof spec.prefix !== 'string' || !CHANNEL_PREFIX_PATTERN.test(spec.prefix)) {
    throw new Error(
      `[jixoai-spinners] the channel prefix ${JSON.stringify(spec.prefix)} is illegal — ` +
        'prefixes must match /^[a-z][a-z0-9]*$/ (a lowercase-led alphanumeric word, ' +
        'e.g. myco or md; it becomes the `myco:…` artifact-key namespace)',
    );
  }
  if (typeof spec.id !== 'string' || !CHANNEL_ID_PATTERN.test(spec.id)) {
    throw new Error(
      `[jixoai-spinners] the channel id ${JSON.stringify(spec.id)} is illegal — ids must ` +
        'match /^[a-z][a-z0-9-]*$/ (lowercase-led, hyphens legal) and be unique among ' +
        'registered channels',
    );
  }
  if (
    typeof spec.spinners !== 'object' ||
    spec.spinners === null ||
    Object.keys(spec.spinners).length === 0
  ) {
    throw new Error(
      `[jixoai-spinners] the channel "${spec.id}" needs a non-empty spinners record — ` +
        'a channel IS its enumerable name set (no lazy tier); an empty channel is a ' +
        'silent no-op and is refused',
    );
  }
  for (const name of Object.keys(spec.spinners)) {
    if (!SPINNER_NAME_PATTERN.test(name)) {
      throw new Error(
        `[jixoai-spinners] the channel "${spec.id}" spinner name "${name}" is illegal — ` +
        'channel-RELATIVE names must match /^[a-z0-9][a-z0-9-]*$/ (kebab-case, ' +
        'digit-leading legal; the prefix joins in the artifact key, never inside ' +
        'the channel)',
      );
    }
  }
  if (spec.peerPackage !== undefined && typeof spec.peerPackage !== 'string') {
    throw new Error(
      `[jixoai-spinners] the channel "${spec.id}" peerPackage must be a string when ` +
        'present — advisory metadata naming the expected package in error text/docs',
    );
  }
  if (spec.defaultsNote !== undefined && typeof spec.defaultsNote !== 'string') {
    throw new Error(
      `[jixoai-spinners] the channel "${spec.id}" defaultsNote must be a string when present`,
    );
  }
  return {
    id: spec.id,
    prefix: spec.prefix,
    spinners: spec.spinners,
    ...(spec.peerPackage !== undefined ? { peerPackage: spec.peerPackage } : {}),
    ...(spec.defaultsNote !== undefined ? { defaultsNote: spec.defaultsNote } : {}),
  };
}

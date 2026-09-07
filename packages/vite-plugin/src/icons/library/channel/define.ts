/**
 * @jixoai/ui-vite-plugin (icons library channels) — the public factory
 * (A1, openspec icon-channel-api design §0).
 *
 * defineIconChannel validates SHAPE + GRAMMAR (prefix grammar, the
 * reserved `lucide` id/prefix, resolveFile being a function) at the
 * factory — one argument, so everything checkable there fails there.
 * SET-level uniqueness (one entry per id, one channel per prefix) lives
 * in normalizeIconChannels at config time: the one-argument factory
 * cannot know the registered set (codex r1 B1). The factory ALWAYS
 * builds a file-kind resolver; the reserved lucide kind is constructed
 * ONLY inside the plugin (…/icons/lucide exports the instance).
 */

import type { DefineIconChannelSpec, IconChannel } from './types.js';
import { CHANNEL_ID_PATTERN, CHANNEL_PREFIX_PATTERN } from './types.js';

/**
 * Define ONE file-backed icon channel — the public base. The returned
 * instance registers through `library.channels: IconChannel[]`; its
 * prefix then works everywhere a built-in prefix does (config `icons`
 * refs, source scanning, template union members, the enabled-prefix
 * laws).
 *
 * @throws a named, teaching error for grammar violations (bad prefix,
 *         bad id, `lucide` reserved, resolveFile not a function)
 */
export function defineIconChannel(spec: DefineIconChannelSpec): IconChannel {
  if (typeof spec !== 'object' || spec === null) {
    throw new Error(
      '[jixoai-icons] defineIconChannel expects a channel spec object ' +
        '({ id, prefix, peerPackage?, resolveFile, defaultsNote? })',
    );
  }
  if (typeof spec.prefix !== 'string' || !CHANNEL_PREFIX_PATTERN.test(spec.prefix)) {
    throw new Error(
      `[jixoai-icons] the channel prefix ${JSON.stringify(spec.prefix)} is illegal — ` +
        'prefixes must match /^[a-z][a-z0-9]*$/ (a lowercase-led alphanumeric word, ' +
        'e.g. md or myco; it becomes the `myco:…` ref namespace and a template-union member)',
    );
  }
  if (spec.prefix === 'lucide') {
    throw new Error(
      '[jixoai-icons] the channel prefix "lucide" is reserved — lucide is the ' +
        'default-registered channel (zero-import, always enabled); pick a different ' +
        'prefix for your own channel',
    );
  }
  if (typeof spec.id !== 'string' || !CHANNEL_ID_PATTERN.test(spec.id)) {
    throw new Error(
      `[jixoai-icons] the channel id ${JSON.stringify(spec.id)} is illegal — ids must ` +
        'match /^[a-z][a-z0-9-]*$/ (lowercase-led, hyphens legal) and be unique among ' +
        'registered channels',
    );
  }
  if (spec.id === 'lucide') {
    throw new Error(
      '[jixoai-icons] the channel id "lucide" is reserved — the default-registered ' +
        'channel owns it; pick a different id for your own channel',
    );
  }
  if (typeof spec.resolveFile !== 'function') {
    throw new Error(
      `[jixoai-icons] the channel "${spec.id}" needs a resolveFile(ref) function — ` +
        'file channels LOCATE the peer package\'s ABSOLUTE svg path per ref (the ' +
        'adapter still owns the READ through the provider context)',
    );
  }
  if (spec.peerPackage !== undefined && typeof spec.peerPackage !== 'string') {
    throw new Error(
      `[jixoai-icons] the channel "${spec.id}" peerPackage must be a string when ` +
        'present — it is named in every loud-fail install-hint error',
    );
  }
  if (spec.defaultsNote !== undefined && typeof spec.defaultsNote !== 'string') {
    throw new Error(
      `[jixoai-icons] the channel "${spec.id}" defaultsNote must be a string when present`,
    );
  }
  return {
    id: spec.id,
    prefix: spec.prefix,
    ...(spec.peerPackage !== undefined ? { peerPackage: spec.peerPackage } : {}),
    resolver: { kind: 'file', resolveFile: spec.resolveFile },
    ...(spec.defaultsNote !== undefined ? { defaultsNote: spec.defaultsNote } : {}),
  };
}

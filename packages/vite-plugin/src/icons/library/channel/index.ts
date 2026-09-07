/**
 * @jixoai/ui-vite-plugin/icons/channel — the channel base sub-entry
 * (A1/A4, openspec icon-channel-api design §0/§1).
 *
 * The PUBLIC base every prefixed lane rides: `defineIconChannel` +
 * the channel types + the peer-resolution seam a consumer's own
 * channel points at. The shipped channels import from their OWN
 * sub-entries (…/icons/md · …/icons/ph · …/icons/rx · the
 * default-registered …/icons/lucide instance) — this entry carries no
 * shipped-channel code, only the contract. Graph law (codex r1 M4):
 * this module's static graph reaches NO lucide/svgo/opentype code —
 * packaging.test.ts walks the real dist imports.
 */

export type {
  IconChannel,
  IconChannelResolver,
  DefineIconChannelSpec,
} from './types.js';
export { CHANNEL_PREFIX_PATTERN, CHANNEL_ID_PATTERN } from './types.js';
export { defineIconChannel } from './define.js';
export { isPeerInstalled, resolvePeerFile } from './peer.js';

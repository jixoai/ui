/**
 * @jixoai/ui-vite-plugin (spinners channels) — the channel barrel
 * (spinner-channel-api design §5; the icons …/icons/channel
 * precedent). The public face re-exports through the ./spinners
 * sub-entry; pack factories live in their own pack sub-entries.
 */

export { defineSpinnerChannel } from './define.js';
export { normalizeSpinnerChannels } from './normalize.js';
export { CHANNEL_ID_PATTERN, CHANNEL_PREFIX_PATTERN } from './types.js';
export type { DefineSpinnerChannelSpec, SpinnerChannel } from './types.js';

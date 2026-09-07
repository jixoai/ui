// hmos — a third-party icon channel over a LOCAL svg collection (no
// npm peer): the HarmonyOS system-icon subset in this example's
// icons/ dir. This is the whole integration surface a custom channel
// needs — one defineIconChannel call; the prefix then works in config
// refs, scanned name attributes, and the IconName template union.
import { fileURLToPath } from 'node:url';
import { defineIconChannel } from '@jixoai/ui-vite-plugin/icons/channel';

export const hmos = () =>
  defineIconChannel({
    id: 'hmos',
    prefix: 'hmos',
    // the absolute-path contract: resolveFile maps ONE ref to ONE
    // absolute svg path (file-channels locate; the adapter reads)
    resolveFile: (ref) => fileURLToPath(new URL(`../../../icons/${ref}.svg`, import.meta.url)),
  });

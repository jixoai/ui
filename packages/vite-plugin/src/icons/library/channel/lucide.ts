/**
 * @jixoai/ui-vite-plugin (icons library channels) — the lucide channel
 * INSTANCE (A2, openspec icon-channel-api design §1).
 *
 * lucide is a channel with ONE documented asymmetry: its resolver is
 * the reserved `{ kind: 'lucide' }` routing to the EXISTING IconNode
 * lane (resolve.ts → serializeLucideIcon over the dynamic
 * `import('lucide')`), never `resolveFile`. It is DEFAULT-REGISTERED —
 * present in every library config without import (the Owner's 默认启用
 * lucide) — so `…/icons/lucide` exists for DISCOVERY/testing, not for
 * registration: adding it to library.channels is a named config error
 * (the reserved-id law). Consequence of uniformity: `lucide:` refs are
 * SCANNABLE like every channel prefix, and a scanned `lucide:X` whose
 * `X` is already packed dedupes through the EQUIVALENCES table (one
 * payload — design §1's manifest-collision law).
 *
 * This module is PURE DATA by law: importing it must never reach the
 * lucide PACKAGE (that import is resolve.ts's dynamic one), svgo, or
 * opentype.js — the per-entry purity gate walks this graph.
 */

import type { IconChannel } from './types.js';

/** the default-registered channel — the one reserved lucide-kind resolver */
export const lucideChannel: IconChannel = {
  id: 'lucide',
  prefix: 'lucide',
  peerPackage: 'lucide',
  resolver: { kind: 'lucide' },
  defaultsNote:
    'the 38-name built-in manifest + lucide: refs — the IconNode lane (serializeLucideIcon), always wired',
};

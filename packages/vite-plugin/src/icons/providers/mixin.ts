/**
 * mixinIconProvider — compose a base provider with per-slot overrides
 * (P2.4, original request: 2026-08-28 ui-plugin-package design §8).
 *
 * Orthogonal intents:
 * 1. Factory composition: await the base factory + one override factory
 *    per configured slot, ONCE, at factory time (never per getIcon).
 * 2. Lookup semantics: override.getIcon(slot) first; null falls through
 *    to base.getIcon(slot); both null → null ("not my slot").
 *
 * The override map is typed per-slot: an override factory is only ever
 * consulted for the slot it was registered under.
 */

import type {
  IconProvider,
  IconProviderFactory,
  IconSlot,
  ProviderContext,
  SvgAsset,
} from '../types.js';
import { SLOT_NAMES } from '../types.js';

/** per-slot override factories — omitted slots always use the base provider */
export type IconProviderOverrides = { readonly [K in IconSlot]?: IconProviderFactory };

/**
 * Compose provider factories: `mixinIconProvider(base, { chevron: customChevrons })`
 * answers every slot from `base` except where an override provides one.
 */
export function mixinIconProvider(
  base: IconProviderFactory,
  overrides: IconProviderOverrides,
): IconProviderFactory {
  return async (ctx: ProviderContext): Promise<IconProvider> => {
    // base first, then overrides in SLOT_REGISTRY order — deterministic
    // failure semantics if more than one factory rejects.
    const baseProvider = await base(ctx);
    const overrideProviders = new Map<IconSlot, IconProvider>();
    for (const slot of SLOT_NAMES) {
      const factory = overrides[slot];
      if (factory !== undefined) {
        overrideProviders.set(slot, await factory(ctx));
      }
    }

    return {
      getIcon(slot: IconSlot): SvgAsset | null {
        const override = overrideProviders.get(slot);
        if (override !== undefined) {
          const asset = override.getIcon(slot);
          if (asset !== null) return asset;
        }
        return baseProvider.getIcon(slot);
      },
    };
  };
}

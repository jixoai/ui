/**
 * Blueprint scene registry (apps/www/src/lib/blueprints/scenes.ts).
 * ONE scene file per CATALOG name under scenes/ — picked up
 * automatically via import.meta.glob, so adding a scene is just adding
 * the file (no registry maintenance, no merge conflicts). The gallery
 * route renders them; test/blueprints.spec.ts locks the mapping (every
 * catalog entry has a scene file AND a generated static/blueprints/
 * <name>.svg).
 *
 * Scene contract (see scenes/ for examples):
 *   - root: <div class="h-full w-full"> filling the 640×360 stage
 *   - REAL components from $lib/ui — the blueprint IS the real HTML
 *   - interactive surfaces forced into their OPEN state (dialog open,
 *     use:forceShowPopovers, toasts pushed on mount, …)
 *   - one iconic composition, not a documentation dump
 */
import type { Component } from 'svelte';

const modules = import.meta.glob<{ default: Component }>('./scenes/*.svelte', { eager: true });

/** catalog name (file stem) → scene component */
export const SCENES: Record<string, Component> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.match(/([^/]+)\.svelte$/)?.[1] ?? '', mod.default]),
);

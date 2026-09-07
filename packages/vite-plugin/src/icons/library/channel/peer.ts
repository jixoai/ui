/**
 * @jixoai/ui-vite-plugin (icons library channels) — peer-package node
 * resolution (A1, openspec icon-channel-api design §0; the
 * icon-library-presets peer law carried verbatim).
 *
 * Intents:
 * 1. locate an optional peer's per-icon SVG FILE by node resolution —
 *    `resolvePeerFile('@material-symbols/svg-400', 'outlined/home.svg')`
 *    returns the ABSOLUTE path. Node resolution LOCATES the file; the
 *    plugin still owns the READ (resolve.ts hands the path to
 *    ctx.loadSource — frozen principle #4). This is the seam a
 *    consumer's OWN channel points at (the docs page's myco: example:
 *    `resolveFile: (ref) => resolvePeerFile('my-icons', `svgs/${ref}.svg`)`).
 * 2. resolution rides the PLUGIN's module context (createRequire over
 *    import.meta.url) — the same discipline as the lucide dynamic
 *    import: peers install beside/above the plugin package (the
 *    optional-peer law), so what lucide can reach, channels can reach.
 * 3. loud-fail errors (the lucide precedent): a peer that is not
 *    installed is a NAMED error carrying the npm install line; an
 *    installed peer without the requested icon is a NAMED error naming
 *    the ref. Never a silent fallback, never a bare ERR_MODULE_NOT_FOUND.
 *
 * Deviation from deep-specifier purity (declared): package presence is
 * probed through `package.json` OR the package main entry because
 * @phosphor-icons/core's exports map blocks the package.json subpath
 * while exposing "./" and "./assets/<weight>/*.svg" (probed 2026-09-07).
 */

import { createRequire } from 'node:module';

/** the require built from the plugin's own module location */
const peerRequire = createRequire(import.meta.url);

/** is the module specifier resolvable from the plugin's context? */
function isResolvable(specifier: string): boolean {
  try {
    peerRequire.resolve(specifier);
    return true;
  } catch {
    return false;
  }
}

/**
 * is the peer package installed at all? `package.json` first (classic
 * asset packages without an exports map resolve it), the main entry
 * second (exports-mapped packages like @phosphor-icons/core).
 */
export function isPeerInstalled(peerPackage: string): boolean {
  return isResolvable(`${peerPackage}/package.json`) || isResolvable(peerPackage);
}

/**
 * Resolve ONE svg inside an optional peer package to its ABSOLUTE path.
 *
 * @throws the named install-hint error when the peer is absent
 * @throws the named not-found error when the peer is installed but the
 *         requested file does not exist inside it
 */
export function resolvePeerFile(peerPackage: string, subpath: string): string {
  const specifier = `${peerPackage}/${subpath}`;
  try {
    return peerRequire.resolve(specifier);
  } catch (cause) {
    if (!isPeerInstalled(peerPackage)) {
      throw new Error(
        `[jixoai-icons] the channel peer package "${peerPackage}" is not installed — ` +
          `channels resolve per-icon SVGs from it at build time. Install it ` +
          `(npm i ${peerPackage}) or drop the channel from library.channels`,
        { cause },
      );
    }
    throw new Error(
      `[jixoai-icons] the peer package "${peerPackage}" is installed but has no ` +
        `icon file "${subpath}" — check the icon name/weight/style against the ` +
        'package contents (the icons page lists each channel\'s mapping)',
      { cause },
    );
  }
}

/**
 * @jixoai/ui-design (studio) — the STATIC studio entry (issue #18).
 *
 * Orthogonal intent (1): the prebuilt-bundle twin of the dev entry
 * (src/server/entries/studio-entry.js). Zero host coupling by
 * architecture ruling — the differences from the dev entry are exactly
 * two:
 *   - `virtual:jixoai-design/css` (the HOST app.css) → ./studio-static.css
 *     (the package-owned tailwind fan-in over the registry theme sheets);
 *   - `/design/studio.svelte` (the HOST dogfood mount page) → mountStudio
 *     (the package default shell with the same-origin endpoint defaults).
 * `virtual:jixoai-icons.css` stays verbatim: the icons-css bridge plugin
 * serves it in BUILD mode too (the www production precedent,
 * apps/www/vite.config.ts jixoaiIconsCssEntry).
 *
 * The document DOM effects from the dev entry are load-bearing and
 * kept as-is: html.dark BEFORE mount (the #23 dark token scope —
 * every dogfooded family component paints the dark token set) and the
 * #36 app-shell overflow clamp (panels scroll internally, the document
 * never grows scrollbars).
 *
 * Original need: issue #18 (Owner 2026-09-13, foundation round — studio
 * chrome static bundle). Browser code compiled by vite BUILD, never
 * served through the dev pipeline.
 */

import { mountStudio } from './mount.ts';
import { applyStudioTheme, readStudioTheme, watchStudioSystemTheme } from './studio-theme.ts';
import './studio-static.css';
import 'virtual:jixoai-icons.css';

// the #23 dark token scope, now a POSTURE instead of a hardcode
// (walkthrough r6): the persisted preference (default dark — the
// studio's historical identity) resolves BEFORE mount so every
// dogfooded family component paints its token set on the first frame
applyStudioTheme(readStudioTheme());
watchStudioSystemTheme();
document.documentElement.style.overflow = 'hidden';

mountStudio(document.getElementById('studio-root'));

/**
 * @jixoai/ui-vite-plugin (spinners) — the built-in manifest (P1,
 * openspec spin-ora-svg-lane design §0/§5).
 *
 * blocks-wave — the default svg animation — is vendored VERBATIM from
 * https://magecdn.com/tools/svg-loaders/blocks-wave (page-embedded
 * astro-island props, extracted 2026-09-11): 9 <rect> children, each
 * carrying 4 SMIL <animate> elements (attributeName x/y/width/height,
 * dur="0.6s", staggered begin via syncbase refs like
 * "spinner_oJFS.begin+0.1s"), root fill="currentColor" viewBox="0 0 24 24".
 * Site license: MIT, commercial + personal use, no attribution required
 * — this header is the vendoring receipt.
 *
 * The bytes are LAW. NO svgo ever runs on this lane (design §5/§8 —
 * svgo's default preset converts <rect> to <path> and silently KILLS
 * attributeName="x|y|width|height" animate targeting), and the artifact
 * extraction keeps the children inner-HTML byte-faithful — syncbase
 * begin refs and element ids ride through untouched (design §3).
 */

/** the built-in's name (kebab grammar, the icon channel-id lane) */
export const BLOCKS_WAVE_NAME = 'blocks-wave';

/**
 * the vendored svg, single-quoted as a TS string constant. The source
 * bytes carry no single quotes, backslashes or control characters, so
 * the literal below IS the file bytes (write-then-verified against
 * the extraction).
 */
export const BLOCKS_WAVE_SVG =
  '<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="7.33" height="7.33"><animate id="spinner_oJFS" begin="0;spinner_5T1J.end+0.2s" attributeName="x" dur="0.6s" values="1;4;1"/><animate begin="0;spinner_5T1J.end+0.2s" attributeName="y" dur="0.6s" values="1;4;1"/><animate begin="0;spinner_5T1J.end+0.2s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="0;spinner_5T1J.end+0.2s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect x="8.33" y="1" width="7.33" height="7.33"><animate begin="spinner_oJFS.begin+0.1s" attributeName="x" dur="0.6s" values="8.33;11.33;8.33"/><animate begin="spinner_oJFS.begin+0.1s" attributeName="y" dur="0.6s" values="1;4;1"/><animate begin="spinner_oJFS.begin+0.1s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="spinner_oJFS.begin+0.1s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect x="1" y="8.33" width="7.33" height="7.33"><animate begin="spinner_oJFS.begin+0.1s" attributeName="x" dur="0.6s" values="1;4;1"/><animate begin="spinner_oJFS.begin+0.1s" attributeName="y" dur="0.6s" values="8.33;11.33;8.33"/><animate begin="spinner_oJFS.begin+0.1s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="spinner_oJFS.begin+0.1s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect x="15.66" y="1" width="7.33" height="7.33"><animate begin="spinner_oJFS.begin+0.2s" attributeName="x" dur="0.6s" values="15.66;18.66;15.66"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="y" dur="0.6s" values="1;4;1"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect x="8.33" y="8.33" width="7.33" height="7.33"><animate begin="spinner_oJFS.begin+0.2s" attributeName="x" dur="0.6s" values="8.33;11.33;8.33"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="y" dur="0.6s" values="8.33;11.33;8.33"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect x="1" y="15.66" width="7.33" height="7.33"><animate begin="spinner_oJFS.begin+0.2s" attributeName="x" dur="0.6s" values="1;4;1"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="y" dur="0.6s" values="15.66;18.66;15.66"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="spinner_oJFS.begin+0.2s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect x="15.66" y="8.33" width="7.33" height="7.33"><animate begin="spinner_oJFS.begin+0.3s" attributeName="x" dur="0.6s" values="15.66;18.66;15.66"/><animate begin="spinner_oJFS.begin+0.3s" attributeName="y" dur="0.6s" values="8.33;11.33;8.33"/><animate begin="spinner_oJFS.begin+0.3s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="spinner_oJFS.begin+0.3s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect x="8.33" y="15.66" width="7.33" height="7.33"><animate begin="spinner_oJFS.begin+0.3s" attributeName="x" dur="0.6s" values="8.33;11.33;8.33"/><animate begin="spinner_oJFS.begin+0.3s" attributeName="y" dur="0.6s" values="15.66;18.66;15.66"/><animate begin="spinner_oJFS.begin+0.3s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="spinner_oJFS.begin+0.3s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect x="15.66" y="15.66" width="7.33" height="7.33"><animate id="spinner_5T1J" begin="spinner_oJFS.begin+0.4s" attributeName="x" dur="0.6s" values="15.66;18.66;15.66"/><animate begin="spinner_oJFS.begin+0.4s" attributeName="y" dur="0.6s" values="15.66;18.66;15.66"/><animate begin="spinner_oJFS.begin+0.4s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33"/><animate begin="spinner_oJFS.begin+0.4s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33"/></rect></svg>';

/** the built-in set the generator packs first (frozen order); custom
 *  spinners in the consumer config pack AFTER, same-name OVERRIDES in
 *  place — the icons override law (design §5) */
export const DEFAULT_SPINNERS_MANIFEST: readonly {
  readonly name: string;
  readonly svg: string;
}[] = [
  { name: BLOCKS_WAVE_NAME, svg: BLOCKS_WAVE_SVG },
];

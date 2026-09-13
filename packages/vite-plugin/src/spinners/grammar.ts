/**
 * @jixoai/ui-vite-plugin (spinners) — the name grammar leaf
 * (spinner-channel-api §2). A dependency-free module so resolve.ts
 * and the channel factory/normalizer share the patterns WITHOUT a
 * module cycle; resolve.ts re-exports both as the face's public
 * grammar surface.
 */

/**
 * FLAT / channel-RELATIVE spinner names: kebab and tame (the icon
 * channel-id grammar, NOT the icons' lowerCamel) with one relaxation
 * (review R2, 2026-09-12): a DIGIT may lead — the magecdn pack's
 * names are its site URLs ('180-ring', '12-dots-scale-rotate') and
 * keeping them verbatim is the discoverability contract; quoted
 * artifact keys and string-literal union members carry digit-leading
 * names fine. The unified name lane stays legible against the text
 * catalog's camelCase (design §4).
 */
export const SPINNER_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/**
 * the FULL artifact-name grammar (spinner-channel-api §2): the flat
 * pattern above OR `prefix:name` — prefix per the channel contract
 * (/^[a-z][a-z0-9]*$/), name flat (digit-leading legal, so
 * `magecdn:180-ring` passes), the separator exactly once
 * (regex-anchored; 'a:b:c' matches neither alternative)
 */
export const SPINNER_FULL_NAME_PATTERN =
  /^[a-z0-9][a-z0-9-]*$|^[a-z][a-z0-9]*:[a-z0-9][a-z0-9-]*$/;

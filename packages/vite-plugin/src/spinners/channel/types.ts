/**
 * @jixoai/ui-vite-plugin (spinners channels) — the channel contract
 * (spinner-channel-api design §0, 2026-09-13; the icon channel
 * contract carried over field-for-field where the spinner domain
 * has an equivalent).
 *
 * A channel is ONE spinner source reachable through a prefixed
 * reference form (`myco:pulse`, `magecdn:clock`). Unlike the icons'
 * per-ref peer-package resolver, a spinner channel CARRIES its
 * enumerable record — the artifact is all-or-nothing (no lazy
 * tier), so the set is known at config time and every entry crosses
 * the SAME resolve → RAW safety → structural validation pipeline a
 * flat entry does (custom channels inherit the built-ins'
 * guarantees by construction). `peerPackage` rides as ADVISORY
 * metadata (declaration, not resolution — the mirror of the
 * resolver swap): it names the expected package in error text and
 * docs; the shipped pack factories carry none (their bytes are
 * vendored).
 */

/** the channel id grammar — /^[a-z][a-z0-9-]*$/ (the icon channel-id grammar) */
export const CHANNEL_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

/** the prefix grammar — /^[a-z][a-z0-9]*$/ (the icon prefix grammar byte-for-byte; it becomes the `prefix:name` namespace) */
export const CHANNEL_PREFIX_PATTERN = /^[a-z][a-z0-9]*$/;

/** one registered spinner channel — what `spinners.channels` accepts */
export interface SpinnerChannel {
  /** /^[a-z][a-z0-9-]*$/, unique among registered; no reserved id (the blocks-wave default is a FLAT built-in, not a channel) */
  readonly id: string;
  /** /^[a-z][a-z0-9]*$/, unique among registered; the ref namespace (`myco:…`) */
  readonly prefix: string;
  /** the channel's spinner set, channel-RELATIVE names (the flat spinner grammar) → SpinnerSource; non-empty by construction (the factory refuses empty) */
  readonly spinners: Readonly<Record<string, import('../types.js').SpinnerSource>>;
  /** advisory: the expected peer package, named in error text/docs (never resolved on this lane) */
  readonly peerPackage?: string;
  /** human-readable mapping note (pack provenance, style knobs…) */
  readonly defaultsNote?: string;
}

/** what defineSpinnerChannel accepts (the public factory's one argument) */
export interface DefineSpinnerChannelSpec {
  readonly id: string;
  readonly prefix: string;
  readonly spinners: Readonly<Record<string, import('../types.js').SpinnerSource>>;
  readonly peerPackage?: string;
  readonly defaultsNote?: string;
}

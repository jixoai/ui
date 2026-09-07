/**
 * @jixoai/ui-vite-plugin (icons library channels) — the channel contract
 * (A1, openspec icon-channel-api design §0, 2026-09-07).
 *
 * A channel is ONE icon source reachable through a prefixed reference
 * form (`md:home`, `myco:logo`) usable wherever IconSource strings are.
 * This is the PUBLIC base every prefixed lane rides — the shipped
 * channels (lucide/md/ph/rx) are thin `defineIconChannel` calls over
 * it, and a consumer's own channel is the SAME contract. The channel
 * LOCATES artwork (node resolution to an ABSOLUTE .svg path); the
 * adapter READS it through ctx.loadSource (mime law + watchFile HMR,
 * frozen principle #4) and runs the shared RAW safety → svgo → extract
 * pipeline — custom channels inherit the built-ins' guarantees by
 * construction and can never smuggle unvetted bytes.
 *
 * The resolver is DISCRIMINATED (the codex r1 B1 fix): `file` channels
 * carry `resolveFile`; the ONE reserved `lucide` kind routes to the
 * existing IconNode lane (serializeLucideIcon over the dynamic
 * `import('lucide')`) — the single documented non-file asymmetry, a
 * built-in owned by the plugin (…/icons/lucide exports the instance;
 * defineIconChannel cannot forge it).
 */

/**
 * how a channel resolves one ref — DISCRIMINATED on `kind`:
 *   - 'file': resolveFile(ref) returns the peer package's ABSOLUTE svg
 *     path — never resolved icon data (the post-pipeline
 *     ResolvedLibraryIcon shape would contradict the shared pipeline);
 *     the adapter still owns the READ (resolve.ts → ctx.loadSource)
 *   - 'lucide': THE built-in IconNode lane (the reserved kind —
 *     serializeLucideIcon + the dynamic lucide import, never
 *     resolveFile)
 */
export type IconChannelResolver =
  | { readonly kind: 'file'; readonly resolveFile: (ref: string) => string }
  | { readonly kind: 'lucide' };

/** one registered icon channel — what `library.channels` accepts */
export interface IconChannel {
  /** /^[a-z][a-z0-9-]*$, unique among registered; 'lucide' reserved (the default-registered channel owns it) */
  readonly id: string;
  /** /^[a-z][a-z0-9]*$/, the ref namespace (`myco:logo`); 'lucide' reserved */
  readonly prefix: string;
  /** the optional peer package — named in every loud-fail install-hint error */
  readonly peerPackage?: string;
  /** the discriminated resolution contract (kind 'file' | 'lucide') */
  readonly resolver: IconChannelResolver;
  /** human-readable mapping note (weight/style/fill, directory layout…) */
  readonly defaultsNote?: string;
}

/** what `defineIconChannel` accepts — ALWAYS builds a file-kind resolver */
export interface DefineIconChannelSpec {
  readonly id: string;
  readonly prefix: string;
  readonly peerPackage?: string;
  /** the ref (text after `prefix:`) → the ABSOLUTE .svg path */
  readonly resolveFile: (ref: string) => string;
  readonly defaultsNote?: string;
}

/** the prefix grammar: a lowercase-led alphanumeric word (`md`, `myco`) */
export const CHANNEL_PREFIX_PATTERN = /^[a-z][a-z0-9]*$/;

/** the id grammar: lowercase-led alphanumeric + hyphens (`material`, `myco-core`) */
export const CHANNEL_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

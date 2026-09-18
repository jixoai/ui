/**
 * @jixoai/ui-design (server/presence) — the presence ledger
 * (collab-presence design.md §2: workspace 级身份账本).
 *
 * Orthogonal intents (2):
 *   1. PERSISTENCE — `.jx-collab/presence.json` under the design root,
 *      store.ts's validation posture: persisted input is untrusted,
 *      every field goes through a runtime schema check (counter is a
 *      non-negative integer, players is an array of well-shaped rows).
 *      Where the collab kernel's store fails STOP, the ledger's
 *      recovery is REBUILD: a corrupted presence file degrades to an
 *      empty ledger with a loud log line — presence is cosmetic, the
 *      studio must keep booting (design.md §6: "studio 照常起、网关
 *      重建账本").
 *   2. IDENTITY LAW — counter 只增不减: every new Player (no token or
 *      token miss) advances the counter, `playerId = p<counter>`,
 *      `colorHue = (73 * counter) % 360` — the join order IS the
 *      color, never reused. A token hit restores the SAME identity
 *      (id + hue + name); tokens are stored sha256-hashed, never in
 *      the clear. Online state is NOT persisted — the ledger records
 *      identity only (the gateway's connection table is the truth for
 *      presence).
 *
 * Original need: collab-presence (2026-09-17).
 */

import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** the two Player species (design.md §1 vocabulary) */
export type PresenceKind = 'human' | 'ai';

/** one persisted identity row (design.md §2 schema, frozen) */
export interface PresencePlayerRecord {
  readonly playerId: string;
  readonly name: string;
  readonly kind: PresenceKind;
  /** `sha256:<64 hex>` — the token itself lives only in the client's session */
  readonly tokenHash: string;
  readonly colorHue: number;
  readonly firstSeen: number;
  lastSeen: number;
}

/** the whole persisted file (design.md §2 schema, frozen) */
export interface PresenceLedgerState {
  counter: number;
  players: PresencePlayerRecord[];
}

/** a freshly issued (or restored) identity handed to a connection */
export interface PresenceIdentity {
  readonly record: PresencePlayerRecord;
  /** the PLAIN token — disclosed exactly once, in the welcome message */
  readonly token: string;
}

/** the on-disk name, inside the design workspace's collab dir */
const PRESENCE_FILE = 'presence.json';

/** how long a departed player's hue still constrains new mints — the
 *  reconnect window (a quick leave→rejoin must not mint a near-duplicate
 *  of the departed hue; a stale record from yesterday must not constrain
 *  forever) */
export const PERSISTED_HUE_TTL_MS = 15 * 60_000;

/** token → the stored hash form (`sha256:<hex>`) */
export const hashToken = (token: string): string => `sha256:${createHash('sha256').update(token).digest('hex')}`;

/** a fresh 32-hex-char token (design.md §1: 随机 32hex) */
const mintToken = (): string => randomBytes(16).toString('hex');

/** the color law (walkthrough R2, Owner 2026-09-19): the wheel-opposite
 * pick — a newcomer lands on the FAR side of the color wheel, never a
 * fixed step from the previous join (the old 73·counter law put every
 * adjacent pair 73° apart — 相邻太相似). The pick maximizes the minimum
 * circular distance to every live hue, skips candidates exactly
 * antipodal to one (Owner: 选到对面的色，当然不是正对面), and breaks
 * ties toward the antipode of the most recent joiner. The first player
 * anchors on the brand hue 73. */
export const BRAND_ANCHOR_HUE = 73;

/** circular hue distance on the 360° wheel (both directions considered) */
export const circularHueDistance = (a: number, b: number): number => {
  const na = ((Math.round(a) % 360) + 360) % 360;
  const nb = ((Math.round(b) % 360) + 360) % 360;
  const raw = Math.abs(na - nb);
  return Math.min(raw, 360 - raw);
};

/** the wheel-opposite pick (pure, deterministic): `existing` = the live
 *  hues at mint time, `latest` = the most recent joiner's hue (ties
 *  break toward its antipode) */
export function pickHue(existing: readonly number[], latest?: number): number {
  const live = existing.filter((hue) => Number.isFinite(hue)).map((hue) => ((Math.round(hue) % 360) + 360) % 360);
  if (live.length === 0) return BRAND_ANCHOR_HUE;
  const anchor = latest === undefined ? live[live.length - 1]! : ((Math.round(latest) % 360) + 360) % 360;
  const antipode = (anchor + 180) % 360;
  let best = -1;
  let bestMinDist = -1; // distance to the nearest live hue (maximized)
  let bestAntipodeDist = Infinity; // distance to the anchor's antipode (minimized on ties)
  for (let hue = 0; hue < 360; hue += 1) {
    let minDist = 360;
    let antipodal = false; // exactly 180 from ANY live hue — never that
    for (const e of live) {
      const d = circularHueDistance(hue, e);
      if (d === 180) {
        antipodal = true;
        break;
      }
      if (d < minDist) minDist = d;
    }
    if (antipodal) continue;
    const antipodeDist = circularHueDistance(hue, antipode);
    if (minDist > bestMinDist || (minDist === bestMinDist && antipodeDist < bestAntipodeDist)) {
      best = hue;
      bestMinDist = minDist;
      bestAntipodeDist = antipodeDist;
    }
  }
  return best < 0 ? BRAND_ANCHOR_HUE : best; // unreachable with live non-empty; the anchor keeps it total
}

/* ── runtime schema checks (store.ts posture — persisted input is untrusted) ── */

const isObj = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isStr = (value: unknown): value is string => typeof value === 'string';
const isInt = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);
const isTokenHash = (value: unknown): value is string => isStr(value) && /^sha256:[0-9a-f]{64}$/.test(value);
const isKind = (value: unknown): value is PresenceKind => value === 'human' || value === 'ai';

function validPlayerRow(value: unknown): value is PresencePlayerRecord {
  return (
    isObj(value) &&
    isStr(value.playerId) &&
    /^p\d+$/.test(value.playerId) &&
    isStr(value.name) &&
    value.name.length > 0 &&
    isKind(value.kind) &&
    isTokenHash(value.tokenHash) &&
    isInt(value.colorHue) &&
    value.colorHue >= 0 &&
    value.colorHue < 360 &&
    isInt(value.firstSeen) &&
    isInt(value.lastSeen)
  );
}

/** the load outcome: a state, or the loud note that explains a rebuild */
interface LoadedLedger {
  readonly state: PresenceLedgerState;
  readonly recoveryNote?: string;
}

/* ── the ledger ─────────────────────────────────────────────────────────── */

export class PresenceLedger {
  readonly #file: string;
  #state: PresenceLedgerState;
  /** set when the persisted file was rejected and the ledger rebuilt empty */
  readonly recoveryNote: string | undefined;

  /**
   * @param designDir the design workspace root — the ledger lives at
   *        `<designDir>/.jx-collab/presence.json`, beside the collab
   *        kernel's own frozen artifacts (the collab host's store lays
   *        the dir out when it opens; a degraded workspace gets it here).
   */
  constructor(designDir: string) {
    this.#file = join(designDir, '.jx-collab', PRESENCE_FILE);
    const loaded = this.#load();
    this.#state = loaded.state;
    this.recoveryNote = loaded.recoveryNote;
  }

  #load(): LoadedLedger {
    const empty: PresenceLedgerState = { counter: 0, players: [] };
    if (!existsSync(this.#file)) return { state: empty };
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(this.#file, 'utf8'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { state: empty, recoveryNote: `${this.#file}: malformed JSON (${message}) — the presence ledger was rebuilt empty` };
    }
    if (
      !isObj(parsed) ||
      !isInt(parsed.counter) ||
      parsed.counter < 0 ||
      !Array.isArray(parsed.players) ||
      !parsed.players.every(validPlayerRow)
    ) {
      return { state: empty, recoveryNote: `${this.#file}: failed its runtime schema check (counter / players shape) — the presence ledger was rebuilt empty` };
    }
    return { state: { counter: parsed.counter, players: parsed.players } };
  }

  #persist(): void {
    mkdirSync(dirname(this.#file), { recursive: true });
    writeFileSync(this.#file, `${JSON.stringify(this.#state, null, 2)}\n`);
  }

  /** mint the next identity under the counter law (counter 只增不减);
   *  the hue rides the wheel-opposite pick against the live set PLUS
   *  recently-seen persisted records (a quick leave→rejoin must not
   *  mint a near-duplicate of the departed hue) */
  #mint(name: string | undefined, kind: PresenceKind, liveHues?: { readonly existing: readonly number[]; readonly latest?: number }): PresenceIdentity {
    const token = mintToken();
    this.#state.counter += 1;
    const counter = this.#state.counter;
    const now = Date.now();
    const recentCutoff = now - PERSISTED_HUE_TTL_MS;
    const persistedHues = this.#state.players.filter((row) => row.lastSeen >= recentCutoff).map((row) => row.colorHue);
    const record: PresencePlayerRecord = {
      playerId: `p${counter}`,
      name: name ?? `player-${counter}`,
      kind,
      tokenHash: hashToken(token),
      colorHue: pickHue([...(liveHues?.existing ?? []), ...persistedHues], liveHues?.latest),
      firstSeen: now,
      lastSeen: now,
    };
    this.#state.players.push(record);
    this.#persist();
    return { record, token };
  }

  /**
   * The connection-time identity resolution (design.md §1): a token hit
   * restores the SAME identity (id + hue + name); a miss or absence
   * mints a NEW one and issues a fresh token (token 是身份凭据 —
   * dev-level auth, not a password). `liveHues` feeds the wheel-opposite
   * pick on mint (the gateway's live roster at connect time).
   */
  restoreOrCreate(query: { name?: string; kind: PresenceKind; token?: string }, liveHues?: { readonly existing: readonly number[]; readonly latest?: number }): PresenceIdentity {
    if (query.token !== undefined && query.token.length > 0) {
      const hash = hashToken(query.token);
      const hit = this.#state.players.find((player) => player.tokenHash === hash);
      if (hit !== undefined) {
        hit.lastSeen = Date.now();
        this.#persist();
        return { record: hit, token: query.token };
      }
    }
    return this.#mint(query.name !== undefined && query.name.length > 0 ? query.name : undefined, query.kind, liveHues);
  }

  /**
   * A server-held identity (design.md §5: the dsh lane's 代注册 ai
   * Player): reuse by (name, kind='ai') so the identity (and its color)
   * survives restarts; otherwise mint. The token of a server-held
   * player is never disclosed — no one connects as it.
   */
  ensureServerPlayer(name: string, liveHues?: { readonly existing: readonly number[]; readonly latest?: number }): PresencePlayerRecord {
    const hit = this.#state.players.find((player) => player.kind === 'ai' && player.name === name);
    if (hit !== undefined) {
      hit.lastSeen = Date.now();
      this.#persist();
      return hit;
    }
    return this.#mint(name, 'ai', liveHues).record;
  }

  /** identity lookup by playerId (read-only) */
  find(playerId: string): PresencePlayerRecord | undefined {
    return this.#state.players.find((player) => player.playerId === playerId);
  }

  /** the persisted counter (tests assert the monotone law across instances) */
  get counter(): number {
    return this.#state.counter;
  }

  /** the persisted file path (tests assert the frozen layout) */
  get file(): string {
    return this.#file;
  }
}

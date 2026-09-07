/**
 * The @jixoai/ui-betlang-wasm types (index.d.ts, task 4.1).
 *
 * Label indices are betlang 0.1.1's `Language` discriminants
 * (`#[repr(u8)]`, alphabetical model labels) — this table is the ABI
 * contract between the wasm and TS consumers (the DLD detector keeps
 * its own copy; bump both together or never):
 *
 *   0 asm          1 batch        2 c            3 clojure
 *   4 cmake        5 cobol        6 cpp          7 cs
 *   8 css          9 dart        10 dockerfile  11 elixir
 *  12 erlang     13 gemfile     14 gemspec     15 go
 *  16 gradle     17 groovy      18 haskell     19 html
 *  20 ini        21 java        22 javascript  23 json
 *  24 julia      25 kotlin      26 lisp        27 lua
 *  28 markdown   29 objectivec  30 ocaml       31 perl
 *  32 php        33 powershell  34 python      35 r
 *  36 ruby       37 rust        38 scala       39 shell
 *  40 sql        41 swift       42 toml        43 typescript
 *  44 vba        45 verilog     46 xml         47 yaml
 */

/** how the wasm reaches memory: raw bytes, or a fetchable URL the
 * loader validates (2xx + normalized `application/wasm`) */
export type BetlangWasmSource = { url: string } | { bytes: Uint8Array };

/** one detection: the model-label index (table above) and the top-1
 * calibrated probability of the producing call (0..=1 in practice —
 * NaN/out-of-range values are the CONSUMER's to drop, never clamp) */
export interface BetlangDetection {
  labelIndex: number;
  confidence: number;
}

/** the instantiated detector (one per process; the promise is the cache) */
export interface BetlangWasm {
  /** the raw wasm exports (memory grows as inputs demand) */
  readonly exports: {
    memory: WebAssembly.Memory;
    detect(ptr: number, len: number): number;
    last_confidence(): number;
  };
  /** null when the input is empty / whitespace-only / too short for the
   * model window — "no opinion", not an error */
  detect(code: string): BetlangDetection | null;
}

/** instantiate from an explicit source or the default channel
 * (Node: fs bytes; browser: the relative `new URL(...)` asset) */
export function loadBetlang(source?: BetlangWasmSource): Promise<BetlangWasm>;

/** convenience one-shot detection through the default channel */
export function detectSource(code: string, source?: BetlangWasmSource): Promise<BetlangDetection | null>;

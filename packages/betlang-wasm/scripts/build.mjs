#!/usr/bin/env node
// The @jixoai/betlang-wasm build gate (packages/betlang-wasm, task 4.1 —
// highlight-lang-detector change, 2026-09-07).
//
// The reproducible chain, ported from evidence/betlang-probe-2026-09-07.md
// (r11 script) to node so the npm package owns its own artifact:
//
//   1. LOCK PIN — Cargo.lock must pin betlang 0.1.1 AND fearless_simd
//      0.4.0 (the anti-drift pin: unpinned, a fresh lock drifts
//      fearless_simd to 0.4.1 and the shipped bytes leave the measured
//      baseline). The lock is committed; --locked forbids cargo from
//      touching it.
//   2. SPARSE-INDEX CHECKSUM GATE (network; --offline skips with a
//      loud note) — crates.io sparse index rows for both pins must be
//      unyanked with cksum equal to the Cargo.lock checksum: the
//      registry supply chain (tarball bytes) is verified against the
//      immutable index BEFORE any compilation, mirroring the evidence
//      probe's curl + shasum gate.
//   3. TOOLCHAIN RESOLUTION — $RUSTC/$CARGO env > `rustup which` >
//      PATH. The evidence pitfall: Homebrew cargo drives a rustc with
//      no wasm32-unknown-unknown std; when rustup exists BOTH cargo and
//      rustc come from it (and RUSTC is exported anyway so a foreign
//      cargo still drives the rustup rustc). wasm32 target presence is
//      asserted with the fix in the error.
//   4. BUILD — cargo build --release --target wasm32-unknown-unknown
//      --locked, then copy the cdylib to dist/betlang_wasm.wasm
//      (binaries never enter git; dist/ is npm-files only).
//   5. KiB BUDGET LAW (bytes, KiB=1024B; gzip = zlib.gzipSync level 9 —
//      the frozen algorithm): raw > 102400 or gzip > 71680 -> exit 1
//      (hard budget FIRST); raw > 100352 -> exit 2 (98 KiB warn line —
//      the degradation-plan trigger of design D4).
//   6. ARTIFACT — print the measured field block; --write-artifact
//      rewrites ARTIFACT.md in place (as-shipped semantics: whoever
//      builds for release records their bytes; CI release builds own
//      the canonical values).
//
// Usage: node scripts/build.mjs [--offline] [--write-artifact]
// Exit 0 = built within budgets; 1 = hard budget / gate failure;
// 2 = built but over the warn line (still a failure for CI).

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const PKG_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const argv = process.argv.slice(2);
const offline = argv.includes('--offline');
const writeArtifact = argv.includes('--write-artifact');

const BETLANG_VERS = '0.1.1';
const FEARLESS_SIMD_VERS = '0.4.0';
const INDEX_URLS = {
  betlang: 'https://index.crates.io/be/tl/betlang',
  fearless_simd: 'https://index.crates.io/fe/ar/fearless_simd',
};
const RAW_BUDGET = 102400; // 100 KiB hard
const GZIP_BUDGET = 71680; // 70 KiB hard
const RAW_WARN = 100352; // 98 KiB degradation-plan trigger

const die = (message) => {
  console.error(`[betlang-wasm-build] ${message}`);
  process.exit(1);
};

// --- 1: the committed lock pins -------------------------------------------

function lockPackage(name) {
  const lock = readFileSync(join(PKG_DIR, 'Cargo.lock'), 'utf8');
  const blocks = lock.split('[[package]]');
  const block = blocks.find((b) => b.includes(`name = "${name}"`));
  if (block === undefined) die(`Cargo.lock has no [[package]] "${name}" — commit the generated lock`);
  const version = /^version = "([^"]+)"/m.exec(block)?.[1];
  const checksum = /^checksum = "([0-9a-f]{64})"/m.exec(block)?.[1];
  if (version === undefined || checksum === undefined) {
    die(`Cargo.lock "${name}" block lacks version/checksum — regenerate with cargo generate-lockfile`);
  }
  return { version, checksum };
}

const betlangPin = lockPackage('betlang');
const simdPin = lockPackage('fearless_simd');
if (betlangPin.version !== BETLANG_VERS) {
  die(`Cargo.lock pins betlang ${betlangPin.version} — this package builds exactly ${BETLANG_VERS} (Cargo.toml pin)`);
}
if (simdPin.version !== FEARLESS_SIMD_VERS) {
  die(
    `Cargo.lock pins fearless_simd ${simdPin.version} — expected ${FEARLESS_SIMD_VERS} ` +
      '(the anti-drift pin; a fresh lockfile drifts to 0.4.1 and leaves the measured baseline)',
  );
}

// --- 2: sparse-index checksum gate ----------------------------------------

async function indexRow(url, vers) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) die(`sparse index ${url} answered ${res.status} — cannot verify the registry pin`);
  const rows = (await res.text()).trim().split('\n').map((line) => JSON.parse(line));
  return rows.find((row) => row.vers === vers) ?? null;
}

if (offline) {
  console.log('[betlang-wasm-build]   offline: sparse-index checksum gate skipped (lock checksums still enforced by --locked)');
} else {
  for (const [name, pin] of [['betlang', betlangPin], ['fearless_simd', simdPin]]) {
    const row = await indexRow(INDEX_URLS[name], pin.version).catch((err) =>
      die(`sparse index fetch for ${name} failed (${err.message}) — rerun with --offline to skip the gate`),
    );
    if (row === null) die(`crates.io index has no ${name} ${pin.version} row — the pin left the registry`);
    if (row.yanked) die(`crates.io yanked ${name} ${pin.version} — the pin is dead, escalate to a design change`);
    if (row.cksum !== pin.checksum) {
      die(
        `crates.io index cksum for ${name} ${pin.version} is ${row.cksum} but Cargo.lock says ${pin.checksum} ` +
          '— regenerate the lock and re-review; never silence this check',
      );
    }
    console.log(`[betlang-wasm-build]   index cksum OK: ${name} ${pin.version} (${row.cksum.slice(0, 12)}…)`);
  }
}

// --- 3: toolchain resolution ----------------------------------------------

function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', ...options });
}

function resolveTool(name) {
  const envKey = name === 'cargo' ? 'CARGO' : 'RUSTC';
  if (process.env[envKey] !== undefined && process.env[envKey] !== '') return process.env[envKey];
  const which = run('rustup', ['which', name]);
  if (which.status === 0) return which.stdout.trim();
  return name; // PATH fallback (CI setup-rust-toolchain puts them on PATH)
}

const cargoBin = resolveTool('cargo');
const rustcBin = resolveTool('rustc');
const buildEnv = { ...process.env };
if (rustcBin !== 'rustc') buildEnv.RUSTC = rustcBin;

// The macOS toolchain quirk (probe-verified 2026-09-07): the rustup
// PROXY injects the toolchain lib dir into the dynamic-library path so
// spawned tools resolve; a DIRECT toolchain cargo does not, and its
// rust-lld (rpath one directory short) aborts at dyld load hunting
// libLLVM.dylib. Injecting the rustc sysroot's lib dir ourselves makes
// every resolution mode self-sufficient (the pair never mixes vendors:
// rustup present -> both bins from rustup; absent -> both from PATH,
// and the sysroot lib is then whatever that pair already links).
const sysrootProbe = run(rustcBin, ['--print', 'sysroot']);
if (sysrootProbe.status === 0 && sysrootProbe.stdout.trim() !== '') {
  const sysrootLib = join(sysrootProbe.stdout.trim(), 'lib');
  const libPathKey = process.platform === 'darwin' ? 'DYLD_LIBRARY_PATH' : 'LD_LIBRARY_PATH';
  buildEnv[libPathKey] =
    buildEnv[libPathKey] === undefined ? sysrootLib : `${sysrootLib}:${buildEnv[libPathKey]}`;
}

// wasm32 target presence (rustup-aware; a rustc that prints its libdir
// for the target has the std built). Non-rustup setups surface at build.
const targetLibdir = run(rustcBin, ['--print', 'target-libdir', '--target', 'wasm32-unknown-unknown']);
if (targetLibdir.status !== 0) {
  die(
    `rustc cannot resolve wasm32-unknown-unknown (is the target installed?) — fix: ` +
      `\`rustup target add wasm32-unknown-unknown\` (Homebrew rust ships no wasm32 std — use the rustup toolchain)`,
  );
}

// --- 4: build + dist copy --------------------------------------------------

console.log(`[betlang-wasm-build]   cargo ${cargoBin} (RUSTC=${buildEnv.RUSTC ?? rustcBin}) build --release --locked`);
const build = run(cargoBin, ['build', '--release', '--target', 'wasm32-unknown-unknown', '--locked'], {
  cwd: PKG_DIR,
  env: buildEnv,
});
process.stdout.write(build.stdout ?? '');
process.stderr.write(build.stderr ?? '');
if (build.status !== 0) die(`cargo build failed (exit ${build.status}) — see compiler output above`);

const TARGET_WASM = join(PKG_DIR, 'target', 'wasm32-unknown-unknown', 'release', 'betlang_wasm.wasm');
const DIST_WASM = join(PKG_DIR, 'dist', 'betlang_wasm.wasm');
mkdirSync(dirname(DIST_WASM), { recursive: true });
copyFileSync(TARGET_WASM, DIST_WASM);

// --- 5: measurement + the budget law ---------------------------------------

const wasmBytes = readFileSync(DIST_WASM);
const magic = wasmBytes.subarray(0, 4);
if (magic[0] !== 0x00 || magic[1] !== 0x61 || magic[2] !== 0x73 || magic[3] !== 0x6d) {
  die('dist artifact does not start with the \\0asm magic bytes — not a wasm module');
}
const wasmRawBytes = wasmBytes.byteLength;
const wasmGzipBytes = gzipSync(wasmBytes, { level: 9 }).length;
const wasmSha256 = createHash('sha256').update(wasmBytes).digest('hex');
const kib = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

console.log(`[betlang-wasm-build]   dist/betlang_wasm.wasm raw ${wasmRawBytes} B (${kib(wasmRawBytes)})`);
console.log(`[betlang-wasm-build]   gzip(9) ${wasmGzipBytes} B (${kib(wasmGzipBytes)})  sha256 ${wasmSha256}`);
console.log(
  `[betlang-wasm-build]   budget: raw ${wasmRawBytes <= RAW_BUDGET ? '≤' : '>'} ${RAW_BUDGET}` +
    ` / gzip ${wasmGzipBytes <= GZIP_BUDGET ? '≤' : '>'} ${GZIP_BUDGET}` +
    ` / warn-line raw ${wasmRawBytes <= RAW_WARN ? '≤' : '>'} ${RAW_WARN}`,
);

let exitCode = 0;
if (wasmRawBytes > RAW_BUDGET || wasmGzipBytes > GZIP_BUDGET) {
  console.error('[betlang-wasm-build] OVER HARD BUDGET (raw > 100 KiB or gzip > 70 KiB) — the channel is dead; design D4 degradation plan applies');
  exitCode = 1;
} else if (wasmRawBytes > RAW_WARN) {
  console.error('[betlang-wasm-build] OVER 98 KiB WARN LINE — design D4 degradation plan: betlang demotes to non-default, L4 swaps to the linguist-derived heuristic layer (rewrite + re-review)');
  exitCode = 2;
}

// --- 6: ARTIFACT.md --------------------------------------------------------

const rustcVv = run(rustcBin, ['-Vv']);
const cargoV = run(cargoBin, ['-V']);
const toolchain = {
  rustcVersion: (rustcVv.stdout ?? '').trim(),
  cargoVersion: (cargoV.stdout ?? '').trim(),
};

function artifactMarkdown(fields) {
  return `# ARTIFACT — @jixoai/betlang-wasm ${BETLANG_VERS} (as-shipped)

As-shipped record of the wasm this package distributes (design D4):
the canonical hash is the value recorded HERE by whoever builds the
release (CI release build owns the shipped values; local rebuilds vary
— the build embeds its directory path, evidence r9). \`scripts/
verify-betlang-pin.mjs\` checks every field below against the actual
dist bytes and Cargo.lock. Budget law (KiB = 1024 B, gzip = Node zlib
level 9): raw ≤ 102400, gzip ≤ 71680, warn line raw ≤ 100352.

Supply chain: crates.io \`betlang ${BETLANG_VERS}\` (tarball sha256 =
crate checksum, verified against the sparse index before every build)
with \`fearless_simd ${FEARLESS_SIMD_VERS}\` pinned to betlang's own
lock (fresh locks drift to 0.4.1 — never unpin). Binaries never enter
git; npm is the only distribution channel.

\`\`\`
wasmPath: ${fields.wasmPath}
wasmRawBytes: ${fields.wasmRawBytes}
wasmGzipBytes: ${fields.wasmGzipBytes}
wasmSha256: ${fields.wasmSha256}
tarballSha256: ${fields.tarballSha256}
crateChecksum: ${fields.crateChecksum}
fearlessSimdVers: ${fields.fearlessSimdVers}
fearlessSimdCksum: ${fields.fearlessSimdCksum}
rustcVersion: ${fields.rustcVersion.replace(/\n/g, ' | ')}
cargoVersion: ${fields.cargoVersion}
\`\`\`
`;
}

const artifactFields = {
  wasmPath: 'dist/betlang_wasm.wasm',
  wasmRawBytes,
  wasmGzipBytes,
  wasmSha256,
  tarballSha256: betlangPin.checksum,
  crateChecksum: betlangPin.checksum,
  fearlessSimdVers: FEARLESS_SIMD_VERS,
  fearlessSimdCksum: simdPin.checksum,
  ...toolchain,
};

if (writeArtifact) {
  writeFileSync(join(PKG_DIR, 'ARTIFACT.md'), artifactMarkdown(artifactFields));
  console.log('[betlang-wasm-build]   ARTIFACT.md rewritten (as-shipped values recorded)');
} else {
  console.log('[betlang-wasm-build]   ARTIFACT.md field block (pass --write-artifact to record):');
  for (const [key, value] of Object.entries(artifactFields)) {
    console.log(`[betlang-wasm-build]     ${key}: ${String(value).replace(/\n/g, ' | ')}`);
  }
}

process.exit(exitCode);

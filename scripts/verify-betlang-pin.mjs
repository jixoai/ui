#!/usr/bin/env node
// Supply-chain gate for the pinned betlang wasm (highlight-lang-detector
// change, task 4.3; the verify-ghostty-pin sentinel style, 2026-09-07).
//
// Verifies the @jixoai/ui-betlang-wasm artifact WITHOUT importing the
// package: the gate must run on a fresh clone (after `node
// scripts/build.mjs` in the package — binaries never enter git, so the
// dist wasm is a build product, and the committed ARTIFACT.md is the
// as-shipped record it is checked against).
//
// Checks (design D4, evidence/betlang-probe-2026-09-07.md 口径律):
//   1. the artifact is a wasm module — magic bytes \0asm;
//   2. as-shipped sha256/size — the dist bytes hash and measure exactly
//      what ARTIFACT.md records (gzip = Node zlib.gzipSync level 9, the
//      frozen algorithm);
//   3. Cargo.lock pins — betlang =0.1.1 AND fearless_simd =0.4.0 (the
//      anti-drift pin) with the checksums ARTIFACT.md records;
//   4. ARTIFACT.md field-by-field existence and internal consistency
//      (every task-4.3 field present; tarballSha256 === crateChecksum;
//      sha256 fields are 64 lowercase hex; sizes positive integers);
//   5. the KiB budget law measured on the ACTUAL bytes — hard first.
//
// Exit codes (the order is load-bearing, r11-B4: hard budget judged
// BEFORE the warn line, budgets before field mismatches):
//   0 verified · 1 hard budget (raw > 102400 or gzip > 71680)
//   2 warn line (raw > 100352, within hard) · 3 field/pin mismatch
//
// Usage: node scripts/verify-betlang-pin.mjs [wasmPath]
//                                    [--artifact <path>] [--lock <path>]
//        node scripts/verify-betlang-pin.mjs --self-test
// wasmPath defaults to the path declared in ARTIFACT.md (relative to
// the package root). --artifact/--lock redirect the records (self-test
// tooling only — CI always runs against the shipped files).

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const PKG_DIR = join(repoRoot, 'packages', 'betlang-wasm');
const SHIPPED_ARTIFACT = join(PKG_DIR, 'ARTIFACT.md');
const SHIPPED_LOCK = join(PKG_DIR, 'Cargo.lock');

const argv = process.argv.slice(2);
const argAfter = (flag) => {
  const at = argv.indexOf(flag);
  return at !== -1 && at + 1 < argv.length ? argv[at + 1] : undefined;
};
const artifactPath = argAfter('--artifact') ?? SHIPPED_ARTIFACT;
const lockPath = argAfter('--lock') ?? SHIPPED_LOCK;
/** the positional wasm path: the first arg that is neither a flag nor a
 * flag's value */
const positional = (() => {
  let expectValue = false;
  for (const arg of argv) {
    if (expectValue) {
      expectValue = false;
      continue;
    }
    if (arg.startsWith('--')) {
      expectValue = true;
      continue;
    }
    return arg;
  }
  return undefined;
})();

// frozen pin constants (design D4; Cargo.toml mirrors them)
const BETLANG_VERS = '0.1.1';
const FEARLESS_SIMD_VERS = '0.4.0';
const RAW_BUDGET = 102400; // 100 KiB hard
const GZIP_BUDGET = 71680; // 70 KiB hard
const RAW_WARN = 100352; // 98 KiB degradation-plan trigger
const SHA256_RE = /^[0-9a-f]{64}$/;
const WASM_MAGIC = [0x00, 0x61, 0x73, 0x6d];

// every ARTIFACT.md field task 4.3 names, in file order
const FIELDS = [
  'wasmPath',
  'wasmRawBytes',
  'wasmGzipBytes',
  'wasmSha256',
  'tarballSha256',
  'crateChecksum',
  'fearlessSimdVers',
  'fearlessSimdCksum',
  'rustcVersion',
  'cargoVersion',
];

const problems = [];
const notes = [];
const fail = (fix) => problems.push(fix);
const note = (line) => notes.push(line);
const sha256Hex = (bytes) => createHash('sha256').update(bytes).digest('hex');

/** parse the ``` field block: bare `key: value` lines (field names are
 * camelCase with digits — wasmSha256, tarballSha256) */
function parseArtifact(text) {
  const fields = {};
  for (const line of text.split('\n')) {
    const match = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line.trim());
    if (match !== null && FIELDS.includes(match[1])) fields[match[1]] = match[2].trim();
  }
  return fields;
}

function lockPackage(text, name) {
  const block = text.split('[[package]]').find((b) => b.includes(`name = "${name}"`));
  if (block === undefined) return null;
  return {
    version: /^version = "([^"]+)"/m.exec(block)?.[1] ?? null,
    checksum: /^checksum = "([^"]+)"/m.exec(block)?.[1] ?? null,
  };
}

// --- the shared verification pass (shipped files AND self-test fixtures) ---

function verify({ wasmPath, artifactText, lockText, label }) {
  // 4. ARTIFACT.md fields — existence + internal consistency first (the
  //    record itself must be whole before any byte is trusted)
  const fields = parseArtifact(artifactText);
  for (const name of FIELDS) {
    if (fields[name] === undefined || fields[name] === '') {
      fail(`${label}: ARTIFACT.md field "${name}" is missing — record it (node scripts/build.mjs --write-artifact)`);
    }
  }
  const has = (name) => fields[name] !== undefined && fields[name] !== '';
  if (has('wasmRawBytes') && (!/^\d+$/.test(fields.wasmRawBytes) || Number(fields.wasmRawBytes) <= 0)) {
    fail(`${label}: wasmRawBytes must be a positive integer (found ${JSON.stringify(fields.wasmRawBytes)})`);
  }
  if (has('wasmGzipBytes') && (!/^\d+$/.test(fields.wasmGzipBytes) || Number(fields.wasmGzipBytes) <= 0)) {
    fail(`${label}: wasmGzipBytes must be a positive integer (found ${JSON.stringify(fields.wasmGzipBytes)})`);
  }
  for (const name of ['wasmSha256', 'tarballSha256', 'crateChecksum', 'fearlessSimdCksum']) {
    if (has(name) && !SHA256_RE.test(fields[name])) {
      fail(`${label}: ${name} must be 64 lowercase hex chars (found ${JSON.stringify(fields[name])})`);
    }
  }
  if (has('tarballSha256') && has('crateChecksum') && fields.tarballSha256 !== fields.crateChecksum) {
    fail(`${label}: tarballSha256 and crateChecksum record the same crates.io tarball — they must agree`);
  }
  if (has('fearlessSimdVers') && fields.fearlessSimdVers !== FEARLESS_SIMD_VERS) {
    fail(
      `${label}: fearlessSimdVers must be ${FEARLESS_SIMD_VERS} — the anti-drift pin ` +
        `(fresh locks drift to 0.4.1 and the shipped bytes leave the baseline; found ${JSON.stringify(fields.fearlessSimdVers)})`,
    );
  }

  // 3. Cargo.lock pins (machine-independent — the lock IS the supply chain)
  const lockName = lockPath.endsWith('Cargo.lock') ? 'Cargo.lock' : lockPath;
  let lockTextOk = typeof lockText === 'string' && lockText.includes('[[package]]');
  if (!lockTextOk) {
    fail(`${label}: ${lockName} is unreadable or has no packages — restore the committed lock`);
  } else {
    const betlang = lockPackage(lockText, 'betlang');
    const simd = lockPackage(lockText, 'fearless_simd');
    if (betlang === null) fail(`${label}: Cargo.lock pins no betlang package`);
    else {
      if (betlang.version !== BETLANG_VERS) {
        fail(`${label}: Cargo.lock pins betlang ${betlang.version} — exactly ${BETLANG_VERS} is the record (found lock)`);
      }
      if (betlang.checksum === null) fail(`${label}: Cargo.lock betlang block lacks its checksum`);
      else if (has('crateChecksum') && betlang.checksum !== fields.crateChecksum) {
        fail(`${label}: Cargo.lock betlang checksum ${betlang.checksum} !== ARTIFACT crateChecksum ${fields.crateChecksum}`);
      }
    }
    if (simd === null) fail(`${label}: Cargo.lock pins no fearless_simd package`);
    else {
      if (simd.version !== FEARLESS_SIMD_VERS) {
        fail(
          `${label}: Cargo.lock pins fearless_simd ${simd.version} — expected ${FEARLESS_SIMD_VERS} ` +
            '(the anti-drift pin; regenerate the lock against Cargo.toml, never loosen the pin)',
        );
      }
      if (simd.checksum === null) fail(`${label}: Cargo.lock fearless_simd block lacks its checksum`);
      else if (has('fearlessSimdCksum') && simd.checksum !== fields.fearlessSimdCksum) {
        fail(`${label}: Cargo.lock fearless_simd checksum ${simd.checksum} !== ARTIFACT fearlessSimdCksum ${fields.fearlessSimdCksum}`);
      }
    }
  }

  // the bytes (path from argv, else the ARTIFACT-declared path)
  let resolved = wasmPath;
  if (resolved === undefined) {
    if (!has('wasmPath')) {
      fail(`${label}: no wasm path given and ARTIFACT.md declares no wasmPath — pass the dist path or record the field`);
      return { fields };
    }
    resolved = isAbsolute(fields.wasmPath) ? fields.wasmPath : join(PKG_DIR, fields.wasmPath);
  }
  if (!isAbsolute(resolved)) resolved = join(repoRoot, resolved);
  if (!existsSync(resolved)) {
    fail(`${label}: ${resolved} does not exist — build the artifact first (cd packages/betlang-wasm && node scripts/build.mjs); binaries never enter git`);
    return { fields, wasmPath: resolved };
  }

  const bytes = readFileSync(resolved);
  // 1. magic bytes
  if (bytes.length < 4 || WASM_MAGIC.some((byte, i) => bytes[i] !== byte)) {
    fail(`${label}: ${resolved} does not start with the \\0asm magic bytes — not a wasm module`);
  }
  // 2. as-shipped measurements
  const raw = bytes.byteLength;
  const gzipLen = gzipSync(bytes, { level: 9 }).length;
  const sha = sha256Hex(bytes);
  if (has('wasmSha256') && sha !== fields.wasmSha256) {
    fail(`${label}: ${resolved} hashes to ${sha} but ARTIFACT.md records ${fields.wasmSha256} — the bytes are not the as-shipped artifact (rebuild, then node scripts/build.mjs --write-artifact)`);
  }
  if (has('wasmRawBytes') && raw !== Number(fields.wasmRawBytes)) {
    fail(`${label}: ${resolved} measures raw ${raw} B but ARTIFACT.md records ${fields.wasmRawBytes} B`);
  }
  if (has('wasmGzipBytes') && gzipLen !== Number(fields.wasmGzipBytes)) {
    fail(`${label}: ${resolved} measures gzip(9) ${gzipLen} B but ARTIFACT.md records ${fields.wasmGzipBytes} B`);
  }

  // 5. the budget law, measured on the ACTUAL bytes (hard first — r11-B4)
  if (raw > RAW_BUDGET || gzipLen > GZIP_BUDGET) {
    fail(`${label}: HARD BUDGET VIOLATED — raw ${raw} B / gzip ${gzipLen} B (budgets ${RAW_BUDGET} / ${GZIP_BUDGET}; the channel is dead, design D4)`);
  } else if (raw > RAW_WARN) {
    fail(`${label}: over the 98 KiB warn line — raw ${raw} B > ${RAW_WARN} B (design D4 degradation plan; not yet over the hard budget)`);
  } else {
    note(`${label}: budgets raw ${raw} ≤ ${RAW_BUDGET}, gzip ${gzipLen} ≤ ${GZIP_BUDGET}, warn line ${raw} ≤ ${RAW_WARN}`);
    note(`${label}: sha256 ${sha} (as-shipped ${has('wasmSha256') && sha === fields.wasmSha256 ? 'matches' : 'NOT VERIFIED'})`);
  }
  return { fields, wasmPath: resolved };
}

// --- self-test: fixtures proving the three exit-code paths -----------------
//
// Fixtures built in a temp dir from the SHIPPED records, one defect
// each (tampered bytes / oversized bytes / missing field), re-invoking
// this script and asserting the named exit code. Output is exactly
// three PASS lines — one per exit-code path 1/2/3 — plus the summary.

if (argv.includes('--self-test')) {
  let failed = 0;
  const scriptPath = fileURLToPath(import.meta.url);
  const tempDir = mkdtempSync(join(tmpdir(), 'verify-betlang-pin-selftest-'));
  const shippedArtifact = readFileSync(SHIPPED_ARTIFACT, 'utf8');
  const shippedLock = readFileSync(SHIPPED_LOCK, 'utf8');
  const distWasm = join(PKG_DIR, 'dist', 'betlang_wasm.wasm');

  /** one re-invocation against fixture records; asserts exit + named fix */
  const caseRun = (name, { wasm, artifact = shippedArtifact }, expectExit, expectMentions) => {
    const artifactFile = join(tempDir, `${name}.md`);
    const lockFile = join(tempDir, `${name}.lock`);
    writeFileSync(artifactFile, artifact);
    writeFileSync(lockFile, shippedLock);
    const args = ['--artifact', artifactFile, '--lock', lockFile];
    if (wasm !== undefined) {
      writeFileSync(join(tempDir, `${name}.wasm`), wasm);
      args.unshift(join(tempDir, `${name}.wasm`));
    }
    const run = spawnSync(process.execPath, [scriptPath, ...args], { encoding: 'utf8' });
    const output = `${run.stdout ?? ''}\n${run.stderr ?? ''}`;
    const named = expectMentions.every((fragment) => output.includes(fragment));
    const ok = run.status === expectExit && named;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  self-test ${name}: exit ${run.status} (expected ${expectExit}` +
        `${named ? ', named fix present' : `, NAMED FIX MISSING ${JSON.stringify(expectMentions)}`})`,
    );
    if (!ok) failed += 1;
  };

  try {
    const realBytes = readFileSync(distWasm);

    // path exit 1: bytes over the HARD budget (padded past 100 KiB raw)
    caseRun('over-hard-budget', { wasm: Buffer.concat([realBytes, Buffer.alloc(RAW_BUDGET + 1 - realBytes.length)]) }, 1, ['HARD BUDGET']);

    // path exit 2: bytes in the warn band (98 KiB < raw ≤ 100 KiB hard)
    caseRun('over-warn-line', { wasm: Buffer.concat([realBytes, Buffer.alloc(RAW_WARN + 1 - realBytes.length)]) }, 2, ['warn line']);

    // path exit 3, a fixture family: tampered bytes (length intact, one
    // flipped byte) · fearlessSimdVers drift in the record (the task-4.3
    // named sample) · a missing ARTIFACT field — three lines of output
    // would be redundant, so the family reports as ONE PASS line
    const tampered = Buffer.from(realBytes);
    tampered[tampered.length - 1] ^= 0xff;
    const driftedArtifact = shippedArtifact.replace('fearlessSimdVers: 0.4.0', 'fearlessSimdVers: 0.4.1');
    const missingField = shippedArtifact.replace(/^wasmSha256:.*\n/m, '');
    const exitThreeCases = [
      ['tampered-bytes', { wasm: tampered }, ['hashes to']],
      ['fearlesssimd-vers-drift', { artifact: driftedArtifact }, ['fearlessSimdVers must be 0.4.0']],
      ['missing-field', { artifact: missingField }, ['"wasmSha256" is missing']],
    ];
    let threeOk = 0;
    for (const [name, fixture, mentions] of exitThreeCases) {
      const artifactFile = join(tempDir, `${name}.md`);
      const lockFile = join(tempDir, `${name}.lock`);
      writeFileSync(artifactFile, fixture.artifact ?? shippedArtifact);
      writeFileSync(lockFile, shippedLock);
      let wasmArg = distWasm;
      if (fixture.wasm !== undefined) {
        wasmArg = join(tempDir, `${name}.wasm`);
        writeFileSync(wasmArg, fixture.wasm);
      }
      const run = spawnSync(
        process.execPath,
        [scriptPath, wasmArg, '--artifact', artifactFile, '--lock', lockFile],
        { encoding: 'utf8' },
      );
      const output = `${run.stdout ?? ''}\n${run.stderr ?? ''}`;
      const ok = run.status === 3 && mentions.every((fragment) => output.includes(fragment));
      if (ok) threeOk += 1;
      else console.log(`       (sub-case ${name}: exit ${run.status}, expected 3)`);
    }
    console.log(
      `${threeOk === exitThreeCases.length ? 'PASS' : 'FAIL'}  self-test field-mismatch family: tampered bytes + fearlessSimdVers drift + missing field -> exit 3 (${threeOk}/${exitThreeCases.length})`,
    );
    if (threeOk !== exitThreeCases.length) failed += 1;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
  if (failed > 0) {
    console.error(`[verify-betlang-pin] SELF-TEST FAILED — ${failed} case family(ies) did not hit their exit code`);
    process.exit(1);
  }
  console.log('[verify-betlang-pin] SELF-TEST OK — exit paths 1 (hard budget), 2 (warn line), 3 (field mismatch) all proved');
  process.exit(0);
}

// --- the shipped verification ----------------------------------------------

const result = verify({
  wasmPath: positional,
  artifactText: (() => {
    try {
      return readFileSync(artifactPath, 'utf8');
    } catch (err) {
      fail(`ARTIFACT.md at ${artifactPath} is unreadable (${err.message}) — restore it from git history or regenerate (node scripts/build.mjs --write-artifact)`);
      return '';
    }
  })(),
  lockText: (() => {
    try {
      return readFileSync(lockPath, 'utf8');
    } catch (err) {
      fail(`Cargo.lock at ${lockPath} is unreadable (${err.message}) — restore the committed lock`);
      return '';
    }
  })(),
  label: 'shipped',
});

for (const line of notes) console.log(`[verify-betlang-pin]   ${line}`);
if (problems.length > 0) {
  console.error(`[verify-betlang-pin] MISSING REQUIREMENT — ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  // exit-code precedence (r11-B4): hard budget 1 > warn line 2 > fields 3
  const exitCode = problems.some((p) => p.includes('HARD BUDGET'))
    ? 1
    : problems.some((p) => p.includes('warn line'))
      ? 2
      : 3;
  process.exit(exitCode);
}
console.log(`[verify-betlang-pin] OK — ${result.wasmPath ?? 'record'} verified against the as-shipped ARTIFACT.md`);

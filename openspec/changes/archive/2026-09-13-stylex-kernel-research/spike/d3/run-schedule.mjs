#!/usr/bin/env node
// run-schedule.mjs — the FROZEN 40-build schedule (F5/F6): 5 rounds,
// each round visits each configuration EXACTLY ONCE, rotating
//   r1: TW,A,B,C  r2: B,C,TW,A  r3: C,TW,A,B  r4: A,B,C,TW  r5: TW,A,B,C
// Each position = COLD (rm -rf node_modules && npm ci && timed build)
// immediately followed by WARM (timed build, same install).
// Timing = wall real via /usr/bin/time -p on ./node_modules/.bin/vite
// build (identical command all configs; method frozen). Swap state
// recorded per round. Serial; raw rows → logs/schedule.log + JSON.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname;
const LOGDIR = path.join(HERE, 'logs');
fs.mkdirSync(LOGDIR, { recursive: true });
const LOG = path.join(LOGDIR, 'schedule.log');
const JSONL = path.join(LOGDIR, 'schedule.jsonl');

const CFG = { TW: 'tw-baseline', A: 'arch-a', B: 'arch-b', C: 'arch-c' };
const ROUNDS = [
  ['TW', 'A', 'B', 'C'],
  ['B', 'C', 'TW', 'A'],
  ['C', 'TW', 'A', 'B'],
  ['A', 'B', 'C', 'TW'],
  ['TW', 'A', 'B', 'C'],
];

function log(s) {
  fs.appendFileSync(LOG, s + '\n');
  process.stdout.write(s + '\n');
}
function timedBuild(cfgDir, tag) {
  // /usr/bin/time -p writes "real/user/sys" to stderr — parse it
  const out = execSync(
    `/usr/bin/time -p ./node_modules/.bin/vite build > /dev/null 2> ${JSON.stringify(path.join(LOGDIR, `.time-${process.pid}.txt`))} || { cat ${JSON.stringify(path.join(LOGDIR, `.time-${process.pid}.txt`))}; exit 1; }`,
    { cwd: cfgDir, shell: '/bin/zsh', encoding: 'utf8', stdio: 'pipe' },
  );
  const t = fs.readFileSync(path.join(LOGDIR, `.time-${process.pid}.txt`), 'utf8');
  const real = parseFloat(t.match(/real\s+([\d.]+)/)[1]);
  const user = parseFloat(t.match(/user\s+([\d.]+)/)?.[1] ?? '0');
  const sys = parseFloat(t.match(/sys\s+([\d.]+)/)?.[1] ?? '0');
  log(`  ${tag}: real=${real}s user=${user}s sys=${sys}s`);
  return { real, user, sys };
}

fs.writeFileSync(LOG, `# D3 frozen 40-build schedule — ${new Date().toISOString()}\n`);
fs.writeFileSync(JSONL, '');
const rows = [];
for (let r = 1; r <= ROUNDS.length; r++) {
  const swap = execSync('sysctl -n vm.swapusage', { encoding: 'utf8' }).trim();
  log(`\n=== ROUND ${r} (order ${ROUNDS[r - 1].join(',')}) swap: ${swap}`);
  for (const slot of ROUNDS[r - 1]) {
    const dir = path.join(HERE, CFG[slot]);
    log(` position ${slot} (${CFG[slot]}):`);
    // COLD
    execSync('rm -rf node_modules', { cwd: dir });
    const t0 = Date.now();
    execSync('npm ci --no-audit --no-fund', { cwd: dir, stdio: 'pipe' });
    const ciSecs = ((Date.now() - t0) / 1000).toFixed(1);
    log(`  cold npm ci: ${ciSecs}s`);
    const cold = timedBuild(dir, 'COLD build');
    // WARM (same install)
    const warm = timedBuild(dir, 'WARM build');
    rows.push({ round: r, slot, config: CFG[slot], ciSecs: parseFloat(ciSecs), cold, warm });
    fs.appendFileSync(JSONL, JSON.stringify(rows[rows.length - 1]) + '\n');
  }
}
fs.rmSync(path.join(LOGDIR, `.time-${process.pid}.txt`), { force: true });

// aggregation: nearest-rank p50 (3rd smallest of 5) / p95 (5th = max)
log(`\n=== AGGREGATION (nearest-rank, n=5: p50=3rd smallest, p95=5th smallest) ===`);
for (const slot of ['TW', 'A', 'B', 'C']) {
  const rs = rows.filter((x) => x.slot === slot);
  const pick = (k) => rs.map((x) => x[k].real).sort((a, b) => a - b);
  const cold = pick('cold');
  const warm = pick('warm');
  log(
    `${slot} (${CFG[slot]}): cold all=[${cold.join(', ')}] p50=${cold[2]} p95=${cold[4]} | warm all=[${warm.join(', ')}] p50=${warm[2]} p95=${warm[4]}`,
  );
}
log(`\nDONE ${new Date().toISOString()}`);

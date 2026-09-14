#!/usr/bin/env node
// measure-cold-start-interleaved.mjs — the INTERLEAVED dev-loop design (Gate-2-r3 receipt closure)
// order: tw-baseline, arch-b alternating, 10 pairs (20 runs total); samples: vite self-reported
// "ready in N ms" (ANSI-stripped); kills: process-GROUP SIGKILL; output: strict JSONL
// usage: node scripts/measure-cold-start-interleaved.mjs  (from spike/d3/)
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const strip = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');
const once = (fixture) => new Promise((done) => {
  const root = resolve(process.cwd(), fixture);
  const child = spawn('npm', ['run', 'dev'], { cwd: root, detached: true });
  let buf = ''; let reported = false;
  const killer = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} setTimeout(done, 300); }, 25000);
  const onData = (d) => {
    buf += strip(d.toString());
    const m = buf.match(/ready in (\d+) ms/);
    if (m && !reported) { reported = true; console.log(JSON.stringify({ fixture, ms: Number(m[1]) })); clearTimeout(killer); try { process.kill(-child.pid, 'SIGKILL'); } catch {} setTimeout(done, 400); }
  };
  child.stdout.on('data', onData); child.stderr.on('data', onData);
});
for (let i = 0; i < 10; i++) { await once('tw-baseline'); await new Promise(r => setTimeout(r, 900)); await once('arch-b'); await new Promise(r => setTimeout(r, 900)); }

process.exit(0);

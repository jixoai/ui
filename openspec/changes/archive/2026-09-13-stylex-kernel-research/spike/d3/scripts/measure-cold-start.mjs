// cold-start only, process-GROUP kill, bounded per run
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const fixture = process.argv[2];
const root = resolve(process.cwd(), fixture);
const strip = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');
for (let i = 0; i < 5; i++) {
  await new Promise((done) => {
    const child = spawn('npm', ['run', 'dev'], { cwd: root, detached: true });
    let buf = ''; let reported = false;
    const killer = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} setTimeout(done, 300); }, 25000);
    const onData = (d) => {
      buf += strip(d.toString());
      const m = buf.match(/ready in (\d+) ms/);
      if (m && !reported) {
        reported = true;
        console.log(JSON.stringify({ fixture, run: i + 1, ms: Number(m[1]) }));
        clearTimeout(killer);
        try { process.kill(-child.pid, 'SIGKILL'); } catch {}
        setTimeout(done, 500);
      }
    };
    child.stdout.on('data', onData); child.stderr.on('data', onData);
  });
  await new Promise((r) => setTimeout(r, 1200));
}
console.log(JSON.stringify({ fixture, done: true }));
process.exit(0);

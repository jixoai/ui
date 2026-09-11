#!/usr/bin/env node
// verify-all — THE composite gate (merge-alignment A3, Codex ruling).
//
// One auditable chain, order fixed:
//   0. registry dependency shape — every inter-item dependency is
//      @jixoai/<item> (A4: bare names are ambiguous across namespaces)
//   1. verify:laws        — css-laws slots fresh from the TS sources
//   2. verify:icons       — the generated icon-set artifact is fresh
//      verify:spins       — the generated spin-set artifact is fresh
//      verify:migration   — the old-icon-API inventory matches its snapshot
//   3. verify:mirror      — registry ⇄ apps/www byte-identity
//   4. verify:budgets     — source/face/consumer budgets
//   5. ghostty-pin offline — the supply-chain SHAPE (no network: PRs
//      must not flap on proxies; the online check rides wasm-sync)
//   6. verify:shadcn-add  — real-consumer install contract
//   (inline between 4 and 5: the npm-script gates also carry
//   verify:context/deps/docs/meta/print + the dual-app
//   vite.config.ts byte-identity step — icon-component-pipeline B4)
//   7. verify:km          — the KaTeX/Mermaid browser probe (NEW tail,
//      katex-mermaid 5.3) over a composite-owned static dist server
//
// Runs AFTER the regular build steps (payloads/dist must exist).
// Any failure aborts the chain with the failing gate's name.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { extname, resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const step = (name) => console.log(`\n━━ verify-all · ${name} ━━━━━━━━━━━━━━━━━━━━━`);

function die(name) {
  console.error(`\n✗ verify-all FAILED at ${name}`);
  process.exit(1);
}

// ── 0. registry dependency shape (A4) ────────────────────────────────
step('registry dependency shape');
{
  const registry = JSON.parse(readFileSync(resolve(root, 'registry.json'), 'utf8'));
  const items = registry.items ?? registry;
  const bare = [];
  for (const item of items) {
    for (const dep of item.registryDependencies ?? []) {
      if (!dep.startsWith('@jixoai/')) bare.push(`${item.name}: ${dep}`);
    }
  }
  if (bare.length) {
    console.error('bare inter-item dependencies (must be @jixoai/<item>):\n  ' + bare.join('\n  '));
    die('registry dependency shape');
  }
  console.log('✓ every inter-item dependency is @jixoai/-prefixed');
}

// ── 0.5. the frozen alignment laws (B1/B2) ───────────────────────────
step('verify:standards');
try {
  execFileSync('node', ['scripts/verify-standards.mjs'], { cwd: root, stdio: 'inherit' });
} catch {
  die('standards');
}

// ── 1-3. the npm-script gates (verify:shadcn-add lives ONLY in the final
// real-consumer step below — running it here too made the chain pay for
// the same five installs twice, out of the documented order) ─────────
// verify:print is NOT in this list by design (2026-09-09, the 4173
// lesson): its standalone form trusts whatever answers on :4173, and a
// stale server holding old dist once satisfied it blind for six days.
// It runs below as a MANAGED probe against this composite's own
// throwaway server, km's pattern, --url contract.
for (const name of ['verify:laws', 'verify:icons', 'verify:spins', 'verify:migration', 'verify:mirror', 'verify:context', 'verify:deps', 'verify:budgets', 'verify:docs', 'verify:meta']) {
  step(name);
  try {
    execFileSync('npm', ['run', '--silent', name], { cwd: root, stdio: 'inherit' });
  } catch {
    die(name);
  }
}

// ── 3.5. dual-app vite config byte-identity (icon-component-pipeline
// B4): apps/www/vite.config.ts and registry/vite.config.ts are ONE
// config maintained twice — both apps dogfood the same jixoai() wiring
// (icons provider + library faces), so any byte drift between them is
// a law breach, not a style nit — copy the exact bytes across ──────
{
  step('vite.config.ts dual-app byte-identity');
  const www = readFileSync(join(root, 'apps/www/vite.config.ts'));
  const reg = readFileSync(join(root, 'registry/vite.config.ts'));
  if (!www.equals(reg)) {
    console.error('[vite-config-parity] apps/www/vite.config.ts ≠ registry/vite.config.ts — the two files must stay byte-identical (cmp them)');
    die('vite-config-parity');
  }
  console.log('[vite-config-parity] apps/www/vite.config.ts ≡ registry/vite.config.ts');
}

// ── 4. ghostty pin (offline sentinel) ────────────────────────────────
step('verify:ghostty-pin (offline sentinel)');
try {
  execFileSync('node', ['scripts/verify-ghostty-pin.mjs', '--offline'], { cwd: root, stdio: 'inherit' });
} catch {
  die('ghostty-pin');
}

// ── 4b. registry/test local mirror (impl-review r2 S3): the directory is
// gitignored (a LOCAL byte-mirror of apps/www/test, never executed in
// CI), so nothing else would catch its drift — when it is present, every
// file shared with apps/www/test must be byte-identical ──────────────
{
  const regTest = join(root, 'registry', 'test');
  if (existsSync(regTest)) {
    step('registry/test byte-mirror (local convention)');
    const wwwTest = join(root, 'apps', 'www', 'test');
    const regFiles = readdirSync(regTest, { recursive: true }).map(String);
    const drift = [];
    for (const rel of regFiles) {
      const regPath = join(regTest, rel);
      if (!statSync(regPath, { throwIfNoEntry: false })?.isFile()) continue;
      const wwwPath = join(wwwTest, rel);
      if (!existsSync(wwwPath)) {
        drift.push(`${rel}: no apps/www/test counterpart`);
        continue;
      }
      if (!readFileSync(regPath).equals(readFileSync(wwwPath))) drift.push(rel);
    }
    if (drift.length) {
      console.error(`[registry-test-mirror] drifted (${drift.length}): ${drift.join(', ')}`);
      console.error('  sync with: cp apps/www/test/<file> registry/test/<file>');
      die('registry-test-mirror');
    }
    console.log(`[registry-test-mirror] ${regFiles.length} mirrored files byte-identical`);
  }
}

// ── 5. real-consumer install contract ────────────────────────────────
step('verify:shadcn-add (real consumer proof)');
try {
  execFileSync('node', ['scripts/verify-shadcn-add.mjs'], { cwd: root, stdio: 'inherit' });
} catch {
  die('shadcn-add');
}

// ── 6. the KaTeX/Mermaid browser probe (katex-mermaid 5.3) ───────────
// verify-all owns the server lifecycle EXCLUSIVELY here (design §8's
// B12 + B15 rulings): a MANAGED STATIC node http server over
// apps/www/dist — no new dependency — bound to 127.0.0.1 on an
// OS-assigned port (listen(0) → the real address().port). The
// readiness poll AND the probe touch ONLY the resulting throwaway URL,
// so a dev server squatting on :5199 can never be mistaken for this
// composite's artifact (the probe provably hits its own server). The
// probe child is reaped on success, failure, and SIGINT; the static
// server closes on every exit path — no residue. The standalone
// `npm run verify:km` keeps the caller-provided --url contract.
await (async () => {
  step('verify:km (browser probe — managed static dist server)');
  const distDir = join(root, 'apps', 'www', 'dist');
  if (!existsSync(join(distDir, 'docs', 'components', 'mermaid.html'))) {
    die('verify:km (apps/www/dist missing or stale — run the site build first)');
  }

  // a tiny static file server (flat prerendered pages + assets)
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
  };
  const server = createHttpServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname);
    } catch {
      res.writeHead(400);
      res.end('bad url');
      return;
    }
    // path-traversal guard: the resolved file stays inside dist/
    let file = resolve(join(distDir, pathname === '/' ? 'index.html' : `.${pathname}`));
    if (!file.startsWith(distDir)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) {
      // trailing-slash directory routes fall back to their flat page
      const flat = join(distDir, pathname.replace(/\/+$/, '').replace(/^\//, ''));
      if (existsSync(flat) && statSync(flat).isFile()) file = flat;
      else {
        res.writeHead(404);
        res.end(`not found: ${pathname}`);
        return;
      }
    }
    res.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    });
    res.end(readFileSync(file));
  });

  // the OS-assigned port (listen(0)) — the throwaway URL below is the
  // ONLY thing the readiness poll and the probe ever touch
  const port = await new Promise((resolvePort, rejectPort) => {
    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => resolvePort(server.address().port));
  });
  const url = `http://127.0.0.1:${port}`;

  // readiness poll against the probe's own first target page
  const ready = await new Promise((resolveReady) => {
    const deadline = Date.now() + 15_000;
    const probeOnce = () => {
      fetch(`${url}/docs/components/mermaid.html`, { signal: AbortSignal.timeout(2000) })
        .then((r) => resolveReady(r.status === 200))
        .catch(() => {
          if (Date.now() > deadline) resolveReady(false);
          else setTimeout(probeOnce, 250);
        });
    };
    probeOnce();
  });
  if (!ready) {
    server.close();
    die(`verify:km (managed static server never came up on ${url})`);
  }

  // the probe runner — spawned (not execFileSync) so SIGINT can be
  // caught, forwarded, and the child reaped on every exit path. Shared
  // by every --url probe below: each gets the SAME throwaway URL, so
  // every probe provably hits this composite's own artifact
  // (verify:print joins 2026-09-09 — the 4173 stale-squatter lesson)
  const runManagedProbe = async (gate, script, args = []) => {
    const child = spawn('node', [script, ...args], {
      cwd: root,
      stdio: 'inherit',
    });
    let interrupted = false;
    const onSigint = () => {
      interrupted = true;
      child.kill('SIGINT');
    };
    process.on('SIGINT', onSigint);
    const code = await new Promise((resolveCode) => {
      child.on('error', () => resolveCode(1));
      child.on('close', resolveCode);
    });
    process.removeListener('SIGINT', onSigint);
    if (interrupted) {
      await new Promise((r) => server.close(r));
      console.error(`\n✗ verify-all interrupted (SIGINT) — ${gate} probe child reaped, static server closed`);
      process.exit(130);
    }
    if (code !== 0) {
      await new Promise((r) => server.close(r));
      die(gate);
    }
    console.log(`[verify-all] ${gate} probe served from this composite's static child (${url}) — reaped cleanly`);
  };
  await runManagedProbe('verify:km', 'scripts/verify-katex-mermaid.mjs', ['--url', url]);

  // 6b. the stacking-isolation probe (stacking-isolation, 2026-09-09):
  // SELF-MANAGED server lifecycle — the probe serves the dist itself
  // (km's managed server is closed by then, and shared-server context
  // proved fragile): computed isolation on every shipped ladder owner
  // + the chip-under-dock incident regression
  step('verify:isolation (browser probe — self-managed server)');
  try {
    execFileSync('node', ['scripts/verify-stacking-isolation.mjs'], { cwd: root, stdio: 'inherit' });
  } catch {
    die('verify:isolation');
  }

  // 6c. verify-print over the SAME managed artifact (2026-09-09): the
  // print probe's --url channel — it never touches the standalone
  // PORT trust contract inside this composite. MUST stay above
  // server.close() (the wiring-order lesson, archived POSTSCRIPT)
  step("verify:print (browser probe — this composite's managed dist server)");
  await runManagedProbe('verify:print', 'scripts/verify-print.mjs', [`--url=${url}`]);

  await new Promise((r) => server.close(r));
})();

console.log('\n✓ verify-all GREEN — the full gate chain passed');

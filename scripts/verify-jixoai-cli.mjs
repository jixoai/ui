#!/usr/bin/env node
// jixoai-ui CLI hygiene gate (release-hygiene, 2026-09-13 — npm issues
// #2/#1/#8, the fixable parts).
//
// Subprocess-driven: every case runs the REAL bin (cli/bin/jixoai-ui.mjs)
// inside a throwaway consumer fixture under the OS tempdir — no repo
// pollution, no network, no real shadcn. A fake `npx` shim first on PATH
// impersonates shadcn: it records its exact argv (plus the registries
// url it saw in components.json at spawn time) to a log file and either
// WRITES the item's files (successful install), CANCELS (exit 0 with
// zero files — the EOF-canceled write phase of issue #1), or FAILS.
// Registry payloads come from a local fixture directory consumed
// through the file:// lane, so `--registry <dir>` is exercised exactly
// as an offline consumer would.
//
// The three batteries:
//   A. $lib resolution + --css (issue #2) — the `hue` command against
//      exact-key / wildcard-only / jsconfig / extends-chained tsconfigs,
//      the no-config honest failure with guidance, persistence of
//      jixoai.cssPath, and the $library boundary (a wildcard `$lib/*`
//      mapping must never ride a bare `$library`)
//   B. install integrity + non-interactive overwrite (issue #1) — a
//      canceled write phase leaves the item unlocked AND exits
//      non-zero; a successful install locks with canonical hashes; the
//      auto-forwarded --overwrite under non-pipe stdin is asserted from
//      the shim's argv log (a real TTY cannot be simulated here — the
//      interactive branch keeps shadcn's prompt by design)
//   C. --registry override + fetch guidance (issue #8) — dir and url
//      forms, the spawn-time override with the configured url restored
//      afterwards, upgrade/adopt through a local mirror, and the
//      unreachable-registry error carrying the retry / mirror /
//      `npx jixoai-ui@latest` way out
//
// Usage (from repo root):
//   node scripts/verify-jixoai-cli.mjs
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cliBin = join(root, "cli", "bin", "jixoai-ui.mjs");
const scratch = join(tmpdir(), `jixoai-ui-cli-${process.pid}-${Date.now().toString(36)}`);
const registryDir = join(scratch, "registry");
const shimDir = join(scratch, "shim");
const npxLog = join(scratch, "npx-calls.log");

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const HUE_CSS = ":root { --brand-hue: 0; }\n";
const DEFAULT_REGISTRY = "https://ui.jixoai.com/r/{name}.json";

// ── the local registry payloads (v2 canon) ────────────────────────────
const TOC_V2_SVELTE = "<!-- toc v2 -->\n<p>toc</p>\n";
const TOC_V2_ENGINE = "export const tocEngine = 2;\n";
mkdirSync(registryDir, { recursive: true });
writeFileSync(
  join(registryDir, "toc.json"),
  JSON.stringify({
    name: "toc",
    type: "registry:ui",
    files: [
      { target: "@ui/toc/toc.svelte", content: TOC_V2_SVELTE },
      { target: "@lib/toc-engine.ts", content: TOC_V2_ENGINE },
    ],
  }),
);
writeFileSync(
  join(registryDir, "jixoai-theme.json"),
  JSON.stringify({
    name: "jixoai-theme",
    type: "registry:theme",
    files: [{ target: "@lib/jixoai.css", content: HUE_CSS }],
  }),
);
writeFileSync(
  join(registryDir, "registry.json"),
  JSON.stringify([
    { name: "toc", type: "registry:ui", meta: { group: "misc" } },
    { name: "jixoai-theme", type: "registry:theme" },
  ]),
);
const FILE_REGISTRY_TEMPLATE = `file://${registryDir}/{name}.json`;

// ── the fake npx shim (records argv + spawn-time registry, then writes
//    / cancels / fails per JX_NPX_MODE) ────────────────────────────────
mkdirSync(shimDir, { recursive: true });
const fakeNpx = join(shimDir, "fake-npx.mjs");
writeFileSync(
  fakeNpx,
  [
    "import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
    "import { dirname, join, resolve } from 'node:path';",
    "const argv = process.argv.slice(2);",
    "const cwd = process.cwd();",
    "const mode = process.env.JX_NPX_MODE ?? 'write';",
    "let spawnRegistry = null;",
    "try {",
    "  spawnRegistry = JSON.parse(readFileSync(join(cwd, 'components.json'), 'utf8')).registries?.['@jixoai'] ?? null;",
    "} catch {}",
    `appendFileSync(${JSON.stringify(npxLog)}, JSON.stringify({ argv, spawnRegistry, mode }) + '\\n');`,
    "if (mode === 'fail') process.exit(1);",
    "if (mode === 'cancel') process.exit(0);",
    "const aliases = JSON.parse(readFileSync(join(cwd, 'components.json'), 'utf8')).aliases ?? {};",
    "for (const arg of argv) {",
    "  if (!arg.startsWith('@jixoai/')) continue;",
    "  const payload = JSON.parse(readFileSync(join(process.env.JX_NPX_REGISTRY, arg.slice(8) + '.json'), 'utf8'));",
    "  for (const file of payload.files ?? []) {",
    "    const m = /^@([\\w.$-]+)\\/(.+)$/.exec(file.target ?? '');",
    "    const path = m ? resolve(cwd, aliases[m[1]] ?? m[1], m[2]) : resolve(cwd, file.target);",
    "    mkdirSync(dirname(path), { recursive: true });",
    "    writeFileSync(path, file.content);",
    "  }",
    "}",
    "process.exit(0);",
  ].join("\n"),
);
writeFileSync(join(shimDir, "npx"), `#!/bin/sh\nexec node ${JSON.stringify(fakeNpx)} "$@"\n`);
chmodSync(join(shimDir, "npx"), 0o755);

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

/** run the real bin in a consumer dir; stdin is a pipe, never a TTY —
 * the non-interactive semantics under test are active by construction */
const runCLI = (args, { cwd: dir, mode = "write" } = {}) => {
  writeFileSync(npxLog, "");
  return spawnSync(process.execPath, [cliBin, ...args], {
    cwd: dir,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${shimDir}:${process.env.PATH ?? ""}`,
      JX_NPX_MODE: mode,
      JX_NPX_REGISTRY: registryDir,
      JX_NPX_LOG: npxLog,
    },
  });
};
const npxCalls = () =>
  readFileSync(npxLog, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));

/** a throwaway consumer: components.json + optional tsconfig/jsconfig/
 * .svelte-kit chain + arbitrary files */
function makeConsumer(name, opts = {}) {
  const dir = join(scratch, name);
  mkdirSync(dir, { recursive: true });
  const config = {
    // B/C-battery consumers point their own registries block at the
    // local mirror (exactly what the issue #8 consumer did during the
    // outage) — the battery stays hermetic, no network dependency
    registries: { "@jixoai": opts.remoteRegistry ? DEFAULT_REGISTRY : FILE_REGISTRY_TEMPLATE },
    aliases: opts.aliases ?? { lib: "$lib", ui: "$lib/ui" },
  };
  if (opts.jixoai) config.jixoai = opts.jixoai;
  writeFileSync(join(dir, "components.json"), JSON.stringify(config, null, 2) + "\n");
  for (const [file, content] of Object.entries(opts.configs ?? {})) {
    const path = join(dir, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(content, null, 2) + "\n");
  }
  for (const [rel, content] of Object.entries(opts.files ?? {})) {
    const path = join(dir, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  return dir;
}
const read = (dir, rel) => readFileSync(join(dir, rel), "utf8");
const readJson = (dir, rel) => JSON.parse(read(dir, rel));
const paths = (map) => ({ compilerOptions: { paths: map } });

console.log("battery A — $lib resolution + --css (issue #2)");
{
  // A1 exact-key mapping (the Lane H baseline — regression lock)
  const dir = makeConsumer("a1", {
    configs: { "tsconfig.json": paths({ $lib: ["src/lib"] }) },
    files: { "src/lib/jixoai.css": HUE_CSS },
  });
  const run = runCLI(["hue", "95"], { cwd: dir });
  check("A1 exact-key $lib mapping applies hue", run.status === 0 && read(dir, "src/lib/jixoai.css").includes("--brand-hue: 95"), run.stderr.trim());

  // A2 wildcard-only table, bare base (the #2 residual: `$lib` against
  // `$lib/*` used to fall through to the literal path)
  const dir2 = makeConsumer("a2", {
    configs: { "tsconfig.json": paths({ "$lib/*": ["src/lib/*"] }) },
    files: { "src/lib/jixoai.css": HUE_CSS },
  });
  const run2 = runCLI(["hue", "95"], { cwd: dir2 });
  check("A2 bare $lib resolves through a wildcard-only table", run2.status === 0 && read(dir2, "src/lib/jixoai.css").includes("--brand-hue: 95"), run2.stderr.trim());

  // A3 the same wildcard shape in jsconfig.json
  const dir3 = makeConsumer("a3", {
    configs: { "jsconfig.json": paths({ "$lib/*": ["src/lib/*"] }) },
    files: { "src/lib/jixoai.css": HUE_CSS },
  });
  const run3 = runCLI(["hue", "95"], { cwd: dir3 });
  check("A3 jsconfig wildcard table resolves too", run3.status === 0 && read(dir3, "src/lib/jixoai.css").includes("--brand-hue: 95"), run3.stderr.trim());

  // A4 extends chain (SvelteKit's standard layout: the real map lives in
  // ./.svelte-kit/tsconfig.json) — wildcard-only there, bare base here
  const dir4 = makeConsumer("a4", {
    configs: {
      "tsconfig.json": { extends: "./.svelte-kit/tsconfig.json" },
      ".svelte-kit/tsconfig.json": paths({ "$lib/*": ["src/lib/*"] }),
    },
    files: { "src/lib/jixoai.css": HUE_CSS },
  });
  const run4 = runCLI(["hue", "95"], { cwd: dir4 });
  check("A4 extends-chained tsconfig resolves (SvelteKit layout)", run4.status === 0 && read(dir4, "src/lib/jixoai.css").includes("--brand-hue: 95"), run4.stderr.trim());

  // A5 no config at all: honest failure with the way out
  const dir5 = makeConsumer("a5", { files: { "src/lib/jixoai.css": HUE_CSS } });
  const run5 = runCLI(["hue", "95"], { cwd: dir5 });
  check(
    "A5 unresolvable $lib fails hue with guidance (--css / compilerOptions.paths)",
    run5.status === 1 &&
      run5.stderr.includes("aliases.lib is `$lib`") &&
      run5.stderr.includes("compilerOptions.paths") &&
      run5.stderr.includes("--css"),
    `${run5.status}: ${run5.stderr.trim().split("\n")[0]}`,
  );

  // A6 --css applies, is remembered, and a follow-up run needs no flag
  const dir6 = makeConsumer("a6", { files: { "custom/theme.css": HUE_CSS } });
  const run6 = runCLI(["hue", "95", "--css", "custom/theme.css"], { cwd: dir6 });
  const cssAfter6 = run6.status === 0 ? read(dir6, "custom/theme.css") : "";
  const run6b = runCLI(["hue", "200"], { cwd: dir6 });
  check(
    "A6 --css applies + persists as jixoai.cssPath (later runs honor it)",
    run6.status === 0 &&
      cssAfter6.includes("--brand-hue: 95") &&
      readJson(dir6, "components.json").jixoai.cssPath === "custom/theme.css" &&
      run6b.status === 0 &&
      read(dir6, "custom/theme.css").includes("--brand-hue: 200"),
    run6.stderr.trim() || run6b.stderr.trim(),
  );

  // A7 the --css=path glued form
  const dir7 = makeConsumer("a7", { files: { "custom/theme.css": HUE_CSS } });
  const run7 = runCLI(["hue", "95", "--css=custom/theme.css"], { cwd: dir7 });
  check("A7 --css=path glued form applies", run7.status === 0 && read(dir7, "custom/theme.css").includes("--brand-hue: 95"), run7.stderr.trim());

  // A8 --css at a nonexistent path fails fast without touching config
  const dir8 = makeConsumer("a8", { files: { "src/lib/jixoai.css": HUE_CSS } });
  const run8 = runCLI(["hue", "95", "--css", "nope.css"], { cwd: dir8 });
  check(
    "A8 --css at a missing path fails fast (config keeps no cssPath)",
    run8.status === 1 && run8.stderr.includes("which does not exist") && readJson(dir8, "components.json").jixoai === undefined,
    `${run8.status}`,
  );

  // A9 a persisted cssPath that vanished names itself in the guidance
  const dir9 = makeConsumer("a9", { jixoai: { brandHue: 7, cssPath: "ghost/path.css" } });
  const run9 = runCLI(["hue", "95"], { cwd: dir9 });
  check(
    "A9 stale jixoai.cssPath surfaces in the failure guidance",
    run9.status === 1 && run9.stderr.includes("ghost/path.css") && run9.stderr.includes("--css"),
    `${run9.status}`,
  );

  // A10 boundary: a wildcard `$lib/*` mapping must never ride `$library`
  const dir10 = makeConsumer("a10", {
    aliases: { lib: "$library", ui: "$lib/ui" },
    configs: { "tsconfig.json": paths({ "$lib/*": ["src/lib/*"] }) },
    files: { "src/library/jixoai.css": HUE_CSS },
  });
  const run10 = runCLI(["hue", "95"], { cwd: dir10 });
  check("A10 $library never rides a $lib/* mapping (exact-or-slash boundary)", run10.status === 1, `${run10.status}`);
}

console.log("battery B — install integrity + non-interactive overwrite (issue #1)");
const plainAliases = { lib: "src/lib", ui: "src/lib/ui" };
{
  // B1 the EOF-canceled write phase: shadcn exits 0, zero files land —
  // the item must stay unlocked AND the CLI must exit non-zero
  const dir = makeConsumer("b1", { aliases: plainAliases, files: { "src/lib/jixoai.css": HUE_CSS } });
  const run = runCLI(["add", "toc"], { cwd: dir, mode: "cancel" });
  const lockExists = existsSync(join(dir, "jixoai-ui.lock"));
  const locked = lockExists ? Object.keys(readJson(dir, "jixoai-ui.lock").items) : [];
  check(
    "B1 canceled write phase → item NOT locked + exit 1 + recovery warning",
    run.status === 1 &&
      !lockExists &&
      run.stderr.includes("NOT locked") &&
      run.stderr.includes("write phase was cancelled"),
    `status ${run.status}, lock ${JSON.stringify(locked)}`,
  );

  // B2 successful install: locked with canonical hashes; --overwrite was
  // auto-forwarded (pipe stdin), --css/--registry never reach shadcn
  const dir2 = makeConsumer("b2", { aliases: plainAliases, files: { "src/lib/jixoai.css": HUE_CSS } });
  const run2 = runCLI(["add", "toc"], { cwd: dir2 });
  const lock2 = run2.status === 0 ? readJson(dir2, "jixoai-ui.lock") : { items: {} };
  const hashes = lock2.items.toc?.files ?? {};
  const calls2 = npxCalls();
  check(
    "B2 install locks with canonical registry hashes",
    run2.status === 0 &&
      hashes["src/lib/ui/toc/toc.svelte"] === sha256(TOC_V2_SVELTE) &&
      hashes["src/lib/toc-engine.ts"] === sha256(TOC_V2_ENGINE),
    `status ${run2.status}`,
  );
  check(
    "B2 non-interactive stdin auto-forwards --overwrite (and never --css/--registry)",
    calls2.length === 1 &&
      calls2[0].argv.includes("--yes") &&
      calls2[0].argv.includes("--overwrite") &&
      !calls2[0].argv.includes("--registry") &&
      !calls2[0].argv.includes("--css") &&
      run2.stdout.includes("non-interactive stdin"),
    JSON.stringify(calls2.map((c) => c.argv)),
  );

  // B3 an explicit --overwrite forwards exactly once, no notice line
  const dir3 = makeConsumer("b3", { aliases: plainAliases, files: { "src/lib/jixoai.css": HUE_CSS } });
  const run3 = runCLI(["add", "toc", "--overwrite"], { cwd: dir3 });
  const overwriteCount = npxCalls()[0]?.argv.filter((a) => a === "--overwrite").length ?? 0;
  check(
    "B3 explicit --overwrite forwards once, notice suppressed",
    run3.status === 0 && overwriteCount === 1 && !run3.stdout.includes("non-interactive stdin"),
    `status ${run3.status}, --overwrite ×${overwriteCount}`,
  );

  // B4 init threads the same semantics: the DOCUMENTED `--hue` form
  // parses (it used to silently fall back to the previous/default hue —
  // the "default 330" the #2 reporter could not move), the theme
  // installs, hue applies, the item locks, and --hue never leaks to shadcn
  const dir4 = makeConsumer("b4", { aliases: plainAliases });
  const run4 = runCLI(["init", "--hue", "120"], { cwd: dir4 });
  const initArgv = npxCalls()[0]?.argv ?? [];
  check(
    "B4 init --hue parses, installs the theme, applies hue, locks it",
    run4.status === 0 &&
      read(dir4, "src/lib/jixoai.css").includes("--brand-hue: 120") &&
      readJson(dir4, "components.json").jixoai.brandHue === 120 &&
      "jixoai-theme" in readJson(dir4, "jixoai-ui.lock").items &&
      !initArgv.includes("--hue"),
    `status ${run4.status}, argv ${JSON.stringify(initArgv)}`,
  );

  // B5 init under a canceled write phase fails honestly too
  const dir5 = makeConsumer("b5", { aliases: plainAliases });
  const run5 = runCLI(["init", "--hue", "120"], { cwd: dir5, mode: "cancel" });
  check(
    "B5 canceled init → exit 1, theme not locked",
    run5.status === 1 && run5.stderr.includes("init incomplete") && !existsSync(join(dir5, "jixoai-ui.lock")),
    `status ${run5.status}`,
  );
}

console.log("battery C — --registry override + fetch guidance (issue #8)");
{
  // C1 --registry <dir>: the CLI fetches the mirror, the spawned shadcn
  // sees the override in its components.json, the configured url is
  // restored afterwards (remote-registry consumer: https → file:// → https)
  const dir = makeConsumer("c1", { aliases: plainAliases, remoteRegistry: true, files: { "src/lib/jixoai.css": HUE_CSS } });
  const run = runCLI(["add", "toc", "--registry", registryDir], { cwd: dir });
  const calls = npxCalls();
  check(
    "C1 --registry <dir> installs + locks from the local mirror",
    run.status === 0 && "toc" in readJson(dir, "jixoai-ui.lock").items,
    `status ${run.status}`,
  );
  check(
    "C1 spawn-time registry = the override, post-run config = the configured url",
    calls[0]?.spawnRegistry === FILE_REGISTRY_TEMPLATE &&
      readJson(dir, "components.json").registries["@jixoai"] === DEFAULT_REGISTRY,
    `spawn ${calls[0]?.spawnRegistry} / after ${readJson(dir, "components.json").registries["@jixoai"]}`,
  );

  // C2 the glued --registry=<dir> form
  const dir2 = makeConsumer("c2", { aliases: plainAliases, files: { "src/lib/jixoai.css": HUE_CSS } });
  const run2 = runCLI(["add", "toc", `--registry=${registryDir}`], { cwd: dir2 });
  check("C2 --registry=<dir> glued form works", run2.status === 0 && "toc" in readJson(dir2, "jixoai-ui.lock").items, `status ${run2.status}`);

  // C3 upgrade against the mirror: v1 on disk + v1 lock → v2 everywhere
  const TOC_V1_SVELTE = "<!-- toc v1 -->\n<p>old</p>\n";
  const TOC_V1_ENGINE = "export const tocEngine = 1;\n";
  const dir3 = makeConsumer("c3", {
    aliases: plainAliases,
    files: {
      "src/lib/ui/toc/toc.svelte": TOC_V1_SVELTE,
      "src/lib/toc-engine.ts": TOC_V1_ENGINE,
      "src/lib/jixoai.css": HUE_CSS,
      "jixoai-ui.lock": JSON.stringify({
        items: {
          toc: {
            files: {
              "src/lib/ui/toc/toc.svelte": sha256(TOC_V1_SVELTE),
              "src/lib/toc-engine.ts": sha256(TOC_V1_ENGINE),
            },
          },
        },
      }),
    },
  });
  const run3 = runCLI(["upgrade", "--registry", registryDir], { cwd: dir3 });
  check(
    "C3 upgrade --registry <dir> refreshes content + lock hashes (offline)",
    run3.status === 0 &&
      read(dir3, "src/lib/ui/toc/toc.svelte") === TOC_V2_SVELTE &&
      readJson(dir3, "jixoai-ui.lock").items.toc.files["src/lib/ui/toc/toc.svelte"] === sha256(TOC_V2_SVELTE),
    `status ${run3.status}`,
  );

  // C4 unreachable registry: the error carries the way out
  const dir4 = makeConsumer("c4", {
    aliases: plainAliases,
    files: {
      "src/lib/jixoai.css": HUE_CSS,
      "jixoai-ui.lock": JSON.stringify({ items: { toc: { files: { "src/lib/ui/toc/toc.svelte": sha256(TOC_V2_SVELTE) } } } }),
    },
  });
  const run4 = runCLI(["upgrade", "--registry", "http://127.0.0.1:1/r/{name}.json"], { cwd: dir4 });
  check(
    "C4 unreachable registry → exit 1 with retry / --registry / npx@latest guidance",
    run4.status === 1 &&
      run4.stderr.includes("cannot fetch registry item `toc`") &&
      run4.stderr.includes("retry the command") &&
      run4.stderr.includes("--registry") &&
      run4.stderr.includes("npx jixoai-ui@latest"),
    `${run4.status}: ${run4.stderr.trim().split("\n")[0]}`,
  );

  // C5 a url template without {name} is rejected before any spawn
  const dir5 = makeConsumer("c5", { aliases: plainAliases, files: { "src/lib/jixoai.css": HUE_CSS } });
  const run5 = runCLI(["add", "toc", "--registry", "http://127.0.0.1:1/r/toc.json"], { cwd: dir5 });
  check(
    "C5 --registry without {name} fails fast (no shadcn spawn)",
    run5.status === 1 && run5.stderr.includes("{name} template") && npxCalls().length === 0,
    `status ${run5.status}`,
  );

  // C6 a --registry that is neither url nor existing directory
  const dir6 = makeConsumer("c6", { aliases: plainAliases, files: { "src/lib/jixoai.css": HUE_CSS } });
  const run6 = runCLI(["add", "toc", "--registry", "./no-such-dir"], { cwd: dir6 });
  check(
    "C6 --registry <missing dir> fails with the expected shape",
    run6.status === 1 && run6.stderr.includes("neither a url template") && npxCalls().length === 0,
    `status ${run6.status}`,
  );

  // C7 adopt baselines disk content through the mirror
  const TOC_DISK = "<!-- toc hand-installed -->\n<p>local edits</p>\n";
  const dir7 = makeConsumer("c7", {
    aliases: plainAliases,
    files: { "src/lib/ui/toc/toc.svelte": TOC_DISK, "src/lib/toc-engine.ts": TOC_V2_ENGINE },
  });
  const run7 = runCLI(["adopt", "toc", "--registry", registryDir], { cwd: dir7 });
  check(
    "C7 adopt --registry <dir> baselines the disk content",
    run7.status === 0 &&
      readJson(dir7, "jixoai-ui.lock").items.toc.files["src/lib/ui/toc/toc.svelte"] === sha256(TOC_DISK),
    `status ${run7.status}`,
  );
}

rmSync(scratch, { recursive: true, force: true });
const green = results.every(Boolean);
console.log(
  green
    ? `verify-jixoai-cli GREEN — ${results.length}/${results.length} checks (issues #2/#1/#8)`
    : `verify-jixoai-cli RED — ${results.filter((ok) => !ok).length} of ${results.length} checks failed`,
);
process.exit(green ? 0 : 1);

#!/usr/bin/env node
/**
 * design.mjs — the `jixoai-ui design` command (design-studio T7).
 *
 * Orthogonal intents (2):
 *   1. command surface: `design [--port <n>] [--agent dsh|echo|none]
 *      [--no-open]` — probe the host, scaffold the design/ workspace
 *      idempotently, start the design server with the chosen agent,
 *      open the browser at the studio URL.
 *   2. package resolution: `@jixoai/ui-design` through createRequire
 *      (host install) with the monorepo fallback relative to this
 *      file — the CLI works inside the repository checkout with NO
 *      publish/install step (design.md §6.2). Plain node ESM, the
 *      jixoai-ui.mjs house style; jixoai-ui.mjs only DELEGATES here.
 *
 * Original need: Owner 2026-09-11 (`jixoai-ui design`).
 *
 * NOTE (dsh): --agent dsh is the headless per-turn adapter (one
 * `dsh --profile headless` run per chat turn, knowledge pack as the
 * job preamble; design-studio dsh-probe.md). A missing dsh binary
 * fails fast at startup with the npmmirror install hint.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DESIGN_USAGE = `jixoai-ui design — the agent-driven prototype canvas

  jixoai-ui design [--port <n>] [--agent dsh|echo|none] [--no-open]

    --port <n>      dev server port (default 5199, strict — no drift)
    --agent <kind>  dsh | echo | none (default none; dsh needs the
                    dsh binary on PATH or DSH_BIN, one headless run
                    per turn)
    --no-open       do not open the browser

  First run scaffolds design/ (studio.svelte + any prototype
  templates); re-runs only fill gaps, never overwrite.`;

function fail(message) {
  console.error(`jixoai-ui design: ${message}`);
  process.exit(1);
}

/** parse the design argv into { port, agent, open } */
export function parseDesignArgs(argv) {
  const out = { port: undefined, agent: "none", open: true, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port" || arg === "-p") {
      const value = Number(argv[++i]);
      if (!Number.isInteger(value) || value <= 0 || value > 65535) {
        fail(`--port must be an integer in (0, 65535] (got: ${argv[i]})`);
      }
      out.port = value;
    } else if (arg === "--agent" || arg === "-a") {
      out.agent = argv[++i];
      if (!["dsh", "echo", "none"].includes(out.agent)) {
        fail(`--agent must be dsh | echo | none (got: ${out.agent})`);
      }
    } else if (arg === "--no-open") {
      out.open = false;
    } else if (arg === "--help" || arg === "-h") {
      out.help = true;
    } else {
      fail(`unknown argument: ${arg}\n\n${DESIGN_USAGE}`);
    }
  }
  return out;
}

/**
 * Resolve the @jixoai/ui-design package exports: (1) the host's own
 * install (createRequire from the host root), (2) the monorepo
 * fallback relative to THIS file (cli/bin → packages/design-tool).
 * The error names both paths and the two ways to unblock.
 */
export async function loadDesignPackage(hostRoot) {
  try {
    const require = createRequire(join(hostRoot, "package.json"));
    const resolved = require.resolve("@jixoai/ui-design");
    return await import(pathToFileURL(resolved).href);
  } catch {
    // fall through to the monorepo fallback
  }
  const fallback = new URL("../../packages/design-tool/src/index.ts", import.meta.url);
  try {
    return await import(fallback.href);
  } catch (cause) {
    fail(
      `cannot load @jixoai/ui-design — tried the host install (${join(hostRoot, "node_modules")}) ` +
        `and the monorepo fallback (${fileURLToPath(fallback)}): ${cause.message}. ` +
        `Run inside the jixoai-labs/ui monorepo, or install the package first (npm i @jixoai/ui-design).`,
    );
  }
}

function openBrowser(url) {
  if (process.platform === "darwin") {
    spawnSync("open", [url], { stdio: "ignore" });
  } else if (process.platform === "linux") {
    spawnSync("xdg-open", [url], { stdio: "ignore" });
  } else {
    console.log(`jixoai-ui design: open ${url} in your browser (no opener for ${process.platform})`);
  }
}

/** the command entry — jixoai-ui.mjs delegates here with the rest argv */
export async function main(argv) {
  const args = parseDesignArgs(argv);
  if (args.help) {
    console.log(DESIGN_USAGE);
    return;
  }

  const hostRoot = process.cwd();
  if (!existsSync(join(hostRoot, "design")) && !existsSync(join(hostRoot, "package.json")) && !existsSync(join(hostRoot, "components.json"))) {
    console.warn(
      `jixoai-ui design: ${hostRoot} looks like neither a project (package.json/components.json) nor a scaffolded host — continuing; design/ will be created here`,
    );
  }

  const design = await loadDesignPackage(hostRoot);

  // 1. probe (report posture: vehicle vs consumer, plugin roots)
  const host = design.probeDesignHost(hostRoot);
  const itemCount = Object.keys(host.itemAliases).length;
  console.log(
    `jixoai-ui design: host ${host.kind} — ${itemCount} #jixoai/* item${itemCount === 1 ? "" : "s"} aliased` +
      (host.moduleRoot === null ? " (plugin set via plain bare imports)" : ` (plugin set from ${host.moduleRoot})`),
  );

  // 1b. vehicle tsconfig bootstrap (V5 catch, 2026-09-11): a sveltekit
  // vehicle that never ran `svelte-kit sync` has apps/<app>/tsconfig.json
  // extending ./.svelte-kit/tsconfig.json — missing in fresh checkouts —
  // and every oxc transform of the aliased $lib TS chain 500s with
  // TSCONFIG_ERROR (the canvas module graph dies in the browser).
  // Running the vehicle's own sync regenerates it. This writes ONLY the
  // vehicle's generated .svelte-kit cache — a scoped bootstrap
  // exception to the "studio tooling writes only design/" law.
  if (host.moduleRoot !== null) {
    const kitConfig = join(host.moduleRoot, "svelte.config.js");
    const generated = join(host.moduleRoot, ".svelte-kit", "tsconfig.json");
    const syncBin = join(host.moduleRoot, "node_modules", ".bin", "svelte-kit");
    if (existsSync(kitConfig) && !existsSync(generated) && existsSync(syncBin)) {
      const synced = spawnSync(process.execPath, [syncBin, "sync"], { cwd: host.moduleRoot, encoding: "utf8" });
      if (synced.status === 0) {
        console.log(`jixoai-ui design: svelte-kit sync regenerated ${relative(hostRoot, generated)} (fresh-checkout tsconfig bootstrap)`);
      } else {
        console.warn(`jixoai-ui design: svelte-kit sync failed — TS transforms may 500 (${(synced.stderr || synced.stdout || "").trim().split("\n").pop()})`);
      }
    }
  }

  // 2. idempotent scaffold
  const scaffolded = design.scaffoldWorkspace(hostRoot);
  if (scaffolded.created.length > 0) {
    console.log(`jixoai-ui design: scaffolded ${scaffolded.created.join(", ")}`);
  } else {
    console.log("jixoai-ui design: design/ already complete — nothing to scaffold");
  }

  // 3. agent (dsh fails fast on a missing binary — mirror hint, never a crash)
  let agent;
  if (args.agent === "dsh") {
    const preflight = await design.dshPreflight();
    if (!preflight.ok) fail(preflight.reason ?? "dsh preflight failed");
    agent = design.createDshAgent(hostRoot);
  } else if (args.agent === "echo") {
    agent = design.createEchoAgent(hostRoot);
  } else {
    agent = design.createNoneAgent();
  }
  const server = await design.createDesignViteServer(hostRoot, {
    port: args.port,
    agent,
  });
  await server.listen();
  const port = server.config.server.port;
  const url = `http://localhost:${port}/__design__/`;
  console.log(`jixoai-ui design: studio at ${url} (agent: ${agent.info().kind})`);

  // 4. browser (unless suppressed)
  if (args.open) openBrowser(url);
}

// direct invocation: `node cli/bin/design.mjs …`
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main(process.argv.slice(2));
}

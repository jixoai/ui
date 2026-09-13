#!/usr/bin/env node
/**
 * design.mjs — the `jixoai-ui design` command (design-studio T7 + r2 T10).
 *
 * Orthogonal intents (3):
 *   1. command surface: `design [--port <n>] [--agent dsh|echo|none]
 *      [--no-open]` — probe the host, scaffold the design/ workspace
 *      idempotently, start the design server with the chosen agent,
 *      open the browser at the studio URL.
 *   2. package resolution: `@jixoai/ui-design` through createRequire
 *      (host install) with the monorepo fallback relative to this
 *      file — the CLI works inside the repository checkout with NO
 *      publish/install step (design.md §6.2). Plain node ESM, the
 *      jixoai-ui.mjs house style; jixoai-ui.mjs only DELEGATES here.
 *   3. the r2 rev2 pipeline subcommands (2026-09-11): init/save/
 *      release (the nested design/ git repo — wip commits, annotated
 *      release tags, optional design-file exports), open (materialize
 *      an artifact), promote/status (host promotion anchored on
 *      tag+commitSha, git-range drift reports grouped by prototype),
 *      apply (three-way merge via git merge-file) — thin argv
 *      parsing over the package's pipeline exports; refusal diffs
 *      print before any --force overwrite.
 *
 * Original need: Owner 2026-09-11 (`jixoai-ui design`; r2 Owner
 * walkthrough 2026-09-11; r2 rev2 git-release-model direction change
 * the same day).
 *
 * NOTE (dsh): --agent dsh is the headless per-turn adapter (one
 * `dsh --profile headless` run per chat turn, knowledge pack as the
 * job preamble; design-studio dsh-probe.md). A missing dsh binary
 * fails fast at startup with the npmmirror install hint.
 */

import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DESIGN_USAGE = `jixoai-ui design — the agent-driven prototype canvas

  jixoai-ui design [--port <n>] [--agent dsh|echo|none] [--no-open]
      start the design studio server

    --port <n>      dev server port (default 5199, strict — no drift)
    --agent <kind>  dsh | echo | none (default none; dsh needs the
                    dsh binary on PATH or DSH_BIN, one headless run
                    per turn)
    --no-open       do not open the browser

  jixoai-ui design log
      list releases (annotated tags) with their intent notes

  jixoai-ui design diff <tagA>..<tagB> [--by-page] [--export <file>]
      page-level change status between two releases (which pages
      changed, which did not), or the raw patch; exportable

  jixoai-ui design init
      create the nested design/ git repo (idempotent; design/ stays
      host-gitignored — zero pollution)

  jixoai-ui design save [<proto>] [-n <note>]
      wip commit of the design repo (proto scopes the pathspec);
      unchanged saves commit nothing

  jixoai-ui design release [<name>] [-n <notes>] [--export <proto>...]
      the version checkpoint: an annotated tag over the committed
      state (notes = release notes / intent summary, default the
      newest wip subject). Refuses on a dirty tree, an unchanged
      tree, or a reused name. --export also writes the shareable
      design/files/<proto>.jixoai-design.json artifact at the tag

  jixoai-ui design open <file>
      materialize a design file into design/prototypes/<name>/
      (idempotent; refuses on path conflicts by naming them)

  jixoai-ui design promote <proto> [--select <ref>...] [--to <dir>] [--force]
      copy the RELEASED (tagged) pages/components into the host
      (default src/lib/design/<proto>/), rewriting #jixoai/<item>
      imports to host-relative form; provenance in
      design/.promotions.json (tag + commitSha — git is the base)

  jixoai-ui design status
      report which promotions lag the design repo HEAD (git ranges):
      release-tag notes since + per-file unified diffs, grouped by
      prototype

  jixoai-ui design apply [--dry-run]
      three-way merge design drift into the host via git merge-file
      (base = the promoted commit, ours = host file, theirs = HEAD).
      Clean hunks apply; conflicts land as markers with a named
      report; developer deletions are never resurrected

  First run scaffolds design/ (studio.svelte + any prototype
  templates); re-runs only fill gaps, never overwrite.`;

function fail(message) {
  console.error(`jixoai-ui design: ${message}`);
  process.exit(1);
}

/** the r2 rev2 pipeline subcommands (design-studio r2 T10, 2026-09-11) */
const SUBCOMMANDS = new Set(["init", "save", "release", "open", "promote", "status", "apply", "log", "diff"]);

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

/* ── pipeline subcommand parsers (r2 rev2 T10) ─────────────────────────── */

/** save: [<proto>] [-n <note>] — proto optional (repo-wide wip commit) */
function parseSaveArgs(argv) {
  const out = { proto: undefined, note: undefined };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--note" || arg === "-n") {
      out.note = argv[++i];
      if (out.note === undefined) fail(`--note needs a value\n\n${DESIGN_USAGE}`);
    } else if (out.proto === undefined) {
      out.proto = arg;
    } else {
      fail(`unexpected argument: ${arg}\n\n${DESIGN_USAGE}`);
    }
  }
  return out;
}

/** release: [<name>] [-n <notes>] [--export <proto>...] */
function parseReleaseArgs(argv) {
  const out = { name: undefined, notes: undefined, export: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--notes" || arg === "-n") {
      out.notes = argv[++i];
      if (out.notes === undefined) fail(`--notes needs a value\n\n${DESIGN_USAGE}`);
    } else if (arg === "--export" || arg === "-e") {
      let proto = argv[++i];
      if (proto === undefined || proto.startsWith("--")) fail(`--export needs at least one prototype name\n\n${DESIGN_USAGE}`);
      while (proto !== undefined && !proto.startsWith("--")) {
        out.export.push(proto);
        proto = argv[++i];
      }
      if (proto !== undefined && proto.startsWith("--")) i--;
    } else if (out.name === undefined) {
      out.name = arg;
    } else {
      fail(`unexpected argument: ${arg}\n\n${DESIGN_USAGE}`);
    }
  }
  return out;
}

/** open: <file> */
function parseOpenArgs(argv) {
  if (argv.length !== 1) fail(`open takes exactly one design file path\n\n${DESIGN_USAGE}`);
  return { file: argv[0] };
}

/** promote: <proto> [--select <ref>...] [--to <dir>] [--force] */
function parsePromoteArgs(argv) {
  const out = { proto: undefined, select: [], to: undefined, force: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--select" || arg === "-s") {
      // consume every following non-flag token as a ref
      let ref = argv[++i];
      if (ref === undefined) fail(`--select needs at least one ref\n\n${DESIGN_USAGE}`);
      while (ref !== undefined && !ref.startsWith("--")) {
        out.select.push(ref);
        ref = argv[++i];
      }
      if (ref !== undefined && ref.startsWith("--")) i--; // re-read the flag
      if (out.select.length === 0) fail(`--select needs at least one ref\n\n${DESIGN_USAGE}`);
    } else if (arg === "--to" || arg === "-t") {
      out.to = argv[++i];
      if (out.to === undefined) fail(`--to needs a directory\n\n${DESIGN_USAGE}`);
    } else if (arg === "--force" || arg === "-f") {
      out.force = true;
    } else if (out.proto === undefined) {
      out.proto = arg;
    } else {
      fail(`unexpected argument: ${arg}\n\n${DESIGN_USAGE}`);
    }
  }
  if (out.proto === undefined) fail(`promote needs a prototype name\n\n${DESIGN_USAGE}`);
  return out;
}

/** apply: [--dry-run] */
function parseApplyArgs(argv) {
  const out = { dryRun: false };
  for (const arg of argv) {
    if (arg === "--dry-run") out.dryRun = true;
    else fail(`unexpected argument: ${arg}\n\n${DESIGN_USAGE}`);
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
  // r2 pipeline subcommands (design-studio r2 T10, 2026-09-11): the
  // first token decides — save/open/promote/status/apply run against
  // the cwd host and exit; anything else starts the studio server
  if (argv.length > 0 && SUBCOMMANDS.has(argv[0])) {
    await runPipelineSubcommand(argv[0], argv.slice(1));
    return;
  }

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

/* ── the r2 rev2 pipeline subcommands (T10) ─────────────────────────────── */

/** run one pipeline subcommand against the cwd host; exits nonzero on failure */
async function runPipelineSubcommand(command, rest) {
  if (rest.includes("--help") || rest.includes("-h")) {
    console.log(DESIGN_USAGE);
    return;
  }
  const design = await loadDesignPackage(process.cwd());

  if (command === "init") {
    const result = design.initDesignRepo(process.cwd());
    console.log(
      result.created
        ? `jixoai-ui design: initialized the design repo at ${relative(process.cwd(), join(result.designDir, ".git"))} (first commit made)`
        : `jixoai-ui design: design repo already present — nothing to do`,
    );
    return;
  }

  if (command === "save") {
    const args = parseSaveArgs(rest);
    const result = design.saveDesignCommit(process.cwd(), args.proto, args.note);
    if (!result.committed) {
      console.log(`jixoai-ui design: nothing to save — the design repo is unchanged`);
      return;
    }
    console.log(`jixoai-ui design: wip commit ${result.commitSha.slice(0, 10)} — ${result.subject}`);
    return;
  }

  if (command === "release") {
    const args = parseReleaseArgs(rest);
    const result = design.releaseDesignTag(process.cwd(), args.name, args.notes);
    console.log(`jixoai-ui design: released ${result.tag.name} (${result.tag.commitSha.slice(0, 10)}) — ${result.tag.note}`);
    for (const proto of args.export) {
      const artifact = design.exportDesignFile(process.cwd(), proto, result.tag);
      console.log(`jixoai-ui design: exported ${relative(process.cwd(), artifact)}`);
    }
    return;
  }

  if (command === "open") {
    const args = parseOpenArgs(rest);
    const result = design.openDesignFile(process.cwd(), args.file);
    console.log(
      `jixoai-ui design: opened ${result.name}@v${result.version} — ${result.written.length} written, ${result.unchanged.length} already present`,
    );
    return;
  }

  if (command === "promote") {
    const args = parsePromoteArgs(rest);
    const options = {
      ...(args.select.length > 0 ? { select: args.select } : {}),
      ...(args.to !== undefined ? { to: args.to } : {}),
      force: args.force,
    };
    let result;
    try {
      result = design.promote(process.cwd(), args.proto, options);
    } catch (error) {
      if (error && error.name === "PromotionExistsError") {
        // the refusal always shows the diff before telling the way out
        if (error.diff.length > 0) console.log(error.diff);
        else console.log("jixoai-ui design: (host content identical to the incoming promotion)");
        fail(`${error.message}`);
      }
      throw error;
    }
    for (const file of result.promoted) console.log(`jixoai-ui design: promoted ${file} (from ${result.tag.name})`);
    // --force: show what the overwrite replaced (design.md §2 — the
    // diff prints with the overwrite, never silently)
    for (const entry of result.forcedDiffs ?? []) {
      if (entry.diff.length > 0) console.log(entry.diff.trimEnd());
      else console.log(`jixoai-ui design: --force replaced ${entry.file} (host content was identical)`);
    }
    console.log(`jixoai-ui design: manifest ${relative(process.cwd(), result.manifestPath)}`);
    return;
  }

  if (command === "status") {
    const status = design.promotionStatus(process.cwd());
    if (status.promotions.length === 0) {
      console.log("jixoai-ui design: no promotions recorded (see `design promote`)");
      return;
    }
    // grouped by prototype (the tag-between drift view)
    const protos = [...new Set(status.promotions.map((p) => p.proto))].sort();
    for (const proto of protos) {
      console.log(`  ${proto}`);
      for (const p of status.promotions.filter((x) => x.proto === proto)) {
        if (!p.drifted) {
          console.log(`    in sync   ${p.file} (from ${p.tag})`);
          continue;
        }
        const notes = p.changelogSince.map((c) => `${c.tag}: ${c.note || "(no note)"}`).join("; ");
        console.log(`    DRIFTED   ${p.file} — promoted from ${p.tag}${p.currentTag !== null ? `, design now at ${p.currentTag}+` : ""}`);
        if (notes) console.log(`              released since: ${notes}`);
        if (p.tagMissing) console.log(`              (tag ${p.tag} is gone from the ledger — provenance lost)`);
        if (p.refRemovedFromDesign) console.log(`              the design no longer contains ${p.ref}`);
        else if (p.diff && p.diff.length > 0) console.log(indentDiff(p.diff));
        if (p.hostMissing) console.log(`              host file missing (deleted downstream)`);
      }
    }
    return;
  }

  if (command === "log") {
    // the release ledger — annotated tags with their intent notes
    const tags = design.listReleaseTags(join(process.cwd(), "design"));
    if (tags.length === 0) {
      console.log("jixoai-ui design log: no releases yet (see `design release`)");
      return;
    }
    for (const tag of tags) {
      console.log(`  ${tag.name} (${tag.commitSha.slice(0, 10)}) ${tag.at}`);
      if (tag.note) console.log(`    ${tag.note}`);
    }
    return;
  }

  if (command === "diff") {
    // design diff <tagA>..<tagB> [--by-page] [--export <file>]
    // (D1, final review: the spec SHALLed a user-reachable page-level
    // compare — the kernels existed, only the command was missing)
    const rangeArg = rest.find((a) => a.includes(".."));
    if (rangeArg === undefined) fail("usage: design diff <tagA>..<tagB> [--by-page] [--export <file>]");
    const [fromTag, toTag] = rangeArg.split("..");
    const byPage = rest.includes("--by-page");
    const exportIdx = rest.indexOf("--export");
    const exportFile = exportIdx !== -1 ? rest[exportIdx + 1] : undefined;
    const designDir = join(process.cwd(), "design");
    const fromSha = design.runGit(designDir, ["rev-list", "-1", fromTag], { allowFailure: true });
    const toSha = design.runGit(designDir, ["rev-list", "-1", toTag], { allowFailure: true });
    if (fromSha.code !== 0) fail(`unknown tag: ${fromTag}`);
    if (toSha.code !== 0) fail(`unknown tag: ${toTag}`);
    const nameStatus = design.runGit(designDir, ["diff", "--name-status", fromTag, toTag]);
    const lines = nameStatus.stdout.trim().length > 0 ? nameStatus.stdout.trim().split("\n") : [];
    if (byPage) {
      const changed = new Map();
      for (const line of lines) {
        const [status, path] = line.split("\t");
        const page = path.startsWith("prototypes/") ? path.split("/").slice(0, 2).join("/") : path;
        changed.set(page, (changed.get(page) ?? new Set()).add(status));
      }
      const allProtos = design.listTree(designDir, toTag, "prototypes").map((p) => p.split("/").slice(0, 2).join("/") + (p.includes("/") ? "" : ""));
      const pages = [...new Set([...changed.keys(), ...allProtos.map((p) => p)])].sort();
      const out = [];
      for (const page of pages) {
        if (!page.startsWith("prototypes/")) continue;
        const statuses = changed.get(page);
        out.push(statuses === undefined ? `  unchanged ${page}` : `  ${[...statuses].join(",")} ${page}`);
      }
      const text = out.join("\n");
      if (exportFile !== undefined) {
        writeFileSync(resolve(process.cwd(), exportFile), text + "\n", "utf8");
        console.log(`jixoai-ui design diff: wrote ${exportFile}`);
      } else console.log(text);
      return;
    }
    const patch = design.runGit(designDir, ["diff", fromTag, toTag]).stdout;
    if (exportFile !== undefined) {
      writeFileSync(resolve(process.cwd(), exportFile), patch, "utf8");
      console.log(`jixoai-ui design diff: wrote ${exportFile}`);
    } else console.log(patch.trimEnd());
    return;
  }

  // apply
  const args = parseApplyArgs(rest);
  let report;
  try {
    report = design.applyDrift(process.cwd(), { dryRun: args.dryRun });
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  const tag = report.dryRun ? "apply --dry-run" : "apply";
  let conflicts = 0;
  for (const file of report.files) {
    if (file.skipReason !== undefined) {
      console.log(`  skipped   ${file.file} (${file.skipReason})`);
      continue;
    }
    if (!file.clean) {
      conflicts += file.conflicts.length;
      console.log(`  CONFLICT  ${file.file} — ${file.conflicts.length} region(s) carry markers, resolve then re-run`);
      for (const conflict of file.conflicts) {
        const prop = [...conflict.ours, ...conflict.theirs].find((line) => line.trim().length > 0) ?? "";
        console.log(`            around: ${prop.trim()}`);
      }
      continue;
    }
    console.log(
      file.applied
        ? `  merged    ${file.file} (${file.mergedHunks} hunk(s))`
        : `  in sync   ${file.file}`,
    );
  }
  if (report.files.length === 0) console.log(`jixoai-ui design ${tag}: nothing drifted — no promotions to merge`);
  if (conflicts > 0 && !report.dryRun) {
    console.log(`jixoai-ui design ${tag}: ${conflicts} conflict region(s) need manual resolution (markers are in the files)`);
  }
}

/** indent a git diff block to sit under its status line */
function indentDiff(diff) {
  return diff
    .trimEnd()
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
}

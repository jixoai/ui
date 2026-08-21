/**
 * jixoai-ui upgrade tasks (bin/upgrade-tasks.mjs).
 *
 * Contract (Owner decision, 2026-08-20): every task is IDEMPOTENT —
 * `applies(content, ctx)` returns true only while the legacy pattern still
 * exists, and `run(ctx)` rewrites exactly that pattern. Re-running
 * `jixoai-ui upgrade` therefore converges to zero writes.
 *
 * Task shape: { name, item?, applies(content, ctx) → boolean, run(ctx) }.
 * `item` (optional) scopes the task to one registry item; without it the
 * task sees every locked file plus the site-scope candidates (app-level
 * css). `ctx` exposes { cwd, item, path, filePath, content (getter),
 * read(), write(next), log(msg), warn(msg) }.
 */
export const upgradeTasks = [
  {
    name: "legacy-import-paths",
    // pre-0.2.0 toc installs imported the engine/css via bare @lib or
    // relative specifiers; the components now use SvelteKit $lib aliases.
    applies(content) {
      return content.includes("@lib/toc-engine") || content.includes("../lib/toc.css");
    },
    run(ctx) {
      const next = ctx
        .read()
        .replaceAll("@lib/toc-engine", "$lib/toc-engine")
        .replaceAll("../lib/toc.css", "$lib/toc.css");
      ctx.write(next);
      ctx.log(`task legacy-import-paths: rewrote toc imports to $lib aliases → ${ctx.path}`);
    },
  },
  {
    name: "spine-axis",
    item: "toc",
    // the desktop Rule Tracker spine sits ON the node axis (left: 0), not
    // 2px off it. Anchored to declaration position (^ + indentation only)
    // so prose comments ("spine sits left: 2px …") and other declarations
    // (border-left: 2px) are never touched.
    applies(content, ctx) {
      return ctx.path.endsWith(".css") && /^[ \t]*left:[ \t]*2px/m.test(content);
    },
    run(ctx) {
      const next = ctx.read().replace(
        /^([ \t]*)left:[ \t]*2px/gm,
        (_match, indent) => `${indent}left: 0px`,
      );
      ctx.write(next);
      ctx.log(`task spine-axis: moved the spine onto the node axis (left: 2px → 0px) → ${ctx.path}`);
    },
  },
  {
    name: "scroll-margin-cleanup",
    // DIAGNOSTIC ONLY — never edits files. scroll-margin-top on the
    // anchors and scroll-padding-top on the scroll container STACK (see
    // the "named line law" in toc.css), so a site carrying both doubles
    // its anchor landings past the toc line. Which of the two owns the
    // offset is an app-level layout decision jixoai-ui must not make for
    // you, so this task only warns — and because it fixes nothing, it
    // re-reports on every run until the owner removes the redundancy.
    applies(content) {
      return content.includes("scroll-margin-top") && content.includes("scroll-padding-top");
    },
    run(ctx) {
      ctx.warn(
        `${ctx.path} declares both scroll-margin-top and scroll-padding-top — the offsets stack and anchor jumps land past the toc line. Keep scroll-padding-top on the scroll container (the jixoai toc consumes --jx-toc-line that way) and remove the target-side scroll-margin-top. jixoai-ui never edits app-level css automatically.`,
      );
    },
  },
];

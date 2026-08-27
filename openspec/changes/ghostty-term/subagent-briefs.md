# subagent-briefs — ghostty-term

> 子代理统一约束（反馈协议，2026-08-20 Owner 指令）：
> 1. 不得 `git commit` / `git push`（提交权归 ZCode）。
> 2. 不得操作共享资源：dev server、截图 oracle、herdr、registry.json、
>    apps/www/src/lib/catalog.ts、mirror-manifest —— 所需变更写进报告，
>    由 ZCode 统一落盘。
> 3. 报告必须包含：改动文件清单、遇到的困难与解决方式（skill/指令中
>    不清晰、矛盾、不适配之处）、自测命令与输出摘要。
> 4. 工作目录：/Users/kzf/Dev/GitHub/jixoai-labs/ui-ghostty-term（worktree，
>    分支 feat/ghostty-term，只改本 brief 划定的文件集）。
> 5. 法则信源：openspec/specs/**（尤其 component-authoring /
>    css-architecture / registry / mirror-sync）+ 本 change 的
>    proposal.md / design.md。违反法则的实现不算完成。

## Batch A — vite-plugin 包

- 子代理类型：general-purpose
- 文件集（独占）：packages/vite-plugin/**（新增）
- 交付：design.md D1/D3 全量；测试绿；README 消费者向。
- 关键接口冻结（Batch D/E 依赖）：
  `import { jixoaiGhostty } from '@jixoai/vite-plugin'`；
  虚拟模块 `virtual:jixoai-ghostty` 导出
  `{ url: string, sha256: string, variant: 'full'|'small', version: string }`。

## Batch B — ghostty-vt 绑定层

- 子代理类型：general-purpose
- 文件集（独占）：registry/files/lib/ghostty-vt.ts（新增）、
  apps/www/test/ghostty-vt.spec.ts（node 测试，可先行；镜像目录
  apps/www/src/lib/ghostty-vt.ts 由 Batch E 复制，B 不动 www）。
- 交付：design.md D4 全量；上游参考 = ghostty 官方
  example/wasm-vt/index.html 的编组模式（type_json 驱动，零硬编码
  offset）；wasm 资产用 pin url 下载到本地 .cache 测试（测试 setup
  缓存，勿提交二进制）。
- 关键接口冻结（Batch D 依赖）：
  `loadGhosttyVT({ url?, bytes?, variant? }): Promise<GhosttyVT>`；
  `GhosttyVT` 面见 design.md D4 图。

## Batch C — 供给链 workflow

- 子代理类型：general-purpose
- 文件集（独占）：.github/workflows/ghostty-wasm-sync.yml（新增）、
  .github/workflows/deploy.yml（追加 cache 步）、
  scripts/verify-ghostty-pin.mjs（新增）。
- 交付：design.md D2；probe 复用 packages/vite-plugin 的
  probeGhosttyWasm（workflow 里 node --import tsx 或预编译入口，
  由 A 提供 bin 入口 `jixoai-ghostty-probe`，A/B 协调点在冻结接口）。

## Batch D — ghostty-term 组件

- 子代理类型：general-purpose
- 前置：Batch A/B 接口冻结（未完成时先写组件与桩测试，wasm 集成
  待接口就绪）。
- 文件集（独占）：registry/files/ui/ghostty-term/**（新增）、
  apps/www/test/ghostty-term.spec.ts。
- 交付：design.md D5 全量；jsdom 逻辑测试；报告列出
  registry.json/catalog.ts 所需条目变更（不自己落盘）。

## Batch E — www 集成

- 子代理类型：general-purpose
- 前置：Batch A（插件可装）+ Batch D（组件源就绪）。
- 文件集（独占）：apps/www/vite.config.ts、apps/www/package.json（+
  package-lock.json）、apps/www/src/routes/docs/components/ghostty-term.html、
  apps/www/src/lib/ui/ghostty-term/**（镜像复制）、
  apps/www/src/lib/ghostty-vt.ts（镜像复制）、
  apps/www/test/docs-structure.spec.ts（快照更新）。
- 交付：design.md D5 demo/docs + D6 www 侧；报告列出 catalog.ts 与
  mirror-manifest 所需变更（不自己落盘）。

## 冲突面审计（ZCode 落盘清单）

- registry.json：B（ghostty-vt 条目）、D（ghostty-term 条目 + 三项
  迁组）→ ZCode 一次落盘。
- apps/www/src/lib/catalog.ts：D 组迁移 → ZCode 落盘。
- apps/www/package-lock.json：E 独占（A 的 file: 依赖由 E 装）。
- openspec/changes/ghostty-term/**：ZCode 独占。

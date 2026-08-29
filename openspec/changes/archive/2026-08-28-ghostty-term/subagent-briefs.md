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
> 6. 法则读法提示：openspec/changes/ghostty-term/design.md 是冻结
>    接口与规格的唯一出处；与本 brief 冲突时以 design.md 为准并上报。

## Batch A — vite-plugin 包（bootstrap 批：先于 B/C 完成）

- 子代理类型：general-purpose
- 文件集（独占）：packages/vite-plugin/**（新增）
- 交付：design.md D1/D2/D3 全量；测试绿；README 消费者向。
- 工程自包含：独立 package-lock.json + devDeps（tsdown/vitest/
  typescript），npm ci && npm run build 可复现（CI 不依赖根安装）。
- pin 写入纪律：初始 pin 由你用 probe 验证后写
  ghostty.pin.json（本批次唯一例外授权）；此后 pin 唯一写入者
  是 sync workflow（Batch C），你不得再改。
- 关键接口冻结（Batch B/C/D/E 依赖）：
  - `import { jixoaiGhostty } from '@jixoai/vite-plugin'`
  - 虚拟模块 `virtual:jixoai-ghostty` 导出
    `{ url: string, sha256: string, variant: 'full'|'small', buildInfo: string }`
  - `@jixoai/vite-plugin/client` 子导出：ambient 类型声明
    （消费者 vite-env.d.ts 一行 reference 引用）
  - bin `jixoai-ghostty-probe --wasm <path> --variant full|small --json`
    → stdout pin 片段 `{variant, sha256, size, buildInfo}`
  - 构建：tsdown 产 dist/index.js + dist/probe.js（ESM）
  - 缓存目录默认：<cwd>/node_modules/.cache/jixoai-ghostty/；
    **缓存唯一写入通道 = resolver API**（tmp+rename 原子写；
    env/offline/cache-miss 行为矩阵见 design.md D2）；B/C 批与测试
    只读
  - wasm 事实基线（fixture/probe 断言锁死）：两变体 imports=[]、
    181 exports、0 global exports；实例化传 {}

## Batch B — ghostty-vt 绑定层（前置：A bootstrap 完成）

- 子代理类型：general-purpose
- 文件集（独占）：registry/files/lib/ghostty-vt.ts（新增）、
  apps/www/test/ghostty-vt.spec.ts（node 测试；镜像复制属 Batch E）。
- 交付：design.md D4 全量；上游参考 = ghostty 官方
  example/wasm-vt/index.html 的编组模式（type_json 驱动，零硬编码
  offset）。
- wasm 测试资产：经 A 的 resolver API（node 侧
  `import { resolveGhosttyWasm } from '@jixoai/vite-plugin'`——签名
  冻结于 design.md D3）下载进共享 .cache，
  只读使用；不提交二进制、不自建下载逻辑。
- 关键接口冻结（Batch D 依赖）：
  `loadGhosttyVT({ url?, bytes?, variant? }): Promise<GhosttyVT>`；
  `GhosttyVT` 面见 design.md D4 图（snapshotEncode 有、decode 无）。

## Batch C — 供给链 workflow + 发布（前置：A bootstrap 完成）

- 子代理类型：general-purpose
- 前置：Batch A 的 probe bin 与包构建（packages/vite-plugin 的
  npm ci && npm run build 产 dist/probe.js——workflow 内执行，
  接口按冻结契约写死）。
- 文件集（独占）：.github/workflows/ghostty-wasm-sync.yml（新增）、
  .github/workflows/deploy.yml（追加 cache 步）、
  .github/workflows/release.yml（追加 publish-vite-plugin job）、
  scripts/verify-ghostty-pin.mjs（新增）。
  根 package.json 的 verify:ghostty-pin script 行 → 报告由 ZCode 落盘。
- 交付：design.md D2 供给链 + D3 发布节；pin 更新只经 PR；
  probe 失败绝不更新 pin。

## Batch D — ghostty-term 组件

- 子代理类型：general-purpose
- 前置：Batch A/B 接口冻结（未完成时先写组件与桩测试，wasm 集成
  待接口就绪）。
- 文件集（独占）：registry/files/ui/ghostty-term/**（新增）、
  apps/www/test/ghostty-term.spec.ts。
- 交付：design.md D5.1 法则清单逐条落实（$props/rest/class 合并/
  tabindex/aria-label/hit-lane css/density 登记/data-state/错误
  降级）+ D5.2 渲染与输入；jsdom 逻辑测试；报告列出
  registry.json/catalog.ts/density-adoption 所需变更（不自己落盘）。

## Batch E — www 集成

- 子代理类型：general-purpose
- 前置：Batch A（插件可装）+ Batch B/D（源就绪）。
- 文件集（独占）：
  - apps/www/package.json（+ package-lock.json，file: 依赖）
  - apps/www/vite.config.ts（挂插件）
  - apps/www/src/vite-env.d.ts（加
    /// <reference types="@jixoai/vite-plugin/client" />）
  - apps/www/src/lib/ghostty-vt.ts、apps/www/src/lib/ui/ghostty-term/**
    （same-source 镜像复制，byte-identical）
  - apps/www/src/routes/docs/components/ghostty-term.html/
    （+page.svelte + +page.ts，目录路由不是单文件）
  - apps/www/src/lib/blueprints/scenes/ghostty-term.svelte
  - apps/www/static/blueprints/ghostty-term.svg（npm run
    build:blueprints 生成后提交）
  - apps/www/svelte.config.js（entries 增路由）
  - apps/www/test/docs-structure.spec.ts、catalog.spec.ts（快照更新，
    冻结计数见 design.md D6）
- 交付：design.md D5.3 demo/docs + D6 www 侧；报告列出 catalog.ts
  与 mirror-manifest 所需变更（不自己落盘）。

## 冲突面审计（ZCode 落盘清单）

- registry.json：B（ghostty-vt 条目）、D（ghostty-term 条目 + 三项
  迁组）、ZCode 自持（color-utils 新 item + color-picker 补依赖）
  → ZCode 一次落盘。
- apps/www/src/lib/catalog.ts：CatalogGroupId + CATALOG_GROUPS →
  ZCode 落盘（D6 冻结计数）。
- 根 package.json scripts：verify:ghostty-pin → ZCode 落盘。
- apps/www/package-lock.json：E 独占（A 的 file: 依赖由 E 装）。
- apps/www/mirror-manifest.json + density-adoption：ZCode 落盘。
- openspec/changes/ghostty-term/**：ZCode 独占。
- packages/vite-plugin/ghostty.pin.json：A 初始写入（probe 验证后）；
  之后唯一写入者 = sync workflow（C 的 PR）。

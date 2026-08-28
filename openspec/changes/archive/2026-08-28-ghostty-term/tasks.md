# tasks — ghostty-term

> 批次划分原则：子代理各自只改自己批次的文件；registry.json、
> catalog.ts、mirror-manifest 等共享文件由 ZCode 统一落盘。
> 每个实现批次完成后跑各自门禁；跨批整合门禁由 ZCode 执行。
> r1：按 Codex r0 评审修订（阻塞 1-12 全部落任务面）。

## Phase 0 — change 文档冻结（ZCode + Codex）

- [x] proposal.md / design.md / tasks.md / subagent-briefs.md / specs deltas（r0）
- [x] Codex r0 review（4.0/10）→ r1 修订
- [x] Codex r1 review（7.0/10）→ r2 修订（imports=[] 事实、契约字段
      统一、路由 .html、下载硬化、二进制护栏）
- [x] Codex r2 review（7.5/10）→ r3 修订（color-utils item +
      color-picker 存量断裂修复、虚拟模块类型契约、包独立 lockfile、
      批次拓扑 A→B∥C、vite publicDir 事实）
- [x] Codex r3 review（7.8/10）→ r4 修订（proposal/D7 同步、
      resolver API 冻结、client.d.ts 形状、peer 收窄 ^8、URL 路径
      白名单、探针场景改前置依赖 fixture）
- [x] Codex r4 review（7.9/10）→ r5 修订（探针契约拆分、dts 构建
      断言、resolver 行为矩阵 + 默认缓存路径定则）
- [x] Codex r5 review（7.9/10）→ r6 修订（resolver path 注释对齐
      行为矩阵、URL 白名单 source.tag 参数化）
- [x] Codex r6 review（**8.4/10，冻结通过**）；review-r0..r6.md 归档；
      跨字段 schema 断言建议采纳进 Batch A（source.tag ↔ releaseUrl
      ↔ variant URL tag 一致 + tag 为安全单路径段）

## Phase 1 — 地基（A bootstrap 先行，随后 B ∥ C 并行）

### Batch A：packages/vite-plugin（子代理A，bootstrap 批）

- [x] 包骨架（package.json/exports/bin/tsdown/vitest + 独立
      package-lock.json + devDeps：tsdown/vitest/typescript）零运行时
      依赖；npm ci && npm run build 可复现；dts 断言（dist/index.d.ts
      + dist/client.d.ts 存在且在 npm pack 产物内）
- [x] ghostty.pin.json 首版（用 probe 本地验证后提交；两变体，
      schema 冻结于 design D2）
- [x] pin.ts：pin schema 读取 + schema test（含跨字段断言：
      source.tag ↔ releaseUrl ↔ 各 variant URL 的 tag 一致；tag
      必须是安全单路径段）
- [x] resolve.ts：env → cache → fetch+verify 纯函数（https-only/
      host allowlist/≤5 跳重定向/30s 超时/流式 4MB 上限/
      tmp+rename 原子写缓存——缓存唯一写入通道）
- [x] probe.ts + bin jixoai-ghostty-probe（接口冻结于 design D2：
      --wasm/--variant/--json → pin 片段）
- [x] jixoaiGhostty()：dev 中间件（sha 前缀路径 + immutable）+
      build emitFile（load 期 emit + ROLLUP_FILE_URL、显式
      内容寻址 fileName、server consumer 不 emit）+ 虚拟模块
- [x] `@jixoai/vite-plugin/client` 子导出：virtual:jixoai-ghostty
      ambient 类型声明
- [x] vitest：vite native 行为 fixture（裸/?url/?init/publicDir
      复制矩阵 + pin 真实二进制 import/export 断言：imports=[]、
      必需导出族）+ resolve 单测 + build()/dev 集成测试（断言 dist
      真实文件名）
- [x] README（消费者向：一步 wire + client 类型引用 + 前置契约 +
      环境变量）
- [x] 测试资产纪律：单测读默认缓存（<cwd>/node_modules/.cache/
      jixoai-ghostty/）内 bytes，不隐式依赖网络（setup 一次性经
      resolver 下载）；resolver 行为矩阵三场景逐行测试
      （env/offline/cache-miss）

### Batch B：ghostty-vt 绑定层（子代理B，前置：A bootstrap 完成）

- [x] 实例化（instantiateStreaming + 回退 + 类型化错误含 simd128 路径）
      + typeLayout 解析
- [x] 表驱动编组助手（getField/setField/枚举）
- [x] terminal 生命周期 / vtWrite / resize / scrollViewport
- [x] renderState 脏行迭代 → RowSnapshot/CellView（style/grapheme）
- [x] keyEncode / paste 门 / buildInfo / snapshotEncode / free 语义
- [x] node vitest（bytes 直载：黄金输出 + 迭代形状 + Enter 编码）
- [x] wasm 测试资产：经 A 的 resolver API 下载进共享 .cache（只读
      使用，不自建下载；不提交二进制）
- [x] 报告：registry.json 的 ghostty-vt lib item 条目（ZCode 落盘）

### Batch C：GitHub Actions 供给链 + 发布（子代理C，前置：A bootstrap 完成）

- [x] ghostty-wasm-sync.yml：定时+手动；下载两变体 → 构建包并跑
      jixoai-ghostty-probe → 组装 pin → 与现 pin 比对 → PR
      （concurrency + 最小 permissions + probe 失败不更新）
- [x] deploy.yml：actions/cache（key=两变体 sha256）预填 cacheDir
- [x] release.yml：publish-vite-plugin job（Trusted Publishing 幂等
      发布 + tarball 附 release；Owner TODO 注记 npm 侧绑定）
- [x] scripts/verify-ghostty-pin.mjs + package.json verify:ghostty-pin
      （schema/origin/allowlist/HEAD 200/Content-Length 上限/流式上限/
      cache 一致/tracked wasm 为零/offline 模式）

## Phase 2 — 组件与站点（并行两批，依赖 Phase 1 冻结接口）

### Batch D：ghostty-term 组件（子代理D）

- [x] ghostty-term.svelte：D5.1 法则清单全量（$props/rest/class
      合并/tabindex/aria-label/hit-lane css/density/data-state/
      错误降级）+ D5.2 渲染与输入 + 生命周期释放
- [x] index.ts 纯桶；ghostty-term.css（:where() + layer 序言，
      focus ring + min-block-size: var(--jx-hit)；文件顶部正交意图
      注释 + 时间戳——css-architecture 法则）
- [x] jsdom 逻辑测试（度量/映射/onData/rest 合并）
- [x] 报告：registry.json ui item 条目（registryDependencies 冻结
      值：ghostty-vt/jixoai-theme/utils/color-utils/density
      ——impl-r1#5 修订）+ terminal 分组
      迁移 4 项 + catalog.ts CATALOG_GROUPS 行 + density-adoption
      登记（含 fontSize 逃生口 exception 记录）（ZCode 落盘）

### Batch E：www 集成（子代理E）

- [x] package.json file: 依赖 + vite.config.ts 挂插件
- [x] src/vite-env.d.ts 加 /// <reference types=
      "@jixoai/vite-plugin/client" />（类型契约 fixture）
- [x] same-source 镜像（src/lib/ghostty-vt.ts + src/lib/ui/ghostty-term/**）
- [x] 路由目录：src/routes/docs/components/ghostty-term.html/
      +page.svelte + +page.ts（toc-data 契约）+ 回环 demo pty
- [x] blueprint：scenes/ghostty-term.svelte + npm run
      build:blueprints 生成 static/blueprints/ghostty-term.svg（提交）
- [x] svelte.config.js entries 增路由
- [x] docs-structure.spec.ts / catalog.spec.ts 快照更新（冻结计数）
- [x] PAGE_STANDARDS 合规自检

## Phase 3 — 整合验收（ZCode）

- [x] registry.json（ghostty-vt/color-utils 新 item + ghostty-term
      条目 + terminal 迁组 4 项 + color-picker 补依赖）+ catalog.ts +
      density-adoption + 根 .gitignore 统一落盘
- [x] mirror manifest 再生 + verify:mirror（color-utils 移出
      unreferencedLib）
- [x] 全门禁：svelte-check / vitest 全量 / verify:surface /
      verify:hook-law / verify:ghostty-pin / verify:shadcn-add 扩展 /
      build:blueprints / build:site / docs-structure / catalog
- [x] 真实浏览器验收（ZCode 内置浏览器：demo 页像素采样、resize、
      键盘回环、暗色 token、focus/hit-lane/density、错误降级路径、
      无 role 根节点的可访问语义复核）
- [x] shadcn add 探针（两种 fixture 分离）：ghostty-term 用 clean
      consumer（ghostty-vt + jixoai-theme + utils + color-utils +
      density 连带、无二进制 payload）；color-picker 用前置依赖预置 fixture
      （input/native-select/press-button/surface-motion/density 已
      就位——存量欠账范围外），仅回归 color-utils 连带

## Phase 4 — Codex 实现复核闭环

- [x] 实现复核 r1 → 修复 → r2 …评分收敛或达标（区别于文档评审轮，
      归档为 review-impl-rN.md）
- [x] 每轮结论实际处理并回归验证（不允许"复核已运行"当完成）

## Phase 5 — 收尾（ZCode）

- [x] rebase main：origin/main 未动（基线 4f37726 即 HEAD 起点，法则无升级交集）
- [x] verification.md 落盘（门禁证据汇总）
- [x] archive change、清 herdr 资源、commit+push、移除 worktree（本条即收尾动作自身，随归档提交完成）

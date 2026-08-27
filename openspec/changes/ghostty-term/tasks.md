# tasks — ghostty-term

> 批次划分原则：子代理各自只改自己批次的文件；registry.json、
> catalog.ts、mirror-manifest 等共享文件由 ZCode 统一落盘。
> 每个实现批次完成后跑各自门禁；跨批整合门禁由 ZCode 执行。
> r1：按 Codex r0 评审修订（阻塞 1-12 全部落任务面）。

## Phase 0 — change 文档冻结（ZCode + Codex）

- [x] proposal.md / design.md / tasks.md / subagent-briefs.md / specs deltas（r0）
- [x] Codex r0 review（4.0/10）→ r1 修订（What Changes 标题、vite@8
      事实核正、emit 时序、pin schema、probe 接口冻结、安装链、
      typo、路由/blueprint、分组触及面、authoring 法则、发布任务）
- [ ] Codex r1 复审 → 达标冻结（review-r0.md 归档）

## Phase 1 — 地基（可并行三批）

### Batch A：packages/vite-plugin（子代理A）

- [ ] 包骨架（package.json/exports/bin/tsdown/vitest）零运行时依赖
- [ ] ghostty.pin.json 首版（用 probe 本地验证后提交；两变体，
      schema 冻结于 design D2）
- [ ] pin.ts：pin schema 读取 + schema test
- [ ] resolve.ts：env → cache → fetch+verify 纯函数
- [ ] probe.ts + bin jixoai-ghostty-probe（接口冻结于 design D2：
      --wasm/--variant/--json → pin 片段）
- [ ] jixoaiGhostty()：dev 中间件（sha 前缀路径 + immutable）+
      build emitFile（load 期 emit + ROLLUP_FILE_URL、显式
      内容寻址 fileName、server consumer 不 emit）+ 虚拟模块
- [ ] vitest：vite native 行为 fixture（裸/?url/?init 矩阵）+
      resolve 单测 + build()/dev 集成测试（断言 dist 真实文件名）
- [ ] README（消费者向：一步 wire + 前置契约 + 环境变量）

### Batch B：ghostty-vt 绑定层（子代理B）

- [ ] 实例化（instantiateStreaming + 回退 + 类型化错误含 simd128 路径）
      + typeLayout 解析
- [ ] 表驱动编组助手（getField/setField/枚举）
- [ ] terminal 生命周期 / vtWrite / resize / scrollViewport
- [ ] renderState 脏行迭代 → RowSnapshot/CellView（style/grapheme）
- [ ] keyEncode / paste 门 / buildInfo / snapshotEncode / free 语义
- [ ] node vitest（bytes 直载：黄金输出 + 迭代形状 + Enter 编码）
- [ ] wasm 测试资产：setup 从 pin url 下载进本地 .cache（不提交二进制）
- [ ] 报告：registry.json 的 ghostty-vt lib item 条目（ZCode 落盘）

### Batch C：GitHub Actions 供给链 + 发布（子代理C）

- [ ] ghostty-wasm-sync.yml：定时+手动；下载两变体 → 构建包并跑
      jixoai-ghostty-probe → 组装 pin → 与现 pin 比对 → PR
      （concurrency + 最小 permissions + probe 失败不更新）
- [ ] deploy.yml：actions/cache（key=两变体 sha256）预填 cacheDir
- [ ] release.yml：publish-vite-plugin job（Trusted Publishing 幂等
      发布 + tarball 附 release；Owner TODO 注记 npm 侧绑定）
- [ ] scripts/verify-ghostty-pin.mjs + package.json verify:ghostty-pin
      （schema/origin/HEAD 200/Content-Length 上限/cache 一致/offline 模式）

## Phase 2 — 组件与站点（并行两批，依赖 Phase 1 冻结接口）

### Batch D：ghostty-term 组件（子代理D）

- [ ] ghostty-term.svelte：D5.1 法则清单全量（$props/rest/class
      合并/tabindex/aria-label/hit-lane css/density/data-state/
      错误降级）+ D5.2 渲染与输入 + 生命周期释放
- [ ] index.ts 纯桶；ghostty-term.css（:where() + layer 序言，
      focus ring + min-block-size: var(--jx-hit)）
- [ ] jsdom 逻辑测试（度量/映射/onData/rest 合并）
- [ ] 报告：registry.json ui item 条目（registryDependencies 冻结
      值）+ terminal 分组迁移 4 项 + catalog.ts CATALOG_GROUPS 行 +
      density-adoption 登记（ZCode 落盘）

### Batch E：www 集成（子代理E）

- [ ] package.json file: 依赖 + vite.config.ts 挂插件
- [ ] same-source 镜像（src/lib/ghostty-vt.ts + src/lib/ui/ghostty-term/**）
- [ ] 路由目录：src/routes/docs/components/ghostty-term.html/
      +page.svelte + +page.ts（toc-data 契约）+ 回环 demo pty
- [ ] blueprint：scenes/ghostty-term.svelte + npm run
      build:blueprints 生成 static/blueprints/ghostty-term.svg（提交）
- [ ] svelte.config.js entries 增路由
- [ ] docs-structure.spec.ts / catalog.spec.ts 快照更新（冻结计数）
- [ ] PAGE_STANDARDS 合规自检

## Phase 3 — 整合验收（ZCode）

- [ ] registry.json + catalog.ts + density-adoption 统一落盘
- [ ] mirror manifest 再生 + verify:mirror
- [ ] 全门禁：svelte-check / vitest 全量 / verify:surface /
      verify:hook-law / verify:ghostty-pin / verify:shadcn-add 扩展 /
      build:blueprints / build:site / docs-structure / catalog
- [ ] 真实浏览器验收（ZCode 内置浏览器：demo 页像素采样、resize、
      键盘回环、暗色 token、focus/hit-lane/density、错误降级路径）
- [ ] shadcn add 干净消费者探针（ghostty-term → ghostty-vt + theme
      连带安装、无二进制 payload）

## Phase 4 — Codex 实现复核闭环

- [ ] review-r1（实现）→ 修复 → review-r2 …评分收敛或达标
- [ ] 每轮结论实际处理并回归验证（不允许"复核已运行"当完成）

## Phase 5 — 收尾（ZCode）

- [ ] rebase main（检查法则升级交集：surface-kernel / density /
      variant-grammar 等若演进，做一轮对齐开发）
- [ ] verification.md 落盘（门禁证据汇总）
- [ ] archive change、清 herdr 资源、commit+push、移除 worktree

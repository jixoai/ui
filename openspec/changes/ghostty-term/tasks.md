# tasks — ghostty-term

> 批次划分原则：子代理各自只改自己批次的文件；registry.json、
> catalog.ts、mirror-manifest 等共享文件由 ZCode 统一落盘。
> 每个实现批次完成后跑各自门禁；跨批整合门禁由 ZCode 执行。

## Phase 0 — change 文档冻结（ZCode + Codex）

- [ ] proposal.md / design.md / tasks.md / subagent-briefs.md / specs deltas
- [ ] Codex change review → 修订 → 达标冻结（review-r0 归档）

## Phase 1 — 地基（可并行两批）

### Batch A：packages/vite-plugin（ZCode + 子代理A）

- [ ] 包骨架（package.json/exports/tsconfig/vitest）零运行时依赖
- [ ] ghostty.pin.json 首版（手工 pin 当前 tip sha256，两变体）
- [ ] resolve.ts：env → cache → fetch+verify 纯函数
- [ ] probe.ts：validate + ABI 冒烟（供 workflow 与测试复用）
- [ ] jixoaiGhostty()：dev 中间件 + build emitFile + 虚拟模块
- [ ] vitest：resolve 单测 + build()/dev 集成测试
- [ ] README（安装一步 wire 说明，面向消费者）

### Batch B：ghostty-vt 绑定层（子代理B，registry/files/lib/ghostty-vt.ts）

- [ ] 实例化（instantiateStreaming + 回退）+ typeLayout 解析
- [ ] 表驱动编组助手（getField/setField/枚举）
- [ ] terminal 生命周期 / vtWrite / resize / scrollViewport
- [ ] renderState 脏行迭代 → RowSnapshot/CellView（style/grapheme）
- [ ] keyEncode / paste 门 / buildInfo / 显式 free 语义
- [ ] node vitest（bytes 直载：黄金输出 + 迭代形状 + Enter 编码）
- [ ] registry.json 的 ghostty-vt lib item 条目 → ZCode 落盘

### Batch C：GitHub Actions 供给链（子代理C，.github/workflows/）

- [ ] ghostty-wasm-sync.yml：定时+手动；下载两变体 → probe → 更新 pin → PR
- [ ] deploy.yml：actions/cache（key=sha256）预填 cacheDir
- [ ] verify:ghostty-pin 脚本（node 轻量哨兵）

## Phase 2 — 组件与站点（并行两批，依赖 Phase 1 冻结的接口）

### Batch D：ghostty-term 组件（子代理D，registry/files/ui/ghostty-term/）

- [ ] ghostty-term.svelte：canvas 渲染器（D5 全量）+ 生命周期释放
- [ ] 度量/density/字体时序；auto 与固定 cols/rows
- [ ] 键盘/paste/viewport 滚动；onData/write/reset 派生 API
- [ ] index.ts 纯桶 + data-jx 钩子法遵守
- [ ] jsdom 逻辑测试
- [ ] registry.json ui item 条目 + terminal 分组迁移（terminal-card/
      header/footer）→ ZCode 落盘 registry.json 与 catalog.ts

### Batch E：www 集成（子代理E，apps/www/）

- [ ] file: 依赖 + vite.config.ts 挂插件
- [ ] same-source 镜像（lib/ghostty-vt.ts + ui/ghostty-term/**）
- [ ] /docs/components/ghostty-term 文档页 + 回环 demo pty
- [ ] catalog.ts CATALOG_GROUPS 增 terminal 组（ZCode 落盘）
- [ ] docs-structure.spec.ts 快照更新
- [ ] PAGE_STANDARDS 合规自检

## Phase 3 — 整合验收（ZCode）

- [ ] mirror manifest 再生 + verify:mirror
- [ ] 全门禁：svelte-check / vitest 全量 / verify:surface /
      verify:hook-law / verify:ghostty-pin / build:site / docs-structure
- [ ] 真实浏览器验收（ZCode 内置浏览器：demo 页像素采样、resize、
      键盘回环、暗色 token、prefers-reduced-motion 无违规动画）
- [ ] shadcn add 干净消费者探针（ghostty-term 全链路安装形状）

## Phase 4 — Codex 实现复核闭环

- [ ] review-r1（实现）→ 修复 → review-r2 …评分收敛或达标
- [ ] 每轮结论实际处理并回归验证（不允许"复核已运行"当完成）

## Phase 5 — 收尾（ZCode）

- [ ] rebase main（检查法则升级交集：surface-kernel / density /
      variant-grammar 等若演进，做一轮对齐开发）
- [ ] verification.md 落盘（门禁证据汇总）
- [ ] archive change、清 herdr 资源、commit+push、移除 worktree

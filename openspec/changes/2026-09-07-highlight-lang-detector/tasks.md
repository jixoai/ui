# highlight-lang-detector Tasks

## 1. 阶段 0 — change 文档与送审（ZCode）

- [ ] 1.1 proposal / design / tasks 三件套 + spec 增量草稿（本目录）
- [ ] 1.2 探测落档：evidence/betlang-probe-2026-09-07.md（wasm 构建序列
      + 尺寸矩阵 + 样本检测 + 工具链坑 + npm 渠道缺失结论）
- [ ] 1.3 Codex 审 change 文档（herdr, gpt-5.6-terra/xhigh，异步回调）
      → 消化意见 → 满意后开工
- [ ] 1.4 实现期 worktree + 引导序列（pnpm approve-builds / apps/www
      npm ci / vite-plugin build / svelte-kit sync）

## 2. 阶段 1 — 契约与接线（ZCode 直担，基础先行）

- [ ] 2.1 `highlight` core item + lang-detector.ts（LanguageDetector /
      DetectResult / DetectSource 契约 + HIGHLIGHT_DETECT_KEY seam）；
      context.svelte.ts 内核侧 HIGHLIGHT_DETECT_DEF
- [ ] 2.2 `code-card`：`langDetector` prop + AUTO_LANG 路径 +
      resolveDetector 四环决策表（design D2.1）+ null 级联/reject 终态
      + 失败法则接入（reject 提示装 DLD 与一行接线）
- [ ] 2.2b DLD item 的 `<HighlightDetectDefault />` 接线组件
      （setContext(HIGHLIGHT_DETECT_KEY) + runtime import core 常量保
      边活性）
- [ ] 2.3 `highlight-highlightjs`：backend.detector 槽位接线
      （highlightAuto over 实例已注册 langs；零注册时 reject 提示）
- [ ] 2.4 契约测试：解析链四环优先级、'auto' 哨兵不影响存量路径
      （lang='ts' 逐字节不变断言）

## 3. 阶段 2 — DLD 纯 TS 层 L1-L3（子代理 A；L4 统计层在阶段 3）

- [ ] 3.1 L1 ext-table.ts：linguist extensions ∩ canonical 集多行
      字符串表 + 歧义扩展名排除（heuristics 138 组来源注释）+ 惰性
      Map parse
- [ ] 3.2 L2 shebang-table.ts：interpreters 多行字符串表 + 首行解析
      （`#!/usr/bin/env X` 与 `#!X` 两种形态）
- [ ] 3.3 L3 structure.ts：XML/HTML/SVG/JSON/YAML/TOML/INI 探针
      （design D3.2 判据表）+ **Markdown 干扰负样本**（Rust/Go/Kotlin/
      Swift 指纹样本必须穿透到 L4）
- [ ] 3.4 层间短路测试（L1 命中 → L2 模块零加载；vi.mock 计数法）

## 4. 阶段 3 — betlang wasm 通道（子代理 B，依赖 D4 裁决定型）

- [ ] 4.1 `@jixoai/betlang-wasm` 包（CI 从钉死 crates.io 版本构建；
      ~40 行手写装载器；线性内存 UTF-8 ABI；.d.ts；MIT 归属）或
      备选 release+pin 通道
- [ ] 4.2 wasmLoader seam（{url}|{bytes} 四象限，tree-sitter 同构）+
      48 标签映射表（无对应 → null + warn）
- [ ] 4.3 scripts/verify-betlang-pin.mjs：sha256 + magic bytes +
      raw ≤ 100KB / gzip ≤ 70KB 双预算门禁
- [ ] 4.4 vitest bytes 通道真实 wasm 检测断言（非 mock）

## 5. 阶段 4 — registry / 站点 / 文档（子代理 C，vision 协助）

- [ ] 5.1 registry.json：highlight-lang-detector item 条目（exports
      双工厂；docs 写明四层与按需法则）+ core/highlightjs/code-card
      条目增量
- [ ] 5.2 双树依赖落盘 + mirror-manifest 再生 + 字节镜像
- [ ] 5.3 code-card 文档页：lang="auto" 段落 + playground 实演
      （filename 探针 / 无 filename 统计检测两条 demo）
- [ ] 5.4 blueprints/highlight.svelte 架构图 + llms/search 语料同步

## 6. 阶段 5 — 门禁与验证

- [ ] 6.1 verify:shadcn-add 派生新 item case（probe 模板）+
      verify:mirror / meta / deps / budgets / docs 全绿
- [ ] 6.2 定向 vitest 全绿（新契约 + 四层 + hljs detector + 端到端
      lang="auto" 上色）；双侧 svelte-check 零新增
- [ ] 6.3 浏览器实测：dev + build+preview 双侧 lang="auto" 端到端
      （L1 filename 命中路径 + L4 统计路径 + DLD 未装 reject 路径）

## 7. 阶段 6 — Codex 复核闭环与收尾

- [ ] 7.1 Codex 围绕 change 目标 + 真实 diff + 测试证据复核 → 迭代
- [ ] 7.2 rebase main（检查底层法则漂移，有交集补对齐轮）
- [ ] 7.3 archive change + 三段式提交 + push + worktree/herdr 回收

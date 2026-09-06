# highlight-engine-matrix Tasks

## 1. 阶段 0 — change 文档与送审（ZCode）
- [x] 1.1 git worktree + 分支 highlight-engine-matrix
- [x] 1.2 proposal / design / tasks 三件套 + spec 增量草稿
- [x] 1.3 实现期探测落档：evidence/npm-probe-2026-09-06.md（tarball 证据 + fresh-worktree 引导序列）
- [x] 1.4 Codex 审 change 文档（herdr, gpt-5.6-terra/xhigh）→ 消化意见 → 满意后开工
  - r1（5/10 REVISE）：A1-A6 结构性阻塞全消化（context seam / 闭包矩阵 / supersede 措辞 / wasmLoader 方向 / lazy 限定 / 迁移表）
  - r2（6.5/10 REVISE）：4 阻塞消化——①delta 重构为 `## ADDED Requirements` + `### Requirement:`，`openspec validate --strict` 通过；②wasmLoader 接线冻结（{url}/{bytes} × core/grammar 四象限表 + 静态字面量 import map + 环境显式注入无运行时探测 + Parser.init singleton 语义 + 真实 HTTP 验收）；③版本钉探测实证口径（^11.12.0/^2.3.1/^0.27.0/^0.23.2/^0.23.1）；④verify:shadcn-add 从 registry.json highlight-* 自动生成隔离 case（canonical files/npm 独占/typecheck；tree-sitter 追加 build+serve+fetch magic 断言）。B2/B3/B4/B5/B6 采纳
  - r3（7.5/10 REVISE，唯一阻塞已修）：core wasm 文件名笔误 `tree-sitter.wasm` → **`web-tree-sitter.wasm`**（包 exports 实测 `"./web-tree-sitter.wasm"` 显式映射；语法包无 exports 全文件可解析）；HTTP 验收强化为四静态 import 全覆盖 + 四资产发射断言

## 2. 阶段 1 — registry 拆分与选项化（ZCode 直担）
- [x] 2.1 `highlight` item 收窄为 core（backend.ts + context-key.ts + requestedLang/canonicalLang 助手，零 npm 依赖）；vendor.d.ts 拆为 vendor-prismjs.d.ts / vendor-microlighter.d.ts
- [x] 2.2 新增 6 个引擎 item 的 registry.json 条目（highlight-shiki/-prismjs/-microlighter/-highlightjs/-sugar-high/-tree-sitter，engines 组，description/docs 全量；highlight-shiki 声明 @jixoai/shiki 边）
- [x] 2.3 `code-card` 依赖瘦身：npm deps ["shiki"]，registryDeps + @jixoai/highlight-shiki；docs 同步破坏性迁移表
- [x] 2.4 `shiki({ langs })` / `prismjs({ langs })` 选项（per-instance 允许集闭包 + 集外 reject 带提示；工厂改 value import core 助手保持边活性）
- [x] 2.5 两树 package.json 依赖落盘（apps/www npm ci / 根 pnpm；含 vite-plugin rebuild + svelte-kit sync 引导序列）；mirror-manifest 再生（gen-mirror-manifest）双树字节镜像

## 3. 阶段 2 — 三个新引擎（并行子代理 B/C/D）
- [x] 3.1 B：highlight-js.ts（core+选择性注册、别名表、tsx/jsx/svelte/vue reject 提示、jixoai 内嵌 --tok CSS + styles 懒加载表；**CSS 规则按 highlight() 真实输出类全量枚举**（含 title.function_ 等后缀类），非估算）+ registry item + 契约测试
- [x] 3.2 C：sugar-high.ts（29 语言 canonical 化 + 别名（ts/js/jsx/sh/md/yml/htm）、tsx reject 提示、直接消费 HTML 输出、零选项豁免注释）+ registry item + 契约测试
- [x] 3.3 D：tree-sitter.ts + tree-sitter-queries.ts（query 内嵌、capture→--tok 映射、wasmLoader seam（{url}|{bytes}）+ wasmBase 糖、markup 渲染 + 转义、vitest 字节加载真实 wasm 断言 ABI）+ registry item + 契约测试
- [x] 3.4 契约测试通项：每引擎"仅构造不 paint 零引擎加载"断言（window 标记法/vi.mock 计数法）
- [x] 3.5 各子代理按反馈协议报告摩擦点（skill/指令不清晰、矛盾、不适配处 + 解决方式），ZCode 对照 diff 交叉核验

## 4. 阶段 3 — 站点与文档（子代理 E，vision 协助）
- [x] 4.1 code-card 文档页引擎矩阵区（输出模型/体积/语法覆盖/定制能力/print 行为对照）+ playground 引擎切换
- [x] 4.2 blueprints/highlight.svelte 架构图更新（六引擎矩阵）
- [x] 4.3 registry docs 文案与 llms/search 语料同步

## 5. 阶段 4 — 验证门禁（ZCode）
- [x] 5.1 verify:mirror / verify:deps / verify:meta / verify:docs / verify:budgets 全绿
- [x] 5.2 verify:shadcn-add 引擎矩阵自动化：从 registry.json highlight-* 条目自动生成隔离 case（canonical files 落盘 / npm 只含本引擎 / consumer typecheck）；tree-sitter case 追加 build→serve→fetch wasm magic 断言；code-card case 断言默认闭包仅 shiki
- [x] 5.3 双树 svelte-check（test:types）+ 定向 vitest（新引擎契约 + 存量 code-card 系）
- [x] 5.4 search-corpus 再生（payload 经 build:registry 再生，corpus 为部署管线产物）

## 6. 阶段 5 — Codex 复核闭环（ZCode 编排）
- [x] 6.1 herdr 提交复核（真实工作区 + diff + 测试证据 + change 目标）；要求：阻塞项清单、可验证修复建议、质量评价、0-10 综合评分及依据
- [x] 6.2 按结论迭代修复并重新验证，再复核；循环至评分与阻塞项清零达标
- [ ] 6.3 herdr 资源回收（agent 退出确认 + pane/workspace 清理）

## 7. 阶段 6 — 收尾（ZCode）
- [x] 7.1 rebase main（检查底层法则漂移；与变更有交集则补一轮对齐开发）
- [ ] 7.2 archive openspec change（deltas 落 living specs；**核对 living registry spec 的 build-plugin-only 旧句确被双通道措辞替换**——r2-B5）
- [ ] 7.3 commit + push（git-committer 标准）
- [ ] 7.4 清理 worktree + herdr workspace
  - 终审 r1（7.5/10，唯一阻塞）：langs"构建期裁剪"契约措辞超前于实现——按推荐方案对齐为运行时加载闭包语义（spec/design/docs 三处 + 新增"仅选中语法加载"正向断言，hljs 9/9）；B3/B4 落地（cache process-level 语义 + wasmBase 尾斜杠归一化）
  - 终审 r2（8.5/10，无实现阻塞，"可收尾归档"）：B1 living-spec 归档合并为归档前置强制项


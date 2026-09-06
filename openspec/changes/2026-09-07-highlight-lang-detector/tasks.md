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
      resolveDetector 三环决策表 + 兜底 reject（design D2.1）+ null 级联/reject 终态
      + 失败法则接入（reject 提示装 DLD 与一行接线）
- [ ] 2.2b 独立 registry:ui item `highlight-detect-default`：children
      包装 provider（~10 行 Svelte，实现即形态②）+ index.ts 纯
      barrel + registryDeps 三边（DLD/highlight/jixoai-theme，UI 合同
      统一）；作用域测试（包装子树吃默认/兄弟子树不吃/嵌套取最近）；
      三条写入路径同一 { detector } 形状的端到端测试
- [ ] 2.3 `highlight-highlightjs`：backend.detector 槽位接线
      （highlightAuto over 实例已注册 langs；零注册时 reject 提示）
- [ ] 2.4 契约测试：解析链三环优先级 + 兜底 reject、AUTO_LANG 严格全等边界（'AUTO'/' auto '/'auto\n' 走普通路径）、'auto' 不影响存量路径
      （lang='ts' 逐字节不变断言）

## 3. 阶段 2 — DLD 纯 TS 层 L1-L3（子代理 A；L4 统计层在阶段 3）

- [ ] 3.0 lang-canonical.ts 权威表：按 design D8.1 grammar 编纂
      （betlang =0.1.1 的 48 标签 + linguist @SHA + backend curated
      @commit 三源钉死）；parse error 测试（重复行/重复 k/非法值）；
      门禁断言 48 标签恰好各一次 + canonical 无重复 + ext/file/interp
      无跨行重复 + derive-then-diff（派生表与三个消费文件一致）
- [ ] 3.1 L1 detect-ext-table.ts：从 lang-canonical.ts 派生的扩展名 +
      basename 多行字符串表（歧义扩展名排除，heuristics 来源注释）
      + 惰性 Map parse + 边界冻结测试（路径分隔符/大小写/dotfile/
      多后缀）
- [ ] 3.2 L2 detect-shebang-table.ts：interpreters 多行字符串表 + 首行解析
      （`#!/usr/bin/env X` 与 `#!X` 两种形态）
- [ ] 3.3 L3 detect-structure.ts：XML/HTML/SVG/JSON/YAML/TOML/INI 探针
      （design D3.2 判据表）+ **Markdown 干扰负样本**（Rust/Go/Kotlin/
      Swift 指纹样本必须穿透到 L4）
- [ ] 3.4 层间短路测试（L1 命中 → L2 模块零加载；vi.mock 计数法）

## 4. 阶段 3 — betlang wasm 通道（子代理 B，依赖 D4 裁决定型）

- [ ] 4.1 `@jixoai/betlang-wasm` 包（CI 从钉死 crates.io 版本构建；
      ~40 行手写装载器；线性内存 UTF-8 ABI；.d.ts；MIT 归属；
      ARTIFACT.md 记录 wasmRawBytes/wasmGzipBytes/wasmSha256/
      tarballSha256/工具链版本；最终发行物复测过双预算与 98KiB
      预警线——越线则触发降级预案改写 L4 章重新送审）
- [ ] 4.2 wasmLoader seam（betlang 单 wasm 资产 → {url}|{bytes}
      **双形态**——"四象限"是 tree-sitter 的 core+grammar 双资产术语，
      此处不适用；tree-sitter 同构的 seam 形状）+ 48 标签映射表
      （无对应 → null + warn）
- [ ] 4.3 scripts/verify-betlang-pin.mjs（命令级验收逐项）：
      输入 = packages/betlang-wasm 内 .wasm 路径参数（缺省读
      ARTIFACT.md 声明值）；校验 = magic bytes `\0asm`、wasm sha256、
      ARTIFACT.md 逐字段（wasmRawBytes/wasmGzipBytes/wasmSha256/
      tarballSha256/crateChecksum/rustc 版本）；退出码 = 预算违例
      （raw > 100 KiB 或 gzip > 70 KiB）exit 1、预警线（raw > 98 KiB）
      exit 2、字段不符 exit 3；gzip = Node zlib.gzipSync level 9；
      `--self-test` 用内置 fixture（篡改字节/超限尺寸/缺字段）证明
      三类退出码路径；与 spec 门禁场景一一对应。CI 可复制示例：
      `node scripts/verify-betlang-pin.mjs \
       packages/betlang-wasm/dist/betlang_wasm.wasm`（预期 exit 0）
      ＋ `--self-test`（预期 exit 0 且输出三行 self-test OK）——
      退出码表：0 通过 / 1 预算违例 / 2 预警线 / 3 字段不符
- [ ] 4.4 vitest bytes 通道真实 wasm 检测断言（非 mock）

## 5. 阶段 4 — registry / 站点 / 文档（子代理 C，vision 协助）

- [ ] 5.1 registry.json：highlight-lang-detector item 条目（exports
      双工厂；docs 写明 DLD 四层瀑布与按需法则——'四层'仅指瀑布层，
      检测环恒为'三环 + 兜底 reject'）+ core/highlightjs/code-card
      条目增量
- [ ] 5.2 双树依赖落盘 + mirror-manifest 再生 + 字节镜像
- [ ] 5.3 code-card 文档页：lang="auto" 段落 + playground 实演
      （filename 探针 / 无 filename 统计检测两条 demo）
- [ ] 5.4 blueprints/highlight.svelte 架构图 + llms/search 语料同步

## 6. 阶段 5 — 门禁与验证

- [ ] 6.1 verify:shadcn-add 派生三 case（裸 code-card 零 DLD 字节 /
      +DLD lib wasm 发射 / +wrapper 端到端；probe 模板）+
      verify:mirror / meta / deps / budgets / docs 全绿
- [ ] 6.2 定向 vitest 全绿（新契约 + 四层 + hljs detector + 端到端
      lang="auto" 上色）；双侧 svelte-check 零新增
- [ ] 6.3 浏览器实测：dev + build+preview 双侧 lang="auto" 端到端
      （L1 filename 命中路径 + L4 统计路径 + DLD 未装 reject 路径）

## 7. 阶段 6 — Codex 复核闭环与收尾

- [ ] 7.1 Codex 围绕 change 目标 + 真实 diff + 测试证据复核 → 迭代
- [ ] 7.2 rebase main（检查底层法则漂移，有交集补对齐轮）
- [ ] 7.3 archive change + 三段式提交 + push + worktree/herdr 回收

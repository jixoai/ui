# 协作模型（本任务最大的特别之处，Owner 裁决 2026-09-11）

> 原话意旨：这个任务非常大，过程中会涉及通用组件的开发。
> 这些通用组件**由子代理独立使用"标准工作流"迭代，并合并到
> main 分支**；design-tool 产品分支（本 worktree）**持续与 main
> 保持对齐（rebase）**。

## 规则

1. **分流判定**：开发中出现的组件/工具若具通用性（其它产品或
   社区可独立消费——registry item、schema 内核、布局原语、kit），
   一律走独立标准工作流；design-tool 产品专有的（server/studio/
   agent 适配）留在本分支。
2. **独立标准工作流**（每个通用组件 change）：独立 worktree
   （基于 main）→ openspec change → 实现 + 测试 → super-thinker
   复核至 ≥8 无阻塞 → 本地 merge 进 main（主检出执行，不 push，
   push 由 Owner 决定）→ openspec 归档进 main。
3. **rebase 纪律**：main 每次进通用组件后，本分支在**安全窗口**
   rebase（当前条件：r2 子代理全部交付且工作已提交——rebase 前
   工作树必须干净）。rebase 时按 AGENTS 法则检查 main 上的底层
   法则变更是否与本分支改动有交集，有则先做一轮对齐开发。
4. **首个实例**：layout-family-alpha（Flex/Grid/Waterfall），
   worktree `/Users/kzf/Dev/GitHub/jixoai-labs/ui-prototype-layout`。
   其摩擦点报告将固化本流程（首个走通者的反馈即流程的第一次
   校准）。

## 历史备注

- r1 的 prototype-kit（已在 design-tool 分支 f97cf942）是通用
  组件的"倒挂"实例（先落产品分支后识通用性）：待 Owner 检查点
  后，提议以同款独立工作流 cherry-pick 提取进 main，本分支
  rebase 消费（patch-id 去重）。

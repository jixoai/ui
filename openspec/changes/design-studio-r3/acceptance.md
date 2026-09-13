# 验收门（design-studio r3）——向 Owner 发走查邀请的前置条件

> 规则：**六门全绿才允许邀请**。任何一门红：修复 → 从该门起重跑
> （走查门重跑时全量十步，不跑增量——动线完整性不可分段补验）。
> 每门留下证据记录（§记录格式），与邀请一起呈 Owner。

## 门 1 走查门（最强门）

- 执行者：vision 子代理（真实浏览器操作）+ general-purpose 子代理
  （断言脚本），**不是**编排者自述。
- 环境：隔离实例（独立 worktree + 独立 HOME + `--agent dsh` 真回
  路 + `--no-open`），按 walkthrough-flow.md §0。
- 范围：**W0–W9 十步全量**，每步的四栏断言逐条执行。
- 绿线：10/10 步绿；W3 按树路径完成即绿（画布路径按引导文案验收，
  见动线该步说明）；W4 中 slot-derived 行的 edit-in-code 退化为
  **如实展示**（非断点）。
- 证据：每步截图（步骤关键帧）+ 断言脚本输出（逐条 pass）+ console
  error 计数 = 0 + 网络面板导出（manifest/prop-edit/chat/promotions
  请求轨迹）。

## 门 2 稳定门

- W2 静置断言：选中后静置 ≥10s（覆盖 ≥2 个 manifest/promotions
  轮询周期），属性面板零 loading 闪烁（DOM 变更监听 + 截图对比）。
- 同型审计：树、updates 徽标在轮询周期内无 identity churn 引发
  的重渲染痕迹（rebuild-plan §5.3 清单核对）。
- 全程（门 1 十步期间）console 零 error（warning 记录但不阻断，
  除非涉及网络失败被吞——ID6 类问题必须已修）。

## 门 3 dogfooding 门（#10 的量化验收）

基线（r2，2026-09-12 实测）：studio/ 五文件 `<style>` 块合计
663 行手写 chrome CSS（shell 194 / property-panel 149 /
chat-panel 139 / guide-panel 93 / component-tree 88）；
`#jixoai/` import 数 = 0。

- `rg -c "from '#jixoai/" packages/design-tool/src/studio/*.svelte`
  合计 **≥8**，且五个文件每个 ≥1（每个面板至少消费一个家族）。
- 手写 `<style>` 合计 **≤265 行**（较基线 663 降 ≥60%）；残留仅允许
  grid 骨架/面板间距/滚动条类（review 时逐块点名核对，控件
  chrome 类样式出现即红）。
- `STUDIO_CHROME_ITEMS` 导出存在，且与实际 import 集一致
  （脚本断言：清单内每一项都被某面板 import）。
- 宿主组合点保持可用：scaffold 干净宿主跑通（design/studio.svelte
  wrap <DesignShell/> 正常渲染）。

## 门 4 测试门

- design-tool 包测试全绿（r2 基线 105 + r3 新增，无跳过）。
- 必须在场的新回归：
  - identity-churn 回归（manifest 两轮等价轮询 → panel seed
    effect 不重跑）；
  - W4 的 prop-edit 源码断言（含 P2-2 absent-toggle 删除语义——
    r2 已有，确认仍在）；
  - STUDIO_CHROME_ITEMS 一致性断言。
- vehicle 实测：`jixoai-ui design` 冷启动 → studio 可用（宿主无
  design/ 目录时 scaffold 正常）。

## 门 5 反哺门（grindstone 产出）

- rebuild-plan §6.1 ledger 至少 **1 条**从「预置」转为「实证」
  （带真实走查证据），且对应 GitHub issue 已开（label:
  component-feedback，正文引用 r3）。
- 「不可绕行」类（若有）：已在 r3 内解决或有明确后续 issue +
  责任落位。

## 门 6 视觉门

- vision 子代理对面板密度/节奏/对齐/态完整性（8 态抽查：
  default/hover/disabled/loading 至少）走查报告：**无 P0/P1 级
  发现**（P2 观感项可带条件放行：列出 + 进 T7/backlog）。
- 反 AI 味红线过检：无渐变混战、无灰盒占位、暗背景非无色相纯黑
  （studio 现行墨色系延续）。
- 布局稳定性目击：W2 选中和取消选中，stage 宽度无跳变（录屏或
  前后截图对比）。

## 放行清单（邀请前的最终核对）

```
[ ] 门 1-6 证据表齐（下格式），全绿
[ ] walkthrough-flow.md 的「当前状态」列已按 r3 实测更新（通/退化 标注）
[ ] draft PR #9 描述更新（r3 完成项 + issues #10-#13 状态翻转；#14 P1-2 仍开）
[ ] 未 commit 由 Owner/编排者整合（本次交付即如此约定）
[ ] 邀请文案附：动线十步一览 + 预计走查时长（目标 ≤10 分钟）+ 已知诚实退化清单
      （#14 P1-2 slot-derived；W6-W9 为终端步骤——prd §2 裁决）
```

## 记录格式（每门一份，随邀请呈交）

```
### 门 N：<名> — GREEN/RED (date, executor)
| 断言/检查项 | 结果 | 证据（截图路径/脚本输出摘要/rg 计数） |
|---|---|---|
| … | pass | … |
偏差备注：…
```

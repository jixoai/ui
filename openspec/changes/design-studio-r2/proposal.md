# Proposal: design-studio r2 — 设计文件、晋升与变更通知、元素级定位、元数据驱动的操作面

> 原始需求（Owner 走查反馈 + 四项拍板，2026-09-11）：r1 回路
> 成立；真模型已接（glm-5.3-flash，`--patch` 覆盖层 + 隔离
> DSH_HOME，489acb59）；四项新能力**一步到位**（拍板 ④：绑定为
> 一个整体更好验收）。Q1–Q4 裁决全文见 design-studio/problems.md
> 各节"Owner 裁决"段。工作方式延续 fast-remix。

## 拍板记录（2026-09-11）

1. 设计文件格式 = **registry-item 形状 JSON**。
2. 同步语义澄清（Owner 原话意旨）：设计稿改了，项目里那份已被
   开发者改造过（数据绑定等），**如何告知开发者设计变更并协助
   合并**——方案见 design.md §2：来源清单 + changelog 意图摘要 +
   three-way apply（干净 hunk 自动合并、冲突指名标记、永不静默
   覆盖开发者改动）。
3. 属性修饰注解宿主 = **现有 .meta.ts 两区制注解区**（不写注释
   语法 + 新 lint）。
4. 分期 = **一步到位**（四项一个 change）。

## What Changes（四项一体）

```
┌─ A 设计文件 ──────────────┐   ┌─ B 晋升与变更通知 ────────────┐
│ design save/open          │   │ design promote → 宿主 src      │
│ registry-item JSON        │──→│ design/.promotions.json 来源单 │
│ version + changelog       │   │ design status  → 漂移+diff+意图│
│ (Agent 意图摘要沉淀)      │   │ design apply   → three-way 合并│
└───────────────────────────┘   └────────────────────────────────┘
┌─ C 元素级定位 ─────────────┐   ┌─ D 元数据操作面（alpha 轨）────┐
│ dev-only 组件印章变换      │   │ 按需 schema 提取（meta-gen 移植）│
│ data-jx-component/instance│   │ 属性面板 = 源码编辑（AST 重写）  │
│ 画布选择器 + ComponentTree │──→│ meta.ts 注解区 x-ui.icon/i18n  │
│ selection → chat 注入     │   │ Layout 族 Flex/Grid/Waterfall  │
└───────────────────────────┘   └────────────────────────────────┘
```

A 为 B 提供版本与 base 内容；C 的 selection 为 D 提供编辑目标；
D 的 schema 为 C 的树提供组件元信息——四项互锁，故一步到位。

## 关键裁决（design.md 详述）

- **印章变换**（C 内核）：design server 变换 jixoai 组件源码时盖
  dev-only `data-jx-component="<item>" data-jx-instance="<n>"`——
  canvasPlugin 源码变换先例同族；生产构建零痕迹。
- **代码优先的属性面板**（D 内核，Q3 推论）：面板编辑原型源码
  （AST 定位 prop 字面量 + magic-string 重写 + HMR），不是运行时
  props 注入。不可表示的 prop 只读 + "改代码"提示（诚实降级）。
- **Layout alpha 轨**（Q2）：`@jixoai/ui-prototype-plugin` 新包 +
  registry item 打 alpha 标记，社区可 shadcn add；稳定后收编。

## 非目标

- 双向自动同步（apply 是显式命令，永不自动跑）。
- 云端/协作设计文件。
- 印章进生产、第三方组件的 schema 面板（树可见、无面板）。
- JSON-AST 中间表示（Q3 裁决永久排除）。

# Proposal: context-plugin-v2 — def 身份化，内核升格，三减法

## Why

Owner 走查定调（2026-09-03）：指南页对 definePlugin 的定位交代不足造成了误会，
但 definePlugin 本身确实要打磨；defaults-economy 走查评估给出的三个减法结论
（A 砍 paintSlot 运行时值域守卫 / B WeakSet 降 dev-only / C 退役生命周期谓词
与 ambient-skip 降级）已获背书。设计权已委托（"你来定设计"）。

三路探索证实的问题（全部有行级证据）：

1. **targets 是字符串匹配，且类型可谎报**。`plugin.targets.includes(def.key)`
   （context-plugin.svelte.ts:348/414 等）——插件作者与 def 作者靠字符串约定
   一致；更实质的：`definePlugin<K, T>` 的 `T` 与 def 的值类型没有任何类型级
   关联，`before: (v: WrongType) => …` 照样编译（K/T 双自由参数，T 从 hooks
   推导而非从 def 绑定）。这是真实类型漏洞，不是观感问题。
2. **density 的结构缝是手写反射**。`Symbol.for('jx-context-plugins')` +
   `PluginScopeSeam` 接口复刻内核形状（density.svelte.ts:52-66），drift 只靠
   人盯；该设计被 living spec（registry "two-tier ownership"）钉死为
   "ZERO kernel imports / Symbol.for seams"。
3. **四个运行时防御撑起了"反射感"**（谓词字符串匹配、WeakSet 构造期防伪、
   values 值域守卫、双键 legacy 读），其中三个有干净的减法路径。
4. **插件经济今天不可发行**。内核 site-only（site-only.mjs:52），消费者装不
   到——print-pin 式跨切面干预对外部用户是纯纸面能力。升格即解锁。

## What Changes

1. **def 身份化（D1）**：内核新增 `defineContextDef` 工厂；`DENSITY_DEF` /
   `HUE_DEF` / `HIGHLIGHT_DEF` / `MEDIUM_DEF` 变为真 def 对象；`definePlugin`
   的 targets 从字符串元组改为 def 对象引用（`targets: [DENSITY_DEF]`），
   hooks 值类型经 `D extends ContextDef<string, infer T>` 从 def 推导——
   谎报类型成为编译错误；运行时匹配改对象恒等。medium 只读拒绝改为
   `defineReadOnlyContextDef` 的类型标记（`ReadOnlyContextDef` 在
   PluginSpec targets 类型层被拒，运行时双保险保留）。
   `PLUGIN_SCOPE_KEY` 由 `Symbol.for` 降为模块私有 Symbol（最后一个全局
   字符串键退役——升格后单例导入使其可行）。
2. **内核升格 registry:lib（D2）**：`registry/files/lib/context-plugin.svelte.ts`
   成为 registry:lib 项（第一个含 runes 的 lib 项）；medium 解耦——
   `MediumState` 类型移入内核，`provideContextPlugins(plugins, { root, medium })`
   由调用方注入 getter（+layout.svelte / print-doc.svelte 两处），内核删除
   对 `./medium.svelte` 的 import。density 删除 `PLUGIN_SCOPE_KEY` /
   `PluginScopeSeam` / `pluginScope` 结构缝，直接 import 内核；
   registry.json density 条目声明 `@jixoai/context-plugin`。
   工程配套：blueprint scene + SVG、site-only.mjs 摘除、mirror manifest
   重生成。
3. **三减法（D3）**：
   - **A** 删 paintSlot 运行时值域守卫与冻结 warn（paint.svelte.ts:164-168）；
     `values` 数组保留为门禁 AST 载体（A4 双向断言不动）。外部旧键写入的
     残余风险由既有 legacy 键退役 census 收口（衔接记录，不在本 change）。
   - **B** `SLOT_REGISTRY` WeakSet 构造期检查降为 `import.meta.env?.DEV`
     条件（vitest 跑在 vite 下 DEV=true，既有防伪测试原样通过）；类型品牌
     保留为生产契约。
   - **C** `isLifecycleOutsideComponentError` 与全部 ambient-skip 降级退役
     （defaults defineAxisSlot 的 try/catch 重入、paint readAmbientVariant
     的 catch、density 的两处 catch、内核 getContextPlugins 的 catch）。
     窗口外 resolve 直接抛 Svelte 原生错误——硬契约（Vue 式 dev-warn 仍需
     谓词检测，与删除目标矛盾，故不取）。r10"两层降级"裁决随本 design
     归档 superseded；Svelte 大版本升级检查单中的谓词条目随之退役。
4. **文档与措辞（D4）**：指南页 plugin 层补"definePlugin 不是组件读取
   context 的路径"明示 + pluginCode 示例更新为 def-target 语法；slot 表
   paintSlot 行与 guards 节 "factory-product registry" 措辞同步；registry.json
   `defaults` item description 的 "WeakSet + symbol / lifecycle predicate"
   措辞更新。
5. **新 living spec（D5）**：`openspec/specs/context-plugin/spec.md`——内核
   至今无自己的 spec（借用 registry/component-authoring 承载），本 change
   创建之。component-authoring 三处措辞同步（#2 runtime-half → dev-only、
   #4 SHALL-degrade → 硬契约、#5/#8 guard/carrier 措辞）；registry
   "two-tier ownership" 的 seam 句与场景改写。

## 不做的事

- 洋葱 hooks 模型（init/filter/before/after + enforce + 排序 + 嵌套根）不动
  ——语义正确、测试完备（context-plugin.spec.ts 9 组 635 行全保留）。
- legacy `BUTTON_GROUP_KEY` 退役（census 门控的既有计划）。
- hue-runtime / highlight context 的升格（site-only 身份保持；highlight 的
  registry 树副本 import 在升格后反而解析更顺，属免费收益）。
- `registry/test` 惰性副本机制治理（双树字节同步惯例延续）。

## Impact

- **内核与轴模块**：context-plugin.svelte.ts（重写类型域与 targets）、
  medium.svelte.ts（MediumState 改 import type + MEDIUM_DEF 改工厂）、
  density.svelte.ts（缝删除）、paint.svelte.ts（守卫删除 + catch 删除）、
  defaults.svelte.ts（谓词删除 + WeakSet dev 化）、hue-runtime.svelte.ts、
  highlight/context.svelte.ts（def 工厂化）。
- **消费者**：print/context-plugin.ts（targets 语法迁移）、+layout.svelte、
  print/print-doc.svelte（medium 注入）。
- **共享文件（编排者统一落盘）**：registry.json（新条目 + density 依赖边 +
  defaults 措辞）、scripts/lib/site-only.mjs、mirror manifest、blueprints
  scene/SVG、三份 spec、指南页。
- **测试**：约 13 个 spec（多数双树副本）的"窗口外 unit resolve"断言迁入
  mount-host harness（同文件先例充分）；删除型：谓词 describe、paint-axis
  三条降级 it、A 的 4 处 warn 断言与消音 mock；新增 spec-d 负探针（谎报
  hooks 类型 / targets 指向 ReadOnlyContextDef / 内联 def 字面量，均为
  编译错误）。
- **行为不变量**：print pin 往返、density→sm、CSS 去重、依赖计数微基准、
  恒等快路径、嵌套根捕获坐标——全部既有断言保留。

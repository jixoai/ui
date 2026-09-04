# Proposal: context-defaults-economy — Defaults 全面覆盖，Compose 对齐的 Context 经济规范化

## Why

Owner 裁决（2026-09-03，ZCode 会话）：最终目的是**通过 Context 技术对
Default 进行全面覆盖**——主题定制与组件组合的地基。「组件独立存在时
什么样式，嵌套进某个父组件时默认什么样式」（Dialog 中的 Button，
r14-2/4/5/7/8 已是在途样板）。

现状：Context 经济已经在运行，但讲**五种方言**——

| 轴 | 通道 | 惯用法 |
|---|---|---|
| density | DENSITY_KEY + 插件缝 | `resolveDensity(e, ctx)` |
| medium | 只读投影 | `getMedium()` |
| hue | runtime adapter | `createHueContext()` |
| button paint | BUTTON_GROUP_KEY zone scope | `variant ?? scope.variant` |
| entity depth | entity.svelte.ts 累积 | `provideEntity()` |

读取散落在各组件的 `??` 链里：ambient 契约**不可见**（没有一处能
回答"这个组件哪些 prop 可被环境管理"）、**不可审计**（无法门禁）、
**不可版本化**（开放一个属性 = 散弹式改动）。

Compose 源码核实的事实（androidx-main Card.kt + MaterialTheme，本
会话逐条验证）：`MaterialTheme` 本体是三个 CompositionLocal 的门面；
每个组件配一个 `<Component>Defaults` 工厂对象，是 ambient 读取点的
**组织层**（词汇表适配器：theme 词汇 → 组件词汇）；`Color.Unspecified`
哨兵 + `takeOrElse` 实现槽级 explicit-wins；`contentColorFor` 式派生
默认；`@Composable` 标注 = 类型级「此函数消费 context」的证据。

jixoai 的对应物全部已存在：Svelte context ≡ CompositionLocal；`??` ≡
takeOrElse；TS 的 `undefined` 免费提供哨兵；setup 窗口 ≡ @Composable
求值时机；kernel 的 getter 背书 env ≡ @ReadOnlyComposable 细粒度失效
（且 $derived 链免掉 Compose 的快照/缓存摇摆）。**缺的只是组织层与
规模**——本变更补齐它。

诚实边界：**v1 双轴收编**（density / paint）进 Defaults 槽；
**三轴保持原机制**（entity-depth / medium / hue——结构与环境轴，
无 per-prop 消费形态，不强行入槽）；elevation 与 shape/radius 落
「轴路线图」附录（开轴协议模板就位，首个真实消费者出现时启用）。

## What Changes

1. **Defaults 约定**：每个注册组件 ship 一个 `XxxDefaults` 对象
   （registry 级、零 kernel import）——该组件 ambient 契约的唯一
   声明处；公开样式 prop 的 fallback 全部收拢进工厂
   （`explicit ?? 轴 ?? 自有默认`）。
2. **工具**：`registry/files/lib/defaults.svelte.ts`——
   `defineComponentDefaults` + 品牌槽类型（模块私有 unique symbol，
   只有工厂能构造）+ `literalSlot`/`absentSlot`，类型推导 `Partial<入参> → 全值
   出参` 拍平嵌套；槽工厂惰性（模块顶层零 context 读取）。前置任
   务：typecheck 载体脚本化（仓内现无）。
3. **开轴**：v1 收编双轴（density / paint）——PAINT_ZONE_KEY 从
   ButtonGroupApi 拆出纯轴 key，双键兼容矩阵 + 原子双写；elevation
   与 shape/radius 落「轴路线图」附录（开轴协议模板就位，首个真实
   消费者出现时启用——零消费者开轴 = 投机通用性）。
4. **覆盖分类**（Owner 裁决成文）：覆盖 = **每个公开样式 prop 必
   有槽**——轴槽（ambient）与 literal 家族槽（literalSlot 的
   own 显式 / absentSlot 的 absent 有语义，均待轴）两类；
   四类版本化分类（轴已开 / literal 待轴 / 路线图 / 永不 ambient），
   门禁断言全分类。ambient 能力随开轴逐步增长。
5. **house rule 升格**：component-authoring living spec 增 Defaults
   契约 requirement；「以后写代码，所有属性自动有这些可管理的能力」
   由规约 + 门禁固化。
6. **门禁**：`verify:context`（scripts/verify-context-coverage.mjs）——Defaults 存在性、槽读取
   合法性（AST 级：槽必须是注册槽工厂调用——类型 brand + 工厂
   产品 WeakSet 双机制，裸函数/字面量/伪造对象编译期与运行时双
   拒）、无游离 `??` 直连链、豁免显式化。
7. **全量迁移**：已注册 86 组件（search-palette 未注册、归属
   search stream 在途，不属本 change）按家族分批（子代理并行）；
   文档全面更新——新指南页「Context & Defaults」、组件页 props
   表标注 ambient 可管理性（meta 链现覆盖 8 页，其余手改）。

## 非目标

- `open`/`bind`、回调、aria/data 属性、`class`、`id` 等实例语义
  prop **永不 ambient**（Compose 同样不 ambient 化 onClick）。
- motion 不开轴（print 冻结走 prepareSnapshot 的既有裁决保持）；
  elevation / shape/radius 落路线图附录（词汇未成熟或零消费者），
  按开轴协议逐步开放。
- 不改 context-plugin kernel：插件干预仍在轴值层，Defaults 不感知
  插件（plugins 不知道组件，Defaults 不知道 plugins）。

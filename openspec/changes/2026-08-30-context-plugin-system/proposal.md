# Proposal: context-plugin-system — Context 的插件干预层 (r2)

## Why

Owner 架构裁决（2026-08-30）：「打印模式控制 Context」不该散落在每个
context 各写一份 medium 判断——引入 **ContextPlugin 系统**：每一个
jixoai-ui Context 对象（density / medium / hue / 未来的任何 context）
都可以被插件控制和干预。参考 vite 插件系统（注册序 + enforce 排序）
与 WebComponent 生命周期；核心技术是 Svelte 响应式：**插件管道 =
不可变值变换的 $derived 组合**（Owner 裁决：先进不可变技术实现
高性能干预，无副作用之忧——插件全是纯函数，值进新值出，context
对象本体永不被触碰）。

r2（codex r1 五阻塞闭合）：类型域/身份落地（ContextDef + targets
matcher + definePlugin 类型收窄）、init 收敛为无环境一次性默认值注入
（否决归可逆的 filter）、raw 唯一可写 + before/after 纯 $derived 投影、
density 入口定于 resolveDensity 终值且不发明 paper 档（映射既有 sm）、
叠加评价坐标定于 provide 时捕获；范围扩至 hue adapter。

## What Changes

1. `lib/context-plugin.svelte.ts`：ContextDef/ContextEnv/ContextPlugin
   类型、definePlugin 类型收窄、sortPlugins（数组序+pre/post 稳定锚、
   同根同名后者覆盖）、provideContextPlugins/getContextPlugins（根级
   provide、provide 时捕获、父先子后）、不可变 applyChain、
   withPlugins（before/after 双链 $derived、零插件恒等短路）。
2. 接线三件（行为零变，恒等路径）：density（resolveDensity 终值过链）、
   medium（只读暴露，插件不可改）、hue adapter（hue-runtime 重构为
   context 背书，DOM stamp 同步不变）。
3. 测试：排序/生命周期/不可变（冻结入参）/嵌套双方向/density 四路
   矩阵/媒介往返/零插件不建链/依赖计数微基准/类型级 targets 拒绝。
4. print 插件本体属 print-pipeline change（首个消费者契约见其接缝节）。

## Impact

新文件 lib/context-plugin.svelte.ts + hue adapter 重构 + density/medium
接线 + 测试。registry 零改动。既有页面行为不变（全量套件回归）。

# Design: context-plugin-system

## 不可变管道（Owner 裁决的实现形态）

每个 context 的暴露值由两层 `$derived` 组合：

```
rawValue（页面/组件写入）
  → beforeChain：ordered plugins 的 before 逐级（filter 通过者）
  → storeValue（链后值，$state 仅存这份）
  → afterChain：ordered plugins 的 after 逐级
  → 暴露给 consumer 的只读投影
```

- 每一级都是 `value => newValue` 的纯函数；禁止原地修改
  （测试冻结入参断言：`Object.freeze` 输入，插件返回新引用）。
- Svelte 细粒度响应：插件链中 `env.medium` 等依赖变化时只重算
  受影响的 context 投影——这就是「高性能干预」的落点，不需要
  额外调度器。
- `'skip'` 否决实现：init 阶段决定，context provider 直接不
  setContext——消费侧 getContext 得 null（与「未提供」同语义）。

## 排序（vite 语义裁剪）

基序 = 注册数组序；`enforce:'pre'` 稳定前移、`'post'` 稳定后移；
同名插件后者覆盖前者（warn）。不做 vite 的 enforce:'normal' 显式
档——数组序即 normal。

## 嵌套叠加

```
provideContextPlugins([A])            // 外根
  provideContextPlugins([B])          // 内根
// 有效链 = sort(A) ++ sort(B)：父先子后
// 「最近根最后作用」= 子根插件能覆盖父根的干预结果
```

这与 density 的显式盖章同构：干预权向内收窄，永不向上泄漏。

## density / medium 接线

- density：现有 `getDensityContext/provideDensity/resolveDensity`
  签名不变；内部 getter 值过链（before: 显式盖章仍最高优先——
  插件链在盖章解析**之后**，即插件看到的是已解析值，可再干预）。
- medium：`getMedium()` 返回值过链（print 插件可把 'print' 下的
  density 需求表达为对别的 context 的干预，而非改 medium 本身）。
- 恒等快速路径：`plugins.length === 0` 时直接短路返回原值，
  零开销（基准：既有全量测试 + 一条微基准 spec 记录短路不建链）。

## 出界（本 change 不做）

print 插件本体、hue/locale 接线、registry 化、跨 iframe 插件、
插件热插拔（提供即固定，Svelte 响应式已覆盖动态值）。

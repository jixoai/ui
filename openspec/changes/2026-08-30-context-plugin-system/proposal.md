# Proposal: context-plugin-system — Context 的插件干预层

## Why

Owner 架构裁决（2026-08-30，打印议题推演而出，独立成层）：
「打印模式控制 Context」不该散落在每个 context 里各写一份
medium 判断——引入 **ContextPlugin 系统**：每一个 jixoai-ui Context
对象（density / medium / hue / locale / 未来的任何 context）都可以
被插件控制和干预。

参考 vite 插件系统（注册序 + enforce 排序）与 WebComponent 生命周期。
核心技术仍是 Svelte 响应式：**插件管道 = 不可变值变换的 $derived 组合**
（Owner 裁决：先进的不可变技术实现高性能干预，无副作用之忧——
插件全是纯函数，值进新值出，context 对象本体永不被触碰）。

## What Changes

### 1. `apps/www/src/lib/context-plugin.svelte.ts`（新，零依赖）

```ts
interface ContextEnv {
  medium: 'screen' | 'sim' | 'print'   // 派生媒介（干预的最大动因）
  root?: HTMLElement                    // 最近插件根
}
interface ContextPlugin<T = unknown> {
  name: string
  enforce?: 'pre' | 'post'              // vite 式排序锚
  init?(def: ContextDef<T>): { defaults?: Partial<T> } | 'skip'
  filter?(def: ContextDef<T>, env: ContextEnv): boolean
  before?(value: T, env: ContextEnv): T   // 值入侧干预（纯、不可变）
  after?(value: T, env: ContextEnv): T    // 值出侧投影（纯、不可变）
}
```

- **排序**：用户数组序为基序，`enforce:'pre'` 前移 / `'post'` 后移，
  稳定排序（vite 语义）。
- **作用域**：`provideContextPlugins(plugins)` 根级 provide；嵌套根
  叠加（父根插件先作用、子根后作用——最近根的干预最后落地）；
  `getContextPlugins()` 就近取全链。模块级零单例（实例隔离法则）。
- **组合**：暴露值 = `$derived(before 链再 after 链地过插件)`——
  纯函数逐级产新值，Svelte 细粒度依赖只重算受影响段。

### 2. 生命周期语义

- `init`：context 初始化时——返回 `{defaults}` 注入/覆盖默认值，
  返回 `'skip'` 否决该 context 实例（不挂载）。
- `filter`：动态门——返回 false 则本插件跳过该 context（如仅
  print 媒介下生效的插件在 screen 返回 false）。
- `before` / `after`：值的双侧干预——before 在 provider 写入后的
  入口链，after 在 consumer 读到的投影链。二者都是不可变变换。

### 3. 既有 context 接线（行为零变）

`density.svelte.ts` 与 `medium.svelte.ts` 的 getter 背书对象路由进
管道：**零插件时走恒等快速路径**（与今日行为逐位一致，全部既有
测试作回归证明）；有插件时过链。hue/locale 等后续 context 按同法
逐个接入（本 change 只接 density + medium 作为承载证明）。

### 4. 第一个真实消费者预演（print 插件占位）

本 change 只落系统与接线；print 插件（density→paper 档、hue→钉
缺省、motion→冻结）属 print-pipeline change——但测试里用合成插件
覆盖全生命周期（inject/skip/filter/before/after/排序/嵌套/不可变）。

## Impact

新文件 `lib/context-plugin.svelte.ts` + 两个 context 的接线改动 +
测试。registry 零改动（site-only 基础层；若未来入 registry 需独立
评审）。所有既有页面行为不变（恒等路径 + 全量测试回归门禁）。

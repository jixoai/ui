# Design: context-plugin-system (r2)

> **SUPERSEDED in part (2026-09-04, reconcile r2)**: the def model
> below is the string-key form (`ContextDef<K extends string, T>` +
> `targets.includes(def.key)`). The shipped kernel
> (`registry/files/lib/context-plugin.svelte.ts`, change
> 2026-09-03-context-plugin-v2) is def-OBJECT identity — branded
> `ContextDef` products, `definePlugin` targets bind def objects,
> matching is SameValueZero identity, never a string comparison
> (spec: openspec/specs/context-plugin/spec.md). The onion hook
> model and env vocabulary below remain the governing intent; only
> the identity mechanism aged out.

r1 评审 codex-plan-review-print-r1.md 五阻塞全闭合；裁决记录标 [r1-n]。

## 类型域与身份 [r1-1]

```ts
interface ContextDef<K extends string, T> {
  readonly key: K              // 稳定身份：'density' | 'medium' | 'hue'
  defaults(): T                // 无插件无 provider 时的初值
  readonly ssrSafe: T          // SSR/无 window 时的值（SSR 初值显式化）
}
interface ContextEnv {         // getter 背书的响应式环境（生产者见下）
  readonly medium: MediumState
  readonly root: HTMLElement | undefined
}
interface PluginHooks<K extends string, T> {
  init?(def: ContextDef<K, T>): (defaults: T) => T   // 完整值 reducer
  filter?(def: ContextDef<K, T>, env: ContextEnv): boolean
  before?(value: T, env: ContextEnv): T
  after?(value: T, env: ContextEnv): T
}
// definePlugin 的产物：targets 冻结为 readonly [K]，构造器私有
// （brand 字段），唯一注册入口 —— key 进泛型，类型级不可伪造
interface DefinedPlugin<K extends string, T> extends PluginHooks<K, T> {
  readonly name: string
  readonly targets: readonly [K]
  readonly enforce?: 'pre' | 'post'
}
type UnknownPlugin = { targets: readonly string[] } & Record<string, unknown>
```

- **异构注册**：根数组元素只接受 `definePlugin` 产物（brand 存在类型）；
  命中判定 `plugin.targets.includes(def.key)`。`K` 进泛型 → density
  插件的 targets 类型即 `readonly ['density']`，注册进 medium 数组
  编译期报错 + 运行时守卫双保险（fixture 双断言）。
- **init 是完整值 reducer**（非 Partial 浅合并）：`(defaults: T) => T`
  —— 标量（density 联合串/medium 串/hue 数值）与对象 context 统一
  可实施；插件序逐个套用，后覆盖先。
- **root 绑定与 SSR**：`provideContextPlugins(plugins, { root })`——
  root 缺省 = 提供组件的宿主元素（bind:this/action 传入）；SSR/无
  元素时 `env.root === undefined`、`env.medium === 'screen'`（显式
  初值，无 window 访问）。env 是 getter 背书对象，进 `$derived`
  依赖图（「只重算受影响段」由此成立，微基准 spec 记录依赖计数）。

## init 语义修正 [r1-2]

`init` = **无环境、一次性、仅默认值注入**——完整值 reducer
`(defaults: T) => T`：插件序逐个套用（上一个输出是下一个输入），
后覆盖先；字符串/数值/对象统一语义，无浅合并。**无 skip**——
否决/资格是可逆的，归 `filter`（响应式）：filter false 时本插件
对该 context 实例整体跳过，context 照常挂载。可逆媒介往返天然成立。

## raw 值所有权 [r1-3]

```
rawValue：provider 写入的唯一可写 $state
exposed = $derived( after 链( before 链( rawValue ) ) )   // 只读投影
```

- **洋葱序（Owner 定案）**：插件按解析序成层，before 外→内、
  after 内→外——`raw → beforeA → beforeB → 值 → afterB → afterA →
  消费者`。before 侧后注册者在上层加工（内层精化外层结果）；
  after 侧先注册者最后定夺（外层收口全部内层投影）。与 WebComponent
  成对生命周期（外挂内拆）同构；嵌套根合成扁平链后同律（父根外层）。
- before/after 全是 `$derived` 段，**结果永不回写 raw**；
- filter 关门 → derived 自动从 raw 重算 → 恢复原始值（身份测试：
  往返后引用等于 raw 引用）；
- 消费者读 exposed 只读 getter（与今日 density getter 契约同形）。

## density 接线点与值域 [r1-4]

- 插件唯一入口 = **`resolveDensity` 的最终结果**（explicit ?? inherited
  ?? fallback 之后）：exposed density = before 链过的 resolved 值。
  盖章优先级不变，插件看到的是已解析值。
- **不发明 paper 档**：print 插件把 density 映射到**既有 `sm` 档**
  （四档法则内）；kernel 侧字号/车道随 @page 上下文再缩放。
- 矩阵测试：explicit / inherited / fallback / 无 opinion × 插件开/关，
  断言 data-density 落点。

## 叠加的评价坐标 [r1-5]

- **链在 context 实例创建（provide）时捕获**（getContextPlugins() 就近
  取，含祖先链）；resolve/get 时不重取——context 对象身份稳定。
- 嵌套：插件根可以在 context provider 外或内；捕获坐标 = provide 时
  就近可见链（父根插件在外层）。两个方向的 fixture（外 provider+
  内插件 / 反向）固化该语义与洋葱两侧的话语权。
- 同名去重：同根内后者覆盖前者（warn）；跨根不去重（父子的同名插件
  叠加作用，序 = 父先子后）。defaults：init reducer 按插件序逐个套用
  （上一个是下一个的输入），后覆盖先——与洋葱 before 同向。

## medium 的值域保护

`medium` def 的 value domain = **只读 MediumState 字符串投影**；
`deriveMedium` 与 `isPrintProjection` 不变量保持——插件对 medium
def **只读**（targets 不接受 'medium'，definePlugin 类型拒绝；
运行时注册守卫）。

## 范围（r2 扩）

接线三件：**density（最终值）+ medium（只读暴露）+ hue adapter**
（hue-runtime 重构为 context 背书：值经 def 暴露、DOM stamp 同步
documentElement —— print 插件「钉缺省」由此可兑现）。
motion 不设 context：打印冻结走 print-pipeline 的
prepareSnapshot（getAnimations pause→clone→resume），不要求
动画拥有者改造。

## 措辞降级 [r1 证据纪律]

「byte-identical / 零开销 / 高性能」全部改为可测合同（含洋葱序的
A/B 双插件执行序断言：beforeA→beforeB→afterB→afterA）：零插件时不建
链（组合函数不被调用的结构断言）+ 全量既有套件作行为回归 +
依赖计数微基准。「1071+」改为「实施时点的既有套件」。

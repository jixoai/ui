# Design: context-plugin-system (r2)

r1 评审 codex-plan-review-print-r1.md 五阻塞全闭合；裁决记录标 [r1-n]。

## 类型域与身份 [r1-1]

```ts
interface ContextDef<T> {
  key: string              // 稳定身份：'density' | 'medium' | 'hue'
  defaults(): T            // 无插件无 provider 时的初值
  ssrSafe: T               // SSR/无 window 时的值（SSR 初值显式化）
}
interface ContextEnv {     // getter 背书的响应式环境（生产者见下）
  readonly medium: MediumState
  readonly root: HTMLElement | undefined
}
interface ContextPlugin<T> {
  name: string
  targets: readonly string[]          // 命中的 def.key 清单（matcher）
  enforce?: 'pre' | 'post'
  init?(def: ContextDef<T>): Partial<T>   // 仅默认值注入，一次性，无环境
  filter?(def: ContextDef<T>, env: ContextEnv): boolean
  before?(value: T, env: ContextEnv): T
  after?(value: T, env: ContextEnv): T
}
```

- **异构注册**：根数组是 `UnknownPlugin`（存在类型），命中判定
  `plugin.targets.includes(def.key)`；注册处提供
  `definePlugin<T>(def: ContextDef<T>, p: Omit<ContextPlugin<T>,'targets'>)`
  把 targets 冻结为 `[def.key]` —— 类型级测试证明 density 插件注册不进
  medium（definePlugin 泛型收窄 + 运行时 targets 断言双保险）。
- **env 生产者**：`env.medium` 由最近 medium context 的 getter 派生
  （SSR = 'screen'）；`env.root` = 最近插件根元素。env 是 getter 背书
  对象，进 `$derived` 依赖图（「只重算受影响段」由此成立，微基准
  spec 记录依赖计数）。

## init 语义修正 [r1-2]

`init` = **无环境、一次性、仅默认值注入**（返回 Partial 并入 defaults，
后注册覆盖先注册）。**无 skip**——否决/资格是可逆的，归 `filter`
（响应式）：filter false 时本插件对该 context 实例整体跳过，context
照常挂载。可逆媒介往返由此天然成立。

## raw 值所有权 [r1-3]

```
rawValue：provider 写入的唯一可写 $state
exposed = $derived( after 链( before 链( rawValue ) ) )   // 只读投影
```

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
  就近可见链。两个方向的 fixture（外 provider+内插件 / 反向）固化
  该语义。
- 同名去重：同根内后者覆盖前者（warn）；跨根不去重（父子的同名插件
  叠加作用，序 = 父先子后）。defaults 合并：init 返回值按插件序逐个
  浅合并，后覆盖先。

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

「byte-identical / 零开销 / 高性能」全部改为可测合同：零插件时不建
链（组合函数不被调用的结构断言）+ 全量既有套件作行为回归 +
依赖计数微基准。「1071+」改为「实施时点的既有套件」。

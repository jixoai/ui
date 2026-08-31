# Verification: context-plugin-system (r2)

## Unit（vitest）

- 类型域：definePlugin targets 收窄 + 'medium' 拒绝（编译期 fixture
  与运行时守卫）。
- A/B 洋葱执行序：双插件调用日志 === beforeA→beforeB→afterB→afterA
  （同根 + 父/子根合成两个 fixture）。
- 生命周期矩阵：init 完整值 reducer（字符串/数值/对象三类）；filter 媒介门可逆
  （screen→sim→print→sim→screen 全往返，值与引用精确回弹）；
  before/after 冻结入参新值出；raw 不被回写。
- 叠加：双方向嵌套 fixture（链 = provide 时捕获）；同根同名覆盖、
  跨根叠加父先子后。
- density 四路矩阵；hue adapter 挂钟与 DOM stamp 行为不变。
- 恒等：零插件不建链（结构断言）+ env 依赖计数微基准。

## 门禁

- verify:all 全绿；既有套件（实施时点的全量数）零回归即行为不变
  证明；lib/context-plugin.svelte.ts 零 npm 依赖。

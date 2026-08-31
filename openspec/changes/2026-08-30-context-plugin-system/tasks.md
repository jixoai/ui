# Tasks: context-plugin-system (r2)

## 1. 内核 [P]

- [ ] 1.1 `lib/context-plugin.svelte.ts`：ContextDef/ContextEnv/
      ContextPlugin 类型 + definePlugin 类型收窄（targets 冻结为
      def.key；'medium' 目标类型拒绝）；sortPlugins（数组序+pre/post
      稳定锚、同根同名后者覆盖 warn）；provideContextPlugins/
      getContextPlugins（根级 provide、context 创建时捕获链、
      父先子后）；applyChain 纯函数 + withPlugins 双链 $derived、
      零插件恒等短路（不建链结构断言）。
- [ ] 1.2 env 生产者：medium getter 派生（SSR 'screen'）、root 元素。

## 2. 接线（行为零变）[P]

- [ ] 2.1 density：resolveDensity 终值过链；四路矩阵
      （explicit/inherited/fallback/无 opinion × 插件开关）断言
      data-density 落点。
- [ ] 2.2 medium：只读暴露（targets 拒绝的运行时守卫测试）。
- [ ] 2.3 hue adapter：hue-runtime 重构 context 背书（挂钟/写
      documentElement 行为不变，值经 def 暴露）。

## 3. 测试 [P]

- [ ] 3.1 排序：数组序/pre/post 稳定/同名覆盖（同根+跨根叠加）+
      A/B 洋葱执行序断言（调用日志精确等于 beforeA→beforeB→
      afterB→afterA；同根与父/子根合成两个 fixture）。
- [ ] 3.2 生命周期：init 完整值 reducer（字符串/数值/对象三类 fixture）、
      filter 媒介门可逆（screen→sim→print→sim→screen 往返）。
- [ ] 3.3 不可变：冻结入参新值出、raw 永不被链回写（往返后引用
      === raw 引用）。
- [ ] 3.4 嵌套双方向 fixture（外 provider+内插件 / 反向；链 =
      provide 时捕获）。
- [ ] 3.5 恒等+性能：零插件不建链；env 依赖计数微基准（medium 变
      只重算受影响 context）。
- [ ] 3.6 类型级：density 插件注册不进 medium（编译期+运行时双断言）。

## 4. 集成 [I]

- [ ] 4.1 manifest SITE_ONLY（context-plugin.svelte.ts、hue adapter）。
- [ ] 4.2 verify:all 全绿（既有套件零回归 = 行为不变证明）。

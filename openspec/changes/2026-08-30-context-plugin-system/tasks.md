# Tasks: context-plugin-system

## 1. 内核 [P]

- [ ] 1.1 `lib/context-plugin.svelte.ts`：类型（Plugin/Def/Env）、
      `sortPlugins`（数组序 + pre/post 稳定锚）、
      `provideContextPlugins` / `getContextPlugins`（根级 provide、
      嵌套叠加父先子后）、`applyChain`（不可变纯函数链）。
- [ ] 1.2 `withPlugins(value, def)` 组合助手：before 入口链 +
      after 投影链的 $derived 组合；零插件恒等短路。

## 2. context 接线（行为零变）[P]

- [ ] 2.1 density.svelte.ts：getter 值过链（盖章解析之后）；
      恒等路径证明。
- [ ] 2.2 medium.svelte.ts：getMedium 投影过链。

## 3. 测试 [P]

- [ ] 3.1 排序：数组序、pre/post 稳定移动、同名覆盖。
- [ ] 3.2 生命周期：init 注入默认 / skip 否决（消费侧得 null）、
      filter 动态门（medium 驱动）、before/after 双侧。
- [ ] 3.3 不可变：冻结入参断言（插件不得原地改）、链值逐级新引用。
- [ ] 3.4 嵌套：父先子后、最近根最后作用。
- [ ] 3.5 恒等：零插件下 density/medium 全行为与今日一致
      （既有测试全量绿即证）+ 短路不建链的微基准 spec。

## 4. 集成 [I]

- [ ] 4.1 manifest SITE_ONLY 前缀（context-plugin.svelte.ts）。
- [ ] 4.2 verify:all 全绿。

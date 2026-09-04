# Verification: context-defaults-economy

## 工具层

- 类型级（载体固定：`vitest --typecheck`，fixture 仓内
  `apps/www/test/defaults-types.spec-d.ts` [X2-9]）：入参 Partial、
  未声明槽 excess property 编译期报错；负断言——裸函数、裸字
  面量、伪造 brand 对象、**literalSlot(null)**、**无类型实参的
  literalSlot('auto') 与 paintSlot('tonal')（NoInfer+never 默认
  →编译错，tsc 已实证）**均编译失败；**有类型实参但缺 values 的
  paintSlot<X>('own') 专项负探针（二参规则的独立归因）**；literalSlot 出参无
  undefined、absentSlot 出参含 undefined；**家族窄 union 实证：
  paintSlot<BadgeVariant> 下 resolve({variant:'link'}) 编译错**；
  densitySlot 出参 `Density | undefined`；null 传入编译期拒绝。
- 运行时：identity、哨兵 undefined、浅冻结；**运行时 WeakSet 三 fixture**（跨模块合法轴槽经
  defineAxisSlot 登记通过 / cast-forged 拒绝 / marker-复制槽
  拒绝）**+ AST 边界反例**（ui 侧 import defineAxisSlot 被门禁
  拒绝）[X3-1/X6-7]。
- 惰性律四态：模块加载（零调用）/ SSR / 纯单测（ambient-skip
  降级，own 仍解析）/ 组件 $derived（正常）；**谓词判别**
  [X3-2/r10]——`isLifecycleOutsideComponentError` 匹配 Svelte 5.55
  三形态（dev 多行 / prod URL 前缀 / 裸串，归一化后比对 code；实装
  5.56.9 活体复核三形态未变——整合缝对抗预审探针，2026-09-03）；
  其它 code 与非 Error 一律不匹配；轴内自定义 throw 在旧直调与
  新槽双路径上抛（负 fixture）。
- 快路径：依赖计数微基准——ambient 不变时 resolve 所在 $derived
  不重算。

## 轴

- paint 五态矩阵 [X2-6]：old-only / new-only / dual / nested-
  mixed / external-old-only provider（读取侧新键优先、旧键兜
  底、再 own）；**orientation/separator 不退化断言**（helper 只
  写新键，旧 payload 由 UI provider 自持 [X3-6]）；r14-10
  effective-variant 行为保持；**双键反应性**（父级 variant 翻转
  → 两键消费者同帧重派生 [X4-5]）；**zone 值域闭合**——
  `providePaintZone` 传 'link' 编译错（负类型探针 [X4-新发现]）；
  **家族外 ambient 值落 own + 冻结 warn**（undefined 不触发）；
  **values 双向断言**（漏值/多值 fixture）；**继承 link 收窄**
  （external-old-link + dual-provider 负 fixture）。
- density 三态回归（无 provider→family own 或 undefined / 显式 /
  父 provider）；table 'sm'、ghostty-term 'default' 迁移后行为
  等旧；no-opinion 不盖章 fleet-law 断言保留；既有 density 套
  件全绿。
- elevation/shape：无轴实施——仅 design 附录协议（无测试义务）。

## 门禁

- fixture 自测（八反例 [X3-7/X3-5]）：合法迁移件通过；缺
  Defaults / 裸函数槽 / 游离旧链 / **空调用仅限裸
  ExpressionStatement（赋值·return·展开·模板使用四形态接受，
  逐形态 fixture）** / 家族 union 越界含 link / lib→ui import /
  ui 侧 import defineAxisSlot / **provider 文件内两类子树外
  直读（事件处理器/模板/普通语句）** 各自失败。
- kind:`provider` 只豁免两类子树（provider 实参子树 +
  $derived 初始化子树）内的旧 helper；Defaults 存在
  性/覆盖/resolve presence 对 provider 文件照常检查；结构
  provider 与家族状态 context 不误伤。
- 豁免白名单（$bindable、转发型）生效；`--scope=pilot` 子集正确。
- 3.5 后进 verify:all 全量绿（`verify:context` 位于
  `verify:mirror` 之后）。

## 全量

- 既有全量 vitest 零回归（迁移是读取收拢，行为不变证明）。
- verify:all（laws/mirror/budgets/parity/docs/…）全绿。
- 抽样 computed 探针：dialog 内按钮 ghost 继承、显式 fill 覆盖
  （Chromium 实测一对）。

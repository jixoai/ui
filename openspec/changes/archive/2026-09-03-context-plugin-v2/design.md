# Design: context-plugin-v2 (r3)

r1 对抗审查（/tmp/cp2-adversarial-r1.md，0 阻塞 / 8 应修）已全部消化，
裁决记录标 [A-n] / [建-n]；[C-n] 为审查证伪的预设疑点，不改动。
r2 codex 复核（/tmp/codex-cp2-review.md，REVISE 6.5：2 阻塞 / 6 应修）
已消化：[B1] 工厂入参品牌循环、[B2] 递归安装语义、[S1]-[S5] 如标注；
[S6]（entity 措辞）经核为陈旧信息——当前 delta 已是 "density/entity
precedent"，不改动。

裁决按 D1–D6 编号；签名冻结到可实施粒度。三路探索的行级证据见
proposal.md；本设计是对它们的回答。

## D1 — def 身份化：匹配从字符串改为对象恒等

```ts
// —— 类型域（内核）——
/** [B1] 工厂入参形态：无品牌——品牌由工厂盖章，入参不可能预置
 *  （r2 把品牌设为 ContextDef 必填字段又让工厂吃 ContextDef，
 *  循环矛盾，作者无法构造入参） */
export interface ContextDefInit<K extends string, T> {
  readonly key: K;              // 诊断身份（报错/门禁词汇），不参与匹配
  defaults(): T;
  readonly ssrSafe: T;
}
declare const defBrand: unique symbol;
export interface ContextDef<K extends string, T> extends ContextDefInit<K, T> {
  readonly [defBrand]: true;    // [A7] 类型品牌在返回接口：内联字面量 def
                                // （忘 import DENSITY_DEF 的作者）即刻编译
                                // 错误——"静默死 target"与 D1 自身目标相抵
                                // 触，品牌不是 WeakSet，成本一个 declare-const
}

/** 从 def 引用提取值类型 —— hooks 类型的唯一来源 */
export type DefValue<D> = D extends ContextDef<string, infer T> ? T : never;

/** 只读域 def（medium）：定义得出来，但 targets 类型层拒绝 */
export interface ReadOnlyContextDef<K extends string, T> extends ContextDef<K, T> {
  readonly readOnly: true;
}
const READ_ONLY: WeakSet<object> = new WeakSet();
// [A7] 保留 WeakSet 而非只用 readOnly 标记字段：标记可被 spread 偷走
// （误拒方向、无害），WeakSet 身份判定与 slot 双守卫同词汇、更强

// 入参是 ContextDefInit；冻结原对象、盖章、返回（不复制：恒等匹配要求
// def 与其引用是同一对象）
export function defineContextDef<K extends string, T>(def: ContextDefInit<K, T>): ContextDef<K, T>;
export function defineReadOnlyContextDef<K extends string, T>(
  def: ContextDefInit<K, T>,
): ReadOnlyContextDef<K, T>;
```

- **[S1] def 注解纪律**：迁移处一律以工厂返回类型注解——
  `DENSITY_DEF: ContextDef<'density', Density | undefined>`、
  `MEDIUM_DEF: ReadOnlyContextDef<'medium', MediumState>`——禁止宽化为
  无品牌/无标记注解（会擦掉 ReadOnlyContextDef 条件分支，definePlugin
  的类型拒绝失效）。
- **匹配恒等**：收集 targeting 改 `plugin.targets.includes(def)`
  （SameValueZero 对象恒等）。`def.key` 只用于报错消息与诊断暴露。
- **[A1附带/A6] def 参数签名冻结**：`applyChain(def: ContextDef<string,
  unknown>, …)`、`PluginScope.apply(def: ContextDef<string, unknown>, …)`、
  `withPlugins` 的 def 形参、`PluginPipeline.def` 同为
  `ContextDef<string, unknown>`（结构可赋值，不重开字符串匹配）；
  `UnknownPlugin` 的 targets 同步重构为
  `{ readonly targets: readonly ContextDef<string, unknown>[] } &
  Record<string, unknown>`。
- **[A1] apply 侧值域豁口**：optional-opinion 轴的 def 值类型携带完整
  解析域——`DENSITY_DEF: ContextDef<'density', Density | undefined>`
  （`defaults: (): Density | undefined => DEFAULT_DENSITY` 协变兼容）。
  由此 hooks 自然书写为 `(v: Density | undefined) => …`，与现有
  printDensityPlugin 的加宽入参声明（print/context-plugin.ts:51-54）统一；
  hue（number，无 undefined 流）不受影响。类型域谎言的最后一个藏身处
  （apply 调用侧泛型）随之关闭。
- **targets 单元素法则保持**（print/context-plugin.ts 头注的 identity
  law）：`readonly [D]` 单键元组，一个插件一个 def。

```ts
// —— definePlugin 新签名（谎报 T 的漏洞在此关闭）——
export function definePlugin<const D extends ContextDef<string, unknown>>(
  spec: PluginSpec<D> &
    (D extends ReadOnlyContextDef<string, unknown>
      ? { readonly targets: MediumTargetRejected }
      : unknown),
): DefinedPlugin<D>;

export interface PluginSpec<D extends ContextDef<string, unknown>> {
  readonly name: string;
  readonly targets: readonly [D];
  readonly enforce?: 'pre' | 'post';
  init?(def: D): (defaults: DefValue<D>) => DefValue<D>;
  filter?(def: D, env: ContextEnv): boolean;
  before?(value: DefValue<D>, env: ContextEnv): DefValue<D>;
  after?(value: DefValue<D>, env: ContextEnv): DefValue<D>;
}

export interface DefinedPlugin<D extends ContextDef<string, unknown> = ContextDef<string, unknown>>
  extends Omit<PluginSpec<D>, 'targets'> {
  readonly targets: readonly [D];
  readonly [defined]: true;    // 品牌不变
}
```

- T 不再是独立泛型参数：`before` 的入参类型**只能**来自 targets 里那个
  def——`(v: WrongType) => …` 直接编译错误。新增 spec-d 负探针钉死。
- medium 拒绝从 `K extends 'medium'` 字面量条件改为 `D extends
  ReadOnlyContextDef` 结构条件——字面量散弹退场，只剩一个类型标记 +
  `READ_ONLY.has(target)` 运行时双保险（definePlugin 与
  provideContextPlugins 各查一次，行为同今）。
- **PLUGIN_SCOPE_KEY 私有化**：`const PLUGIN_SCOPE_KEY = Symbol(…)`（模块
  内，不再 export，`Symbol.for` 退役）。density 走直接 import 后无人需要
  这个键；boom fixture（density-plugin-boom-host 直接 setContext 全局符号
  注入假 scope）随缝退役，错误传播改为真路径 fixture：`provideContextPlugins`
  挂一个 `before` 抛错的真 definePlugin 产品，断言错误穿过
  `resolveDensity` 传播（语义等价、路径更真）。
- **[A6] 测试迁移机制写死**（不是"把字符串换成对象"）：spec 内 8 处内联
  def 字面量（:199/230/247/268/296/314/337/342）在恒等匹配下与插件
  targets **永不相等** → 洋葱/init 断言全体静默哑火——必须收敛为文件级
  共享 `const PROBE_DEF = defineContextDef(…)`；两条 medium 伪造 it
  （:105-112 cast / :130-136 spread 偷品牌）改用真 `MEDIUM_DEF` 对象触发
  READ_ONLY（字符串 'medium' 不在 WeakSet，原样必挂）；"getContextPlugins
  窗口外 undefined"（:350-352）改为无根 host 断言。

## D2 — 内核升格 registry:lib + medium 解耦

- 文件落位 `registry/files/lib/context-plugin.svelte.ts`，镜像路径不变
  （apps/www/src/lib/context-plugin.svelte.ts），site 侧全部 import 零改动。
  **第一个含 runes 的 registry:lib 项**（$state.raw/$derived 依赖 .svelte.ts
  后缀，已满足；消费方 Svelte 5 前提与组件项一致）。
- **medium 解耦**（消除 lib 项对 site-only 文件的 import）：

```ts
// MediumState 移入内核（env 词汇表归内核所有）
export type MediumState = 'screen' | 'sim' | 'print';

export interface PluginRootOptions {
  root?: HTMLElement;
  /** 最近 medium provider 的 getter，调用方注入（内核不再 import
   *  medium 模块）。缺省/返回 undefined → 'screen'（显式 SSR 初值） */
  medium?: () => MediumState | undefined;
}
// env.medium getter: options.medium ? options.medium() ?? 'screen' : 'screen'
```

  - **[A2] 调用方捕获一次（窗口内 init 时拿 context 对象，闭包只读属性）**——
    不是 `() => getMedium()?.medium`（那会把每次 env.medium 读取变成一次
    getContext 调用：Svelte 5.56.9 的 reaction.ctx 恢复让它不炸 [C1]，但
    语义从 provide 时漂移到读取时，且押在未文档化内部行为上）：
    - print-doc.svelte：复用 L55 既有变量
      `provideContextPlugins(printPlugins, { medium: () => medium?.medium })`
    - +layout.svelte：`const medium = provideMedium(…)` 一行捕获后同形注入
    - [A3] 两个测试 fixture 同步注入：context-plugin-medium-host.svelte
      （sim/print 往返全靠这个 env）与 hue-pin-host.svelte（hue pin 靠
      env.medium）——不注入则 env.medium 永远 'screen'、测试静默失真。
  - medium.svelte.ts：`export type { MediumState } from './context-plugin.svelte'`
    反向 re-export（site→lib 方向合法，既有消费方零改动）；
    `MEDIUM_DEF = defineReadOnlyContextDef({ key: 'medium', … })`。
- **density 缝删除**（[建1] import 路径 `'./context-plugin.svelte'` 在两棵
  树同相对位置解析——registry 侧为新建内核、www 侧为镜像，安装完整性由
  registryDependencies 声明闭环）：

```ts
import { getContextPlugins, defineContextDef } from './context-plugin.svelte';

// [A1] 值类型携带完整解析域（无意见态进 def 域，hooks 与 apply 两侧同真）
export const DENSITY_DEF: ContextDef<'density', Density | undefined> = defineContextDef({
  key: 'density',
  defaults: (): Density | undefined => DEFAULT_DENSITY,
  ssrSafe: DEFAULT_DENSITY,
});
// resolveDensity 末段：
const scope = getContextPlugins();   // 无 try/catch（D3-C）
if (scope === undefined) return resolved;
return scope.apply(DENSITY_DEF, resolved);
```

  `PLUGIN_SCOPE_KEY` / `PluginScopeSeam` / `pluginScope`（density.svelte.ts
  :35-66 整段）删除；文件头注释的 seam 论述改写为直接 import 事实。
- **registry 工程清单**（先例：defaults/paint/command-match）：
  registry.json 新条目 `context-plugin`（registry:lib，meta group engines，
  files: registry/files/lib/context-plugin.svelte.ts → @lib/
  context-plugin.svelte.ts）；density 条目 registryDependencies 增
  `@jixoai/context-plugin`（paint/defaults 不直接依赖内核）。**[B2]
  递归安装语义（诚实版）**：press-button 真实声明 `@jixoai/density`
  （registry.json 实测——densitySlot 就住在 density 模块），density 又将
  依赖内核，因此"安装 press-button 不下载内核"不再成立——正确的表述是：
  **defaults 与 paint 保持内核无关（直接依赖面）；内核经 density 传递性
  到达（每个 density 消费者都附带获得可安装的插件经济）**。registry
  spec 场景相应改写；verify-deps 断言 density 边。verify:context A4/A5
  预期零改动（内核不 import ui、无 slot 工厂；A5 的 lib→ui 断言与
  density→context-plugin 的 lib→lib 边无冲突）。配套资产（依赖传递
  闭环）：scenes/context-plugin.svelte（零 import
  静态图：defs → 按引用 target 的插件 → 洋葱 → exposed）+ build:blueprints
  产 SVG 一并提交；site-only.mjs 摘除内核行（medium/hue/print 保持）；
  manifest 重生成。
- hue-runtime（site-only 保持）：`HUE_DEF = defineContextDef(…)`；highlight
  context（registry 树 unreferencedLib 保持）：`HIGHLIGHT_DEF =
  defineContextDef(…)`——其 `import '../context-plugin.svelte'` 在 registry
  树内自此解析为真内核（免费收益）。

## D3 — 三减法

### A — paintSlot 值域守卫退役

- 删 paint.svelte.ts:164-168（`values.includes` 检查 + 冻结 warn + 回落
  own）；slot 语义收为 `explicit ?? ambient ?? own`，ambient 信任 zone 的
  类型域（ZonePaintVariant 在 provider 端编译期收窄）。
- `values` 参数**保留**——它是门禁 A4 的 AST 载体（family union ≡ 冻结表
  双向断言）与类型窄化的 satisfies 锚，运行时不再消费。
- 残余风险与支持政策 [S4]：外部旧键（BUTTON_GROUP_KEY）写入属**过渡兼容
  面，不受支持**——越界值（含 'link'）沿 legacy fallback 原样通过，不
  收窄、不告警、不承诺渲染语义（Compose 式信任类型）；external-old-link
  fixture 保留（它断言的是 PressButton 对 legacy 键的兼容结果，不是守卫
  存在）。legacy 键退役 census（既有计划）把这条写路径收为零。spec #5/#8
  措辞同步。
- 测试：删 4 处 warn 断言（paint-axis :137-146/:195-200、overlays :141-149、
  kbd-badge-chip :136-141、w4 :129-134）与全部 FROZEN_WARN 消音 mock；
  "zone ghost 下 Badge 走 own"语义断言改为"zone 类型域已排除该形态"
  的说明性删除（ZonePaintVariant 在 provider 端就进不来）。

### B — WeakSet 防伪降 dev-only

```ts
if (import.meta.env?.DEV) {
  for (const key of Object.keys(slots)) {
    if (!SLOT_REGISTRY.has(slots[key])) throw new Error('[defaults] slots accept factory products only');
  }
}
```

- 生产路径零检查；类型品牌（unique symbol）是生产契约。vitest 跑在 vite
  下 DEV=true——defaults.spec.ts 三个防伪 it **原样通过**，仅注释更新。
- 非 vite 环境 `import.meta.env` 为 undefined → 可选链跳过，零负担
  [建5：仓内 item 级先例 popover.svelte:176/183（含 registry 镜像）已运行
  `import.meta.env.DEV`；类型面 vite-env.d.ts 覆盖——消费面契约本就是
  vite/svelte 应用，先例把 B 从"新惯例"变成"循例"]。
- spec #2 措辞："verify the brand at runtime" → "at runtime in dev"。

### C — 谓词与 ambient-skip 退役（硬窗口契约）

- 删除面：`isLifecycleOutsideComponentError`（defaults.svelte.ts:69-81，含
  export）、defineAxisSlot 的 try/catch 重入（:112-122）、paint
  readAmbientVariant 的 catch（:110-113）、density pluginScope/ambientDensity
  的 catch、内核 getContextPlugins 的 catch（:305-311）、**[A5] highlight
  getHighlightContext 的第五处 catch**（highlight/context.svelte.ts:92-100，
  www 与 registry 双树——留着则新 spec R8 "anywhere on the path" 自违反；
  code-card 的无 provider unit 断言随之迁 host，宿主先例
  code-card-backend-host.svelte 已在）。
- 新契约：窗口外 resolve / getContextPlugins 抛 Svelte 原生
  `lifecycle_outside_component`——不捕获、不归一化、不消息匹配。Vue 式
  dev-warn 方案被否：检测本身就需要谓词，与删除目标矛盾。
- **测试迁移**（成本已逐文件盘清，约 13 spec × 双树）：各"unit resolve
  outside window"断言迁入 mount-host；新增通用 fixture
  `unit-resolve-host.svelte`（props: `compute: () => T`、`onvalue`，$derived
  内求值回传），各 suite 复用或沿用同文件既有 host 先例。删除型：谓词
  describe（defaults.spec.ts:171-205）、paint-axis 三条降级 it、
  context-plugin "无根纯恒等"it（:477-484）与 density-context 两条窗口外
  it 改 host。spec #4 的 SHALL-degrade 句与 Scenario 1 改写。
- 归档衔接：r10 裁决（dev 多行/prod URL/裸串三形态归一化）、impl-B1 的
  URL+多行分支修复、"两层降级"分工——全部随本 change superseded，谓词
  从 Svelte 大版本升级检查单退役。

## D4 — 文档补课（误会的根）

- 指南页 consumer 节 pluginCode 更新为 def-target 语法（`targets:
  [DENSITY_DEF]`），并在 plugin 卡片加一段明示：**definePlugin 不是组件
  读取 context 的路径**——组件作者永远不 import 内核；插件只干预轴值，
  组件与 Defaults 对此无感知（三防火墙图的文字落点）。
- slot 表 paintSlot 行：删 "the values array is the runtime guard (…)"
  尾注 → "the values array is the gate's availability carrier"。
- guards 节 "a module-private type brand plus a factory-product registry …
  at compile time AND at runtime" → "…at compile time, and at runtime in
  dev"。
- registry.json `defaults` item description："branded slots (WeakSet +
  symbol) … and the lifecycle predicate" → "branded slots (dev-only
  runtime guard)"; build 后 public/r/*.json 随站点构建再生。

## D5 — 新 living spec：context-plugin

内核至今无 spec（借 registry/component-authoring 承载）。创建
`openspec/specs/context-plugin/spec.md`，八条 requirement：
R1 defs are identity objects（defineContextDef/恒等匹配/key 仅诊断）；
R2 plugin targets bind a def at the type level（hooks 类型来自 def；单
target 法则；谎报=编译错误）；R3 the medium def is read-only（标记 + 双
保险）；R4 the onion law and the identity fast path（init 一次性、before
正序、after 逆序、filter 可逆、零 targeting 恒等、raw 永不回写）；
R5 roots are scoped and stack（父先子后、一次组合冻结、同根同名后覆盖、
无模块单例）；R6 the kernel is a zero-npm-dependency registry:lib item
（仅 import svelte；density 显式依赖；paint/defaults 不依赖）；R7 env is
injected（medium getter 注入、root、SSR 显式初值、内核不 import 任何
provider）；R8 resolution happens inside the component window（硬契约，
原生错误透传，无消息匹配）。
同步 MODIFIED：component-authoring #2/#4/#5 + variant-grammar（D3 措辞）；
registry "two-tier ownership"（seam 句改写、kernel 升格、场景补 density
拉入内核）。

## D6 — 执行与门禁

- COMPACT 工作流，接续 feat/context-defaults-economy 分支叠加提交；共享
  文件（registry.json / site-only.mjs / manifest / spec 三份 / 指南页 /
  verify-all）由编排者落盘，子代理只改自己批次。
- 波次：W1 内核 v2 + medium/hue/highlight/print 消费端迁移（**[建2]
  2.1–2.5 原子合入**——内核 catch 删除与测试迁移分批落盘会中间红）；W2 轴
  模块缝删除 + 三减法 + 测试迁移（多数双树字节同步，cmp 验证；density-
  context / density-adoption-menus 为单树 [建3]）；W3 registry 化 +
  scene/SVG + 文档 + spec 落盘。
- 门禁序：verify:context（预期零配置改动）→ verify:mirror（重生成）→
  verify-deps（density 边）→ blueprints → 目标套件（context-plugin/
  defaults*/paint-axis/density*/print-plugin）→ 全量 vitest 串行。
- codex 两轮：change 文档复核（施工前）+ 实现复核（评分闭环）。

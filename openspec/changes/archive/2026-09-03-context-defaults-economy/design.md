# Design: context-defaults-economy (r8)

> r1 对抗预审 8 阻塞闭合 [B-n]/[N-n]；r2 经 codex 复核（REVISE
> 5.0）r3 消化 11 阻塞 [X-n]；r4 消化二轮（REVISE 6.0）[X2-n]；
> r5 消化三轮（REVISE 6.2）[X3-n]；r6 消化四轮（REVISE 6.3）
> [X4-n]；r7 消化五轮（REVISE 6.5）[X5-n]；r8 消化六轮
> （REVISE 6.6）[X6-n]——defineAxisSlot 完整签名、
> ZonePaintVariant 值域、provider 继承 link 合同、warn 冻结、
> roadmap 门禁载体、全载体同步。

## 定位 — Defaults 是 Context 读取点的组织层，不是新地基

```
plugins（print 等横切干预）      ← kernel 不感知组件，只作用于轴值
   ↓
axes（少数结构化轴）
   density │ paint            ← v1 收编双轴 [X-10]
   entity-depth │ medium(只读) │ hue   ← 保持原机制
   ↓ 读取（消费者侧唯一读取点）
<Component>Defaults 工厂         ← 本变更主角：每家族一个，命名契约
   ↓ 投影
resolved prop 组（全值、类型推导、getter 背书）
   ↓ 被覆盖
组件显式 props（省略 → 才走工厂）
```

Compose 事实链（androidx-main Card.kt 源码核实）：

```
Card(colors=X) → cardColors(containerColor=Red?)    组级替换
  → MaterialTheme.colorScheme.defaultCardColors     @Composable 求值
    → LocalColorScheme.current                      ★ CompositionLocal
  → .copy() + takeOrElse{...}                       槽级合并
```

四条裁决（源码 → jixoai 翻译）：

- **哨兵**：TS 的 `undefined` 免费提供哨兵。**null 不是哨兵**——
  槽类型 `(explicit: T | undefined) => T` 在编译期拒绝 null 传入
  [X-建议]。
- **快照 vs 间接**：槽工厂存 getter 闭包、不存快照——$derived 链
  让轴翻转自动重投影。
- **派生槽**：jx token 对（`--jx-fill-ink`）已在 CSS 层派生，v1
  不做跨槽派生。
- **求值窗口**：@Composable ≡ setup 窗口；Svelte 运行时在
  `update_reaction` 中 `set_component_context(reaction.ctx)`——
  derived 重算携带创建时的组件 ctx（「$derived 内 getContext 合法」
  的机制保证）。

## 覆盖分类 — 「全部公开样式 prop 可管理」的准确形状 [X-3]

Owner 裁决成文（2026-09-03）：**覆盖 = 每个公开样式 prop 必有槽**。
槽分两类：**轴槽**（ambient=true）与 **literal 家族槽**
（ambient=false——`literalSlot`（own 显式声明）与 `absentSlot`
（absent 有语义，出参含 undefined），进契约可审计）。ambient 能力随开轴**逐步增长**
（「形成标准再逐步开放」）。四类分类，版本化、可门禁：

| 类 | 含义 | 例 |
|---|---|---|
| a 轴已开 | 轴槽 | density、paint |
| b literal 待轴 | 有 own、无轴 | Dialog surface variant、size 类 |
| c 轴路线图 | 词汇未成熟/零消费者 | elevation、shape/radius（附录协议） |
| d 永不 ambient | 实例语义 | open/bind、回调、aria、class、id、bindable 状态样式（component-canvas） |

门禁断言的是**全分类**（每个样式 prop 属于 a/b/d 之一并落槽；c 类
在路线图登记），不要求都是轴槽——这同时满足 Owner 的全面覆盖目标
与「不发明投机轴」的工程纪律。

## 工具 API — 品牌槽 + 类型推导拍平嵌套 [X-1]

```ts
// registry/files/lib/defaults.svelte.ts —— 纯组合，零 context 读取
declare const jxSlot: unique symbol;        // 模块私有品牌（kernel BRAND 同款惯用）
const SLOT_BRAND = Symbol('jx-defaults-slot') as typeof jxSlot;

export interface DefaultsSlot<T> {
  (explicit: T | undefined): T;
  readonly [jxSlot]: 'defaults-slot';       // 只有本模块工厂能构造
}

/** identity 槽族——**NoInfer + never 默认（真·强制）[X3-3/X3-4]**
 *  （TS ≥ 5.4；tsc 严格模式实证 exit=0、五负探针全消耗——含
 *  「NoInfer 无推断位点实际落 never 而非声明默认」的行为确认）：
 *  own 不参与推断，无显式实参 → T 落 never → 编译错；
 *  T extends {} 排除 nullish。absent 形态独立成 absentSlot，
 *  避开重载解析歧义。
 *  literalSlot<SurfaceVariant>('auto') → 出参 SurfaceVariant
 *  absentSlot<SurfaceVariant>()        → 出参 SurfaceVariant | undefined */
export function literalSlot<T extends {} = never>(own: NoInfer<T>): DefaultsSlot<T>;
export function absentSlot<T extends {}>(): DefaultsSlot<T | undefined>;

/** 惰性轴槽工厂的产物同形：捕获 own，不触 context（见惰性律） */
export function densitySlot(own?: Density): DefaultsSlot<Density | undefined>;

/** paint 轴的值域归轴所有：union 定义在 lib/paint.svelte.ts，
 *  press-button 的 PressButtonVariant 变为别名再导出——杜绝
 *  lib→ui 反向依赖 [F3]。
 *  **= never 默认 + NoInfer [X3-3，tsc 实证]**：省略类型实参 →
 *  T 落 never → 编译错（真·强制，F7 收窄 footgun 根源消除）；
 *  家族窄 union 用显式实参表达 availability（link 仅 PressButton，
 *  living spec 冻结表），门禁再断言家族 union ⊆ PaintVariant 且
 *  与冻结表一致（实证：paintSlot<BadgeVariant> 下
 *  resolve({variant:'link'}) 编译错） */
export type PaintVariant = 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';
/** values = 家族 union 的运行时载体 [X5-6/X6-6]——
 *  `as const satisfies readonly T[]` 编译期锁「数组 ⊆ 类型」，
 *  门禁再断言 values 集 ≡ 冻结 availability union（双向相等，
 *  漏值/多值 fixture）；运行时守卫冻结为：
 *  ambient !== undefined && !values.includes(ambient) → 落 own +
 *  warn '[defaults] ambient variant outside family values — falling to own'
 *  （undefined = 无意见，不触发 warn；无占位符，文本逐字冻结） */
export function paintSlot<T extends PaintVariant = never>(
  own: NoInfer<T>,
  values: NoInfer<readonly T[]>,
): DefaultsSlot<T>;

// 约束用 never-args 技巧替代 any [X-1]：
type AnyBrandedSlot = ((...args: never[]) => unknown) & { readonly [jxSlot]: string };

export function defineComponentDefaults<S extends Record<string, AnyBrandedSlot>>(
  slots: S,
): {
  resolve(partial: { [K in keyof S]?: Parameters<S[K]>[0] }): { [K in keyof S]: ReturnType<S[K]> };
  readonly slots: S;
};
// [X2-1/X3-1/X4-1] 运行时守卫用「工厂产品 WeakSet」+ 类型 brand 双机制。
// **跨模块构造协议（完整签名）**：
//   export function defineAxisSlot<T>(
//     name: string,   // 错误消息与门禁报告同源
//     resolve: (explicit: T | undefined,
//               ambient: () => T | undefined) => T,
//   ): DefaultsSlot<T>;
// ——resolver 协议：ambient 是轴模块闭包持有的 getter（惰性、
// getter 背书）；构造时机 = 轴模块加载（模块级一次，登记 WeakSet
// + 打 brand）；paintSlot/densitySlot/literalSlot/absentSlot 都经
// 它构造。该导出**不是公共 API**：AST 门禁断言
// `defineAxisSlot` 只出现在 **registry/files/lib/**（canonical
// 树——apps/www/src/lib 是字节镜像，门禁只扫 canonical，无需
// 例外条款）；登记边冻结：defaults.svelte.ts（literalSlot/
// absentSlot + 工具）← paint.svelte.ts（paintSlot）←
// density.svelte.ts（densitySlot）。defineComponentDefaults 逐槽
// 断言 WeakSet 命中，未命中抛固定错误 '[defaults] slots accept
// factory products only'。三 fixture：合法轴槽（跨模块）通过 /
// cast-forged 拒绝 / marker-复制槽拒绝；门禁反例：ui 侧 import
// defineAxisSlot 失败
```

```ts
// press-button-defaults.svelte.ts —— family contract, one object
const pressButtonVariants = ['fill', 'tonal', 'outline', 'ghost', 'link'] as const
  satisfies readonly PressButtonVariant[];   // 数组 ⊆ 类型，编译期锁死
export const PressButtonDefaults = defineComponentDefaults({
  variant: paintSlot<PressButtonVariant>('outline', pressButtonVariants), // own = grammar 冻结值
  density: densitySlot(),                            // no family own → no-opinion
});
```

```svelte
<!-- 组件内一行；d.variant / d.density 全类型推导、已解析 -->
const d = $derived(PressButtonDefaults.resolve({ variant, density }));
```

类型级断言 [X2-9]：**载体固定为 `vitest --typecheck`**（tsc 不认
`.svelte` / `.svelte.ts` 模块，二选一取消）——fixture 落仓内
`apps/www/test/defaults-types.spec-d.ts`（expectTypeOf +
`@ts-expect-error` 负探针），命令 `test:types` 进 package.json 与
verify:all。断言清单：入参 Partial、未声明槽 excess property 报
错；**负断言**：裸函数（无 brand）、裸字面量、伪造 brand 对象
（symbol 模块外不可命名）均编译失败；出参 = 槽返回类型
（literalSlot 出参无 undefined、absentSlot 出参含 undefined；
densitySlot 出参 `Density | undefined` 是 fleet law 的正确语义
[B1]）；null 传入编译期拒绝；runtime brand / Svelte 编译 / SSR
各自的运行时证据由对应 spec 文件分别承担（不混在类型 fixture
里）。**泛型槽工厂的强制由 AST 补位** [X4-2/X5-2]：门禁断言家族
defaults 文件内 literalSlot/absentSlot/paintSlot 调用**必须带显
式类型实参**（typeArguments.length > 0——absentSlot 无参数无法
用 NoInfer 强制）；**densitySlot 非泛型，豁免**（示例
`densitySlot()` 合法）。

**消费纪律** [N-6]：resolve 每次求值返回新鲜普通对象（浅冻结 slots
即可，输出不冻结）——下游按槽解构消费，避免整对象依赖放大重算。

## 惰性律 — 模块级 Defaults 与 setup 窗口的闭合 [X-2]

- 模块顶层 `paintSlot<PressButtonVariant>('outline', pressButtonVariants)` **只捕获 own 与 values，不触任何 context**；
- context 读取唯一发生在 **resolve 求值期**（槽被调用时）——组件内
  即 `$derived` 窗口；
- 窗口外 resolve（纯单测/模块加载）：槽内 `getContext` 抛
  lifecycle 错误 → 槽捕获**仅此类错误**、降级为 ambient-skip
  （explicit/own 仍解析）。**错误判别合同 [X3-2]**：共享谓词
  `isLifecycleOutsideComponentError(e)`（defaults.svelte.ts 导出，
  轴模块复用）——匹配规则冻结为 归一化后比对 code——`e instanceof Error` 且 message 去除
  `https://svelte.dev/e/` 前缀、取首行后 === `'lifecycle_outside_component'`
  （Svelte 5.55 实测三形态：dev 多行长文 / prod URL 前缀 / 手造裸串；
  r10 裁决，子代理 A 活体发现）；
  升级 Svelte 大版本时谓词进升级检查单；非匹配错误一律上抛。
  density.svelte.ts 的 `pluginScope()` 裸 catch 同步收窄为仅此
  谓词（其注释意图的忠实化）；负 fixture：轴内 throw 的自定义
  错误在旧直调与新槽两条路径都必须上抛。**降级分工** [r10 裁决，
  A-困难 2]：主降级面 = 轴模块 resolver（它持有 context 读取闭
  包，经共享谓词自降级）；槽级 catch 为 backstop（仅对「经参数
  路由 context 读取」的 resolver 可达），两层都保留。
- 场景矩阵固化：模块加载（零调用）/ SSR / 纯单测 / 组件 $derived
  内——四态行为各一断言。

## 轴槽 — v1 双轴，registry 安全

- `densitySlot(own?)` [X-9]：包 `resolveDensity` 全语义；
  `explicit ?? ambient ?? own ?? undefined`。**family own 落各自
  Defaults**：table 声明 `'sm'`、ghostty-term 声明 `'default'`
  （现状本地 fallback 迁移路径）。三态回归断言：无 provider /
  显式 / 父 provider。
- `paintSlot<FamilyVariant>(own, values)`：读 **PAINT_ZONE_KEY**
  （`Symbol.for('jx-paint-zone')`，payload 类型 ZonePaintVariant——
  不再借道携带 layout/policy 的 ButtonGroupApi）；values 见工具
  API 节的运行时守卫合同。

轴模块各自持有 scope key 与读取逻辑；defaults.svelte.ts 零 context
读取（纯组合，镜像零负担）。

## paint 双键兼容矩阵 [X-5/X2-6/X3-6/X4-4/X4-5]

**职责切分（lib 中立）**：共享 helper（lib/paint.svelte.ts）
**只写新键**，签名冻结（getter 背书）：

```ts
/** zone 默认的 paint 值域：link 除外——link 是 PressButton 的
 *  交互例外（living spec），不是 paint 层级，zone 默认到 link 无
 *  语义 [X4-新发现]。PAINT_ZONE_KEY 的 payload 类型同此。 */
export type ZonePaintVariant = Exclude<PaintVariant, 'link'>;
export function providePaintZone(
  variant: () => ZonePaintVariant | undefined,
): void;
// 实现：setContext(PAINT_ZONE_KEY, { get variant() { return variant(); } })
```

**旧键由 UI provider 自写**——ButtonGroup 照旧自持
`setContext(BUTTON_GROUP_KEY, …)`（ButtonGroupApi 结构视图原样：
orientation/variant/separator，r14-10 effectiveVariant 逻辑不动），
另调 `providePaintZone(() => effectiveVariant)`；ButtonVariantScope 同理。
**provider 值域收窄** [X5-5/X6-5]：ButtonGroup 与 ButtonVariantScope 的
variant prop 类型从 PressButtonVariant 收窄为 `ZonePaintVariant`
（link 不再是 zone/组默认——语法上它只经 PressButton 自身显式
prop 到达；`<ButtonGroup variant="link">` 从合法变编译错，行为
迁移注记 + fixture 固化）。**继承 link 的 provider 侧合同**：
ButtonGroup 的 effectiveVariant 继承旧键时仍可能见 link（仓外旧
provider 直写）——写新键前收窄：
`providePaintZone(() => effectiveVariant === 'link' ? undefined :
effectiveVariant)`（link 保留旧键专属语义，绝不入新键；
external-old-link + dual-provider 双负 fixture 固化）。
lib→ui 零反向依赖；**双键反应性断言**：父级 variant prop 翻转 →
两键消费者同帧重派生（fixture）。

**ambient 值域闭合 [X4-新发现]**：zone 值域 = `ZonePaintVariant`
（link 除外）——Badge-under-link **构造上不可能**（zone provider
传 'link' 编译错，负类型探针固化）；家族槽仍静态窄 union（双重防
线），无需运行时 clamp。

**读取侧 fallback** [X2-6/X8-N1]：`paintSlot` 读 `PAINT_ZONE_KEY`，
**新键缺失或 getter 返回 undefined 时**回落
`BUTTON_GROUP_KEY?.variant`（`newVariant ?? legacyVariant`——继承
link 收窄正是依赖此语义）；优先级：新键 → 旧键 →
own。旧键 fallback 的值域是 ButtonGroupApi.variant（仓外旧
provider 理论上可直写 link）——**运行时守卫可执行化** [X5-6]：
槽持 `values`（家族 union 的 satisfies 数组），ambient ∉ values →
落 own + 冻结 warn（文本见工具 API 节）；仓内 provider 不产生
此态，守卫只防仓外。

| 场景 | 结果 |
|---|---|
| 双写 provider + 新消费者 | 新键命中 ✓ |
| 双写 provider + 旧消费者 | 旧键命中 ✓（variant 同源——同一 effectiveVariant getter） |
| **旧-only provider（仓外/未迁移）+ 新消费者** | 旧键 fallback 命中 ✓ |
| 新-only provider + 旧消费者 | 旧键缺失 → 旧消费者见 undefined（仓内不出现新-only） |
| 嵌套混合 | 每键各自 nearest-wins；variant 值经同一 effective 链恒同 |

- fixtures：old-only / new-only / dual / nested-mixed /
  external-old-only 五态矩阵 + orientation/separator 不退化断言
  + 双键反应性 + zone 传 link 编译错（负类型探针）+ 家族外
  ambient 值落 own 的运行时兜底。
- 弃用协议：门禁统计 `getContext(BUTTON_GROUP_KEY)` 消费者数，
  归零后下个版本节点移除旧键、旧键自写与 fallback（本 change 只
  做双写 + 新读 + fallback）。

## registry 归属 — 两层 + 落盘清单 [X-8/X2-10]

- **共享层**：`lib/defaults.svelte.ts`、`lib/paint.svelte.ts` =
  registry:lib item（density/entity 先例，registry/files/lib/**）。
- **家族层**：`ui/press-button/press-button-defaults.svelte.ts` 等 =
  该 registry:ui item 的**成员文件**（镜像对，随 item 安装）——
  「每 family folder 一份」指 ui item 内，不与 registry:lib 根冲突。

**新增文件与镜像对照表**（ZCode 落盘 registry.json 时照此执行；
**item 名冻结** [X3-10]：`defaults` 与 `paint`，平名 +
`registry:lib`，照抄 `utils`/`density`/`entity` 先例；后缀一律
`.svelte.ts` / `.svelte`，与仓内现状一致）：

| 文件 | registry path | mirror path | registry item |
|---|---|---|---|
| defaults 工具 | registry/files/lib/defaults.svelte.ts | apps/www/src/lib/defaults.svelte.ts | `defaults`（registry:lib） |
| paint 轴 | registry/files/lib/paint.svelte.ts | apps/www/src/lib/paint.svelte.ts | `paint`（registry:lib） |
| 家族 defaults | registry/files/ui/\<family\>/\<family\>-defaults.svelte.ts | apps/www/src/lib/ui/\<family\>/… | 该 ui item 成员 |

- **安装闭包变更**：press-button / icon-button / button-group 三个
  item 的 `files` 增各自 `*-defaults.svelte.ts`；
  `registryDependencies` 增 `@jixoai/defaults` 与 `@jixoai/paint`
  （由真实 import 驱动，gen-icons 先例）；其余家族随 W 批逐个
  登记。**fresh-consumer 验证**：扩 `verify:shadcn-add`（real
  consumer proof 既有门禁）加一个消费 press-button 的安装断言
  ——defaults/paint 两 item 随闭包到达且不拉入 kernel。
- **lib→ui 反向依赖零容忍**：见门禁断言 5（静态 import 图检查）。

## setup 窗口律

见「惰性律」——求值窗口、降级语义、吞错范围三合同合一。

## 快路径不变量

零 provider / 零 zone：槽 ≡ `explicit ?? own`（no-opinion 轴再
`?? undefined`），一次函数调用，无链无 hook。依赖计数微基准固化。

## 门禁合同 — verify:context [X-6/X-7]

**输入**（全部确定性文件，仓内路径固定 [X2-6/New-3]）：
`registry.json`（item→family folder 映射）、组件源
（svelteCompiler.parse）、白名单
`scripts/context-coverage.exemptions.json`（schema：`path` /
`kind: bindable | passthrough | no-style | provider | roadmap`
（**唯一清单** [X2-5/X6-8]——roadmap 条目另需 `prop` 与目标轴
字段）/ `reason` 非空 / 可选 `expiresAt`）、检测词表与配置
`scripts/context-coverage.config.json`（版本化 v1：variant/density/
elevation/size/shape/radius/tone/inset/bordered——精确枚举，不用
ghost… 通配 [X-建议]）；**c 类（路线图）的载体** [X6-8]：豁免
白名单增 kind `roadmap`（path + prop + 目标轴 + reason）——
class 词表命中且未落槽的 prop 必须持 roadmap 条目，否则门禁
失败（分类 a/b 落槽、c 落 roadmap 条目、d 落 bindable/no-style，
四类全部有载体）。

**断言**：
1. 存在性：词表命中 prop → family 有 defaults 且 slot 覆盖（或白
   单条目豁免——`provider` kind **只豁免 provider 路径的旧 helper
   bypass 检查**，不豁免 Defaults 存在性、slot 覆盖与 resolve
   presence [X2-5]）；
2. 槽合法性（AST）：slot 值 = CallExpression 且 callee ∈ 注册槽工
   厂集（defaults.svelte.ts 导出的工厂 + 各轴模块工厂）+ **泛型
   槽工厂调用必须带显式类型实参**（typeArguments.length > 0——
   absentSlot 无参数无默认，AST 是唯一强制面；literalSlot/
   paintSlot 另有 = never 双保险 [X4-2/X6-3]；densitySlot 非泛型
   豁免）；**paintSlot 必须二参**（own + values satisfies 数组引
   用）且 **values 集合 ≡ 冻结 availability union**（双向比对，
   漏值/多值均失败 [X6-6]）；
3. **family 级可检查合同** [X2-7/X3-7——承诺如实降级 + 空调用判
   定语法冻结]：消费者文件含该家族 `XxxDefaults.resolve(` 调用；
   无禁用通道（`resolveDensity` / `getDensityContext` / 轴 key
   `getContext` 直连）；Defaults 的 slots 覆盖词表命中的 prop。
   **空调用判定语法** [X3-7]：仅拒绝裸 ExpressionStatement 位置的
   `XxxDefaults.resolve(...)`（语句位置、结果未使用）；赋值/
   return/展开/模板使用一律接受（per-prop 数据流不在静态可判域，
   此边界声明过，归 code review）；
   **provider path 静态边界** [X3-5/X4-3]：kind:`provider` 豁免
   文件内，旧 helper 标识符只允许出现在两类**反应式声明子树**内
   ——(a) provider 函数调用的实参子树
   （`provideDensity(() => resolveDensity(...))`）；(b)
   `$derived(...)` 子树（仓内真实形态
   `const resolved = $derived(resolveDensity(...)); provideDensity(() =>
   resolved)`——$derived 初始化器是喂给 provider 的反应式声明，
   与 inline 形态同权）；事件处理器/模板/普通语句内直读仍失败
   （专项反例）；
4. family availability 一致性 [X2-3]：家族暴露的 variant union ⊆
   `PaintVariant`，且与 living spec 冻结表一致（link 仅
   PressButton）；
5. lib→ui 反向依赖零容忍 [X2-10]：`registry/files/lib/**` 不得
   import `registry/files/ui/**`（静态 import 图检查）；
6. 豁免显式：白名单条目必须命中且理由非空。

**输出与接线** [X3-9]：JSON（机器可读：组件 × prop × 分类 × 违反
规则）+ 人读清单；exit 0/1；`--scope=pilot` 试点子集模式；接线冻
结为——apps/www `package.json` 增 `"test:types": "vitest --typecheck
run"`，`vitest.config.ts` 增 `typecheck: { checker: 'tsc', include:
['test/**/*.spec-d.ts'] }`（与既有 `include: ['test/**/*.spec.ts']`
并存，typecheck.include 独立）；根 `package.json` 增
`"test:types": "npm --prefix apps/www run test:types"`；
`verify-all.mjs` 的冻结脚本数组在 `'verify:mirror'` 之后插入
`'verify:context'`（现数组：laws, icons, **mirror, [context]**,
deps, shadcn-add, budgets, docs, meta, print——ZCode 落盘）；fixture
自测进 test/（合法迁移件通过 + 反例各自失败——缺 Defaults / 裸
函数槽 / 游离旧链 / 空调用裸语句 / 家族 union 越界 / lib→ui
import / ui 侧 import defineAxisSlot / provider 文件内越界直读）。

**切换点**：唯一全量启用点在 3.5（W4 + D 完成后），见依赖图 [X-11]。

## 非开放类（永不 ambient）

分类 d：`open`/`bind`、回调、aria/data 属性、`class`、`id`、
bindable 状态型样式 prop（page-owned toggles）。Compose 同样不
ambient 化 onClick。

## 附录 — 轴路线图（开轴协议）[X-10]

elevation 与 shape/radius 延后至首个真实消费者（零消费者开轴 =
投机通用性，codex 与 Owner 一致否决）。开轴协议模板：

1. 封闭 union 类型 + token map（编译期 + 运行时拒绝非法值）；
2. zone scope shape + 槽工厂签名；
3. 首消费者落地合同 + 回归断言。

elevation 备忘（协议首个候选）：五档机制异构——float 双轨道（交互
token / panel 走 .jx-surface 法则）、raise 属 `.jx-press` 三姿态
法则、仅 lift(`--shadow-2xs`)/engrave/well 为干净单 token；entity
depth-1 的 well inset CSS 是**既有回归约束**，非本 change 新合同
[X-建议]。

## 试点批惯用法冻结（r11，2.4——W 波放量合同）

试点批 8 件全绿（pilot 门禁 31→0，全量 1681/1681）后冻结的实
施惯用法，W1–W4 遵照：

1. **provider 急捕获形态**（P1 活体发现 `derived_references_self`，
   最重要的 W 波合同）：provider 组件在 `$derived` 内**惰性**读
   context 会命中自己的 setContext 写入（Svelte 同组件 map 含自
   身写）→ 死环。inherit-then-provide 的合法形态是**急捕获**：
   `const r = $derived.by(((captured) => () => captured)(getContext(…)))`
   ——实参在语句期求值（先于自身写键），既在门禁 blessed 子树内
   又运行时安全；「先读后写」的初始化时序是 load-bearing。测试
   钉在 defaults-buttons.spec.ts 的 derived_references_self pin。
2. **A4 抽取上限的槽类型惯例**：门禁 AST 无法穿透别名→导入的
   union——各 defaults 文件声明**同文件夹字面 union**（值/own 与
   冻结表恒等，如 PressButtonPaintVariant），组件 Props 引用它。
3. **barrel 导出**：家族 index.ts 导出 `XxxDefaults` 与槽类型
   （公共契约面，采纳 P2 提议）。
4. **docs props 表标注惯例**：Default 列写 own 值，description
   尾注 `ambient zone` / `ambient scope` / `Own default, not
   ambient` 三态措辞（P1/P3 风格为准；PropsTable 的 ambient 列
   属 4.3 先破后立范围）。
5. **proxy 族 availability 扩展**：button-group（zone 四值域）
   与 icon-button（restate 五值）入 gate 冻结表镜像，_readme 记
   载依据（proxy 复述冻结行，非铸造新域）；归档 variant
   grammar 本身裁定「IconButton forwards the union」。
6. **kbd 模式**：不在冻结表的 variant 落 literalSlot 并注释升级
   路径（表加行即升 paintSlot）——「分类 b」的标准样板。

## 放量摩擦回写（r12，W1–W4 四波实录）

全树 verify:context GREEN（86 族 findings 0）、全量 1762/1762 绿
（7 败均为负载超时，串行复跑 65/65 证实）。放量实录沉淀的惯用法
增补与裁定：

1. **meta 族变体**（W1 发现）：Props 喂 component-metadata-gen 的
   家族（select/checkbox/combobox/date-picker）保留 inline union
   + inline 默认（drift 双锁要求），defaults 文件自声明同值
   union、spec 钉同值——r11 #2 的成文例外，待 D 批扩 meta IR
   后收编。
2. **module-script 公共 union 迁移**（W4）：`export type {X} from`
   不引入本地绑定，instance script 引用会编译失败——用
   `import type {X}; export type {X};` 双语句保公共面。
3. **provider 巷叠放形态**（W2/W3/W4 共同实证，正式样板）：
   inherit-then-provide 家族的完整形态 = **急捕获 provider 巷
   （r11 #1）+ Defaults.resolve 叠在其上取戳**——slot 的 ambient
   读落到自身 provide 的 getter、经 captured-parent 终止（「自读
   自供」），一子树一次解析；值恒等由翻转 pin 钉。
4. **多词汇家族**（W2 裁定）：一族一 variant 槽的代理检查下，
   面板浮面占 `variant`、action 按钮阶梯走 `actionVariant` 槽
   （overlay 家族命名惯例）；语义分裂在 defaults 文件头记载。
5. **零命中族双态**（W3/W4 vs W1/W2 任务书文本）：零词表命中且
   无 legacy 读者 → **不造 defaults**（空契约属投机，优先态）；
   有 density 消费意图 → 允许纯声明槽（cascader/dialog 先例）。
   gate 对两态均无诉求，D 批文档需区分措辞。
6. **literalSlot 的 union 单源**（W2/toast）：literal 槽无 A4 解
   析需求——union 从既有单一信源导入（toast-store）优于同文件
   复述，避免双信源漂移。
7. **豁免时序悖论的缓解**（W3 提议，暂缓）：波内归零只能沙箱证
   明；已知 provider 文件可预发条目。本轮按沙箱路径完成，后续
   change 若放量新 provider 族可采纳预发。

## 迁移策略与依赖图 [X-11]

```
1.0 typecheck 载体（ZCode）
   ↓
1.1 工具+brand+惰性律 → 1.2 paint 双键 → 2 试点批(8) → 2.4 惯用法冻结
1.4 门禁(试点模式)  ───────↗                │
                                            ├→ W1 ‖ W2 ‖ W3 ‖ W4（文件不重叠，可并行）
                                            │    每波收尾：镜像+manifest（ZCode）
                                            ↓
                                    3.5 门禁全量启用（唯一切换点）
                                            ↓
                                    4 文档批 D（与 W 并行启动，3.5 前完成）
                                            ↓
                                    5 整合：verify:all 全绿 → 对抗 → codex → Owner
```

- 波内失败：阻断**该波**提交，不阻断其它波（文件不重叠保证）；
- 共享文件（registry.json / manifest / verify-all.mjs / package.json）
  始终 ZCode 落盘；
- 试点批 8 件：press-button / icon-button / button-group / dialog /
  sheet / kbd / badge / chip（**决策已冻结** [X2-11]：icon-button
  复述子组件槽；sheet ship defaults——density 槽 + surface 的
  literalSlot，zone 接线不做）。

## 风险与对策

- **86 件规模** → 试点锁惯用法再放量；门禁防倒退。
- **类型推导** → 1.0 载体 + 1.1 断言先行；失败降级显式泛型标注。
- **docs 链路现实** [N-3/F6]：meta 生成链现覆盖 8 页（docs 页总数
  以 verify-docs 实测为准，约 79），ambient 列先扩 meta IR + drift
  spec 先破再立，8 页受保护、其余手改。
- **API 注释义务** [X-建议]：defaults.svelte.ts 的公开导出接口按仓
  内法则配注释。

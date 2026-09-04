# Proposal: slot-values-first — 函数式槽工厂，值域即类型源

## Why

Owner 走查定调（2026-09-04，验收 context-plugin-v2 时）：

> `literalSlot<KbdVariant>('tonal')` 这种写法，并不函数式。我更倾向于
> `const kbdVariantSlot = defineLiteralSlot(['fill','tonal','outline'],'tonal')`
> （域为标量三态 readonly (string|number|boolean)[]——布尔槽同形态；
> 开放标量域走 defineOpenSlot）——用这种函数式的方式，把能力集中在单个 kbdVariantSlot 上，这样我们
> 再来设计插件，可能会更简单。这种设计我就是和 Vue 学的。

tsc 探针已实证（`--strict`，仓库 TS 版本）：`const T extends
readonly (string | number | boolean)[]` + `OneOf<T> = T[number]` 的
推导全链路成立（可复现探针：/tmp/svf-r4-probe.ts——三态签名与布尔/
数值形态，tsc exit 0；/tmp/svf-import-lib.ts + svf-import-consumer.ts
——导入 `as const` 元组推导与越域负例，exit 0。旧 /tmp/svf-probe/ 是
string-only 时代探针，已由三态版取代，不作为本 change 证据）——default ∉ values
是编译错误、显式实参越域是编译错误、`ReturnType<typeof slot>` 反查
union 成立。这比现状**更强**：今天 literal 槽的 own 与类型是否一致靠
人肉对齐（NoInfer 只强制显式标注，不校验归属）；values-first 之后
**default ∈ values 被编译期锁死**，且"同文件夹 union 声明 + as const
satisfies 载体"整套作者仪式（r11 #1 冻结惯例）退役——数组字面量成为
唯一事实源。

深层收益（Owner 的插件直觉的落点）：**slot 携带值域后就是一个微 def
（domain + default + 身份）**，与 context-plugin-v2 的 def 经济同构——
未来 definePlugin 可直接 target 一个 slot（def 从 slot.values/slot.
default 派生），插件以家族词汇而非轴词汇书写。本 change 只落 API 与
迁移，def 派生作为记录在案的方向，不实施。

## What Changes

1. **工具层（D1）**：`defineLiteralSlot(values, default)` 与
   `definePaintSlot(values, own)` 落地（OneOf 推导，const 泛型）；
   `literalSlot`/`paintSlot` 退役删除（无兼容别名——单键法同日生效的
   no-compat 律：从未发布，没有要兼容的对象）；`absentSlot<T>()` 与
   `defineOpenSlot<T>(own)`（开放标量域——自由 CSS 长度/数值，无 union
   可枚举）保留显式类型参数（无值域可推的两个例外面）；`densitySlot`
   不变；品牌与
   defineAxisSlot 内部路由不变。values 参数是类型与门禁的载体，运行时
   不消费（D3-A 法延伸到 literal 槽）。
2. **家族迁移（D2）**：37 个 defaults 文件（40 literal 调用——内含 5 个
   标量域槽：布尔 2 走 values 形态、开放 3 走新增 defineOpenSlot——
   另 7 个 paint 调用）
   的声明改为**具名槽常量**（"能力集中在单个 slot 上"的落实）：
   `export const kbdVariantSlot = defineLiteralSlot(['tonal','outline'],
   'tonal')`；家族 union 类型改为 `export type KbdVariant = ReturnType<
   typeof kbdVariantSlot>` 反查；同文件夹 union 声明与 satisfies 载体
   全部删除。双树同步。
3. **门禁（D3）**：component-metadata-gen 的 ambient 发射链同步（具名常量解析 + 工厂名词表——否则 47 槽 ambient 丢失）；verify:context 的 A2 slot 合法性支持"具名常量 →
   同文件工厂调用初始化器"的解析（槽从内联调用变具名常量后 A2 的
   解析面扩展）；A4 的 values 提取从"第二参数的同文件载体"改为
   "第一参数的内联字面量数组"（更直接）；config slotFactories 词表
   更新；"同文件夹 union"提取上限的断言面随之简化。泛型必须显式的
   A2 断言对 literal/paint 退役（推导替代强制），absentSlot 与
   defineOpenSlot 两个显式参数面保留。
4. **spec 与文档（D4）**：component-authoring 四条 requirement 措辞
   （契约/品牌工厂/变体语法/覆盖门——values 从"载体"升为"类型源"）；指南页
   author 节（contract 样例、slot 表、清单两条）；spec-d 探针换防
   （default 越域/显式越域为编译错误，替代 =never 强制）。

## 不做的事

- def-from-slot 派生与 slot-targeting 插件（方向记录，待首消费者）。
- densitySlot/absentSlot 的形态（前者无字面量域，后者无域可推）。
- meta 例外家族的组件 Props 侧 inline union 保留（S2 例外从句进 spec）。

## Impact

- registry/files/lib/defaults.svelte.ts、paint.svelte.ts（+ www 镜像）；
  scripts/component-metadata-gen.mjs（ambient 发射链）与其 drift 测试；
  37 个 `*-defaults.svelte.ts`（+ www 镜像）；scripts/verify-context-
  coverage.mjs + context-coverage.config.json；openspec/specs/
  component-authoring/spec.md；指南页；test/defaults*.spec.ts、
  paint-axis*.spec-d.ts、context-coverage.spec.ts（门禁自测 fixture 同步）；
  registry/test 本地树同步。registry.json 条目描述措辞微调（payload 再生）。
- 行为不变量：resolve 语义逐字节不变（values 运行时不参与）；冻结
  availability 表的断言两侧不变（只是提取位置从载体到内联数组）。

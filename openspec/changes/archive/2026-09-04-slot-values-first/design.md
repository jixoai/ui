# Design: slot-values-first (r2)

Owner 定调在先（proposal 引文），探针实证在案（/tmp/svf-r4-probe.ts
三态签名 + /tmp/svf-import-consumer.ts 导入元组，仓库 tsc 5.9.3
--strict 均 exit 0；旧 string-only 探针已被取代，不作为证据）。对抗审查 r1
（/tmp/svf-adversarial-r1.md：阻塞 2 / 应修 4 / 建议 6）已全部消化：
[B1] 标量域覆盖、[B2] meta 发射链、[S1]-[S4] 如标注；[误报澄清] 六项
免改（A1 无需扩、exemptions 无涉、类型三问成立、运行时不消费为真、
文件清单基数修正、行为测试应全过）。裁决按 D1–D5。

## D1 — 工具层：新工厂签名（冻结）

```ts
// defaults.svelte.ts
/** 值域元素的联合——values 即类型源（标量三态：串/数/布尔） */
export type OneOf<T extends readonly (string | number | boolean)[]> = T[number];

export function defineLiteralSlot<const T extends readonly (string | number | boolean)[]>(
  values: T,
  defaultValue: OneOf<T>,
): DefaultsSlot<OneOf<T>>;
// 实现：values 仅参与类型（运行时忽略，D3-A 法延伸）；
// defineAxisSlot('literal', (e) => e ?? defaultValue) 路由不变，品牌不变。

// paint.svelte.ts
export function definePaintSlot<const T extends readonly PaintVariant[]>(
  values: T,
  own: OneOf<T>,
): DefaultsSlot<OneOf<T>>;
// 域约束 T ⊆ PaintVariant（宽域含 link——press-button 家族值域五值）；
// ambient 收窄与信任域语义不变（readAmbientVariant 照旧）。

// [B1] 开放标量域槽（无闭合值域可枚举——sheet size 是自由 CSS 长度、
// chart size / navigation-menu inset 是自由数值）：
export function defineOpenSlot<T extends string | number | boolean = never>(
  own: NoInfer<T>,
): DefaultsSlot<T>;
// 与 absentSlot 同理：无 values 可推，显式类型参数是唯一强制面（= never
// 真强制，A2 断言保留）。布尔是闭合域，走 values 形态：
// defineLiteralSlot([false, true], false)。

// 退役（删除，无别名）：literalSlot、paintSlot
// 保留原形：absentSlot<T extends {}>()（无值域可推，显式类型参数是
//   唯一强制面——A2 对它的"泛型必须显式"断言保留）、densitySlot(own?)
```

- **[B1] 域约束**：上列冻结签名即 `readonly (string | number |
  boolean)[]`——40 个 literal 调用**已含** 5 个标量域槽，另 7 个
  paint 调用 [建2 口径]。归宿：descriptions.bordered /
  list-item.inset 走 `[false, true]` values 形态；sheet.size /
  chart.size / navigation-menu.inset 走 defineOpenSlot（开放域，注释
  明说 "a future size axis would first have to close the union"——
  闭合之日语义即迁回 values 形态）。

- **NoInfer/= never 强制退役**（对 literal/paint）：推导替代强制——省略
  任何参数都不可能编译（values 与 default 缺一不可，default 越域即错）。
- **具名槽常量是家族文件的唯一形态**：槽不再内联在
  defineComponentDefaults 的对象字面量里，而是文件级导出常量——
  "能力集中在单个 slot 上"（Owner 原话）的落实，union 反查与文档引用
  都挂在这个名字上：

```ts
// kbd-defaults.svelte.ts — 迁移后全景
export const kbdVariantSlot = defineLiteralSlot(['tonal', 'outline'], 'tonal');
export type KbdVariant = ReturnType<typeof kbdVariantSlot>;

export const KbdDefaults = defineComponentDefaults({
  variant: kbdVariantSlot,
  density: densitySlot(),
});
```

- **同文件夹 union 声明退役**：`export type KbdVariant = 'tonal'|'outline'`
  与 `as const satisfies readonly KbdVariant[]` 载体整体删除（r11 #1
  惯例 superseded）；家族对外类型面（组件 prop、barrel 导出、props 表）
  引用反查类型，零改动。
- 例外核对：
  - press-button 的 `PressButtonVariant` 是 paint 轴 PaintVariant 的
    re-export 别名（宽域）——其家族槽用 definePaintSlot 五值数组后，
    组件侧别名改指 `ReturnType<typeof pressButtonVariantSlot>`（值相同，
    声明点唯一化）。
  - [S1] toast 的 lib 域单源（r12 #6）：lib 侧 `$lib/toast-store` 导出
    values 常量（`readonly [...] as const` 元组）成为**唯一声明源**：
    `ToastVariant = typeof TOAST_VARIANT_VALUES[number]`、
    `ToastMaterial = typeof TOAST_MATERIAL_VALUES[number]` 反查（两槽
    都迁：variant own 'outline'、material own 'popover'），
    不允许并存手写 union [R2]；家族槽
    `defineLiteralSlot(TOAST_VARIANT_VALUES, 'outline')`——**own 钉回
    现值 'outline'（popover 材质）** [B3：示例写 'tonal' 属行为回归，
    现行测试 defaults-overlays.spec.ts:234-243 锁定 outline/popover]；
    const 泛型从导入常量的字面量元组类型推导（codex 探针
    /tmp/svf-import-lib.ts + svf-import-consumer.ts 配对实证——lib 出
    常量、consumer 出推导与越域负例），**单源保持**（A5 方向合法：
    ui→lib）；
    literal 槽无 A4 内联字面量要求，导入常量合法；spec-d 保留导入
    常量元组的 default 越域负探针。指南页清单第 7 条（单源导入）随之
    更新措辞而非删除。
  - [S2] meta 例外家族（select / combobox / date-picker，组件 Props 侧
    inline union 保留）：spec delta 增例外从句——"no separate union
    declaration" 不适用于 meta-feeding 家族的组件侧 inline union（其
    drift 双锁的存活半边 = resolve 调用点 assignability 编译锁）；proposal
    措辞修正（"页面侧"→"组件 Props 侧"）。

## D2 — 家族迁移（37 文件 × 双树）

- 机械替换面：40 literal 调用（内含 [B1] 5 个标量域槽：布尔 2 →
  values 形态、开放 3 → defineOpenSlot）+ 7 paint 调用 → 具名常量；
  union 声明删除；
  `export type … = ReturnType<typeof …Slot>` 反查；barrel 的 type re-export
  不变（引用同名）；densitySlot/absentSlot 行保持。
- 命名：`<vocab>Slot`（kbdVariantSlot、pressButtonVariantSlot、
  dialogSurfaceVariantSlot、sectionCardToneSlot…）；多词汇家族按词汇命名
  （actionVariant → xxxActionVariantSlot），分裂事实在文件头注释不变。
- 双树字节同步（mirror 插件 + cmp 抽验）；registry/test 本地树跟随。

## D3 — 门禁

- **A2 slot 合法性**：解析面扩展——defaults 对象成员为具名常量时，沿
  同文件 `export const <name> = <factory>(…)` 初始化器解析（一次跳转，
  不递归）；工厂词表 {defineLiteralSlot, definePaintSlot, defineOpenSlot,
  absentSlot, densitySlot}；"泛型必须显式"断言对 **absentSlot 与
  defineOpenSlot** 保留（无值域可推的两个显式参数面；其余由推导替代，
  断言面删除）。defineOpenSlot 的 metadata ambient 分类 = 'own'
  （literal-family 的开放域形态）。
- **A4 availability**：paint 家族的 values 提取从"第二参数引用同文件
  载体"改为"第一参数内联字面量数组"（AST 直读）；双向 ≡ 冻结表断言
  不变；"同文件夹 union"提取上限断言随之删除（union 已由 values 派生，
  无第二事实源可漂移）。
- config：slotFactories 词表、paintVariantUnion 说明行同步；门禁自测
  fixture 树同步新语法——**两份** [建2]（apps/www/test/fixtures/
  context-coverage/{root,legal-root} 与 registry/test 同名镜像，spec
  实跑前者）；root 反例的"缺类型参数"形态换 absentSlot 缺参（literal/
  paint 的该断言面已退役）[建2 后半]。
- A5/A6 无涉；A1 存在性断言不变（具名常量仍在 defaults 文件内）。

## D4 — spec 与文档

- component-authoring：
  - "every registered component family ships a Defaults contract"：
    槽声明形态改为具名常量 + 值域即类型源；"same-folder literal union"
    惯例句删除。
  - "slots are branded factory products only"：工厂名更新；"the
    explicit type argument is enforced"面缩至 absentSlot 与
    defineOpenSlot（与 D3 的两个强制面一致）。
  - "the variant grammar"：values 从 "the gate's availability carrier"
    升为 "the family union's SOURCE（default ∈ values 编译期锁定；运行
    时不消费）"。
- 指南页 author 节：contract 样例换 kbd 全景（上）；slot 表三行措辞
  （defineLiteralSlot/definePaintSlot 值域先行 + defineOpenSlot 行）；
  [S4] 清单"同文件夹 union"与"as const satisfies"两条合并为"values
  字面量是唯一事实源——default ∈ values 编译期锁定"（**第 1 条内嵌的
  meta 例外从句保留存活**）；**清单第 3 条**（显式类型参数）收缩至
  absentSlot 与 defineOpenSlot（与 D3 的两个强制面一致）；blueprint
  场景 scenes/defaults.svelte 的
  `paintSlot('outline')` 文字同步。[建4] zone-scopes requirement 的
  "the values array is the gate's availability carrier" 与 variant-
  grammar 的 "SOURCE" 双轨措辞对齐（carrier 定语保留给门禁语境）。
- spec-d 探针换防：`@ts-expect-error` 三处（default 越域 / 显式实参越域
  / paint 值域越 PaintVariant），= never 探针退役。
- registry.json 条目描述里 literalSlot/paintSlot 名字出现处更新（payload
  再生）。

## D5 — 执行

- COMPACT：W1 工具层+门禁+探针（原子：工厂删除与家族迁移不能分批——
  旧名一删 37 文件即红，故 W1+W2 实为一个全绿提交单元，同 cp2 的
  依赖倒置先例）；W2 家族迁移（子代理按 catalog 分组分批，文件集互斥；
  双树同步）；W3 spec/docs/manifest/payload。共享文件归编排者。
- 验收：verify:context / mirror / deps / **meta**（[B2/R1]：具名常量
      解析与新工厂 ambient 映射的验收载体——W1+W2 全绿单元显式含
      verify:meta 与 props-table-meta-drift 快照）全绿；目标套件（含
      props-table-meta-drift；defaults 全家 +
  paint-axis + context-coverage + typecheck）绿；全量 vitest 串行；
  rg 零残留（literalSlot</paintSlot< 于 registry/files 与 apps/www/src
  零命中，absentSlot< 保留）；openspec validate --specs。
- [S3] spec 补面：coverage-gate requirement clause (b) 的 "registered
  slot factory call (AST)" 措辞扩为"经具名常量一次解析"；registry spec
  :334 SHARED tier 枚举的 `literalSlot` 更新为 `defineLiteralSlot`
  （registry spec delta 补入本 change）；"versioned" 一词与 "Symbol.for
  seam RETIRED" 措辞**保留不动**（r2 曾误删，codex r1 判为未授权
  weakening，r3 已恢复）；variant-grammar 括号句删减为有意重述（建5，
  delta 头注明）。
- codex 两轮：change 复核 → 实现复核（评分闭环）。

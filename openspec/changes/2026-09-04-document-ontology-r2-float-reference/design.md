# Design: document-ontology R2 — 浮+引

裁决基座：openspec/changes/2026-09-02-document-ontology/design.md
（§2 原语、§3 合成法则、§5 收割合同、§7 轮次）+ 2026-09-04 grill
裁决（proposal 决策表）。本文落 API 形状与法则映射。

## 1. Section 编号树（Q3 + Q4 + Q5）

```svelte
<!-- 声明即三重身份：编号子树根 + 浮计数域 + 深层节计数重置点 -->
<Section numbering>…</Section>                     <!-- 'decimal' 默认 -->
<Section numbering floatScope={{ equation: 'document' }}>…</Section>
```

- `numbering?: 'decimal'`（本期唯一 scheme；值域留给 R5 预设扩展）。
  声明节获得章序数；后代节在域内续十进制树（3 → 3.1 → 3.2 → 3.2.1）。
- **未声明 = 逐字节今日行为**：无编号显示、无 DOM 增量（显式结构
  法则；现状门是测试断言）。
- `floatScope?: Partial<Record<FigureKind, 'chapter' | 'document'>>`
  ——默认全 kind `'chapter'`；`'document'` 是 ASME 式号惯例的显式
  例外。**scope 只在域级声明**（Q5：逐 Float 声明会造成计数器身份
  不可判定，禁止形状）。
- 编号 = DOM 顺序的显示货币（Paged* 时代裁决升格）：运行时按渲染
  顺序解析，换序自动重排；寻址恒走显式 `id`，编号永不充当地址。

## 2. Figure 家族（Q6 + Q6a + Q8）

```svelte
<Figure kind="table" id="tbl-results" caption="实测与预测对照" citedIn={['§ 3.1']}>
  <CodeCard lang="ts">…</CodeCard>   <!-- 内容槽：任意点；R6 起逐轮落地 -->
</Figure>
```

- 渲染 `<figure data-jx-figure={kind} id?>` + `<figcaption>`：标签
  （kind 的显示词）+ 解析编号 + caption 槽。
- `kind: 'figure' | 'table' | 'equation' | 'listing'`（本期四值；
  值域开放给 R6 行业点扩展——kind 是收割面的 registry，非封闭枚举
  语义）。
- 计数：域内按 kind 各自从 1 递增（DOM 顺序）；`scope='document'`
  的 kind 跨域连续。
- `id` 可选——无 id 仍编号（显示货币），但不可被引/不可寻址（寻址
  法则在文档注明）。
- **`citedIn?: string[]`（Q8 手动标注槽）**：显式声明的显示串原样
  渲染于图注尾（「被引于 …」连接词由调用方文案自带）+ 同步发射
  `data-cited-in`。**缺口注释（必须落在组件头）**：自动反链渲染
  机件刻意缺席——反链的自动态只存在于收割层（refids[] 倒排）；
  回归条件 = 某体裁真要上纸面「被引清单」（届时纯增量：反向注册
  context + Figure 读取）。
- CodeCard 的裸 figure/figcaption 形状不动（未包 Figure = 今日行为）；
  Figure 不复制点语义——线承载结构，点承载行业字段（§3 合成法则）。

## 3. Reference 家族（Q7）

```svelte
<Reference to="eq-bernoulli" />               <!-- → "Eq (4.5)" -->
<Reference to="eq-bernoulli">上式</Reference>  <!-- children 逃生门：文案换、链接留 -->
```

- **目标自述语法**：解析跟随目标——`Figure` 按其 kind 渲染
  （`Eq (4.5)` / `Fig 2-3` / `Table 6-1` / `Listing 3`），编号节
  渲染 `§ 3.2.1`，无编号目标降级渲染其标题（参见形态）。Reference
  组件零语法知识：换 kind/换章/换序，全部引用点自动跟随。
- 响亮回退：目标 id 不存在 → `console.warn` + 渲染 `??(to)` 可见
  标记（开发期信号），永不抛错阻塞（打印永不阻塞doctrine 同源）。
- 发射 `refids[]` 的正向面（本引用点 → 目标 id）进收割合同。

## 4. 收割发射（R1 车道）

- figure：`data-jx-figure={kind}` + `data-number`（解析编号）+
  `data-cited-in?`；引用点：`data-ref-to`。
- section：`data-jx-section`（已在）+ `data-number`（编号树值）。
- 与 R1 已落地的 `data-role`/`data-ordering` 同语法族；§5 合同的
  `number`/`refids[]` 字段由收割器从这些 attr 派生。

## 5. 测试门（design §7 R2 行）

- **「编号=显示货币」法则门**：换序后编号重排、id 不动（figure 与
  section 双夹具）。
- 现状门：未声明 numbering 的 section DOM 逐字节等价。
- 解析矩阵：kind×scope×域嵌套的编号值表；引的目标自述矩阵
  （equation/section/无编号/缺失 id 四态）。
- citedIn 渲染 + 发射；镜像逐字节；打印探针（编号在冻结捕获里
  原样在场，无重编号）。

## 6. 范围外（记档不做）

- 反链自动渲染机件（缺口，见 §2）；Jump 子类型（D.S. al coda，
  §8 开放问题，等 R6·music 实证）；书目引（无 bibliography 机件）；
- scheme 值域扩展（罗马/字母/时间轴等归 R5 预设轮）。

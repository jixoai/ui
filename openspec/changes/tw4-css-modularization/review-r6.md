# tw4-css-modularization review-r6

> 审查日期：2026-08-24。审查对象是 r6 修订后的
> `proposal.md`、`design.md`、`tasks.md`、4 个 delta，以及基线 specs 和
> 当前 registry/payload/build 状态。本轮目标是判断是否达到实现前定稿，
> 不把任务描述或当前 flat baseline 当作本 change 的实现。

## 结论

**Approve。已达到“可实现前定稿”。** B14-r5 的 theme npm 依赖闭包和
B15-r5 的 code-card named chain 已在 delta、设计和任务中形成一致的、可执行
的验收合同。没有发现新的 Tier-2 cascade、Tailwind entry、registry target 或
mirror parity 阻塞问题。

## 真实工作区验证

- `openspec validate tw4-css-modularization --strict`：通过。
- `npm run build`：通过，当前 shadcn `4.19.0` 构建 84 个现有 flat items。
- `npm --prefix apps/www run build`：通过；只有既有 Svelte/a11y/CSS warnings。
- `npm --prefix apps/www run test -- --run test/registry-payload-parity.spec.ts`：
  1 个文件、1 个测试通过。
- 当前没有本 change 的实现代码：工作区的已跟踪修改仍是
  `website-scaffold` 基线修改，folder、mirror manifest、P0 fixtures、utils
  item 和 utility migration 均尚未落地。实现质量因此维持 2/10。
- 当前 flat baseline 的事实仍与修订合同区分清楚：
  `registry.json:8-19` 的 `jixoai-theme` 还没有 `dependencies`，而
  `registry/files/theme/jixoai.css:29-30` 确实导入两个 fontsource 包；这是待
  P3.1 实施的目标，不是本轮把未实现状态误报为已完成。
- 当前 `registry.json:434-455` 的 `code-card` 同时携带
  `registry/files/lib/shiki.ts`，并依赖 `@jixoai/shiki`；该现状被 r6 的
  named chain gate 显式覆盖。现有 `.agents/shadcn-folder-probe` 也已用
  shadcn 4.19.0 构建过 nested `path`/`target` payload，说明 CLI build 本身
  不是 folder target 阻塞；真实 `shadcn add` 仍由 P0/P1 fixture 验收。

## B14/B15 逐条复核

| 项目 | 判定 | 可验证依据 |
| --- | --- | --- |
| B14-r5：theme npm dependency closure | **已解决** | `specs/registry/spec.md:37-50` 将 `@fontsource-variable/jetbrains-mono` 与 `@fontsource/share-tech-mono` 写为 `jixoai-theme` item 的 `dependencies` 必备项；`tasks.md:116-129` 指定实际修改位置、唯一 consumer entry 顺序和复用的 `check-tw4-prereq.mjs`；`tasks.md:130-142` 要求从空 SvelteKit consumer 执行 `shadcn add`，检查 package manifest、`@lib/jixoai.css` build 解析以及 `dark:*`、`border-border`、`bg-background` 和组件 utility 的 compiled output。主题文件导入、item dependency 字段、安装和运行时结果各有对应断言。 |
| B15-r5：code-card dependency chain | **已解决** | `design.md:117-123` 和 `specs/registry/spec.md:51-56` 将 code-card 明确移出 P0.2 的 accordion/toast 集合，纳入 named P1 full gate；`tasks.md:81-88` 固定输入命令 `shadcn add @jixoai/code-card`、`@lib/shiki.ts` 恰一次、npm `shiki`、registry deps `@jixoai/shiki`/`@jixoai/jixoai-theme` 全解析，以及 no target clobber。该断言覆盖了当前真实 item 的重复 target 和递归依赖路径。 |

### 交叉契约检查

1. **Tier-2 边界没有回归。** `css-architecture` delta 将 jx-pure Part A
   明确列为唯一有意 unlayered exception；`component-authoring` delta 的
   WHEN 条款仍只要求已迁移 utility-authored slots 使用 `cn()`，未迁移组件和
   Tier-2 classes 没有 `cn()` 义务。该规则与 `openspec/specs/jx-pure/spec.md`
   的 frozen vocabulary 一致。
2. **folder CSS 处理链保持唯一。** D2 和 css delta 仍要求组件内相对
   side-effect import、标准 CSS、`@layer components` + `:where()`，并禁止独立
   `@utility`。P0.1 的 single-load、selector boundary、pseudo/
   `@container` 和 computed-style probe 仍是可执行 gate。
3. **registry dependency 字段没有混淆。** npm 包使用 item `dependencies`；
   `@jixoai/jixoai-theme`、`@jixoai/utils` 等 item 间关系使用
   `registryDependencies`。B14 与 D5.3 的字段选择和现有 `shiki` precedent
   一致。
4. **canonical main 已唯一。** `itemName` 已成为 manifest parent key，
   `canonicalMainSource` 每个 `registry:ui` item 恰一条；toast 的
   `toast-viewport.svelte`、index default export 和 target 都受同一个字段约束。
5. **mirror/payload 双不变量未被合并。** `apps/www/mirror-manifest.json`、
   source-to-mirror parity 与现有 source-to-payload parity 仍是两个独立测试，
   payload path 兼容性也没有被错误地等同于 consumer install 证明。

## 阻塞问题

**未发现阻塞问题。** 当前 registry 仍是 flat、没有 theme font dependencies
和 folder implementation 是预期的“实现前状态”，不是对已实现能力的承诺；修订稿
已经把这些差距转换为 P0/P1/P3 的明确验收条件。

## 非阻塞建议

1. **澄清 P0.2 的 staging 输入。** tasks 顶部写“P0 no moves yet”，但
   `tasks.md:20-28` 又要求 accordion/toast 已落在未来的 folder/index target。
   建议明确 P0.2 使用由 manifest 生成的临时 folder-shaped registry，或将真实
   accordion/toast install proof 只保留在已经写明的 P1.5 full gate；否则执行者
   可能把当前 flat payload 当成 P0 输入。该问题不阻塞，因为 P1.5 已要求在真实
   moved tree 上重跑 accordion、toast 和 code-card。
2. **在 P0.3 mapping 中预先写 code-card owner。** 当前 `code-card` 和
   `@jixoai/shiki` 都携带 `@lib/shiki.ts`。`move-vs-dependency` 与
   `canonical owner` 字段已经提供解决机制，但建议固定一行“唯一 owner + 另一
   item 删除重复 files[] 或明确 identical dedupe 规则”，让 P1.5 的 exactly-once
   断言不依赖实现者临场裁决。
3. **把 manifest schema 从 prose 提升为机器 schema。** `itemName` 已正确标为
   required parent key；可再固定 JSON Schema、每个 file row 的类型、唯一键和
   exception 枚举，使 fail-on-missing/duplicate 错误在脚本外也可复用。
4. **更新草案元数据。** `tasks.md` 顶部仍标记为 DRAFT r5，design/proposal 的
   review history 也未完整记录 r4-r6；不影响合同，但实现归档前应同步轮次。

## 与 r5 的变化

- B14 已从“theme CSS 引入未随 item 安装的 fontsource 包”变为 normative
  `jixoai-theme.dependencies` + 空 consumer manifest/build/compiled-output
  gate；不再只是发现问题。
- B15 已从“只说 full gate”变为 named `code-card` chain case，列出命令、
  target、npm/registry dependencies、exactly-once 和 clobber 断言。
- `itemName` 已成为 manifest 的 required parent key；prerequisite checker
  的最小实现提前到 P3.1，与 P4 复用同一逻辑；fixture 标签已准确区分
  multi-file accordion、non-identical-main toast 和 code-card chain。
- 复核没有发现 B14/B15 修订破坏 B1-B13 的 Tier-2、CSS compiler、canonical
  main、app.css fan-in、mirror parity 或 breaking-layout 合同。

## 评分

- **实现质量：2/10。** 本 change 尚无实现；现有构建只证明 flat baseline，不能
  代替 P0-P4 证据。
- **方案质量：9/10。** B1-B15 的主要边界、字段模型、阶段 gate、真实 consumer
  证明和两轴验收均已可执行；扣 1 分是 P0.2 staging wording、code-card owner
  仍可在 mapping 阶段决定，以及 manifest 尚未升级为独立 JSON Schema。
- **综合参考：11/20**（实现 2 + 方案 9；不是产品验收分）。

## 最终裁决

**Approve（可实现前定稿）。** Owner 批准后才进入实现；实现阶段必须按已写入的
P0.1/P0.2/P0.3、P1.5 和 P3a clean-consumer gates 取得运行证据，不能把本轮
baseline build 当作 change 完成证据。

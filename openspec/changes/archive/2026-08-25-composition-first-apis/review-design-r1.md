# Codex design review — r1 (2026-08-25)

gpt-5.6-terra · xhigh · 13m56s · Herdr agent `design-reviewer`
(w25:p1, workspace zcode-ui-composition-first-apis)

## Verdict: 4.5 / 10 — direction right, protocol not converged

- composition-first 原则：8/10
- 与 shadcn 生态方向一致性：6/10
- Svelte 5 可实现性：3/10
- API 完整度：3/10
- SSR / 动态列表稳定性：2/10
- 验证与迁移闭环：3/10

## Blockers (P0)

1. 目标组件计数矛盾：主清单 15 + alert-dialog/popconfirm 2 = 17，
   proposal 声称 16。
2. Pagination 自相矛盾：proposal 的 audit 行被读作目标规范。
3. Timeline 状态模型未闭合：Dice activeIndex 被引为 precedent 但
   API 只有 item-level pending。
4. Context 注册协议在 SSR/动态列表不可验证：onMount 不在 SSR 执行；
   setContext 必须在初始化阶段；tabs 实为 DOM 委托先例而非注册
   先例；未定义 register/unregister/update/duplicate-id/keyed
   reorder/DOM order/嵌套隔离。
5. Menubar/NavigationMenu 树到面板映射未定义；嵌套 walker 会串层
   （dropdown-menu:115 同样存在该潜在缺陷）。

## Below-ecosystem verdicts (C section)

1. Timeline "slimmed" 低于 Dice UI 的 Dot/Connector/Content 组合性。
2. Menubar/NavMenu 把 trigger/panel 压缩进单一 Item，低于 shadcn
   部件粒度。
3. AlertDialog 只开放 action row，shadcn 已全部件化。
4. 依赖注册顺序而无动态 DOM 顺序协议，比生态的 keyed composition
   脆弱。

## Disposition (r2 revision, all addressed)

- P0-1 → canonical 17-name list in proposal + design.
- P0-2 → proposal pagination line marked TODAY/target explicitly.
- P0-3 → timeline: NO activeIndex ruling documented; ordinal
  precedent kept for steps only.
- P0-4 → family context contract: explicit ordinals (shadcn-vue :step
  law), DOM-delegated walks scoped by closest(), self-matching
  command items, CSS :has group/empty, init-time id-keyed handle
  registration only.
- P0-5 → Item owns the trigger–panel pair (anchor-name wrapper);
  panel self-renders (top layer); walker resolves via aria-controls;
  nested walks scoped via closest('[role=menu]').
- P1-1 → barrel law = tabs precedent, NO Root aliases.
- P1-2 → child({props}) contract specified (merge, semantics
  preservation, interactive parts only).
- P1-3 → blanket props-discipline inheritance + StepsIndicator-is-
  the-button ruling.
- P1-4 → command: label = required match text + accessible name;
  group only via CommandGroup nesting; filter = inclusion only.
- P1-5 → tour metadata ruling; hero real title snippet; toc outline
  prop name + SSR shell behavior.
- P1-6 → verification.md added (gates, per-family matrix, negative
  law tests, SSR fixtures, existing-test migration).
- C → full ecosystem granularity: steps Indicator/Separator parts,
  timeline full Dice anatomy, menubar/navmenu Trigger/Panel parts,
  alert-dialog full composition.

---

# Codex design review — r2 (2026-08-25)

6.0/10 (方向 8.5 · 生态 7.5 · Svelte5 5.5 · 完整度 6.0 · SSR 6.0 · 验证 5.0)。
P0：ToC 嵌套 <a> 非法；Item/Panel ID 配对未定义。P1：filter 谓词类型、
child any、默认部件歧义、verification 分类、负向 grep 不充分、16/17 计数、
outline 类型。C：Timeline 已修正；menubar/alert-dialog 粒度仍低。
处置：全部在 r3 修订（见上 Disposition 增补与 design.md r3 版）。

# Codex design review — r3 (2026-08-25)

7.2/10 (9.0 · 7.8 · 6.8 · 7.5 · 6.4 · 6.0)。P0：ToC SSR 条款与 SSR-complete
矛盾。P1：:last-child 选择器在示例 DOM 不成立、ID 协议精度、child 类型、
ordinal 重复/跳跃语义、command 选择器/降级、门禁脚本不存在、pageRange
token 分支、terminal-header 缺 NavigationMenu 根。C：Breadcrumb/Pagination/
ToggleGroup 达标；Steps 无 Trigger、Menubar 无 Radix 扩展件、AlertDialog 无
Overlay/Portal — 改为精确映射+记录分歧（r4）。
处置：全部在 r4/r5 修订；verify-composition-law.mjs 实际落地（今日 13 违规
= kill list；别名/联合/数组元素解析齐备，terminal-header/toc 双命中）。

# Codex design review — r4 (2026-08-25)

7.8/10 (9.2 · 8.0 · 7.5 · 7.8 · 7.8 · 7.0)。P0：child 契约 design/spec
不一致（联合类型优先级 bug + handler 语义矛盾）。P1：CSS 真实 DOM 选择器、
ID 协议残留文案、探针别名缺口、proposal/tasks 残留。预计修复后 ~8.2。
处置（r5）：per-part 具体元素类型（无联合）、handler 替换语义统一、
data-hook 选择器、ID 协议 r5 全文（碰撞检测、生产确定行为、
NavMenuItem 默认 id）、探针别名解析（联合+数组元素）、
proposal/tasks 同步。

# Codex design review — r5 through r9 (2026-08-25)

r5 7.6 → r6 7.9 → r7 7.9 → r8 7.9 → **r9 APPROVE-FOR-IMPLEMENTATION 8.3**.
轨迹：4.5 → 6.0 → 7.2 → 7.8 → 7.6 → 7.9 → 7.9 → 7.9 → 8.3。

r5 处置：CSS 法则对齐（@layer + :where）、panelId 单键空间、探针
union/别名强化、基线 15 同步、command 谓词化 + disabled 三锁。
r6 处置：探针 heritage/无参别名数组（两处真漏检，Codex 更强 fixture
暴露）、注册键跨文档统一（family-defined derived key）、walk 选择器统一。
r7 处置：propsOf heritage 合并、arrayElementsOf sf 参数崩溃修复、
--self-test 四 fixture 可执行化、轮次标注清理。
r8 处置：--self-test 进正式 Gates（两段式：self-test 绿 → 探针 0）。
r9：无剩余 P0/P1；生态判断：Steps/Timeline 达参考生态 anatomy，Command
自匹配+disabled 三锁严谨；四处分歧（Steps 无 Trigger、Timeline 无
activeIndex、NavMenu 无共享 Viewport、AlertDialog native-dialog 形态）
均已记录为设计裁决。

批准时的机器证据：openspec validate --strict 通过；--self-test 四 fixture
双命中退出码 0；正常探针 15 violations = 实现前 kill-list 基线；实现
完成门禁 = 0 violations。

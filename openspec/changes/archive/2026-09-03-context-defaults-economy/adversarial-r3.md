# 自对抗审查 r3（ZCode 学 codex 思维，2026-09-03）

> Owner 指令：「修订完后，先自己学 Codex 的思维，自己对做对抗审查」。
> 本文件是 r3 修订后的第一轮自审记录（方法 + 发现 + 处置），供
> codex 二轮对照——自审不是替代复核，是把送审前的共识面打磨到
> 最密。

## 方法（从 codex r1 复核提炼的思维骨架）

1. **可执行性优先**：问「Apply 之后，实施者能否无歧义实现并验
   证」——不评设计优雅，评合同闭合。
2. **行号实证**：每个断言对照真实文件；读不到原文的引用不改写
   （r2 教训：variant grammar 场景体被我无实证重写）。
3. **类型是否兑现文字**：凡文档说「只能 X」，找类型级/运行时级
   双证据；只写文字不写断言 = 没兑现。
4. **生命周期全枚举**：模块加载 / SSR / 纯单测 / 组件窗口四态
   都要有定义。
5. **范围 vs 裁决一致**：缩范围必须有版本化、可门禁的分类载体。
6. **spec 法律完整性**：MODIFIED 必须保留式，场景体不得凭记忆
   重构。
7. **门禁可落地**：输入/输出/schema/fixture/注册位/切换点，还
   有——禁令会不会误伤合法惯用法（拿真实调用者名单验证）。
8. **依赖方向**：lib → ui 反向依赖是 registry 架构的死罪。
9. **计数与命名**：与实物对账。

## 发现与处置（F1–F6，全部已回修入 r3 文档）

| # | 发现（codex 视角的问题） | 证据 | 处置 |
|---|---|---|---|
| F1 | 品牌槽只有类型级，cast 伪造可绕过——kernel 对应物是类型+运行时双保险 | design 工具节 vs context-plugin.svelte.ts:259-270 注册守卫 | design 增加「defineComponentDefaults 运行时校验 brand」；delta 槽合法 requirement 与 verification 同步 |
| F2 | 「轴内部异常必须上抛」与 density.svelte.ts 现状矛盾——pluginScope catch-all 吞一切（文件头明文，遗留缝语义） | design 惰性律 vs density.svelte.ts:63-71 | 措辞改为「新槽机制不扩大吞错范围」；强合同限定新建轴模块；density 遗留缝明示不改写 |
| F3 | `paintSlot(own: PressButtonVariant)` 造成 lib→ui 反向依赖；且 Badge/Chip 等家族各有 union | design API 草图 vs registry 架构（轴值域应归轴所有） | `PaintVariant` union 移入 lib/paint.svelte.ts，press-button 变别名再导出；paintSlot 泛型化 |
| F4 | literalSlot 强制 own——absent 有语义的样式 prop（未设=原生行为）无法入契约 | 分类合同「每个样式 prop 必有槽」的完备性 | `literalSlot(own?)`：无 own 形态出参含 undefined；delta 补 absent 场景 |
| F5 | 门禁禁令会误伤 10+ 个 inherit-then-provide 容器（tabs/table/list-item/command/chart…经 grep 实证）；「每个 prop 可追溯」是静态不可判的过度承诺 | design 门禁断言 3 vs grep provideDensity 命中 10 文件 | 可检查合同 = 三条合取（resolve 调用存在 + 禁用通道缺席 + slots 覆盖）；白名单增 kind:`provider`；静态不可判边界如实声明 |
| F6 | variant grammar 的「a variant utility set is audited」场景体被我 r2 凭记忆重写（正是 codex 批的覆盖式改写）；registry delta 的 @lib target 语法未经验证；8/78 页计数混合了组件数与页数 | sed 实读 living spec L560-564 vs r2 delta | 原场景体逐字恢复 + 新场景并列追加；target 措辞收敛为「照抄 density 先例，不发明语法」；计数改为「8 页受保护，页总数以 verify-docs 实测为准（约 79）」 |
| F7 | `paintSlot<T extends PaintVariant>(own: T)` 的字面量推断把槽收窄到 own 值（slot 只剩 'outline' 可传）；`literalSlot('auto')` 同病——泛型 own 被字面量收窄，resolve 传全 union 直接编译错 | 纸面推演 + tsc 严格模式复现（/tmp/defaults-sig-r3.ts，exit=0 五负断言全消耗） | paintSlot **去泛型**（轴拥有固定 union）；literalSlot **显式类型实参**携带 union（`literalSlot<SurfaceVariant>('auto')`）；design API 草图更新并标注 tsc 实证 |

## 自审后的残留风险（如实声明，不装作零风险）

1. **类型推导的运行时验证仍部分缺席**——修正版签名（F7 处置后：
   never-args 约束 + brand + 非泛型 paintSlot + 显式实参
   literalSlot）已 tsc 严格模式实证（exit=0，五负断言全消耗）；
   但完整工具（含运行时 brand 守卫与 $derived 场景）待 1.0/1.1
   落地时以套件实测。若完整实现遇阻，降级路径已在（显式泛型
   标注）。
2. **双键过渡期的第三方旧键消费者**（仓外）在旧键退役节点才受
   影响——退役本身是后续版本节点，本 change 只双写不删除，风险
   延后且有 census 依据。
3. **静态可判边界**：不触禁用通道的新造内联解析无法被门禁捕
   获——以「slots 覆盖即声明」补位，code review 兜底。此边界已
   写进合同，不是隐藏缺口。
4. 86 件的放量波次中，list-item 家族体量最大（ItemGroup/ItemField/
   适配器群），已标注可拆独立子批。

## 自审结论

r3 相对 r2 的实质增益：11 个 codex 阻塞全部有对应合同条款与验证
义务；自审另闭合 6 个 r2 残留（含 1 个我复犯的「无实证改写」错
误——已把「读不到原文的引用不改写」写进方法清单第 2 条）。残留
风险 4 项均有明示的兜底或延后路径。**送审就绪**：建议 codex 二
轮以「合同闭合度 + 残留风险是否可接受」为主镜头，重点复核 F1-F6
的处置与类型签名的纸面推理。

---

# r4 勘误与 codex 二轮消化（2026-09-03）

codex 二轮：**REVISE 6.0/10**（较 r2 的 5.0 实质改善；元判断——
r3 把问题从「缺失」推进到「有条款但不可执行」）。11 阻塞 + 3 新发
现全部消化为 r4：

1. 运行时 brand 守卫 → 类型 brand + **工厂产品 WeakSet 双机制**
   （反射复制不可绕）+ 三 fixture。
2. 惰性律 vs density 裸 catch → **pluginScope 收窄为仅捕 lifecycle**
   （其注释意图的忠实化）+ 双路径负 fixture。
3. PaintVariant family availability → `paintSlot<FamilyVariant>`
   **显式类型实参**（家族窄 union 表达冻结表，link 仅 PressButton）
   + 门禁 availability 一致性断言。
4. literalSlot 两形态 → **重载**（有-own 无 undefined / absent 含
   undefined），均显式类型实参。
5. provider kind → **唯一 schema**（bindable/passthrough/no-style/
   provider），provider 只豁免 bypass 不豁免存在性/覆盖/presence。
6. 双键兼容 → 共享 helper `providePaintZone`（同步双写）+ **读取侧
   旧键兜底**（external old-only 场景闭合）+ 五态矩阵。
7. 三条合取 → **承诺如实降级为 family 级覆盖** + 空调用负 fixture，
   per-prop 数据流归 code review（声明边界）。
8. MODIFIED → density 与 variant grammar **全文逐字保留**，仅解析
   条款带 [MODIFIED] 标注，新增场景带 [ADDED]。
9. F7 证据 → 仓内 fixture `test/defaults-types.spec-d.ts` + 载体
   **固定为 vitest --typecheck**（tsc 不认 .svelte 模块，二选一
   取消）。
10. registry → 文件/镜像/依赖对照表 + 三个 item 的安装闭包变更 +
    lib→ui 反向依赖零容忍断言。
11. 未决选项清零：typecheck 载体、icon-button（复述）、sheet
    （ship defaults、不接线）、verify-all 插入点（mirror 后）全部
    固定；proposal 同步 v1 双轴。

**自审记录勘误**：本文 F3 处置原文写「paintSlot 泛型化」，F7 写
「去泛型」——r4 终态是**保留泛型但强制显式类型实参**（X2-3 与 F7
的合流：泛型让家族窄 union 表达 availability，显式实参避免 own 字
面量收窄）。Apply 以 design.md r4 的签名为准，本文历史记录不作为
实现依据。

---

# r5：codex 三轮消化（2026-09-03）

三轮：**REVISE 6.2/10**（X2-8 全文保留、X2-11 决策层判闭合；剩余
收敛为纯技术落点）。r5 处置：

- **X3-1 跨模块登记**：唯一构造器 `defineAxisSlot(name, resolve)`
  导出于 defaults.svelte.ts、AST 门禁限 lib/**（登记边：defaults
  ←paint←density），不再要求「不可导出」这种不可执行措辞。
- **X3-2 错误判别**：共享谓词 `isLifecycleOutsideComponentError`，
  匹配规则冻结为 `e instanceof Error && e.message ===
  'lifecycle_outside_component'`（Svelte 大版本升级检查单收录）。
- **X3-3/X3-4 类型强制**：**NoInfer 签名族**（TS≥5.4）——
  `paintSlot<T extends PaintVariant = PaintVariant>(own: NoInfer<T>)`
  省略实参落全集（F7 收窄 footgun 根源消除）；`literalSlot<T
  extends {} = never>(own: NoInfer<T>)` 省略实参编译错（真强制）；
  `T extends {}` 排 nullish。示例同步 `paintSlot<PressButtonVariant>
  ('outline')`。
- **X3-5 provider 静态边界**：旧 helper 只允许出现在 provider 函
  数实参子树内（冻结形态 `provideDensity(() => resolveDensity(…))`），
  同文件越界直读反例。
- **X3-6 helper 职责切分**：`providePaintZone` **只写新键**；旧键
  BUTTON_GROUP_KEY 由 UI provider 自写（orientation/separator/
  r14-10 原样）——lib 中立，payload 完整性责任归拥有者。
- **X3-7 空调用语法**：仅拒裸 ExpressionStatement；赋值/return/
  展开/模板四形态接受，逐形态 fixture。
- **X3-9 接线冻结**：apps/www `test:types` → vitest --typecheck +
  typecheck.include spec-d.ts；根 package.json 委托；verify-all
  数组 mirror 后插 `verify:context`（按实际数组点名）。
- **X3-10 registry 命名冻结**：item `defaults` + `paint`（平名
  registry:lib，utils/density/entity 先例）；registry delta 后缀
  笔误修正（.svelte → .svelte.ts）；fresh-consumer 验证挂
  verify:shadcn-add。
- 新发现清理：proposal 重复编号 4 修复 + 「轴工厂或字面量」措辞
  对齐 brand-only；design/tasks 标题 r3→r5；variant-grammar 引用
  路径更新为 archive 真实位置（原 living spec 引用已因归档过时，
  delta 内以 [path updated] 标注）；尾随空格清除。

**r5 勘误（tsc 实证修正）**：上文 NoInfer 处置初稿写「paintSlot
省略实参落 PaintVariant 全集（安全默认）」——tsc 实测推翻：
`NoInfer<T>` 且无推断位点时 TS 落 **never**（不使用声明默认
值）。终态修正为全槽工厂统一 `= never` 真·强制（省略即编译错，
正是 X2-3 要求的「真正不可省略的签名」）；absent 形态独立为
`absentSlot<T>()` 避开重载解析歧义。验证：tsc 严格模式 exit=0，
五负探针（paintSlot 无实参 / literalSlot 无实参 / null /
resolve null / Badge 越界 link）全消耗。fixture 内容以
test/defaults-types.spec-d.ts 为准，本文历史描述不作为实现依据。

---

# r6：codex 四轮消化（2026-09-03）【本文档此后按轮次追加；r5 之前的
历史小节一律视为 archival，不作为实现依据】

四轮：**REVISE 6.3/10**（X3-2 谓词、X3-7 空调用语法、X3-10 registry
命名、X2-8、X2-11 判闭合）。r6 处置 6 阻塞 + 2 新发现：

- **X4-1** defineAxisSlot 完整泛型签名（resolver 协议 `(explicit,
  ambient-getter) => T`、构造时机、name 用途）；AST 扫描域明确为
  canonical 树（registry/files/**），字节镜像无需例外条款。
- **X4-2** 文档签名统一到 `= never`；absentSlot 无参数无法用
  NoInfer 强制 → AST 补位：家族 defaults 文件内槽工厂调用必须带
  显式类型实参（typeArguments.length > 0）。
- **X4-3** provider 静态边界扩展到仓内真实形态：$derived 子树与
  provider 实参子树同权（`const r = $derived(resolveDensity(...));
  provideDensity(() => r)` 是文档化惯用法）；处理器/模板/普通语句
  直读仍失败。
- **X4-5** providePaintZone 签名冻结（getter 背书
  `() => ZonePaintVariant | undefined`）；双键反应性断言。
- **X4-6** 命名统一：npm script `verify:context`（文件
  verify-context-coverage.mjs 不变），proposal/tasks/design/
  delta/verification 全量同步。
- **X4-新发现（ambient 值域泄漏）**：zone 值域收紧为
  `ZonePaintVariant = Exclude<PaintVariant, 'link'>`——link 是
  PressButton 的交互例外而非 paint 层级，zone 默认到 link 无语义；
  Badge-under-link 构造上不可能（编译错），旧键 fallback 的仓外
  异值由家族槽运行时兜底（落 own + dev warn）。
- 示例残留清理（design 惰性律示例、delta 两处、tasks 1.2 旧签名、
  sheet「或」语句）+ 本文档历史小节标 archival。


---

# r7：codex 五轮消化（2026-09-03）

五轮：**REVISE 6.5/10**（评审仅 7m40s，收敛加速；X3-2/X3-7/X3-10/
X2-8/X2-11 维持闭合）。7 阻塞处置：

- **X5-1** defineAxisSlot AST 域统一 canonical
  `registry/files/lib/**`（镜像不参与构造检查），design/tasks 同步。
- **X5-2** 类型实参 AST 规则限定泛型工厂（literalSlot/absentSlot/
  paintSlot），densitySlot 非泛型豁免；tasks 补 `= never`。
- **X5-3** tasks/verification 的 provider 边界同步到「实参子树或
  $derived 初始化子树」双形态。
- **X5-4** 示例统一 `providePaintZone(() => effectiveVariant)`。
- **X5-5** provider 值域收窄：ButtonGroup/ButtonVariantScope 的
  variant prop → `ZonePaintVariant`（link 不再是 zone/组默认，只经
  PressButton 显式 prop 到达；`<ButtonGroup variant="link">` 变编译
  错——语法上正确的 breaking，fixture 固化）。
- **X5-6** 运行时守卫可执行化：paintSlot 增 `values` 参数
  （`as const satisfies readonly T[]` 编译期锁死数组⊆类型），
  ambient ∉ values → own + 冻结 warn 文本。
- **X5-7** design 门禁标题残留修正（verify:context）。
- 新发现：absentSlot 归入 literal 分类（delta 措辞）；WeakSet
  fixture 计数统一为四。

---

# r8：codex 六轮消化（2026-09-03）【r7 及之前小节均 archival】

六轮：**REVISE 6.6/10**。8 项处置（全为同步残留 + 三个小决策）：

- X6-1 paintSlot 二参合同全载体同步（design 惰性示例/tasks/delta
  场景）+ 门禁二参与 values 载体断言。
- X6-2 verification 的 provider 边界同步双形态。
- X6-3 tasks「全部槽工厂 never」宽泛表述精确化（literalSlot/
  paintSlot = never；absentSlot 仅 AST；densitySlot 豁免）。
- X6-4 literal-family（literalSlot|absentSlot）在 proposal/design/
  分类说明全量同步。
- X6-5 provider 继承 link 合同：写新键前收窄（link → undefined，
  旧键专属语义），external-old-link + dual-provider 负 fixture。
- X6-6 warn 文本去占位符逐字冻结；undefined 不触发；门禁断言
  values ≡ 冻结 availability union 双向相等（漏值/多值 fixture）。
- X6-7 WeakSet fixture 名实统一：运行时三件 + AST 边界一件。
- X6-8 roadmap 分类载体：豁免白名单增 kind `roadmap`（prop +
  目标轴 + reason），四类分类全部有门禁载体。
- 维护：design 标题 r6→r8、tasks 依赖图 r5→r8、adversarial r6
  小节归 archival。

---

# r9：codex 七轮消化（2026-09-03）

七轮正式结论：**REVISE 7.2/10**（最大单轮涨幅；仅剩 2 阻塞且均为
living-spec delta 同步）：R7-1 variant grammar MODIFIED 段一参签名 →
二参（own, values）；R7-2 zone provider 契约补继承 link 收窄条款
（旧键继承 link → 新键 getter undefined，旧键保留原值；双负
fixture）。非阻塞两条一并清：proposal/registry 工具族名单补
absentSlot；verification 增「有类型实参但缺 values」专项负探针。

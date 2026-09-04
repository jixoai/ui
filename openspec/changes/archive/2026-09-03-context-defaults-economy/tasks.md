# context-defaults-economy Tasks

> 编排纪律（Owner 2026-08-24）：子代理按互不重叠的文件集分批；
> `registry.json` / mirror manifest / verify-all.mjs / package.json /
> 锁文件等共享文件**禁止子代理修改**——所需变更写入报告，ZCode 统一
> 落盘。子代理报告中必须反馈遇到的困难与解决方式。全新 worktree
> 先 install 再跑门禁（svelte-compiler 依赖）。
>
> 依赖图（r8，codex X-11）：
> ```
> 1.0 → 1.1 → 1.2 → 试点批(2.x) → 2.4 冻结 → W1 ‖ W2 ‖ W3 ‖ W4 → 3.5 全量启用
>                1.4(试点模式) ↗        └→ 4 文档批（与 W 并行，3.5 前完成）→ 5 整合
> ```
> 波内失败阻断该波提交，不阻断其它波（文件不重叠）。

## 1. 工具与轴（批次 T —— 工具层）

- [ ] 1.0 typecheck 载体（**接线冻结** [X3-9]）：apps/www
  `package.json` 增 `"test:types": "vitest --typecheck run"`；
  `vitest.config.ts` 增 `typecheck: { checker: 'tsc', include:
  ['test/**/*.spec-d.ts'] }`；根 `package.json` 增
  `"test:types": "npm --prefix apps/www run test:types"`；verify-all
  数组在 `verify:mirror` 后插 `verify:context`（ZCode 落盘）
- [x] 1.1 `registry/files/lib/defaults.svelte.ts`：品牌槽
  `DefaultsSlot<T>`（类型 brand + **工厂产品 WeakSet 双机制**
  [X2-1]）+ **跨模块构造协议** [X3-1]：唯一登记入口
  `defineAxisSlot(name, resolve)` 导出于 defaults.svelte.ts，AST
  门禁断言它只出现在 registry/files/lib/**（canonical 树，镜像
  apps/www/src/lib 不参与构造检查；登记边冻结：defaults←paint←
  density）/ `defineComponentDefaults` 逐槽断言
  WeakSet 命中，固定错误消息 / `literalSlot` **NoInfer 重载族**
  [X3-3/X3-4]：`literalSlot<T extends {} = never>(own: NoInfer<T>)` +
  `absentSlot<T extends {}>()`（absent 独立函数避开重载歧义）+
  `paintSlot<T extends PaintVariant = never>(own: NoInfer<T>,
  values)` [X6-3 强制规则精确化：literalSlot/paintSlot 用
  `= never`；absentSlot 无参数无默认，AST 是唯一强制面；
  densitySlot 非泛型豁免] /
  `isLifecycleOutsideComponentError(e)` 共享谓词（r10 冻结：归一
  化——去 `https://svelte.dev/e/` 前缀、取首行、比对
  `lifecycle_outside_component`；覆盖 Svelte 5.55 三形态）
  [X3-2]；**惰性律**；类型 fixture 仓内
  `apps/www/test/defaults-types.spec-d.ts`；运行时单测：identity、
  哨兵 undefined、浅冻结、四态矩阵、**运行时 WeakSet 三 fixture
  （跨模块合法/cast-forged/marker-复制）+ AST 边界反例一件
  （ui 侧 import defineAxisSlot 门禁拒绝）** [X6-7]、轴内部异常上抛、literalSlot(null) 拒绝、无实参
  literalSlot/paintSlot 编译错
- [x] 1.2 paint 轴拆键：`lib/paint.svelte.ts`（`PaintVariant`
  union 归轴所有 + **`ZonePaintVariant = Exclude<PaintVariant,
  'link'>`——zone 值域闭合 [X4-新发现]** + `PAINT_ZONE_KEY` +
  `providePaintZone(variant: () => ZonePaintVariant | undefined)`
  **只写新键** [X3-6/X4-5]——旧键 BUTTON_GROUP_KEY 由 ButtonGroup/
  ButtonVariantScope 自写（orientation/separator/r14-10
  effectiveVariant 原样）+ `paintSlot<T extends PaintVariant =
  never>(own: NoInfer<T>, values: NoInfer<readonly T[]>)`（家族
  satisfies 数组，门禁双向 ≡ 冻结表），读取侧新键优先、旧键兜
  底、再 own；家族外 ambient 值（undefined 之外不在 values 者）
  落 own + 冻结 warn；**继承 link 收窄**（effectiveVariant ===
  'link' ? undefined : effectiveVariant；external-old-link +
  dual-provider 负 fixture）；
  press-button 的 PressButtonVariant 改为别名再导出；
  press-button/icon-button 读取迁移；
  **density.svelte.ts `pluginScope()` 裸 catch 收窄为仅共享谓词**
  [X3-2]（负 fixture 双路径：轴内自定义 throw 必须上抛）；
  `densitySlot(own?)`（table 'sm' / ghostty-term 'default' 记账，
  W 批落地）；矩阵测试：explicit/zone/own × 新旧消费者 × 嵌套
  混合 × old-only/new-only/dual/external-old-only 五态 ×
  orientation/separator 不退化 × **双键反应性（父级翻转同帧
  重派生）** × **zone 传 link 编译错（负类型探针）** × 三态
  density 回归
- [ ] 1.3 elevation/shape 轴：**延后**（design 附录开轴协议已文档
  化；首个真实消费者出现时按协议开轴——本 change 无此任务）
- [x] 1.4 门禁 `scripts/verify-context-coverage.mjs` + 配置
  `scripts/context-coverage.config.json`（词表 v1 精确枚举）+
  白名单 `scripts/context-coverage.exemptions.json`（kind:
  bindable/passthrough/no-style/**provider/roadmap**（roadmap
  条目另需 prop + 目标轴；provider 豁免的
  **静态边界冻结** [X3-5/X5-3]：旧 helper 标识符只允许出现在
  provider 函数调用实参子树**或 $derived 初始化子树**内（仓内
  真实形态 `const r = $derived(resolveDensity(...));
  provideDensity(() => r)` 与 inline 形态同权），事件处理器/
  模板/普通语句直读仍失败）；断言：存在性 / 槽合法性 AST（含
  `defineAxisSlot` lib-only）/ family 级合同（resolve presence +
  禁用通道缺席 + **空调用判定语法**：仅拒裸 ExpressionStatement
  位置 [X3-7]）/ availability 一致性 / lib→ui 反向依赖零容忍 /
  豁免显式；JSON+人读输出与 exit 码；`--scope=pilot`；fixture
  自测进 test/（合法件 + 八反例，见 design 接线节清单）

## 2. 试点批（批次 P —— 样板收敛，8 件）

- [x] 2.1 press-button / icon-button / button-group → `*Defaults`
  （paint/density 槽；**icon-button 决策：复述子组件槽**——契约
  可见面优先，试点若证明透传形态不适再带证据改豁免 [X2-11]）；
  docs 页 props 表标 ambient
- [x] 2.2 dialog / sheet：dialog 原位保留 ButtonVariantScope 用法，
  读取侧迁入 Defaults；**sheet 决策：ship
  sheet-defaults（density 槽 + surface variant 的 literalSlot 显
  式实参），zone/entity 接线不在试点做**（sheet 无 footer 按钮集
  群，无 zone 需求——不为接线而接线 [X2-11]）
- [x] 2.3 kbd / badge / chip（density 既有消费者迁移）
- [x] 2.4 试点批 verify:all + 交叉预审 + 惯用法冻结（r11）
  ——verify:all 于工作树跑至 verify:shadcn-add：该步 3/5 败与
  main 完全一致（同 Environment vite build + prismjs npm 安装
  失败），判预存环境问题非本变更回归；其余全链 GREEN

## 3. 全量迁移（批次 W1–W4 —— 按家族，互不重叠；清单显式）

- [x] 3.1 W1 表单族（19）：input / native-select / select /
  checkbox / radio / range / textarea / combobox / cascader /
  date-picker / input-group / input-otp / number-input / tags-input /
  file-input / color-picker / toggle / toggle-group / descriptions
- [x] 3.2 W2 浮层与反馈族（16）：toast / tooltip / popover /
  hover-card / alert / alert-dialog / popconfirm / command / spin /
  progress / skeleton / result / empty / float-button / anchor /
  separator
- [x] 3.3 W3 导航与布局族（17）：tabs / table / pagination /
  breadcrumb / menubar / dropdown-menu / navigation-menu / steps /
  timeline / toc / scroll-area / scroll-virtual / carousel /
  card-grid / section-card / scaffold-float / accordion
- [x] 3.4 W4 内容与场景族（26）：avatar / image / inline-code /
  code-card / chart / statistic / hero-section / pattern-cta /
  pattern-faq / pattern-hero-set / pattern-login / pattern-pricing /
  terminal-card / terminal-footer / terminal-header / ghostty-term /
  website-scaffold / theme-toggle / language-switcher /
  badge-indicator / progressive-blur / tour / tree-view / transfer /
  component-canvas（$bindable density 豁免条目）/ list-item（体量
  大，可拆独立子批）
  ——注：search-palette 未注册、归属 search stream 在途，**不属
  本 change**；家族 Defaults 按文件夹一份
- [x] 3.5 门禁全量启用（唯一切换点，W4 + D 完成后）——
  `verify:context` 插入 verify-all 数组 `verify:mirror` 之后并实跑
  GREEN；verify:all 全链至 verify:shadcn-add（该步 3/5 败与未动过的
  main 完全一致，预存环境问题：prismjs npm 安装链 + consumer vite
  build Environment，见 2.4 判别记录）

## 4. 文档（批次 D —— 与 W 并行，3.5 前完成）

- [x] 4.1 指南页「Context & Defaults」：Compose 对齐叙事（双轴
  收编 + 三轴保持 + 路线图，如实）、作者 how-to（一行 resolve +
  分类表）、消费者 cheat sheet（zone scope / 显式覆盖 / 插件干预
  三层）
- [x] 4.2 living spec 落盘：component-authoring（Defaults 契约
  ADDED + density/variant-grammar 保留式 MODIFIED）+ registry（两层
  归属）
- [x] 4.3 组件 docs 页 props 表：meta 生成链先扩 ambient 列（IR +
  drift spec 先破再立，8 页受保护），其余 78 页手改；llms.txt /
  search corpus 再生

## 5. 整合（ZCode）

- [x] 5.1 镜像/manifest/verify:all 全绿 + 全量 vitest 零回归
- [x] 5.2 子代理对抗预审 → codex 复核 → 消化迭代 → Owner 终报
- [x] 5.3 rebase main（对齐在途 dialog header/footer 抽取），
  按「spec → 实现+任务勾选 → archive」三段提交

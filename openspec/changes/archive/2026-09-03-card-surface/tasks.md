# tasks — 2026-09-03-card-surface

- [x] 1. **card 家族落盘**（6 文件，src + registry 镜像）：card.svelte
      （zone/印章/actions 插槽/foot raw 传输/scroll 声明/诚实头存在）、
      card.css（整数格位 + minmax(0,1fr) 防炸列 + 骑行缘分隔线 +
      grid-tenant 版滚动法则 + 头网格）、card-header.svelte（title 面，
      密度公式内垫）、card-footer.svelte + card-footer.css（start/end
      双缘经济 + leadingSeam ButtonGroup 复刻 + 窄屏反转）、index.ts 桶。
- [x] 2. **card-grid foot 模式**：`foot` prop → `data-rows="foot"` 显式
      声明第三共享行（`auto 1fr auto` + `span 3` + no-subgrid 重置）；
      默认两行契约逐字节不动；registry 描述的 260px→320px 陈年漂移顺手修。
- [x] 3. **打印 keep 链**：kernel-print 分隔线 keep 扩裸逗号列表
      `[data-jx-section-sep], [data-jx-card-sep]`；paper 投影经
      `section.bg-card` 免费继承；gate 断言同步。
- [x] 4. **测试**：card.spec.ts 18 用例（css 法则正则 + DOM 契约：
      印章/区序/actions 插槽无内建关闭钮/foot raw/CardFooter 三槽/
      无头诚实/scroll 声明/密度公式/无 sm: 视口内垫/根无 @container）；
      card-grid.spec 补 foot 模式断言与负断言；density familyRoots
      += 'card'；fixtures card-host.svelte（含 CardGrid foot 组合）。
- [x] 5. **接入链**：registry.json item（layout 组，deps:
      jixoai-theme/separator/button-group/utils）；镜像 + manifest
      （105 items / 373 pairs）；public/r payload；文档页 card.html
      （Intro→Install→Usage→Canvas→foot 灵活性→grid 组合→types/a11y/
      theming(DensityDemo+TokenTable)/api×3 PropsTable）；prerender
      entry；蓝图场景 scenes/card.svelte + build:blueprints；
      taxonomy 快照 layout:13→14（96 ui items）。
- [x] 6. **两起实测回归的根治**（浏览器二分定位）：
      (a) foot 网格 body 塌零——scroll 法则移到 cell（zone 纯占位）
      且 zone 永不写 min-height:0；(b) subgrid 行解算整体失效——
      根上的 @container（container-type: inline-size）是元凶，
      容器名下沉到 foot zone。两条法则已入 spec + 测试锁定。
- [x] 7. **PADDING 保真纠偏（Owner 2026-09-03 晚："怎么会出现 padding 呢？
      我都明确在 Dialog 里面设计好了"）**：先在 dialog 页面点开实测
      取证——head 内容 14/10、body cell 14/14、**foot 0/0 且按钮组
      贴面板边缘（inset 0）**。card 三处内容面全部改回 dialog 原样：
      CardHeader `px-3.5 py-2.5`、body cell `py-3.5 +
      px-[max(0.875rem-scrollbar-thin,0)]`、CardFooter **FLUSH**
      （撤销自创的密度公式内垫——发明内垫违背 dialog 的
      "zone 不画、内容自管几何"法则）；raw start/end 槽内容由消费
      者自管内垫（文档演示与蓝图场景已示范）。密度采纳随之撤回
      （card 定位 = dialog 同款的固定面），density familyRoots 去
      card，card.html 撤 DensityDemo。card.spec 改为 dialog 原样
      断言（含 foot 无任何 padding 的负断言）。修正后 card 页实测
      三值 = dialog 实测值逐项一致；vitest 1662/1662、
      verify-print 34/34、mirror GREEN、docs lint 绿。
- [x] 8. **THE INLINE RULER（Owner r2 2026-09-03 深夜："jx-card-foot-start
      这里如果要放文字，是要有 padding 的…buttons 在内部使用了
      padding…升级成 grid+subgrid。请从设计师的角度出发"）**：
      根 5 轨命名列（inset/start-seat/fill(min 10px=旧
      column-gap)/end-seat/inset）；head/foot zone 以 subgrid 列租用
      （body 全出血例外——滚动条宽度对轨道不可见）；被动文字进
      内容线（head 面与 foot 文字座位的 14px 由轨道供给，面只留
      py-2.5 块律），边缘骑士（actions 插槽、按钮簇）span 到 -1
      justify-end 骑缘（dialog footer 按钮 40px/padding 0 12px 自带
      经济，实测取证）；`.jx-card-head-grid` 包装层与 space-between
      foot 网格退役；CardFooter wrapper 在 zone 内 display:contents
      溶解（独立面保留同轨道模板作 fallback）；窄卡反转改原生
      @container css（簇 row1 全幅 stretch + 文字座内容轴堆叠）。
      容器法移回根 + 租约护栏（in-grid container-type: normal）。
      新发现并锁定 **跨行共享法则**（实测：115px foot 簇把 head 行
      line 4 推宽）：内容轴终点用 card-inline-end（内缩线），绝不
      用 card-content-end。card.spec 全面重写为 ruler 断言（23 项）；
      镜像/payload/文档律文同步。
- [x] 9. **THE BAND-HEIGHT LAW（Owner r3 2026-09-03："button 是 40px，
      但是 data-jx-card-foot 是 44px，被文字撑开了"）**：选修复 1（文字
      不再提供 padding-block，垂直居中 riding）——修复 2（按钮撑满）违背
      上一轮定下的"buttons 在内部使用了 padding"法则（按钮自带经济，
      卡片无权覆盖，且会偏离 dialog 的 40px 按钮基准）。文字座位
      py-2.5 全部退役：文字 RIDES the band（zone align-items:center），
      never SIZES it；纯文字 foot 诚实收缩为行盒高。连带发现并修复
      克隆偏差：根行 auto auto auto → **auto minmax(0,1fr) auto**
      （dialog 的 [body] 行法则原样——body 是唯一弹性吸收者；实测
      曾见拉伸上下文把 +16px 富余经 align-content:stretch 均摊给
      每行各 +5.33）。spec 断言同步；镜像/payload/构建/实测全过。
- [x] 10. **THE CARVED-CELL LAW（Owner r4 2026-09-03："给人的感觉是
      在 foot 那边切出一些区域作为按钮的…容器被撑高之后，它就不是
      切出一块，而是挖出一块"）**：底部按钮簇 = 从卡上切出来的区域
      （分隔线=顶缘、leadingSeam=雕刻左缘、块高=带高），不是漂在带里
      的浮动件——簇永远垂直填满带。实现是原生填充链：座位
      align-self:stretch + display:grid → 组是座位网格唯一项（默认
      stretch，组自身 items-stretch）→ 按钮 min-h-[--jx-hit] 是地板
      不是天花板。头部动作位不受此律：它是"角"（align-self:start，
      dialog × 原样），只有 foot 雕刻。r3 的"按钮永不拉伸"措辞废止
      （地板语义取代）。实测：常态 40/40 零回归；注入 64px 内容→
      带 88、按钮 88、上下 flush 0/0。spec/律文/文档同步。
- [x] 11. **THE REAL-DOM SEAMS（Owner r5 2026-09-04："你用 ::before 来
      实现分割线，而且这个分割线还挂在 button 内…这不是 ButtonGroup
      吗？我更希望上真正的 DOM 来做分割线"）**：ButtonGroup 级法则
      升级（card 评审触发，dialog 同享）。伪元素时代（r13 seam +
      r14-13 leadingSeam）整体退役：leading seam 改为组声明渲染的真
      首子元素（children() 之前，Svelte 拥有）；按钮间分隔线由组
      运行时注入真实 `<span data-jx-btngroup-sep aria-hidden>`（children
      snippet 不透明，Svelte/CSS 无法插叙，DOM 可以）。墨法不变
      （backdrop-filter contrast(0.5)，零色通道）；几何走 divider 的
      诚实 1px 轨道律（真轨道 + flush 接缝，-1px 叠合在 grid 里塌零）。
      与 measure 机器集成：kids 过滤排除 sep、natural 计入 sepPx、
      wrap 换行交错列位（成员偶数轨 2c+2、seam 走奇数轨、leading 居
      轨 1）、collapse 可见性与 ⋯ 触发器接缝。**盒幂等性**（真 DOM
      分割线有布局 footprint，伪元素时代免费拥有的性质必须挣回来）：
      syncSeps 差分同步（只增删变化节点）+ measure 预检守卫（无变更
      零 DOM 碰触）——否则测量姿势的清空/重建会自激 RO 死循环
      （实测复现并根治）。jsdom 静态路径照常注入。已知既有怪癖
      （非本轮回归，记录待查）：挂载期字体未稳可使组进入单行 wrap
      态后 min-content 冻结盒子、后续收缩不再触发重排——修复方向
      是组的 min-width 审计。镜像/payload/构建/测试同步；
      card+dialog 实测 DOM 形态 [SEP,BUTTON,SEP,BUTTON]（leading
      为组第一子元素）、墨法/几何与旧渲染一致。

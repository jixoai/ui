# Design — carved-action-band

## The ruling and the shape

Owner 的两条验收意见（2026-09-09）指向同一个缺口：动作带的
**纵向填充**与**线即带缘**。carved-cell 法则（card-footer.css
`.jx-card-foot-cluster`：`align-self: stretch` + 跨终缘 inset +
ButtonGroup items-stretch + min-h 下限）在 Card/Dialog foot 上已经
是验收过的形态；缺的是把它当成**通用动作带形态**而不是 Card 家族
私产。

## Why CardFooter standalone is THE carrier (no new component)

- ButtonBar 教训（2026-09-08，存活一天即退役）：没有自己法则的
  组件不该存在。本轮要的法则已存在（carved-cell），载体也存在
  （CardFooter 的 standalone 镜像——card-footer.css 里五列 ruler
  的 fallback，"one geometry, two carriers" 的第二载体生来就是
  给非 Card 宿主用的）。
- standalone 镜像的几何恰好是三处要的：空 text seats 不可见，
  cluster 贴终缘、块高即带高；`@container jx-card` 反转只在真
  Card 容器内生效（三处宿主都无容器 → 不反转，安全）。
- 出血工艺（负 margin 逃宿主 padding + 顶缘线）是**宿主表面的
  自持手艺**——各表面的 padding 呼吸算术不同（adlg 的
  mt-8px+gap-10px=18px；dock 的 px-2/pb-2），不该塞进 CardFooter
  的 API。CardFooter 不加 class/rest 通道（dissolve 载体上
  consumer class 本来就不渲染，加了反而撒谎）。

## Per-site decisions

- **sheet**：foot 带与 dialog 逐字对齐（r14-9 RAW 法则）。对外
  API 不变；组件删掉散排 flex 包装。仓库内三个消费者（docs 页
  demo ×2、blueprint scene）迁移到 CardFooter。风险：旧 snippet
  传裸按钮会掉进 14px inset 轨道——这正是 RAW 法则的契约（你
  给了 RAW 就拥有几何），dialog 同款，记入 docs。
- **alert-dialog**：锚定形态裁决（不贴纸、不租 banded ruler）
  不变——变化只在 strip 内部：散排行 → CardFooter standalone。
  Cancel|Action join 成簇：1px seam 分隔两个按钮（"合理的分割
  线"的按钮间形态）、leadingSeam 为簇左缘、顶缘线仍是 border-t
  （出血包装自持）。密度 sm 保留（紧凑锚定形态的既定选择；
  carved 法则管填充不管绝对高度）。
- **canvas dock**：dock 的滚动容器 `px-2 pb-2` —— 出血
  `-mx-2 -mb-2` 让带贴 dock 底缘，`border-t` 为顶缘。复位钮
  （IconButton xs，iconOnly）成为雕刻单元：单成员簇，只有
  leadingSeam 没有内 seam。label 语义：CardFooter label 传
  "Playground actions"（ButtonGroup 的可访问名）。
- **分割线的层次**（三处统一）：顶缘线 = 带与上方内容的边界
  （sheet 是骑行 Separator；adlg/dock 是出血包装的 border-t）；
  簇左缘 = leadingSeam（雕刻开口）；按钮间 = ButtonGroup 1px
  seam。线全部来自带的几何，不再是浮在 padding 里的独立装饰。

## Risks

1. sheet 旧消费者（仓库外）传裸按钮 snippet 会看到按钮掉进
   inset 轨道——破坏性更新已获 Owner 授权（"直接向最佳实践去
   设计"）；docs 教标准脸。
2. adlg join 后 Cancel/Action 间的 gap 视觉变化（10px 空隙 →
   1px seam）——正是本次要的"合理分割线"。
3. fill Action 贴圆角：dialog demo 的 fill 按钮（Rotate key/
   Publish）已是同款验收过的形态（.jx-surface-body 圆角 + 按钮
   flush），parity 无新风险。
4. dock 出血行在折叠动画（grid-rows 0fr↔1fr + overflow-hidden
   clip）内——负 margin 不参与轨道计算，clip 正常裁切。

## Round 2 (Owner acceptance, 2026-09-09 晚)

1. **密度对齐**：adlg actions 的 sm（32px 带）与 Dialog footer 的
   default（40px 带）不一致——"Dialog 的 footer 的明显更高更平衡"。
   裁决：Action/Cancel 密度回 default，雕刻条高即 Dialog footer。
2. **复位栏压缩**：dock 的舞台高度上限（max-block-size）挤压
   collapse 时，clip 是普通块级滚动容器——内容溢出被裁，钉在底部
   的复位栏首当其冲（"按钮只显示一半"）。修：clip 换 flex 列，
   scroller 成为唯一吸收者（flex 1 1 auto + min-block 0），栏
   flex-none 保高。
3. **head 行才是泛化目标**（Owner 纠偏："我想让你修的是那一行可拖
   拽的栏，因为它本身就包含了 button 和 select"）：chrome 行
   （grip/主题钮/密度 select/折叠 chevron）改为同一套 carved 带
   处理——zone ghost+flat 静音所有 press 控件（ButtonBar 初衷：
   零冗余边框）、items-stretch 控件铺满带高、无 py 浮动、body 的
   border-t 即带缘。统一性回答：**同一法则同一原语**
   （ButtonVariantScope + carved 带几何 + IconButton rest 通道），
   而非同一个 Svelte 组件——head 含 select 与 grip，不是
   ButtonGroup 簇；ButtonGroup/CardFooter 只服务纯按钮簇
   （ButtonBar 退役教训不翻案）。aria-pressed/expanded/controls
   经 rest lane 落 IconButton 根，a11y 零回退。

## Round 3 (Owner acceptance, 2026-09-09 深夜) — 五条裁决

1. **borderless-chrome 立法**（"有明确边界的组件内，尽量不要再出现
   有 border 的控件，视觉灾难"）：docked chrome 的控件零边框成为
   spec 法则（the borderless-chrome law）；扫掉 dock 内三处野生框
   ——seg 容器框+缝底、stepper 框+值分隔线、output 行单元格边框
   （保留底色带）。select/input 走既有 control-chrome 'bare' 轴。
2. **dock 分割线**：head/body 与 body/foot 两道 rim 从 `border-t`
   token 线换成 **Separator 实例**（对比幽灵墨，与 Dialog 同引擎；
   token 灰线在亚克力上读不出）。head/body rim 骑在 clip 内首子，
   0fr 折叠时随 body 一起隐藏。
3. **adlg rim 同罪同修**：strip 的 border-t → Separator 实例
   （"和 Dialog 的标准不一样"的就是这条墨法差）。
4. **adlg 均分 footer**（"均分 footer，文字过多可以撑开"）：
   CardFooter 终端簇退役，换 ONE 全宽 ButtonGroup，
   `grid-auto-columns: minmax(auto,1fr)` ——等分、长文案可撑列
   （macOS 系统弹窗姿态）；1px seam 为按钮间线，无 leadingSeam
   （全出血无雕刻左缘）。adlg deps：-card +separator +input。
5. **system 三件套**（"承担 window.alert/prompt/confirm 职责"）：
   命令式 `alert()/confirm()/prompt()`（裸字符串简写），
   Content 增 `pose='center'`（弃锚链，UA popover 居中）与
   `focusLanding`；prompt 输入用 Input@bare（法则 1 同源），
   Enter 提交、Escape→null；EXACTLY-ONCE 解决 + 出场窗后卸载。
   组件不改名（Owner 许可而非要求，118 消费者不值得）。

## Round 4 (Owner acceptance, 2026-09-09 夜班二) — 三条

1. **dock rim 实心墨**：自查（放大截图）证实 Owner 所见——对比幽灵墨
   在 dock 均匀近白亚克力上是减法的盲区，两道 rim 实际不可见。
   修：`variant="solid"`（Separator 的法定逃逸口，同一元素/法则，
   唯一的加性例外）。Dialog 上仍是幽灵墨（多变页面底上工作正常）。
2. **均分法则换 flex**（"均分/铺开/不换行/居中"）：grid fr 表达不了
   "等分且填满、长文案加宽"——fr 的单位从固有轨基之后的**剩余**空间
   计算，max-content 兜底的 fr 轨在内容处冻结（实测 120+143/382，
   空档停在最右）。declaration 换 `display:flex`，成员
   `flex:1 1 0 + min-width:max-content + justify-content:center`
   （alert-dialog.css，strip 域限定）：实测 191+191 等分填满、
   文字居中、单行；长文案实测铺开至 556 不换行。ButtonGroup 的
   seam 机器在 flex 下存活（注入墨条拉伸、-1px 结合法则在 flex
   同样成立）。
3. **trio 位置之谜**：是刻意的双姿态——组合式 family（demo 六处）
   锚定在 trigger 旁（trigger 在页首时面板就近页首=用户看到的
   "top center"），命令式三件套恒定视口正中（pose=center，多视口
   实测偏移 0,0）。docs 缺介绍属实：system 节 summary 与 Content
   API 表（pose/focusLanding）已补。附带发现：小视口下 raw click
   的"无响应"是 reveal 水合时序，滚动停留后一切正常，非定位 bug。

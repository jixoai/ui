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

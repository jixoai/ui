# Proposal: carved-action-band — 动作带雕刻法则的泛化（sheet / alert-dialog / canvas dock）

## Why

floating-flesh-sweep 之后 Owner 验收 sheet 页给出裁决（2026-09-09）：

> 后面修的这两个最大的问题是 button 没有在纵向上铺完整个
> footer，也没有合理的分割线。所以视觉上出现了一些 padding
> 留白，这会令人困扰。对了，还有一个点……componentCanvas 的
> playground 浮动层。这里不是 footer，但我希望你的组件能足够
> 泛化，一样能处理这个 bar。

三处动作带都还浮着：

- **sheet foot 带**：ghost/flat zone 里是一条自带 `py-3.5` 的散排
  flex 行——按钮浮在带中央，上下留白；分割线（骑行 Separator）
  与按钮之间隔着一层 padding。
- **alert-dialog actions 条**：同款 `py-3.5` 散排行 + `border-t`，
  Cancel/Action 之间是 gap 不是 seam——同样的洞感。
- **canvas dock foot 行**：`flex justify-end mt-0.5` + xs IconButton，
  又一套自持手艺。

而体系里**已有答案**：CardFooter 的 CARVED-CELL 法则（Owner r4：
"容器被撑高之后，它就不是切出一块，而是挖出一块"）——cluster
纵向填满整条带（separator 是它的顶缘、leadingSeam 是它的左缘、
块高即带高、min-h 是下限不是上限）。该法则此前只服务 Card 的
foot 席位；本轮把它**泛化为任意表面动作带的通用形态**。

## What Changes

- **T1 泛化定法**：CardFooter standalone（自带五列 ruler 镜像）即
  通用载体——宿主表面自持出血工艺（负 margin 逃出自 Padding +
  顶缘线），内部一律 CardFooter：按钮纵向填满带、贴终缘、
  leadingSeam 为雕刻左缘。不需要新组件（ButtonBar 的教训：法则
  已存在，载体已存在）。
- **T2 sheet foot 带 RAW 化**（dialog r14-9 逐字对齐）：foot 带 =
  zone + RAW footer snippet，组件不再渲染散排 flex 包装；docs
  demo 与 blueprint scene 教 `<CardFooter>`（标准脸）。
- **T3 alert-dialog actions**：出血包装（mt/gap 呼吸算术与
  -mx/-mb 逃逸保留）内部换 CardFooter standalone——Cancel/Action
  自动 join 成簇，py 留白退役；密度保持 sm（紧凑锚定形态）。
- **T4 canvas dock foot**（非 footer 场景的泛化验证）：出血包装
  （-mx-2 -mb-2 + 顶缘线）内部换 CardFooter standalone，xs
  IconButton 复位钮成为雕刻单元。
- **T5 收尾**：registry.json 依赖边（alert-dialog/component-canvas
  +@jixoai/card）、镜像同步、manifest 再生、测试锚点、blueprint
  再渲染、vision 验收（三场景：按钮铺满带高、线即带缘、无留白）。

# Tasks

- [x] T1 sheet：foot 带 RAW 化（删散排 flex 包装，dialog r14-9 逐字对齐）+ 注释法则更新
- [x] T2 sheet 消费者迁移：docs 页 demo ×2（live + source string，教 CardFooter）、blueprint scene
- [x] T3 alert-dialog-actions：出血包装 + CardFooter standalone（Cancel/Action join 簇）
- [x] T4 canvas dock foot：复位栏钉在滚动容器外（clip 直授全宽）+ CardFooter（复位钮雕刻单元）
- [x] T5 registry.json：alert-dialog / component-canvas +@jixoai/card 依赖边
- [x] T6 镜像同步 + manifest 再生成 + blueprint 再渲染（sheet/recipes.svg）
- [x] T7 测试：carved-action-band.spec（sheet RAW / adlg carved / dock carved 门）；全量 vitest 绿 + typecheck 绿 + payload parity（build:registry 再嵌）
- [x] T7.5 附带 BUG 修复（Owner 验收中报告）：Dialog 关闭动画期间宽度塌陷——
      allow-discrete 窗口只持有 display，[open] 门控的 flex-direction 在
      close() 瞬间掉回 row；修为轴支持无条件化（display 保持门控），
      dialog-grid.spec 增回归门
- [x] T8 vision 验收：A sheet（右/底双向）PASS——按钮 40px 满带高、rim 即带缘、
      leadingSeam 1px、无 py 留白；B adlg PASS——Cancel|Action join、
      32px 满带高、圆角处 fill 干净裁切；D dock 首轮 FAIL（滚动容器
      scrollbar-gutter 预留 11px 轨道，-mx-2 出血跨不过去）→ 结构修：
      栏钉到滚动容器外（clip 直授全宽），复验 0.00px 右/底贴合、
      折叠/展开/强制溢出回归 PASS；E dialog 回归 + 关闭动画逐帧采样
      （416.0px 全程恒定）PASS
- [x] T9 living spec 合入 + 双 commit（spec 先行）推送

- [x] R1（Owner 验收 R2）：adlg Action/Cancel 密度 sm→default——雕刻条高对齐 Dialog footer（40px）
- [x] R2（Owner 验收 R3.2）：复位栏高度压缩——clip 换 flex 列，scroller 为唯一吸收者，栏保高不再被裁
- [x] R3（Owner 验收 R3.1，纠偏）：泛化目标改为 head 拖拽行——chrome 控件 zone ghost+flat
      静音（ButtonBar 初衷）、items-stretch 铺满带、aria 经 rest lane 落 IconButton 根；
      统一性=同一法则同一原语（zone+carved 几何），select 为唯一非 press 单元（无边 ghost）
- [x] R4 门禁：carved-action-band.spec 增三門（压缩修复 css/结构、head 带 DOM/源码退休配方）
- [ ] R5 vision 复验（dialog 页 dock：复位栏全高、head 带、adlg 40px 条）+ commit 推送

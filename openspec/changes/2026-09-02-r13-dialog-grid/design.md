
## 需求摄要（B 批交付，归档时入 specs）

- **group variant context**：explicit prop ?? group context ?? 组件自有默认（显式永赢）；变体阶梯零改动，只选档不铸档
- **separator policy**：`separator ?? (variant === 'ghost')`；缝为伪元素承载 Separator 墨法引擎（contrast 1px，INK 法则引用式消费）；ButtonGroupDivider（语义簇分隔，a11y 树内）与自动缝（装饰，a11y 树外）并存，divider 豁免伪元素
- **grid container**：inline-grid；水平=flow row + auto-cols，垂直=flow col + auto-rows（任务书的 flow:column 系轴向勘误，按规范语义落地）；-1px seam 在 auto 轨道下经 margin-box 贡献不变式自洽
- **overflow 双模式**：水平组专属；测量 pass 原子化（data-jx-measuring 暂停翻转 + 内联放置盖印）；wrap=贪婪行打包（divider 闭行不悬首）；collapse=k≥1 收纳进 DropdownMenu（popovertarget 原生触发、微任务代理激活真按钮）；滞回带 8px 双向余量；SSR/无 JS 完整单行；垂直组不参与（块轴溢出属滚动容器）

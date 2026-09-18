# presence-walkthrough-r2 — spec delta (design-studio-shell)

## ADDED Requirements

### Requirement: Wheel-Opposite Hue Assignment

新玩家的色相 MUST 在圆形色盘上取「对面偏置的最大最小距离」：对全体在场
玩家色相的圆周距离最小值最大化，排除与任一存量色相正对（距离恰为
180°）的候选，并列时偏向最近加入者的对面侧。首玩家 MUST 锚定品牌色相
73°。同一身份（token 重连）色相 MUST 保持不变。

#### Scenario: 第二个玩家落在对面（非正对）

- **WHEN** 在场玩家色相为 {73°}，新身份铸造
- **THEN** 新色相与 73° 的圆周距离 ≥ 170° 且 < 180°（约 252°）

#### Scenario: 连续加入互不相似

- **WHEN** 依次铸造前 6 个身份（对当时的在场集合）
- **THEN** 相邻两次加入的色相圆周距离 ≥ 90°；任意时刻新色相对全体
  存量的最小距离 ≥ 45°

#### Scenario: 重连色相稳定

- **WHEN** 玩家断开后凭 token 重连
- **THEN** 色相与断开前一致（账本记录恢复，不重新选色）

### Requirement: Frame-Addressed Selection Attention

canvas attention 的选中上报 MUST 携带来源 kit frame 的 frameId
（picker 与树行两个入口都是）；远端 ring 解析在 frameId 非空时 MUST
先定位 `iframe[name="jixoai-design-frame-<frameId>"]` 的文档再查
组件 id，仅未命中时回退全文档扫描。同一 component id 出现在多个
kit 中时，ring MUST 渲染在选中发生的那个 kit 上。

#### Scenario: 双 kit 同 id 的选中

- **WHEN** 同一原型文件嵌为两个 kit（如 mobile/desktop 变体），
  两者都含 #a4，玩家在 desktop kit 内点击 #a4
- **THEN** 对端 ring 的几何落点在 desktop kit 的 iframe box 内，
  不在 mobile kit

### Requirement: Join-Time Presence Snapshot

welcome 帧的名册视图（players）MUST 携带每个在场玩家的完整状态
（含 cursor 与 attention）。晚加入的玩家 MUST 能不依赖既有玩家的
后续动作即可渲染其光标与选中指示。

#### Scenario: 晚来者立即看到存量状态

- **WHEN** A 在场且光标停留、无任何新动作，C 连接
- **THEN** C 的 welcome 名册含 A 的 cursor；C 端 2s 内渲染 A 的
  光标元素

### Requirement: Pointer-Shaped Remote Cursor

远程光标 MUST 绘制为真实鼠标指针形状（箭头），不再是圆点；箭头层
MUST 使用混合模式（mix-blend-mode: difference）避免遮挡画布内容，
玩家名签 MUST NOT 参与混合以保证可读性。

#### Scenario: 箭头与混合

- **WHEN** 远程玩家光标渲染
- **THEN** 光标元素含箭头形状（SVG path/polygon）且箭头层 computed
  mix-blend-mode 为 difference；名签 mix-blend-mode 为 normal

### Requirement: Legible Presence Badges

光标名签与选中环 badge MUST 携带半透明玩家色背景（hsl(h, 85%, 45%,
0.92) 家族），保证叠在任意画布内容上时文字可读。

#### Scenario: badge 背景

- **WHEN** 任意远程指示渲染（光标名签 / ring badge / caret 名签）
- **THEN** 其 computed background 为非 none 的半透明色

### Requirement: Ribbon Slot Exclusivity

行元素同时出现选中强调边与多人彩带时，彩带 MUST 独占左侧 2px 槽位：
携带 `[data-jx-remote-ribbon]` 的 nav 行内，选中态的 inset 强调边
（`box-shadow: inset 2px 0 0 --primary`）MUST 抑制；选中背景高亮
MUST 保留。无彩带的选中行 MUST 保持 family 现状不变。

#### Scenario: 选中 nav 行带彩带

- **WHEN** 当前画布行（selected）同时携带 presence 彩带
- **THEN** 行左缘只有一条 2px 竖向彩带；内层 `.jx-item` 的
  box-shadow 为 none

#### Scenario: 选中行无彩带

- **WHEN** 选中 nav 行无任何 presence 彩带
- **THEN** family 选中态原样（inset 2px 0 0 --primary + 背景）

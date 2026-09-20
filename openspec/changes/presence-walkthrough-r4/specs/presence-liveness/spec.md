# presence-walkthrough-r4 — spec delta (presence-liveness)

## ADDED Requirements

### Requirement: Boot Presence Park

一个 studio 页面在 presence 连接建立（boot 或 reconnect 的 `online`
边沿）时，MUST 立即以 park 坐标上报当前画布归属——不等待任何鼠标
移动。对端 MUST 在 600ms 内看到该页面的 nav 彩带。

#### Scenario: 零鼠标移动的 boot 可见性

- **WHEN** A 在场且 B 已打开 studio，C 全新打开一个 studio 页面并
  完全不移动鼠标
- **THEN** B 端 C 所在画布的 nav 行在 600ms 内出现 C 色彩带

#### Scenario: store 绑定晚于 online 边沿

- **WHEN** presence store 的绑定晚于状态变 online（挂载次序竞态）
- **THEN** park 上报在 store 落位时重试（不静默丢失）

### Requirement: Layers Title

组件树面板的标题 MUST 固定为 `layers`（不随画布名变化）。

#### Scenario: 树标题

- **WHEN** studio 打开任意画布
- **THEN** 组件树面板头部文本为 `layers`

## MODIFIED Requirements

### Requirement: Nav Ribbon Player Membership

nav 彩带的玩家集合 MUST 包含每个在场浏览器当前停驻的画布——
「单人态」只在独占某画布时成立（boot-park 之后，鼠标未动不再是
缺席理由）。

#### Scenario: 常驻彩带下的单人语法

- **WHEN** A 与 B 都在场（各自 boot-park 在 welcome），临时第三页
  C 点击 nav 跳到无人在场的画布
- **THEN** C 页面上该画布的 nav 行是 single 彩带（C 的 self 色、
  2px 实边、无 border-image）；welcome 行保持多灯

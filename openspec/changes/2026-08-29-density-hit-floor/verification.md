# verification — density hit-floor

全部在真实 dev server（localhost:5201）+ 生产镜像 CSS 上实测，2026-08-29。

## 1. 渲染几何（getBoundingClientRect，非声明值）

| scope | 修复前（原型实测） | 修复后（jx-pure face） | 修复后（组件 demo） |
|---|---|---|---|
| xs | 36px（padding 泄漏 +2 border） | **28px** | **28px** |
| sm | 38px | **32px** | **32px** |
| default | 48px | **40px** | **40px** |
| lg | 60px | **48px** | **48px** |

lane 计算样式：padding-block 0 / border 0（此前 8px/1px 泄漏）。

## 2. 文案随密度

`.jx-label` font-size：10 / 11 / 12 / 14px（`--jx-text-secondary`），此前恒为 11px。

## 3. 门禁

- `verify:laws --check` GREEN（生成槽位与法则源一致）
- `verify:all` exit 0
- `verify:mirror`：本 change 范围内 registry↔mirror 字节一致（`diff -q` 通过）；
  其余漂移项属并行 icon 工作流，不在本 change 边界内

## 4. 双策略原型的裁决证据

- 触屏保底（pointer 分流）版：本机 28/32/40/48、模拟 coarse 44/44/44/48 —— 机制可用，被 Owner 否决
- 彻底跟字版：全设备 28/32/40/48 —— **选定**，阈值以内建 7U 护栏的形式落进 kernel

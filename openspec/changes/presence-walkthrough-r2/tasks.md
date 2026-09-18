# Tasks — presence-walkthrough-r2

## 1. 主瑕疵

- [x]  1.1 色相轮盘法（主1）：ledger 新增纯函数 `pickHue(existing, latest)`
      ——argmax-min 圆周距离 + 排除正对（±180°）+ 并列偏向最近加入者的
      对面侧；首玩家锚 73°；gateway 在 `restoreOrCreate` /
      `ensureServerPlayer` 时传入在场色相集合；删除 `hueOfCounter` 的
      73° 步进；重连 token 恢复原色相（既有路径不动）
- [x]  1.2 色相单测：首=73；第二人=252（对面但非正对）；逐次加入的最小
      距离 ≥45°（前 6 人）；相邻加入 ≥90°；确定性
- [x]  1.3 frame 定位的选中（主2）：shell attention 上报
      `frameId: selection.frameId ?? null`（picker/tree 两侧都已带）；
      overlay `resolveAttentionBox` frameId 非空时先按
      `iframe[name="jixoai-design-frame-<id>"]` 定位再查 id，未命中回退
      全扫；store/gateway 词表已允许 string frameId（验证即可）
- [x] 1.4 frame 定位单测 + 矩阵 A2：hero 同文件双 kit
      （hero-mobile-390-light / hero-desktop-1280-dark）同 id #a4——
      在 desktop kit 内点击 → 对端 ring 落在 desktop kit 的 box 内

## 2. 次要瑕疵

- [x]  2.1 彩带槽位独占（次1）：`.studio-canvas-row[data-jx-remote-ribbon]`
      内 `.jx-item[data-selected='true']` 抑制 inset 强调边（selected
      背景保留）；矩阵 A3 断言带 ribbon 的选中行 box-shadow:none、
      无 ribbon 选中行保持 inset 2px
- [x]  2.2 welcome 状态快照（次2）：gateway `#viewOf` roster 视图补
      `cursor` 字段；store welcome 解析并入 RemotePlayer.cursor——
      晚来者即刻渲染存量玩家状态；单测 + 矩阵 A4（A 先在场 C 后加入）
- [x]  2.3 真箭头光标（次3）：cursor 元素 dot → 内联 SVG 箭头
      （玩家色填充 + 深色描边），箭头层 `mix-blend-mode: difference`；
      名签不混合；矩阵 A5 断言形状 + blend
- [x]  2.4 badge 半透明背景（次4）：ring badge 补
      `hsl(h,85%,45%,.92)` 背景（cursor tag 家族同款）；矩阵 A6
      computed background 非 none

## 3. 验证与收口

- [x] 3.1 焦点单测 + 全量电池 + build:studio + validate --strict
- [x] 3.2 矩阵 71/71（A1-A6 新组 + 既有 65 项不回归；r7 65/71 → r8 崩（D11 读已关的 A）→ r9 68/71 → r10 71/71，三轮失败全部定根见 evidence/README）
- [ ] 3.3 Codex 复核（同 agent presence-review）→ 处理结论
- [ ] 3.4 提交推送，交 Owner 复验（含真箭头/彩带槽位的视觉终验）

## 4. 迭代中发现的产品 bug（r7-r10 轮，一并修复）

- [x] 4.1 ring 放置重试法则（placeRing 失败态每帧重试——幂等跳过只
      覆盖已渲染的 ring）
- [x] 4.2 光标放置重试法则（parkedCursor + align 循环，kit 晚挂载
      自愈）
- [x] 4.3 canvas 挂载竞态：iframe bind+load 双时机重推 roster +
      网关对晚来者逐活玩家 presence 突发帧（传输层快照）
- [x] 4.4 Svelte scoped CSS 剪枝：彩带槽位规则用 :global 包裹家族
      元素后代
- [x] 4.5 矩阵法则：运行期间不得有共享 journal 的常驻服务（5199
      走查实例与矩阵互写 presence.json）

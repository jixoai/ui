# Tasks: press-flat-texture

- [x] 1. 内核接缝：`.jx-press:active` 的 translate → `var(--jx-press-move, 1px 1px)`；
      press law 注释补按压向量姿态接缝一句
- [x] 2. press-button：`raised?: boolean = true`；flat 姿态四件套
      （先剥离变体自带 `[--jx-press-shadow*]` 串再追加；空格分隔防粘合正则）；
      link rung 不受影响并在注释说明
- [x] 3. press-button.meta.ts regen（component-metadata-gen）
- [x] 4. 文档页：flat 演示行（raised={false} × outline/tonal）+ prose 一句
- [x] 5. 测试：press-button.spec.ts raised 轴套件（默认无姿态串/flat 四件套/
      ghost 冲突剥离/link 不变）+ 内核法则锁（translate 必须走 --jx-press-move）
- [x] 6. 镜像同步（press-button / theme jxoai.css / registry test / docs 页）
      + manifest 重生成 + 根 build（dist/public/payload）
- [x] 7. 验收：浏览器实测（rest/hover 零阴影、按住内阴影且不位移）+
      全量门禁（vitest/mirror/parity）+ 提交（spec 已先行一笔）

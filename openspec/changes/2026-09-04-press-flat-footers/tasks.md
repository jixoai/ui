# Tasks: press-flat-footers

- [x] 1. press-button：`PRESS_TEXTURE_KEY` + `PressTextureApi`（module
      script）；`raised` 摘静态默认；`resolvedRaised = explicit ?? zone ?? true`
- [x] 2. ButtonVariantScope：`raised` 接缝（inherit-then-provide，画笔
      scope 不反平面化 zone）
- [x] 3. Dialog / Card 的 foot zone scope 挂 `raised={false}`（head 不动）
- [x] 4. 测试：press-button zone texture 套件（采用/显式获胜/穿透
      ButtonGroup/嵌套画笔 scope/无声明默认/link 惰性）+ dialog-ghost-scope
      扩充（footer 平面 + 显式凸面）+ card.spec footer 断言
- [x] 5. meta regen（raised 入 required 区）+ schema-lower/canvas 漂移门
      同步 + 文档 PropsTable 补 raised 行
- [x] 6. 镜像同步（press-button / button-variant-scope / dialog / card）
      + manifest + 根 build
- [x] 7. 验收：浏览器实测（Dialog/Card footer 按钮静止零阴影、按住内阴影
      不位移；head/bare 按钮不变）+ 全量门禁 + 提交

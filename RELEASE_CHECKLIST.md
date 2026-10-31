# 发布前清单

## 内容

- [ ] 在 `src/data/series.ts` 替换 `SITE` 中的名称、作者、城市、公开邮箱、社交链接、微信号和头像。
- [ ] 用拥有发布权的图片替换 `public/archive/demo/` 演示 SVG。
- [ ] 根据实际作品更新 `src/data/series.ts`、`src/data/lowkey-content.ts` 和 `src/data/site-narrative.ts`。
- [ ] 删除不希望公开的联系入口，而不是留下真实但无意公开的占位值。

## 授权与隐私

- [ ] 确认图片、头像、字体、音乐和文字的许可覆盖公开仓库、静态网站和社交媒体预览。
- [ ] 更新 [`ASSET_LICENSE.md`](./ASSET_LICENSE.md) 与 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。
- [ ] 检查客户端导入的数据，没有草稿、客户资料、API 密钥或内部链接。
- [ ] 确认 GSAP 的 Standard license 适用于你的再分发场景。

## 技术检查

```bash
npm ci
npm run ci
npm audit --registry=https://registry.npmjs.org
```

- [ ] 在桌面和移动端打开 `/`、`/intro-prototype/`、`/experience-prototype/` 和 `/v2-motion-prototype/`。
- [ ] 确认键盘、触摸、减少动效和缺图状态仍可用。
- [ ] 确认 `out/` 里的静态文件可以被目标主机直接提供。
- [ ] 发布前设置自己的 Git 身份，并检查 Git 历史没有敏感内容。

## GitHub

- [ ] 先创建目标仓库并确认所有者、仓库名和可见性。
- [ ] 推送 `main` 分支后，在仓库设置中开启 Template repository（如果希望别人一键创建副本）。
- [ ] 在仓库首页确认许可证、README、素材边界和 Issues 联系方式正确。

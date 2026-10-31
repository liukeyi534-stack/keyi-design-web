# 内容替换指南

## 1. 站点身份

编辑 `src/data/series.ts` 底部的 `SITE`：名称、标语、作者、城市、联系邮箱、社交链接和头像路径都从这里读取。示例值是占位符，发布前请替换或删除。

## 2. 系列和作品

复制 `DEMO_COLLECTIONS` 中的对象来增加系列。每个系列需要唯一的 `id`、`slug`、`order`、三色 `palette`、`cover` 和 `works`。作品至少填写：

- `id`、`image`、`titleZh`、`titleEn`
- `oneLineZh`、`oneLineEn`、`storyZh`、`storyEn`
- `year`、`medium`、`order`

首页最多展示 7 个已发布系列；每个系列可放 1–9 件作品。没有足够作品时，阅读器仍会显示可用的内容，不要用重复图片填充。

## 3. 图片和音频

把公开素材放在 `public/` 下，并在数据中使用 `/archive/...` 这种 URL。路径大小写必须和文件名一致。音频是可选项；没有音频时删除 `audio` 字段，页面不会保留失效的播放控件。

## 4. 草稿和私密资料

草稿、原始大图、客户资料、真实联系方式和未授权音乐不要放进 `src/data` 或 `public/`。客户端导入的数据会被编译进浏览器包，即使界面暂时没有显示，也不能当作私密存储。

完成替换后运行：

```bash
npm run validate:content
npm run check:public
```

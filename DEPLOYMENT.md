# 静态部署

本项目使用 Next.js static export，构建命令会生成 `out/`。常见静态主机的设置如下：

- Build command：`npm run build`
- Publish directory：`out`
- Node.js：20 LTS 或更高版本

部署前先在本地运行 `npm run ci`。如果托管平台需要环境变量，请只配置真正需要的公开值；不要把 `.env`、令牌或私钥提交到仓库。模板没有自动部署或生产域名配置，仓库维护者可以按自己的平台补充设置。

使用 GitHub Pages、Netlify、Vercel 或其他静态主机时，请按平台文档配置自定义域名、HTTPS、缓存和回滚策略。若站点使用子路径，确认平台的 base path 设置与链接策略一致。

# 部署到 GitHub Pages

项目：Next.js 15 static export → GitHub Pages → 自定义域名 `ib.x8iu.com`

- 仓库：https://github.com/liukeyi534-stack/keyi-design-web
- 最终地址：https://ib.x8iu.com
- 站点类型：**项目站**（`liukeyi534-stack.github.io/keyi-design-web/`）
- 本机 Git：`F:\github\Git\cmd\git.exe`（不在系统 PATH 里，脚本里用绝对路径调用）

---

## 当前状态

| 环节 | 状态 |
|---|---|
| 代码推送 / GitHub Actions 构建 | ✅ 已跑通（`npm install` + `npm run build` 全绿） |
| `public/CNAME` = `ib.x8iu.com` | ✅ 已提交，构建产物 `out/CNAME` 校验通过 |
| `public/.nojekyll` | ✅ 已提交 |
| 仓库后台启用 Pages | ⬜ **待办（需你操作）** |
| DNS 解析指向 GitHub | ⬜ **待办（需你操作）** |
| Enforce HTTPS 证书 | ⬜ 等 DNS 生效后勾选 |

> ⚠️ 如果你在 `liukeyi534-stack.github.io/keyi-design-web/` 看到 404 或跳转，**这是正常的** ——
> `public/CNAME` 会让 GitHub 把站点绑定到 `ib.x8iu.com`，项目地址会自动跳转到自定义域名。
> 站点最终只在 `https://ib.x8iu.com` 生效。

---

## 第一步：在仓库后台启用 Pages（必须手动）

GitHub 的 `actions/configure-pages` 提供了自动开关，但它的 `enablement` 参数**不接受 `GITHUB_TOKEN`**
（官方文档明确写了 "requires a token other than GITHUB_TOKEN"）。所以这一步只能你本人点一下，
不需要任何令牌：

1. 打开 https://github.com/liukeyi534-stack/keyi-design-web/settings/pages
2. **Build and deployment → Source** 下拉里选 **GitHub Actions**
3. 直接点 **Save**（没有别的按钮，选项变了就自动保存）
4. 回到 https://github.com/liukeyi534-stack/keyi-design-web/actions/workflows/deploy.yml
   点 **Run workflow** 手动触发一次

> 不开这个开关，workflow 一定会在 `Setup Pages` 这一步失败，报错原文是：
> `Get Pages site failed. Please verify that the repository has Pages enabled`

---

## 第二步：把 DNS 解析交给 x8iu.com 方

`ib.x8iu.com` 是 **子域名**（主域名 `x8iu.com` 归对方管），子域名用 **CNAME** 最省事，只给对方一个值。

### 推荐（CNAME）

| 主机记录 | 记录类型 | 记录值 | TTL |
|---|---|---|---|
| `ib` | **CNAME** | `liukeyi534-stack.github.io` | 默认即可 |

### 备选（对方只收 IP 时）

| 主机记录 | 记录类型 | 记录值 |
|---|---|---|
| `ib` | A | `185.199.108.153` |
| `ib` | A | `185.199.109.153` |
| `ib` | A | `185.199.110.153` |
| `ib` | A | `185.199.111.153` |

> ⚠️ CNAME 与 A 记录**二选一**，不要同时加（CNAME 不能再叠加其它记录）。

**给对方的原话可以直接复制：**

> 麻烦加一条 DNS 解析：主机记录 `ib`，记录类型 `CNAME`，记录值 `liukeyi534-stack.github.io`。
> 用来绑定 GitHub Pages 自定义域名，添加后大约 10 分钟内生效。

**"服务器IP"是什么意思？** DNS 本质是「域名 → IP」的翻译表。别人在浏览器输入 `ib.x8iu.com`，
DNS 要告诉他「去这台机器找网站」。你没有自租服务器，网站托管在 GitHub Pages 上，
所以要指向 GitHub 的固定 IP —— 就是上面那 4 个地址。

### DNS 生效后

1. 访问 https://ib.x8iu.com ，一般 10 分钟内出证书
2. 回 https://github.com/liukeyi534-stack/keyi-design-web/settings/pages
   勾 **Enforce HTTPS**

---

## 日常更新

一键脚本（自动 add / commit / push）：

```powershell
cd F:\minimaxcode\个人网站2\lowkey-archive-template-main
powershell -ExecutionPolicy Bypass -File .\push.ps1
```

或者手动：

```powershell
git add .
git commit -m "更新内容"
git push
```

push 到 `main` 后 GitHub Actions 自动重新 build + 部署，1–2 分钟后线上生效。

> ⚠️ **PowerShell 多行粘贴陷阱**：一次性粘贴多行命令会进入 `>>` 续行模式，看起来像"代码乱了"。
> 规避方式：① 一行一行敲；② 用上面的 `push.ps1` 脚本；③ 粘贴后如果看到 `>>`，按 `Ctrl+C` 退出重来。

---

## 本地预览生产版本

```powershell
npm run build
npx serve out
```

> ⚠️ `npm run build` 会写 `.next` 目录。如果 dev server 正在跑，先停掉它再 build，否则 dev 会 500。

---

## 故障排查

| 现象 | 原因 / 处理 |
|---|---|
| Actions 挂在 `Setup Pages` | 仓库后台没开 Pages → 回第一步 |
| Actions 挂在 `Install dependencies` | lockfile 跨平台可选依赖问题，已通过改用 `npm install` 解决 |
| 域名打不开 / "DNS check failed" | DNS 还没生效，或 CNAME 值填错；查 https://github.com/liukeyi534-stack/keyi-design-web/settings/pages 的状态提示 |
| 样式乱了 | 强制刷新 Ctrl+Shift+R，或等 CDN 缓存过期 |
| 图片加载慢 | GitHub Pages 在国内偶有拉慢；可后续考虑 Cloudflare Pages |
| 证书报错 | Enforce HTTPS 勾早了，等 GitHub 签发完证书再勾 |

---

## 关键文件

| 文件 | 作用 |
|---|---|
| `.github/workflows/deploy.yml` | build → upload artifact → deploy |
| `.github/workflows/ci.yml` | push 时的校验（内容 / 类型 / lint / build） |
| `public/CNAME` | 告诉 GitHub Pages 绑定 `ib.x8iu.com` |
| `public/.nojekyll` | 关闭 Jekyll 处理，保留 `_next` 目录 |
| `public/manifest.webmanifest` | PWA，含 `orientation: landscape` 横屏锁定声明 |
| `next.config.mjs` | `output: 'export'` + `trailingSlash: true` + `images.unoptimized` |
| `push.ps1` | 一键提交推送 |

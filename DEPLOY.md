# 部署到 GitHub Pages

项目：Next.js 15 static export → GitHub Pages → 自定义域名 `ka.x8iu.com`

- 仓库：https://github.com/liukeyi534-stack/keyi-design-web
- 最终地址：**https://ka.x8iu.com**
- 本机 Git：`F:\github\Git\cmd\git.exe`（不在系统 PATH 里，脚本里用绝对路径调用）

---

## 当前状态

| 环节 | 状态 |
|---|---|
| 代码推送 / GitHub Actions 构建 | ✅ 全绿（build → configure-pages → upload artifact → deploy） |
| 仓库后台启用 Pages（Source: GitHub Actions） | ✅ 已开启 |
| `public/CNAME` = `ka.x8iu.com` | ✅ 已提交 |
| DNS 解析 `ka` → `liukeyi534-stack.github.io` | ✅ 已生效（CNAME → 185.199.108-111.153） |
| 自定义域名被 GitHub 认领 | ⬜ 待 redeploy 后确认 |
| Enforce HTTPS 证书 | ⬜ 等域名认领后勾选 |

---

## DNS 现状

`ka.x8iu.com` 已经解析到位（2026-11-01 核实）：

```
ka.x8iu.com  CNAME  liukeyi534-stack.github.io
liukeyi534-stack.github.io  A  185.199.108.153 / .109.153 / .110.153 / .111.153
```

> ⚠️ `ib.x8iu.com` 上还留着一条旧的 A 记录（指向 `64.83.49.249`）。如果那个位置不再使用，
> 建议让 x8iu.com 方删掉，避免别人访问到旧内容。

---

## 仓库形态说明

GitHub Pages 有两种形态：项目站（仓库名随意，站点挂在 `github.io/<仓库名>/` 子路径）和
用户站（仓库名必须是 `<用户名>.github.io`，站点直接占根路径）。

本项目构建产物里的静态资源路径是根路径 `/_next/...`，自定义域名 `ka.x8iu.com` 也是根路径 ——
**项目站绑定自定义域名后，内容同样会挂在域名根路径**，所以 `ka.x8iu.com` 可以直接正常工作，
不需要改代码。

如果还想要一个 `https://liukeyi534-stack.github.io/` 的备用地址，把仓库改名为
`liukeyi534-stack.github.io` 即可（Settings → General → Repository name）。可选，不影响上面的一切。

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
| Actions 挂在 `Setup Pages` | 仓库后台没开 Pages → Source 选 GitHub Actions |
| Actions 挂在 `Install dependencies` | lockfile 跨平台可选依赖问题，已通过改用 `npm install` 解决 |
| `ka.x8iu.com` 打开是 GitHub 的 404 页 | 站点没认领该域名 → 确认 `public/CNAME` 内容是 `ka.x8iu.com`，push 后等 1–2 分钟 |
| `ka.x8iu.com` 打开白屏、样式全无 | 资源路径没对上 → 检查 build 产物 `out/index.html` 里的 `/_next/` 引用 |
| 域名打不开 / "DNS check failed" | DNS 没生效，或 CNAME 值填错；查仓库 settings/pages 的状态提示 |
| 样式乱了 | 强制刷新 Ctrl+Shift+R，或等 CDN 缓存过期 |
| 图片加载慢 | GitHub Pages 在国内偶有拉慢；可后续考虑 Cloudflare Pages |
| 证书报错 | Enforce HTTPS 勾早了，等 GitHub 签发完证书再勾 |

---

## 关键文件

| 文件 | 作用 |
|---|---|
| `.github/workflows/deploy.yml` | build → upload artifact → deploy |
| `.github/workflows/ci.yml` | push 时的校验（内容 / 类型 / lint / build） |
| `public/CNAME` | 告诉 GitHub Pages 绑定 `ka.x8iu.com` |
| `public/.nojekyll` | 关闭 Jekyll 处理，保留 `_next` 目录 |
| `public/manifest.webmanifest` | PWA，含 `orientation: landscape` 横屏锁定声明 |
| `next.config.mjs` | `output: 'export'` + `trailingSlash: true` + `images.unoptimized` |
| `push.ps1` | 一键提交推送 |

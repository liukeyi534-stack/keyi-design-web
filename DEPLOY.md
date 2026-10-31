# 部署到 GitHub Pages

项目：Next.js 15 static export → GitHub Pages → 自定义域名 `ib.x8iu.com`

- 仓库：https://github.com/liukeyi534-stack/liukeyi534-stack.github.io
- 站点类型：**用户站**（个人站点）→ https://liukeyi534-stack.github.io/
- 最终地址：https://ib.x8iu.com
- 本机 Git：`F:\github\Git\cmd\git.exe`（不在系统 PATH 里，脚本里用绝对路径调用）

> **为什么用「用户站」仓库名？**
> GitHub Pages 有两种形态：项目站（仓库名随意，站点挂在 `github.io/<仓库名>/` 子路径）和
> 用户站（仓库名必须是 `<用户名>.github.io`，站点直接占根路径）。
> 本项目构建产物里的静态资源路径是根路径 `/_next/...`，自定义域名 `ib.x8iu.com` 也是根路径 ——
> 所以**用户站**才能让同一份产物同时服务 `github.io` 和 `ib.x8iu.com`，不用改代码、不用重建。

---

## 当前状态

| 环节 | 状态 |
|---|---|
| 代码推送 / GitHub Actions 构建 | ✅ 已跑通（`npm install` + `npm run build` 全绿） |
| 仓库后台启用 Pages（Source: GitHub Actions） | ✅ 已开启 |
| 仓库改名为 `liukeyi534-stack.github.io` | ⬜ **待办（需你操作）** |
| `public/CNAME` = `ib.x8iu.com` | ✅ 已提交，构建产物 `out/CNAME` 校验通过 |
| `public/.nojekyll` | ✅ 已提交 |
| DNS 解析指向 GitHub | ⬜ **待办（需你操作）** |
| Enforce HTTPS 证书 | ⬜ 等 DNS 生效后勾选 |

---

## 第一步：把仓库改名为用户站（必须手动）

GitHub 的 `actions/configure-pages` 提供了自动开关，但它的 `enablement` 参数**不接受 `GITHUB_TOKEN`**
（官方文档明确写了 "requires a token other than GITHUB_TOKEN"）。所以这一步只能你本人点，
不需要任何令牌：

1. 打开 https://github.com/liukeyi534-stack/keyi-design-web/settings
2. 拉到最上面 **General → Repository name**，把 `keyi-design-web` 改成 **`liukeyi534-stack.github.io`**
3. 点 **Rename**
4. 旧地址会自动 301 跳转，不用管

> 改完名，站点地址从 `liukeyi534-stack.github.io/keyi-design-web/` 变成 **`liukeyi534-stack.github.io/`**，
> 资源路径、根路径全部对上，白屏问题消失。

---

## 第二步：等 Actions 跑完

改名完成后，在仓库里 push 一次就会自动触发：

- 打开 https://github.com/liukeyi534-stack/liukeyi534-stack.github.io/actions/workflows/deploy.yml
- 点 **Run workflow** 手动触发也行
- 成功后访问 https://liukeyi534-stack.github.io/ 验证

---

## 第三步：把 DNS 解析交给 x8iu.com 方

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
2. 回 https://github.com/liukeyi534-stack/liukeyi534-stack.github.io/settings/pages
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
| Actions 挂在 `Setup Pages` | 仓库后台没开 Pages → Source 选 GitHub Actions |
| Actions 挂在 `Install dependencies` | lockfile 跨平台可选依赖问题，已通过改用 `npm install` 解决 |
| `github.io` 打开是白屏 | 仓库名还没改成 `liukeyi534-stack.github.io`（项目站路径会导致资源 404） |
| 域名打不开 / "DNS check failed" | DNS 还没生效，或 CNAME 值填错；查仓库 settings/pages 的状态提示 |
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

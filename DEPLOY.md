# 部署到 GitHub Pages

此项目使用 Next.js static export，已配置好一键部署到 GitHub Pages。

## 你需要准备

1. **GitHub 账号**：你的作品集代码需要托管在 GitHub。
2. **Git 客户端**：本机需要能跑 `git` 命令（没有就装一个 — https://git-scm.com）。
3. **一个自定义域名**（可选，推荐）：约 ¥60–120 / 年。

---

## 一次性操作（约 5–10 分钟）

### 1. 在 GitHub 创建仓库

- 打开 https://github.com/new
- Repository name：`portfolio`（或任何你喜欢的，比如 `keyi-portfolio`）
- **Public**（GitHub Pages 公开仓库免费）
- 不要勾选 Add README / .gitignore / License（保持空仓库）
- 点 Create repository

### 2. 把代码推上去

在 PowerShell 进入项目目录：

```powershell
cd F:\minimaxcode\个人网站2\lowkey-archive-template-main

git init
git add .
git commit -m "Initial commit: KEYI portfolio"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> 如果 GitHub 让你登录，按提示完成；HTTPS 用户名密码在 GitHub 已经改为 PAT（Personal Access Token）— 在 https://github.com/settings/tokens 生成一个。

### 3. 启用 GitHub Pages

打开仓库 Settings → Pages：

- **Source**：选 **GitHub Actions**
- 几分钟后 Actions 跑完，会在页面顶部显示你的网址：
  - 用户主页：`https://<用户名>.github.io/<仓库名>/`
  - 或者自定义域名

先访问这个页面确认能正常打开；通常几十秒到几分钟。

---

## 绑定你的自定义域名：`ib.x8iu.com`

> `ib.x8iu.com` 是 **子域名**（主域名是 `x8iu.com`，由对方管理）。
> 子域名用 **CNAME** 记录最合适 —— 只需要给对面**一个值**。

### A. 给对方（x8iu.com 方）提供的解析记录值

在对方的解析面板里加一条记录：

| 主机记录 | 记录类型 | 记录值 | 备注 |
|---|---|---|---|
| `ib` | **CNAME** | `你的GitHub用户名.github.io` | 主机记录只填 `ib`，不要写完整的 `ib.x8iu.com` |

如果对方只肯要 IP（不允许 CNAME），就填 GitHub Pages 的 4 个 A 记录值：

| 主机记录 | 记录类型 | 记录值 |
|---|---|---|
| `ib` | A | `185.199.108.153` |
| `ib` | A | `185.199.109.153` |
| `ib` | A | `185.199.110.153` |
| `ib` | A | `185.199.111.153` |

> ⚠️ CNAME 和 A 记录**二选一**，不要同时加（CNAME 不能再叠别的记录）。

**"服务器IP"是什么意思？** DNS 本质是一张「域名 → IP」的翻译表。别人在浏览器输入 `ib.x8iu.com` 时，DNS 要告诉他「去这台机器找网站」。你没有自己租服务器，网站托管在 GitHub Pages（Google 的机器）上，所以要指向 GitHub 的固定 IP —— 就是上面那 4 个地址。

### B. 仓库里的 CNAME 文件

`public/CNAME` 已经写好了，内容就是 `ib.x8iu.com`，构建时会被复制到 `out/CNAME`，GitHub Pages 读到就知道「这个站点要绑到 ib.x8iu.com」，并自动申请 HTTPS 证书（免费，约 15 分钟签好）。

### C. 顺序很重要

DNS **必须先指向 GitHub**，GitHub 才能验证并签发证书。正确顺序：

1. 先把代码 push 上去 + 开启 Pages（`https://<用户名>.github.io/<仓库名>/` 能打开）
2. 再把 CNAME 解析给 `ib.x8iu.com`
3. 等 DNS 生效（几分钟到 24 小时）
4. 回仓库 Settings → Pages → 勾 **Enforce HTTPS**

---

## 日常更新

改完文件后，最简单的方式是跑一键脚本（会自动 commit + push）：

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

GitHub Actions 自动重新 build + 部署，1–2 分钟后线上生效。

> ⚠️ **PowerShell 多行粘贴陷阱**：一次性粘贴多行命令会进入 `>>` 续行模式，看起来像"代码乱了"（命令其实还是会跑）。
> 规避方式：① 一行一行敲；② 用上面的 `push.ps1` 脚本；③ 粘贴后如果看到 `>>`，按 `Ctrl+C` 退出重来。

---

## 如果你需要在本地预览构建结果

```powershell
npm run build
npx serve out       # 或者 python -m http.server -d out 8000
```

打开 http://localhost:3000（或 serve 给你的端口）即可看到生产版本。

---

## 故障排查

- **网页 404**：`out/.nojekyll` 是否生成；DNS 是否生效。
- **样式乱了**：清浏览器缓存；或者强制刷新（Ctrl+Shift+R）。
- **图片加载慢**：GitHub Pages 在国内偶有拉慢，可考虑 Cloudflare Pages + 国内 CDN。

# 周计划静态站点（GitHub Pages）

`docs/plan/*.md` 的 HTML 渲染输出目录，由 `scripts/build_plan_site.py` 生成。  
线上发布通过 **`github-pages/` submodule**（`ljr123123.github.io` 仓库）自动部署。

## 本地预览

```powershell
pip install markdown pygments
python scripts/build_plan_site.py
python -m http.server 8080 --directory site/plan
# http://localhost:8080
```

## 部署到 GitHub Pages

### 一键推送（推荐）

```powershell
# 首次克隆本仓库后初始化 submodule
git submodule update --init github-pages

# 构建 + 同步 + push 到 ljr123123.github.io
python scripts/push_pages_site.py
```

线上地址：**https://ljr123123.github.io/**

### 自动 CI

`docs/plan/` 变更推送到 `main` 后，GitHub Actions 会运行 `deploy-plan-site.yml`。  
需在仓库 Secrets 配置 `PAGES_DEPLOY_TOKEN`（对 `ljr123123.github.io` 有写权限的 PAT）。

### 页头按钮

| 配置 | 行为 |
|------|------|
| 无 `config.js` | 弹窗显示 `push_pages_site.py` 命令 |
| `cursorCloudEndpoint` | POST 到代理，后台启动 Cloud Agent |
| `githubWorkflowDispatch` | 触发 `deploy-plan-site.yml` |

## Submodule 说明

| 路径 | 远程仓库 | 用途 |
|------|----------|------|
| `github-pages/` | `ljr123123/ljr123123.github.io` | GitHub Pages 发布目标 |

克隆主仓库时请加 `--recurse-submodules`，或之后执行：

```powershell
git submodule update --init github-pages
```

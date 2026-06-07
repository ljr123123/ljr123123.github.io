/**
 * 复制为 config.js 并按需填写（config.js 已 gitignore，勿提交 token）。
 *
 * cursorCloudEndpoint：自建代理或 Cursor Cloud Webhook，接收 POST 后调用
 *   scripts/trigger_pages_update.py 或 Cursor Agents API。
 *
 * githubWorkflowDispatch：设为 true 时需提供 githubToken（fine-grained PAT，
 *   权限：Actions: write, Contents: read）。
 */
window.PLAN_SITE_CONFIG = {
  repo: "ljr123123/quantitative-trading",
  pagesUrl: "https://ljr123123.github.io/",

  // 方式 1：Cursor Cloud 代理端点（推荐生产环境）
  // cursorCloudEndpoint: "https://your-proxy.example.com/deploy/plan-site",
  // cursorCloudToken: "optional-bearer-token",

  // 方式 2：直接触发 GitHub Actions（token 仅用于本地预览，勿部署到公开 Pages）
  // githubWorkflowDispatch: true,
  // githubToken: "ghp_xxxx",
  // ref: "main",
};

/**
 * 触发 GitHub Pages 更新。
 *
 * 优先级：
 * 1. config.cursorCloudEndpoint — POST 到 Cursor Cloud / 自建代理
 * 2. config.githubWorkflowDispatch — 调用 GitHub Actions workflow_dispatch
 * 3. 无配置时弹出本地命令指引
 */
(function () {
  "use strict";

  const DEFAULT_REPO = "ljr123123/quantitative-trading";
  const PAGES_URL = "https://ljr123123.github.io/";
  const WORKFLOW_FILE = "deploy-plan-site.yml";

  function getConfig() {
    return window.PLAN_SITE_CONFIG || {};
  }

  function setStatus(msg, isError) {
    const el = document.getElementById("deploy-status");
    if (!el) return;
    el.textContent = msg;
    el.style.color = isError ? "#dc2626" : "";
  }

  function openModal(html) {
    const overlay = document.getElementById("deploy-modal");
    const body = document.getElementById("deploy-modal-body");
    if (!overlay || !body) return;
    body.innerHTML = html;
    overlay.classList.add("open");
  }

  function closeModal() {
    const overlay = document.getElementById("deploy-modal");
    if (overlay) overlay.classList.remove("open");
  }

  function manualInstructions() {
    return (
      "<p>未检测到远程部署端点。可用以下方式更新 GitHub Pages：</p>" +
      "<h3>方式 A：Cursor Cloud Agent（推荐）</h3>" +
      "<pre>python scripts/trigger_pages_update.py</pre>" +
      "<p>需设置环境变量 <code>CURSOR_API_KEY</code>。</p>" +
      "<h3>方式 B：GitHub Actions 手动触发</h3>" +
      "<p>打开仓库 Actions 页，运行 <strong>Deploy Plan Site</strong> workflow。</p>" +
      "<p><a href=\"https://github.com/" +
      DEFAULT_REPO +
      "/actions/workflows/" +
      WORKFLOW_FILE +
      "\" target=\"_blank\" rel=\"noopener\">前往 Actions →</a></p>" +
      "<h3>方式 C：本地 submodule 推送（推荐）</h3>" +
      "<pre>git submodule update --init github-pages\n" +
      "python scripts/push_pages_site.py</pre>" +
      "<p>线上地址：<a href=\"" + PAGES_URL + "\" target=\"_blank\" rel=\"noopener\">" +
      PAGES_URL + "</a></p>"
    );
  }

  async function postJson(url, body, headers) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      throw new Error(data.message || data.error || "HTTP " + res.status);
    }
    return data;
  }

  async function triggerCursorCloud(config) {
    const endpoint = config.cursorCloudEndpoint;
    const payload = {
      action: "deploy_plan_site",
      repo: config.repo || DEFAULT_REPO,
      source: "plan-site-button",
      timestamp: new Date().toISOString(),
    };
    const headers = {};
    if (config.cursorCloudToken) {
      headers.Authorization = "Bearer " + config.cursorCloudToken;
    }
    const data = await postJson(endpoint, payload, headers);
    const agentId = data.agentId || data.agent_id || data.id;
    setStatus(
      agentId
        ? "Cloud Agent 已启动：" + agentId
        : "部署请求已发送，请稍后刷新页面"
    );
    return data;
  }

  async function triggerGitHubWorkflow(config) {
    const token = config.githubToken;
    if (!token) {
      throw new Error("githubWorkflowDispatch 需要 config.githubToken");
    }
    const repo = config.repo || DEFAULT_REPO;
    const [owner, name] = repo.split("/");
    const url =
      "https://api.github.com/repos/" +
      owner +
      "/" +
      name +
      "/actions/workflows/" +
      WORKFLOW_FILE +
      "/dispatches";
    await postJson(url, { ref: config.ref || "main" }, {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    });
    setStatus("GitHub Actions 已触发，约 1–2 分钟后生效");
  }

  window.triggerPagesUpdate = async function () {
    const btn = document.getElementById("deploy-btn");
    const config = getConfig();

    if (btn) {
      btn.disabled = true;
      btn.textContent = "更新中…";
    }
    setStatus("");

    try {
      if (config.cursorCloudEndpoint) {
        await triggerCursorCloud(config);
      } else if (config.githubWorkflowDispatch) {
        await triggerGitHubWorkflow(config);
      } else {
        openModal(manualInstructions());
        setStatus("请按弹窗指引操作");
      }
    } catch (err) {
      setStatus("失败：" + err.message, true);
      openModal(
        "<p style=\"color:#dc2626\">远程触发失败：<strong>" +
          err.message +
          "</strong></p>" +
          manualInstructions()
      );
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "更新 GitHub Pages";
      }
    }
  };

  window.closeDeployModal = closeModal;

  document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.getElementById("deploy-modal");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }
  });
})();

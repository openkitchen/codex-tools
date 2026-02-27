import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import "./App.css";

type UsageWindow = {
  usedPercent: number;
  windowSeconds: number;
  resetAt: number | null;
};

type CreditSnapshot = {
  hasCredits: boolean;
  unlimited: boolean;
  balance: string | null;
};

type UsageSnapshot = {
  fetchedAt: number;
  planType: string | null;
  fiveHour: UsageWindow | null;
  oneWeek: UsageWindow | null;
  credits: CreditSnapshot | null;
};

type AccountSummary = {
  id: string;
  label: string;
  email: string | null;
  accountId: string;
  planType: string | null;
  addedAt: number;
  updatedAt: number;
  usage: UsageSnapshot | null;
  usageError: string | null;
  isCurrent: boolean;
};

type SwitchAccountResult = {
  accountId: string;
  launchedAppPath: string | null;
  usedFallbackCli: boolean;
};

type CurrentAuthStatus = {
  available: boolean;
  accountId: string | null;
  email: string | null;
  planType: string | null;
  authMode: string | null;
  lastRefresh: string | null;
  fileModifiedAt: number | null;
  fingerprint: string | null;
};

type Notice = {
  type: "ok" | "error" | "info";
  message: string;
};

type PendingUpdateInfo = {
  currentVersion: string;
  version: string;
  body?: string;
  date?: string;
};

type AddFlow = {
  baselineFingerprint: string | null;
};

const REFRESH_MS = 30_000;
const ADD_FLOW_TIMEOUT_MS = 10 * 60_000;
const ADD_FLOW_POLL_MS = 2_500;

function percent(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "--";
  }
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}%`;
}

function remainingPercent(window: UsageWindow | null): number | null {
  if (!window) {
    return null;
  }
  return Math.max(0, Math.min(100, 100 - window.usedPercent));
}

function toProgressWidth(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0%";
  }
  const clamped = Math.max(0, Math.min(100, value));
  return `${clamped}%`;
}

function formatPlan(plan: string | null | undefined): string {
  if (!plan) {
    return "Unknown";
  }
  const normalized = plan.trim().toLowerCase();
  if (!normalized) {
    return "Unknown";
  }
  if (normalized === "free") return "Free";
  if (normalized === "plus") return "Plus";
  if (normalized === "pro") return "Pro";
  if (normalized === "team") return "Team";
  if (normalized === "enterprise") return "Enterprise";
  if (normalized === "business") return "Business";
  return normalized[0].toUpperCase() + normalized.slice(1);
}

function planTone(plan: string | null | undefined): string {
  const normalized = plan?.trim().toLowerCase() ?? "";
  if (normalized === "team") return "team";
  if (normalized === "pro") return "pro";
  if (normalized === "plus") return "plus";
  if (normalized === "enterprise") return "enterprise";
  if (normalized === "business") return "business";
  if (normalized === "free") return "free";
  return "unknown";
}

function formatResetAt(epochSec: number | null | undefined): string {
  if (!epochSec) {
    return "--";
  }
  return new Date(epochSec * 1000).toLocaleString();
}

function formatWindowLabel(window: UsageWindow | null, fallback: string): string {
  if (!window?.windowSeconds) {
    return fallback;
  }
  const hours = Math.round(window.windowSeconds / 3600);
  if (hours >= 24 * 7) {
    return "1 Week";
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  const mins = Math.round(window.windowSeconds / 60);
  return `${mins}m`;
}

function App() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingAdd, setStartingAdd] = useState(false);
  const [addFlow, setAddFlow] = useState<AddFlow | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdateInfo | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const currentCount = useMemo(
    () => accounts.filter((account) => account.isCurrent).length,
    [accounts],
  );

  const loadAccounts = useCallback(async () => {
    const data = await invoke<AccountSummary[]>("list_accounts");
    setAccounts(data);
  }, []);

  const refreshUsage = useCallback(async (quiet = false) => {
    try {
      if (!quiet) {
        setRefreshing(true);
      }
      const data = await invoke<AccountSummary[]>("refresh_all_usage");
      setAccounts(data);
      if (!quiet) {
        setNotice({ type: "ok", message: "用量已刷新" });
      }
    } catch (error) {
      if (!quiet) {
        setNotice({ type: "error", message: `刷新失败：${String(error)}` });
      }
    } finally {
      if (!quiet) {
        setRefreshing(false);
      }
    }
  }, []);

  const restoreAuthAfterAddFlow = useCallback(async () => {
    try {
      await invoke<boolean>("restore_auth_after_add_flow");
    } catch (error) {
      setNotice({ type: "error", message: `恢复原账号失败：${String(error)}` });
    }
  }, []);

  const checkForAppUpdate = useCallback(async (quiet = false) => {
    if (!quiet) {
      setCheckingUpdate(true);
    }
    try {
      const update = await check();
      if (update) {
        setPendingUpdate({
          currentVersion: update.currentVersion,
          version: update.version,
          body: update.body,
          date: update.date,
        });
        if (!quiet) {
          setNotice({
            type: "info",
            message: `发现新版本 ${update.version}（当前 ${update.currentVersion}）`,
          });
        }
      } else {
        setPendingUpdate(null);
        if (!quiet) {
          setNotice({ type: "ok", message: "当前已是最新版本" });
        }
      }
    } catch (error) {
      if (!quiet) {
        setNotice({ type: "error", message: `检查更新失败：${String(error)}` });
      }
    } finally {
      if (!quiet) {
        setCheckingUpdate(false);
      }
    }
  }, []);

  const installPendingUpdate = useCallback(async () => {
    setInstallingUpdate(true);
    setUpdateProgress("准备下载更新...");
    try {
      const update = await check();
      if (!update) {
        setPendingUpdate(null);
        setNotice({ type: "ok", message: "当前已是最新版本" });
        return;
      }

      let totalBytes = 0;
      let downloadedBytes = 0;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          totalBytes = event.data.contentLength ?? 0;
          downloadedBytes = 0;
          setUpdateProgress("开始下载更新...");
        } else if (event.event === "Progress") {
          downloadedBytes += event.data.chunkLength;
          if (totalBytes > 0) {
            const percentValue = Math.min(100, Math.round((downloadedBytes / totalBytes) * 100));
            setUpdateProgress(`下载中 ${percentValue}%`);
          } else {
            setUpdateProgress("下载中...");
          }
        } else if (event.event === "Finished") {
          setUpdateProgress("下载完成，准备安装...");
        }
      });

      setUpdateProgress("安装完成，正在重启...");
      await relaunch();
    } catch (error) {
      setNotice({ type: "error", message: `安装更新失败：${String(error)}` });
      setUpdateProgress(null);
    } finally {
      setInstallingUpdate(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await loadAccounts();
        await refreshUsage(true);
        await checkForAppUpdate(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    const timer = setInterval(() => {
      void refreshUsage(true);
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [checkForAppUpdate, loadAccounts, refreshUsage]);

  useEffect(() => {
    if (!addFlow) {
      return;
    }

    let cancelled = false;
    let inFlight = false;

    const poll = async () => {
      if (cancelled || inFlight) {
        return;
      }
      inFlight = true;

      try {
        const current = await invoke<CurrentAuthStatus>("get_current_auth_status");
        if (!current.available || !current.fingerprint) {
          return;
        }

        if (current.fingerprint === addFlow.baselineFingerprint) {
          return;
        }

        await invoke<AccountSummary>("import_current_auth_account", { label: null });
        await restoreAuthAfterAddFlow();
        await refreshUsage(true);
        await loadAccounts();

        if (!cancelled) {
          setAddFlow(null);
          setNotice({ type: "ok", message: "授权成功，账号已自动添加并刷新。" });
        }
      } catch (error) {
        await restoreAuthAfterAddFlow();
        if (!cancelled) {
          setAddFlow(null);
          setNotice({ type: "error", message: `自动导入失败：${String(error)}` });
        }
      } finally {
        inFlight = false;
      }
    };

    void poll();

    const timer = setInterval(() => {
      void poll();
    }, ADD_FLOW_POLL_MS);

    const timeoutTimer = setTimeout(() => {
      if (!cancelled) {
        setAddFlow(null);
        void restoreAuthAfterAddFlow();
        setNotice({ type: "error", message: "等待授权超时，请重新点击“添加账号”。" });
      }
    }, ADD_FLOW_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(timeoutTimer);
    };
  }, [addFlow, loadAccounts, refreshUsage, restoreAuthAfterAddFlow]);

  const onStartAddAccount = useCallback(async () => {
    if (addFlow) {
      return;
    }

    setStartingAdd(true);
    try {
      const baseline = await invoke<CurrentAuthStatus>("get_current_auth_status");
      await invoke<void>("launch_codex_login");
      setAddFlow({
        baselineFingerprint: baseline.fingerprint,
      });
      setNotice({
        type: "info",
        message: "已打开登录授权流程，授权成功后将自动添加账号并刷新列表。",
      });
    } catch (error) {
      setNotice({ type: "error", message: `无法启动登录流程：${String(error)}` });
    } finally {
      setStartingAdd(false);
    }
  }, [addFlow]);

  const onCancelAddFlow = useCallback(() => {
    setAddFlow(null);
    void restoreAuthAfterAddFlow();
    setNotice({ type: "info", message: "已取消自动监听。" });
  }, [restoreAuthAfterAddFlow]);

  const onDelete = useCallback(async (account: AccountSummary) => {
    if (!window.confirm(`确认删除账号 ${account.label} 吗？`)) {
      return;
    }

    try {
      await invoke<void>("delete_account", { id: account.id });
      setAccounts((prev) => prev.filter((item) => item.id !== account.id));
      setNotice({ type: "ok", message: "账号已删除" });
    } catch (error) {
      setNotice({ type: "error", message: `删除失败：${String(error)}` });
    }
  }, []);

  const onSwitch = useCallback(
    async (account: AccountSummary) => {
      setSwitchingId(account.id);
      try {
        const result = await invoke<SwitchAccountResult>("switch_account_and_launch", {
          id: account.id,
          workspacePath: null,
        });
        await loadAccounts();

        if (result.usedFallbackCli) {
          setNotice({
            type: "info",
            message: "账号已切换。未找到本地 Codex.app，已尝试通过 codex app 启动。",
          });
        } else {
          setNotice({ type: "ok", message: "账号已切换，正在启动 Codex。" });
        }
      } catch (error) {
        setNotice({ type: "error", message: `切换失败：${String(error)}` });
      } finally {
        setSwitchingId(null);
      }
    },
    [loadAccounts],
  );

  return (
    <div className="shell">
      <div className="ambient" />
      <main className="panel">
        <header className="topbar">
          <div>
            <p className="kicker">Codex Multi Account</p>
            <h1>Codex 账号切换器</h1>
            <p className="subtitle">
              自动同步 5h / 1week 用量（每 30 秒），支持一键切换，并可检测 GitHub Releases 新版本。
            </p>
          </div>
          <div className="topActions">
            <button
              className="ghost"
              onClick={() => void checkForAppUpdate(false)}
              disabled={checkingUpdate || installingUpdate}
            >
              {checkingUpdate ? "检查中..." : "检查更新"}
            </button>
            <button className="primary" onClick={() => void refreshUsage(false)} disabled={refreshing}>
              {refreshing ? "刷新中..." : "手动刷新"}
            </button>
          </div>
        </header>

        <section className="metaStrip">
          <div>
            <span>账号数</span>
            <strong>{accounts.length}</strong>
          </div>
          <div>
            <span>当前活跃</span>
            <strong>{currentCount}</strong>
          </div>
        </section>

        <section className="importBox">
          <h2>添加账号</h2>
          <p>点击后会打开登录授权。授权完成后会自动导入并刷新，不需要手动再点导入。</p>
          <div className="importRow">
            <button
              className="primary"
              onClick={() => void onStartAddAccount()}
              disabled={startingAdd || Boolean(addFlow)}
            >
              {startingAdd ? "启动中..." : addFlow ? "等待授权中..." : "添加账号"}
            </button>
            {addFlow && (
              <button className="ghost" onClick={onCancelAddFlow}>
                取消监听
              </button>
            )}
          </div>
          {addFlow && (
            <p className="hint">正在监听登录状态变化（最多 10 分钟）。</p>
          )}
        </section>

        {notice && <div className={`notice ${notice.type}`}>{notice.message}</div>}

        {pendingUpdate && (
          <section className="updateBanner">
            <div className="updateText">
              <strong>发现新版本 {pendingUpdate.version}</strong>
              <span>当前版本 {pendingUpdate.currentVersion}</span>
              {pendingUpdate.date && <span>发布时间 {pendingUpdate.date}</span>}
            </div>
            <div className="updateActions">
              <button
                className="primary"
                onClick={() => void installPendingUpdate()}
                disabled={installingUpdate}
              >
                {installingUpdate ? "更新中..." : "更新并重启"}
              </button>
            </div>
            {pendingUpdate.body && <p className="updateBody">{pendingUpdate.body}</p>}
            {updateProgress && <p className="updateProgress">{updateProgress}</p>}
          </section>
        )}

        <section className="cards" aria-busy={loading}>
          {accounts.length === 0 && !loading && (
            <div className="emptyState">
              <h3>还没有账号</h3>
              <p>点击“添加账号”，完成授权后会自动出现在列表中。</p>
            </div>
          )}

          {accounts.map((account) => {
            const usage = account.usage;
            const fiveHour = usage?.fiveHour ?? null;
            const oneWeek = usage?.oneWeek ?? null;
            const planLabel = formatPlan(usage?.planType || account.planType);
            const tone = planTone(usage?.planType || account.planType);

            return (
              <article
                key={account.id}
                className={`accountCard tone-${tone} ${account.isCurrent ? "isCurrent" : ""}`}
              >
                <div className="stamps">
                  <span className="stamp stampPlan">{planLabel}</span>
                  {account.isCurrent && <span className="stamp stampCurrent">当前</span>}
                </div>
                <div className="cardHead">
                  <div>
                    <h3 className={account.isCurrent ? "nameCurrent" : ""}>{account.label}</h3>
                    <p>{account.email || account.accountId}</p>
                  </div>
                </div>

                <div className="usageRow">
                  <div className="usageTitle">
                    <span>{formatWindowLabel(fiveHour, "5h")}</span>
                    <div className="usageStats">
                      <strong>已用 {percent(fiveHour?.usedPercent)}</strong>
                      <em>剩余 {percent(remainingPercent(fiveHour))}</em>
                    </div>
                  </div>
                  <div className="barTrack">
                    <div className="barFill hot" style={{ width: toProgressWidth(fiveHour?.usedPercent) }} />
                  </div>
                  <small>重置时间：{formatResetAt(fiveHour?.resetAt)}</small>
                </div>

                <div className="usageRow">
                  <div className="usageTitle">
                    <span>{formatWindowLabel(oneWeek, "1week")}</span>
                    <div className="usageStats">
                      <strong>已用 {percent(oneWeek?.usedPercent)}</strong>
                      <em>剩余 {percent(remainingPercent(oneWeek))}</em>
                    </div>
                  </div>
                  <div className="barTrack">
                    <div className="barFill cool" style={{ width: toProgressWidth(oneWeek?.usedPercent) }} />
                  </div>
                  <small>重置时间：{formatResetAt(oneWeek?.resetAt)}</small>
                </div>

                {usage?.credits && (
                  <p className="credits">
                    Credits: {usage.credits.unlimited ? "Unlimited" : usage.credits.balance ?? "--"}
                  </p>
                )}

                {account.usageError && <p className="errorText">{account.usageError}</p>}

                <div className="cardActions">
                  <button
                    className="primary"
                    onClick={() => void onSwitch(account)}
                    disabled={switchingId === account.id}
                  >
                    {switchingId === account.id ? "切换中..." : "切换并启动"}
                  </button>
                  <button className="danger" onClick={() => void onDelete(account)}>
                    删除
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export default App;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { useI18n } from "../i18n/I18nProvider";
import type {
  AccountSummary,
  AppSettings,
  AddFlow,
  CurrentAuthStatus,
  InstalledEditorApp,
  Notice,
  PendingUpdateInfo,
  SwitchAccountResult,
  UpdateSettingsOptions,
} from "../types/app";
import { pickBestRemainingAccount, sortAccountsByRemaining } from "../utils/accountRanking";

const REFRESH_MS = 30_000;
const EDITOR_SCAN_MS = 60_000;
const ADD_FLOW_TIMEOUT_MS = 10 * 60_000;
const ADD_FLOW_POLL_MS = 2_500;
const MANUAL_DOWNLOAD_URL = "https://github.com/170-carry/codex-tools/releases/latest";
const DEFAULT_SETTINGS: AppSettings = {
  launchAtStartup: false,
  trayUsageDisplayMode: "remaining",
  launchCodexAfterSwitch: true,
  syncOpencodeOpenaiAuth: false,
  restartEditorsOnSwitch: false,
  restartEditorTargets: [],
};

export function useCodexController() {
  const { copy } = useI18n();
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingAdd, setStartingAdd] = useState(false);
  const [addFlow, setAddFlow] = useState<AddFlow | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdateInfo | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  const [installedEditorApps, setInstalledEditorApps] = useState<InstalledEditorApp[]>([]);
  const installingUpdateRef = useRef(false);
  const deleteConfirmTimerRef = useRef<number | null>(null);
  const settingsUpdateQueueRef = useRef<Promise<void>>(Promise.resolve());

  const currentCount = useMemo(
    () => accounts.filter((account) => account.isCurrent).length,
    [accounts],
  );
  const sortedAccounts = useMemo(() => sortAccountsByRemaining(accounts), [accounts]);

  const loadAccounts = useCallback(async () => {
    const data = await invoke<AccountSummary[]>("list_accounts");
    setAccounts(data);
  }, []);

  const loadSettings = useCallback(async () => {
    const data = await invoke<AppSettings>("get_app_settings");
    setSettings(data);
  }, []);

  const loadInstalledEditorApps = useCallback(async () => {
    try {
      const data = await invoke<InstalledEditorApp[]>("list_installed_editor_apps");
      setInstalledEditorApps(data);
    } catch {
      setInstalledEditorApps([]);
    }
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>, options?: UpdateSettingsOptions) => {
      const shouldLockUi = !options?.keepInteractive;
      const task = async () => {
        if (shouldLockUi) {
          setSavingSettings(true);
        }

        try {
          const data = await invoke<AppSettings>("update_app_settings", { patch });
          setSettings(data);
          if (!options?.silent) {
            setNotice({ type: "ok", message: copy.notices.settingsUpdated });
          }
        } catch (error) {
          setNotice({ type: "error", message: copy.notices.updateSettingsFailed(String(error)) });
        } finally {
          if (shouldLockUi) {
            setSavingSettings(false);
          }
        }
      };

      const run = settingsUpdateQueueRef.current.then(task, task);
      settingsUpdateQueueRef.current = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
    [copy.notices],
  );

  const refreshUsage = useCallback(async (quiet = false) => {
    try {
      if (!quiet) {
        setRefreshing(true);
      }
      const data = await invoke<AccountSummary[]>("refresh_all_usage", {
        forceAuthRefresh: !quiet,
      });
      setAccounts(data);
      if (!quiet) {
        setNotice({ type: "ok", message: copy.notices.usageRefreshed });
      }
    } catch (error) {
      if (!quiet) {
        setNotice({ type: "error", message: copy.notices.refreshFailed(String(error)) });
      }
    } finally {
      if (!quiet) {
        setRefreshing(false);
      }
    }
  }, [copy.notices]);

  const restoreAuthAfterAddFlow = useCallback(async () => {
    try {
      await invoke<boolean>("restore_auth_after_add_flow");
    } catch (error) {
      setNotice({ type: "error", message: copy.notices.restoreAuthFailed(String(error)) });
    }
  }, [copy.notices]);

  useEffect(() => {
    installingUpdateRef.current = installingUpdate;
  }, [installingUpdate]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const ttl = notice.type === "error" ? 6_000 : 3_500;
    const timer = window.setTimeout(() => {
      setNotice((current) => (current === notice ? null : current));
    }, ttl);
    return () => {
      window.clearTimeout(timer);
    };
  }, [notice]);

  useEffect(
    () => () => {
      if (deleteConfirmTimerRef.current !== null) {
        window.clearTimeout(deleteConfirmTimerRef.current);
        deleteConfirmTimerRef.current = null;
      }
    },
    [],
  );

  const installPendingUpdate = useCallback(
    async (knownUpdate?: NonNullable<Awaited<ReturnType<typeof check>>>) => {
      if (installingUpdateRef.current) {
        return;
      }

      setInstallingUpdate(true);
      setUpdateProgress(copy.notices.preparingUpdateDownload);
      try {
        const update = knownUpdate ?? (await check());
        if (!update) {
          setPendingUpdate(null);
          setUpdateDialogOpen(false);
          setNotice({ type: "ok", message: copy.notices.alreadyLatest });
          return;
        }

        let totalBytes = 0;
        let downloadedBytes = 0;
        await update.downloadAndInstall((event) => {
          if (event.event === "Started") {
            totalBytes = event.data.contentLength ?? 0;
            downloadedBytes = 0;
            setUpdateProgress(copy.notices.updateDownloadStarted);
          } else if (event.event === "Progress") {
            downloadedBytes += event.data.chunkLength;
            if (totalBytes > 0) {
              const percentValue = Math.min(
                100,
                Math.round((downloadedBytes / totalBytes) * 100),
              );
              setUpdateProgress(copy.notices.updateDownloadingPercent(percentValue));
            } else {
              setUpdateProgress(copy.notices.updateDownloading);
            }
          } else if (event.event === "Finished") {
            setUpdateProgress(copy.notices.updateDownloadFinished);
          }
        });

        setUpdateProgress(copy.notices.updateInstalling);
        await relaunch();
      } catch (error) {
        setNotice({ type: "error", message: copy.notices.updateInstallFailed(String(error)) });
        setUpdateProgress(null);
      } finally {
        setInstallingUpdate(false);
      }
    },
    [copy.notices],
  );

  const checkForAppUpdate = useCallback(
    async (quiet = false) => {
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
          setUpdateDialogOpen(true);
          if (!quiet) {
            setNotice({
              type: "info",
              message: copy.notices.foundNewVersion(update.version, update.currentVersion),
            });
          }
          void installPendingUpdate(update);
        } else {
          setPendingUpdate(null);
          setUpdateDialogOpen(false);
          if (!quiet) {
            setNotice({ type: "ok", message: copy.notices.alreadyLatest });
          }
        }
      } catch (error) {
        if (!quiet) {
          setNotice({ type: "error", message: copy.notices.updateCheckFailed(String(error)) });
        }
      } finally {
        if (!quiet) {
          setCheckingUpdate(false);
        }
      }
    },
    [copy.notices, installPendingUpdate],
  );

  const openManualDownloadPage = useCallback(async () => {
    try {
      await invoke("open_external_url", { url: MANUAL_DOWNLOAD_URL });
    } catch (error) {
      setNotice({ type: "error", message: copy.notices.openManualDownloadFailed(String(error)) });
    }
  }, [copy.notices]);

  const closeUpdateDialog = useCallback(() => {
    setUpdateDialogOpen(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await loadInstalledEditorApps();
        await loadSettings();
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

    const usageTimer = setInterval(() => {
      void refreshUsage(true);
    }, REFRESH_MS);

    const editorTimer = setInterval(() => {
      void loadInstalledEditorApps();
    }, EDITOR_SCAN_MS);

    return () => {
      cancelled = true;
      clearInterval(usageTimer);
      clearInterval(editorTimer);
    };
  }, [checkForAppUpdate, loadAccounts, loadInstalledEditorApps, loadSettings, refreshUsage]);

  useEffect(() => {
    let disposed = false;
    let unlisten: UnlistenFn | null = null;

    void listen("app-menu-check-update", () => {
      void checkForAppUpdate(false);
    })
      .then((fn) => {
        if (disposed) {
          void fn();
          return;
        }
        unlisten = fn;
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (unlisten) {
        void unlisten();
      }
    };
  }, [checkForAppUpdate]);

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
          setNotice({ type: "ok", message: copy.notices.addAccountSuccess });
        }
      } catch (error) {
        await restoreAuthAfterAddFlow();
        if (!cancelled) {
          setAddFlow(null);
          setNotice({ type: "error", message: copy.notices.addAccountAutoImportFailed(String(error)) });
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
        setNotice({ type: "error", message: copy.notices.addAccountTimeout });
      }
    }, ADD_FLOW_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(timeoutTimer);
    };
  }, [addFlow, copy.notices, loadAccounts, refreshUsage, restoreAuthAfterAddFlow]);

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
    } catch (error) {
      setNotice({ type: "error", message: copy.notices.startLoginFlowFailed(String(error)) });
    } finally {
      setStartingAdd(false);
    }
  }, [addFlow, copy.notices]);

  const onCancelAddFlow = useCallback(() => {
    setAddFlow(null);
    void restoreAuthAfterAddFlow();
  }, [restoreAuthAfterAddFlow]);

  const onDelete = useCallback(async (account: AccountSummary) => {
    if (pendingDeleteId !== account.id) {
      setPendingDeleteId(account.id);
      if (deleteConfirmTimerRef.current !== null) {
        window.clearTimeout(deleteConfirmTimerRef.current);
      }
      deleteConfirmTimerRef.current = window.setTimeout(() => {
        setPendingDeleteId((current) => (current === account.id ? null : current));
        deleteConfirmTimerRef.current = null;
      }, 5_000);
      setNotice({ type: "info", message: copy.notices.deleteConfirm(account.label) });
      return;
    }

    if (deleteConfirmTimerRef.current !== null) {
      window.clearTimeout(deleteConfirmTimerRef.current);
      deleteConfirmTimerRef.current = null;
    }
    setPendingDeleteId(null);

    try {
      await invoke<void>("delete_account", { id: account.id });
      setAccounts((prev) => prev.filter((item) => item.id !== account.id));
      setNotice({ type: "ok", message: copy.notices.accountDeleted });
    } catch (error) {
      setNotice({ type: "error", message: copy.notices.deleteFailed(String(error)) });
    }
  }, [copy.notices, pendingDeleteId]);

  const onSwitch = useCallback(
    async (account: AccountSummary) => {
      setSwitchingId(account.id);
      try {
        const result = await invoke<SwitchAccountResult>("switch_account_and_launch", {
          id: account.id,
          workspacePath: null,
          launchCodex: settings.launchCodexAfterSwitch,
          restartEditorsOnSwitch: settings.restartEditorsOnSwitch,
          restartEditorTargets: settings.restartEditorTargets,
        });
        await loadAccounts();

        let baseNotice: Notice;
        if (!settings.launchCodexAfterSwitch) {
          baseNotice = { type: "ok", message: copy.notices.switchedOnly };
        } else if (result.usedFallbackCli) {
          baseNotice = {
            type: "info",
            message: copy.notices.switchedAndLaunchByCli,
          };
        } else {
          baseNotice = { type: "ok", message: copy.notices.switchedAndLaunching };
        }

        if (settings.syncOpencodeOpenaiAuth) {
          if (result.opencodeSyncError) {
            baseNotice = {
              type: "error",
              message: copy.notices.opencodeSyncFailed(baseNotice.message, result.opencodeSyncError),
            };
          } else if (result.opencodeSynced) {
            baseNotice = {
              ...baseNotice,
              message: copy.notices.opencodeSynced(baseNotice.message),
            };
          }
        }

        if (settings.restartEditorsOnSwitch) {
          if (result.editorRestartError) {
            baseNotice = {
              type: "error",
              message: copy.notices.editorRestartFailed(baseNotice.message, result.editorRestartError),
            };
          } else if (result.restartedEditorApps.length > 0) {
            const restartedLabels = result.restartedEditorApps
              .map((id) => copy.editorAppLabels[id] ?? id)
              .join(" / ");
            baseNotice = {
              ...baseNotice,
              message: copy.notices.editorsRestarted(baseNotice.message, restartedLabels),
            };
          } else {
            baseNotice = {
              ...baseNotice,
              message: copy.notices.noEditorRestarted(baseNotice.message),
            };
          }
        }

        setNotice(baseNotice);
      } catch (error) {
        setNotice({ type: "error", message: copy.notices.switchFailed(String(error)) });
      } finally {
        setSwitchingId(null);
      }
    },
    [
      copy.editorAppLabels,
      copy.notices,
      loadAccounts,
      settings.launchCodexAfterSwitch,
      settings.syncOpencodeOpenaiAuth,
      settings.restartEditorsOnSwitch,
      settings.restartEditorTargets,
    ],
  );

  const onSmartSwitch = useCallback(async () => {
    if (switchingId) {
      return;
    }

    const target = pickBestRemainingAccount(sortedAccounts);
    if (!target) {
      setNotice({ type: "info", message: copy.notices.smartSwitchNoTarget });
      return;
    }
    if (target.isCurrent) {
      setNotice({
        type: "info",
        message: copy.notices.smartSwitchAlreadyBest,
      });
      return;
    }

    await onSwitch(target);
  }, [copy.notices, onSwitch, sortedAccounts, switchingId]);

  return {
    accounts: sortedAccounts,
    loading,
    refreshing,
    startingAdd,
    addFlow,
    switchingId,
    pendingDeleteId,
    checkingUpdate,
    installingUpdate,
    updateProgress,
    pendingUpdate,
    updateDialogOpen,
    notice,
    settings,
    savingSettings,
    installedEditorApps,
    currentCount,
    refreshUsage,
    checkForAppUpdate,
    installPendingUpdate,
    openManualDownloadPage,
    closeUpdateDialog,
    updateSettings,
    onStartAddAccount,
    onCancelAddFlow,
    onDelete,
    onSwitch,
    onSmartSwitch,
    smartSwitching: switchingId !== null,
  };
}

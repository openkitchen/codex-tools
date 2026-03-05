export const SUPPORTED_LOCALES = ["zh-CN", "en-US", "ja-JP", "ko-KR", "ru-RU"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocaleOption = {
  code: AppLocale;
  shortLabel: string;
  nativeLabel: string;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "zh-CN", shortLabel: "中", nativeLabel: "中文" },
  { code: "en-US", shortLabel: "EN", nativeLabel: "English" },
  { code: "ja-JP", shortLabel: "日", nativeLabel: "日本語" },
  { code: "ko-KR", shortLabel: "한", nativeLabel: "한국어" },
  { code: "ru-RU", shortLabel: "RU", nativeLabel: "Русский" },
];

export const DEFAULT_LOCALE: AppLocale = "zh-CN";

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return (
    value === "zh-CN" ||
    value === "en-US" ||
    value === "ja-JP" ||
    value === "ko-KR" ||
    value === "ru-RU"
  );
}

export function getNextLocale(current: AppLocale): AppLocale {
  const index = LOCALE_OPTIONS.findIndex((item) => item.code === current);
  if (index < 0) {
    return DEFAULT_LOCALE;
  }
  return LOCALE_OPTIONS[(index + 1) % LOCALE_OPTIONS.length].code;
}

export type MessageCatalog = {
  common: {
    close: string;
  };
  topBar: {
    appTitle: string;
    logoAlt: string;
    checkUpdate: string;
    checkingUpdate: string;
    manualRefresh: string;
    refreshing: string;
    openSettings: string;
    toggleLanguage: (nextLanguage: string) => string;
  };
  metaStrip: {
    ariaLabel: string;
    accountCount: string;
    currentActive: string;
  };
  addAccount: {
    smartSwitch: string;
    startButton: string;
    startingButton: string;
    waitingButton: string;
    dialogAriaLabel: string;
    dialogTitle: string;
    dialogSubtitle: string;
    launchingTitle: string;
    watchingTitle: string;
    launchingDetail: string;
    watchingDetail: string;
    cancelListening: string;
    closeDialog: string;
  };
  accountCard: {
    currentStamp: string;
    launch: string;
    launching: string;
    delete: string;
    deleteConfirm: string;
    used: string;
    remaining: string;
    resetAt: string;
    credits: string;
    unlimited: string;
    fiveHourFallback: string;
    oneWeekFallback: string;
    oneWeekLabel: string;
    hourSuffix: string;
    minuteSuffix: string;
    planLabels: Record<string, string>;
  };
  accountsGrid: {
    emptyTitle: string;
    emptyDescription: string;
  };
  settings: {
    dialogAriaLabel: string;
    title: string;
    subtitle: string;
    close: string;
    launchAtStartup: {
      label: string;
      description: string;
      checkedText: string;
      uncheckedText: string;
    };
    launchCodexAfterSwitch: {
      label: string;
      description: string;
      checkedText: string;
      uncheckedText: string;
    };
    syncOpencode: {
      label: string;
      description: string;
      checkedText: string;
      uncheckedText: string;
    };
    restartEditorsOnSwitch: {
      label: string;
      description: string;
      checkedText: string;
      uncheckedText: string;
    };
    restartEditorTargets: {
      label: string;
      description: string;
    };
    noSupportedEditors: string;
    trayUsageDisplay: {
      label: string;
      description: string;
      groupAriaLabel: string;
      remaining: string;
      used: string;
      hidden: string;
    };
    theme: {
      label: string;
      description: string;
      switchAriaLabel: string;
      dark: string;
      light: string;
    };
  };
  editorPicker: {
    ariaLabel: string;
    placeholder: string;
  };
  editorAppLabels: Record<string, string>;
  updateDialog: {
    ariaLabel: string;
    title: (version: string) => string;
    subtitle: (currentVersion: string) => string;
    close: string;
    publishedAt: (date: string) => string;
    autoDownloading: string;
    autoPaused: string;
    manualDownload: string;
    retryAutoDownload: string;
    retryingAutoDownload: string;
  };
  notices: {
    settingsUpdated: string;
    updateSettingsFailed: (error: string) => string;
    usageRefreshed: string;
    refreshFailed: (error: string) => string;
    restoreAuthFailed: (error: string) => string;
    preparingUpdateDownload: string;
    alreadyLatest: string;
    updateDownloadStarted: string;
    updateDownloadingPercent: (percent: number) => string;
    updateDownloading: string;
    updateDownloadFinished: string;
    updateInstalling: string;
    updateInstallFailed: (error: string) => string;
    foundNewVersion: (version: string, currentVersion: string) => string;
    updateCheckFailed: (error: string) => string;
    openManualDownloadFailed: (error: string) => string;
    addAccountSuccess: string;
    addAccountAutoImportFailed: (error: string) => string;
    addAccountTimeout: string;
    startLoginFlowFailed: (error: string) => string;
    deleteConfirm: (label: string) => string;
    accountDeleted: string;
    deleteFailed: (error: string) => string;
    switchedOnly: string;
    switchedAndLaunchByCli: string;
    switchedAndLaunching: string;
    opencodeSyncFailed: (base: string, error: string) => string;
    opencodeSynced: (base: string) => string;
    editorRestartFailed: (base: string, error: string) => string;
    editorsRestarted: (base: string, labels: string) => string;
    noEditorRestarted: (base: string) => string;
    switchFailed: (error: string) => string;
    smartSwitchNoTarget: string;
    smartSwitchAlreadyBest: string;
  };
};

export const MESSAGES: Record<AppLocale, MessageCatalog> = {
  "zh-CN": {
    common: {
      close: "关闭",
    },
    topBar: {
      appTitle: "Codex Tools",
      logoAlt: "Codex Tools 标志",
      checkUpdate: "检查更新",
      checkingUpdate: "检查更新中",
      manualRefresh: "手动刷新",
      refreshing: "刷新中",
      openSettings: "打开设置",
      toggleLanguage: (nextLanguage) => `切换语言（下一项：${nextLanguage}）`,
    },
    metaStrip: {
      ariaLabel: "账号概览",
      accountCount: "账号数",
      currentActive: "当前活跃",
    },
    addAccount: {
      smartSwitch: "智能切换",
      startButton: "添加账号",
      startingButton: "启动中...",
      waitingButton: "等待授权中...",
      dialogAriaLabel: "添加账号授权",
      dialogTitle: "添加账号",
      dialogSubtitle: "浏览器授权完成后会自动写入账号列表。",
      launchingTitle: "正在启动授权流程...",
      watchingTitle: "正在监听登录状态变化",
      launchingDetail: "正在打开浏览器并初始化监听，请稍候。",
      watchingDetail:
        "请在浏览器完成登录授权。授权成功后会自动导入账号并刷新列表（最长 10 分钟）。",
      cancelListening: "取消监听",
      closeDialog: "关闭弹窗",
    },
    accountCard: {
      currentStamp: "当前",
      launch: "切换并启动",
      launching: "启动中",
      delete: "删除账号",
      deleteConfirm: "再次点击确认删除账号",
      used: "已用",
      remaining: "剩余",
      resetAt: "重置时间",
      credits: "Credits",
      unlimited: "无限制",
      fiveHourFallback: "5h",
      oneWeekFallback: "1week",
      oneWeekLabel: "1周",
      hourSuffix: "h",
      minuteSuffix: "m",
      planLabels: {
        unknown: "UNKNOWN",
        free: "FREE",
        plus: "PLUS",
        pro: "PRO",
        team: "TEAM",
        enterprise: "ENTERPRISE",
        business: "BUSINESS",
      },
    },
    accountsGrid: {
      emptyTitle: "还没有账号",
      emptyDescription: "点击“添加账号”，完成授权后会自动出现在列表中。",
    },
    settings: {
      dialogAriaLabel: "应用设置",
      title: "设置",
      subtitle: "可配置开机启动、状态栏显示模式和主题。",
      close: "关闭设置",
      launchAtStartup: {
        label: "开机启动",
        description: "启用后会在系统登录时自动启动 Codex Tools。",
        checkedText: "开启",
        uncheckedText: "关闭",
      },
      launchCodexAfterSwitch: {
        label: "切换后启动 Codex",
        description: "默认开启。关闭时仅切换账号，不自动拉起 Codex。",
        checkedText: "启动",
        uncheckedText: "仅切换",
      },
      syncOpencode: {
        label: "同步 Opencode OpenAI",
        description: "切换账号时自动探测 opencode 认证文件，并同步 refresh/access。",
        checkedText: "同步",
        uncheckedText: "不同步",
      },
      restartEditorsOnSwitch: {
        label: "切换时重启编辑器（兼容 Codex 编辑器插件）",
        description: "默认关闭。开启后切换账号会强制关闭并重启你选中的编辑器。",
        checkedText: "重启",
        uncheckedText: "不重启",
      },
      restartEditorTargets: {
        label: "重启目标编辑器（单选）",
        description:
          "后台自动检测已安装的 VSCode/VSCode Insiders/Cursor/Antigravity/Kiro/Trae/Qoder。",
      },
      noSupportedEditors: "当前未检测到支持重启的编辑器。",
      trayUsageDisplay: {
        label: "状态栏展示",
        description: "控制状态栏菜单中显示“已用”、“剩余”或不展示。",
        groupAriaLabel: "状态栏展示模式",
        remaining: "剩余",
        used: "已用",
        hidden: "不展示",
      },
      theme: {
        label: "主题",
        description: "使用开关切换浅色和深色主题。",
        switchAriaLabel: "切换主题",
        dark: "深色",
        light: "浅色",
      },
    },
    editorPicker: {
      ariaLabel: "选择需要重启的编辑器",
      placeholder: "请选择编辑器",
    },
    editorAppLabels: {
      vscode: "VS Code",
      vscodeInsiders: "Visual Studio Code - Insiders",
      cursor: "Cursor",
      antigravity: "Antigravity",
      kiro: "Kiro",
      trae: "Trae",
      qoder: "Qoder",
    },
    updateDialog: {
      ariaLabel: "应用更新",
      title: (version) => `发现新版本 ${version}`,
      subtitle: (currentVersion) => `当前版本 ${currentVersion}，已自动开始下载更新。`,
      close: "关闭更新弹窗",
      publishedAt: (date) => `发布时间 ${date}`,
      autoDownloading: "自动下载中...",
      autoPaused: "自动下载已暂停或失败，可手动处理。",
      manualDownload: "手动下载",
      retryAutoDownload: "重新自动下载",
      retryingAutoDownload: "自动下载中...",
    },
    notices: {
      settingsUpdated: "设置已更新",
      updateSettingsFailed: (error) => `更新设置失败：${error}`,
      usageRefreshed: "用量已刷新",
      refreshFailed: (error) => `刷新失败：${error}`,
      restoreAuthFailed: (error) => `恢复原账号失败：${error}`,
      preparingUpdateDownload: "准备下载更新...",
      alreadyLatest: "当前已是最新版本",
      updateDownloadStarted: "开始下载更新...",
      updateDownloadingPercent: (percent) => `下载中 ${percent}%`,
      updateDownloading: "下载中...",
      updateDownloadFinished: "下载完成，准备安装...",
      updateInstalling: "安装完成，正在重启...",
      updateInstallFailed: (error) => `安装更新失败：${error}`,
      foundNewVersion: (version, currentVersion) =>
        `发现新版本 ${version}（当前 ${currentVersion}），已开始自动下载。`,
      updateCheckFailed: (error) => `检查更新失败：${error}`,
      openManualDownloadFailed: (error) => `打开下载页面失败：${error}`,
      addAccountSuccess: "授权成功，账号已自动添加并刷新。",
      addAccountAutoImportFailed: (error) => `自动导入失败：${error}`,
      addAccountTimeout: "等待授权超时，请重新点击“添加账号”。",
      startLoginFlowFailed: (error) => `无法启动登录流程：${error}`,
      deleteConfirm: (label) => `再次点击删除账号 ${label} 以确认。`,
      accountDeleted: "账号已删除",
      deleteFailed: (error) => `删除失败：${error}`,
      switchedOnly: "账号已切换（未自动启动 Codex）。",
      switchedAndLaunchByCli: "账号已切换。未找到本地 Codex.app，已尝试通过 codex app 启动。",
      switchedAndLaunching: "账号已切换，正在启动 Codex。",
      opencodeSyncFailed: (base, error) => `${base} Opencode 同步失败：${error}`,
      opencodeSynced: (base) => `${base} 已同步 Opencode OpenAI 认证。`,
      editorRestartFailed: (base, error) => `${base} 编辑器重启失败：${error}`,
      editorsRestarted: (base, labels) => `${base} 已重启编辑器：${labels}`,
      noEditorRestarted: (base) => `${base} 未检测到可重启的已安装编辑器。`,
      switchFailed: (error) => `切换失败：${error}`,
      smartSwitchNoTarget: "暂无可切换账号，请先添加账号。",
      smartSwitchAlreadyBest: "当前账号已是最优余量账号（优先 1week，其次 5h）。",
    },
  },
  "en-US": {
    common: {
      close: "Close",
    },
    topBar: {
      appTitle: "Codex Tools",
      logoAlt: "Codex Tools logo",
      checkUpdate: "Check updates",
      checkingUpdate: "Checking updates",
      manualRefresh: "Refresh usage",
      refreshing: "Refreshing",
      openSettings: "Open settings",
      toggleLanguage: (nextLanguage) => `Switch language (next: ${nextLanguage})`,
    },
    metaStrip: {
      ariaLabel: "Account overview",
      accountCount: "Accounts",
      currentActive: "Active now",
    },
    addAccount: {
      smartSwitch: "Smart switch",
      startButton: "Add account",
      startingButton: "Starting...",
      waitingButton: "Waiting for auth...",
      dialogAriaLabel: "Add account authorization",
      dialogTitle: "Add account",
      dialogSubtitle: "The account list will update automatically after browser authorization.",
      launchingTitle: "Launching authorization flow...",
      watchingTitle: "Watching login status changes",
      launchingDetail: "Opening browser and initializing listener. Please wait.",
      watchingDetail:
        "Complete login in your browser. The account will be imported and refreshed automatically (up to 10 minutes).",
      cancelListening: "Cancel listening",
      closeDialog: "Close dialog",
    },
    accountCard: {
      currentStamp: "Current",
      launch: "Switch and launch",
      launching: "Launching",
      delete: "Delete account",
      deleteConfirm: "Click again to confirm deleting account",
      used: "Used",
      remaining: "Remaining",
      resetAt: "Reset at",
      credits: "Credits",
      unlimited: "Unlimited",
      fiveHourFallback: "5h",
      oneWeekFallback: "1week",
      oneWeekLabel: "1 week",
      hourSuffix: "h",
      minuteSuffix: "m",
      planLabels: {
        unknown: "UNKNOWN",
        free: "FREE",
        plus: "PLUS",
        pro: "PRO",
        team: "TEAM",
        enterprise: "ENTERPRISE",
        business: "BUSINESS",
      },
    },
    accountsGrid: {
      emptyTitle: "No accounts yet",
      emptyDescription: "Click “Add account”. It appears automatically after authorization.",
    },
    settings: {
      dialogAriaLabel: "App settings",
      title: "Settings",
      subtitle: "Configure startup, tray usage display mode, and theme.",
      close: "Close settings",
      launchAtStartup: {
        label: "Launch at startup",
        description: "Automatically start Codex Tools when you log in.",
        checkedText: "On",
        uncheckedText: "Off",
      },
      launchCodexAfterSwitch: {
        label: "Launch Codex after switch",
        description: "Enabled by default. When disabled, only switch account without launching Codex.",
        checkedText: "Launch",
        uncheckedText: "Switch only",
      },
      syncOpencode: {
        label: "Sync Opencode OpenAI auth",
        description: "Auto-detect opencode auth file and sync refresh/access on switch.",
        checkedText: "Sync",
        uncheckedText: "No sync",
      },
      restartEditorsOnSwitch: {
        label: "Restart editors on switch (Codex plugin compatible)",
        description: "Disabled by default. When enabled, selected editors are force-restarted on account switch.",
        checkedText: "Restart",
        uncheckedText: "No restart",
      },
      restartEditorTargets: {
        label: "Editor restart target (single)",
        description:
          "Auto-detect installed VSCode/VSCode Insiders/Cursor/Antigravity/Kiro/Trae/Qoder in background.",
      },
      noSupportedEditors: "No supported editor detected for restart.",
      trayUsageDisplay: {
        label: "Status bar display",
        description: "Choose whether tray menu shows used quota, remaining quota, or hides usage.",
        groupAriaLabel: "Status bar display mode",
        remaining: "Remaining",
        used: "Used",
        hidden: "Hidden",
      },
      theme: {
        label: "Theme",
        description: "Use the switch to toggle light and dark theme.",
        switchAriaLabel: "Toggle theme",
        dark: "Dark",
        light: "Light",
      },
    },
    editorPicker: {
      ariaLabel: "Select editor to restart",
      placeholder: "Select an editor",
    },
    editorAppLabels: {
      vscode: "VS Code",
      vscodeInsiders: "Visual Studio Code - Insiders",
      cursor: "Cursor",
      antigravity: "Antigravity",
      kiro: "Kiro",
      trae: "Trae",
      qoder: "Qoder",
    },
    updateDialog: {
      ariaLabel: "App update",
      title: (version) => `New version ${version} found`,
      subtitle: (currentVersion) => `Current version ${currentVersion}. Auto download has started.`,
      close: "Close update dialog",
      publishedAt: (date) => `Published at ${date}`,
      autoDownloading: "Auto downloading...",
      autoPaused: "Auto download paused or failed. You can continue manually.",
      manualDownload: "Manual download",
      retryAutoDownload: "Retry auto download",
      retryingAutoDownload: "Auto downloading...",
    },
    notices: {
      settingsUpdated: "Settings updated",
      updateSettingsFailed: (error) => `Failed to update settings: ${error}`,
      usageRefreshed: "Usage refreshed",
      refreshFailed: (error) => `Refresh failed: ${error}`,
      restoreAuthFailed: (error) => `Failed to restore previous account: ${error}`,
      preparingUpdateDownload: "Preparing update download...",
      alreadyLatest: "Already up to date",
      updateDownloadStarted: "Update download started...",
      updateDownloadingPercent: (percent) => `Downloading ${percent}%`,
      updateDownloading: "Downloading...",
      updateDownloadFinished: "Download complete, preparing install...",
      updateInstalling: "Install complete, restarting...",
      updateInstallFailed: (error) => `Failed to install update: ${error}`,
      foundNewVersion: (version, currentVersion) =>
        `New version ${version} found (current ${currentVersion}). Auto download started.`,
      updateCheckFailed: (error) => `Failed to check updates: ${error}`,
      openManualDownloadFailed: (error) => `Failed to open download page: ${error}`,
      addAccountSuccess: "Authorization successful. Account was added and refreshed automatically.",
      addAccountAutoImportFailed: (error) => `Auto import failed: ${error}`,
      addAccountTimeout: "Authorization timed out. Please click “Add account” again.",
      startLoginFlowFailed: (error) => `Failed to start login flow: ${error}`,
      deleteConfirm: (label) => `Click delete again to confirm removing ${label}.`,
      accountDeleted: "Account deleted",
      deleteFailed: (error) => `Delete failed: ${error}`,
      switchedOnly: "Account switched (Codex not launched automatically).",
      switchedAndLaunchByCli:
        "Account switched. Codex.app was not found locally; tried launching via `codex app`.",
      switchedAndLaunching: "Account switched. Launching Codex.",
      opencodeSyncFailed: (base, error) => `${base} Opencode sync failed: ${error}`,
      opencodeSynced: (base) => `${base} Opencode OpenAI auth synced.`,
      editorRestartFailed: (base, error) => `${base} Editor restart failed: ${error}`,
      editorsRestarted: (base, labels) => `${base} Editors restarted: ${labels}`,
      noEditorRestarted: (base) => `${base} No installed editor found for restart.`,
      switchFailed: (error) => `Switch failed: ${error}`,
      smartSwitchNoTarget: "No switchable account. Please add an account first.",
      smartSwitchAlreadyBest:
        "Current account already has the best remaining quota (1week first, then 5h).",
    },
  },
  "ja-JP": {
    common: {
      close: "閉じる",
    },
    topBar: {
      appTitle: "Codex Tools",
      logoAlt: "Codex Tools ロゴ",
      checkUpdate: "アップデートを確認",
      checkingUpdate: "アップデート確認中",
      manualRefresh: "使用量を更新",
      refreshing: "更新中",
      openSettings: "設定を開く",
      toggleLanguage: (nextLanguage) => `言語を切り替え（次: ${nextLanguage}）`,
    },
    metaStrip: {
      ariaLabel: "アカウント概要",
      accountCount: "アカウント数",
      currentActive: "現在アクティブ",
    },
    addAccount: {
      smartSwitch: "スマート切替",
      startButton: "アカウント追加",
      startingButton: "起動中...",
      waitingButton: "認証待機中...",
      dialogAriaLabel: "アカウント追加認証",
      dialogTitle: "アカウント追加",
      dialogSubtitle: "ブラウザ認証後、アカウント一覧は自動更新されます。",
      launchingTitle: "認証フローを起動中...",
      watchingTitle: "ログイン状態の変化を監視中",
      launchingDetail: "ブラウザを開いてリスナーを初期化しています。しばらくお待ちください。",
      watchingDetail:
        "ブラウザでログインを完了してください。アカウントは自動で取り込み・更新されます（最大10分）。",
      cancelListening: "監視を停止",
      closeDialog: "ダイアログを閉じる",
    },
    accountCard: {
      currentStamp: "現在",
      launch: "切替して起動",
      launching: "起動中",
      delete: "アカウント削除",
      deleteConfirm: "もう一度クリックして削除を確定",
      used: "使用済み",
      remaining: "残り",
      resetAt: "リセット時刻",
      credits: "クレジット",
      unlimited: "無制限",
      fiveHourFallback: "5h",
      oneWeekFallback: "1week",
      oneWeekLabel: "1週間",
      hourSuffix: "h",
      minuteSuffix: "m",
      planLabels: {
        unknown: "UNKNOWN",
        free: "FREE",
        plus: "PLUS",
        pro: "PRO",
        team: "TEAM",
        enterprise: "ENTERPRISE",
        business: "BUSINESS",
      },
    },
    accountsGrid: {
      emptyTitle: "まだアカウントがありません",
      emptyDescription: "「アカウント追加」をクリックすると、認証後に自動表示されます。",
    },
    settings: {
      dialogAriaLabel: "アプリ設定",
      title: "設定",
      subtitle: "起動設定、ステータスバー表示モード、テーマを設定できます。",
      close: "設定を閉じる",
      launchAtStartup: {
        label: "起動時に開始",
        description: "ログイン時に Codex Tools を自動起動します。",
        checkedText: "オン",
        uncheckedText: "オフ",
      },
      launchCodexAfterSwitch: {
        label: "切替後に Codex を起動",
        description: "既定で有効。無効時はアカウント切替のみ行います。",
        checkedText: "起動",
        uncheckedText: "切替のみ",
      },
      syncOpencode: {
        label: "Opencode OpenAI 認証を同期",
        description: "切替時に opencode 認証ファイルを検出し、refresh/access を同期します。",
        checkedText: "同期",
        uncheckedText: "同期しない",
      },
      restartEditorsOnSwitch: {
        label: "切替時にエディタを再起動（Codex プラグイン互換）",
        description: "既定で無効。有効時は選択したエディタを強制再起動します。",
        checkedText: "再起動",
        uncheckedText: "再起動しない",
      },
      restartEditorTargets: {
        label: "再起動対象エディタ（単一選択）",
        description:
          "VSCode/VSCode Insiders/Cursor/Antigravity/Kiro/Trae/Qoder をバックグラウンドで自動検出します。",
      },
      noSupportedEditors: "再起動対象の対応エディタが見つかりません。",
      trayUsageDisplay: {
        label: "ステータスバー表示",
        description: "トレイメニューに「使用済み」「残り」または非表示のどれを表示するか選択します。",
        groupAriaLabel: "ステータスバー表示モード",
        remaining: "残り",
        used: "使用済み",
        hidden: "非表示",
      },
      theme: {
        label: "テーマ",
        description: "スイッチでライト/ダークテーマを切り替えます。",
        switchAriaLabel: "テーマ切替",
        dark: "ダーク",
        light: "ライト",
      },
    },
    editorPicker: {
      ariaLabel: "再起動するエディタを選択",
      placeholder: "エディタを選択",
    },
    editorAppLabels: {
      vscode: "VS Code",
      vscodeInsiders: "Visual Studio Code - Insiders",
      cursor: "Cursor",
      antigravity: "Antigravity",
      kiro: "Kiro",
      trae: "Trae",
      qoder: "Qoder",
    },
    updateDialog: {
      ariaLabel: "アプリ更新",
      title: (version) => `新しいバージョン ${version} が見つかりました`,
      subtitle: (currentVersion) => `現在のバージョン ${currentVersion}。自動ダウンロードを開始しました。`,
      close: "更新ダイアログを閉じる",
      publishedAt: (date) => `公開日 ${date}`,
      autoDownloading: "自動ダウンロード中...",
      autoPaused: "自動ダウンロードが停止または失敗しました。手動で続行できます。",
      manualDownload: "手動ダウンロード",
      retryAutoDownload: "自動ダウンロードを再試行",
      retryingAutoDownload: "自動ダウンロード中...",
    },
    notices: {
      settingsUpdated: "設定を更新しました",
      updateSettingsFailed: (error) => `設定の更新に失敗しました: ${error}`,
      usageRefreshed: "使用量を更新しました",
      refreshFailed: (error) => `更新に失敗しました: ${error}`,
      restoreAuthFailed: (error) => `前のアカウントの復元に失敗しました: ${error}`,
      preparingUpdateDownload: "アップデートのダウンロード準備中...",
      alreadyLatest: "すでに最新です",
      updateDownloadStarted: "アップデートのダウンロードを開始しました...",
      updateDownloadingPercent: (percent) => `ダウンロード中 ${percent}%`,
      updateDownloading: "ダウンロード中...",
      updateDownloadFinished: "ダウンロード完了。インストール準備中...",
      updateInstalling: "インストール完了。再起動中...",
      updateInstallFailed: (error) => `アップデートのインストールに失敗しました: ${error}`,
      foundNewVersion: (version, currentVersion) =>
        `新しいバージョン ${version} を検出しました（現在 ${currentVersion}）。自動ダウンロードを開始しました。`,
      updateCheckFailed: (error) => `アップデート確認に失敗しました: ${error}`,
      openManualDownloadFailed: (error) => `ダウンロードページを開けませんでした: ${error}`,
      addAccountSuccess: "認証に成功しました。アカウントは自動追加・更新されました。",
      addAccountAutoImportFailed: (error) => `自動取り込みに失敗しました: ${error}`,
      addAccountTimeout: "認証待機がタイムアウトしました。「アカウント追加」を再度クリックしてください。",
      startLoginFlowFailed: (error) => `ログインフローの開始に失敗しました: ${error}`,
      deleteConfirm: (label) => `${label} を削除するには、もう一度削除をクリックしてください。`,
      accountDeleted: "アカウントを削除しました",
      deleteFailed: (error) => `削除に失敗しました: ${error}`,
      switchedOnly: "アカウントを切り替えました（Codex は自動起動しません）。",
      switchedAndLaunchByCli:
        "アカウントを切り替えました。ローカルに Codex.app が見つからなかったため `codex app` で起動を試行しました。",
      switchedAndLaunching: "アカウントを切り替えました。Codex を起動中です。",
      opencodeSyncFailed: (base, error) => `${base} Opencode の同期に失敗しました: ${error}`,
      opencodeSynced: (base) => `${base} Opencode OpenAI 認証を同期しました。`,
      editorRestartFailed: (base, error) => `${base} エディタの再起動に失敗しました: ${error}`,
      editorsRestarted: (base, labels) => `${base} 再起動したエディタ: ${labels}`,
      noEditorRestarted: (base) => `${base} 再起動可能なインストール済みエディタが見つかりませんでした。`,
      switchFailed: (error) => `切替に失敗しました: ${error}`,
      smartSwitchNoTarget: "切替可能なアカウントがありません。先にアカウントを追加してください。",
      smartSwitchAlreadyBest: "現在のアカウントは既に最適な残量です（1week 優先、次に 5h）。",
    },
  },
  "ko-KR": {
    common: {
      close: "닫기",
    },
    topBar: {
      appTitle: "Codex Tools",
      logoAlt: "Codex Tools 로고",
      checkUpdate: "업데이트 확인",
      checkingUpdate: "업데이트 확인 중",
      manualRefresh: "사용량 새로고침",
      refreshing: "새로고침 중",
      openSettings: "설정 열기",
      toggleLanguage: (nextLanguage) => `언어 전환 (다음: ${nextLanguage})`,
    },
    metaStrip: {
      ariaLabel: "계정 개요",
      accountCount: "계정 수",
      currentActive: "현재 활성",
    },
    addAccount: {
      smartSwitch: "스마트 전환",
      startButton: "계정 추가",
      startingButton: "시작 중...",
      waitingButton: "인증 대기 중...",
      dialogAriaLabel: "계정 추가 인증",
      dialogTitle: "계정 추가",
      dialogSubtitle: "브라우저 인증 후 계정 목록이 자동으로 갱신됩니다.",
      launchingTitle: "인증 흐름 시작 중...",
      watchingTitle: "로그인 상태 변경 감지 중",
      launchingDetail: "브라우저를 열고 리스너를 초기화하고 있습니다. 잠시만 기다려 주세요.",
      watchingDetail:
        "브라우저에서 로그인을 완료해 주세요. 계정이 자동으로 가져와지고 갱신됩니다(최대 10분).",
      cancelListening: "감지 중지",
      closeDialog: "대화상자 닫기",
    },
    accountCard: {
      currentStamp: "현재",
      launch: "전환 후 실행",
      launching: "실행 중",
      delete: "계정 삭제",
      deleteConfirm: "삭제를 확인하려면 다시 클릭하세요",
      used: "사용",
      remaining: "남음",
      resetAt: "재설정 시각",
      credits: "크레딧",
      unlimited: "무제한",
      fiveHourFallback: "5h",
      oneWeekFallback: "1week",
      oneWeekLabel: "1주",
      hourSuffix: "h",
      minuteSuffix: "m",
      planLabels: {
        unknown: "UNKNOWN",
        free: "FREE",
        plus: "PLUS",
        pro: "PRO",
        team: "TEAM",
        enterprise: "ENTERPRISE",
        business: "BUSINESS",
      },
    },
    accountsGrid: {
      emptyTitle: "아직 계정이 없습니다",
      emptyDescription: "“계정 추가”를 클릭하면 인증 후 자동으로 표시됩니다.",
    },
    settings: {
      dialogAriaLabel: "앱 설정",
      title: "설정",
      subtitle: "시작 옵션, 상태바 표시 모드, 테마를 설정합니다.",
      close: "설정 닫기",
      launchAtStartup: {
        label: "시작 시 실행",
        description: "로그인 시 Codex Tools를 자동으로 시작합니다.",
        checkedText: "켜짐",
        uncheckedText: "꺼짐",
      },
      launchCodexAfterSwitch: {
        label: "전환 후 Codex 실행",
        description: "기본값은 켜짐. 끄면 계정만 전환하고 Codex는 실행하지 않습니다.",
        checkedText: "실행",
        uncheckedText: "전환만",
      },
      syncOpencode: {
        label: "Opencode OpenAI 인증 동기화",
        description: "전환 시 opencode 인증 파일을 감지하고 refresh/access를 동기화합니다.",
        checkedText: "동기화",
        uncheckedText: "동기화 안 함",
      },
      restartEditorsOnSwitch: {
        label: "전환 시 에디터 재시작 (Codex 플러그인 호환)",
        description: "기본값은 꺼짐. 켜면 선택한 에디터를 강제로 재시작합니다.",
        checkedText: "재시작",
        uncheckedText: "재시작 안 함",
      },
      restartEditorTargets: {
        label: "재시작 대상 에디터 (단일 선택)",
        description:
          "설치된 VSCode/VSCode Insiders/Cursor/Antigravity/Kiro/Trae/Qoder를 백그라운드에서 자동 감지합니다.",
      },
      noSupportedEditors: "재시작 가능한 지원 에디터를 찾지 못했습니다.",
      trayUsageDisplay: {
        label: "상태바 표시",
        description: "트레이 메뉴에 사용량, 잔여량 또는 숨김 중 무엇을 표시할지 선택합니다.",
        groupAriaLabel: "상태바 표시 모드",
        remaining: "남음",
        used: "사용",
        hidden: "숨김",
      },
      theme: {
        label: "테마",
        description: "스위치로 라이트/다크 테마를 전환합니다.",
        switchAriaLabel: "테마 전환",
        dark: "다크",
        light: "라이트",
      },
    },
    editorPicker: {
      ariaLabel: "재시작할 에디터 선택",
      placeholder: "에디터 선택",
    },
    editorAppLabels: {
      vscode: "VS Code",
      vscodeInsiders: "Visual Studio Code - Insiders",
      cursor: "Cursor",
      antigravity: "Antigravity",
      kiro: "Kiro",
      trae: "Trae",
      qoder: "Qoder",
    },
    updateDialog: {
      ariaLabel: "앱 업데이트",
      title: (version) => `새 버전 ${version} 발견`,
      subtitle: (currentVersion) => `현재 버전 ${currentVersion}. 자동 다운로드를 시작했습니다.`,
      close: "업데이트 대화상자 닫기",
      publishedAt: (date) => `게시일 ${date}`,
      autoDownloading: "자동 다운로드 중...",
      autoPaused: "자동 다운로드가 중지되었거나 실패했습니다. 수동으로 진행할 수 있습니다.",
      manualDownload: "수동 다운로드",
      retryAutoDownload: "자동 다운로드 다시 시도",
      retryingAutoDownload: "자동 다운로드 중...",
    },
    notices: {
      settingsUpdated: "설정이 업데이트되었습니다",
      updateSettingsFailed: (error) => `설정 업데이트 실패: ${error}`,
      usageRefreshed: "사용량이 갱신되었습니다",
      refreshFailed: (error) => `새로고침 실패: ${error}`,
      restoreAuthFailed: (error) => `이전 계정 복원 실패: ${error}`,
      preparingUpdateDownload: "업데이트 다운로드 준비 중...",
      alreadyLatest: "이미 최신 버전입니다",
      updateDownloadStarted: "업데이트 다운로드 시작...",
      updateDownloadingPercent: (percent) => `다운로드 중 ${percent}%`,
      updateDownloading: "다운로드 중...",
      updateDownloadFinished: "다운로드 완료, 설치 준비 중...",
      updateInstalling: "설치 완료, 재시작 중...",
      updateInstallFailed: (error) => `업데이트 설치 실패: ${error}`,
      foundNewVersion: (version, currentVersion) =>
        `새 버전 ${version} 발견 (현재 ${currentVersion}). 자동 다운로드를 시작했습니다.`,
      updateCheckFailed: (error) => `업데이트 확인 실패: ${error}`,
      openManualDownloadFailed: (error) => `다운로드 페이지 열기 실패: ${error}`,
      addAccountSuccess: "인증 성공. 계정이 자동으로 추가되고 갱신되었습니다.",
      addAccountAutoImportFailed: (error) => `자동 가져오기 실패: ${error}`,
      addAccountTimeout: "인증 대기 시간이 초과되었습니다. “계정 추가”를 다시 클릭해 주세요.",
      startLoginFlowFailed: (error) => `로그인 흐름 시작 실패: ${error}`,
      deleteConfirm: (label) => `${label} 삭제를 확인하려면 삭제를 다시 클릭하세요.`,
      accountDeleted: "계정이 삭제되었습니다",
      deleteFailed: (error) => `삭제 실패: ${error}`,
      switchedOnly: "계정이 전환되었습니다 (Codex는 자동 실행되지 않음).",
      switchedAndLaunchByCli:
        "계정이 전환되었습니다. 로컬에서 Codex.app을 찾지 못해 `codex app`으로 실행을 시도했습니다.",
      switchedAndLaunching: "계정이 전환되었습니다. Codex를 실행 중입니다.",
      opencodeSyncFailed: (base, error) => `${base} Opencode 동기화 실패: ${error}`,
      opencodeSynced: (base) => `${base} Opencode OpenAI 인증이 동기화되었습니다.`,
      editorRestartFailed: (base, error) => `${base} 에디터 재시작 실패: ${error}`,
      editorsRestarted: (base, labels) => `${base} 재시작된 에디터: ${labels}`,
      noEditorRestarted: (base) => `${base} 재시작 가능한 설치된 에디터가 없습니다.`,
      switchFailed: (error) => `전환 실패: ${error}`,
      smartSwitchNoTarget: "전환 가능한 계정이 없습니다. 먼저 계정을 추가해 주세요.",
      smartSwitchAlreadyBest: "현재 계정이 이미 최적의 잔여량 계정입니다 (1week 우선, 그다음 5h).",
    },
  },
  "ru-RU": {
    common: {
      close: "Закрыть",
    },
    topBar: {
      appTitle: "Codex Tools",
      logoAlt: "Логотип Codex Tools",
      checkUpdate: "Проверить обновления",
      checkingUpdate: "Проверка обновлений",
      manualRefresh: "Обновить использование",
      refreshing: "Обновление",
      openSettings: "Открыть настройки",
      toggleLanguage: (nextLanguage) => `Сменить язык (следующий: ${nextLanguage})`,
    },
    metaStrip: {
      ariaLabel: "Обзор аккаунтов",
      accountCount: "Аккаунты",
      currentActive: "Активен сейчас",
    },
    addAccount: {
      smartSwitch: "Умное переключение",
      startButton: "Добавить аккаунт",
      startingButton: "Запуск...",
      waitingButton: "Ожидание авторизации...",
      dialogAriaLabel: "Авторизация добавления аккаунта",
      dialogTitle: "Добавить аккаунт",
      dialogSubtitle: "Список аккаунтов обновится автоматически после авторизации в браузере.",
      launchingTitle: "Запуск процесса авторизации...",
      watchingTitle: "Отслеживание изменений статуса входа",
      launchingDetail: "Открываем браузер и инициализируем слушатель. Подождите.",
      watchingDetail:
        "Завершите вход в браузере. Аккаунт будет автоматически импортирован и обновлен (до 10 минут).",
      cancelListening: "Остановить ожидание",
      closeDialog: "Закрыть диалог",
    },
    accountCard: {
      currentStamp: "Текущий",
      launch: "Переключить и запустить",
      launching: "Запуск",
      delete: "Удалить аккаунт",
      deleteConfirm: "Нажмите еще раз для подтверждения удаления",
      used: "Использовано",
      remaining: "Осталось",
      resetAt: "Сброс в",
      credits: "Кредиты",
      unlimited: "Без ограничений",
      fiveHourFallback: "5h",
      oneWeekFallback: "1week",
      oneWeekLabel: "1 неделя",
      hourSuffix: "ч",
      minuteSuffix: "м",
      planLabels: {
        unknown: "UNKNOWN",
        free: "FREE",
        plus: "PLUS",
        pro: "PRO",
        team: "TEAM",
        enterprise: "ENTERPRISE",
        business: "BUSINESS",
      },
    },
    accountsGrid: {
      emptyTitle: "Пока нет аккаунтов",
      emptyDescription: "Нажмите «Добавить аккаунт». После авторизации он появится автоматически.",
    },
    settings: {
      dialogAriaLabel: "Настройки приложения",
      title: "Настройки",
      subtitle: "Настройте автозапуск, режим отображения в строке меню и тему.",
      close: "Закрыть настройки",
      launchAtStartup: {
        label: "Запускать при старте",
        description: "Автоматически запускать Codex Tools при входе в систему.",
        checkedText: "Вкл",
        uncheckedText: "Выкл",
      },
      launchCodexAfterSwitch: {
        label: "Запускать Codex после переключения",
        description: "Включено по умолчанию. Если выключить, будет только переключение аккаунта.",
        checkedText: "Запуск",
        uncheckedText: "Только переключение",
      },
      syncOpencode: {
        label: "Синхронизировать Opencode OpenAI auth",
        description: "При переключении автоматически находить auth-файл opencode и синхронизировать refresh/access.",
        checkedText: "Синхр.",
        uncheckedText: "Без синхр.",
      },
      restartEditorsOnSwitch: {
        label: "Перезапускать редакторы при переключении (совместимо с плагином Codex)",
        description: "По умолчанию выключено. При включении выбранные редакторы принудительно перезапускаются.",
        checkedText: "Перезапуск",
        uncheckedText: "Без перезапуска",
      },
      restartEditorTargets: {
        label: "Целевой редактор для перезапуска (один)",
        description:
          "В фоне автоматически определяются установленные VSCode/VSCode Insiders/Cursor/Antigravity/Kiro/Trae/Qoder.",
      },
      noSupportedEditors: "Не найден поддерживаемый редактор для перезапуска.",
      trayUsageDisplay: {
        label: "Отображение в строке меню",
        description: "Выберите, что показывать в меню трея: использовано, осталось или скрыть.",
        groupAriaLabel: "Режим отображения в строке меню",
        remaining: "Осталось",
        used: "Использовано",
        hidden: "Скрыть",
      },
      theme: {
        label: "Тема",
        description: "Переключателем меняйте светлую и темную тему.",
        switchAriaLabel: "Переключить тему",
        dark: "Темная",
        light: "Светлая",
      },
    },
    editorPicker: {
      ariaLabel: "Выберите редактор для перезапуска",
      placeholder: "Выберите редактор",
    },
    editorAppLabels: {
      vscode: "VS Code",
      vscodeInsiders: "Visual Studio Code - Insiders",
      cursor: "Cursor",
      antigravity: "Antigravity",
      kiro: "Kiro",
      trae: "Trae",
      qoder: "Qoder",
    },
    updateDialog: {
      ariaLabel: "Обновление приложения",
      title: (version) => `Найдена новая версия ${version}`,
      subtitle: (currentVersion) => `Текущая версия ${currentVersion}. Автозагрузка уже началась.`,
      close: "Закрыть окно обновления",
      publishedAt: (date) => `Опубликовано ${date}`,
      autoDownloading: "Автозагрузка...",
      autoPaused: "Автозагрузка приостановлена или завершилась ошибкой. Можно продолжить вручную.",
      manualDownload: "Скачать вручную",
      retryAutoDownload: "Повторить автозагрузку",
      retryingAutoDownload: "Автозагрузка...",
    },
    notices: {
      settingsUpdated: "Настройки обновлены",
      updateSettingsFailed: (error) => `Не удалось обновить настройки: ${error}`,
      usageRefreshed: "Данные использования обновлены",
      refreshFailed: (error) => `Ошибка обновления: ${error}`,
      restoreAuthFailed: (error) => `Не удалось восстановить предыдущий аккаунт: ${error}`,
      preparingUpdateDownload: "Подготовка к загрузке обновления...",
      alreadyLatest: "Уже установлена последняя версия",
      updateDownloadStarted: "Загрузка обновления началась...",
      updateDownloadingPercent: (percent) => `Загрузка ${percent}%`,
      updateDownloading: "Загрузка...",
      updateDownloadFinished: "Загрузка завершена, подготовка к установке...",
      updateInstalling: "Установка завершена, перезапуск...",
      updateInstallFailed: (error) => `Не удалось установить обновление: ${error}`,
      foundNewVersion: (version, currentVersion) =>
        `Найдена новая версия ${version} (текущая ${currentVersion}). Автозагрузка началась.`,
      updateCheckFailed: (error) => `Не удалось проверить обновления: ${error}`,
      openManualDownloadFailed: (error) => `Не удалось открыть страницу загрузки: ${error}`,
      addAccountSuccess: "Авторизация успешна. Аккаунт автоматически добавлен и обновлен.",
      addAccountAutoImportFailed: (error) => `Ошибка автоимпорта: ${error}`,
      addAccountTimeout: "Время ожидания авторизации истекло. Нажмите «Добавить аккаунт» снова.",
      startLoginFlowFailed: (error) => `Не удалось запустить процесс входа: ${error}`,
      deleteConfirm: (label) => `Нажмите удалить еще раз, чтобы подтвердить удаление ${label}.`,
      accountDeleted: "Аккаунт удален",
      deleteFailed: (error) => `Ошибка удаления: ${error}`,
      switchedOnly: "Аккаунт переключен (Codex не запускался автоматически).",
      switchedAndLaunchByCli:
        "Аккаунт переключен. Локально не найден Codex.app, выполнена попытка запуска через `codex app`.",
      switchedAndLaunching: "Аккаунт переключен. Запускаем Codex.",
      opencodeSyncFailed: (base, error) => `${base} Ошибка синхронизации Opencode: ${error}`,
      opencodeSynced: (base) => `${base} Синхронизация Opencode OpenAI auth выполнена.`,
      editorRestartFailed: (base, error) => `${base} Ошибка перезапуска редактора: ${error}`,
      editorsRestarted: (base, labels) => `${base} Перезапущенные редакторы: ${labels}`,
      noEditorRestarted: (base) => `${base} Не найден установленный редактор для перезапуска.`,
      switchFailed: (error) => `Ошибка переключения: ${error}`,
      smartSwitchNoTarget: "Нет аккаунта для переключения. Сначала добавьте аккаунт.",
      smartSwitchAlreadyBest:
        "Текущий аккаунт уже имеет лучший остаток квоты (сначала 1week, затем 5h).",
    },
  },
};

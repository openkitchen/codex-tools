import { useState } from "react";
import "./App.css";
import { AddAccountSection } from "./components/AddAccountSection";
import { AccountsGrid } from "./components/AccountsGrid";
import { AppTopBar } from "./components/AppTopBar";
import { MetaStrip } from "./components/MetaStrip";
import { NoticeBanner } from "./components/NoticeBanner";
import { SettingsPanel } from "./components/SettingsPanel";
import { useCodexController } from "./hooks/useCodexController";
import { useThemeMode } from "./hooks/useThemeMode";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { themeMode, toggleTheme } = useThemeMode();
  const {
    accounts,
    loading,
    refreshing,
    startingAdd,
    addFlow,
    switchingId,
    checkingUpdate,
    installingUpdate,
    notice,
    settings,
    savingSettings,
    currentCount,
    refreshUsage,
    checkForAppUpdate,
    updateSettings,
    onStartAddAccount,
    onCancelAddFlow,
    onDelete,
    onSwitch,
  } = useCodexController();

  return (
    <div className="shell">
      <div className="ambient" />
      <main className="panel">
        <AppTopBar
          onOpenSettings={() => setSettingsOpen(true)}
          onCheckUpdate={() => void checkForAppUpdate(false)}
          checkingUpdate={checkingUpdate}
          installingUpdate={installingUpdate}
          onRefresh={() => void refreshUsage(false)}
          refreshing={refreshing}
        />

        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          settings={settings}
          savingSettings={savingSettings}
          onUpdateSettings={(patch) => void updateSettings(patch)}
        />

        <MetaStrip accountCount={accounts.length} currentCount={currentCount} />

        <AddAccountSection
          startingAdd={startingAdd}
          addFlowActive={Boolean(addFlow)}
          onStartAddAccount={() => void onStartAddAccount()}
          onCancelAddFlow={onCancelAddFlow}
        />

        <NoticeBanner notice={notice} />

        <AccountsGrid
          accounts={accounts}
          loading={loading}
          switchingId={switchingId}
          onSwitch={(account) => void onSwitch(account)}
          onDelete={(account) => void onDelete(account)}
        />
      </main>
    </div>
  );
}

export default App;

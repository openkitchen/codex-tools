import { useEffect } from "react";
import { ThemeSwitch } from "./ThemeSwitch";
import { SwitchField } from "./SwitchField";
import type { AppSettings, ThemeMode } from "../types/app";

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  settings: AppSettings;
  savingSettings: boolean;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
};

export function SettingsPanel({
  open,
  onClose,
  themeMode,
  onToggleTheme,
  settings,
  savingSettings,
  onUpdateSettings,
}: SettingsPanelProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="settingsOverlay" onClick={onClose}>
      <section
        className="settingsDialog"
        role="dialog"
        aria-modal="true"
        aria-label="应用设置"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settingsHeader">
          <div>
            <h2>设置</h2>
            <p>可配置开机启动、状态栏显示模式和主题。</p>
          </div>
          <button className="iconButton ghost" onClick={onClose} aria-label="关闭设置" title="关闭">
            <svg className="iconGlyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 6 12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>

        <SwitchField
          checked={settings.launchAtStartup}
          onChange={(checked) => onUpdateSettings({ launchAtStartup: checked })}
          label="开机启动"
          description="启用后会在系统登录时自动启动 Codex Tools。"
          checkedText="开启"
          uncheckedText="关闭"
          disabled={savingSettings}
        />

        <div className="settingRow">
          <div className="settingMeta">
            <strong>状态栏展示</strong>
            <p>控制状态栏菜单中显示“已用”还是“剩余”。</p>
          </div>
          <div className="modeGroup" role="radiogroup" aria-label="状态栏展示模式">
            <button
              className={settings.trayUsageDisplayMode === "remaining" ? "primary" : "ghost"}
              disabled={savingSettings}
              onClick={() => onUpdateSettings({ trayUsageDisplayMode: "remaining" })}
              aria-pressed={settings.trayUsageDisplayMode === "remaining"}
            >
              剩余
            </button>
            <button
              className={settings.trayUsageDisplayMode === "used" ? "primary" : "ghost"}
              disabled={savingSettings}
              onClick={() => onUpdateSettings({ trayUsageDisplayMode: "used" })}
              aria-pressed={settings.trayUsageDisplayMode === "used"}
            >
              已用
            </button>
          </div>
        </div>

        <div className="settingRow">
          <div className="settingMeta">
            <strong>主题</strong>
            <p>使用开关切换浅色和深色主题。</p>
          </div>
          <ThemeSwitch themeMode={themeMode} onToggle={onToggleTheme} />
        </div>
      </section>
    </div>
  );
}

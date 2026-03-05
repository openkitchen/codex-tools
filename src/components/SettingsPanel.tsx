import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n/I18nProvider";
import { EditorMultiSelect } from "./EditorMultiSelect";
import { ThemeSwitch } from "./ThemeSwitch";
import { SwitchField } from "./SwitchField";
import type {
  AppSettings,
  InstalledEditorApp,
  ThemeMode,
  UpdateSettingsOptions,
} from "../types/app";

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  settings: AppSettings;
  installedEditorApps: InstalledEditorApp[];
  savingSettings: boolean;
  onUpdateSettings: (patch: Partial<AppSettings>, options?: UpdateSettingsOptions) => void;
};

export function SettingsPanel({
  open,
  onClose,
  themeMode,
  onToggleTheme,
  settings,
  installedEditorApps,
  savingSettings,
  onUpdateSettings,
}: SettingsPanelProps) {
  const { copy } = useI18n();

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

  return createPortal(
    <div className="settingsOverlay" onClick={onClose}>
      <section
        className="settingsDialog"
        role="dialog"
        aria-modal="true"
        aria-label={copy.settings.dialogAriaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settingsHeader">
          <div>
            <h2>{copy.settings.title}</h2>
            <p>{copy.settings.subtitle}</p>
          </div>
          <button
            className="iconButton ghost"
            onClick={onClose}
            aria-label={copy.settings.close}
            title={copy.common.close}
          >
            <svg className="iconGlyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 6 12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>

        <SwitchField
          checked={settings.launchAtStartup}
          onChange={(checked) => onUpdateSettings({ launchAtStartup: checked })}
          label={copy.settings.launchAtStartup.label}
          description={copy.settings.launchAtStartup.description}
          checkedText={copy.settings.launchAtStartup.checkedText}
          uncheckedText={copy.settings.launchAtStartup.uncheckedText}
          disabled={savingSettings}
        />

        <SwitchField
          checked={settings.launchCodexAfterSwitch}
          onChange={(checked) => onUpdateSettings({ launchCodexAfterSwitch: checked })}
          label={copy.settings.launchCodexAfterSwitch.label}
          description={copy.settings.launchCodexAfterSwitch.description}
          checkedText={copy.settings.launchCodexAfterSwitch.checkedText}
          uncheckedText={copy.settings.launchCodexAfterSwitch.uncheckedText}
          disabled={savingSettings}
        />

        <SwitchField
          checked={settings.syncOpencodeOpenaiAuth}
          onChange={(checked) => onUpdateSettings({ syncOpencodeOpenaiAuth: checked })}
          label={copy.settings.syncOpencode.label}
          description={copy.settings.syncOpencode.description}
          checkedText={copy.settings.syncOpencode.checkedText}
          uncheckedText={copy.settings.syncOpencode.uncheckedText}
          disabled={savingSettings}
        />

        <SwitchField
          checked={settings.restartEditorsOnSwitch}
          onChange={(checked) => {
            if (checked && settings.restartEditorTargets.length === 0 && installedEditorApps.length > 0) {
              onUpdateSettings({
                restartEditorsOnSwitch: true,
                restartEditorTargets: [installedEditorApps[0].id],
              });
              return;
            }
            onUpdateSettings({ restartEditorsOnSwitch: checked });
          }}
          label={copy.settings.restartEditorsOnSwitch.label}
          description={copy.settings.restartEditorsOnSwitch.description}
          checkedText={copy.settings.restartEditorsOnSwitch.checkedText}
          uncheckedText={copy.settings.restartEditorsOnSwitch.uncheckedText}
          disabled={savingSettings}
        />

        <div className="settingRow">
          <div className="settingMeta">
            <strong>{copy.settings.restartEditorTargets.label}</strong>
            <p>{copy.settings.restartEditorTargets.description}</p>
          </div>
          <EditorMultiSelect
            options={installedEditorApps}
            value={settings.restartEditorTargets[0] ?? null}
            disabled={installedEditorApps.length === 0}
            onChange={(selected) =>
              onUpdateSettings(
                { restartEditorTargets: [selected] },
                { silent: true, keepInteractive: true },
              )
            }
          />
        </div>
        {installedEditorApps.length === 0 && (
          <p className="hint">{copy.settings.noSupportedEditors}</p>
        )}

        <div className="settingRow">
          <div className="settingMeta">
            <strong>{copy.settings.trayUsageDisplay.label}</strong>
            <p>{copy.settings.trayUsageDisplay.description}</p>
          </div>
          <div className="modeGroup" role="radiogroup" aria-label={copy.settings.trayUsageDisplay.groupAriaLabel}>
            <button
              className={settings.trayUsageDisplayMode === "remaining" ? "primary" : "ghost"}
              disabled={savingSettings}
              onClick={() => onUpdateSettings({ trayUsageDisplayMode: "remaining" })}
              aria-pressed={settings.trayUsageDisplayMode === "remaining"}
            >
              {copy.settings.trayUsageDisplay.remaining}
            </button>
            <button
              className={settings.trayUsageDisplayMode === "used" ? "primary" : "ghost"}
              disabled={savingSettings}
              onClick={() => onUpdateSettings({ trayUsageDisplayMode: "used" })}
              aria-pressed={settings.trayUsageDisplayMode === "used"}
            >
              {copy.settings.trayUsageDisplay.used}
            </button>
            <button
              className={settings.trayUsageDisplayMode === "hidden" ? "primary" : "ghost"}
              disabled={savingSettings}
              onClick={() => onUpdateSettings({ trayUsageDisplayMode: "hidden" })}
              aria-pressed={settings.trayUsageDisplayMode === "hidden"}
            >
              {copy.settings.trayUsageDisplay.hidden}
            </button>
          </div>
        </div>

        <div className="settingRow">
          <div className="settingMeta">
            <strong>{copy.settings.theme.label}</strong>
            <p>{copy.settings.theme.description}</p>
          </div>
          <ThemeSwitch themeMode={themeMode} onToggle={onToggleTheme} />
        </div>
      </section>
    </div>,
    document.body,
  );
}

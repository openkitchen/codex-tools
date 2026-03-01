import type { ThemeMode } from "../types/app";

type ThemeSwitchProps = {
  themeMode: ThemeMode;
  onToggle: () => void;
};

export function ThemeSwitch({ themeMode, onToggle }: ThemeSwitchProps) {
  const isDark = themeMode === "dark";

  return (
    <label className="themeSwitch" aria-label="切换主题">
      <input type="checkbox" checked={isDark} onChange={onToggle} />
      <span className="themeSwitchTrack" aria-hidden="true">
        <span className="themeSwitchThumb" />
      </span>
      <span className="themeSwitchText">{isDark ? "深色" : "浅色"}</span>
    </label>
  );
}

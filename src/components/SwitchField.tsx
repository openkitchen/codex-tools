type SwitchFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  checkedText: string;
  uncheckedText: string;
  disabled?: boolean;
};

export function SwitchField({
  checked,
  onChange,
  label,
  description,
  checkedText,
  uncheckedText,
  disabled = false,
}: SwitchFieldProps) {
  return (
    <div className="settingRow">
      <div className="settingMeta">
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <label className="themeSwitch" aria-label={label}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="themeSwitchTrack" aria-hidden="true">
          <span className="themeSwitchThumb" />
        </span>
        <span className="themeSwitchText">{checked ? checkedText : uncheckedText}</span>
      </label>
    </div>
  );
}

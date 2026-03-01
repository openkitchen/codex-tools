use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct AccountsStore {
    #[serde(default = "default_store_version")]
    pub(crate) version: u8,
    #[serde(default)]
    pub(crate) accounts: Vec<StoredAccount>,
    #[serde(default)]
    pub(crate) settings: AppSettings,
}

fn default_store_version() -> u8 {
    1
}

impl Default for AccountsStore {
    fn default() -> Self {
        Self {
            version: default_store_version(),
            accounts: Vec::new(),
            settings: AppSettings::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct StoredAccount {
    pub(crate) id: String,
    pub(crate) label: String,
    pub(crate) email: Option<String>,
    pub(crate) account_id: String,
    pub(crate) plan_type: Option<String>,
    pub(crate) auth_json: Value,
    pub(crate) added_at: i64,
    pub(crate) updated_at: i64,
    pub(crate) usage: Option<UsageSnapshot>,
    pub(crate) usage_error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AccountSummary {
    pub(crate) id: String,
    pub(crate) label: String,
    pub(crate) email: Option<String>,
    pub(crate) account_id: String,
    pub(crate) plan_type: Option<String>,
    pub(crate) added_at: i64,
    pub(crate) updated_at: i64,
    pub(crate) usage: Option<UsageSnapshot>,
    pub(crate) usage_error: Option<String>,
    pub(crate) is_current: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UsageSnapshot {
    pub(crate) fetched_at: i64,
    pub(crate) plan_type: Option<String>,
    pub(crate) five_hour: Option<UsageWindow>,
    pub(crate) one_week: Option<UsageWindow>,
    pub(crate) credits: Option<CreditSnapshot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UsageWindow {
    pub(crate) used_percent: f64,
    pub(crate) window_seconds: i64,
    pub(crate) reset_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreditSnapshot {
    pub(crate) has_credits: bool,
    pub(crate) unlimited: bool,
    pub(crate) balance: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SwitchAccountResult {
    pub(crate) account_id: String,
    pub(crate) launched_app_path: Option<String>,
    pub(crate) used_fallback_cli: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CurrentAuthStatus {
    pub(crate) available: bool,
    pub(crate) account_id: Option<String>,
    pub(crate) email: Option<String>,
    pub(crate) plan_type: Option<String>,
    pub(crate) auth_mode: Option<String>,
    pub(crate) last_refresh: Option<String>,
    pub(crate) file_modified_at: Option<i64>,
    pub(crate) fingerprint: Option<String>,
}

#[derive(Debug)]
pub(crate) struct ExtractedAuth {
    pub(crate) account_id: String,
    pub(crate) access_token: String,
    pub(crate) email: Option<String>,
    pub(crate) plan_type: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "camelCase")]
pub(crate) enum TrayUsageDisplayMode {
    Used,
    #[default]
    Remaining,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AppSettings {
    pub(crate) launch_at_startup: bool,
    pub(crate) tray_usage_display_mode: TrayUsageDisplayMode,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            launch_at_startup: false,
            tray_usage_display_mode: TrayUsageDisplayMode::Remaining,
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AppSettingsPatch {
    pub(crate) launch_at_startup: Option<bool>,
    pub(crate) tray_usage_display_mode: Option<TrayUsageDisplayMode>,
}

impl StoredAccount {
    pub(crate) fn to_summary(&self, current_account_id: Option<&str>) -> AccountSummary {
        AccountSummary {
            id: self.id.clone(),
            label: self.label.clone(),
            email: self.email.clone(),
            account_id: self.account_id.clone(),
            plan_type: self.plan_type.clone(),
            added_at: self.added_at,
            updated_at: self.updated_at,
            usage: self.usage.clone(),
            usage_error: self.usage_error.clone(),
            is_current: current_account_id
                .map(|id| id == self.account_id)
                .unwrap_or(false),
        }
    }
}

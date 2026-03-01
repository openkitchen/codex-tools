use std::fs;
use std::path::PathBuf;

use tauri::AppHandle;
use tauri::Manager;
use uuid::Uuid;

use crate::auth::extract_auth;
use crate::auth::read_current_codex_auth_optional;
use crate::models::AccountsStore;
use crate::models::StoredAccount;
use crate::utils::now_unix_seconds;
use crate::utils::set_private_permissions;
use crate::utils::short_account;

pub(crate) fn load_store(app: &AppHandle) -> Result<AccountsStore, String> {
    let path = account_store_path(app)?;
    if !path.exists() {
        return Ok(AccountsStore::default());
    }

    let raw = fs::read_to_string(&path)
        .map_err(|e| format!("读取账号存储文件失败 {}: {e}", path.display()))?;

    serde_json::from_str(&raw).map_err(|e| format!("账号存储文件格式无效 {}: {e}", path.display()))
}

pub(crate) fn save_store(app: &AppHandle, store: &AccountsStore) -> Result<(), String> {
    let path = account_store_path(app)?;
    let parent = path
        .parent()
        .ok_or_else(|| format!("无法解析存储目录 {}", path.display()))?;
    fs::create_dir_all(parent)
        .map_err(|e| format!("创建存储目录失败 {}: {e}", parent.display()))?;

    let serialized =
        serde_json::to_string_pretty(store).map_err(|e| format!("序列化账号存储失败: {e}"))?;
    fs::write(&path, serialized)
        .map_err(|e| format!("写入账号存储文件失败 {}: {e}", path.display()))?;
    set_private_permissions(&path);
    Ok(())
}

/// 启动时自动同步当前登录账号：
/// 若本机已有 `~/.codex/auth.json` 且账号不在列表中，则自动写入存储。
pub(crate) fn sync_current_auth_account_on_startup(app: &AppHandle) -> Result<(), String> {
    let auth_json = match read_current_codex_auth_optional()? {
        Some(value) => value,
        None => return Ok(()),
    };

    let extracted = match extract_auth(&auth_json) {
        Ok(value) => value,
        Err(err) => {
            log::warn!("跳过启动自动导入当前账号: {err}");
            return Ok(());
        }
    };

    let mut store = load_store(app)?;
    let already_exists = store
        .accounts
        .iter()
        .any(|account| account.account_id == extracted.account_id);
    if already_exists {
        return Ok(());
    }

    let now = now_unix_seconds();
    let label = extracted
        .email
        .clone()
        .unwrap_or_else(|| format!("Codex {}", short_account(&extracted.account_id)));

    let stored = StoredAccount {
        id: Uuid::new_v4().to_string(),
        label,
        email: extracted.email,
        account_id: extracted.account_id,
        plan_type: extracted.plan_type,
        auth_json,
        added_at: now,
        updated_at: now,
        usage: None,
        usage_error: None,
    };
    store.accounts.push(stored);
    save_store(app, &store)?;
    Ok(())
}

fn account_store_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("无法获取应用数据目录: {e}"))?;
    Ok(dir.join("accounts.json"))
}

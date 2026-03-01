use tauri::AppHandle;

use crate::auth::current_auth_account_id;
use crate::auth::extract_auth;
use crate::auth::read_current_codex_auth;
use crate::models::AccountSummary;
use crate::models::StoredAccount;
use crate::state::AppState;
use crate::store::load_store;
use crate::store::save_store;
use crate::usage::fetch_usage_snapshot;
use crate::utils::now_unix_seconds;
use crate::utils::short_account;

pub(crate) async fn list_accounts_internal(
    app: &AppHandle,
    state: &AppState,
) -> Result<Vec<AccountSummary>, String> {
    let _guard = state.store_lock.lock().await;
    let store = load_store(app)?;
    let current_account_id = current_auth_account_id();
    Ok(store
        .accounts
        .iter()
        .map(|account| account.to_summary(current_account_id.as_deref()))
        .collect())
}

pub(crate) async fn import_current_auth_account_internal(
    app: &AppHandle,
    state: &AppState,
    label: Option<String>,
) -> Result<AccountSummary, String> {
    let auth_json = read_current_codex_auth()?;
    let extracted = extract_auth(&auth_json)?;

    // 用量拉取失败不阻断导入流程，避免账号无法入库。
    let usage = fetch_usage_snapshot(&extracted.access_token, &extracted.account_id)
        .await
        .ok();

    let mut _guard = state.store_lock.lock().await;
    let mut store = load_store(app)?;

    let now = now_unix_seconds();
    let fallback_label = extracted
        .email
        .clone()
        .unwrap_or_else(|| format!("Codex {}", short_account(&extracted.account_id)));
    let new_label = label
        .and_then(|value| {
            let trimmed = value.trim();
            if trimmed.is_empty() {
                None
            } else {
                Some(trimmed.to_string())
            }
        })
        .unwrap_or(fallback_label);

    let summary = if let Some(existing) = store
        .accounts
        .iter_mut()
        .find(|account| account.account_id == extracted.account_id)
    {
        existing.label = new_label;
        existing.email = extracted.email;
        existing.plan_type = usage
            .as_ref()
            .and_then(|snapshot| snapshot.plan_type.clone())
            .or(extracted.plan_type)
            .or(existing.plan_type.clone());
        existing.auth_json = auth_json;
        existing.updated_at = now;
        existing.usage = usage;
        existing.usage_error = None;
        existing.to_summary(current_auth_account_id().as_deref())
    } else {
        let stored = StoredAccount {
            id: uuid::Uuid::new_v4().to_string(),
            label: new_label,
            email: extracted.email,
            account_id: extracted.account_id,
            plan_type: usage
                .as_ref()
                .and_then(|snapshot| snapshot.plan_type.clone())
                .or(extracted.plan_type),
            auth_json,
            added_at: now,
            updated_at: now,
            usage,
            usage_error: None,
        };
        let summary = stored.to_summary(current_auth_account_id().as_deref());
        store.accounts.push(stored);
        summary
    };

    save_store(app, &store)?;
    Ok(summary)
}

pub(crate) async fn delete_account_internal(
    app: &AppHandle,
    state: &AppState,
    id: &str,
) -> Result<(), String> {
    let mut _guard = state.store_lock.lock().await;
    let mut store = load_store(app)?;
    let original_len = store.accounts.len();
    store.accounts.retain(|account| account.id != id);

    if original_len == store.accounts.len() {
        return Err("未找到要删除的账号".to_string());
    }

    save_store(app, &store)?;
    Ok(())
}

/// 拉取并刷新所有账号用量，返回可直接用于前端/状态栏显示的摘要。
///
/// 这里分两次加锁（读取一次、写回一次）以避免长时间占用锁，
/// 网络请求阶段不阻塞其他读写命令。
pub(crate) async fn refresh_all_usage_internal(
    app: &AppHandle,
    state: &AppState,
) -> Result<Vec<AccountSummary>, String> {
    let mut store = {
        let _guard = state.store_lock.lock().await;
        load_store(app)?
    };

    for account in &mut store.accounts {
        let fetch_result = match extract_auth(&account.auth_json) {
            Ok(auth) => fetch_usage_snapshot(&auth.access_token, &auth.account_id).await,
            Err(err) => Err(err),
        };

        match fetch_result {
            Ok(snapshot) => {
                account.plan_type = snapshot.plan_type.clone().or(account.plan_type.clone());
                account.updated_at = now_unix_seconds();
                account.usage = Some(snapshot);
                account.usage_error = None;
            }
            Err(err) => {
                account.updated_at = now_unix_seconds();
                account.usage_error = Some(err);
            }
        }
    }

    {
        let _guard = state.store_lock.lock().await;
        save_store(app, &store)?;
    }

    let current_account_id = current_auth_account_id();
    Ok(store
        .accounts
        .iter()
        .map(|account| account.to_summary(current_account_id.as_deref()))
        .collect())
}

mod account_service;
mod auth;
mod cli;
mod models;
mod settings_service;
mod state;
mod store;
mod tray;
mod usage;
mod utils;

use std::process::Command;
use std::process::Stdio;

use tauri::AppHandle;
use tauri::State;

use models::AccountSummary;
use models::AppSettings;
use models::AppSettingsPatch;
use models::CurrentAuthStatus;
use models::SwitchAccountResult;
use state::AppState;

// ===== Tauri Commands (thin wrappers) =====
// 命令函数仅负责参数编排与跨模块调用，
// 核心业务逻辑放在 account_service/auth/store/tray 等模块。

#[tauri::command]
async fn list_accounts(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<Vec<AccountSummary>, String> {
    account_service::list_accounts_internal(&app, state.inner()).await
}

#[tauri::command]
async fn import_current_auth_account(
    app: AppHandle,
    state: State<'_, AppState>,
    label: Option<String>,
) -> Result<AccountSummary, String> {
    let summary =
        account_service::import_current_auth_account_internal(&app, state.inner(), label).await?;
    let _ = tray::refresh_macos_tray_snapshot(&app);
    Ok(summary)
}

#[tauri::command]
async fn delete_account(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    account_service::delete_account_internal(&app, state.inner(), &id).await?;
    let _ = tray::refresh_macos_tray_snapshot(&app);
    Ok(())
}

#[tauri::command]
async fn refresh_all_usage(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<Vec<AccountSummary>, String> {
    let summaries = account_service::refresh_all_usage_internal(&app, state.inner()).await?;
    let _ = tray::update_macos_tray_snapshot(&app, &summaries);
    Ok(summaries)
}

#[tauri::command]
async fn get_app_settings(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppSettings, String> {
    settings_service::get_app_settings_internal(&app, state.inner()).await
}

#[tauri::command]
async fn update_app_settings(
    app: AppHandle,
    state: State<'_, AppState>,
    patch: AppSettingsPatch,
) -> Result<AppSettings, String> {
    let settings =
        settings_service::update_app_settings_internal(&app, state.inner(), patch).await?;
    let _ = tray::refresh_macos_tray_snapshot(&app);
    Ok(settings)
}

#[tauri::command]
fn detect_codex_app() -> Result<Option<String>, String> {
    Ok(cli::find_codex_app_path().map(|path| path.to_string_lossy().to_string()))
}

#[tauri::command]
fn get_current_auth_status() -> Result<CurrentAuthStatus, String> {
    auth::read_current_auth_status()
}

#[tauri::command]
async fn launch_codex_login(state: State<'_, AppState>) -> Result<(), String> {
    // 添加账号流程前先备份当前 auth.json，确保授权结束后可回滚。
    let current_auth = auth::read_current_codex_auth_optional()?;
    {
        let mut backup = state.add_flow_auth_backup.lock().await;
        *backup = Some(current_auth);
    }

    let mut cmd = cli::new_codex_command()?;
    cmd.arg("login")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("无法启动 codex login: {e}"))?;
    Ok(())
}

#[tauri::command]
async fn restore_auth_after_add_flow(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let backup = {
        let mut guard = state.add_flow_auth_backup.lock().await;
        guard.take()
    };

    match backup {
        None => Ok(false),
        Some(Some(auth_json)) => {
            auth::write_active_codex_auth(&auth_json)?;
            let _ = tray::refresh_macos_tray_snapshot(&app);
            Ok(true)
        }
        Some(None) => {
            auth::remove_active_codex_auth()?;
            let _ = tray::refresh_macos_tray_snapshot(&app);
            Ok(true)
        }
    }
}

#[tauri::command]
async fn switch_account_and_launch(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
    workspace_path: Option<String>,
) -> Result<SwitchAccountResult, String> {
    let store = {
        let _guard = state.store_lock.lock().await;
        store::load_store(&app)?
    };

    let account = store
        .accounts
        .iter()
        .find(|account| account.id == id)
        .cloned()
        .ok_or_else(|| "找不到要切换的账号".to_string())?;

    auth::write_active_codex_auth(&account.auth_json)?;
    let _ = tray::refresh_macos_tray_snapshot(&app);

    if let Some(path) = cli::find_codex_app_path() {
        let _ = Command::new("pkill").args(["-x", "Codex"]).status();
        let mut cmd = Command::new("open");
        cmd.arg("-na").arg(&path);
        if let Some(workspace) = workspace_path.as_deref() {
            cmd.arg(workspace);
        }
        let status = cmd
            .status()
            .map_err(|e| format!("启动 Codex.app 失败: {e}"))?;
        if !status.success() {
            return Err("Codex.app 启动失败".to_string());
        }

        return Ok(SwitchAccountResult {
            account_id: account.account_id,
            launched_app_path: Some(path.to_string_lossy().to_string()),
            used_fallback_cli: false,
        });
    }

    let mut cmd = cli::new_codex_command()?;
    cmd.arg("app");
    if let Some(workspace) = workspace_path.as_deref() {
        cmd.arg(workspace);
    }
    cmd.spawn()
        .map_err(|e| format!("未检测到 Codex.app，且通过 codex app 启动失败: {e}"))?;

    Ok(SwitchAccountResult {
        account_id: account.account_id,
        launched_app_path: None,
        used_fallback_cli: true,
    })
}

// ===== App Bootstrap =====

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .on_menu_event(tray::handle_status_bar_menu_event)
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            if let Err(err) = settings_service::sync_autostart_from_store(app.handle()) {
                log::warn!("启动时同步开机启动状态失败: {err}");
            }
            // 启动阶段先同步当前本机登录账号，再初始化状态栏，保证首次展示即一致。
            store::sync_current_auth_account_on_startup(app.handle())?;
            tray::setup_macos_status_bar(app.handle())?;
            Ok(())
        })
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            list_accounts,
            import_current_auth_account,
            delete_account,
            refresh_all_usage,
            get_app_settings,
            update_app_settings,
            detect_codex_app,
            get_current_auth_status,
            launch_codex_login,
            restore_auth_after_add_flow,
            switch_account_and_launch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

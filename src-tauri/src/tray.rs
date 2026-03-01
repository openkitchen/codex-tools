use std::time::Duration;

use tauri::AppHandle;
use tauri::Manager;

use crate::account_service::refresh_all_usage_internal;
use crate::auth::current_auth_account_id;
use crate::models::AccountSummary;
use crate::models::TrayUsageDisplayMode;
use crate::models::UsageWindow;
use crate::state::AppState;
use crate::store::load_store;

const REFRESH_INTERVAL_SECONDS: u64 = 30;

#[cfg(target_os = "macos")]
const TRAY_ID: &str = "codex_tools_status_bar";
#[cfg(target_os = "macos")]
const TRAY_MENU_REFRESH_ID: &str = "tray_refresh_usage";
#[cfg(target_os = "macos")]
const TRAY_MENU_OPEN_ID: &str = "tray_open_window";
#[cfg(target_os = "macos")]
const TRAY_MENU_QUIT_ID: &str = "tray_quit";
#[cfg(target_os = "macos")]
const STATUS_BAR_ICON: tauri::image::Image<'_> =
    tauri::include_image!("./icons/codex-tools-statusbar-terminal.png");

fn format_percent(value: Option<f64>) -> String {
    value
        .map(|percent| percent.clamp(0.0, 100.0).round() as i64)
        .map(|percent| format!("{percent}%"))
        .unwrap_or_else(|| "--".to_string())
}

fn remaining_percent(window: Option<&UsageWindow>) -> Option<f64> {
    window.map(|item| 100.0 - item.used_percent)
}

fn mode_percent(mode: TrayUsageDisplayMode, window: Option<&UsageWindow>) -> Option<f64> {
    match mode {
        TrayUsageDisplayMode::Used => window.map(|item| item.used_percent),
        TrayUsageDisplayMode::Remaining => remaining_percent(window),
    }
}

fn usage_mode_label(mode: TrayUsageDisplayMode) -> &'static str {
    match mode {
        TrayUsageDisplayMode::Used => "已用",
        TrayUsageDisplayMode::Remaining => "剩余",
    }
}

fn read_tray_usage_mode(app: &AppHandle) -> TrayUsageDisplayMode {
    load_store(app)
        .map(|store| store.settings.tray_usage_display_mode)
        .unwrap_or_default()
}

#[cfg(target_os = "macos")]
fn tray_account_usage_line(account: &AccountSummary, mode: TrayUsageDisplayMode) -> String {
    let five_hour = format_percent(mode_percent(
        mode,
        account
            .usage
            .as_ref()
            .and_then(|usage| usage.five_hour.as_ref()),
    ));
    let one_week = format_percent(mode_percent(
        mode,
        account
            .usage
            .as_ref()
            .and_then(|usage| usage.one_week.as_ref()),
    ));

    let current_prefix = if account.is_current { "[当前] " } else { "" };
    let mode_label = usage_mode_label(mode);
    format!(
        "{current_prefix}{} | 5h{mode_label} {five_hour} | 1week{mode_label} {one_week}",
        account.label
    )
}

#[cfg(target_os = "macos")]
fn build_macos_tray_title(accounts: &[AccountSummary], mode: TrayUsageDisplayMode) -> String {
    if let Some(current) = accounts.iter().find(|account| account.is_current) {
        let five_hour = format_percent(mode_percent(
            mode,
            current
                .usage
                .as_ref()
                .and_then(|usage| usage.five_hour.as_ref()),
        ));
        let one_week = format_percent(mode_percent(
            mode,
            current
                .usage
                .as_ref()
                .and_then(|usage| usage.one_week.as_ref()),
        ));
        return format!("5h {five_hour} / 1w {one_week}");
    }

    "5h -- / 1w --".to_string()
}

#[cfg(target_os = "macos")]
fn build_macos_tray_tooltip(accounts: &[AccountSummary], mode: TrayUsageDisplayMode) -> String {
    let mut lines = vec!["Codex Tools 用量".to_string()];
    lines.push(format!("显示模式: {}", usage_mode_label(mode)));

    if let Some(current) = accounts.iter().find(|account| account.is_current) {
        lines.push(format!("当前: {}", tray_account_usage_line(current, mode)));
    } else {
        lines.push("当前: 未检测到正在使用的账号".to_string());
    }

    if accounts.is_empty() {
        lines.push("暂无账号，请先在主窗口添加账号".to_string());
        return lines.join("\n");
    }

    lines.push(format!("全部账号（{}）:", accounts.len()));
    for account in accounts.iter().take(8) {
        lines.push(format!("• {}", tray_account_usage_line(account, mode)));
    }
    if accounts.len() > 8 {
        lines.push(format!("… 还有 {} 个账号", accounts.len() - 8));
    }

    lines.join("\n")
}

#[cfg(target_os = "macos")]
fn build_macos_tray_menu(
    app: &AppHandle,
    accounts: &[AccountSummary],
    mode: TrayUsageDisplayMode,
) -> Result<tauri::menu::Menu<tauri::Wry>, String> {
    use tauri::menu::Menu;
    use tauri::menu::MenuItem;
    use tauri::menu::PredefinedMenuItem;

    let menu = Menu::new(app).map_err(|e| format!("创建状态栏菜单失败: {e}"))?;

    let header_text = format!("Codex Tools 用量（{}）", usage_mode_label(mode));
    let header = MenuItem::with_id(app, "tray_header", header_text, false, None::<&str>)
        .map_err(|e| format!("创建状态栏菜单项失败: {e}"))?;
    menu.append(&header)
        .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;

    let current_line = if let Some(current) = accounts.iter().find(|account| account.is_current) {
        format!("当前账号: {}", tray_account_usage_line(current, mode))
    } else {
        "当前账号: 未检测到".to_string()
    };
    let current_item = MenuItem::with_id(
        app,
        "tray_current_summary",
        current_line,
        false,
        None::<&str>,
    )
    .map_err(|e| format!("创建状态栏菜单项失败: {e}"))?;
    menu.append(&current_item)
        .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;

    let separator =
        PredefinedMenuItem::separator(app).map_err(|e| format!("创建状态栏分隔符失败: {e}"))?;
    menu.append(&separator)
        .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;

    if accounts.is_empty() {
        let empty = MenuItem::with_id(
            app,
            "tray_accounts_empty",
            "暂无账号（请在主窗口添加）",
            false,
            None::<&str>,
        )
        .map_err(|e| format!("创建状态栏菜单项失败: {e}"))?;
        menu.append(&empty)
            .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;
    } else {
        for (index, account) in accounts.iter().enumerate() {
            let id = format!("tray_account_{index}");
            let line_item = MenuItem::with_id(
                app,
                id,
                tray_account_usage_line(account, mode),
                false,
                None::<&str>,
            )
            .map_err(|e| format!("创建状态栏菜单项失败: {e}"))?;
            menu.append(&line_item)
                .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;
        }
    }

    let separator =
        PredefinedMenuItem::separator(app).map_err(|e| format!("创建状态栏分隔符失败: {e}"))?;
    menu.append(&separator)
        .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;

    let refresh = MenuItem::with_id(
        app,
        TRAY_MENU_REFRESH_ID,
        "立即刷新用量",
        true,
        None::<&str>,
    )
    .map_err(|e| format!("创建状态栏菜单项失败: {e}"))?;
    let open = MenuItem::with_id(
        app,
        TRAY_MENU_OPEN_ID,
        "打开 Codex Tools",
        true,
        None::<&str>,
    )
    .map_err(|e| format!("创建状态栏菜单项失败: {e}"))?;
    let quit = MenuItem::with_id(app, TRAY_MENU_QUIT_ID, "退出", true, None::<&str>)
        .map_err(|e| format!("创建状态栏菜单项失败: {e}"))?;

    menu.append(&refresh)
        .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;
    menu.append(&open)
        .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;
    menu.append(&quit)
        .map_err(|e| format!("写入状态栏菜单失败: {e}"))?;

    Ok(menu)
}

#[cfg(target_os = "macos")]
pub(crate) fn update_macos_tray_snapshot(
    app: &AppHandle,
    accounts: &[AccountSummary],
) -> Result<(), String> {
    let mode = read_tray_usage_mode(app);
    let tray = app
        .tray_by_id(TRAY_ID)
        .ok_or_else(|| "状态栏尚未初始化".to_string())?;

    let menu = build_macos_tray_menu(app, accounts, mode)?;
    tray.set_menu(Some(menu))
        .map_err(|e| format!("更新状态栏菜单失败: {e}"))?;
    tray.set_title(Some(build_macos_tray_title(accounts, mode)))
        .map_err(|e| format!("更新状态栏标题失败: {e}"))?;
    tray.set_tooltip(Some(build_macos_tray_tooltip(accounts, mode)))
        .map_err(|e| format!("更新状态栏提示失败: {e}"))?;
    Ok(())
}

#[cfg(not(target_os = "macos"))]
pub(crate) fn update_macos_tray_snapshot(
    _app: &AppHandle,
    _accounts: &[AccountSummary],
) -> Result<(), String> {
    Ok(())
}

#[cfg(target_os = "macos")]
pub(crate) fn refresh_macos_tray_snapshot(app: &AppHandle) -> Result<(), String> {
    let store = load_store(app)?;
    let current_account_id = current_auth_account_id();
    let summaries: Vec<AccountSummary> = store
        .accounts
        .iter()
        .map(|account| account.to_summary(current_account_id.as_deref()))
        .collect();
    update_macos_tray_snapshot(app, &summaries)
}

#[cfg(not(target_os = "macos"))]
pub(crate) fn refresh_macos_tray_snapshot(_app: &AppHandle) -> Result<(), String> {
    Ok(())
}

#[cfg(target_os = "macos")]
fn start_macos_tray_refresh_loop(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            let state = app.state::<AppState>();
            if let Ok(summaries) = refresh_all_usage_internal(&app, state.inner()).await {
                let _ = update_macos_tray_snapshot(&app, &summaries);
            }
            tokio::time::sleep(Duration::from_secs(REFRESH_INTERVAL_SECONDS)).await;
        }
    });
}

#[cfg(target_os = "macos")]
pub(crate) fn setup_macos_status_bar(app: &AppHandle) -> Result<(), String> {
    use tauri::tray::TrayIconBuilder;

    let mode = read_tray_usage_mode(app);
    let store = load_store(app)?;
    let current_account_id = current_auth_account_id();
    let summaries: Vec<AccountSummary> = store
        .accounts
        .iter()
        .map(|account| account.to_summary(current_account_id.as_deref()))
        .collect();
    let menu = build_macos_tray_menu(app, &summaries, mode)?;

    TrayIconBuilder::with_id(TRAY_ID)
        .menu(&menu)
        .icon(STATUS_BAR_ICON)
        .icon_as_template(true)
        .title(build_macos_tray_title(&summaries, mode))
        .tooltip(build_macos_tray_tooltip(&summaries, mode))
        .show_menu_on_left_click(true)
        .build(app)
        .map_err(|e| format!("创建 macOS 状态栏失败: {e}"))?;

    start_macos_tray_refresh_loop(app.clone());
    Ok(())
}

#[cfg(not(target_os = "macos"))]
pub(crate) fn setup_macos_status_bar(_app: &AppHandle) -> Result<(), String> {
    Ok(())
}

pub(crate) fn handle_status_bar_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    #[cfg(target_os = "macos")]
    {
        let id = event.id().as_ref();
        if id == TRAY_MENU_QUIT_ID {
            app.exit(0);
            return;
        }

        if id == TRAY_MENU_OPEN_ID {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
            return;
        }

        if id == TRAY_MENU_REFRESH_ID {
            let app_handle = app.clone();
            tauri::async_runtime::spawn(async move {
                let state = app_handle.state::<AppState>();
                if let Ok(summaries) = refresh_all_usage_internal(&app_handle, state.inner()).await
                {
                    let _ = update_macos_tray_snapshot(&app_handle, &summaries);
                }
            });
        }
    }
}

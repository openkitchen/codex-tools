use serde_json::Value;
use tokio::sync::Mutex;

/// 全局运行态：
/// - `store_lock` 保证账号存储读写的串行化。
/// - `add_flow_auth_backup` 用于“添加账号”流程前后的 auth.json 回滚。
#[derive(Default)]
pub(crate) struct AppState {
    pub(crate) store_lock: Mutex<()>,
    pub(crate) add_flow_auth_backup: Mutex<Option<Option<Value>>>,
}

type AddAccountSectionProps = {
  startingAdd: boolean;
  addFlowActive: boolean;
  onStartAddAccount: () => void;
  onCancelAddFlow: () => void;
};

export function AddAccountSection({
  startingAdd,
  addFlowActive,
  onStartAddAccount,
  onCancelAddFlow,
}: AddAccountSectionProps) {
  return (
    <section className="importBox">
      <h2>添加账号</h2>
      <p>点击后会打开登录授权。授权完成后会自动导入并刷新，不需要手动再点导入。</p>
      <div className="importRow">
        <button
          className="primary"
          onClick={onStartAddAccount}
          disabled={startingAdd || addFlowActive}
        >
          {startingAdd ? "启动中..." : addFlowActive ? "等待授权中..." : "添加账号"}
        </button>
        {addFlowActive && (
          <button className="ghost" onClick={onCancelAddFlow}>
            取消监听
          </button>
        )}
      </div>
      {addFlowActive && <p className="hint">正在监听登录状态变化（最多 10 分钟）。</p>}
    </section>
  );
}

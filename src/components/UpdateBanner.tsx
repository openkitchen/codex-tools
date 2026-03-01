import type { PendingUpdateInfo } from "../types/app";

type UpdateBannerProps = {
  pendingUpdate: PendingUpdateInfo | null;
  updateProgress: string | null;
  installingUpdate: boolean;
  onInstallUpdate: () => void;
};

export function UpdateBanner({
  pendingUpdate,
  updateProgress,
  installingUpdate,
  onInstallUpdate,
}: UpdateBannerProps) {
  if (!pendingUpdate) {
    return null;
  }

  return (
    <section className="updateBanner">
      <div className="updateText">
        <strong>发现新版本 {pendingUpdate.version}</strong>
        <span>当前版本 {pendingUpdate.currentVersion}</span>
        {pendingUpdate.date && <span>发布时间 {pendingUpdate.date}</span>}
      </div>
      <div className="updateActions">
        <button className="primary" onClick={onInstallUpdate} disabled={installingUpdate}>
          {installingUpdate ? "更新中..." : "更新并重启"}
        </button>
      </div>
      {pendingUpdate.body && <p className="updateBody">{pendingUpdate.body}</p>}
      {updateProgress && <p className="updateProgress">{updateProgress}</p>}
    </section>
  );
}

import type { AccountSummary } from "../types/app";
import {
  formatPlan,
  formatResetAt,
  formatWindowLabel,
  percent,
  planTone,
  remainingPercent,
  toProgressWidth,
} from "../utils/usage";

type AccountCardProps = {
  account: AccountSummary;
  isSwitching: boolean;
  onSwitch: (account: AccountSummary) => void;
  onDelete: (account: AccountSummary) => void;
};

export function AccountCard({ account, isSwitching, onSwitch, onDelete }: AccountCardProps) {
  const usage = account.usage;
  const fiveHour = usage?.fiveHour ?? null;
  const oneWeek = usage?.oneWeek ?? null;
  const normalizedPlan = usage?.planType || account.planType;
  const planLabel = formatPlan(normalizedPlan);
  const tone = planTone(normalizedPlan);

  return (
    <article className={`accountCard tone-${tone} ${account.isCurrent ? "isCurrent" : ""}`}>
      <div className="stamps">
        <span className="stamp stampPlan">{planLabel}</span>
        {account.isCurrent && <span className="stamp stampCurrent">当前</span>}
      </div>
      <div className="cardHead">
        <div>
          <h3 className={account.isCurrent ? "nameCurrent" : ""}>{account.label}</h3>
          <p>{account.email || account.accountId}</p>
        </div>
      </div>

      <div className="usageRow">
        <div className="usageTitle">
          <span>{formatWindowLabel(fiveHour, "5h")}</span>
          <div className="usageStats">
            <strong>已用 {percent(fiveHour?.usedPercent)}</strong>
            <em>剩余 {percent(remainingPercent(fiveHour))}</em>
          </div>
        </div>
        <div className="barTrack">
          <div className="barFill hot" style={{ width: toProgressWidth(fiveHour?.usedPercent) }} />
        </div>
        <small>重置时间：{formatResetAt(fiveHour?.resetAt)}</small>
      </div>

      <div className="usageRow">
        <div className="usageTitle">
          <span>{formatWindowLabel(oneWeek, "1week")}</span>
          <div className="usageStats">
            <strong>已用 {percent(oneWeek?.usedPercent)}</strong>
            <em>剩余 {percent(remainingPercent(oneWeek))}</em>
          </div>
        </div>
        <div className="barTrack">
          <div className="barFill cool" style={{ width: toProgressWidth(oneWeek?.usedPercent) }} />
        </div>
        <small>重置时间：{formatResetAt(oneWeek?.resetAt)}</small>
      </div>

      {usage?.credits && (
        <p className="credits">
          Credits: {usage.credits.unlimited ? "Unlimited" : usage.credits.balance ?? "--"}
        </p>
      )}

      {account.usageError && <p className="errorText">{account.usageError}</p>}

      <div className="cardActions">
        <button className="primary" onClick={() => onSwitch(account)} disabled={isSwitching}>
          {isSwitching ? "切换中..." : "切换并启动"}
        </button>
        <button className="danger" onClick={() => onDelete(account)}>
          删除
        </button>
      </div>
    </article>
  );
}

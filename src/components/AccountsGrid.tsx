import type { AccountSummary } from "../types/app";
import { AccountCard } from "./AccountCard";

type AccountsGridProps = {
  accounts: AccountSummary[];
  loading: boolean;
  switchingId: string | null;
  onSwitch: (account: AccountSummary) => void;
  onDelete: (account: AccountSummary) => void;
};

export function AccountsGrid({
  accounts,
  loading,
  switchingId,
  onSwitch,
  onDelete,
}: AccountsGridProps) {
  return (
    <section className="cards" aria-busy={loading}>
      {accounts.length === 0 && !loading && (
        <div className="emptyState">
          <h3>还没有账号</h3>
          <p>点击“添加账号”，完成授权后会自动出现在列表中。</p>
        </div>
      )}

      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          isSwitching={switchingId === account.id}
          onSwitch={onSwitch}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}

type MetaStripProps = {
  accountCount: number;
  currentCount: number;
};

export function MetaStrip({ accountCount, currentCount }: MetaStripProps) {
  return (
    <section className="metaStrip">
      <div>
        <span>账号数</span>
        <strong>{accountCount}</strong>
      </div>
      <div>
        <span>当前活跃</span>
        <strong>{currentCount}</strong>
      </div>
    </section>
  );
}

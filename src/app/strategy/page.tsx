import StrategyBoard from "@/components/StrategyBoard";

export const metadata = { title: "Strategy — Deskwork" };

export default function StrategyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Module 02</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Strategy board — Dust 2</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Drop players, smokes, flashes and mollies. Click a piece to spawn it, drag to position, click again to select,
          then <kbd className="rounded border border-[var(--border-strong)] bg-[var(--bg-elev)] px-1 py-0.5 text-[10px]">Del</kbd> to remove. Save your favorite setups locally.
        </p>
      </header>
      <StrategyBoard />
    </div>
  );
}

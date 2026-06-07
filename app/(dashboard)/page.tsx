import BalanceSummaryCard from "@/components/BalanceSummaryCard";
import DonutChart from "@/components/DonutChart";
import DashboardCharts from "@/components/DashboardCharts";
import TransactionRow from "@/components/TransactionRow";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch consolidated liquidity from all active corporate bank accounts
  const { data: accounts } = await supabase
    .from("corporate_bank_accounts")
    .select("official_name, current_balance");

  const totalLiquidity = (accounts ?? []).reduce(
    (sum: number, acc: { current_balance: number }) => sum + (acc.current_balance ?? 0),
    0
  );

  const vaultCount = (accounts ?? []).length;

  const colors = ["#10b981", "#14b8a6", "#475569", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];
  
  const donutData = (accounts ?? []).map((acc: { official_name: string; current_balance: number }, index: number) => ({
    name: acc.official_name ?? `Vault ${index + 1}`,
    value: acc.current_balance ?? 0,
    color: colors[index % colors.length],
  }));

  // Fetch the 7 most recent outbound transfers for the timeline chart
  const { data: recentTransfers } = await supabase
    .from("corporate_transfers")
    .select("amount, created_at")
    .order("created_at", { ascending: true })
    .limit(7);

  const transferHistory = (recentTransfers ?? []).map(
    (tx: { amount: number; created_at: string }) => ({
      date: new Date(tx.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: tx.amount,
    })
  );

  // Fetch recent transactions for the ledger table (preserve existing UI)
  const { data: recentTxRows } = await supabase
    .from("corporate_transfers")
    .select("id, amount, reference_memo, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentTransactions = (recentTxRows ?? []).map(
    (tx: { id: string; amount: number; reference_memo: string; status: string; created_at: string }) => ({
      id: tx.id?.slice(0, 12).toUpperCase() ?? "—",
      description: tx.reference_memo ?? "Outbound Clearing",
      amount: -(tx.amount ?? 0),
      timestamp: tx.created_at,
      status: tx.status === "pending" ? "pending" : "settled",
    })
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
          Command Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-500">
          Real-time treasury position and operational metrics.
        </p>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BalanceSummaryCard totalCurrentBalance={totalLiquidity} vaultCount={vaultCount} />
        <DonutChart data={donutData} />
      </div>

      {/* Dynamic Charts Section */}
      <DashboardCharts
        totalLiquidity={totalLiquidity}
        transferHistory={transferHistory}
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Consolidated Liquidity", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalLiquidity), change: null, positive: false },
          { label: "Active Channels", value: String(vaultCount), change: null, positive: false },
          { label: "Recent Clearings", value: String(recentTransactions.length), change: null, positive: false },
          { label: "Settlement Timeline", value: `${transferHistory.length} pts`, change: null, positive: false },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-slate-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/30 p-3.5"
          >
            <span className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-zinc-500 uppercase block mb-1.5">
              {metric.label}
            </span>
            <div className="flex items-end gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono leading-none">
                {metric.value}
              </span>
              {metric.change && (
                <span
                  className={`text-[10px] font-mono font-medium flex items-center gap-0.5 ${metric.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                >
                  <TrendingUp size={10} />
                  {metric.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-semibold tracking-[0.15em] text-slate-500 dark:text-zinc-500 uppercase block mb-0.5">
              Transaction Ledger
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-200 font-sans">
              Recent Settlements
            </h3>
          </div>
          <Link href="/ledger" className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 uppercase tracking-wider transition-colors cursor-pointer">
            View All
            <ArrowUpRight size={11} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 dark:border-zinc-800/40">
                <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-600 uppercase">
                  ID
                </th>
                <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-600 uppercase">
                  Description
                </th>
                <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-600 uppercase text-right">
                  Amount
                </th>
                <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-600 uppercase hidden sm:table-cell">
                  Status
                </th>
                <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-600 uppercase text-right hidden md:table-cell">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx: any) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs font-mono text-slate-400 dark:text-zinc-600 uppercase tracking-wider">
                    No settlement records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

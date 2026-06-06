import BalanceSummaryCard from "@/components/BalanceSummaryCard";
import DonutChart from "@/components/DonutChart";
import { TrendingUp, ArrowUpRight, Clock } from "lucide-react";

/* ─── Dummy Transaction Data ─── */
const recentTransactions = [
  {
    id: "TXN-00482",
    description: "Meridian Cloud Services",
    amount: -12480.0,
    timestamp: "2026-06-06T13:42:00Z",
    status: "settled",
  },
  {
    id: "TXN-00481",
    description: "Quarterly Revenue Settlement",
    amount: 285000.0,
    timestamp: "2026-06-06T09:15:00Z",
    status: "settled",
  },
  {
    id: "TXN-00480",
    description: "AWS Infrastructure Charges",
    amount: -8745.32,
    timestamp: "2026-06-05T18:30:00Z",
    status: "settled",
  },
  {
    id: "TXN-00479",
    description: "External Audit Fee — Deloitte",
    amount: -34000.0,
    timestamp: "2026-06-05T11:00:00Z",
    status: "pending",
  },
  {
    id: "TXN-00478",
    description: "Series B Tranche Deposit",
    amount: 500000.0,
    timestamp: "2026-06-04T16:20:00Z",
    status: "settled",
  },
];

export default function DashboardPage() {
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
        <BalanceSummaryCard totalCurrentBalance={550501.25} vaultCount={3} />
        <DonutChart />
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Net Inflow (30D)", value: "$785,000", change: "+18.2%", positive: true },
          { label: "Net Outflow (30D)", value: "$234,225", change: "-4.1%", positive: true },
          { label: "Pending Settlements", value: "2", change: null, positive: false },
          { label: "Active Channels", value: "3", change: null, positive: false },
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
          <button className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 uppercase tracking-wider transition-colors cursor-pointer">
            View All
            <ArrowUpRight size={11} />
          </button>
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
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-slate-50 dark:border-zinc-800/20 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-5 py-3 text-xs font-mono text-slate-500 dark:text-zinc-400">
                    {tx.id}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700 dark:text-zinc-300">
                    {tx.description}
                  </td>
                  <td
                    className={`px-5 py-3 text-sm font-mono font-medium text-right ${tx.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-zinc-300"
                      }`}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(Math.abs(tx.amount))}
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${tx.status === "settled"
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                          : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                        }`}
                    >
                      {tx.status === "pending" && <Clock size={9} />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500 dark:text-zinc-500 text-right hidden md:table-cell">
                    {new Date(tx.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {new Date(tx.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

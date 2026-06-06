"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, DollarSign } from "lucide-react";

interface TransferDataPoint {
  date: string;
  amount: number;
}

interface DashboardChartsProps {
  totalLiquidity: number;
  transferHistory: TransferDataPoint[];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-zinc-500 uppercase mb-1">
        {label}
      </p>
      <p className="text-base font-semibold text-slate-900 dark:text-zinc-100 font-mono">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(payload[0].value)}
      </p>
    </div>
  );
}

export default function DashboardCharts({
  totalLiquidity,
  transferHistory,
}: DashboardChartsProps) {
  const formattedLiquidity = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalLiquidity);

  const hasData = transferHistory.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Liquidity Summary Stat Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm p-6 flex flex-col justify-between">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign size={16} />
          </div>
          <span className="text-[10px] font-mono font-semibold tracking-[0.15em] text-slate-500 dark:text-zinc-500 uppercase">
            Consolidated Capital
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            {formattedLiquidity}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
            Sum of all active clearing nodes
          </p>
        </div>
        {/* Mini sparkline indicator bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(10, (totalLiquidity / 1000000) * 100))}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-600 uppercase">Live</span>
        </div>
      </div>

      {/* Area Chart — Outbound Clearings History */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] font-mono font-semibold tracking-[0.15em] text-slate-500 dark:text-zinc-500 uppercase block mb-1">
              Settlement Timeline
            </span>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 font-sans">
              Outbound Clearings History
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            <Activity size={12} className="text-emerald-500" />
            Last 7 Settlements
          </div>
        </div>

        {hasData ? (
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={transferHistory}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="clearingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-zinc-800/50"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-400 dark:text-zinc-600"
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-400 dark:text-zinc-600"
                  tickFormatter={(value: number) =>
                    `$${(value / 1000).toFixed(0)}k`
                  }
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} cursor={false} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#clearingsGradient)"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-[220px] flex items-center justify-center">
            <p className="text-xs font-mono text-slate-400 dark:text-zinc-600 uppercase tracking-wider">
              No settlement records available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

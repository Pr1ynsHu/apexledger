"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface VaultBalance {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  totalBalance,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; color: string } }>;
  totalBalance: number;
}) {
  if (!active || !payload?.length) return null;
  const itemData = payload[0].payload;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-zinc-500 uppercase mb-1">
        {itemData.name}
      </p>
      <p className="text-base font-semibold text-slate-900 dark:text-zinc-100 font-mono">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(itemData.value)}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">
        {((itemData.value / totalBalance) * 100).toFixed(1)}% of total
      </p>
    </div>
  );
}

export default function DonutChart({ data }: { data?: VaultBalance[] }) {
  const vaultBalances = data?.length ? data : [
    { name: "No Vaults Connected", value: 1, color: "#94a3b8" }
  ];
  
  const totalBalance = data?.length 
    ? vaultBalances.reduce((sum, v) => sum + v.value, 0)
    : 0;

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono font-semibold tracking-[0.15em] text-slate-500 dark:text-zinc-500 uppercase block mb-1">
            Vault Distribution
          </span>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 font-sans">
            Clearing Node Balances
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase block">
            Aggregate
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalBalance)}
          </span>
        </div>
      </div>

      <div className="relative w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={vaultBalances}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {vaultBalances.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip totalBalance={totalBalance} />}
              cursor={false}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-600 uppercase tracking-widest">
            Nodes
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100 font-mono leading-none">
            {vaultBalances.length}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {vaultBalances.map((vault) => (
          <div key={vault.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: vault.color }}
              />
              <span className="text-xs text-slate-600 dark:text-zinc-400">{vault.name}</span>
            </div>
            <span className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(vault.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

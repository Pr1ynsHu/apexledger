"use client";

import { Wallet, TrendingUp } from "lucide-react";

interface BalanceProps {
    totalCurrentBalance: number;
    vaultCount: number;
}

export default function BalanceSummaryCard({ totalCurrentBalance, vaultCount }: BalanceProps) {
    const formattedBalance = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(totalCurrentBalance);

    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Wallet size={16} />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-zinc-400 uppercase">
                        Total Aggregated Liquidity
                    </span>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={12} />
                    +12.4%
                </span>
            </div>

            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                    {formattedBalance}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-zinc-500">
                    <span>Active Channels: <strong className="text-slate-700 dark:text-zinc-300 font-medium">{vaultCount}</strong></span>
                    <span>•</span>
                    <span>Real-time Sync Active</span>
                </div>
            </div>
        </div>
    );
}
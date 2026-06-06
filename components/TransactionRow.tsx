"use client";

import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";

export default function TransactionRow({ tx }: { tx: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className="border-b border-slate-50 dark:border-zinc-800/20 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors cursor-pointer group"
      >
        <td className="px-5 py-3 text-xs font-mono text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <ChevronDown size={14} className={`transition-transform text-slate-400 ${isExpanded ? "rotate-180" : ""}`} />
            {tx.id}
          </div>
        </td>
        <td className="px-5 py-3 text-sm text-slate-700 dark:text-zinc-300">
          {tx.description}
        </td>
        <td
          className={`px-5 py-3 text-sm font-mono font-medium text-right ${
            tx.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-zinc-300"
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
            className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
              tx.status === "settled"
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
      {isExpanded && (
        <tr className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-50 dark:border-zinc-800/20">
          <td colSpan={5} className="px-5 py-4">
            <div className="flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 animate-fade-in shadow-sm">
              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Transaction ID</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-zinc-300">{tx.id}-8992B-X</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Authorization Hash</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-zinc-300 break-all">0x7F2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Processing Node</span>
                  <span className="text-xs text-slate-700 dark:text-zinc-300">Apex ClearNet / US-East</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Memo</span>
                  <span className="text-xs text-slate-700 dark:text-zinc-300">{tx.description} - Verified by Automated Escrow</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

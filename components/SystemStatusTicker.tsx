"use client";

import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckCircle2, Clock } from "lucide-react";

export default function SystemStatusTicker() {
  const [latency, setLatency] = useState(12);

  // Fake random latency changes for "ticker" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 15) + 8);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button suppressHydrationWarning className="flex items-center gap-2 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/50 p-1.5 -ml-1.5 rounded-md transition-colors w-full group">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 z-10" />
            <div className="absolute w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping opacity-75" />
          </div>
          <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono group-hover:text-slate-900 dark:group-hover:text-zinc-200 transition-colors">
            All pipelines operational
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl ml-4">
        <DropdownMenuLabel className="text-xs font-mono tracking-wider uppercase text-slate-500">
          Diagnostics Report
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Core Banking API</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">99.99%</span>
          </div>
          
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Stripe Webhooks</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
              <Clock size={14} className="text-sky-500" />
              <span>Network Latency</span>
            </div>
            <span className="text-slate-900 dark:text-zinc-100 font-semibold">{latency}ms</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/60 p-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            <span>Last Checked</span>
            <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
